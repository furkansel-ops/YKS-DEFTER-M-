const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

function bridge(state){
  const source=read("app.js");
  const start=source.indexOf("window.yksTodayInsightsSnapshot=function()");
  const end=source.indexOf("function v25FocusEvents()",start);
  assert.ok(start>=0&&end>start);
  const subs=[
    {exam:"TYT",name:"Matematik",topics:["Problemler","Üslü sayılar","Temel Kavramlar"]},
    {exam:"TYT",name:"Fizik",topics:["Hareket"]}
  ];
  const win={},date="2026-10-20";
  vm.runInNewContext(source.slice(start,end),{
    window:win,S:state,ALL_SUBJECTS:subs,Date,
    todayKey:()=>date,addDaysKey:()=> "2026-07-22",
    v25UniqueReviews:()=>[],
    perfMemo:(_,fn)=>fn(),
    reviewQueue:()=>[],
    v26ResolveKey:()=>null,
    tkey:(exam,subj,topic)=>exam+"|"+subj+"|"+topic,
    ST_LABEL:["Başlanmadı","İşledim","Soru çözdüm","Pekiştirdim"],
    doReview:()=>{},go:()=>{},openTopicDetail:()=>{}
  });
  return win.yksTodayInsightsSnapshot();
}
test("v47 yalnız kanıtlı tamamlanan 3 tekrar ve güvenle pekiştirildi der; yeni yanlış tekrar açar",()=>{
  const state={wrongLog:[
    {date:"2026-10-12",subject:"Matematik",topic:"Problemler",n:4},
    {date:"2026-10-19",subject:"Matematik",topic:"Üslü sayılar",n:2},
    {date:"2026-10-21",subject:"Fizik",topic:"Hareket",n:10},
    {date:"2026-05-01",subject:"Matematik",topic:"Temel Kavramlar",n:3},
    {date:"2026-10-17",subject:"Uydurma",topic:"Uydurma",n:2}
  ],topics:{
    "TYT|Matematik|Problemler":{st:3,conf:4,ts:"2026-10-13",rev:[0,1,2],
      revDone:{"0":"2026-10-14","1":"2026-10-16","2":"2026-10-19"}},
    "TYT|Matematik|Üslü sayılar":{st:3,conf:5,ts:"2026-10-10",rev:[0,1,2],
      revDone:{"0":"2026-10-11","1":"2026-10-13","2":"2026-10-17"}},
    "TYT|Fizik|Hareket":{st:2,conf:2,ts:null,rev:[]}
  }};
  const before=JSON.stringify(state),result=bridge(state),rows=result.tracker.rows;
  assert.equal(result.tracker.total,3);
  assert.equal(result.tracker.verified,1);
  assert.equal(result.tracker.open,1);
  assert.equal(result.tracker.working,1);
  assert.equal(rows.find(x=>x.topic==="Problemler").state,"verified");
  assert.equal(rows.find(x=>x.topic==="Problemler").reviews,3);
  assert.equal(rows.find(x=>x.topic==="Üslü sayılar").state,"recheck");
  assert.equal(rows.find(x=>x.topic==="Hareket").state,"working");
  assert.equal(result.gapCount,3,"older insights retain their own count");
  assert.equal(JSON.stringify(state),before,"read model never modifies student data");
});

