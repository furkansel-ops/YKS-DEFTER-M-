const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {webcrypto}=require("node:crypto");
const {stripTypeScriptTypes}=require("node:module");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const rawRuntime=read("index.html").match(/<script type="application\/json" id="legacyFirebaseSyncModule"[^>]*>([\s\S]*?)<\/script>/)[1];

function productionRuntime(html=read("index.html")){
  const vite=read("vite.config.mts"),helpers=vite.slice(vite.indexOf("const FIREBASE_WEB_API_KEY"),vite.indexOf("function prepareWebCloudRuntime"));
  const compiled=stripTypeScriptTypes(helpers);
  const transformed=vm.runInNewContext(compiled+"\nextractFirebaseRuntime(input)",{input:html});
  let result;
  vm.runInNewContext(read("scripts/harden-firebase-dist.mjs").replace(/^import[^\n]+\n/gm,""),{
    readFileSync:()=>transformed,writeFileSync:(_file,value)=>result=value,resolve:path.resolve,
    process:{cwd:()=>root,exit:()=>{throw new Error("Beklenmeyen erken dist dönüşü")}},console:{log:()=>{}}
  });
  assert.ok(result.includes("const CLOUD_FORMAT=4,"));return result;
}

function harness(source,{failTransaction=false}={}){
  const storage=new Map([["yks_cloud_dirty","1"],["yks_cloud_base_rev","1"],["yks_device_id","device-test-1"]]);
  const timers=new Map(),transactions=[],state={v:21,name:"İlk kayıt"},metas=new Map(),merges=[];
  let sequence=0,writeGate=null,payloadGate=null,txReadGate=null,authRefreshes=0,authChanged,signOuts=0,nextTransactionError=null;
  const defaultMeta=()=>({format:4,revision:1,count:1,updatedAt:{toMillis:()=>1}});
  const snapshot=ref=>({exists:()=>true,data:()=>metas.get(ref)||defaultMeta()});
  const element=()=>({style:{},dataset:{},addEventListener:()=>{}});
  const window={S:state,__YKS_STATE_EPOCH:0,addEventListener:()=>{},__YKS_DATA__:{cloudPayload:async()=>{
    const json=JSON.stringify(state);
    if(payloadGate){const gate=payloadGate;payloadGate=null;gate.started();await gate.ready}
    return{ok:true,json};
  }}};
  const context=vm.createContext({window,document:{getElementById:()=>element(),addEventListener:()=>{}},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))},navigator:{onLine:true},console:{error:()=>{},warn:()=>{}},crypto:webcrypto,TextEncoder,Blob,performance,setInterval:()=>{},setTimeout:(fn,ms)=>{const id=++sequence;timers.set(id,{fn,ms});return id},clearTimeout:id=>timers.delete(id),initializeApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),GoogleAuthProvider:class{},onAuthStateChanged:(_auth,callback)=>authChanged=callback,signOut:async()=>signOuts++,onSnapshot:()=>()=>{},doc:(_db,...parts)=>parts.join("/"),collection:(_db,...parts)=>parts.join("/"),getDoc:async ref=>snapshot(ref),getDocs:async()=>({docs:[]}),serverTimestamp:()=>({toMillis:()=>2}),writeBatch:()=>({delete:()=>{},commit:async()=>{}}),runTransaction:async(_db,callback)=>{
    if(failTransaction){const error=new Error("Permission denied");error.code="permission-denied";throw error}
    if(nextTransactionError){const error=nextTransactionError;nextTransactionError=null;throw error}
    const writes=[];await callback({get:async ref=>{if(txReadGate){const gate=txReadGate;txReadGate=null;gate.started();await gate.ready}return snapshot(ref)},set:(ref,data)=>writes.push({ref,data})});
    if(writeGate){const gate=writeGate;writeGate=null;gate.started();await gate.ready}
    transactions.push(writes);const meta=writes.find(write=>write.ref.endsWith("sync/meta"));metas.set(meta.ref,meta.data);
  },DATA_SCHEMA:21,APP_VERSION:"4.4.0",PERF_STATE:{},infraHash:()=>"12345678",infraError:()=>{},conflictBackupAdd:()=>{},safeJSONParse:JSON.parse});
  vm.runInContext(source.replace(/^import[^\n]+\n/gm,"")+"\nwindow.testCloud={upload,setUser:value=>user=value,setConflictHandlers:(reader,merge)=>{readRemote=reader;applyMerged=merge}};",context);
  window.testCloud.setUser({uid:"student-1",getIdToken:async()=>authRefreshes++});
  const block=kind=>{let started,release;const blocked=new Promise(resolve=>started=resolve),ready=new Promise(resolve=>release=resolve);const gate={started,ready};if(kind==="payload")payloadGate=gate;else if(kind==="txread")txReadGate=gate;else writeGate=gate;return{started:blocked,release}};
  const change=value=>{state.name=value;window.__YKS_STATE_EPOCH++;window.yksCloudSchedule()};
  const conflict=kind=>{
    if(kind==="remote")metas.set("users/student-1/sync/meta",{...defaultMeta(),revision:2});
    else nextTransactionError=Object.assign(new Error("SYNC_CONFLICT"),{syncConflict:true});
    let started,release;const begun=new Promise(resolve=>started=resolve),ready=new Promise(resolve=>release=resolve);
    window.testCloud.setConflictHandlers(async(_meta,uid)=>{started();await ready;return{rev:2,obj:{v:21,name:"Uzak"},uid}},async(remote,local)=>{merges.push({remote,local});state.name=local.name;return true});
    return{started:begun,release};
  };
  return{window,storage,timers,transactions,block,change,conflict,merges,authRefreshes:()=>authRefreshes,authChanged,signOuts:()=>signOuts};
}

