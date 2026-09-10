const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {pathToFileURL}=require("node:url");
const source=fs.readFileSync(path.resolve(__dirname,"../public/session-mode.js"),"utf8");

function storage(initial={}){
  const rows=new Map(Object.entries(initial));
  return {rows,get length(){return rows.size;},getItem:key=>rows.has(String(key))?rows.get(String(key)):null,
    setItem:(key,value)=>rows.set(String(key),String(value)),removeItem:key=>rows.delete(String(key)),
    key:index=>[...rows.keys()][index]??null,clear:()=>rows.clear()};
}
function harness(local=storage(),session=storage()){
  const events=[],window={localStorage:local,sessionStorage:session,document:{documentElement:{dataset:{}}},
    location:{reload(){window.reloads++;}},reloads:0,dispatchEvent:event=>events.push(event)};
  vm.runInNewContext(source,{window,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}});
  return {window,api:window.__YKS_SESSION__,local,session,events};
}

test("oturum doğrulanmadan legacy kayıtları yalnız karantinaya yazılır; eski kayıt bozulmaz",()=>{
  const h=harness(storage({yks:"old",yks_cloud_account:"owner","firebase:auth":"session"}));
  assert.equal(h.api.mode,"locked");assert.equal(h.window.localStorage.getItem("yks"),"old");
  h.window.localStorage.setItem("yks","pending");h.window.localStorage.removeItem("yks_cloud_account");
  assert.equal(h.window.localStorage.getItem("yks"),"pending");
  assert.equal(h.local.getItem("yks"),"old");assert.equal(h.local.getItem("yks_cloud_account"),"owner");
  h.window.localStorage.setItem("firebase:auth","new-session");
  assert.equal(h.local.getItem("firebase:auth"),"new-session");
});

test("doğrulanmış hesap başlangıç karantinasını aktarır; çıkış yeni yazıları tekrar keser",async()=>{
  const h=harness(storage({yks:"old"}));
  const captured=h.window.localStorage;
  captured.setItem("yks","startup");captured.setItem("yks_device_id","new-device");
  assert.equal(h.api.enterAccount("owner"),true);assert.equal(await h.api.ready,"account");
  assert.equal(h.local.getItem("yks_cloud_account"),"owner");
  assert.equal(h.local.getItem("yks"),"startup");assert.equal(h.local.getItem("yks_device_id"),"new-device");
  captured.yks="account-change";assert.equal(h.local.getItem("yks"),"account-change");
  h.api.lock();captured.yks="after-signout";delete captured.yks_device_id;
  assert.equal(h.local.getItem("yks"),"account-change");assert.equal(h.local.getItem("yks_device_id"),"new-device");
  assert.equal(h.api.canPersist(),false);
});

test("kaydetmeden açılış eski defteri okumaz, değişiklikleri hiçbir kalıcı depoya yazmaz",async()=>{
  const disk=storage({yks:"private-old",yks_yedek:"private-backup","firebase:auth":"sdk"}),session=storage();
  const first=harness(disk,session);assert.equal(first.api.enterGuest(),false);assert.equal(first.window.reloads,1);
  const guest=harness(disk,session);
  assert.equal(guest.api.mode,"guest");assert.equal(await guest.api.ready,"guest");
  assert.equal(guest.window.localStorage.getItem("yks"),null);
  guest.window.localStorage.setItem("yks","temporary");guest.window.localStorage.setItem("yks_focus_runtime_v1","timer");
  guest.window.sessionStorage.setItem("yks_notes","temporary-note");
  assert.equal(disk.getItem("yks"),"private-old");assert.equal(disk.getItem("yks_focus_runtime_v1"),null);
  assert.equal(session.getItem("yks_notes"),null);
  assert.equal(guest.window.localStorage.getItem("firebase:auth"),"sdk");
  assert.equal(Object.values(guest.window.localStorage).includes("private-old"),false);
  guest.api.lock();assert.equal(guest.api.mode,"guest");
});

