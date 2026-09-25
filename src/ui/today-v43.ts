import "./today-v43.css";

const HOME_ID="home";
type TodayWindow=Window&{go?:(screen:string)=>unknown;v30Action?:(action:string)=>unknown;v30OpenMore?:(tab:string,anchor?:string)=>unknown};

function getElement<T extends HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}

function makeToggle(label:string,target:HTMLElement,className:string):HTMLButtonElement{
  const button=document.createElement("button");
  button.type="button";button.className=className;
  button.setAttribute("aria-expanded","false");button.textContent=label;
  button.addEventListener("click",()=>{
    const willOpen=target.hidden;target.hidden=!willOpen;
    button.setAttribute("aria-expanded",String(willOpen));
    button.textContent=willOpen?`${label} · Kapat`:label;
  });
  return button;
}

function icon(path:string):SVGSVGElement{
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");
  const line=document.createElementNS(svg.namespaceURI,"path");line.setAttribute("d",path);svg.append(line);
  return svg;
}

function installHeader(home:HTMLElement):void{
  const head=home.querySelector<HTMLElement>(".home-head");
  if(!head||head.dataset.rbHeader)return;
  head.dataset.rbHeader="true";
  const copy=head.firstElementChild;
  if(copy){
    const title=document.createElement("h2");title.className="rb-today-title";title.textContent="Bugün";
    const date=document.createElement("p");date.className="rb-today-date";
    const refreshDate=()=>{date.textContent=new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",weekday:"long"});};
    refreshDate();
    document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshDate();});
    window.addEventListener("focus",refreshDate);copy.append(title,date);
  }
  const hero=home.querySelector<HTMLElement>(".home-overview .hero"),count=getElement("countdown");
  if(hero&&count){
    const details=document.createElement("details");details.className="rb-exam-countdown";
    const summary=document.createElement("summary");summary.setAttribute("aria-label","Sınava kalan süre ve sınav tarihi");
    const label=document.createElement("span");label.textContent="YKS’ye";
    const days=count.parentElement;
    summary.append(icon("M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1"),label);
    if(days)summary.append(days);
    details.append(summary,hero);head.append(details);
  }
}

function installTodayDetails(todayHub:HTMLElement):void{
  if(todayHub.querySelector("[data-v43-today-details]"))return;
  const detailNodes=[getElement("todayRemaining"),getElement("todayReviewWrap"),
    todayHub.querySelector<HTMLElement>(".today-detail-grid"),todayHub.querySelector<HTMLElement>(".today-timeline-panel"),getElement("todayClose")
  ].filter((node):node is HTMLElement=>Boolean(node));
  const review=getElement("todayHubReview")?.parentElement;
  const wrap=document.createElement("section");wrap.className="v43-today-details";wrap.dataset.v43TodayDetails="true";
  const body=document.createElement("div");body.className="v43-today-details-body";body.hidden=true;
  if(review)body.append(review);detailNodes.forEach(node=>body.append(node));
  wrap.append(makeToggle("Günün detaylarını göster",body,"v43-disclosure"),body);todayHub.append(wrap);
}

function installSecondaryArea(home:HTMLElement,preserved:Set<HTMLElement>):void{
  if(home.querySelector("[data-v43-secondary]"))return;
  const candidates=Array.from(home.children).filter((node):node is HTMLElement=>node instanceof HTMLElement).filter(node=>!preserved.has(node));
  const shell=document.createElement("section");shell.className="v43-secondary";shell.dataset.v43Secondary="true";
  const body=document.createElement("div");body.className="v43-secondary-body";body.hidden=true;
  candidates.forEach(node=>body.append(node));
  shell.append(makeToggle("Diğer araçları aç",body,"v43-secondary-toggle"),body);home.append(shell);
}

const METRICS=[
  {id:"todayHubPlan",label:"görev",kind:"plan",path:"m5 12 4 4L19 6"},
  {id:"todayHubQ",label:"soru",kind:"questions",path:"M6 20V12m6 8V7m6 13V3"},
  {id:"todayHubMin",label:"çalışma süresi",kind:"minutes",path:"M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"}
];

