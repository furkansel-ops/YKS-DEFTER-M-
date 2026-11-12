const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/program-etut.ts");
const h=vm.runInNewContext(stripTypeScriptTypes(source.replace(/^export /gm,""),{mode:"strip"})+
  "\n({taskMinutes,withTaskMinutes,withoutMinutes,normalizeEtutPlan,readEtutPlan,etutSchedule,etutSummary,etutSegments,etutLongShift,etutLongLabel,ETUT_KEY})",{});
const clock=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
// Array.from: VM içindeki dizi başka bir ortamdan geldiği için deepEqual'da eşit sayılmaz.
const lines=out=>Array.from(out.items,x=>x.kind+" "+x.id+" "+clock(x.start)+"–"+clock(x.end));
const plain=value=>JSON.parse(JSON.stringify(value));

test("etüt: süre görev metnindeki ' · N dk' parçasından okunur",()=>{
  assert.equal(h.taskMinutes("Koç · TYT Matematik · Problemler · 120 dk"),120);
  assert.equal(h.taskMinutes("TYT Türkçe · Paragraf · 20 soru · 45 dk\n[Not] erken başla"),45);
  assert.equal(h.taskMinutes("▶ Fizik elektrik · 90 dk — https://youtu.be/x"),90);
  assert.equal(h.taskMinutes("Kimya · 40 soru"),0);
  assert.equal(h.taskMinutes("Paragraf\n[Not] 30 dk sonra · 30 dk"),0,"yalnız ilk satır");
  assert.equal(h.taskMinutes("Deneme · 0 dk"),0);
  assert.equal(h.taskMinutes("Deneme · 2000 dk"),0);
});

test("etüt: süre yazılır, değişir, silinir; not, materyal ve video bağlantısı korunur",()=>{
  assert.equal(h.withTaskMinutes("Kimya · 40 soru",60),"Kimya · 40 soru · 60 dk");
  assert.equal(h.withTaskMinutes("Koç · Matematik · 120 dk",90),"Koç · Matematik · 90 dk");
  assert.equal(h.withTaskMinutes("Matematik · 45 dk · 20 soru",0),"Matematik · 20 soru");
  assert.equal(h.withTaskMinutes("Paragraf\n[Not] dikkat\n[Materyal] https://a.b/c",30),"Paragraf · 30 dk\n[Not] dikkat\n[Materyal] https://a.b/c");
  assert.equal(h.withTaskMinutes("▶ Fizik elektrik — https://youtu.be/x",90),"▶ Fizik elektrik · 90 dk — https://youtu.be/x");
  assert.equal(h.taskMinutes(h.withTaskMinutes("▶ Fizik — https://youtu.be/x",75)),75);
  assert.equal(h.withoutMinutes("Paragraf · 20 soru · 120 dk"),"Paragraf · 20 soru");
  assert.equal(h.withoutMinutes("45 dk"),"","yalnız süre varsa başlık olmaz");
});

test("etüt: kayıtlı ayar doğrulanır; bozuk değerler atılır",()=>{
  assert.deepEqual(plain(h.normalizeEtutPlan({start:600,gap:15,mid:{"s-1-1":10,"x":5,"s-2-1":99},skip:["s-3-1","s-3-1","bad",7]})),{start:600,gap:15,mid:{"s-1-1":10},skip:["s-3-1"]});
  for(const bad of [null,"x",{start:-1,gap:10},{start:1440,gap:10},{start:600,gap:61},{start:600.5,gap:10}])assert.equal(h.normalizeEtutPlan(bad),null);
  const state={weeks:{"2026-11-09":{mv:{[h.ETUT_KEY(1)]:{start:540,gap:10}}}}};
  assert.deepEqual(plain(h.readEtutPlan(state,"2026-11-09",1)),{start:540,gap:10,mid:{},skip:[]},"eski kayıt (skip yok) okunur");
  assert.equal(h.readEtutPlan(state,"2026-11-09",2),null);
  assert.equal(h.readEtutPlan(null,"2026-11-09",1),null);
});

