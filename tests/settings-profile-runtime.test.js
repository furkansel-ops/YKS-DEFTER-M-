const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("ayarlar modern YKS profil bilgilerini gösterir",()=>{
  const src=read("public/settings-profile-runtime.js");
  for(const label of ["Kişisel bilgiler","YKS hedeflerim","Hesap & güvenlik","TYT hedef net","AYT hedef net","Hedef üniversite","Hedef bölüm","Alan / puan türü","OBP","Haftalık çalışma"]){
    assert.ok(src.includes(label),label);
  }
  assert.match(src,/targetNetTYT/);
  assert.match(src,/targetNetAYT/);
  assert.match(src,/targetUniversity/);
  assert.match(src,/targetDepartment/);
  assert.match(src,/puanTuru/);
});

test("eski sınav tarihi ve günlük soru hedefli ayar kartı gizlenir",()=>{
  const src=read("public/settings-profile-runtime.js");
  assert.match(src,/nameInput/);
  assert.match(src,/closest\("\.card"\)/);
  assert.match(src,/old\.style\.display="none"/);
  assert.doesNotMatch(src,/S\.target=/);
  assert.doesNotMatch(src,/examDateInput/);
});

test("2027 YKS tarihleri bilgi olarak sabittir",()=>{
  const src=read("public/settings-profile-runtime.js");
  assert.match(src,/19 Haziran 2027/);
  assert.match(src,/20 Haziran 2027/);
  assert.match(src,/10:15/);
  assert.match(src,/15:45/);
  assert.match(src,/Sınav tarihleri sabittir/);
});

test("profil düzenleme yeni onboarding alanlarını kaydeder ve eski net alanıyla uyumluluğu korur",()=>{
  const src=read("public/settings-profile-runtime.js");
  assert.match(src,/s\.name=/);
  assert.match(src,/s\.puanTuru=/);
  assert.match(src,/s\.targetNetTYT=/);
  assert.match(src,/s\.targetNetAYT=/);
  assert.match(src,/s\.targetUniversity=/);
  assert.match(src,/s\.targetDepartment=/);
  assert.match(src,/s\.targetNet=s\.targetNetTYT/);
  assert.match(src,/yks:data-changed/);
});

test("ayarlar koçluk, veri yedeği, sistem ve çıkış erişimini içerir",()=>{
  const src=read("public/settings-profile-runtime.js");
  assert.match(src,/data-yms-coach/);
  assert.match(src,/data-yms-data/);
  assert.match(src,/data-yms-system/);
  assert.match(src,/data-yms-about/);
  assert.match(src,/data-yms-logout/);
  assert.match(src,/cloudLogoutBtn/);
});

test("modern ayarlar hesap runtime zincirinden yüklenir",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  assert.match(loader,/SETTINGS_SCRIPT_ID="settingsProfileRuntime"/);
  assert.match(loader,/\.\/settings-profile-runtime\.js/);
  assert.match(loader,/if\(!authReady\)return false/);
});
