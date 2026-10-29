import "./refined-program.css";
import "./refined-program-v4.css";
import {renderSmartProgram} from "./smart-program";

type ProgramBlock="r"|"s";
type ProgramView="day"|"week"|"smart";
export type RefinedProgramTask={id:string;block:ProgramBlock;row:number;day:number;text:string;label:string;done:boolean};
export type ProgramAddResult={ok:boolean;reason?:"invalid"|"full"|"save";days?:number[]};
export interface RefinedProgramBridge{
  readState():unknown;
  visibleWeek():string;
  shiftWeek(offset:number):unknown;
  thisWeek():unknown;
  setProgTab(tab:string):unknown;
  toggleCellDone(week:string,id:string):unknown;
  addToDay(text:string,day:number,weekOffset:number):unknown;
  addToDays?(text:string,days:number[],weekOffset:number):ProgramAddResult;
  setDayOrder?(week:string,day:number,ids:string[]):unknown;
  updateTask?(week:string,id:string,text:string):unknown;
  deleteTask?(week:string,id:string):unknown;
}
type LegacyFunction=(...args:any[])=>any;
type ProgramWindow=Window&Record<string,unknown>;
type ProgramApi={installed:boolean;refresh():void;destroy():void};
const SHORT_DAYS=["Pzt","Sal","Çar","Per","Cum","Cts","Paz"];
const FULL_DAYS=["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"?value as Record<string,unknown>:{};
const dateKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
function parseDate(key:string):Date|null{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return null;
  const date=new Date(`${key}T12:00:00`);
  return Number.isFinite(date.getTime())&&dateKey(date)===key?date:null;
}
function monday(date:Date):Date{const result=new Date(date);result.setDate(result.getDate()-(result.getDay()+6)%7);return result;}
function offsetDate(key:string,offset:number):string{const date=parseDate(key);if(!date)return "";date.setDate(date.getDate()+offset);return dateKey(date);}

/** Read the existing cells and completion keys without normalizing or mutating state. */
export function refinedProgramTasks(state:unknown,week:string,day:number):RefinedProgramTask[]{
  if(!Number.isInteger(day)||day<0||day>6||!parseDate(week))return [];
  const source=object(state),data=object(object(source.weeks)[week]),labels=object(source.rowLabels),done=object(data.dn),move=object(data.mv);
  const tasks:RefinedProgramTask[]=[];
  for(const block of ["r","s"] as const){
    const rows=data[block];if(!Array.isArray(rows))continue;
    rows.forEach((row,index)=>{
      const value=Array.isArray(row)?row[day]:null;
      if(typeof value!=="string"||!value.trim())return;
      const id=`${block}-${index}-${day}`,rowLabels=labels[block];
      const rowLabel=Array.isArray(rowLabels)&&typeof rowLabels[index]==="string"?rowLabels[index].trim():"";
      const detected=block==="s"?refinedProgramDetectedSubject(value):"";
      tasks.push({id,block,row:index,day,text:value.trim(),label:detected||rowLabel||(block==="r"?"Rutin":"Çalışma"),done:Boolean(done[id])});
    });
  }
  const rawOrder=move[`order-${day}`];
  if(Array.isArray(rawOrder)){
    const rank=new Map<string,number>();rawOrder.forEach((id,index)=>{if(typeof id==="string"&&!rank.has(id))rank.set(id,index);});
    tasks.sort((a,b)=>(rank.get(a.id)??Number.MAX_SAFE_INTEGER)-(rank.get(b.id)??Number.MAX_SAFE_INTEGER));
  }
  return tasks;
}

/** Calendar-day arithmetic avoids DST changing the destination week. */
export function refinedProgramWeekOffset(week:string,now:Date):number|null{
  const target=parseDate(week),current=monday(now);if(!target||(target.getDay()+6)%7!==0)return null;
  const days=(Date.UTC(target.getFullYear(),target.getMonth(),target.getDate())-Date.UTC(current.getFullYear(),current.getMonth(),current.getDate()))/86400000;
  return days/7;
}

export function refinedProgramQuickText(subject:string,topic:string,questions:string,minutes:string):string|null{
  const name=subject.trim(),parts=[name,topic.trim()].filter(Boolean);
  if(!name||name.length>120||topic.trim().length>200)return null;
  for(const [value,max,unit] of [[questions,1000,"soru"],[minutes,1440,"dk"]] as const){
    if(!value.trim())continue;
    if(!/^\d+$/.test(value)||Number(value)<1||Number(value)>max)return null;
    parts.push(`${Number(value)} ${unit}`);
  }
  return parts.join(" · ");
}

/** Optional study resource URL. Stored with the task text so old data readers keep working. */
export function refinedProgramResourceUrl(value:string):string|null{
  const raw=value.trim();
  if(!raw)return "";
  if(raw.length>500||/\s/.test(raw))return null;
  try{
    const parsed=new URL(raw);
    if(!["http:","https:"].includes(parsed.protocol)||!parsed.hostname)return null;
    return raw;
  }catch{return null;}
}

export type RefinedProgramTaskDetail={display:string;title:string;meta:string;url:string;hasVideo:boolean};
export type RefinedProgramExtras={work:string;note:string;material:string};
/** Optional task annotations live inside the existing 600-char cell text.
    This preserves old backups, completion keys and the coach sync contract. */
export function refinedProgramSplitExtras(raw:string):RefinedProgramExtras{
  const text=String(raw||"");
  const note=text.match(/(?:^|\n)\[Not\] ([^\n]*)/)?.[1]||"";
  const material=text.match(/(?:^|\n)\[Materyal\] ([^\n]*)/)?.[1]||"";
  const work=text.replace(/(?:^|\n)\[(?:Not|Materyal)\] [^\n]*/g,"").trim();
  return {work,note:note.trim(),material:material.trim()};
}
export function refinedProgramJoinExtras(work:string,note:string,material:string):string|null{
  const clean=work.trim(),n=note.replace(/[\r\n]+/g," ").trim(),m=material.trim();
  if(!clean||n.length>180||m.length>280||refinedProgramResourceUrl(m)===null)return null;
  const combined=clean+(n?"\n[Not] "+n:"")+(m?"\n[Materyal] "+m:"");
  return combined.length<=600?combined:null;
}

/** Daily detail presentation without changing the legacy task storage format. */
export function refinedProgramTaskDetail(text:string,label="Çalışma"):RefinedProgramTaskDetail{
  const raw=refinedProgramSplitExtras(text).work,match=raw.match(/https?:\/\/[^\s]+/);
  const url=match?match[0].replace(/[.,;)]+$/,""):"";
  const display=(url?raw.replace(url,""):raw).replace(/^[▶☰]\s*/,"").replace(/[\s—–-]+$/,"").trim()||label;
  const parts=display.split(/\s+·\s+/).map(part=>part.trim()).filter(Boolean);
  const title=(parts.shift()||label||"Çalışma").slice(0,160);
  const meta=(parts.join(" · ")||(display!==title?display:label)).slice(0,320);
  let hasVideo=false;
  if(url){try{const parsed=new URL(url),host=parsed.hostname.toLowerCase();hasVideo=["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com","youtu.be","www.youtu.be"].includes(host);}catch{}}
  return {display,title,meta,url,hasVideo};
}
function refinedProgramDetectedSubject(text:string):string{
  const clean=text
    .replace(/^Koç\s*·\s*(?:Deneme sonrası\s*·\s*)?/i,"")
    .replace(/\s+—\s+https?:\/\/\S+\s*$/i,"")
    .trim();
  const subjects=[
    ["Matematik",/matematik/i],["Geometri",/geometri/i],["Fizik",/fizik/i],["Kimya",/kimya/i],["Biyoloji",/biyoloji/i],
    ["Türkçe",/türkçe/i],["Edebiyat",/(?:türk dili ve edebiyatı|edebiyat)/i],["Tarih",/tarih/i],["Coğrafya",/coğrafya/i],
    ["Felsefe",/felsefe/i],["Din",/(?:din kültürü|\bdin\b)/i],["İngilizce",/(?:ingilizce|english)/i]
  ] as const;
  const exam=clean.match(/^(TYT|AYT|YDT)\b/i)?.[1]?.toUpperCase()||"";
  const body=exam?clean.replace(/^(TYT|AYT|YDT)\b\s*/i,""):clean;
  for(const [label,pattern] of subjects){
    const match=body.match(pattern);if(match&&match.index!==undefined&&match.index<=8)return exam?`${exam} ${label}`:label;
  }
  return "";
}

export function refinedProgramSubjectLabel(text:string,label="Çalışma"):string{
  const fallback=label.trim()||"Çalışma",detected=refinedProgramDetectedSubject(text);
  if(detected)return detected;
  const clean=text.replace(/^Koç\s*·\s*(?:Deneme sonrası\s*·\s*)?/i,"").replace(/\s+—\s+https?:\/\/\S+\s*$/i,"").trim();
  const first=(clean.split(/\s+·\s+/)[0]||"").trim();
  if(!first)return fallback;
  const exam=first.match(/^(TYT|AYT|YDT)\s+(.+)$/i);
  if(exam)return `${(exam[1]||"").toUpperCase()} ${(exam[2]||"").trim()}`.trim().slice(0,42);
  return first.length<=42?first:fallback;
}
function refinedProgramVisualTone(subject:string):string{
  const label=subject.toLocaleLowerCase("tr-TR");
  if(/matematik|geometri/.test(label))return "math";
  if(/biyoloji/.test(label))return "biology";
  if(/kimya/.test(label))return "chemistry";
  if(/türkçe|paragraf|edebiyat|okuma/.test(label))return "reading";
  if(/fizik/.test(label))return "physics";
  return "other";
}
function refinedProgramVisualIcon(tone:string):string{
  return ({math:"√x",biology:"❧",chemistry:"⚗",reading:"▣",physics:"⚡",other:"✦"} as Record<string,string>)[tone]||"✦";
}