test("etüt: Program kaydı mevcut eylemlerle yapar; CSS hareketleri yalnız hareket tercihi açıkken",()=>{
  const program=read("src/ui/refined-program.ts"),sheet=read("src/ui/program-etut-sheet.ts"),css=read("src/ui/program-etut.css");
  assert.match(program,/controller\.updateTask\(task\.id,withTaskMinutes\(task\.text,value\),current\.week\)/,"süre görev metnine");
  assert.match(program,/controller\.reorder\(order\)/,"sıra gün sırasına");
  assert.match(program,/setEtut:\(week,day,plan\)=>call\("programSetEtut",week,day,plan\)/);
  assert.match(sheet,/import "\.\/program-etut\.css";/);
  // Etüt ayrı sekmede; Günlük Plan'a karışmaz.
  assert.match(program,/etutTab=button\("Etüt"\);tabs\.append\(daily,weekly,smart,etutTab\);/);
  assert.match(program,/etutPanel\.hidden=state\.view!=="etut";/);
  assert.match(program,/if\(state\.view==="etut"\)\{/);
  const daily=program.slice(program.indexOf("const timeline=timelineOrder("),program.indexOf('if(state.view==="etut"){'));
  assert.doesNotMatch(daily.slice(0,daily.indexOf("const weekTasks=")),/etut|Etüt/i,"günlük çizelgede etüt yok");
  assert.match(read("src/ui/refined-program-v103.css"),/\.rb-program-tabs:has\(button:nth-child\(4\)\[aria-pressed="true"\]\)::before\{transform:translateX\(300%\)\}/);
  assert.doesNotMatch(sheet+program,/setDoc\(|localStorage\.setItem\("etut/);
  assert.doesNotMatch(css,/:is\([^)]*::(before|after)/);
  assert.doesNotMatch(css,/#[0-9a-fA-F]{3,8}\b|rgba?\(/,"yalnız tema değişkenleri");
  const at=css.indexOf("@media(prefers-reduced-motion:no-preference)");
  assert.ok(at>0);assert.doesNotMatch(css.slice(0,at),/animation:/);
  assert.match(css,/#program \.rb-etut :where\(button,input\)\{font:inherit\}/,"uygulama yazı tipi");
});

test("etüt: boş etütte yalnız \"Ders\" yazar, ders seçilmez; etüt Odak'a işlenmez",()=>{
  const program=read("src/ui/refined-program.ts"),sheet=read("src/ui/program-etut-sheet.ts"),app=read("app.js");
  assert.match(sheet,/export const ETUT_FREE_TITLE="Ders";/);
  assert.doesNotMatch(sheet,/Hangi dersi çalıştın|Ders seç"|Ders seçilmedi|subjects\.names/,"ders seçimi yok");
  assert.doesNotMatch(sheet+program,/Odak'a işle|logEtut|etutLog|programEtutSubjects/,"Odak bağlantısı yok");
  assert.doesNotMatch(app,/function programEtutLog\(|function programEtutSubjects\(|Etütten işlendi/,"Odak'a yazan kod kaldırıldı");
  // Boş etüt kartında tik kutusu yok; görevli etütte tik yalnız görevi tamamlar.
  const timeline=sheet.slice(sheet.indexOf("export function renderEtutTimeline("),sheet.indexOf("export function createEtutSheet("));
  const freeBranch=timeline.slice(timeline.indexOf("if(!task){"),timeline.indexOf("continue;\n    }")+1);
  assert.ok(freeBranch.length>20);assert.doesNotMatch(freeBranch,/rb-program-check/);
  assert.match(program,/toggle:id=>\{controller\.toggleTask\(id\);refresh\(\);\}/);
});

test("etüt: dersler sırayla dizilir, aralara mola, uzun etüde ara mola; süresiz görev atlanır",()=>{
  const tasks=[{id:"s-0-1",minutes:120},{id:"s-1-1",minutes:120},{id:"s-4-1",minutes:0},{id:"s-2-1",minutes:120},{id:"s-3-1",minutes:120}];
  const plan={start:600,gap:15,mid:{"s-1-1":10}};
  const out=h.etutSchedule(tasks,plan);
  assert.deepEqual(plain([...out.slots.entries()].map(([id,s])=>[id,s.label,s.mid])),[
    ["s-0-1","10:00–12:00",0],["s-1-1","12:15–14:25",10],["s-2-1","14:40–16:40",0],["s-3-1","16:55–18:55",0]]);
  assert.equal(out.slots.get("s-1-1").midAt,13*60+15,"ara mola etüdün ortasında");
  assert.deepEqual(plain([...out.breaks.entries()]),[["s-0-1",15],["s-1-1",15],["s-2-1",15]],"son etütten sonra mola yok");
  assert.equal(out.slots.has("s-4-1"),false);
  assert.equal(h.etutSummary(out),"10:00 → 18:55 · 8 sa ders · 4 mola");
  const short=h.etutSchedule([{id:"s-0-1",minutes:45}],{start:600,gap:10,mid:{"s-0-1":10}});
  assert.equal(short.slots.get("s-0-1").mid,0,"kısa etütte ara mola yok");
  assert.equal(h.etutSummary(short),"10:00 → 10:45 · 45 dk ders · mola yok");
  assert.equal(h.etutSummary(h.etutSchedule([],plan)),"");
});

test("etüt: bugün katılmayan görev atlanır, sonrakiler kayar; şerit ders/mola parçalarını sırayla verir",()=>{
  const tasks=[{id:"s-0-1",minutes:120},{id:"s-1-1",minutes:120},{id:"s-2-1",minutes:60}];
  const out=h.etutSchedule(tasks,{start:600,gap:15,mid:{"s-1-1":10},skip:["s-0-1"]});
  assert.equal(out.slots.has("s-0-1"),false);
  assert.equal(out.slots.get("s-1-1").label,"10:00–12:10");
  assert.equal(out.slots.get("s-2-1").label,"12:25–13:25");
  assert.deepEqual(plain(h.etutSegments(out)),[
    {kind:"task",minutes:60,id:"s-1-1"},{kind:"rest",minutes:10,id:"s-1-1"},{kind:"task",minutes:60,id:"s-1-1"},
    {kind:"rest",minutes:15,id:"s-1-1"},{kind:"task",minutes:60,id:"s-2-1"}]);
  const total=h.etutSegments(out).reduce((sum,part)=>sum+part.minutes,0);
  assert.equal(total,out.end-out.start,"şerit toplamı günün süresi");
});

test("etüt v110: bitiş seçilince kalan süre boş etütlerle dolar, uzun mola ortaya en yakın araya girer",()=>{
  const tasks=[{id:"s-0-1",minutes:120},{id:"s-1-1",minutes:90}];
  const out=h.etutSchedule(tasks,{start:600,gap:15,mid:{},skip:[],end:1200,block:60,long:60});
  assert.deepEqual(lines(out),[
    "task s-0-1 10:00–12:00","gap s-0-1 12:00–12:15","task s-1-1 12:15–13:45","gap s-1-1 13:45–14:00",
    "free f1 14:00–15:00","long f1 15:00–16:00","free f2 16:00–17:00","gap f2 17:00–17:15",
    "free f3 17:15–18:15","gap f3 18:15–18:30","free f4 18:30–20:00"]);
  assert.equal(out.end,1200,"son etüt bitiş saatine denk gelir");
  assert.equal(h.etutSummary(out),"10:00 → 20:00 · 8 sa ders · 5 mola");
  assert.equal(h.etutSegments(out).reduce((sum,part)=>sum+part.minutes,0),600,"şerit toplamı başlangıç–bitiş");
  assert.deepEqual(plain(h.etutSegments(out).filter(part=>part.kind==="long"||part.kind==="free").slice(0,2)),[{kind:"free",minutes:60,id:"f1"},{kind:"long",minutes:60,id:"f1"}]);
  // Uzun mola bir önceki / sonraki araya kaydırılır; hedef saat kayıtta longAt olarak durur.
  const shift=h.etutLongShift(out,15);
  assert.deepEqual(plain(shift),{earlier:13*60+45,later:16*60+15});
  const earlier=h.etutSchedule(tasks,{start:600,gap:15,mid:{},skip:[],end:1200,block:60,long:60,longAt:shift.earlier});
  assert.deepEqual(plain(earlier.long),{kind:"long",id:"s-1-1",start:13*60+45,end:14*60+45});
  assert.equal(earlier.end,1200);
  assert.equal(h.etutLongShift(h.etutSchedule(tasks,{start:600,gap:15,mid:{},skip:[]}),15).earlier,null,"uzun mola yoksa kayma yok");
});

test("etüt v110: ders bağlamadan da oluşur; kısa aralıkta uzun mola girmez; dersler bitişi aşarsa silinmez",()=>{
  const empty=h.etutSchedule([],{start:600,gap:10,mid:{},skip:[],end:840,block:40});
  assert.deepEqual(lines(empty),["free f1 10:00–10:40","gap f1 10:40–10:50","free f2 10:50–11:30","gap f2 11:30–11:40","free f3 11:40–12:20","gap f3 12:20–12:30","free f4 12:30–13:10","gap f4 13:10–13:20","free f5 13:20–14:00"]);
  assert.equal(empty.study,200);
  const tiny=h.etutSchedule([],{start:600,gap:15,mid:{},skip:[],end:640,block:60,long:60});
  assert.deepEqual(lines(tiny),["free f1 10:00–10:40"]);assert.equal(tiny.long,null);
  assert.equal(h.etutSchedule([],{start:600,gap:15,mid:{},skip:[],end:610,block:60}).slots.size,0,"20 dk'dan kısa aralıkta etüt açılmaz");
  const over=h.etutSchedule([{id:"s-0-1",minutes:120},{id:"s-1-1",minutes:90}],{start:600,gap:15,mid:{},skip:[],end:780,block:60});
  assert.deepEqual(lines(over),["task s-0-1 10:00–12:00","gap s-0-1 12:00–12:15","task s-1-1 12:15–13:45"]);
  assert.equal(over.end,13*60+45,"bitişi aşan ders yerinde kalır");
  // Ara mola (dersin ortasında) yeni planda da çalışır.
  const mid=h.etutSchedule([{id:"s-0-1",minutes:120}],{start:600,gap:15,mid:{"s-0-1":10},skip:[],end:780,block:60});
  assert.deepEqual(lines(mid),["task s-0-1 10:00–12:10","gap s-0-1 12:10–12:25","free f1 12:25–13:00"]);
  assert.equal(h.etutLongLabel(60),"1 sa");assert.equal(h.etutLongLabel(90),"1,5 sa");assert.equal(h.etutLongLabel(120),"2 sa");
});

test("etüt v110: yeni alanlar doğrulanır; bozuk olanlar atılır, eski kayıt bozulmaz",()=>{
  // Boş etüde ders (free) ve Odak izi (log) artık yok: eski kayıtta kalsalar da okunmaz.
  const full=h.normalizeEtutPlan({start:600,gap:15,mid:{},skip:[],end:1200,block:50,long:90,longAt:810,
    free:{f1:"Matematik"},log:{"s-0-1":{m:120,subj:"Türkçe",t:1700000000000}}});
  assert.deepEqual(plain(full),{start:600,gap:15,mid:{},skip:[],end:1200,block:50,long:90,longAt:810});
  assert.deepEqual(plain(h.normalizeEtutPlan({start:600,gap:15,end:500,block:5,long:999,longAt:null,free:[],log:"x"})),{start:600,gap:15,mid:{},skip:[]},"geçersiz ek alanlar yok sayılır");
  assert.deepEqual(plain(h.normalizeEtutPlan({start:600,gap:15,end:"1200",longAt:"810"})),{start:600,gap:15,mid:{},skip:[]},"metin sayı kabul edilmez");
});
