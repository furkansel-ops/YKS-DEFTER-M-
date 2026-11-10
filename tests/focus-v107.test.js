const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/focus-v107.ts");
const css=read("src/ui/focus-v107.css");

// Saf yardımcılar DOM olmadan çalıştırılır (tipler ayıklanır, içe/dışa aktarma satırları atılır).
function load(){
  const code=stripTypeScriptTypes(source,{mode:"strip"}).replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,"");
  const context=vm.createContext({Date,Math,Number,String,Array,JSON});
  vm.runInContext(code+";globalThis.t={focusDuration,focusWhatText,focusTodaySummary,focusRecentSessions};",context);
  return context.t;
}

test("v107 ders satırı: seçim yoksa davet, konu yoksa uyarı, soru hedefi varsa eklenir",()=>{
  const t=load();
  assert.deepEqual({...t.focusWhatText("Genel Çalışma","Konu seç",0)},{title:"Genel çalışma",sub:"Ders ve konu seçmek için dokun"});
  assert.deepEqual({...t.focusWhatText("Matematik","Konu seç",30)},{title:"Matematik",sub:"Konu seçilmedi · 30 soru hedefi"});
  assert.deepEqual({...t.focusWhatText(" Matematik ","Türev",30)},{title:"Matematik · Türev",sub:"30 soru hedefi"});
  assert.deepEqual({...t.focusWhatText("Fizik","Optik",0)},{title:"Fizik · Optik",sub:"Değiştirmek için dokun"});
  assert.equal(t.focusWhatText("","",-5).title,"Genel çalışma");
});

test("v107 bugün özeti: hedef varsa süre / hedef, yoksa süre ve oturum sayısı",()=>{
  const t=load();
  assert.equal(t.focusDuration(0),"0 dk");assert.equal(t.focusDuration(60),"1 sa");assert.equal(t.focusDuration(80),"1 sa 20 dk");assert.equal(t.focusDuration("x"),"0 dk");
  assert.equal(t.focusTodaySummary(80,180,3),"1 sa 20 dk / 3 sa hedef");
  assert.equal(t.focusTodaySummary(0,0,0),"Henüz oturum yok");
  assert.equal(t.focusTodaySummary(10,0,0),"10 dk","yarıda kalan sayaç oturum saymaz");
  assert.equal(t.focusTodaySummary(80,0,3),"1 sa 20 dk · 3 oturum");
});

test("v107 son oturumlar: en yeni üstte, en çok üç satır; süresiz ve bozuk kayıt gösterilmez",()=>{
  const t=load(),at=(h,m)=>new Date(2026,10,10,h,m).getTime();
  const rows=t.focusRecentSessions([
    {t:at(15,5),m:25,subj:"Fizik",topic:"Elektrik"},{t:at(18,10),m:25.4,subj:"Matematik",topic:"Türev"},
    {t:at(16,40),m:30,subj:"Türkçe"},{t:at(9,0),m:20,subj:"Kimya"},{t:at(19,0),m:0,subj:"Boş"},null,{m:"x"}]);
  assert.deepEqual(Array.from(rows,r=>[r.time,r.subject,r.topic,r.minutes]),[["18:10","Matematik","Türev",25],["16:40","Türkçe","",30],["15:05","Fizik","Elektrik",25]]);
  assert.equal(t.focusRecentSessions([{m:15}])[0].time,"","saati olmayan kayıt da yazılır");
  assert.equal(t.focusRecentSessions([{m:15}])[0].subject,"Genel çalışma");
  assert.equal(t.focusRecentSessions(null).length,0);assert.equal(t.focusRecentSessions([{t:1,m:5},{t:2,m:5}],1).length,1);
});

