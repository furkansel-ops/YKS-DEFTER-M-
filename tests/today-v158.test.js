const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const app=read("app.js"),v158=read("src/ui/today-v158.ts"),css=read("src/ui/today-v158.css");

// v25PlanToday'ı app.js'ten alıp sabit bir saatte çalıştırır.
function planAt(hour,labels,done={}){
  const start=app.indexOf("function v25PlanToday(){"),end=app.indexOf("\nfunction ",start+10);
  const fixed=class extends Date{constructor(...a){super(...(a.length?a:[2026,10,25,hour,0]));}};
  const week={r:[],s:labels.map((_,i)=>["","","T"+i]),dn:done,done:{}};
  const context={Date:fixed,S:{rowLabels:{r:[],s:labels}},dowOf:()=>2,keyOf:()=>"w",mondayOf:d=>d,getWeek:()=>week,String,Math};
  vm.createContext(context);vm.runInContext(app.slice(start,end)+"\n;globalThis.__p=v25PlanToday();",context);
  return context.__p;
}

test("v158 sıradaki görev saati geçenleri atlar; saat yoksa eski sıra",()=>{
  assert.equal(planAt(16,["09:00-10:00","14:00-15:00","20:00-21:00"]).next.txt,"T2","16:00'da sıradaki 20:00");
  assert.equal(planAt(14,["20:00-21:00","14:00-15:00"]).next.txt,"T1","saatli görevler başlangıca göre; süren görev sıradaki");
  assert.equal(planAt(23,["09:00-10:00","14:00-15:00"]).next.txt,"T0","hepsi geçtiyse ilk bitmemiş");
  assert.equal(planAt(16,["","",""]).next.txt,"T0","saat etiketi yoksa ilk bitmemiş");
  assert.equal(planAt(16,["09:00-10:00","20:00-21:00"],{"s-1-2":true}).next.txt,"T0","biten atlanır");
});

function helpers(){
  const strip=code=>stripTypeScriptTypes(code,{mode:"strip"}).replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,"");
  const context={};vm.createContext(context);
  vm.runInContext(strip(read("src/ui/refined-program-v103.ts"))+"\n"+strip(v158)+"\n;globalThis.__t={heroWhen,isLate,parseTimeRange};",context);
  return context.__t;
}

test("v158 sıradaki kartın üst satırı: saat ve ne kadar sonra / kaldı / saati geçti",()=>{
  const {heroWhen,parseTimeRange}=helpers(),range=parseTimeRange("20:00-21:00");
  assert.deepEqual({...heroWhen(range,19*60+40)},{lead:"Sıradaki",tail:"· 20:00 · 20 dk sonra"});
  assert.deepEqual({...heroWhen(range,20*60+30)},{lead:"Şimdi",tail:"· 30 dk kaldı"});
  assert.deepEqual({...heroWhen(range,21*60)},{lead:"Sıradaki",tail:"· 20:00 · saati geçti"});
  assert.deepEqual({...heroWhen(null,600)},{lead:"Sıradaki çalışma",tail:""});
});

test("v158 bağlantıları: satır saati listeye, kart ders rengine, yükleme zincirine",()=>{
  assert.match(app,/class="plancell \$\{isDone\?"pd":""\}" data-time="\$\{esc\(\(S\.rowLabels\[blk\]\|\|\[\]\)\[i\]\|\|""\)\}"/);
  const v38=read("src/ui/today-workspace-v38.ts");
  assert.match(v38,/const range=parseTimeRange\(row\.dataset\.time\|\|""\);if\(range\)task\.dataset\.time=range\.label;/);
  assert.match(v38,/small\.textContent=\(range\?clock\(range\.start\)\+" · ":""\)/);
  assert.match(read("src/ui/today-top-v33.ts"),/import\("\.\/today-v158"\)/);
  assert.match(v158,/if\(tone\)card\.dataset\.tone=tone;else delete card\.dataset\.tone;/);
  assert.match(css,/\.today-fresh-next\[data-tone\]\{\s*background:linear-gradient\(140deg,color-mix\(in srgb,var\(--tone\)/);
  assert.match(css,/#v71Rows:has\(details\[open\]\)\{flex-basis:100%\}/,"Gün sonu açılınca tam genişlik");
});
