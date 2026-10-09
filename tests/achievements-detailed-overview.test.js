"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
test("achievement overview displays only genuine unlocks and keeps secret awards hidden from upcoming",()=>{
  const source=pathToFileURL(path.resolve(__dirname,"../src/domain/achievement-overview.ts")).href;
  const code=[
    'import assert from "node:assert/strict";',
    'import {achievementOverview,badgeProgressPercent} from "'+source+'";',
    'const badge=(id,rarity,progress,goal,extra={})=>({id,title:id,rarity,icon:"🏆",description:"",progress,goal,xp:30,unlocked:false,unlockedAt:null,pending:false,hidden:false,...extra});',
    'const badges=[',
    'badge("easy","Bronz",8,10),badge("secret","Efsanevi",10,10,{hidden:true}),',
    'badge("pending","Gümüş",9,10,{pending:true}),',
    'badge("nearly","Altın",95,100),',
    'badge("earned","Bronz",20,20,{unlocked:true,unlockedAt:2000}),',
    'badge("recent","Elmas",2,2,{unlocked:true,unlockedAt:3000})];',
    'const snapshot={badges,earnedBadges:2,todayKey:"2026-10-09",week:[',
    '{key:"2026-10-05",status:"completed"},{key:"2026-10-06",status:"rest"},',
    '{key:"2026-10-07",status:"shield"},{key:"2026-10-08",status:"missed"},',
    '{key:"2026-10-09",status:"pending"},{key:"2026-10-10",status:"pending"}]};',
    'const view=achievementOverview(snapshot);',
    'assert.deepEqual(view.near.map(b=>b.id),["nearly","easy"]);',
    'assert.deepEqual(view.recent.map(b=>b.id),["recent","earned"]);',
    'assert.deepEqual(view.week,{completed:1,rest:1,shield:1,missed:1});',
    'assert.equal(view.collectionPercent,33);',
    'assert.equal(view.tiers.find(x=>x.rarity==="Bronz").unlocked,1);',
    'assert.equal(view.tiers.find(x=>x.rarity==="Efsanevi").total,1);',
    'assert.equal(badgeProgressPercent(badges[0]),80);',
    'assert.equal(badgeProgressPercent(badge("zero","Bronz",0,0)),0);',
    'console.log("achievement overview OK");'
  ].join("\n");
  const run=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",code],
    {cwd:path.resolve(__dirname,".."),encoding:"utf8",timeout:20000});
  assert.equal(run.status,0,run.stdout+"\n"+run.stderr);
  assert.match(run.stdout,/achievement overview OK/);
});
test("all premium details remain deterministic read-only views",()=>{
  const fs=require("node:fs");const root=path.resolve(__dirname,"..");
  const domain=fs.readFileSync(path.join(root,"src/domain/achievement-overview.ts"),"utf8");
  const ui=fs.readFileSync(path.join(root,"src/ui/study-gamification.ts"),"utf8");
  for(const name of ["renderWeekReview","renderNextBadges","renderRecentBadges","renderRarityProgress"]){
    assert.match(ui,new RegExp('function '+name+'\\('));
  }
  assert.match(ui,/snapshot\.xpSources\.study/);
  assert.match(ui,/snapshot\.xpSources\.badges/);
  assert.match(ui,/snapshot\.xpSources\.tasks/);
  assert.match(ui,/aria-valuemax/);
  assert.match(ui,/badgeProgressPercent/);
  assert.match(domain,/!b\.hidden&&!b\.pending&&!b\.unlocked/);
  assert.doesNotMatch(domain,/localStorage|fetch\(|updateDoc|writeBatch|setDoc/);
});
