import "./progress-hub-v74.css";
import {analyzeExams} from "../domain/exam-analysis-service.ts";
import {errorRows,openExamTab} from "./exam-hub-v73";

/* v74 · İlerleme: Bugün · Bu hafta · Bu ay karşılaştırması, günlük grafik, ders listesi ve ders sayfası,
   konu durumları, tek "Dikkat" kartı ve süzgeçli raporlar.
   Veri yazmaz; yalnız eski fonksiyonları çağırır (doReview, addToToday, openTopicDetail, go).
   Eski Analiz Merkezi ve tekrar eden raporlar gizlenir, silinmez. */

type Loose=Record<string,any>;
type Period="gun"|"hafta"|"ay";
type Metric="min"|"q";
type LegacyWindow=Window&Record<string,any>&{YKSLegacyState?:{readState?:()=>Loose;subjects?:()=>unknown}};
type Range={from:string;to:string};
type SubjectRow={name:string;minutes:number;questions:number;done:number;total:number;tyt:number|null;tytLabel:string;ayt:number|null;openWrong:number;topWrong:string;samples:number};
type TopicState="done"|"review"|"active"|"missing";

const L=window as unknown as LegacyWindow;
const PERIOD_KEY="yks_progress_period_v74";
const PERIOD_LABEL:Record<Period,string>={gun:"Bugün",hafta:"Bu hafta",ay:"Bu ay"};
const VS_TEXT:Record<Period,string>={gun:"Dünle karşılaştırılıyor",hafta:"Geçen haftanın aynı günleriyle karşılaştırılıyor",ay:"Geçen ayın aynı günleriyle karşılaştırılıyor"};
const DAY_SHORT=["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];
/* Ders adı → deneme satırı (Temel Matematik, analiz servisinde "Matematik" olur). */
const TYT_ROW:Record<string,string>={"Türkçe":"Türkçe","Matematik":"Matematik","Geometri":"Matematik","Fizik":"Fen Bilimleri","Kimya":"Fen Bilimleri","Biyoloji":"Fen Bilimleri","Tarih":"Sosyal Bilimler","Coğrafya":"Sosyal Bilimler","Felsefe":"Sosyal Bilimler","Din Kültürü":"Sosyal Bilimler"};
const AYT_ROW:Record<string,string>={"Matematik":"Matematik","Geometri":"Matematik","Fizik":"Fizik","Kimya":"Kimya","Biyoloji":"Biyoloji","Edebiyat":"Edebiyat","Tarih":"Tarih-1","Coğrafya":"Coğrafya-1","Tarih-2":"Tarih-2","Coğrafya-2":"Coğrafya-2","Felsefe Grubu":"Felsefe Grubu","Din Kültürü":"Din Kültürü"};
const ROW_SHORT:Record<string,string>={"Fen Bilimleri":"Fen","Sosyal Bilimler":"Sosyal","Matematik":"Mat"};
/* Alana göre AYT dersleri (müfredat adlarıyla). */
const TRACK_AYT:Record<string,string[]>={
  SAY:["Matematik (AYT)","Geometri (AYT)","Fizik (AYT)","Kimya (AYT)","Biyoloji (AYT)"],
  EA:["Matematik (AYT)","Geometri (AYT)","Edebiyat","Tarih (AYT)","Coğrafya (AYT)"],
  SOZ:["Edebiyat","Tarih (AYT)","Coğrafya (AYT)","Tarih-2","Coğrafya-2","Felsefe Grubu","Din Kültürü (AYT)"],
  DIL:["Yabancı Dil"]
};
/* Yeni kartlarda karşılığı olan eski rapor başlıkları gizlenir. */
const DUP_TITLES=new Set(["Net değişimi","Ders bazlı durum","Çalışma düzeni","Konu ve tekrar","Dönem karşılaştırması","Haftalık gelişim","Ders bazlı ilerleme","Konu ilerlemesi","Eski çalışma ritmi","Tekrarlayan yanlışlar"]);
const REPORTS:[string,string,string][]=[["rek","Rekorlar","v24Records"],["tak","İstikrar takvimi","v28Calendar"],["hed","Hedef tahmini","progressForecast"],["kil","Kilometre taşları","v28Milestones"]];

let installed=false,queued=false,period:Period=readPeriod(),metric:Metric="min",report="rek",openSubject="",allSubjects=false;

function esc(value:unknown):string{return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));}
function num(value:unknown):number{const n=Number(value);return Number.isFinite(n)?n:0;}
function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{return document.getElementById(id) as T|null;}
function state():Loose{try{return L.YKSLegacyState?.readState?.()??{};}catch{return {};}}
function call(name:string,...args:unknown[]):unknown{const fn=L[name];if(typeof fn!=="function")return undefined;try{return (fn as (...a:unknown[])=>unknown)(...args);}catch(error){console.error("v74 "+name,error);return undefined;}}
function readPeriod():Period{try{const v=localStorage.getItem(PERIOD_KEY);return v==="gun"||v==="ay"?v:"hafta";}catch{return "hafta";}}
function canonical(value:unknown):string{const name=String(value??"").trim().replace(/ \(AYT\)$/u,"");return name==="Temel Matematik"?"Matematik":name;}

