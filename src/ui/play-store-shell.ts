import Dexie from "dexie";
import {YKS_DATABASE_NAME} from "../data/database";
import "./cloud-sync-center.css";

const CARD_ID="playStorePrivacyCard";
const CLOUD_BOX_ID="cloudSyncBox";
const CLOUD_RUNTIME_ID="webCloudSyncRuntime";
const LEGACY_CLOUD_SOURCE_ID="legacyFirebaseSyncModule";
const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";

type CapacitorWindow=Window&{Capacitor?:{isNativePlatform?:()=>boolean}};
type AuthStateDetail={signedIn?:boolean;email?:string;profileDegraded?:boolean};

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

function moreApplicationGrid():HTMLElement|null{
  const more=document.getElementById("more");
  if(!more)return null;
  const heading=Array.from(more.querySelectorAll("h2")).find(node=>node.textContent?.trim()==="Uygulama");
  return heading?.nextElementSibling instanceof HTMLElement?heading.nextElementSibling:null;
}

function updateCloudCenterConnection():void{
  const online=navigator.onLine;
  const el=document.getElementById("cloudConnectionLabel");
  const box=document.getElementById(CLOUD_BOX_ID);
  if(el)el.textContent=online?"Çevrimiçi":"Çevrimdışı";
  if(box)box.dataset.online=online?"online":"offline";
}

function accountInitial(email?:string):string{
  const value=(email||"").trim();
  return value?value.charAt(0).toLocaleUpperCase("tr-TR"):"G";
}

function installCloudCenterTelemetry():void{
  if(document.documentElement.dataset.cloudCenterTelemetry==="ready")return;
  document.documentElement.dataset.cloudCenterTelemetry="ready";
  updateCloudCenterConnection();
  window.addEventListener("online",updateCloudCenterConnection);
  window.addEventListener("offline",updateCloudCenterConnection);
  window.addEventListener("yks:auth-state",event=>{
    const detail=(event as CustomEvent<AuthStateDetail>).detail||{};
    const box=document.getElementById(CLOUD_BOX_ID);
    if(box)box.dataset.account=detail.signedIn?"connected":"signedout";
    const account=document.getElementById("cloudAccountLabel");
    if(account)account.textContent=detail.signedIn?(detail.email||"Hesap bağlı"):"Giriş yapılmadı";
    const avatar=document.getElementById("cloudAccountAvatar");
    if(avatar)avatar.textContent=detail.signedIn?accountInitial(detail.email):"G";
    const accountHint=document.getElementById("cloudAccountHint");
    if(accountHint)accountHint.textContent=detail.signedIn?"Google hesabı bağlı":"Bulut senkronu için giriş gerekli";
    const profile=document.getElementById("cloudProfileLabel");
    if(profile)profile.textContent=detail.signedIn?(detail.profileDegraded?"Hazırlanıyor":"Hazır"):"—";
    const profileHint=document.getElementById("cloudProfileHint");
    if(profileHint)profileHint.textContent=detail.signedIn?(detail.profileDegraded?"Arka planda tamamlanıyor":"Senkrona hazır"):"Hesap bekleniyor";
  });
}

