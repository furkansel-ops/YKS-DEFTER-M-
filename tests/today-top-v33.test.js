const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/today-top-v33.ts");
// Isolate the two small presentation functions for VM behavior tests. Avoid
// transpileModule: the project's TS 7 release uses a different transpiler API.
const executable=source
  .replace(/^export type TodayProgress=[^\n]+\n/m,"")
  .replace("export function parseTodayProgramProgress(percentText:string,completedText:string):TodayProgress{",
    "function parseTodayProgramProgress(percentText,completedText){")
  .replace("export function installTodayTopV33():{installed:boolean}{",
    "function installTodayTopV33(){")
  .replace("document.querySelector<HTMLElement>","document.querySelector");
function moduleUnderTest(env={}){
  const exports={},context=vm.createContext({exports,Intl,Date,...env});
  vm.runInContext(executable+
    "\nexports.parseTodayProgramProgress=parseTodayProgramProgress;exports.installTodayTopV33=installTodayTopV33;",context,{filename:"today-top-v33.js"});
  return exports;
}

test("live v25 plan completion is converted to real ratio and bounded progress",()=>{
  const {parseTodayProgramProgress:parse}=moduleUnderTest();
  assert.deepEqual(JSON.parse(JSON.stringify(parse("50%","3 / 6 görev"))),
    {completed:3,total:6,percent:50,hasPlan:true});
  assert.deepEqual(JSON.parse(JSON.stringify(parse("100%","2 / 2 görev"))),
    {completed:2,total:2,percent:100,hasPlan:true});
  assert.deepEqual(JSON.parse(JSON.stringify(parse("—","plan yok"))),
    {completed:0,total:0,percent:0,hasPlan:false});
  assert.equal(parse("220%","9 / 10 görev").percent,100);
  assert.equal(parse("-5%","0 / 4 görev").percent,0);
  assert.equal(parse("33%","3 / 3 görev").completed,3);
});

test("compact ring observes authoritative progress and does not write study state",()=>{
  let callback;
  const props={},attrs={},nodes=new Map();
  const makeNode=(id,value="")=>{
    const node={id,textContent:value,attrs:{},style:{setProperty(k,v){props[k]=v}},
      setAttribute(k,v){attrs[id+":"+k]=v}};
    nodes.set(id,node);return node;
  };
  makeNode("todayHubPlan","—");
  makeNode("todayHubPlanSub","plan yok");
  makeNode("v33ProgramRatio");
  makeNode("v33ProgramPercent");
  makeNode("v33ProgramStatus");
  makeNode("v33ProgressBar");
  makeNode("v33HomeDate");
  const rootNode=makeNode("v33Root");
  const doc={
    getElementById:id=>nodes.get(id)||null,
    querySelector:s=>s==="#home .v33-home-progress"?rootNode:null,
    addEventListener:()=>{}
  };
  class Observer {
    constructor(fn){callback=fn}
    observe(){}
  }
  const {installTodayTopV33}=moduleUnderTest({document:doc,MutationObserver:Observer});
  assert.equal(installTodayTopV33().installed,true);
  assert.equal(nodes.get("v33ProgramRatio").textContent,"—");
  assert.equal(props["--v33-progress"],"0");
  nodes.get("todayHubPlan").textContent="50%";
  nodes.get("todayHubPlanSub").textContent="3 / 6 görev";
  callback();
  assert.equal(nodes.get("v33ProgramRatio").textContent,"3/6");
  assert.equal(nodes.get("v33ProgramPercent").textContent,"%50");
  assert.equal(nodes.get("v33ProgramStatus").textContent,"3 görev kaldı. Kendi hızında ilerle.");
  assert.equal(props["--v33-progress"],"50");
  assert.equal(attrs["v33ProgressBar:aria-valuenow"],"50");
  nodes.get("todayHubPlan").textContent="100%";
  nodes.get("todayHubPlanSub").textContent="6 / 6 görev";
  callback();
  assert.equal(nodes.get("v33ProgramStatus").textContent,"Bugünkü program görevleri tamamlandı.");
  assert.equal(props["--v33-progress"],"100");
});

test("first-stage HTML preserves every legacy live data node exactly once",()=>{
  const html=read("index.html"),css=read("src/ui/today-top-v33.css");
  for(const id of ["greeting","sozBox","countdown","timeline","examDateLabel","phaseTitle",
    "stQ","stMin","stPomo","streakPlan","streakTarget",
    "todayHubQ","todayHubMin","todayHubPlan","todayHubReview",
    "todayHub","todayNext","todayRemaining","todayClose","todayReflectionInput",
    "homeGoals","todayPlan","suggestBox","gunBtn"]){
    assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
  }
  assert.ok(html.indexOf('class="v33-home-intro"')<html.indexOf('id="sozBox"'));
  assert.ok(html.indexOf('id="sozBox"')<html.indexOf('class="v33-home-progress"'));
  assert.ok(html.indexOf('class="v33-home-progress"')<html.indexOf('id="todayHub"'));
  assert.match(html,/class="today-summary-grid v33-progress-metrics"/);
  assert.match(html,/class="v33-legacy-stats"/);
  assert.match(css,/@media\(max-width:759px\)/);
  assert.match(css,/@media\(max-width:370px\)/);
  assert.match(css,/#home \.v33-home-progress/);
  assert.doesNotMatch(css,/display:none\s*!important/);
});

test("scope is home only and initial render keeps optional boot safety",()=>{
  const main=read("src/main.ts"),js=read("app.js"),html=read("index.html");
  assert.match(main,/import "\.\/ui\/today-top-v33\.css"/);
  assert.match(main,/installOptional\("today-top-v33",\(\)=>installTodayTopV33\(\),\{installed:false\}\)/);
  assert.match(html,/id="yksBootGuard"/);
  assert.match(html,/id="yksBootShell"/);
  assert.match(js,/function v25RenderSummary/);
  assert.match(js,/el\("todayHubPlan"\)/);
  assert.doesNotMatch(source,/setDoc|updateDoc|localStorage\.setItem|fetch\(/);
});
