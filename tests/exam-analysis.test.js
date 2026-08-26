const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const serviceUrl=pathToFileURL(path.join(root,"src/domain/exam-analysis-service.ts")).href;
const bridgeUrl=pathToFileURL(path.join(root,"src/domain/legacy-exam-analysis-bridge.ts")).href;
function state(){return {denemeler:[],wrongLog:[]};}

test("deneme analizi boş veride kesin yorum üretmez",async()=>{
  const {analyzeExams}=await import(serviceUrl),result=analyzeExams(state(),"TYT",10);
  assert.equal(result.dataLevel,"empty");assert.equal(result.count,0);assert.equal(result.latest,null);assert.equal(result.period.delta,null);
  assert.equal(result.strongest,null);assert.equal(result.needsAttention,null);assert.equal(result.pair.available,false);assert.equal(result.insights.length,1);
});

test("tek deneme sınırlı veri sayılır ve olmayan karşılaştırma uydurulmaz",async()=>{
  const {analyzeExams}=await import(serviceUrl),s=state();s.denemeler.push({id:1,type:"TYT",name:"İlk",date:"2026-08-25",dur:165,totalNet:65,subjectResults:[{name:"Türkçe",d:30,y:5,b:5,net:28.75,cap:40}]});
  const result=analyzeExams(s,"TYT",5);assert.equal(result.dataLevel,"limited");assert.equal(result.average,65);assert.equal(result.lastDelta,null);assert.equal(result.trend.direction,"unknown");
  assert.equal(result.pair.available,false);assert.equal(result.strongest,null);assert.equal(result.balance.knownCount,1);
});

test("yoğun deneme verisi dönem, ders, yanlış yoğunluğu ve son ikili karşılaştırmayı hesaplar",async()=>{
  const {analyzeExams}=await import(serviceUrl),s=state();
  for(let index=0;index<6;index++)s.denemeler.push({id:100+index,type:"TYT",name:`TYT ${index+1}`,date:`2026-0${index<4?7:8}-${String(5+index*3).padStart(2,"0")}`,dur:150-index,totalNet:60+index*3,subjectResults:[{name:"Türkçe",d:30+index,y:6-index,b:4,net:28.5+index*1.25,cap:40},{name:"Temel Matematik",d:20+index,y:8,b:12-index,net:18+index,cap:40}]});
  s.wrongLog=[{id:1,date:"2026-08-19",subject:"Matematik",topic:"Problemler",n:4,deneme:105},{id:2,date:"2026-08-16",subject:"Matematik",topic:"Problemler",n:3,deneme:104},{id:3,date:"2026-08-16",subject:"Türkçe",topic:"Paragraf",n:3,deneme:104}];
  const result=analyzeExams(s,"TYT",10);assert.equal(result.dataLevel,"ready");assert.equal(result.count,6);assert.equal(result.period.delta,9);assert.equal(result.trend.direction,"up");assert.equal(result.trend.slopePerExam,3);
  assert.equal(result.strongest.name,"Türkçe");assert.equal(result.needsAttention.name,"Matematik");assert.equal(result.wrongTopics[0].name,"Problemler");assert.equal(result.wrongTopics[0].examCount,2);assert.equal(result.wrongTopics[0].sharePercent,70);
  assert.equal(result.pair.available,true);assert.equal(result.pair.netDelta,3);assert.equal(result.pair.durationDelta,-1);assert.ok(result.pair.subjects.some(item=>item.name==="Matematik"&&item.delta===1));assert.ok(result.insights.length<=3);
});

test("deneme türü ve son kayıt penceresi birbirinden ayrılır",async()=>{
  const {analyzeExams}=await import(serviceUrl),s=state();for(let index=0;index<8;index++)s.denemeler.push({id:index,type:"TYT",name:`T${index}`,date:`2026-08-${String(10+index).padStart(2,"0")}`,dur:160,totalNet:50+index,subjectResults:[]});s.denemeler.push({id:99,type:"AYT",name:"A1",date:"2026-08-25",dur:180,totalNet:40,subjectResults:[]});
  const tyt=analyzeExams(s,"TYT",5),ayt=analyzeExams(s,"AYT",10);assert.equal(tyt.count,5);assert.equal(tyt.latest.net,57);assert.equal(ayt.count,1);assert.equal(ayt.latest.name,"A1");
});

test("deneme analiz köprüsü çalışan state bağlamını kullanır",async()=>{
  const previous={window:global.window,document:global.document,CustomEvent:global.CustomEvent},s=state();
  try{
    global.window={dispatchEvent:()=>{},YKSLegacyState:{readState:()=>s}};global.document={documentElement:{dataset:{}}};global.CustomEvent=class{constructor(type,options){this.type=type;this.detail=options?.detail;}};
    const {installLegacyExamAnalysisBridge}=await import(`${bridgeUrl}?test=1`),api=installLegacyExamAnalysisBridge();assert.equal(api.version,"4.0.0-r15");assert.deepEqual(api.validate(),[]);assert.equal(window.__YKS_EXAM_ANALYSIS__,api);assert.equal(document.documentElement.dataset.v4ExamAnalysis,"ready");
  }finally{
    if(previous.window===undefined)delete global.window;else global.window=previous.window;if(previous.document===undefined)delete global.document;else global.document=previous.document;if(previous.CustomEvent===undefined)delete global.CustomEvent;else global.CustomEvent=previous.CustomEvent;
  }
});