for(const [name,source] of [["kaynak",rawRuntime],["production",productionRuntime()]]){
  test(`${name}: yükleme sırasında yeni yerel kayıt dirty işaretini ve takip yüklemesini korur`,async()=>{
    const h=harness(source),gate=h.block("write"),first=h.window.testCloud.upload();await gate.started;
    h.change("Yükleme sırasında kaydedilen son veri");gate.release();await first;
    assert.equal(h.storage.get("yks_cloud_dirty"),"1","Eski snapshotın başarısı yeni kaydı temiz saymamalı");
    assert.ok([...h.timers.values()].some(timer=>timer.ms===120),"Son veri için takip yüklemesi planlanmalı");
    await h.window.testCloud.upload();
    assert.equal(h.storage.get("yks_cloud_dirty"),"0");
    const last=h.transactions.at(-1),json=last.filter(write=>write.ref.includes("/chunks/")).map(write=>write.data.data).join("");
    assert.equal(JSON.parse(json).name,"Yükleme sırasında kaydedilen son veri");
  });

  test(`${name}: asenkron snapshot hazırlanırken ikinci yükleme eşzamanlı transaction başlatmaz`,async()=>{
    const h=harness(source),gate=h.block("payload"),first=h.window.testCloud.upload();await gate.started;
    h.change("Snapshot hazırlanırken yeni veri");await h.window.testCloud.upload();
    assert.equal(h.transactions.length,0);
    gate.release();await first;
    assert.equal(h.storage.get("yks_cloud_dirty"),"1");
    await h.window.testCloud.upload();
    assert.equal(h.storage.get("yks_cloud_dirty"),"0");
    const json=h.transactions.at(-1).find(write=>write.ref.includes("/chunks/")).data.data;
    assert.equal(JSON.parse(json).name,"Snapshot hazırlanırken yeni veri");
  });

  test(`${name}: eski hesabın bekleyen snapshotı yeni hesaba yüklenmez`,async()=>{
    const h=harness(source),gate=h.block("payload"),old=h.window.testCloud.upload();await gate.started;
    await h.authChanged(null);h.window.testCloud.setUser({uid:"student-2"});h.change("İkinci hesabın verisi");
    await h.window.testCloud.upload();gate.release();await old;
    assert.equal(h.transactions.length,1);assert.equal(h.storage.get("yks_cloud_dirty"),"0");
    for(const write of h.transactions[0])assert.ok(write.ref.startsWith("users/student-2/"));
    const json=h.transactions[0].find(write=>write.ref.includes("/chunks/")).data.data;
    assert.equal(JSON.parse(json).name,"İkinci hesabın verisi");
  });

  test(`${name}: eski transaction sonucu yeni hesabın dirty işaretini veya aktif yükleme kilidini değiştirmez`,async()=>{
    const h=harness(source),oldGate=h.block("write"),old=h.window.testCloud.upload();await oldGate.started;
    await h.authChanged(null);h.window.testCloud.setUser({uid:"student-2"});h.change("İkinci hesabın verisi");
    const newGate=h.block("write"),current=h.window.testCloud.upload();await newGate.started;
    oldGate.release();await old;
    assert.equal(h.storage.get("yks_cloud_dirty"),"1");assert.equal(h.storage.get("yks_cloud_base_rev"),"1");
    await h.window.testCloud.upload();assert.equal(h.transactions.length,1);
    newGate.release();await current;
    assert.equal(h.transactions.length,2);assert.equal(h.storage.get("yks_cloud_dirty"),"0");
    for(const write of h.transactions[0])assert.ok(write.ref.startsWith("users/student-1/"));
    for(const write of h.transactions[1])assert.ok(write.ref.startsWith("users/student-2/"));
  });

  test(`${name}: transaction okuması sırasında hesap değişirse eski yazım iptal edilir`,async()=>{
    const h=harness(source),gate=h.block("txread"),old=h.window.testCloud.upload();await gate.started;
    await h.authChanged(null);h.window.testCloud.setUser({uid:"student-2"});gate.release();await old;
    assert.equal(h.transactions.length,0);assert.equal(h.storage.get("yks_cloud_dirty"),"1");
  });

  for(const kind of ["remote","transaction"]){
    test(`${name}: ${kind} çakışması indirilirken yapılan yeni yerel kayıt birleştirmede korunur`,async()=>{
      const h=harness(source),gate=h.conflict(kind),pending=h.window.testCloud.upload();await gate.started;
      h.change("Çakışma okunurken kaydedilen son veri");gate.release();await pending;
      assert.equal(h.merges.length,1);assert.equal(h.merges[0].local.name,"Çakışma okunurken kaydedilen son veri");
      assert.equal(h.merges[0].remote.uid,"student-1");assert.equal(h.storage.get("yks_cloud_dirty"),"1");
      assert.ok(h.timers.size>0);
    });
  }
}

