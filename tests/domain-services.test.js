const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const topicUrl=pathToFileURL(path.join(root,"src/domain/topic-service.ts")).href;
const activityUrl=pathToFileURL(path.join(root,"src/domain/activity-service.ts")).href;
const bridgeUrl=pathToFileURL(path.join(root,"src/domain/legacy-domain-bridge.ts")).href;

function state(){return {topics:{},solved:{},pomoMin:{},sessions:{},focus:{cycles:4}};}

test("konu servisi durum ve güven değişikliklerini veri kaybetmeden uygular",async()=>{
  const topics=await import(topicUrl),s=state(),key=topics.topicKey("TYT","Matematik","Problemler");
  assert.deepEqual(topics.topicFor(s,key),{st:0,conf:0,ts:null,rev:[]});
  topics.setTopicStatus(s,key,3,"2026-08-25");assert.equal(s.topics[key].st,3);assert.equal(s.topics[key].ts,"2026-08-25");
  topics.setTopicConfidence(s,key,5);assert.equal(s.topics[key].conf,5);topics.setTopicConfidence(s,key,5);assert.equal(s.topics[key].conf,0);
  topics.setTopicStatus(s,key,2,"2026-08-25");assert.equal(s.topics[key].ts,null);assert.deepEqual(s.topics[key].rev,[]);
  s.topics[key].legacyField="koru";topics.setTopicStatus(s,key,3,"2026-08-26");assert.equal(s.topics[key].legacyField,"koru");
});

test("konu servisi ders ilerlemesi ve tekrar kuyruğunu doğru hesaplar",async()=>{
  const topics=await import(topicUrl),s=state(),a=topics.topicKey("TYT","Matematik","Problemler"),b=topics.topicKey("TYT","Matematik","Kümeler");
  s.topics[a]={st:3,conf:4,ts:"2026-08-01",rev:[]};s.topics[b]={st:2,conf:2,ts:null,rev:[]};
  assert.deepEqual(topics.subjectProgress(s,"TYT",{name:"Matematik",topics:["Problemler","Kümeler"]}),{pct:83,full:1,total:2});
  assert.equal(topics.overallTopicProgress(s,[{exam:"TYT",name:"Matematik",topics:["Problemler","Kümeler"]}]),83);
  const queue=topics.reviewQueue(s,"2026-08-25",[3,7,21]);assert.deepEqual(queue.map(x=>x.gap),[3,7,21]);assert.equal(queue[0].late,21);
  assert.equal(topics.completeReview(s,a,0,"2026-08-25"),true);assert.deepEqual(s.topics[a].rev,[0]);assert.equal(s.topics[a].revDone[0],"2026-08-25");
  assert.equal(topics.completeReview(s,"yok",0,"2026-08-25"),false);
});

test("konu servisi sınav yüzdesi, hedefler ve yaklaşan tekrar planını üretir",async()=>{
  const topics=await import(topicUrl),s=state(),a=topics.topicKey("TYT","Matematik","Problemler"),b=topics.topicKey("TYT","Matematik","Kümeler"),c=topics.topicKey("AYT","Fizik","Dalgalar");
  s.topics[a]={st:3,conf:4,ts:"2026-08-20",rev:[],dl:"2026-08-24"};s.topics[b]={st:1,conf:2,ts:null,rev:[],dl:"2026-08-30"};s.topics[c]={st:2,conf:3,ts:null,rev:[]};
  const subjects=[{exam:"TYT",name:"Matematik",topics:["Problemler","Kümeler"]},{exam:"AYT",name:"Fizik",topics:["Dalgalar"]}];
  assert.deepEqual(topics.examTopicProgress(s,subjects,"TYT"),{exam:"TYT",pct:67,done:1,working:1,untouched:0,total:2,remainingSteps:2});
  const goals=topics.topicGoals(s,"2026-08-26");assert.equal(goals.total,2);assert.equal(goals.completed,1);assert.equal(goals.upcoming,1);assert.equal(goals.overdue,0);
  const plan=topics.upcomingReviewPlan(s,"2026-08-26",[3,7,21],7);assert.equal(plan.length,1);assert.equal(plan[0].topic,"Problemler");assert.equal(plan[0].status,"overdue");assert.equal(plan[0].gi,0);
});

test("çalışma servisi toplamları ve günlük oturumları doğru yönetir",async()=>{
  const activity=await import(activityUrl),s=state();s.solved={a:40,b:60};s.pomoMin={a:25,b:35};s.topics={a:{st:3,conf:1,rev:[0,1]},b:{st:2,conf:2,rev:[]}};
  assert.equal(activity.totalSolved(s),100);assert.equal(activity.totalMinutes(s),60);assert.equal(activity.completedTopicCount(s),1);assert.equal(activity.completedReviewCount(s),2);
  const sessions=activity.sessionsForDate(s,"2026-08-25");assert.deepEqual(sessions,[]);sessions.push({type:"work",done:true},{type:"work",done:true},{type:"break",done:true});
  assert.equal(activity.completedWorkCycles(s,"2026-08-25"),2);assert.equal(activity.longBreakIsNext(s,"2026-08-25"),false);s.focus.cycles=2;assert.equal(activity.longBreakIsNext(s,"2026-08-25"),true);
});

test("legacy alan köprüsü güncellemeleri mevcut save zincirinden geçirir",async()=>{
  const previous={window:global.window,document:global.document,CustomEvent:global.CustomEvent},s=state();let saves=0;
  try{
    global.window={dispatchEvent:()=>{},YKSLegacyState:{readJSON:()=>JSON.stringify(s),applyJSON:()=>({ok:true,json:""}),readState:()=>s,save:()=>{saves++;return true;},memo:(_key,compute)=>compute(),subjects:()=>[{exam:"TYT",name:"Matematik",topics:["Problemler"]}],reviewGaps:()=>[3,7,21]}};
    global.document={documentElement:{dataset:{}}};global.CustomEvent=class{constructor(type,options){this.type=type;this.detail=options&&options.detail;}};
    const {installLegacyDomainBridge}=await import(`${bridgeUrl}?bridge=1`),api=installLegacyDomainBridge(),key=window.tkey("TYT","Matematik","Problemler");
    window.tsetStatus(key,3);window.tsetConf(key,4);assert.equal(s.topics[key].st,3);assert.equal(s.topics[key].conf,4);assert.equal(saves,2);
    s.solved={today:75};s.pomoMin={today:90};assert.equal(window.totalSolved(),75);assert.equal(window.totalMinutes(),90);assert.deepEqual(window.todaySessions(),[]);
    assert.deepEqual(api.validate(),[]);assert.equal(document.documentElement.dataset.v4Domain,"ready");
  }finally{
    if(previous.window===undefined)delete global.window;else global.window=previous.window;
    if(previous.document===undefined)delete global.document;else global.document=previous.document;
    if(previous.CustomEvent===undefined)delete global.CustomEvent;else global.CustomEvent=previous.CustomEvent;
  }
});
