const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html");
const controller=html.match(/<script id="yksBootController">([\s\S]*?)<\/script>/)?.[1];
const features=["v43Today","v43Analysis","v43Navigation","v43Personalization","refinedShell"];

function harness(){
  const dataset={},frames=[],timers=new Map(),events=new Map(),nodes=new Map();
  let timerId=0,reloads=0,cssReady="1";
  const status={textContent:"Hazırlanıyor…"};
  const retry={hidden:true,addEventListener(type,fn){this[type]=fn;}};
  nodes.set("yksBootStatus",status);nodes.set("yksBootRetry",retry);
  const on=(type,fn)=>events.set(type,fn);
  const document={documentElement:{dataset},getElementById:id=>nodes.get(id)||null,addEventListener:on};
  const window={
    setTimeout(fn,delay){timers.set(++timerId,{fn,delay});return timerId;},
    clearTimeout(id){timers.delete(id);},requestAnimationFrame(fn){frames.push(fn);},
    getComputedStyle(){return {getPropertyValue(){return cssReady;}};},
    addEventListener:on,location:{reload(){reloads++;}},
    localStorage:{getItem(){throw new Error("Opening must not read a legacy theme");},clear(){throw new Error("Retry must preserve student data");}}
  };
  vm.runInNewContext(controller,{window,document});
  return {
    dataset,status,retry,nodes,frames,timers,window,
    event(type){events.get(type)?.();},reloads:()=>reloads,
    timeout(){for(const item of [...timers.values()])item.fn();},
    paint(){while(frames.length)frames.shift()();},
    css(value){cssReady=value;},
    ready(){dataset.v4Runtime="ready";for(const name of features){dataset[name]="true";dataset[name+"Errors"]="0";}nodes.set("refinedBrand",{});nodes.set("refinedProgram",{});}
  };
}

test("critical boot guard hides every legacy descendant before the body can paint",()=>{
  const guard=html.indexOf('id="yksBootGuard"'),body=html.indexOf("<body>");
  assert.ok(guard>=0&&guard<body);
  assert.ok(html.indexOf('id="yksBootShell"')>body&&html.indexOf('id="yksBootShell"')<html.indexOf('id="home"'));
  assert.match(html,/<html[^>]+data-ui-shell="refined-v1"/);
  assert.doesNotMatch(html.match(/<html[^>]*>/)[0],/data-theme(?:=|-)/);
  assert.match(html,/html:not\(\[data-ui-ready="true"\]\) body>\*:not\(#yksBootShell\)\{opacity:0!important;visibility:hidden!important;pointer-events:none!important\}/);
  assert.match(html,/body>\*:not\(#yksBootShell\) \*\{visibility:hidden!important\}/);
  assert.match(html,/html\[data-ui-ready="true"\] #yksBootShell\{display:none!important\}/);
  assert.doesNotMatch(controller,/localStorage|data-theme|uiReady="fallback"/);
});

test("slow startup offers retry and never reveals legacy UI after a timeout",()=>{
  const h=harness();h.event("DOMContentLoaded");h.timeout();
  assert.equal(h.dataset.uiReady,undefined);
  assert.equal(h.dataset.bootState,"waiting");
  assert.equal(h.retry.hidden,false);
  assert.match(h.status.textContent,/Bekleyebilir/);
  h.window.__YKS_BOOT__.reveal();h.paint();
  assert.equal(h.dataset.uiReady,undefined);
});

test("a loading error keeps the shell covered and retry only reloads",()=>{
  const h=harness();h.event("DOMContentLoaded");h.event("error");h.timeout();
  assert.equal(h.dataset.bootState,"error");
  assert.equal(h.dataset.uiReady,undefined);
  assert.equal(h.retry.hidden,false);
  assert.match(h.status.textContent,/tekrar deneyebilirsin/);
  h.retry.click();assert.equal(h.reloads(),1);
});

test("a slow or initially failed load may recover when the full new shell arrives",()=>{
  const h=harness();h.event("error");h.event("DOMContentLoaded");h.timeout();h.ready();
  h.window.__YKS_BOOT__.reveal();
  assert.equal(h.dataset.uiReady,undefined,"ready must wait for the next paint boundary");
  h.paint();
  assert.equal(h.dataset.uiReady,"true");assert.equal(h.dataset.bootState,"ready");assert.equal(h.timers.size,0);
  h.event("error");assert.equal(h.dataset.bootState,"ready","a later optional feature failure must not hide the app");
});

test("each missing visual transformation blocks opening, even if the runtime promise resolved",()=>{
  for(const name of features){
    const h=harness();h.ready();h.dataset[name]="false";h.dataset[name+"Errors"]="1";
    h.window.__YKS_BOOT__.reveal();h.paint();
    assert.equal(h.dataset.uiReady,undefined,name);
    assert.equal(h.dataset.bootState,"error",name);
  }
});

test("optional feature degradation does not block a validated new shell",()=>{
  const h=harness();h.ready();
  h.dataset.v43Runtime="degraded";h.dataset.v43LabQuiz="false";h.dataset.v43LabQuizErrors="1";
  h.dataset.v43LearningCycle="false";h.dataset.v431Resilience="false";
  h.window.__YKS_BOOT__.reveal();h.paint();assert.equal(h.dataset.uiReady,"true");
});

test("the real modern CSS and program DOM must be present before reveal",()=>{
  const h=harness();h.ready();h.css("");h.window.__YKS_BOOT__.reveal();h.paint();
  assert.equal(h.dataset.uiReady,undefined,"missing styles cannot reveal unstyled legacy HTML");
  h.css("1");h.window.__YKS_BOOT__.reveal();h.nodes.delete("refinedProgram");h.paint();
  assert.equal(h.dataset.uiReady,undefined,"validation repeats at the paint boundary");
});

test("bootstrap waits for refined runtime and routes failure to the loading screen",()=>{
  const main=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts"),shell=read("src/ui/refined-shell.ts");
  assert.match(main,/v43Runtime\.ready\.then\(\(\)=>window\.__YKS_BOOT__\?\.reveal\(\),\(\)=>window\.__YKS_BOOT__\?\.fail\(\)\)/);
  assert.match(main,/document\.addEventListener\("DOMContentLoaded",revealAfterRefinedRuntime,\{once:true\}\)/);
  assert.ok(safe.indexOf('loadFeature("refinedShell"')>safe.indexOf('loadFeature("v431Resilience"'));
  assert.match(shell,/const program=installRefinedProgram\(\)/);
});
