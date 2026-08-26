export type InstallState="installed"|"installable"|"manual";

export interface BuildVersion{
  major:number;
  minor:number;
  patch:number;
  revision:number;
}

interface BeforeInstallPromptEvent extends Event{
  prompt():Promise<void>;
  userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>;
}

export interface PwaRuntimeApi{
  readonly build:string;
  promptInstall():Promise<boolean>;
  refresh():Promise<void>;
  installState():InstallState;
}

declare global{
  interface Window{
    __YKS_PWA__?:PwaRuntimeApi;
    v4InstallApp?:()=>Promise<boolean>;
    v4RefreshPwaStatus?:()=>Promise<void>;
  }
}

export function parseBuildVersion(value:unknown):BuildVersion{
  const match=String(value??"").trim().match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-r(\d+))?$/i);
  return match?{major:Number(match[1])||0,minor:Number(match[2])||0,patch:Number(match[3])||0,revision:Number(match[4])||0}:{major:0,minor:0,patch:0,revision:0};
}

export function compareBuildVersions(left:unknown,right:unknown):number{
  const a=parseBuildVersion(left),b=parseBuildVersion(right);
  for(const key of ["major","minor","patch","revision"] as const){if(a[key]!==b[key])return a[key]>b[key]?1:-1;}
  return 0;
}

export function manualInstallHint(userAgent:string):string{
  const ua=String(userAgent||"");
  if(/android/i.test(ua))return "Chrome menüsü ⋮ → Ana ekrana ekle → Yükle adımlarını kullan.";
  if(/iphone|ipad|ipod/i.test(ua))return "Safari'de Paylaş → Ana Ekrana Ekle adımlarını kullan.";
  return "Tarayıcının adres çubuğundaki yükle simgesini veya uygulama menüsünü kullan.";
}

function isStandalone(windowRef:Window):boolean{
  return windowRef.matchMedia?.("(display-mode: standalone)").matches===true||Boolean((windowRef.navigator as Navigator&{standalone?:boolean}).standalone);
}

async function cacheReady(navigatorRef:Navigator):Promise<boolean>{
  if(!("serviceWorker" in navigatorRef))return false;
  try{
    const registration=await Promise.race([
      navigatorRef.serviceWorker.ready,
      new Promise<never>((_resolve,reject)=>window.setTimeout(()=>reject(new Error("service-worker-timeout")),2_500))
    ]),worker=navigatorRef.serviceWorker.controller||registration.active;
    if(!worker)return false;
    return await new Promise<boolean>(resolve=>{
      const channel=new MessageChannel(),timer=window.setTimeout(()=>resolve(false),2_500);
      channel.port1.onmessage=event=>{window.clearTimeout(timer);resolve(event.data?.type==="CACHE_STATUS"&&event.data?.ready===true);};
      worker.postMessage({type:"GET_CACHE_STATUS"},[channel.port2]);
    });
  }catch{return false;}
}

export function installPwaRuntime(build:string,windowRef:Window=window,documentRef:Document=document):PwaRuntimeApi{
  let installPrompt:BeforeInstallPromptEvent|null=null;
  const state=():InstallState=>isStandalone(windowRef)?"installed":installPrompt?"installable":"manual";
  const render=async():Promise<void>=>{
    const card=documentRef.getElementById("v4PwaCard"),badge=documentRef.getElementById("v4PwaBadge"),copy=documentRef.getElementById("v4PwaCopy"),install=documentRef.getElementById("v4InstallBtn") as HTMLButtonElement|null,offline=documentRef.getElementById("v4OfflineState");
    if(!card)return;
    const current=state(),ready=await cacheReady(windowRef.navigator);
    card.dataset.state=current;card.dataset.offlineReady=ready?"true":"false";
    if(badge)badge.textContent=current==="installed"?"Kurulu":current==="installable"?"Kurulabilir":"Kurulum adımı";
    if(copy)copy.textContent=current==="installed"?"Uygulama ana ekrandan bağımsız pencere olarak açılıyor.":current==="installable"?"Tablete veya PC'ye uygulama olarak kurmaya hazır.":manualInstallHint(windowRef.navigator.userAgent);
    if(install){install.hidden=current==="installed";install.disabled=current==="manual";install.textContent=current==="installable"?"Uygulamayı kur":"Tarayıcı menüsünden kur";}
    if(offline)offline.textContent=ready?"Çevrimdışı dosyalar hazır":"Çevrimdışı dosyalar hazırlanıyor";
  };
  const promptInstall=async():Promise<boolean>=>{
    if(isStandalone(windowRef))return true;
    if(!installPrompt){await render();return false;}
    const prompt=installPrompt;installPrompt=null;await prompt.prompt();const choice=await prompt.userChoice;await render();return choice.outcome==="accepted";
  };
  windowRef.addEventListener("beforeinstallprompt",event=>{event.preventDefault();installPrompt=event as BeforeInstallPromptEvent;void render();});
  windowRef.addEventListener("appinstalled",()=>{installPrompt=null;void render();});
  windowRef.addEventListener("online",()=>void render());windowRef.addEventListener("offline",()=>void render());
  if("serviceWorker" in windowRef.navigator){
    const workers=windowRef.navigator.serviceWorker;
    workers.addEventListener("controllerchange",()=>void render());
    void workers.ready.then(()=>render()).catch(()=>undefined);
  }
  const api:PwaRuntimeApi={build,promptInstall,refresh:render,installState:state};
  windowRef.__YKS_PWA__=api;windowRef.v4InstallApp=promptInstall;windowRef.v4RefreshPwaStatus=render;
  if(documentRef.readyState==="loading")documentRef.addEventListener("DOMContentLoaded",()=>void render(),{once:true});else void render();
  return api;
}
