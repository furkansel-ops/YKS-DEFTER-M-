import "./today-v101.css";
import {planProgress} from "./today-refine-v71";

/* Bugün v101: "Şimdi ne yapacağım?" ekranı. v71 gibi eski düğümler TAŞINIR, kayıtlar sahiplerinde kalır.
 * Başlıkta selam + kalan gün · koçtan yeni mesaj satırı · Soru/Odak hedef çubuğu · biten görevler katlanır ·
 * Gün sonu 18:00'den sonra. Ders dağılımı/ritim (İlerleme'de var) ve tekrarlar (Konular'da var) CSS ile gizlenir. */

type CoachUnread={count:number;text:string};
type V101Window=Window&{v30Action?:(action:string)=>unknown};

export function isDayEnd(date:Date):boolean{return date.getHours()>=18;}
export function doneFoldText(count:number,open:boolean):string{return "✓ "+count+" görev tamamlandı · "+(open?"Gizle":"Göster");}
export function goalPercent(text:string):number|null{
  const progress=planProgress(text);
  return progress?Math.round(progress.done/progress.total*100):null;
}
export function coachRowText(unread:CoachUnread):string{
  return unread.count>1?"Koçundan "+unread.count+" yeni mesaj":"Koçundan yeni mesaj";
}

function make<K extends keyof HTMLElementTagNameMap>(tag:K,className:string,text?:string):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);element.className=className;if(text)element.textContent=text;return element;
}
function set(node:Element|null,value:string):void{if(node&&node.textContent!==value)node.textContent=value;}

export function installTodayV101():{installed:boolean}{
  const fresh=document.getElementById("todayFreshStart");
  const header=fresh?.querySelector<HTMLElement>(".today-fresh-title");
  const greeting=document.getElementById("todayFreshGreeting");
  const exam=fresh?.querySelector<HTMLElement>(".today-fresh-exam");
  const list=document.getElementById("todayFreshTaskList");
  if(!fresh||!header||!greeting||!exam||!list)return {installed:false};
  if(fresh.dataset.v101==="ready")return {installed:true};

  // Başlık: tarih + selam solda, "222 gün kaldı" sağda.
  header.append(greeting,exam);

  // Koç satırı: yalnız okunmamış koç mesajı varken görünür; dokununca Ayarlar'daki sohbet açılır.
  const coach=make("button","v101-coach");coach.type="button";coach.id="v101Coach";coach.hidden=true;
  const coachIcon=make("i","","K"),coachCopy=make("span",""),coachTitle=make("b",""),coachText=make("small","");
  coachIcon.setAttribute("aria-hidden","true");coachCopy.append(coachTitle,coachText);
  coach.append(coachIcon,coachCopy,make("em","","Aç ›"));
  header.insertAdjacentElement("afterend",coach);
  coach.addEventListener("click",()=>{
    (window as V101Window).v30Action?.("settings");
    window.setTimeout(()=>document.getElementById("studentCoachCodeSettings")?.scrollIntoView({block:"start",behavior:"smooth"}),120);
  });
  window.addEventListener("yks:coach-unread",event=>{
    const unread=(event as CustomEvent<CoachUnread>).detail||{count:0,text:""};
    coach.hidden=!(unread.count>0);
    set(coachTitle,coachRowText(unread));set(coachText,unread.text);
  });

  // Soru ve Odak kutularına hedef çubuğu (yalnız "60 / 120" gibi hedef varsa).
  const bars=["todayFreshQuestions","todayFreshMinutes"].map(id=>{
    const value=document.getElementById(id);
    if(!value)return null;
    const bar=make("span","v101-bar");bar.hidden=true;bar.setAttribute("aria-hidden","true");bar.append(make("i",""));
    value.insertAdjacentElement("afterend",bar);
    return {value,bar};
  });
  document.getElementById("todayFreshQuestions")?.closest(".today-fresh-stat")?.append(make("span","v101-add","＋ Soru ekle"));

  // Biten görevler tek satırda katlanır.
  const tasks=list.closest<HTMLElement>(".today-fresh-tasks")||list.parentElement!;
  const fold=make("button","v101-fold");fold.type="button";fold.id="v101DoneFold";fold.hidden=true;
  fold.setAttribute("aria-controls",list.id);
  list.insertAdjacentElement("afterend",fold);
  let open=false;
  fold.addEventListener("click",()=>{open=!open;refresh();});

  function refresh():void{
    for(const item of bars){
      if(!item)continue;
      const percent=goalPercent(String(item.value.textContent||""));
      item.bar.hidden=percent===null;
      const fill=item.bar.firstElementChild as HTMLElement|null;
      const width=Math.min(100,percent||0)+"%";
      if(fill&&fill.style.width!==width)fill.style.width=width;
    }
    const doneCount=list!.querySelectorAll(".today-fresh-task.is-done").length;
    fold.hidden=doneCount===0;
    set(fold,doneFoldText(doneCount,open));
    fold.setAttribute("aria-expanded",open?"true":"false");
    tasks.classList.toggle("v101-folded",!open);
  }
  const dayEnd=():void=>{fresh.classList.toggle("v101-eve",isDayEnd(new Date()));};

  let queued=false;
  const schedule=():void=>{
    if(queued)return;queued=true;
    window.setTimeout(()=>{queued=false;try{refresh();}catch(error){console.error("Bugün v101 yenilenemedi",error);}},16);
  };
  // Yalnız başkalarının düğümleri izlenir; refresh kendi düğümlerine yazar, gözlemciyi yeniden tetiklemez.
  const watch=new MutationObserver(schedule);
  watch.observe(list,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  for(const item of bars)if(item)watch.observe(item.value,{childList:true,characterData:true,subtree:true});
  refresh();dayEnd();
  window.setInterval(dayEnd,60000);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){dayEnd();schedule();}});
  fresh.dataset.v101="ready";
  return {installed:true};
}
