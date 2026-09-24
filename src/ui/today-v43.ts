import "./today-v43.css";

const HOME_ID="home";

function getElement<T extends HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}

function makeToggle(label:string,target:HTMLElement,className:string):HTMLButtonElement{
  const button=document.createElement("button");
  button.type="button";
  button.className=className;
  button.setAttribute("aria-expanded","false");
  button.textContent=label;
  button.addEventListener("click",()=>{
    const willOpen=target.hidden;
    target.hidden=!willOpen;
    button.setAttribute("aria-expanded",String(willOpen));
    button.textContent=willOpen?`${label} · Kapat`:label;
  });
  return button;
}

function installTodayDetails(todayHub:HTMLElement):void{
  if(todayHub.querySelector("[data-v43-today-details]"))return;

  const detailNodes=[
    getElement("todayReviewWrap"),
    todayHub.querySelector<HTMLElement>(".today-detail-grid"),
    todayHub.querySelector<HTMLElement>(".today-timeline-panel"),
    getElement("todayClose")
  ].filter((node):node is HTMLElement=>Boolean(node));

  if(!detailNodes.length)return;

  const wrap=document.createElement("section");
  wrap.className="v43-today-details";
  wrap.dataset.v43TodayDetails="true";

  const body=document.createElement("div");
  body.className="v43-today-details-body";
  body.hidden=true;
  detailNodes.forEach(node=>body.appendChild(node));

  const toggle=makeToggle("Günün detaylarını göster",body,"v43-disclosure");
  wrap.append(toggle,body);
  todayHub.appendChild(wrap);
}

function installSecondaryArea(home:HTMLElement,preserved:Set<HTMLElement>):void{
  if(home.querySelector("[data-v43-secondary]"))return;

  const candidates=Array.from(home.children)
    .filter((node):node is HTMLElement=>node instanceof HTMLElement)
    .filter(node=>!preserved.has(node));

  if(!candidates.length)return;

  const shell=document.createElement("section");
  shell.className="v43-secondary";
  shell.dataset.v43Secondary="true";

  const heading=document.createElement("div");
  heading.className="v43-secondary-head";
  const copy=document.createElement("div");
  const eyebrow=document.createElement("span");
  eyebrow.className="v43-secondary-eyebrow";
  eyebrow.textContent="İkincil alan";
  const title=document.createElement("strong");
  title.textContent="Analizler ve hızlı giriş araçları";
  copy.append(eyebrow,title);

  const body=document.createElement("div");
  body.className="v43-secondary-body";
  body.hidden=true;
  candidates.forEach(node=>body.appendChild(node));

  const toggle=makeToggle("Diğer araçları aç",body,"v43-secondary-toggle");
  heading.append(copy,toggle);
  shell.append(heading,body);
  home.appendChild(shell);
}

export function installTodayV43():{installed:boolean;validate:()=>string[]}{
  const home=getElement<HTMLElement>(HOME_ID);
  if(!home){
    return {installed:false,validate:()=>["home screen missing"]};
  }

  home.classList.add("v43-today");
  home.dataset.v43Today="ready";

  const todayHub=getElement<HTMLElement>("todayHub");
  if(todayHub)installTodayDetails(todayHub);

  const planTitle=getElement<HTMLElement>("todayPlanTitle");
  const plan=getElement<HTMLElement>("todayPlan");
  if(todayHub&&planTitle&&plan){
    todayHub.insertAdjacentElement("afterend",plan);
    todayHub.insertAdjacentElement("afterend",planTitle);
  }

  const preserved=new Set<HTMLElement>();
  Array.from(home.children).forEach(node=>{
    if(!(node instanceof HTMLElement))return;
    if(
      node.classList.contains("home-head")||
      node.id==="sozBox"||
      node.classList.contains("home-overview")||
      node.classList.contains("home-actions")||
      node.id==="todayHub"||
      node.id==="todayPlanTitle"||
      node.id==="todayPlan"||
      node.id==="morningBox"||
      node.id==="dgBanner"||
      node.id==="restBanner"||
      node.id==="backupBanner"
    )preserved.add(node);
  });

  installSecondaryArea(home,preserved);

  return {
    installed:true,
    validate:()=>{
      const errors:string[]=[];
      if(home.dataset.v43Today!=="ready")errors.push("today v4.3 marker missing");
      if(!home.querySelector("[data-v43-secondary]"))errors.push("today secondary area missing");
      if(todayHub&&!todayHub.querySelector("[data-v43-today-details]"))errors.push("today detail disclosure missing");
      if(planTitle&&plan&&planTitle.nextElementSibling!==plan)errors.push("today plan order invalid");
      return errors;
    }
  };
}