test("misafirden hesaba geçiş yeni sayfa açar ve geçici çalışmayı kesinlikle aktarmadan bırakır",()=>{
  const h=harness(storage({yks:"private-old"}),storage({yks_session_next_mode_v1:"guest"}));
  h.window.localStorage.setItem("yks","never-upload-me");
  assert.equal(h.api.enterAccount("owner"),false);assert.equal(h.window.reloads,1);assert.equal(h.api.mode,"guest");
  assert.equal(h.local.getItem("yks"),"private-old");
  assert.equal(h.local.getItem("yks_cloud_account"),null);
  const fresh=harness(h.local,h.session);
  assert.equal(fresh.api.mode,"locked");assert.equal(fresh.window.localStorage.getItem("yks"),"private-old");
  assert.equal(fresh.api.enterAccount("owner"),true);assert.equal(h.local.getItem("yks"),"private-old");
});

test("misafir yenileme/kapama sonrası çalışması kalmaz; clear eski defter ve Firebase'i silmez",()=>{
  const h=harness(storage({yks:"private",yks_yedek:"backup","firebase:auth":"sdk"}),storage({yks_session_next_mode_v1:"guest"}));
  h.window.localStorage.setItem("yks","temporary");h.window.localStorage.clear();
  assert.equal(h.window.localStorage.getItem("yks"),null);
  assert.equal(h.local.getItem("yks"),"private");assert.equal(h.local.getItem("yks_yedek"),"backup");
  assert.equal(h.local.getItem("firebase:auth"),"sdk");
  const fresh=harness(h.local,h.session);assert.equal(fresh.api.mode,"locked");assert.equal(fresh.window.localStorage.getItem("yks"),"private");
});

test("kalıcı yazı başarısızlığında hesap kayıt modu açılmaz ve eski değerler geri korunur",()=>{
  const disk=storage({yks:"old"}),originalSet=disk.setItem;
  disk.setItem=(key,value)=>{if(key==="yks_device_id")throw Error("quota");return originalSet(key,value);};
  const h=harness(disk);h.window.localStorage.setItem("yks","pending");h.window.localStorage.setItem("yks_device_id","device");
  assert.throws(()=>h.api.enterAccount("owner"),/kayıt alanı/);
  assert.equal(h.api.mode,"locked");assert.equal(disk.getItem("yks"),"old");
  assert.equal(disk.getItem("yks_cloud_account"),null);
});

test("çevrimdışı hesap sahibi kalıcı bağlanır; yeniden açılışta farklı hesap defteri devralamaz",async()=>{
  const disk=storage({yks:"unbound-legacy"}),first=harness(disk);
  assert.equal(first.api.enterAccount("account-a"),true);
  first.window.localStorage.setItem("yks","account-a-offline-work");first.api.lock();
  assert.equal(disk.getItem("yks_cloud_account"),"account-a");
  const restarted=harness(disk);let ready=false;restarted.api.ready.then(()=>{ready=true;});
  restarted.window.localStorage.setItem("yks","must-not-promote-b");
  assert.throws(()=>restarted.api.enterAccount("account-b"),/başka hesaba bağlı/);
  await Promise.resolve();assert.equal(ready,false);assert.equal(restarted.api.mode,"locked");
  assert.equal(disk.getItem("yks"),"account-a-offline-work");assert.equal(disk.getItem("yks_cloud_account"),"account-a");
  assert.equal(harness(disk).api.enterAccount("account-a"),true);
});

test("eski veya değiştirilmiş karantina hesap sahibini silemez veya başka UID ile değiştiremez",()=>{
  for(const edit of [null,"wrong-owner"]){
    const disk=storage({yks:"saved",yks_cloud_account:"owner"}),h=harness(disk);
    if(edit===null)h.window.localStorage.removeItem("yks_cloud_account");else h.window.localStorage.setItem("yks_cloud_account",edit);
    assert.throws(()=>h.api.enterAccount("wrong-owner"),/başka hesaba bağlı/);
    assert.equal(disk.getItem("yks_cloud_account"),"owner");
    assert.equal(h.api.enterAccount("owner"),true);assert.equal(disk.getItem("yks_cloud_account"),"owner");
    assert.equal(h.window.localStorage.getItem("yks_cloud_account"),"owner");
  }
  const disk=storage({yks:"unbound"}),h=harness(disk);
  h.window.localStorage.setItem("yks_cloud_account","stale-startup-value");
  assert.equal(h.api.enterAccount("verified-owner"),true);assert.equal(disk.getItem("yks_cloud_account"),"verified-owner");
});

