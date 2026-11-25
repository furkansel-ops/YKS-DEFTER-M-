/* v157 · Kaydırmalı saat tekerleği: saat (00–23) ve dakika (5'er) iki sütun; her cihazda aynı görünür.
   Değer gün içi dakikadır (0–1435). ok() false olan değer üstü çizili görünür; tekerlek orada durursa fix() ile
   en yakın uygun değere döner. Etüt, Odak (şu saate kadar, süre ekle) ve akşam hatırlatması bunu kullanır. */
import "./time-wheel-v157.css";

const ROW=40;
const pad=(n:number)=>String(n).padStart(2,"0");
export const wheelClock=(minutes:number)=>pad(Math.floor(minutes/60))+":"+pad(minutes%60);
export const wheelSpan=(minutes:number)=>{const h=Math.floor(minutes/60),m=minutes%60;return h&&m?`${h} sa ${m} dk`:h?`${h} sa`:`${m} dk`;};
/** Sütunların kaydırma konumundan değer: saat 0–23, dakika 5'in katı. */
export function wheelValue(hourTop:number,minuteTop:number):number{
  const h=Math.min(23,Math.max(0,Math.round(hourTop/ROW))),m=Math.min(11,Math.max(0,Math.round(minuteTop/ROW)));
  return h*60+m*5;
}
/** "HH:MM" → gün içi dakika (5'e yuvarlanır); geçersizse fallback. */
export function wheelParse(value:string,fallback:number):number{
  const m=/^(\d{2}):(\d{2})$/.exec(value);if(!m)return fallback;
  return Math.min(23,Number(m[1]))*60+Math.min(55,Math.round(Number(m[2])/5)*5);
}

export type TimeWheelOptions={label:string;get():number;set(value:number):void;ok?:(value:number)=>boolean;fix?:(value:number)=>number;done?:()=>void;show?:()=>void};
export type TimeWheel={element:HTMLElement;sync(smooth?:boolean):void};

export function createTimeWheel(o:TimeWheelOptions):TimeWheel{
  const ok=o.ok||(()=>true),fix=o.fix||((value:number)=>value);
  const root=document.createElement("div");root.className="tw-wheels";
  const column=(label:string,count:number,step:number)=>{
    const node=document.createElement("div");node.className="tw-col";node.tabIndex=0;node.setAttribute("role","listbox");node.setAttribute("aria-label",label);
    for(let i=0;i<count;i++){const item=document.createElement("div");item.className="tw-item";item.setAttribute("role","option");item.textContent=pad(i*step);node.append(item);}
    return node;
  };
  const hours=column(o.label+" · saat",24,1),minutes=column(o.label+" · dakika",12,5),colon=document.createElement("span");
  colon.className="tw-colon";colon.textContent=":";colon.setAttribute("aria-hidden","true");root.append(hours,colon,minutes);
  let quiet=false,timer=0,quietTimer=0;
  const mark=(value:number)=>{
    const h=Math.floor(value/60);
    [...hours.children].forEach((item,i)=>{let any=false;for(let j=0;j<12&&!any;j++)any=ok(i*60+j*5);item.classList.toggle("tw-on",i===h);item.classList.toggle("tw-off",!any);item.setAttribute("aria-selected",String(i===h));});
    [...minutes.children].forEach((item,i)=>{const on=i*5===value%60;item.classList.toggle("tw-on",on);item.classList.toggle("tw-off",!ok(h*60+i*5));item.setAttribute("aria-selected",String(on));});
  };
  // Programla kaydırırken scroll olayları okunmaz (yoksa ara değerler yazılırdı).
  const sync=(smooth=false)=>{
    const value=o.get(),behavior:ScrollBehavior=smooth?"smooth":"auto";quiet=true;clearTimeout(quietTimer);
    hours.scrollTo({top:Math.floor(value/60)*ROW,behavior});minutes.scrollTo({top:(value%60)/5*ROW,behavior});mark(value);
    quietTimer=window.setTimeout(()=>{quiet=false;},smooth?450:80);
  };
  const read=()=>{
    let value=wheelValue(hours.scrollTop,minutes.scrollTop);
    if(!ok(value)){value=fix(value);o.set(value);sync(true);}else{o.set(value);mark(value);}
    o.done?.();
  };
  for(const col of [hours,minutes]){
    col.addEventListener("scroll",()=>{if(quiet)return;clearTimeout(timer);timer=window.setTimeout(read,120);},{passive:true});
    col.addEventListener("click",event=>{const i=[...col.children].indexOf(event.target as Element);if(i<0)return;quiet=false;col.scrollTo({top:i*ROW,behavior:"smooth"});});
    col.addEventListener("keydown",event=>{const d=event.key==="ArrowUp"?-1:event.key==="ArrowDown"?1:0;if(!d)return;event.preventDefault();quiet=false;col.scrollBy({top:d*ROW,behavior:"smooth"});});
  }
  // Gizli kaptayken kaydırma çalışmaz; tekerlek görünür olunca yerine oturur.
  if(typeof IntersectionObserver==="function")new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){o.show?.();sync(false);}}).observe(root);
  return {element:root,sync};
}

export type WheelTabs<K extends string>={element:HTMLElement;paint(values:Record<K,number>):void};
/** Tekerleğin hangi saati ayarladığını seçen iki düğme (Başlangıç / Bitiş). */
export function createWheelTabs<K extends string>(items:readonly (readonly [K,string])[],onPick:(key:K)=>void):WheelTabs<K>{
  const box=document.createElement("div");box.className="tw-tabs";box.setAttribute("role","group");
  const buttons=items.map(([key,label],index)=>{
    const node=document.createElement("button"),small=document.createElement("small"),value=document.createElement("b");
    node.type="button";node.className="tw-tab";small.textContent=label;node.append(small,value);node.setAttribute("aria-pressed",String(index===0));
    node.addEventListener("click",()=>{buttons.forEach(item=>item.node.setAttribute("aria-pressed",String(item.key===key)));onPick(key);});
    box.append(node);return {key,node,value};
  });
  return {element:box,paint(values){buttons.forEach(item=>{item.value.textContent=wheelClock(values[item.key]);});}};
}

/** Hızlı seçim düğmeleri; list her çizimde yeniden hesaplanır (şimdiye göre değişenler için). */
export function createWheelChips(label:string,list:()=>[string,number][],isOn:(value:number)=>boolean,pick:(value:number)=>void){
  const box=document.createElement("div");box.className="tw-chips";box.setAttribute("role","group");box.setAttribute("aria-label",label);
  let items:[string,number][]=[];
  const paint=()=>{items=list();box.replaceChildren(...items.map(([text,value],i)=>{const node=document.createElement("button");node.type="button";node.textContent=text;node.dataset.i=String(i);node.setAttribute("aria-pressed",String(isOn(value)));return node;}));};
  box.addEventListener("click",event=>{const node=(event.target as Element).closest<HTMLElement>("[data-i]");const item=node?items[Number(node.dataset.i)]:undefined;if(item)pick(item[1]);});
  return {element:box,paint};
}
