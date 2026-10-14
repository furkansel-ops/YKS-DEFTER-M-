const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v48 read-only bridge uses existing daily totals and completion without double counting",()=>{
  const app=read("app.js");
  const start=app.indexOf("window.yksTodayDailyProgressSnapshot=function()");
  const end=app.indexOf("function v25StartTask()",start);
  assert.ok(start>0&&end>start);
  const bridge=app.slice(start,end);
  assert.doesNotMatch(bridge,/S\.[a-zA-Z]+\s*=|save\(|localStorage|setDoc\(|updateDoc\(/);
  const source={
    date:"2026-10-14",focusMin:125,focusGoal:180,solved:48,questionGoal:70,
    subjects:[{name:"Matematik",min:75},{name:"Fizik",min:50}],
    unassignedMin:0,hasMismatch:false
  };
  const plan={filled:5,done:3},last={subj:"Fizik",topic:"Hareket",min:30},win={
    yksTodaySubjectSnapshot:()=>source
  };
  const before=JSON.stringify({source,plan,last});
  vm.runInNewContext(bridge,{window:win,v25PlanToday:()=>plan,v25LatestFocus:()=>last,Number,Math,String},{filename:"today-v48-bridge.js"});
  const snapshot=win.yksTodayDailyProgressSnapshot();
  assert.equal(snapshot.focusMin,125);
  assert.equal(snapshot.questions,48);
  assert.equal(snapshot.tasks,5);
  assert.equal(snapshot.done,3);
  assert.equal(snapshot.latest.subject,"Fizik");
  assert.equal(snapshot.latest.minutes,30);
  assert.deepEqual(JSON.parse(JSON.stringify(snapshot.subjects)),source.subjects);
  assert.equal(JSON.stringify({source,plan,last}),before,"no changes to student records");
  win.yksTodaySubjectSnapshot=()=>({...source,subjects:[],unassignedMin:125,hasMismatch:true});
  const other=win.yksTodayDailyProgressSnapshot();
  assert.equal(other.unassignedMin,125);
  assert.equal(other.hasMismatch,true);
});
test("v48 module is optional, lazy, offline-manifested, theme aware and retains all other Today cards",()=>{
  const html=read("index.html"),top=read("src/ui/today-top-v33.ts"),vite=read("vite.config.mts"),
    mod=read("src/ui/today-daily-progress-v48.ts"),css=read("src/ui/today-daily-progress-v48.css");
  for(const id of ["todayFreshDailyProgress","todayDailyProgressHeadline","todayDailyProgressContent"]){
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
  }
  const segment=html.slice(html.indexOf('id="todayFreshStart"'),html.indexOf('<!-- Bugün v33'));
  assert.ok(segment.indexOf('id="todayFreshWorkCenter"')<segment.indexOf('id="todayFreshDailyProgress"'));
  assert.ok(segment.indexOf('id="todayFreshDailyProgress"')<segment.indexOf('id="todayFreshSubjects"'));
  assert.match(top,/import\("\.\/today-daily-progress-v48"\)/);
  assert.match(top,/dailyDisclosure\.addEventListener\("toggle",loadDailyProgress\)/);
  assert.match(vite,/"src\/ui\/today-daily-progress-v48\.ts"/);
  assert.match(mod,/import "\.\/today-daily-progress-v48\.css"/);
  assert.match(css,/#home #todayFreshStart \.today-daily-progress/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.doesNotMatch(mod,/localStorage|setDoc\(|updateDoc\(|save\(|firebase|S\.pomoMin|setInterval|innerHTML/);
  assert.match(mod,/aria-valuenow/);
});
function runtime(){
  class Fake{
    constructor(tag="div"){this.tag=tag;this.className="";this.dataset={};this.attrs={};
      this.listeners={};this.textContent="";this.children=[];this.open=false;this.replaceCount=0;
      this.style={setProperty:(name,value)=>{this.style[name]=value}};
      this.classList={contains:()=>true};}
    append(...nodes){this.children.push(...nodes)}
    replaceChildren(...nodes){this.children=[...nodes];this.replaceCount++}
    addEventListener(evt,fn){(this.listeners[evt]??=[]).push(fn)}
    fire(evt){for(const fn of this.listeners[evt]||[])fn()}
    setAttribute(k,v){this.attrs[k]=String(v)}
  }
  const rootNode=new Fake("details");rootNode.open=true;
  const content=new Fake(),headline=new Fake(),home=new Fake();
  const nodes=new Map([["todayFreshDailyProgress",rootNode],
    ["todayDailyProgressContent",content],["todayDailyProgressHeadline",headline],["home",home]]);
  const listeners={};
  const document={getElementById:id=>nodes.get(id)||null,
    createElement:tag=>new Fake(tag),visibilityState:"visible",
    addEventListener:(event,fn)=>{(listeners[event]??=[]).push(fn)}};
  const data={date:"2026-10-14",focusMin:135,focusGoal:180,questions:43,questionGoal:60,
    tasks:5,done:3,subjects:[{name:"Matematik",min:90},{name:"Fizik",min:45}],
    unassignedMin:0,hasMismatch:false,latest:{subject:"Fizik",topic:"Hareket",minutes:25}};
  let routed="",reads=0;
  const window={yksTodayDailyProgressSnapshot:()=>{reads++;return data},
    go:page=>{routed=page},
    addEventListener:(event,fn)=>{(listeners[event]??=[]).push(fn)}};
  const src=stripTypeScriptTypes(read("src/ui/today-daily-progress-v48.ts")
      .replace('import "./today-daily-progress-v48.css";',""))
    .replace(/export function /g,"function ");
  const ctx=vm.createContext({document,window,console,Math,Number,JSON,String});
  vm.runInContext(src+"\nthis.install=installTodayDailyProgressV48;this.metric=dailyProgressMetric;",ctx);
  return {ctx,data,rootNode,content,headline,listeners,get routed(){return routed},get reads(){return reads}};
}
test("v48 progress bars do not invent goals, are capped and keep real over-goal count",()=>{
  const h=runtime();
  const reached=h.ctx.metric(130,100);
  assert.equal(reached.percent,100);
  assert.equal(reached.value,130);
  assert.equal(reached.remaining,0);
  assert.equal(reached.complete,true);
  const unknown=h.ctx.metric(70,0);
  assert.equal(unknown.percent,null);
  assert.equal(unknown.goal,null);
  assert.equal(unknown.complete,false);
  const missing=h.ctx.metric(-10,50);
  assert.equal(missing.percent,0);
  assert.equal(missing.remaining,50);
});
test("v48 refreshes on data-change, skips identical render and routes via existing screens",()=>{
  const h=runtime();
  assert.equal(h.ctx.install().installed,true);
  assert.equal(h.rootNode.dataset.dailyProgressReady,"true");
  assert.equal(h.content.children.length,2);
  assert.match(h.headline.textContent,/3\/5 görev/);
  const initial=h.content.replaceCount;
  assert.equal(h.content.children[0].children.length,3);
  const progress=h.content.children[0].children[0].children[2];
  assert.equal(progress.attrs["aria-valuenow"],"60");
  assert.equal(progress.attrs.role,"progressbar");
  assert.equal(h.ctx.install().installed,true);
  assert.equal(h.listeners["yks:data-changed"].length,1);
  h.listeners["yks:data-changed"][0]();
  assert.equal(h.content.replaceCount,initial,"identical snapshot avoids redraw");
  h.data.done=4;h.data.questions=60;
  h.listeners["yks:data-changed"][0]();
  assert.equal(h.content.replaceCount,initial+1);
  assert.match(h.headline.textContent,/4\/5 görev/);
  let actions=h.content.children[1].children.at(-1);
  actions.children[0].fire("click");
  assert.equal(h.routed,"program");
  actions.children[1].fire("click");
  assert.equal(h.routed,"pomo");
  h.rootNode.open=false;
  h.data.focusMin=170;h.listeners["yks:data-changed"][0]();
  assert.equal(h.content.replaceCount,initial+1,"closed summary doesn't rebuild deep DOM");
  h.rootNode.open=true;h.rootNode.fire("toggle");
  assert.equal(h.content.replaceCount,initial+2);
});
