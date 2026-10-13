const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v38 source is optional, offline-cached and leaves legacy data-writers alone",()=>{
  const src=read("src/ui/today-workspace-v38.ts");
  const main=read("src/main.ts"),vite=read("vite.config.mts");
  const html=read("index.html");
  assert.match(read("src/ui/today-top-v33.ts"),/import\("\.\/today-workspace-v38"\)/);
  assert.doesNotMatch(main,/void import\("\.\/ui\/today-workspace-v38"\)/);
  assert.match(vite,/"src\/ui\/today-workspace-v38\.ts"/);
  assert.match(src,/function installTodayWorkspaceV38/);
  assert.doesNotMatch(src,/localStorage|setDoc\(|updateDoc\(|save\(|fetch\(|S\.weeks|innerHTML/);
  assert.match(html,/#home > :not\(#todayFreshStart\)\{display:none!important\}/);
  const fresh=html.slice(html.indexOf('id="todayFreshStart"'),html.indexOf('<!-- Bugün v33'));
  for(const id of ["todayFreshWorkCenter","todayFreshFocusState","todayFreshFocusTime",
    "todayFreshNextTitle","todayFreshNextStart","todayFreshNextDone","todayFreshTaskList","todayFreshAllTasks"]){
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
    assert.ok(fresh.includes('id="'+id+'"'),id+" missing from visible shell");
  }
  assert.ok(fresh.indexOf("today-fresh-daily")<fresh.indexOf("today-fresh-work-center"));
  assert.match(html,/@media\(max-width:600px\)/);
  assert.match(html,/#home #todayFreshStart \.today-fresh-task-list\{grid-template-columns:1fr\}/);
  for(const id of ["todayPlan","todayNext","swCard","focusCard","swTime","pomoTime"]){
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
  }
});

test("v38 focus/next/task cards mirror legacy state and dispatch existing handlers",()=>{
  class Fake{
    constructor(id="",value=""){
      this.id=id;this.textContent=value;this.className="";this.dataset={};
      this.attributes={};this.listeners={};this.children=[];this.clicks=0;this.style={};
    }
    get classList(){return{
      contains:n=>this.className.split(" ").includes(n),
      toggle:(name,force)=>{
        const present=this.className.split(" ").includes(name),add=force===undefined?!present:!!force;
        this.className=this.className.split(" ").filter(x=>x&&x!==name).concat(add?[name]:[]).join(" ");
        return add;
      }
    }}
    setAttribute(name,value){this.attributes[name]=String(value)}
    getAttribute(name){return this.attributes[name]||null}
    addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
    click(){this.clicks++;for(const fn of this.listeners.click||[])fn()}
    contains(node){return this===node}
    append(...args){this.children.push(...args)}
    replaceChildren(...args){this.children=[...args]}
    querySelector(selector){
      if(this.id==="todayNext")return this.special?.[selector]||null;
      if(this.id==="pomoSubjPick")return this.special?.[selector]||null;
      if(this.className.includes("plancell"))return this.special?.[selector]||null;
      return null;
    }
    querySelectorAll(selector){
      if(this.id==="todayPlan"&&selector===".plancell"){this.planScans=(this.planScans||0)+1;return this.rows||[];}
      if(this.id==="todayNext"&&selector==="button")return this.buttons||[];
      return [];
    }
  }
  const nodes=new Map(),observers=[],routes=[];
  const el=(id,v="")=>{const n=new Fake(id,v);nodes.set(id,n);return n};
  const rootCard=el("todayFreshWorkCenter"),plan=el("todayPlan"),
    next=el("todayNext"),stop=el("swCard"),pomo=el("focusCard");
  const swTime=el("swTime","00:24"),pomoTime=el("pomoTime","25:00"),
    subj=el("pomoSubjPick");
  subj.special={".chip.on":new Fake("","Matematik")};
  el("pomoMode","Çalışma");
  el("todayFreshTaskList");
  for(const id of ["todayFreshFocusOpen","todayFreshAllTasks","todayFreshNextStart","todayFreshNextDone",
    "todayFreshFocusState","todayFreshFocusDot","todayFreshFocusTitle","todayFreshFocusHint",
    "todayFreshFocusTime","todayFreshNextTitle","todayFreshNextMeta","todayFreshTaskCount","todayFreshWorkBadge"])
    el(id);
  const title=new Fake("","Matematik · Problemler"),meta=new Fake("","Matematik · Problemler");
  next.special={".next-title":title,".next-meta":meta};
  const play=new Fake();play.attributes.onclick="v25StartTask()";
  const doneAction=new Fake();doneAction.attributes.onclick="v25DoneNext()";
  next.buttons=[play,doneAction];
  const row=new Fake();
  row.className="plancell";
  row.attributes.onclick="toggleCellDone('2026-10-12','s-0-1')";
  row.special={".pl":new Fake("","Matematik"),".pt":new Fake("","Problemler")};
  row.addEventListener("click",()=>row.classList.toggle("pd"));
  plan.rows=[row];
  stop.attributes["data-run"]="running";
  pomo.attributes["data-run"]="idle";
  const document={
    getElementById:id=>nodes.get(id)||null,
    addEventListener:()=>{},
    visibilityState:"visible",
    createElement:()=>new Fake()
  };
  class Observer{
    constructor(fn){this.fn=fn;observers.push(this)}
    observe(){}
  }
  const source=stripTypeScriptTypes(read("src/ui/today-workspace-v38.ts"))
    .replace("export function installTodayWorkspaceV38","function installTodayWorkspaceV38");
  const context=vm.createContext({document,window:{go:page=>routes.push(page)},MutationObserver:Observer,console,requestAnimationFrame:fn=>fn()});
  vm.runInContext(source+"\nthis.install=installTodayWorkspaceV38;",context);
  assert.equal(context.install().installed,true);
  assert.equal(rootCard.dataset.workReady,"true");
  assert.equal(nodes.get("todayFreshFocusState").textContent,"Odak sürüyor");
  assert.equal(nodes.get("todayFreshFocusTitle").textContent,"Kronometre");
  assert.equal(nodes.get("todayFreshFocusTime").textContent,"00:24");
  assert.equal(nodes.get("todayFreshTaskCount").textContent,"0 / 1 tamamlandı");
  assert.equal(nodes.get("todayFreshTaskList").children.length,1);
  assert.equal(nodes.get("todayFreshNextTitle").textContent,"Matematik · Problemler");
  assert.equal(nodes.get("todayFreshNextStart").disabled,false);
  nodes.get("todayFreshNextStart").click();
  nodes.get("todayFreshNextDone").click();
  assert.equal(play.clicks,1);
  assert.equal(doneAction.clicks,1);
  const sourceTask=nodes.get("todayFreshTaskList").children[0];
  sourceTask.children[0].click();
  assert.equal(row.clicks,1,"task completion dispatches existing DOM onclick");
  observers[0].fn();
  assert.equal(nodes.get("todayFreshTaskCount").textContent,"1 / 1 tamamlandı");
  assert.equal(nodes.get("todayFreshTaskList").children[0].classList.contains("is-done"),true);
  nodes.get("todayFreshFocusOpen").click();
  nodes.get("todayFreshAllTasks").click();
  assert.deepEqual(routes,["pomo","program"]);
  assert.equal(context.install().installed,true,"idempotent");
  assert.equal(observers.length,1,"single observer");
  assert.equal(stop.getAttribute("data-run"),"running","source focus state unchanged");

  stop.attributes["data-run"]="idle";
  pomo.attributes["data-run"]="paused";
  pomoTime.textContent="13:42";
  observers[0].fn();
  assert.equal(nodes.get("todayFreshFocusState").textContent,"Odak duraklatıldı");
  assert.equal(nodes.get("todayFreshFocusTime").textContent,"13:42");

  // Timer ticks update only the clock: they must not scan/render task rows.
  const scansBefore=plan.planScans||0;
  swTime.textContent="00:25";
  stop.attributes["data-run"]="running";pomo.attributes["data-run"]="idle";
  observers[0].fn([{target:swTime}]);
  assert.equal(nodes.get("todayFreshFocusTime").textContent,"00:25");
  assert.equal(plan.planScans,scansBefore,"clock tick does not re-scan every task");
  // A real plan mutation still refreshes tasks.
  row.className="plancell";
  observers[0].fn([{target:plan}]);
  assert.equal(nodes.get("todayFreshTaskCount").textContent,"0 / 1 tamamlandı");
  assert.ok(plan.planScans>scansBefore);
});
