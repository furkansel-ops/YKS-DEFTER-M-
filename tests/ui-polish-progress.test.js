const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("İlerleme ekranı premium cila katmanı ana yüzeyleri kapsar",()=>{
  const css=read("modules/ui-polish-progress-v1.css");
  assert.match(css,/\.wrap:has\(#progress\.active\)/);
  assert.match(css,/#progress \.progress-head/);
  assert.match(css,/#progress \.progress-stats/);
  assert.match(css,/#progress #v28Score/);
  assert.match(css,/#progress #personalProgressV2/);
  assert.match(css,/#progress \.desktop-progress-grid/);
  assert.match(css,/#progress #progressCompare/);
  assert.match(css,/#progress #progressNet/);
  assert.match(css,/#progress \.v28-week-grid/);
  assert.match(css,/#progress \.v28-calendar/);
});

test("İlerleme modern dashboard cila katmanı görünür v4 analizlerini öne çıkarır",()=>{
  const css=read("modules/ui-polish-progress-v2.css");
  assert.match(css,/#progress>\.v4-progress-overview/);
  assert.match(css,/#progress \.v4-progress-kpi/);
  assert.match(css,/#progress \.v4-progress-insights/);
  assert.match(css,/#progress \.v4-subject-callout/);
  assert.match(css,/#progress \.v4-mini-metric/);
  assert.match(css,/#progress \.v4-simple-progress/);
  assert.match(css,/#progress>\.v4-progress-details/);
});

test("İlerleme cila katmanı tablet, mobil, dokunmatik ve azaltılmış hareket durumlarını kapsar",()=>{
  const css=read("modules/ui-polish-progress-v1.css");
  const modern=read("modules/ui-polish-progress-v2.css");
  assert.match(css,/@media \(min-width:980px\)/);
  assert.match(css,/@media \(min-width:760px\) and \(max-width:979px\)/);
  assert.match(css,/@media \(max-width:759px\)/);
  assert.match(css,/@media \(pointer:coarse\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/focus-visible/);
  assert.match(modern,/@media \(max-width:759px\)/);
  assert.match(modern,/@media \(pointer:coarse\)/);
  assert.match(modern,/prefers-reduced-motion:reduce/);
});

test("İlerleme cila katmanları ana stil zincirinden yüklenir",()=>{
  const study=read("modules/study-intelligence-v5.css");
  assert.match(study,/ui-polish-progress-v1\.css\?v=4\.1\.0-r1/);
  assert.match(study,/ui-polish-progress-v2\.css\?v=4\.1\.0-r1/);
});