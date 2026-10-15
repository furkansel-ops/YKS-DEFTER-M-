const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
function harness(){
 class Fake{
  constructor(id="",value=""){
   this.id=id;this.textContent=value;this.className="";this.dataset={};
   this.attributes={};this.listeners={};this.children=[];this.clicks=0;this.disabled=false;
  }
  get classList(){return{
   contains:name=>this.className.split(" ").includes(name),
   toggle:(name,force)=>{const list=this.className.split(" ").filter(Boolean),
    want=force===undefined?!list.includes(name):!!force;
    this.className=list.filter(x=>x!==name).concat(want?[name]:[]).join(" ");return want;}
  }}
  getAttribute(k){return this.attributes[k]||null}
  setAttribute(k,v){this.attributes[k]=String(v)}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
  click(){this.clicks++;for(const fn of this.listeners.click||[])fn()}
  append(...nodes){this.children.push(...nodes)}
  replaceChildren(...nodes){this.children=nodes}
  querySelector(sel){return this.special?.[sel]||null}
  querySelectorAll(sel){return sel===".plancell"?this.rows||[]:sel==="button"?this.buttons||[]:[]}
  contains(node){return this===node||(this.rows||[]).includes(node)}
 }
 const nodes=new Map(),observers=[],routes=[];
 const add=(id,value="")=>{const e=new Fake(id,value);nodes.set(id,e);return e};
 const rootEl=add("todayFreshWorkCenter"),plan=add("todayPlan"),
  next=add("todayNext"),stop=add("swCard"),pomo=add("focusCard"),
  swTime=add("swTime","02:04:00"),pomoTime=add("pomoTime","25:00");
 add("todayFreshTaskList");
 add("pomoSubjPick").special={".chip.on":new Fake("","Matematik")};
 add("pomoMode","Çalışma");
 for(const id of ["todayFreshFocusOpen","todayFreshAllTasks","todayFreshNextStart",
 "todayFreshNextDone","todayFreshFocusState","todayFreshFocusDot","todayFreshFocusTitle",
 "todayFreshFocusHint","todayFreshFocusTime","todayFreshNextTitle",
 "todayFreshNextMeta","todayFreshTaskCount","todayFreshWorkBadge"])add(id);
 next.special={".next-title":new Fake("","Matematik · Problemler"),".next-meta":new Fake("","TYT")};
 const startButton=new Fake();startButton.attributes.onclick="v25StartTask()";
 next.buttons=[startButton];
 stop.attributes["data-run"]="paused";pomo.attributes["data-run"]="idle";
 const rows=[];
 for(let i=0;i<7;i++){
  const row=new Fake();row.className="plancell"+(i<4?" pd":"");
  row.attributes.onclick="toggleCellDone('2026-10-15','s-"+i+"-1')";
  row.special={".pl":new Fake("","Matematik"),".pt":new Fake("","Görev "+i)};
  row.addEventListener("click",()=>row.classList.toggle("pd"));
  rows.push(row);
 }
 plan.rows=rows;
 const doc={getElementById:id=>nodes.get(id)||null,
   addEventListener:()=>{},visibilityState:"visible",
   createElement:()=>new Fake()};
 class Observer{
  constructor(fn){this.fn=fn;observers.push(this);this.observed=[]}
  observe(node,opts){this.observed.push({id:node.id,opts})}
 }
 const script=stripTypeScriptTypes(read("src/ui/today-workspace-v38.ts"))
  .replace("export function installTodayWorkspaceV38","function installTodayWorkspaceV38");
 const ctx=vm.createContext({document:doc,window:{go:page=>routes.push(page)},
  MutationObserver:Observer,console,requestAnimationFrame:fn=>fn()});
 vm.runInContext(script+"\nthis.install=installTodayWorkspaceV38;",ctx);
 return{ctx,nodes,rows,observers,routes,rootEl,plan,stop,swTime};
}
test("v55 Today's first four are pending tasks, not the first four finished rows",()=>{
 const h=harness();
 assert.equal(h.ctx.install().installed,true);
 const cards=h.nodes.get("todayFreshTaskList").children;
 assert.equal(cards.length,5);
 assert.deepEqual(cards.slice(0,3).map(x=>x.children[1].children[0].textContent),
 ["Görev 4","Görev 5","Görev 6"]);
 assert.equal(cards[3].children[1].children[0].textContent,"Görev 0");
 assert.equal(cards[4].textContent,"+3 görev daha · Tümünü gör ile programı aç.");
 assert.equal(h.nodes.get("todayFreshTaskCount").textContent,"4 / 7 tamamlandı");
 assert.equal(h.nodes.get("todayFreshWorkBadge").textContent,"3 görev kaldı");
 assert.equal(h.rows.filter(r=>r.classList.contains("pd")).length,4);
 cards[0].children[0].click();
 assert.equal(h.rows[4].clicks,1,"existing saved-task handler remains owner");
 h.observers[0].fn([{target:h.plan}]);
 assert.equal(h.nodes.get("todayFreshTaskCount").textContent,"5 / 7 tamamlandı");
 assert.equal(h.nodes.get("todayFreshWorkBadge").textContent,"2 görev kaldı");
 assert.equal(h.nodes.get("todayFreshTaskList").children[0].children[1].children[0].textContent,"Görev 5");
});
test("v55 real stopwatch break, not 2h work, is displayed in Today focus card",()=>{
 const h=harness();
 const panel=h.nodes.set("swBreakPanel",Object.assign(new (h.stop.constructor)("swBreakPanel"),{dataset:{active:"true"}}));
 h.nodes.set("swBreakCountdown",new (h.stop.constructor)("swBreakCountdown","12:30"));
 h.ctx.install();
 assert.equal(h.nodes.get("todayFreshFocusState").textContent,"Mola devam ediyor");
 assert.equal(h.nodes.get("todayFreshFocusTitle").textContent,"Mola zamanı");
 assert.equal(h.nodes.get("todayFreshFocusTime").textContent,"12:30");
 assert.match(h.nodes.get("todayFreshFocusHint").textContent,/çalışma süren korunuyor/i);
 assert.equal(h.swTime.textContent,"02:04:00");
 const scans=h.plan.planScans||0;
 h.nodes.get("swBreakCountdown").textContent="12:29";
 h.observers[0].fn([{target:h.nodes.get("swBreakCountdown")}]);
 assert.equal(h.nodes.get("todayFreshFocusTime").textContent,"12:29");
 assert.equal(h.plan.planScans||0,scans,"a break tick doesn't rescan homework");
 h.nodes.get("swBreakPanel").dataset.active="false";
 h.observers[0].fn([{target:h.nodes.get("swBreakPanel")}]);
 assert.equal(h.nodes.get("todayFreshFocusState").textContent,"Odak duraklatıldı");
 assert.equal(h.nodes.get("todayFreshFocusTime").textContent,"02:04:00");
 assert.equal(h.observers[0].observed.some(x=>x.id==="swCard"&&x.opts.subtree===true),true);
});
test("v55 mobile view is compact, theme compatible, preserves all native Today sections",()=>{
 const css=read("src/ui/today-final-v55.css"),main=read("src/main.ts");
 const html=read("index.html"),workspace=read("src/ui/today-workspace-v38.ts");
 assert.match(main,/import "\.\/ui\/today-final-v55\.css";/);
 assert.match(css,/#todayFreshReview\{order:3\}/);
 assert.match(css,/#todayFreshInsights\{order:4\}/);
 assert.match(css,/#todayFreshSubjects\{order:5\}/);
 assert.match(css,/#todayFreshActivity\{order:6\}/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(max-width:420px\)/);
 assert.match(css,/@media\(max-width:350px\)/);
 assert.match(css,/var\(--yks-theme-ink\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(html,/#home > :not\(#todayFreshStart\)\{display:none!important\}/);
 for(const id of ["todayFreshWorkCenter","todayFreshTaskList","todayFreshDailyProgress",
 "todayFreshInsights","todayFreshGapTrackerSummary","todayFreshSubjects","todayFreshActivity",
 "todayFreshHistory","todayFreshReview","todayFreshReflectionSave"]){
  if(id==="todayFreshGapTrackerSummary"){
   assert.match(read("src/ui/today-gap-tracker-v47.ts"),new RegExp(id));continue;
  }
  assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
 }
 assert.ok(Buffer.byteLength(html,"utf8")<=180000);
 assert.doesNotMatch(workspace,/localStorage|setDoc\(|updateDoc\(|save\(|fetch\(|S\.weeks|innerHTML/);
 assert.doesNotMatch(css,/(position:\s*fixed|overflow-y:\s*auto|display:\s*none\s*!important)/);
});

test("v56 re-rendered same-title tasks bind to the new saved-program rows",()=>{
 const h=harness();
 h.ctx.install();
 const originalCard=h.nodes.get("todayFreshTaskList").children[0];
 const replacements=h.rows.map(old=>{
  const row=new old.constructor();
  row.className=old.className;
  row.attributes={...old.attributes};
  row.special=old.special;
  row.addEventListener("click",()=>row.classList.toggle("pd"));
  return row;
 });
 h.plan.rows=replacements;
 h.observers[0].fn([{target:h.plan}]);
 const newCard=h.nodes.get("todayFreshTaskList").children[0];
 assert.notEqual(newCard,originalCard,"same text must not preserve stale handlers");
 newCard.children[0].click();
 assert.equal(replacements[4].clicks,1,"new row owns completion");
 assert.equal(h.rows[4].clicks,0,"detached row must never be clicked");
});
test("v56 completion class changes immediately refresh the task count",()=>{
 const h=harness();
 h.ctx.install();
 const planObservation=h.observers[0].observed.find(x=>x.id==="todayPlan");
 assert.equal(planObservation.opts.attributes,true);
 assert.ok(planObservation.opts.attributeFilter.includes("class"));
 h.rows[4].classList.toggle("pd");
 h.observers[0].fn([{target:h.rows[4],type:"attributes",attributeName:"class"}]);
 assert.equal(h.nodes.get("todayFreshTaskCount").textContent,"5 / 7 tamamlandı");
 assert.equal(h.nodes.get("todayFreshWorkBadge").textContent,"2 görev kaldı");
});
