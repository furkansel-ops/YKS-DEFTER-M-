const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3.1 runtime resilience is fail-open and lazy-loaded after the stable bootstrap",()=>{
  const main=read("src/main.ts");
  const runtime=read("src/ui/v43-safe-runtime.ts");
  const resilience=read("src/ui/runtime-resilience-v431.ts");

  assert.match(main,/installV43SafeRuntime\(\)/);
  assert.doesNotMatch(main,/runtime-resilience-v431/);
  assert.match(runtime,/import\("\.\/runtime-resilience-v431"\)/);
  assert.match(runtime,/v431Resilience/);
  assert.match(resilience,/addEventListener\("error"/);
  assert.match(resilience,/addEventListener\("unhandledrejection"/);
  assert.match(resilience,/window\.location\.reload\(\)/);
  assert.match(resilience,/MAX_PROBLEMS=10/);
});

test("v4.3.1 diagnostics do not mutate application study data or Program",()=>{
  const resilience=read("src/ui/runtime-resilience-v431.ts");
  assert.doesNotMatch(resilience,/Dexie|firebase|firestore|wrongLog|studyPrefs|weeklyPlan|addToDay|addToToday/i);
  assert.match(resilience,/__yks_v431_storage_probe__/);
  assert.match(resilience,/removeItem\(STORAGE_PROBE\)/);
});

test("v4.3.1 tablet and PC polish protects overflow, touch targets and reduced motion",()=>{
  const css=read("src/ui/runtime-polish-v431.css");
  assert.match(css,/overflow-x:clip/);
  assert.match(css,/min-width:0/);
  assert.match(css,/pointer:coarse/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/safe-area-inset-bottom/);
});