function refreshMetrics():void{
  const grid=getElement("todayHub")?.querySelector(".today-summary-grid");if(!grid)return;
  METRICS.forEach(metric=>{
    const source=getElement(metric.id),sub=getElement(`${metric.id}Sub`),card=source?.parentElement;if(!source||!card)return;
    if(!card.dataset.rbMetric){
      card.dataset.rbMetric=metric.kind;
      const mark=icon(metric.path);mark.classList.add("rb-metric-icon");
      const value=document.createElement("strong");value.className="rb-metric-value";
      const label=document.createElement("span");label.className="rb-metric-label";label.textContent=metric.label;
      const bar=document.createElement("div");bar.className="rb-metric-progress";bar.setAttribute("aria-hidden","true");bar.append(document.createElement("i"));
      card.append(mark,value,label,bar);grid.append(card);
    }
    const raw=source.textContent||"",caption=sub?.textContent||"";
    const numbers=(metric.kind==="plan"?caption:raw).match(/\d+(?:[.,]\d+)?/g)||[];
    const current=Number(numbers[0]?.replace(",",".")),target=Number(numbers[1]?.replace(",","."));
    let value=raw.split("/")[0]?.trim()||"—";
    if(metric.kind==="plan")value=numbers.length>=2?`${numbers[0]}/${numbers[1]}`:"—";
    if(metric.kind==="minutes"&&Number.isFinite(current))value=current>=60?`${Math.floor(current/60)} sa${current%60?` ${Math.round(current%60)} dk`:""}`:`${current} dk`;
    const output=card.querySelector(".rb-metric-value");if(output)output.textContent=value;
    const fill=card.querySelector<HTMLElement>(".rb-metric-progress i");
    if(fill)fill.style.width=Number.isFinite(current)&&target>0?`${Math.max(0,Math.min(100,current/target*100))}%`:"0%";
    card.setAttribute("aria-label",`${value} ${metric.label}. ${caption}`);
  });
}

function taskMenu(buttons:HTMLElement[],label:string):HTMLDetailsElement{
  const menu=document.createElement("details");menu.className="rb-task-menu";
  const summary=document.createElement("summary");summary.textContent="···";summary.setAttribute("aria-label",label);
  const body=document.createElement("div");body.className="rb-task-menu-body";buttons.forEach(button=>body.append(button));
  menu.append(summary,body);menu.addEventListener("click",event=>event.stopPropagation());
  menu.addEventListener("keydown",event=>{if(event.key==="Escape"){menu.open=false;summary.focus();}});
  return menu;
}

/** Keep the legacy click handler as the single owner of completion and persistence. */
export function enhanceTodayTaskRow(row:HTMLElement):void{
  if(row.dataset.rbTask)return;row.dataset.rbTask="true";
  const copy=row.querySelector(".pt")?.textContent||"Görev";
  const label=row.querySelector(".pl")?.textContent?.trim();
  if(!label||label==="—"||label==="Görev")row.classList.add("rb-task-no-label");
  const separator=copy.indexOf(" · "),textNode=row.querySelector(".pt");
  if(row.classList.contains("rb-task-no-label")&&separator>0&&textNode){
    const title=document.createElement("span"),detail=document.createElement("span");
    title.className="rb-task-title";title.textContent=copy.slice(0,separator);
    detail.className="rb-task-description";detail.textContent=copy.slice(separator+3);
    textNode.textContent="";textNode.append(title,detail);
  }
  const toggle=document.createElement("button");toggle.type="button";toggle.className="rb-task-toggle";
  toggle.setAttribute("role","checkbox");toggle.setAttribute("aria-checked",String(row.classList.contains("pd")));
  toggle.setAttribute("aria-label",`${copy} — tamamlandı olarak işaretle veya geri al`);toggle.append(icon("m5 12 4 4L19 6"));
  toggle.addEventListener("click",event=>{event.stopPropagation();row.click();});
  const buttons=Array.from(row.querySelectorAll<HTMLElement>("button"));row.prepend(toggle);
  if(buttons.length)row.append(taskMenu(buttons,`${copy} seçenekleri`));
}

function refreshTasks():void{
  const plan=getElement("todayPlan");if(!plan)return;
  const rows=Array.from(plan.querySelectorAll<HTMLElement>(".plancell"));rows.forEach(enhanceTodayTaskRow);
  let more=plan.querySelector<HTMLButtonElement>(".rb-tasks-more");
  if(rows.length>4&&!more){
    more=document.createElement("button");more.type="button";more.className="rb-tasks-more";
    more.addEventListener("click",()=>{plan.dataset.rbTasksExpanded=String(plan.dataset.rbTasksExpanded!=="true");refreshTasks();});
    rows.at(-1)?.insertAdjacentElement("afterend",more);
  }
  const expanded=plan.dataset.rbTasksExpanded==="true";rows.forEach((row,index)=>{row.hidden=index>=4&&!expanded;});
  if(more){more.textContent=expanded?"Daha az göster":`${rows.length-4} görevi daha göster`;more.setAttribute("aria-expanded",String(expanded));more.hidden=rows.length<=4;}
}

export function enhanceTodayNext(next:HTMLElement):void{
  const actions=next.querySelector<HTMLElement>(".next-actions");if(!actions||actions.dataset.rbActions)return;
  actions.dataset.rbActions="true";
  const heading=next.querySelector(".next-eyebrow");if(heading)heading.textContent="Sıradaki çalışma";
  const title=next.querySelector(".next-title"),meta=next.querySelector(".next-meta"),raw=title?.textContent||"",separator=raw.indexOf(" · ");
  if(title&&meta&&separator>0){title.textContent=raw.slice(0,separator);meta.textContent=raw.slice(separator+3);}
  const buttons=Array.from(actions.querySelectorAll<HTMLButtonElement>("button")),primary=buttons.shift();
  if(primary?.getAttribute("onclick")?.includes("v25StartTask"))primary.textContent="Başla";
  if(buttons.length)actions.append(taskMenu(buttons,"Sıradaki görev seçenekleri"));
}

