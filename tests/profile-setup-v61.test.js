const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const setup=read("src/ui/profile-setup-v61.ts");

test("v61 profil kurulumu v45 profil chunk'ında fail-open kurulur, ana paketi büyütmez",()=>{
  const v45=read("src/ui/onboarding-profile-v45.ts");
  assert.match(v45,/void import\("\.\/profile-setup-v61"\)/);
  assert.match(v45,/\.catch\(error=>console\.error\("Profil kurulumu v61 başlatılamadı",error\)\)/);
  assert.doesNotMatch(v45,/^import .*profile-setup-v61/m);
  assert.doesNotMatch(read("src/main.ts"),/profile-setup-v61/);
});

test("v61 eski sihirbazla aynı profil alanlarını yazar ve wizardDone işaretler",()=>{
  for(const field of ["s.name=","s.puanTuru=","s.targetNetTYT=","s.targetNet=","s.targetNetAYT=","s.targetUniversity=","s.targetDepartment=","s.examDate=TYT_DATE","s.workdays=","s.wizardDone=true"])
    assert.ok(setup.includes(field),field);
  assert.match(setup,/TYT_DATE="2027-06-19"/);
});

test("v61 Atla eski Şimdilik geç gibi yalnız wizardDone yazar",()=>{
  const skip=setup.slice(setup.indexOf('hasAttribute("data-skip")'),setup.indexOf('hasAttribute("data-prev")'));
  assert.match(skip,/s\.wizardDone=true/);
  assert.doesNotMatch(skip,/s\.name=|s\.targetNet/);
});

test("v61 eski openWizard'ın yerine geçer ve karşılama ekranının altında kalır",()=>{
  assert.match(setup,/runtime\.openWizard=\(\)=>\{open\(\);/);
  assert.match(setup,/getElementById\("wizOverlay"\)/);
  // app.js eski fonksiyon referansını setTimeout'ta tutar; görünürlük gözlenerek devralınır.
  assert.match(setup,/new MutationObserver\(takeOver\)\.observe\(legacyOverlay,\{attributes:true,attributeFilter:\["style"\]\}\)/);
  assert.match(read("src/ui/profile-setup-v61.css"),/z-index:100400/);
  assert.match(read("src/ui/auth-welcome-v60.css"),/z-index:100500/);
});

test("v61 net sınırları TYT 120 ve AYT/YDT 80'dir",()=>{
  assert.match(setup,/const max=key==="tyt"\?120:80/);
  assert.match(setup,/tyt:clamp\(s\?\.targetNetTYT\?\?s\?\.targetNet,120,80\)/);
  assert.match(setup,/ayt:clamp\(s\?\.targetNetAYT,80,50\)/);
});
