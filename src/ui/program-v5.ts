import "./program-v5.css";

type LegacyProgramWindow=Window&{
  thisWeek?:()=>unknown;
  shiftWeek?:(n:number)=>unknown;
  setProgTab?:(tab:"week"|"cal")=>unknown;
};

const DAYS=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const MONTHS=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}

function norm(value:unknown):string{
  return String(value??"").trim().toLocaleLowerCase("tr-TR");
}

function monday(date=new Date()):Date{
  const d=new Date(date);
  d.setHours(12,0,0,0);
  const offset=(d.getDay()+6)%7;
  d.setDate(d.getDate()-offset);
  return d;
}

function tone(text:string):string{
  const value=norm(text);
  if(value.includes("matematik"))return"math";
  if(value.includes("fizik"))return"physics";
  if(value.includes("kimya"))return"chemistry";
  if(value.includes("biyoloji"))return"biology";
  if(value.includes("türk"))return"turkish";
  if(value.includes("mola"))return"break";
  if(value.includes("soru")||value.includes("deneme"))return"practice";
  return"other";
}

function splitTask(text:string):{title:string;sub:string}{
  const clean=String(text||"").trim();
  if(!clean)return {title:"",sub:""};
  const parts=clean.split(/\s*[·|:]\s*|\s+-\s+/).filter(Boolean);
  if(parts.length===1)return {title:parts[0]||clean,sub:""};
  return {title:parts[0]||clean,sub:parts.slice(1).join(" · ")};
}

function sectionForGrid(gridId:string,title:string,copy:string):HTMLElement|null{
  const grid=byId(gridId);
  const scroller=grid?.closest(".scroller");
  if(!(scroller instanceof HTMLElement))return null;
  if(scroller.parentElement?.classList.contains("v5-program-block"))return scroller.parentElement;

  const tools=scroller.nextElementSibling instanceof HTMLElement&&scroller.nextElementSibling.classList.contains("rowtools")
    ?scroller.nextElementSibling
    :null;

  const section=document.createElement("section");
  section.className="v5-program-block";
  section.dataset.grid=gridId;

  const head=document.createElement("div");
  head.className="v5-program-block-head";
  head.innerHTML='<div><span>'+title.toUpperCase()+'</span><h2>'+title+'</h2></div><p>'+copy+'</p>';

  scroller.insertAdjacentElement("beforebegin",section);
  section.append(head,scroller);
  if(tools)section.appendChild(tools);
  return section;
}

function installWeekStructure(week:HTMLElement):void{
  if(week.querySelector("[data-v5-program-week-head]"))return;

  const title=week.querySelector<HTMLElement>(":scope > .plantitle");
  const weeknav=week.querySelector<HTMLElement>(":scope > .weeknav");
  const overview=byId("programWeekOverview");
  if(title||weeknav||overview){
    const head=document.createElement("section");
    head.className="v5-program-week-head";
    head.dataset.v5ProgramWeekHead="true";

    const copy=document.createElement("div");
    copy.className="v5-program-week-copy";
    copy.innerHTML='<span>HAFTALIK PLAN</span><h2>Bu haftayı yönet</h2><p>Rutinlerini ve ders programını aynı hafta üzerinde düzenle.</p>';
    head.appendChild(copy);

    const controls=document.createElement("div");
    controls.className="v5-program-week-controls";
    if(title)controls.appendChild(title);
    if(weeknav)controls.appendChild(weeknav);
    if(overview)controls.appendChild(overview);
    head.appendChild(controls);
    week.prepend(head);
  }

  sectionForGrid("gridR","Rutinler","Okul, kurs, spor ve değişmeyen günlük blokların.");
  sectionForGrid("gridS","Ders Programım","Çalışacağın ders ve konuları doğrudan hücrelere yaz.");
}

function createHeader(program:HTMLElement):HTMLElement{
  const existing=program.querySelector<HTMLElement>("[data-v5-program-header]");
  if(existing)return existing;

  const head=document.createElement("header");
  head.className="v5-program-header";
  head.dataset.v5ProgramHeader="true";
  head.innerHTML=
    '<div class="v5-program-header-copy">'+
      '<span>PROGRAMIM</span>'+
      '<h1>Programım</h1>'+
      '<p>Haftanı sade bir zaman çizelgesinde gör, gerektiğinde düzenle.</p>'+
    '</div>'+
    '<div class="v5-program-header-actions"></div>';

  const actions=head.querySelector<HTMLElement>(".v5-program-header-actions");
  const thisWeek=document.createElement("button");
  thisWeek.type="button";
  thisWeek.className="btn ghost";
  thisWeek.textContent="Bu haftaya dön";
  thisWeek.addEventListener("click",()=>{(window as LegacyProgramWindow).thisWeek?.();});

  actions?.append(thisWeek);
  program.prepend(head);
  return head;
}

function getStudyLabel(index:number):string{
  const label=document.querySelector<HTMLElement>('#gridS [data-lbl="s"][data-i="'+index+'"]');
  return String(label?.textContent||"").trim();
}

