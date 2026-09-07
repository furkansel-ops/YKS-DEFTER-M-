const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const policy = require('../desktop/policy.cjs');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('Masaüstü dosya protokolü sabit origin altında kalır', () => {
  const assets = path.join(root, 'dist');
  assert.equal(policy.resolveAppAsset('app://yks/', assets), path.join(assets, 'index.html'));
  assert.equal(policy.resolveAppAsset('app://yks/assets/app.js?v=1', assets), path.join(assets, 'assets', 'app.js'));
  for (const url of ['file:///C:/Windows/win.ini', 'https://yks/index.html', 'app://evil/index.html', 'app://yks.evil/index.html', 'app://user@yks/index.html', 'app://yks:99/index.html', 'app://yks/%00', 'app://yks/%5c..%5csecret', 'app://yks/C:%5cWindows', 'app://yks/%E0%A4%A', 'app://yks/..%2fsecret']) {
    assert.equal(policy.resolveAppAsset(url, assets), null, url);
  }
  // URL normalization can remove dot segments, but never escape the asset root.
  assert.equal(policy.resolveAppAsset('app://yks/../../secret', assets), path.join(assets, 'secret'));
});

test('Masaüstü gezinme, belge ve iframe izinleri dar kapsamlıdır', () => {
  assert.equal(policy.isMainPage('app://yks/index.html#today'), true);
  assert.equal(policy.isMainPage('app://yks/privacy.html'), false);
  assert.equal(policy.isMainPage('https://yks/index.html'), false);
  assert.equal(policy.isLocalDocument('app://yks/privacy.html'), true);
  assert.equal(policy.isLocalDocument('app://yks/data-deletion.html'), true);
  assert.equal(policy.isLocalDocument('app://yks/anatomy/ATTRIBUTION.md'), true);
  assert.equal(policy.isLocalDocument('app://yks/app.js'), false);
  assert.equal(policy.isAllowedFrame('https://www.youtube-nocookie.com/embed/abc'), true);
  for (const url of ['https://evil.test/embed/abc', 'https://www.youtube.com.evil.test/embed/abc', 'https://www.youtube.com/watch?v=abc', 'file:///secret', 'javascript:alert(1)', 'app://yks/index.html']) assert.equal(policy.isAllowedFrame(url), false, url);
});

test('Dış bağlantılar yalnızca kimlik bilgisi taşımayan HTTPS adresidir', () => {
  assert.equal(policy.externalUrl('https://github.com/furkansel-ops/YKS-DEFTER-M-/releases'), 'https://github.com/furkansel-ops/YKS-DEFTER-M-/releases');
  for (const url of ['file:///secret', 'javascript:alert(1)', 'ms-settings:', 'http://example.com/', 'https://user:pass@example.com/', 'https://example.com/\nsecret', 'not-a-url']) assert.equal(policy.externalUrl(url), null, url);
});

test('Yedek ve rapor indirmeleri yalnızca uygulamanın güvenli Blob çıktılarıdır', () => {
  for (const name of ['yedek.json', 'rapor.csv', 'kartlar.txt', 'plan.ics', 'not.md', 'kart.png', 'rapor.pdf']) assert.equal(policy.isAllowedDownload('blob:app://yks/1234', name), true, name);
  for (const name of ['program.exe', 'run.ps1', '../yedek.json', 'C:\\yedek.json', 'x.json:program.exe', 'x.exe.json\0']) assert.equal(policy.isAllowedDownload('blob:app://yks/1234', name), false, name);
  assert.equal(policy.isAllowedDownload('https://example.com/yedek.json', 'yedek.json'), false);
  assert.equal(policy.isAllowedDownload('blob:https://example.com/1234', 'yedek.json'), false);
});

test('Preload yalnızca dondurulmuş uygulama kimliğini açar; IPC veya Node köprüsü yoktur', () => {
  let exposed;
  vm.runInNewContext(read('desktop/preload.cjs'), { require(name) {
    assert.equal(name, 'electron');
    return { contextBridge: { exposeInMainWorld(key, value) { assert.equal(key, '__YKS_DESKTOP__'); exposed = value; } } };
  } });
  assert.deepEqual(JSON.parse(JSON.stringify(exposed)), { platform: 'win32', installed: true, distribution: 'github' });
  assert.equal(Object.isFrozen(exposed), true);
  assert.doesNotMatch(read('desktop/preload.cjs'), /ipcRenderer|child_process|node:fs/);
});

test('Electron güvenlik ve kalıcı veri sözleşmesi korunur', () => {
  const main = read('desktop/main.cjs');
  for (const marker of ['nodeIntegration: false', 'nodeIntegrationInSubFrames: false', 'contextIsolation: true', 'sandbox: true', 'webSecurity: true', 'webviewTag: false', "const PARTITION = 'persist:yks-main'", "path.join(app.getPath('appData'), APP_NAME)", 'app.requestSingleInstanceLock()', 'setPermissionRequestHandler', 'setPermissionCheckHandler', 'setDevicePermissionHandler', 'setWindowOpenHandler', "'will-frame-navigate'", 'setSaveDialogOptions', 'realpath(filename)']) assert.ok(main.includes(marker), marker);
  assert.doesNotMatch(main, /ignore-certificate-errors|disable-web-security|allowRunningInsecureContent: true|clearStorageData|rmSync|ipcMain/);
  assert.match(policy.CONTENT_SECURITY_POLICY, /object-src 'none'/);
  assert.match(policy.CONTENT_SECURITY_POLICY, /base-uri 'none'/);
  assert.match(policy.CONTENT_SECURITY_POLICY, /form-action 'none'/);
  assert.doesNotMatch(policy.CONTENT_SECURITY_POLICY, /unsafe-eval|default-src \*|script-src[^;]* https:;/);
});

test('Windows kurulum paketi kullanıcı verisini korur ve kendiliğinden yayımlanmaz', () => {
  const config = read('desktop/electron-builder.yml');
  for (const marker of ['electronVersion: 44.2.0', 'asar: true', 'perMachine: false', 'allowElevation: false', 'deleteAppDataOnUninstall: false', 'runAfterFinish: false', 'publish: null', 'runAsNode: false', 'enableCookieEncryption: true', 'enableNodeOptionsEnvironmentVariable: false', 'enableNodeCliInspectArguments: false', 'enableEmbeddedAsarIntegrityValidation: true', 'onlyLoadAppFromAsar: true', 'grantFileProtocolExtraPrivileges: false']) assert.ok(config.includes(marker), marker);
  const workflow = read('.github/workflows/build-windows.yml');
  assert.match(workflow, /contents: read/);
  assert.doesNotMatch(workflow, /contents: write|gh release|secrets\./);
  assert.match(workflow, /CSC_IDENTITY_AUTO_DISCOVERY: "false"/);
  assert.match(workflow, /windows-release-metadata\.json/);
  assert.match(workflow, /SHA256SUMS\.txt/);
});
