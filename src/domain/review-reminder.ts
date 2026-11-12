/* v113 · Tekrar hatırlatması: önümüzdeki günlerde sırası gelen fotoğraflı yanlış sayısı. DOM'a dokunmaz.
   Sayım "Tekrar çöz" kuyruğuyla aynıdır: fotoğraflı, çözülmemiş yanlış; sıra bilgisi yoksa bugün sorulur. */
import {readRep} from "./wrong-review.ts";
import {shiftDay} from "./study-gamification.ts";

type Loose=Record<string,any>;
export type ReminderDay={date:string;wrongs:number;topics:number};
const list=(value:unknown):Loose[]=>Array.isArray(value)?value.filter(x=>x&&typeof x==="object"):[];
const TIME=/^([01]\d|2[0-3]):([0-5]\d)$/;

/** Her bekleyen yanlışın tekrar günü (geçmişte kalan bugüne çekilir). */
export function wrongDueDates(s:Loose,today:string):string[]{
  const resolved=new Set(list(s?.errorJournal).filter(j=>j.resolved&&String(j.sourceRef||"").startsWith("wrong:")).map(j=>String(j.sourceRef).slice(6)));
  return list(s?.wrongLog).filter(w=>{
    const photos=Array.isArray(w.questionImgs)?w.questionImgs.length:(w.questionImg?1:0);
    return photos>0&&!w.resolved&&!resolved.has(String(w.id));
  }).map(w=>{const due=readRep(w.rep)?.due??today;return due<today?today:due;});
}

/** Bitmiş konuların yapılmamış tekrar günleri (app.js reviewQueue ile aynı kural: st 3, ts + aralık). */
export function topicDueDates(s:Loose,gaps:readonly number[],today:string):string[]{
  const out:string[]=[];
  const topics=s?.topics&&typeof s.topics==="object"?s.topics as Record<string,Loose>:{};
  for(const t of Object.values(topics)){
    if(!t||t.st!==3||!/^\d{4}-\d{2}-\d{2}$/.test(String(t.ts)))continue;
    const done=Array.isArray(t.rev)?t.rev:[];
    gaps.forEach((gap,gi)=>{if(!done.includes(gi)&&Number.isFinite(gap)){const due=shiftDay(String(t.ts),gap);out.push(due<today?today:due);}});
  }
  return out;
}

/** Bugünden başlayarak her gün için o gün bekleyen yanlış ve konu tekrarı sayısı. */
export function reminderPlan(s:Loose,today:string,days=7,gaps:readonly number[]=[]):ReminderDay[]{
  const wrongs=wrongDueDates(s,today),topics=topicDueDates(s,gaps,today);
  return Array.from({length:Math.max(0,Math.min(14,days))},(_,i)=>{
    const date=shiftDay(today,i);
    return {date,wrongs:wrongs.filter(d=>d<=date).length,topics:topics.filter(d=>d<=date).length};
  });
}

export function reminderTime(value:unknown):string{return TIME.test(String(value))?String(value):"19:00";}

export function reminderText(wrongs:number,topics=0):string{
  const parts=[];
  if(wrongs>0)parts.push(wrongs+" yanlış sorunun tekrar günü geldi");
  if(topics>0)parts.push(topics+" konunun tekrar zamanı geldi");
  return parts.join(" · ");
}
