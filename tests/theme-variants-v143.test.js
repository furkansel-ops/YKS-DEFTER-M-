const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");

function run(theme){
  const app=read("app.js");
  const code=app.slice(app.indexOf("/* ================= GÖRÜNÜM / ÜÇ TEMA"),app.indexOf("/* ================= SES"));
  const doc={documentElement:{dataset:{themeVariant:"eski"},style:{}},querySelectorAll:()=>[]};
  const store={},header={};
  const ctx={S:{theme},document:doc,localStorage:{setItem:(k,v)=>{store[k]=v}},el:id=>id==="metaTheme"?{setAttribute:(_k,v)=>{header.content=v}}:null,save:()=>true,setTimeout:()=>0,console};
  vm.createContext(ctx);vm.runInContext(code+";applyTheme()",ctx);
  return{root:doc.documentElement,store,header,dark:vm.runInContext("isDarkNow()",ctx)};
}

test("v143 yeni temalar hazır bir temanın üstüne renk katmanı olarak açılır",()=>{
  for(const[id,base]of[["okyanus","glassy"],["orman","glassy"],["gunbatimi","glassy"],["geceyarisi","night"]]){
    const r=run(id);
    assert.equal(r.root.dataset.theme,base,id+" temel tema");
    assert.equal(r.root.dataset.themeVariant,id);
    assert.equal(r.root.style.colorScheme,base==="night"?"dark":"light");
    assert.equal(r.dark,base==="night");
    assert.ok(r.header.content,"durum çubuğu rengi var");
  }
  assert.equal(run("geceyarisi").store.yks_theme_hint_v1,"night","açılış ekranı koyu başlar");
  const glassy=run("refined-blue");
  assert.equal(glassy.root.dataset.theme,"glassy");
  assert.equal(glassy.root.dataset.themeVariant,undefined,"eski temalarda renk katmanı kalmaz");
});

test("v143 her yeni temanın renkleri ve seçici kartı var",()=>{
  const css=read("src/ui/theme-variants-v143.css"),html=read("index.html"),settings=read("public/settings-profile-runtime.js");
  for(const id of["okyanus","orman","gunbatimi","geceyarisi"]){
    assert.ok(css.includes(`[data-theme-variant="${id}"]{`),id+" renkleri");
    assert.ok(html.includes(`value="${id}" onchange="setTheme('${id}')"`),id+" kartı");
    assert.ok(settings.includes('"'+id+'"'),"ayarlar sayfası seçimi kabul eder");
  }
  assert.match(read("src/main.ts"),/import "\.\/ui\/theme-variants-v143\.css";/);
});