test("sayfa açıldıktan sonra başka sekmenin bağladığı gerçek sahip yeniden kontrol edilir",()=>{
  const disk=storage({yks:"old"}),h=harness(disk);
  h.window.localStorage.setItem("yks_cloud_account","stale-a");h.window.localStorage.setItem("yks","pending-a");
  disk.setItem("yks_cloud_account","verified-b");
  assert.throws(()=>h.api.enterAccount("stale-a"),/başka hesaba bağlı/);
  assert.equal(disk.getItem("yks_cloud_account"),"verified-b");assert.equal(disk.getItem("yks"),"old");
});

test("sahip UID depoya yazılamaz veya geri okunamazsa çalışma verisi aktarılmadan kilit korunur",async()=>{
  for(const failure of ["throw","silent"]){
    const disk=storage({yks:"old"}),set=disk.setItem,h=harness(disk);let ready=false;
    disk.setItem=(key,value)=>{if(key==="yks_cloud_account"){if(failure==="throw")throw Error("quota");return;}return set(key,value);};
    h.window.localStorage.setItem("yks","pending");h.api.ready.then(()=>{ready=true;});
    assert.throws(()=>h.api.enterAccount("owner"),/kayıt alanı/);
    await Promise.resolve();assert.equal(ready,false);assert.equal(h.api.mode,"locked");
    assert.equal(disk.getItem("yks_cloud_account"),null);assert.equal(disk.getItem("yks"),"old");
  }
});

test("karantina aktarımı tamamlanmadan sahip değişirse yeni sahip silinmez ve açılış iptal edilir",()=>{
  const disk=storage({yks:"old"}),set=disk.setItem,h=harness(disk);
  h.window.localStorage.setItem("yks","pending");
  disk.setItem=(key,value)=>{set(key,value);if(key==="yks"&&value==="pending")set("yks_cloud_account","other-tab-owner");};
  assert.throws(()=>h.api.enterAccount("owner"),/kayıt alanı/);
  assert.equal(h.api.mode,"locked");assert.equal(disk.getItem("yks"),"old");
  assert.equal(disk.getItem("yks_cloud_account"),"other-tab-owner");
});

test("disk sorunu geri alma işlemini de engellerse kısmi veri sahipsiz bırakılamaz",()=>{
  const disk=storage({yks:"old"}),set=disk.setItem,h=harness(disk);
  h.window.localStorage.setItem("yks","pending");h.window.localStorage.setItem("yks_device_id","device");
  disk.setItem=(key,value)=>{if(key==="yks_device_id"||(key==="yks"&&value==="old"))throw Error("quota");return set(key,value);};
  assert.throws(()=>h.api.enterAccount("owner"),/Kayıt alanı/);
  assert.equal(h.api.mode,"locked");assert.equal(disk.getItem("yks_cloud_account"),"owner");
  assert.equal(disk.getItem("yks"),"pending");
  assert.throws(()=>harness(disk).api.enterAccount("another-owner"),/başka hesaba bağlı/);
});

test("aynı sayfada farklı hesap kalıcı defteri devralamaz",()=>{
  const h=harness(storage({yks:"owner-data"}));h.api.enterAccount("owner");h.api.lock();
  h.window.localStorage.setItem("yks","quarantine");
  assert.equal(h.api.enterAccount("someone-else"),false);assert.equal(h.window.reloads,1);
  assert.equal(h.local.getItem("yks"),"owner-data");assert.equal(h.api.mode,"locked");
});

