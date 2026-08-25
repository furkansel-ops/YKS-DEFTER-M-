const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const serviceUrl=pathToFileURL(path.join(root,"src/domain/progress-analysis-service.ts")).href;
const bridgeUrl=pathToFileURL(path.join(root,"src/domain/legacy-progress-analysis-bridge.ts")).href;
const subjects=[
  {exam:"TYT",name:"Matematik",topics:["Problemler","Kümeler"]},
  {exam:"TYT",name:"Türkçe",topics:["Paragraf","Dil Bilgisi"]}
];

function emptyState(){return {solved:{},solvedTopic:{},pomoMin:{},pomoSubj:{},topics:{},denemeler:[],wrongLog:[]};}

test("ilerleme analizi boş veride kesin başarı veya zayıflık yorumu üretmez",async()=>{
  const {analyzeProgress}=await import(serviceUrl),result=analyzeProgress(emptyState(),subjects,[3,7,21],{today:"2026-08-25",days:30});
  assert.equal(result.dataLevel,"empty");assert.equal(result.strongest,null);assert.equal(result.needsAttention,null);
  assert.equal(result.exam.delta,null);assert.equal(result.rhythm.consistencyPercent,0);assert.equal(result.insights.length,1);
});

test("ilerleme analizi az veriyi sınırlı olarak işaretler ve dönemleri doğru ayırır",async()=>{
  const {analyzeProgress}=await import(serviceUrl),state=emptyState();state.pomoMin["2026-08-25"]=40;state.solved["2026-08-25"]=30;state.pomoSubj["2026-08-25"]={Matematik:40};
  const result=analyzeProgress(state,subjects,[3,7,21],{today:"2026-08-25",days:7});
  assert.equal(result.dataLevel,"limited");assert.equal(result.current.minutes,40);assert.equal(result.current.questions,30);assert.equal(result.current.activeDays,1);
  assert.equal(result.deltas.minutes.percent,null);assert.equal(result.strongest,null);assert.equal(result.needsAttention,null);
});

test("ilerleme analizi yoğun veride net, ders, konu, tekrar ve ritmi birlikte hesaplar",async()=>{
  const {analyzeProgress}=await import(serviceUrl),state=emptyState();
  for(let day=0;day<5;day++){
    const date=`2026-08-${String(25-day).padStart(2,"0")}`;state.pomoMin[date]=100;state.solved[date]=80;state.pomoSubj[date]={Matematik:55,Türkçe:45};state.solvedTopic[date]={"TYT|Matematik|Problemler":45,"TYT|Türkçe|Paragraf":35};
  }
  for(let day=0;day<5;day++){const date=`2026-07-${String(26-day).padStart(2,"0")}`;state.pomoMin[date]=50;state.solved[date]=40;}
  state.topics["TYT|Matematik|Problemler"]={st:3,conf:4,ts:"2026-08-10",rev:[0],revDone:{0:"2026-08-13"}};
  state.topics["TYT|Türkçe|Paragraf"]={st:3,conf:4,ts:"2026-08-20",rev:[],revDone:{}};
  state.wrongLog=[{date:"2026-08-24",subject:"Matematik",topic:"Problemler",n:5}];
  state.denemeler=[
    {id:1,type:"TYT",name:"Önce 1",date:"2026-07-10",totalNet:60,dur:165,subjectResults:[{name:"Temel Matematik",d:20,y:8,b:12,net:18,cap:40},{name:"Türkçe",d:30,y:6,b:4,net:28.5,cap:40}]},
    {id:2,type:"TYT",name:"Önce 2",date:"2026-07-20",totalNet:62,dur:165,subjectResults:[{name:"Temel Matematik",d:21,y:8,b:11,net:19,cap:40},{name:"Türkçe",d:31,y:5,b:4,net:29.75,cap:40}]},
    {id:3,type:"TYT",name:"Şimdi 1",date:"2026-08-10",totalNet:70,dur:165,subjectResults:[{name:"Temel Matematik",d:19,y:9,b:12,net:16.75,cap:40},{name:"Türkçe",d:34,y:4,b:2,net:33,cap:40}]},
    {id:4,type:"TYT",name:"Şimdi 2",date:"2026-08-23",totalNet:74,dur:165,subjectResults:[{name:"Temel Matematik",d:20,y:8,b:12,net:18,cap:40},{name:"Türkçe",d:35,y:3,b:2,net:34.25,cap:40}]}
  ];
  const result=analyzeProgress(state,subjects,[3,7,21],{today:"2026-08-25",days:30});
  assert.equal(result.dataLevel,"ready");assert.equal(result.exam.type,"TYT");assert.equal(result.exam.delta,11);
  assert.equal(result.strongest.name,"Türkçe");assert.equal(result.needsAttention.name,"Matematik");assert.equal(result.needsAttention.wrongs,5);
  assert.equal(result.topic.completed,2);assert.ok(result.reviews.pending>0);assert.equal(result.rhythm.currentStreak,5);assert.equal(result.rhythm.longestStreak,5);
  assert.ok(result.insights.length<=3);assert.ok(result.insights.some(line=>line.includes("Matematik")));
});

test("ilerleme analiz köprüsü çalışan state bağlamını güvenle kullanır",async()=>{
  const previous={window:global.window,document:global.document,CustomEvent:global.CustomEvent},state=emptyState();state.solved["2026-08-25"]=20;
  try{
    global.window={dispatchEvent:()=>{},YKSLegacyState:{readState:()=>state,subjects:()=>subjects,reviewGaps:()=>[3,7,21]}};
    global.document={documentElement:{dataset:{}}};global.CustomEvent=class{constructor(type,options){this.type=type;this.detail=options?.detail;}};
    const {installLegacyProgressAnalysisBridge}=await import(`${bridgeUrl}?test=1`),api=installLegacyProgressAnalysisBridge();
    assert.equal(api.validate().length,0);assert.equal(api.version,"4.0.0-r14");assert.equal(window.__YKS_PROGRESS_ANALYSIS__,api);assert.equal(document.documentElement.dataset.v4ProgressAnalysis,"ready");
  }finally{
    if(previous.window===undefined)delete global.window;else global.window=previous.window;
    if(previous.document===undefined)delete global.document;else global.document=previous.document;
    if(previous.CustomEvent===undefined)delete global.CustomEvent;else global.CustomEvent=previous.CustomEvent;
  }
});
