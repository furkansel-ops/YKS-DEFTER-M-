const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const clone=value=>JSON.parse(JSON.stringify(value));
const requiredShareFields=read("firestore.rules").match(/match \/coachingShares\/\{studentUid\}[\s\S]*?hasAll\(\[([\s\S]*?)\]\)/)[1].match(/'([^']+)'/g).map(value=>value.slice(1,-1));

function harness({share=null,now="2026-09-18T12:00:00Z"}={}){
  const docs=new Map(),writes=[],tasks=[],timers=new Map(),intervals=new Map(),events=new Map(),writeErrors=[];
  const dataset={};
  let nextTimer=0,writeGate=null,profileGate=null;
  const user={uid:"student-1",emailVerified:true,displayName:"Öğrenci"};
  docs.set("accountProfiles/student-1",{uid:user.uid,role:"student"});
  if(share)docs.set("coachingShares/student-1",clone(share));
  const state={name:"Öğrenci",rows:{r:2,s:4},rowLabels:{r:["Ders"],s:["Çalışma"]},weeks:{"2026-10-05":{s:[["Matematik"]]}}};
  const snapshot=ref=>({exists:()=>docs.has(ref),data:()=>clone(docs.get(ref)),ref});
  const write=(ref,data,options)=>{
    const next=options?.merge?{...docs.get(ref),...clone(data)}:clone(data);
    if(ref.startsWith("coachingShares/")){
      assert.deepEqual(Object.keys(next).sort(),requiredShareFields.slice().sort(),"Firestore paylaşım şeması tüm alanları ister");
      for(const key of ["profile","program","progress","paragraphProblem","topics"])assert.equal(typeof next[key],"object",key);
    }
    docs.set(ref,next);writes.push({ref,data:clone(data),merge:options?.merge===true});
  };
  const waitForWrite=async()=>{if(writeGate){const gate=writeGate;writeGate=null;gate.started();await gate.ready}if(writeErrors.length)throw writeErrors.shift()};
  class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return new Date(now).getTime()}}
  const window={S:state,addEventListener:(name,callback)=>events.set(name,callback),removeEventListener:(name,callback)=>{if(events.get(name)===callback)events.delete(name)},dispatchEvent:()=>{},save:()=>true,toast:()=>{},addToDay:(text,day,weekOffset)=>{tasks.push({text,day,weekOffset});return true}};
  const context=vm.createContext({window,Date:Clock,console:{error:()=>{},info:()=>{},warn:()=>{}},document:{documentElement:{dataset}},CustomEvent:class{},localStorage:{setItem:()=>{}},sessionStorage:{setItem:()=>{},removeItem:()=>{}},setTimeout:(fn,ms)=>{const id=++nextTimer;timers.set(id,{fn,ms});return id},clearTimeout:id=>timers.delete(id),setInterval:(fn,ms)=>{const id=++nextTimer;intervals.set(id,{fn,ms});return id},clearInterval:id=>intervals.delete(id),doc:(_db,...parts)=>parts.join("/"),collection:(_db,...parts)=>parts.join("/"),query:(...parts)=>parts,where:()=>{},getDoc:async ref=>{if(profileGate&&ref.startsWith("accountProfiles/")){const gate=profileGate;profileGate=null;gate.started();await gate.ready}return snapshot(ref)},serverTimestamp:()=>"server-time",setDoc:async(...args)=>{await waitForWrite();write(...args)},updateDoc:async(...args)=>write(...args),onSnapshot:(ref,callback)=>{if(typeof ref==="string")callback(snapshot(ref));return()=>{}}});
  const source=read("public/student-coaching-runtime.js").replace(/^import[^\n]+\n/,"");
  vm.runInContext(`(()=>{${source}\nwindow.testApplyAction=applyAction;})()`,context,{filename:"public/student-coaching-runtime.js"});
  const blockNextWrite=(kind="write")=>{let started,release,reject;const blocked=new Promise(resolve=>started=resolve),ready=new Promise((resolve,fail)=>{release=resolve;reject=fail});if(kind==="profile")profileGate={started,ready};else writeGate={started,ready};return{started:blocked,release,reject}};
  const installLegacyAddToDay=()=>{
    Object.assign(context,{S:state,dowOf:d=>(d.getDay()+6)%7,keyOf:d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,mondayOf:d=>{const result=new Clock(d);result.setDate(result.getDate()-(result.getDay()+6)%7);return result},addDaysKey:(key,days)=>{const date=new Clock(key+"T12:00:00");date.setDate(date.getDate()+days);return context.keyOf(date)},getWeek:key=>state.weeks[key]??={s:Array.from({length:state.rows.s},()=>Array(7).fill(""))},save:()=>true,renderTodayPlan:()=>{},renderSuggest:()=>{},renderPlan:()=>{},el:()=>({classList:{contains:()=>false}}),toast:()=>{}});
    vm.runInContext(read("app.js").match(/function addToDay\([\s\S]*?\r?\n}\r?\n/)[0]+"\nwindow.addToDay=addToDay;",context);
  };
  const runTimer=ms=>{const entry=[...timers].find(([,timer])=>timer.ms===ms);assert.ok(entry,`${ms} ms timer should exist`);timers.delete(entry[0]);entry[1].fn()};
  return{window,state,docs,writes,tasks,timers,intervals,events,dataset,writeErrors,blockNextWrite,installLegacyAddToDay,runTimer,signIn:(uid=user.uid)=>{docs.set(`accountProfiles/${uid}`,{uid,role:"student"});return window.YKSAccountAuth.onSignedIn({user:{...user,uid},db:{},auth:{}})}};
}

