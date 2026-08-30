const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const repeat=require("../modules/smart-repeat-v42.js");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Akıllı Tekrar Merkezi 2.0 kanıtları daha açıklanabilir sıralar",()=>{
  const today="2026-08-30";
  const state={
    weeks:{w1:{done:[true,false]}},rows:{r:2,s:4},rowLabels:{r:["09:00"],s:[]},
    denemeler:[{id:7,type:"TYT",date:"2026-08-29",totalNet:80}],
    wrongLog:[
      {subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-29",deneme:7},
      {subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-20"},
      {subject:"Matematik",topic:"Problemler",n:1,date:"2026-08-10"}
    ]
  };
  const recommendations=[{subject:"Matematik",topic:"Problemler",score:55,reasons:[],studyAge:14,dueLate:2,conf:2,st:2,wrong:{total:5,repeatDays:3,last:"2026-08-29"}}];
  const before=repeat.snapshotSchedule(state),center=repeat.buildRepeatCenter(recommendations,state,today,{}),after=repeat.snapshotSchedule(state);
  assert.equal(center.active.length,1);
  assert.ok(center.active[0].reasons.includes("3 farklı günde yanlış"));
  assert.ok(center.active[0].reasons.includes("son denemede yanlış"));
  assert.ok(center.active[0].reasons.includes("14 gündür tekrar edilmedi"));
  assert.equal(before,after);
});

test("tamamlanan ve ertelenen tekrarlar Programı değiştirmeden yönetilir",()=>{
  const today="2026-08-30",key="matematik|problemler";
  const state={weeks:{w1:{x:1}},rows:{r:2,s:4},rowLabels:{r:["09:00"],s:[]},denemeler:[],wrongLog:[]};
  const recommendations=[{subject:"Matematik",topic:"Problemler",score:70,reasons:[],studyAge:20,dueLate:3,conf:2,st:2,wrong:{total:2,repeatDays:1,last:"2026-08-28"}}];
  const before=repeat.snapshotSchedule(state);
  const done=repeat.buildRepeatCenter(recommendations,state,today,{[key]:{status:"done",at:today,until:repeat.addDays(today,7)}});
  const deferred=repeat.buildRepeatCenter(recommendations,state,today,{[key]:{status:"deferred",at:today,until:repeat.addDays(today,3)}});
  assert.equal(done.completed.length,1);assert.equal(done.active.length,0);
  assert.equal(deferred.deferred.length,1);assert.equal(deferred.active.length,0);
  assert.equal(repeat.snapshotSchedule(state),before);
});

test("tamamlandıktan sonra yeni yanlış gelirse öneri hemen geri döner",()=>{
  const key="matematik|problemler",action={status:"done",at:"2026-08-30",until:"2026-09-06"};
  const state={denemeler:[],wrongLog:[{subject:"Matematik",topic:"Problemler",n:1,date:"2026-08-31"}]};
  const recommendations=[{subject:"Matematik",topic:"Problemler",score:65,reasons:[],studyAge:15,dueLate:0,conf:2,st:2,wrong:{total:3,repeatDays:2,last:"2026-08-31"}}];
  const center=repeat.buildRepeatCenter(recommendations,state,"2026-08-31",{[key]:action});
  assert.equal(center.active.length,1);assert.equal(center.completed.length,0);
});

test("Akıllı Tekrar Merkezi 2.0 arayüzü erişilebilir ve manuel Program sözleşmesini korur",()=>{
  const source=read("modules/smart-repeat-v42.js"),stability=read("modules/stability.js");
  assert.match(source,/Akıllı Tekrar Merkezi 2\.0/);
  assert.match(source,/intelRepeatV42/);
  assert.match(source,/Tamamladım/);assert.match(source,/3 gün ertele/);
  assert.match(source,/focus-visible/);assert.match(source,/pointer:coarse/);assert.match(source,/prefers-reduced-motion:reduce/);
  assert.match(source,/Program’a otomatik ders veya görev eklemez, silmez ya da düzenlemez/);
  assert.doesNotMatch(source,/\baddToToday\s*\(/);assert.doesNotMatch(source,/\baddToDay\s*\(/);assert.doesNotMatch(source,/\.weeks\s*\[/);
  assert.match(stability,/smart-repeat-v42\.js\?v=4\.2\.0-r1/);
  assert.match(stability,/data-yks-smart-repeat-v42/);
  assert.match(stability,/__YKS_SMART_REPEAT_V42__/);
  assert.equal(repeat.selfTest().ok,true);
});