/* ---------- tarih ---------- */
function key(d:Date):string{return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function parse(k:string):Date{const [y,m,d]=k.split("-").map(Number);return new Date(y!,(m||1)-1,d||1);}
function add(k:string,days:number):string{const d=parse(k);d.setDate(d.getDate()+days);return key(d);}
function todayKey():string{return key(new Date());}
function daysIn(r:Range):string[]{const out:string[]=[];for(let k=r.from;k<=r.to;k=add(k,1))out.push(k);return out;}
function mondayOf(k:string):string{const d=parse(k),dow=(d.getDay()+6)%7;return add(k,-dow);}
function ranges(p:Period,today=todayKey()):{cur:Range;prev:Range}{
  if(p==="gun")return {cur:{from:today,to:today},prev:{from:add(today,-1),to:add(today,-1)}};
  if(p==="hafta"){const mon=mondayOf(today);return {cur:{from:mon,to:today},prev:{from:add(mon,-7),to:add(today,-7)}};}
  const t=parse(today),first=key(new Date(t.getFullYear(),t.getMonth(),1)),pm=new Date(t.getFullYear(),t.getMonth()-1,1),pmLast=new Date(t.getFullYear(),t.getMonth(),0).getDate();
  return {cur:{from:first,to:today},prev:{from:key(pm),to:key(new Date(pm.getFullYear(),pm.getMonth(),Math.min(t.getDate(),pmLast)))}};
}

/* ---------- ölçüler ---------- */
function minutesOn(s:Loose,k:string):number{return Math.max(0,num(s.pomoMin?.[k]));}
function questionsOn(s:Loose,k:string):number{return Math.max(0,num(s.solved?.[k]));}
function sum(s:Loose,r:Range,fn:(s:Loose,k:string)=>number):number{return daysIn(r).reduce((t,k)=>t+fn(s,k),0);}
function activeDays(s:Loose,r:Range):number{return daysIn(r).filter(k=>minutesOn(s,k)>0||questionsOn(s,k)>0).length;}
function settledTopics(s:Loose,r:Range):number{return Object.values(s.topics??{}).filter((t:any)=>t&&num(t.st)===3&&typeof t.ts==="string"&&t.ts>=r.from&&t.ts<=r.to).length;}
function reviewsDoneOn(s:Loose,k:string):number{let n=0;for(const t of Object.values(s.topics??{}) as Loose[])for(const v of Object.values(t?.revDone??{}))if(v===k)n++;return n;}
function streak(s:Loose,today=todayKey()):number{let k=today,n=0;if(!(minutesOn(s,k)||questionsOn(s,k)))k=add(k,-1);while(minutesOn(s,k)>0||questionsOn(s,k)>0){n++;k=add(k,-1);if(n>400)break;}return n;}
function dueReviews():Loose[]{const v=call("reviewQueue");return Array.isArray(v)?v:[];}
function hm(minutes:number):string{const m=Math.round(minutes);if(m<60)return m+" dk";const h=Math.floor(m/60),r=m%60;return r?`${h} sa ${r} dk`:`${h} sa`;}
function short(minutes:number):string{return minutes>=60?String(Math.round(minutes/6)/10).replace(".",",")+" sa":Math.round(minutes)+" dk";}
function deltaText(cur:number,prev:number,asTime=false):{text:string;tone:string}{
  const d=cur-prev;if(!d)return {text:"değişim yok",tone:""};
  const v=asTime?hm(Math.abs(d)):String(Math.abs(Math.round(d)));return {text:(d>0?"▲ ":"▼ ")+v,tone:d>0?"up":"down"};
}

/* ---------- müfredat ve dersler ---------- */
function curriculum():{exam:string;name:string;topics:string[]}[]{
  const raw=L.YKSLegacyState?.subjects?.();return Array.isArray(raw)?raw.filter((x:any)=>x&&x.name).map((x:any)=>({exam:String(x.exam||"TYT"),name:String(x.name),topics:Array.isArray(x.topics)?x.topics.map(String):[]})):[];
}
function trackSubjects(s:Loose):{exam:string;name:string;topics:string[]}[]{
  const track=String(s.puanTuru||"SAY"),ayt=new Set(TRACK_AYT[track]??TRACK_AYT.SAY);
  return curriculum().filter(c=>c.exam==="TYT"||ayt.has(c.name));
}
function topicState(s:Loose,k:string,due:Set<string>,openWrong:Set<string>):TopicState{
  const t=s.topics?.[k],[,subj,topic]=k.split("|");
  if(due.has(k)||openWrong.has((canonical(subj)+"|"+topic).toLocaleLowerCase("tr-TR")))return "review";
  const st=num(t?.st);return st===3?"done":st>0?"active":"missing";
}
function openWrongSet():Set<string>{return new Set(errorRows().filter(r=>!r.resolved).map(r=>(canonical(r.subject)+"|"+r.topic).toLocaleLowerCase("tr-TR")));}
function subjectRows(s:Loose,r:Range):SubjectRow[]{
  const subjects=trackSubjects(s),rows=new Map<string,SubjectRow>(),due=new Set(dueReviews().map(x=>String(x.key))),wrongSet=openWrongSet();
  const ensure=(name:string)=>{let row=rows.get(name);if(!row){row={name,minutes:0,questions:0,done:0,total:0,tyt:null,tytLabel:"",ayt:null,openWrong:0,topWrong:"",samples:0};rows.set(name,row);}return row;};
  for(const c of subjects){const row=ensure(canonical(c.name));for(const topic of c.topics){row.total++;if(num(s.topics?.[`${c.exam}|${c.name}|${topic}`]?.st)===3)row.done++;}}
  for(const k of daysIn(r)){
    for(const [name,v] of Object.entries(s.pomoSubj?.[k]??{})){const n=canonical(name);if(rows.has(n))rows.get(n)!.minutes+=Math.max(0,num(v));}
    for(const [tk,v] of Object.entries(s.solvedTopic?.[k]??{})){const n=canonical(String(tk).split("|")[1]);if(rows.has(n))rows.get(n)!.questions+=Math.max(0,num(v));}
  }
  const tyt=analyzeExams(s as never,"TYT",10),ayt=analyzeExams(s as never,"AYT",10);
  const tytMap=new Map(tyt.subjects.map(x=>[x.name,x])),aytMap=new Map(ayt.subjects.map(x=>[x.name,x]));
  const wrongCount=new Map<string,Map<string,number>>();
  for(const w of errorRows())if(!w.resolved){const n=canonical(w.subject),m=wrongCount.get(n)??new Map<string,number>();m.set(w.topic,(m.get(w.topic)??0)+w.n);wrongCount.set(n,m);}
  for(const row of rows.values()){
    const t=TYT_ROW[row.name]?tytMap.get(TYT_ROW[row.name]!):undefined,a=AYT_ROW[row.name]?aytMap.get(AYT_ROW[row.name]!):undefined;
    if(t){row.tyt=t.successPercent;row.tytLabel=ROW_SHORT[t.name]||t.name;row.samples=t.samples;}
    if(a){row.ayt=a.successPercent;row.samples=Math.max(row.samples,a.samples);}
    const m=wrongCount.get(row.name);if(m){for(const n of m.values())row.openWrong+=n;row.topWrong=[...m.entries()].sort((x,y)=>y[1]-x[1])[0]?.[0]??"";}
  }
  return [...rows.values()].sort((a,b)=>b.minutes-a.minutes||b.questions-a.questions||b.openWrong-a.openWrong||a.name.localeCompare(b.name,"tr"));
}

/* ---------- iskelet ---------- */
function ensureSkeleton():HTMLElement|null{
  const root=byId("progress");if(!root)return null;
  let hub=byId("progressHub");
  if(!hub){
    hub=document.createElement("div");hub.id="progressHub";hub.className="ph-hub";hub.dataset.progressHub="";
    hub.addEventListener("click",onClick);
    root.dataset.progressHub="ready";
  }
  const back=root.querySelector<HTMLElement>(":scope > .rb-back");
  if(back&&root.firstElementChild!==back)root.prepend(back);
  if(hub.previousElementSibling!==(back||null)||hub.parentElement!==root){if(back)back.after(hub);else root.prepend(hub);}
  arrangeLegacy();
  return hub;
}
function arrangeLegacy():void{
  const details=byId<HTMLDetailsElement>("refinedProgressDetails");
  const summary=details?.querySelector("summary");if(summary&&!summary.dataset.v74){summary.dataset.v74="1";summary.textContent="Diğer raporlar";}
  if(!details)return;
  for(const id of ["v4ProgressOverview"])byId(id)?.classList.add("ph-dup");
  details.querySelector(".progress-head")?.classList.add("ph-dup");
  details.querySelector(".progress-stats")?.classList.add("ph-dup");
  for(const h of Array.from(details.querySelectorAll<HTMLElement>("h2"))){
    if(!DUP_TITLES.has(h.textContent?.trim()||""))continue;
    const section=h.parentElement;if(section&&section.tagName==="SECTION")section.classList.add("ph-dup");else{h.classList.add("ph-dup");(h.nextElementSibling as HTMLElement|null)?.classList.add("ph-dup");}
  }
  for(const section of Array.from(details.querySelectorAll<HTMLElement>("section")))if(section.querySelector("h2")&&!section.querySelector(".card"))section.classList.add("ph-dup");
  // İç "Ayrıntılı analizleri göster" açılır kutusu düzleşir; iki kez dokunmak gerekmez.
  const inner=details.querySelector<HTMLDetailsElement>("details.v28-more");if(inner&&!inner.open)inner.open=true;
  // Rapor kartları süzgeçli bölüme taşınır; kimlikleri aynı kaldığı için eski çizim aynı yere yazar.
  for(const [code,,id] of REPORTS){
    const card=byId(id),pane=byId(`phReport-${code}`);if(!card||!pane||card.parentElement===pane)continue;
    const section=card.parentElement;pane.append(card);if(section&&section.tagName==="SECTION"&&!section.querySelector(".card"))section.classList.add("ph-dup");
  }
}

/* ---------- çizim ---------- */
function tiles(s:Loose,cur:Range,prev:Range):string{
  const tile=(label:string,value:string,d:{text:string;tone:string})=>`<div class="ph-tile"><small>${label}</small><b>${value}</b><em class="${d.tone}">${esc(d.text)}</em></div>`;
  const m=sum(s,cur,minutesOn),pm=sum(s,prev,minutesOn),q=sum(s,cur,questionsOn),pq=sum(s,prev,questionsOn),st=settledTopics(s,cur),pst=settledTopics(s,prev);
  let html=tile("Odak",hm(m),deltaText(m,pm,true))+tile("Soru",String(q),deltaText(q,pq));
  if(period==="gun"){
    const done=reviewsDoneOn(s,cur.to),due=dueReviews().length;
    html+=`<div class="ph-tile"><small>Tekrar</small><b>${done} / ${done+due}</b><em class="${due?"down":"up"}">${due?due+" bekliyor":"hepsi tamam"}</em></div>`;
  }else{
    const a=activeDays(s,cur),total=daysIn(cur).length,sk=streak(s);
    html+=`<div class="ph-tile"><small>Aktif gün</small><b>${a} / ${total}</b><em class="${sk?"up":""}">${sk?sk+" günlük seri":"seri yok"}</em></div>`;
  }
  return html+tile("Pekişen konu",String(st),deltaText(st,pst));
}
function chart(s:Loose):string{
  const today=todayKey(),fn=metric==="min"?minutesOn:questionsOn,fmt=(v:number)=>metric==="min"?short(v):String(Math.round(v));
  let bars:{label:string;cur:number;prev:number;now:boolean;future:boolean}[]=[];
  if(period==="ay"){
    const t=parse(today),last=new Date(t.getFullYear(),t.getMonth()+1,0).getDate(),pmLast=new Date(t.getFullYear(),t.getMonth(),0).getDate();
    for(let start=1,i=1;start<=last;start+=7,i++){
      const end=Math.min(last,start+6),dayKey=(m:number,d:number)=>key(new Date(t.getFullYear(),t.getMonth()+m,d));
      let cur=0,prev=0;for(let d=start;d<=end;d++){const k=dayKey(0,d);if(k<=today)cur+=fn(s,k);if(d<=pmLast)prev+=fn(s,dayKey(-1,d));}
      bars.push({label:`${i}. hf`,cur,prev,now:today>=dayKey(0,start)&&today<=dayKey(0,end),future:dayKey(0,start)>today});
    }
  }else{
    const start=period==="hafta"?mondayOf(today):add(today,-6);
    for(let i=0;i<7;i++){const k=add(start,i);bars.push({label:DAY_SHORT[parse(k).getDay()]!,cur:k<=today?fn(s,k):0,prev:fn(s,add(k,-7)),now:k===today,future:k>today});}
  }
  const max=Math.max(1,...bars.flatMap(b=>[b.cur,b.prev]));
  const label=period==="ay"?["Bu ay","Geçen ay"]:period==="hafta"?["Bu hafta","Geçen hafta"]:["Son 7 gün","Bir hafta önce"];
  return `<div class="card ph-chart"><div class="ph-head"><b>${period==="ay"?"Haftalık çalışma":"Günlük çalışma"}</b><span class="ph-mini" role="group" aria-label="Grafik ölçüsü"><button type="button" data-metric="min" aria-pressed="${metric==="min"}">Odak</button><button type="button" data-metric="q" aria-pressed="${metric==="q"}">Soru</button></span></div>
    <div class="ph-bars" style="grid-template-columns:repeat(${bars.length},minmax(0,1fr))" role="img" aria-label="${esc(label[0]+": "+bars.map(b=>b.label+" "+fmt(b.cur)).join(", "))}">${bars.map(b=>`<div class="ph-bar${b.now?" is-now":""}${b.future?" is-future":""}"><s style="height:${b.prev/max*100}%"></s><i style="height:${b.future?0:Math.max(b.cur?3:0,b.cur/max*100)}%"></i><u style="bottom:calc(${b.future?0:b.cur/max*100}% + 3px)">${b.future||!b.cur?"":fmt(b.cur)}</u></div>`).join("")}</div>
    <div class="ph-labels" style="grid-template-columns:repeat(${bars.length},minmax(0,1fr))">${bars.map(b=>`<span>${b.label}</span>`).join("")}</div>
    <div class="ph-legend"><span><i class="cur"></i>${label[0]}</span><span><i class="prev"></i>${label[1]}</span></div></div>`;
}
function subjectsCard(rows:SubjectRow[]):string{
  const active=rows.filter(r=>r.minutes||r.questions||r.openWrong);
  const list=allSubjects?rows:(active.length?active:rows.filter(r=>r.tyt!=null||r.ayt!=null)).slice(0,8),hidden=rows.length-list.length;
  return `<div class="card ph-subjects"><div class="ph-head"><b>Dersler</b><small>${allSubjects?"tüm dersler":"bu dönem çalıştıkların"} · dokun: konular</small></div>${list.map(r=>{
    const pct=r.total?Math.round(r.done/r.total*100):0,chips=[r.questions?`<span>${r.questions} soru</span>`:"",`<span>Konu ${r.done}/${r.total}</span>`,r.tyt!=null?`<span class="x">TYT ${esc(r.tytLabel)} %${r.tyt}</span>`:"",r.ayt!=null?`<span class="x">AYT %${r.ayt}</span>`:"",r.openWrong?`<span class="w">${r.openWrong} açık yanlış</span>`:""].join("");
    return `<button type="button" class="ph-subj" data-subject="${esc(r.name)}"><span class="ph-subj-top"><b>${esc(r.name)}</b><small>${r.minutes?hm(r.minutes):"—"}</small></span><span class="ph-prog" aria-label="Konuların %${pct}'i tamamlandı"><i style="width:${pct}%"></i></span><span class="ph-chips">${chips}</span></button>`;
  }).join("")||'<p class="hint">Ders çalıştıkça burada görünür.</p>'}${hidden>0||allSubjects?`<button type="button" class="ph-more" data-all-subjects>${allSubjects?"Yalnız çalıştıklarım":`Tüm dersler (${hidden} daha)`}</button>`:""}</div>`;
}
function topicsCard(s:Loose):string{
  const due=dueReviews(),dueKeys=new Set(due.map(x=>String(x.key))),wrongSet=openWrongSet(),counts={done:0,review:0,active:0,missing:0};
  for(const c of trackSubjects(s))for(const topic of c.topics)counts[topicState(s,`${c.exam}|${c.name}|${topic}`,dueKeys,wrongSet)]++;
  const rows=due.slice(0,3).map(x=>{const late=num(x.late),label=`${num(x.gap)}. gün tekrarı · ${late>0?late+" gün gecikti":"bugün"}`;return `<div class="ph-rev"><div><b>${esc(String(x.subj||"")+" · "+String(x.topic||""))}</b><small class="${late>0?"late":""}">${esc(label)}</small></div><button type="button" class="btn ghost tiny" data-review="${esc(x.key)}" data-gi="${esc(x.gi)}">Yaptım</button></div>`;}).join("");
  return `<div class="card ph-topics"><div class="ph-head"><b>Konular</b><button type="button" class="ph-link" data-go="topics">Tümü ›</button></div>
    <div class="ph-states"><span class="s-done">Tamamlandı<b>${counts.done}</b></span><span class="s-review">Tekrar gerekli<b>${counts.review}</b></span><span>Devam ediyor<b>${counts.active}</b></span><span>Eksik<b>${counts.missing}</b></span></div>
    ${rows?`<div class="ph-revs">${rows}${due.length>3?`<p class="hint">${due.length-3} tekrar daha bekliyor.</p>`:""}</div>`:'<p class="hint">Bugün tekrarı gelen konu yok.</p>'}</div>`;
}
function attentionCard(s:Loose,rows:SubjectRow[]):string{
  const {cur,prev}=ranges("hafta");
  const scored=rows.filter(r=>(r.samples>=2&&(r.tyt!=null||r.ayt!=null))||r.openWrong>=3).map(r=>({r,risk:(100-Math.min(r.tyt??100,r.ayt??100))+r.openWrong*2})).sort((a,b)=>b.risk-a.risk);
  const top=scored[0];if(!top||top.risk<50)return "";
  const r=top.r,minutesNow=daysIn(cur).reduce((t,k)=>t+Math.max(0,num(Object.entries(s.pomoSubj?.[k]??{}).filter(([n])=>canonical(n)===r.name).reduce((x,[,v])=>x+num(v),0))),0);
  const minutesPrev=daysIn(prev).reduce((t,k)=>t+Math.max(0,num(Object.entries(s.pomoSubj?.[k]??{}).filter(([n])=>canonical(n)===r.name).reduce((x,[,v])=>x+num(v),0))),0);
  const parts:string[]=[];
  const pct=r.tyt!=null?`TYT ${r.tytLabel} %${r.tyt}`:r.ayt!=null?`AYT %${r.ayt}`:"";
  if(pct&&r.samples)parts.push(`${r.samples} denemede ${pct} başarı`);
  if(r.openWrong)parts.push(`${r.openWrong} açık yanlış${r.topWrong?` (en çok ${r.topWrong})`:""}`);
  let time=minutesNow?`Bu hafta ${hm(minutesNow)} çalıştın`:"Bu hafta bu derse çalışma kaydı yok";
  if(minutesNow&&minutesPrev&&minutesNow!==minutesPrev)time+=`; geçen haftadan ${hm(Math.abs(minutesNow-minutesPrev))} ${minutesNow<minutesPrev?"az":"fazla"}`;
  return `<div class="card ph-alert-card"><div class="ph-head"><b>Dikkat</b></div><div class="ph-alert"><b>${esc(r.name)}</b><p>${esc(parts.join(", "))}. ${esc(time)}.</p>
    <div class="ph-alert-btns"><button type="button" class="btn green tiny" data-plan="${esc((r.name+" "+(r.topWrong||"")).trim()+" tekrar")}">Programa ekle</button><button type="button" class="btn ghost tiny" data-errors="1">Hatalara git</button></div></div></div>`;
}
function reportsCard():string{
  return `<div class="card ph-reports"><div class="ph-head"><b>Raporlar</b></div><div class="ph-report-chips" role="tablist" aria-label="Raporlar">${REPORTS.map(([code,label])=>`<button type="button" role="tab" data-report="${code}" aria-selected="${report===code}">${label}</button>`).join("")}</div>
    ${REPORTS.map(([code])=>`<div class="ph-report" id="phReport-${code}" role="tabpanel"${report===code?"":" hidden"}></div>`).join("")}</div>`;
}
function render():void{
  const hub=ensureSkeleton();if(!hub)return;
  const s=state(),{cur,prev}=ranges(period);
  // Rapor kartları taşındıysa yeniden çizimde kaybolmasın diye önce geri alınır.
  const parked=document.createDocumentFragment();for(const [,,id] of REPORTS){const card=byId(id);if(card&&hub.contains(card))parked.append(card);}
  const rows=subjectRows(s,cur);
  hub.innerHTML=`<header class="ph-title"><h1>İlerleme</h1><p>Ne kadar çalıştın, nerede ilerledin, neye odaklanmalısın.</p></header>
    <div class="ph-period" role="tablist" aria-label="Dönem">${(Object.keys(PERIOD_LABEL) as Period[]).map(p=>`<button type="button" role="tab" data-period="${p}" aria-selected="${period===p}">${PERIOD_LABEL[p]}</button>`).join("")}</div>
    <p class="ph-vs">${VS_TEXT[period]}</p>
    <div class="ph-tiles">${tiles(s,cur,prev)}</div>
    ${chart(s)}${subjectsCard(rows)}${topicsCard(s)}${attentionCard(s,rows)}
    <button type="button" class="card ph-exam-link" data-go="deneme"><b>Deneme gelişimi</b><small>Deneme sekmesinde ›</small></button>
    ${reportsCard()}`;
  for(const [code,,id] of REPORTS){const card=parked.querySelector<HTMLElement>(`#${id}`)||byId(id),pane=byId(`phReport-${code}`);if(card&&pane)pane.append(card);}
  arrangeLegacy();
  if(openSubject)renderSubjectSheet(openSubject);
}
function schedule():void{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;if(byId("progress")?.classList.contains("active")||openSubject)render();});}