function taskTime(block:"r"|"s",index:number,ordinal:number):string{
  const label=block==="s"?getStudyLabel(index):"";
  const direct=label.match(/\b([01]?\d|2[0-3]):[0-5]\d(?:\s*[-–]\s*([01]?\d|2[0-3]):[0-5]\d)?\b/);
  if(direct)return direct[0];
  const start=9+ordinal*2;
  const h=Math.min(22,start);
  return String(h).padStart(2,"0")+":00";
}

function collectDayTasks(day:number):Array<{block:"r"|"s";index:number;text:string;done:boolean;time:string}>{
  const out:Array<{block:"r"|"s";index:number;text:string;done:boolean;time:string}>=[];
  let ordinal=0;
  for(const block of ["r","s"] as const){
    document.querySelectorAll<HTMLElement>('#grid'+block.toUpperCase()+' [data-blk="'+block+'"][data-d="'+day+'"]').forEach(cell=>{
      const text=String(cell.querySelector<HTMLElement>(".gtx")?.textContent||"").trim();
      if(!text)return;
      const index=Number(cell.dataset.i||0);
      out.push({
        block,index,text,
        done:cell.classList.contains("cdone"),
        time:taskTime(block,index,ordinal)
      });
      ordinal++;
    });
  }
  return out;
}

function focusEditorCell(day:number):void{
  const program=byId("program");
  const editor=program?.querySelector<HTMLElement>("[data-v5-program-editor]");
  if(editor)editor.hidden=false;
  const cells=Array.from(document.querySelectorAll<HTMLElement>('#gridS [data-blk="s"][data-d="'+day+'"] .gtx'));
  const target=cells.find(cell=>!String(cell.textContent||"").trim())??cells[0];
  if(!target)return;
  target.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
  window.setTimeout(()=>target.focus(),220);
}

function installMobilePlanner(program:HTMLElement,main:HTMLElement,week:HTMLElement):HTMLElement{
  const existing=program.querySelector<HTMLElement>("[data-v5-mobile-planner]");
  if(existing)return existing;

  let selected=Math.max(0,Math.min(6,(new Date().getDay()+6)%7));
  let weekOffset=0;
  let mode:"day"|"week"|"month"="week";

  const planner=document.createElement("section");
  planner.className="v5-mobile-planner";
  planner.dataset.v5MobilePlanner="true";
  planner.innerHTML=
    '<div class="v5-program-mode" role="tablist">'+
      '<button type="button" data-mode="day">Günlük</button>'+
      '<button type="button" data-mode="week" class="is-active">Haftalık</button>'+
      '<button type="button" data-mode="month">Aylık</button>'+
    '</div>'+
    '<div class="v5-week-strip-head"><button type="button" data-week-prev aria-label="Önceki hafta">‹</button><div class="v5-week-strip" data-week-strip></div><button type="button" data-week-next aria-label="Sonraki hafta">›</button></div>'+
    '<div class="v5-timeline" data-timeline></div>'+
    '<button type="button" class="v5-program-fab" data-add aria-label="Programa ders ekle">+</button>';

  const strip=planner.querySelector<HTMLElement>("[data-week-strip]");
  const timeline=planner.querySelector<HTMLElement>("[data-timeline]");

  const renderStrip=()=>{
    if(!strip)return;
    const base=monday();
    base.setDate(base.getDate()+weekOffset*7);
    strip.innerHTML=DAYS.map((name,index)=>{
      const date=new Date(base);
      date.setDate(base.getDate()+index);
      const current=weekOffset===0&&index===(new Date().getDay()+6)%7;
      return '<button type="button" data-day="'+index+'" class="'+(selected===index?"is-selected ":"")+(current?"is-today":"")+'"><span>'+name+'</span><b>'+date.getDate()+'</b></button>';
    }).join("");
    strip.querySelectorAll<HTMLButtonElement>("[data-day]").forEach(button=>button.addEventListener("click",()=>{
      selected=Number(button.dataset.day||0);
      renderStrip();
      renderTimeline();
    }));
  };

  const renderTimeline=()=>{
    if(!timeline)return;
    if(mode==="month"){
      timeline.innerHTML='<div class="v5-program-empty"><b>Aylık görünüm</b><span>Takvim görünümü aşağıda açıldı.</span></div>';
      return;
    }
    const tasks=collectDayTasks(selected);
    if(!tasks.length){
      timeline.innerHTML='<div class="v5-program-empty"><b>Bu gün boş</b><span>Sağ alttaki + ile ders ekleyebilirsin.</span></div>';
      return;
    }
    timeline.innerHTML=tasks.map((task,index)=>{
      const parts=splitTask(task.text);
      const t=tone(task.text);
      const endTime=(()=>{const [h,m]=task.time.split(":").map(Number);const d=new Date(2000,0,1,h||9,m||0);d.setMinutes(d.getMinutes()+90);return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");})();
      return '<article class="v5-time-row '+(task.done?"is-done":"")+'" data-tone="'+t+'">'+
        '<div class="v5-time-label"><b>'+task.time+'</b><span>'+endTime+'</span></div>'+
        '<div class="v5-time-card"><i></i><div><b>'+parts.title+'</b><span>'+(parts.sub||(task.block==="r"?"Rutin":"Ders"))+'</span><small>'+task.time+' - '+endTime+'</small></div>'+(task.done?'<em>✓</em>':'')+'</div>'+
      '</article>';
    }).join("");
  };

  const setMode=(next:"day"|"week"|"month")=>{
    mode=next;
    planner.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach(button=>button.classList.toggle("is-active",button.dataset.mode===next));
    planner.classList.toggle("is-day",next==="day");
    planner.classList.toggle("is-month",next==="month");
    if(next==="month"){
      (window as LegacyProgramWindow).setProgTab?.("cal");
    }else{
      (window as LegacyProgramWindow).setProgTab?.("week");
    }
    renderTimeline();
  };

  planner.querySelectorAll<HTMLButtonElement>("[data-mode]").forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.mode as "day"|"week"|"month")));
  planner.querySelector<HTMLButtonElement>("[data-week-prev]")?.addEventListener("click",()=>{
    weekOffset--;
    (window as LegacyProgramWindow).shiftWeek?.(-1);
    renderStrip();
    window.setTimeout(renderTimeline,40);
  });
  planner.querySelector<HTMLButtonElement>("[data-week-next]")?.addEventListener("click",()=>{
    weekOffset++;
    (window as LegacyProgramWindow).shiftWeek?.(1);
    renderStrip();
    window.setTimeout(renderTimeline,40);
  });
  planner.querySelector<HTMLButtonElement>("[data-add]")?.addEventListener("click",()=>focusEditorCell(selected));

  const editor=document.createElement("section");
  editor.className="v5-program-editor";
  editor.dataset.v5ProgramEditor="true";
  editor.hidden=window.matchMedia("(max-width:760px)").matches;
  const editorHead=document.createElement("div");
  editorHead.className="v5-program-editor-head";
  editorHead.innerHTML='<div><b>Programı düzenle</b><span>Mevcut hücre düzenleyici · kayıt ve senkron aynı kalır</span></div><button type="button">Kapat</button>';
  editorHead.querySelector("button")?.addEventListener("click",()=>{editor.hidden=true;});
  editor.append(editorHead,week);

  main.prepend(planner);
  main.appendChild(editor);

  const observer=new MutationObserver(()=>renderTimeline());
  for(const gridId of ["gridR","gridS"]){
    const grid=byId(gridId);
    if(grid)observer.observe(grid,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["class"]});
  }

  renderStrip();
  renderTimeline();
  return planner;
}

