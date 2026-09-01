import "./paragraph-problem-tracker.css";

type Kind="paragraph"|"problem";
type Entry={id:string;date:string;kind:Kind;correct:number;wrong:number;blank:number;createdAt:number};
type Tracker={entries:Entry[]};
type MoreUiApi={openMore?:(panel:"pp")=>unknown};
type LegacyWindow=Window&{
  S?:Record<string,unknown>&{paragraphProblem?:Tracker};
  save?:()=>boolean;
  toast?:(message:string)=>void;
  setMoreTab?:(panel:string)=>unknown;
  activeMoreTab?:()=>string;
  __YKS_UI__?:MoreUiApi;
  __PP_MORE_ROUTE_PATCHED__?:boolean;
};

const ROOT_ID="paragraphProblemTracker";
const PANEL_ID="mrp_pp";
const LAUNCH_ID="ppLaunchCard";
const win=window as LegacyWindow;
const ESCAPE_MAP:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"};

function todayKey():string{
  const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function safeInt(value:unknown):number{
  const n=Math.floor(Number(value));
  return Number.isFinite(n)?Math.max(0,Math.min(999,n)):0;
}
function state():Tracker|null{
  const root=win.S;if(!root)return null;
  const existing=root.paragraphProblem;
  if(!existing||!Array.isArray(existing.entries))root.paragraphProblem={entries:[]};
  const tracker=root.paragraphProblem as Tracker;
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
function escapeHtml(value:string):string{return value.replace(/[&<>'"]/g,ch=>ESCAPE_MAP[ch]??ch);}
function dateLabel(key:string):string{
  const parts=key.split("-"),y=Number(parts[0]??0),m=Number(parts[1]??0),d=Number(parts[2]??0),dt=new Date(y,m-1,d);
  return y>0&&m>0&&d>0&&Number.isFinite(dt.getTime())?dt.toLocaleDateString("tr-TR",{day:"2-digit",month:"short"}):key;
}
function id():string{
  const cryptoApi=globalThis.crypto;
  return cryptoApi&&typeof cryptoApi.randomUUID==="function"?cryptoApi.randomUUID():`pp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}
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

function updateLauncher(entries:Entry[]):void{
  const launch=document.getElementById(LAUNCH_ID);if(!launch)return;
  const today=metrics(entries.filter(e=>e.date===todayKey()));
  const meta=launch.querySelector<HTMLElement>("[data-pp-launch-meta]");
  const sub=launch.querySelector<HTMLElement>("[data-pp-launch-sub]");
  if(meta)meta.textContent=today.total?`${today.total} soru · ${fmtNet(today.net)} net`:"Bugün kayıt yok";
  if(sub)sub.textContent=today.total?`${today.correct}D ${today.wrong}Y ${today.blank}B · ${fmtPct(today.accuracy)} doğruluk`:"Günlük paragraf ve problem sonuçlarını kaydet";
}

function render(root:HTMLElement):void{
  const tracker=state();if(!tracker)return;
  const entries=[...tracker.entries].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt),today=entries.filter(e=>e.date===todayKey());
  const para=metrics(today.filter(e=>e.kind==="paragraph")),prob=metrics(today.filter(e=>e.kind==="problem")),all=metrics(today);
  const summary=(title:string,m:ReturnType<typeof metrics>)=>`<div class="pp-summary-card"><span>${title}</span><strong>${fmtNet(m.net)} net</strong><small>${m.total} soru · ${m.correct}D ${m.wrong}Y ${m.blank}B · ${fmtPct(m.accuracy)} doğruluk</small></div>`;
  const days=lastDays(7),dayTotals=days.map(day=>({day,m:metrics(entries.filter(e=>e.date===day))})),max=Math.max(1,...dayTotals.map(x=>x.m.total));
  const dayRows=dayTotals.map(({day,m})=>`<div class="pp-day"><span>${dateLabel(day)}</span><div class="pp-day-track" aria-label="${m.total} soru"><i style="width:${Math.round(100*m.total/max)}%"></i></div><em>${m.total} soru</em></div>`).join("");
  const history=entries.slice(0,30).map(e=>`<div class="pp-entry"><div class="pp-entry-main"><div class="pp-entry-title"><span class="pp-kind-badge">${e.kind==="paragraph"?"Paragraf":"Problem"}</span>${dateLabel(e.date)} · ${fmtNet(netOf(e))} net</div><div class="pp-entry-meta">${e.correct} doğru · ${e.wrong} yanlış · ${e.blank} boş · ${e.correct+e.wrong+e.blank} soru</div></div><button class="btn ghost tiny" type="button" data-pp-delete="${escapeHtml(e.id)}" aria-label="Kaydı sil">Sil</button></div>`).join("")||`<div class="pp-empty">Henüz paragraf/problem kaydı yok.</div>`;
  root.querySelector<HTMLElement>("[data-pp-summary]")!.innerHTML=summary("Bugün · Paragraf",para)+summary("Bugün · Problem",prob)+summary("Bugün · Toplam",all);
  root.querySelector<HTMLElement>("[data-pp-analysis]")!.textContent=insight(entries);
  root.querySelector<HTMLElement>("[data-pp-days]")!.innerHTML=dayRows;
  root.querySelector<HTMLElement>("[data-pp-history]")!.innerHTML=history;
  updateLauncher(entries);
  root.querySelectorAll<HTMLButtonElement>("[data-pp-delete]").forEach(button=>button.addEventListener("click",()=>{
    const current=state();if(!current)return;current.entries=current.entries.filter(e=>e.id!==button.dataset.ppDelete);persist();render(root);
  }));
}

function trackerTemplate():string{return `<section id="${ROOT_ID}" class="card" aria-label="Paragraf ve problem takibi">
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

function installDedicatedPanel():HTMLElement|null{
  const more=document.getElementById("more"),home=document.getElementById("v30MoreHome");
  if(!more||!home)return null;
  let panel=document.getElementById(PANEL_ID) as HTMLElement|null;
  if(!panel){
    panel=document.createElement("div");
    panel.id=PANEL_ID;
    panel.className="pp-page";
    panel.style.display="none";
    panel.innerHTML=`<div class="v30-subhead"><button class="v30-back" type="button" data-pp-back>‹ Daha</button><div><h1>Paragraf & Problem</h1><p>Günlük soru takibi, net ve doğruluk analizi</p></div></div>${trackerTemplate()}`;
    more.append(panel);
    panel.querySelector<HTMLButtonElement>("[data-pp-back]")?.addEventListener("click",()=>{win.setMoreTab?.("home");});
  }
  if(!document.getElementById(LAUNCH_ID)){
    const launch=document.createElement("button");
    launch.id=LAUNCH_ID;
    launch.type="button";
    launch.className="pp-launch";
    launch.innerHTML=`<span class="pp-launch-icon" aria-hidden="true">P+</span><span class="pp-launch-copy"><strong>Paragraf & Problem</strong><span data-pp-launch-meta>Bugün kayıt yok</span><small data-pp-launch-sub>Günlük paragraf ve problem sonuçlarını kaydet</small></span><span class="pp-launch-arrow" aria-hidden="true">›</span>`;
    launch.addEventListener("click",()=>{
      if(win.__YKS_UI__?.openMore)win.__YKS_UI__.openMore("pp");
      else win.setMoreTab?.("pp");
    });
    home.append(launch);
  }
  return panel.querySelector<HTMLElement>(`#${ROOT_ID}`);
}

function installMoreRouting(root:HTMLElement):void{
  if(win.__PP_MORE_ROUTE_PATCHED__)return;
  const panel=document.getElementById(PANEL_ID) as HTMLElement|null;if(!panel)return;
  const legacySet=win.setMoreTab?.bind(win),legacyActive=win.activeMoreTab?.bind(win);
  win.setMoreTab=(value:string)=>{
    const target=String(value||"home");
    if(target==="pp"){
      const home=document.getElementById("v30MoreHome"),about=document.getElementById("v30AboutPanel");
      if(home)home.style.display="none";
      if(about)about.style.display="none";
      document.querySelectorAll<HTMLElement>("#more [id^='mrp_']").forEach(item=>{item.style.display=item.id===PANEL_ID?"block":"none";});
      document.querySelectorAll<HTMLElement>("#more [id^='mr_']").forEach(item=>item.classList.remove("on"));
      document.documentElement.dataset.activeMorePanel="pp";
      render(root);
      window.scrollTo({top:0,behavior:"auto"});
      return true;
    }
    panel.style.display="none";
    return legacySet?legacySet(target):undefined;
  };
  win.activeMoreTab=()=>panel.style.display!=="none"?"pp":legacyActive?.()||"home";
  win.__PP_MORE_ROUTE_PATCHED__=true;
}

export function installParagraphProblemTracker():{installed:boolean;entries:number}{
  const root=installDedicatedPanel();
  if(!root)return {installed:false,entries:0};
  installMoreRouting(root);
  if(!root.dataset.ppReady){
    root.dataset.ppReady="1";
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
  }
  render(root);document.documentElement.dataset.paragraphProblemTracker="ready";
  return {installed:true,entries:state()?.entries.length||0};
}
