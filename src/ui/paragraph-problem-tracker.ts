import "./paragraph-problem-tracker.css";

/* v75 · Paragraf & Problem: Bugün kartı ve hedef, tek ekranlık hızlı kayıt (isteğe bağlı süre ve soru türü),
   tek gelişim grafiği, zorlanılan türler, güne göre gruplu ve düzenlenebilir geçmiş.
   Eski kayıtlar aynen kalır; hedef (goals), süre (minutes) ve tür (topic) isteğe bağlı yeni alanlardır. */

type Kind="paragraph"|"problem";
type Entry={id:string;date:string;kind:Kind;correct:number;wrong:number;blank:number;createdAt:number;minutes?:number;topic?:string};
type Goals={paragraph?:number;problem?:number};
type Tracker={entries:Entry[];goals?:Goals};
type Metrics=ReturnType<typeof metrics>;
type HistoryKind="all"|Kind;
type GrowthMetric="q"|"net"|"acc";
type AppWindow=Window&{
  S?:Record<string,unknown>&{paragraphProblem?:Tracker};
  save?:()=>boolean;
  toast?:(message:string)=>void;
  go?:(screen:string)=>unknown;
  renderParagraphProblemTracker?:()=>void;
  YKSAccountAuth?:{publishShare?:(options?:{manual?:boolean})=>Promise<boolean>|boolean};
};

const SCREEN_ID="pp";
const ROOT_ID="paragraphProblemTracker";
const win=window as AppWindow;
const ESCAPE_MAP:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"};
export const PP_TOPICS:Record<Kind,string[]>={
  paragraph:["Ana düşünce","Yardımcı düşünce","Paragraf tamamlama","Akışı bozan cümle","Yer değiştirme","Anlatım biçimi","Diğer"],
  problem:["Sayı-Kesir","Yüzde-Faiz","Yaş","Hareket","İşçi-Havuz","Karışım","Grafik-Tablo","Diğer"]
};
let historyKind:HistoryKind="all";
let historyDays=14;
let growthMetric:GrowthMetric="q";
let formKind:Kind="paragraph";
let formTopic="";
let editingId="";
let goalEditing=false;

