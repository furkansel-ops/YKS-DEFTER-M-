const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("tek imza tema bootstrap sırasında kurulup graphite görünümü kilitler",()=>{
  const main=read("src/main.ts"),runtime=read("src/ui/single-theme-runtime.ts");
  assert.match(main,/installSingleThemeRuntime/);
  assert.match(main,/dataset\.signatureTheme=signatureTheme\.installed\?"ready":"deferred"/);
  assert.match(runtime,/SIGNATURE_THEME="graphite"/);
  assert.match(runtime,/SIGNATURE_THEME_COLOR="#121418"/);
  assert.match(runtime,/setAttribute\("data-theme",SIGNATURE_THEME\)/);
  assert.match(runtime,/style\.colorScheme="dark"/);
  assert.match(runtime,/dataset\.themeMode="single"/);
  assert.match(runtime,/dataset\.themeName="yks-defterim"/);
  assert.match(runtime,/dataset\.themeControl="single"/);
});

test("eski kayıtlı tema değeri güvenli şekilde tek temaya taşınır",()=>{
  const runtime=read("src/ui/single-theme-runtime.ts");
  assert.match(runtime,/state\.theme=SIGNATURE_THEME/);
  assert.match(runtime,/YKSLegacyState\?\.save\?\.\(\)/);
  assert.match(runtime,/win\.setTheme=\(\)=>apply\(\)/);
  assert.match(runtime,/win\.cycleTheme=\(\)=>apply\(\)/);
  assert.match(runtime,/MutationObserver/);
  assert.match(runtime,/attributeFilter:\["data-theme"\]/);
});

test("tek tema arayüzü eski tema seçicilerini ve tema metinlerini temizler",()=>{
  const runtime=read("src/ui/single-theme-runtime.ts"),personal=read("src/ui/personalization-v43.ts");
  assert.match(runtime,/getElementById\("themeBtn"\)\?\.remove\(\)/);
  assert.match(runtime,/getElementById\("themeGrid"\)/);
  assert.match(runtime,/querySelectorAll\("\.v43-theme-group"\)/);
  assert.match(runtime,/Hesap, hedefler, kişiselleştirme ve bildirimler/);
  assert.match(runtime,/YKS Defterim imza temasında sabittir/);
  assert.doesNotMatch(personal,/PRIMARY_THEMES|EXTRA_THEMES|makeThemeButton|Aktif tema/);
});

test("imza tema yüksek kontrastlı yüzey ve semantik renk tokenlarını tanımlar",()=>{
  const css=read("src/ui/single-theme-runtime.css");
  for(const token of ["--bg:#121418","--label:#F5F7FB","--accent:#69A9F5","--success:#5FC48E","--danger:#FF6B68","--card-2:rgba(36,40,47,.92)"]){
    assert.ok(css.includes(token),token);
  }
  assert.match(css,/:root\[data-theme-mode="single"\]/);
  assert.match(css,/#themeBtn/);
  assert.match(css,/#themeGrid/);
  assert.match(css,/\.v43-theme-group/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
