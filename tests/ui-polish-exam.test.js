const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Deneme ekranı premium cila katmanı analiz, karşılaştırma ve responsive durumları kapsar",()=>{
  const css=read("modules/ui-polish-exam-v1.css");
  assert.match(css,/\.wrap:has\(#deneme\.active\)/);
  assert.match(css,/#deneme \.v315-kpis/);
  assert.match(css,/#deneme \.v315-dash-grid/);
  assert.match(css,/#deneme \.v4-exam-compare-card/);
  assert.match(css,/#deneme \.v315-subject-table/);
  assert.match(css,/focus-visible/);
  assert.match(css,/@media \(min-width:980px\)/);
  assert.match(css,/@media \(max-width:759px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});

test("Deneme cila katmanı ana stil zincirinden yüklenir",()=>{
  const study=read("modules/study-intelligence-v5.css");
  assert.match(study,/ui-polish-exam-v1\.css\?v=4\.1\.0-r1/);
});
