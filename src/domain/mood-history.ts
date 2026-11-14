/* v118 · Ruh hali geçmişi: gün sonu değerlendirmesindeki (S.dayReview[gün].mood) seçimlerden son N günün dizisi.
   Saf fonksiyon; ruh hali değerleri app.js ile aynı: good / mid / hard. */
export type Mood="good"|"mid"|"hard";
export type MoodDay={date:string;mood:Mood|""};
export type MoodHistory={days:MoodDay[];counts:Record<Mood,number>;total:number};

const MOODS:readonly string[]=["good","mid","hard"];
function shift(date:string,delta:number):string{
  const d=new Date(Number(date.slice(0,4)),Number(date.slice(5,7))-1,Number(date.slice(8,10))+delta);
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

/** today dahil geriye doğru `days` gün, eskiden yeniye sıralı. */
export function moodHistory(dayReview:unknown,today:string,days=30):MoodHistory{
  const src=dayReview&&typeof dayReview==="object"?dayReview as Record<string,{mood?:unknown}|null>:{};
  const counts:Record<Mood,number>={good:0,mid:0,hard:0},out:MoodDay[]=[];
  for(let i=days-1;i>=0;i--){
    const date=shift(today,-i),raw=src[date]?.mood,mood=(typeof raw==="string"&&MOODS.includes(raw)?raw:"") as Mood|"";
    if(mood)counts[mood]++;
    out.push({date,mood});
  }
  return{days:out,counts,total:counts.good+counts.mid+counts.hard};
}
