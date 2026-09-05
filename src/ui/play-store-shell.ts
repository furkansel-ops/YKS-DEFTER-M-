import Dexie from "dexie";
import {YKS_DATABASE_NAME} from "../data/database";
import "./cloud-sync-indicator.css";

const CARD_ID="playStorePrivacyCard";
const CLOUD_BOX_ID="cloudSyncBox";
const CLOUD_RUNTIME_ID="webCloudSyncRuntime";
const LEGACY_CLOUD_SOURCE_ID="legacyFirebaseSyncModule";
const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";

type CapacitorWindow=Window&{Capacitor?:{isNativePlatform?:()=>boolean}};
type DataBridge={flush?:()=>Promise<void>};
type SafeDeleteWindow=Window&{
  __YKS_DATA__?:DataBridge;
  __YKS_DELETE_IN_PROGRESS?:boolean;
  yksBeginDeviceDeletion?:()=>void;
  yksCloudPrepareForDeletion?:()=>Promise<void>;
};

function isNativeApp():boolean{
  try{return !!(window as CapacitorWindow).Capacitor?.isNativePlatform?.();}catch{return false;}
}

function signalCloudRuntime(state:"loading"|"ready"|"error",message=""):void{
  document.documentElement.dataset.webCloudRuntime=state;
  window.dispatchEvent(new CustomEvent("yks:cloud-runtime",{detail:{state,message}}));
}

async function clearAppCaches():Promise<void>{
  if(typeof caches==="undefined")return;
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>/^yks-/i.test(key)).map(key=>caches.delete(key)));
}

function isYksStorageKey(key:string):boolean{
  const normalized=key.toLowerCase();
  return normalized==="yks"||normalized.startsWith("yks_")||normalized.startsWith("__yks_");
}

function clearYksStorage(storage:Storage):void{
  const keys:string[]=[];
  for(let index=0;index<storage.length;index+=1){
    const key=storage.key(index);
    if(key&&isYksStorageKey(key))keys.push(key);
  }
  keys.forEach(key=>storage.removeItem(key));
}

async function deleteDeviceData(button:HTMLButtonElement):Promise<void>{
  if(!confirm("Bu cihazdaki YKS Defterim çalışma verileri, tercihler ve yerel yedekler kalıcı olarak silinecek. Devam edilsin mi?"))return;
  if(!confirm("Son onay: Bu işlem geri alınamaz. Saklamak istediğin bir yedek varsa önce dışa aktar. Veriler silinsin mi?"))return;
  const original=button.textContent;
  button.disabled=true;
  button.textContent="Veriler siliniyor…";
  const host=window as SafeDeleteWindow;
  try{
    /* Önce yeni yerel kayıtları durdur. Ardından sıradaki eski Dexie yazılarının
       bitmesini bekle ve web hesabından çık. Böylece pagehide/save kuyruğu,
       silinmiş veriyi sayfa kapanırken yeniden oluşturamaz. */
    host.__YKS_DELETE_IN_PROGRESS=true;
    host.yksBeginDeviceDeletion?.();
    await host.yksCloudPrepareForDeletion?.();
    await host.__YKS_DATA__?.flush?.();
    await Dexie.delete(YKS_DATABASE_NAME);
    clearYksStorage(localStorage);
    clearYksStorage(sessionStorage);
    await clearAppCaches();
    location.reload();
  }catch(error){
    console.error("Cihaz verileri silinemedi",error);
    alert("Veriler tamamen silinemedi. Uygulama güvenli kayıt modunda durduruldu; yeniden açıp tekrar deneyebilirsin.");
    location.reload();
  }finally{
    button.textContent=original;
  }
}

function installEmbeddedCloudSyncCard():boolean{
  if(isNativeApp())return false;
  if(document.getElementById(CLOUD_BOX_ID))return true;
  const target=document.getElementById("mrp_veri");
  if(!target)return false;
  const box=document.createElement("section");
  box.id=CLOUD_BOX_ID;
  box.className="restcard web-cloud-sync-card";
  box.dataset.state="signedout";
  box.setAttribute("aria-label","Web bulut eşitleme");
  box.innerHTML=`
    <div class="cloud-sync-heading">
      <div>
        <p class="eyebrow">İsteğe bağlı web eşitleme</p>
        <h2>Google hesabınla cihazlar arasında eşitle</h2>
      </div>
      <span class="cloudSyncDot" id="cloudSyncDot" aria-hidden="true"></span>
    </div>
    <p class="hint">Yalnız web/PWA sürümünde kullanılabilir. Yerel kayıt çalışmaya devam eder; giriş yaptığında kayıtlar güvenli biçimde birleştirilir. Hesaplar arasında istem dışı veri aktarımını önlemek için bu cihaz ilk eşitlenen Google hesabına bağlanır.</p>
    <div class="cloud-sync-status" aria-live="polite">
      <span class="cloudSyncCopy">
        <strong id="cloudSyncText">Giriş yapılmadı</strong>
        <small id="cloudSyncMeta">Bulut eşitleme kapalı</small>
      </span>
    </div>
    <div class="cloud-sync-actions">
      <button id="cloudLoginBtn" type="button">Google ile giriş</button>
      <button id="cloudRetryBtn" class="secondary" type="button" hidden>Tekrar dene</button>
      <button id="cloudDeleteBtn" class="secondary danger" type="button" hidden>Bulut kopyasını sil</button>
      <button id="cloudLogoutBtn" class="secondary" type="button" hidden>Çıkış</button>
    </div>`;
  box.querySelector<HTMLButtonElement>("#cloudRetryBtn")?.addEventListener("click",()=>{
    if(document.documentElement.dataset.webCloudRuntime!=="error")return;
    document.documentElement.dataset.webCloudRuntimeRetry="0";
    document.getElementById(CLOUD_RUNTIME_ID)?.remove();
    activateWebCloudSync();
  });
  const policy=document.getElementById(CARD_ID);
  if(policy?.parentElement===target)target.insertBefore(box,policy);else target.append(box);
  return true;
}