test("v47 no invented completion from missing dates, stale logs, or same-day wrongs",()=>{
  const state={wrongLog:[{date:"2026-10-18",subject:"Matematik",topic:"Problemler",n:1}],
    topics:{"TYT|Matematik|Problemler":{st:3,conf:5,ts:"2026-10-15",
      rev:[0,1,2],revDone:{"0":"2026-10-16","1":"2026-10-18"}}}};
  let row=bridge(state).tracker.rows[0];
  assert.notEqual(row.state,"verified","missing review 3 date never counts as verified");
  state.topics["TYT|Matematik|Problemler"].revDone["2"]="2026-10-18";
  row=bridge(state).tracker.rows[0];
  assert.notEqual(row.state,"verified","same day as last wrong isn't proof of later revision");
  state.topics["TYT|Matematik|Problemler"].revDone["2"]="2026-10-22";
  row=bridge(state).tracker.rows[0];
  assert.notEqual(row.state,"verified","future review date ignored");
  const empty=bridge({wrongLog:[],topics:{}});
  assert.equal(empty.tracker.total,0);
  assert.equal(empty.tracker.rows.length,0);
});
test("v47 is lazily imported only with expanded insights and registered for offline use",()=>{
  const top=read("src/ui/today-top-v33.ts"),vite=read("vite.config.mts"),
    mod=read("src/ui/today-gap-tracker-v47.ts"),css=read("src/ui/today-gap-tracker-v47.css"),
    app=read("app.js");
  assert.match(top,/insightDisclosure\.addEventListener\("toggle",loadGapTracker\)/);
  assert.match(top,/import\("\.\/today-gap-tracker-v47"\)/);
  assert.match(vite,/"src\/ui\/today-gap-tracker-v47\.ts"/);
  assert.match(mod,/import "\.\/today-gap-tracker-v47\.css"/);
  assert.match(app,/closure:\{state:closingState/);
  assert.match(css,/#home #todayFreshStart \.today-gap-tracker/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.doesNotMatch(mod,/localStorage|firebase|setDoc\(|updateDoc\(|save\(|fetch\(|S\.topics|S\.wrongLog|setInterval/);
});

test("v47 compact card renders on expansion, navigates existing Konular, and updates on data changes",()=>{
  class Fake{
    constructor(tag="div"){
      this.tagName=tag.toUpperCase();this.className="";this.dataset={};
      this.textContent="";this.children=[];this.listeners={};this.attrs={};
      this.open=false;this.id="";this.inserts=[];
    }
    append(...items){this.children.push(...items)}
    replaceChildren(...items){this.children=[...items];this.writes=(this.writes||0)+1}
    setAttribute(key,value){this.attrs[key]=value}
    addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
    fire(name){for(const fn of this.listeners[name]||[])fn()}
    insertAdjacentElement(_where,node){this.inserts.push(node)}
    querySelector(name){return this.queries?.[name]||null}
  }
  const parent=new Fake("details"),area=new Fake(),grid=new Fake();
  parent.open=true;parent.queries={".today-fresh-insights-body":area};
  area.queries={".today-fresh-insights-grid":grid};
  let tracker=null,readCount=0,navigations=0;
  const nodes=new Map([["todayFreshInsights",parent]]);
  const document={
    visibilityState:"visible",
    getElementById:id=>id==="todayFreshGapTracker"?tracker:nodes.get(id)||null,
    createElement:tag=>new Fake(tag),
    addEventListener:()=>{}
  };
  const data={date:"2026-10-20",tracker:{
    total:1,open:1,working:0,verified:0,
    rows:[{key:"TYT|Matematik|Problemler",exam:"TYT",subj:"Matematik",topic:"Problemler",
      wrong:3,reasons:["3 yanlış"],state:"open",stage:1,confidence:1,reviews:0}] }};
  const window={yksTodayInsightsSnapshot:()=>{readCount++;return data},
    yksTodayInsightsOpenTopic:()=>{navigations++;return true},
    addEventListener:(name,fn)=>{window.events[name]=fn},
    events:{}};
  const code=stripTypeScriptTypes(read("src/ui/today-gap-tracker-v47.ts")
    .replace('import "./today-gap-tracker-v47.css";',""))
    .replace("export function installTodayGapTrackerV47","function installTodayGapTrackerV47");
  const ctx=vm.createContext({document,window,console,JSON});
  vm.runInContext(code+"\nthis.install=installTodayGapTrackerV47;",ctx);
  assert.equal(ctx.install().installed,true);
  assert.equal(grid.inserts.length,1);
  tracker=grid.inserts[0];
  assert.equal(tracker.id,"todayFreshGapTracker");
  assert.equal(tracker.open,false);
  assert.equal(readCount,1,"only lightweight headline is read when parent opens");
  const listing=tracker.children[1].children[1];
  assert.equal(listing.children.length,0);
  tracker.open=true;tracker.fire("toggle");
  assert.equal(listing.children.length,1);
  assert.equal(listing.children[0].dataset.status,"open");
  const button=listing.children[0].children[2];
  button.fire("click");
  assert.equal(navigations,1);
  const before=listing.writes;
  window.events["yks:data-changed"]();
  assert.equal(listing.writes,before,"same data doesn't redraw rows");
  data.tracker.rows[0].state="working";data.tracker.open=0;data.tracker.working=1;
  window.events["yks:data-changed"]();
  assert.equal(listing.children[0].dataset.status,"working");
  assert.equal(ctx.install().installed,true);
  assert.equal(grid.inserts.length,1,"no duplicate nested cards");
});
