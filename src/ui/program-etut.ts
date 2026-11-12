/* Etüt oluştur · saf yardımcılar (içe aktarım yok; testler VM'de çalıştırır).
   Süre görev metninde " · 120 dk" olarak durur (öğrenci formu ve koç paneli aynı biçimi yazar).
   Güne özel ayar haftanın mv["etut-<gün>"] alanında (dakika cinsinden):
     {start, gap, mid:{görevId:dakika}, skip:[görevId]}  → zorunlu (v104)
     end, block, long, longAt  → isteğe bağlı (v110)
   skip: o gün etüde katılmayan görevler (süre ve metin silinmez).
   end varsa süreli derslerden kalan zaman "boş etüt"lerle (f1, f2…) dolar; block boş etüdün süresi.
   Boş etüde ders seçilmez (yalnız "Ders" yazar) ve etüt Odak'a işlenmez.
   long: uzun (yemek/dinlenme) molası; longAt hedef saat, mola ona en yakın iki etüdün arasına girer.
   Görev kimliği, tamamlama ve koç senkronu değişmez; sıra mevcut mv["order-<gün>"] ile tutulur. */

export type EtutPlan={start:number;gap:number;mid:Record<string,number>;skip:string[];end?:number;block?:number;long?:number;longAt?:number};
export type EtutSlot={start:number;end:number;label:string;midAt:number;mid:number};
export type EtutItem={kind:"task"|"free"|"gap"|"long";id:string;start:number;end:number};
export type EtutSchedule={slots:Map<string,EtutSlot>;breaks:Map<string,number>;items:EtutItem[];long:EtutItem|null;start:number;end:number;study:number};
export type EtutSegment={kind:"task"|"rest"|"free"|"long";minutes:number;id:string};

export const ETUT_GAPS=[5,10,15,20] as const;
export const ETUT_MIDS=[0,5,10] as const;
export const ETUT_BLOCKS=[40,50,60,90,120] as const;
export const ETUT_LONGS=[0,60,90,120] as const;
/** Ara mola bu süreden kısa etütlere konmaz. */
export const ETUT_MID_MIN=60;
/** Bundan kısa boş etüt açılmaz; artan süre son etüde eklenir. */
export const ETUT_MIN_BLOCK=20;
/** Bu kadar ve daha uzun etütte 1 saatlik uzun mola önerilir. */
export const ETUT_LONG_FROM=360;
export const ETUT_KEY=(day:number)=>"etut-"+day;

