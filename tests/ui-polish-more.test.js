const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Daha ekranı premium cila katmanı ana araç merkezini kapsar",()=>{
  const css=read("modules/ui-polish-more-v1.css");
  assert.match(css,/\.wrap:has\(#more\.active\)/);
  assert.match(css,/#more \.v30-more-title/);
  assert.match(css,/#more \.v30-search-card/);
  assert.match(css,/#more \.v30-status/);
  assert.match(css,/#more \.v30-quick-grid/);
  assert.match(css,/#more \.v30-menu-grid/);
  assert.match(css,/#more \.v30-menu-card/);
  assert.match(css,/#more \.v30-subhead/);
  assert.match(css,/#more \.v30-back/);
});

test("Daha cila katmanı PC, tablet, mobil, dokunmatik ve azaltılmış hareket durumlarını kapsar",()=>{
  const css=read("modules/ui-polish-more-v1.css");
  assert.match(css,/@media \(min-width:980px\)/);
  assert.match(css,/@media \(min-width:760px\) and \(max-width:979px\)/);
  assert.match(css,/@media \(max-width:759px\)/);
  assert.match(css,/@media \(pointer:coarse\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/focus-visible/);
});

test("Daha cila katmanı ana stil zincirinden yüklenir",()=>{
  const study=read("modules/study-intelligence-v5.css");
  assert.match(study,/ui-polish-more-v1\.css\?v=4\.1\.0-r1/);
});
