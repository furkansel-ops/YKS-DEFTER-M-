import "./today-v158.css";
import {clock,nowStatus,parseTimeRange,rowTimeLabel,type TimeRange} from "./refined-program-v103";

/* Bugün v158 · küçük dokunuşlar (kullanıcı önizlemede "1 · Küçük dokunuşlar"ı seçti):
 * Sıradaki kart dersin renginde ve saatini söyler · listede saati geçen görev işaretli · Odak kutusunda "Odak başlat" ·
 * akşam Gün sonu ile Kariyer yan yana (CSS). Kayıtlar ve düğmeler eski sahiplerinde; burası yalnız görünüm. */

type NextItem={blk:string;i:number;txt:string;lbl:string};
type V158Window=Window&{
  v25PlanToday?:()=>{next:NextItem|null};
  S?:unknown;YKSLegacyState?:{readState?:()=>unknown};
  YKSTaskText?:{subjectTone(value:string):string};
};

const nowMinutes=(date:Date):number=>date.getHours()*60+date.getMinutes();
export const isLate=(range:TimeRange|null,now:number):boolean=>Boolean(range&&range.end<=now);
/** Kartın üst satırı: "Sıradaki · 20:00 · 20 dk sonra", sürüyorsa "Şimdi · 30 dk kaldı", geçtiyse "· saati geçti". */
export function heroWhen(range:TimeRange|null,now:number):{lead:string;tail:string}{
  if(!range)return {lead:"Sıradaki çalışma",tail:""};
  if(isLate(range,now))return {lead:"Sıradaki",tail:"· "+clock(range.start)+" · saati geçti"};
  const status=nowStatus(range,now);
  return status.live?{lead:"Şimdi",tail:"· "+status.text}:{lead:"Sıradaki",tail:"· "+clock(range.start)+" · "+status.text};
}

function make<K extends keyof HTMLElementTagNameMap>(tag:K,className:string,text?:string):HTMLElementTagNameMap[K]{
  const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;
}

export function installTodayV158():{installed:boolean}{
  const fresh=document.getElementById("todayFreshStart");
  const hero=fresh?.querySelector<HTMLElement>(".today-fresh-next");
  const eyebrow=hero?.querySelector<HTMLElement>(".today-fresh-card-eyebrow");
  const list=document.getElementById("todayFreshTaskList");
  if(!fresh||!hero||!eyebrow||!list)return {installed:false};
  if(fresh.dataset.v158==="ready")return {installed:true};
  const win=window as V158Window,card=hero;

  // Eyebrow'daki "Sıradaki çalışma" metni; v71 sayacı (2 / 4) yerinde kalır.
  const label=Array.from(eyebrow.childNodes).find(node=>node.nodeType===3&&/Sıradaki/.test(node.textContent||""));
  const when=make("span","v158-when");label?.parentNode?.insertBefore(when,label.nextSibling);
  document.getElementById("todayFreshMinutes")?.closest(".today-fresh-stat")?.append(make("span","v101-add v158-focus","Odak ekranı"));

  function refresh():void{
    const now=nowMinutes(new Date());
    let next:NextItem|null=null;
    try{next=win.v25PlanToday?.().next||null;}catch{next=null;}
    const state=win.S||win.YKSLegacyState?.readState?.();
    const range=next?parseTimeRange(rowTimeLabel(state,{block:next.blk,row:next.i})):null;
    const text=heroWhen(range,now);
    if(label&&label.textContent!==" "+text.lead)label.textContent=" "+text.lead;
    if(when.textContent!==text.tail)when.textContent=text.tail;
    const tone=next?win.YKSTaskText?.subjectTone(next.lbl+" "+next.txt)||"other":"";
    if(tone)card.dataset.tone=tone;else delete card.dataset.tone;
    card.classList.toggle("v158-late",isLate(range,now));
    for(const task of Array.from(list!.querySelectorAll<HTMLElement>(".today-fresh-task"))){
      const late=!task.classList.contains("is-done")&&isLate(parseTimeRange(task.dataset.time||""),now);
      const badge=task.querySelector(".v158-late-tag");
      if(late&&!badge)task.append(make("span","v158-late-tag","Saati geçti"));
      if(!late&&badge)badge.remove();
    }
  }

  let queued=false;
  const schedule=():void=>{
    if(queued)return;queued=true;
    window.setTimeout(()=>{queued=false;try{refresh();}catch(error){console.error("Bugün v158 yenilenemedi",error);}},16);
  };
  // Liste v38'de, başlık v38'de yeniden yazılır; kendi düğümlerimiz (rozet) yalnız listeye eklenir ve aynı değerde yazılmaz.
  const watch=new MutationObserver(schedule);
  watch.observe(list,{childList:true});
  const title=document.getElementById("todayFreshNextTitle");if(title)watch.observe(title,{childList:true,characterData:true,subtree:true});
  refresh();
  window.setInterval(schedule,60000);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")schedule();});
  fresh.dataset.v158="ready";
  return {installed:true};
}
