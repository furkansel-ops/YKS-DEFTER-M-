import Dexie from "dexie";
import {YKS_DATABASE_NAME} from "../data/database";

const CARD_ID="playStorePrivacyCard";
const CLOUD_CARD_ID="cloudSyncBox";

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

function installCloudSyncCard():boolean{
  if(isNativeApp())return false;
  if(document.getElementById(CLOUD_CARD_ID))return true;
  const target=document.getElementById("mrp_veri")||document.getElementById("more");
  if(!target)return false;
  const card=document.createElement("section");
  card.id=CLOUD_CARD_ID;
  card.className="restcard";
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

function activateLegacyCloudSync():boolean{
  if(isNativeApp())return false;
  const source=document.getElementById("legacyFirebaseSyncModule") as HTMLScriptElement|null;
  if(!source||source.dataset.activated==="1"||!source.textContent?.trim())return false;
  source.dataset.activated="1";
  const runtime=document.createElement("script");
  runtime.type="module";
  runtime.dataset.legacyFirebaseRuntime="active";
  runtime.textContent=source.textContent;
  runtime.addEventListener("error",()=>{
    const text=document.getElementById("cloudSyncText");
    const meta=document.getElementById("cloudSyncMeta");
    if(text)text.textContent="Eşitleme başlatılamadı";
    if(meta)meta.textContent="Bağlantıyı kontrol edip sayfayı yenile";
  });
  document.body.append(runtime);
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
  if(cloudInstalled)activateLegacyCloudSync();
  const installed=installPolicyCard();
  if(!installed||(!cloudInstalled&&!isNativeApp())){
    window.addEventListener("yks:v4-bootstrap",()=>{
      if(installCloudSyncCard())activateLegacyCloudSync();
      installPolicyCard();
    },{once:true});
    setTimeout(()=>{
      if(installCloudSyncCard())activateLegacyCloudSync();
      installPolicyCard();
    },0);
  }
  document.documentElement.dataset.playStoreShell=installed?"ready":"deferred";
  document.documentElement.dataset.webCloudSync=cloudInstalled?"ready":isNativeApp()?"native-local":"deferred";
  return {installed,legacyCloudRemoved:false};
}
