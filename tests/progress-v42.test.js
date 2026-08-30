const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const progress=require("../modules/progress-v42.js");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

function sampleState(){
  const state={weeks:{w1:{manual:true}},rows:{r:2,s:4},rowLabels:{r:["09:00"],s:[]},pomoMin:{},solved:{},pomoSubj:{},sessions:{},topics:{
    "TYT|Matematik|Problemler":{st:3,conf:4,ts:"2026-08-25",revDone:{}},
    "TYT|Türkçe|Paragraf":{st:2,conf:3,ts:"2026-08-28",revDone:{}},
    "TYT|Fizik|Hareket":{st:1,conf:2,ts:"2026-08-29",revDone:{}}
  },denemeler:[
    {id:1,type:"TYT",date:"2026-07-20",totalNet:60,subjectResults:[{name:"Temel Matematik",net:20},{name:"Türkçe",net:25}]},
    {id:2,type:"TYT",date:"2026-08-12",totalNet:68,subjectResults:[{name:"Temel Matematik",net:26},{name:"Türkçe",net:27}]},
    {id:3,type:"TYT",date:"2026-08-25",totalNet:72,subjectResults:[{name:"Temel Matematik",net:30},{name:"Türkçe",net:28}]}
  ]};
  for(let i=0;i<30;i++){const key=progress.addDays("2026-08-30",-i);state.pomoMin[key]=60;state.solved[key]=40;state.pomoSubj[key]={Matematik:45,Türkçe:15};}
  for(let i=0;i<15;i++){const key=progress.addDays("2026-07-31",-i);state.pomoMin[key]=30;state.solved[key]=20;state.pomoSubj[key]={Matematik:20,Türkçe:10};}
  return state;
}

test("İlerleme 3.0 haftalık ve aylık sürekliliği önceki eşit dönemle karşılaştırır",()=>{
  const result=progress.continuity(sampleState(),"2026-08-30");
  assert.equal(result.week.current.active,7);
  assert.equal(result.month.current.active,30);
  assert.ok(result.month.activeDelta>0);
  assert.ok(result.month.minDelta>0);
});

test("ders çalışma süresi ile net değişimi aynı 30 günlük bağlamda gösterilir",()=>{
  const result=progress.subjectContext(sampleState(),"2026-08-30",30),math=result.rows.find(row=>row.name==="Matematik");
  assert.ok(math);
  assert.ok(math.studyMin>math.previousStudyMin);
  assert.ok(math.netAvg>math.previousNetAvg);
  assert.ok(math.netDelta>0);
  assert.equal(math.examCount,2);
});

test("konu sağlığı günlük snapshot ile gerçek geçmiş biriktirir ve geçmiş uydurmaz",()=>{
  const state=sampleState();
  const first=progress.captureHealthSnapshot(state,"2026-08-23");
  state.topics["TYT|Matematik|Problemler"]={st:3,conf:2,ts:"2026-08-25",revDone:{}};
  const second=progress.captureHealthSnapshot(state,"2026-08-30"),analysis=progress.buildProgressAnalysis(state,"2026-08-30");
  assert.equal(first.changed,true);assert.equal(second.changed,true);
  assert.equal(analysis.history.rows.length,2);
  assert.ok(analysis.history.weekDelta);
  assert.equal(analysis.history.monthDelta,null);
  assert.ok(analysis.health.repeat>=1);
});

test("snapshot geçmişi ve DOM çizim sınırları büyük veri yükünü sınırlar",()=>{
  const rows=[];for(let i=0;i<150;i++)rows.push({date:progress.addDays("2026-08-30",-i),learning:1,consolidating:2,ready:3,repeat:4,tracked:10});
  assert.equal(progress.normalizeSnapshots(rows).length,120);
  assert.equal(progress.limits.subjects,8);
  assert.equal(progress.limits.history,14);
  assert.equal(progress.limits.exams,400);
});

test("İlerleme 3.0 Programı değiştirmez ve legacy progress-v2 üzerinden yüklenir",()=>{
  const state=sampleState(),before=progress.snapshotSchedule(state);progress.buildProgressAnalysis(state,"2026-08-30");progress.captureHealthSnapshot(state,"2026-08-30");const after=progress.snapshotSchedule(state);
  assert.equal(before,after);assert.equal(progress.selfTest().programUntouched,true);
  const source=read("modules/progress-v42.js"),legacy=read("modules/progress-v2.js");
  assert.match(source,/İlerleme 3\.0/);assert.match(source,/Program’a otomatik görev eklemez/);
  assert.match(source,/DOM_SUBJECT_LIMIT=8/);assert.match(source,/DOM_HISTORY_LIMIT=14/);assert.match(source,/MAX_SNAPSHOTS=120/);
  assert.match(source,/pointer:coarse/);assert.match(source,/prefers-reduced-motion:reduce/);
  assert.match(legacy,/progress-v42\.js\?v=4\.2\.0-r1/);assert.match(legacy,/data-yks-progress-v42/);assert.match(legacy,/__YKS_PROGRESS_V42__/);
  assert.match(legacy,/window\.YKSProgressV2=\{version:"2\.0\.0"/);
  assert.equal(progress.selfTest().ok,true);
});
