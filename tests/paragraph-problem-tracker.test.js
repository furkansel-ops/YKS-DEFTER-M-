const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const source=read("src/ui/paragraph-problem-tracker.ts");
const css=read("src/ui/paragraph-problem-tracker.css");

// Modül DOM olmadan çalıştırılır; S ve kaydetme sahte.
function load(S){
  const calls=[];
  const context={window:{S,save:()=>{calls.push("save");return true;},YKSAccountAuth:{publishShare:()=>{calls.push("share");return true;}}},globalThis:{},document:{},console,Date,Math,Number,String,Array,Object,JSON,Map,Set,Promise,Intl};
  context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(stripTypeScriptTypes(source,{mode:"strip"}).replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,"")+"\n;globalThis.__t={state,metrics,fmtPct,fmtNet,fmtPace,pace,weakTopics,currentStreak,PP_TOPICS,netOf,persist};",context);
  return {t:context.__t,calls};
}

test("Paragraf ve problem takipçisi günlük D/Y/B kaydı ve YKS net hesabını korur",()=>{
  assert.match(source,/kind:\s*Kind/);
  assert.match(source,/correct:number;wrong:number;blank:number/);
  assert.match(source,/e\.correct-e\.wrong\/4/);
  assert.match(source,/paragraphProblem/);
  assert.match(source,/win\.save\?\.\(\)/);
  assert.match(source,/YKSAccountAuth\?\.publishShare/);
  assert.match(source,/Son 7 gün/);
  assert.match(source,/Paragraf & Problem/);
});

