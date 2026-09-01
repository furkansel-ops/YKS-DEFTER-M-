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

test("Web Firebase istemci yapılandırması Google girişinden önce geri yüklenir",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  const index=read("index.html");
  assert.match(index,/apiKey:\s*""/);
  assert.match(shell,/FIREBASE_WEB_API_KEY="AIza/);
  assert.match(shell,/runtimeSource=source\.textContent\.replace\(\/apiKey:/);
  assert.match(shell,/runtime\.textContent=runtimeSource/);
  assert.match(shell,/webCloudAuthConfig="ready"/);
  assert.match(shell,/if\(isNativeApp\(\)\)return false/);
});

test("Sağ alttaki canlı eşitleme göstergesi eski görünümü korurken Veri & Sistem içinde üst üste binmez",()=>{
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
  assert.match(css,/backdrop-filter:blur\(12px\)/);
  assert.match(css,/cloudSyncPulse/);
  assert.match(css,/data-state="synced"/);
  assert.match(css,/data-state="offline"/);
  assert.match(css,/data-state="error"/);
  assert.match(css,/html\[data-active-more-panel="veri"\] \.cloud-sync-indicator\{display:none!important\}/);
  assert.match(css,/\.web-cloud-sync-card\{position:relative;z-index:0\}/);
  assert.doesNotMatch(stability,/\.cloud-sync-indicator/);
  assert.match(main,/recent-feature-stability\.css/);
});

test("Bulut yardımcı katmanı hata verirse ana uygulama açılışı devam eder",()=>{
  const main=read("src/main.ts");
  assert.match(main,/installOptional\([\s\S]*"play-store-shell"[\s\S]*installPlayStoreShell/);
  assert.match(main,/v4OptionalErrors/);
});
