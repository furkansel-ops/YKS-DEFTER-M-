import "./weekly-review-v151.css";
import {REVIEW_MAX,cleanReview,reviewWeekFor,withReview} from "../domain/weekly-review.ts";

/* v151 · Haftalık değerlendirme kartı: Pazar 18:00 – Pazartesi 23:59 Bugün'de "Bugünün Programı"nın üstünde.
   Cevaplar S.weeklyReviews'a yazılır; save() yks:data-changed atar, koç paylaşımı (progress.weeklyReviews) kendisi gider. */
type Loose=Record<string,any>;
type LegacyWindow=Window&Record<string,any>&{YKSLegacyState?:{readState?:()=>Loose;save?:()=>unknown}};
const L=window as unknown as LegacyWindow;
const FIELDS=[["good","Ne iyi gitti?"],["hard","Ne zorladı?"],["focus","Gelecek hafta odak?"]] as const;
let installed=false;

function state():Loose{try{return L.YKSLegacyState?.readState?.()??{};}catch{return {};}}
function toast(text:string):void{try{(L.toast as ((t:string)=>void)|undefined)?.(text);}catch{}}
function values(card:HTMLElement):Record<string,string>{
  return Object.fromEntries(FIELDS.map(([key])=>[key,card.querySelector<HTMLTextAreaElement>(`[data-wr151="${key}"]`)?.value??""]));
}

function store(week:string,review:Loose):boolean{
  const s=state(),before=s.weeklyReviews;
  s.weeklyReviews=withReview(before,week,review as never);
  try{if(L.YKSLegacyState?.save?.()===false)throw new Error("kaydedilemedi");return true;}
  catch(error){s.weeklyReviews=before;console.error("v151 kaydet",error);return false;}
}

function render():void{
  const week=reviewWeekFor(new Date()),old=document.getElementById("weeklyReviewV151");
  const tasks=document.querySelector("#todayFreshStart .today-fresh-tasks");
  // Uygulama verisi hazır değilken çizilen kart, gönderileni boş bir nesneye yazıp kaybederdi.
  if(!week||!tasks||!L.YKSLegacyState?.readState||state().weeklyReviews?.[week]){old?.remove();return;}
  if(old?.dataset.week===week)return;
  old?.remove();
  const card=document.createElement("section");
  card.id="weeklyReviewV151";card.className="wr151-card";card.dataset.week=week;
  card.setAttribute("aria-labelledby","wr151Title");
  card.innerHTML=`<div class="wr151-head"><h3 id="wr151Title">Haftanı değerlendir</h3><small>1 dk · koçun görür</small></div>
    ${FIELDS.map(([key,label])=>`<label class="wr151-field"><span>${label}</span><textarea data-wr151="${key}" rows="2" maxlength="${REVIEW_MAX}"></textarea></label>`).join("")}
    <div class="wr151-actions"><button type="button" class="btn primary" data-wr151-act="send" disabled>Gönder</button><button type="button" class="btn ghost" data-wr151-act="skip">Bu hafta geç</button></div>`;
  const send=card.querySelector<HTMLButtonElement>('[data-wr151-act="send"]')!;
  card.addEventListener("input",()=>{send.disabled=!cleanReview(values(card),0);});
  card.addEventListener("click",event=>{
    const act=(event.target as HTMLElement).closest<HTMLElement>("[data-wr151-act]")?.dataset.wr151Act;
    if(act==="send"){
      const review=cleanReview(values(card),Date.now());if(!review)return;
      if(store(week,review)){card.remove();toast("Değerlendirmen koçuna gönderildi ✓");}
      else toast("Değerlendirme kaydedilemedi, tekrar dene");
    }else if(act==="skip"&&store(week,{good:"",hard:"",focus:"",at:Date.now(),skipped:true}))card.remove();
  });
  // Bugün ızgarası satırları önceden yerleştiriyor; kart bölümün içinde başlığın üstünde durur, düzenle birlikte taşınır.
  tasks.insertBefore(card,tasks.firstChild);
}

export function installWeeklyReviewV151():void{
  if(installed)return;installed=true;
  render();
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")render();});
  // Bugün ekranı sonradan çizilirse ve saat pencereye girerse kart yine gelsin.
  setInterval(render,5*60*1000);
  // Veri yüklenince / başka sekmede kaydedilince (cevaplanmış hafta) kart güncellenir.
  window.addEventListener("yks:data-changed",render);
}
