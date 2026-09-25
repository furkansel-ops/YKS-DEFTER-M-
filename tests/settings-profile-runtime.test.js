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

test("eski yardımcı ayarlar gizlenir, tema seçimi Görünüm kartında korunur",()=>{
  const src=read("public/settings-profile-runtime.js"),index=read("index.html"),videos=read("public/teacher-videos.js");
  for(const id of ["themeGrid","sozToggle","roleSeg","roleHint","simpleToggle","simpleHint","ytSrc"])assert.match(src,new RegExp(id));
  assert.doesNotMatch(src,/hideCardFor\("themeGrid"/);
  assert.match(src,/themeCard\.hidden=false/);
  assert.match(src,/dataset\.ymsHidden="true"/);
  assert.match(src,/video-settings-private/);
  assert.match(index,/id="ytSrc"/);
  assert.match(videos,/YouTube|youtube/);
  assert.doesNotMatch(src,/data-yms-coach/);
});

test("tema kontrolü yalnız Ayarlar ekranında tutulur",()=>{
  const src=read("public/settings-profile-runtime.js"),ui=read("src/ui/personalization-v43.ts"),main=read("src/main.ts"),index=read("index.html");
  assert.match(src,/getElementById\("themeBtn"\)\?\.remove\(\)/);
  assert.match(src,/dataset\.themeControl="settings-only"/);
  assert.match(ui,/dataset\.themeControl="settings-only"/);
  assert.match(main,/dataset\.themeControl="settings-only"/);
  assert.doesNotMatch(main,/installSingleThemeRuntime/);
  assert.doesNotMatch(index,/id="themeBtn"/);
  assert.match(index,/id="themeGrid"/);
});

test("2027 YKS tarihleri bilgi olarak sabittir",()=>{
  const src=read("public/settings-profile-runtime.js");
  assert.match(src,/19 Haziran 2027/);
  assert.match(src,/20 Haziran 2027/);
  assert.match(src,/10:15/);
  assert.match(src,/15:45/);
  assert.match(src,/Sınav tarihleri bilgi amaçlı sabittir/);
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

test("kişiselleştirme paneli yeni Ayarlar düzenine taşınır",()=>{
  const src=read("public/settings-profile-runtime.js"),ui=read("src/ui/personalization-v43.ts"),css=read("src/ui/personalization-v43.css");
  assert.match(src,/Kendine göre ayarla/);
  assert.match(ui,/Tema seçimini Ayarlar > Görünüm bölümünden/);
  assert.match(src,/Sınav kapsamını ve Bugün ekranındaki yardımcı alanları buradan düzenle/);
  assert.match(src,/data-yms-personal-slot/);
  assert.match(src,/host\.replaceChildren\(panel\)/);
  assert.match(src,/Ayarları sıfırla/);
  assert.match(src,/ymsPersonalization="polished"/);
  assert.match(css,/data-yms-personalization="polished"/);
  assert.doesNotMatch(css,/v43-theme-grid/);
});


test("ayarlar arayüzü kategori menüsü ve tek modern akış kullanır",()=>{
  const src=read("public/settings-profile-runtime.js");
  for(const label of ["Profil","Görünüm","Kişiselleştir","Bildirimler","Uygulama","Profil ve hedefler","Veri & yedek","Sistem durumu"]){
    assert.ok(src.includes(label),label);
  }
  for(const id of ["ymsProfile","ymsAppearance","ymsPersonal","ymsNotifications","ymsApplication"]){
    assert.match(src,new RegExp(id));
  }
  assert.match(src,/data-yms-jump/);
  assert.match(src,/scrollIntoView/);
  assert.match(src,/data-yms-theme-slot/);
  assert.match(src,/modern-app-tools/);
});

test("ayarlar gerçek uygulama hissi veren sade grup düzenini kullanır",()=>{
  const src=read("public/settings-profile-runtime.js");
  assert.match(src,/mobile-premium-settings-v1/);
  assert.match(src,/native-settings-v3/);
  assert.match(src,/--yms-group-radius:18px/);
  assert.match(src,/\.yms-action-grid\{grid-template-columns:1fr;gap:0\}/);
  assert.match(src,/yms-nav-dot/);
  assert.doesNotMatch(src,/yms-nav-ic">👤/);
  assert.match(src,/\.yms-hero\{padding:6px 2px 18px;border:0/);
  assert.match(src,/\.yms-action-tile::after\{content:"›"/);
  assert.match(src,/\.yms-dialog\{width:100%;max-width:680px/);
  assert.match(src,/\.yms-theme-host \.theme-card\{min-height:64px/);
});

test("modern Ayarlar kartları seçili temanın yüzey ve metin tokenlarını kullanır",()=>{
  const css=read("src/ui/personalization-v43.css"),runtime=read("public/settings-profile-runtime.js"),appCss=read("app.css");
  assert.match(runtime,/var\(--surface,#fff\)/);
  assert.match(css,/#mrp_ayar \.yms-wrap,\.yms-modal\{--surface:var\(--card,var\(--glass,#fff\)\)\}/);
  assert.match(css,/#mrp_ayar \.yms-wrap\{color:var\(--label,var\(--ink,#111827\)\)\}/);
  assert.match(css,/\.yms-status-pill\.ok\{color:var\(--green-ink,#087443\)\}/);
  assert.match(css,/\.yms-actions button\.danger\{color:var\(--danger,var\(--red,#b42318\)\)\}/);
  assert.match(appCss,/themes20260923-settings-refresh/);
  assert.match(appCss,/#mrp_ayar #themeGrid/);
});

test("uygulama kartı veri yedeği, sistem ve hakkında erişimini korur",()=>{
  const src=read("public/settings-profile-runtime.js");
  assert.match(src,/data-yms-data/);
  assert.match(src,/data-yms-system/);
  assert.match(src,/data-yms-about/);
});

test("modern ayarlar hesap runtime zincirinden cache busting ile yüklenir",()=>{
  const loader=read("src/ui/student-account-loader.ts");
  assert.match(loader,/SETTINGS_SCRIPT_ID="settingsProfileRuntime"/);
  assert.match(loader,/settings-profile-runtime\.js\?v=2\.6\.0/);
  assert.match(loader,/const settingsReady=loadModuleScript/);
  assert.match(loader,/return settingsReady/);
});
