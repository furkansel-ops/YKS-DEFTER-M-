/* Etüt oluştur · saf yardımcılar (içe aktarım yok; testler VM'de çalıştırır).
   Süre görev metninde " · 120 dk" olarak durur (öğrenci formu ve koç paneli aynı biçimi yazar).
   Güne özel ayar haftanın mv["etut-<gün>"] alanında: {start, gap, mid:{görevId:dakika}, skip:[görevId]} (dakika cinsinden).
   skip: o gün etüde katılmayan görevler (süre ve metin silinmez).
   Görev kimliği, tamamlama ve koç senkronu değişmez; sıra mevcut mv["order-<gün>"] ile tutulur. */

export type EtutPlan={start:number;gap:number;mid:Record<string,number>;skip:string[]};
export type EtutSlot={start:number;end:number;label:string;midAt:number;mid:number};
export type EtutSchedule={slots:Map<string,EtutSlot>;breaks:Map<string,number>;start:number;end:number;study:number};
export type EtutSegment={kind:"task"|"rest";minutes:number;id:string};

export const ETUT_GAPS=[5,10,15,20] as const;
export const ETUT_MIDS=[0,5,10] as const;
/** Ara mola bu süreden kısa etütlere konmaz. */
export const ETUT_MID_MIN=60;
export const ETUT_KEY=(day:number)=>"etut-"+day;

const TASK_ID=/^[rs]-\d+-[0-6]$/;
const MINUTES=/\s+·\s+(\d{1,4})\s*dk(?=\s*(?:·|—|$))/;
const MINUTES_ALL=new RegExp(MINUTES.source,"g");
// shortcut: gece yarısını geçen etüt saati 00:30 gibi döner; gün aşan plan istenirse tarih eklenir.
const hm=(value:number)=>{const m=((value%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");};
const span=(minutes:number)=>{const h=Math.floor(minutes/60),m=minutes%60;return h&&m?`${h} sa ${m} dk`:h?`${h} sa`:`${m} dk`;};

/** Görevin süresi (dk); yalnız ilk satırdaki " · N dk" okunur, yoksa 0. */
export function taskMinutes(text:string):number{
  const first=String(text||"").split("\n")[0]||"",value=Number(MINUTES.exec(first)?.[1]);
  return Number.isInteger(value)&&value>=1&&value<=1440?value:0;
}

/** Süreyi yazar/değiştirir (0 siler). Not/Materyal satırları ve " — https://…" video bağlantısı yerinde kalır. */
export function withTaskMinutes(text:string,minutes:number):string{
  const lines=String(text||"").split("\n");
  let first=(lines[0]||"").replace(MINUTES_ALL,"");
  if(minutes>0){
    const segment=` · ${Math.round(minutes)} dk`,link=first.search(/\s+—\s+https?:\/\//);
    first=link>=0?first.slice(0,link)+segment+first.slice(link):first+segment;
  }
  return [first,...lines.slice(1)].join("\n");
}

/** Kart ek satırından "120 dk" parçasını atar (süre ayrıca yazılır; başlık olarak seçilmesin). */
export const withoutMinutes=(meta:string)=>meta.split(" · ").filter(part=>!/^\d{1,4}\s*dk$/.test(part.trim())).join(" · ");

export function normalizeEtutPlan(raw:unknown):EtutPlan|null{
  if(!raw||typeof raw!=="object")return null;
  const value=raw as {start?:unknown;gap?:unknown;mid?:unknown;skip?:unknown},start=Number(value.start),gap=Number(value.gap);
  if(!Number.isInteger(start)||start<0||start>1439||!Number.isInteger(gap)||gap<0||gap>60)return null;
  const mid:Record<string,number>={};
  if(value.mid&&typeof value.mid==="object")for(const [id,minutes] of Object.entries(value.mid as Record<string,unknown>)){
    const n=Number(minutes);if(TASK_ID.test(id)&&Number.isInteger(n)&&n>0&&n<=30)mid[id]=n;
  }
  const skip=Array.isArray(value.skip)?[...new Set(value.skip.filter((id):id is string=>typeof id==="string"&&TASK_ID.test(id)))].slice(0,60):[];
  return {start,gap,mid,skip};
}

export function readEtutPlan(state:unknown,week:string,day:number):EtutPlan|null{
  const weeks=state&&typeof state==="object"?(state as {weeks?:unknown}).weeks:null;
  const data=weeks&&typeof weeks==="object"?(weeks as Record<string,{mv?:Record<string,unknown>}>)[week]:null;
  return normalizeEtutPlan(data?.mv?.[ETUT_KEY(day)]);
}

/** Süreli görevler verilen sırayla dizilir; aralarına gap, uzun etüdün ortasına isteğe bağlı ara mola. */
export function etutSchedule(tasks:readonly {id:string;minutes:number}[],plan:EtutPlan):EtutSchedule{
  const slots=new Map<string,EtutSlot>(),breaks=new Map<string,number>();
  let at=plan.start,last="",study=0;const skip=new Set(plan.skip||[]);
  for(const task of tasks){
    if(!(task.minutes>0)||skip.has(task.id))continue;
    if(last){breaks.set(last,plan.gap);at+=plan.gap;}
    const mid=task.minutes>=ETUT_MID_MIN?plan.mid[task.id]||0:0,end=at+task.minutes+mid;
    slots.set(task.id,{start:at,end,label:hm(at)+"–"+hm(end),midAt:mid?at+Math.floor(task.minutes/2):0,mid});
    at=end;last=task.id;study+=task.minutes;
  }
  return {slots,breaks,start:plan.start,end:at,study};
}

/** "10:00 → 18:55 · 8 sa ders · 4 mola" (ara molalar dahil); etüt yoksa boş. */
export function etutSummary(schedule:EtutSchedule):string{
  if(!schedule.slots.size)return "";
  const rests=schedule.breaks.size+[...schedule.slots.values()].filter(slot=>slot.mid).length;
  return `${hm(schedule.start)} → ${hm(schedule.end)} · ${span(schedule.study)} ders · ${rests?rests+" mola":"mola yok"}`;
}

/** Günün şeridi: sırayla ders ve mola parçaları (ara mola dersi ikiye böler). */
export function etutSegments(schedule:EtutSchedule):EtutSegment[]{
  const out:EtutSegment[]=[];
  for(const [id,slot] of schedule.slots){
    const study=slot.end-slot.start-slot.mid,first=slot.mid?slot.midAt-slot.start:study;
    out.push({kind:"task",minutes:first,id});
    if(slot.mid)out.push({kind:"rest",minutes:slot.mid,id},{kind:"task",minutes:study-first,id});
    const rest=schedule.breaks.get(id);if(rest)out.push({kind:"rest",minutes:rest,id});
  }
  return out;
}

export const etutSpan=span;
export const etutClock=hm;
