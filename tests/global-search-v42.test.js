const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.2 global arama mevcut aramayı Laboratuvar içeriğiyle birleştirir",()=>{
  const s=read("modules/global-search-v42.js");
  assert.match(s,/legacyGlobalSearch/);
  assert.match(s,/YKSLearningLab/);
  assert.match(s,/topicCatalog/);
  assert.match(s,/lab-element/);
  assert.match(s,/lab-timeline/);
  assert.match(s,/v4OpenLabTopic/);
  assert.match(s,/v320SelectElement/);
  assert.match(s,/v320FilterTimeline/);
  assert.match(s,/window\.YKSGlobalSearchV42/);
});

test("global arama klavye, dokunmatik ve erişilebilirlik akışını korur",()=>{
  const s=read("modules/global-search-v42.js");
  assert.match(s,/metaKey/);
  assert.match(s,/ArrowDown/);
  assert.match(s,/aria-modal="true"/);
  assert.match(s,/role="listbox"/);
  assert.match(s,/focus-visible/);
  assert.match(s,/@media\(pointer:coarse\)/);
  assert.match(s,/prefers-reduced-motion:reduce/);
});

test("global arama sadece gezinir; Program verisini otomatik değiştiren mutator çağrıları içermez",()=>{
  const s=read("modules/global-search-v42.js");
  assert.doesNotMatch(s,/\baddToToday\s*\(/);
  assert.doesNotMatch(s,/\baddToDay\s*\(/);
  assert.doesNotMatch(s,/\bgetWeek\s*\([^)]*,\s*true\s*\)/);
  assert.doesNotMatch(s,/\.weeks\s*\[/);
  assert.match(s,/Arama yalnız yönlendirir/);
});

test("global arama çalışma zamanında yüklenir",()=>{
  const stability=read("modules/stability.js");
  assert.match(stability,/global-search-v42\.js\?v=4\.2\.0-r1/);
  assert.match(stability,/data-yks-global-search-v42/);
  assert.match(stability,/__YKS_GLOBAL_SEARCH_V42__/);
});