test("v107 kurulum: v70'ten hemen sonra; sayaç ve kayıt mantığına dokunmaz, yalnız değişince yazar",()=>{
  const host=read("src/ui/focus-smart-picker-v58.ts");
  assert.match(host,/import \{installFocusV107\} from "\.\/focus-v107";/);
  assert.match(host,/installFocusRefineV70\(\);\n  installFocusV107\(\);/);
  assert.doesNotMatch(source,/cloneNode|\.innerHTML\s*=|insertAdjacentHTML/);
  assert.doesNotMatch(source,/S\.pomoMin|S\.sessions|save\(|setPhaseMin|togglePomo|skipPhase|setFocusMode/,"sayaç ve kayıt mantığına dokunulmaz");
  assert.match(source,/if\(root\.dataset\.v107==="ready"\)return true;/);
  assert.match(source,/function setText\(node:Element\|null\|undefined,text:string\):void\{if\(node&&node\.textContent!==text\)node\.textContent=text;\}/);
  assert.match(source,/const key=JSON\.stringify\(\[minutes,goal,count,rows\]\);if\(key===lastToday\)return;lastToday=key;/,"aynı içerik yeniden çizilmez");
  assert.doesNotMatch(source.slice(source.indexOf("const run=")),/run=\(\):boolean=>\{[^}]*paintToday/,"izleyici döngüsü çizim yapmaz");
  assert.match(source,/gear\.addEventListener\("click",\(\)=>openTool\("settings"\)\)/);
  assert.match(source,/more\.addEventListener\("click",\(\)=>openTool\("sessions"\)\)/);
  assert.match(source,/const open=setup\.classList\.toggle\("v107-open"\);button\.setAttribute\("aria-expanded",String\(open\)\)/);
  assert.match(read("src/ui/refined-secondary.ts"),/title\.textContent="Odak";/);
});

test("v107 görünüm: sayaç önce, gizlenen araçların açıcısı yoksa gizlenmez; renkler belirteçten, hareket yalnız girişte",()=>{
  assert.match(css,/@media\(max-width:979px\)\{\s*:root\[data-visual-system\] #mainWrap #pomo \.desktop-focus-workspace>\.desktop-focus-side\.v70-setup-side\{order:2\}/);
  assert.match(css,/#pomo\.v107-has-gear \.v70-tools\[data-v107="grid"\]>\.v70-tool\[data-tool="settings"\]:not\(\[open\]\),/);
  assert.match(css,/#pomo\.v107-has-today \.v70-tools\[data-v107="grid"\]>\.v70-tool\[data-tool="sessions"\]:not\(\[open\]\)\{display:none\}/);
  assert.match(css,/#pomo\.v107-has-what \.v29-session-setup\.v60-compact:not\(\.v107-open\)>:is\(\.v60-focus-toolbar,\.v60-more\)\{display:none\}/);
  assert.match(css,/#pomo\.v107-has-today #goalWrap\{display:none!important\}/,"hedef çubuğu iki yerde görünmez");
  assert.match(css,/\.focuscard \.rtrack\{stroke:var\(--d-track\)/,"halka rayı görünür");
  for(const tool of ["sessions","manual","breath","exam","history","settings","other"])assert.ok(css.includes(`[data-tool="${tool}"]{--v107-i:var(--i107-`),tool);
  assert.deepEqual(css.replace(/url\("data:[^"]*"\)/g,"").match(/#[0-9a-f]{3,8}\b/gi)||[],[],"ham renk yok");
  assert.doesNotMatch(css.replace(/url\("data:[^"]*"\)/g,""),/rgba?\(|hsl\(/);
  const at=css.indexOf("@media(prefers-reduced-motion:no-preference)");
  for(const part of css.slice(0,at).split("}"))assert.doesNotMatch(part,/[^-]animation:(?!none)/,"hareket izin bloğunun dışında: "+part.slice(0,60));
  assert.match(css.slice(at),/#pomo\[data-v107-enter\] /);assert.doesNotMatch(css.slice(at).replace(/#pomo\[data-v107-enter\]/g,""),/#pomo /,"hareketler yalnız girişte");
});
