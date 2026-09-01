import "./paragraph-problem-tracker.css";

type Kind="paragraph"|"problem";
type Entry={id:string;date:string;kind:Kind;correct:number;wrong:number;blank:number;createdAt:number};
type Tracker={entries:Entry[]};
type LegacyWindow=Window&{S?:Record<string,unknown>&{paragraphProblem?:Tracker};save?:()=>boolean;toast?:(message:string)=>void};

const ROOT_ID="paragraphProblemTracker";
const win=window as LegacyWindow;

function todayKey():string{
  const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function safeInt(value:unknown):number{
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(0,Math.min(999,n)):0;
}
function state():Tracker|null{
  if(!win.S)return null;
  const existing=win.S.paragraphProblem;
  if(!existing||!Array.isArray(existing.entries))win.S.paragraphProblem={entries:[]};
  const tracker=win.S.paragraphProblem as Tracker;
  tracker.entries=tracker.entries.filter(item=>item&&typeof item.id==="string"&&(item.kind==="paragraph"||item.kind==="problem")&&typeof item.date==="string").map(item=>({
    ...item,correct:safeInt(item.correct),wrong:safeInt(item.wrong),blank:safeInt(item.blank),createdAt:Number(item.createdAt)||Date.now()
  })).slice(-2000);
  return tracker;
}
function persist():void{
  try{
    const ok=win.save?.();
    if(ok===false)win.toast?.("Kayıt cihazda saklanamadı");
  }catch(error){console.error("Paragraf/problem kaydı saklanamadı",error);win.toast?.("Kayıt sırasında hata oluştu");}
}
function netOf(e:Entry):number{return e.correct-e.wrong/4;}
function sum(entries:Entry[]){
  return entries.reduce((a,e)=>{a.correct+=e.correct;a.wrong+=e.wrong;a.blank+=e.blank;return a;},{correct:0,wrong:0,blank:0});
}
function metrics(entries:Entry[]){
  const s=sum(entries),total=s.correct+s.wrong+s.blank,net=s.correct-s.wrong/4,accuracy=total?100*s.correct/total:0;
  return {...s,total,net,accuracy};
}
function fmtNet(n:number):string{return Number.isInteger(n)?String(n):n.toFixed(2).replace(".",",");}
function fmtPct(n:number):string{return `${Math.round(n)}%`;}
function escapeHtml(value:string):string{return value.replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[ch]||ch));}
function dateLabel(key:string):string{
  const [y,m,d]=key.split("-").map(Number),dt=new Date(y,m-1,d);
  return Number.isFinite(dt.getTime())?dt.toLocaleDateString("tr-TR",{day:"2-digit",month:"short"}):key;
}
function id():string{return globalThis.crypto?.randomUUID?.()||`pp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;}
function lastDays(count:number):string[]{
  const out:string[]=[];const now=new Date();
  for(let i=count-1;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);}return out;
}

function insight(entries:Entry[]):string{
  const todays=entries.filter(e=>e.date===todayKey()),p=metrics(todays.filter(e=>e.kind==="paragraph")),r=metrics(todays.filter(e=>e.kind==="problem"));
  if(!todays.length)return "Bugün henüz kayıt yok. İlk paragraf veya problem çalışmanı eklediğinde analiz burada oluşacak.";
  if(!p.total)return `Bugün yalnızca problem kaydı var: ${r.total} soru, ${fmtNet(r.net)} net, ${fmtPct(r.accuracy)} doğruluk.`;
  if(!r.total)return `Bugün yalnızca paragraf kaydı var: ${p.total} soru, ${fmtNet(p.net)} net, ${fmtPct(p.accuracy)} doğruluk.`;
  const weak=p.accuracy===r.accuracy?"İki alanın doğruluk oranı eşit.":p.accuracy<r.accuracy?`Paragraf bugün daha zayıf görünüyor (${fmtPct(p.accuracy)}).`:`Problem bugün daha zayıf görünüyor (${fmtPct(r.accuracy)}).`;
  return `Bugün toplam ${p.total+r.total} soru çözdün. Paragraf ${fmtNet(p.net)} net / ${fmtPct(p.accuracy)}, problem ${fmtNet(r.net)} net / ${fmtPct(r.accuracy)}. ${weak}`;
}

function render(root:HTMLElement):void{
  const tracker=state();if(!tracker)return;
  const entries=[...tracker.entries].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt),today=entries.filter(e=>e.date===todayKey());
  const para=metrics(today.filter(e=>e.kind==="paragraph")),prob=metrics(today.filter(e=>e.kind==="problem")),all=metrics(today);
  const summary=(title:string,m:ReturnType<typeof metrics>)=>`<div class="pp-summary-card"><span>${title}</span><strong>${fmtNet(m.net)} net</strong><small>${m.total} soru · ${m.correct}D ${m.wrong}Y ${m.blank}B · ${fmtPct(m.accuracy)} doğruluk</small></div>`;
  const days=lastDays(7),dayTotals=days.map(day=>({day,m:metrics(entries.filter(e=>e.date===day))})),max=Math.max(1,...dayTotals.map(x=>x.m.total));
  const dayRows=dayTotals.map(({day,m})=>`<div class="pp-day"><span>${dateLabel(day)}</span><div class="pp-day-track" aria-label="${m.total} soru"><i style="width:${Math.round(100*m.total/max)}%"></i></div><em>${m.total} soru</em></div>`).join("");
  const history=entries.slice(0,18).map(e=>`<div class="pp-entry"><div class="pp-entry-main"><div class="pp-entry-title"><span class="pp-kind-badge">${e.kind==="paragraph"?"Paragraf":"Problem"}</span>${dateLabel(e.date)} · ${fmtNet(netOf(e))} net</div><div class="pp-entry-meta">${e.correct} doğru · ${e.wrong} yanlış · ${e.blank} boş · ${e.correct+e.wrong+e.blank} soru</div></div><button class="btn ghost tiny" type="button" data-pp-delete="${escapeHtml(e.id)}" aria-label="Kaydı sil">Sil</button></div>`).join("")||`<div class="pp-empty">Henüz paragraf/problem kaydı yok.</div>`;
  root.querySelector<HTMLElement>("[data-pp-summary]")!.innerHTML=summary("Bugün · Paragraf",para)+summary("Bugün · Problem",prob)+summary("Bugün · Toplam",all);
  root.querySelector<HTMLElement>("[data-pp-analysis]")!.textContent=insight(entries);
  root.querySelector<HTMLElement>("[data-pp-days]")!.innerHTML=dayRows;
  root.querySelector<HTMLElement>("[data-pp-history]")!.innerHTML=history;
  root.querySelectorAll<HTMLButtonElement>("[data-pp-delete]").forEach(button=>button.addEventListener("click",()=>{
    const current=state();if(!current)return;current.entries=current.entries.filter(e=>e.id!==button.dataset.ppDelete);persist();render(root);
  }));
}

function template():string{return `<section id="${ROOT_ID}" class="card" aria-label="Paragraf ve problem takibi">
  <div class="pp-head"><div><div class="section-label">Günlük takip</div><h2>Paragraf & Problem</h2><p>Her çalışma oturumunu ayrı kaydet; günlük doğru, yanlış, boş ve netlerini karşılaştır.</p></div></div>
  <form class="pp-form" data-pp-form novalidate>
    <label>Tarih<input type="date" data-pp-date required></label>
    <label>Tür<select data-pp-kind><option value="paragraph">Paragraf</option><option value="problem">Problem</option></select></label>
    <label class="pp-number">Doğru<input type="number" min="0" max="999" inputmode="numeric" value="0" data-pp-correct></label>
    <label class="pp-number">Yanlış<input type="number" min="0" max="999" inputmode="numeric" value="0" data-pp-wrong></label>
    <label class="pp-number">Boş<input type="number" min="0" max="999" inputmode="numeric" value="0" data-pp-blank></label>
    <button class="btn green small pp-submit" type="submit">Kaydı ekle</button>
  </form>
  <div class="pp-total-note" data-pp-form-note>Bir oturumu kaydetmek için doğru + yanlış + boş toplamı en az 1 olmalı.</div>
  <div class="pp-summary" data-pp-summary></div>
  <div class="pp-analysis" data-pp-analysis role="status" aria-live="polite"></div>
  <div class="pp-grid">
    <div class="pp-panel"><div class="pp-panel-head"><b>Son 7 gün</b><span>toplam soru</span></div><div class="pp-days" data-pp-days></div></div>
    <div class="pp-panel"><div class="pp-panel-head"><b>Son kayıtlar</b><span>en yeni önce</span></div><div class="pp-history" data-pp-history></div></div>
  </div>
</section>`;}

export function installParagraphProblemTracker():{installed:boolean;entries:number}{
  if(document.getElementById(ROOT_ID)){const tracker=state();return {installed:true,entries:tracker?.entries.length||0};}
  const target=document.getElementById("v30MoreHome")||document.getElementById("more");
  if(!target)return {installed:false,entries:0};
  const holder=document.createElement("div");holder.innerHTML=template();const root=holder.firstElementChild as HTMLElement;target.append(root);
  const date=root.querySelector<HTMLInputElement>("[data-pp-date]")!;date.value=todayKey();
  root.querySelector<HTMLFormElement>("[data-pp-form]")!.addEventListener("submit",event=>{
    event.preventDefault();
    const kind=root.querySelector<HTMLSelectElement>("[data-pp-kind]")!.value as Kind,correct=safeInt(root.querySelector<HTMLInputElement>("[data-pp-correct]")!.value),wrong=safeInt(root.querySelector<HTMLInputElement>("[data-pp-wrong]")!.value),blank=safeInt(root.querySelector<HTMLInputElement>("[data-pp-blank]")!.value),total=correct+wrong+blank;
    const note=root.querySelector<HTMLElement>("[data-pp-form-note]")!;
    if(!date.value||total<1){note.textContent="En az 1 soru girmelisin.";note.setAttribute("role","alert");return;}
    const tracker=state();if(!tracker){note.textContent="Uygulama verisi henüz hazır değil.";return;}
    tracker.entries.push({id:id(),date:date.value,kind:kind==="problem"?"problem":"paragraph",correct,wrong,blank,createdAt:Date.now()});
    persist();
    root.querySelectorAll<HTMLInputElement>("[data-pp-correct],[data-pp-wrong],[data-pp-blank]").forEach(input=>input.value="0");
    note.textContent=`${kind==="problem"?"Problem":"Paragraf"} kaydı eklendi: ${total} soru.`;render(root);
  });
  render(root);document.documentElement.dataset.paragraphProblemTracker="ready";
  return {installed:true,entries:state()?.entries.length||0};
}