function keyOf(d:Date):string{
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function todayKey():string{return keyOf(new Date());}
function dayKeyOffset(offset:number):string{
  const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return keyOf(d);
}
function safeInt(value:unknown,max=999):number{
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(0,Math.min(max,n)):0;
}
function cleanEntry(item:Entry):Entry{
  const kind:Kind=item.kind==="problem"?"problem":"paragraph";
  const out:Entry={...item,kind,correct:safeInt(item.correct),wrong:safeInt(item.wrong),blank:safeInt(item.blank),createdAt:Number(item.createdAt)||Date.now()};
  const minutes=safeInt(item.minutes,600);if(minutes)out.minutes=minutes;else delete out.minutes;
  if(typeof item.topic==="string"&&PP_TOPICS[kind].includes(item.topic))out.topic=item.topic;else delete out.topic;
  return out;
}
function state():Tracker|null{
  const root=win.S;if(!root)return null;
  const current=root.paragraphProblem;
  if(!current||!Array.isArray(current.entries))root.paragraphProblem={entries:[]};
  const tracker=root.paragraphProblem as Tracker;
  tracker.entries=tracker.entries
    .filter(item=>item&&typeof item.id==="string"&&(item.kind==="paragraph"||item.kind==="problem")&&typeof item.date==="string")
    .map(cleanEntry)
    .slice(-2000);
  if(tracker.goals&&typeof tracker.goals==="object"){
    const goals:Goals={},p=safeInt(tracker.goals.paragraph,500),q=safeInt(tracker.goals.problem,500);
    if(p)goals.paragraph=p;if(q)goals.problem=q;
    if(p||q)tracker.goals=goals;else delete tracker.goals;
  }else delete tracker.goals;
  return tracker;
}
function persist():void{
  try{
    const ok=win.save?.();
    if(ok===false){win.toast?.("Kayıt cihazda saklanamadı");return;}
    void Promise.resolve(win.YKSAccountAuth?.publishShare?.()).catch(()=>{});
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
function fmtNet(n:number):string{return Number.isInteger(n)?String(n):n.toFixed(2).replace(/0$/,"").replace(".",",");}
/* Türkçe yazım: %73 */
function fmtPct(n:number,digits=0):string{return `%${n.toFixed(digits).replace(".",",")}`;}
function fmtSigned(n:number,suffix=""):string{
  if(Math.abs(n)<.005)return `0${suffix}`;
  return `${n>0?"+":""}${n.toFixed(1).replace(".",",").replace(/,0$/,"")}${suffix}`;
}
function fmtPace(secondsPerQuestion:number):string{const s=Math.round(secondsPerQuestion),m=Math.floor(s/60),r=s%60;return m?`${m} dk${r?` ${r} sn`:""}`:`${r} sn`;}
function escapeHtml(value:string):string{return value.replace(/[&<>'"]/g,ch=>ESCAPE_MAP[ch]??ch);}
function dateLabel(key:string,weekday=false):string{
  const [ys,ms,ds]=key.split("-"),y=Number(ys||0),m=Number(ms||0),d=Number(ds||0),dt=new Date(y,m-1,d);
  return y&&m&&d&&Number.isFinite(dt.getTime())?dt.toLocaleDateString("tr-TR",weekday?{weekday:"long",day:"numeric",month:"short"}:{day:"numeric",month:"short"}):key;
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
function weekDays():string[]{const d=new Date();d.setHours(12,0,0,0);const dow=(d.getDay()+6)%7;return lastDays(7,6-dow);}
function currentStreak(entries:Entry[]):number{
  const active=new Set(entries.filter(e=>e.correct+e.wrong+e.blank>0).map(e=>e.date));
  let offset=0;
  if(!active.has(dayKeyOffset(0))&&active.has(dayKeyOffset(-1)))offset=-1;
  if(!active.has(dayKeyOffset(offset)))return 0;
  let streak=0;
  while(streak<3650&&active.has(dayKeyOffset(offset-streak)))streak++;
  return streak;
}
function deltaPercent(current:number,previous:number):number|null{
  return previous>0?100*(current-previous)/previous:current>0?null:0;
}
function kindName(kind:Kind):string{return kind==="paragraph"?"Paragraf":"Problem";}
/* Süre girilmiş oturumlardan soru başına saniye. */
function pace(entries:Entry[]):number|null{
  const timed=entries.filter(e=>e.minutes&&e.correct+e.wrong+e.blank>0),q=timed.reduce((s,e)=>s+e.correct+e.wrong+e.blank,0),m=timed.reduce((s,e)=>s+(e.minutes||0),0);
  return q?m*60/q:null;
}
/* Türü girilmiş, en az 5 soruluk türler; doğruluğu en düşük önce. */
export function weakTopics(entries:Entry[],minQuestions=5):{kind:Kind;topic:string;total:number;accuracy:number}[]{
  const map=new Map<string,Entry[]>();
  for(const e of entries)if(e.topic){const k=e.kind+"|"+e.topic,list=map.get(k)??[];list.push(e);map.set(k,list);}
  return [...map.entries()].map(([k,list])=>{const [kind,topic]=k.split("|") as [Kind,string],m=metrics(list);return {kind,topic,total:m.total,accuracy:m.accuracy};})
    .filter(x=>x.total>=minQuestions).sort((a,b)=>a.accuracy-b.accuracy||b.total-a.total);
}

/* ---------- şablon ---------- */
function stepper(field:"correct"|"wrong"|"blank",label:string):string{
  return `<div class="pp-step pp-step-${field}"><span>${label}</span><div><button type="button" data-pp-step="${field}" data-d="-1" aria-label="${label} azalt">−</button><input type="number" min="0" max="999" inputmode="numeric" value="0" data-pp-${field} aria-label="${label}"><button type="button" data-pp-step="${field}" data-d="1" aria-label="${label} artır">+</button></div></div>`;
}
function trackerTemplate():string{return `<div class="pp-page-head"><div><h1>Paragraf & Problem</h1><p class="lead">Her gün biraz, hedefine göre.</p></div></div>
<section id="${ROOT_ID}" class="pp-dashboard" data-pp-v75 aria-label="Paragraf ve problem takibi">
  <section class="card pp-today-card" data-pp-today aria-label="Bugün"></section>
  <section class="card pp-entry-card" aria-labelledby="ppEntryTitle">
    <div class="pp-card-head"><h2 id="ppEntryTitle">Kayıt ekle</h2><button type="button" class="pp-link" data-pp-cancel hidden>Vazgeç</button></div>
    <form class="pp-form" data-pp-form novalidate>
      <div class="pp-kind" role="radiogroup" aria-label="Tür"><button type="button" role="radio" data-pp-kind="paragraph">Paragraf</button><button type="button" role="radio" data-pp-kind="problem">Problem</button></div>
      <div class="pp-steps">${stepper("correct","Doğru")}${stepper("wrong","Yanlış")}${stepper("blank","Boş")}</div>
      <div class="pp-live" data-pp-live aria-live="polite"></div>
      <div class="pp-date-row"><span>Tarih: <b data-pp-date-label>Bugün</b></span><button type="button" class="pp-link" data-pp-date-toggle>değiştir</button><input type="date" data-pp-date hidden aria-label="Tarih"></div>
      <details class="pp-extra" data-pp-extra><summary>Ayrıntı ekle <small>süre, soru türü</small></summary>
        <div class="pp-extra-body"><div class="pp-minutes"><label>Süre (dk)<input type="number" min="0" max="600" inputmode="numeric" data-pp-minutes placeholder="Örn. 25"></label><span data-pp-pace>Soru başına —</span></div>
        <div class="pp-topics" data-pp-topics role="radiogroup" aria-label="Soru türü"></div></div>
      </details>
      <button class="btn green pp-submit" type="submit" data-pp-submit>Kaydet</button>
    </form>
    <div class="pp-total-note" data-pp-form-note>Doğru + yanlış + boş toplamı en az 1 olmalı.</div>
  </section>
  <section class="card pp-growth-card" aria-labelledby="ppGrowthTitle">
    <div class="pp-card-head"><h2 id="ppGrowthTitle">Gelişim</h2><div class="pp-chips" data-pp-growth-metric role="group" aria-label="Grafik ölçüsü"><button type="button" data-m="q">Soru</button><button type="button" data-m="net">Net</button><button type="button" data-m="acc">Doğruluk</button></div></div>
    <div class="pp-bars" data-pp-bars></div><div class="pp-bar-labels" data-pp-bar-labels></div>
    <div class="pp-legend" data-pp-legend></div>
    <p class="pp-summary" data-pp-summary></p>
  </section>
  <section class="card pp-types-card" data-pp-types hidden aria-labelledby="ppTypesTitle"></section>
  <section class="card pp-history-card" aria-labelledby="ppHistoryTitle">
    <div class="pp-card-head"><h2 id="ppHistoryTitle">Geçmiş</h2><small>dokun: düzenle</small></div>
    <div class="pp-chips" data-pp-kind-filter role="group" aria-label="Türe göre süz"><button type="button" data-kind="all">Tümü</button><button type="button" data-kind="paragraph">Paragraf</button><button type="button" data-kind="problem">Problem</button></div>
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

/* ---------- Bugün ---------- */
function ring(kind:Kind,done:number,goal:number):string{
  const pct=goal?Math.min(100,Math.round(done/goal*100)):done?100:0;
  return `<div class="pp-ring pp-ring-${kind}" style="--p:${pct}" aria-hidden="true"><b>${goal?`${done}/${goal}`:done}</b></div>`;
}
function renderToday(root:HTMLElement,tracker:Tracker,entries:Entry[]):void{
  const goals=tracker.goals??{},today=todayKey(),week=new Set(weekDays());
  const rows=(["paragraph","problem"] as Kind[]).map(kind=>{
    const list=entries.filter(e=>e.kind===kind&&e.date===today),m=metrics(list),goal=goals[kind]??0;
    const detail=!m.total?(goal?`Bugün kayıt yok · hedef ${goal} soru`:"Bugün kayıt yok"):goal&&m.total>=goal?`<span class="pp-done">Hedef tamam ✓</span> · ${fmtNet(m.net)} net · ${fmtPct(m.accuracy)}`:`${fmtNet(m.net)} net · ${fmtPct(m.accuracy)} doğruluk${goal?` · ${goal-m.total} soru kaldı`:""}`;
    return `<div class="pp-goal">${ring(kind,m.total,goal)}<div><strong>${kindName(kind)}</strong><small>${detail}</small></div></div>`;
  }).join("");
  const weekTotal=(kind:Kind)=>metrics(entries.filter(e=>e.kind===kind&&week.has(e.date))).total;
  const wp=weekTotal("paragraph"),wq=weekTotal("problem"),streak=currentStreak(entries);
  const editor=goalEditing?`<form class="pp-goal-form" data-pp-goal-form><label>Paragraf / gün<input type="number" min="0" max="500" inputmode="numeric" data-pp-goal="paragraph" value="${goals.paragraph??""}" placeholder="Örn. 20"></label><label>Problem / gün<input type="number" min="0" max="500" inputmode="numeric" data-pp-goal="problem" value="${goals.problem??""}" placeholder="Örn. 10"></label><button type="submit" class="btn green tiny">Kaydet</button></form><p class="pp-hint">Boş bırakırsan hedef olmaz. Haftalık hedef günlüğün 7 katıdır.</p>`:"";
  root.querySelector<HTMLElement>("[data-pp-today]")!.innerHTML=`<div class="pp-card-head"><h2>Bugün</h2><button type="button" class="pp-link" data-pp-goal-edit>${goalEditing?"Kapat":goals.paragraph||goals.problem?"Hedefi değiştir":"Hedef koy"}</button></div>${editor}${rows}
    <div class="pp-week"><span>Bu hafta paragraf<b>${wp}${goals.paragraph?` / ${goals.paragraph*7}`:""}</b></span><span>Bu hafta problem<b>${wq}${goals.problem?` / ${goals.problem*7}`:""}</b></span><span>Seri<b>${streak} gün</b></span></div>`;
}

/* ---------- Gelişim ---------- */
function renderGrowth(root:HTMLElement,entries:Entry[]):void{
  const days=lastDays(14),rows=days.map(day=>{const p=metrics(entries.filter(e=>e.date===day&&e.kind==="paragraph")),q=metrics(entries.filter(e=>e.date===day&&e.kind==="problem")),all=metrics(entries.filter(e=>e.date===day));return {day,p,q,all};});
  root.querySelectorAll<HTMLButtonElement>("[data-pp-growth-metric] button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.m===growthMetric)));
  const value=(m:Metrics)=>growthMetric==="net"?Math.max(0,m.net):m.total;
  const max=growthMetric==="acc"?100:Math.max(1,...rows.map(r=>value(r.p)+value(r.q)));
  root.querySelector<HTMLElement>("[data-pp-bars]")!.innerHTML=rows.map(r=>{
    const title=`${dateLabel(r.day)} · ${r.all.total} soru · ${fmtNet(r.all.net)} net · ${fmtPct(r.all.accuracy)}`;
    if(growthMetric==="acc")return `<span title="${title}"><i class="pp-acc" style="height:${r.all.total?r.all.accuracy:0}%"></i></span>`;
    return `<span title="${title}"><i class="pp-p" style="height:${value(r.p)/max*100}%"></i><i class="pp-q" style="height:${value(r.q)/max*100}%"></i></span>`;
  }).join("");
  root.querySelector<HTMLElement>("[data-pp-bar-labels]")!.innerHTML=days.map(d=>`<span>${Number(d.slice(8))}</span>`).join("");
  root.querySelector<HTMLElement>("[data-pp-legend]")!.innerHTML=growthMetric==="acc"?`<span><i class="pp-acc"></i>Günlük doğruluk</span>`:`<span><i class="pp-p"></i>Paragraf</span><span><i class="pp-q"></i>Problem</span>`;
  const cur=metrics(entriesForDays(entries,7)),prev=metrics(entriesForDays(entries,7,-7)),dq=deltaPercent(cur.total,prev.total),pp=pace(entriesForDays(entries.filter(e=>e.kind==="paragraph"),7));
  const parts:string[]=[];
  if(cur.total){
    parts.push(`Son 7 gün <b>${cur.total} soru</b>${prev.total&&dq!=null?` (${dq>=0?"▲":"▼"} ${fmtPct(Math.abs(dq))})`:""}`);
    parts.push(`doğruluk <b>${fmtPct(cur.accuracy)}</b>${prev.total?` (${fmtSigned(cur.accuracy-prev.accuracy," puan")})`:""}`);
    if(pp!=null)parts.push(`paragraf hızı <b>${fmtPace(pp)}</b>/soru`);
  }
  root.querySelector<HTMLElement>("[data-pp-summary]")!.innerHTML=parts.length?parts.join(" · "):"Son 7 günde kayıt yok. İlk oturumunu eklediğinde gelişimin burada görünür.";
}
function renderTypes(root:HTMLElement,entries:Entry[]):void{
  const box=root.querySelector<HTMLElement>("[data-pp-types]")!,rows=weakTopics(entriesForDays(entries,30)).slice(0,5);
  box.hidden=!rows.length;if(!rows.length){box.innerHTML="";return;}
  box.innerHTML=`<div class="pp-card-head"><h2 id="ppTypesTitle">Zorlandığın türler</h2><small>son 30 gün</small></div>${rows.map(r=>`<div class="pp-type"><span>${kindName(r.kind)} · ${escapeHtml(r.topic)}<small>${r.total} soru</small></span><span class="pp-type-bar"><i class="${r.accuracy<55?"low":r.accuracy<70?"mid":"high"}" style="width:${Math.round(r.accuracy)}%"></i></span><b>${fmtPct(r.accuracy)}</b></div>`).join("")}`;
}

/* ---------- Geçmiş ---------- */
function renderHistory(root:HTMLElement,entries:Entry[]):void{
  root.querySelectorAll<HTMLButtonElement>("[data-pp-kind-filter] button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===historyKind)));
  const filtered=entries.filter(e=>historyKind==="all"||e.kind===historyKind),byDay=new Map<string,Entry[]>();
  for(const e of filtered){const list=byDay.get(e.date)??[];list.push(e);byDay.set(e.date,list);}
  const days=[...byDay.keys()].sort((a,b)=>b.localeCompare(a)),shown=days.slice(0,historyDays);
  root.querySelector<HTMLElement>("[data-pp-history]")!.innerHTML=shown.map(day=>{
    const list=byDay.get(day)!,m=metrics(list);
    return `<div class="pp-day"><div class="pp-day-head"><b>${escapeHtml(dateLabel(day,true))}</b><small>${m.total} soru · ${fmtNet(m.net)} net</small></div>${list.map(e=>{
      const extra=[`D${e.correct} Y${e.wrong} B${e.blank}`,e.minutes?`${e.minutes} dk`:"",e.topic?escapeHtml(e.topic):""].filter(Boolean).join(" · ");
      return `<div class="pp-session${e.id===editingId?" is-editing":""}"><span class="pp-badge pp-badge-${e.kind}">${kindName(e.kind)}</span><span class="pp-session-main">${extra}<small>${fmtNet(netOf(e))} net</small></span><span class="pp-session-act"><button type="button" class="pp-link" data-pp-edit="${escapeHtml(e.id)}">Düzenle</button><button type="button" class="pp-link pp-del" data-pp-delete="${escapeHtml(e.id)}" aria-label="${kindName(e.kind)} ${escapeHtml(dateLabel(e.date))} kaydını sil">Sil</button></span></div>`;
    }).join("")}</div>`;
  }).join("")+(days.length>historyDays?`<button type="button" class="pp-more" data-pp-more>${days.length-historyDays} gün daha göster</button>`:"")||`<div class="pp-empty"><b>Henüz kayıt yok.</b><span>Yukarıdan ilk oturumunu ekle.</span></div>`;
}

/* ---------- form ---------- */
function field(root:HTMLElement,name:string):HTMLInputElement{return root.querySelector<HTMLInputElement>(`[data-pp-${name}]`)!;}
function renderForm(root:HTMLElement):void{
  root.querySelectorAll<HTMLButtonElement>("[data-pp-kind]").forEach(b=>{const on=b.dataset.ppKind===formKind;b.setAttribute("aria-checked",String(on));b.classList.toggle("on",on);});
  root.querySelector<HTMLElement>("[data-pp-topics]")!.innerHTML=PP_TOPICS[formKind].map(t=>`<button type="button" role="radio" data-pp-topic="${escapeHtml(t)}" aria-checked="${t===formTopic}">${escapeHtml(t)}</button>`).join("");
  const date=field(root,"date"),label=root.querySelector<HTMLElement>("[data-pp-date-label]")!;
  label.textContent=date.value===todayKey()?"Bugün":dateLabel(date.value,true);
  root.querySelector<HTMLElement>("[data-pp-submit]")!.textContent=editingId?"Güncelle":"Kaydet";
  root.querySelector<HTMLElement>("[data-pp-cancel]")!.hidden=!editingId;
  root.querySelector<HTMLElement>("#ppEntryTitle")!.textContent=editingId?"Kaydı düzenle":"Kayıt ekle";
  updateLive(root);
}
function updateLive(root:HTMLElement):void{
  const correct=safeInt(field(root,"correct").value),wrong=safeInt(field(root,"wrong").value),blank=safeInt(field(root,"blank").value),total=correct+wrong+blank,net=correct-wrong/4,accuracy=total?100*correct/total:0,minutes=safeInt(field(root,"minutes").value,600);
  root.querySelector<HTMLElement>("[data-pp-live]")!.innerHTML=`<span><b>${total}</b> soru</span><span><b>${fmtNet(net)}</b> net</span><span><b>${fmtPct(accuracy)}</b> doğruluk</span>`;
  root.querySelector<HTMLElement>("[data-pp-pace]")!.textContent=minutes&&total?`Soru başına ${fmtPace(minutes*60/total)}`:"Soru başına —";
}
function resetForm(root:HTMLElement):void{
  editingId="";formTopic="";
  for(const name of ["correct","wrong","blank"])field(root,name).value="0";
  field(root,"minutes").value="";
  const date=field(root,"date");date.value=todayKey();date.hidden=true;
  root.querySelector<HTMLDetailsElement>("[data-pp-extra]")!.open=false;
  renderForm(root);
}
function startEdit(root:HTMLElement,id:string):void{
  const e=state()?.entries.find(x=>x.id===id);if(!e)return;
  editingId=id;formKind=e.kind;formTopic=e.topic??"";
  field(root,"correct").value=String(e.correct);field(root,"wrong").value=String(e.wrong);field(root,"blank").value=String(e.blank);
  field(root,"minutes").value=e.minutes?String(e.minutes):"";
  const date=field(root,"date");date.value=e.date;date.hidden=e.date===todayKey();
  root.querySelector<HTMLDetailsElement>("[data-pp-extra]")!.open=!!(e.minutes||e.topic);
  renderForm(root);render(root);
  root.querySelector(".pp-entry-card")?.scrollIntoView({behavior:"smooth",block:"start"});
}
function submit(root:HTMLElement):void{
  const date=field(root,"date"),note=root.querySelector<HTMLElement>("[data-pp-form-note]")!;
  const correct=safeInt(field(root,"correct").value),wrong=safeInt(field(root,"wrong").value),blank=safeInt(field(root,"blank").value),total=correct+wrong+blank,minutes=safeInt(field(root,"minutes").value,600);
  if(!date.value||date.value>todayKey()||total<1){note.textContent=date.value>todayKey()?"Gelecek tarih için çalışma kaydı eklenemez.":"En az 1 soru girmelisin.";note.setAttribute("role","alert");return;}
  const tracker=state();if(!tracker){note.textContent="Uygulama verisi henüz hazır değil.";return;}
  const base:Entry={id:editingId||entryId(),date:date.value,kind:formKind,correct,wrong,blank,createdAt:Date.now()};
  if(minutes)base.minutes=minutes;if(formTopic&&PP_TOPICS[formKind].includes(formTopic))base.topic=formTopic;
  if(editingId){const i=tracker.entries.findIndex(e=>e.id===editingId);if(i<0){note.textContent="Düzenlenen kayıt bulunamadı.";return;}base.createdAt=tracker.entries[i]!.createdAt;tracker.entries[i]=base;}
  else tracker.entries.push(base);
  persist();
  note.removeAttribute("role");note.textContent=`${kindName(formKind)} ${editingId?"kaydı güncellendi":"kaydı eklendi"}: ${total} soru.`;
  resetForm(root);render(root);
}

function render(root:HTMLElement):void{
  const tracker=state();if(!tracker)return;
  const entries=[...tracker.entries].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt);
  renderToday(root,tracker,entries);renderGrowth(root,entries);renderTypes(root,entries);renderHistory(root,entries);
}
function bind(root:HTMLElement):void{
  if(root.dataset.ppReady)return;
  root.dataset.ppReady="1";
  const date=field(root,"date");date.value=todayKey();date.max=todayKey();
  root.addEventListener("input",event=>{const t=event.target as HTMLElement;if(t.matches("[data-pp-correct],[data-pp-wrong],[data-pp-blank],[data-pp-minutes]"))updateLive(root);});
  date.addEventListener("change",()=>renderForm(root));
  root.addEventListener("click",event=>{
    const t=event.target as HTMLElement;
    const step=t.closest<HTMLElement>("[data-pp-step]");if(step){const input=field(root,step.dataset.ppStep||"correct");input.value=String(safeInt(safeInt(input.value)+Number(step.dataset.d)));updateLive(root);return;}
    const kind=t.closest<HTMLElement>("[data-pp-kind]");if(kind){formKind=kind.dataset.ppKind==="problem"?"problem":"paragraph";if(!PP_TOPICS[formKind].includes(formTopic))formTopic="";renderForm(root);return;}
    const topic=t.closest<HTMLElement>("[data-pp-topic]");if(topic){formTopic=formTopic===topic.dataset.ppTopic?"":topic.dataset.ppTopic||"";renderForm(root);return;}
    if(t.closest("[data-pp-date-toggle]")){date.hidden=!date.hidden;if(!date.hidden)date.focus();return;}
    if(t.closest("[data-pp-cancel]")){resetForm(root);render(root);return;}
    if(t.closest("[data-pp-goal-edit]")){goalEditing=!goalEditing;render(root);if(goalEditing)root.querySelector<HTMLInputElement>("[data-pp-goal]")?.focus();return;}
    const metric=t.closest<HTMLElement>("[data-pp-growth-metric] button");if(metric){const m=metric.dataset.m;growthMetric=m==="net"||m==="acc"?m:"q";render(root);return;}
    const filter=t.closest<HTMLElement>("[data-pp-kind-filter] button");if(filter){const v=filter.dataset.kind;historyKind=v==="paragraph"||v==="problem"?v:"all";historyDays=14;render(root);return;}
    if(t.closest("[data-pp-more]")){historyDays+=14;render(root);return;}
    const edit=t.closest<HTMLElement>("[data-pp-edit]");if(edit){startEdit(root,edit.dataset.ppEdit||"");return;}
    const del=t.closest<HTMLElement>("[data-pp-delete]");if(del){
      const current=state();if(!current)return;const id=del.dataset.ppDelete;
      if(typeof confirm==="function"&&!confirm("Bu kayıt silinsin mi?"))return;
      current.entries=current.entries.filter(e=>e.id!==id);if(editingId===id)resetForm(root);
      persist();render(root);
    }
  });
  root.addEventListener("submit",event=>{
    const form=event.target as HTMLElement;event.preventDefault();
    if(form.matches("[data-pp-goal-form]")){
      const tracker=state();if(!tracker)return;const goals:Goals={};
      form.querySelectorAll<HTMLInputElement>("[data-pp-goal]").forEach(input=>{const v=safeInt(input.value,500);if(v)goals[input.dataset.ppGoal==="problem"?"problem":"paragraph"]=v;});
      if(goals.paragraph||goals.problem)tracker.goals=goals;else delete tracker.goals;
      goalEditing=false;persist();render(root);win.toast?.("Hedef kaydedildi ✓");return;
    }
    if(form.matches("[data-pp-form]"))submit(root);
  });
  renderForm(root);
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