test("Paragraf ve Problem gerçek ana ekran olarak Odak ile Daha arasına eklenir",()=>{
  const types=read("src/ui/types.ts");
  const navigation=read("src/ui/navigation.ts");
  const registry=read("src/ui/screens/registry.ts");
  assert.match(types,/"pomo","pp","more"/);
  assert.match(source,/SCREEN_ID="pp"/);
  assert.match(source,/className="screen pp-screen"/);
  assert.match(source,/tabbar\.insertBefore\(tab,moreTab\)/);
  assert.match(source,/data-s=\"pp\"|dataset\.s="pp"/);
  assert.match(source,/P &amp; P/);
  assert.match(navigation,/pp:"Paragraf & Problem"/);
  assert.match(registry,/paragraphProblemScreen/);
});

test("v75 ekran: Bugün kartı, tek ekranlık kayıt, gelişim, zorlanılan türler ve güne göre geçmiş",()=>{
  for(const token of ["data-pp-today","data-pp-step","data-pp-kind=\"paragraph\"","data-pp-kind=\"problem\"","data-pp-extra","data-pp-minutes","data-pp-topics","data-pp-growth-metric","data-pp-types","data-pp-kind-filter","data-pp-edit","data-pp-delete","data-pp-goal-form"])assert.ok(source.includes(token),token);
  assert.match(source,/<button type="button" data-m="q">Soru<\/button><button type="button" data-m="net">Net<\/button><button type="button" data-m="acc">Doğruluk<\/button>/);
  assert.doesNotMatch(source,/<select data-pp-kind>/,"tür açılır liste değil, iki düğme");
  assert.doesNotMatch(source,/data-pp-kpis|data-pp-kind-grid|data-pp-period|data-pp-daily/,"tekrar eden kutular kalktı");
  assert.match(read("src/ui/refined-secondary.ts"),/if\(!root\|\|root\.hasAttribute\("data-pp-v75"\)\)return;/,"eski açılır kutu kurulmaz");
  assert.match(css,/\.pp-bars\{display:grid;grid-template-columns:repeat\(14,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(pointer:coarse\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/#pp\{--pp-para:var\(--d-reading,#c2417a\);--pp-prob:var\(--d-accent,#2f6bea\)/);
});

test("v75 veri: eski kayıt aynen kalır; süre, tür ve hedef isteğe bağlı ve temizlenerek saklanır",()=>{
  const S={paragraphProblem:{entries:[
    {id:"a",date:"2026-10-30",kind:"paragraph",correct:"15",wrong:3,blank:1,createdAt:1},
    {id:"b",date:"2026-10-31",kind:"problem",correct:9,wrong:4,blank:2,createdAt:2,minutes:"18",topic:"Hareket"},
    {id:"c",date:"2026-10-31",kind:"problem",correct:5,wrong:0,blank:0,createdAt:3,minutes:0,topic:"Ana düşünce"},
    {id:"d",date:"2026-10-31",kind:"paragraph",correct:5,wrong:0,blank:0,createdAt:4,minutes:9999}
  ],goals:{paragraph:"20",problem:0}}};
  const {t}=load(S),tracker=t.state();
  const plain=JSON.parse(JSON.stringify(tracker));
  assert.deepEqual(plain.entries[0],{id:"a",date:"2026-10-30",kind:"paragraph",correct:15,wrong:3,blank:1,createdAt:1},"eski kayda alan eklenmez");
  assert.deepEqual({m:plain.entries[1].minutes,t:plain.entries[1].topic},{m:18,t:"Hareket"});
  assert.equal(plain.entries[2].minutes,undefined,"0 dakika saklanmaz");
  assert.equal(plain.entries[2].topic,undefined,"probleme paragraf türü verilemez");
  assert.equal(plain.entries[3].minutes,600,"en fazla 600 dakika");
  assert.deepEqual(plain.goals,{paragraph:20},"boş hedef saklanmaz");
  S.paragraphProblem.goals={paragraph:0,problem:""};t.state();
  assert.equal(S.paragraphProblem.goals,undefined);
  assert.match(source,/\.slice\(-2000\)/);
});

test("v75 ölçüler: Türkçe yüzde, soru başına süre ve en çok zorlanılan türler",()=>{
  const {t}=load({paragraphProblem:{entries:[]}});
  assert.equal(t.fmtPct(73.4),"%73");assert.equal(t.fmtPct(5.25,1),"%5,3");
  assert.equal(t.fmtNet(13.25),"13,25");assert.equal(t.fmtNet(13.5),"13,5");assert.equal(t.fmtNet(20),"20");
  assert.equal(t.fmtPace(72),"1 dk 12 sn");assert.equal(t.fmtPace(45),"45 sn");assert.equal(t.fmtPace(120),"2 dk");
  const entries=[
    {kind:"paragraph",correct:16,wrong:3,blank:1,minutes:24,topic:"Ana düşünce"},
    {kind:"paragraph",correct:10,wrong:0,blank:0},
    {kind:"problem",correct:4,wrong:5,blank:1,topic:"Hareket"},
    {kind:"problem",correct:9,wrong:1,blank:0,topic:"Yaş"},
    {kind:"problem",correct:2,wrong:1,blank:0,topic:"İşçi-Havuz"}
  ];
  assert.equal(t.pace(entries.filter(e=>e.kind==="paragraph")),72,"yalnız süresi girilmiş oturum sayılır");
  assert.equal(t.pace([{correct:5,wrong:0,blank:0}]),null);
  const weak=JSON.parse(JSON.stringify(t.weakTopics(entries)));
  assert.deepEqual(weak.map(x=>x.topic),["Hareket","Ana düşünce","Yaş"],"5 sorudan az tür listelenmez; en düşük doğruluk önce");
  assert.equal(weak[0].accuracy,40);
  assert.ok(t.PP_TOPICS.problem.includes("İşçi-Havuz")&&t.PP_TOPICS.paragraph.includes("Ana düşünce"));
});

test("v75 kayıt düzenleme aynı kaydın yerine yazar; hedef haftalık olarak 7 katı gösterilir",()=>{
  assert.match(source,/if\(editingId\)\{const i=tracker\.entries\.findIndex\(e=>e\.id===editingId\);if\(i<0\)\{note\.textContent="Düzenlenen kayıt bulunamadı\.";return;\}base\.createdAt=tracker\.entries\[i\]!\.createdAt;tracker\.entries\[i\]=base;\}/);
  assert.match(source,/goals\.paragraph\*7/);
  assert.match(source,/if\(typeof confirm==="function"&&!confirm\("Bu kayıt silinsin mi\?"\)\)return;/);
  assert.match(source,/date\.value>todayKey\(\)\|\|total<1/,"gelecek tarih ve boş kayıt engellenir");
});

test("v75 koça süre ve tür yalnız doluysa gider",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/createdAt:Math\.max\(0,finite\(x\?\.createdAt\)\),\.\.\.ppExtra\(x\)\}\)\)/);
  const fn=runtime.match(/function ppExtra\(x\)\{[^\n]+\}/)[0];
  const ppExtra=vm.runInNewContext(`const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;const text=(v,n)=>String(v??"").trim().slice(0,n);${fn};ppExtra`);
  assert.deepEqual(JSON.parse(JSON.stringify(ppExtra({minutes:24,topic:"Hareket"}))),{minutes:24,topic:"Hareket"});
  assert.deepEqual(JSON.parse(JSON.stringify(ppExtra({correct:4}))),{},"undefined alan yazılmaz");
  assert.deepEqual(JSON.parse(JSON.stringify(ppExtra({minutes:5000}))),{minutes:600});
});

test("P & P navigasyon doğrulanmadan önce kurulur ama hata verirse çekirdek açılışı durdurmaz",()=>{
  const main=read("src/main.ts");
  const trackerAt=main.indexOf("const paragraphProblem=installOptional(");
  const installAt=main.indexOf("()=>installParagraphProblemTracker()");
  const screensAt=main.indexOf("const screens=installScreenRuntime()");
  const bridgeAt=main.indexOf("const ui=installLegacyUiBridge(screens)");
  assert.ok(trackerAt>=0&&installAt>=0&&screensAt>=0&&bridgeAt>=0);
  assert.ok(trackerAt<installAt&&installAt<screensAt);
  assert.ok(screensAt<bridgeAt);
  assert.match(main,/function installOptional/);
  assert.match(main,/v4OptionalErrors/);
  assert.match(main,/paragraphProblemTracker/);
});
