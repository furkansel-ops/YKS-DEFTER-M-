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

test("Sağ alttaki canlı eşitleme göstergesi gerçek bulut durumunu ve son eşitleme zamanını izler",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  const css=read("src/ui/cloud-sync-indicator.css");
  assert.match(shell,/CLOUD_INDICATOR_ID="cloudSyncIndicator"/);
  assert.match(shell,/LAST_SYNC_KEY="yks_last_sync_at"/);
  assert.match(shell,/installCloudSyncIndicator/);
  assert.match(shell,/MutationObserver/);
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
  assert.match(css,/prefers-reduced-motion/);
});
