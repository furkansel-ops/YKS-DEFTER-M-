"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("Career Center keeps old XP formula while a completed task can only be claimed once",()=>{
  const domain=pathToFileURL(path.join(root,"src/domain/study-gamification.ts")).href;
  const tasks=pathToFileURL(path.join(root,"src/domain/study-tasks.ts")).href;
  const script=[
    'import assert from "node:assert/strict";',
    'import {createGamificationProfile,calculateStudyGamification} from "'+domain+'";',
    'import {ensureCurrentTasks,grantCompletedTasks} from "'+tasks+'";',
    'const start=new Date("2026-10-08T10:00:00+03:00");',
    'const now=new Date("2026-10-08T14:00:00+03:00");',
    'const state={pomoMin:{"2026-10-08":0},solved:{"2026-10-08":0}};',
    'let profile=createGamificationProfile(start,60,40,state);',
    'profile=ensureCurrentTasks(profile,start,state);',
    'state.pomoMin["2026-10-08"]=300;state.solved["2026-10-08"]=200;',
    'const original=JSON.stringify(state);',
    'const first=grantCompletedTasks(state,profile,now);',
    'assert.ok(first.granted.length>0);',
    'const second=grantCompletedTasks(state,first.profile,now);',
    'assert.equal(second.granted.length,0);',
    'assert.deepEqual(second.profile.tasks.claims,first.profile.tasks.claims);',
    'assert.equal(JSON.stringify(state),original);',
    'state.gamification=first.profile;',
    'const snapshot=calculateStudyGamification(state,now);',
    'assert.equal(snapshot.xp,snapshot.xpSources.study+snapshot.xpSources.badges+snapshot.xpSources.tasks);',
    'assert.equal(snapshot.badges.length,25);',
    'assert.equal(snapshot.badges.filter(x=>x.hidden).length,5);',
    'console.log("Career Center regression passed");'
  ].join("\n");
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",script],
    {cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/Career Center regression passed/);
});

test("settings overview and badge drawer explain progress without leaking secret conditions",()=>{
  const main=read("src/ui/study-gamification.ts");
  assert.match(main,/data-yms-career-remaining/);
  assert.match(main,/snapshot\.longestStreak/);
  assert.match(main,/sg-dialog-method/);
  assert.match(main,/badge\.hidden&&!badge\.unlocked/);
  assert.match(main,/hidden\?"Gizli Başarım":badge\.title/);
  assert.match(main,/secret\?"Sürpriz":"\+"/);
  assert.match(main,/restoreSearchFocus/);
  assert.match(main,/syncTabPanels\(\);\s*schedule\(\)/);
  assert.match(read("src/ui/study-gamification.css"),/\.sg-tab-content\[hidden\]\{display:none!important\}/);
});

test("quest cards and study insights use stored metrics, including empty TYT/AYT states",()=>{
  const tasks=read("src/ui/study-tasks-panel.ts");
  const insights=read("src/ui/study-insights-panel.ts");
  assert.match(tasks,/view\.task\.difficulty/);
  assert.match(tasks,/view\.label\.split/);
  assert.match(tasks,/view\.progress/);
  assert.match(tasks,/view\.claimed/);
  assert.match(tasks,/view\.expired/);
  assert.match(insights,/const hasPreviousWeek/);
  assert.match(insights,/renderExamHistory\(root,state,state\.gamification,now\)/);
  assert.match(insights,/profile\.activationDay/);
  assert.match(insights,/Henüz kayıtlı/);
  assert.match(insights,/Number\.isFinite\(Number\(row\.totalNet\)\)/);
  assert.doesNotMatch(insights,/Math\.random\(/);
});
