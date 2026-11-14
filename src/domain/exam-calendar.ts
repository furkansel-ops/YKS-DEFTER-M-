/* v120 · Deneme takvimi: öğrencinin planladığı denemeler (S.examPlans) ve kalan gün hesabı. Saf fonksiyonlar. */
export type ExamPlan={id:number;date:string;name:string;type:string};
export type PlanRow=ExamPlan&{daysLeft:number};

export const PLAN_TYPES:readonly string[]=["TYT","AYT","YDT","BRANS"];
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const dayNumber=(key:string):number=>Date.UTC(Number(key.slice(0,4)),Number(key.slice(5,7))-1,Number(key.slice(8,10)))/864e5;
/* Biçim yetmez: 2026-13-40 gibi olmayan günler de elenir. */
const realDate=(key:string):boolean=>DATE.test(key)&&new Date(dayNumber(key)*864e5).toISOString().slice(0,10)===key;

/** Geçerli bir plan üretir; tarih bozuksa ya da geçmişteyse null. */
export function makePlan(input:{date?:unknown;name?:unknown;type?:unknown},today:string,id:number):ExamPlan|null{
  const date=String(input.date??"");
  if(!realDate(date)||date<today)return null;
  const type=String(input.type??""),name=String(input.name??"").trim().slice(0,80);
  return{id,date,name:name||"Deneme",type:PLAN_TYPES.includes(type)?type:"TYT"};
}

/** Yaklaşan planlar yakından uzağa; tarihi geçenler `pastDays` gün boyunca "sonucu gir" için listede kalır. */
export function planRows(plans:unknown,today:string,pastDays=7):PlanRow[]{
  const now=dayNumber(today);
  return (Array.isArray(plans)?plans:[]).filter((p):p is ExamPlan=>!!p&&typeof p==="object"&&realDate(String((p as ExamPlan).date)))
    .map(p=>({id:Number(p.id),date:p.date,name:String(p.name||"Deneme"),type:String(p.type||"TYT"),daysLeft:dayNumber(p.date)-now}))
    .filter(p=>p.daysLeft>=-pastDays)
    .sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id);
}
