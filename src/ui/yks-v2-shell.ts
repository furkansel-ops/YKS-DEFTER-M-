import "./yks-v2-shell.css";

type CatalogItem={exam?:string;name?:string;topics?:string[]};
type LegacyWeek={
  r:string[][];
  s:string[][];
  done:boolean[];
  dn:Record<string,unknown>;
  mv?:Record<string,unknown>;
};
type LegacyState={
  name?:string;
  rows?:{r:number;s:number};
  rowLabels?:{r:string[];s:string[]};
  weeks?:Record<string,LegacyWeek>;
};
type LegacyApi={
  readState?:()=>LegacyState|null|undefined;
  save?:()=>unknown;
  subjects?:()=>CatalogItem[];
};
type LegacyWindow=Window&{
  YKSLegacyState?:LegacyApi;
  renderPlan?:()=>void;
  renderTodayPlan?:()=>void;
  renderHome?:()=>void;
  toast?:(message:string)=>void;
};

type Goal="TYT"|"TYT+AYT"|"AYT";
type PlannerSubject={id:string;name:string;exam:string;topics:string[]};
type PlannerPrefs={
  goal:Goal;
  selected:Set<string>;
  daily:number;
  mathDaily:boolean;
  noTripleScience:boolean;
  lightWeekend:boolean;
  review:boolean;
  replace:boolean;
};
type PlannedTask={subject:string;topic:string;text:string};

