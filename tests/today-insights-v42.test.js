const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v42 compact UI lives only in new Today and stays optional offline",()=>{
  const html=read("index.html"),app=read("app.js"),module=read("src/ui/today-insights-v42.ts");
  const top=read("src/ui/today-top-v33.ts"),vite=read("vite.config.mts");
  assert.match(top,/import\("\.\/today-insights-v42"\)/);
  assert.match(vite,/"src\/ui\/today-insights-v42\.ts"/);
  assert.match(app,/window\.yksTodayInsightsSnapshot=function\(\)/);
  assert.match(app,/window\.yksTodayInsightsCompleteReview=function\(key,gi\)/);
  assert.doesNotMatch(module,/localStorage|setDoc\(|updateDoc\(|save\(|fetch\(|S\.topics|innerHTML/);
  for(const id of ["todayFreshInsights","todayFreshDueList","todayFreshGapsList",
    "todayFreshDueCount","todayFreshGapCount","todayFreshInsightsAll"]){
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
  }
  const visible=html.slice(html.indexOf('id="todayFreshStart"'),html.indexOf('<!-- Bugün v33'));
  assert.ok(visible.indexOf('id="todayFreshSubjects"')<visible.indexOf('id="todayFreshInsights"'));
  assert.ok(visible.indexOf('id="todayFreshInsights"')<visible.indexOf('id="todayFreshActivity"'));
  const css=read("src/ui/today-detail-cards-v42.css");
  assert.match(read("src/main.ts"),/import "\.\/ui\/today-detail-cards-v42\.css"/);
  assert.match(css,/#home #todayFreshStart \.today-fresh-insights-grid/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/\.today-fresh-insights-grid\{grid-template-columns:minmax\(0,1fr\)/);
});

test("v42 evidence: pending repeats, recent wrongs, tracked stages, and no invented unknown weaknesses",()=>{
  const app=read("app.js");
  const start=app.indexOf("window.yksTodayInsightsSnapshot=function()");
  const end=app.indexOf("function v25FocusEvents()",start);
  assert.ok(start>0&&end>start);
  const script=app.slice(start,end);
  assert.doesNotMatch(script,/S\.[A-Za-z]+\s*=|setDoc\(|updateDoc\(|save\(|localStorage/);
  const subjects=[
    {exam:"TYT",name:"Matematik",topics:["Problemler","Üslü sayılar","Temel Kavramlar"]},
    {exam:"TYT",name:"Fizik",topics:["Hareket"]}
  ];
  const date="2026-10-14";
  const state={
    wrongLog:[
      {date:"2026-10-12",subject:"Matematik",topic:"Problemler",n:3},
      {date:"2026-10-10",subject:"Matematik",topic:"Problemler",n:2},
      {date:"2026-06-01",subject:"Matematik",topic:"Üslü sayılar",n:11},
      {date:"2026-10-15",subject:"Fizik",topic:"Hareket",n:7},
      {date:"2026-10-13",subject:"Başka ders",topic:"Uydurma",n:2}
    ],
    topics:{
      "TYT|Matematik|Üslü sayılar":{st:2,conf:4},
      "TYT|Fizik|Hareket":{st:3,conf:1}
    }
  };
  const before=JSON.stringify(state);
  let completed=0,details=0,route="";
  const due=[
    {key:"TYT|Matematik|Problemler",exam:"TYT",subj:"Matematik",topic:"Problemler",gap:3,gi:0,late:2},
    {key:"TYT|Fizik|Hareket",exam:"TYT",subj:"Fizik",topic:"Hareket",gap:7,gi:1,late:0}
  ];
  const win={};
  const env={window:win,S:state,ALL_SUBJECTS:subjects,Date,
    todayKey:()=>date,addDaysKey:(_,days)=>days===-90?"2026-07-16":date,
    v25UniqueReviews:()=>due,
    perfMemo:(_key,calculate)=>calculate(),
    reviewQueue:()=>due,
    v26ResolveKey:(subj,topic)=>{
      for(const s of subjects)if(s.name===subj&&s.topics.includes(topic))return s.exam+"|"+subj+"|"+topic;
      return null;
    },
    tkey:(exam,subj,topic)=>exam+"|"+subj+"|"+topic,
    ST_LABEL:["Başlanmadı","İşledim","Soru çözdüm","Pekiştirdim"],
    doReview:()=>{completed++;due.shift()},
    go:page=>route=page,
    openTopicDetail:()=>{details++},
    Number,Math,String,Object,Array,Map
  };
  vm.runInNewContext(script,env,{filename:"v42-bridge.js"});
  let snapshot=win.yksTodayInsightsSnapshot();
  assert.equal(snapshot.dueCount,2);
  assert.equal(snapshot.overdueCount,1);
  assert.equal(snapshot.gapCount,3);
  assert.equal(snapshot.gaps[0].topic,"Problemler");
  assert.equal(snapshot.gaps[0].wrong,5);
  assert.match(snapshot.gaps[0].reasons.join(" "),/Son 90 günde 5 kayıtlı yanlış/);
  assert.ok(snapshot.gaps.some(x=>x.topic==="Üslü sayılar"&&x.reasons.includes("Konu durumu: Soru çözdüm")));
  assert.ok(snapshot.gaps.some(x=>x.topic==="Hareket"&&x.reasons.some(y=>y.includes("Güven düzeyi düşük"))));
  assert.ok(!snapshot.gaps.some(x=>x.topic==="Temel Kavramlar"),"uncoded topic never invented as a deficit");
  assert.equal(win.yksTodayInsightsCompleteReview("fake",0),false);
  assert.equal(completed,0);
  assert.equal(win.yksTodayInsightsCompleteReview("TYT|Matematik|Problemler",0),true);
  assert.equal(completed,1);
  assert.equal(win.yksTodayInsightsSnapshot().dueCount,1);
  assert.equal(win.yksTodayInsightsOpenTopic("fake","Matematik","Problemler"),false);
  assert.equal(win.yksTodayInsightsOpenTopic("TYT","Matematik","Problemler"),true);
  assert.equal(route,"topics");
  assert.equal(details,1);
  assert.equal(JSON.stringify(state),before,"read-only bridge never mutates source state");
});

test("v42 shows real reasons, delegates completion and refreshes from data-change",()=>{
  class Fake{
    constructor(name="",value=""){this.name=name;this.className="";this.textContent=value;
      this.dataset={};this.children=[];this.listeners={};this.attributes={};}
    append(...items){this.children.push(...items)}
    replaceChildren(...items){this.children=[...items]}
    addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
    setAttribute(name,value){this.attributes[name]=String(value)}
    click(){for(const fn of this.listeners.click||[])fn()}
  }
  const ids=["todayFreshInsights","todayFreshDueList","todayFreshGapsList",
    "todayFreshDueCount","todayFreshGapCount","todayFreshInsightsAll"];
  const nodes=new Map(ids.map(id=>[id,new Fake(id)])),wListeners={},dListeners={};
  let completed=0,opened=0,navigated=0;
  const due={key:"TYT|Matematik|Problemler",exam:"TYT",subj:"Matematik",
    topic:"Problemler",gi:0,gap:3,late:1};
  const gap={key:"TYT|Matematik|Problemler",exam:"TYT",subj:"Matematik",
    topic:"Problemler",wrong:4,last:"2026-10-14",stage:2,confidence:0,
    reasons:["Son 90 günde 4 kayıtlı yanlış","Konu durumu: Soru çözdüm"]};
  let data={date:"2026-10-14",dueCount:1,overdueCount:1,due:[due],gapCount:1,gaps:[gap]};
  const window={
    yksTodayInsightsSnapshot:()=>data,
    yksTodayInsightsCompleteReview:()=>{completed++;data={...data,due:[],dueCount:0,overdueCount:0};return true},
    yksTodayInsightsOpenTopic:()=>{opened++;return true},
    go:()=>navigated++,
    addEventListener:(name,fn)=>(wListeners[name]??=[]).push(fn)
  };
  const document={
    getElementById:id=>nodes.get(id)||null,
    createElement:name=>new Fake(name),
    addEventListener:(name,fn)=>(dListeners[name]??=[]).push(fn),
    visibilityState:"visible"
  };
  const code=stripTypeScriptTypes(read("src/ui/today-insights-v42.ts"))
    .replace("export function installTodayInsightsV42","function installTodayInsightsV42");
  const ctx=vm.createContext({window,document,console,JSON});
  vm.runInContext(code+"\nthis.install=installTodayInsightsV42;",ctx);
  assert.equal(ctx.install().installed,true);
  assert.equal(nodes.get("todayFreshDueCount").textContent,"1 konu · 1 gecikmiş");
  assert.equal(nodes.get("todayFreshGapCount").textContent,"1 kayıtlı eksik");
  const dueRow=nodes.get("todayFreshDueList").children[0];
  const gapRow=nodes.get("todayFreshGapsList").children[0];
  assert.equal(gapRow.children[0].children[2].textContent,"Son 90 günde 4 kayıtlı yanlış · Konu durumu: Soru çözdüm");
  gapRow.children[1].children[0].click();
  assert.equal(opened,1);
  dueRow.children[1].children[0].click();
  assert.equal(completed,1);
  assert.equal(nodes.get("todayFreshDueCount").textContent,"Bekleyen tekrar yok");
  assert.match(nodes.get("todayFreshDueList").children[0].textContent,/bekleyen tekrar bulunmuyor/);
  nodes.get("todayFreshInsightsAll").click();
  assert.equal(navigated,1);
  wListeners["yks:data-changed"][0]();
  assert.equal(ctx.install().installed,true,"idempotent install");
  assert.equal(wListeners["yks:data-changed"].length,1);
});