export type RefinedProgramGroupKey="reading"|"math"|"physics"|"chemistry"|"biology"|"geometry"|"literature"|"history"|"geography"|"philosophy"|"religion"|"english"|"other";
export type RefinedProgramDailyGroup={key:RefinedProgramGroupKey;title:string;tasks:RefinedProgramTask[]};
const DAILY_GROUP_DEFINITIONS:ReadonlyArray<{key:RefinedProgramGroupKey;title:string;pattern:RegExp}>=[
  {key:"reading",title:"Paragraf / Türkçe",pattern:/^(?:paragraf|türkçe|turkce|türk dili)(?:\b|\s|$)/i},
  {key:"math",title:"Matematik",pattern:/^(?:matematik|matematiksel|math|mat|problem|problemler)(?:\b|\s|$)/i},
  {key:"physics",title:"Fizik",pattern:/^(?:fizik|physics|fiz)(?:\b|\s|$)/i},
  {key:"chemistry",title:"Kimya",pattern:/^(?:kimya|chemistry|kim)(?:\b|\s|$)/i},
  {key:"biology",title:"Biyoloji",pattern:/^(?:biyoloji|biology|biyo|bio)(?:\b|\s|$)/i},
  {key:"geometry",title:"Geometri",pattern:/^(?:geometri|geometry|geo)(?:\b|\s|$)/i},
  {key:"literature",title:"Edebiyat",pattern:/^(?:edebiyat|türk dili ve edebiyatı)(?:\b|\s|$)/i},
  {key:"history",title:"Tarih",pattern:/^(?:tarih|history)(?:\b|\s|$)/i},
  {key:"geography",title:"Coğrafya",pattern:/^(?:coğrafya|cografya|geography)(?:\b|\s|$)/i},
  {key:"philosophy",title:"Felsefe",pattern:/^(?:felsefe|philosophy)(?:\b|\s|$)/i},
  {key:"religion",title:"Din",pattern:/^(?:din kültürü|din\b|religion)(?:\s|$)/i},
  {key:"english",title:"İngilizce / YDT",pattern:/^(?:ingilizce|i̇ngilizce|english|ydt)(?:\b|\s|$)/i},
  {key:"other",title:"Diğer",pattern:/^$/}
] as const;
/** Classify by subject prefix, not a random word in the topic or note.
 * Existing storage order and cell ids never change, only the rendered groups. */
export function refinedProgramDailyGroupKey(task:Pick<RefinedProgramTask,"text"|"label">):RefinedProgramGroupKey{
  const work=refinedProgramSplitExtras(task.text).work
    .replace(/^Koç\s*·\s*(?:Deneme sonrası\s*·\s*)?/i,"").trim();
  const candidate=work.split(/\s+·\s+|\n/)[0]?.replace(/^(?:TYT|AYT|YDT)\s+/i,"").trim()||"";
  const label=String(task.label||"").replace(/^(?:TYT|AYT|YDT)\s+/i,"").trim();
  for(const rawToken of [candidate,label]){
    const token=rawToken.toLocaleLowerCase("tr-TR");
    // This specific title contains both Türk dili and edebiyat; keep it under Edebiyat.
    if(/^türk dili ve edebiyatı(?:\b|\s|$)/i.test(token))return "literature";
    for(const entry of DAILY_GROUP_DEFINITIONS){
      if(entry.key!=="other"&&entry.pattern.test(token))return entry.key;
    }
  }
  return "other";
}
/** Keep completion progress derived from the displayed tasks, never persisted or synced. */
export function refinedProgramDailyGroupProgress(group:RefinedProgramDailyGroup):{done:number;total:number;percent:number}{
  const total=group.tasks.length,done=group.tasks.filter(task=>task.done).length;
  return {done,total,percent:total?Math.round(done/total*100):0};
}
export function refinedProgramDailyGroups(tasks:readonly RefinedProgramTask[]):RefinedProgramDailyGroup[]{
  const groups=new Map<RefinedProgramGroupKey,RefinedProgramTask[]>();
  for(const task of tasks){
    const key=refinedProgramDailyGroupKey(task),existing=groups.get(key);
    if(existing)existing.push(task);else groups.set(key,[task]);
  }
  return DAILY_GROUP_DEFINITIONS.flatMap(({key,title})=>{
    const matching=groups.get(key);
    return matching?.length?[{key,title,tasks:matching}]:[];
  });
}

export type RefinedProgramWeeklyGroup={
  key:RefinedProgramGroupKey;title:string;days:RefinedProgramTask[][];total:number;done:number;
};
/** A read-only weekly projection sharing daily lesson order and identity. */
export function refinedProgramWeeklyGroups(days:readonly (readonly RefinedProgramTask[])[]):RefinedProgramWeeklyGroup[]{
  const grouped=new Map<RefinedProgramGroupKey,RefinedProgramWeeklyGroup>();
  for(let day=0;day<7;day++){
    for(const task of days[day]||[]){
      const key=refinedProgramDailyGroupKey(task);
      let entry=grouped.get(key);
      if(!entry){
        const definition=DAILY_GROUP_DEFINITIONS.find(item=>item.key===key);
        entry={key,title:definition?.title||"Diğer",days:Array.from({length:7},()=>[]),total:0,done:0};
        grouped.set(key,entry);
      }
      entry.days[day]!.push(task);
      entry.total++;if(task.done)entry.done++;
    }
  }
  return DAILY_GROUP_DEFINITIONS.flatMap(({key})=>{const group=grouped.get(key);return group?[group]:[];});
}
export function refinedProgramWeeklyCompletion(days:readonly (readonly Pick<RefinedProgramTask,"done">[])[]){
  const total=days.reduce((sum,items)=>sum+items.length,0);
  const done=days.reduce((sum,items)=>sum+items.filter(task=>task.done).length,0);
  return {total,done,pending:total-done,percent:total?Math.round(done/total*100):0};
}

/** Static Lucide-style outline vectors shared by headings and individual lesson cards. */
function refinedProgramSubjectIcon(key:RefinedProgramGroupKey):HTMLElement{
  const paths:Record<RefinedProgramGroupKey,string>={
    reading:'<path d="M12 7v14"/><path d="M3 18V5.5A2.5 2.5 0 0 1 5.5 3H9a3 3 0 0 1 3 3 3 3 0 0 1 3-3h3.5A2.5 2.5 0 0 1 21 5.5V18h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3H3Z"/>',
    math:'<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 7h8M8.5 11h1m5 0h1m-7 4h1m5 0h1m-7 3h1m5 0h1"/>',
    physics:'<circle cx="12" cy="12" r="1.7"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
    chemistry:'<path d="M9 3h6M10 3v7l-5.8 9a2 2 0 0 0 1.7 3h12.2a2 2 0 0 0 1.7-3L14 10V3M7.6 16h8.8"/>',
    biology:'<path d="M20 4C10 3 4 8 4 15a5 5 0 0 0 5 5c7 0 12-8 11-16Z"/><path d="M6 18c3-4 6-7 12-10"/>',
    geometry:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 10v5m0 3h.01"/>',
    literature:'<path d="m15.5 4.5 4 4L9 19l-5 1 1-5L15.5 4.5ZM13 7l4 4"/>',
    history:'<path d="M3 10h18M5 10v9m5-9v9m4-9v9m5-9v9M2 21h20M3 7l9-5 9 5v3H3V7Z"/>',
    geography:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-3 3-3 15 0 18M12 3c3 3 3 15 0 18"/>',
    philosophy:'<path d="M12 18v3m-4 0h8M9 17a7 7 0 1 1 6 0c-1.5 1-1.5 2-3 2s-1.5-1-3-2Z"/>',
    religion:'<path d="m12 2 2.8 6.4L22 9l-5.4 4.7 1.6 7.3L12 17.2 5.8 21l1.6-7.3L2 9l7.2-.6L12 2Z"/>',
    english:'<path d="M4 6h13M10 4v2m-4 0c0 6 3 9 8 11m1-11c0 6-3 9-9 11M14 21l4-10 4 10m-7-3h6"/>',
    other:'<rect x="5" y="3" width="14" height="19" rx="2"/><path d="M9 3.5h6M9 11h6m-6 4h6m-6 4h3"/>'
  };
  const icon=element("span","rb-v4-subject-icon");
  icon.setAttribute("aria-hidden","true");
  icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[key]+"</svg>";
  return icon;
}

function refinedProgramSubjectTone(label:string):number{
  let hash=0;for(const char of label)hash=(hash*31+char.charCodeAt(0))>>>0;
  return hash%6;
}

