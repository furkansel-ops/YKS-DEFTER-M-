/* v128 · Deneme › Analiz raporu hesapları: net nereden gidiyor, yanlış nedenleri, öneriler. */
type Loose=Record<string,any>;
export interface SubjectLoss{name:string;cap:number;net:number;lost:number;fromWrong:number;fromBlank:number;accuracy:number|null;}
export interface TopicCount{subject:string;topic:string;n:number;}
export interface ReasonRow{kind:string;label:string;n:number;pct:number;}
export interface ReportAction{text:string;plan?:string;}

const num=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)?n:0;};
const r1=(v:number)=>Math.round(v*10)/10;
export const REASON_LABEL:Record<string,string>={bilmiyordum:"Bilgi eksiği",dikkat:"Dikkat",sure:"Süre","":"Belirtilmemiş"};

/* Kayıp net = soru sayısı − net = 1,25 × yanlış + boş (ve girilmemiş sorular). Dönem ortalaması; çok kaybettiren üstte. */
export function subjectLosses(exams:Loose[]):SubjectLoss[]{
  const acc=new Map<string,{n:number;cap:number;net:number;wrong:number;d:number;y:number}>();
  for(const exam of exams)for(const r of Array.isArray(exam?.subjectResults)?exam.subjectResults:[]){
    const d=num(r?.d),y=num(r?.y),b=num(r?.b),cap=num(r?.cap)||d+y+b;
    if(!cap||d+y+b===0)continue; // yalnız net girilmiş satırda kaybın kaynağı bilinmez
    const name=String(r.name||"Ders"),a=acc.get(name)??{n:0,cap:0,net:0,wrong:0,d:0,y:0};
    a.n++;a.cap+=cap;a.net+=d-y/4;a.wrong+=y*1.25;a.d+=d;a.y+=y;acc.set(name,a);
  }
  return [...acc].map(([name,a])=>{const cap=a.cap/a.n,net=a.net/a.n,lost=cap-net,fromWrong=a.wrong/a.n;
    return {name,cap:r1(cap),net:r1(net),lost:r1(lost),fromWrong:r1(fromWrong),fromBlank:r1(lost-fromWrong),accuracy:a.d+a.y?a.d/(a.d+a.y):null};})
    .sort((x,y)=>y.lost-x.lost);
}

export function topTopics(wrongs:Loose[]):TopicCount[]{
  const m=new Map<string,TopicCount>();
  for(const w of wrongs){const subject=String(w?.subject||"").trim(),topic=String(w?.topic||"").trim();if(!subject||!topic)continue;
    const key=(subject+"|"+topic).toLocaleLowerCase("tr-TR"),cur=m.get(key)??{subject,topic,n:0};cur.n+=Math.max(1,num(w.n));m.set(key,cur);}
  return [...m.values()].sort((a,b)=>b.n-a.n);
}

export function reasonShares(wrongs:Loose[]):ReasonRow[]{
  const m=new Map<string,number>();let total=0;
  for(const w of wrongs){const k=String(w?.kind||""),kind=k in REASON_LABEL?k:"",n=Math.max(1,num(w?.n));m.set(kind,(m.get(kind)??0)+n);total+=n;}
  return Object.keys(REASON_LABEL).filter(k=>m.get(k)).map(kind=>({kind,label:REASON_LABEL[kind]!,n:m.get(kind)!,pct:Math.round(m.get(kind)!/total*100)}));
}

/* Hedefe kaç deneme: yalnız net yükseliyorsa; 50'den uzaksa tahmin yazılmaz. */
export function examsToTarget(latest:number,slopePerExam:number|null,target:number):number|null{
  if(!(target>latest)||!slopePerExam||slopePerExam<=0.05)return null;
  const n=Math.ceil((target-latest)/slopePerExam);return n<=50?n:null;
}

