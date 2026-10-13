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
  .replace("document.querySelector<HTMLElement>","document.querySelector")
  .replace("(node:HTMLElement,text:string)=>","(node,text)=>")
  .replace("(node:HTMLElement|null|undefined,text:string)=>","(node,text)=>")
  .replace("(node:HTMLElement|null|undefined)=>","(node)=>");
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

test("v36 fresh Today greets student and mirrors the real countdown without changing old nodes",()=>{
  const nodes=new Map(),callbacks=[],listeners={};
  function el(id,value=""){
    const item={id,textContent:value,dataset:{},style:{setProperty(){}},setAttribute(){}};
    nodes.set(id,item);return item;
  }
  const originalGreeting=el("greeting","İyi akşamlar"),
    originalDays=el("countdown","245"),
    originalDate=el("examDateLabel","13 Haziran 2027");
  const fresh=el("todayFreshStart");
  el("todayFreshDate");el("todayFreshGreeting");el("todayFreshDays");el("todayFreshExamDate");
  const doc={
    getElementById:id=>nodes.get(id)||null,
    querySelector:()=>null,
    addEventListener:(type,fn)=>listeners[type]=fn,
    visibilityState:"visible"
  };
  class Observer{
    constructor(fn){this.fn=fn;callbacks.push(this)}
    observe(node,options){
      assert.ok([originalGreeting,originalDays,originalDate].includes(node));
      assert.equal(options.characterData,true);
    }
  }
  const {installTodayTopV33}=moduleUnderTest({document:doc,MutationObserver:Observer});
  assert.equal(installTodayTopV33().installed,true);
  assert.equal(fresh.dataset.todayWelcome,"ready");
  assert.equal(nodes.get("todayFreshGreeting").textContent,"İyi akşamlar");
  assert.equal(nodes.get("todayFreshDays").textContent,"245");
  assert.equal(nodes.get("todayFreshExamDate").textContent,"13 Haziran 2027");
  assert.match(nodes.get("todayFreshDate").textContent,/\d+\s+\S+/);
  assert.equal(callbacks.length,1);
  originalGreeting.textContent="Günaydın";
  originalDays.textContent="244";
  callbacks[0].fn();
  assert.equal(nodes.get("todayFreshGreeting").textContent,"Günaydın");
  assert.equal(nodes.get("todayFreshDays").textContent,"244");
  // Source text is never overwritten by the new presentation.
  assert.equal(originalDays.textContent,"244");
  assert.equal(originalDate.textContent,"13 Haziran 2027");
  assert.equal(installTodayTopV33().installed,true,"a repeated init is safe");
  assert.equal(callbacks.length,1,"no duplicate observer on repeat init");
});

