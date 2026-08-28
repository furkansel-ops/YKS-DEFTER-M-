import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";

const require=createRequire(import.meta.url);
const core=require("../modules/study-intelligence-core.js");

test("study intelligence core self-test passes",()=>{
  const r=core.selfTest();
  assert.equal(r.ok,true);
  assert.equal(r.checks.readOnly,true);
});

test("Akıllı Tekrar Merkezi program verisini değiştirmez",()=>{
  const today="2026-08-28";
  const state={
    weeks:{w1:{done:[true,false]}},rows:{r:[1],s:[2]},rowLabels:{r:["09:00"]},
    wrongLog:[
      {subject:"Matematik",topic:"Problemler",n:4,date:"2026-08-27",kind:"dikkat"},
      {subject:"Matematik",topic:"Problemler",n:5,date:"2026-08-20",kind:"bilmiyordum",deneme:44}
    ],denemeler:[],topics:{},solved:{},pomoMin:{}
  };
  const signals=[{exam:"TYT",subject:"Matematik",topic:"Problemler",st:2,conf:2,riskScore:48,dueLate:5,studyLast:"2026-08-01"}];
  const before=core.snapshotSchedule(state);
  const rows=core.repeatRecommendations(state,signals,today);
  const after=core.snapshotSchedule(state);
  assert.equal(before,after);
  assert.ok(rows.length>0);
  assert.equal(rows[0].label,"TEKRAR ETMEN ŞART");
});

test("Hata Defteri 3.0 ayrı günlerde tekrarlanan hatayı ayırır",()=>{
  const r=core.errorInsights({wrongLog:[
    {subject:"Fizik",topic:"Hareket",n:2,date:"2026-08-25",kind:"dikkat"},
    {subject:"Fizik",topic:"Hareket",n:3,date:"2026-08-21",kind:"sure"},
    {subject:"Kimya",topic:"Atom",n:1,date:"2026-08-22",kind:"bilmiyordum"}
  ]},"2026-08-28");
  assert.equal(r.repeated.length,1);
  assert.equal(r.repeated[0].topic,"Hareket");
  assert.equal(r.repeated[0].total,5);
});

test("Deneme Analizi 2.0 aynı türdeki önceki denemeyle karşılaştırır",()=>{
  const r=core.examInsights({denemeler:[
    {id:1,type:"TYT",date:"2026-08-10",totalNet:70,subjectResults:[{name:"Temel Matematik",net:18,y:8,b:14,cap:40}]},
    {id:2,type:"TYT",date:"2026-08-20",totalNet:76,subjectResults:[{name:"Temel Matematik",net:23,y:6,b:11,cap:40}]},
    {id:3,type:"AYT",date:"2026-08-25",totalNet:45,subjectResults:[]}
  ]});
  assert.equal(r.type,"AYT");
  assert.equal(r.delta,null);
  const tyt=core.examInsights({denemeler:[
    {id:1,type:"TYT",date:"2026-08-10",totalNet:70,subjectResults:[]},
    {id:2,type:"TYT",date:"2026-08-20",totalNet:76,subjectResults:[]}
  ]});
  assert.equal(tyt.delta,6);
});
