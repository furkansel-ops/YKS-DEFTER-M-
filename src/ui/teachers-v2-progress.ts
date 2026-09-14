import "./teachers-v2-progress.css";

type WatchedRecord={
  at?:number;
  title?:string;
  subj?:string;
  topic?:string;
  ch?:string;
  hoca?:string;
};
type ProgressRow={id:string;at:number;teacher:string;subject:string;title:string};
type LegacyWindow=Window&{watchedMap?:()=>Record<string,WatchedRecord>};
type RankedItem={name:string;count:number};

const legacy=window as LegacyWindow;
const ROOT_ID="teachersV2Root";
const PANEL_ID="teachersV2Progress";
const DAY_MS=86_400_000;
let observer:MutationObserver|null=null;
let lastSignature="";
let installed=false;

function esc(value:unknown):string{
  return String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function watchedRows():ProgressRow[]{
  let map:Record<string,WatchedRecord>={};
  try{
    const value=legacy.watchedMap?.();
    if(value&&typeof value==="object"&&!Array.isArray(value))map=value;
  }catch{}
  return Object.entries(map)
    .map(([id,item])=>({
      id,
      at:Number(item?.at||0),
      teacher:String(item?.hoca||"").trim(),
      subject:String(item?.subj||"").trim(),
      title:String(item?.title||"").trim()
    }))
    .filter(row=>row.teacher&&Number.isFinite(row.at)&&row.at>0)
    .sort((a,b)=>b.at-a.at);
}

function startOfToday(now=Date.now()):number{
  const date=new Date(now);
  date.setHours(0,0,0,0);
  return date.getTime();
}

function periodStart(days:number,now=Date.now()):number{
  return startOfToday(now)-Math.max(0,days-1)*DAY_MS;
}

function dayKey(at:number):string{
  const date=new Date(at);
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,"0");
  const d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

function rank(rows:ProgressRow[],key:(row:ProgressRow)=>string):RankedItem[]{
  const counts=new Map<string,number>();
  rows.forEach(row=>{
    const value=key(row).trim();
    if(!value)return;
    counts.set(value,(counts.get(value)||0)+1);
  });
  return [...counts.entries()]
    .map(([name,count])=>({name,count}))
    .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,"tr"));
}

function relativeTime(at:number):string{
  const diff=Math.max(0,Date.now()-at);
  const minute=60_000,hour=60*minute,day=24*hour;
  if(diff<minute)return "az önce";
  if(diff<hour)return `${Math.max(1,Math.floor(diff/minute))} dk önce`;
  if(diff<day)return `${Math.max(1,Math.floor(diff/hour))} sa önce`;
  return `${Math.max(1,Math.floor(diff/day))} gün önce`;
}

function trendText(current:number,previous:number):string{
  const delta=current-previous;
  if(delta>0)return `Önceki 7 güne göre +${delta}`;
  if(delta<0)return `Önceki 7 güne göre ${delta}`;
  return previous||current?"Önceki 7 günle aynı":"Yeni takip dönemi";
}

function sevenDaySeries(rows:ProgressRow[],now=Date.now()):{label:string;count:number;date:string}[]{
  const today=startOfToday(now);
  const counts=new Map<string,number>();
  rows.forEach(row=>counts.set(dayKey(row.at),(counts.get(dayKey(row.at))||0)+1));
  const formatter=new Intl.DateTimeFormat("tr-TR",{weekday:"short"});
  return Array.from({length:7},(_,index)=>{
    const at=today-(6-index)*DAY_MS;
    const date=new Date(at);
    const key=dayKey(at);
    return {label:formatter.format(date).replace(".",""),count:counts.get(key)||0,date:key};
  });
}

function progressSignature(rows:ProgressRow[]):string{
  return rows.slice(0,250).map(row=>`${row.id}:${row.at}:${row.teacher}:${row.subject}`).join("|");
}

function ensurePanel():HTMLElement|null{
  const root=document.getElementById(ROOT_ID);
  if(!(root instanceof HTMLElement))return null;
  let panel=document.getElementById(PANEL_ID);
  if(!(panel instanceof HTMLElement)){
    panel=document.createElement("section");
    panel.id=PANEL_ID;
    panel.className="teachers-v2-progress";
    panel.setAttribute("aria-label","Video ilerlemem");
    const library=document.getElementById("teachersV2Library");
    const hero=root.querySelector(".teachers-v2-hero");
    if(library?.parentElement===root)library.insertAdjacentElement("afterend",panel);
    else if(hero)hero.insertAdjacentElement("afterend",panel);
    else root.prepend(panel);
  }
  return panel;
}

