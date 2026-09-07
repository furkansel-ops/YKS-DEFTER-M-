import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as asar from '@electron/asar';
import { getCurrentFuseWire, FuseV1Options } from '@electron/fuses';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'desktop-release');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = JSON.parse(await readFile(path.join(root, 'version.json'), 'utf8'));
const artifactName = `YKS-Defterim-${pkg.version}-Windows-x64-Setup.exe`;
const installers = (await readdir(output)).filter(name => name.endsWith('-Setup.exe'));
assert.deepEqual(installers, [artifactName], 'Çıktıda yalnızca beklenen sürümün Windows kurulum dosyası bulunmalı.');
assert.equal(pkg.version, version.version, 'Windows ve uygulama sürümü aynı olmalı.');
const installer = path.join(output, artifactName);
const bytes = await readFile(installer);
assert.ok(bytes.length > 10_000_000, 'Windows kurulum paketi eksik görünüyor.');
assert.equal(bytes.subarray(0, 2).toString('ascii'), 'MZ', 'Geçerli Windows yürütülebilir dosyası değil.');
const installerHeader = bytes.readUInt32LE(0x3c);
assert.equal(bytes.subarray(installerHeader, installerHeader + 4).toString('ascii'), 'PE\u0000\u0000', 'Windows kurulum PE başlığı geçersiz.');
const archive = path.join(output, 'win-unpacked', 'resources', 'app.asar');
const entries = asar.listPackage(archive).map(name => name.replaceAll('\\', '/'));
for (const name of ['/desktop/main.cjs', '/desktop/preload.cjs', '/desktop/policy.cjs', '/desktop/document-preload.cjs', '/dist/index.html', '/dist/app.js', '/dist/firebase-sync-runtime.js', '/dist/privacy.html', '/dist/data-deletion.html']) {
  assert.ok(entries.includes(name), `Windows arşivinde eksik dosya: ${name}`);
}
assert.ok(!entries.some(name => /\.(jks|keystore|p12|pfx|apk|aab|map)$|\/(\.git|\.env|node_modules|android)(\/|$)|credentials\.dpapi\.json|google-services\.json/.test(name)), 'Windows arşivi yalnızca gerekli uygulama dosyalarını içermeli.');
const packedPackage = JSON.parse(asar.extractFile(archive, 'package.json').toString());
assert.equal(packedPackage.main, 'desktop/main.cjs');
assert.equal(packedPackage.version, pkg.version);
const packedVersion = JSON.parse(asar.extractFile(archive, 'dist/version.json').toString());
assert.equal(packedVersion.build, version.build, 'Paket güncel uygulama derlemesini içermeli.');
for (const name of ['desktop/main.cjs', 'desktop/policy.cjs', 'desktop/preload.cjs', 'desktop/document-preload.cjs', 'dist/index.html', 'dist/app.js', 'dist/firebase-sync-runtime.js']) {
  assert.deepEqual(asar.extractFile(archive, name), await readFile(path.join(root, name)), `Paket ve doğrulanan kaynak aynı olmalı: ${name}`);
}
const preload = asar.extractFile(archive, 'desktop/preload.cjs').toString();
assert.match(preload, /__YKS_DESKTOP__/);
assert.doesNotMatch(preload, /ipcRenderer|readFile|exec\(|spawn\(/);
const main = asar.extractFile(archive, 'desktop/main.cjs').toString();
assert.match(main, /nodeIntegration: false/);
assert.match(main, /contextIsolation: true/);
assert.match(main, /sandbox: true/);
const application = path.join(output, 'win-unpacked', 'YKS Defterim.exe');
assert.ok((await stat(application)).isFile());
const executable = await readFile(application);
const executableHeader = executable.readUInt32LE(0x3c);
assert.equal(executable.readUInt16LE(executableHeader + 4), 0x8664, 'Uygulama x64 olmalı.');
const fuseWire = await getCurrentFuseWire(application);
const disabledFuses = ['RunAsNode', 'EnableNodeOptionsEnvironmentVariable', 'EnableNodeCliInspectArguments', 'GrantFileProtocolExtraPrivileges'];
const enabledFuses = ['EnableCookieEncryption', 'EnableEmbeddedAsarIntegrityValidation', 'OnlyLoadAppFromAsar'];
// Electron's V1 fuse wire stores ASCII '0' / '1' for disabled / enabled.
for (const name of disabledFuses) assert.equal(fuseWire[FuseV1Options[name]], 0x30, `Güvenlik anahtarı kapalı olmalı: ${name}`);
for (const name of enabledFuses) assert.equal(fuseWire[FuseV1Options[name]], 0x31, `Güvenlik anahtarı açık olmalı: ${name}`);
let signatureStatus = 'not-checked-on-this-platform';
if (process.platform === 'win32') {
  const quoted = installer.replaceAll("'", "''");
  const command = `(Get-AuthenticodeSignature -LiteralPath '${quoted}').Status.ToString()`;
  // Windows PowerShell must not inherit PowerShell 7's incompatible module path.
  const signatureEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.toLowerCase() !== 'psmodulepath'));
  signatureStatus = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(command, 'utf16le').toString('base64')], { encoding: 'utf8', env: signatureEnv }).trim();
  assert.ok(['NotSigned', 'Valid'].includes(signatureStatus), `Windows imza denetimi beklenmeyen sonuç verdi: ${signatureStatus}`);
}
const checksum = createHash('sha256').update(bytes).digest('hex');
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const sourceDirty = !!execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim();
const metadata = {
  schema: 1, platform: 'windows-x64', version: pkg.version, build: version.build,
  appId: 'com.furkansel.yksdefterim.desktop', artifact: artifactName,
  bytes: bytes.length, sha256: checksum, sourceCommit, sourceDirty, signatureStatus,
  securityFusesVerified: true,
  autoUpdate: false, distribution: 'github-testing',
};
await writeFile(path.join(output, 'SHA256SUMS.txt'), `${checksum}  ${artifactName}\n`);
await writeFile(path.join(output, 'windows-release-metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify(metadata, null, 2));
