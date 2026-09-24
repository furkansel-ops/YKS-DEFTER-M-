type LooseWindow=Window&Record<string,unknown>;
type ProgramState={
  rowLabels?:{r?:string[];s?:string[]};
  solved?:Record<string,number>;
  coachNotes?:Array<Record<string,unknown>>;
};
type Task={
  cell:HTMLElement;
  blk:"r"|"s";
  row:number;
  raw:string;
  subject:string;
  detail:string;
  minutes:number;
  time:string;
  done:boolean;
  tone:string;
  kind:string;
};

const DAYS=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const MONTHS=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
let selectedDay=(new Date().getDay()+6)%7;
let weekOffset=0;
let syncTimer=0;
let editing:Task|null=null;

function host():LooseWindow{return window as unknown as LooseWindow;}
function call(name:string,...args:unknown[]):unknown{
  const fn=host()[name];
  if(typeof fn!=="function")return undefined;
  try{return Reflect.apply(fn,window,args);}catch{return undefined;}
}
function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);return node instanceof HTMLElement?node as T:null;
}
function state():ProgramState{
  try{return (window.YKSLegacyState?.readState?.()||{}) as ProgramState;}catch{return {};}
}
function fill(node:Element,markup:string):void{node.insertAdjacentHTML("afterbegin",markup);}
function weekMonday(offset=weekOffset):Date{
  const d=new Date();d.setHours(12,0,0,0);
  d.setDate(d.getDate()-((d.getDay()+6)%7)+offset*7);
  return d;
}
function dayDate(day=selectedDay):Date{const d=weekMonday();d.setDate(d.getDate()+day);return d;}
function dateKey(d:Date):string{
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function tone(value:string):string{
  const x=value.toLocaleLowerCase("tr-TR");
  if(x.includes("matematik")||x.includes("geometri")||x.includes("problem"))return "math";
  if(x.includes("türk")||x.includes("paragraf")||x.includes("edebiyat"))return "turkish";
  if(x.includes("fizik"))return "physics";
  if(x.includes("kimya"))return "chemistry";
  if(x.includes("biyoloji"))return "biology";
  if(x.includes("deneme"))return "exam";
  return "other";
}
function icon(value:string):string{
  return value==="math"?"∑":value==="turkish"?"▤":value==="physics"?"⚛":value==="chemistry"?"⚗":value==="biology"?"⌁":value==="exam"?"≡":"•";
}
function kind(value:string):string{
  const x=value.toLocaleLowerCase("tr-TR");
  if(x.includes("deneme"))return "Deneme";
  if(x.includes("tekrar"))return "Konu Tekrarı";
  if(x.includes("soru")||x.includes("paragraf"))return "Soru Çözümü";
  return "Konu Çalışması";
}
function duration(value:string):number{
  const hour=value.match(/(\d+(?:[.,]\d+)?)\s*(?:sa|saat)\b/i);
  if(hour)return Math.max(5,Math.round(Number((hour[1]||"0").replace(",","."))*60));
  const min=value.match(/(\d{1,3})\s*(?:dk|dakika)\b/i);
  if(min)return Math.max(5,Number(min[1]||0));
  const x=value.toLocaleLowerCase("tr-TR");
  if(x.includes("deneme"))return 75;
  if(x.includes("soru")||x.includes("paragraf"))return 45;
  if(x.includes("tekrar"))return 35;
  return 50;
}
function optionalTime(value:string):string{
  return value.match(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/)?.[0]||"";
}
function cleanDetail(value:string):string{
  return value
    .replace(/\s*[·|•]?\s*\d+(?:[.,]\d+)?\s*(?:sa|saat)\b/ig," ")
    .replace(/\s*[·|•]?\s*\d{1,3}\s*(?:dk|dakika)\b/ig," ")
    .replace(/\s*[·|•]?\s*\b(?:[01]?\d|2[0-3]):[0-5]\d\b/ig," ")
    .replace(/\s{2,}/g," ").replace(/^[·|•\s-]+|[·|•\s-]+$/g,"").trim();
}
function fmtMinutes(value:number):string{
  if(value<60)return value+" dk";
  const h=Math.floor(value/60),m=value%60;return m?`${h} sa ${m} dk`:`${h} sa`;
}
function rowLabel(blk:"r"|"s",row:number):string{
  const labels=state().rowLabels?.[blk]||[];
  return String(labels[row]||(blk==="r"?"Rutin":"Görev")).trim()||"Görev";
}
function tasks(day=selectedDay):Task[]{
  const nodes=Array.from(document.querySelectorAll<HTMLElement>(`#gridR .gcell[data-plan-cell][data-d="${day}"],#gridS .gcell[data-plan-cell][data-d="${day}"]`));
  return nodes.map(cell=>{
    const blk=(cell.dataset.blk==="r"?"r":"s") as "r"|"s";
    const row=Number(cell.dataset.i||0);
    const raw=(cell.querySelector<HTMLElement>(".gtx")?.textContent||"").trim();
    const subject=rowLabel(blk,row),all=subject+" "+raw,t=tone(all);
    return {cell,blk,row,raw,subject,detail:cleanDetail(raw),minutes:duration(raw),time:optionalTime(raw),done:cell.classList.contains("cdone"),tone:t,kind:kind(raw)};
  }).filter(task=>task.raw);
}
function scheduleSync(delay=50):void{
  window.clearTimeout(syncTimer);
  syncTimer=window.setTimeout(sync,delay);
}
function writeCell(cell:HTMLElement,value:string):void{
  const target=cell.querySelector<HTMLElement>(".gtx");if(!target)return;
  target.textContent=value;
  target.dispatchEvent(new Event("input",{bubbles:true}));
  target.dispatchEvent(new Event("blur",{bubbles:true}));
}
function writeLabel(row:number,value:string):void{
  const target=document.querySelector<HTMLElement>(`#gridS .glabel[data-i="${row}"]`);if(!target)return;
  target.textContent=value;
  target.dispatchEvent(new Event("input",{bubbles:true}));
  target.dispatchEvent(new Event("blur",{bubbles:true}));
}
function createUi(program:HTMLElement):void{
  if(program.querySelector(".v45-program-shell"))return;
  const shell=document.createElement("div");
  shell.className="v45-program-shell";
  fill(shell,`
    <header class="v45-program-header">
      <div class="v45-brand-row">
        <div class="v45-brand"><i>Y</i><span><b>YKS <em>Defterim</em></b><small>Daha planlı, daha güçlü, daha sen.</small></span></div>
        <div class="v45-head-tools"><button type="button" data-v45-calendar>▣ <span>Takvim</span></button><button type="button" data-v45-legacy>•••</button></div>
      </div>
      <div class="v45-title-row"><div><h1>Programım</h1><p>Saatlere değil, hedeflerine göre ilerle.</p></div><button type="button" class="v45-today" data-v45-today>▣ Bugünün Planı</button></div>
      <div class="v45-week-nav"><button type="button" data-v45-prev aria-label="Önceki hafta">‹</button><div class="v45-week-days" data-v45-week-days></div><button type="button" data-v45-next aria-label="Sonraki hafta">›</button></div>
    </header>
    <section class="v45-program-hero">
      <div class="v45-hero-copy"><span>ESNEK ÇALIŞMA PLANI</span><h2>Görev sırasını takip et,<br>sürelerini sen yönet.</h2><p>İstersen saat ekle; programını saate kilitleme.</p></div>
      <div class="v45-progress-ring" data-v45-ring style="--v45-p:0deg"><b data-v45-pct>%0</b><small>Bugünkü<br>ilerleme</small></div>
      <div class="v45-hero-stats">
        <article><i>✓</i><span><b data-v45-count>0 görev</b><small data-v45-done>0 tamamlandı</small></span></article>
        <article><i>◷</i><span><b data-v45-duration>0 dk</b><small>Toplam tahmini süre</small></span></article>
        <article><i>◎</i><span><b data-v45-questions>0 soru</b><small>Bugünkü soru kaydı</small></span></article>
      </div>
    </section>
    <section class="v45-plan-card">
      <header><div><span>BUGÜNKÜ SIRA</span><h2 data-v45-day-title>Bugünkü Sıra</h2></div><div class="v45-plan-actions"><b data-v45-progress>0 / 0 tamamlandı</b><button type="button" data-v45-add>＋ Görev Ekle</button></div></header>
      <div class="v45-task-list" data-v45-task-list></div>
    </section>
    <section class="v45-bottom-cards">
      <article><i class="repeat">↻</i><div><span>Akıllı Tekrar</span><b data-v45-review>Bugün sana özel tekrar önerileri</b><small>Eksiklerini Konular ekranından tamamla.</small></div><button type="button" data-v45-topics>›</button></article>
      <article><i class="coach">✦</i><div><span>Koç Yorumu</span><b data-v45-coach>Koçundan gelen son not burada görünecek.</b><small>Program paylaşımı mevcut senkron hattını kullanır.</small></div><button type="button" data-v45-coach-open>›</button></article>
    </section>
    <footer class="v45-program-footer"><button type="button" data-v45-legacy>Klasik / gelişmiş plan araçları</button><small>Hazır kamp, şablonlar, haftayı kopyalama ve klasik tablo korunur.</small></footer>`);
  program.appendChild(shell);

  const editor=document.createElement("div");
  editor.className="v45-editor-overlay";
  editor.hidden=true;
  fill(editor,`<section class="v45-editor" role="dialog" aria-modal="true" aria-labelledby="v45EditorTitle"><header><div><span>GÖREV</span><h2 id="v45EditorTitle">Görevi düzenle</h2></div><button type="button" data-v45-close>×</button></header><label>Ders<input data-v45-subject maxlength="80" placeholder="Matematik"></label><label>Görev / konu<input data-v45-detail maxlength="220" placeholder="Trigonometri - Konu Çalışması"></label><div class="v45-editor-row"><label>Tahmini süre (dk)<input data-v45-minutes type="number" min="5" max="480" step="5" value="45"></label><label>Saat <small>(isteğe bağlı)</small><input data-v45-time type="time"></label></div><div class="v45-editor-actions"><button type="button" data-v45-cancel>Vazgeç</button><button type="button" data-v45-save>Kaydet</button></div></section>`);
  program.appendChild(editor);

  const back=document.createElement("button");
  back.type="button";back.className="v45-return";back.textContent="← Yeni Programım görünümüne dön";back.hidden=true;
  program.appendChild(back);
  bindUi(program);
}
function openEditor(program:HTMLElement,task:Task|null):void{
  editing=task;
  const overlay=program.querySelector<HTMLElement>(".v45-editor-overlay");
  const subject=program.querySelector<HTMLInputElement>("[data-v45-subject]");
  const detail=program.querySelector<HTMLInputElement>("[data-v45-detail]");
  const minutes=program.querySelector<HTMLInputElement>("[data-v45-minutes]");
  const time=program.querySelector<HTMLInputElement>("[data-v45-time]");
  const title=program.querySelector<HTMLElement>("#v45EditorTitle");
  if(title)title.textContent=task?"Görevi düzenle":"Yeni görev ekle";
  if(subject){subject.value=task?.subject||"";subject.disabled=task?.blk==="r";}
  if(detail)detail.value=task?.detail||"";
  if(minutes)minutes.value=String(task?.minutes||45);
  if(time)time.value=task?.time||"";
  if(overlay){overlay.hidden=false;requestAnimationFrame(()=>subject?.focus());}
}
function closeEditor(program:HTMLElement):void{
  const overlay=program.querySelector<HTMLElement>(".v45-editor-overlay");if(overlay)overlay.hidden=true;
  editing=null;
}
function saveEditor(program:HTMLElement):void{
  const subject=(program.querySelector<HTMLInputElement>("[data-v45-subject]")?.value||"").trim();
  const detail=(program.querySelector<HTMLInputElement>("[data-v45-detail]")?.value||"").trim();
  const minutes=Math.max(5,Number(program.querySelector<HTMLInputElement>("[data-v45-minutes]")?.value||45));
  const time=(program.querySelector<HTMLInputElement>("[data-v45-time]")?.value||"").trim();
  if(!detail){call("toast","Görev açıklaması boş olamaz");return;}
  const value=[detail,`${minutes} dk`,time].filter(Boolean).join(" · ");
  if(editing){
    if(editing.blk==="s"&&subject&&subject!==editing.subject)writeLabel(editing.row,subject);
    writeCell(editing.cell,value);
    closeEditor(program);scheduleSync(100);return;
  }
  const cells=Array.from(document.querySelectorAll<HTMLElement>(`#gridS .gcell[data-plan-cell][data-d="${selectedDay}"]`));
  const labels=state().rowLabels?.s||[];
  let target=cells.find(cell=>{
    const row=Number(cell.dataset.i||0),label=String(labels[row]||"").trim();
    const empty=!String(cell.querySelector(".gtx")?.textContent||"").trim();
    return empty&&label&&label.toLocaleLowerCase("tr-TR")===subject.toLocaleLowerCase("tr-TR");
  });
  if(!target)target=cells.find(cell=>{
    const row=Number(cell.dataset.i||0),label=String(labels[row]||"").trim();
    return !label&&!String(cell.querySelector(".gtx")?.textContent||"").trim();
  });
  if(!target){call("addRow","s");window.setTimeout(()=>{openEditor(program,null);const a=program.querySelector<HTMLInputElement>("[data-v45-subject]"),b=program.querySelector<HTMLInputElement>("[data-v45-detail]"),m=program.querySelector<HTMLInputElement>("[data-v45-minutes]"),t=program.querySelector<HTMLInputElement>("[data-v45-time]");if(a)a.value=subject;if(b)b.value=detail;if(m)m.value=String(minutes);if(t)t.value=time;},80);return;}
  const row=Number(target.dataset.i||0);
  if(subject)writeLabel(row,subject);
  writeCell(target,value);
  closeEditor(program);scheduleSync(120);
}
function showLegacy(program:HTMLElement,calendar=false):void{
  program.classList.add("v45-legacy-open");
  const back=program.querySelector<HTMLButtonElement>(".v45-return");if(back)back.hidden=false;
  call("setProgTab",calendar?"cal":"week");
}
function hideLegacy(program:HTMLElement):void{
  program.classList.remove("v45-legacy-open");
  const back=program.querySelector<HTMLButtonElement>(".v45-return");if(back)back.hidden=true;
  call("setProgTab","week");scheduleSync();
}
function bindUi(program:HTMLElement):void{
  program.addEventListener("click",event=>{
    const target=event.target as Element;
    const day=target.closest<HTMLButtonElement>("[data-v45-day]");
    if(day){selectedDay=Number(day.dataset.v45Day||0);sync();return;}
    if(target.closest("[data-v45-prev]")){weekOffset--;selectedDay=0;call("shiftWeek",-1);scheduleSync(100);return;}
    if(target.closest("[data-v45-next]")){weekOffset++;selectedDay=0;call("shiftWeek",1);scheduleSync(100);return;}
    if(target.closest("[data-v45-today]")){weekOffset=0;selectedDay=(new Date().getDay()+6)%7;call("thisWeek");scheduleSync(100);return;}
    if(target.closest("[data-v45-calendar]")){showLegacy(program,true);return;}
    if(target.closest("[data-v45-legacy]")){showLegacy(program,false);return;}
    if(target.closest(".v45-return")){hideLegacy(program);return;}
    if(target.closest("[data-v45-add]")){openEditor(program,null);return;}
    const edit=target.closest<HTMLButtonElement>("[data-v45-edit]");
    if(edit){openEditor(program,tasks()[Number(edit.dataset.v45Edit||0)]||null);return;}
    const done=target.closest<HTMLButtonElement>("[data-v45-done]");
    if(done){tasks()[Number(done.dataset.v45Done||0)]?.cell.querySelector<HTMLButtonElement>(".tick")?.click();scheduleSync(90);return;}
    if(target.closest("[data-v45-start]")){call("go","pomo");return;}
    if(target.closest("[data-v45-topics]")){call("go","topics");return;}
    if(target.closest("[data-v45-coach-open]")){call("go","more");return;}
    if(target.closest("[data-v45-close]")||target.closest("[data-v45-cancel]")){closeEditor(program);return;}
    if(target.closest("[data-v45-save]")){saveEditor(program);return;}
  });
  program.querySelector(".v45-editor-overlay")?.addEventListener("click",event=>{if(event.target===event.currentTarget)closeEditor(program);});
}
function renderWeek(shell:HTMLElement):void{
  const root=shell.querySelector<HTMLElement>("[data-v45-week-days]");if(!root)return;
  root.replaceChildren();
  const start=weekMonday();
  for(let i=0;i<7;i++){
    const date=new Date(start);date.setDate(start.getDate()+i);
    const button=document.createElement("button");
    button.type="button";button.dataset.v45Day=String(i);if(i===selectedDay)button.className="active";
    fill(button,`<small>${DAYS[i]}</small><b>${date.getDate()}</b><i></i>`);
    root.appendChild(button);
  }
}
function renderTasks(shell:HTMLElement):void{
  const root=shell.querySelector<HTMLElement>("[data-v45-task-list]");if(!root)return;
  const list=tasks(),done=list.filter(task=>task.done).length,total=list.reduce((sum,task)=>sum+task.minutes,0),pct=list.length?Math.round(done/list.length*100):0;
  const set=(selector:string,value:string)=>{const node=shell.querySelector<HTMLElement>(selector);if(node)node.textContent=value;};
  set("[data-v45-pct]","%"+pct);
  set("[data-v45-count]",list.length+" görev");
  set("[data-v45-done]",done+" tamamlandı");
  set("[data-v45-duration]",fmtMinutes(total));
  set("[data-v45-progress]",done+" / "+list.length+" tamamlandı");
  const ring=shell.querySelector<HTMLElement>("[data-v45-ring]");if(ring)ring.style.setProperty("--v45-p",(pct*3.6)+"deg");
  const date=dayDate();
  set("[data-v45-day-title]",`${date.getDate()} ${MONTHS[date.getMonth()]} · ${DAYS[(date.getDay()+6)%7]}`);
  set("[data-v45-questions]",Math.max(0,Number(state().solved?.[dateKey(date)])||0)+" soru");
  root.replaceChildren();
  if(!list.length){
    const empty=document.createElement("div");empty.className="v45-empty";
    fill(empty,'<i>＋</i><b>Bu gün için görev yok.</b><span>Görev ekleyip süre belirleyebilirsin; saat vermek zorunda değilsin.</span><button type="button" data-v45-add>İlk görevi ekle</button>');
    root.appendChild(empty);return;
  }
  const current=list.findIndex(task=>!task.done);
  list.forEach((task,index)=>{
    const item=document.createElement("article");
    item.className="v45-task";item.dataset.tone=task.tone;
    if(task.done)item.classList.add("done");if(index===current)item.classList.add("current");
    fill(item,`<span class="v45-order">${index+1}</span><button type="button" class="v45-check" data-v45-done="${index}" aria-label="Tamamlandı durumunu değiştir">${task.done?"✓":""}</button><i class="v45-subject-icon">${icon(task.tone)}</i><div class="v45-task-copy"><b></b><span></span><em></em></div><div class="v45-task-meta"><span>◷ ${fmtMinutes(task.minutes)}</span>${task.time?`<span class="time">▣ ${task.time}</span>`:`<button type="button" data-v45-edit="${index}">▣ Saat ekle</button>`}</div><div class="v45-task-end">${task.done?'<span class="v45-done-chip">✓ Tamamlandı</span>':index===current?'<button type="button" class="v45-start" data-v45-start>▶ Şimdi Başla</button>':""}<button type="button" class="v45-edit" data-v45-edit="${index}" aria-label="Görevi düzenle">›</button></div>`);
    item.querySelector<HTMLElement>(".v45-task-copy b")!.textContent=task.subject;
    item.querySelector<HTMLElement>(".v45-task-copy span")!.textContent=task.detail||task.raw;
    item.querySelector<HTMLElement>(".v45-task-copy em")!.textContent=task.kind;
    root.appendChild(item);
  });
}
function renderInsights(shell:HTMLElement):void{
  const review=(byId("todayHubReview")?.textContent||"").trim();
  const reviewNode=shell.querySelector<HTMLElement>("[data-v45-review]");
  if(reviewNode)reviewNode.textContent=review&&review!=="0"?review+" tekrar seni bekliyor":"Bugün sana özel tekrar önerileri";
  const notes=state().coachNotes||[];
  const last=[...notes].sort((a,b)=>Number(b["at"]||b["updatedAt"]||0)-Number(a["at"]||a["updatedAt"]||0))[0];
  const note=String(last?.["text"]??last?.["note"]??"").trim();
  const coach=shell.querySelector<HTMLElement>("[data-v45-coach]");
  if(coach)coach.textContent=note?note.slice(0,130)+(note.length>130?"…":""):"Koçundan gelen son not burada görünecek.";
}
function sync():void{
  const program=byId("program"),shell=program?.querySelector<HTMLElement>(".v45-program-shell");
  if(!program||!shell)return;
  renderWeek(shell);renderTasks(shell);renderInsights(shell);
}
function installProgramFlex():void{
  const program=byId("program");if(!program)return;
  if(program.dataset.v45Flex!=="ready"){
    createUi(program);program.dataset.v45Flex="ready";
    for(const id of ["gridR","gridS"]){
      const node=byId(id);if(node)new MutationObserver(()=>scheduleSync(70)).observe(node,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["class"]});
    }
    window.addEventListener("yks:data-changed",()=>scheduleSync(80));
  }
  scheduleSync(20);
}


export function installProgramFlexV45():void{
  installProgramFlex();
}
