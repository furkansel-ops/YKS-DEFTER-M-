"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {spawnSync}=require("node:child_process");
const path=require("node:path");

test("Aşama 1 başarımlar: etkinleşme, iki hedef, ertesi gün hedefi, seviye ve ödül tekilliği",()=>{
  // TS domain gerçek kaynak dosyası Node 22+ type-stripping ile çalıştırılır.
  const filename=path.resolve(__dirname,"../src/domain/study-gamification.ts");
  const sourceUrl=require("node:url").pathToFileURL(filename).href;
  const script=String.raw\`
import assert from "node:assert/strict";
import {createGamificationProfile,calculateStudyGamification,setNextDayGoal,levelForXp}
  from "\${sourceUrl}";
const at=new Date("2026-10-08T10:00:00+03:00");
const state={
  pomoMin:{"2026-10-07":400,"2026-10-08":50},
  solved:{"2026-10-07":1200,"2026-10-08":20},
  denemeler:[{at:at.getTime()-10000,date:"2026-10-07"}]
};
state.gamification=createGamificationProfile(at,60,40,state);
let snap=calculateStudyGamification(state,at);
assert.equal(snap.activated,true);
assert.equal(snap.xp,0,"Geçmiş çalışmalardan XP üretilmemeli");
assert.equal(snap.totalMinutes,0);
assert.equal(snap.totalQuestions,0);
assert.equal(snap.totalExams,0);
assert.equal(snap.currentStreak,0);
state.pomoMin["2026-10-08"]=110;
state.solved["2026-10-08"]=59;
snap=calculateStudyGamification(state,new Date("2026-10-08T11:00:00+03:00"));
assert.equal(snap.todayMinutes,60);
assert.equal(snap.todayQuestions,39);
assert.equal(snap.todayCompleted,false,"İki hedef şartı birlikte sağlanmalı");
assert.equal(snap.currentStreak,0);
state.solved["2026-10-08"]=60;
snap=calculateStudyGamification(state,new Date("2026-10-08T11:00:00+03:00"));
assert.equal(snap.todayCompleted,true);
assert.equal(snap.currentStreak,1);
assert.equal(snap.totalMinutes,60);
assert.equal(snap.totalQuestions,40);
assert.equal(snap.xp,190,"30 süre + 20 soru + 50 gün bonusu + 90 başarım");
assert.equal(snap.newBadgeIds.length,3);
const [first]=snap.newBadgeIds;
state.gamification.earned[first]={at:at.getTime()+1000,xp:30};
snap=calculateStudyGamification(state,new Date("2026-10-08T11:00:00+03:00"));
assert.equal(snap.xp,190,"Aynı rozet tekrar XP üretmemeli");
assert.equal(snap.newBadgeIds.includes(first),false);
state.gamification=setNextDayGoal(state.gamification,new Date("2026-10-08T12:00:00+03:00"),120,100);
snap=calculateStudyGamification(state,new Date("2026-10-08T12:00:00+03:00"));
assert.equal(snap.goalMinutes,60,"Hedef değiştirme bugün etkilememeli");
state.pomoMin["2026-10-09"]=90;
state.solved["2026-10-09"]=120;
snap=calculateStudyGamification(state,new Date("2026-10-09T11:00:00+03:00"));
assert.equal(snap.goalMinutes,120);
assert.equal(snap.goalQuestions,100);
assert.equal(snap.todayCompleted,false,"Yarının yeni süre hedefi sağlanmalı");
state.pomoMin["2026-10-09"]=120;
snap=calculateStudyGamification(state,new Date("2026-10-09T11:00:00+03:00"));
assert.equal(snap.todayCompleted,true);
assert.equal(snap.currentStreak,2);
assert.deepEqual(levelForXp(0),{level:1,progress:0,goal:200});
assert.deepEqual(levelForXp(199),{level:1,progress:199,goal:200});
assert.deepEqual(levelForXp(200),{level:2,progress:0,goal:250});
assert.deepEqual(levelForXp(450),{level:3,progress:0,goal:300});
assert.throws(()=>createGamificationProfile(at,0,0,state),/Süre/);
assert.throws(()=>setNextDayGoal(state.gamification,at,90,-10),/Soru/);
console.log("OK: 16 temel oyunlaştırma senaryosu");
\`;
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",script],{
    cwd:path.resolve(__dirname,".."),encoding:"utf8",timeout:20000
  });
  assert.equal(result.status,0,["TypeScript gerçek kaynak testi başarısız",result.stdout,result.stderr].join("\n"));
  assert.match(result.stdout,/OK: 16 temel/);
});