function installTasks(home:HTMLElement):void{
  const planTitle=getElement("todayPlanTitle"),plan=getElement("todayPlan");if(!planTitle||!plan)return;
  const section=document.createElement("section");section.className="rb-today-tasks";
  const heading=document.createElement("div");heading.className="rb-tasks-heading";
  const title=document.createElement("h2");title.textContent="Bugünkü görevler";
  const all=document.createElement("button");all.type="button";all.textContent="Tümünü gör";
  all.addEventListener("click",()=>{(window as TodayWindow).go?.("program");});
  heading.append(title,all);section.append(heading,planTitle,plan);home.append(section);
}

function refreshCoachShortcut(home:HTMLElement):void{
  const target=getElement("studentCoachCodeSettings"),win=window as TodayWindow;
  let shortcut=home.querySelector<HTMLButtonElement>(".rb-home-coach");
  if(!target||(typeof win.v30Action!=="function"&&typeof win.v30OpenMore!=="function")){if(shortcut)shortcut.hidden=true;return;}
  if(!shortcut){
    shortcut=document.createElement("button");shortcut.type="button";shortcut.className="rb-home-coach";
    const copy=document.createElement("span"),title=document.createElement("strong"),hint=document.createElement("small");
    title.textContent="Koç bağlantısı";hint.textContent="Koç kodun ve program paylaşımın";copy.append(title,hint);
    shortcut.append(icon("M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0"),copy);
    shortcut.addEventListener("click",()=>{
      if(typeof win.v30Action==="function")win.v30Action("settings");
      else win.v30OpenMore?.("ayar","studentCoachCodeSettings");
      window.dispatchEvent(new CustomEvent("yks:open-settings",{detail:{category:"coach"}}));
    });
    const quote=getElement("sozBox"),tasks=home.querySelector(".rb-today-tasks");(quote||tasks)?.insertAdjacentElement("afterend",shortcut);
  }
  shortcut.hidden=false;
}

export function installTodayV43():{installed:boolean;validate:()=>string[]}{
  const home=getElement<HTMLElement>(HOME_ID);if(!home)return {installed:false,validate:()=>["home screen missing"]};
  const todayHub=getElement<HTMLElement>("todayHub");
  const validate=()=>{
    const errors:string[]=[];
    if(home.dataset.v43Today!=="ready")errors.push("today v4.3 marker missing");
    if(!home.querySelector("[data-v43-secondary]"))errors.push("today secondary area missing");
    if(todayHub&&!todayHub.querySelector("[data-v43-today-details]"))errors.push("today detail disclosure missing");
    const title=getElement("todayPlanTitle"),plan=getElement("todayPlan");if(title&&plan&&title.nextElementSibling!==plan)errors.push("today plan order invalid");
    return errors;
  };
  if(home.dataset.rbToday==="ready")return {installed:true,validate};
  home.classList.add("v43-today");home.dataset.v43Today="ready";home.dataset.rbToday="ready";
  installHeader(home);if(todayHub){installTodayDetails(todayHub);home.append(todayHub);}
  installTasks(home);const quote=getElement("sozBox");if(quote)home.append(quote);
  const preserved=new Set<HTMLElement>();
  Array.from(home.children).forEach(node=>{
    if(!(node instanceof HTMLElement))return;
    if(node.classList.contains("home-head")||node.classList.contains("rb-today-tasks")||["todayHub","sozBox","dgBanner","restBanner","backupBanner"].includes(node.id))preserved.add(node);
  });
  const head=home.querySelector<HTMLElement>(".home-head");if(head)home.prepend(head);
  ["dgBanner","restBanner","backupBanner"].forEach(id=>{const node=getElement(id);if(node)home.append(node);});
  installSecondaryArea(home,preserved);
  const refresh=()=>{refreshMetrics();refreshTasks();const next=getElement("todayNext");if(next)enhanceTodayNext(next);refreshCoachShortcut(home);};
  refresh();
  // Legacy renders replace card contents after completion, sync, import and focus sessions.
  // Observe their output rather than replacing render/save functions or duplicating state.
  const observer=new MutationObserver(()=>{observer.disconnect();try{refresh();}finally{observe();}});
  const observe=()=>observer.observe(home,{childList:true,subtree:true,characterData:true});observe();
  const settings=getElement("mrp_ayar");
  if(settings)new MutationObserver(()=>refreshCoachShortcut(home)).observe(settings,{childList:true,subtree:true});
  window.addEventListener("yks:student-coach-link-ready",()=>refreshCoachShortcut(home));
  window.addEventListener("yks:student-coaching-ready",()=>refreshCoachShortcut(home));
  return {installed:true,validate};
}
