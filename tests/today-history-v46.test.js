const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const dateKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const addDays=(key,n)=>{const d=new Date(key+"T12:00:00");d.setDate(d.getDate()+n);return dateKey(d)};
const mondayOf=d=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-(x.getDay()+6)%7);return x};
const dow=d=>(d.getDay()+6)%7;

function bridge(state){
  const source=read("app.js");
  const start=source.indexOf("window.yksTodayHistorySnapshot=function()");
  const end=source.indexOf("/* v41 /",start);
  assert.ok(start>=0&&end>start,"history bridge must be separated from v41");
  const win={};
  vm.runInNewContext(source.slice(start,end),{
    window:win,S:state,Date,todayKey:()=>dateKey(new Date()),
    keyOf:dateKey,addDaysKey:addDays,mondayOf,dowOf:dow
  },{filename:"today-history-v46-bridge.js"});
  return win.yksTodayHistorySnapshot();
}

test("v46 reads 84 real days, task completion, questions and focus without altering state",()=>{
  const now=new Date(),today=dateKey(now),mon=dateKey(mondayOf(now)),idx=dow(now);
  const yesterdayWeek=addDays(mon,-7),first=addDays(mon,-77);
  const a=Array(7).fill(""),b=Array(7).fill("");
  a[idx]="Matematik: Problem",b[idx]="Türkçe: Paragraf";
  const state={
    pomoMin:{[today]:50,[yesterdayWeek]:30},
    solved:{[today]:25,[yesterdayWeek]:4},
    weeks:{[mon]:{r:[],s:[a,b],dn:{["s-0-"+idx]:true}}},
    focus:{goalMin:100},target:50,
    sessions:{[today]:[{m:75,type:"work"}]},swHistory:{[today]:[{ms:999999}]}
  };
  const before=JSON.stringify(state),res=bridge(state);
  assert.equal(res.days.length,84);
  assert.equal(res.start,first);
  assert.equal(res.days[0].date,first);
  assert.equal(res.days.at(-1).date,addDays(mon,6));
  assert.equal(res.days.find(d=>d.date===today).min,50,
    "session/stopwatch history must not double count persisted focus");
  assert.equal(res.days.find(d=>d.date===today).questions,25);
  assert.equal(res.days.find(d=>d.date===today).tasks,2);
  assert.equal(res.days.find(d=>d.date===today).done,1);
  assert.equal(res.totalMin,80);
  assert.equal(res.activeDays,2);
  assert.equal(res.week.minutes,50);
  assert.equal(res.week.questions,25);
  assert.equal(res.week.trackedDays,1);
  assert.equal(res.week.tasks,2);
  assert.equal(res.week.done,1);
  assert.equal(res.week.score,50);
  assert.deepEqual(Array.from(res.week.components.map(x=>x.value)),[50,50,50]);
  assert.equal(JSON.stringify(state),before,"snapshot never mutates existing program or study data");
});

test("v46 leaves scores unknown rather than inventing productivity from empty records",()=>{
  const state={pomoMin:{},solved:{},weeks:{},focus:{goalMin:120},target:100};
  const empty=bridge(state);
  assert.equal(empty.week.trackedDays,0);
  assert.equal(empty.week.score,null);
  assert.equal(empty.activeDays,0);
  assert.equal(empty.days.filter(d=>d.future&&d.min!==0).length,0);
  const now=dateKey(new Date());
  const partial=bridge({pomoMin:{[now]:35},solved:{},weeks:{},focus:{goalMin:0},target:0});
  assert.equal(partial.week.score,null,"focus without a stated goal does not create a fabricated score");
  assert.equal(partial.days.find(d=>d.date===now).min,35);
});

