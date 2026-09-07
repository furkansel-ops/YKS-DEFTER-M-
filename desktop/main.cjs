'use strict';

const { app, BrowserWindow, Menu, dialog, net, protocol, session, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { stat, realpath } = require('node:fs/promises');
const policy = require('./policy.cjs');

const PARTITION = 'persist:yks-main';
const APP_NAME = 'YKS Defterim';
const APP_ID = 'com.furkansel.yksdefterim.desktop';
const assetRoot = path.join(__dirname, '..', 'dist');
let mainWindow = null;
let externalPromptOpen = false;
let showAuxiliaryWindows = true;

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: {
  standard: true, secure: true, supportFetchAPI: true, corsEnabled: true,
  stream: true,
} }]);
app.enableSandbox();

function securePreferences(preload = 'preload.cjs') {
  return {
    preload: path.join(__dirname, preload),
    partition: PARTITION,
    nodeIntegration: false,
    nodeIntegrationInSubFrames: false,
    nodeIntegrationInWorker: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    webviewTag: false,
    navigateOnDragDrop: false,
    spellcheck: false,
  };
}

async function openExternalConfirmed(owner, value) {
  const url = policy.externalUrl(value);
  if (!url || externalPromptOpen || !owner || owner.isDestroyed()) return;
  externalPromptOpen = true;
  try {
    const answer = await dialog.showMessageBox(owner, {
      type: 'question', title: APP_NAME, message: 'Bu bağlantı varsayılan tarayıcıda açılsın mı?',
      detail: url, buttons: ['İptal', 'Tarayıcıda aç'], defaultId: 0, cancelId: 0, noLink: true,
    });
    if (answer.response === 1) await shell.openExternal(url);
  } catch {
    if (!owner.isDestroyed()) await dialog.showMessageBox(owner, { type: 'error', message: 'Bağlantı açılamadı. Varsayılan tarayıcını kontrol et.' });
  } finally { externalPromptOpen = false; }
}

function guardContents(window, { document = false, print = false } = {}) {
  const contents = window.webContents;
  contents.on('will-attach-webview', event => event.preventDefault());
  const allowTop = value => print ? value === 'about:blank' : document ? policy.isLocalDocument(value) : policy.isMainPage(value);
  contents.on('will-navigate', (event, legacyUrl) => {
    const value = event.url || legacyUrl;
    if (!allowTop(value)) { event.preventDefault(); void openExternalConfirmed(window, value); }
  });
  contents.on('will-frame-navigate', event => {
    if (event.isMainFrame ? !allowTop(event.url) : !policy.isAllowedFrame(event.url)) {
      event.preventDefault();
      if (event.isMainFrame) void openExternalConfirmed(window, event.url);
    }
  });
  contents.on('will-redirect', (event, legacyUrl) => {
    const value = event.url || legacyUrl;
    if (event.isMainFrame ? !allowTop(value) : !policy.isAllowedFrame(value)) event.preventDefault();
  });
  contents.setWindowOpenHandler(details => {
    if (document || print || !policy.isMainPage(contents.getURL())) return { action: 'deny' };
    if (details.url === 'about:blank' && !details.postBody && BrowserWindow.getAllWindows().length < 5) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          title: `${APP_NAME} — Rapor`, width: 960, height: 800, autoHideMenuBar: true,
          show: showAuxiliaryWindows,
          webPreferences: securePreferences('document-preload.cjs'),
        },
      };
    }
    if (policy.isLocalDocument(details.url) && BrowserWindow.getAllWindows().length < 5) {
      const documentWindow = new BrowserWindow({
        title: APP_NAME, width: 960, height: 800, autoHideMenuBar: true,
        show: showAuxiliaryWindows,
        webPreferences: securePreferences('document-preload.cjs'),
      });
      guardContents(documentWindow, { document: true });
      documentWindow.loadURL(details.url).catch(() => documentWindow.close());
    } else { void openExternalConfirmed(window, details.url); }
    return { action: 'deny' };
  });
  contents.on('did-create-window', child => {
    child.setMenu(null);
    guardContents(child, { print: true });
  });
}

