"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const ledger=pathToFileURL(path.join(root,"public/coach-receipt-ledger.mjs")).href;
const receipt=(uid,week,slot,xp,at,assignedAt=at-100)=>({
  studentUid:uid,weekStart:week,slot,xp,
  difficulty:({20:"easy",35:"normal",50:"hard"})[xp],
  createdAt:{toMillis:()=>at},assignedAt:{toMillis:()=>assignedAt}
});
const meta=(fromCache=false,hasPendingWrites=false)=>({fromCache,hasPendingWrites});
test("only server-confirmed snapshots are authoritative",async()=>{
  const {canUseReceiptSnapshot}=await import(ledger);
  assert.equal(canUseReceiptSnapshot({docs:[],metadata:meta(true,false)}),false);
  assert.equal(canUseReceiptSnapshot({docs:[],metadata:meta(false,true)}),false);
  assert.equal(canUseReceiptSnapshot({docs:[]}),false);
  assert.equal(canUseReceiptSnapshot({docs:[],metadata:meta(false,false)}),true);
});
test("receipt ledger rejects other users, forged XP and pre-activation awards",async()=>{
  const {canonicalCoachRewards,rewardsDiffer}=await import(ledger);
  const uid="studentOne",at=1791453600000;
  const records=[
    ["studentOne_2026-10-05_0",receipt(uid,"2026-10-05","0",20,at+300)],
    ["other_2026-10-05_0",receipt("other","2026-10-05","0",35,at+300)],
    ["studentOne_2026-10-05_1",receipt(uid,"2026-10-05","1",50,at-200)],
    ["studentOne_2026-10-05_2",receipt(uid,"2026-10-05","2",35,at+300,at+100)],
    ["studentOne_2026-10-12_0",receipt(uid,"2026-10-12","0",1000,at+300)],
    ["studentOne_2026-10-19_0",receipt(uid,"2026-10-19","0",20,at+300,at+400)]
  ];
  const rewards=canonicalCoachRewards(records,uid,at);
  assert.deepEqual(Object.keys(rewards).sort(),
    ["studentOne_2026-10-05_0","studentOne_2026-10-05_2"]);
  assert.equal(rewards.studentOne_2026_10_05_0,undefined);
  assert.equal(rewards["studentOne_2026-10-05_0"].xp,20);
  assert.equal(rewardsDiffer(rewards,{...rewards}),false);
  assert.equal(rewardsDiffer(rewards,{}),true);
});
function harness(){
  const listeners=[],events={},writes=[],state={gamification:{
    activatedAt:1791453600000,coachRewards:{"studentOne_2026-10-05_0":{at:1791453601000,xp:20}}
  }};
  const helpers={
    collection:(_db,name)=>name,
    query:(name,filter)=>({name,uid:filter.uid}),
    where:(_field,_op,uid)=>({uid}),
    onSnapshot:(q,arg2,arg3)=>{
      const callback=typeof arg2==="function"?arg2:arg3;
      const listener={name:q.name,uid:q.uid,callback,stopped:false};
      listeners.push(listener);return()=>{listener.stopped=true;};
    },
    updateDoc:async()=>{},serverTimestamp:()=>new Date()
  };
  let script=fs.readFileSync(path.join(root,"public/coach-challenges-student.js"),"utf8");
  script=script.replace(/^import[^\n]+\n/gm,"")
    .replace(/\bexport function installCoachStudentChallenges/g,"function installCoachStudentChallenges")
    .replace(/import\.meta\.url/g,'"https://example.com/public/coach-challenges-student.js"');
  script+="\n__install=installCoachStudentChallenges;";
  let generation=0;
  const window={
    S:state,save:()=>{writes.push(JSON.stringify(state.gamification.coachRewards));return true;},
    addEventListener:(name,fn)=>{(events[name]??=new Set()).add(fn);},
    removeEventListener:(name,fn)=>events[name]?.delete(fn),
    toast:()=>{}
  };
  const document={
    getElementById:()=>null,querySelector:()=>null,
    addEventListener:(name,fn)=>{(events[name]??=new Set()).add(fn);},
    removeEventListener:(name,fn)=>events[name]?.delete(fn)
  };
  const sandbox={...helpers,window,document,console:{warn:()=>{}},Map,Set,Date,URL,Number,
    canonicalCoachRewards:null,rewardsDiffer:null,canUseReceiptSnapshot:null,
    __install:null,setTimeout:()=>++generation,clearTimeout:()=>{},};
  return import(ledger).then(verified=>{
    Object.assign(sandbox,verified);
    vm.runInNewContext(script,sandbox,{filename:"coach-challenges-student.js"});
    const emit=(name,uid,rows,metadata)=>{
      const listener=[...listeners].reverse().find(x=>x.name===name&&x.uid===uid);
      assert.ok(listener,"listener "+name+" must exist");
      listener.callback({docs:rows.map(([id,data])=>({id,data:()=>data,ref:{id}})),metadata});
      return listener;
    };
    const snapshot=(id,reward,fromCache=false)=>emit("coachXpReceipts","studentOne",
      id?[[id,reward]]:[],meta(fromCache,false));
    return {install:sandbox.__install,state,writes,listeners,events,emit,snapshot};
  });
}
test("offline empty cache never erases XP, current empty server snapshot may reconcile",async()=>{
  const h=await harness();
  const stop=h.install({db:{},user:{uid:"studentOne"}});
  const previous=h.state.gamification.coachRewards;
  h.snapshot(null,null,true);
  assert.strictEqual(h.state.gamification.coachRewards,previous);
  assert.equal(h.writes.length,0);
  h.snapshot(null,null,false);
  assert.equal(Object.keys(h.state.gamification.coachRewards).length,0);
  assert.equal(h.writes.length,1);
  stop();
});
test("old student snapshot cannot overwrite the active new student's receipt XP",async()=>{
  const h=await harness();
  const first=h.install({db:{},user:{uid:"studentOne"}});
  const oldCallback=h.listeners.find(x=>x.name==="coachXpReceipts").callback;
  first();
  h.state.gamification.coachRewards={};
  const second=h.install({db:{},user:{uid:"studentTwo"}});
  const bAt=1791453600500;
  h.emit("coachXpReceipts","studentTwo",[["studentTwo_2026-10-05_1",
    receipt("studentTwo","2026-10-05","1",35,bAt)]],meta(false,false));
  assert.equal(h.state.gamification.coachRewards["studentTwo_2026-10-05_1"].xp,35);
  const before=h.writes.length;
  oldCallback({docs:[],metadata:meta(false,false)});
  assert.equal(h.writes.length,before);
  assert.equal(h.state.gamification.coachRewards["studentTwo_2026-10-05_1"].xp,35);
  second();
});