function installLegacyCloudSyncBox():boolean{
  if(isNativeApp())return false;
  if(document.getElementById(CLOUD_BOX_ID))return true;
  const target=moreApplicationGrid()||document.getElementById("more");
  if(!target)return false;
  const box=document.createElement("section");
  box.id=CLOUD_BOX_ID;
  box.className="restcard yks-cloud-center";
  box.dataset.state="signedout";
  box.dataset.account="signedout";
  box.dataset.online=navigator.onLine?"online":"offline";
  box.setAttribute("aria-live","polite");
  box.setAttribute("aria-label","Hesap ve Bulut Senkronizasyonu");
  box.innerHTML=`
    <div class="ycc-head">
      <div class="ycc-brand">
        <span class="ycc-cloud-mark" aria-hidden="true">☁</span>
        <div class="ycc-title">
          <div class="section-label">Hesap ve Bulut Senkronizasyonu</div>
          <h3>Verilerin tüm cihazlarında güncel kalsın</h3>
          <p>Google hesabınla giriş yaptığında YKS Defterim çalışma verilerini güvenli bulut alanınla otomatik olarak eşitler.</p>
        </div>
      </div>
      <div class="ycc-status"><span class="cloudSyncDot" id="cloudSyncDot" aria-hidden="true"></span><span id="cloudSyncText">Giriş yapılmadı</span></div>
    </div>
    <div class="ycc-body">
      <div class="ycc-overview">
        <div class="ycc-info ycc-account-card">
          <div class="ycc-account-row">
            <span class="ycc-account-avatar" id="cloudAccountAvatar" aria-hidden="true">G</span>
            <div>
              <span class="ycc-info-label">Google hesabı</span>
              <b id="cloudAccountLabel">Giriş yapılmadı</b>
              <small id="cloudAccountHint">Bulut senkronu için giriş gerekli</small>
            </div>
          </div>
        </div>
        <div class="ycc-info" data-ycc-kind="connection">
          <div class="ycc-mini-top"><span class="ycc-info-label">Bağlantı</span><span class="ycc-mini-icon" aria-hidden="true">↗</span></div>
          <b id="cloudConnectionLabel">${navigator.onLine?"Çevrimiçi":"Çevrimdışı"}</b>
          <small>İnternet durumu</small>
        </div>
        <div class="ycc-info" data-ycc-kind="profile">
          <div class="ycc-mini-top"><span class="ycc-info-label">Hesap profili</span><span class="ycc-mini-icon" aria-hidden="true">✓</span></div>
          <b id="cloudProfileLabel">—</b>
          <small id="cloudProfileHint">Hesap bekleniyor</small>
        </div>
      </div>
      <div class="ycc-sync-panel">
        <span class="ycc-sync-icon" aria-hidden="true">↻</span>
        <div class="ycc-sync-copy"><span class="ycc-info-label">Son eşitleme durumu</span><b id="cloudSyncMeta">Bulut senkronu kapalı</b></div>
      </div>
      <div class="ycc-footer">
        <div class="ycc-actions">
          <button id="cloudLoginBtn" type="button">Google ile giriş yap</button>
          <button id="cloudLogoutBtn" class="secondary" type="button" style="display:none">Çıkış yap</button>
        </div>
        <span class="ycc-note"><span class="ycc-note-lock" aria-hidden="true">🔒</span><span>Senkron yalnızca giriş yaptığın hesaba ait veri alanında çalışır.</span></span>
      </div>
    </div>`;
  target.insertAdjacentElement("afterend",box);
  installCloudCenterTelemetry();
  document.documentElement.dataset.cloudSyncPlacement="more";
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
     çalışma zamanını firebase-sync-runtime.js dosyasına çıkarır. Her iki durumda da
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

function activateAccountAwareCloudSync():boolean{
  if(isNativeApp())return false;
  void import("./coach-account-loader")
    .then(({installCoachAccountLoader})=>{installCoachAccountLoader();activateWebCloudSync();})
    .catch(error=>{console.error("Koç hesap katmanı yüklenemedi",error);activateWebCloudSync();});
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
    <p class="hint">Play Store Android paketinde çalışma verileri bu cihazda tutulur. Web/PWA sürümünde hesap ve bulut durumunu Daha &gt; Hesap ve Bulut Senkronizasyonu bölümünden yönetebilirsin.</p>
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
  const cloudRuntimeInstalled=cloudBoxInstalled&&activateAccountAwareCloudSync();
  const installed=installPolicyCard();

  if(!installed||(!isNativeApp()&&(!cloudBoxInstalled||!cloudRuntimeInstalled))){
    const retry=()=>{
      const boxReady=installLegacyCloudSyncBox();
      if(boxReady)activateAccountAwareCloudSync();
      installPolicyCard();
    };
    window.addEventListener("yks:v4-bootstrap",retry,{once:true});
    setTimeout(retry,0);
  }

  document.documentElement.dataset.playStoreShell=installed?"ready":"deferred";
  document.documentElement.dataset.webCloudSync=isNativeApp()?"native-local":cloudRuntimeInstalled?"ready":"deferred";
  return {installed,legacyCloudRemoved:false};
}
