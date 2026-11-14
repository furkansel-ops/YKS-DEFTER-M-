/* v117 · Hata analizi: Hata Defteri satırlarından "yanlış nedeni" dağılımı ve derse göre konu ısı haritası.
   Saf fonksiyonlar; satır biçimi exam-hub-v73 errorRows() ile aynı (subject, topic, n, reason, resolved). */
export type InsightRow={subject?:unknown;topic?:unknown;n?:unknown;reason?:unknown;resolved?:unknown};
export type ReasonStat={label:string;n:number;pct:number};
export type HeatTopic={topic:string;n:number;open:number;level:1|2|3|4};
export type HeatSubject={subject:string;total:number;topics:HeatTopic[];more:number};

export const NO_REASON="Belirtilmedi";
const text=(v:unknown):string=>String(v??"").trim();
const count=(v:unknown):number=>{const n=Math.floor(Number(v));return Number.isFinite(n)&&n>0?n:1;};
const rowsOf=(rows:unknown):InsightRow[]=>Array.isArray(rows)?rows.filter((r):r is InsightRow=>!!r&&typeof r==="object"):[];

/** Nedene göre yanlış sayısı, çoktan aza; pct toplam içindeki pay (tam sayı). */
export function reasonStats(rows:unknown):ReasonStat[]{
  const sums=new Map<string,number>();let total=0;
  for(const r of rowsOf(rows)){const label=text(r.reason)||NO_REASON,n=count(r.n);sums.set(label,(sums.get(label)??0)+n);total+=n;}
  return [...sums].map(([label,n])=>({label,n,pct:Math.round(n/total*100)}))
    .sort((a,b)=>Number(a.label===NO_REASON)-Number(b.label===NO_REASON)||b.n-a.n||a.label.localeCompare(b.label,"tr"));
}

/** Derse göre konu yanlışları. level 1–4: en çok yanlış yapılan konuya oranla yoğunluk. */
export function topicHeat(rows:unknown,maxSubjects=6,maxTopics=8):HeatSubject[]{
  const subjects=new Map<string,{subject:string;total:number;topics:Map<string,{topic:string;n:number;open:number}>}>();
  for(const r of rowsOf(rows)){
    const subject=text(r.subject),topic=text(r.topic);if(!subject||!topic)continue;
    const n=count(r.n),key=subject.toLocaleLowerCase("tr-TR");
    let s=subjects.get(key);if(!s){s={subject,total:0,topics:new Map()};subjects.set(key,s);}
    s.total+=n;
    const tk=topic.toLocaleLowerCase("tr-TR"),t=s.topics.get(tk)??{topic,n:0,open:0};
    t.n+=n;if(!r.resolved)t.open+=n;s.topics.set(tk,t);
  }
  let max=1;for(const s of subjects.values())for(const t of s.topics.values())max=Math.max(max,t.n);
  return [...subjects.values()].sort((a,b)=>b.total-a.total||a.subject.localeCompare(b.subject,"tr")).slice(0,Math.max(0,maxSubjects)).map(s=>{
    const all=[...s.topics.values()].sort((a,b)=>b.n-a.n||a.topic.localeCompare(b.topic,"tr"));
    return{subject:s.subject,total:s.total,more:Math.max(0,all.length-maxTopics),
      topics:all.slice(0,Math.max(0,maxTopics)).map(t=>({...t,level:Math.min(4,Math.max(1,Math.ceil(t.n/max*4))) as 1|2|3|4}))};
  });
}
