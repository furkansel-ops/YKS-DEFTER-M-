const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
const source=app.slice(app.indexOf("function validTime(v)"),app.indexOf("/* ---------- koç e-postası ---------- */"));
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
async function flush(){for(let i=0;i<12;i++)await Promise.resolve();}

function harness(options={}){
  const sent=[],desktop=[],toasts=[],events=[],timers=new Map(),nodes=new Map();
  let timerId=0,saves=0,requests=0;
  class Notification{
    static permission=options.permission||"granted";
    static requestPermission(){requests++;return options.request?options.request():Promise.resolve(this.permission);}
    constructor(title,opts){desktop.push({title,opts});if(options.constructorFails)throw new Error("constructor unavailable");}
  }
  const reg={active:{},showNotification(title,opts){sent.push({title,opts});return options.show?options.show(title,opts):Promise.resolve();}};
  const worker=Object.hasOwn(options,"worker")?options.worker:{controller:{},getRegistration:async()=>reg,ready:Promise.resolve(reg)};
  const navigator={userAgent:options.userAgent||"Android Chrome",serviceWorker:worker};
  const window={navigator,matchMedia:()=>({matches:true}),dispatchEvent:event=>events.push(event.type)};
  const S={notif:{on:options.on!==false,pomo:true,review:true,evening:true,eveningAt:"21:00"},solved:{},pomoMin:{}};
  const context=vm.createContext({window,navigator,Notification,Event:class{constructor(type){this.type=type;}},S,
    location:{protocol:"https:"},document:{activeElement:null},el:id=>nodes.get(id)||null,
    save(){saves++;},toast:message=>toasts.push(message),todayKey:()=>"2026-10-08",dayDone:()=>false,fmtHM:()=>"0 dk",
    reviewQueue:()=>[{}],overdueTopics:()=>[],
    setTimeout(callback){const id=++timerId;timers.set(id,callback);return id;},clearTimeout:id=>timers.delete(id)});
  vm.runInContext(source,context);
  return {run:code=>vm.runInContext(code,context),reg,worker,Notification,S,nodes,sent,desktop,toasts,events,
    get saves(){return saves;},get requests(){return requests;},get pending(){return timers.size;},
    expire(){const callbacks=[...timers.values()];timers.clear();callbacks.forEach(callback=>callback());}};
}

test("mobile notifications use the active service worker and resolve only after acceptance",async()=>{
  const delivery=deferred(),h=harness({show:()=>delivery.promise});
  let settled=false;const pending=h.run('notify("Odak", "Çalışma bitti", "pomo")').then(value=>{settled=true;return value;});
  await flush();
  assert.equal(h.sent.length,1);assert.equal(settled,false);assert.equal(h.desktop.length,0);
  assert.equal(h.sent[0].opts.tag,"pomo");assert.equal(h.sent[0].opts.lang,"tr");
  delivery.resolve();assert.equal(await pending,true);assert.equal(h.pending,0);
  assert.equal(h.run('typeof window.YKSNotificationDelivery.show'),"function");
});

test("service worker rejection reports failure without a constructor retry",async()=>{
  const h=harness({userAgent:"Desktop Chrome",show:()=>Promise.reject(new Error("OS denied"))});
  assert.equal(await h.run('notify("Test", "", "test")'),false);
  assert.equal(h.sent.length,1);assert.equal(h.desktop.length,0);assert.equal(h.pending,0);
});

test("a registration without an active worker waits for ready",async()=>{
  const ready=deferred(),calls=[];
  const h=harness({worker:{getRegistration:async()=>({showNotification(){throw new Error("inactive");}}),ready:ready.promise}});
  const pending=h.run('notify("Test", "", "test")');await flush();assert.equal(h.desktop.length,0);
  ready.resolve({active:{},showNotification:async(...args)=>calls.push(args)});
  assert.equal(await pending,true);assert.equal(calls.length,1);
});

test("registration lookup failure can recover through ready",async()=>{
  let calls=0;
  const h=harness({worker:{getRegistration:async()=>{throw new Error("lookup failed");},ready:Promise.resolve({active:{},showNotification:async()=>{calls++;}})}});
  assert.equal(await h.run('notify("Test", "", "test")'),true);assert.equal(calls,1);
});

test("registration timeout never posts a late notification",async()=>{
  const registration=deferred();let calls=0;
  const reg={active:{},showNotification:async()=>{calls++;}};
  const h=harness({worker:{getRegistration:()=>registration.promise,ready:Promise.resolve(reg)}});
  const pending=h.run('notify("Test", "", "test")');await flush();h.expire();
  assert.equal(await pending,false);
  registration.resolve(reg);await flush();assert.equal(calls,0);assert.equal(h.desktop.length,0);
});