/* ---------- ders sayfası ---------- */
function renderSubjectSheet(name:string):void{
  let sheet=byId("phSubjectSheet");
  if(!sheet){
    sheet=document.createElement("div");sheet.id="phSubjectSheet";sheet.className="ph-sheet";sheet.setAttribute("role","dialog");sheet.setAttribute("aria-modal","true");sheet.setAttribute("aria-labelledby","phSubjectTitle");
    sheet.addEventListener("click",event=>{const t=event.target as HTMLElement;if(t===sheet||t.closest("[data-close]")){closeSubject();return;}onClick(event);});
    sheet.addEventListener("keydown",event=>{if(event.key==="Escape")closeSubject();});
    document.body.append(sheet);
  }
  const s=state(),{cur}=ranges(period),row=subjectRows(s,cur).find(r=>r.name===name),due=new Set(dueReviews().map(x=>String(x.key))),wrongSet=openWrongSet();
  const groups=trackSubjects(s).filter(c=>canonical(c.name)===name);
  const label:Record<TopicState,string>={done:"Tamamlandı",review:"Tekrar gerekli",active:"Devam ediyor",missing:"Eksik"};
  const order:Record<TopicState,number>={review:0,active:1,missing:2,done:3};
  const topicHtml=groups.map(c=>{
    const items=c.topics.map(topic=>({topic,state:topicState(s,`${c.exam}|${c.name}|${topic}`,due,wrongSet)})).sort((a,b)=>order[a.state]-order[b.state]);
    return `<div class="card"><div class="ph-head"><b>${esc(c.exam)} konuları</b><small>${c.topics.filter(topic=>num(s.topics?.[`${c.exam}|${c.name}|${topic}`]?.st)===3).length} / ${items.length} pekişti</small></div>${items.map(x=>`<button type="button" class="ph-topic" data-topic="${esc(c.exam+"|"+c.name+"|"+x.topic)}"><span>${esc(x.topic)}</span><span class="ph-tag t-${x.state}">${label[x.state]}</span></button>`).join("")}</div>`;
  }).join("");
  const weeks:number[]=[];const mon=mondayOf(todayKey());
  for(let w=3;w>=0;w--){let m=0;for(let i=0;i<7;i++){const k=add(mon,-7*w+i);for(const [n,v] of Object.entries(s.pomoSubj?.[k]??{}))if(canonical(n)===name)m+=Math.max(0,num(v));}weeks.push(m);}
  const max=Math.max(1,...weeks);
  const pct=row?.tyt!=null?`%${row.tyt}`:row?.ayt!=null?`%${row.ayt}`:"—";
  sheet.innerHTML=`<div class="ph-sheet-box"><div class="ph-sheet-head"><h3 id="phSubjectTitle">${esc(name)}</h3><button type="button" class="ph-x" data-close aria-label="Kapat">×</button></div><div class="ph-sheet-body">
    <div class="ph-top3"><span>${PERIOD_LABEL[period]}<b>${row?.minutes?hm(row.minutes):"—"}</b></span><span>Soru<b>${row?.questions??0}</b></span><span>Deneme<b>${pct}</b></span></div>
    <div class="card"><div class="ph-head"><b>Son 4 hafta</b><small>odak süresi</small></div><div class="ph-bars small" style="grid-template-columns:repeat(4,minmax(0,1fr))">${weeks.map((m,i)=>`<div class="ph-bar${i===3?" is-now":""}"><i style="height:${Math.max(m?3:0,m/max*100)}%"></i><u style="bottom:calc(${m/max*100}% + 3px)">${m?short(m):""}</u></div>`).join("")}</div><div class="ph-labels" style="grid-template-columns:repeat(4,minmax(0,1fr))"><span>3 hf önce</span><span>2 hf önce</span><span>geçen hf</span><span>bu hafta</span></div></div>
    ${topicHtml||'<p class="hint">Bu ders için konu listesi bulunamadı.</p>'}</div></div>`;
  if(sheet.hidden!==false||!sheet.classList.contains("open")){sheet.hidden=false;sheet.classList.add("open");document.documentElement.classList.add("ph-sheet-open");sheet.querySelector<HTMLElement>("[data-close]")?.focus();}
}
function closeSubject():void{const sheet=byId("phSubjectSheet");openSubject="";if(!sheet)return;sheet.hidden=true;sheet.classList.remove("open");document.documentElement.classList.remove("ph-sheet-open");}