test("production: permission-denied yalnız bir auth yenilemesinden sonra otomatik retry'ı durdurur",async()=>{
  const h=harness(productionRuntime(),{failTransaction:true});
  await h.window.testCloud.upload();assert.equal(h.authRefreshes(),1);assert.equal(h.timers.size,1);
  h.timers.clear();await h.window.testCloud.upload();
  assert.equal(h.authRefreshes(),1);assert.equal(h.timers.size,0);assert.equal(h.storage.get("yks_cloud_dirty"),"1");
});

test("production: eski profil yanıtının hatası yeni hesabı çıkışa zorlamaz",async()=>{
  const h=harness(productionRuntime());let started,rejectProfile;
  const begun=new Promise(resolve=>started=resolve),profile=new Promise((_resolve,reject)=>rejectProfile=reject);
  h.window.YKSAccountAuth={onSignedIn:ctx=>{if(ctx.user.uid==="student-old"){started();return profile}return{role:"coach"}}};
  const old=h.authChanged({uid:"student-old"});await begun;
  await h.authChanged({uid:"coach-new"});
  rejectProfile(Object.assign(new Error("Hesap oturumu değişti"),{code:"account-session-changed"}));await old;
  assert.equal(h.signOuts(),0);assert.equal(h.transactions.length,0);
});

test("production: temel hesap köprüsü hazır olsa da giriş tüm hesap sarmalayıcılarını bekler",async()=>{
  const h=harness(productionRuntime()),calls=[];let finishLoader;
  h.window.YKSAccountAuth={onSignedIn:()=>{calls.push("base");return{role:"coach"}}};
  h.window.__YKS_ACCOUNT_READY__=Promise.resolve(h.window.YKSAccountAuth);
  h.window.__YKS_ACCOUNT_LOADER_READY__=new Promise(resolve=>finishLoader=resolve);
  const pending=h.authChanged({uid:"student-waiting"});
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(calls,[],"Temel köprü sonraki program ve oturum sarmalayıcılarını atlamamalı");
  assert.ok([...h.timers.values()].some(timer=>timer.ms===2500));
  h.window.YKSAccountAuth.onSignedIn=()=>{calls.push("wrapped");return{role:"coach"}};
  finishLoader(true);await pending;
  assert.deepEqual(calls,["wrapped"]);assert.equal(h.signOuts(),0);
});

test("production: hesap yükleme zinciri beklemesi 2500 ms sonra mevcut köprüye döner",async()=>{
  const h=harness(productionRuntime()),calls=[];
  h.window.YKSAccountAuth={onSignedIn:()=>{calls.push("base");return{role:"coach"}}};
  h.window.__YKS_ACCOUNT_LOADER_READY__=new Promise(()=>{});
  const pending=h.authChanged({uid:"student-timeout"});
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(calls,[]);
  const timeout=[...h.timers.values()].find(timer=>timer.ms===2500);
  assert.ok(timeout,"Hesap modülleri giriş işlemini süresiz bekletmemeli");
  timeout.fn();await pending;
  assert.deepEqual(calls,["base"]);assert.equal(h.signOuts(),0);
});

test("production Firebase çıkarımı Windows CRLF ve LF girdilerinde aynı kodu üretir",()=>{
  const lf=read("index.html").replace(/\r\n/g,"\n");
  assert.equal(productionRuntime(lf.replace(/\n/g,"\r\n")),productionRuntime(lf));
});
