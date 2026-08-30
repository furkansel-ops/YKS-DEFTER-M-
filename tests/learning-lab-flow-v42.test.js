const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const flow=require("../modules/learning-lab-flow-v42.js");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Laboratuvar 2.0 kaldığın yeri tekilleştirerek saklar",()=>{
  let state=flow.mergeRecent({}, {type:"topic",key:"AYT|Biyoloji (AYT)|Sinir Sistemi",label:"Sinir Sistemi",at:1});
  state=flow.mergeRecent(state,{type:"topic",key:"AYT|Biyoloji (AYT)|Sinir Sistemi",label:"Sinir Sistemi",meta:"AYT · Biyoloji",at:2});
  state=flow.mergeRecent(state,{type:"organ",key:"brain",organ:"brain",label:"Beyin",at:3});
  assert.equal(state.recent.length,2);
  assert.equal(state.recent[0].type,"organ");
  assert.equal(state.recent[1].at,2);
});

test("Atlas organları gerçek AYT Biyoloji konu rehberlerine bağlanır",()=>{
  assert.equal(Object.keys(flow.organTopics).length,9);
  assert.deepEqual(flow.organCourseTopic("heart"),{id:"heart",name:"Kalp",exam:"AYT",subject:"Biyoloji (AYT)",topic:"Dolaşım-Bağışıklık"});
  assert.equal(flow.organCourseTopic("pancreas").topic,"Endokrin Sistem");
  assert.equal(flow.organCourseTopic("eyeball").topic,"Duyu Organları");
  assert.equal(flow.organCourseTopic("ear"),null);
});

test("favori konu anahtarı ayraç içeren konu adını bozmadan çözer",()=>{
  const parsed=flow.parseTopicFavorite("TYT|Matematik|Fonksiyon | Grafik");
  assert.equal(parsed.exam,"TYT");assert.equal(parsed.subject,"Matematik");assert.equal(parsed.topic,"Fonksiyon | Grafik");
});

test("Laboratuvar akışı Program verisini değiştirmez ve 3B modeli önden yüklemez",()=>{
  const source=read("modules/learning-lab-flow-v42.js"),stability=read("modules/stability.js"),sw=read("sw.js");
  assert.equal(flow.selfTest().ok,true);assert.equal(flow.selfTest().programUntouched,true);
  assert.match(source,/Kaldığın yer/);assert.match(source,/Favoriler/);assert.match(source,/AYT konu rehberi/);
  assert.match(source,/3B içerik yalnız kullanıcı Atlas\/organı açtığında yüklenir/);
  assert.doesNotMatch(source,/biology-atlas-model/);assert.doesNotMatch(source,/WebGLRenderer/);assert.doesNotMatch(source,/\bimport\s*\(/);
  assert.doesNotMatch(source,/\.weeks\s*\[/);assert.doesNotMatch(source,/\baddToToday\s*\(/);
  assert.match(source,/focus-visible/);assert.match(source,/pointer:coarse/);assert.match(source,/prefers-reduced-motion:reduce/);
  assert.match(stability,/progress-v42\.js\?v=4\.2\.0-r1/);
  assert.match(stability,/learning-lab-flow-v42\.js\?v=4\.2\.0-r1/);
  assert.match(sw,/progress-v42\.js\?v=4\.2\.0-r1/);
  assert.match(sw,/learning-lab-flow-v42\.js\?v=4\.2\.0-r1/);
  assert.match(sw,/const CACHE="yks-core-v4\.2\.0-r1"/);
  assert.match(sw,/yks-core-v4\.1\.0-r40/);
  assert.doesNotMatch(sw,/anatomy\/models\/[^"']+\.glb/);
});