async function installSessionPolicy() {
  const localSession = session.fromPartition(PARTITION);
  localSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  localSession.setPermissionCheckHandler(() => false);
  localSession.setDevicePermissionHandler(() => false);
  localSession.protocol.handle('app', async request => {
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    const filename = policy.resolveAppAsset(request.url, assetRoot);
    if (!filename) return new Response('Forbidden', { status: 403 });
    try {
      const [canonicalRoot, canonicalFile] = await Promise.all([realpath(assetRoot), realpath(filename)]);
      const relative = path.relative(canonicalRoot, canonicalFile);
      if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || !(await stat(filename)).isFile()) return new Response('Forbidden', { status: 403 });
      const asset = await net.fetch(pathToFileURL(filename).href);
      const headers = new Headers(asset.headers);
      headers.set('Content-Security-Policy', policy.CONTENT_SECURITY_POLICY);
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Referrer-Policy', 'no-referrer');
      headers.set('Cache-Control', 'no-cache');
      return new Response(request.method === 'HEAD' ? null : asset.body, { status: asset.status, headers });
    } catch { return new Response('Not found', { status: 404 }); }
  });
  localSession.on('will-download', (event, item, contents) => {
    const owner = BrowserWindow.fromWebContents(contents);
    if (!owner || !policy.isMainPage(contents.getURL()) || !policy.isAllowedDownload(item.getURL(), item.getFilename())) {
      event.preventDefault(); return;
    }
    // Electron's save dialog remains visible: no silent writes or auto-open.
    item.setSaveDialogOptions({ title: 'YKS Defterim — Dosyayı kaydet', defaultPath: item.getFilename() });
    item.once('done', (_event, state) => {
      if (state === 'interrupted' && !owner.isDestroyed()) void dialog.showMessageBox(owner, { type: 'error', message: 'Dosya kaydedilemedi. Dışa aktarmayı tekrar dene.' });
    });
  });
}

function installMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Dosya', submenu: [{ role: 'close', label: 'Pencereyi kapat' }, { type: 'separator' }, { role: 'quit', label: 'Çıkış' }] },
    { label: 'Düzenle', submenu: [
      { role: 'undo', label: 'Geri al' }, { role: 'redo', label: 'Yinele' }, { type: 'separator' },
      { role: 'cut', label: 'Kes' }, { role: 'copy', label: 'Kopyala' }, { role: 'paste', label: 'Yapıştır' }, { role: 'selectAll', label: 'Tümünü seç' },
    ] },
    { label: 'Görünüm', submenu: [
      { role: 'resetZoom', label: 'Gerçek boyut' }, { role: 'zoomIn', label: 'Yakınlaştır' }, { role: 'zoomOut', label: 'Uzaklaştır' },
      { type: 'separator' }, { role: 'togglefullscreen', label: 'Tam ekran' },
    ] },
    { label: 'Yardım', submenu: [{ label: 'GitHub sürümleri', click: () => void openExternalConfirmed(mainWindow, 'https://github.com/furkansel-ops/YKS-DEFTER-M-/releases') }] },
  ]));
}

async function bootstrap({ userDataPath, show = true } = {}) {
  showAuxiliaryWindows = show;
  app.setName(APP_NAME);
  app.setAppUserModelId(APP_ID);
  // Stable across installer versions; browser/PWA data is never overwritten.
  app.setPath('userData', userDataPath || path.join(app.getPath('appData'), APP_NAME));
  if (!app.requestSingleInstanceLock()) { app.quit(); return null; }
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
  });
  await app.whenReady();
  await installSessionPolicy();
  installMenu();
  mainWindow = new BrowserWindow({
    title: APP_NAME, width: 1366, height: 900, minWidth: 720, minHeight: 560,
    backgroundColor: '#EFF2F8', show: false, icon: path.join(assetRoot, 'icon-512.png'),
    webPreferences: securePreferences(),
  });
  guardContents(mainWindow);
  if (show) mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.on('render-process-gone', () => {
    if (!mainWindow.isDestroyed()) void dialog.showMessageBox(mainWindow, { type: 'error', message: 'Uygulama görüntüsü beklenmedik şekilde kapandı. Uygulamayı kapatıp tekrar açabilirsin; cihaz kayıtları silinmedi.' });
  });
  await mainWindow.loadURL(policy.APP_URL);
  return mainWindow;
}

app.on('window-all-closed', () => app.quit());
if (require.main === module) {
  bootstrap().catch(() => {
    dialog.showErrorBox(APP_NAME, 'Uygulama dosyaları açılamadı. GitHub sürümünden tekrar kurmayı dene. Mevcut kayıtların silinmez.');
    app.quit();
  });
}

module.exports = { bootstrap, securePreferences };
