const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Dünkü Firebase eşitleme kaynağı kaynak HTML içinde kayıpsız korunur",()=>{
  const index=read("index.html");
  assert.match(index,/type="application\/json" id="legacyFirebaseSyncModule"/);
  assert.match(index,/apiKey:\s*""/);
  assert.match(index,/signInWithPopup/);
  assert.match(index,/onAuthStateChanged/);
  assert.match(index,/runTransaction\(db/);
  assert.match(index,/SYNC_CONFLICT/);
  assert.match(index,/id="cloudSyncBox"/);
  assert.match(index,/id="cloudLoginBtn"/);
  assert.match(index,/Google ile giriş/);
});

test("Production build eski Firebase kodunu gerçek web modülüne çıkarır",()=>{
  const vite=read("vite.config.mts");
  assert.match(vite,/prepareWebCloudRuntime/);
  assert.match(vite,/apply:"build"/);
  assert.match(vite,/legacyFirebaseSyncModule/);
  assert.match(vite,/firebase-sync-runtime\.js/);
  assert.match(vite,/emitFile/);
  assert.match(vite,/FIREBASE_WEB_API_KEY="AIza/);
  assert.match(vite,/signInWithPopup/);
  assert.match(vite,/onAuthStateChanged/);
  assert.match(vite,/runTransaction/);
  assert.match(vite,/cloudSyncBox/);
});

test("Web/PWA tek eski sağ-alt eşitleme kutusunu kullanır; ikinci gösterge oluşturulmaz",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/installLegacyCloudSyncBox/);
  assert.match(shell,/CLOUD_BOX_ID="cloudSyncBox"/);
  assert.match(shell,/cloudSyncDot/);
  assert.match(shell,/cloudSyncText/);
  assert.match(shell,/cloudSyncMeta/);
  assert.match(shell,/cloudLoginBtn/);
  assert.match(shell,/Google ile giriş/);
  assert.match(shell,/activateWebCloudSync/);
  assert.match(shell,/firebase-sync-runtime\.js/);
  assert.match(shell,/if\(isNativeApp\(\)\)return false/);
  assert.doesNotMatch(shell,/cloudSyncIndicator|installCloudSyncIndicator|web-cloud-sync-card/);
  assert.doesNotMatch(shell,/signInWithRedirect|getRedirectResult|patchLegacyCloudAuthSource/);
});

test("Eski sağ-alt kutunun görünüm sözleşmesi app.css içinde korunur",()=>{
  const css=read("app.css");
  assert.match(css,/#cloudSyncBox\{position:fixed;right:12px;bottom:/);
  assert.match(css,/z-index:1000/);
  assert.match(css,/cloudSyncDot/);
  assert.match(css,/data-state=\\?"synced\\?"/);
  assert.match(css,/data-state=\\?"syncing\\?"/);
  assert.match(css,/data-state=\\?"error\\?"/);
  assert.match(css,/backdrop-filter:var\(--blur-lite\)/);
});

test("Bulut yardımcı katmanı hata verirse ana uygulama açılışı devam eder",()=>{
  const main=read("src/main.ts");
  assert.match(main,/installOptional\([\s\S]*"play-store-shell"[\s\S]*installPlayStoreShell/);
  assert.match(main,/v4OptionalErrors/);
});
