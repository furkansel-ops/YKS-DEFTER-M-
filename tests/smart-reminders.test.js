"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const{spawnSync}=require("node:child_process");
const path=require("node:path"),fs=require("node:fs"),vm=require("node:vm");
const{pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const reminders=pathToFileURL(path.join(root,"src/domain/smart-reminders.ts")).href;
const gamification=pathToFileURL(path.join(root,"src/domain/study-gamification.ts")).href;
test("personalized reminders honor both goals, rest, consent, dedup and quiet hours",()=>{
  const lines=[
    'import assert from "node:assert/strict";',
    'import {createGamificationProfile} from "'+gamification+'";',
    'import {recommendReminder,recordReminder,defaultReminderSettings,isQuiet} from "'+reminders+'";',
    'const start=new Date(2026,9,8,10,0),evening=new Date(2026,9,8,18,0);',
    'const state={pomoMin:{"2026-10-08":0},solved:{"2026-10-08":0}};',
    'state.gamification=createGamificationProfile(start,60,40,state);',
    'let prefs=defaultReminderSettings();',
    'assert.equal(recommendReminder(state,evening,prefs),null,"opt-in required");',
    'prefs.enabled=true;',
    'let remind=recommendReminder(state,evening,prefs);',
    'assert.equal(remind.kind,"goal-nudge");',
    'prefs=recordReminder(prefs,remind,evening);',
    'assert.equal(recommendReminder(state,evening,prefs),null,"only once per kind");',
    'const late=new Date(2026,9,8,20,15);',
    'remind=recommendReminder(state,late,prefs);',
    'assert.equal(remind.kind,"streak-risk");',
    'prefs=recordReminder(prefs,remind,late);',
    'assert.equal(recommendReminder(state,late,prefs),null,"daily cap");',
    'assert.equal(isQuiet(23,22,8),true);',
    'assert.equal(isQuiet(7,22,8),true);',
    'assert.equal(isQuiet(13,22,8),false);',
    'assert.equal(recommendReminder(state,new Date(2026,9,8,23),prefs),null);',
    'state.pomoMin["2026-10-08"]=60;state.solved["2026-10-08"]=40;',
    'assert.equal(recommendReminder(state,evening,{...defaultReminderSettings(),enabled:true}),null);',
    'state.gamification.restDays=["2026-10-08"];',
    'assert.equal(recommendReminder(state,evening,{...defaultReminderSettings(),enabled:true}),null);',
    'console.log("PASS: opt-in, quiet hours and daily limit");'
  ];
  const r=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",lines.join("\n")],
    {cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(r.status,0,r.stdout+"\n"+r.stderr);
});
test("service worker push payload cannot inject arbitrary external navigation",async()=>{
  const source=fs.readFileSync(path.join(root,"modules/smart-push-worker.js"),"utf8");
  const handlers={};let shown=null;
  const worker={registration:{scope:"https://example.org/app/",
    showNotification:async(title,opts)=>{shown={title,opts};}},
    clients:{matchAll:async()=>[],openWindow:async()=>{}},
    addEventListener:(key,handler)=>handlers[key]=handler};
  vm.runInNewContext(source,{self:worker,URL,Set,console});
  let wait=null;
  handlers.push({data:{json:()=>({type:"yks-smart-v1",kind:"goal-nudge",
    title:"Daily target",body:"Check today's plan",id:"abc123",path:"https://evil.example/steal"})},
    waitUntil:p=>wait=p});
  assert.ok(wait);await wait;
  assert.equal(shown.opts.data.path,"https://example.org/app/");
  assert.equal(shown.opts.data.type,"yks-smart");
  wait=null;shown=null;
  handlers.push({data:{json:()=>({type:"other-push",kind:"goal-nudge"})},waitUntil:p=>wait=p});
  assert.equal(wait,null,"unknown push messages ignored");
  assert.equal(shown,null);
});
test("push functions and worker have valid Node syntax",()=>{
  for(const file of ["functions/coach-rewards/smart-push.cjs",
    "functions/coach-rewards/index.cjs","modules/smart-push-worker.js"]){
    const r=spawnSync(process.execPath,["--check",file],{cwd:root,encoding:"utf8"});
    assert.equal(r.status,0,file+"\n"+r.stderr);
  }
  const rules=fs.readFileSync(path.join(root,"firestore.rules"),"utf8");
  assert.match(rules,/match \/users\/\{userId\}\/pushDevices\/\{deviceId\}/);
  assert.match(rules,/match \/smartPushLogs\/\{logId\}/);
  const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
  assert.match(sw,/importScripts\("\.\/modules\/smart-push-worker\.js\?v=0\.1\.0"\)/);
});
