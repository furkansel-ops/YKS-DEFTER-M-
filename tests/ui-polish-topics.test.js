const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Konular ekranı premium cila katmanı ana konu yüzeylerini kapsar",()=>{
  const css=read("modules/ui-polish-topics-v1.css");
  assert.match(css,/\.wrap:has\(#topics\.active\)/);
  assert.match(css,/#topics \.v26-topic-tools/);
  assert.match(css,/#topics \.v26-topic-kpi/);
  assert.match(css,/#topics \.subj/);
  assert.match(css,/#topics \.topic-state/);
  assert.match(css,/#topics \.topic-open/);
  assert.match(css,/\.v26-topic-sheet/);
  assert.match(css,/\.v4-topic-goal-row/);
});

test("Konular cila katmanı tablet, mobil, dokunmatik ve azaltılmış hareket durumlarını kapsar",()=>{
  const css=read("modules/ui-polish-topics-v1.css");
  assert.match(css,/@media \(min-width:760px\)/);
  assert.match(css,/@media \(max-width:759px\)/);
  assert.match(css,/@media \(pointer:coarse\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/focus-visible/);
});

test("Konular cila katmanı ana stil zincirinden yüklenir",()=>{
  const study=read("modules/study-intelligence-v5.css");
  assert.match(study,/ui-polish-topics-v1\.css\?v=4\.1\.0-r1/);
});
