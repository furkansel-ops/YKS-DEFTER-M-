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
  assert.match(study,/ui-polish-focus-v1\.css"/);
});


test("Odak sayacı özel dakika ve bitiş saatine göre ayarlanabilir",()=>{
  const index=read("index.html"),app=read("app.js"),css=read("modules/ui-polish-focus-v1.css");
  assert.match(index,/id="customFocusMin"/);
  assert.match(index,/id="focusUntilTime"/);
  assert.match(index,/id="focusCustomStatus"/);
  assert.match(app,/function applyCustomFocusMinutes\(\)/);
  assert.match(app,/function applyFocusUntilTime\(\)/);
  assert.match(app,/Math\.min\(1440,n\|0\)/);
  assert.match(app,/Başlatırsan .*'de biter/);
  assert.match(app,/Math\.floor\(s\/3600\)/);
  assert.match(css,/\.focus-custom-time/);
});


test("Bir saati geçen odak süresi yuvarlak sayaçta taşmaz",()=>{
  const app=read("app.js"),css=read("modules/ui-polish-focus-v1.css");
  assert.match(app,/classList\.toggle\("is-long",timeText\.length>5\)/);
  assert.match(css,/#pomo #pomoTime\.is-long\{[\s\S]*font-size:38px/);
});


test("YPT veya harici sayaçtan tek seferlik odak kaydı eklenebilir",()=>{
  const index=read("index.html"),app=read("app.js"),css=read("modules/ui-polish-focus-v1.css"),contracts=read("src/data/contracts.ts");
  for(const id of ["manualFocusHours","manualFocusMinutes","manualFocusStart","manualFocusSubject","manualFocusTopic","manualFocusSource","manualFocusAddBtn","manualFocusStatus"])assert.match(index,new RegExp('id="'+id+'"'));
  assert.match(app,/function addManualFocus\(\)/);
  assert.match(app,/S\.pomoMin\[day\]=prevTotal\+total/);
  assert.match(app,/S\.pomoSubj\[day\]\[subject\]=prevSubject\+total/);
  assert.match(app,/source:"manual"/);
  assert.match(app,/window\.dispatchEvent\(new CustomEvent\("yks:data-changed"/);
  assert.match(css,/focus-manual-entry/);
  assert.match(contracts,/source:""\|"sw"\|"pomo"\|"manual"/);
});
