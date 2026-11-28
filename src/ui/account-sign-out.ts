import Dexie from "dexie";
import {YKS_DATABASE_NAME} from "../data/database";
import {YKS_STORAGE_KEYS} from "../data/storage-keys";
import {firebaseAuth} from "./auth-welcome-v60";

/* Hesaptan çıkış: önce bekleyen değişiklik buluta gönderilir, sonra oturum kapanır ve
 * bu cihazdaki kopya silinir. Böylece sonraki hesap eski hesabın verisini görmez ya da
 * kendi buluta yüklemez; yenilenen sayfa ilk açılış gibi giriş ekranıyla gelir. */

type SignOutWindow=Window&{
  save?:(...args:unknown[])=>unknown;
  yksCloudForceDirty?:()=>void;
  toast?:(message:string)=>void;
  __YKS_DATA__?:{flush?:()=>Promise<void>};
  YKSFocusNotifications?:{shutdown():Promise<void>};
};
const runtime=window as SignOutWindow;

const hasUnsent=():boolean=>{
  try{return localStorage.getItem(YKS_STORAGE_KEYS.cloudDirty)==="1";}catch{return false;}
};

/* Eşitleme çalışma zamanı yüklemeyi bitirince bayrağı "0" yapar. */
export async function waitForUpload(timeoutMs=10000):Promise<boolean>{
  if(!hasUnsent())return true;
  if(!navigator.onLine)return false;
  try{runtime.yksCloudForceDirty?.();}catch{}
  const until=Date.now()+timeoutMs;
  while(Date.now()<until){
    await new Promise(resolve=>setTimeout(resolve,250));
    if(!hasUnsent())return true;
  }
  return false;
}

export async function wipeDeviceData():Promise<void>{
  // Kapanışta (beforeunload/pagehide) legacy save() eski hesabın verisini geri yazmasın.
  runtime.save=()=>false;
  try{await runtime.__YKS_DATA__?.flush?.();}catch{}
  try{await runtime.YKSFocusNotifications?.shutdown();}catch(error){console.warn("Odak bildirimleri kapatılamadı",error);}
  try{await Dexie.delete(YKS_DATABASE_NAME);}catch(error){console.warn("Yerel veritabanı silinemedi",error);}
  try{localStorage.clear();}catch{}
  try{sessionStorage.clear();}catch{}
  // Kapanış sırasında başka bir dinleyici anahtar yazarsa son anda yine temizle.
  window.addEventListener("pagehide",()=>{try{localStorage.clear();}catch{}});
}

let running=false;
export async function signOutAndClear():Promise<void>{
  if(running)return;
  running=true;
  try{
    if(!window.confirm("Çıkış yapılsın mı? Verilerin hesabında kalır; bu cihazdaki kopya silinir."))return;
    if(hasUnsent())runtime.toast?.("Son değişiklikler buluta gönderiliyor…");
    if(!await waitForUpload()&&!window.confirm("Son değişikliklerin buluta gönderilemedi. Şimdi çıkarsan bu değişiklikler kaybolur.\n\nYine de çıkılsın mı? (Vazgeçip internete bağlanınca tekrar deneyebilirsin.)"))return;
    const api=await firebaseAuth();
    if(!api){runtime.toast?.("Hesap servisi açılamadı · sayfayı yenileyip tekrar dene");return;}
    await api.m.signOut(api.auth);
    await wipeDeviceData();
    location.reload();
  }catch(error){
    console.error("Çıkış yapılamadı",error);
    runtime.toast?.("Çıkış yapılamadı · tekrar dene");
  }finally{running=false;}
}

/* Ayarlar ve bulut kartındaki "Çıkış yap" (#cloudLogoutBtn) da aynı yoldan geçer. */
export function installAccountSignOut():void{
  document.addEventListener("click",event=>{
    if(!(event.target as HTMLElement|null)?.closest?.("#cloudLogoutBtn"))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void signOutAndClear();
  },true);
}