test("v46 ignores future logs and only scores metrics with recorded basis",()=>{
  const mon=dateKey(mondayOf(new Date())),idx=dow(new Date()),today=dateKey(new Date());
  const future=addDays(today,1);
  const s={
    pomoMin:{[today]:30,[future]:5000},
    solved:{[today]:8,[future]:30000},
    focus:{goalMin:60},target:0,weeks:{}
  };
  const snap=bridge(s);
  assert.equal(snap.week.trackedDays,1);
  assert.equal(snap.week.minutes,30);
  assert.equal(snap.week.questions,8);
  assert.equal(snap.week.score,50);
  assert.equal(snap.week.components[0].value,null);
  assert.equal(snap.week.components[1].value,50);
  assert.equal(snap.week.components[2].value,null);
  if(idx<6){
    const day=snap.days.find(d=>d.date===future);
    assert.equal(day.future,true);assert.equal(day.min,0);assert.equal(day.questions,0);
  }
  assert.equal(snap.week.monday,mon);
});

test("v46 is lazy, compact, accessible, offline cached and keeps all previous Today IDs",()=>{
  const html=read("index.html"),top=read("src/ui/today-top-v33.ts"),
    vite=read("vite.config.mts"),css=read("src/ui/today-history-v46.css"),
    src=read("src/ui/today-history-v46.ts"),app=read("app.js");
  const activity=html.slice(html.indexOf('<details id="todayFreshActivity"'),
    html.indexOf("</details>",html.indexOf('<details id="todayFreshActivity"')));
  for(const id of ["todayFreshHistory","todayFreshHistoryWeeks","todayFreshWeekScore",
    "todayFreshScoreBreakdown","todayFreshHistorySelection","todayFreshHistorySummary"])
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
  assert.ok(activity.includes('id="todayFreshHistory"'));
  assert.ok(activity.indexOf('id="todayFreshRecentList"')<activity.indexOf('id="todayFreshHistory"'));
  assert.match(top,/addEventListener\("toggle",loadHistory\)/);
  assert.match(top,/import\("\.\/today-history-v46"\)/);
  assert.match(vite,/"src\/ui\/today-history-v46\.ts"/);
  assert.match(src,/import "\.\/today-history-v46\.css"/);
  assert.match(css,/#home #todayFreshStart \.today-history/);
  assert.match(css, /@media\(max-width:600px\)/);
  assert.match(css, /@media\(max-width:340px\)/);
  assert.match(css,/data-level="4"/);
  assert.match(app,/window\.yksTodayHistorySnapshot=function\(\)/);
  assert.doesNotMatch(src,/localStorage|indexedDB|firebase|setDoc\(|updateDoc\(|fetch\(|S\.weeks|S\.pomoMin|save\(/i);
  assert.doesNotMatch(src,/new MutationObserver|setInterval\(/);
  assert.doesNotMatch(app.slice(app.indexOf("window.yksTodayHistorySnapshot=function()"),
    app.indexOf("/* v41 /",app.indexOf("window.yksTodayHistorySnapshot=function()"))),
    /save\(|localStorage|setDoc\(|updateDoc\(/);
  assert.ok(Buffer.byteLength(html,"utf8")<=180000,"source HTML budget protected");
});

test("v46 creates grid only when expanded, handles clicks and refreshes without touching storage",()=>{
  class Fake {
    constructor(tag="div",id=""){
      this.tagName=tag.toUpperCase();this.id=id;this.children=[];this.className="";
      this.dataset={};this.textContent="";this.open=false;this.disabled=false;
      this.attributes={};this.listeners={};this._writes=0;
      this.classList={add:name=>{if(!this.className.includes(name))this.className+=" "+name},
        remove:name=>{this.className=this.className.split(" ").filter(x=>x!==name).join(" ")},
        contains:name=>this.className.split(" ").includes(name)};
    }
    addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
    fire(name){for(const fn of this.listeners[name]||[])fn()}
    click(){this.fire("click")}
    append(...children){this.children.push(...children)}
    replaceChildren(...children){this._writes++;this.children=[...children]}
    setAttribute(name,value){this.attributes[name]=String(value)}
    getAttribute(name){return this.attributes[name]||null}
    querySelectorAll(selector){
      const all=[];const walk=(node)=>{for(const child of node.children){all.push(child);walk(child)}};
      walk(this);if(selector==="button")return all.filter(x=>x.tagName==="BUTTON");
      return [];
    }
    querySelector(selector){
      return this.querySelectorAll("button").find(x=>selector==='[aria-pressed="true"]'
        &&x.attributes["aria-pressed"]==="true")||null;
    }
  }
  const ids=["todayFreshActivity","todayFreshHistory","todayFreshHistoryWeeks",
    "todayFreshHistorySummary","todayFreshHistorySelection","todayFreshWeekScore",
    "todayFreshScoreBreakdown","todayFreshScoreNote"];
  const nodes=new Map(ids.map(id=>[id,new Fake("div",id)]));
  const changes={},documentChanges={},today=dateKey(new Date()),mon=dateKey(mondayOf(new Date()));
  let reads=0;
  const data=()=>{
    const days=Array.from({length:84},(_,i)=>{
      const date=addDays(mon,-77+i);
      return{date,min:date===today?80:0,questions:date===today?20:0,
        done:0,tasks:0,future:date>today};
    });
    return{today,start:days[0].date,days,totalMin:80,activeDays:1,
      week:{monday:mon,elapsedDays:dow(new Date())+1,trackedDays:1,minutes:80,
        questions:20,tasks:0,done:0,score:80,components:[
          {id:"program",label:"Program",value:null,current:0,goal:0,weight:45},
          {id:"focus",label:"Odak",value:80,current:80,goal:100,weight:35},
          {id:"questions",label:"Soru",value:null,current:20,goal:0,weight:20}
        ]}};
  };
  const win={yksTodayHistorySnapshot:()=>{reads++;return data()},
    addEventListener:(name,fn)=>(changes[name]??=[]).push(fn)};
  const doc={getElementById:id=>nodes.get(id)||null,
    createElement:tag=>new Fake(tag),
    addEventListener:(name,fn)=>(documentChanges[name]??=[]).push(fn),
    visibilityState:"visible"};
  const code=stripTypeScriptTypes(read("src/ui/today-history-v46.ts")
    .replace('import "./today-history-v46.css";',""))
    .replace("export function installTodayHistoryV46","function installTodayHistoryV46");
  const ctx=vm.createContext({document:doc,window:win,Date,Intl,console});
  vm.runInContext(code+"\nthis.install=installTodayHistoryV46;",ctx);
  assert.equal(ctx.install().installed,true);
  assert.equal(reads,0,"no history reads while closed");
  assert.equal(nodes.get("todayFreshHistoryWeeks").children.length,0);
  const container=nodes.get("todayFreshActivity");
  container.open=true;container.fire("toggle");
  assert.equal(reads,1);
  const columns=nodes.get("todayFreshHistoryWeeks").children;
  assert.equal(columns.length,12);
  assert.ok(columns.every(col=>col.children.length===8),"month + seven days per week");
  assert.equal(nodes.get("todayFreshWeekScore").textContent,"80");
  const focusColumn=columns[Math.floor((77+dow(new Date()))/7)];
  const chosen=focusColumn.children[dow(new Date())+1];
  chosen.click();
  assert.equal(chosen.attributes["aria-pressed"],"true");
  assert.match(nodes.get("todayFreshHistorySelection").textContent,/80 dk|1 sa 20 dk/);
  const before=nodes.get("todayFreshHistoryWeeks")._writes;
  changes["yks:data-changed"][0]();
  assert.equal(nodes.get("todayFreshHistoryWeeks")._writes,before,
    "identical snapshots do not re-render 84 buttons");
  container.open=false;changes["yks:data-changed"][0]();
  assert.equal(reads,2,"closed panel never performs a data read");
  assert.equal(ctx.install().installed,true);
  assert.equal(changes["yks:data-changed"].length,1,"no duplicate global listeners");
});