test("yeni öğrencinin ilk koç paylaşımı program dahil Firestore şemasını sağlar",async()=>{
  const h=harness();await h.signIn();await h.window.YKSAccountAuth.publishShare();
  const share=h.docs.get("coachingShares/student-1");
  assert.ok(share,"Paylaşım belgesi oluşturulmalı");
  assert.equal(share.program.version,3);
  assert.equal(share.program.weeks[0].week,"2026-10-05");
  assert.equal(Array.isArray(share.program.weeks[0].data.s),false,"Firestore rows are maps containing arrays");
  assert.equal(share.program.weeks[0].data.s[0][0],"Matematik");
});

test("koç paylaşımı başlangıçta ve sonraki yazımlarda güncel yerel programı v3 haritası olarak taşır",async()=>{
  const seed=harness();await seed.signIn();await seed.window.YKSAccountAuth.publishShare();
  const existing=seed.docs.get("coachingShares/student-1");
  assert.ok(existing,"Önce geçerli ilk paylaşım oluşmalı");
  existing.program.weeks[0].data.s[0][0]="Buluttaki eski görev";
  const h=harness({share:existing});await h.signIn();await h.window.YKSAccountAuth.publishShare();
  assert.equal(h.docs.get("coachingShares/student-1").program.weeks[0].data.s[0][0],"Matematik");
  h.state.weeks["2026-10-05"].s[0][0]="Güncel yerel görev";
  h.state.name="Yeni ad";await h.window.YKSAccountAuth.publishShare();
  assert.equal(h.docs.get("coachingShares/student-1").program.weeks[0].data.s[0][0],"Güncel yerel görev");
  assert.equal(h.docs.get("coachingShares/student-1").profile.name,"Yeni ad");
});

test("koç görevleri addToDay API'sine hedef tarihin sayısal hafta uzaklığını verir",()=>{
  const h=harness();
  h.window.testApplyAction({type:"program_task",payload:{text:"İleri görev",date:"2026-10-05"}});
  h.window.testApplyAction({type:"post_exam_task",payload:{text:"Geçmiş görev",date:"2026-09-06"}});
  assert.equal(h.tasks[0].day,0);assert.equal(h.tasks[0].weekOffset,3);
  assert.equal(h.tasks[1].day,6);assert.equal(h.tasks[1].weekOffset,-2);
});

test("gerçek addToDay gelecekteki ve geçmişteki koç görevini doğru haftaya yazar",()=>{
  const h=harness();h.installLegacyAddToDay();
  h.window.testApplyAction({type:"program_task",payload:{text:"İleri görev",date:"2026-10-06"}});
  h.window.testApplyAction({type:"post_exam_task",payload:{text:"Geçmiş görev",date:"2026-09-06"}});
  assert.equal(h.state.weeks["2026-10-05"].s[0][1],"Koç · İleri görev");
  assert.equal(h.state.weeks["2026-08-31"].s[0][6],"Koç · Deneme sonrası · Geçmiş görev");
  assert.equal(h.state.weeks["2026-09-14"],undefined);
});