test("cihaz silme yalnız önceden doğrulanmış oturumda uygulama kayıtlarını kaldırır",()=>{
  const local=storage({yks:"saved",yks_yedek:"backup",__yks_probe:"test","firebase:auth":"keep-auth",unrelated:"keep-other"});
  const storedSession=storage({yks_pending:"pending","firebase:redirect":"keep-redirect"});
  const h=harness(local,storedSession);
  assert.throws(()=>h.api.clearDeviceStudyStorage(),/giriş yapmalısın/);
  h.api.enterAccount("owner");h.api.lock();h.window.localStorage.setItem("yks","quarantined");
  h.api.clearDeviceStudyStorage();
  assert.equal(h.api.mode,"locked");assert.equal(local.getItem("yks"),null);
  assert.equal(local.getItem("yks_yedek"),null);assert.equal(local.getItem("__yks_probe"),null);
  assert.equal(storedSession.getItem("yks_pending"),null);
  assert.equal(h.window.localStorage.getItem("yks"),null);
  assert.equal(local.getItem("firebase:auth"),"keep-auth");assert.equal(local.getItem("unrelated"),"keep-other");
  assert.equal(storedSession.getItem("firebase:redirect"),"keep-redirect");
  const guest=harness(storage({yks:"old"}),storage({yks_session_next_mode_v1:"guest"}));
  assert.throws(()=>guest.api.clearDeviceStudyStorage(),/giriş yapmalısın/);assert.equal(guest.local.getItem("yks"),"old");
});

test("cihaz silme başarısızlığı sessiz başarıya dönüşmez",()=>{
  const local=storage({yks:"saved"}),h=harness(local);
  h.api.enterAccount("owner");local.removeItem=()=>{throw Error("storage denied");};
  assert.throws(()=>h.api.clearDeviceStudyStorage(),/storage denied/);
  assert.equal(h.api.canPersist(),false);assert.equal(local.getItem("yks"),"saved");
});

test("kaydetmeden başlatma işareti yazılamazsa eski defterden devam edilmez",()=>{
  const local=storage({yks:"saved"}),storedSession=storage(),h=harness(local,storedSession);
  storedSession.setItem=()=>{throw Error("quota");};
  assert.throws(()=>h.api.enterGuest(),/başlatılamadı/);
  assert.equal(h.window.reloads,0);assert.equal(h.api.mode,"locked");assert.equal(local.getItem("yks"),"saved");
});

test("giriş beklerken başka sekme kaydederse salt okunmuş eski S hesabı açamaz",async()=>{
  const disk=storage({yks:"old-before-login",yks_cloud_account:"owner"}),h=harness(disk);
  assert.equal(h.window.localStorage.getItem("yks"),"old-before-login");
  disk.setItem("yks","newer-work-from-other-tab");
  let ready=false;h.api.ready.then(()=>{ready=true;});
  assert.throws(()=>h.api.enterAccount("owner"),/diğer sekmede değişti.*sayfayı yenile/);
  await Promise.resolve();assert.equal(ready,false);assert.equal(h.api.canPersist(),false);
  assert.equal(h.window.reloads,0,"Recovery must not create an automatic reload loop");
  assert.equal(disk.getItem("yks"),"newer-work-from-other-tab");
  assert.equal(disk.getItem("yks_cloud_account"),"owner");
  const fresh=harness(disk);
  assert.equal(fresh.window.localStorage.getItem("yks"),"newer-work-from-other-tab");
  assert.equal(fresh.api.enterAccount("owner"),true);
});

test("giriş başlangıç yazıları başka sekmenin yeni çalışmasının üzerine oynatılmaz",()=>{
  const disk=storage({yks:"original",yks_cloud_account:"owner"}),h=harness(disk);
  h.window.localStorage.setItem("yks","stale-startup-normalization");
  h.window.localStorage.setItem("yks_device_id","quarantined-device");
  disk.setItem("yks","newer-in-other-tab");
  const before=Object.fromEntries(disk.rows);
  assert.throws(()=>h.api.enterAccount("owner"),/diğer sekmede değişti/);
  assert.deepEqual(Object.fromEntries(disk.rows),before);
  assert.equal(h.api.mode,"locked");
});

test("kilitli depo sayımı sonrası eklenen çalışma anahtarı yeniden açılış gerektirir",()=>{
  const disk=storage({yks:"saved",yks_cloud_account:"owner"}),h=harness(disk);
  assert.equal(h.window.localStorage.length,2);
  disk.setItem("yks_error_fix_notes_v3","new-note-from-other-tab");
  assert.throws(()=>h.api.enterAccount("owner"),/diğer sekmede değişti/);
  assert.equal(disk.getItem("yks_error_fix_notes_v3"),"new-note-from-other-tab");
  assert.equal(h.api.mode,"locked");
});

