"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {spawnSync}=require("node:child_process");
const path=require("node:path"),{pathToFileURL}=require("node:url");
const insights=pathToFileURL(path.resolve(__dirname,"../src/domain/study-insights.ts")).href;
const gamification=pathToFileURL(path.resolve(__dirname,"../src/domain/study-gamification.ts")).href;
function run(lines){
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",lines.join("\n")],{
    cwd:path.resolve(__dirname,".."),encoding:"utf8",timeout:20000
  });
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
}
test("Aşama 3: geçmiş kayıtlardan XP üretmeden TYT/AYT ustalık ve net rekorları",()=>{
  run([
    'import assert from "node:assert/strict";',
    'import {getStudyInsights} from "'+insights+'";',
    'import {calculateStudyGamification,createGamificationProfile} from "'+gamification+'";',
    'const at=new Date("2026-10-08T10:00:00+03:00"),now=new Date("2026-10-20T12:00:00+03:00");',
    'const state={pomoMin:{"2026-10-07":500,"2026-10-08":40,"2026-10-10":100},solved:{"2026-10-07":900,"2026-10-08":30,"2026-10-10":120},',
    'pomoSubj:{"2026-10-07":{"TYT|Matematik":900},"2026-10-08":{Matematik:35,"TYT|Matematik":20},"2026-10-10":{Matematik:20,"AYT|Matematik":50}},',
    'solvedTopic:{"2026-10-07":{"TYT|Matematik|Problemler":999},"2026-10-08":{"TYT|Matematik|Problemler":30},"2026-10-10":{"AYT|Matematik|Limit":50}},',
    'topics:{"TYT|Matematik|Problemler":{revDone:{a:"2026-10-07",b:"2026-10-08",c:"2026-10-09"}}},denemeler:[],sessions:{}};',
    'state.gamification=createGamificationProfile(at,60,40,state);',
    'state.pomoMin["2026-10-08"]=100;state.solved["2026-10-08"]=75;',
    'state.pomoSubj["2026-10-08"]={Matematik:55,"TYT|Matematik":40};',
    'state.solvedTopic["2026-10-08"]={"TYT|Matematik|Problemler":70};',
    'state.denemeler=[{type:"TYT",date:"2026-10-07",at:at.getTime()-90000,totalNet:140},',
    '{type:"TYT",date:"2026-10-11",at:new Date("2026-10-11T11:00:00+03:00").getTime(),totalNet:64},',
    '{type:"TYT",date:"2026-10-15",at:new Date("2026-10-15T11:00:00+03:00").getTime(),totalNet:70},',
    '{type:"AYT",date:"2026-10-15",at:new Date("2026-10-15T11:00:00+03:00").getTime(),totalNet:32}];',
    'const rows=getStudyInsights(state,state.gamification,now,{"2026-10-08":"completed","2026-10-10":"completed"});',
    'const ty=rows.mastery.find(x=>x.key==="TYT|Matematik"),ay=rows.mastery.find(x=>x.key==="AYT|Matematik"),gn=rows.mastery.find(x=>x.key==="GENEL|Matematik");',
    'assert.ok(ty&&ay&&gn);assert.equal(ty.minutes,20);assert.equal(ty.questions,40);',
    'assert.equal(ty.reviews,1);assert.equal(ty.up,21);assert.equal(ty.tier,"Bronz");',
    'assert.equal(ay.minutes,50);assert.equal(ay.questions,50);assert.equal(gn.minutes,40);',
    'assert.equal(rows.totalReviews,1);assert.equal(rows.exams.find(x=>x.type==="TYT").bestNet,70);',
    'assert.equal(rows.exams.find(x=>x.type==="TYT").maxGrowth,6);',
    'assert.equal(rows.exams.find(x=>x.type==="AYT").maxGrowth,0);',
    'assert.equal(rows.calendar.find(x=>x.day==="2026-10-07").status,"before-start");',
    'assert.equal(rows.calendar.find(x=>x.day==="2026-10-08").minutes,60);',
    'assert.equal(rows.calendar.find(x=>x.day==="2026-10-08").questions,45);',
    'assert.ok(rows.calendar.length>=365);',
    'const snap=calculateStudyGamification(state,now);',
    'assert.ok(snap.newBadgeIds.includes("net-5"));assert.equal(snap.badges.length,25);',
    'assert.equal(snap.badges.find(x=>x.id==="net-5").unlocked,false);',
    'assert.equal(snap.badges.find(x=>x.id==="hidden-early").hidden,true);'
  ]);
});
test("Aşama 3: gizli başarım gerçek oturum, pazar görevi ve kusursuz haftadan açılır",()=>{
  run([
    'import assert from "node:assert/strict";',
    'import {getStudyInsights} from "'+insights+'";',
    'import {createGamificationProfile} from "'+gamification+'";',
    'const at=new Date("2026-10-05T10:00:00+03:00"),now=new Date("2026-10-15T11:00:00+03:00");',
    'const t=(day,hour)=>new Date(2026,9,day,hour,0).getTime();',
    'const state={pomoMin:{},solved:{},sessions:{"2026-10-07":[{type:"break",done:true,m:50,t:t(7,7)},',
    '{type:"work",done:true,m:30,t:t(7,7)},{type:"work",done:true,m:35,t:t(7,20)}]}};',
    'state.gamification=createGamificationProfile(at,60,40,state);',
    'state.gamification.tasks={daily:{},weekly:{},rerolledDays:[],difficultySchedule:[],',
    'claims:{"weekly:2026-10-05:focus":{xp:100,at:t(11,16)}}};',
    'const history={};',
    'for(const day of ["2026-10-05","2026-10-06","2026-10-07","2026-10-08","2026-10-09","2026-10-10","2026-10-11"])history[day]="completed";',
    'const good=getStudyInsights(state,state.gamification,now,history);',
    'assert.equal(good.hidden.earlyBird,true);assert.equal(good.hidden.nightOwl,true);',
    'assert.equal(good.hidden.lastMinute,true);assert.equal(good.hidden.perfectWeek,true);',
    'assert.equal(good.records.find(x=>x.id==="longest-session").value,35);',
    'const bad=getStudyInsights(state,state.gamification,now,{...history,"2026-10-09":"shield"});',
    'assert.equal(bad.hidden.perfectWeek,false);'
  ]);
});
