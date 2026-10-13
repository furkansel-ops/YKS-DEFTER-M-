const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const dateKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const addDays=(key,i)=>{const d=new Date(key+"T12:00:00");d.setDate(d.getDate()+i);return dateKey(d)};
const mondayOf=d=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-(x.getDay()+6)%7);return x};

test("v40 exists only on clean home, is optional and cached for offline boot",()=>{
  const html=read("index.html"),src=read("src/ui/today-activity-v40.ts");
  const top=read("src/ui/today-top-v33.ts"),vite=read("vite.config.mts"),app=read("app.js");
  assert.match(top,/import\("\.\/today-activity-v40"\)/);
  assert.match(vite,/"src\/ui\/today-activity-v40\.ts"/);
  assert.match(app,/window\.yksTodayActivitySnapshot=function\(\)/);
  assert.doesNotMatch(src,/localStorage|setDoc\(|updateDoc\(|save\(|fetch\(|S\.pomoMin|S\.sessions|innerHTML/);
  for(const id of ["todayFreshActivity","todayFreshWeekBars","todayFreshWeekTotal",
    "todayFreshWeekDays","todayFreshRecentList","todayFreshRecentFocus",
    "todayFreshActivityHint"]){
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
  }
  const fresh=html.slice(html.indexOf('id="todayFreshStart"'),html.indexOf('<!-- Bugün v33'));
  assert.ok(fresh.indexOf('id="todayFreshWorkCenter"')<fresh.indexOf('id="todayFreshActivity"'));
  assert.ok(fresh.indexOf('id="todayFreshActivity"')<fresh.indexOf('id="todayFreshReview"'));
  assert.match(html,/#home #todayFreshStart \.today-fresh-activity-grid/);
  assert.match(html,/@media\(max-width:600px\)/);
});

test("v40 snapshot reads real local week totals and deduplicated sessions without writing",()=>{
  const app=read("app.js");
  const start=app.indexOf("window.yksTodayActivitySnapshot=function()");
  const end=app.indexOf("function v25StartTask()",start);
  assert.ok(start>0&&end>start,"read-only adapter is bounded in v25 runtime");
  const today=dateKey(new Date()),mon=dateKey(mondayOf(new Date()));
  const t=Date.now()-2*3600000;
  const state={
    pomoMin:{[today]:40,[mon]:today===mon?40:20},
    sessions:{[today]:[
      {t,m:25,subj:"Matematik",topic:"Problemler",type:"work"},
      {t:t+50000,m:10,subj:"Türkçe",type:"break"},
      {t:Date.now()+3600000,m:10,subj:"Fizik",type:"work"}
    ]},
    swHistory:{[today]:[
      {at:t+900,ms:25*60000,subj:"Matematik",topic:"Problemler"},
      {at:t+3600000,ms:15*60000,subj:"Fizik",topic:"Hareket"}
    ]}
  };
  const untouched=JSON.stringify(state),win={};
  const ctx={window:win,S:state,Date,keyOf:dateKey,mondayOf,todayKey:()=>dateKey(new Date()),addDaysKey:addDays};
  vm.runInNewContext(app.slice(start,end),ctx,{filename:"v40-bridge.js"});
  const snapshot=win.yksTodayActivitySnapshot();
  assert.equal(snapshot.today,today);
  assert.equal(snapshot.days.length,7);
  assert.equal(snapshot.days[(new Date().getDay()+6)%7].min,40);
  assert.equal(snapshot.days.reduce((sum,day)=>sum+day.min,0),today===mon?40:60);
  assert.equal(snapshot.sessions.length,2,"duplicate stopwatch and future/break entries excluded");
  assert.equal(snapshot.sessions[0].subj,"Fizik");
  assert.equal(snapshot.sessions[0].min,15);
  assert.equal(snapshot.sessions[1].subj,"Matematik");
  assert.equal(JSON.stringify(state),untouched,"S state remains unchanged");
});

test("v40 renders seven days, recent sessions and reacts to saved changes",()=>{
  class Fake{
    constructor(id="",value=""){this.id=id;this.textContent=value;this.dataset={};
      this.style={};this.children=[];this.attributes={};this.listeners={};this.className="";}
    setAttribute(k,v){this.attributes[k]=String(v)}
    append(...items){this.children.push(...items)}
    replaceChildren(...items){this.children=[...items]}
    addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
    click(){for(const fn of this.listeners.click||[])fn()}
  }
  const nodes=new Map(),windowListeners={},documentListeners={},routes=[];
  for(const id of ["todayFreshActivity","todayFreshWeekBars","todayFreshWeekTotal",
    "todayFreshWeekDays","todayFreshRecentList","todayFreshRecentFocus","todayFreshActivityHint"])
    nodes.set(id,new Fake(id));
  const today=dateKey(new Date()),mon=dateKey(mondayOf(new Date()));
  let data={
    today,
    days:Array.from({length:7},(_,i)=>({date:addDays(mon,i),min:0})),
    sessions:[]
  };
  const window={
    yksTodayActivitySnapshot:()=>data,
    go:s=>routes.push(s),
    addEventListener:(name,fn)=>(windowListeners[name]??=[]).push(fn)
  };
  const document={
    getElementById:id=>nodes.get(id)||null,
    createElement:name=>new Fake(name),
    visibilityState:"visible",
    addEventListener:(name,fn)=>(documentListeners[name]??=[]).push(fn)
  };
  const code=stripTypeScriptTypes(read("src/ui/today-activity-v40.ts"))
    .replace("export function installTodayActivityV40","function installTodayActivityV40");
  const ctx=vm.createContext({window,document,console,Date,Intl});
  vm.runInContext(code+"\nthis.install=installTodayActivityV40;",ctx);
  assert.equal(ctx.install().installed,true);
  assert.equal(nodes.get("todayFreshWeekBars").children.length,7);
  assert.equal(nodes.get("todayFreshWeekTotal").textContent,"0 dk");
  assert.equal(nodes.get("todayFreshWeekDays").textContent,"0 / 7 aktif gün");
  assert.equal(nodes.get("todayFreshRecentList").children.length,1,"empty state");
  const dayIdx=(new Date().getDay()+6)%7;
  data={today,days:data.days.map((d,i)=>({...d,min:i===dayIdx?90:0})),
    sessions:[{date:today,at:Date.now()-30000,min:90,subj:"Kimya",topic:"Asitler",kind:"session"}]};
  windowListeners["yks:data-changed"][0]();
  assert.equal(nodes.get("todayFreshWeekTotal").textContent,"1 sa 30 dk");
  assert.equal(nodes.get("todayFreshWeekDays").textContent,"1 / 7 aktif gün");
  const bar=nodes.get("todayFreshWeekBars").children[dayIdx];
  assert.equal(bar.children[0].children[0].style.height,"100%");
  assert.equal(nodes.get("todayFreshRecentList").children[0].children[0].children[0].textContent,"Kimya");
  nodes.get("todayFreshRecentFocus").click();
  assert.deepEqual(routes,["pomo"]);
  assert.equal(ctx.install().installed,true);
  assert.equal(windowListeners["yks:data-changed"].length,1,"only one data-change subscriber");
  assert.equal(nodes.get("todayFreshActivity").dataset.activityReady,"true");
});
