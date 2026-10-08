"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const client=fs.readFileSync(path.resolve(__dirname,"../public/smart-push-client.js"),"utf8")
  .replace(/^import\{[^}]+\}from"[^"]+";\s*/,"")
  .replace("export function installStudentSmartPush","function installStudentSmartPush")+
  "\n__register=installStudentSmartPush;";
const wait=()=>{let resolve;const promise=new Promise(done=>resolve=done);return{promise,resolve};};
async function tick(){for(let i=0;i<12;i++)await Promise.resolve();}
function fixture({holdPermission=false,holdWrite=false}={}){
  const permission=wait(),write=wait(),calls=[],documents=new Map(),events={};
  let subscribed=false;
  const sub={endpoint:"https://push.test/subscription",toJSON:()=>({keys:{
    p256dh:"abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOP",
    auth:"abcdefghijklmnopQRSTUV"}}),
    unsubscribe:async()=>{subscribed=false;}};
  const sw={pushManager:{
    getSubscription:async()=>subscribed?sub:null,
    subscribe:async()=>{subscribed=true;return sub;}
  },showNotification:async()=>{}};
  let seed=1;
  const clock=class extends Date{
    constructor(...args){super(...(args.length?args:["2026-10-08T14:00:00+03:00"]));}
    static now(){return new Date("2026-10-08T14:00:00+03:00").getTime();}
  };
  const window={
    S:{gamification:{goals:[{from:"2026-10-08",minutes:60,questions:40}],
      smartReminders:{enabled:true,quietStart:22,quietEnd:8},
      activationDay:"2026-10-08",baselineMinutes:0,baselineQuestions:0},
      pomoMin:{},solved:{}},
    PushManager:function(){},
    addEventListener:(name,fn)=>{events[name]=fn;},
    removeEventListener:()=>{},dispatchEvent:()=>{},
    setInterval:()=>seed++,clearInterval:()=>{}
  };
  const store={
    doc:(_db,...bits)=>({path:bits.join("/")}),
    serverTimestamp:()=>new Date(),
    getDoc:async ref=>{
      if(ref.path==="publicConfig/push")return{exists:()=>true,
        data:()=>({vapidPublicKey:"A".repeat(87)})};
      return{exists:()=>documents.has(ref.path),data:()=>documents.get(ref.path)};
    },
    async setDoc(ref,data){calls.push(["set",ref.path]);if(holdWrite)await write.promise;
      documents.set(ref.path,data);},
    async deleteDoc(ref){calls.push(["delete",ref.path]);documents.delete(ref.path);}
  };
  const sandbox={...store,window,Event:class{constructor(type){this.type=type;}},
    navigator:{onLine:true,serviceWorker:{
      ready:Promise.resolve(sw),getRegistration:async()=>sw}},
    Notification:{permission:"granted",requestPermission:()=>{
      calls.push(["permission"]);
      return holdPermission?permission.promise:Promise.resolve("granted");
    }},
    isSecureContext:true,localStorage:{getItem:()=>null,setItem:()=>{}},
    crypto:{randomUUID:()=>String(seed++).padEnd(36,"1")},
    atob:input=>Buffer.from(input,"base64").toString("binary"),
    Uint8Array,Intl,Date:clock,console:{warn:()=>{}},setTimeout,clearTimeout,
    setInterval:()=>seed++,clearInterval:()=>{},__register:null};
  vm.runInNewContext(client,sandbox,{filename:"smart-push-client.js"});
  return{install:sandbox.__register,window,documents,calls,permission,write,sub};
}
test("logging out during iPad permission prompt cannot re-enroll the old account",async()=>{
  const f=fixture({holdPermission:true});
  const stop=f.install({db:{},user:{uid:"firstStudent",emailVerified:true}});
  await tick();
  const message=f.window.YKSSmartPush.enable().then(()=>null,e=>String(e.message));
  assert.equal(f.calls.filter(x=>x[0]==="permission").length,1);
  stop();f.permission.resolve("granted");
  assert.match(await message,/oturumu değişti/i);
  await tick();
  assert.equal(f.calls.filter(x=>x[0]==="set").length,0);
  assert.equal([...f.documents.keys()].length,0);
});
test("an already-started Firebase enrollment is removed after logout even when write resolves late",async()=>{
  const f=fixture({holdWrite:true});
  const stop=f.install({db:{},user:{uid:"firstStudent",emailVerified:true}});
  await tick();
  const operation=f.window.YKSSmartPush.enable().then(()=>null,e=>String(e.message));
  for(let i=0;i<30&&f.calls.every(x=>x[0]!=="set");i++)await tick();
  assert.ok(f.calls.some(x=>x[0]==="set"),"device enrollment should have started");
  stop();
  assert.equal(f.calls.filter(x=>x[0]==="delete").length,0,
    "cleanup must wait for already-started write");
  f.write.resolve();await operation;await tick();
  for(let i=0;i<30&&f.calls.every(x=>x[0]!=="delete");i++)await tick();
  assert.ok(f.calls.some(x=>x[0]==="delete"),"old device must be removed");
  assert.equal(f.documents.size,0,"old account must not retain a Push subscription");
});
