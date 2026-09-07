import Dexie from "dexie";
import {YKS_DATABASE_NAME} from "../data/database";
import "./cloud-sync-indicator.css";

const CARD_ID="playStorePrivacyCard";
const CLOUD_BOX_ID="cloudSyncBox";
const CLOUD_RUNTIME_ID="webCloudSyncRuntime";
const LEGACY_CLOUD_SOURCE_ID="legacyFirebaseSyncModule";
const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";

type CapacitorWindow=Window&{Capacitor?:{isNativePlatform?:()=>boolean}};
declare const __YKS_BUILD_TARGET__:string;
type DesktopWindow=Window&{__YKS_DESKTOP__?:{installed?:boolean}};
type DataBridge={flush?:()=>Promise<void>};
type SafeDeleteWindow=Window&{
  __YKS_DATA__?:DataBridge;
  __YKS_DELETE_IN_PROGRESS?:boolean;
  yksBeginDeviceDeletion?:()=>void;
  yksCloudPrepareForDeletion?:()=>Promise<void>;
};

function isNativeApp():boolean{
  if(typeof __YKS_BUILD_TARGET__!=="undefined"&&__YKS_BUILD_TARGET__!=="web")return true;
  try{return !!(window as CapacitorWindow).Capacitor?.isNativePlatform?.()||!!(window as DesktopWindow).__YKS_DESKTOP__?.installed;}catch{return false;}
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
  if(document.getElementById(CLOUD_BOX_ID))return true;
  const target=document.getElementById("mrp_veri");
  if(!target)return false;
  const box=document.createElement("section");
  box.id=CLOUD_BOX_ID;
  box.className="restcard web-cloud-sync-card";
  box.dataset.state="signedout";
  box.setAttribute("aria-label","Cihazlar arası eşitleme");
  box.dataset.embeddedApp=String(isNativeApp());
  box.innerHTML=`
    <div class="cloud-sync-heading">
      <div>
        <p class="eyebrow">İsteğe bağlı eşitleme</p>
        <h2>Telefonun ve bilgisayarın aynı defterde</h2>
      </div>
      <span class="cloudSyncDot" id="cloudSyncDot" aria-hidden="true"></span>
    </div>
    <p class="hint">Her cihazda aynı hesapla giriş yap. İnternet yokken kayıtların cihazda kalır; bağlantı geldiğinde eşitleme sürer. Bu cihaz ilk eşitlenen hesaba bağlanır. Çıkış yapmak yerel kayıtlarını silmez; ortak bilgisayarda işin bitince cihaz verilerini de sil.</p>
    <p class="hint">Daha önce Google ile kullandıysan önce <a href="https://furkansel-ops.github.io/YKS-DEFTER-M-/" target="_blank" rel="noopener noreferrer">güncel web sürümünde</a> aynı Google hesabına girip “Uygulamalar için şifre ekle” adımını tamamla. Böylece yeni hesap açmadan aynı deftere ulaşırsın.</p>
    <p id="cloudAuthNotice" class="hint" hidden aria-live="polite"></p>
    <form id="cloudAuthForm" class="cloud-auth-form">
      <label>E-posta<input id="cloudEmail" name="email" type="email" autocomplete="username" required maxlength="254" autocapitalize="none" spellcheck="false"></label>
      <label>Şifre<input id="cloudPassword" name="password" type="password" autocomplete="current-password" required maxlength="4096"></label>
      <div class="cloud-sync-actions">
        <button id="cloudEmailLoginBtn" type="submit">Giriş yap</button>
        <button id="cloudSignupBtn" type="button" class="secondary">Yeni hesap oluştur</button>
        <button id="cloudResetBtn" type="button" class="secondary">Şifremi unuttum</button>
      </div>
    </form>
    <section id="cloudVerification" hidden>
      <p class="hint">Eşitlemeyi açmak için e-posta adresini doğrula. E-postadaki bağlantıyı açtıktan sonra aşağıdaki kontrolü kullan.</p>
      <div class="cloud-sync-actions"><button id="cloudSendVerificationBtn" type="button">Doğrulama e-postası gönder</button><button id="cloudCheckVerificationBtn" type="button" class="secondary">Doğruladım, kontrol et</button></div>
    </section>
    <form id="cloudLinkForm" class="cloud-auth-form" hidden>
      <p class="hint">Uygulamalar için şifre ekle: Google şifreni değil, YKS Defterim için yeni bir şifre belirle. Aynı hesabın ve bulut kayıtların korunur.</p>
      <label>Yeni uygulama şifresi<input id="cloudLinkPassword" type="password" autocomplete="new-password" required minlength="10" maxlength="4096"></label>
      <div class="cloud-sync-actions"><button type="submit">Uygulamalar için şifre ekle</button></div>
    </form>
    <div class="cloud-sync-status" aria-live="polite">
      <span class="cloudSyncCopy">
        <strong id="cloudSyncText">Giriş yapılmadı</strong>
        <small id="cloudSyncMeta">Bulut eşitleme kapalı</small>
      </span>
    </div>
    <div class="cloud-sync-actions">
      <button id="cloudLoginBtn" type="button" ${isNativeApp()?"hidden":""}>Google ile giriş</button>
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
    runtime.src="./firebase-sync-runtime.js?v=4.4.0-r3";
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
  if(document.documentElement.dataset.webCloudRuntime!=="error"||document.getElementById(CLOUD_RUNTIME_ID))return;
  document.documentElement.dataset.webCloudRuntimeRetry="0";
  activateWebCloudSync();
});

function installPolicyCard():boolean{
  if(document.getElementById(CARD_ID))return true;
  const target=document.getElementById("mrp_veri")||document.getElementById("more");
  if(!target)return false;
  const card=document.createElement("section");
  card.id=CARD_ID;
  card.className="restcard";
  card.setAttribute("aria-label","Gizlilik ve cihaz verileri");
  card.innerHTML=`<div class="section-label">Gizlilik ve cihaz verileri</div>
    <p class="hint">Veriler önce bu cihazda tutulur. İstersen yukarıdaki karttan aynı hesapla Android, Windows ve web arasında eşitlemeyi açabilirsin. Şifreler çalışma kayıtlarına veya yedeklere yazılmaz.</p>
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
  const installed=installPolicyCard();
  const cloudBoxInstalled=installEmbeddedCloudSyncCard();
  const cloudRuntimeInstalled=cloudBoxInstalled&&activateWebCloudSync();

  if(!installed||!cloudBoxInstalled||!cloudRuntimeInstalled){
    const retry=()=>{
      installPolicyCard();
      const boxReady=installEmbeddedCloudSyncCard();
      if(boxReady)activateWebCloudSync();
    };
    window.addEventListener("yks:v4-bootstrap",retry,{once:true});
    setTimeout(retry,0);
  }

  document.documentElement.dataset.playStoreShell=installed?"ready":"deferred";
  document.documentElement.dataset.webCloudSync=cloudRuntimeInstalled?"loading":"deferred";
  return {installed,legacyCloudRemoved:false};
}
