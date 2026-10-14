const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const themes=["auto","refined-blue","paper","night","forest","ocean","lavender","sunset","graphite"];

function harness(initial="refined-blue",dark=false){
  const app=read("app.js");
  const code=app.slice(app.indexOf("/* ================= GÖRÜNÜM / GERİ GELEN TEMALAR"),app.indexOf("/* ================= SES"));
  assert.ok(code.length>1300);
  const radios=themes.map(value=>({
    value,checked:false,
    closest:()=>({classList:{toggle(){} }})
  }));
  const header={},label={textContent:""},listeners={};
  const doc={documentElement:{dataset:{},style:{}},
    querySelectorAll:sel=>sel==='input[name="yksTheme"]'?radios:[]};
  let systemDark=dark,saveCount=0;
  const w={matchMedia:()=>({get matches(){return systemDark;},addEventListener:(name,fn)=>listeners[name]=fn})};
  const state={theme:initial,weeks:{a:{done:true}},denemeler:[{id:9}],fontScale:1.15};
  const ctx={S:state,window:w,document:doc,el:id=>id==="metaTheme"?{setAttribute:(_key,v)=>{header.content=v}}:
    id==="yksThemeActive"?label:null,
    save:()=>{saveCount++;return true;},
    setTimeout:()=>0,console};
  vm.createContext(ctx);
  vm.runInContext(code,ctx);
  return{ctx,state,doc,header,label,radios,listeners,setSystemDark:v=>{systemDark=v},
    get saveCount(){return saveCount},
    run:source=>vm.runInContext(source,ctx)};
}

test("temalar geri geldi; kayıtlar değişmeden açılışta tercih korunur",()=>{
  const h=harness("forest");
  const original=JSON.stringify({weeks:h.state.weeks,denemeler:h.state.denemeler,fontScale:h.state.fontScale});
  h.run("applyTheme()");
  assert.equal(h.state.theme,"forest");
  assert.equal(h.doc.documentElement.dataset.theme,"forest");
  assert.equal(h.doc.documentElement.dataset.visualSystem,"refined-blue");
  assert.equal(h.doc.documentElement.dataset.themeControl,"multiple");
  assert.equal(h.doc.documentElement.style.colorScheme,"light");
  assert.equal(h.header.content,"#edf6f0");
  assert.equal(h.radios.find(x=>x.value==="forest").checked,true);
  assert.equal(h.label.textContent,"Orman");
  assert.equal(h.saveCount,0,"açılışta ekstra kayıt/yazma yapılmaz");
  assert.equal(JSON.stringify({weeks:h.state.weeks,denemeler:h.state.denemeler,fontScale:h.state.fontScale}),original);
  h.run('setTheme("night")');
  assert.equal(h.saveCount,1,"yalnız açıkça tema değiştirildiğinde mevcut save çağrılır");
  assert.equal(h.state.theme,"night");
  assert.equal(h.doc.documentElement.dataset.theme,"night");
  assert.equal(h.doc.documentElement.style.colorScheme,"dark");
  assert.equal(h.radios.find(x=>x.value==="night").checked,true);
  assert.equal(h.run("isDarkNow()"),true);
  assert.equal(h.run('setTheme("unknown")'),false);
  assert.equal(h.state.theme,"night");
  h.run('setTheme("night")');
  assert.equal(h.saveCount,1,"aynı palete yeniden dokununca tekrar yazma yok");
  assert.equal(JSON.stringify({weeks:h.state.weeks,denemeler:h.state.denemeler,fontScale:h.state.fontScale}),original);
});

test("Sistem teması cihazın açık/koyu değişimini izler; tercih değişmez",()=>{
  const h=harness("auto",false);
  h.run("applyTheme()");
  assert.equal(h.doc.documentElement.dataset.theme,"paper");
  assert.equal(h.state.theme,"auto");
  assert.equal(h.radios.find(x=>x.value==="auto").checked,true);
  assert.equal(h.saveCount,0);
  h.setSystemDark(true);h.listeners.change();
  assert.equal(h.doc.documentElement.dataset.theme,"night");
  assert.equal(h.doc.documentElement.style.colorScheme,"dark");
  assert.equal(h.header.content,"#101827");
  assert.equal(h.state.theme,"auto");
  assert.equal(h.saveCount,0);
});

test("eski açık/koyu tanımları saklanır, bilinmeyenler maviye döner",()=>{
  const source=read("app.js");
  const normal=source.slice(source.indexOf("function normalize("),source.indexOf("/* ================= GÖRÜNÜM",source.indexOf("function normalize(")));
  assert.match(normal,/if\(o\.theme==="light"\)o\.theme="paper"/);
  assert.match(normal,/if\(o\.theme==="dark"\)o\.theme="night"/);
  assert.match(normal,/if\(!\["auto","refined-blue","paper","night","forest","ocean","lavender","sunset","graphite"\]\.includes\(o\.theme\)\)/);
  assert.doesNotMatch(normal,/o\.theme="refined-blue";\s*if\(\["none"/);
});

test("Görünüm alanında erişilebilir dokuz radyo kartı ve yazı boyutları birlikte çalışır",()=>{
  const html=read("index.html"),settings=read("public/settings-profile-runtime.js");
  const region=html.slice(html.indexOf('id="appearancePreferences"'),html.indexOf('id="appearancePreferences"')+6800);
  assert.match(region,/id="yksThemePicker"/);
  assert.match(region,/id="yksThemeActive"/);
  for(const name of themes){
    assert.match(region,new RegExp('type="radio" name="yksTheme" value="'+name+'"'));
    assert.match(region,new RegExp("setTheme\\('"+name+"'\\)"));
  }
  assert.equal((region.match(/name="yksTheme"/g)||[]).length,9);
  for(const scale of ["0.9","1","1.15","1.3"])assert.ok(region.includes("setFontScale("+scale+")"));
  assert.match(settings,/data-yms-appearance-slot/);
  assert.match(settings,/title:"Görünüm"/);
});

test("tema CSS yeni mobil tasarımı koruyarak hem koyu hem açık paletleri uygular",()=>{
  const css=read("src/ui/theme-choices-v45.css");
  const main=read("src/main.ts"),personal=read("src/ui/personalization-v43.ts");
  for(const id of themes.slice(2)){
    assert.match(css,new RegExp(':root\\[data-theme="'+id+'"\\]'));
  }
  assert.match(css,/color-scheme:dark/);
  assert.match(css,/#home #todayFreshStart/);
  assert.match(css,/#appearancePreferences \.yks-theme-grid/);
  assert.match(css,/@media\(max-width:430px\)/);
  assert.match(main,/import "\.\/ui\/theme-choices-v45\.css"/);
  assert.match(main,/dataset\.themeControl="multiple"/);
  assert.match(personal,/dataset\.themeControl="multiple"/);
  assert.match(personal,/document\.getElementById\("themeBtn"\)\?\.remove\(\)/);
  assert.match(read("src/ui/refined-blue.css"),/--yks-visual-ready:1/);
  assert.match(read("index.html"),/<html[^>]+data-visual-system="refined-blue"/);
  assert.equal(fs.existsSync(path.join(root,"src/ui/single-theme-runtime.ts")),false);
});