test("hesap sağlayıcısının oturum anahtarları çalışma değişikliği sayılmaz",()=>{
  const disk=storage({yks:"saved"}),h=harness(disk);
  assert.equal(h.window.localStorage.length,1);
  assert.equal(h.window.localStorage.getItem("yks"),"saved");
  disk.setItem("firebase:authUser:fixture","sdk-session");
  disk.setItem("yks_cloud_account","owner");
  assert.equal(h.api.enterAccount("owner"),true);
  assert.equal(disk.getItem("yks"),"saved");
});

function session(mode){
  let resolve;const ready=new Promise(done=>{resolve=done;});if(mode!=="locked")resolve(mode);
  return {mode,revision:0,ready,resolve,getState(){return {mode:this.mode,revision:this.revision};}};
}
const targetModule=()=>import(pathToFileURL(path.resolve(__dirname,"../src/data/session-data-target.ts")).href);
const record={key:"primary",json:'{"v":21}',schema:21,chars:8,bytes:8,source:"localStorage",sourceHash:"hash",updatedAt:1};
const meta={key:"legacy-localstorage-import-v1",migrationVersion:1,stateKey:"primary",schema:21,source:"localStorage",sourceHash:"hash",sourceChars:8,sourceBytes:8,updatedAt:1};

test("misafir Dexie yerine yalnız bellekte çalışır ve veri kopyaları dışarıdan değiştirilemez",async()=>{
  const {SessionDataTarget}=await targetModule();let created=0;
  const target=new SessionDataTarget(session("guest"),()=>{created++;throw Error("disk must not open");});
  await target.commit(record,meta);const read=await target.readState();read.json="changed";
  assert.equal((await target.readState()).json,record.json);assert.equal((await target.snapshot()).statePresent,true);
  await assert.rejects(target.writeRecord({...record,key:"cloud-base:owner"}),/giriş yapmalısın/);
  await assert.rejects(target.deleteRecord("primary"),/giriş yapmalısın/);
  assert.equal(created,0);
});

test("başlangıç kilidi Dexie açılmasını bekletir ve önceki ready çıkıştan sonraki yazıya izin vermez",async()=>{
  const {SessionDataTarget}=await targetModule();let created=0,puts=0;
  const s=session("locked"),database={state:{get:async()=>record,put:async()=>{puts++;}},meta:{get:async()=>meta,put:async()=>{puts++;}},transaction:async(...args)=>args.at(-1)()};
  const target=new SessionDataTarget(s,()=>{created++;return database;});
  const pending=target.readState();await Promise.resolve();await Promise.resolve();assert.equal(created,0);
  s.mode="account";s.resolve("account");assert.equal((await pending).json,record.json);assert.equal(created,1);
  await target.commit(record,meta);assert.equal(puts,2);
  s.mode="locked";await assert.rejects(target.commit(record,meta),/giriş yapmalısın/);
  await assert.rejects(target.writeRecord(record),/giriş yapmalısın/);assert.equal(puts,2);
});

test("çıkış sırasında bekleyen Dexie işlemi atomik olarak iptal edilir",async()=>{
  const {SessionDataTarget}=await targetModule();const s=session("account");let resolvePut,committed=false;
  const putPending=new Promise(done=>{resolvePut=done;});
  const database={state:{get:async()=>record,put:()=>putPending},meta:{get:async()=>meta,put:async()=>{}},
    transaction:async(...args)=>{await args.at(-1)();committed=true;}};
  const target=new SessionDataTarget(s,()=>database),pending=target.commit(record,meta);
  await Promise.resolve();await Promise.resolve();await Promise.resolve();
  s.mode="locked";resolvePut();await assert.rejects(pending,/giriş yapmalısın/);assert.equal(committed,false);
});

