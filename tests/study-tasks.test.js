"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
const core=require("../modules/core-utils.js");

test("Aşama 2 görevler: otomatik üretim, tek ödül, zorluk ve yeniden seçme",()=>{
 const sourceUrl=pathToFileURL(path.resolve(__dirname,"../src/domain/study-gamification.ts")).href;
 const taskUrl=pathToFileURL(path.resolve(__dirname,"../src/domain/study-tasks.ts")).href;
 const source=String.raw`
import assert from "node:assert/strict";
import {createGamificationProfile,calculateStudyGamification,planRestDay} from "${sourceUrl}";
import {ensureCurrentTasks,grantCompletedTasks,taskPanel,rerollDailyTask,scheduleDifficulty} from "${taskUrl}";
const date=(d,h="12:00")=>new Date(d+"T"+h+":00+03:00");
const state={pomoMin:{"2026-10-08":40},solved:{"2026-10-08":20}};
const first=date("2026-10-08","10:00");
state.gamification=createGamificationProfile(first,60,40,state);
state.gamification=ensureCurrentTasks(state.gamification,first);
let panel=taskPanel(state,first);
assert.equal(panel.daily.length,3);
assert.equal(panel.weekly.length,2);
assert.equal(panel.daily[0].minutes,0);
assert.equal(panel.daily[0].questions,0);
assert.equal(panel.weekly[0].minutes,0);
assert.equal(panel.daily[0].task.xp,25);
assert.equal(panel.weekly[0].task.xp,100);
const previous=state.gamification;
assert.equal(ensureCurrentTasks(previous,first),previous,"Yeniden çizimde görevleri tekrar üretme");
state.gamification=rerollDailyTask(state,state.gamification,first,panel.daily[2].task.id);
assert.ok(state.gamification.tasks.rerolledDays.includes("2026-10-08"));
assert.throws(()=>rerollDailyTask(state,state.gamification,first,panel.daily[1].task.id),/hakkın/);
state.gamification=scheduleDifficulty(state.gamification,first,"hard");
panel=taskPanel(state,first);
assert.equal(panel.difficulty,"normal");
assert.equal(panel.nextDifficulty,"hard");
state.pomoMin["2026-10-08"]=100;state.solved["2026-10-08"]=60;
let awards=grantCompletedTasks(state,state.gamification,date("2026-10-08","13:00"));
assert.equal(awards.granted.length,3,"3 günlük görev; haftalık hedefler henüz tamamlanmadı");
state.gamification=awards.profile;
const xpBefore=calculateStudyGamification(state,date("2026-10-08","13:00")).xp;
assert.ok(xpBefore>0);
awards=grantCompletedTasks(state,state.gamification,date("2026-10-08","14:00"));
assert.equal(awards.granted.length,0);
assert.equal(calculateStudyGamification(state,date("2026-10-08","14:00")).xp,xpBefore);
assert.throws(()=>rerollDailyTask(state,state.gamification,date("2026-10-08","14:00"),
 panel.daily[0].task.id),/hakkın/);
const next=date("2026-10-09","12:00");
state.gamification=ensureCurrentTasks(state.gamification,next);
panel=taskPanel(state,next);
assert.equal(panel.daily.length,3);
assert.equal(panel.daily[0].task.xp,35,"Zor görevler ancak ertesi gün açılır");
assert.equal(panel.daily[0].task.difficulty,"hard");
state.gamification=planRestDay(state.gamification,"2026-10-10",date("2026-10-09","12:00"));
state.gamification=ensureCurrentTasks(state.gamification,date("2026-10-10","12:00"));
panel=taskPanel(state,date("2026-10-10","12:00"));
assert.equal(panel.restToday,true);
assert.equal(panel.daily.length,0);
console.log("OK: görev zorluğu, 3+2 üretim, tek seferlik ödül, dinlenme");
`;
 const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",source],{
   cwd:path.resolve(__dirname,".."),encoding:"utf8",timeout:20000
 });
 assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
 assert.match(result.stdout,/OK: görev zorluğu/);
});

test("iki cihazda görevlere verilen XP ve görev tanımları birleşir",()=>{
 const seed={version:1,activatedAt:1791453600000,activationDay:"2026-10-08",baselineMinutes:0,
   baselineQuestions:0,goals:[{from:"2026-10-08",minutes:60,questions:40}],earned:{},restDays:[]};
 const task=(period="2026-10-08")=>({id:"daily:"+period+":0",scope:"daily",period,
   metric:"focus",difficulty:"normal",goalMinutes:40,goalQuestions:0,title:"Odak",xp:25,createdAt:1791453600000});
 const a={gamification:{...seed,tasks:{daily:{"2026-10-08":[task()]},weekly:{},claims:{"daily:2026-10-08:0":{at:1791453900000,xp:25}},
    difficultySchedule:[],rerolledDays:[]}}};
 const b={gamification:{...seed,tasks:{daily:{"2026-10-09":[task("2026-10-09")]},weekly:{},claims:{"daily:2026-10-09:0":{at:1791454000000,xp:25}},
    difficultySchedule:[{from:"2026-10-09",difficulty:"hard"}],rerolledDays:[]}}};
 const merged=core.mergeStates(a,b,21).gamification.tasks;
 assert.deepEqual(Object.keys(merged.daily).sort(),["2026-10-08","2026-10-09"]);
 assert.equal(Object.keys(merged.claims).length,2);
 assert.equal(merged.difficultySchedule[0].difficulty,"hard");
});