test("delivery timeout reports uncertainty as failure and never starts a second delivery",async()=>{
  const delivery=deferred(),h=harness({show:()=>delivery.promise});
  const pending=h.run('notify("Test", "", "test")');await flush();h.expire();assert.equal(await pending,false);
  delivery.resolve();await flush();assert.equal(h.sent.length,1);assert.equal(h.desktop.length,0);
});

test("permission and enabled state are checked again after waiting for registration",async()=>{
  const registration=deferred(),h=harness({worker:{getRegistration:()=>registration.promise}});
  const pending=h.run('notify("Test", "", "test")');await flush();h.S.notif.on=false;
  registration.resolve(h.reg);assert.equal(await pending,false);assert.equal(h.sent.length,0);
});

test("disabled or denied notifications do not request permission or post anything",async()=>{
  for(const options of [{on:false},{permission:"denied"},{permission:"default"}]){
    const h=harness(options);assert.equal(await h.run('notify("Test", "", "test")'),false);
    assert.equal(h.sent.length,0);assert.equal(h.requests,0);assert.equal(h.desktop.length,0);
  }
});

test("constructor fallback is restricted to desktops without service worker support",async()=>{
  const desktop=harness({worker:undefined,userAgent:"Desktop Firefox"});
  assert.equal(await desktop.run('notify("Test", "", "test")'),true);assert.equal(desktop.desktop.length,1);
  const mobile=harness({worker:undefined});
  assert.equal(await mobile.run('notify("Test", "", "test")'),false);assert.equal(mobile.desktop.length,0);
  const broken=harness({worker:undefined,userAgent:"Desktop Firefox",constructorFails:true});
  assert.equal(await broken.run('notify("Test", "", "test")'),false);
});

test("test notification waits for browser acceptance and does not claim visible delivery",async()=>{
  const delivery=deferred(),h=harness({show:()=>delivery.promise});
  const pending=h.run("testNotif()");await flush();assert.equal(h.toasts.length,0);
  delivery.resolve();assert.equal(await pending,true);
  assert.match(h.toasts.at(-1),/Tarayıcı bildirimi kabul etti/);assert.doesNotMatch(h.toasts.at(-1),/gönderildi|çalışıyor/);
  const failed=harness({show:async()=>{throw new Error("blocked");}});
  assert.equal(await failed.run("testNotif()"),false);assert.match(failed.toasts.at(-1),/kabul edilmedi/);
});

test("permission and settings changes signal the focus notification controller",async()=>{
  const h=harness({permission:"default",request:()=>{h.Notification.permission="granted";return Promise.resolve("granted");}});
  assert.equal(await h.run("askNotif()"),"granted");assert.equal(h.requests,1);
  assert.deepEqual(h.events,["yks:notification-settings"]);
  h.run('toggleNotif("pomo")');assert.equal(h.S.notif.pomo,false);
  assert.equal(h.events.filter(event=>event==="yks:notification-settings").length,2);
  const refused=harness({request:()=>{throw new Error("not allowed");},permission:"default"});
  assert.equal(await refused.run("askNotif()"),"yok");assert.match(refused.toasts.at(-1),/İzin istenemedi/);
});

test("failed reminders remain retryable and accepted reminders are not duplicated",async()=>{
  for(const [fn,key] of [["fireEvening","lastEvening"],["fireReview","lastReview"]]){
    const gate=deferred();let fail=true;
    const h=harness({show:()=>fail?Promise.reject(new Error("blocked")):gate.promise});
    assert.equal(await h.run(fn+"()"),false);assert.equal(h.S.notif[key],"");
    fail=false;const pending=h.run(fn+"()");await flush();
    assert.equal(await h.run(fn+"()"),false);assert.equal(h.sent.length,2);
    gate.resolve();assert.equal(await pending,true);assert.equal(h.S.notif[key],"2026-10-08");
    assert.equal(await h.run(fn+"()"),false);assert.equal(h.sent.length,2);
  }
});

test("diagnostics explain tablet permissions and suspended timer limits",()=>{
  const h=harness(),text=h.run("notifDiag()");
  assert.match(text,/Chrome.*Site ayarları/);assert.match(text,/tablet\/telefon/);
  assert.match(text,/askıya alınır/);assert.match(text,/garanti edilemez/);
});