export function createRefinedProgramController(bridge:RefinedProgramBridge,now=()=>new Date()){
  let day=(now().getDay()+6)%7,view:ProgramView="day";
  const snapshot=()=>{
    const week=bridge.visibleWeek(),state=bridge.readState(),tasks=refinedProgramTasks(state,week,day);
    return {week,day,view,tasks,date:offsetDate(week,day),days:SHORT_DAYS.map((label,index)=>{
      const items=refinedProgramTasks(state,week,index);
      return {label,date:offsetDate(week,index),count:items.length,done:items.filter(task=>task.done).length};
    })};
  };
  return {
    snapshot,
    tasksForDay(index:number){return refinedProgramTasks(bridge.readState(),bridge.visibleWeek(),index);},
    setView(next:ProgramView){view=next;bridge.setProgTab("week");},
    selectDay(next:number){if(!Number.isInteger(next)||next<0||next>6)return false;day=next;return true;},
    moveWeek(offset:number){if(offset!==-1&&offset!==1)return false;bridge.shiftWeek(offset);return true;},
    today(){day=(now().getDay()+6)%7;bridge.thisWeek();},
    add(text:string){
      const value=text.trim(),weekOffset=refinedProgramWeekOffset(bridge.visibleWeek(),now());
      if(!value||weekOffset===null)return false;
      return bridge.addToDay(value,day,weekOffset)===true;
    },
    addMany(text:string,days:number[],week=bridge.visibleWeek()):ProgramAddResult{
      const value=text.trim(),offset=refinedProgramWeekOffset(week,now());
      if(!value||value.length>600||offset===null||!days.length||Array.from(days).some(index=>!Number.isInteger(index)||index<0||index>6)||!bridge.addToDays)return {ok:false,reason:"invalid"};
      return bridge.addToDays(value,[...new Set(days)].sort((a,b)=>a-b),offset);
    },
    toggleTask(id:string){const current=snapshot();if(!current.tasks.some(task=>task.id===id))return false;return bridge.toggleCellDone(current.week,id)!==false;},
    reorder(ids:string[]){
      const current=snapshot(),expected=current.tasks.map(task=>task.id),unique=[...new Set(ids)];
      if(!bridge.setDayOrder||unique.length!==expected.length||unique.some(id=>!expected.includes(id)))return false;
      return bridge.setDayOrder(current.week,current.day,unique)!==false;
    },
    updateTask(id:string,text:string,week=bridge.visibleWeek()){const value=text.trim(),match=id.match(/^[rs]-\d+-([0-6])$/),dayIndex=match?Number(match[1]):-1,task=match&&parseDate(week)?refinedProgramTasks(bridge.readState(),week,dayIndex).find(item=>item.id===id):undefined;if(!task||!bridge.updateTask||!value||value.length>600)return false;return bridge.updateTask(week,id,value)!==false;},
    deleteTask(id:string,week=bridge.visibleWeek()){const match=id.match(/^[rs]-\d+-([0-6])$/),dayIndex=match?Number(match[1]):-1,task=match&&parseDate(week)?refinedProgramTasks(bridge.readState(),week,dayIndex).find(item=>item.id===id):undefined;if(!task||!bridge.deleteTask)return false;return bridge.deleteTask(week,id)!==false;}
  };
}

function element<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text=""):HTMLElementTagNameMap[K]{
  const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;
}
function button(text:string,className=""):HTMLButtonElement{const node=element("button",className,text);node.type="button";return node;}

/* Programdaki video açıldı mı: cihazda ayrı tutulur. Görev metnine, koç senkronuna,
   süre ve ilerleme toplamlarına yazılmaz. Anahtar hafta + görev + bağlantıdır; görev
   değişirse eski işaret yeni göreve taşınmaz. */
