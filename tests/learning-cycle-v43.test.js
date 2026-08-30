const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const serviceUrl=pathToFileURL(path.join(root,"src/domain/learning-cycle-analysis-service.ts")).href;
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3 öğrenme döngüsü çözüldükten sonra yeniden gelen aynı konuyu işaretler",async()=>{
  const {analyzeLearningCycle}=await import(serviceUrl),resolvedAt=Date.UTC(2026,7,15,12);
  const result=analyzeLearningCycle({
    wrongLog:[
      {id:1,subject:"Fizik",topic:"Optik",n:1,date:"2026-08-10",kind:"dikkat"},
      {id:2,subject:"Fizik",topic:"Optik",n:2,date:"2026-08-20",kind:"bilmiyordum"}
    ],
    errorJournal:[{id:"e1",subject:"Fizik",topic:"Optik",createdAt:Date.UTC(2026,7,10),resolved:true,resolvedAt,review:true}],
    manualReviews:[{id:"rev_e1",journalId:"e1",subject:"Fizik",topic:"Optik",completedAt:resolvedAt,closedBy:"review-done"}]
  });
  assert.equal(result.returned,1);assert.equal(result.topics[0].status,"returned");assert.equal(result.topics[0].returnedAfterResolve,true);assert.equal(result.topics[0].wrongTotal,3);
  assert.match(result.insights[0],/çözüldü işaretinden sonra/i);
});

test("v4.3 öğrenme döngüsü tekrar eden açık hatayı ve bekleyen tekrarı birlikte sayar",async()=>{
  const {analyzeLearningCycle}=await import(`${serviceUrl}?repeat=1`),result=analyzeLearningCycle({
    wrongLog:[{id:1,subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-12"},{id:2,subject:"Matematik",topic:"Problemler",n:1,date:"2026-08-26"}],
    errorJournal:[{id:"e2",subject:"Matematik",topic:"Problemler",createdAt:Date.UTC(2026,7,26),resolved:false,review:true}],
    manualReviews:[{id:"rev_e2",journalId:"e2",subject:"Matematik",topic:"Problemler",createdAt:Date.UTC(2026,7,26),completedAt:0}]
  });
  assert.equal(result.repeating,1);assert.equal(result.pendingReviews,1);assert.equal(result.open,1);assert.equal(result.topics[0].differentWrongDays,2);assert.equal(result.topics[0].status,"repeating");
});

test("v4.3 öğrenme döngüsü eski kayıtları değiştirmez ve Program mutasyonu içermez",()=>{
  const service=read("src/domain/learning-cycle-analysis-service.ts"),ui=read("src/ui/learning-cycle-v43.ts");
  assert.match(service,/wrongLog/);assert.match(service,/errorJournal/);assert.match(service,/manualReviews/);assert.match(service,/returnedAfterResolve/);
  assert.match(ui,/Hata → Öğren → Tekrar → Kontrol/);assert.match(ui,/errorJournalOpenTopic/);assert.match(ui,/v4OpenLabTopic/);assert.match(ui,/reviewBox/);
  assert.doesNotMatch(ui,/\baddToToday\s*\(/);assert.doesNotMatch(ui,/\baddToDay\s*\(/);assert.doesNotMatch(ui,/\.weeks\s*\[/);assert.doesNotMatch(ui,/\.rows\s*\[/);assert.doesNotMatch(ui,/\.save\s*\(/);
});

test("v4.3 öğrenme döngüsü güvenli lazy runtime ve Deneme ekranı yenilemesine bağlıdır",()=>{
  const main=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts"),screen=read("src/ui/screens/exams.ts"),css=read("src/ui/learning-cycle-v43.css");
  assert.match(main,/installV43SafeRuntime/);assert.doesNotMatch(main,/from "\.\/ui\/learning-cycle-v43"/);
  assert.match(safe,/import\("\.\/learning-cycle-v43"\)/);assert.match(safe,/installLearningCycleV43/);assert.match(safe,/__YKS_V43_RENDER_LEARNING_CYCLE__=mod\.renderLearningCycleV43/);assert.match(safe,/v43LearningCycleErrors/);
  assert.doesNotMatch(screen,/from "\.\.\/learning-cycle-v43"/);assert.match(screen,/__YKS_V43_RENDER_LEARNING_CYCLE__/);assert.match(screen,/renderLearningCycleV43/);
  assert.match(css,/@media\(pointer:coarse\)/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/focus-visible/);
});