function setCloudRuntimeError(message:string):void{
  const box=document.getElementById(CLOUD_BOX_ID);
  const text=document.getElementById("cloudSyncText");
  const meta=document.getElementById("cloudSyncMeta");
  const retry=document.getElementById("cloudRetryBtn") as HTMLButtonElement|null;
  if(box)box.dataset.state="error";
  if(text)text.textContent="Eşitleme başlatılamadı";
  if(meta)meta.textContent=message;
  if(retry)retry.hidden=false;
  document.getElementById(CLOUD_RUNTIME_ID)?.remove();
  signalCloudRuntime("error",message);
  const attempt=Number(document.documentElement.dataset.webCloudRuntimeRetry||0);
  if(navigator.onLine&&attempt<3){
    document.documentElement.dataset.webCloudRuntimeRetry=String(attempt+1);
    const delay=[1000,2500,5000][attempt]??5000;
    window.setTimeout(()=>{
      if(document.documentElement.dataset.webCloudRuntime==="error"&&!document.getElementById(CLOUD_RUNTIME_ID))activateWebCloudSync();
    },delay);
  }
}

function activateWebCloudSync():boolean{
  if(isNativeApp())return false;
  if(document.getElementById(CLOUD_RUNTIME_ID))return true;
  if(!document.getElementById(CLOUD_BOX_ID))return false;

  const runtime=document.createElement("script");
  runtime.id=CLOUD_RUNTIME_ID;
  runtime.type="module";
  runtime.dataset.webCloudRuntime="active";
  signalCloudRuntime("loading");

  /* Geliştirme ortamında inert kaynak index.html içinde durur. Production build
     aynı kaynağı firebase-sync-runtime.js olarak çıkarır. API anahtarı yalnız
     çalışma anında eklenir; eşitleme mantığının tek kaynağı korunur. */
  const source=document.getElementById(LEGACY_CLOUD_SOURCE_ID) as HTMLScriptElement|null;
  if(source?.textContent?.trim()){
    runtime.textContent=source.textContent.replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`);
    source.dataset.activated="1";
  }else{
    runtime.src="./firebase-sync-runtime.js?v=4.4.0-r2";
  }

  runtime.addEventListener("load",()=>{
    document.documentElement.dataset.webCloudRuntimeRetry="0";
    signalCloudRuntime("ready");
  });
  runtime.addEventListener("error",()=>setCloudRuntimeError("Bağlantıyı kontrol edip Tekrar dene"));
  document.body.append(runtime);
  document.documentElement.dataset.webCloudAuthConfig="ready";
  return true;
}

window.addEventListener("online",()=>{
  if(isNativeApp()||document.documentElement.dataset.webCloudRuntime!=="error"||document.getElementById(CLOUD_RUNTIME_ID))return;
  document.documentElement.dataset.webCloudRuntimeRetry="0";
  activateWebCloudSync();
});

function installPolicyCard():boolean{
  if(document.getElementById(CARD_ID))return true;
  const target=document.getElementById("mrp_veri")||document.getElementById("more");
  if(!target)return false;
  const native=isNativeApp();
  const card=document.createElement("section");
  card.id=CARD_ID;
  card.className="restcard";
  card.setAttribute("aria-label","Gizlilik ve cihaz verileri");
  card.innerHTML=`<div class="section-label">Gizlilik ve cihaz verileri</div>
    <p class="hint">${native
      ?"Android uygulamasında çalışma verileri yalnız bu cihazda tutulur; hesap veya bulut eşitleme kullanılmaz."
      :"Web/PWA sürümünde veriler önce bu cihazda tutulur. İstersen yukarıdaki karttan Google hesabıyla bulut eşitlemeyi açabilirsin."}</p>
    <div class="rowtools" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
      <a class="btn ghost tiny" href="./privacy.html" target="_blank" rel="noopener">Gizlilik politikası</a>
      <a class="btn ghost tiny" href="./data-deletion.html" target="_blank" rel="noopener">Silme bilgisi</a>
      <button class="btn ghost tiny" type="button" data-delete-device-data>Cihaz verilerini sil</button>
    </div>`;
  card.querySelector<HTMLButtonElement>("[data-delete-device-data]")?.addEventListener("click",event=>{
    void deleteDeviceData(event.currentTarget as HTMLButtonElement);
  });
  target.append(card);
  return true;
}

export function installPlayStoreShell():{installed:boolean;legacyCloudRemoved:boolean}{
  const native=isNativeApp();
  const installed=installPolicyCard();
  const cloudBoxInstalled=native?false:installEmbeddedCloudSyncCard();
  const cloudRuntimeInstalled=cloudBoxInstalled&&activateWebCloudSync();

  if(!installed||(!native&&(!cloudBoxInstalled||!cloudRuntimeInstalled))){
    const retry=()=>{
      installPolicyCard();
      if(!isNativeApp()){
        const boxReady=installEmbeddedCloudSyncCard();
        if(boxReady)activateWebCloudSync();
      }
    };
    window.addEventListener("yks:v4-bootstrap",retry,{once:true});
    setTimeout(retry,0);
  }

  document.documentElement.dataset.playStoreShell=installed?"ready":"deferred";
  document.documentElement.dataset.webCloudSync=native?"native-local":cloudRuntimeInstalled?"loading":"deferred";
  return {installed,legacyCloudRemoved:false};
}
