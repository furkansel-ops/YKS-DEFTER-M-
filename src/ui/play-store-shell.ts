import Dexie from "dexie";
import {YKS_DATABASE_NAME} from "../data/database";

const CARD_ID="playStorePrivacyCard";
const CLOUD_BOX_ID="cloudSyncBox";
const CLOUD_STYLE_ID="yksCloudCenterStyles";
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

function installCloudCenterStyles():void{
  if(document.getElementById(CLOUD_STYLE_ID))return;
  const style=document.createElement("style");
  style.id=CLOUD_STYLE_ID;
  style.textContent=`
#${CLOUD_BOX_ID}.yks-cloud-center{position:relative!important;right:auto!important;bottom:auto!important;z-index:auto!important;width:100%;display:block!important;margin:12px 0 18px;padding:0!important;border-radius:20px!important;overflow:hidden;background:linear-gradient(145deg,var(--glass-strong),color-mix(in srgb,var(--accent) 5%,var(--glass-strong)))!important;border:.5px solid var(--glass-line)!important;box-shadow:var(--shadow-2)!important;-webkit-backdrop-filter:var(--blur-lite)!important;backdrop-filter:var(--blur-lite)!important}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:16px 17px 13px;border-bottom:.5px solid var(--sep)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-title{min-width:0}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-title .section-label{margin:0 0 5px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-title h3{margin:0;font-size:17px;letter-spacing:-.015em}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-title p{margin:5px 0 0;color:var(--label-2);font-size:12px;line-height:1.45}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-status{display:flex;align-items:center;gap:7px;min-width:0;padding:7px 9px;border-radius:999px;background:var(--fill);font-size:11px;font-weight:800;white-space:nowrap}
#${CLOUD_BOX_ID}.yks-cloud-center .cloudSyncDot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--label-3);box-shadow:0 0 0 3px var(--fill);transition:background .2s,box-shadow .2s}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="synced"] .cloudSyncDot{background:var(--success);box-shadow:0 0 0 3px var(--success-soft)}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="syncing"] .cloudSyncDot,#${CLOUD_BOX_ID}.yks-cloud-center[data-state="connecting"] .cloudSyncDot{background:var(--time);box-shadow:0 0 0 3px var(--time-soft)}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="error"] .cloudSyncDot{background:var(--danger);box-shadow:0 0 0 3px var(--danger-soft)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-body{padding:14px 17px 16px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-info{min-width:0;padding:10px 11px;border-radius:13px;background:var(--fill)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-info span{display:block;color:var(--label-3);font-size:9.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-info b{display:block;font-size:12px;overflow-wrap:anywhere}
#${CLOUD_BOX_ID}.yks-cloud-center #cloudSyncText{display:block;max-width:none!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;font-size:11px!important;color:inherit!important}
#${CLOUD_BOX_ID}.yks-cloud-center #cloudSyncMeta{display:block;max-width:none!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;margin:0!important;font-size:12px!important;color:inherit!important}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}
#${CLOUD_BOX_ID}.yks-cloud-center button{border:0!important;border-radius:11px!important;padding:9px 12px!important;cursor:pointer!important;font:700 12px var(--font)!important;background:var(--accent)!important;color:#fff!important}
#${CLOUD_BOX_ID}.yks-cloud-center button.secondary{background:var(--fill)!important;color:var(--label)!important}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-note{margin-left:auto;color:var(--label-3);font-size:10.5px;line-height:1.4;text-align:right}
@media(max-width:720px){#${CLOUD_BOX_ID}.yks-cloud-center .ycc-head{display:grid}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-status{justify-self:start}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-grid{grid-template-columns:1fr}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-note{width:100%;margin-left:0;text-align:left}}
`;
  document.head.append(style);
}

function moreApplicationGrid():HTMLElement|null{
  const more=document.getElementById("more");
  if(!more)return null;
  const heading=Array.from(more.querySelectorAll("h2")).find(node=>node.textContent?.trim()==="Uygulama");
  return heading?.nextElementSibling instanceof HTMLElement?heading.nextElementSibling:null;
}

function updateCloudCenterConnection():void{
  const el=document.getElementById("cloudConnectionLabel");
  if(el)el.textContent=navigator.onLine?"Çevrimiçi":"Çevrimdışı";
}

function installCloudCenterTelemetry():void{
  if(document.documentElement.dataset.cloudCenterTelemetry==="ready")return;
  document.documentElement.dataset.cloudCenterTelemetry="ready";
  updateCloudCenterConnection();
  window.addEventListener("online",updateCloudCenterConnection);
  window.addEventListener("offline",updateCloudCenterConnection);
  window.addEventListener("yks:auth-state",event=>{
    const detail=(event as CustomEvent<AuthStateDetail>).detail||{};
    const account=document.getElementById("cloudAccountLabel");
    if(account)account.textContent=detail.signedIn?(detail.email||"Hesap bağlı"):"Giriş yapılmadı";
    const profile=document.getElementById("cloudProfileLabel");
    if(profile)profile.textContent=detail.signedIn?(detail.profileDegraded?"Profil hazırlanıyor":"Hazır"):"—";
  });
}

function installLegacyCloudSyncBox():boolean{
  if(isNativeApp())return false;
  if(document.getElementById(CLOUD_BOX_ID))return true;
  const target=moreApplicationGrid()||document.getElementById("more");
  if(!target)return false;
  installCloudCenterStyles();
  const box=document.createElement("section");
  box.id=CLOUD_BOX_ID;
  box.className="restcard yks-cloud-center";
  box.dataset.state="signedout";
  box.setAttribute("aria-live","polite");
  box.setAttribute("aria-label","Hesap ve Bulut Senkronizasyonu");
  box.innerHTML=`
    <div class="ycc-head">
      <div class="ycc-title">
        <div class="section-label">Hesap ve Bulut Senkronizasyonu</div>
        <h3>Çalışma verilerin cihazların arasında güncel kalsın</h3>
        <p>Google hesabınla giriş yaptığında YKS Defterim verilerini güvenli bulut alanınla eşitler.</p>
      </div>
      <div class="ycc-status"><span class="cloudSyncDot" id="cloudSyncDot" aria-hidden="true"></span><span id="cloudSyncText">Giriş yapılmadı</span></div>
    </div>
    <div class="ycc-body">
      <div class="ycc-grid">
        <div class="ycc-info"><span>Hesap</span><b id="cloudAccountLabel">Giriş yapılmadı</b></div>
        <div class="ycc-info"><span>Bağlantı</span><b id="cloudConnectionLabel">${navigator.onLine?"Çevrimiçi":"Çevrimdışı"}</b></div>
        <div class="ycc-info"><span>Hesap profili</span><b id="cloudProfileLabel">—</b></div>
      </div>
      <div class="ycc-info" style="margin-top:8px"><span>Son durum</span><b id="cloudSyncMeta">Bulut senkronu kapalı</b></div>
      <div class="ycc-actions">
        <button id="cloudLoginBtn" type="button">Google ile giriş yap</button>
        <button id="cloudLogoutBtn" class="secondary" type="button" style="display:none">Çıkış yap</button>
        <span class="ycc-note">Senkron yalnızca giriş yaptığın hesaba ait veri alanında çalışır.</span>
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