test("hızlı çıkış ve aynı hesaba giriş eski oturumun bekleyen Dexie yazısını canlandırmaz",async()=>{
  const {SessionDataTarget}=await targetModule();
  for(const operation of ["commit","writeRecord","deleteRecord"]){
    const s=session("account");let release,started,committed=false;
    const waiting=new Promise(done=>{release=done;}),entered=new Promise(done=>{started=done;});
    const deferred=()=>{started();return waiting;};
    const database={state:{put:deferred,delete:deferred},meta:{put:async()=>{}},
      transaction:async(...args)=>{await args.at(-1)();committed=true;}};
    const target=new SessionDataTarget(s,()=>database);
    const pending=operation==="commit"?target.commit(record,meta):operation==="writeRecord"?target.writeRecord(record):target.deleteRecord(record.key);
    await entered;s.mode="locked";s.revision++;s.mode="account";s.revision++;release();
    await assert.rejects(pending,/giriş yapmalısın/);assert.equal(committed,false,operation);
  }
});

test("misafir ve kilitli hesap servis düzeyinde yedek dışa aktaramaz veya içeri alamaz",async()=>{
  const {installLegacyBackupBridge}=await import(pathToFileURL(path.resolve(__dirname,"../src/data/legacy-backup-bridge.ts")).href);
  const previousWindow=global.window,previousDocument=global.document;let touched=0;
  global.document={documentElement:{dataset:{}}};
  try{
    for(const mode of ["guest","locked"]){
      global.window={__YKS_SESSION__:session(mode)};
      const api=installLegacyBackupBridge({initialize(){touched++;throw Error("must not access notebook");}},"4.4.0");
      assert.equal((await api.build()).ok,false);assert.equal((await api.restore('{}')).ok,false);
    }
    assert.equal(touched,0);
  }finally{global.window=previousWindow;global.document=previousDocument;}
});

test("yedek hazırlanırken çıkış yapılırsa sonradan tamamlanan okuma dışa aktarılamaz",async()=>{
  const {installLegacyBackupBridge}=await import(pathToFileURL(path.resolve(__dirname,"../src/data/legacy-backup-bridge.ts")).href);
  const previousWindow=global.window,previousDocument=global.document,s=session("account");
  let readStarted,releaseRead;
  const started=new Promise(done=>{readStarted=done;}),reading=new Promise(done=>{releaseRead=done;});
  global.window={__YKS_SESSION__:s};global.document={documentElement:{dataset:{}}};
  try{
    const api=installLegacyBackupBridge({initialize:async()=>{},captureLegacyWrite:async()=>{},flush:async()=>{},
      primaryJSON:()=>{readStarted();return reading;}},"4.4.0");
    const pending=api.build();await started;s.mode="locked";
    releaseRead({ok:true,json:'{"v":21,"name":"Private"}'});
    const result=await pending;assert.equal(result.ok,false);assert.match(result.message,/giriş yapmalısın/);
    assert.equal("text" in result,false);
  }finally{global.window=previousWindow;global.document=previousDocument;}
});

test("yedek geri yüklemesindeki bekleyen hazırlık sırasında çıkış kaydı değiştiremez",async()=>{
  const {installLegacyBackupBridge}=await import(pathToFileURL(path.resolve(__dirname,"../src/data/legacy-backup-bridge.ts")).href);
  const previousWindow=global.window,previousDocument=global.document,s=session("account");
  let preparationStarted,releasePreparation,reads=0,writes=0;
  const started=new Promise(done=>{preparationStarted=done;}),preparation=new Promise(done=>{releasePreparation=done;});
  global.window={__YKS_SESSION__:s};global.document={documentElement:{dataset:{}}};
  try{
    const api=installLegacyBackupBridge({initialize:async()=>{},captureLegacyWrite:async()=>{},
      flush:()=>{preparationStarted();return preparation;},primaryJSON:async()=>{reads++;},applyBackupJSON:async()=>{writes++;}},"4.4.0");
    const pending=api.restore(JSON.stringify({app:"YKS Defterim",format:2,data:{v:21,name:"Incoming"}}));
    await started;s.mode="locked";releasePreparation();
    const result=await pending;assert.equal(result.ok,false);assert.match(result.message,/giriş yapmalısın/);
    assert.equal(reads,0);assert.equal(writes,0);
  }finally{global.window=previousWindow;global.document=previousDocument;}
});