function installProgramShell(program:HTMLElement):void{
  if(program.querySelector("[data-v5-program-shell]"))return;

  const seg=program.querySelector<HTMLElement>(":scope > .seg");
  const week=byId("progWeek");
  const cal=byId("progCal");
  if(!seg||!week||!cal)return;

  installWeekStructure(week);

  const shell=document.createElement("div");
  shell.className="v5-program-shell";
  shell.dataset.v5ProgramShell="true";

  const main=document.createElement("main");
  main.className="v5-program-main";
  main.append(seg,week,cal);

  const rail=document.createElement("aside");
  rail.className="v5-program-rail";
  rail.setAttribute("aria-label","Program yardımcı araçları");

  const railHead=document.createElement("div");
  railHead.className="v5-program-rail-head";
  railHead.innerHTML='<span>YARDIMCI ARAÇLAR</span><h2>İhtiyacın olduğunda aç</h2><p>Kamp ve şablonlar ana planın önüne geçmez.</p>';
  rail.appendChild(railHead);

  for(const id of ["fh_kamp","fb_kamp","fh_sablon","fb_sablon"]){
    const node=byId(id);
    if(node)rail.appendChild(node);
  }

  shell.append(main,rail);
  program.appendChild(shell);
  installMobilePlanner(program,main,week);
}

export function installProgramV5():{installed:boolean;validate:()=>string[]}{
  const program=byId("program");
  if(!program)return {installed:false,validate:()=>["program screen missing"]};

  program.classList.add("v5-program");
  program.dataset.v5Program="ready";
  createHeader(program);
  installProgramShell(program);

  return {
    installed:true,
    validate:()=>{
      const errors:string[]=[];
      if(program.dataset.v5Program!=="ready")errors.push("program v5 marker missing");
      if(!program.querySelector("[data-v5-program-header]"))errors.push("program v5 header missing");
      if(!program.querySelector("[data-v5-program-shell]"))errors.push("program v5 shell missing");
      if(!program.querySelector("[data-v5-mobile-planner]"))errors.push("mobile planner missing");
      if(!program.querySelector("[data-v5-program-editor]"))errors.push("program editor missing");
      if(!program.querySelector('[data-grid="gridR"]'))errors.push("routine block missing");
      if(!program.querySelector('[data-grid="gridS"]'))errors.push("study block missing");
      return errors;
    }
  };
}
