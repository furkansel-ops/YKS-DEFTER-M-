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
