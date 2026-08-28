const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Odak ekranı premium cila katmanı tablet, mobil ve erişilebilirlik durumlarını kapsar",()=>{
  const css=read("modules/ui-polish-focus-v1.css");
  assert.match(css,/\.wrap:has\(#pomo\.active\)/);
  assert.match(css,/#pomo \.focuscard\[data-run="running"\]/);
  assert.match(css,/#pomo \.fcctl/);
  assert.match(css,/#pomo \.quickmins/);
  assert.match(css,/focus-visible/);
  assert.match(css,/@media \(min-width:760px\)/);
  assert.match(css,/@media \(max-width:759px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});

test("Odak cila katmanı ana stil zincirinden yüklenir",()=>{
  const study=read("modules/study-intelligence-v5.css");
  assert.match(study,/ui-polish-focus-v1\.css\?v=4\.1\.0-r1/);
});
