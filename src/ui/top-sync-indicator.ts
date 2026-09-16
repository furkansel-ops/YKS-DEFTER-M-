import "./top-sync-indicator.css";

const INDICATOR_ID="topSyncIndicator";
const CLOUD_BOX_ID="cloudSyncBox";

type SyncVisualState="active"|"syncing"|"off";

let cloudObserver:MutationObserver|null=null;
let bodyObserver:MutationObserver|null=null;

function readVisualState():SyncVisualState{
  const box=document.getElementById(CLOUD_BOX_ID);
  if(!box||!navigator.onLine||box.dataset.online==="offline")return "off";
  const state=(box.dataset.state||"").toLowerCase();
  if(state==="synced")return "active";
  if(state==="syncing"||state==="connecting")return "syncing";
  return "off";
}

function visualLabel(state:SyncVisualState):string{
  if(state==="active")return "Eşitleme aktif ve güncel";
  if(state==="syncing")return "Veriler eşitleniyor";
  return "Eşitleme kapalı";
}

function refreshIndicator():void{
  const indicator=document.getElementById(INDICATOR_ID);
  if(!indicator)return;
  const state=readVisualState();
  const label=visualLabel(state);
  indicator.dataset.syncState=state;
  indicator.setAttribute("aria-label",`Bulut senkronizasyonu: ${label}`);
  indicator.title=label;
}

function bindCloudBox():void{
  const box=document.getElementById(CLOUD_BOX_ID);
  if(!box)return;
  cloudObserver?.disconnect();
  cloudObserver=new MutationObserver(refreshIndicator);
  cloudObserver.observe(box,{attributes:true,attributeFilter:["data-state","data-online","data-account"]});
  bodyObserver?.disconnect();
  bodyObserver=null;
  refreshIndicator();
}

function watchForCloudBox():void{
  if(document.getElementById(CLOUD_BOX_ID)){
    bindCloudBox();
    return;
  }
  if(bodyObserver||!document.body)return;
  bodyObserver=new MutationObserver(()=>{
    if(document.getElementById(CLOUD_BOX_ID))bindCloudBox();
  });
  bodyObserver.observe(document.body,{childList:true,subtree:true});
}

function installGlobalListeners():void{
  if(document.documentElement.dataset.topSyncIndicatorListeners==="ready")return;
  document.documentElement.dataset.topSyncIndicatorListeners="ready";
  window.addEventListener("online",refreshIndicator);
  window.addEventListener("offline",refreshIndicator);
  window.addEventListener("yks:auth-state",()=>window.setTimeout(refreshIndicator,0));
}

export function installTopSyncIndicator():{installed:boolean;state:SyncVisualState}{
  const searchButton=document.querySelector<HTMLElement>(".navbar .searchbtn");
  if(!searchButton)return {installed:false,state:"off"};

  let indicator=document.getElementById(INDICATOR_ID);
  if(!indicator){
    indicator=document.createElement("span");
    indicator.id=INDICATOR_ID;
    indicator.className="top-sync-indicator";
    indicator.setAttribute("role","status");
    indicator.setAttribute("aria-live","polite");
    indicator.setAttribute("aria-label","Bulut senkronizasyonu: Eşitleme kapalı");
    indicator.title="Eşitleme kapalı";
    searchButton.insertAdjacentElement("afterend",indicator);
  }

  installGlobalListeners();
  watchForCloudBox();
  refreshIndicator();
  return {installed:true,state:readVisualState()};
}