function onClick(event:Event):void{
  const t=event.target as HTMLElement;
  const p=t.closest<HTMLElement>("[data-period]");if(p){period=p.dataset.period as Period;try{localStorage.setItem(PERIOD_KEY,period);}catch{}render();return;}
  const m=t.closest<HTMLElement>("[data-metric]");if(m){metric=m.dataset.metric==="q"?"q":"min";render();return;}
  const r=t.closest<HTMLElement>("[data-report]");if(r){report=r.dataset.report||"rek";for(const b of Array.from(document.querySelectorAll<HTMLElement>("#progressHub [data-report]")))b.setAttribute("aria-selected",String(b===r));for(const [code] of REPORTS){const pane=byId(`phReport-${code}`);if(pane)pane.hidden=code!==report;}return;}
  if(t.closest("[data-all-subjects]")){allSubjects=!allSubjects;render();return;}
  const subj=t.closest<HTMLElement>("[data-subject]");if(subj){openSubject=subj.dataset.subject||"";renderSubjectSheet(openSubject);return;}
  const rev=t.closest<HTMLElement>("[data-review]");if(rev){call("doReview",rev.dataset.review,num(rev.dataset.gi));call("toast","Tekrar tamamlandı ✓");render();return;}
  const plan=t.closest<HTMLElement>("[data-plan]");if(plan){call("addToToday",plan.dataset.plan);call("toast","Bugünün programına eklendi ✓");return;}
  if(t.closest("[data-errors]")){closeSubject();openExamTab("hata");return;}
  const topic=t.closest<HTMLElement>("[data-topic]");if(topic){const [exam,subjName,name]=String(topic.dataset.topic).split("|");closeSubject();call("go","topics");setTimeout(()=>call("openTopicDetail",exam,subjName,name),80);return;}
  const go=t.closest<HTMLElement>("[data-go]");if(go){call("go",go.dataset.go);}
}

export function installProgressHubV74():boolean{
  if(installed)return true;if(!ensureSkeleton())return false;installed=true;
  for(const event of ["yks:data-changed","yks:data-primary-ready"])window.addEventListener(event,schedule);
  const onNav=(event:Event)=>{const d=(event as CustomEvent<{screen?:string;to?:string}>).detail;if((d?.screen??d?.to)==="progress")queueMicrotask(render);};
  window.addEventListener("yks:navigation-after",onNav);document.addEventListener("yks:navigation-after",onNav);
  window.addEventListener("yks:screen-render-after",event=>{if((event as CustomEvent<{screen?:string}>).detail?.screen==="progress")schedule();});
  render();document.documentElement.dataset.progressHubV74="ready";
  return true;
}