const VERSION="2.0.0";
const MAX_ROWS=20;
const DAYS=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const DAY_NAMES=["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
const SCIENCE=["fizik","kimya","biyoloji"];

declare global{
  interface Window{
    __YKS_V2_SHELL__?:{
      installed:true;
      version:string;
      openPlanner:()=>void;
      refresh:()=>void;
    };
  }
}

function win():LegacyWindow{return window as LegacyWindow;}
function legacyApi():LegacyApi|undefined{
  return (window as unknown as {YKSLegacyState?:LegacyApi}).YKSLegacyState;
}
function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}
function esc(value:unknown):string{
  return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]||ch));
}
function norm(value:unknown):string{
  return String(value??"").trim().toLocaleLowerCase("tr-TR");
}
function mondayKey(date=new Date()):string{
  const d=new Date(date);
  d.setHours(12,0,0,0);
  const dow=(d.getDay()+6)%7;
  d.setDate(d.getDate()-dow);
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function blankWeek(rows:{r:number;s:number}):LegacyWeek{
  return {
    r:Array.from({length:rows.r},()=>new Array(7).fill("")),
    s:Array.from({length:rows.s},()=>new Array(7).fill("")),
    done:new Array(7).fill(false),
    dn:{},
    mv:{}
  };
}
function state():LegacyState|null{
  try{return legacyApi()?.readState?.()??null;}catch{return null;}
}
function catalogs():PlannerSubject[]{
  let raw:CatalogItem[]=[];
  try{raw=legacyApi()?.subjects?.()??[];}catch{}
  const map=new Map<string,PlannerSubject>();
  raw.forEach((item,index)=>{
    const name=String(item.name||"").trim();
    const exam=String(item.exam||"TYT").trim().toUpperCase();
    if(!name)return;
    const id=`${exam}|${name}`;
    if(map.has(id))return;
    map.set(id,{id,name,exam,topics:Array.isArray(item.topics)?item.topics.map(String):[],});
    if(index>400)return;
  });
  return [...map.values()];
}
function isMath(name:string):boolean{return norm(name).includes("matematik");}
function isScience(name:string):boolean{return SCIENCE.some(x=>norm(name).includes(x));}
function goalAllows(subject:PlannerSubject,goal:Goal):boolean{
  if(goal==="TYT")return subject.exam==="TYT";
  if(goal==="AYT")return subject.exam==="AYT";
  return subject.exam==="TYT"||subject.exam==="AYT";
}
function defaultSelection(subjects:PlannerSubject[],goal:Goal):Set<string>{
  const wanted=["matematik","fizik","kimya","biyoloji"];
  const selected=new Set<string>();
  subjects.filter(s=>goalAllows(s,goal)).forEach(s=>{
    const n=norm(s.name);
    if(wanted.some(x=>n.includes(x)))selected.add(s.id);
  });
  if(!selected.size)subjects.filter(s=>goalAllows(s,goal)).slice(0,4).forEach(s=>selected.add(s.id));
  return selected;
}
function topicFor(subject:PlannerSubject,cursors:Map<string,number>):string{
  if(!subject.topics.length)return "";
  const cursor=cursors.get(subject.id)||0;
  const topic=subject.topics[cursor%subject.topics.length]||"";
  cursors.set(subject.id,cursor+1);
  return topic;
}
function buildPreview(subjects:PlannerSubject[],prefs:PlannerPrefs):PlannedTask[][]{
  const picked=subjects.filter(s=>prefs.selected.has(s.id)&&goalAllows(s,prefs.goal));
  const days:Array<PlannedTask[]> = Array.from({length:7},()=>[]);
  if(!picked.length)return days;
  const math=picked.find(s=>isMath(s.name))||null;
  const others=picked.filter(s=>s!==math);
  const cursors=new Map<string,number>();
  let rotate=0;
  for(let day=0;day<7;day++){
    const dayTasks=days[day]!;
    const target=Math.max(1,prefs.lightWeekend&&day>=5?prefs.daily-1:prefs.daily);
    const used=new Set<string>();
    if(prefs.mathDaily&&math){
      const topic=topicFor(math,cursors);
      dayTasks.push({subject:math.name,topic,text:topic?`${math.name} · ${topic}`:math.name});
      used.add(math.id);
    }
    let guard=0;
    while(dayTasks.length<target&&guard<100){
      guard++;
      const pool=others.length?others:picked;
      const candidate=pool[rotate%pool.length];
      rotate++;
      if(!candidate)break;
      const duplicate=used.has(candidate.id);
      if(duplicate&&pool.length>dayTasks.length)continue;
      if(prefs.noTripleScience&&isScience(candidate.name)&&dayTasks.filter(t=>isScience(t.subject)).length>=2)continue;
      const topic=topicFor(candidate,cursors);
      dayTasks.push({subject:candidate.name,topic,text:topic?`${candidate.name} · ${topic}`:candidate.name});
      used.add(candidate.id);
    }
    if(prefs.review&&(day===1||day===3||day===6)){
      dayTasks.push({subject:"Tekrar",topic:"Günlük kısa tekrar",text:"Tekrar · Günlük kısa tekrar"});
    }
  }
  return days;
}
function ensureStateShape(s:LegacyState):{rows:{r:number;s:number};weeks:Record<string,LegacyWeek>;labels:{r:string[];s:string[]}}{
  if(!s.rows)s.rows={r:2,s:4};
  if(!s.rowLabels)s.rowLabels={r:[],s:[]};
  if(!s.weeks)s.weeks={};
  s.rows.r=Math.max(1,Math.min(MAX_ROWS,Number(s.rows.r)||2));
  s.rows.s=Math.max(1,Math.min(MAX_ROWS,Number(s.rows.s)||4));
  while(s.rowLabels.r.length<s.rows.r)s.rowLabels.r.push("");
  while(s.rowLabels.s.length<s.rows.s)s.rowLabels.s.push("");
  return {rows:s.rows,weeks:s.weeks,labels:s.rowLabels};
}
function normalizeWeek(week:LegacyWeek,rows:{r:number;s:number}):LegacyWeek{
  if(!Array.isArray(week.r))week.r=[];
  if(!Array.isArray(week.s))week.s=[];
  if(!Array.isArray(week.done))week.done=[];
  if(!week.dn||typeof week.dn!=="object")week.dn={};
  if(!week.mv||typeof week.mv!=="object")week.mv={};
  while(week.r.length<rows.r)week.r.push(new Array(7).fill(""));
  while(week.s.length<rows.s)week.s.push(new Array(7).fill(""));
  week.r.forEach(row=>{while(row.length<7)row.push("");});
  week.s.forEach(row=>{while(row.length<7)row.push("");});
  while(week.done.length<7)week.done.push(false);
  return week;
}
function appendStudyRow(s:LegacyState,shape:ReturnType<typeof ensureStateShape>):boolean{
  if(shape.rows.s>=MAX_ROWS)return false;
  const next=shape.rows.s++;
  shape.labels.s.push(`${next+1}. Oturum`);
  Object.values(shape.weeks).forEach(week=>{
    if(!week||typeof week!=="object")return;
    normalizeWeek(week,shape.rows);
  });
  return true;
}
function clearStudyWeek(week:LegacyWeek):void{
  week.s.forEach(row=>row.fill(""));
  week.done=new Array(7).fill(false);
  Object.keys(week.dn).forEach(key=>{if(key.startsWith("s-"))delete week.dn[key];});
  if(week.mv)Object.keys(week.mv).forEach(key=>{if(key.startsWith("s-"))delete week.mv![key];});
}
function applyPreview(preview:PlannedTask[][],prefs:PlannerPrefs):{added:number;skipped:number}{
  const s=state();
  if(!s)return {added:0,skipped:preview.flat().length};
  const shape=ensureStateShape(s);
  const key=mondayKey();
  let week=shape.weeks[key];
  if(!week){week=blankWeek(shape.rows);shape.weeks[key]=week;}
  week=normalizeWeek(week,shape.rows);
  if(prefs.replace)clearStudyWeek(week);
  let added=0,skipped=0;
  for(let day=0;day<7;day++){
    for(const task of preview[day]??[]){
      let row=week.s.findIndex(items=>!String(items[day]||"").trim());
      if(row<0){
        if(!appendStudyRow(s,shape)){skipped++;continue;}
        week=normalizeWeek(week,shape.rows);
        row=week.s.findIndex(items=>!String(items[day]||"").trim());
      }
      if(row<0){skipped++;continue;}
      const targetRow=week.s[row];
      if(!targetRow){skipped++;continue;}
      targetRow[day]=task.text;
      week.done[day]=false;
      delete week.dn[`s-${row}-${day}`];
      if(week.mv)delete week.mv[`s-${row}-${day}`];
      added++;
    }
  }
  legacyApi()?.save?.();
  try{win().renderPlan?.();win().renderTodayPlan?.();win().renderHome?.();}catch{}
  return {added,skipped};
}
function subjectTone(name:string):string{
  const n=norm(name);
  if(n.includes("matematik"))return "math";
  if(n.includes("fizik"))return "physics";
  if(n.includes("kimya"))return "chemistry";
  if(n.includes("biyoloji"))return "biology";
  if(n.includes("türk"))return "turkish";
  return "other";
}
function focusFirstEmptyCell():void{
  const target=document.querySelector<HTMLElement>("#gridS .gtx");
  if(!target)return;
  target.scrollIntoView({behavior:"smooth",block:"center"});
  requestAnimationFrame(()=>target.focus());
}
function installProgramHeader():void{
  const program=byId("program");
  const seg=byId("pSegWeek")?.parentElement;
  if(!program||!seg||program.querySelector("[data-yks-v2-program-head]"))return;
  const head=document.createElement("section");
  head.className="yks-v2-program-head";
  head.dataset.yksV2ProgramHead="true";
  head.innerHTML=`
    <div class="yks-v2-program-copy">
      <span class="yks-v2-eyebrow">PROGRAMIM</span>
      <h1>Haftanı daha kolay kur</h1>
      <p>İstersen kendin düzenle, istersen birkaç tercihle dengeli bir taslak oluştur.</p>
    </div>
    <div class="yks-v2-program-actions">
      <button type="button" class="btn ghost" data-yks-v2-manual>Kendim oluştur</button>
      <button type="button" class="btn green" data-yks-v2-smart>Akıllı oluştur</button>
    </div>`;
  seg.insertAdjacentElement("beforebegin",head);
  head.querySelector("[data-yks-v2-manual]")?.addEventListener("click",focusFirstEmptyCell);
  head.querySelector("[data-yks-v2-smart]")?.addEventListener("click",openPlanner);
}
function installScreenMarkers():void{
  byId("home")?.classList.add("yks-v2-home");
  byId("program")?.classList.add("yks-v2-program");
  byId("pomo")?.classList.add("yks-v2-focus");
  byId("progress")?.classList.add("yks-v2-progress");
  byId("more")?.classList.add("yks-v2-more");
}
function createModal():HTMLElement{
  let modal=byId("yksV2Planner");
  if(modal)return modal;
  modal=document.createElement("div");
  modal.id="yksV2Planner";
  modal.className="yks-v2-planner";
  modal.hidden=true;
  modal.setAttribute("role","dialog");
  modal.setAttribute("aria-modal","true");
  modal.setAttribute("aria-label","Akıllı program oluştur");
  document.body.appendChild(modal);
  return modal;
}
function openPlanner():void{
  const modal=createModal();
  const subjects=catalogs();
  const prefs:PlannerPrefs={
    goal:"TYT+AYT",
    selected:defaultSelection(subjects,"TYT+AYT"),
    daily:3,
    mathDaily:true,
    noTripleScience:true,
    lightWeekend:true,
    review:true,
    replace:false
  };
  let step=1;
  let preview:PlannedTask[][]=[];
  const close=()=>{modal.hidden=true;modal.innerHTML="";document.documentElement.classList.remove("yks-v2-modal-open");};
  const render=()=>{
    modal.hidden=false;
    document.documentElement.classList.add("yks-v2-modal-open");
    const progress=(step/4)*100;
    const allowed=subjects.filter(s=>goalAllows(s,prefs.goal));
    const selected=allowed.filter(s=>prefs.selected.has(s.id));
    const stepBody=step===1?`
      <div class="yks-v2-wizard-intro">
        <span class="yks-v2-eyebrow">1 · HEDEF</span>
        <h2>Nasıl bir hafta istiyorsun?</h2>
        <p>Bu seçim yalnızca taslağın ders havuzunu belirler. Son adımda programı görmeden hiçbir şey kaydedilmez.</p>
      </div>
      <div class="yks-v2-choice-grid">
        ${(["TYT","TYT+AYT","AYT"] as Goal[]).map(goal=>`<button type="button" class="yks-v2-choice ${prefs.goal===goal?"is-selected":""}" data-goal="${goal}"><b>${goal}</b><span>${goal==="TYT"?"Temel konulara odaklan":goal==="AYT"?"Alan çalışmalarına odaklan":"Dengeli ve uzun vadeli ilerle"}</span></button>`).join("")}
      </div>`
    :step===2?`
      <div class="yks-v2-wizard-intro"><span class="yks-v2-eyebrow">2 · DERSLER</span><h2>Bu hafta hangi dersler var?</h2><p>Dersleri seç. Konular katalog sırasından dengeli biçimde ilerletilir; sonrasında hücrelerden dilediğini değiştirebilirsin.</p></div>
      <div class="yks-v2-subject-grid">
        ${allowed.map(subject=>`<button type="button" class="yks-v2-subject ${prefs.selected.has(subject.id)?"is-selected":""}" data-subject="${esc(subject.id)}" data-tone="${subjectTone(subject.name)}"><span class="yks-v2-subject-icon">${esc(subject.name.slice(0,1))}</span><span><b>${esc(subject.name)}</b><small>${esc(subject.exam)} · ${subject.topics.length} konu</small></span><i>✓</i></button>`).join("")}
      </div>`
    :step===3?`
      <div class="yks-v2-wizard-intro"><span class="yks-v2-eyebrow">3 · ZAMAN</span><h2>Programın ritmini ayarla</h2><p>Seçtiğin ${selected.length} ders haftaya dengeli biçimde dağıtılacak.</p></div>
      <div class="yks-v2-load-grid">
        ${[2,3,4,5].map(n=>`<button type="button" class="yks-v2-load ${prefs.daily===n?"is-selected":""}" data-daily="${n}"><b>${n}</b><span>görev / gün</span></button>`).join("")}
      </div>
      <div class="yks-v2-pref-list">
        ${([
          ["mathDaily","Matematik her gün olsun","Matematik seçiliyse her güne bir blok ekler."],
          ["noTripleScience","Fizik, Kimya, Biyoloji aynı güne yığılmasın","Bir günde en fazla iki fen dersi olacak şekilde dengeler."],
          ["lightWeekend","Hafta sonu daha hafif olsun","Cumartesi ve pazar günlük yükü bir azaltır."],
          ["review","Kısa tekrarlar ekle","Salı, perşembe ve pazara kısa tekrar bloğu ekler."],
          ["replace","Mevcut ders programını değiştir","Kapalıysa yalnız boş hücrelere ekler; rutinlere dokunmaz."]
        ] as const).map(([key,title,copy])=>`<label class="yks-v2-pref"><span><b>${title}</b><small>${copy}</small></span><input type="checkbox" data-pref="${key}" ${(prefs as unknown as Record<string,boolean>)[key]?"checked":""}></label>`).join("")}
      </div>`
    :`
      <div class="yks-v2-wizard-intro"><span class="yks-v2-eyebrow">4 · ÖNİZLEME</span><h2>Haftan hazır</h2><p>Programı kaydetmeden önce dağılımı kontrol et. Beğenmezsen geri dönüp yoğunluğu veya dersleri değiştirebilirsin.</p></div>
      <div class="yks-v2-preview">
        ${preview.map((tasks,day)=>`<article><header><b>${DAY_NAMES[day]??""}</b><span>${tasks.length} görev</span></header><div>${tasks.map(task=>`<span class="yks-v2-task" data-tone="${subjectTone(task.subject)}"><i></i><span><b>${esc(task.subject)}</b><small>${esc(task.topic||"Genel çalışma")}</small></span></span>`).join("")||'<em>Boş gün</em>'}</div></article>`).join("")}
      </div>`;
    modal.innerHTML=`
      <div class="yks-v2-planner-backdrop" data-close></div>
      <section class="yks-v2-planner-card">
        <header class="yks-v2-planner-top">
          <div><b>Program Oluştur</b><span>${step}/4</span></div>
          <button type="button" aria-label="Kapat" data-close>×</button>
        </header>
        <div class="yks-v2-stepbar"><i style="width:${progress}%"></i></div>
        <main>${stepBody}</main>
        <footer>
          <button type="button" class="btn ghost" data-back ${step===1?"disabled":""}>Geri</button>
          <button type="button" class="btn green" data-next>${step===4?"Bu programı kullan":"Devam et"}</button>
        </footer>
      </section>`;
    modal.querySelectorAll("[data-close]").forEach(node=>node.addEventListener("click",close));
    modal.querySelectorAll<HTMLElement>("[data-goal]").forEach(node=>node.addEventListener("click",()=>{
      const value=node.dataset.goal as Goal;
      prefs.goal=value;
      prefs.selected=defaultSelection(subjects,value);
      render();
    }));
    modal.querySelectorAll<HTMLElement>("[data-subject]").forEach(node=>node.addEventListener("click",()=>{
      const id=node.dataset.subject||"";
      if(prefs.selected.has(id))prefs.selected.delete(id);else prefs.selected.add(id);
      render();
    }));
    modal.querySelectorAll<HTMLElement>("[data-daily]").forEach(node=>node.addEventListener("click",()=>{
      prefs.daily=Math.max(2,Math.min(5,Number(node.dataset.daily)||3));
      render();
    }));
    modal.querySelectorAll<HTMLInputElement>("[data-pref]").forEach(input=>input.addEventListener("change",()=>{
      const key=input.dataset.pref as keyof PlannerPrefs;
      if(typeof prefs[key]==="boolean")(prefs as unknown as Record<string,unknown>)[key]=input.checked;
    }));
    modal.querySelector<HTMLButtonElement>("[data-back]")?.addEventListener("click",()=>{if(step>1){step--;render();}});
    modal.querySelector<HTMLButtonElement>("[data-next]")?.addEventListener("click",()=>{
      if(step===2&&!prefs.selected.size){win().toast?.("En az bir ders seç");return;}
      if(step<4){if(step===3)preview=buildPreview(subjects,prefs);step++;render();return;}
      const result=applyPreview(preview,prefs);
      close();
      if(result.added){
        win().toast?.(`${result.added} görev Programım'a eklendi${result.skipped?` · ${result.skipped} görev sığmadı`:""} ✓`);
        document.querySelector("#program")?.scrollIntoView({behavior:"smooth",block:"start"});
      }else win().toast?.("Program eklenemedi; boş satır veya ders seçimini kontrol et");
    });
  };
  render();
}
function refresh():void{
  document.documentElement.classList.add("yks-v2");
  document.documentElement.dataset.yksV2Shell="ready";
  installScreenMarkers();
  installProgramHeader();
}
export function installYksV2Shell():{installed:true;version:string;openPlanner:()=>void;refresh:()=>void}{
  if(window.__YKS_V2_SHELL__)return window.__YKS_V2_SHELL__;
  refresh();
  let queued=false;
  const schedule=()=>{
    if(queued)return;
    queued=true;
    queueMicrotask(()=>{queued=false;refresh();});
  };
  window.addEventListener("yks:navigation-after",schedule);
  window.addEventListener("yks:data-changed",schedule);
  const observer=new MutationObserver(schedule);
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
  const api={installed:true as const,version:VERSION,openPlanner,refresh};
  window.__YKS_V2_SHELL__=api;
  return api;
}
