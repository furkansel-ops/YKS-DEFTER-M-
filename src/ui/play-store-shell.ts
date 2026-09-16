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
#${CLOUD_BOX_ID}.yks-cloud-center{position:relative!important;right:auto!important;bottom:auto!important;z-index:auto!important;width:100%;display:block!important;margin:14px 0 20px;padding:0!important;border-radius:22px!important;overflow:hidden;background:linear-gradient(145deg,var(--glass-strong),color-mix(in srgb,var(--accent) 6%,var(--glass-strong)))!important;border:.5px solid var(--glass-line)!important;box-shadow:var(--shadow-2)!important;-webkit-backdrop-filter:var(--blur-lite)!important;backdrop-filter:var(--blur-lite)!important}
#${CLOUD_BOX_ID}.yks-cloud-center::before{content:"";position:absolute;inset:0 0 auto;height:2px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--accent) 72%,transparent),transparent);pointer-events:none}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:18px 18px 15px;border-bottom:.5px solid var(--sep)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-brand{display:flex;align-items:flex-start;gap:12px;min-width:0}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-cloud-mark{display:grid;place-items:center;width:42px;height:42px;flex:none;border-radius:14px;background:color-mix(in srgb,var(--accent) 12%,var(--fill));border:.5px solid color-mix(in srgb,var(--accent) 20%,var(--glass-line));font-size:21px;line-height:1;box-shadow:inset 0 1px 0 rgba(255,255,255,.18)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-title{min-width:0}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-title .section-label{margin:0 0 4px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-title h3{margin:0;font-size:18px;letter-spacing:-.02em;line-height:1.24}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-title p{margin:5px 0 0;color:var(--label-2);font-size:12px;line-height:1.5;max-width:620px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-status{display:flex;align-items:center;gap:8px;min-width:0;padding:8px 10px;border-radius:999px;background:var(--fill);border:.5px solid var(--sep);font-size:11px;font-weight:800;white-space:nowrap;transition:background .2s,border-color .2s}
#${CLOUD_BOX_ID}.yks-cloud-center .cloudSyncDot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--label-3);box-shadow:0 0 0 3px var(--fill);transition:background .2s,box-shadow .2s}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="synced"] .ycc-status{background:var(--success-soft);border-color:color-mix(in srgb,var(--success) 24%,var(--sep))}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="synced"] .cloudSyncDot{background:var(--success);box-shadow:0 0 0 3px var(--success-soft)}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="syncing"] .ycc-status,#${CLOUD_BOX_ID}.yks-cloud-center[data-state="connecting"] .ycc-status{background:var(--time-soft);border-color:color-mix(in srgb,var(--time) 24%,var(--sep))}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="syncing"] .cloudSyncDot,#${CLOUD_BOX_ID}.yks-cloud-center[data-state="connecting"] .cloudSyncDot{background:var(--time);box-shadow:0 0 0 3px var(--time-soft)}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="error"] .ycc-status{background:var(--danger-soft);border-color:color-mix(in srgb,var(--danger) 24%,var(--sep))}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="error"] .cloudSyncDot{background:var(--danger);box-shadow:0 0 0 3px var(--danger-soft)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-body{padding:15px 18px 17px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-overview{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(150px,.75fr) minmax(150px,.75fr);gap:9px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-info{min-width:0;padding:12px;border-radius:15px;background:color-mix(in srgb,var(--fill) 88%,transparent);border:.5px solid var(--sep)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-info-label{display:block;color:var(--label-3);font-size:9.5px;font-weight:800;letter-spacing:.055em;text-transform:uppercase;margin-bottom:4px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-info b{display:block;font-size:12.5px;line-height:1.35;overflow-wrap:anywhere}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-info small{display:block;margin-top:3px;color:var(--label-3);font-size:10.5px;line-height:1.35}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-account-row{display:flex;align-items:center;gap:10px;min-height:42px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-account-avatar{display:grid;place-items:center;width:38px;height:38px;flex:none;border-radius:50%;background:color-mix(in srgb,var(--accent) 13%,var(--fill));border:.5px solid color-mix(in srgb,var(--accent) 24%,var(--glass-line));font-weight:900;font-size:14px;color:var(--accent)}
#${CLOUD_BOX_ID}.yks-cloud-center[data-account="connected"] .ycc-account-avatar{background:var(--success-soft);border-color:color-mix(in srgb,var(--success) 30%,var(--sep));color:var(--success)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-mini-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-mini-icon{display:grid;place-items:center;width:25px;height:25px;border-radius:9px;background:var(--fill);font-size:12px}
#${CLOUD_BOX_ID}.yks-cloud-center[data-online="offline"] [data-ycc-kind="connection"]{border-color:color-mix(in srgb,var(--danger) 28%,var(--sep));background:color-mix(in srgb,var(--danger-soft) 45%,var(--fill))}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-sync-panel{display:flex;align-items:flex-start;gap:11px;margin-top:9px;padding:12px 13px;border-radius:15px;background:color-mix(in srgb,var(--accent) 5%,var(--fill));border:.5px solid color-mix(in srgb,var(--accent) 16%,var(--sep))}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-sync-icon{display:grid;place-items:center;width:31px;height:31px;flex:none;border-radius:10px;background:color-mix(in srgb,var(--accent) 10%,var(--fill));color:var(--accent);font-size:15px;font-weight:900}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="synced"] .ycc-sync-icon{background:var(--success-soft);color:var(--success)}
#${CLOUD_BOX_ID}.yks-cloud-center[data-state="error"] .ycc-sync-icon{background:var(--danger-soft);color:var(--danger)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-sync-copy{min-width:0;flex:1}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-sync-copy .ycc-info-label{margin-bottom:2px}
#${CLOUD_BOX_ID}.yks-cloud-center #cloudSyncText{display:block;max-width:none!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;font-size:11px!important;color:inherit!important}
#${CLOUD_BOX_ID}.yks-cloud-center #cloudSyncMeta{display:block;max-width:none!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;margin:0!important;font-size:12.5px!important;line-height:1.45;color:var(--label)!important}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:13px;padding-top:13px;border-top:.5px solid var(--sep)}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#${CLOUD_BOX_ID}.yks-cloud-center button{border:0!important;border-radius:12px!important;padding:9px 13px!important;min-height:36px;cursor:pointer!important;font:750 12px var(--font)!important;background:var(--accent)!important;color:#fff!important;box-shadow:0 5px 14px color-mix(in srgb,var(--accent) 18%,transparent)!important;transition:transform .15s,filter .15s}
#${CLOUD_BOX_ID}.yks-cloud-center button:hover{filter:brightness(1.04)}
#${CLOUD_BOX_ID}.yks-cloud-center button:active{transform:translateY(1px)}
#${CLOUD_BOX_ID}.yks-cloud-center button:focus-visible{outline:2px solid color-mix(in srgb,var(--accent) 50%,transparent)!important;outline-offset:2px}
#${CLOUD_BOX_ID}.yks-cloud-center button.secondary{background:var(--fill)!important;color:var(--label)!important;box-shadow:none!important;border:.5px solid var(--sep)!important}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-note{display:flex;align-items:flex-start;gap:6px;max-width:390px;color:var(--label-3);font-size:10.5px;line-height:1.4;text-align:right}
#${CLOUD_BOX_ID}.yks-cloud-center .ycc-note-lock{font-size:11px;line-height:1.3}
@media(max-width:820px){#${CLOUD_BOX_ID}.yks-cloud-center .ycc-overview{grid-template-columns:1.2fr 1fr}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-account-card{grid-column:1/-1}}
@media(max-width:620px){#${CLOUD_BOX_ID}.yks-cloud-center .ycc-head{display:grid;padding:16px}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-status{justify-self:start}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-body{padding:13px 16px 16px}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-overview{grid-template-columns:1fr}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-account-card{grid-column:auto}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-footer{align-items:stretch}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-actions{width:100%}#${CLOUD_BOX_ID}.yks-cloud-center .ycc-note{max-width:none;width:100%;text-align:left}}
@media(prefers-reduced-motion:reduce){#${CLOUD_BOX_ID}.yks-cloud-center *{transition:none!important}}
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
  installCloudCenterStyles();
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
