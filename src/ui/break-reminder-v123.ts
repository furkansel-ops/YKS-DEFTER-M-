import "./break-reminder-v123.css";
import {breakDue} from "../domain/break-reminder.ts";

/* v123 · Uzun oturum mola uyarısı: kronometre ara vermeden 50 dakika çalışınca kartta uyarı çıkar,
   sonra her 30 dakikada yinelenir. "Mola ver" var olan mola panelini (swMarkBreak) açar.
   Sayfa arka plandaysa odak bildirimi (pomo ayarı) gönderilir. */
type Loose=Record<string,any>;
const L=window as unknown as Loose;
const BANNER_ID="v123BreakBanner";
let since=0,warned=0;

function hide():void{document.getElementById(BANNER_ID)?.remove();}
function show(minutes:number):void{
  const card=document.getElementById("swCard");if(!card)return;
  let box=document.getElementById(BANNER_ID);
  if(!box){
    box=document.createElement("div");box.id=BANNER_ID;box.className="v123-break";box.setAttribute("role","status");
    box.addEventListener("click",event=>{
      const act=(event.target as HTMLElement).closest<HTMLElement>("[data-v123]")?.dataset.v123;
      if(act==="break"){hide();try{L.swMarkBreak?.();}catch{}}
      else if(act==="later")hide();
    });
    card.prepend(box);
  }
  box.innerHTML=`<p><b>${minutes} dakikadır ara vermedin.</b> 5–10 dakikalık bir mola dikkatini toplar.</p><div class="v123-break-actions"><button type="button" class="btn green small" data-v123="break">Mola ver</button><button type="button" class="btn ghost small" data-v123="later">Devam ediyorum</button></div>`;
}

function check():void{
  let s:Loose|null=null;try{s=L.sw?.()??null;}catch{}
  /* Duraklatma ya da mola: sayaç sıfırlanır. */
  if(!s?.run){since=0;warned=0;hide();return;}
  /* shortcut: sayfa yenilenince süre son başlatmadan (ya da ders değişiminden) sayılır; ara vermeden geçen tam süre tutulmaz. */
  if(!since)since=Number(s.start)||Date.now();
  const runMs=Date.now()-since;
  if(!breakDue(runMs,warned))return;
  warned++;
  const minutes=Math.floor(runMs/60000);
  show(minutes);
  try{L.toast?.(`${minutes} dakikadır çalışıyorsun · kısa bir mola iyi gelir`);}catch{}
  if(document.hidden){try{L.YKSNotificationDelivery?.show?.("Mola zamanı",`${minutes} dakikadır ara vermeden çalışıyorsun.`,"pomo");}catch{}}
}

export function installBreakReminderV123():void{
  window.setInterval(check,30000);
  document.addEventListener("visibilitychange",check);
}
