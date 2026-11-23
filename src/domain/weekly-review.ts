/* v151 · Haftalık değerlendirme hesabı: pencere (Pazar 18:00 – Pazartesi 23:59), temizleme, son 8 hafta.
   Hafta anahtarı değerlendirilen haftanın Pazartesi'si (yerel tarih). Saf; DOM ve depolama yok. */
export type WeeklyReview={good:string;hard:string;focus:string;at:number;skipped?:true};

export const REVIEW_MAX=300;
const KEEP=8;
const WEEK=/^\d{4}-\d{2}-\d{2}$/;

function dateKey(d:Date):string{
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

/** Kart açıksa değerlendirilen haftanın Pazartesi'si; değilse null. */
export function reviewWeekFor(now:Date):string|null{
  const day=now.getDay(),back=day===0&&now.getHours()>=18?6:day===1?7:-1;
  if(back<0)return null;
  return dateKey(new Date(now.getFullYear(),now.getMonth(),now.getDate()-back));
}

/** Kırpılmış cevaplar; üçü de boşsa null. */
export function cleanReview(input:{good?:unknown;hard?:unknown;focus?:unknown},at:number):WeeklyReview|null{
  const clip=(v:unknown)=>typeof v==="string"?v.trim().slice(0,REVIEW_MAX):"";
  const out={good:clip(input?.good),hard:clip(input?.hard),focus:clip(input?.focus),at};
  return out.good||out.hard||out.focus?out:null;
}

/** Haftayı ekler; geçersiz anahtarları atar, en yeni 8 haftayı tutar. */
export function withReview(map:unknown,week:string,review:WeeklyReview):Record<string,WeeklyReview>{
  const base=map&&typeof map==="object"&&!Array.isArray(map)?map as Record<string,WeeklyReview>:{};
  const merged:Record<string,WeeklyReview>={...base,[week]:review};
  return Object.fromEntries(Object.keys(merged).filter(k=>WEEK.test(k)).sort().slice(-KEEP).map(k=>[k,merged[k]!]));
}
