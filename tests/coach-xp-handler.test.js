"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const policy=require("../functions/coach-rewards/reward-policy.cjs");
const ROOT=path.resolve(__dirname,"../functions/coach-rewards");
const code=fs.readFileSync(path.join(ROOT,"index.cjs"),"utf8");
function driver(){
  const records=new Map();
  const db={
    doc:p=>({path:p}),
    runTransaction:async fn=>{
      const mutations=[];
      await fn({
        get:async ref=>({exists:records.has(ref.path),data:()=>records.get(ref.path)}),
        create:(ref,value)=>mutations.push({ref,value})
      });
      for(const {ref,value} of mutations){
        if(records.has(ref.path))throw new Error("ALREADY_EXISTS");
        records.set(ref.path,value);
      }
    }
  };
  const exports={};
  const sandbox={
    exports,module:{exports},console,
    require(name){
      if(name==="firebase-functions/v2/firestore")return {onDocumentUpdated:(_opts,fn)=>fn};
      if(name==="firebase-admin/app")return {initializeApp:()=>({})};
      if(name==="firebase-admin/firestore")return {getFirestore:()=>db,FieldValue:{serverTimestamp:()=>42}};
      if(name==="./reward-policy.cjs")return policy;
      if(name==="./smart-push.cjs")return {};
      throw new Error("Unexpected module import: "+name);
    }
  };
  vm.runInNewContext(code,sandbox,{filename:"index.cjs"});
  return {handle:sandbox.exports.issueCoachChallengeXp,records};
}
const day="2026-10-05",id="student_2026-10-05_0";
const data={studentUid:"student",coachUid:"coach",weekStart:day,slot:"0",
  difficulty:"normal",kind:"both",xp:35,goalMinutes:60,goalQuestions:40,
  minutesDone:60,questionsDone:40,status:"completed",
  createdAt:{toMillis:()=>1791200000000}};
function evt(before,after,key=id){
  return {params:{challengeId:key},data:{
    before:{data:()=>before},
    after:{data:()=>after}
  }};
}
test("completed measurable challenge produces exactly one trusted receipt",async()=>{
  const {handle,records}=driver();
  records.set("coachChallenges/"+id,data);
  await handle(evt({...data,status:"in_progress"},data));
  const receipt=records.get("coachXpReceipts/"+id);
  assert.equal(receipt.xp,35);
  assert.equal(receipt.studentUid,"student");
  assert.equal(receipt.challengeId,id);
  assert.equal(typeof receipt.assignedAt.toMillis,"function");
  await handle(evt({...data,status:"in_progress"},data));
  assert.equal([...records.keys()].filter(k=>k.startsWith("coachXpReceipts/")).length,1);
});
test("manual challenge requires explicit approval, not only submission",async()=>{
  const {handle,records}=driver();
  const manual={...data,kind:"manual",goalMinutes:0,goalQuestions:0,
    minutesDone:0,questionsDone:0,status:"approved",approvedAt:{toMillis:()=>1791200100000}};
  records.set("coachChallenges/"+id,manual);
  await handle(evt({...manual,status:"assigned"},manual));
  assert.equal(records.has("coachXpReceipts/"+id),false);
  await handle(evt({...manual,status:"submitted"},manual));
  assert.equal(records.get("coachXpReceipts/"+id).xp,35);
});
test("a cancelled or altered source never earns XP from a delayed trigger",async()=>{
  const {handle,records}=driver();
  records.set("coachChallenges/"+id,{...data,status:"cancelled"});
  await handle(evt({...data,status:"in_progress"},data));
  assert.equal(records.has("coachXpReceipts/"+id),false);
  records.set("coachChallenges/"+id,{...data,xp:999});
  await handle(evt({...data,status:"in_progress"},data));
  assert.equal(records.has("coachXpReceipts/"+id),false);
});
test("missing server timestamp and invalid ID are rejected before payment",async()=>{
  const {handle,records}=driver();
  records.set("coachChallenges/"+id,{...data,createdAt:null});
  await handle(evt({...data,status:"assigned"},data));
  assert.equal(records.has("coachXpReceipts/"+id),false);
  records.set("coachChallenges/"+id,{...data,createdAt:data.createdAt});
  await handle(evt({...data,status:"assigned"},data,"student_coach_2026-10-05_0"));
  assert.equal(records.has("coachXpReceipts/"+id),false);
});
