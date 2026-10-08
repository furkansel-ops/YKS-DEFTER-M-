"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.resolve(__dirname,"../functions/coach-rewards/smart-push.cjs"),"utf8");
function setup({sendError=null,logUpdateError=false,iso="2026-10-08T14:00:00.000Z"}={}){
  const logs=new Map(),sent=[];
  const FixedDate=class extends Date{
    constructor(...args){super(...(args.length?args:[iso]));}
    static now(){return new Date(iso).getTime();}
  };
  let removed=0;
  const deviceRef={path:"users/studentOne/pushDevices/tablet1",delete:async()=>{removed++;}};
  const device={endpoint:"https://push.test/example",auth:"aaaaaaaaaaaaaaaaaaaa",
    p256dh:"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    timeZone:"Europe/Istanbul",quietStart:22,quietEnd:8};
  const db={
    doc(name){
      assert.match(name,/^smartPushLogs\/[a-f0-9]{64}$/);
      return {
        path:name,
        async create(data){if(logs.has(name)){const e=new Error("exists");e.code=6;throw e;}logs.set(name,data);},
        async update(data){if(logUpdateError)throw Error("receipt unavailable");
          Object.assign(logs.get(name),data);},
        async delete(){logs.delete(name);}
      };
    },
    collection(name){
      assert.equal(name,"users");
      return{doc(uid){
        assert.equal(uid,"studentOne");
        return{collection(name){
          assert.equal(name,"pushDevices");
          return{get:async()=>({docs:[{ref:deviceRef,data:()=>device}]})};
        }};
      }};
    }
  };
  const webPush={setVapidDetails:()=>{},async sendNotification(_opts,payload){
    sent.push(JSON.parse(payload));
    if(sendError)throw Object.assign(new Error("network uncertain"),sendError);
  }};
  const exp={};const mod={exports:exp};
  const load=(name)=>{
    if(name==="firebase-functions/v2/firestore")return{onDocumentWritten:(_options,fn)=>fn};
    if(name==="firebase-functions/v2/scheduler")return{onSchedule:(_options,fn)=>fn};
    if(name==="firebase-functions/params")return{defineSecret:name=>({value:()=>name})};
    if(name==="firebase-admin/firestore")return{getFirestore:()=>db};
    if(name==="web-push")return webPush;
    if(name==="node:crypto")return require("node:crypto");
    throw Error("Unexpected dependency: "+name);
  };
  vm.runInNewContext(source,{require:load,exports:exp,module:mod,
    Date:FixedDate,Intl,console:{warn:()=>{}},Buffer,process}, {filename:"smart-push.cjs"});
  const assigned={params:{challengeId:"studentOne_2026-10-05_0"},data:{
    before:{data:()=>null},after:{data:()=>({studentUid:"studentOne",status:"assigned"})}
  }};
  return{onCoach:exp.onCoachChallengePush,assigned,logs,sent,device,removed:()=>removed};
}
test("coach assignment delivers once even when Firestore receipt update fails",async()=>{
  const x=setup({logUpdateError:true});
  await x.onCoach(x.assigned);
  assert.equal(x.sent.length,1,"only one push request");
  assert.equal(x.logs.size,1,"reservation persists after receipt failure");
  await x.onCoach(x.assigned);
  assert.equal(x.sent.length,1,"event retry must never show duplicate");
});
test("uncertain push network errors keep reservation instead of risking duplicates",async()=>{
  const x=setup({sendError:{code:"ETIMEDOUT"}});
  await x.onCoach(x.assigned);
  assert.equal(x.sent.length,1);
  assert.equal(x.logs.size,1);
  await x.onCoach(x.assigned);
  assert.equal(x.sent.length,1);
});
test("expired subscription is removed and locked during later delivery",async()=>{
  const x=setup({sendError:{statusCode:410}});
  await x.onCoach(x.assigned);
  assert.equal(x.removed(),1);
  assert.equal(x.logs.size,1);
});
test("coach notifications obey a device's quiet hours",async()=>{
  const x=setup({iso:"2026-10-08T21:30:00.000Z"}); // 00:30 Istanbul
  await x.onCoach(x.assigned);
  assert.equal(x.sent.length,0);
  assert.equal(x.logs.size,0);
});
