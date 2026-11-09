/* Program v103 · Günlük Plan zaman çizelgesi için saf yardımcılar. Saat, satır etiketinden okunur
   (S.rowLabels.s[satır] = "09:00-11:00"); kayıt biçimi, görev kimlikleri ve koç senkronu değişmez. */

export type TimeRange={start:number;end:number;label:string};
export type TimelineItem<T>={task:T;time:TimeRange|null};
export type TimelineGap={after:number;start:number;end:number};

const RANGE=/^\s*(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})\s*$/;
/** Boş saat satırı bu kadar dakikalık aradan sonra çıkar. */
export const GAP_MINUTES=120;

export const clock=(minutes:number):string=>String(Math.floor(minutes/60)).padStart(2,"0")+":"+String(minutes%60).padStart(2,"0");

export function parseTimeRange(label:string):TimeRange|null{
  const match=RANGE.exec(String(label||""));if(!match)return null;
  const [h1,m1,h2,m2]=match.slice(1).map(Number) as [number,number,number,number];
  if(h1>23||h2>24||m1>59||m2>59)return null;
  const start=h1*60+m1,end=h2*60+m2;
  if(end<=start)return null;
  return {start,end,label:clock(start)+"–"+clock(end)};
}

/** Görevin satır etiketi (yalnız okuma). */
export function rowTimeLabel(state:unknown,task:{block:string;row:number}):string{
  const labels=(state&&typeof state==="object"?(state as {rowLabels?:unknown}).rowLabels:null) as Record<string,unknown>|null;
  const rows=labels?.[task.block];
  const value=Array.isArray(rows)?rows[task.row]:"";
  return typeof value==="string"?value:"";
}

/** Saatli görevler başlangıca göre, saatsizler (rutin vb.) kayıtlı sırasıyla en sonda. Kararlı sıralama. */
export function timelineOrder<T>(items:readonly TimelineItem<T>[]):TimelineItem<T>[]{
  return items.map((item,index)=>({item,index}))
    .sort((a,b)=>{
      const x=a.item.time,y=b.item.time;
      if(x&&y)return x.start-y.start||a.index-b.index;
      if(x)return -1;if(y)return 1;
      return a.index-b.index;
    }).map(entry=>entry.item);
}

/** Ardışık iki saatli görev arasında GAP_MINUTES ve üstü boşluk. */
export function timelineGaps<T>(items:readonly TimelineItem<T>[]):TimelineGap[]{
  const gaps:TimelineGap[]=[];
  for(let index=0;index<items.length-1;index++){
    const current=items[index]!.time,next=items[index+1]!.time;
    if(current&&next&&next.start-current.end>=GAP_MINUTES)gaps.push({after:index,start:current.end,end:next.start});
  }
  return gaps;
}

/** "Sırada": bugünse bitmemiş ve saati geçmemiş ilk görev; yoksa (ya da başka günse) ilk bitmemiş görev. */
export function nextTaskIndex<T extends {done:boolean}>(items:readonly TimelineItem<T>[],nowMinutes:number|null):number{
  if(nowMinutes!==null){
    const upcoming=items.findIndex(item=>!item.task.done&&item.time!==null&&item.time.end>nowMinutes);
    if(upcoming>=0)return upcoming;
  }
  return items.findIndex(item=>!item.task.done);
}

export function durationText(range:TimeRange):string{
  const total=range.end-range.start,hours=Math.floor(total/60),minutes=total%60;
  return hours&&minutes?hours+" sa "+minutes+" dk":hours?hours+" sa":minutes+" dk";
}

/** Kartın ders satırı, başlığı ve ek satırı; "Matematik / Matematik" gibi tekrarlar yazılmaz.
 *  "TYT Türkçe · Paragraf · 20 soru" → ders TYT Türkçe, başlık Paragraf, ek 20 soru. */
export function cardTitles(subject:string,title:string,meta=""):{subject:string;title:string;meta:string}{
  const s=subject.trim(),t=title.trim(),lower=(value:string)=>value.toLocaleLowerCase("tr-TR");
  const parts=meta.split(/\s+·\s+/).map(part=>part.trim()).filter(part=>part&&lower(part)!==lower(s)&&lower(part)!==lower(t));
  if(!s||!t)return {subject:"",title:t||s,meta:parts.join(" · ")};
  if(lower(s)===lower(t))return parts.length?{subject:s,title:parts[0]!,meta:parts.slice(1).join(" · ")}:{subject:"",title:t,meta:""};
  if(lower(t).startsWith(lower(s)+" ")){
    const rest=t.slice(s.length).trim();
    if(rest)return {subject:s,title:rest.charAt(0).toLocaleUpperCase("tr-TR")+rest.slice(1),meta:parts.join(" · ")};
  }
  return {subject:s,title:t,meta:parts.join(" · ")};
}

/** Günün planlı süresi (yalnız saatli görevler). */
export function plannedMinutes<T>(items:readonly TimelineItem<T>[]):number{
  return items.reduce((sum,item)=>sum+(item.time?item.time.end-item.time.start:0),0);
}
export function plannedText(minutes:number):string{
  if(!minutes)return "";
  const hours=Math.floor(minutes/60),rest=minutes%60;
  return (hours&&rest?hours+" sa "+rest+" dk":hours?hours+" sa":rest+" dk")+" planlı";
}
