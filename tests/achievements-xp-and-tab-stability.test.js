"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("real domain XP breakdown sums to displayed total from study, badges and tasks",()=>{
  const url=pathToFileURL(path.join(root,"src/domain/study-gamification.ts")).href;
  const code=[
    'import assert from "node:assert/strict";',
    'import {createGamificationProfile,calculateStudyGamification} from "'+url+'";',
    'const at=new Date("2026-10-08T10:00:00+03:00");',
    'const later=new Date("2026-10-08T12:00:00+03:00");',
    'const state={pomoMin:{"2026-10-08":20},solved:{"2026-10-08":10}};',
    'state.gamification=createGamificationProfile(at,60,40,state);',
    'let snap=calculateStudyGamification(state,at);',
    'assert.deepEqual(snap.xpSources,{study:0,badges:0,tasks:0});',
    'assert.equal(snap.xp,0);',
    'state.pomoMin["2026-10-08"]=80;',
    'state.solved["2026-10-08"]=50;',
    'snap=calculateStudyGamification(state,later);',
    'assert.deepEqual(snap.xpSources,{study:100,badges:0,tasks:0});',
    'assert.equal(snap.xp,100);',
    'const badge=snap.badges.find(b=>b.id==="first-focus");',
    'assert.ok(badge);',
    'state.gamification.earned["first-focus"]={at:at.getTime()+1000,xp:badge.xp};',
    'state.gamification.tasks={claims:{',
    '  "daily:2026-10-08:0":{at:at.getTime()+2000,xp:25},',
    '  "weekly:2026-10-05:0":{at:at.getTime()+2000,xp:100}',
    '}};',
    'snap=calculateStudyGamification(state,later);',
    'assert.equal(snap.xpSources.study,100);',
    'assert.equal(snap.xpSources.badges,badge.xp);',
    'assert.equal(snap.xpSources.tasks,125);',
    'assert.equal(snap.xp,snap.xpSources.study+snap.xpSources.badges+snap.xpSources.tasks);',
    'assert.equal(snap.xp,255);',
    'console.log("OK: live XP sources match exact calculated XP");'
  ].join("\n");
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",code],
    {cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/OK: live XP sources/);
});

test("async task and career mounts hide before repaint, and rerenders enforce the tab",()=>{
  const tasks=read("src/ui/study-tasks-panel.ts");
  const career=read("src/ui/study-insights-panel.ts");
  const center=read("src/ui/study-gamification.ts");
  assert.match(tasks,/const isActiveTab=.*activeTab==="tasks"/);
  assert.match(career,/const isActiveTab=.*activeTab==="career"/);
  assert.match(tasks,/root.hidden=!isActiveTab\(\)/);
  assert.match(career,/root.hidden=!isActiveTab\(\)/);
  assert.match(tasks,/current.hidden=!isActiveTab\(\)/);
  assert.match(career,/existing.hidden=!isActiveTab\(\)/);
  assert.match(center,/tasks.hidden=activeTab!=="tasks"/);
  assert.match(center,/insights.hidden=activeTab!=="career"/);
  assert.match(center,/root.dataset.activeTab=activeTab/);
});

test("tab selection restores keyboard focus after complete panel replacement",()=>{
  const src=read("src/ui/study-gamification.ts");
  assert.match(src,/function chooseCareerTab\(next:CareerTab,restoreFocus=true\)/);
  assert.match(src,/window.requestAnimationFrame\(\(\)=>\{/);
  assert.match(src,/focus\(\{preventScroll:true\}\)/);
  assert.match(src,/button.setAttribute\("aria-controls","sgCareerTabPanel"\)/);
  assert.match(src,/area.id="sgCareerTabPanel"/);
  assert.match(src,/chooseCareerTab\(id\)/);
  assert.match(src,/chooseCareerTab\(next\)/);
});

test("career general tab shows real auditable XP sources, not extra minted rewards",()=>{
  const center=read("src/ui/study-gamification.ts");
  const domain=read("src/domain/study-gamification.ts");
  for(const key of ["study","badges","tasks"]){
    assert.match(center,new RegExp("snapshot\\.xpSources\\."+key));
  }
  assert.match(center,/XP nereden geldi\?/);
  assert.match(domain,/xpSources:\{study:workXp,badges:earnedXp,tasks:taskRewardXp\}/);
  assert.doesNotMatch(center,/localStorage\.(setItem|clear|removeItem)/);
});
