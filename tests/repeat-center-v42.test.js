const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createRequire}=require("node:module");
const requireCore=createRequire(__filename);
const root=path.resolve(__dirname,"..");
const core=requireCore("../modules/study-intelligence-core.js");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Akıllı Tekrar Merkezi 2.0 deneme yanlışı, gecikme, güven ve çalışma yaşını açıklar",()=>{
  const today="2026-08-30";
  const state={weeks:{w:{}},rows:{r:[]},rowLabels:{r:[]},wrongLog:[
    {subject:"Matematik",topic:"Problemler",n:3,date:"2026-08-29",kind:"dikkat",deneme:7},
    {subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-20",kind:"bilmiyordum",deneme:6},
    {subject:"Matematik",topic:"Problemler",n:1,date:"2026-08-12",kind:"islem"}
  ]};
  const signals=[{exam:"TYT",subject:"Matematik",topic:"Problemler",st:2,conf:1,riskScore:38,dueLate:6,studyLast:"2026-08-05",reasons:[]}];
  const before=core.snapshotSchedule(state),rows=core.repeatRecommendations(state,signals,today),after=core.snapshotSchedule(state);
  assert.equal(before,after);assert.equal(rows.length,1);assert.equal(rows[0].severity,"must");
  assert.ok(rows[0].reasons.some(x=>/farklı gün/.test(x)));
  assert.ok(rows[0].reasons.some(x=>/deneme bağlantılı/.test(x)));
  assert.ok(rows[0].reasons.some(x=>/gecikmiş tekrar/.test(x)));
  assert.ok(rows[0].reasons.some(x=>/güven 1\/5/.test(x)));
  assert.ok(rows[0].reasons.some(x=>/son çalışma 25 gün önce/.test(x)));
  assert.ok(rows[0].factors.every(x=>typeof x.points==="number"));
  assert.equal(core.repeatVersion,"2.0.0");
});

test("Akıllı Tekrar Merkezi 2.0 Program ve konu durumuna otomatik yazma içermez",()=>{
  const runtime=read("modules/repeat-center-v42.js"),bridge=read("src/ui/repeat-center-bridge.ts");
  assert.match(runtime,/Program tamamen manuel/);
  assert.match(runtime,/Bugün tamamladım/);assert.match(runtime,/3 gün ertele/);assert.match(runtime,/Neden burada\?/);
  assert.match(runtime,/yks_repeat_actions_v42/);assert.match(runtime,/localStorage\.setItem\(STORE_KEY/);
  assert.doesNotMatch(runtime,/program\.push|program\.splice|weeks\s*=|rows\s*=|tset\(|firebase|indexedDB|Dexie/i);
  assert.match(bridge,/repeat-center-v42\.js\?v=4\.2\.0-r1/);
});

test("Tekrar Merkezi 2.0 mobil, dokunmatik ve azaltılmış hareket desteği taşır",()=>{
  const css=read("modules/repeat-center-v42.css"),sw=read("sw.js");
  assert.match(css,/@media\(max-width:720px\)/);assert.match(css,/@media\(pointer:coarse\)/);assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(sw,/repeat-center-v42\.js\?v=4\.2\.0-r1/);assert.match(sw,/repeat-center-v42\.css\?v=4\.2\.0-r1/);
  assert.match(sw,/const CACHE="yks-core-v4\.1\.0-r41"/);assert.match(sw,/yks-core-v4\.1\.0-r40/);
});
