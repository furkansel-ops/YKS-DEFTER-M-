const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Hata Defteri premium cila katmanı ana yüzeyleri kapsar",()=>{
  const css=read("modules/ui-polish-error-journal-v1.css");
  assert.match(css,/#errorJournal \.error-journal-head/);
  assert.match(css,/#errorJournal \.error-journal-form/);
  assert.match(css,/#errorJournal \.error-journal-kpi/);
  assert.match(css,/#errorJournal \.error-journal-tools/);
  assert.match(css,/#errorJournal \.error-journal-item/);
  assert.match(css,/#errorJournal \.error-journal-repeat/);
  assert.match(css,/#errorJournal \.error-journal-meta \.ej-topic-link/);
  assert.match(css,/\.error-journal-review-group/);
});

test("Hata Defteri cila katmanı tablet, mobil, dokunmatik ve azaltılmış hareket durumlarını kapsar",()=>{
  const css=read("modules/ui-polish-error-journal-v1.css");
  assert.match(css,/@media \(min-width:980px\)/);
  assert.match(css,/@media \(min-width:760px\) and \(max-width:979px\)/);
  assert.match(css,/@media \(max-width:759px\)/);
  assert.match(css,/@media \(pointer:coarse\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/focus-visible/);
});

test("Hata Defteri cila katmanı ana stil zincirinden yüklenir",()=>{
  const study=read("modules/study-intelligence-v5.css");
  assert.match(study,/ui-polish-error-journal-v1\.css\?v=4\.1\.0-r1/);
});
