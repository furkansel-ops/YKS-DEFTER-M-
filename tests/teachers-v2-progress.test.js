const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const progress=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-progress.ts"),"utf8");
const css=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-progress.css"),"utf8");
const main=()=>fs.readFileSync(path.join(root,"src/main.ts"),"utf8");

test("Hocalar v2 ilerleme yalnız mevcut watched kaydını okur ve çalışma verisine yazmaz",()=>{
  const source=progress();
  assert.match(source,/legacy\.watchedMap\?\.\(\)/);
  assert.match(source,/\.filter\(row=>row\.teacher&&Number\.isFinite\(row\.at\)&&row\.at>0\)/);
  assert.doesNotMatch(source,/\.save\?\.\(/);
  assert.doesNotMatch(source,/localStorage\.setItem/);
  assert.doesNotMatch(source,/state\.studyPrefs\[/);
});

test("Hocalar v2 ilerleme son 7 ve 30 günü önceki 7 günlük dönemle kanıta dayalı karşılaştırır",()=>{
  const source=progress();
  assert.match(source,/const start7=periodStart\(7,now\)/);
  assert.match(source,/const start30=periodStart\(30,now\)/);
  assert.match(source,/const previous7Start=periodStart\(14,now\)/);
  assert.match(source,/row\.at>=previous7Start&&row\.at<start7/);
  assert.match(source,/trendText\(rows7\.length,previous7\.length\)/);
});

test("Hocalar v2 ilerleme hoca, ders ve günlük video dağılımını görünür hesaplar",()=>{
  const source=progress();
  assert.match(source,/rank\(rows30,row=>row\.teacher\)/);
  assert.match(source,/rank\(rows30,row=>row\.subject\|\|"Ders belirtilmemiş"\)/);
  assert.match(source,/sevenDaySeries\(rows7,now\)/);
  assert.match(source,/En çok izlediğin hocalar/);
  assert.match(source,/Ders yoğunluğu/);
  assert.match(source,/Son hareket/);
});

test("Hocalar v2 ilerleme ayrı lazy chunk ve responsive fail-open sınırında kalır",()=>{
  const source=main();
  const style=css();
  assert.match(source,/import\("\.\/ui\/teachers-v2-progress"\)\.catch/);
  assert.match(source,/dataset\.teachersV2Progress="deferred"/);
  assert.match(style,/@media\(max-width:700px\)/);
  assert.match(style,/@media\(pointer:coarse\)/);
  assert.match(style,/@media\(prefers-reduced-motion:reduce\)/);
});
