/* v96 · Yanlış soru tekrarı: fotoğraflı yanlışın ne zaman yeniden sorulacağı. DOM'a dokunmaz.
   Sıra bilgisi yanlış kaydının kendisinde durur (S.wrongLog[i].rep); kayıt yoksa soru bugün sorulur. */
import {shiftDay} from "./study-gamification.ts";

export type WrongRep={due:string;ok:number;miss:number};
/** Üst üste bu kadar doğru çözülen yanlış "öğrenildi" olur. */
export const LEARNED_AFTER=3;
/* 1. doğrudan sonra 3 gün, 2. doğrudan sonra 7 gün beklenir; yanlışta ertesi gün. */
const GAP_AFTER_OK=[3,7] as const;
const DAY=/^\d{4}-\d{2}-\d{2}$/;
const count=(value:unknown)=>{const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(0,Math.min(999,n)):0;};

/** Kayıttaki sıra bilgisi senkrondan gelir; bozuksa yok sayılır. */
export function readRep(raw:unknown):WrongRep|null{
  const r=raw&&typeof raw==="object"?raw as Record<string,unknown>:null;
  if(!r||!DAY.test(String(r.due)))return null;
  return {due:String(r.due),ok:Math.min(LEARNED_AFTER,count(r.ok)),miss:count(r.miss)};
}
export function isDue(raw:unknown,today:string):boolean{const rep=readRep(raw);return !rep||rep.due<=today;}
/** Öğrencinin cevabından yeni sıra bilgisi. Yanlış cevap doğru serisini sıfırlar. */
export function answerRep(raw:unknown,correct:boolean,today:string):{rep:WrongRep;learned:boolean}{
  const prev=readRep(raw)??{due:today,ok:0,miss:0};
  if(!correct)return {rep:{due:shiftDay(today,1),ok:0,miss:prev.miss+1},learned:false};
  const ok=prev.ok+1,learned=ok>=LEARNED_AFTER;
  return {rep:{due:learned?today:shiftDay(today,GAP_AFTER_OK[ok-1]??7),ok,miss:prev.miss},learned};
}
