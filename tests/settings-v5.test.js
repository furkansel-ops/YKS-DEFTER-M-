const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Ayarlar V5 mevcut modern Ayarlar kökünü yeniden düzenler",()=>{
  const source=read("src/ui/settings-v5.ts");
  const settings=read("public/settings-profile-runtime.js");
  assert.match(settings,/id="ymsProfile"|ymsProfile/);
  assert.match(settings,/id="ymsAppearance"|ymsAppearance/);
  assert.match(settings,/id="ymsPersonal"|ymsPersonal/);
  assert.match(settings,/id="ymsNotifications"|ymsNotifications/);
  assert.match(settings,/id="ymsApplication"|ymsApplication/);
  assert.match(source,/data-v5-settings-quick|v5SettingsQuick/);
  assert.match(source,/data-v5-settings-section|v5SettingsSection/);
  assert.match(source,/data-v5-theme-grid|v5ThemeGrid/);
});

test("Ayarlar V5 tema seçimini yalnız Ayarlar içinde tutar",()=>{
  const source=read("src/ui/settings-v5.ts");
  const main=read("src/main.ts");
  const html=read("index.html");
  assert.match(main,/themeControl="settings-only"/);
  assert.match(html,/id="themeGrid"/);
  assert.doesNotMatch(html,/id="themeBtn"/);
  assert.match(source,/themeBtn/);
  assert.match(source,/theme control escaped settings/);
  for(const id of ["thAuto","thPaper","thNight","thForest","thOcean","thLavender","thSunset","thGraphite"])assert.match(html,new RegExp('id="'+id+'"'));
});

test("Ayarlar V5 mevcut ayar verisini yazmaz veya senkron sözleşmesini değiştirmez",()=>{
  const source=read("src/ui/settings-v5.ts");
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\.open/);
  assert.doesNotMatch(source,/new\s+Dexie/);
  assert.doesNotMatch(source,/YKSLegacyState\?\.save|YKSLegacyState\.save/);
  assert.doesNotMatch(source,/\bsave\s*\(/);
  assert.doesNotMatch(source,/setDoc|updateDoc|coachingShares/);
  assert.doesNotMatch(source,/\.weeks\s*\[/);
});

test("Ayarlar V5 kişiselleştirme lazy sınırından yüklenir ve Merkez paneli açıldığında yeniden uygulanır",()=>{
  const source=read("src/ui/settings-v5.ts");
  const personal=read("src/ui/personalization-v43.ts");
  const css=read("src/ui/settings-v5.css");
  assert.match(personal,/import\("\.\/settings-v5"\)/);
  assert.match(personal,/installSettingsV5/);
  assert.match(personal,/\.catch\(\(\)=>\{\}\)/);
  assert.match(source,/yks:more-after/);
  assert.match(source,/detail\?\.to==="ayar"/);
  assert.match(source,/yks:auth-state/);
  assert.match(source,/yks:data-changed/);
  assert.match(css,/\.v5-settings-quick/);
  assert.match(css,/#themeGrid\[data-v5-theme-grid\]/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
