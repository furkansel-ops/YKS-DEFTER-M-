/* v157 · Saat tekerleği Odak ("Şu saate kadar çalış", "Çalışma süresi ekle") ve Ayarlar ("Akşam hatırlatma saati") yerlerine.
   Eski saat/sayı alanları gizlenir (data-tw-hide; sayfaların display kuralları [hidden]'ı ezdiği için) ama yerinde kalır: tekerlek değeri onlara yazar, kaydetme/başlatma eskisi gibi
   app.js işlevleriyle (startFocusUntil, addManualFocus, ayarlardaki Kaydet) olur. */
import {createTimeWheel,createWheelChips,createWheelTabs,wheelClock,wheelParse,wheelSpan} from "./time-wheel-v157";

const L=window as unknown as Record<string,unknown>;
const call=(name:string)=>{const fn=L[name];return typeof fn==="function"?(fn as ()=>unknown)():undefined;};
const input=(id:string)=>document.getElementById(id) as HTMLInputElement|null;
const nowMin=()=>{const date=new Date();return date.getHours()*60+date.getMinutes();};
const make=<K extends keyof HTMLElementTagNameMap>(tag:K,className:string,text="")=>{const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;};

// Odak › Şu saate kadar çalış: tek tekerlek, geçmiş saatler seçilemez; düğme süreyi ayarlayıp sayacı başlatır.
function focusUntil():boolean{
  const field=input("focusUntilTime");if(!field)return false;if(field.dataset.twMounted)return true;
  const box=field.closest<HTMLElement>(".focus-custom-field"),control=field.closest<HTMLElement>(".focus-custom-control");if(!box||!control)return false;
  field.dataset.twMounted="1";
  const first=()=>Math.min(1435,Math.ceil((nowMin()+5)/5)*5);
  let value=-1;
  const get=()=>{if(value<first())value=Math.min(1435,Math.ceil((nowMin()+60)/5)*5);return value;};
  const go=make("button","btn primary tw-go");go.type="button";
  const chips=createWheelChips("Hızlı bitiş",()=>{const now=nowMin();return ([["+45 dk",now+45],["+1 sa",now+60],["+2 sa",now+120],["18:00",1080],["20:00",1200]] as [string,number][]).map(([text,at]):[string,number]=>[text,Math.ceil(at/5)*5]).filter(([,at])=>at>now&&at<=1435);},
    at=>at===value,at=>{value=at;wheel.sync(true);paint();});
  const paint=()=>{const at=get();field.value=wheelClock(at);go.textContent=`Başlat · bitiş ${wheelClock(at)} · ${wheelSpan(Math.max(1,at-nowMin()))}`;chips.paint();};
  const wheel=createTimeWheel({label:"Bitiş saati",get,set:at=>{value=at;paint();},ok:at=>at>=first(),fix:()=>first(),show:paint});
  go.addEventListener("click",()=>{paint();call("startFocusUntil");});
  box.querySelector("label")?.removeAttribute("for");control.dataset.twHide="";
  box.classList.add("tw-field");box.append(wheel.element,chips.element,go);paint();
  return true;
}

