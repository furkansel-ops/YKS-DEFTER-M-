const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("tema seçimi graphite kilidi olmadan kayıtlı seçimi korur",()=>{
  const main=read("src/main.ts"),index=read("index.html");
  assert.doesNotMatch(main,/installSingleThemeRuntime|data-theme","graphite"|themeMode="single"/);
  assert.match(main,/dataset\.themeControl="settings-only"/);
  assert.match(index,/\["auto","paper","night","forest","ocean","lavender","sunset","graphite"\]/);
});

test("tema değiştirme kontrolü yalnız Ayarlar görünüm kartında kalır",()=>{
  const index=read("index.html"),settings=read("public/settings-profile-runtime.js");
  assert.doesNotMatch(index,/id="themeBtn"/);
  assert.match(index,/id="themeGrid"/);
  for(const id of ["thAuto","thPaper","thNight","thForest","thOcean","thLavender","thSunset","thGraphite"])assert.match(index,new RegExp('id="'+id+'"'));
  assert.match(settings,/getElementById\("themeBtn"\)\?\.remove\(\)/);
  assert.match(settings,/themeCard\.hidden=false/);
  assert.doesNotMatch(settings,/hideCardFor\("themeGrid"/);
});

test("sekiz çalışma teması yenilenmiş renk tokenlarını taşır",()=>{
  const css=read("app.css");
  for(const theme of ["paper","night","forest","ocean","lavender","sunset","graphite"])assert.match(css,new RegExp('data-theme="'+theme+'"'));
  assert.match(css,/themes20260923-settings-refresh/);
  assert.match(css,/#mrp_ayar #themeGrid \.theme-card\.on::after/);
  assert.match(css,/@media\(min-width:900px\)/);
  assert.match(css,/@media\(max-width:520px\)/);
});