test("v36 renders only greeting and countdown inside the otherwise blank approved home canvas",()=>{
  const html=read("index.html"),main=read("src/main.ts");
  const i=html.indexOf('id="todayFreshStart"');
  const j=html.indexOf('<!-- Bugün v33',i);
  const visible=html.slice(i,j);
  assert.match(visible,/today-fresh-title/);
  assert.match(visible,/today-fresh-welcome/);
  assert.match(visible,/id="todayFreshDate"/);
  assert.match(visible,/id="todayFreshGreeting"/);
  assert.match(visible,/id="todayFreshDays"/);
  assert.match(visible,/id="todayFreshExamDate"/);
  assert.doesNotMatch(visible,/id="todayHubPlan"|id="sozBox"|id="todayNext"|id="todayClose"/);
  assert.match(html,/#home > :not\(#todayFreshStart\)\{display:none!important\}/);
  assert.match(html,/@media\(max-width:600px\)/);
  assert.match(html,/id="yksBootGuard"/);
  assert.match(main,/void import\("\.\/ui\/today-top-v33"\)/);
});

test("v37 daily quote and progress mirror actual values and update after existing renderer mutations",()=>{
  class Node {
    constructor(id,textContent=""){
      this.id=id;this.textContent=textContent;this.dataset={};this.style={display:"",setProperty:(k,v)=>this.styles[k]=v};
      this.styles={};this.attributes={};this.listeners={};this.disabled=false;this.children={};
    }
    querySelector(s){return this.children[s]||null}
    toggleAttribute(k,v){if(k==="disabled")this.disabled=Boolean(v)}
    setAttribute(k,v){this.attributes[k]=v}
    addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
    click(){for(const fn of this.listeners.click||[])fn()}
  }
  const nodes=new Map(),observed=[],listeners={};
  const add=(id,txt="")=>{const n=new Node(id,txt);nodes.set(id,n);return n};
  const fresh=add("todayFreshStart"),quote=add("sozBox"),button=add("todayFreshNewQuote");
  for(const id of ["todayFreshQuoteCard","todayFreshQuoteText","todayFreshQuoteAuthor",
    "todayFreshProgress","todayFreshRatio","todayFreshPercent","todayFreshProgressStatus","todayFreshProgressBar"]){
    add(id);
  }
  const metricMap=[
    ["todayHubQ","todayHubQSub","todayFreshQuestions","todayFreshQuestionsSub","42","bugünkü soru"],
    ["todayHubMin","todayHubMinSub","todayFreshMinutes","todayFreshMinutesSub","90 dk","çalışma"],
    ["todayHubPlan","todayHubPlanSub","todayFreshPlan","todayFreshPlanSub","50%","2 / 4 görev"],
    ["todayHubReview","todayHubReviewSub","todayFreshReviews","todayFreshReviewsSub","3","bekleyen"]
  ];
  for(const [value,sub,visible,visibleSub,actual,detail] of metricMap){
    add(value,actual);add(sub,detail);add(visible);add(visibleSub);
  }
  quote.children[".sz"]=new Node("quote-value","“Azimli adımlar sonuç getirir.”");
  quote.children[".sza"]=new Node("quote-author","— Bir futbolcu");
  let clicks=0;
  quote.children[".szr"]=new Node("quote-action");
  quote.children[".szr"].addEventListener("click",()=>clicks++);
  const doc={
    getElementById:id=>nodes.get(id)||null,
    querySelector:()=>null,
    addEventListener:(type,fn)=>{listeners[type]=fn},
    visibilityState:"visible"
  };
  class Observer{constructor(fn){this.fn=fn;observed.push(this)}observe(){}}
  const {installTodayTopV33}=moduleUnderTest({document:doc,HTMLElement:Node,MutationObserver:Observer});
  assert.equal(installTodayTopV33().installed,true);
  assert.equal(fresh.dataset.todayOverview,"ready");
  assert.equal(nodes.get("todayFreshQuoteText").textContent,"“Azimli adımlar sonuç getirir.”");
  assert.equal(nodes.get("todayFreshQuoteAuthor").textContent,"— Bir futbolcu");
  assert.equal(button.disabled,false);
  button.click();assert.equal(clicks,1);
  assert.equal(nodes.get("todayFreshQuestions").textContent,"42");
  assert.equal(nodes.get("todayFreshMinutes").textContent,"90 dk");
  assert.equal(nodes.get("todayFreshPlan").textContent,"50%");
  assert.equal(nodes.get("todayFreshReviews").textContent,"3");
  assert.equal(nodes.get("todayFreshRatio").textContent,"2/4");
  assert.equal(nodes.get("todayFreshPercent").textContent,"%50");
  assert.equal(nodes.get("todayFreshProgress").styles["--today-fresh-percent"],"50");
  assert.equal(nodes.get("todayFreshProgressBar").attributes["aria-valuenow"],"50");
  assert.equal(nodes.get("todayFreshProgressBar").attributes["aria-valuetext"],"2 / 4 görev, yüzde 50");
  assert.equal(observed.length,1,"one observer for original data sources");

  nodes.get("todayHubPlan").textContent="100%";
  nodes.get("todayHubPlanSub").textContent="4 / 4 görev";
  nodes.get("todayHubQ").textContent="60";
  quote.children[".sz"].textContent="“Yeni söz.”";
  observed[0].fn();
  assert.equal(nodes.get("todayFreshRatio").textContent,"4/4");
  assert.equal(nodes.get("todayFreshPercent").textContent,"%100");
  assert.equal(nodes.get("todayFreshProgressStatus").textContent,"Bugünkü program görevleri tamamlandı.");
  assert.equal(nodes.get("todayFreshQuestions").textContent,"60");
  assert.equal(nodes.get("todayFreshQuoteText").textContent,"“Yeni söz.”");
  quote.style.display="none";
  observed[0].fn();
  assert.equal(nodes.get("todayFreshQuoteCard").hidden,true,"legacy disabled quote remains disabled");
  assert.equal(installTodayTopV33().installed,true);
  assert.equal(observed.length,1,"repeated init must not duplicate observers");
});

test("v37 renders just the approved grouped daily overview and preserves existing source IDs",()=>{
  const html=read("index.html"),mod=read("src/ui/today-top-v33.ts");
  const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('<!-- ============================== PROGRAM'));
  const visible=home.slice(home.indexOf('id="todayFreshStart"'),home.indexOf('<!-- Bugün v33'));
  for(const id of ["todayFreshQuoteCard","todayFreshQuoteText","todayFreshNewQuote",
    "todayFreshProgress","todayFreshRatio","todayFreshPercent","todayFreshProgressBar",
    "todayFreshQuestions","todayFreshMinutes","todayFreshPlan","todayFreshReviews"]){
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
    assert.ok(visible.includes('id="'+id+'"'),id+" is visible");
  }
  assert.ok(visible.indexOf('today-fresh-welcome')<visible.indexOf('today-fresh-daily'));
  assert.ok(visible.indexOf('today-fresh-quote')<visible.indexOf('today-fresh-progress'));
  assert.doesNotMatch(visible,/id="todayNext"|id="todayClose"|class="v33-home-progress"/);
  assert.match(html,/#home > :not\(#todayFreshStart\)\{display:none!important\}/);
  assert.match(html,/@media\(max-width:600px\)/);
  assert.match(html,/#home #todayFreshStart \.today-fresh-stats\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(mod,/function installTodayOverviewV37/);
  assert.doesNotMatch(mod,/localStorage\.setItem|setDoc\(|updateDoc\(/);
});
