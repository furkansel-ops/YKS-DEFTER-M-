import "./runtime-polish-v431.css";

type RuntimeProblemKind="error"|"rejection";
type RuntimeProblem={kind:RuntimeProblemKind;at:number;message:string};
type StorageHealth={localStorage:boolean;indexedDb:boolean;online:boolean};

export interface RuntimeResilienceV431Api{
  installed:true;
  validate():string[];
  problems():RuntimeProblem[];
  storageHealth():StorageHealth;
  dismiss():void;
}

declare global{
  interface Window{
    __YKS_V431_RESILIENCE__?:RuntimeResilienceV431Api;
  }
}

const MAX_PROBLEMS=10;
const NOTICE_ID="v431RuntimeNotice";
const STORAGE_PROBE="__yks_v431_storage_probe__";

function messageOf(value:unknown):string{
  if(value instanceof Error)return value.message||value.name||"Bilinmeyen hata";
  if(typeof value==="string")return value;
  if(value&&typeof value==="object"&&"message" in value){
    const message=(value as {message?:unknown}).message;
    if(typeof message==="string"&&message.trim())return message.trim();
  }
  return "Beklenmedik çalışma zamanı hatası";
}

function checkStorage():StorageHealth{
  let localStorageOk=false;
  try{
    window.localStorage.setItem(STORAGE_PROBE,"1");
    window.localStorage.removeItem(STORAGE_PROBE);
    localStorageOk=true;
  }catch{}
  return {
    localStorage:localStorageOk,
    indexedDb:typeof window.indexedDB!=="undefined",
    online:typeof navigator.onLine==="boolean"?navigator.onLine:true
  };
}

function removeNotice():void{
  document.getElementById(NOTICE_ID)?.remove();
}

function showNotice():void{
  if(document.getElementById(NOTICE_ID))return;
  const host=document.createElement("div");
  host.id=NOTICE_ID;
  host.className="v431-runtime-notice";
  host.setAttribute("role","status");
  host.setAttribute("aria-live","polite");
  host.innerHTML=`<div class="v431-runtime-notice__copy"><strong>Bir bölüm beklenmedik şekilde durdu.</strong><span>Ana uygulama çalışmaya devam ediyor. Sorun görürsen sayfayı güvenle yenileyebilirsin.</span></div><div class="v431-runtime-notice__actions"><button type="button" data-v431-dismiss>Kapat</button><button type="button" data-v431-reload>Sayfayı yenile</button></div>`;
  host.querySelector<HTMLButtonElement>("[data-v431-dismiss]")?.addEventListener("click",removeNotice,{once:true});
  host.querySelector<HTMLButtonElement>("[data-v431-reload]")?.addEventListener("click",()=>window.location.reload(),{once:true});
  document.body.append(host);
}

export function installRuntimeResilienceV431():RuntimeResilienceV431Api{
  if(window.__YKS_V431_RESILIENCE__)return window.__YKS_V431_RESILIENCE__;

  const problems:RuntimeProblem[]=[];
  const record=(kind:RuntimeProblemKind,value:unknown):void=>{
    problems.push({kind,at:Date.now(),message:messageOf(value)});
    if(problems.length>MAX_PROBLEMS)problems.splice(0,problems.length-MAX_PROBLEMS);
    document.documentElement.dataset.v431RuntimeProblems=String(problems.length);
    showNotice();
  };

  window.addEventListener("error",event=>record("error",event.error??event.message));
  window.addEventListener("unhandledrejection",event=>record("rejection",event.reason));

  const publishConnectivity=():void=>{
    document.documentElement.dataset.v431Online=String(navigator.onLine);
  };
  window.addEventListener("online",publishConnectivity);
  window.addEventListener("offline",publishConnectivity);
  publishConnectivity();

  const api:RuntimeResilienceV431Api={
    installed:true,
    validate:()=>{
      const storage=checkStorage();
      const errors:string[]=[];
      if(!storage.localStorage)errors.push("localStorage kullanılamıyor");
      if(!storage.indexedDb)errors.push("IndexedDB kullanılamıyor");
      return errors;
    },
    problems:()=>problems.map(problem=>({...problem})),
    storageHealth:checkStorage,
    dismiss:removeNotice
  };

  const storage=api.storageHealth();
  document.documentElement.dataset.v431Resilience="ready";
  document.documentElement.dataset.v431Storage=storage.localStorage&&storage.indexedDb?"ready":"degraded";
  document.documentElement.dataset.v431RuntimeProblems="0";
  window.__YKS_V431_RESILIENCE__=api;
  window.dispatchEvent(new CustomEvent("yks:v431-resilience",{detail:{storage}}));
  return api;
}
