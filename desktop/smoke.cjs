'use strict';

// Development/CI only, excluded from app.asar. Two separate Electron processes
// share a disposable profile: this checks a real quit/relaunch, not only reload.
const { app } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { once } = require('node:events');
const { spawn } = require('node:child_process');
const args = process.argv.slice(2);
const phase = args[args.indexOf('--phase') + 1];
const isPhase = args.includes('--phase');
const watchdog = setTimeout(() => { console.error('Windows smoke test timed out.'); app.exit(1); }, isPhase ? 55_000 : 120_000);
const PROFILE_PREFIX = 'yks-desktop-smoke-';
const NAME = 'Windows çevrimdışı kalıcılık testi';
let stage = 'start';

function assertTemporaryProfile(profile) {
  assert.equal(path.dirname(path.resolve(profile)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(profile).startsWith(PROFILE_PREFIX));
}

async function waitForApp(window) {
  return window.webContents.executeJavaScript(`(async () => {
    const deadline = Date.now() + 15000;
    while (!window.__YKS_DATA__ || typeof window.go !== 'function' ||
      document.documentElement.dataset.webCloudRuntime !== 'ready') {
      if (Date.now() > deadline) throw new Error('Offline app and bundled cloud runtime did not start');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    await window.__YKS_DATA__.ready;
    return true;
  })()`);
}

async function runPhase() {
  const profile = args[args.indexOf('--profile') + 1];
  assertTemporaryProfile(profile);
  const { bootstrap } = require('./main.cjs');
  // Prevent network requests for the entire test, including the first boot.
  // No account is created or modified by this smoke test.
  app.on('web-contents-created', (_event, contents) => {
    contents.session.webRequest.onBeforeRequest({ urls: ['https://*/*', 'http://*/*'] }, (_details, callback) => callback({ cancel: true }));
  });
  const window = await bootstrap({ userDataPath: profile, show: false });
  stage = 'waitForApp';
  assert.ok(window);
  assert.equal(window.isVisible(), false);
  await waitForApp(window);
  stage = 'initial';
  const initial = await window.webContents.executeJavaScript(`(async () => ({
    url: location.href, secure: isSecureContext, desktop: window.__YKS_DESKTOP__,
    node: typeof require, indexedDB: typeof indexedDB.open,
    embedded: document.getElementById('cloudSyncBox')?.dataset.embeddedApp,
    email: document.getElementById('cloudEmail')?.type,
    password: document.getElementById('cloudPassword')?.type,
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
  assert.equal(initial.email, 'email');
  assert.equal(initial.password, 'password');
  assert.equal(initial.googleHidden, true);
  assert.equal(initial.cloud, 'ready');
  // The app: protocol deliberately does not support service workers. Chromium
  // either omits registrations or rejects enumeration for this custom scheme.
  assert.ok([0, 'SecurityError', 'InvalidStateError'].includes(initial.serviceWorkers), JSON.stringify(initial));

  if (phase === 'read') {
    stage = 'readPersistentState';
    const saved = await window.webContents.executeJavaScript(`(async () => {
      const primary = await window.__YKS_DATA__.primaryJSON();
      return { ok: primary.ok, source: primary.source,
        name: primary.ok ? JSON.parse(primary.json).name : null,
        runtimeName: JSON.parse(window.YKSLegacyState.readJSON()).name,
        marker: localStorage.getItem('yks-desktop-smoke') };
    })()`);
    assert.equal(saved.ok, true);
    assert.equal(saved.source, 'dexie');
    assert.equal(saved.name, NAME);
    assert.equal(saved.runtimeName, NAME);
    assert.equal(saved.marker, 'persisted');
    console.log(JSON.stringify({ phase, dexieRelaunch: true, localStorageRelaunch: true, offlineCloudRuntime: true }));
    return;
  }
  assert.equal(phase, 'write');
  stage = 'navigation';

  const screens = await window.webContents.executeJavaScript(`(() => {
    const visited=[];
    for (const id of ['home','program','topics','deneme','progress','pomo','pp','more']) {
      window.go(id);
      const visible=[...document.querySelectorAll('.screen')].filter(el => getComputedStyle(el).display !== 'none');
      if (visible.length !== 1 || visible[0].id !== id) throw new Error('Wrong screen visible: '+id);
      visited.push(id);
    }
    window.go('home');
    localStorage.setItem('yks-desktop-smoke', 'persisted');
    return visited;
  })()`);
  const stored = await window.webContents.executeJavaScript(`(async () => {
    const data = JSON.parse(window.YKSLegacyState.readJSON());
    data.name = ${JSON.stringify(NAME)};
    const applied = await window.__YKS_DATA__.applyBackupJSON(JSON.stringify(data));
    await window.__YKS_DATA__.flush();
    return applied.ok;
  })()`);
  assert.equal(stored, true);
  stage = 'backupExport';

  const downloadPath = path.join(profile, 'smoke-export.json');
  const downloaded = new Promise((resolve, reject) => {
    window.webContents.session.once('will-download', (_event, item) => {
      item.setSavePath(downloadPath);
      item.once('done', (_done, state) => state === 'completed' ? resolve() : reject(new Error(`Blob download ${state}`)));
    });
  });
  assert.equal(await window.webContents.executeJavaScript('window.exportData()'), true);
  await downloaded;
  const backup = JSON.parse(await fs.readFile(downloadPath, 'utf8'));
  assert.equal(backup.app, 'YKS Defterim');
  assert.equal(backup.data.name, NAME);
  assert.equal(backup.schemaVersion, 21);
  stage = 'report';

  const opened = once(window.webContents, 'did-create-window');
  await window.webContents.executeJavaScript(`(() => {
    const report=window.open('', '_blank');
    if (!report) throw new Error('Report popup blocked');
    report.document.write('<!doctype html><title>Smoke report</title><p id="report">PDF report content</p>');
    report.document.close();return true;
  })()`);
  const [report] = await opened;
  assert.equal(report.isVisible(), false);
  const reportState = await report.webContents.executeJavaScript("({node:typeof require, content:document.getElementById('report')?.textContent})");
  assert.equal(reportState.node, 'undefined');
  assert.equal(reportState.content, 'PDF report content');
  const preferences = report.webContents.getLastWebPreferences();
  assert.equal(preferences.sandbox, true);
  assert.equal(preferences.contextIsolation, true);
  assert.equal(preferences.nodeIntegration, false);
  const pdf = await report.webContents.printToPDF({ printBackground: true });
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(pdf.length > 500);
  report.destroy();
  stage = 'fileNavigation';

  await window.webContents.executeJavaScript("location.href='file:///C:/Windows/win.ini';true");
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(window.webContents.getURL(), 'app://yks/index.html');
  await window.webContents.executeJavaScript('window.__YKS_DATA__.flush()');
  window.webContents.session.flushStorageData();
  console.log(JSON.stringify({ phase, origin: initial.url, screens, nativeEmailAuth: true,
    offlineFirstBoot: true, backupExport: true, sandboxReportPDF: true, deniedFileNavigation: true }));
}

async function runChild(phase, profile) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [__filename, '--phase', phase, '--profile', profile], {
      windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', chunk => process.stdout.write(chunk));
    child.stderr.on('data', chunk => process.stderr.write(chunk));
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Electron ${phase} phase exited ${code}`)));
  });
}

async function runCoordinator() {
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), PROFILE_PREFIX));
  assertTemporaryProfile(profile);
  try {
    await runChild('write', profile);
    await runChild('read', profile);
    console.log(JSON.stringify({ ok: true, phases: 2, freshProfile: true, separateProcessRelaunch: true }));
  } finally {
    // Only this newly created temporary profile can be removed. All child
    // processes have exited, releasing the database and Chromium file locks.
    assertTemporaryProfile(profile);
    await fs.rm(profile, { recursive: true, force: true }).catch(error => console.warn('Temporary smoke profile cleanup failed:', error.code));
  }
}

(isPhase ? runPhase() : runCoordinator()).then(() => {
  clearTimeout(watchdog);
  app.exit(0);
}).catch(error => {
  clearTimeout(watchdog);
  console.error(`Failed at ${stage}:`, error?.stack || `${error?.name || 'Error'}: ${error?.message || String(error)}`);
  app.exit(1);
});