test("paylaşım sürerken gelen değişiklik 120 ms kuyruğuyla yeniden paylaşılır",async()=>{
  const h=harness();await h.signIn();
  const gate=h.blockNextWrite(),first=h.window.YKSAccountAuth.publishShare();await gate.started;
  h.state.name="Son öğrenci değişikliği";await h.window.YKSAccountAuth.publishShare();
  gate.release();await first;
  assert.equal(h.docs.get("coachingShares/student-1").profile.name,"Öğrenci");
  assert.ok([...h.timers.values()].some(timer=>timer.ms===120));
  await h.window.YKSAccountAuth.publishShare();
  assert.equal(h.docs.get("coachingShares/student-1").profile.name,"Son öğrenci değişikliği");
});

test("önceki hesabın geç biten paylaşımı yeni öğrencinin ilk paylaşımını engellemez",async()=>{
  const h=harness();await h.signIn();
  const gate=h.blockNextWrite(),first=h.window.YKSAccountAuth.publishShare();await gate.started;
  h.window.YKSAccountAuth.onSignedOut();await h.signIn("student-2");
  gate.release();await first;
  h.state.name="İkinci öğrenci";await h.window.YKSAccountAuth.publishShare();
  const second=h.docs.get("coachingShares/student-2");
  assert.ok(second,"Yeni oturum önceki yazmanın paylaşım durumunu devralmamalı");
  assert.equal(second.studentUid,"student-2");assert.equal(second.profile.name,"İkinci öğrenci");assert.equal(second.program.version,3);
});

test("önceki hesabın geciken profil yanıtı yeni oturumun köprülerini tekrar başlatmaz",async()=>{
  const h=harness(),gate=h.blockNextWrite("profile"),first=h.signIn();await gate.started;
  h.window.YKSAccountAuth.onSignedOut();await h.signIn("student-2");
  gate.release();await assert.rejects(first,error=>error.code==="account-session-changed");
  await h.window.YKSAccountAuth.publishShare();
  assert.ok(h.docs.get("coachingShares/student-2"));
  assert.equal(h.docs.get("coachingShares/student-1"),undefined);
});

test("tarihsiz koç görevi yerel gece yarısından sonra bugünün programına gider",()=>{
  const h=harness({now:"2026-09-18T00:30:00"});h.installLegacyAddToDay();
  h.window.testApplyAction({type:"program_task",payload:{text:"Bugünkü görev"}});
  assert.equal(h.state.weeks["2026-09-14"].s[0][4],"Koç · Bugünkü görev");
});

test("koç tarihleri takvimde olmayan bir güne sessizce kaydırılmaz",()=>{
  const h=harness();
  for(const type of ["program_task","topic_deadline"]){
    assert.throws(()=>h.window.testApplyAction({type,payload:{text:"Görev",key:"TYT|Matematik|Sayılar",date:"2026-02-30"}}),/geçersiz/i);
  }
  assert.equal(h.tasks.length,0);assert.equal(h.state.topics,undefined);
});

test("manuel koç paylaşımı otomatik yazımı bekler ve başarılı sonucu döndürür",async()=>{
  const h=harness();await h.signIn();
  const gate=h.blockNextWrite(),automatic=h.window.YKSAccountAuth.publishShare();await gate.started;
  let completed=false;
  const manual=h.window.YKSAccountAuth.publishShare({manual:true}).then(result=>{completed=true;return result});
  await Promise.resolve();assert.equal(completed,false);
  gate.release();assert.equal(await automatic,true);assert.equal(await manual,true);
  assert.equal(h.dataset.coachShare,"ready");assert.equal(h.dataset.coachShareError,undefined);
});

test("manuel koç paylaşımı Firebase hatasını döndürür ve otomatik yazım hatası bekleyene ulaşır",async()=>{
  const h=harness();await h.signIn();
  const error=Object.assign(new Error("Paylaşım izni reddedildi"),{code:"permission-denied"});
  h.writeErrors.push(error,error);
  await assert.rejects(h.window.YKSAccountAuth.publishShare({manual:true}),actual=>actual===error);
  assert.equal(h.dataset.coachShareError,"permission-denied");
  const gate=h.blockNextWrite(),automatic=h.window.YKSAccountAuth.publishShare();await gate.started;
  const manual=assert.rejects(h.window.YKSAccountAuth.publishShare({manual:true}),/permission-denied/);
  h.writeErrors.push(error,error);gate.release();
  assert.equal(await automatic,false);await manual;
});

