const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v128 hesap: kayıp net, nedenler, hedef tahmini, öneriler",()=>{
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",[
    'import assert from "node:assert/strict";',
    `import {subjectLosses,topTopics,reasonShares,examsToTarget,reportActions} from "${pathToFileURL(path.join(root,"src/domain/exam-report.ts")).href}";`,
    // Mat: 40 soru, 24D 8Y 8B → net 22, kayıp 18 = 10 (yanlış) + 8 (boş). Fen: 20 soru 15D 1Y 4B → kayıp 5,25. Türkçe yalnız net: atlanır.
    'const exams=[{subjectResults:[{name:"Matematik",d:24,y:8,b:8,cap:40},{name:"Fen Bilimleri",d:15,y:1,b:4,cap:20},{name:"Türkçe",net:30}]},',
    '             {subjectResults:[{name:"Matematik",d:26,y:6,b:8,cap:40}]}];',
    'const L=subjectLosses(exams);',
    'assert.deepEqual(L.map(l=>l.name),["Matematik","Fen Bilimleri"]);',
    'assert.deepEqual({cap:L[0].cap,net:L[0].net,lost:L[0].lost,w:L[0].fromWrong,b:L[0].fromBlank},{cap:40,net:23.3,lost:16.8,w:8.8,b:8});',
    'assert.equal(Math.round(L[0].accuracy*100),78);',
    'assert.equal(L[1].fromBlank,4);assert.equal(Math.round(L[1].accuracy*100),94);',
    // Yanlış kaydı olmayan cap alanı: d+y+b soru sayısı sayılır
    'assert.equal(subjectLosses([{subjectResults:[{name:"X",d:5,y:4,b:1}]}])[0].lost,6);',
    'const wrongs=[{subject:"Matematik",topic:"Problemler",n:3,kind:"dikkat"},{subject:"matematik",topic:"problemler",n:1,kind:"dikkat"},{subject:"Fizik",topic:"Optik",kind:"bilmiyordum"},{subject:"Fizik",topic:"Optik",kind:"garip"},{subject:"",topic:"x"}];',
    'const T=topTopics(wrongs);assert.deepEqual(T[0],{subject:"Matematik",topic:"Problemler",n:4});assert.equal(T.length,2);',
    'const R=reasonShares(wrongs);assert.deepEqual(R.map(r=>[r.kind,r.n,r.pct]),[["bilmiyordum",1,14],["dikkat",4,57],["",2,29]]);',
    'assert.equal(examsToTarget(80,1,90),10);assert.equal(examsToTarget(80,0,90),null);assert.equal(examsToTarget(95,1,90),null);assert.equal(examsToTarget(10,0.1,90),null);',
    'const A=reportActions({topics:T,losses:L,reasons:R,bestHour:"Fizik"});',
    'assert.equal(A.length,3);',
    'assert.equal(A[0].plan,"Matematik · Problemler tekrarı");',
    'assert.match(A[1].text,/^Fen Bilimleri: ortalama 4 boş, işaretlediklerinde isabet %94/);assert.equal(A[1].plan,"Fen Bilimleri süreli soru çözümü");',
    'assert.match(A[2].text,/^Yanlışların en çok dikkatten \\(%57\\)/);assert.equal(A[2].plan,undefined);',
    // Veri azsa öneri uydurulmaz
    'assert.deepEqual(reportActions({topics:[{subject:"a",topic:"b",n:1}],losses:[],reasons:[{kind:"dikkat",label:"",n:4,pct:100}]}),[]);',
    'console.log("OK report");'
  ].join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/OK report/);
});
