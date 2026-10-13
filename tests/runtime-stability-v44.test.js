const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("Stability: legacy Today observer listens only to plan and next, not the whole app",()=>{
  const src=read("src/ui/today-v43.ts");
  assert.match(src,/const planSource=getElement\("todayPlan"\),nextSource=getElement\("todayNext"\)/);
  assert.match(src,/observer\.observe\(planSource,\{childList:true,subtree:true,characterData:true\}\)/);
  assert.match(src,/observer\.observe\(nextSource,\{childList:true,subtree:true,characterData:true\}\)/);
  assert.doesNotMatch(src,/observer\.observe\(home,\{childList:true,subtree:true,characterData:true\}\)/);
  assert.match(src,/if\(queued\)return;/);
  assert.match(src,/requestAnimationFrame\(run\)/);
  assert.match(src,/observer\.disconnect\(\)/);
  assert.match(src,/finally\{observe\(\);\}/);
});

test("Stability: focus clock changes never trigger full task and next recomputation",()=>{
  const src=read("src/ui/today-workspace-v38.ts");
  assert.match(src,/if\(target===plan\|\|plan\.contains\(target\)\)tasksDirty=true/);
  assert.match(src,/else if\(target===next\|\|next\.contains\(target\)\)nextDirty=true/);
  assert.match(src,/else focusDirty=true/);
  assert.match(src,/if\(focusDirty\)refreshFocus\(\)/);
  assert.match(src,/if\(tasksDirty\)refreshTasks\(\)/);
  assert.match(src,/requestAnimationFrame\(flush\)/);
  assert.doesNotMatch(src,/new MutationObserver\(sync\)/);
});

test("Stability: evidence snapshot invalidated on save and indexes repeated wrong-topic lookups",()=>{
  const s=read("app.js");
  const start=s.indexOf("window.yksTodayInsightsSnapshot=function()");
  const end=s.indexOf("window.yksTodayInsightsCompleteReview",start);
  assert.ok(start>0&&end>start);
  const src=s.slice(start,end);
  assert.match(src,/perfMemo\("today-insights-v44:"\+todayKey\(\),\(\)=>\{/);
  assert.match(src,/const known=new Map\(\),resolved=new Map\(\)/);
  assert.match(src,/if\(!resolved\.has\(raw\)\)resolved\.set\(raw,known\.get\(raw\)\|\|v26ResolveKey/);
  assert.match(s,/function save\(\)\{[\s\S]{0,400}perfInvalidateState\(\)/);
  assert.match(s,/function perfInvalidateState\(\)\{[\s\S]{0,140}perfMemoCache\.clear\(\)/);
  assert.doesNotMatch(src,/localStorage\.setItem|S\.topics\[.+\]=|S\.wrongLog\.push/);
});

test("Stability: noncritical visual add-ons have startup fail-open boundaries",()=>{
  const main=read("src/main.ts");
  for(const [name,call] of [
    ["science-cards","installScienceCards"],
    ["biology-atlas","installBiologyAtlas"],
    ["chemistry-visuals","installChemistryVisualsBridgeV44"],
    ["lab-interactions","installLabInteractionsBridgeV44"]
  ]){
    assert.ok(main.includes('installOptional<unknown>("'+name+'",()=>'+call+'(),null)'),
      name+" cannot crash the critical bootstrap");
  }
  assert.match(main,/document\.documentElement\.dataset\.v4Runtime="ready"/);
  assert.doesNotMatch(main,/localStorage\.clear\(\)|indexedDB\.deleteDatabase\(/);
});
