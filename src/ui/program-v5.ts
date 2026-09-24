import "./program-v5.css";

type LegacyProgramWindow=Window&{
  thisWeek?:()=>unknown;
};

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
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
      '<h1>Haftanı tek yerde kur</h1>'+
      '<p>Plan ana ekranda, yardımcı araçlar yanında. Veri yapın ve koç senkronun değişmez.</p>'+
    '</div>'+
    '<div class="v5-program-header-actions"></div>';

  const actions=head.querySelector<HTMLElement>(".v5-program-header-actions");
  const thisWeek=document.createElement("button");
  thisWeek.type="button";
  thisWeek.className="btn ghost";
  thisWeek.textContent="Bu haftaya dön";
  thisWeek.addEventListener("click",()=>{(window as LegacyProgramWindow).thisWeek?.();});

  const edit=document.createElement("button");
  edit.type="button";
  edit.className="btn green";
  edit.textContent="Ders eklemeye başla";
  edit.addEventListener("click",()=>{
    const first=document.querySelector<HTMLElement>("#gridS .gtx");
    if(!first)return;
    first.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
    window.setTimeout(()=>first.focus(),220);
  });

  actions?.append(thisWeek,edit);
  program.prepend(head);
  return head;
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
      if(!program.querySelector('[data-grid="gridR"]'))errors.push("routine block missing");
      if(!program.querySelector('[data-grid="gridS"]'))errors.push("study block missing");
      return errors;
    }
  };
}
