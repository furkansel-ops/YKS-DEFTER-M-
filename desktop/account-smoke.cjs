'use strict';

// Development/CI only (the installer allowlists its runtime files). This uses
// real Chromium storage and the bundled Firebase SDK with all network blocked.
// No production authentication override, real account, or live write is used.
const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { once } = require('node:events');
const { spawn } = require('node:child_process');

const args = process.argv.slice(2);
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const phase = option('--phase');
const PROFILE_PREFIX = 'yks-account-smoke-';
const EXISTING_NAME = 'Korunacak mevcut hesap kaydı';
const GUEST_NAME = 'Sadece bu geçici oturum';
const watchdog = setTimeout(() => {
  console.error('Account smoke test timed out.');
  app.exit(1);
}, phase ? 100_000 : 330_000);
let stage = 'start';

function assertTemporaryProfile(profile) {
  assert.equal(path.dirname(path.resolve(profile)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(profile).startsWith(PROFILE_PREFIX));
}

async function waitForAccount(window) {
  return window.webContents.executeJavaScript(`(async () => {
    const deadline = Date.now() + 20000;
    while (!window.__YKS_SESSION__ || !document.getElementById('accountGate') ||
      !window.__YKS_DATA__ || typeof window.go !== 'function' ||
      !window.__YKS_AUTH__ || window.__YKS_AUTH__.getState().phase === 'loading' ||
      document.documentElement.dataset.webCloudRuntime !== 'ready') {
      if (Date.now() > deadline) throw new Error('Account UI and transient storage did not start');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    const mode = window.__YKS_SESSION__.getState().mode;
    // Locked startup must not hydrate a signed-out user's persistent study
    // data. Its readiness promise intentionally stays pending until a session
    // is explicitly opened; only an actual guest/account may await it.
    if (mode !== 'locked') await Promise.race([window.__YKS_DATA__.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Session data initialization did not settle')), 10000))]);
    return { mode,
      gateHidden: document.getElementById('accountGate').hidden };
  })()`);
}

async function reload(window) {
  const loaded = new Promise((resolve, reject) => {
    window.webContents.once('did-finish-load', resolve);
    window.webContents.once('did-fail-load', (_event, code, description) => reject(new Error(`${code}: ${description}`)));
  });
  window.reload();
  await loaded;
  return waitForAccount(window);
}

async function clickAndWaitForReload(window, selector, confirm = false) {
  const loaded = new Promise(resolve => window.webContents.once('did-finish-load', resolve));
  // Reload may dispose the old JavaScript context before executeJavaScript
  // resolves; did-finish-load plus the new session state is the actual result.
  await window.webContents.executeJavaScript(`(() => {
    const button = document.querySelector(${JSON.stringify(selector)});
    if (!button || button.disabled) throw new Error('Action unavailable: '+${JSON.stringify(selector)});
    const previousConfirm = window.confirm;
    try {
      // Only acknowledge the explicit discard-work UI confirmation. This is
      // not an auth override, and no credential or account state is injected.
      if (${JSON.stringify(confirm)}) window.confirm = () => true;
      button.click(); return true;
    } finally { window.confirm = previousConfirm; }
  })()`).catch(error => {
    if (!/destroyed|disposed|context|frame/i.test(error.message)) throw error;
  });
  await Promise.race([loaded, new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Action did not reload: ${selector}`)), 15000))]);
  return waitForAccount(window);
}

// A plain, same-origin privacy document has no study runtime. Its isolated
// renderer reads real persistent storage instead of the guest storage adapter.
async function withStorageProbe(securePreferences, callback) {
  const probe = new BrowserWindow({ show: false, webPreferences: securePreferences('document-preload.cjs') });
  try {
    await probe.loadURL('app://yks/privacy.html');
    return await callback(probe);
  } finally { probe.destroy(); }
}

const readPersistedScript = `(async () => {
  const local = Object.fromEntries(Object.keys(localStorage).filter(key =>
    /^(yks(?:_|$)|__yks|_yks)/i.test(key)).sort().map(key => [key, localStorage.getItem(key)]));
  const databases = await indexedDB.databases();
  if (!databases.some(database => database.name === 'yks-defterim-v4')) return { local, indexed: null };
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open('yks-defterim-v4');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    const indexed = {};
    for (const name of [...database.objectStoreNames].sort()) {
      indexed[name] = await new Promise((resolve, reject) => {
        const request = database.transaction(name, 'readonly').objectStore(name).getAll();
        request.onsuccess = () => resolve(request.result.sort((a,b) => String(a.key).localeCompare(String(b.key))));
        request.onerror = () => reject(request.error);
      });
    }
    return { local, indexed };
  } finally { database.close(); }
})()`;

async function persisted(securePreferences) {
  return withStorageProbe(securePreferences, probe => probe.webContents.executeJavaScript(readPersistedScript));
}

// UI-only fixtures import the actual built account component in a blank privacy
// document. They never replace auth in the application or call a real account.
async function verifyGateRecovery(securePreferences) {
  const assets=await fs.readdir(path.resolve(__dirname,'../dist/assets'));
  const chunk=assets.find(name=>/^account-gate-.*\.js$/.test(name));
  assert.ok(chunk,'Built account component is missing');
  for(const scenario of ['failed-data','valid-fallback','auth-error','later-timeout']){
    const result=await withStorageProbe(securePreferences,probe=>probe.webContents.executeJavaScript(`(async()=>{
      const scenario=${JSON.stringify(scenario)};
      let state={phase:scenario==='auth-error'?'error':scenario==='later-timeout'?'signedout':'signedin',email:'ui-fixture@example.test',busy:false,message:'UI fixture',error:scenario==='auth-error',googleAvailable:false};
      let exits=0;
      window.__YKS_SESSION__={getState:()=>({mode:'account'})};
      window.__YKS_AUTH__={getState:()=>state,signOut:async()=>{exits++;}};
      window.__YKS_DATA__={ready:scenario==='later-timeout'?new Promise(()=>{}):Promise.resolve({ok:scenario!=='failed-data',degraded:true,primary:scenario==='failed-data'?'none':'localStorage'})};
      const deadlines=[],nativeTimer=window.setTimeout.bind(window);
      window.setTimeout=(callback,delay,...args)=>delay===12000?(deadlines.push(callback),999):nativeTimer(callback,delay,...args);
      const component=await import('app://yks/assets/${chunk}');
      Object.values(component).find(value=>typeof value==='function')();
      await Promise.resolve();await Promise.resolve();
      if(scenario==='auth-error')document.getElementById('accountRetrySignOut').click();
      if(scenario==='later-timeout'){
        state={...state,phase:'loading'};window.dispatchEvent(new CustomEvent('yks:auth-state'));
        if(deadlines.length!==1)throw new Error('Later pending state did not start a recovery timer');
        deadlines[0]();
        window.dispatchEvent(new CustomEvent('yks:auth-state'));
      }
      return {gateHidden:document.getElementById('accountGate').hidden,
        retryHidden:document.getElementById('accountRetry').hidden,
        exitDisabled:document.getElementById('accountRetrySignOut').disabled,
        message:document.getElementById('accountMessage').textContent,exits,deadlines:deadlines.length};
    })()`));
    if(scenario==='valid-fallback')assert.equal(result.gateHidden,true,JSON.stringify(result));
    else{
      assert.equal(result.gateHidden,false,JSON.stringify({scenario,...result}));
      assert.equal(result.retryHidden,false,JSON.stringify({scenario,...result}));
      if(scenario==='auth-error'){assert.equal(result.exitDisabled,false);assert.equal(result.exits,1);}
      if(scenario==='failed-data')assert.match(result.message,/Kayıt alanı açılamadı/);
      if(scenario==='later-timeout')assert.equal(result.deadlines,1,'Busy-only events must not reset a completed deadline');
    }
  }
  console.log(JSON.stringify({accountGateFixtures:4,failedDataKeepsGateClosed:true,validFallbackOpens:true,errorSignOutUsable:true,laterPendingTimeoutUsable:true}));
}

async function seedExisting(securePreferences, blankJSON) {
  const data = JSON.parse(blankJSON);
  data.name = EXISTING_NAME;
  data.wizardDone = true;
  data.solved = { '2026-09-09': 37 };
  const json = JSON.stringify(data);
  return withStorageProbe(securePreferences, async probe => {
    await probe.webContents.executeJavaScript(`(async () => {
      const json = ${JSON.stringify(json)};
      localStorage.setItem('yks', json);
      localStorage.setItem('yks_last_good', json);
      localStorage.setItem('yks_account_smoke_sentinel', 'must-survive-guest');
      const database = await new Promise((resolve, reject) => {
        const request = indexedDB.open('yks-defterim-v4', 10);
        request.onupgradeneeded = () => {
          for (const name of ['state', 'meta']) {
            const store = request.result.createObjectStore(name, { keyPath: 'key' });
            for (const key of ['schema', 'updatedAt', 'sourceHash']) store.createIndex(key, key);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        await new Promise((resolve, reject) => {
          const transaction = database.transaction(['state', 'meta'], 'readwrite');
          transaction.objectStore('state').put({ key: 'primary', json, schema: 21,
            chars: json.length, bytes: new TextEncoder().encode(json).length,
            source: 'localStorage', sourceHash: 'untouched-smoke-sentinel', updatedAt: 1700000000000 });
          transaction.objectStore('meta').put({ key: 'account-smoke-sentinel', value: 'must-survive-guest' });
          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error || new Error('Seed transaction aborted'));
        });
      } finally { database.close(); }
      return true;
    })()`);
    return probe.webContents.executeJavaScript(readPersistedScript);
  });
}

async function screenshots(window) {
  const requested = option('--screenshots');
  if (!requested) return;
  const directory = path.resolve(requested);
  const project = path.resolve(__dirname, '..');
  const relative = path.relative(project, directory);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'Screenshots must be in a project subdirectory');
  await fs.mkdir(directory, { recursive: true });
  async function capture(name, width, height) {
    window.setMinimumSize(320, 480);
    window.setContentSize(width, height);
    await window.webContents.executeJavaScript(`(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise(resolve => setTimeout(resolve,180));
      return true;
    })()`);
    // Hidden Chromium windows may return their preceding compositor frame on
    // the first capture after a resize/theme change. Warm that frame, then take
    // the settled shot; DOM layout assertions below remain the source of truth.
    await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true});
    await window.webContents.executeJavaScript('new Promise(resolve=>setTimeout(resolve,180))');
    const screenshot = await window.webContents.capturePage(undefined,{stayHidden:true,stayAwake:true});
    await fs.writeFile(path.join(directory, `${name}.png`), screenshot.toPNG());
    const layout = await window.webContents.executeJavaScript(`(async () => {
      const gate = document.getElementById('accountGate');
      const horizontalOverflow = gate.scrollWidth > gate.clientWidth + 1;
      gate.scrollTop = gate.scrollHeight;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const guest = document.getElementById('accountGuest').getBoundingClientRect();
      const footer = gate.querySelector('.account-footer').getBoundingClientRect();
      const reachable = guest.top >= 0 && guest.bottom <= innerHeight + 1 && footer.bottom <= innerHeight + 1;
      gate.scrollTop = 0;
      const active=document.querySelector('.account-tabs [aria-pressed="true"]')?.dataset.authView || null;
      const visibleView=['login','register','reset'].find(view=>!document.getElementById('account'+view[0].toUpperCase()+view.slice(1)+'Form').hidden);
      return {horizontalOverflow, reachable, mobile:matchMedia('(max-width:760px)').matches, width:innerWidth, active, visibleView,
        title:document.getElementById('accountTitle').textContent,titleColor:getComputedStyle(document.getElementById('accountTitle')).color,gateColor:getComputedStyle(gate).color};
    })()`);
    assert.equal(layout.horizontalOverflow, false, `${name} overflows horizontally`);
    assert.equal(layout.reachable, true, `${name} cannot scroll to its guest option and privacy links`);
    assert.equal(layout.mobile,width<=760,JSON.stringify(layout));
    assert.equal(layout.active,layout.visibleView==='reset'?null:layout.visibleView,JSON.stringify(layout));
    assert.equal(layout.titleColor,layout.gateColor,JSON.stringify(layout));
    console.log(JSON.stringify({screenshot:name,...layout}));
  }
  await capture('account-login-desktop', 1280, 900);
  await capture('account-login-mobile', 360, 800);
  await window.webContents.executeJavaScript("document.querySelector('[data-auth-view=register]').click();true");
  await capture('account-register-mobile', 360, 800);
  await window.webContents.executeJavaScript("document.querySelector('[data-auth-view=reset]').click();true");
  await capture('account-reset-mobile', 360, 800);
  await window.webContents.executeJavaScript("document.querySelector('[data-auth-view=login]').click();true");
  await window.webContents.executeJavaScript("document.documentElement.dataset.theme='paper';true");
  await capture('account-login-mobile-light',360,800);
  window.setContentSize(1280, 900);
}

async function verifyForms(window) {
  const controls = await window.webContents.executeJavaScript(`(() => {
    const gate = document.getElementById('accountGate');
    const forms = ['accountLoginForm','accountRegisterForm','accountResetForm'].map(id => {
      const form = document.getElementById(id);
      return { id, exists: form instanceof HTMLFormElement };
    });
    const inputs = ['loginEmail','loginPassword','registerEmail','registerPassword','registerConfirm','resetEmail']
      .map(id => {const input = document.getElementById(id); return {id, type: input?.type,
        required: input?.required, label: [...(input?.labels || [])].some(label => label.textContent.trim())};});
    return { hidden: gate.hidden, role: gate.getAttribute('role'), modal: gate.getAttribute('aria-modal'),
      guest: document.getElementById('accountGuest')?.textContent, forms, inputs };
  })()`);
  assert.equal(controls.hidden, false);
  assert.equal(controls.role, 'dialog');
  assert.equal(controls.modal, 'true');
  assert.match(controls.guest, /Kaydetmeden dene/i);
  assert.ok(controls.forms.every(form => form.exists), JSON.stringify(controls.forms));
  for (const input of controls.inputs) {
    assert.equal(input.type, /Email$/.test(input.id) ? 'email' : 'password', input.id);
    assert.equal(input.required, true, input.id);
    assert.equal(input.label, true, `${input.id} needs a visible associated label`);
  }
  for (const [view, form] of [['register','accountRegisterForm'],['reset','accountResetForm'],['login','accountLoginForm']]) {
    assert.equal(await window.webContents.executeJavaScript(`(() => {
      document.querySelector(${JSON.stringify(`[data-auth-view=${view}]`)}).click();
      const form = document.getElementById(${JSON.stringify(form)});
      return !form.hidden && getComputedStyle(form).display !== 'none';
    })()`), true, `${view} view did not open`);
  }
  const passwordBehavior = await window.webContents.executeJavaScript(`(() => {
    const input = document.getElementById('loginPassword');
    input.value = 'Temporary UI-only sample';
    const toggle = document.querySelector('[data-password-toggle=loginPassword]');
    toggle.click();
    const visible = input.type === 'text' && toggle.getAttribute('aria-pressed') === 'true';
    document.querySelector('[data-auth-view=register]').click();
    const cleared = input.value === '' && input.type === 'password';
    document.querySelector('[data-auth-view=login]').click();
    return {visible, cleared};
  })()`);
  assert.equal(passwordBehavior.visible, true, 'Password visibility toggle did not work');
  assert.equal(passwordBehavior.cleared, true, 'Switching account forms must clear the previous password');
}

async function verifyNativeBoundary(window) {
  const initial = await window.webContents.executeJavaScript(`(async () => ({
    url: location.href, secure: isSecureContext, desktop: window.__YKS_DESKTOP__,
    node: typeof require, indexedDB: typeof indexedDB.open,
    embedded: document.getElementById('cloudSyncBox')?.dataset.embeddedApp,
    googleHidden: document.getElementById('cloudLoginBtn')?.hidden,
    cloud: document.documentElement.dataset.webCloudRuntime,
    serviceWorkers: navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations()
      .then(registrations => registrations.length).catch(error => error.name) : 0,
  }))()`);
  assert.equal(initial.url, 'app://yks/index.html');
  assert.equal(initial.secure, true);
  assert.equal(initial.node, 'undefined');
  assert.equal(initial.indexedDB, 'function');
  assert.equal(initial.desktop.installed, true);
  assert.equal(initial.desktop.platform, 'win32');
  assert.equal(initial.embedded, 'true');
  assert.equal(initial.googleHidden, true);
  assert.equal(initial.cloud, 'ready');
  assert.ok([0, 'SecurityError', 'InvalidStateError'].includes(initial.serviceWorkers), JSON.stringify(initial));
  const preferences = window.webContents.getLastWebPreferences();
  assert.equal(preferences.sandbox, true);
  assert.equal(preferences.contextIsolation, true);
  assert.equal(preferences.nodeIntegration, false);
}

async function verifyReportAndNavigationBoundary(window) {
  const opened = once(window.webContents, 'did-create-window');
  await window.webContents.executeJavaScript(`(() => {
    const report = window.open('', '_blank');
    if (!report) throw new Error('Report popup blocked');
    report.document.write('<!doctype html><title>Smoke report</title><p id="report">Generic sandbox report content</p>');
    report.document.close(); return true;
  })()`);
  const [report] = await opened;
  assert.equal(report.isVisible(), false);
  const reportState = await report.webContents.executeJavaScript("({node:typeof require,content:document.getElementById('report')?.textContent})");
  assert.equal(reportState.node, 'undefined');
  assert.equal(reportState.content, 'Generic sandbox report content');
  const preferences = report.webContents.getLastWebPreferences();
  assert.equal(preferences.sandbox, true);
  assert.equal(preferences.contextIsolation, true);
  assert.equal(preferences.nodeIntegration, false);
  const pdf = await report.webContents.printToPDF({ printBackground: true });
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(pdf.length > 500);
  report.destroy();
  await window.webContents.executeJavaScript("location.href='file:///C:/Windows/win.ini';true");
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(window.webContents.getURL(), 'app://yks/index.html');
}

async function verifyGuest(window, expectedName = '') {
  const state = await window.webContents.executeJavaScript(`(async () => {
    await window.__YKS_DATA__.ready;
    return { mode: window.__YKS_SESSION__.getState().mode,
      gateHidden: document.getElementById('accountGate').hidden,
      bannerHidden: document.getElementById('accountGuestBanner')?.hidden,
      banner: document.getElementById('accountGuestBanner')?.textContent,
      name: JSON.parse(window.YKSLegacyState.readJSON()).name };
  })()`);
  assert.equal(state.mode, 'guest');
  assert.equal(state.gateHidden, true);
  assert.equal(state.bannerHidden, false);
  assert.match(state.banner, /kaydedil|geçici|saklanmaz/i);
  assert.notEqual(state.name, EXISTING_NAME, 'Guest must never load the existing account study data');
  assert.notEqual(state.name, GUEST_NAME, 'A new guest session must not restore previous temporary work');
  if (expectedName) assert.equal(state.name, expectedName);
}

async function runPhase() {
  const profile = option('--profile');
  assertTemporaryProfile(profile);
  const { bootstrap, securePreferences } = require('./main.cjs');
  let preflightBlocked = false;
  app.on('web-contents-created', (_event, contents) => {
    const urls = ['https://*/*', 'http://*/*'];
    if (phase === 'missing') urls.push('app://yks/session-mode.js*');
    contents.session.webRequest.onBeforeRequest({ urls }, (details, callback) => {
      if (details.url.startsWith('app://yks/session-mode.js')) preflightBlocked = true;
      callback({ cancel: true });
    });
  });
  const window = await bootstrap({ userDataPath: profile, show: false });
  assert.ok(window);
  assert.equal(window.isVisible(), false);
  if (phase === 'missing') {
    stage = 'missingStorageBoundary';
    const failure = await window.webContents.executeJavaScript(`(() => ({
      message: document.getElementById('accountBootFailure')?.textContent || '',
      dataStarted: !!window.__YKS_DATA__, appStarted: typeof window.go === 'function',
    }))()`);
    assert.equal(preflightBlocked, true, 'Fault injection did not actually block the storage preflight');
    assert.ok(failure.message.trim(), 'Missing storage preflight must present a recovery message');
    const baseline = JSON.parse(await fs.readFile(path.join(profile, 'account-baseline.json'), 'utf8'));
    assert.deepEqual(await persisted(securePreferences), baseline, 'Failed startup changed existing persistent study data');
    assert.equal(failure.dataStarted, false, 'Study data runtime started without its storage boundary');
    assert.equal(failure.appStarted, false, 'Legacy app started without its storage boundary');
    console.log(JSON.stringify({ phase, missingPreflightFailsClosed: true, existingDataUntouched: true }));
    return;
  }
  stage = 'startup';
  const initial = await waitForAccount(window);
  assert.equal(initial.mode, 'locked');
  assert.equal(initial.gateHidden, false);
  await verifyNativeBoundary(window);

  if (phase === 'read') {
    stage = 'verifySeparateProcessPersistence';
    const baseline = JSON.parse(await fs.readFile(path.join(profile, 'account-baseline.json'), 'utf8'));
    assert.deepEqual(await persisted(securePreferences), baseline, 'Relaunch changed existing persistent study data');
    await clickAndWaitForReload(window, '#accountGuest');
    await verifyGuest(window);
    assert.deepEqual(await persisted(securePreferences), baseline, 'Fresh guest relaunch changed existing persistent study data');
    console.log(JSON.stringify({ phase, freshProcessShowsAccount: true, temporaryWorkDiscarded: true, existingDataUntouched: true }));
    return;
  }
  assert.equal(phase, 'write');
  stage = 'forms';
  await verifyForms(window);
  await screenshots(window);
  stage = 'seedExistingAccountStorage';
  const blankJSON = await window.webContents.executeJavaScript('window.YKSLegacyState.readJSON()');
  const baseline = await seedExisting(securePreferences, blankJSON);
  await fs.writeFile(path.join(profile, 'account-baseline.json'), JSON.stringify(baseline));
  await reload(window);
  assert.deepEqual(await persisted(securePreferences), baseline, 'Locked startup changed existing account data');
  stage = 'guestEntry';
  await verifyGateRecovery(securePreferences);
  await clickAndWaitForReload(window, '#accountGuest');
  await verifyGuest(window);
  stage = 'guestNavigationAndWork';
  const visited = await window.webContents.executeJavaScript(`(async () => {
    const visited = [];
    for (const id of ['home','program','topics','deneme','progress','pomo','pp','more']) {
      window.go(id);
      const visible = [...document.querySelectorAll('.screen')].filter(element => getComputedStyle(element).display !== 'none');
      if (visible.length !== 1 || visible[0].id !== id) throw new Error('Guest navigation failed: '+id);
      visited.push(id);
    }
    window.go('home');
    const state = JSON.parse(window.YKSLegacyState.readJSON());
    state.name = ${JSON.stringify(GUEST_NAME)};
    state.solved = {'2026-09-09': 99};
    const result = window.YKSLegacyState.applyJSON(JSON.stringify(state));
    if (!result.ok) throw new Error('Temporary guest edit was rejected');
    if (typeof window.save === 'function') window.save();
    await window.__YKS_DATA__.flush();
    if (JSON.parse(window.YKSLegacyState.readJSON()).name !== ${JSON.stringify(GUEST_NAME)})
      throw new Error('Temporary guest edit is unavailable in memory');
    return visited;
  })()`);
  assert.deepEqual(await persisted(securePreferences), baseline, 'Guest activity wrote persistent study data');
  stage = 'guestBackupDenied';
  const backup = await window.webContents.executeJavaScript('window.__YKS_BACKUP__.build()');
  assert.equal(backup.ok, false, 'Guest backup export must require an account');
  assert.match(backup.message, /hesa[bp]/i);
  stage = 'nativeSandboxAndNavigation';
  await verifyReportAndNavigationBoundary(window);
  stage = 'guestReload';
  const afterReload = await reload(window);
  assert.equal(afterReload.mode, 'locked', 'Reload must ask for an account again, without remembering guest work');
  await clickAndWaitForReload(window, '#accountGuest');
  await verifyGuest(window);
  stage = 'guestReturnToLogin';
  const locked = await clickAndWaitForReload(window, '#accountGuestLogin', true);
  assert.equal(locked.mode, 'locked');
  assert.equal(locked.gateHidden, false);
  assert.deepEqual(await persisted(securePreferences), baseline, 'Returning to login changed existing study data');
  window.webContents.session.flushStorageData();
  console.log(JSON.stringify({ phase, offlineFirstBoot: true, nativeForms: true, visited,
    guestMemoryOnly: true, guestBackupDenied: true, sandboxReportPDF: true, deniedFileNavigation: true,
    reloadDiscardsGuestWork: true, existingLocalStorageAndDexieUntouched: true }));
}

async function runChild(childPhase, profile) {
  const childArgs = [__filename, '--phase', childPhase, '--profile', profile];
  if (option('--screenshots')) childArgs.push('--screenshots', option('--screenshots'));
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, childArgs, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', chunk => process.stdout.write(chunk));
    child.stderr.on('data', chunk => process.stderr.write(chunk));
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Account ${childPhase} phase exited ${code}`)));
  });
}

async function runCoordinator() {
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), PROFILE_PREFIX));
  assertTemporaryProfile(profile);
  try {
    await runChild('write', profile);
    await runChild('read', profile);
    await runChild('missing', profile);
    console.log(JSON.stringify({ ok: true, phases: 3, realFirebaseSDK: true, networkBlocked: true,
      realChromiumStorage: true, separateProcessRelaunch: true }));
  } finally {
    assertTemporaryProfile(profile);
    await fs.rm(profile, { recursive: true, force: true }).catch(error =>
      console.warn('Temporary account test profile cleanup failed:', error.code));
  }
}

(phase ? runPhase() : runCoordinator()).then(() => {
  clearTimeout(watchdog);
  app.exit(0);
}).catch(error => {
  clearTimeout(watchdog);
  console.error(`Account smoke failed at ${stage}:`, error?.stack || String(error));
  app.exit(1);
});
