const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Firebase eşitleme kaynağı kaynak HTML içinde kayıpsız korunur ve görünür kutu shell tarafından oluşturulur",()=>{
  const index=read("index.html");
  assert.match(index,/type="application\/json" id="legacyFirebaseSyncModule"/);
  assert.match(index,/apiKey:\s*""/);
  assert.match(index,/signInWithPopup/);
  assert.match(index,/onAuthStateChanged/);
  assert.match(index,/runTransaction\(db/);
  assert.match(index,/SYNC_CONFLICT/);
  assert.doesNotMatch(index,/<div id="cloudSyncBox"/);
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
  assert.match(vite,/YKSAccountAuth/);
  assert.match(vite,/waitAccountRuntime/);
});

test("Web/PWA tek bulut eşitleme merkezi kullanır ve Firebase runtime sözleşmesini korur",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/installLegacyCloudSyncBox/);
  assert.match(shell,/CLOUD_BOX_ID="cloudSyncBox"/);
  assert.match(shell,/yks-cloud-center/);
  assert.match(shell,/cloudSyncDot/);
  assert.match(shell,/cloudSyncText/);
  assert.match(shell,/cloudSyncMeta/);
  assert.match(shell,/cloudLoginBtn/);
  assert.match(shell,/Google ile giriş yap/);
  assert.match(shell,/student-account-loader/);
  const loader=read("src/ui/student-account-loader.ts");
  assert.match(loader,/student-coaching-runtime\.js/);
  assert.match(loader,/student-coach-link\.js/);
  assert.doesNotMatch(loader,/coach-account-runtime\.js/);
  assert.match(loader,/__YKS_ACCOUNT_READY__/);
  assert.match(shell,/activateWebCloudSync/);
  assert.match(shell,/firebase-sync-runtime\.js/);
  assert.match(shell,/if\(isNativeApp\(\)\)return false/);
  assert.doesNotMatch(shell,/cloudSyncIndicator|installCloudSyncIndicator|web-cloud-sync-card/);
  assert.doesNotMatch(shell,/signInWithRedirect|getRedirectResult|patchLegacyCloudAuthSource/);
});

test("Eski fixed eşitleme CSS sözleşmesi korunur ama Daha merkezi ayrı CSS katmanıyla konuma bağlı olmaktan çıkar",()=>{
  const css=read("app.css");
  const centerCss=read("src/ui/cloud-sync-center.css");
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(css,/#cloudSyncBox\{position:fixed;right:12px;bottom:/);
  assert.match(css,/z-index:1000/);
  assert.match(css,/cloudSyncDot/);
  assert.match(css,/data-state=\\?"synced\\?"/);
  assert.match(css,/data-state=\\?"syncing\\?"/);
  assert.match(css,/data-state=\\?"error\\?"/);
  assert.match(css,/backdrop-filter:var\(--blur-lite\)/);
  assert.match(shell,/import \"\.\/cloud-sync-center\.css\"/);
  assert.match(centerCss,/position:relative!important/);
  assert.match(centerCss,/right:auto!important/);
  assert.match(centerCss,/bottom:auto!important/);
});

test("Bulut yardımcı katmanı hata verirse ana uygulama açılışı devam eder",()=>{
  const main=read("src/main.ts");
  assert.match(main,/installOptional\([\s\S]*"play-store-shell"[\s\S]*installPlayStoreShell/);
  assert.match(main,/v4OptionalErrors/);
});
