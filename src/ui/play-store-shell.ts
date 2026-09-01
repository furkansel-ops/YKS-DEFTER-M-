import Dexie from "dexie";
import {YKS_DATABASE_NAME} from "../data/database";

const CARD_ID="playStorePrivacyCard";
const CLOUD_BOX_ID="cloudSyncBox";
const CLOUD_RUNTIME_ID="webCloudSyncRuntime";
const LEGACY_CLOUD_SOURCE_ID="legacyFirebaseSyncModule";
const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";

type CapacitorWindow=Window&{Capacitor?:{isNativePlatform?:()=>boolean}};

function isNativeApp():boolean{
  try{return !!(window as CapacitorWindow).Capacitor?.isNativePlatform?.();}catch{return false;}
}

async function clearAppCaches():Promise<void>{
  if(typeof caches==="undefined")return;
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>/^yks-/i.test(key)).map(key=>caches.delete(key)));
}

async function deleteDeviceData(button:HTMLButtonElement):Promise<void>{
  if(!confirm("Bu cihazdaki YKS Defterim çalışma verileri, tercihler ve yerel yedekler kalıcı olarak silinecek. Devam edilsin mi?"))return;
  if(!confirm("Son onay: Bu işlem geri alınamaz. Saklamak istediğin bir yedek varsa önce dışa aktar. Veriler silinsin mi?"))return;
  const original=button.textContent;
  button.disabled=true;
  button.textContent="Veriler siliniyor…";
  try{
    const dataBridge=(window as unknown as {__YKS_DATA__?:{flush?:()=>Promise<void>}}).__YKS_DATA__;
    await dataBridge?.flush?.();
    await Dexie.delete(YKS_DATABASE_NAME);
    localStorage.clear();
    sessionStorage.clear();
    await clearAppCaches();
    location.reload();
  }catch(error){
    button.disabled=false;
    button.textContent=original;
    console.error("Cihaz verileri silinemedi",error);
    alert("Veriler tamamen silinemedi. Uygulamayı yeniden açıp tekrar deneyebilirsin.");
  }
}

function installLegacyCloudSyncBox():boolean{
  if(isNativeApp())return false;
  if(document.getElementById(CLOUD_BOX_ID))return true;
  const box=document.createElement("div");
  box.id=CLOUD_BOX_ID;
  box.dataset.state="signedout";
  box.setAttribute("aria-live","polite");
  box.setAttribute("title","Bulut senkronizasyon durumu");
  box.innerHTML=`
    <span class="cloudSyncDot" id="cloudSyncDot" aria-hidden="true"></span>
    <span class="cloudSyncCopy">
      <span id="cloudSyncText">Giriş yapılmadı</span>
      <small id="cloudSyncMeta">Bulut senkronu kapalı</small>
    </span>
    <button id="cloudLoginBtn" type="button">Google ile giriş</button>
    <button id="cloudLogoutBtn" class="secondary" type="button" style="display:none">Çıkış</button>`;
  document.body.append(box);
  return true;
}

function setCloudRuntimeError(message:string):void{
  const box=document.getElementById(CLOUD_BOX_ID);
  const text=document.getElementById("cloudSyncText");
  const meta=document.getElementById("cloudSyncMeta");
  if(box)box.dataset.state="error";
  if(text)text.textContent="Eşitleme başlatılamadı";
  if(meta)meta.textContent=message;
}

function activateWebCloudSync():boolean{
  if(isNativeApp())return false;
  if(document.getElementById(CLOUD_RUNTIME_ID))return true;
  if(!document.getElementById(CLOUD_BOX_ID))return false;

  const runtime=document.createElement("script");
  runtime.id=CLOUD_RUNTIME_ID;
  runtime.type="module";
  runtime.dataset.webCloudRuntime="active";

  /* Vite dev ortamında inert kaynak index.html içinde durur. Production build ise aynı
     dünkü çalışma zamanını firebase-sync-runtime.js dosyasına çıkarır. Her iki durumda da
     login/senkron mantığını değiştirmeden çalıştırıyoruz. */
  const source=document.getElementById(LEGACY_CLOUD_SOURCE_ID) as HTMLScriptElement|null;
  if(source?.textContent?.trim()){
    runtime.textContent=source.textContent.replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`);
    source.dataset.activated="1";
  }else{
    runtime.src="./firebase-sync-runtime.js";
  }

  runtime.addEventListener("error",()=>setCloudRuntimeError("Uygulamayı yenileyip tekrar dene"));
  document.body.append(runtime);
  document.documentElement.dataset.webCloudAuthConfig="ready";
  return true;
}

function installPolicyCard():boolean{
  if(document.getElementById(CARD_ID))return true;
  const target=document.getElementById("mrp_veri")||document.getElementById("more");
  if(!target)return false;
  const card=document.createElement("section");
  card.id=CARD_ID;
  card.className="restcard";
  card.setAttribute("aria-label","Gizlilik ve cihaz verileri");
  card.innerHTML=`<div class="section-label">Gizlilik ve cihaz verileri</div>
    <p class="hint">Play Store Android paketinde çalışma verileri bu cihazda tutulur. Web/PWA sürümünde bulut eşitleme sağ alttaki küçük durum kutusundan yönetilir.</p>
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
  const cloudBoxInstalled=installLegacyCloudSyncBox();
  const cloudRuntimeInstalled=cloudBoxInstalled&&activateWebCloudSync();
  const installed=installPolicyCard();

  if(!installed||(!isNativeApp()&&(!cloudBoxInstalled||!cloudRuntimeInstalled))){
    const retry=()=>{
      const boxReady=installLegacyCloudSyncBox();
      if(boxReady)activateWebCloudSync();
      installPolicyCard();
    };
    window.addEventListener("yks:v4-bootstrap",retry,{once:true});
    setTimeout(retry,0);
  }

  document.documentElement.dataset.playStoreShell=installed?"ready":"deferred";
  document.documentElement.dataset.webCloudSync=isNativeApp()?"native-local":cloudRuntimeInstalled?"ready":"deferred";
  return {installed,legacyCloudRemoved:false};
}