function rankingHtml(items:RankedItem[],total:number,empty:string):string{
  if(!items.length)return `<div class="teachers-v2-progress-empty-row">${esc(empty)}</div>`;
  const max=Math.max(1,...items.map(item=>item.count));
  return items.slice(0,5).map((item,index)=>{
    const width=Math.max(8,Math.round(item.count/max*100));
    const share=total?Math.round(item.count/total*100):0;
    return `<div class="teachers-v2-progress-rank">
      <span class="teachers-v2-progress-rank-no">${index+1}</span>
      <div class="teachers-v2-progress-rank-main"><div><b>${esc(item.name)}</b><small>${item.count} video · %${share}</small></div><i><em style="width:${width}%"></em></i></div>
    </div>`;
  }).join("");
}

function render(force=false):void{
  const panel=ensurePanel();
  if(!panel)return;
  const rows=watchedRows();
  const signature=progressSignature(rows);
  if(!force&&signature===lastSignature)return;
  lastSignature=signature;

  if(!rows.length){
    panel.innerHTML=`<div class="teachers-v2-progress-head"><div><span>Kişisel takip</span><h3>Video ilerlemem</h3></div><small>Salt okunur · İzledim kayıtlarından</small></div><div class="teachers-v2-progress-empty"><b>İzleme geçmişin henüz oluşmadı.</b><span>Bir hocanın videosuna “İzledim” dediğinde 7/30 günlük ilerlemen, hoca dağılımın ve ders yoğunluğun burada otomatik hesaplanacak.</span></div>`;
    return;
  }

  const now=Date.now();
  const start7=periodStart(7,now);
  const start30=periodStart(30,now);
  const previous7Start=periodStart(14,now);
  const rows7=rows.filter(row=>row.at>=start7);
  const rows30=rows.filter(row=>row.at>=start30);
  const previous7=rows.filter(row=>row.at>=previous7Start&&row.at<start7);
  const activeDays=new Set(rows30.map(row=>dayKey(row.at))).size;
  const teacherRanks=rank(rows30,row=>row.teacher);
  const subjectRanks=rank(rows30,row=>row.subject||"Ders belirtilmemiş");
  const teacherCount=new Set(rows30.map(row=>row.teacher)).size;
  const series=sevenDaySeries(rows7,now);
  const maxDay=Math.max(1,...series.map(item=>item.count));
  const last=rows[0];

  panel.innerHTML=`<div class="teachers-v2-progress-head">
      <div><span>Kişisel takip</span><h3>Video ilerlemem</h3></div>
      <small>Salt okunur · İzledim kayıtlarından</small>
    </div>
    <div class="teachers-v2-progress-metrics">
      <article><span>Son 7 gün</span><b>${rows7.length}</b><small>${esc(trendText(rows7.length,previous7.length))}</small></article>
      <article><span>Son 30 gün</span><b>${rows30.length}</b><small>${rows.length} toplam izlenen</small></article>
      <article><span>Aktif gün</span><b>${activeDays}</b><small>Son 30 gün içinde</small></article>
      <article><span>Hoca çeşitliliği</span><b>${teacherCount}</b><small>Son 30 gün içinde</small></article>
    </div>
    <div class="teachers-v2-progress-grid">
      <section class="teachers-v2-progress-chart"><div class="teachers-v2-progress-subhead"><div><h4>Son 7 gün</h4><span>Günlük izlenen video</span></div><b>${rows7.length}</b></div><div class="teachers-v2-progress-bars">${series.map(item=>{const height=item.count?Math.max(14,Math.round(item.count/maxDay*100)):4;return `<div class="teachers-v2-progress-day" title="${esc(item.date)} · ${item.count} video"><span>${item.count||""}</span><i><em style="height:${height}%"></em></i><small>${esc(item.label)}</small></div>`;}).join("")}</div></section>
      <section class="teachers-v2-progress-ranking"><div class="teachers-v2-progress-subhead"><div><h4>En çok izlediğin hocalar</h4><span>Son 30 gün</span></div></div>${rankingHtml(teacherRanks,rows30.length,"Son 30 günde hoca verisi yok.")}</section>
      <section class="teachers-v2-progress-ranking"><div class="teachers-v2-progress-subhead"><div><h4>Ders yoğunluğu</h4><span>Son 30 gün</span></div></div>${rankingHtml(subjectRanks,rows30.length,"Son 30 günde ders verisi yok.")}</section>
    </div>
    <div class="teachers-v2-progress-last"><span>Son hareket</span><b>${esc(last.teacher)}</b><small>${esc(last.title||"İzlenen video")} · ${esc(relativeTime(last.at))}</small></div>`;
}

function install():void{
  if(installed)return;
  installed=true;
  const root=document.getElementById(ROOT_ID);
  if(root){
    observer=new MutationObserver(()=>render(false));
    observer.observe(root,{childList:true,subtree:true});
  }
  window.addEventListener("yks:teachers-v2-watched-change",()=>{lastSignature="";render(true);});
  window.addEventListener("storage",event=>{if(event.key==="yks"){lastSignature="";render(true);}});
  window.addEventListener("yks:data-primary-ready",()=>{lastSignature="";render(true);});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){lastSignature="";render(true);}});
  document.documentElement.dataset.teachersV2Progress="ready";
  render(true);
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();

export {};