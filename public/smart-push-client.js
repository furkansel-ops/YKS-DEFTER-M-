import{doc,getDoc,setDoc,deleteDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
/** Opt-in only; reuse the existing /sw.js controlling PWA, do not create a second SW. */
let active=false,dbRef=null,userRef=null,deviceRef=null,taskTimer=null,stopChanges=[],publicVapid=null;
const KEY="yks-push-device-id";
const state=()=>{try{return window.YKSLegacyState?.readState?.()||window.S||null}catch{return window.S||null}};
const statusChanged=()=>window.dispatchEvent(new Event("yks:smart-push-status"));
const keyOf=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const safeNumber=(x,max)=>Number.isFinite(Number(x))?Math.max(0,Math.min(max,Math.floor(Number(x)))):0;
function deviceId(){
  let id="";try{id=localStorage.getItem(KEY)||"";}catch{}
  if(/^[A-Za-z0-9_-]{8,80}$/.test(id))return id;
  id=globalThis.crypto?.randomUUID?.().replaceAll("-","")||"device"+Date.now().toString(36);
  try{localStorage.setItem(KEY,id);}catch{}
  return id;
}
function urlBase64ToUint8Array(value){
  const base64=value.replace(/-/g,"+").replace(/_/g,"/");
  const raw=atob(base64+"=".repeat((4-base64.length%4)%4));
  return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
function readConfig(){
  const gs=state()?.gamification,preferences=gs?.smartReminders;
  if(!gs||!preferences?.enabled)return null;
  const now=new Date(),day=keyOf(now);
  const goal=(gs.goals??[]).filter(x=>x.from<=day).sort((a,b)=>b.from.localeCompare(a.from))[0];
  if(!goal)return null;
  const rawMinutes=safeNumber(state()?.pomoMin?.[day],1440);
  const rawQuestions=safeNumber(state()?.solved?.[day],5000);
  return {
    day,goalMinutes:Math.max(1,safeNumber(goal.minutes,1440)),
    goalQuestions:Math.max(1,safeNumber(goal.questions,5000)),
    minutes:Math.max(0,rawMinutes-(day===gs.activationDay?gs.baselineMinutes||0:0)),
    questions:Math.max(0,rawQuestions-(day===gs.activationDay?gs.baselineQuestions||0:0)),
    restDay:Array.isArray(gs.restDays)&&gs.restDays.includes(day),
    quietStart:safeNumber(preferences.quietStart,23),
    quietEnd:safeNumber(preferences.quietEnd,23),
    timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||"Europe/Istanbul"
  };
}
let lastSyncAt=0,previousPayload="";
async function syncDevice(force=false){
  if(!active||!deviceRef||!userRef)return;
  if(!navigator.onLine)return;
  const next=readConfig();if(!next)return;
  const serialized=JSON.stringify(next),now=Date.now();
  if(!force&&serialized===previousPayload&&now-lastSyncAt<180000)return;
  if(!force&&now-lastSyncAt<60000)return;
  const subscription=await(await navigator.serviceWorker.ready).pushManager.getSubscription();
  if(!subscription)return;
  const keys=subscription.toJSON().keys??{};
  if(!keys.p256dh||!keys.auth)return;
  await setDoc(deviceRef,{
    deviceId:deviceId(),endpoint:subscription.endpoint,
    p256dh:keys.p256dh,auth:keys.auth,
    ...next,updatedAt:serverTimestamp()
  },{merge:true});
  previousPayload=serialized;lastSyncAt=now;
}
let status="Telefon bildirimleri bağlı değil.";
export function installStudentSmartPush({db,user}){
  if(!db||!user?.emailVerified)return()=>{};
  dbRef=db;userRef=user;active=true;
  const id=deviceId();
  deviceRef=doc(db,"users",user.uid,"pushDevices",id);
  // Apple Web Push requires requesting permission directly inside the tap handler.
  // Fetch public VAPID config on account connection, never just before requesting permission.
  void getDoc(doc(db,"publicConfig","push")).then(setting=>{
    if(!active||userRef?.uid!==user.uid)return;
    const vapid=setting.data()?.vapidPublicKey;
    publicVapid=typeof vapid==="string"&&vapid.length>=40?vapid:null;
    if(publicVapid)status="Sunucu anahtarı hazır; bildirimleri etkinleştirebilirsin.";
    statusChanged();
  }).catch(()=>{publicVapid=null;status="Sunucu bağlantısı hazır değil.";statusChanged();});
  async function enable(){
    if(!active||userRef?.uid!==user.uid)throw Error("Öğrenci hesabıyla giriş yapman gerekiyor.");
    if(!isSecureContext||!("serviceWorker" in navigator)||!("PushManager" in window)||
      typeof Notification==="undefined")throw Error("Bu cihazda Web Push desteklenmiyor.");
    const cfg=readConfig();
    if(!cfg)throw Error("Önce akıllı hatırlatmaları etkinleştir.");
    if(!publicVapid)
      throw Error("Sunucu VAPID anahtarı henüz hazır değil. Telefon Push'u bağlanamaz.");
    // This is the first asynchronous boundary: requestPermission MUST be invoked
    // synchronously from the user's actual tap (not after any Firebase await).
    const permissionPromise=Notification.requestPermission();
    const permission=await permissionPromise;
    if(permission!=="granted")throw Error("Cihaz bildirim izni verilmedi.");
    const registration=await navigator.serviceWorker.ready;
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription)subscription=await registration.pushManager.subscribe({
      userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(publicVapid)
    });
    if(!subscription?.endpoint)throw Error("Push aboneliği oluşturulamadı.");
    const key=subscription.toJSON().keys??{};
    if(!key.auth||!key.p256dh)throw Error("Push aboneliğinde şifreleme anahtarları eksik.");
    const existing=await getDoc(deviceRef);
    await setDoc(deviceRef,{deviceId:id,endpoint:subscription.endpoint,auth:key.auth,p256dh:key.p256dh,
      ...cfg,...(existing.exists()?{}:{createdAt:serverTimestamp()}),updatedAt:serverTimestamp()},{merge:true});
    status="Telefon bildirimlerine abone olundu. Gerçek gönderim için sunucu gerekir.";
    await syncDevice(true);
    statusChanged();return status;
  }
  async function disable(){
    const ref=deviceRef;
    const registration=await navigator.serviceWorker.getRegistration();
    const sub=await registration?.pushManager?.getSubscription();
    if(sub)await sub.unsubscribe();
    if(ref)await deleteDoc(ref);
    status="Telefon bildirimi bağlantısı kaldırıldı.";statusChanged();return status;
  }
  async function localTest(){
    if(!active||!isSecureContext||!("serviceWorker" in navigator)||
      typeof Notification==="undefined")throw Error("Bu cihazda yerel bildirim desteği yok.");
    // Independent of Firebase/VAPID and triggered immediately from the test tap.
    // This verifies OS permission and local display only, NOT remote push delivery.
    const asked=Notification.requestPermission();
    if(await asked!=="granted")throw Error("Bildirim izni verilmedi.");
    const reg=await navigator.serviceWorker.ready;
    await reg.showNotification("YKS Defterim · Yerel test",{
      body:"Bu, sunucu üzerinden gelmeyen yerel bir cihaz bildirimidir.",
      tag:"yks-local-push-test",data:{type:"yks-local-test"}
    });
    return "Yerel test gösterildi. Bu işlem gerçek Firebase Push gönderimini doğrulamaz.";
  }
  window.YKSSmartPush={enable,disable,localTest,status:()=>status};
  let lastOptIn=Boolean(readConfig());
  const changed=()=>{
    const optIn=Boolean(readConfig());
    if(!optIn){
      if(lastOptIn)void disable().catch(error=>console.warn("Bildirimden çıkış kaydedilemedi",error));
    }else{
      void syncDevice().catch(error=>console.warn("Bildirim cihaz profili",error));
    }
    lastOptIn=optIn;
  };
  for(const event of ["yks:data-changed","yks:smart-reminders-settings","online"])
    {window.addEventListener(event,changed);stopChanges.push(()=>window.removeEventListener(event,changed));}
  taskTimer=window.setInterval(changed,240000);
  statusChanged();changed();
  return()=>{
    const oldRef=deviceRef;
    active=false;userRef=null;dbRef=null;deviceRef=null;publicVapid=null;
    for(const stop of stopChanges.splice(0))stop();
    if(taskTimer){clearInterval(taskTimer);taskTimer=null;}
    delete window.YKSSmartPush;
    // Unsubscribe + remove previous student's device record on logout.
    void (async()=>{
      try{
        const registration=await navigator.serviceWorker.getRegistration();
        const subscription=await registration?.pushManager?.getSubscription();
        if(subscription)await subscription.unsubscribe();
        if(oldRef)await deleteDoc(oldRef);
      }catch(error){console.warn("Eski push cihaz bağı kapatılamadı",error);}
    })();
  };
}
