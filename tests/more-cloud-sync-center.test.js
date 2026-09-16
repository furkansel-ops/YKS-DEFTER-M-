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

test("Daha içindeki eşitleme merkezi hesap bağlantı ve profil durumunu birlikte gösterir",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/Hesap ve Bulut Senkronizasyonu/);
  assert.match(shell,/cloudAccountLabel/);
  assert.match(shell,/cloudConnectionLabel/);
  assert.match(shell,/cloudProfileLabel/);
  assert.match(shell,/cloudSyncMeta/);
  assert.match(shell,/Google ile giriş yap/);
  assert.match(shell,/yks:auth-state/);
  assert.match(shell,/profileDegraded/);
  assert.match(shell,/window\.addEventListener\(\"online\"/);
  assert.match(shell,/window\.addEventListener\(\"offline\"/);
});

test("eşitleme merkezinin yeni görünümü eski fixed CSS kurallarını güvenli biçimde ezer",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/position:relative!important/);
  assert.match(shell,/right:auto!important/);
  assert.match(shell,/bottom:auto!important/);
  assert.match(shell,/z-index:auto!important/);
  assert.match(shell,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test("gizlilik açıklaması kullanıcıyı yeni Daha eşitleme merkezine yönlendirir",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/Daha &gt; Hesap ve Bulut Senkronizasyonu/);
  assert.doesNotMatch(shell,/sağ alttaki küçük durum kutusu/);
});