// Odak › Çalışma süresi ekle: "Başladım" / "Bitirdim" tekerlekle; süre ve başlangıç gizli alanlara yazılır.
function manualFocus():boolean{
  const duration=document.querySelector<HTMLElement>("#pomo .focus-manual-duration");if(!duration)return false;if(duration.dataset.twMounted)return true;
  const hours=input("manualFocusHours"),minutes=input("manualFocusMinutes"),start=input("manualFocusStart"),add=document.getElementById("manualFocusAddBtn");
  if(!hours||!minutes||!start||!add)return false;
  duration.dataset.twMounted="1";
  const last=()=>Math.floor(nowMin()/5)*5,s={start:0,end:0};let which:"start"|"end"="start",touched=false;
  const reset=()=>{s.end=last();s.start=Math.max(0,s.end-60);touched=false;};
  const tabs=createWheelTabs([["start","Başladım"],["end","Bitirdim"]] as const,key=>{which=key;wheel.sync(true);});
  const chips=createWheelChips("Süre",()=>[["25 dk",25],["45 dk",45],["1 sa",60],["1,5 sa",90],["2 sa",120]],length=>s.end-s.start===length,length=>{s.start=Math.max(0,s.end-length);touched=true;wheel.sync(true);paint();});
  const paint=()=>{
    const total=s.end-s.start;hours.value=String(Math.floor(total/60));minutes.value=String(total%60);start.value=wheelClock(s.start);
    tabs.paint(s);chips.paint();add.textContent=`Bugüne ${wheelSpan(total)} ekle`;
  };
  const wheel=createTimeWheel({label:"Çalışma saati",get:()=>s[which],set:value=>{s[which]=value;touched=true;paint();},
    ok:value=>which==="start"?value<=s.end-5:value>=s.start+5&&value<=last(),
    fix:value=>which==="start"?Math.max(0,s.end-5):value>last()?last():s.start+5,
    show:()=>{if(!touched)reset();paint();}});
  // Kayıt başarılıysa addManualFocus alanları boşaltır: tekerlek "son 1 saat"e döner.
  add.addEventListener("click",()=>{if(!hours.value){reset();wheel.sync(true);paint();}});
  const label=make("p","tw-manual-label","Süre"),box=make("div","tw-manual");
  box.append(tabs.element,wheel.element,label,chips.element);duration.dataset.twHide="";duration.after(box);
  duration.parentElement?.querySelector<HTMLElement>(":scope>p.hint")?.setAttribute("data-tw-hide","");
  reset();paint();
  return true;
}

// Ayarlar › Akşam hatırlatma saati: tekerlek durunca mevcut Kaydet düğmesine basılır (kayıt aynı yoldan).
// İki kopya var: yeni ayarlar (#ymsNotifTime) ve onun yüklenemediği durumda görünen eski kart (#notifTime).
function evening(id:string,rowSelector:string,saveSelector:string):boolean{
  const field=input(id);if(!field)return false;if(field.dataset.twMounted)return true;
  const row=field.closest<HTMLElement>(rowSelector),save=row?.querySelector<HTMLButtonElement>(saveSelector);if(!row||!save)return false;
  field.dataset.twMounted="1";
  const get=()=>wheelParse(field.value,21*60);
  const commit=()=>{save.click();chips.paint();};
  const chips=createWheelChips("Hızlı saat",()=>[["20:00",1200],["21:00",1260],["22:00",1320],["23:00",1380]],at=>at===get(),at=>{field.value=wheelClock(at);wheel.sync(true);commit();});
  const wheel=createTimeWheel({label:"Akşam hatırlatma saati",get,set:at=>{field.value=wheelClock(at);},done:commit,show:()=>chips.paint()});
  row.parentElement?.querySelector(`label[for="${id}"]`)?.removeAttribute("for");row.dataset.twHide="";
  const box=make("div","tw-evening");box.append(wheel.element,chips.element);row.after(box);chips.paint();
  return true;
}

let installed=false;
export function installTimeWheelsV157():void{
  if(installed)return;installed=true;
  const places=[focusUntil,manualFocus,()=>evening("ymsNotifTime",".yms-time-row","[data-yms-notif-time]"),()=>evening("notifTime",".row2","button")],done=new Set<number>();
  const tryAll=()=>{places.forEach((place,i)=>{if(!done.has(i)){try{if(place())done.add(i);}catch(error){done.add(i);console.error("v157 saat tekerleği",error);}}});return done.size===places.length;};
  if(tryAll())return;
  // Ayarlar sayfası sonradan kurulur; kurulunca bir kez bağlanıp gözlem bırakılır.
  let queued=false;
  const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;if(tryAll())observer.disconnect();});});
  observer.observe(document.body,{childList:true,subtree:true});
}
