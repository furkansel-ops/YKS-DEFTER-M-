import {Capacitor,registerPlugin,type PluginListenerHandle,type PermissionState} from "@capacitor/core";

type FocusMode="pomo"|"sw";
type WebSnapshot={
  active:boolean;mode:FocusMode;running:boolean;isWork:boolean;totalMs:number;remainingMs:number;elapsedMs:number;
  startedAt:number;subject:string;topic:string;task:string;creditedMinutes:number;todayMinutes:number;
};
type NativeState=WebSnapshot&{
  sessionId:string;updatedAt:number;actionAt:number;segmentStartedAt:number;segmentMs:number;revision:number;
  baseTodayMinutes:number;pendingAction:string;
};
type FocusTimerPlugin={
  sync(options:WebSnapshot&{sessionId:string}):Promise<void>;
  getState():Promise<NativeState>;
  ack(options:{revision:number}):Promise<void>;
  checkPermissions():Promise<{notifications:PermissionState}>;
  requestPermissions():Promise<{notifications:PermissionState}>;
  addListener(eventName:"focusAction",listener:(state:NativeState)=>void):Promise<PluginListenerHandle>;
};
type LegacyBridge={
  snapshot?:()=>WebSnapshot;
  apply?:(state:NativeState)=>boolean;
};

const FocusTimer=registerPlugin<FocusTimerPlugin>("FocusTimer");
const WRAPPED=["startPomo","pausePomo","resetPomo","finishPhase","skipPhase","swStart","swPause","swReset","setPomoSubject","setPomoTopic","setPomoTask","setFocusMode"] as const;

function legacyBridge():LegacyBridge{
  return (window as unknown as {YKSFocusNativeBridge?:LegacyBridge}).YKSFocusNativeBridge||{};
}
function legacyFunction(name:string):((...args:unknown[])=>unknown)|null{
  const value=(window as unknown as Record<string,unknown>)[name];
  return typeof value==="function"?value as (...args:unknown[])=>unknown:null;
}
function makeSessionId(snapshot:WebSnapshot):string{
  const base=snapshot.startedAt||Date.now();
  return snapshot.mode+"-"+base+"-"+Math.random().toString(36).slice(2,8);
}

export function installAndroidFocusNotification(){
  if(Capacitor.getPlatform()!=="android"){
    document.documentElement.dataset.focusLiveNotification="web";
    return {installed:false,platform:"web"};
  }

  let reconciling=false,permissionChecked=false,sessionId="",syncTimer=0,lastRevision=0;
  const originals=new Map<string,(...args:unknown[])=>unknown>();

  async function ensureNotificationPermission(){
    if(permissionChecked)return;
    permissionChecked=true;
    try{
      const current=await FocusTimer.checkPermissions();
      if(current.notifications!=="granted")await FocusTimer.requestPermissions();
    }catch(error){
      console.warn("Odak canlı bildirim izni alınamadı",error);
    }
  }

  async function syncFromWeb(){
    if(reconciling)return;
    const snapshot=legacyBridge().snapshot?.();
    if(!snapshot)return;
    if(!snapshot.active){
      sessionId="";
      try{await FocusTimer.sync({...snapshot,sessionId:""});}catch(error){console.warn("Odak bildirimi kapatılamadı",error);}
      return;
    }
    if(!sessionId)sessionId=makeSessionId(snapshot);
    await ensureNotificationPermission();
    try{await FocusTimer.sync({...snapshot,sessionId});}
    catch(error){console.warn("Odak canlı bildirimi güncellenemedi",error);}
  }

  function queueSync(){
    window.clearTimeout(syncTimer);
    syncTimer=window.setTimeout(()=>{void syncFromWeb();},40);
  }

  async function reconcile(state:NativeState){
    if(!state||(!state.active&&!state.pendingAction))return;
    if(state.sessionId)sessionId=state.sessionId;
    if(state.revision&&state.revision<lastRevision)return;
    reconciling=true;
    try{
      legacyBridge().apply?.(state);
      lastRevision=Math.max(lastRevision,Number(state.revision)||0);
      if(state.revision)await FocusTimer.ack({revision:state.revision});
    }catch(error){
      console.warn("Odak canlı bildirim durumu uygulanamadı",error);
    }finally{
      reconciling=false;
    }
    if(state.active)queueSync();else sessionId="";
  }

  async function refreshFromNative(){
    try{
      const state=await FocusTimer.getState();
      if(state&&state.sessionId)sessionId=state.sessionId;
      if(state&&(state.active||state.pendingAction))await reconcile(state);
      else queueSync();
    }catch(error){
      console.warn("Odak canlı bildirim durumu okunamadı",error);
    }
  }

  for(const name of WRAPPED){
    const original=legacyFunction(name);
    if(!original||originals.has(name))continue;
    originals.set(name,original);
    (window as unknown as Record<string,unknown>)[name]=function(this:unknown,...args:unknown[]){
      const result=original.apply(this,args);
      if(!reconciling)queueSync();
      return result;
    };
  }

  void FocusTimer.addListener("focusAction",state=>{void reconcile(state);});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)void refreshFromNative();});
  window.addEventListener("pageshow",()=>{void refreshFromNative();});
  window.addEventListener("focus",()=>{void refreshFromNative();});
  window.setTimeout(()=>{void refreshFromNative();},350);
  document.documentElement.dataset.focusLiveNotification="ready";
  return {installed:true,platform:"android"};
}