test("koç paylaşımı eski belge alanlarını tam yazımla temizler",async()=>{
  const seed=harness();await seed.signIn();await seed.window.YKSAccountAuth.publishShare();
  const h=harness({share:{...seed.docs.get("coachingShares/student-1"),legacyField:true}});await h.signIn();
  assert.equal(await h.window.YKSAccountAuth.publishShare({manual:true}),true);
  assert.equal(h.docs.get("coachingShares/student-1").legacyField,undefined);
  assert.equal(h.writes.at(-1).merge,false);
  assert.equal(h.docs.get("coachingShares/student-1").program.version,3);
});

test("eski oturumun geç biten yazımı yeni oturumun devam eden yazımını serbest bırakmaz",async()=>{
  const h=harness();await h.signIn();
  const oldGate=h.blockNextWrite(),oldShare=h.window.YKSAccountAuth.publishShare();await oldGate.started;
  h.window.YKSAccountAuth.onSignedOut();await h.signIn("student-2");
  const newGate=h.blockNextWrite(),newShare=h.window.YKSAccountAuth.publishShare();await newGate.started;
  oldGate.release();assert.equal(await oldShare,false);
  assert.equal(await h.window.YKSAccountAuth.publishShare(),false);
  assert.equal(h.docs.has("coachingShares/student-2"),false);
  newGate.release();assert.equal(await newShare,true);
  assert.ok([...h.timers.values()].some(timer=>timer.ms===120));
});

test("eski oturumun paylaşım hatası yeni oturumu hata durumuna sokmaz veya yeniden yazmaz",async()=>{
  const h=harness();await h.signIn();
  const gate=h.blockNextWrite(),first=h.window.YKSAccountAuth.publishShare();await gate.started;
  h.window.YKSAccountAuth.onSignedOut();await h.signIn("student-2");
  await h.window.YKSAccountAuth.publishShare({manual:true});
  gate.reject(new Error("Eski oturumun izni bitti"));assert.equal(await first,false);
  assert.equal(h.dataset.coachShare,"ready");assert.equal(h.dataset.coachShareError,undefined);
  assert.equal(h.writes.filter(write=>write.ref==="coachingShares/student-1").length,0);
});

test("oturum değişince devam eden veya otomatik yazımı bekleyen manuel paylaşım reddedilir",async()=>{
  for(const manualFirst of [false,true]){
    const h=harness();await h.signIn();
    const gate=h.blockNextWrite(),first=h.window.YKSAccountAuth.publishShare({manual:manualFirst});await gate.started;
    const expected=manualFirst?assert.rejects(first,error=>error.code==="account-session-changed"):null;
    const queued=assert.rejects(h.window.YKSAccountAuth.publishShare({manual:true}),error=>error.code==="account-session-changed");
    h.window.YKSAccountAuth.onSignedOut();await h.signIn("student-2");
    gate.release();await expected;await queued;
    if(!manualFirst)assert.equal(await first,false);
    assert.equal(h.docs.has("coachingShares/student-2"),false);
  }
});

test("yerel veriyi bekleyen eski giriş yeni oturumda dinleyici ve zamanlayıcı kurmaz",async()=>{
  const h=harness();h.window.S=null;
  const first=assert.rejects(h.signIn(),error=>error.code==="account-session-changed");
  for(let i=0;i<8;i++)await Promise.resolve();
  assert.ok([...h.timers.values()].some(timer=>timer.ms===50));
  h.window.YKSAccountAuth.onSignedOut();h.window.S=h.state;await h.signIn("student-2");
  h.runTimer(50);await first;
  assert.equal(h.intervals.size,1);assert.equal(h.events.size,1);
  await h.window.YKSAccountAuth.publishShare();
  assert.equal(h.docs.get("coachingShares/student-2").studentUid,"student-2");
  assert.equal(h.docs.has("coachingShares/student-1"),false);
});
