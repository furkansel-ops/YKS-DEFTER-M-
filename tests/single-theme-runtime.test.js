const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

/* Uygulamanın tek teması Defter (notebook). Eski kayıtlardaki tema seçimleri
   (Mavi, Gece, Orman, Sistem…) açılışta Defter'e taşınır; başka veri değişmez. */
function harness(initial="refined-blue"){
  const app=read("app.js");
  const code=app.slice(app.indexOf("/* ================= GÖRÜNÜM / GERİ GELEN TEMALAR"),app.indexOf("/* ================= SES"));
  assert.ok(code.length>400);
  const header={},label={textContent:""};
  const doc={documentElement:{dataset:{},style:{}},querySelectorAll:()=>[]};
  let saveCount=0;
  const state={theme:initial,weeks:{a:{done:true}},denemeler:[{id:9}],fontScale:1.15};
  const ctx={S:state,window:{},document:doc,el:id=>id==="metaTheme"?{setAttribute:(_key,v)=>{header.content=v}}:
    id==="yksThemeActive"?label:null,
    save:()=>{saveCount++;return true;},
    setTimeout:()=>0,console};
  vm.createContext(ctx);
  vm.runInContext(code,ctx);
  return{state,doc,header,label,get saveCount(){return saveCount},run:source=>vm.runInContext(source,ctx)};
}

test("tek tema Defter: eski tercih ne olursa olsun Defter uygulanır, kayıtlar değişmez",()=>{
  for(const old of ["refined-blue","forest","night","auto","paper","unknown"]){
    const h=harness(old);
    const original=JSON.stringify({weeks:h.state.weeks,denemeler:h.state.denemeler,fontScale:h.state.fontScale});
    h.run("applyTheme()");
    assert.equal(h.state.theme,"notebook");
    assert.equal(h.doc.documentElement.dataset.theme,"notebook");
    assert.equal(h.doc.documentElement.dataset.visualSystem,"refined-blue");
    assert.equal(h.doc.documentElement.dataset.themeControl,"single");
    assert.equal(h.doc.documentElement.style.colorScheme,"light");
    assert.equal(h.header.content,"#f6f1e7");
    assert.equal(h.label.textContent,"Defter");
    assert.equal(h.saveCount,0,"açılışta ekstra kayıt/yazma yapılmaz");
    assert.equal(JSON.stringify({weeks:h.state.weeks,denemeler:h.state.denemeler,fontScale:h.state.fontScale}),original);
  }
});

test("eski setTheme çağrıları temayı değiştirmez ve kayıt yazmaz",()=>{
  const h=harness("notebook");
  assert.equal(h.run('setTheme("night")'),false);
  assert.equal(h.run('setTheme("notebook")'),true);
  assert.equal(h.run("cycleTheme()"),true);
  assert.equal(h.run("isDarkNow()"),false);
  assert.equal(h.state.theme,"notebook");
  assert.equal(h.doc.documentElement.dataset.theme,"notebook");
  assert.equal(h.saveCount,0);
});

test("normalize eski tüm tema değerlerini Defter'e taşır",()=>{
  const source=read("app.js");
  const normal=source.slice(source.indexOf("function normalize("),source.indexOf("/* ================= GÖRÜNÜM",source.indexOf("function normalize(")));
  assert.match(normal,/o\.theme="notebook";/);
  assert.match(source,/const YKS_THEME_IDS=\["notebook"\];/);
});

test("Görünüm alanında tema seçici yok; tek tema bilgisi ve yazı boyutları var",()=>{
  const html=read("index.html"),settings=read("public/settings-profile-runtime.js");
  const region=html.slice(html.indexOf('id="appearancePreferences"'),html.indexOf('id="appearancePreferences"')+3000);
  assert.match(region,/id="yksThemePicker"/);
  assert.match(region,/id="yksThemeActive">Defter</);
  assert.equal((region.match(/name="yksTheme"/g)||[]).length,0);
  for(const scale of ["0.9","1","1.15","1.3"])assert.ok(region.includes("setFontScale("+scale+")"));
  assert.match(settings,/data-yms-appearance-slot/);
  assert.match(settings,/title:"Görünüm"/);
  assert.doesNotMatch(settings,/applyThemeChoice|yks-theme-choice/);
});

test("tema CSS'inde yalnız Defter paleti kalır; açılış rengi Defter",()=>{
  const css=read("src/ui/theme-choices-v45.css")+read("src/ui/theme-contrast-v49.css")+read("src/ui/theme-contrast-v50.css");
  const main=read("src/main.ts"),personal=read("src/ui/personalization-v43.ts");
  assert.match(css,/:root\[data-theme="notebook"\]\{/);
  assert.doesNotMatch(css,/data-theme="(paper|night|forest|ocean|lavender|sunset|graphite)"/);
  assert.match(css,/#home #todayFreshStart/);
  assert.match(main,/import "\.\/ui\/theme-choices-v45\.css"/);
  assert.match(main,/dataset\.themeControl="single"/);
  assert.match(personal,/dataset\.themeControl="single"/);
  assert.match(personal,/document\.getElementById\("themeBtn"\)\?\.remove\(\)/);
  assert.match(read("src/ui/refined-blue.css"),/--yks-visual-ready:1/);
  assert.match(read("index.html"),/<html[^>]+data-visual-system="refined-blue"/);
  assert.match(read("index.html"),/id="metaTheme" content="#f6f1e7"/);
  assert.match(read("manifest.webmanifest"),/"theme_color": "#f6f1e7"/);
  assert.equal(fs.existsSync(path.join(root,"src/ui/single-theme-runtime.ts")),false);
});
