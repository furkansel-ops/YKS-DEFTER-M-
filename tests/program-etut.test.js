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
  "\n({taskMinutes,withTaskMinutes,withoutMinutes,normalizeEtutPlan,readEtutPlan,etutSchedule,etutSummary,etutSegments,ETUT_KEY})",{});
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
