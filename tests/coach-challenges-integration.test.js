"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {spawnSync}=require("node:child_process"),fs=require("node:fs");
const path=require("node:path"),{pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const uri=pathToFileURL(path.join(root,"src/domain/study-gamification.ts")).href;
const core=require("../modules/core-utils.js");
test("koç ödülü tekilleştirilir ve koç haftası başına en fazla 150 XP alınır",()=>{
  const script=[
    'import assert from "node:assert/strict";',
    'import {calculateStudyGamification,createGamificationProfile} from "'+uri+'";',
    'const at=new Date("2026-10-08T10:00:00+03:00"),now=new Date("2026-10-08T12:00:00+03:00");',
    'const state={pomoMin:{},solved:{}};state.gamification=createGamificationProfile(at,60,40,state);',
    'const base=calculateStudyGamification(state,now).xp;',
    'state.gamification.coachRewards={',
    '"student_coach_2026-10-05_0":{at:at.getTime()+100,xp:20},',
    '"student_coach_2026-10-05_1":{at:at.getTime()+100,xp:35},',
    '"student_coach_2026-10-05_2":{at:at.getTime()+100,xp:50},',
    '"student_coach_2026-10-05_3":{at:at.getTime()+100,xp:999},',
    '"student_coach_2026-10-12_0":{at:at.getTime()+100,xp:35},',
    '"student_coach_2026-10-12_free-AAAA2222":{at:at.getTime()+100,xp:50},',
    '"student_coach_2026-10-19_0":{at:at.getTime()-200,xp:50}',
    '};',
    'assert.equal(calculateStudyGamification(state,now).xp-base,140);',
    'assert.equal(calculateStudyGamification(state,now).xp-base,140,"aynı ödül tekrar eklenmez");',
    'console.log("OK: koç XP ödülleri");'
  ];
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",script.join("\n")],{
    cwd:root,encoding:"utf8",timeout:20000
  });
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/OK: koç XP/);
});
test("koç bildirim ve ödülleri iki cihazdan birleştirildiğinde kaybolmaz",()=>{
  const base={version:1,activatedAt:1791453600000,activationDay:"2026-10-08",
    baselineMinutes:0,baselineQuestions:0,goals:[],earned:{},restDays:[]};
  const a={gamification:{...base,coachRewards:{"s_c_2026-10-05_0":{xp:20,at:1791453600100}},
    coachSeen:{"task1":"assigned"},coachNotifications:[{id:"task1:assigned",title:"Görev",text:"Fizik",status:"assigned",at:1791453600100}]}};
  const b={gamification:{...base,coachRewards:{"s_c_2026-10-05_1":{xp:35,at:1791453600200}},
    coachSeen:{"task2":"approved"},coachNotifications:[{id:"task2:approved",title:"Onay",text:"Fizik",status:"approved",at:1791453600200}]}};
  const next=core.mergeStates(a,b,21).gamification;
  assert.equal(Object.keys(next.coachRewards).length,2);
  assert.equal(next.coachNotifications.length,2);
  assert.equal(next.coachSeen.task1,"assigned");
  assert.equal(next.coachSeen.task2,"approved");
});
test("kural, bildirim ve dinamik yükleme sözleşmesi geliştirme dalında bulunur",()=>{
  const rules=read("firestore.rules"),runtime=read("public/student-coaching-runtime.js"),
    client=read("public/coach-challenges-student.js"),firebase=JSON.parse(read("firebase.json"));
  assert.match(rules,/match \/coachChallenges\/\{challengeId\}/);
  assert.match(rules,/activeCoachingLink/);
  assert.match(rules,/status == 'approved'/);
  assert.match(rules,/data\.slot == '0'/);
  assert.match(runtime,/import\("\.\/coach-challenges-student\.js"\)/);
  assert.match(client,/installCoachStudentChallenges/);
  assert.match(client,/status:"submitted"/);
  assert.equal(firebase.firestore.indexes,"firestore.indexes.json");
  const indexes=JSON.parse(read("firestore.indexes.json"));
  assert.equal(indexes.indexes[0].collectionGroup,"coachChallenges");
});