export function reportActions(o:{topics:TopicCount[];losses:SubjectLoss[];reasons:ReasonRow[];bestHour?:string}):ReportAction[]{
  const out:ReportAction[]=[],t=o.topics[0];
  if(t&&t.n>=2)out.push({text:`${t.subject} · ${t.topic}: bu dönemde ${t.n} yanlış. Konuyu tekrar et.`,plan:`${t.subject} · ${t.topic} tekrarı`});
  const blank=o.losses.filter(l=>l.fromBlank>=3&&l.accuracy!=null&&l.accuracy>=0.8).sort((a,b)=>b.fromBlank-a.fromBlank)[0];
  if(blank)out.push({text:`${blank.name}: ortalama ${blank.fromBlank} boş, işaretlediklerinde isabet %${Math.round(blank.accuracy!*100)}. Emin olmadığın soruları da dene.`,plan:`${blank.name} süreli soru çözümü`});
  const marked=o.reasons.filter(r=>r.kind),markedN=marked.reduce((s,r)=>s+r.n,0);
  const top=markedN>=5?marked.slice().sort((a,b)=>b.n-a.n)[0]:undefined,pct=top?Math.round(top.n/markedN*100):0; // eşik nedeni belli olanlara göre; metin etiketteki payı yazar
  if(top&&pct>=40&&top.kind==="dikkat")out.push({text:`Yanlışların en çok dikkatten (%${top.pct}): soru kökünü iki kez oku, işaretlemeyi kontrol et.`});
  else if(top&&pct>=40&&top.kind==="sure")out.push({text:`Yanlışların en çok süreden (%${top.pct}): takıldığın soruyu geç, turlayarak çöz.`});
  if(o.bestHour&&out.length<3)out.push({text:`1 saatin en çok ${o.bestHour} dersinde net getirir.`,plan:`${o.bestHour} çalış`});
  return out.slice(0,3);
}

/* v152 · Süre analizi: yeni veri istemeden ders ders boş, "süre yetmedi" yanlışları ve girilmiş toplam süre. */
export interface TimeRow{name:string;avgBlank:number;sureWrongs:number;trend:"up"|"down"|"";}
export interface TimeReport{rows:TimeRow[];worst:string|null;duration:{avg:number;count:number;limit:number}|null;}
/** exams eskiden yeniye; matches(sonuçDersi, yanlışDersi) alt dersleri eşler (Fen ← Fizik). limit 0 (branş) ya da veri yoksa null. */
export function timeReport(exams:Loose[],wrongs:Loose[],limit:number,matches:(name:string,subject:string)=>boolean):TimeReport|null{
  if(!(limit>0))return null;
  const blanks=new Map<string,number[]>();let examCount=0;
  for(const exam of exams){
    const results=Array.isArray(exam?.subjectResults)?exam.subjectResults:[];let used=false;
    for(const r of results){
      const d=num(r?.d),y=num(r?.y),b=num(r?.b);if(d+y+b===0)continue;
      const name=String(r.name||"Ders");blanks.set(name,[...(blanks.get(name)??[]),b]);used=true;
    }
    if(used)examCount++;
  }
  const sure=(Array.isArray(wrongs)?wrongs:[]).filter(w=>w?.kind==="sure"&&w.subject);
  const avg=(xs:number[])=>xs.reduce((a,x)=>a+x,0)/xs.length;
  const rows=[...blanks].map(([name,bs])=>{
    const half=Math.ceil(bs.length/2),diff=bs.length>=4?avg(bs.slice(half))-avg(bs.slice(0,half)):0;
    const sureWrongs=sure.filter(w=>matches(name,String(w.subject))).reduce((a,w)=>a+Math.max(1,Math.floor(num(w.n)||1)),0);
    return {name,avgBlank:r1(avg(bs)),sureWrongs,trend:(diff>=1?"up":diff<=-1?"down":"") as TimeRow["trend"]};
  });
  const score=(r:TimeRow)=>r.avgBlank+r.sureWrongs/Math.max(1,examCount);
  rows.sort((a,b)=>score(b)-score(a));
  const durs=exams.map(e=>num(e?.dur)).filter(x=>x>0);
  const duration=durs.length?{avg:r1(avg(durs)),count:durs.length,limit}:null;
  if(!rows.some(r=>r.avgBlank>0||r.sureWrongs>0)&&!duration)return null;
  const top=rows[0];
  return {rows,worst:top&&score(top)>0?top.name:null,duration};
}
