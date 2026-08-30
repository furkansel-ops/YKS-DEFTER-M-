const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const exam=require("../modules/exam-analysis-v42.js");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

function sampleState(){
  const denemeler=[];
  for(let i=1;i<=10;i++)denemeler.push({id:i,type:"TYT",date:`2026-08-${String(i+10).padStart(2,"0")}`,totalNet:60+i*2,subjectResults:[{name:"Temel Matematik",net:15+[1,4,0,5,2,7,1,8,3,9][i-1],y:8,b:8,cap:40},{name:"Türkçe",net:25+i*.3,y:5,b:5,cap:40}]});
  return {weeks:{w1:{manual:true}},rows:{r:2,s:4},rowLabels:{r:["09:00"],s:[]},denemeler,wrongLog:[
    {deneme:7,subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-17",kind:"dikkat"},
    {deneme:9,subject:"Matematik",topic:"Problemler",n:1,date:"2026-08-19",kind:"bilmiyordum"},
    {deneme:10,subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-20",kind:"dikkat"},
    {deneme:10,subject:"Türkçe",topic:"Paragraf",n:1,date:"2026-08-20",kind:"sure"}
  ]};
}

test("Deneme Analizi 3.0 son 5 ve son 10 serilerini ayrı hesaplar",()=>{
  const state=sampleState(),five=exam.buildExamAnalysis(state,"TYT",5),ten=exam.buildExamAnalysis(state,"TYT",10);
  assert.equal(five.window.length,5);assert.equal(ten.window.length,10);
  assert.equal(five.latest.id,10);assert.equal(ten.netChange,18);
  assert.ok(ten.subjects.find(x=>x.name==="Temel Matematik"&&x.volatility>0));
});

test("yanlış konu yoğunluğu deneme bağlantılarını sayar ve kalıcı hata sinyali üretir",()=>{
  const result=exam.buildExamAnalysis(sampleState(),"TYT",5),topic=result.density.find(x=>x.topic==="Problemler");
  assert.ok(topic);assert.equal(topic.examCount,3);assert.equal(topic.count,5);assert.equal(topic.inLatest,true);
  assert.ok(result.signals.some(x=>x.kind==="persistent-error"&&x.topic==="Problemler"));
});

test("Deneme Analizi 3.0 salt okunurdur ve Programı değiştirmez",()=>{
  const state=sampleState(),before=exam.snapshotSchedule(state);exam.buildExamAnalysis(state,"TYT",10);const after=exam.snapshotSchedule(state);
  assert.equal(before,after);assert.equal(exam.selfTest().programUntouched,true);
});

test("Deneme Analizi 3.0 arayüzü kanıta dayalı ve erişilebilir kalır",()=>{
  const source=read("modules/exam-analysis-v42.js"),stability=read("modules/stability.js");
  assert.match(source,/Deneme Analizi 3\.0/);assert.match(source,/Son 5/);assert.match(source,/Son 10/);
  assert.match(source,/Net arttı ama aynı hata devam ediyor/);assert.match(source,/Yanlış konu yoğunluğu/);assert.match(source,/standart sapma/);
  assert.match(source,/tahmin etmez/);assert.match(source,/Program’a otomatik görev eklemez/);
  assert.match(source,/focus-visible/);assert.match(source,/pointer:coarse/);assert.match(source,/prefers-reduced-motion:reduce/);
  assert.match(stability,/exam-analysis-v42\.js\?v=4\.2\.0-r1/);assert.match(stability,/data-yks-exam-analysis-v42/);assert.match(stability,/__YKS_EXAM_ANALYSIS_V42__/);
  assert.equal(exam.selfTest().ok,true);
});
