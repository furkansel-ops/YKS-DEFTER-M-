const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Program premium cila katmanı manuel planın ana yüzeylerini kapsar",()=>{
  const css=read("modules/ui-polish-program-v1.css");
  assert.match(css,/\.wrap:has\(#program\.active\)/);
  assert.match(css,/#program \.weeknav/);
  assert.match(css,/#program \.program-fast-entry-hint/);
  assert.match(css,/#program \.scroller/);
  assert.match(css,/#program \.gtable/);
  assert.match(css,/#program \.gcell/);
  assert.match(css,/#program \.rowtools/);
  assert.match(css,/#program #progCal/);
});

test("Program cila katmanı tablet, mobil, dokunmatik, klavye ve azaltılmış hareket durumlarını kapsar",()=>{
  const css=read("modules/ui-polish-program-v1.css");
  assert.match(css,/@media \(min-width:900px\)/);
  assert.match(css,/@media \(max-width:759px\)/);
  assert.match(css,/@media \(pointer:coarse\)/);
  assert.match(css,/focus-visible/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});

test("Program cila katmanı mevcut cila zinciri ve PWA çekirdeğinden yüklenir",()=>{
  const progress=read("modules/ui-polish-progress-v2.css");
  const sw=read("sw.js");
  assert.match(progress,/ui-polish-program-v1\.css\?v=4\.1\.0-r1/);
  assert.match(sw,/ui-polish-program-v1\.css\?v=4\.1\.0-r1/);
});

test("Program otomatik program üreticisine dönüşmez",()=>{
  const css=read("modules/ui-polish-program-v1.css");
  const app=read("app.js");
  assert.match(css,/Program üretmez\/değiştirmez/);
  assert.doesNotMatch(app,/auto(?:matic)?ProgramGenerator|generateProgramAutomatically|autoGenerateProgram/i);
});
