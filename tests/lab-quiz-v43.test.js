const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const serviceUrl=pathToFileURL(path.join(root,"src/domain/lab-quiz-service.ts")).href;
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Öğrenme Laboratuvarı 3.0 YKS öncelikli yapıları sınama turunda öne alır ve tekilleştirir",async()=>{
  const {buildStructureQuiz}=await import(serviceUrl);
  const values=[
    {id:"a",label:"A",priority:false},{id:"b",label:"B",priority:true},{id:"b",label:"B tekrar",priority:true},
    {id:"c",label:"C",priority:false},{id:"d",label:"D",priority:true},{id:"e",label:"E",priority:false},{id:"f",label:"F",priority:false}
  ];
  const quiz=buildStructureQuiz(values,4,()=>.999);
  assert.equal(quiz.length,4);assert.equal(new Set(quiz.map(x=>x.id)).size,4);
  assert.deepEqual(quiz.slice(0,2).map(x=>x.id),["b","d"]);
  assert.deepEqual(quiz.map(x=>x.number),[1,2,3,4]);
});

test("3B yapı sınaması doğru yanlış ve sonuç yüzdesini yalnız oturum verisinden hesaplar",async()=>{
  const {buildStructureQuiz,gradeStructureAnswer,summarizeStructureQuiz}=await import(serviceUrl);
  const quiz=buildStructureQuiz([{id:"left",label:"Sol karıncık",priority:true},{id:"right",label:"Sağ karıncık",priority:true}],2,()=>.5);
  const a=gradeStructureAnswer(quiz[0],quiz[0].id),b=gradeStructureAnswer(quiz[1],"yanlis");
  assert.equal(a.correct,true);assert.equal(b.correct,false);
  assert.deepEqual(summarizeStructureQuiz(quiz,[a,b]),{total:2,answered:2,correct:1,wrong:1,percent:50,finished:true});
});

test("etiketsiz sınama model isimlerini gizler ama dokunma hedeflerini ve erişilebilirliği korur",()=>{
  const ui=read("src/ui/lab-quiz-v43.ts"),css=read("src/ui/lab-quiz-v43.css");
  assert.match(ui,/data-model-point/);assert.match(ui,/Yanıt noktası/);assert.match(ui,/atlasModelOpen/);assert.match(ui,/atlasModelLabels/);
  assert.match(css,/data-lab-quiz-mode="quiz"/);assert.match(css,/\.atlas-model-point-name\{display:none/);assert.match(css,/\.atlas-model-dot::after\{content:"\?"/);
  assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
});

test("Laboratuvar 3.0 quiz güvenli runtime'a bağlıdır ve Program ya da çalışma verisine yazmaz",()=>{
  const ui=read("src/ui/lab-quiz-v43.ts"),main=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts");
  assert.match(main,/installV43SafeRuntime/);assert.doesNotMatch(main,/from "\.\/ui\/lab-quiz-v43"/);
  assert.match(safe,/import\("\.\/lab-quiz-v43"\)/);assert.match(safe,/installLabQuizV43/);assert.match(safe,/v43LabQuiz/);assert.match(safe,/v43LabQuizErrors/);
  assert.doesNotMatch(ui,/\blocalStorage\b/);assert.doesNotMatch(ui,/\bsave\s*\(/);assert.doesNotMatch(ui,/\baddToToday\s*\(/);assert.doesNotMatch(ui,/\baddToDay\s*\(/);assert.doesNotMatch(ui,/\.weeks\s*\[/);assert.doesNotMatch(ui,/\.rows\s*\[/);
});

test("Laboratuvar quiz keşfi tüm document ağacını sürekli izlemez",()=>{
  const ui=read("src/ui/lab-quiz-v43.ts");
  assert.doesNotMatch(ui,/observe\(document\.documentElement/);
  assert.match(ui,/getElementById\("v320PanelAtlas"\)/);
  assert.match(ui,/discoveryAttempts>=24/);
  assert.match(ui,/yks:navigation-after/);
});
