import "./paragraph-problem-tracker.css";

type Kind="paragraph"|"problem";
type Entry={id:string;date:string;kind:Kind;correct:number;wrong:number;blank:number;createdAt:number};
type Tracker={entries:Entry[]};
type Metrics=ReturnType<typeof metrics>;
type HistoryKind="all"|Kind;
type HistoryRange=7|30|3650;
type AppWindow=Window&{
  S?:Record<string,unknown>&{paragraphProblem?:Tracker};
  save?:()=>boolean;
  toast?:(message:string)=>void;
  go?:(screen:string)=>unknown;
  renderParagraphProblemTracker?:()=>void;
};

const SCREEN_ID="pp";
const ROOT_ID="paragraphProblemTracker";
const win=window as AppWindow;
const ESCAPE_MAP:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"};
let historyKind:HistoryKind="all";
let historyRange:HistoryRange=30;

function keyOf(d:Date):string{
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function todayKey():string{return keyOf(new Date());}
function dayKeyOffset(offset:number):string{
  const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return keyOf(d);
}
function safeInt(value:unknown):number{
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(0,Math.min(999,n)):0;
}
function state():Tracker|null{
  const root=win.S;if(!root)return null;
  const current=root.paragraphProblem;
  if(!current||!Array.isArray(current.entries))root.paragraphProblem={entries:[]};
  const tracker=root.paragraphProblem as Tracker;
  tracker.entries=tracker.entries
    .filter(item=>item&&typeof item.id==="string"&&(item.kind==="paragraph"||item.kind==="problem")&&typeof item.date==="string")
    .map(item=>({...item,correct:safeInt(item.correct),wrong:safeInt(item.wrong),blank:safeInt(item.blank),createdAt:Number(item.createdAt)||Date.now()}))
    .slice(-2000);
  return tracker;
}
function persist():void{
  try{
    const ok=win.save?.();
    if(ok===false)win.toast?.("Kayıt cihazda saklanamadı");
  }catch(error){
    console.error("Paragraf/problem kaydı saklanamadı",error);
    win.toast?.("Kayıt sırasında hata oluştu");
  }
}
function netOf(e:Entry):number{return e.correct-e.wrong/4;}
function totals(entries:Entry[]){
  return entries.reduce((a,e)=>{a.correct+=e.correct;a.wrong+=e.wrong;a.blank+=e.blank;return a;},{correct:0,wrong:0,blank:0});
}
function metrics(entries:Entry[]){
  const s=totals(entries),total=s.correct+s.wrong+s.blank,net=s.correct-s.wrong/4,accuracy=total?100*s.correct/total:0,wrongRate=total?100*s.wrong/total:0,blankRate=total?100*s.blank/total:0;
  return {...s,total,net,accuracy,wrongRate,blankRate,sessions:entries.length};
}
function fmtNet(n:number):string{return Number.isInteger(n)?String(n):n.toFixed(2).replace(".",",");}
function fmtPct(n:number,digits=0):string{return `${n.toFixed(digits).replace(".",",")}%`;}
function fmtSigned(n:number,suffix=""):string{
  if(Math.abs(n)<.005)return `0${suffix}`;
  return `${n>0?"+":""}${n.toFixed(1).replace(".",",")}${suffix}`;
}
function escapeHtml(value:string):string{return value.replace(/[&<>'"]/g,ch=>ESCAPE_MAP[ch]??ch);}
function dateLabel(key:string,weekday=false):string{
  const [ys,ms,ds]=key.split("-"),y=Number(ys||0),m=Number(ms||0),d=Number(ds||0),dt=new Date(y,m-1,d);
  return y&&m&&d&&Number.isFinite(dt.getTime())?dt.toLocaleDateString("tr-TR",weekday?{weekday:"short",day:"2-digit",month:"short"}:{day:"2-digit",month:"short"}):key;
}
function entryId():string{
  return globalThis.crypto&&typeof globalThis.crypto.randomUUID==="function"
    ?globalThis.crypto.randomUUID()
    :`pp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}
function lastDays(count:number,endOffset=0):string[]{
  const out:string[]=[];
  for(let i=count-1;i>=0;i--)out.push(dayKeyOffset(endOffset-i));
  return out;
}
function entriesForDays(entries:Entry[],days:number,endOffset=0):Entry[]{
  const keys=new Set(lastDays(days,endOffset));return entries.filter(e=>keys.has(e.date));
}
function activeDayCount(entries:Entry[]):number{return new Set(entries.filter(e=>e.correct+e.wrong+e.blank>0).map(e=>e.date)).size;}
function currentStreak(entries:Entry[]):number{
  const active=new Set(entries.filter(e=>e.correct+e.wrong+e.blank>0).map(e=>e.date));
  let offset=0;
  if(!active.has(dayKeyOffset(0))&&active.has(dayKeyOffset(-1)))offset=-1;
  if(!active.has(dayKeyOffset(offset)))return 0;
  let streak=0;
  while(streak<3650&&active.has(dayKeyOffset(offset-streak)))streak++;
  return streak;
}
function bestDay(entries:Entry[],days=30):{day:string;m:Metrics}|null{
  const rows=lastDays(days).map(day=>({day,m:metrics(entries.filter(e=>e.date===day))})).filter(x=>x.m.total>0);
  rows.sort((a,b)=>b.m.net-a.m.net||b.m.accuracy-a.m.accuracy||b.m.total-a.m.total);
  return rows[0]||null;
}
function deltaPercent(current:number,previous:number):number|null{
  return previous>0?100*(current-previous)/previous:current>0?null:0;
}
function changeText(current:number,previous:number,unit=""):string{
  const delta=current-previous;
  if(Math.abs(delta)<.005)return `önceki dönemle aynı`;
  return `önceki döneme göre ${fmtSigned(delta,unit)}`;
}
function kindName(kind:Kind):string{return kind==="paragraph"?"Paragraf":"Problem";}
function performanceLevel(accuracy:number,total:number):{label:string;tone:string}{
  if(!total)return {label:"Veri bekleniyor",tone:"neutral"};
  if(accuracy>=90)return {label:"Çok güçlü",tone:"great"};
  if(accuracy>=80)return {label:"İyi",tone:"good"};
  if(accuracy>=70)return {label:"Gelişiyor",tone:"watch"};
  return {label:"Dikkat",tone:"danger"};
}
function insight(entries:Entry[]):string[]{
  const today=metrics(entries.filter(e=>e.date===todayKey()));
  const cur7=metrics(entriesForDays(entries,7)),prev7=metrics(entriesForDays(entries,7,-7));
  const para7=metrics(entriesForDays(entries.filter(e=>e.kind==="paragraph"),7)),prob7=metrics(entriesForDays(entries.filter(e=>e.kind==="problem"),7));
  const signals:string[]=[];
  if(!today.total)signals.push("Bugün henüz kayıt yok. İlk oturumunu eklediğinde günlük performans burada oluşacak.");
  else signals.push(`Bugün ${today.total} soru, ${fmtNet(today.net)} net ve ${fmtPct(today.accuracy)} doğruluk ürettin.`);
  if(cur7.total&&prev7.total){
    const q=deltaPercent(cur7.total,prev7.total)??0;
    signals.push(`Son 7 günlük soru hacmin önceki 7 güne göre ${q>=0?"%":""}${Math.round(q)} değişti; doğruluk farkın ${fmtSigned(cur7.accuracy-prev7.accuracy," puan")}.`);
  }else if(cur7.total)signals.push(`Son 7 günde ${cur7.total} soru çözdün. Önceki dönem verisi oluşunca dönem karşılaştırması açılacak.`);
  if(para7.total&&prob7.total){
    const weak=para7.accuracy===prob7.accuracy?null:para7.accuracy<prob7.accuracy?{name:"Paragraf",m:para7}:{name:"Problem",m:prob7};
    signals.push(weak?`Son 7 günde daha çok dikkat isteyen alan ${weak.name}: ${fmtPct(weak.m.accuracy)} doğruluk.`:"Son 7 günde paragraf ve problem doğrulukların dengeli.");
  }
  const streak=currentStreak(entries);if(streak)signals.push(`Aktif çalışma serin ${streak} gün. Düzenli kayıt, gerçek eğilimi daha net görmeni sağlar.`);
  return signals.slice(0,4);
}
function summaryCard(title:string,value:string,detail:string,tone="neutral"):string{
  return `<article class="pp-kpi pp-tone-${tone}"><span>${title}</span><strong>${value}</strong><small>${detail}</small></article>`;
}
function kindCard(kind:Kind,entries:Entry[]):string{
  const all=entries.filter(e=>e.kind===kind),today=metrics(all.filter(e=>e.date===todayKey())),cur7=metrics(entriesForDays(all,7)),prev7=metrics(entriesForDays(all,7,-7)),cur30=metrics(entriesForDays(all,30)),level=performanceLevel(cur7.accuracy,cur7.total),days=activeDayCount(entriesForDays(all,7));
  return `<article class="pp-kind-card pp-${kind}">
    <div class="pp-kind-head"><div><span class="pp-kind-icon">${kind==="paragraph"?"¶":"∑"}</span><div><small>Çalışma alanı</small><h2>${kindName(kind)}</h2></div></div><span class="pp-level pp-level-${level.tone}">${level.label}</span></div>
    <div class="pp-kind-primary"><div><span>Bugün</span><strong>${today.total}</strong><small>soru · ${fmtNet(today.net)} net</small></div><div><span>7 gün</span><strong>${cur7.total}</strong><small>${fmtPct(cur7.accuracy)} doğruluk</small></div><div><span>30 gün</span><strong>${cur30.total}</strong><small>${fmtNet(cur30.net)} net</small></div></div>
    <div class="pp-kind-detail"><div><span>7 günlük net</span><b>${fmtNet(cur7.net)}</b></div><div><span>Yanlış oranı</span><b>${fmtPct(cur7.wrongRate)}</b></div><div><span>Aktif gün</span><b>${days}/7</b></div><div><span>Doğruluk farkı</span><b>${prev7.total?fmtSigned(cur7.accuracy-prev7.accuracy," puan"):"—"}</b></div></div>
  </article>`;
}

function trackerTemplate():string{return `<div class="pp-page-head"><div><p class="eyebrow">Performans merkezi</p><h1>Paragraf & Problem</h1><p class="lead">Günlük soru takibi, net eğilimi, doğruluk, düzen ve alan karşılaştırması tek ekranda.</p></div><div class="pp-head-badge"><span>YKS hesabı</span><b>4 yanlış = 1 doğru</b></div></div>
<section id="${ROOT_ID}" class="pp-dashboard" aria-label="Paragraf ve problem performans merkezi">
  <section class="card pp-entry-card" aria-labelledby="ppEntryTitle">
    <div class="pp-section-head"><div><p class="eyebrow">Hızlı kayıt</p><h2 id="ppEntryTitle">Bugünkü çalışmanı ekle</h2><p>Her oturumu ayrı kaydedebilirsin; tüm analizler otomatik güncellenir.</p></div><div class="pp-live" data-pp-live aria-live="polite"></div></div>
    <form class="pp-form" data-pp-form novalidate>
      <label>Tarih<input type="date" data-pp-date required></label>
      <label>Tür<select data-pp-kind><option value="paragraph">Paragraf</option><option value="problem">Problem</option></select></label>
      <label class="pp-number">Doğru<input type="number" min="0" max="999" inputmode="numeric" value="0" data-pp-correct></label>
      <label class="pp-number">Yanlış<input type="number" min="0" max="999" inputmode="numeric" value="0" data-pp-wrong></label>
      <label class="pp-number">Boş<input type="number" min="0" max="999" inputmode="numeric" value="0" data-pp-blank></label>
      <button class="btn green pp-submit" type="submit">Kaydı ekle</button>
    </form>
    <div class="pp-total-note" data-pp-form-note>Doğru + yanlış + boş toplamı en az 1 olmalı.</div>
  </section>

  <section class="pp-kpis" data-pp-kpis aria-label="Bugünün özeti"></section>
  <section class="pp-kind-grid" data-pp-kind-grid aria-label="Paragraf ve problem karşılaştırması"></section>

  <section class="pp-main-grid">
    <article class="card pp-chart-card">
      <div class="pp-panel-head"><div><p class="eyebrow">Tempo</p><h2>Son 14 gün</h2></div><span>Soru + doğruluk</span></div>
      <div class="pp-trend" data-pp-trend></div>
      <div class="pp-trend-legend"><span><i></i>Soru hacmi</span><span><i></i>Doğruluk</span></div>
    </article>
    <article class="card pp-signal-card">
      <div class="pp-panel-head"><div><p class="eyebrow">Akıllı özet</p><h2>Performans sinyalleri</h2></div><span>mevcut verinden</span></div>
      <div class="pp-signals" data-pp-signals role="status" aria-live="polite"></div>
    </article>
  </section>

  <section class="pp-stats-grid">
    <article class="card pp-period-card"><div class="pp-panel-head"><div><p class="eyebrow">Dönem karşılaştırması</p><h2>Son 7 gün ↔ önceki 7 gün</h2></div></div><div class="pp-period" data-pp-period></div></article>
    <article class="card pp-rhythm-card"><div class="pp-panel-head"><div><p class="eyebrow">Çalışma düzeni</p><h2>30 günlük ritim</h2></div></div><div class="pp-rhythm" data-pp-rhythm></div></article>
  </section>

  <section class="card pp-daily-card">
    <div class="pp-panel-head"><div><p class="eyebrow">Günlük döküm</p><h2>Son 7 gün</h2></div><span>Paragraf + Problem</span></div>
    <div class="pp-daily-table" data-pp-daily></div>
  </section>

  <section class="card pp-history-card">
    <div class="pp-history-head"><div><p class="eyebrow">Kayıt defteri</p><h2>Geçmiş oturumlar</h2><p>İstersen alan ve dönem filtresiyle kayıtlarını daralt.</p></div><div class="pp-history-filters" aria-label="Geçmiş filtreleri"><div class="pp-segment" data-pp-kind-filter><button type="button" data-kind="all">Tümü</button><button type="button" data-kind="paragraph">Paragraf</button><button type="button" data-kind="problem">Problem</button></div><div class="pp-segment" data-pp-range-filter><button type="button" data-range="7">7 gün</button><button type="button" data-range="30">30 gün</button><button type="button" data-range="3650">Tümü</button></div></div></div>
    <div class="pp-history-summary" data-pp-history-summary></div>
    <div class="pp-history" data-pp-history></div>
  </section>
</section>`;}

function installScreenShell():HTMLElement|null{
  let screen=document.getElementById(SCREEN_ID) as HTMLElement|null;
  const more=document.getElementById("more");
  if(!screen&&more?.parentElement){
    screen=document.createElement("section");
    screen.id=SCREEN_ID;
    screen.className="screen pp-screen";
    screen.innerHTML=trackerTemplate();
    more.parentElement.insertBefore(screen,more);
  }
  const tabbar=document.querySelector<HTMLElement>(".tabbar"),moreTab=tabbar?.querySelector<HTMLButtonElement>('.tab[data-s="more"]');
  if(tabbar&&moreTab&&!tabbar.querySelector('.tab[data-s="pp"]')){
    const tab=document.createElement("button");
    tab.className="tab";
    tab.dataset.s="pp";
    tab.type="button";
    tab.setAttribute("role","tab");
    tab.setAttribute("aria-label","Paragraf ve Problem");
    tab.setAttribute("aria-selected","false");
    tab.innerHTML=`<span class="ic"><svg viewBox="0 0 24 24"><path d="M5 5h10M5 10h14M5 15h8M17 14v6M14 17h6"/></svg></span><span class="tl">P &amp; P</span>`;
    tab.addEventListener("click",()=>win.go?.("pp"));
    tabbar.insertBefore(tab,moreTab);
  }
  return screen?.querySelector<HTMLElement>(`#${ROOT_ID}`)||null;
}

function renderKpis(root:HTMLElement,entries:Entry[]):void{
  const today=metrics(entries.filter(e=>e.date===todayKey())),week=entriesForDays(entries,7),weekM=metrics(week),streak=currentStreak(entries),active=activeDayCount(week);
  root.querySelector<HTMLElement>("[data-pp-kpis]")!.innerHTML=
    summaryCard("Bugün toplam",`${today.total} soru`,`${today.sessions} oturum`,today.total?"accent":"neutral")+
    summaryCard("Bugün net",`${fmtNet(today.net)} net`,`${fmtPct(today.accuracy)} doğruluk`,today.accuracy>=80?"good":"neutral")+
    summaryCard("7 günlük hacim",`${weekM.total} soru`,`${active}/7 aktif gün`,weekM.total?"accent":"neutral")+
    summaryCard("Aktif seri",`${streak} gün`,streak>=3?"ritim korunuyor":"düzenli kayıtla büyür",streak>=3?"good":"neutral");
}
function renderTrend(root:HTMLElement,entries:Entry[]):void{
  const rows=lastDays(14).map(day=>({day,m:metrics(entries.filter(e=>e.date===day))})),max=Math.max(1,...rows.map(x=>x.m.total));
  root.querySelector<HTMLElement>("[data-pp-trend]")!.innerHTML=rows.map(({day,m})=>{
    const volume=Math.round(100*m.total/max),accuracy=Math.round(m.accuracy);
    return `<div class="pp-trend-col" title="${dateLabel(day,true)} · ${m.total} soru · ${fmtPct(m.accuracy)} doğruluk"><div class="pp-trend-bars"><i class="pp-volume" style="height:${volume}%"></i><i class="pp-accuracy" style="height:${accuracy}%"></i></div><span>${dateLabel(day).split(" ")[0]}</span></div>`;
  }).join("");
}
function renderSignals(root:HTMLElement,entries:Entry[]):void{
  root.querySelector<HTMLElement>("[data-pp-signals]")!.innerHTML=insight(entries).map((text,index)=>`<div class="pp-signal"><span>${index+1}</span><p>${escapeHtml(text)}</p></div>`).join("");
}
function renderPeriod(root:HTMLElement,entries:Entry[]):void{
  const cur=metrics(entriesForDays(entries,7)),prev=metrics(entriesForDays(entries,7,-7)),volumeDelta=deltaPercent(cur.total,prev.total),netDelta=cur.net-prev.net,accDelta=cur.accuracy-prev.accuracy;
  const rows=[
    ["Soru",String(cur.total),String(prev.total),volumeDelta===null?"Yeni veri":`${fmtSigned(volumeDelta,"%")}`],
    ["Net",fmtNet(cur.net),fmtNet(prev.net),fmtSigned(netDelta)],
    ["Doğruluk",fmtPct(cur.accuracy),fmtPct(prev.accuracy),fmtSigned(accDelta," puan")],
    ["Aktif gün",String(activeDayCount(entriesForDays(entries,7))),String(activeDayCount(entriesForDays(entries,7,-7))),fmtSigned(activeDayCount(entriesForDays(entries,7))-activeDayCount(entriesForDays(entries,7,-7)))]
  ];
  root.querySelector<HTMLElement>("[data-pp-period]")!.innerHTML=`<div class="pp-period-header"><span>Ölçüm</span><b>Son 7</b><b>Önceki 7</b><b>Fark</b></div>${rows.map(row=>`<div class="pp-period-row"><span>${row[0]}</span><b>${row[1]}</b><span>${row[2]}</span><em>${row[3]}</em></div>`).join("")}<p class="pp-period-note">${prev.total?changeText(cur.accuracy,prev.accuracy," puan"):"Karşılaştırma için önceki 7 günde kayıt gerekli."}</p>`;
}
function renderRhythm(root:HTMLElement,entries:Entry[]):void{
  const monthEntries=entriesForDays(entries,30),m=metrics(monthEntries),active=activeDayCount(monthEntries),best=bestDay(entries,30),avg=active?m.total/active:0,streak=currentStreak(entries),days=lastDays(30);
  root.querySelector<HTMLElement>("[data-pp-rhythm]")!.innerHTML=`<div class="pp-rhythm-stats"><div><span>Aktif gün</span><strong>${active}<small>/30</small></strong></div><div><span>Aktif gün ort.</span><strong>${avg.toFixed(1).replace(".",",")}<small> soru</small></strong></div><div><span>Seri</span><strong>${streak}<small> gün</small></strong></div><div><span>En iyi gün</span><strong>${best?fmtNet(best.m.net):"—"}<small>${best?` net · ${dateLabel(best.day)}`:""}</small></strong></div></div><div class="pp-heatmap" aria-label="Son 30 gün çalışma yoğunluğu">${days.map(day=>{const total=metrics(entries.filter(e=>e.date===day)).total,level=total===0?0:total<20?1:total<40?2:total<70?3:4;return `<i data-level="${level}" title="${dateLabel(day)} · ${total} soru"></i>`;}).join("")}</div><div class="pp-heatmap-caption"><span>Az</span><i data-level="0"></i><i data-level="1"></i><i data-level="2"></i><i data-level="3"></i><i data-level="4"></i><span>Çok</span></div>`;
}
function renderDaily(root:HTMLElement,entries:Entry[]):void{
  const rows=lastDays(7).reverse().map(day=>{const p=metrics(entries.filter(e=>e.date===day&&e.kind==="paragraph")),r=metrics(entries.filter(e=>e.date===day&&e.kind==="problem")),all=metrics(entries.filter(e=>e.date===day));return {day,p,r,all};});
  root.querySelector<HTMLElement>("[data-pp-daily]")!.innerHTML=`<div class="pp-daily-row pp-daily-header"><span>Gün</span><span>Paragraf</span><span>Problem</span><span>Toplam</span><span>Net</span><span>Doğruluk</span></div>${rows.map(({day,p,r,all})=>`<div class="pp-daily-row"><b>${dateLabel(day,true)}</b><span>${p.total}</span><span>${r.total}</span><strong>${all.total}</strong><span>${fmtNet(all.net)}</span><em>${fmtPct(all.accuracy)}</em></div>`).join("")}`;
}
function renderHistory(root:HTMLElement,entries:Entry[]):void{
  const allowedKeys=new Set(lastDays(historyRange)),filtered=entries.filter(e=>(historyKind==="all"||e.kind===historyKind)&&allowedKeys.has(e.date)),m=metrics(filtered);
  root.querySelectorAll<HTMLButtonElement>("[data-pp-kind-filter] button").forEach(button=>button.classList.toggle("on",button.dataset.kind===historyKind));
  root.querySelectorAll<HTMLButtonElement>("[data-pp-range-filter] button").forEach(button=>button.classList.toggle("on",Number(button.dataset.range)===historyRange));
  root.querySelector<HTMLElement>("[data-pp-history-summary]")!.innerHTML=`<span><b>${filtered.length}</b> oturum</span><span><b>${m.total}</b> soru</span><span><b>${fmtNet(m.net)}</b> net</span><span><b>${fmtPct(m.accuracy)}</b> doğruluk</span>`;
  root.querySelector<HTMLElement>("[data-pp-history]")!.innerHTML=filtered.slice(0,80).map(e=>`<div class="pp-entry"><div class="pp-entry-main"><div class="pp-entry-title"><span class="pp-kind-badge pp-badge-${e.kind}">${kindName(e.kind)}</span>${dateLabel(e.date,true)}</div><div class="pp-entry-metrics"><span><b>${e.correct}</b> doğru</span><span><b>${e.wrong}</b> yanlış</span><span><b>${e.blank}</b> boş</span><span><b>${e.correct+e.wrong+e.blank}</b> soru</span><span><b>${fmtNet(netOf(e))}</b> net</span></div></div><button class="btn ghost tiny" type="button" data-pp-delete="${escapeHtml(e.id)}" aria-label="${kindName(e.kind)} ${dateLabel(e.date)} kaydını sil">Sil</button></div>`).join("")||`<div class="pp-empty"><b>Bu filtrede kayıt yok.</b><span>Başka bir dönem seçebilir veya yeni çalışma kaydı ekleyebilirsin.</span></div>`;
  root.querySelectorAll<HTMLButtonElement>("[data-pp-delete]").forEach(button=>button.addEventListener("click",()=>{
    const current=state();if(!current)return;
    current.entries=current.entries.filter(e=>e.id!==button.dataset.ppDelete);
    persist();render(root);
  }));
}
function render(root:HTMLElement):void{
  const tracker=state();if(!tracker)return;
  const entries=[...tracker.entries].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt);
  renderKpis(root,entries);
  root.querySelector<HTMLElement>("[data-pp-kind-grid]")!.innerHTML=kindCard("paragraph",entries)+kindCard("problem",entries);
  renderTrend(root,entries);renderSignals(root,entries);renderPeriod(root,entries);renderRhythm(root,entries);renderDaily(root,entries);renderHistory(root,entries);
}
function updateLive(root:HTMLElement):void{
  const correct=safeInt(root.querySelector<HTMLInputElement>("[data-pp-correct]")?.value),wrong=safeInt(root.querySelector<HTMLInputElement>("[data-pp-wrong]")?.value),blank=safeInt(root.querySelector<HTMLInputElement>("[data-pp-blank]")?.value),total=correct+wrong+blank,net=correct-wrong/4,accuracy=total?100*correct/total:0;
  root.querySelector<HTMLElement>("[data-pp-live]")!.innerHTML=`<span><b>${total}</b> soru</span><span><b>${fmtNet(net)}</b> net</span><span><b>${fmtPct(accuracy)}</b> doğruluk</span>`;
}
function bind(root:HTMLElement):void{
  if(root.dataset.ppReady)return;
  root.dataset.ppReady="1";
  const date=root.querySelector<HTMLInputElement>("[data-pp-date]")!;date.value=todayKey();date.max=todayKey();
  root.querySelectorAll<HTMLInputElement>("[data-pp-correct],[data-pp-wrong],[data-pp-blank]").forEach(input=>input.addEventListener("input",()=>updateLive(root)));
  root.querySelectorAll<HTMLButtonElement>("[data-pp-kind-filter] button").forEach(button=>button.addEventListener("click",()=>{const value=button.dataset.kind;if(value==="all"||value==="paragraph"||value==="problem"){historyKind=value;render(root);}}));
  root.querySelectorAll<HTMLButtonElement>("[data-pp-range-filter] button").forEach(button=>button.addEventListener("click",()=>{const value=Number(button.dataset.range);if(value===7||value===30||value===3650){historyRange=value;render(root);}}));
  root.querySelector<HTMLFormElement>("[data-pp-form]")!.addEventListener("submit",event=>{
    event.preventDefault();
    const kind=root.querySelector<HTMLSelectElement>("[data-pp-kind]")!.value as Kind;
    const correct=safeInt(root.querySelector<HTMLInputElement>("[data-pp-correct]")!.value),wrong=safeInt(root.querySelector<HTMLInputElement>("[data-pp-wrong]")!.value),blank=safeInt(root.querySelector<HTMLInputElement>("[data-pp-blank]")!.value),total=correct+wrong+blank;
    const note=root.querySelector<HTMLElement>("[data-pp-form-note]")!;
    if(!date.value||date.value>todayKey()||total<1){note.textContent=date.value>todayKey()?"Gelecek tarih için çalışma kaydı eklenemez.":"En az 1 soru girmelisin.";note.setAttribute("role","alert");return;}
    const tracker=state();if(!tracker){note.textContent="Uygulama verisi henüz hazır değil.";return;}
    tracker.entries.push({id:entryId(),date:date.value,kind:kind==="problem"?"problem":"paragraph",correct,wrong,blank,createdAt:Date.now()});
    persist();
    root.querySelectorAll<HTMLInputElement>("[data-pp-correct],[data-pp-wrong],[data-pp-blank]").forEach(input=>input.value="0");
    note.removeAttribute("role");note.textContent=`${kind==="problem"?"Problem":"Paragraf"} kaydı eklendi: ${total} soru.`;
    updateLive(root);render(root);
  });
  updateLive(root);
}

export function installParagraphProblemTracker():{installed:boolean;entries:number}{
  const root=installScreenShell();
  if(!root)return {installed:false,entries:0};
  bind(root);
  win.renderParagraphProblemTracker=()=>render(root);
  render(root);
  document.documentElement.dataset.paragraphProblemTracker="ready";
  return {installed:true,entries:state()?.entries.length||0};
}
