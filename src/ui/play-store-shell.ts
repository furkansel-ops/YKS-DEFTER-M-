import Dexie from "dexie";
import {YKS_DATABASE_NAME} from "../data/database";
import "./cloud-sync-indicator.css";

const CARD_ID="playStorePrivacyCard";
const CLOUD_CARD_ID="cloudSyncBox";
const CLOUD_INDICATOR_ID="cloudSyncIndicator";
const LAST_SYNC_KEY="yks_last_sync_at";
const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";

type CapacitorWindow=Window&{Capacitor?:{isNativePlatform?:()=>boolean}};
type SyncState="synced"|"syncing"|"connecting"|"offline"|"error"|"signedout";

function isNativeApp():boolean{
  try{return !!(window as CapacitorWindow).Capacitor?.isNativePlatform?.();}catch{return false;}
}

function formatLastSync(timestamp:number):string{
  if(!timestamp)return "Henüz eşitlenmedi";
  const date=new Date(timestamp);
  if(!Number.isFinite(date.getTime()))return "Henüz eşitlenmedi";
  const today=new Date();
  if(date.toDateString()===today.toDateString())return `Son eşitleme ${date.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}`;
  return `Son eşitleme ${date.toLocaleDateString("tr-TR",{day:"2-digit",month:"short"})} ${date.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}`;
}

function indicatorLabel(state:SyncState):string{
  if(state==="synced")return "Eşitlendi";
  if(state==="syncing"||state==="connecting")return "Eşitleniyor…";
  if(state==="offline")return "Çevrimdışı";
  if(state==="error")return "Eşitleme hatası";
  return "Bulut eşitleme kapalı";
}

function readSyncState(box:HTMLElement):SyncState{
  const state=box.dataset.state;
  return state==="synced"||state==="syncing"||state==="connecting"||state==="offline"||state==="error"?state:"signedout";
}

function updateCloudSyncIndicator(indicator:HTMLElement,box:HTMLElement):void{
  const state=readSyncState(box);
  const title=indicator.querySelector<HTMLElement>("[data-cloud-indicator-title]");
  const meta=indicator.querySelector<HTMLElement>("[data-cloud-indicator-meta]");
  indicator.dataset.state=state;
  if(title)title.textContent=indicatorLabel(state);
  let timestamp=0;
  try{timestamp=Number(localStorage.getItem(LAST_SYNC_KEY)||0)||0;}catch{}
  const lastSync=formatLastSync(timestamp);
  if(meta)meta.textContent=lastSync;
  indicator.setAttribute("aria-label",`${indicatorLabel(state)}. ${lastSync}`);
}

function installCloudSyncIndicator():boolean{
  if(isNativeApp())return false;
  const box=document.getElementById(CLOUD_CARD_ID);
  if(!box)return false;
  let indicator=document.getElementById(CLOUD_INDICATOR_ID);
  if(!indicator){
    indicator=document.createElement("aside");
    indicator.id=CLOUD_INDICATOR_ID;
    indicator.className="cloud-sync-indicator";
    indicator.dataset.state="signedout";
    indicator.setAttribute("role","status");
    indicator.setAttribute("aria-live","polite");
    indicator.innerHTML=`<span class="cloud-sync-indicator-dot" aria-hidden="true"></span><span class="cloud-sync-indicator-copy"><strong data-cloud-indicator-title>Bulut eşitleme kapalı</strong><small data-cloud-indicator-meta>Henüz eşitlenmedi</small></span>`;
    document.body.append(indicator);
  }
  if(indicator.dataset.bound!=="1"){
    indicator.dataset.bound="1";
    const refresh=()=>updateCloudSyncIndicator(indicator!,box);
    const observer=new MutationObserver(refresh);
    observer.observe(box,{attributes:true,attributeFilter:["data-state"]});
    window.addEventListener("online",refresh,{passive:true});
    window.addEventListener("offline",refresh,{passive:true});
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();},{passive:true});
    window.setInterval(()=>{if(!document.hidden)refresh();},60_000);
  }
  updateCloudSyncIndicator(indicator,box);
  return true;
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

function installCloudSyncCard():boolean{
  if(isNativeApp())return false;
  if(document.getElementById(CLOUD_CARD_ID))return true;
  const target=document.getElementById("mrp_veri")||document.getElementById("more");
  if(!target)return false;
  const card=document.createElement("section");
  card.id=CLOUD_CARD_ID;
  card.className="restcard web-cloud-sync-card";
  card.dataset.state="signedout";
  card.setAttribute("aria-label","Bulut eşitleme");
  card.innerHTML=`<div class="section-label">Bulut eşitleme</div>
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:8px">
      <div style="min-width:0">
        <strong id="cloudSyncText" style="display:block;font-size:16px">Giriş yapılmadı</strong>
        <span id="cloudSyncMeta" class="hint" style="display:block;margin-top:3px">Bulut senkronu kapalı</span>
      </div>
      <div class="rowtools" style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn green tiny" type="button" id="cloudLoginBtn">Google ile bağlan</button>
        <button class="btn ghost tiny" type="button" id="cloudLogoutBtn" style="display:none">Çıkış yap</button>
      </div>
    </div>
    <p class="hint" style="margin:10px 0 0">Web/PWA kullanımında çalışma verilerini Google hesabın üzerinden diğer cihazınla eşitleyebilirsin.</p>`;
  const firstCard=document.getElementById("v30DataTop");
  if(firstCard&&firstCard.parentElement===target)target.insertBefore(card,firstCard);
  else target.prepend(card);
  return true;
}

