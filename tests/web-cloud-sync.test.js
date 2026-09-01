const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Web/PWA bulut eşitleme kartı geri gelir ve Android yerel sürüm ayrımı korunur",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/installCloudSyncCard/);
  assert.match(shell,/cloudSyncText/);
  assert.match(shell,/cloudSyncMeta/);
  assert.match(shell,/cloudLoginBtn/);
  assert.match(shell,/cloudLogoutBtn/);
  assert.match(shell,/legacyFirebaseSyncModule/);
  assert.match(shell,/activateLegacyCloudSync/);
  assert.match(shell,/isNativeApp\(\)/);
  assert.doesNotMatch(shell,/legacyCloud\?\.remove\(\)/);
});

test("Sağ alttaki canlı eşitleme göstergesi gerçek bulut durumunu hafif gözlemle izler",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  const css=read("src/ui/cloud-sync-indicator.css");
  const stability=read("src/ui/recent-feature-stability.css");
  const main=read("src/main.ts");
  assert.match(shell,/CLOUD_INDICATOR_ID="cloudSyncIndicator"/);
  assert.match(shell,/LAST_SYNC_KEY="yks_last_sync_at"/);
  assert.match(shell,/installCloudSyncIndicator/);
  assert.match(shell,/MutationObserver/);
  assert.match(shell,/observer\.observe\(box,\{attributes:true,attributeFilter:\["data-state"\]\}\)/);
  assert.doesNotMatch(shell,/subtree:true|childList:true|characterData:true/);
  assert.match(shell,/60_000/);
  assert.match(shell,/document\.hidden/);
  assert.match(shell,/Eşitlendi/);
  assert.match(shell,/Eşitleniyor…/);
  assert.match(shell,/Çevrimdışı/);
  assert.match(shell,/Eşitleme hatası/);
  assert.match(shell,/Bulut eşitleme kapalı/);
  assert.match(shell,/formatLastSync/);
  assert.match(shell,/if\(isNativeApp\(\)\)return false/);
  assert.match(css,/position:fixed/);
  assert.match(css,/right:/);
  assert.match(css,/bottom:/);
  assert.match(css,/data-state="synced"/);
  assert.match(css,/data-state="offline"/);
  assert.match(css,/data-state="error"/);
  assert.match(stability,/backdrop-filter:none!important/);
  assert.match(stability,/\.cloud-sync-indicator-dot[\s\S]*animation:none!important/);
  assert.match(main,/recent-feature-stability\.css/);
});

test("Bulut yardımcı katmanı hata verirse ana uygulama açılışı devam eder",()=>{
  const main=read("src/main.ts");
  assert.match(main,/installOptional\([\s\S]*"play-store-shell"[\s\S]*installPlayStoreShell/);
  assert.match(main,/v4OptionalErrors/);
});
