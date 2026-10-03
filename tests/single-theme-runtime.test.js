const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const legacyThemes=["auto","paper","night","forest","ocean","lavender","sunset","graphite","light","dark"];

test("eski kayıt ve tema çağrıları sabit görünümü değiştiremez, çalışma kayıtları korunur",()=>{
  const app=read("app.js");
  const appearance=app.slice(app.indexOf("function isDarkNow()"),app.indexOf("/* ================= SES"));
  for(const theme of legacyThemes){
    const attributes={"data-theme":theme},meta={},state={theme,weeks:{"2026-09-28":{tasks:[{text:"Paragraf",done:true}]}},exams:[{id:"exam-1",wrong:2}],fontScale:1.15};
    const original=JSON.stringify({weeks:state.weeks,exams:state.exams,fontScale:state.fontScale});
    const element={dataset:{},style:{},removeAttribute:key=>delete attributes[key]};
    const context={S:state,document:{documentElement:element},el:id=>id==="metaTheme"?{setAttribute:(key,value)=>meta[key]=value}:null,setTimeout(){},save(){throw Error("Görünüm uygulaması veri kaydetmemeli")}};
    vm.runInNewContext(appearance+`;applyTheme();setTheme(${JSON.stringify(theme)});cycleTheme();`,context);
    assert.equal(state.theme,"refined-blue",theme);
    assert.equal(attributes["data-theme"],undefined,theme);
    assert.equal(element.dataset.visualSystem,"refined-blue",theme);
    assert.equal(element.style.colorScheme,"light",theme);
    assert.equal(meta.content,"#EFF2F8",theme);
    assert.equal(JSON.stringify({weeks:state.weeks,exams:state.exams,fontScale:state.fontScale}),original,theme);
    assert.equal(vm.runInNewContext("isDarkNow()",context),false);
  }
  assert.match(app,/o\.theme="refined-blue"/);
  assert.doesNotMatch(appearance,/matchMedia|prefers-color-scheme|THEME_NAMES|THEME_HINTS/);
});

test("ayarlar yazı boyutunu ve maskotları korur, eski palet seçimini kaldırır",()=>{
  const index=read("index.html"),settings=read("public/settings-profile-runtime.js");
  assert.doesNotMatch(index,/id="(?:themeBtn|themeGrid|thAuto|thPaper|thNight|thForest|thOcean|thLavender|thSunset|thGraphite)"|onclick="setTheme/);
  assert.match(index,/id="appearancePreferences"/);
  for(const scale of ["0.9","1","1.15","1.3"])assert.ok(index.includes(`setFontScale(${scale})`));
  assert.match(settings,/data-yms-appearance-slot/);
  assert.match(settings,/data-yms-mascot-choose/);
  assert.match(settings,/data-yms-mascot-toggle/);
  assert.doesNotMatch(settings,/s\.theme|themeGrid|theme-card/);
});

test("tek mavi palet cihaz temasından bağımsızdır ve eski tema çalışma zamanı yoktur",()=>{
  const css=read("app.css"),refined=read("src/ui/refined-blue.css"),index=read("index.html");
  assert.doesNotMatch(css,/data-theme=|theme-card|theme-grid|theme-swatch/);
  assert.doesNotMatch(refined,/data-theme=|prefers-color-scheme/);
  assert.match(refined,/--yks-visual-ready:1/);
  assert.match(refined,/--accent:#1268ed/);
  assert.match(index,/<html[^>]+data-visual-system="refined-blue"/);
  assert.doesNotMatch(index.match(/<html[^>]+>/)?.[0]||"",/data-theme(?:=|-)/);
  assert.equal(fs.existsSync(path.join(root,"src/ui/single-theme-runtime.ts")),false);
  assert.equal(fs.existsSync(path.join(root,"src/ui/single-theme-runtime.css")),false);
});