const VIDEO_WATCH_KEY="yks_program_video_watched_v1";
function readVideoWatches():Record<string,number>{
  try{const value=JSON.parse(localStorage.getItem(VIDEO_WATCH_KEY)||"{}");return value&&typeof value==="object"?value as Record<string,number>:{};}catch{return {};}
}
export function refinedProgramVideoWatchedAt(week:string,taskId:string,url:string):number{
  if(!url)return 0;return Number(readVideoWatches()[`${week}|${taskId}|${url}`])||0;
}
export function refinedProgramMarkVideoWatched(week:string,taskId:string,url:string,at=Date.now()):void{
  if(!url)return;
  const map=readVideoWatches();map[`${week}|${taskId}|${url}`]=at;
  // En yeni 300 kayıt tutulur; eski haftalar kendiliğinden düşer.
  const keep=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,300);
  try{localStorage.setItem(VIDEO_WATCH_KEY,JSON.stringify(Object.fromEntries(keep)));}catch{}
}
const clockOf=(at:number)=>new Date(at).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
function icon(name:"check"|"plus"|"share"|"arrow"):HTMLElement{
  const paths={check:'<path d="m5 12 4 4L19 6"/>',plus:'<path d="M12 5v14M5 12h14"/>',share:'<path d="M12 16V3m-4 4 4-4 4 4M7 10H5v11h14V10h-2"/>',arrow:'<path d="m9 5 7 7-7 7"/>'};
  const node=element("span","rb-program-icon");node.setAttribute("aria-hidden","true");node.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;return node;
}
function renderedWeek(screen:HTMLElement):string{
  // Classic curWeek is lexical; its rendered completion action exposes the exact visible week.
  const action=screen.querySelector("#gridS .tick[onclick],#gridR .tick[onclick]")?.getAttribute("onclick")||"";
  return action.match(/toggleCellDone\(['"](\d{4}-\d{2}-\d{2})['"]/)?.[1]||dateKey(monday(new Date()));
}
let installed:ProgramApi|undefined;

export function installRefinedProgram():ProgramApi{
  if(installed)return installed;
  const program=document.getElementById("program"),legacy=window as unknown as ProgramWindow;
  const call=(name:string,...args:unknown[])=>{const fn=legacy[name];return typeof fn==="function"?(fn as LegacyFunction).apply(window,args):undefined;};
  if(!program||!["renderPlan","shiftWeek","thisWeek","setProgTab","toggleCellDone","addToDay","addToDays","programUpdateTask","programDeleteTask"].every(name=>typeof legacy[name]==="function"))return {installed:false,refresh(){},destroy(){}};
  const screen=program;
  const legacyPanel=element("div","rb-program-legacy");legacyPanel.id="refinedProgramLegacy";
  // Keep the classic planner mounted only as an internal compatibility bridge.
  // It remains in source/DOM for existing state, dialogs and coach-share hooks, but is no longer user-accessible.
  legacyPanel.hidden=true;legacyPanel.setAttribute("aria-hidden","true");
  while(screen.firstChild)legacyPanel.append(screen.firstChild);
  const root=element("div","rb-program");root.id="refinedProgram";screen.append(root,legacyPanel);
  const controller=createRefinedProgramController({
    readState:()=>((window as unknown as ProgramWindow).S||window.YKSLegacyState?.readState?.()),visibleWeek:()=>renderedWeek(screen),
    shiftWeek:offset=>call("shiftWeek",offset),thisWeek:()=>call("thisWeek"),setProgTab:tab=>call("setProgTab",tab),
    toggleCellDone:(week,id)=>call("toggleCellDone",week,id),addToDay:(text,day,offset)=>call("addToDay",text,day,offset),
    addToDays:(text,days,offset)=>call("addToDays",text,days,offset) as ProgramAddResult,
    setDayOrder:(week,day,ids)=>call("programSetDayOrder",week,day,ids),
    updateTask:(week,id,text)=>call("programUpdateTask",week,id,text),
    deleteTask:(week,id)=>call("programDeleteTask",week,id)
  });
  const heading=element("header","rb-program-heading"),weekSummary=element("div","rb-program-week-summary");heading.append(element("h1","","Programım"),element("span","rb-v4-heading-badge","✦ 4.0"),element("p","","Planla, çalış, takip et. Hedefine adım adım ilerle."),weekSummary);
  const tabs=element("div","rb-program-tabs");tabs.setAttribute("role","group");tabs.setAttribute("aria-label","Program görünümü");
  const daily=button("Günlük Plan"),weekly=button("Haftalık Bakış"),smart=button("Akıllı Plan");tabs.append(daily,weekly,smart);
  const weekNav=element("div","rb-program-weeknav"),previous=button("‹"),next=button("›"),weekLabel=element("span"),today=button("Bugün","rb-program-today");
  previous.setAttribute("aria-label","Önceki hafta");next.setAttribute("aria-label","Sonraki hafta");weekNav.append(previous,weekLabel,today,next);
  const strip=element("div","rb-program-weekstrip");strip.setAttribute("role","group");strip.setAttribute("aria-label","Program günü");
  const dayButtons=SHORT_DAYS.map((label,index)=>{
    const node=button(""),name=element("span","",label),number=element("b"),marker=element("i");marker.setAttribute("aria-hidden","true");
    node.append(name,number,marker);node.addEventListener("click",()=>{controller.selectDay(index);if(controller.snapshot().view!=="day")controller.setView("day");refresh();});strip.append(node);return {node,number,marker};
  });
  const dailyPanel=element("section","rb-program-day");dailyPanel.id="refinedProgramDay";dailyPanel.setAttribute("aria-label","Günlük çalışmalar");
  const editor=element("div","rb-program-editor");editor.hidden=true;editor.setAttribute("role","dialog");editor.setAttribute("aria-modal","true");editor.setAttribute("aria-labelledby","rbProgramEditorTitle");
  const editorForm=element("form","rb-program-editor-card"),editorHead=element("div","rb-program-editor-head"),editorTitle=element("h2","","Çalışmayı düzenle"),editorClose=button("×","rb-program-editor-close"),editorLabel=element("label","rb-program-editor-label","Çalışma"),editorInput=element("textarea","rb-program-editor-input"),editorHint=element("p","rb-program-editor-hint"),editorActions=element("div","rb-program-editor-actions"),editorDelete=button("Sil","rb-program-editor-delete"),editorCancel=button("Vazgeç"),editorSave=button("Kaydet","rb-program-editor-save");
  const editorExtras=element("div","rb-v4-editor-extra"),noteLabel=element("label"),noteInput=element("textarea"),materialLabel=element("label"),materialInput=element("input");
  noteInput.rows=2;noteInput.maxLength=180;noteInput.placeholder="Bu çalışmaya dair kısa notun";materialInput.type="url";materialInput.maxLength=280;materialInput.placeholder="https://...";materialInput.inputMode="url";
  noteLabel.append(element("span","","Not · isteğe bağlı"),noteInput);materialLabel.append(element("span","","Materyal bağlantısı · isteğe bağlı"),materialInput);editorExtras.append(noteLabel,materialLabel);
  editorTitle.id="rbProgramEditorTitle";editorInput.rows=4;editorInput.maxLength=600;editorInput.id="rbProgramEditorInput";editorLabel.htmlFor=editorInput.id;editorClose.setAttribute("aria-label","Düzenlemeyi kapat");editorHint.textContent="En fazla 600 karakter. Değişiklik mevcut çalışmanın üzerine kaydedilir.";editorSave.type="submit";editorDelete.setAttribute("aria-label","Bu çalışmayı sil");editorHead.append(editorTitle,editorClose);editorActions.append(editorDelete,editorCancel,editorSave);editorForm.append(editorHead,editorLabel,editorInput,editorExtras,editorHint,editorActions);editor.append(editorForm);
  const detailDialog=element("div","rb-program-detail");detailDialog.hidden=true;detailDialog.setAttribute("role","dialog");detailDialog.setAttribute("aria-modal","true");detailDialog.setAttribute("aria-labelledby","rbProgramDetailTitle");
  const detailCard=element("div","rb-program-detail-card"),detailHead=element("div","rb-program-detail-head"),detailHeading=element("div","rb-program-detail-heading"),detailEyebrow=element("span","rb-program-detail-eyebrow","Günlük çalışma"),detailTitle=element("h2"),detailClose=button("×","rb-program-detail-close"),detailMeta=element("p","rb-program-detail-meta"),detailResource=element("div","rb-program-detail-resource"),detailActions=element("div","rb-program-detail-actions"),detailVideo=button("▶ YouTube videosuna git","rb-program-detail-video"),detailDone=button("✓ Tamamladım","rb-program-detail-done");
  const detailExtras=element("div","rb-v4-detail-extra"),detailEdit=button("✎ Not veya materyal düzenle","rb-v4-detail-edit");
  // Videodan dönünce sorulur; görev yalnız öğrenci onaylarsa tamamlanır.
  const detailAsk=element("section","rb-program-detail-ask"),askDone=button("✓ Tamamlandı","rb-program-ask-done"),askLater=button("Daha sonra","rb-program-ask-later"),askButtons=element("div","rb-program-ask-actions");
  detailAsk.hidden=true;detailAsk.setAttribute("role","group");detailAsk.setAttribute("aria-label","Videoyu bitirdin mi?");askButtons.append(askDone,askLater);
  detailAsk.append(element("b","","Videoyu bitirdin mi?"),element("p","","Çalışmayı tamamlandı olarak işaretleyebilirsin. İstersen sonra da işaretleyebilirsin."),askButtons);
  detailTitle.id="rbProgramDetailTitle";detailClose.setAttribute("aria-label","Çalışma detayını kapat");detailHeading.append(detailEyebrow,detailTitle);detailHead.append(detailHeading,detailClose);detailActions.append(detailVideo,detailDone);detailCard.append(detailHead,detailMeta,detailResource,detailAsk,detailExtras,detailEdit,detailActions);detailDialog.append(detailCard);
  let detailTaskId="",detailWeek="",detailTaskText="",detailUrl="";
  const closeDetail=()=>{detailTaskId="";detailWeek="";detailTaskText="";detailUrl="";detailAsk.hidden=true;detailDialog.hidden=true;};
  const openDetail=(task:RefinedProgramTask,week=controller.snapshot().week)=>{
    const extras=refinedProgramSplitExtras(task.text),info=refinedProgramTaskDetail(extras.work,task.label),resource=object(call("cellLink",extras.work));
    detailTaskId=task.id;detailWeek=week;detailTaskText=extras.work;detailTitle.textContent=info.title;detailMeta.textContent=info.meta||task.label;
    const linked=typeof resource.url==="string"&&Boolean(resource.url);detailResource.replaceChildren();detailAsk.hidden=true;
    detailUrl=linked?String(info.url||resource.url):"";
    if(linked){
      const badge=element("span","rb-program-detail-resource-badge",info.hasVideo?"YouTube bağlantısı":"Kaynak bağlantısı"),copy=element("small","",String(resource.url));copy.title=String(resource.url);detailResource.append(badge,copy);
      const watched=refinedProgramVideoWatchedAt(week,task.id,detailUrl);
      if(watched)badge.after(element("span","rb-program-detail-watched",`▶ İzlendi · ${clockOf(watched)}`));
      detailVideo.textContent=watched?"▶ Videoya tekrar git":info.hasVideo?"▶ YouTube videosuna git":"↗ Kaynağı aç";
    }
    else{detailResource.append(element("span","rb-program-detail-resource-badge","Konu içeriği"),element("small","","Bu çalışmaya kayıtlı video yok; varsa konu videosunu açabilirsin."));detailVideo.textContent="▶ Konu videosunu aç";}
    detailExtras.replaceChildren();
    const noteBox=element("section"),materialBox=element("section");
    noteBox.append(element("b","","Not"),element("p","",extras.note||"Henüz not eklenmedi."));
    materialBox.append(element("b","","Materyal"));
    if(extras.material&&refinedProgramResourceUrl(extras.material)!==null){
      const anchor=element("a","","↗ Materyali aç");anchor.href=extras.material;anchor.target="_blank";anchor.rel="noopener noreferrer";materialBox.append(anchor);
    }else materialBox.append(element("p","","Henüz materyal eklenmedi."));
    detailExtras.append(noteBox,materialBox);
    detailVideo.dataset.hasLink=String(linked);detailDone.textContent=task.done?"↶ Tamamlanmadı olarak işaretle":"✓ Tamamladım";detailDone.toggleAttribute("data-done",task.done);detailDialog.hidden=false;requestAnimationFrame(()=>detailVideo.focus());
  };
  let editingTaskId="",editingWeek="";
  const closeEditor=()=>{editingTaskId="";editingWeek="";editor.hidden=true;editorInput.value="";noteInput.value="";materialInput.value="";};
  const openEditor=(task:RefinedProgramTask,week=controller.snapshot().week,focus:"work"|"note"|"material"="work")=>{
    const parts=refinedProgramSplitExtras(task.text);editingTaskId=task.id;editingWeek=week;editorInput.value=parts.work;noteInput.value=parts.note;materialInput.value=parts.material;
    editorHint.textContent="Not ve materyal mevcut çalışmaya eklenir; koç senkronizasyonu değiştirilmez.";
    editor.hidden=false;requestAnimationFrame(()=>{const target=focus==="note"?noteInput:focus==="material"?materialInput:editorInput;target.focus();if(target===editorInput)editorInput.setSelectionRange(editorInput.value.length,editorInput.value.length);});
  };

  const weeklyPanel=element("section","rb-program-week-grid");weeklyPanel.id="refinedProgramWeek";weeklyPanel.setAttribute("aria-label","Haftalık ders takvimi");
  const smartPanel=element("section","rb-program-smart");smartPanel.id="refinedProgramSmart";smartPanel.setAttribute("aria-label","Akıllı program önerileri ve haftalık analiz");
  const summary=element("div","rb-program-summary"),dayLabel=element("h2"),completion=element("div","rb-program-completion"),count=element("span"),progress=element("progress");
  const dailyHero=element("div","rb-v4-day-progress"),dailyRing=element("div","rb-v4-ring"),dailyPercent=element("strong","", "0%");
  const dailyHeroCopy=element("div","rb-v4-progress-copy"),dailyHeroCount=element("span"),dailyHeroBar=element("div","rb-v4-progress-bar"),dailyHeroBarFill=element("i");
  dailyRing.append(dailyPercent);dailyHeroBar.append(dailyHeroBarFill);
  dailyHeroCopy.append(element("strong","","Seçili Günün İlerlemesi"),dailyHeroCount,dailyHeroBar);
  const dailyHeroCaption=element("div","rb-v4-progress-caption");
  dailyHero.append(dailyRing,dailyHeroCopy,dailyHeroCaption);
  const dailyTasksHeading=element("div","rb-v4-day-heading");dailyTasksHeading.append(element("span","","☀"),element("h3","","Bugünün Planı"));progress.max=100;progress.setAttribute("aria-label","Günlük görev tamamlama");completion.append(count,progress);summary.append(dayLabel,completion);
  const list=element("div","rb-program-tasks");dailyPanel.append(summary,dailyHero,dailyTasksHeading,list);
  const actions=element("div","rb-program-actions"),toolbar=element("div","rb-program-toolbar"),add=button("","rb-program-add"),share=button("","rb-program-share"),shareStatus=element("p","rb-program-share-status");
  add.append(icon("plus"),document.createTextNode("Çalışma ekle"));add.setAttribute("aria-controls","refinedProgramAdd");add.setAttribute("aria-expanded","false");
  share.append(icon("share"),document.createTextNode("Koçla paylaş"));share.dataset.coachShareNow="";shareStatus.dataset.coachShareStatus="";shareStatus.setAttribute("role","status");
  const form=element("form","rb-program-add-form");form.id="refinedProgramAdd";form.hidden=true;
  const formTabs=element("div","rb-program-form-tabs"),quickTab=button("Ders ve konu seç"),customTab=button("Kendim yazayım");formTabs.setAttribute("role","group");formTabs.setAttribute("aria-label","Çalışma ekleme yöntemi");formTabs.append(quickTab,customTab);
  const builder=element("div","rb-program-builder"),fields=element("div","rb-program-fields"),metrics=element("div","rb-program-metrics");
  const subject=element("select"),topic=element("select"),questions=element("input"),minutes=element("input"),resource=element("input");
  const field=(label:string,control:HTMLInputElement|HTMLSelectElement,id:string)=>{const wrap=element("label");control.id=id;wrap.htmlFor=id;wrap.append(element("span","",label),control);return wrap;};
  subject.required=true;questions.type=minutes.type="number";questions.min=minutes.min="1";questions.max="1000";minutes.max="1440";questions.step=minutes.step="1";questions.inputMode=minutes.inputMode="numeric";questions.placeholder="Örn. 30";minutes.placeholder="Örn. 45";
  resource.type="url";resource.inputMode="url";resource.maxLength=500;resource.setAttribute("autocomplete","url");resource.placeholder="https://youtu.be/... veya video bağlantısı";
  questions.dataset.programNumber=minutes.dataset.programNumber="";
  fields.append(field("Ders",subject,"refinedProgramSubject"),field("Konu",topic,"refinedProgramTopic"));metrics.append(field("Soru hedefi · isteğe bağlı",questions,"refinedProgramQuestions"),field("Süre (dk) · isteğe bağlı",minutes,"refinedProgramMinutes"));
  const subjects=window.YKSLegacyState?.subjects?.()??[];
  subject.append(new Option("Ders seç",""));subjects.forEach((item,index)=>subject.append(new Option(`${item.exam} · ${item.name.replace(/\s*\(AYT\)$/," ").trim()}`,String(index))));
  const presets=element("div","rb-program-presets");presets.setAttribute("aria-label","Hızlı çalışma örnekleri");
  for(const [label,name,topicName,amount] of [["Paragraf · 20 soru","Türkçe","Paragraf","20"],["Problemler · 30 soru","Matematik","Problemler","30"]] as const){
    const preset=button(label);preset.addEventListener("click",()=>{const index=subjects.findIndex(item=>item.exam==="TYT"&&item.name===name);if(index<0)return;subject.value=String(index);syncTopics();topic.value=topicName;questions.value=amount;minutes.value="";updatePreview();});presets.append(preset);
  }
  builder.append(presets,fields,metrics);
  const custom=element("div","rb-program-custom"),formLabel=element("label","","Ne çalışacaksın?"),input=element("textarea"),hint=element("p","rb-program-form-hint"),formActions=element("div","rb-program-form-actions"),save=button("Programa ekle"),cancel=button("Vazgeç");
  input.id="refinedProgramTaskText";input.rows=2;input.maxLength=600;input.placeholder="Örn. Deneme analizi · Yanlış soruların tekrarı";formLabel.htmlFor=input.id;hint.setAttribute("role","status");save.type="submit";formActions.append(save,cancel);custom.append(formLabel,input);
  const resourceField=element("div","rb-program-resource-field"),resourceHelp=element("small","","YouTube videosu, oynatma listesi veya başka bir web video bağlantısı ekleyebilirsin.");
  resourceField.append(field("Video URL · isteğe bağlı",resource,"refinedProgramVideoUrl"),resourceHelp);
  const daysField=element("fieldset","rb-program-days"),dayOptions=element("div","rb-program-day-options"),dayShortcuts=element("div","rb-program-day-shortcuts"),preview=element("div","rb-program-preview"),previewText=element("strong"),previewDays=element("span"),feedback=element("p","rb-program-feedback");
  previewDays.id="refinedProgramDestination";subject.setAttribute("aria-describedby",previewDays.id);input.setAttribute("aria-describedby",previewDays.id);resource.setAttribute("aria-describedby",previewDays.id);
  feedback.setAttribute("role","status");feedback.setAttribute("aria-live","polite");
  let quickMode=true,draftWeek=controller.snapshot().week,draftDays=new Set<number>([controller.snapshot().day]),submitting=false;
  const draftButtons=SHORT_DAYS.map((label,index)=>{const node=button(label);node.setAttribute("aria-label",FULL_DAYS[index]!);node.addEventListener("click",()=>{if(draftDays.has(index))draftDays.delete(index);else draftDays.add(index);updatePreview();});dayOptions.append(node);return node;});
  for(const [label,days] of [["Seçili gün",null],["Hafta içi",[0,1,2,3,4]],["Her gün",[0,1,2,3,4,5,6]]] as const){const node=button(label);node.addEventListener("click",()=>{draftDays=new Set(days??[controller.snapshot().day]);updatePreview();});dayShortcuts.append(node);}
  daysField.append(element("legend","","Hangi günlere eklensin?"),dayOptions,dayShortcuts);preview.append(previewText,previewDays);form.append(formTabs,builder,custom,resourceField,daysField,preview,hint,formActions);
  toolbar.append(tabs,add);actions.append(share,shareStatus);root.append(heading,toolbar,weekNav,strip,form,feedback,dailyPanel,weeklyPanel,smartPanel,actions,detailDialog,editor);
  let destroyed=false,queued=false;
  // UI-only fold state, scoped by exact date and subject; never touches S.weeks or Firestore.
  const collapsedDailyGroups=new Set<string>();
  const quickText=()=>{const item=subject.value===""?undefined:subjects[Number(subject.value)];return item?refinedProgramQuickText(`${item.exam} ${item.name.replace(/\s*\(AYT\)$/,"")}`,topic.value,questions.value,minutes.value):null;};
  function syncTopics(){topic.replaceChildren(new Option("Genel çalışma",""));const item=subject.value===""?undefined:subjects[Number(subject.value)];item?.topics.forEach(name=>topic.append(new Option(name,name)));topic.disabled=!item;updatePreview();}
  function updatePreview(){
    const baseText=(quickMode?quickText():input.value.trim())||"";
    const resourceUrl=refinedProgramResourceUrl(resource.value);
    previewText.textContent=baseText?(resourceUrl?baseText+" · video bağlantılı":baseText):"Çalışmanı seç; eklenecek plan burada görünsün.";
    const labels=[...draftDays].sort((a,b)=>a-b).map(index=>`${SHORT_DAYS[index]} ${parseDate(offsetDate(draftWeek,index))?.getDate()??""}`);
    const start=parseDate(draftWeek);previewDays.textContent=`${start?.toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})??""} haftası · ${labels.join(", ")||"En az bir gün seç"}`;
    draftButtons.forEach((node,index)=>node.setAttribute("aria-pressed",String(draftDays.has(index))));save.textContent=draftDays.size>1?`${draftDays.size} güne ekle`:"Programa ekle";
  }
  function setMode(quick:boolean){quickMode=quick;builder.hidden=!quick;custom.hidden=quick;subject.disabled=!quick;questions.disabled=minutes.disabled=!quick;topic.disabled=!quick||subject.value==="";input.disabled=quick;input.required=!quick;quickTab.setAttribute("aria-pressed",String(quick));customTab.setAttribute("aria-pressed",String(!quick));hint.textContent="";updatePreview();}
  quickTab.addEventListener("click",()=>setMode(true));customTab.addEventListener("click",()=>setMode(false));subject.addEventListener("change",syncTopics);for(const field of [topic,questions,minutes,input,resource])field.addEventListener("input",updatePreview);syncTopics();setMode(true);
  const schedule=()=>{if(queued||destroyed)return;queued=true;queueMicrotask(()=>{queued=false;if(!destroyed)refresh();});};
  const originalShare=()=>legacyPanel.querySelector<HTMLButtonElement>("#studentCoachProgramShare [data-coach-share-now]");
  function refresh():void{
    const state=controller.snapshot(),isDaily=state.view==="day",selected=parseDate(state.date),start=parseDate(state.week),end=parseDate(offsetDate(state.week,6));
    screen.dataset.refinedProgram=state.view;daily.setAttribute("aria-pressed",String(isDaily));weekly.setAttribute("aria-pressed",String(state.view==="week"));smart.setAttribute("aria-pressed",String(state.view==="smart"));
    daily.setAttribute("aria-controls",dailyPanel.id);weekly.setAttribute("aria-controls",weeklyPanel.id);smart.setAttribute("aria-controls",smartPanel.id);dailyPanel.hidden=!isDaily;weeklyPanel.hidden=state.view!=="week";smartPanel.hidden=state.view!=="smart";legacyPanel.hidden=true;
    const total=state.days.reduce((sum,item)=>sum+item.count,0),completed=state.days.reduce((sum,item)=>sum+item.done,0);
    weekSummary.textContent=`Haftalık plan · ${total} çalışma · ${completed} tamamlandı`;
    weekLabel.textContent=start&&end?`${start.toLocaleDateString("tr-TR",{day:"numeric",month:"short"})} – ${end.toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"})}`:"";
    const todayKey=dateKey(new Date());
    state.days.forEach((day,index)=>{
      const item=dayButtons[index];if(!item)return;item.number.textContent=day.date.slice(-2);item.node.setAttribute("aria-pressed",String(index===state.day));item.node.setAttribute("aria-label",`${FULL_DAYS[index]}, ${day.date}, ${day.done}/${day.count} tamamlandı`);
      item.node.toggleAttribute("data-today",day.date===todayKey);item.marker.toggleAttribute("data-filled",day.count>0);item.marker.toggleAttribute("data-complete",day.count>0&&day.done===day.count);
    });
    dayLabel.textContent=selected?selected.toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"}):"Benim programım";
    const done=state.tasks.filter(task=>task.done).length;count.textContent=`${done}/${state.tasks.length} tamamlandı`;progress.value=state.tasks.length?done/state.tasks.length*100:0;
    dailyPercent.textContent=Math.round(Number(progress.value))+"%";dailyRing.style.setProperty("--rb-v4-percent",String(progress.value));
    dailyHeroCount.textContent=`${done} / ${state.tasks.length} görev tamamlandı`;dailyHeroBarFill.style.width=String(progress.value)+"%";
    const remaining=state.tasks.length-done;
    dailyHero.toggleAttribute("data-complete",state.tasks.length>0&&remaining===0);
    dailyHeroCaption.textContent=!state.tasks.length?"Seçili gün için henüz bir görev yok.":remaining===0?"✓ Seçili günün bütün görevleri tamamlandı.":`${remaining} görev kaldı. Tamamladıkça ilerlemen güncellenir.`;
    const focused=document.activeElement instanceof HTMLElement?document.activeElement.dataset.rbProgramFocus:undefined;
    list.replaceChildren();
    if(!state.tasks.length){const empty=element("div","rb-program-empty");empty.append(element("strong","","Bu günün planı henüz boş"),element("p","","Çalışma ekle’ye dokun; dersini ve konunu seç. Aynı çalışmayı birden fazla güne de ekleyebilirsin."));list.append(empty);}
    for(const group of refinedProgramDailyGroups(state.tasks)){
      const section=element("section","rb-v4-subject-section");
      section.dataset.v4Group=group.key;
      const status=refinedProgramDailyGroupProgress(group),groupId=state.date+"|"+group.key;
      const folded=collapsedDailyGroups.has(groupId);
      section.toggleAttribute("data-complete",status.total>0&&status.done===status.total);
      const groupHeading=button("","rb-v4-subject-heading");
      groupHeading.setAttribute("aria-label",group.title+": "+status.done+"/"+status.total+" tamamlandı, "+(folded?"genişlet":"daralt"));
      groupHeading.setAttribute("aria-expanded",String(!folded));
      const groupName=element("div","rb-v4-subject-heading-title");
      groupName.append(element("strong","",group.title),element("small","",status.done+"/"+status.total+" tamamlandı"));
      const groupProgress=element("div","rb-v4-subject-progress"),progressFill=element("i");
      progressFill.style.width=status.percent+"%";
      groupProgress.setAttribute("aria-hidden","true");
      groupProgress.append(progressFill);
      const groupIndicator=element("span","rb-v4-subject-expand");
      groupIndicator.setAttribute("aria-hidden","true");
      groupIndicator.textContent="⌄";
      const cards=element("div","rb-v4-subject-cards");
      cards.id="rb-v4-tasks-"+state.week+"-"+state.day+"-"+group.key;
      cards.hidden=folded;
      groupHeading.setAttribute("aria-controls",cards.id);
      groupHeading.append(refinedProgramSubjectIcon(group.key),groupName,groupProgress,groupIndicator);
      groupHeading.addEventListener("click",()=>{
        const next=groupHeading.getAttribute("aria-expanded")!=="true";
        cards.hidden=!next;
        groupHeading.setAttribute("aria-expanded",String(next));
        groupHeading.setAttribute("aria-label",group.title+": "+status.done+"/"+status.total+" tamamlandı, "+(next?"daralt":"genişlet"));
        if(next)collapsedDailyGroups.delete(groupId);else collapsedDailyGroups.add(groupId);
      });
      section.append(groupHeading,cards);list.append(section);
      for(const task of group.tasks){
      const card=element("article","rb-program-task");card.toggleAttribute("data-done",task.done);card.dataset.taskId=task.id;
      const label=refinedProgramSubjectLabel(task.text,task.label);
      card.dataset.v4Tone=group.key;
      const check=button("","rb-program-check"),details=button("","rb-program-task-details"),copy=element("span","rb-program-task-copy"),openMark=element("span","rb-program-task-open","›");
      check.dataset.rbProgramFocus=task.id;
      const subjectIcon=refinedProgramSubjectIcon(group.key);
      check.setAttribute("aria-pressed",String(task.done));check.setAttribute("aria-label",`${task.text}: ${task.done?"tamamlanmadı olarak işaretle":"tamamla"}`);if(task.done)check.append(icon("check"));
      const extras=refinedProgramSplitExtras(task.text),info=refinedProgramTaskDetail(extras.work,task.label);
      const meta=info.meta===task.label?"":info.meta;
      copy.append(element("strong","",label),element("small","",meta||"Çalışma detaylarını görüntüle"));
      if(task.done)copy.append(element("span","rb-v4-task-done","✓ Tamamlandı"));
      const resourceBadge=element("span","rb-program-task-resource",info.url?"▶ Video / kaynak":"Detayı aç");
      details.setAttribute("aria-label",`${label} çalışma detayını aç`);details.append(copy,resourceBadge,openMark);
      check.addEventListener("click",()=>{controller.toggleTask(task.id);refresh();});
      details.addEventListener("click",()=>openDetail(task,state.week));
      const chips=element("div","rb-v4-task-chips");
      const watchedAt=info.url?refinedProgramVideoWatchedAt(state.week,task.id,info.url):0;
      const videoChip=button(watchedAt?"▶ İzlendi":"▶ Video","rb-v4-chip rb-v4-chip-video"+(watchedAt?" rb-v4-chip-watched":"")),
        noteChip=button("▤ Not","rb-v4-chip rb-v4-chip-note"),
        materialChip=button("▣ Materyal","rb-v4-chip rb-v4-chip-material");
      videoChip.setAttribute("aria-label",watchedAt?`${label} videosu ${clockOf(watchedAt)}’da açıldı; detayı aç`:`${label} video veya kaynak seçenekleri`);
      noteChip.setAttribute("aria-label",`${label} notunu düzenle`);
      materialChip.setAttribute("aria-label",`${label} materyalini aç veya ekle`);
      videoChip.addEventListener("click",()=>openDetail(task,state.week));
      noteChip.addEventListener("click",()=>openEditor(task,state.week,"note"));
      materialChip.addEventListener("click",()=>{
        if(extras.material&&refinedProgramResourceUrl(extras.material)!==null){
          const anchor=document.createElement("a");anchor.href=extras.material;anchor.target="_blank";anchor.rel="noopener noreferrer";anchor.click();
        }else openEditor(task,state.week,"material");
      });
      chips.append(videoChip,noteChip,materialChip);
      card.append(check,subjectIcon,details,chips);cards.append(card);
      }
    }
    // Checkbox remains keyboard-focusable after the legacy save triggers a full refresh.
    if(focused){
      const replacement=[...list.querySelectorAll<HTMLButtonElement>("[data-rb-program-focus]")].find(node=>node.dataset.rbProgramFocus===focused);
      replacement?.focus({preventScroll:true});
    }
    const weekTasks=state.days.map((_,index)=>controller.tasksForDay(index));
    const weekGroups=refinedProgramWeeklyGroups(weekTasks);
    const weekStats=refinedProgramWeeklyCompletion(weekTasks);
    weeklyPanel.replaceChildren();
    const hero=element("div","rb-v5-week-hero"),heroCopy=element("div","rb-v5-week-hero-copy");
    heroCopy.append(element("span","rb-v5-eyebrow","HAFTALIK PROGRAM"),element("h2","","Haftana bir bakış"),
      element("p","","Hangi gün ne çalışacağını gör, eksiklerini takip et ve çalışmanın adına dokunarak düzenle."));
    const score=element("div","rb-v5-week-score"),scoreNumber=element("strong","",weekStats.percent+"%");
    const scoreBar=element("div","rb-v5-week-score-bar"),scoreFill=element("i");
    scoreFill.style.width=weekStats.percent+"%";scoreBar.append(scoreFill);
    score.append(scoreNumber,element("span","","Tamamlama oranı"),scoreBar);hero.append(heroCopy,score);
    const statsRow=element("div","rb-v5-week-stats");
    for(const [value,label,kind] of [
      [String(weekStats.total),"Toplam çalışma","total"],
      [String(weekStats.done),"Tamamlanan","done"],
      [String(weekStats.pending),"Bekleyen","pending"],
      [String(weekGroups.length),"Planlı ders grubu","subjects"]
    ]){
      const cell=element("div","rb-v5-stat");cell.dataset.kind=kind;
      cell.append(element("strong","",value),element("small","",label));statsRow.append(cell);
    }
    const dayStrip=element("div","rb-v5-week-days");dayStrip.setAttribute("aria-label","Haftanın günlerine göre ilerleme");
    const openDay=(dayIndex:number)=>{
      controller.selectDay(dayIndex);controller.setView("day");refresh();
      dayButtons[dayIndex]?.node.focus({preventScroll:true});
    };
    state.days.forEach((day,index)=>{
      const dayButton=button("","rb-v5-week-day"),bar=element("div","rb-v5-week-day-bar"),fill=element("i");
      dayButton.dataset.v5Day=day.date;
      dayButton.toggleAttribute("data-today",day.date===todayKey);
      dayButton.toggleAttribute("data-complete",day.count>0&&day.done===day.count);
      const fraction=day.count?day.done/day.count:0;
      fill.style.width=Math.round(fraction*100)+"%";bar.append(fill);
      dayButton.append(element("span","",SHORT_DAYS[index]!),element("strong","",day.date.slice(-2)),
        element("small","",day.count?day.done+"/"+day.count:"Plan yok"),bar);
      dayButton.setAttribute("aria-label",FULL_DAYS[index]+", "+day.date+", "+day.done+"/"+day.count+" tamamlandı; günlük planı aç");
      dayButton.addEventListener("click",()=>openDay(index));dayStrip.append(dayButton);
    });
    weeklyPanel.append(hero,statsRow,dayStrip);
    if(!weekGroups.length){
      const empty=element("div","rb-program-week-empty");
      empty.append(element("strong","","Bu hafta henüz çalışma eklenmemiş."),
        element("p","","Çalışma Ekle butonundan ders seçip haftanı oluşturmaya başlayabilirsin."));
      const emptyButton=button("+ Çalışma ekle","rb-v5-week-create");
      emptyButton.addEventListener("click",()=>add.click());empty.append(emptyButton);
      weeklyPanel.append(empty);
    }else{
      const desktopHeading=element("div","rb-v5-week-section-heading");
      desktopHeading.append(element("h3","","Derslere göre haftalık takvim"),
        element("p","","Ders adları ve renkleri Günlük Plan ile aynı. Çalışma metnine dokunarak düzenleyebilirsin."));
      const calendar=element("div","rb-program-calendar rb-v5-week-desktop");
      calendar.setAttribute("role","region");calendar.setAttribute("aria-label","Haftalık ders tablosu; sağa kaydırılabilir");
      calendar.tabIndex=0;
      const calendarHead=element("div","rb-program-calendar-row rb-program-calendar-head");
      calendarHead.append(element("div","rb-program-calendar-subject-head","Dersler"));
      state.days.forEach((day,index)=>{
        const date=parseDate(day.date),head=button("","rb-program-calendar-day");
        head.toggleAttribute("data-today",day.date===todayKey);
        head.setAttribute("aria-label",FULL_DAYS[index]+", "+day.date+", "+day.done+"/"+day.count+" tamamlandı; günlük planı aç");
        head.append(element("span","",SHORT_DAYS[index]!),element("b","",String(date?.getDate()??"")),
          element("small","",day.count?day.done+"/"+day.count+" bitti":"—"));
        head.addEventListener("click",()=>openDay(index));calendarHead.append(head);
      });
      calendar.append(calendarHead);
      // The week matrix reuses the same categorization and ordering as the daily view.
      for(const group of weekGroups){
        const row=element("div","rb-program-calendar-row rb-program-subject-row rb-v5-subject-row");
        row.dataset.v4Group=group.key;
        const subjectCell=element("div","rb-program-subject-cell rb-v5-subject-cell");
        const info=element("div","rb-v5-week-subject-info"),progress=element("div","rb-v5-week-subject-progress"),fill=element("i");
        fill.style.width=Math.round(group.done/group.total*100)+"%";progress.append(fill);
        info.append(element("strong","",group.title),element("small","",group.done+"/"+group.total+" tamamlandı"),progress);
        subjectCell.append(refinedProgramSubjectIcon(group.key),info);row.append(subjectCell);
        group.days.forEach((tasks,index)=>{
          const cell=element("div","rb-program-calendar-cell rb-v5-calendar-cell");
          cell.toggleAttribute("data-today",state.days[index]?.date===todayKey);
          if(!tasks.length)cell.append(element("span","rb-program-calendar-empty","·"));
          for(const task of tasks){
            const extra=refinedProgramSplitExtras(task.text);
            const info=refinedProgramTaskDetail(extra.work,task.label);
            const item=element("div","rb-program-calendar-task rb-v5-week-task");
            item.toggleAttribute("data-done",task.done);
            const mark=element("span","rb-program-calendar-task-state",task.done?"✓":"");
            const workName=info.meta&&info.meta!==task.label?info.meta:info.display;
            const action=button(workName||group.title,"rb-program-calendar-task-text");
            action.dataset.rbWeekTask=index+":"+task.id;
            action.title=info.display;
            action.setAttribute("aria-label",FULL_DAYS[index]+", "+group.title+": "+info.display+" düzenle");
            action.addEventListener("click",()=>{controller.selectDay(index);openEditor(task,state.week);});
            item.append(mark,action);
            if(info.url||extra.note||extra.material){
              const badges=element("span","rb-v5-week-resources");
              badges.setAttribute("aria-label",[info.url?"Video veya bağlantı":"",extra.note?"Not":"",extra.material?"Materyal":""].filter(Boolean).join(", "));
              badges.textContent=[info.url?"▶":"",extra.note?"▤":"",extra.material?"▣":""].filter(Boolean).join(" ");
              item.append(badges);
            }
            cell.append(item);
          }
          row.append(cell);
        });
        calendar.append(row);
      }
      const mobileHeading=element("div","rb-v5-week-section-heading rb-v5-mobile-only");
      mobileHeading.append(element("h3","","Gün gün haftalık plan"),element("p","","Çalışmaları görmek için kaydırmana gerek yok. Düzenlemek için çalışma metnine dokun."));
      const mobileDays=element("div","rb-v5-week-mobile");
      state.days.forEach((day,index)=>{
        const dayCard=element("section","rb-v5-mobile-day");
        dayCard.toggleAttribute("data-today",day.date===todayKey);
        const dayHeader=element("div","rb-v5-mobile-day-heading");
        const dateInfo=element("div","rb-v5-mobile-date");
        dateInfo.append(element("strong","",FULL_DAYS[index]+" · "+day.date.slice(-2)),
          element("small","",day.count?day.done+"/"+day.count+" tamamlandı":"Bu gün için çalışma yok"));
        const go=button("Günü aç →","rb-v5-mobile-open");
        go.setAttribute("aria-label",FULL_DAYS[index]+" günlük planını aç");
        go.addEventListener("click",()=>openDay(index));
        dayHeader.append(dateInfo,go);
        dayCard.append(dayHeader);
        const todayGroups=refinedProgramDailyGroups(weekTasks[index]||[]);
        if(!todayGroups.length){
          dayCard.append(element("p","rb-v5-mobile-empty","Bu gün boş. İstersen çalışma ekleyebilirsin."));
        }else{
          for(const group of todayGroups){
            const section=element("div","rb-v5-mobile-group");
            section.dataset.v4Group=group.key;
            const groupHeader=element("div","rb-v5-mobile-group-title");
            groupHeader.append(refinedProgramSubjectIcon(group.key),
              element("strong","",group.title),element("small","",group.tasks.filter(task=>task.done).length+"/"+group.tasks.length));
            section.append(groupHeader);
            for(const task of group.tasks){
              const extra=refinedProgramSplitExtras(task.text),info=refinedProgramTaskDetail(extra.work,task.label);
              const workName=info.meta&&info.meta!==task.label?info.meta:info.display;
              const item=element("div","rb-v5-mobile-task");
              item.toggleAttribute("data-done",task.done);
              item.append(element("span","rb-v5-mobile-task-state",task.done?"✓":""));
              const action=button(workName||group.title,"rb-v5-mobile-task-text");
              action.title=info.display;
              action.setAttribute("aria-label",FULL_DAYS[index]+", "+group.title+": "+info.display+" düzenle");
              action.addEventListener("click",()=>{controller.selectDay(index);openEditor(task,state.week);});
              item.append(action);section.append(item);
            }
            dayCard.append(section);
          }
        }
        mobileDays.append(dayCard);
      });
      weeklyPanel.append(desktopHeading,calendar,mobileHeading,mobileDays);
    }
    if(state.view==="smart"){
      const rawState=object((window as unknown as ProgramWindow).S||window.YKSLegacyState?.readState?.());
      const items=state.days.flatMap((_,index)=>controller.tasksForDay(index).map(task=>({
        id:task.id,day:index,text:task.text,subject:refinedProgramSubjectLabel(task.text,task.label),done:task.done
      })));
      renderSmartProgram(smartPanel,{week:state.week,today:todayKey,tasks:items,focusMinutes:rawState.pomoMin},{
        onDraft:(text,day)=>{
          draftWeek=state.week;draftDays=new Set([day]);form.hidden=false;add.setAttribute("aria-expanded","true");
          setMode(false);input.value=text;updatePreview();hint.textContent="Öneri taslağa alındı. Kaydetmeden önce günü ve çalışmayı kontrol et.";
          form.scrollIntoView({block:"start",behavior:"smooth"});input.focus();
        },
        onWeekly:()=>showView("week"),
        onAdd:()=>{add.click();}
      });
    }
    const realShare=originalShare();share.hidden=!realShare;shareStatus.hidden=!realShare;
    if(realShare){share.disabled=realShare.disabled;const status=legacyPanel.querySelector("#studentCoachProgramShare [data-coach-share-status]")?.textContent;if(status)shareStatus.textContent=status;}
  }
  const showView=(view:ProgramView)=>{controller.setView(view);refresh();};
  daily.addEventListener("click",()=>showView("day"));weekly.addEventListener("click",()=>showView("week"));smart.addEventListener("click",()=>showView("smart"));
  previous.addEventListener("click",()=>{controller.moveWeek(-1);refresh();});next.addEventListener("click",()=>{controller.moveWeek(1);refresh();});today.addEventListener("click",()=>{controller.today();refresh();});
  add.addEventListener("click",()=>{form.hidden=!form.hidden;add.setAttribute("aria-expanded",String(!form.hidden));hint.textContent="";feedback.textContent="";if(!form.hidden){const state=controller.snapshot();draftWeek=state.week;draftDays=new Set([state.day]);updatePreview();(quickMode?subject:input).focus();}});
  cancel.addEventListener("click",()=>{form.hidden=true;add.setAttribute("aria-expanded","false");add.focus();});
  form.addEventListener("submit",event=>{
    event.preventDefault();if(submitting)return;
    const baseText=quickMode?quickText():input.value.trim();
    if(!baseText){hint.textContent=quickMode?"Bir ders seç; soru ve süre hedeflerini geçerli sayılarla doldur veya boş bırak.":"Eklemek istediğin çalışmayı yaz.";(quickMode?subject:input).focus();return;}
    const resourceUrl=refinedProgramResourceUrl(resource.value);
    if(resourceUrl===null){hint.textContent="Video URL geçerli bir http:// veya https:// bağlantısı olmalı.";resource.focus();return;}
    const text=resourceUrl?`${baseText} — ${resourceUrl}`:baseText;
    if(text.length>600){hint.textContent="Çalışma metni ve video bağlantısı birlikte çok uzun. Metni veya URL’yi kısalt.";resource.focus();return;}
    if(!draftDays.size){hint.textContent="En az bir gün seç.";draftButtons[0]?.focus();return;}
    submitting=true;save.disabled=true;
    try{
      const result=controller.addMany(text,[...draftDays],draftWeek);
      if(!result.ok){hint.textContent=result.reason==="full"?"Bu gün için çok fazla çalışma var. Daha eski veya gereksiz bir görevi kaldırıp tekrar dene.":result.reason==="save"?"Plan kaydedilemedi. Çalışman burada duruyor; tekrar deneyebilirsin.":"Plan eklenemedi. Dersini ve seçtiğin günleri kontrol et.";return;}
      feedback.textContent=`${draftDays.size} güne çalışma eklendi. ${previewDays.textContent}`;
      input.value="";resource.value="";form.hidden=true;add.setAttribute("aria-expanded","false");refresh();add.focus();
    }finally{submitting=false;save.disabled=false;}
  });
  detailClose.addEventListener("click",closeDetail);detailDialog.addEventListener("click",event=>{if(event.target===detailDialog)closeDetail();});
  /* Video açılınca "izlendi" işaretlenir. Uygulama içi oynatıcı kapanınca ya da başka
     sekmeden dönülünce görev hâlâ açıksa "Videoyu bitirdin mi?" sorulur. */
  let askTimer=0;
  const videoOverlayOpen=()=>["playOverlay","vidOverlay"].some(id=>document.getElementById(id)?.style.display==="flex");
  const waitForVideoReturn=(taskId:string,week:string)=>{
    window.clearInterval(askTimer);
    const started=Date.now();
    askTimer=window.setInterval(()=>{
      const elapsed=Date.now()-started;
      if(elapsed>3*3600000){window.clearInterval(askTimer);return;}
      // Oynatıcının açılması ya da sekmenin gizlenmesi için kısa bir süre tanınır.
      if(elapsed<2500||document.hidden||videoOverlayOpen())return;
      window.clearInterval(askTimer);
      const current=controller.snapshot().week===week?controller.snapshot().tasks.find(item=>item.id===taskId):undefined;
      if(!current||current.done)return;
      openDetail(current,week); // “İzlendi” etiketiyle yeniden çizilir
      detailAsk.hidden=false;requestAnimationFrame(()=>askDone.focus());
    },700);
  };
  detailVideo.addEventListener("click",()=>{
    if(!detailTaskText)return;
    const linked=detailVideo.dataset.hasLink==="true",opened=linked?call("cellOpenLink",detailTaskText):call("cellVideo",detailTaskText);
    if(opened===false){call("toast",linked?"Bağlantı açılamadı.":"Bu çalışma için konu videosu bulunamadı.");return;}
    if(linked&&detailUrl&&detailTaskId&&detailWeek){
      refinedProgramMarkVideoWatched(detailWeek,detailTaskId,detailUrl);
      waitForVideoReturn(detailTaskId,detailWeek);
      refresh();
    }
  });
  askDone.addEventListener("click",()=>{detailAsk.hidden=true;detailDone.click();});
  askLater.addEventListener("click",()=>{detailAsk.hidden=true;detailVideo.focus();});
  detailDone.addEventListener("click",()=>{
    if(!detailTaskId||!detailWeek)return;
    const current=controller.snapshot().tasks.find(item=>item.id===detailTaskId),wasDone=Boolean(current?.done);
    if(controller.toggleTask(detailTaskId)){closeDetail();refresh();call("toast",wasDone?"Çalışma tekrar açıldı.":"Çalışma tamamlandı ✓");}
  });
  detailEdit.addEventListener("click",()=>{const current=controller.snapshot().tasks.find(item=>item.id===detailTaskId);if(!current)return;closeDetail();openEditor(current,controller.snapshot().week,"note");});
  editorClose.addEventListener("click",closeEditor);editorCancel.addEventListener("click",closeEditor);editor.addEventListener("click",event=>{if(event.target===editor)closeEditor();});
  editorDelete.addEventListener("click",()=>{if(!editingTaskId||!editingWeek)return;if(!confirm("Bu çalışma programdan silinsin mi?"))return;editorDelete.disabled=true;try{if(!controller.deleteTask(editingTaskId,editingWeek)){editorHint.textContent="Çalışma silinemedi. Tekrar dene.";return;}closeEditor();feedback.textContent="Çalışma silindi.";refresh();call("toast","Çalışma silindi");}finally{editorDelete.disabled=false;}});
  editorForm.addEventListener("submit",event=>{event.preventDefault();const value=refinedProgramJoinExtras(editorInput.value,noteInput.value,materialInput.value);if(!editingTaskId||!editingWeek||!value){editorHint.textContent="Çalışma veya ek alanları geçersiz. Toplam sınır 600 karakter, materyal bağlantısı http(s) olmalı.";editorInput.focus();return;}editorSave.disabled=true;try{if(!controller.updateTask(editingTaskId,value,editingWeek)){editorHint.textContent="Değişiklik kaydedilemedi. Tekrar dene.";return;}closeEditor();feedback.textContent="Çalışma güncellendi.";refresh();}finally{editorSave.disabled=false;}});
  share.addEventListener("click",()=>originalShare()?.click());
  const wrappers=new Map<string,{original:LegacyFunction;wrapped:LegacyFunction}>();
  const wrap=(name:string,before?:()=>void)=>{
    const original=legacy[name];if(typeof original!=="function")return;
    const wrapped=function(this:unknown,...args:unknown[]){before?.();const result=original.apply(this,args);schedule();return result;};
    wrappers.set(name,{original:original as LegacyFunction,wrapped});legacy[name]=wrapped;
  };
  wrap("renderPlan");wrap("planEditSelected",()=>controller.setView("week"));
  const onNavigation=(event:Event)=>{const detail=(event as CustomEvent<{to?:string;screen?:string}>).detail;if((detail?.to??detail?.screen)==="program")schedule();};
  const events=["yks:data-changed","yks:data-primary-ready","yks:auth-state","yks:student-coach-link-ready"];
  for(const name of events)window.addEventListener(name,schedule);window.addEventListener("yks:navigation-after",onNavigation);document.addEventListener("yks:navigation-after",onNavigation);
  legacyPanel.addEventListener("input",schedule);
  // Only the retained Program tools are observed, only for asynchronous share-control insertion/removal.
  const observer=new MutationObserver(records=>{
    if(records.some(record=>[...record.addedNodes,...record.removedNodes].some(node=>node instanceof Element&&(node.id==="studentCoachProgramShare"||node.querySelector("#studentCoachProgramShare")))))schedule();
  });
  observer.observe(legacyPanel,{childList:true,subtree:true});
  call("renderPlan");refresh();
  installed={installed:true,refresh,destroy(){
    destroyed=true;observer.disconnect();for(const name of events)window.removeEventListener(name,schedule);window.removeEventListener("yks:navigation-after",onNavigation);document.removeEventListener("yks:navigation-after",onNavigation);legacyPanel.removeEventListener("input",schedule);
    for(const [name,{original,wrapped}] of wrappers)if(legacy[name]===wrapped)legacy[name]=original;
    root.remove();while(legacyPanel.firstChild)screen.insertBefore(legacyPanel.firstChild,legacyPanel);legacyPanel.remove();delete screen.dataset.refinedProgram;installed=undefined;
  }};
  return installed;
}