function patchLegacyCloudAuthSource(sourceText:string):string{
  let runtimeSource=sourceText.replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`);
  runtimeSource=runtimeSource.replace(
    'import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";',
    'import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";'
  );
  const oldLogin='login?.addEventListener("click",async()=>{try{status("Google açılıyor…","connecting","Hesap seçimi bekleniyor");await setPersistence(auth,browserLocalPersistence);await signInWithPopup(auth,provider);}catch(e){console.error(e);infraError("firebase-login",e);status("Giriş hatası","error",authErrorText(e));}});';
  const newLogin=`setPersistence(auth,browserLocalPersistence).catch(e=>{console.warn("Firebase kalıcılık ayarı hazırlanamadı",e);});
getRedirectResult(auth).catch(e=>{console.error(e);infraError("firebase-redirect-result",e);status("Giriş hatası","error",authErrorText(e));});
login?.addEventListener("click",()=>{
  try{
    status("Google açılıyor…","connecting","Hesap seçimi bekleniyor");
    provider.setCustomParameters({prompt:"select_account"});
    /* Popup çağrısı kullanıcı tıklamasının içinde doğrudan yapılmalı. Öncesinde await
       kullanmak bazı PWA/tarayıcılarda kullanıcı etkinliğini kaybettirip popup'ı engelliyor. */
    signInWithPopup(auth,provider).catch(e=>{
      const c=(e&&e.code)||"";
      if(c==="auth/popup-blocked"||c==="auth/operation-not-supported-in-this-environment"){
        status("Google'a yönlendiriliyor…","connecting","Giriş penceresi engellendi; tam sayfa giriş açılıyor");
        signInWithRedirect(auth,provider).catch(x=>{console.error(x);infraError("firebase-login-redirect",x);status("Giriş hatası","error",authErrorText(x));});
        return;
      }
      console.error(e);infraError("firebase-login",e);status("Giriş hatası","error",authErrorText(e));
    });
  }catch(e){console.error(e);infraError("firebase-login",e);status("Giriş hatası","error",authErrorText(e));}
});`;
  runtimeSource=runtimeSource.replace(oldLogin,newLogin);
  return runtimeSource;
}

function activateLegacyCloudSync():boolean{
  if(isNativeApp())return false;
  const source=document.getElementById("legacyFirebaseSyncModule") as HTMLScriptElement|null;
  if(!source||source.dataset.activated==="1"||!source.textContent?.trim())return false;

  /* Play Store hazırlığında index içindeki web API anahtarı boşaltılmıştı. Native Android
     hâlâ yerel modda kalıyor; yalnız web/PWA için daha önce çalışan Firebase istemci
     yapılandırmasını çalışma anında geri koyuyoruz. */
  const runtimeSource=patchLegacyCloudAuthSource(source.textContent);
  if(runtimeSource===source.textContent||!runtimeSource.includes("signInWithRedirect")||runtimeSource.includes('await setPersistence(auth,browserLocalPersistence);await signInWithPopup')){
    const text=document.getElementById("cloudSyncText");
    const meta=document.getElementById("cloudSyncMeta");
    const box=document.getElementById(CLOUD_CARD_ID);
    if(text)text.textContent="Eşitleme yapılandırması bulunamadı";
    if(meta)meta.textContent="Uygulama güncellemesini yeniden yükle";
    if(box)box.dataset.state="error";
    return false;
  }

  source.dataset.activated="1";
  const runtime=document.createElement("script");
  runtime.type="module";
  runtime.dataset.legacyFirebaseRuntime="active";
  runtime.textContent=runtimeSource;
  runtime.addEventListener("error",()=>{
    const text=document.getElementById("cloudSyncText");
    const meta=document.getElementById("cloudSyncMeta");
    const box=document.getElementById(CLOUD_CARD_ID);
    if(text)text.textContent="Eşitleme başlatılamadı";
    if(meta)meta.textContent="Bağlantıyı kontrol edip sayfayı yenile";
    if(box)box.dataset.state="error";
  });
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
    <p class="hint">Play Store Android paketinde çalışma verileri bu cihazda tutulur. Web/PWA sürümünde istersen Google ile bulut eşitlemeyi ayrıca açabilirsin.</p>
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
  const cloudInstalled=installCloudSyncCard();
  if(cloudInstalled){
    installCloudSyncIndicator();
    activateLegacyCloudSync();
  }
  const installed=installPolicyCard();
  if(!installed||(!cloudInstalled&&!isNativeApp())){
    window.addEventListener("yks:v4-bootstrap",()=>{
      if(installCloudSyncCard()){
        installCloudSyncIndicator();
        activateLegacyCloudSync();
      }
      installPolicyCard();
    },{once:true});
    setTimeout(()=>{
      if(installCloudSyncCard()){
        installCloudSyncIndicator();
        activateLegacyCloudSync();
      }
      installPolicyCard();
    },0);
  }
  document.documentElement.dataset.playStoreShell=installed?"ready":"deferred";
  document.documentElement.dataset.webCloudSync=cloudInstalled?"ready":isNativeApp()?"native-local":"deferred";
  document.documentElement.dataset.cloudSyncIndicator=cloudInstalled?"ready":isNativeApp()?"native-hidden":"deferred";
  return {installed,legacyCloudRemoved:false};
}
