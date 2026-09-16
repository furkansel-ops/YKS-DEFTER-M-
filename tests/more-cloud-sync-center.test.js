const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("bulut eşitleme sağ-alt sabit kutu yerine Daha uygulama alanına taşınır",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/function moreApplicationGrid\(\)/);
  assert.match(shell,/textContent\?\.trim\(\)===\"Uygulama\"/);
  assert.match(shell,/className=\"restcard yks-cloud-center\"/);
  assert.match(shell,/target\.insertAdjacentElement\(\"afterend\",box\)/);
  assert.doesNotMatch(shell,/document\.body\.append\(box\)/);
  assert.match(shell,/dataset\.cloudSyncPlacement=\"more\"/);
});

test("Daha içindeki eşitleme merkezi hesap bağlantı profil ve son eşitlemeyi birlikte gösterir",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/Hesap ve Bulut Senkronizasyonu/);
  assert.match(shell,/cloudAccountLabel/);
  assert.match(shell,/cloudAccountAvatar/);
  assert.match(shell,/cloudAccountHint/);
  assert.match(shell,/cloudConnectionLabel/);
  assert.match(shell,/cloudProfileLabel/);
  assert.match(shell,/cloudProfileHint/);
  assert.match(shell,/cloudSyncMeta/);
  assert.match(shell,/Son eşitleme durumu/);
  assert.match(shell,/Google ile giriş yap/);
  assert.match(shell,/yks:auth-state/);
  assert.match(shell,/profileDegraded/);
  assert.match(shell,/window\.addEventListener\(\"online\"/);
  assert.match(shell,/window\.addEventListener\(\"offline\"/);
});

test("eşitleme merkezi bağlantı ve hesap durumunu sadece sunum katmanında izler",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/box\.dataset\.online=online\?\"online\":\"offline\"/);
  assert.match(shell,/box\.dataset\.account=detail\.signedIn\?\"connected\":\"signedout\"/);
  assert.match(shell,/function accountInitial\(email\?:string\)/);
  assert.match(shell,/Bulut senkronu için giriş gerekli/);
  assert.match(shell,/Senkrona hazır/);
});

test("eşitleme merkezinin yeni görünümü eski fixed CSS kurallarını güvenli biçimde ezer",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/position:relative!important/);
  assert.match(shell,/right:auto!important/);
  assert.match(shell,/bottom:auto!important/);
  assert.match(shell,/z-index:auto!important/);
  assert.match(shell,/grid-template-columns:minmax\(0,1\.5fr\)/);
  assert.match(shell,/ycc-account-card/);
  assert.match(shell,/ycc-sync-panel/);
  assert.match(shell,/prefers-reduced-motion:reduce/);
});

test("Firebase runtime sözleşmesinin kritik cloudSync kimlikleri korunur",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  for(const id of ["cloudSyncBox","cloudSyncDot","cloudSyncText","cloudSyncMeta","cloudLoginBtn","cloudLogoutBtn"]){
    assert.match(shell,new RegExp(id));
  }
  assert.match(shell,/activateAccountAwareCloudSync/);
  assert.match(shell,/activateWebCloudSync/);
  assert.match(shell,/firebase-sync-runtime\.js/);
});

test("gizlilik açıklaması kullanıcıyı yeni Daha eşitleme merkezine yönlendirir",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/Daha &gt; Hesap ve Bulut Senkronizasyonu/);
  assert.doesNotMatch(shell,/sağ alttaki küçük durum kutusu/);
});