const TASK_ID=/^[rs]-\d+-[0-6]$/;
const MINUTES=/\s+·\s+(\d{1,4})\s*dk(?=\s*(?:·|—|$))/;
const MINUTES_ALL=new RegExp(MINUTES.source,"g");
// shortcut: gece yarısını geçen etüt saati 00:30 gibi döner; gün aşan plan istenirse tarih eklenir.
const hm=(value:number)=>{const m=((value%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");};
const span=(minutes:number)=>{const h=Math.floor(minutes/60),m=minutes%60;return h&&m?`${h} sa ${m} dk`:h?`${h} sa`:`${m} dk`;};
const within=(value:unknown,min:number,max:number):value is number=>typeof value==="number"&&Number.isInteger(value)&&value>=min&&value<=max;
const record=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};

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
  const value=raw as Record<string,unknown>,start=Number(value.start),gap=Number(value.gap);
  if(!Number.isInteger(start)||start<0||start>1439||!Number.isInteger(gap)||gap<0||gap>60)return null;
  const mid:Record<string,number>={};
  for(const [id,minutes] of Object.entries(record(value.mid))){
    const n=Number(minutes);if(TASK_ID.test(id)&&Number.isInteger(n)&&n>0&&n<=30)mid[id]=n;
  }
  const skip=Array.isArray(value.skip)?[...new Set(value.skip.filter((id):id is string=>typeof id==="string"&&TASK_ID.test(id)))].slice(0,60):[];
  const plan:EtutPlan={start,gap,mid,skip};
  // İsteğe bağlı alanlar yalnız geçerliyse eklenir; eski kayıt olduğu gibi kalır.
  if(within(value.end,start+1,1439))plan.end=value.end;
  if(within(value.block,ETUT_MIN_BLOCK,180))plan.block=value.block;
  if(within(value.long,30,180))plan.long=value.long;
  if(within(value.longAt,0,1439))plan.longAt=value.longAt;
  return plan;
}

export function readEtutPlan(state:unknown,week:string,day:number):EtutPlan|null{
  const weeks=state&&typeof state==="object"?(state as {weeks?:unknown}).weeks:null;
  const data=weeks&&typeof weeks==="object"?(weeks as Record<string,{mv?:Record<string,unknown>}>)[week]:null;
  return normalizeEtutPlan(data?.mv?.[ETUT_KEY(day)]);
}

/** Süreli görevler verilen sırayla dizilir; aralarına gap, uzun etüdün ortasına isteğe bağlı ara mola.
    plan.end varsa kalan süre boş etütlerle dolar ve plan.long kadar uzun mola hedefe en yakın araya girer. */
export function etutSchedule(tasks:readonly {id:string;minutes:number}[],plan:EtutPlan):EtutSchedule{
  const slots=new Map<string,EtutSlot>(),breaks=new Map<string,number>(),items:EtutItem[]=[],skip=new Set(plan.skip||[]);
  const queue=tasks.filter(task=>task.minutes>0&&!skip.has(task.id));
  const end=plan.end??0,fill=end>plan.start,block=plan.block||60,long=fill?plan.long||0:0;
  const target=plan.longAt??plan.start+(end-plan.start-long)/2;
  let at=plan.start,last="",study=0,index=0,free=0,longItem:EtutItem|null=null;
  // shortcut: 200 tur sınırı (en çok ~60 görev + 72 boş etüt) sonsuz döngüye karşı emniyet.
  for(let guard=0;guard<200;guard++){
    const task=queue[index];let sep=0;
    if(last){
      const room=end-at-plan.gap,afterLong=Boolean(task)||end-at-long>=ETUT_MIN_BLOCK,needLong=long>0&&!longItem;
      if(!task&&(!fill||(room<ETUT_MIN_BLOCK&&!(needLong&&afterLong))))break;
      const guess=task?task.minutes:Math.min(block,Math.max(room,0));
      if(needLong&&afterLong&&(at>=target||Math.abs(at-target)<=Math.abs(at+plan.gap+guess-target))){
        longItem={kind:"long",id:last,start:at,end:at+long};items.push(longItem);at+=long;
      }else if(!task&&room<ETUT_MIN_BLOCK)break;
      else sep=plan.gap;
    }else if(!task&&!fill)break;
    let id:string,minutes:number,mid=0;
    if(task){id=task.id;minutes=task.minutes;mid=minutes>=ETUT_MID_MIN?plan.mid[id]||0:0;index++;}
    else{
      const left=end-at-sep;if(left<ETUT_MIN_BLOCK)break;
      minutes=Math.min(block,left);
      const rest=left-minutes;if(rest>0&&rest<plan.gap+ETUT_MIN_BLOCK)minutes=left; // son etüt bitiş saatine denk gelsin
      id="f"+(++free);
    }
    if(sep){breaks.set(last,sep);items.push({kind:"gap",id:last,start:at,end:at+sep});at+=sep;}
    const stop=at+minutes+mid;
    slots.set(id,{start:at,end:stop,label:hm(at)+"–"+hm(stop),midAt:mid?at+Math.floor(minutes/2):0,mid});
    items.push({kind:task?"task":"free",id,start:at,end:stop});
    at=stop;last=id;study+=minutes;
  }
  return {slots,breaks,items,long:longItem,start:plan.start,end:at,study};
}

/** Uzun molanın bir önceki / bir sonraki araya kayması için hedef saatler (yoksa null). */
export function etutLongShift(schedule:EtutSchedule,gap:number):{earlier:number|null;later:number|null}{
  const at=schedule.long?schedule.items.indexOf(schedule.long):-1;
  if(at<0)return {earlier:null,later:null};
  const before=schedule.items[at-2],next=schedule.items[at+1],after=schedule.items[at+2];
  return {earlier:before?.kind==="gap"?before.start:null,later:next&&after?schedule.long!.start+gap+(next.end-next.start):null};
}

/** "10:00 → 18:55 · 8 sa ders · 4 mola" (ara ve uzun molalar dahil); etüt yoksa boş. */
export function etutSummary(schedule:EtutSchedule):string{
  if(!schedule.slots.size)return "";
  const rests=schedule.breaks.size+[...schedule.slots.values()].filter(slot=>slot.mid).length+(schedule.long?1:0);
  return `${hm(schedule.start)} → ${hm(schedule.end)} · ${span(schedule.study)} ders · ${rests?rests+" mola":"mola yok"}`;
}

/** Günün şeridi: sırayla ders, boş etüt ve mola parçaları (ara mola dersi ikiye böler). */
export function etutSegments(schedule:EtutSchedule):EtutSegment[]{
  const out:EtutSegment[]=[];
  for(const item of schedule.items){
    const minutes=item.end-item.start;
    if(item.kind==="gap"){out.push({kind:"rest",minutes,id:item.id});continue;}
    if(item.kind==="long"){out.push({kind:"long",minutes,id:item.id});continue;}
    const slot=schedule.slots.get(item.id)!,study=minutes-slot.mid,first=slot.mid?slot.midAt-slot.start:study;
    out.push({kind:item.kind,minutes:first,id:item.id});
    if(slot.mid)out.push({kind:"rest",minutes:slot.mid,id:item.id},{kind:item.kind,minutes:study-first,id:item.id});
  }
  return out;
}

export const etutSpan=span;
export const etutClock=hm;
/** 60 → "1 sa", 90 → "1,5 sa". */
export const etutLongLabel=(minutes:number)=>minutes%60===30?`${Math.floor(minutes/60)},5 sa`:span(minutes);
