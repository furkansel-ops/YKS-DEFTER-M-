import {LocalNotifications} from "@capacitor/local-notifications";
import {reminderPlan,reminderText,reminderTime,wrongDueDates} from "../domain/review-reminder.ts";

/* v113 · Tekrar hatırlatması. Android uygulamasında önümüzdeki 7 günün hatırlatmaları cihaza planlanır;
   uygulama kapalıyken de seçilen saatte gelir. Web'de app.js'teki açılış bildirimi yanlış sayısını buradan alır.
   Ayar: Ayarlar › Bildirimler › "Tekrar zamanı" düğmesi ve tekrar saati (S.notif.reviewAt, varsayılan 19:00). */
type Loose=Record<string,any>;
type LegacyWindow=Window&Record<string,any>&{
  Capacitor?:{isNativePlatform?:()=>boolean};
  YKSLegacyState?:{readState?:()=>Loose;save?:()=>unknown;reviewGaps?:()=>number[]};
};
const L=window as unknown as LegacyWindow;
const BASE_ID=71300,DAYS=7,CHANNEL="tekrar";
let installed=false,chain:Promise<unknown>=Promise.resolve(),permission="prompt";

const native=():boolean=>{try{return !!L.Capacitor?.isNativePlatform?.();}catch{return false;}};
function state():Loose{try{return L.YKSLegacyState?.readState?.()??{};}catch{return {};}}
function notif():Loose{const s=state();if(!s.notif||typeof s.notif!=="object")s.notif={};return s.notif;}
function today():string{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function toast(text:string):void{try{(L.toast as ((t:string)=>void)|undefined)?.(text);}catch{}}
function at(date:string,time:string):Date{const [h,m]=time.split(":").map(Number);return new Date(Number(date.slice(0,4)),Number(date.slice(5,7))-1,Number(date.slice(8)),h,m,0,0);}

/** Web açılış bildirimi için: bugün sırası gelen fotoğraflı yanlış sayısı. */
export function dueWrongsToday():number{return wrongDueDates(state(),today()).length;}

async function reschedule():Promise<void>{
  const ids=Array.from({length:DAYS},(_,i)=>({id:BASE_ID+i}));
  await LocalNotifications.cancel({notifications:ids}).catch(()=>{});
  permission=(await LocalNotifications.checkPermissions()).display;
  const c=notif();
  if(permission!=="granted"||c.review===false)return;
  const time=reminderTime(c.reviewAt),now=Date.now()+60000;
  const list=reminderPlan(state(),today(),DAYS,L.YKSLegacyState?.reviewGaps?.()??[]).map((day,i)=>({day,i,when:at(day.date,time)}))
    .filter(x=>(x.day.wrongs||x.day.topics)&&x.when.getTime()>now)
    .map(x=>({id:BASE_ID+x.i,title:"Tekrar zamanı",body:reminderText(x.day.wrongs,x.day.topics),channelId:CHANNEL,schedule:{at:x.when,allowWhileIdle:true}}));
  if(list.length)await LocalNotifications.schedule({notifications:list});
}
/** Hatırlatmaları güncel veriyle yeniden kurar; üst üste çağrılar sıraya girer. */
export function scheduleReviewReminders():Promise<unknown>{
  if(!native())return Promise.resolve();
  chain=chain.then(reschedule).catch(error=>console.error("v113 tekrar hatırlatması",error));
  return chain;
}

function renderNative():void{
  const st=document.getElementById("notifStatus"),c=notif(),t=document.getElementById("notifReviewTime") as HTMLInputElement|null;
  if(t&&document.activeElement!==t)t.value=reminderTime(c.reviewAt);
  if(!native()||!st)return;
  st.textContent=permission==="granted"
    ?(c.review===false?"Bildirim izni açık; tekrar hatırlatması kapalı.":"Tekrar hatırlatması her gün "+reminderTime(c.reviewAt)+"'da, sırası gelen tekrar varsa gelir.")
    :permission==="denied"?"Bildirim izni kapalı. Telefon Ayarları › Uygulamalar › YKS Defterim › Bildirimler'den açabilirsin."
    :"Tekrar hatırlatması için “Bildirimlere izin ver”e bas.";
  st.style.color=permission==="granted"&&c.review!==false?"var(--success)":"var(--label-3)";
}

/* index.html boyut sınırına takılmamak için saat satırı buradan eklenir ("Tekrar zamanı" düğmesinin altına). */
function mountTimeRow():void{
  const toggle=document.getElementById("notifReview")?.closest(".switch");
  if(!toggle||document.getElementById("notifReviewTime"))return;
  const label=document.createElement("label");label.textContent="Tekrar hatırlatma saati (Android uygulaması)";
  const row=document.createElement("div");row.className="row2";
  const input=document.createElement("input");input.type="time";input.id="notifReviewTime";input.value=reminderTime(notif().reviewAt);
  const button=document.createElement("button");button.type="button";button.className="btn ghost small";button.style.flex="0 0 auto";button.textContent="Kaydet";
  button.addEventListener("click",()=>{(L.saveReviewAt as ()=>unknown)();});
  row.append(input,button);toggle.after(label,row);
}

export function installReviewReminderV113():void{
  if(installed)return;installed=true;
  L.YKSReviewReminder={dueWrongsToday,schedule:scheduleReviewReminders};
  mountTimeRow();
  L.saveReviewAt=()=>{
    const v=String((document.getElementById("notifReviewTime") as HTMLInputElement|null)?.value||"").trim();
    if(reminderTime(v)!==v){toast("Saat 00:00 ile 23:59 arasında olmalı");return false;}
    notif().reviewAt=v;try{L.YKSLegacyState?.save?.();}catch{}
    void scheduleReviewReminders().then(renderNative);toast("Tekrar saati kaydedildi");return true;
  };
  const baseRender=L.renderNotifSettings as (()=>void)|undefined;
  if(typeof baseRender==="function")L.renderNotifSettings=()=>{baseRender();renderNative();};
  renderNative();
  if(!native())return;
  // Android WebView'de tarayıcı bildirimi yok; izin düğmesi cihaz iznini ister.
  L.askNotif=async()=>{
    try{permission=(await LocalNotifications.requestPermissions()).display;}catch(error){console.error("v113 izin",error);}
    await scheduleReviewReminders();renderNative();
    toast(permission==="granted"?"Tekrar hatırlatması açıldı":"Bildirim izni verilmedi");
    return permission==="granted";
  };
  void LocalNotifications.createChannel({id:CHANNEL,name:"Tekrar hatırlatması",description:"Sırası gelen yanlış soru ve konu tekrarları",importance:3}).catch(()=>{});
  window.addEventListener("yks:notification-settings",()=>void scheduleReviewReminders().then(renderNative));
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")void scheduleReviewReminders();});
  void scheduleReviewReminders().then(renderNative);
}
