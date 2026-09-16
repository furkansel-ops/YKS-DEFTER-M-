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

test("eski görünüm, cihaz rolü, basit görünüm ve video ayarları arayüzden gizlenir",()=>{
  const src=read("public/settings-profile-runtime.js"),index=read("index.html"),videos=read("public/teacher-videos.js");
  for(const id of ["themeGrid","sozToggle","roleSeg","roleHint","simpleToggle","simpleHint","ytSrc"])assert.match(src,new RegExp(id));
  assert.match(src,/dataset\.ymsHidden="true"/);
  assert.match(src,/video-settings-private/);
  assert.match(index,/id="ytSrc"/);
  assert.match(videos,/YouTube|youtube/);
  assert.doesNotMatch(src,/data-yms-coach/);
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

test("hesap güvenliği giriş ve çıkış sunar, koçluk düğmesi sunmaz",()=>{
  const src=read("public/settings-profile-runtime.js");
  assert.match(src,/data-yms-login/);
  assert.match(src,/data-yms-logout/);
  assert.match(src,/cloudLoginBtn/);
  assert.match(src,/cloudLogoutBtn/);
  assert.doesNotMatch(src,/data-yms-coach/);
  assert.doesNotMatch(src,/>Koçluk</);
});

test("bildirimler modern kartta mevcut güvenli bildirim fonksiyonlarını kullanır",()=>{
  const src=read("public/settings-profile-runtime.js");
  for(const key of ["pomo","review","evening"])assert.match(src,new RegExp(`notifButton\\(\\"${key}\\"`));
  assert.match(src,/window\.toggleNotif/);
  assert.match(src,/window\.askNotif/);
  assert.match(src,/window\.saveEveningAt/);
  assert.match(src,/window\.testNotif/);
  assert.match(src,/window\.notifDiag/);
  assert.match(src,/notifTime/);
});

test("kişiselleştirme paneli yeni ayarlar diliyle cilalanır",()=>{
  const src=read("public/settings-profile-runtime.js"),css=read("src/ui/personalization-v43.css");
  assert.match(src,/Uygulamayı çalışma düzenine göre ayarla/);
  assert.match(src,/Ayarları sıfırla/);
  assert.match(src,/ymsPersonalization="polished"/);
  assert.match(css,/data-yms-personalization="polished"/);
});

test("uygulama kartı veri yedeği, sistem ve hakkında erişimini korur",()=>{
  const src=read("public/settings-profile-runtime.js");
  assert.match(src,/data-yms-data/);
  assert.match(src,/data-yms-system/);
  assert.match(src,/data-yms-about/);
});

test("modern ayarlar hesap runtime zincirinden cache busting ile yüklenir",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  assert.match(loader,/SETTINGS_SCRIPT_ID="settingsProfileRuntime"/);
  assert.match(loader,/settings-profile-runtime\.js\?v=2\.0\.0/);
  assert.match(loader,/if\(!authReady\)return false/);
});
