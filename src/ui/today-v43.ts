import "./today-v43.css";

type AppWindow=Window&{
  go?:(screen:string)=>unknown;
  toggleFold?:(id:string)=>unknown;
};

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}

function dateText():string{
  return new Intl.DateTimeFormat("tr-TR",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
}

function makeDisclosure(label:string,body:HTMLElement,className:string):HTMLButtonElement{
  const button=document.createElement("button");
  button.type="button";
  button.className=className;
  button.setAttribute("aria-expanded","false");
  button.textContent=label;
  button.addEventListener("click",()=>{
    const open=body.hidden;
    body.hidden=!open;
    button.setAttribute("aria-expanded",String(open));
    button.textContent=open?label+" · Kapat":label;
  });
  return button;
}

function installTodayDetails(todayHub:HTMLElement):void{
  if(todayHub.querySelector("[data-v43-today-details]"))return;
  const nodes=[
    byId("todayReviewWrap"),
    todayHub.querySelector<HTMLElement>(".today-detail-grid"),
    todayHub.querySelector<HTMLElement>(".today-timeline-panel"),
    byId("todayClose")
  ].filter((node):node is HTMLElement=>Boolean(node));
  if(!nodes.length)return;

  const wrap=document.createElement("section");
  wrap.className="v43-today-details";
  wrap.dataset.v43TodayDetails="true";
  const body=document.createElement("div");
  body.className="v43-today-details-body";
  body.hidden=true;
  nodes.forEach(node=>body.appendChild(node));
  wrap.append(makeDisclosure("Günün detayları",body,"v43-disclosure"),body);
  todayHub.appendChild(wrap);
}

function createHeader(home:HTMLElement,homeHead:HTMLElement|null):HTMLElement{
  const existing=home.querySelector<HTMLElement>("[data-v6-home-header]");
  if(existing)return existing;
  const header=document.createElement("header");
  header.className="v6-home-header";
  header.dataset.v6HomeHeader="true";
  if(homeHead)header.appendChild(homeHead);
  const date=document.createElement("div");
  date.className="v6-home-date";
  date.innerHTML='<span>BUGÜN</span><b></b>';
  const label=date.querySelector("b");
  if(label)label.textContent=dateText();
  header.appendChild(date);
  home.prepend(header);
  return header;
}

function createQuickActions():HTMLElement{
  const nav=document.createElement("nav");
  nav.className="v6-quick-actions";
  nav.dataset.v6QuickActions="true";
  nav.setAttribute("aria-label","Hızlı işlemler");
  const items=[
    ["program","▦","Programım","Bugünkü planı düzenle"],
    ["pomo","◎","Çalış","Odak oturumu başlat"],
    ["notes","✎","Notlarım","Günün notunu yaz"],
    ["progress","⌁","İstatistik","Gelişimini incele"]
  ] as const;
  for(const [id,icon,title,copy] of items){
    const button=document.createElement("button");
    button.type="button";
    button.dataset.action=id;
    button.innerHTML='<i>'+icon+'</i><span><b>'+title+'</b><small>'+copy+'</small></span><em>›</em>';
    button.addEventListener("click",()=>{
      const app=window as AppWindow;
      if(id==="notes"){
        const head=byId("fh_gunluk");
        const body=byId("fb_gunluk");
        if(head&&body){
          const hidden=getComputedStyle(body).display==="none";
          if(hidden&&typeof app.toggleFold==="function")app.toggleFold("gunluk");
          window.setTimeout(()=>byId("journalInput")?.scrollIntoView({behavior:"smooth",block:"center"}),80);
        }
        return;
      }
      if(typeof app.go==="function")app.go(id);
    });
    nav.appendChild(button);
  }
  return nav;
}

function decoratePlan(plan:HTMLElement):void{
  const decorate=()=>{
    const rows=Array.from(plan.querySelectorAll<HTMLElement>(".plancell"));
    plan.dataset.v6PlanCount=String(rows.length);
    rows.forEach(row=>{
      const text=(row.textContent||"").toLocaleLowerCase("tr-TR");
      row.classList.remove("v6-math","v6-physics","v6-chemistry","v6-biology","v6-turkish","v6-other");
      const cls=text.includes("matematik")?"v6-math":
        text.includes("fizik")?"v6-physics":
        text.includes("kimya")?"v6-chemistry":
        text.includes("biyoloji")?"v6-biology":
        text.includes("türk")||text.includes("paragraf")?"v6-turkish":"v6-other";
      row.classList.add(cls);
    });
  };
  decorate();
  new MutationObserver(decorate).observe(plan,{childList:true,subtree:true,characterData:true});
}

function createProgramCard(planTitle:HTMLElement,plan:HTMLElement):HTMLElement{
  const card=document.createElement("section");
  card.className="v6-program-card";
  card.dataset.v6ProgramCard="true";
  const top=document.createElement("div");
  top.className="v6-section-head";
  const text=document.createElement("div");
  text.innerHTML='<span>BUGÜNKÜ PROGRAM</span><h2>Bugün ne yapıyorum?</h2><p>Görevlerini sırayla tamamla; bittiğinde dokunup işaretle.</p>';
  const all=document.createElement("button");
  all.type="button";
  all.textContent="Tüm program";
  all.addEventListener("click",()=>{const app=window as AppWindow;if(typeof app.go==="function")app.go("program");});
  top.append(text,all);
  planTitle.hidden=true;
  card.append(top,plan);
  decoratePlan(plan);
  return card;
}

function createGoalCard(todayHub:HTMLElement):HTMLElement{
  const card=document.createElement("section");
  card.className="v6-goal-card";
  card.dataset.v6GoalCard="true";
  const head=todayHub.querySelector<HTMLElement>(".today-hub-head");
  const title=head?.querySelector<HTMLElement>("h2");
  if(title)title.textContent="Günlük hedef";
  const eyebrow=head?.querySelector<HTMLElement>(".eyebrow");
  if(eyebrow)eyebrow.textContent="BUGÜN";
  card.appendChild(todayHub);
  return card;
}

function createCountdownCard(overview:HTMLElement|null):HTMLElement|null{
  if(!overview)return null;
  overview.classList.add("v6-countdown-card");
  const hero=overview.querySelector<HTMLElement>(".hero");
  const stats=overview.querySelector<HTMLElement>(".stats");
  if(stats)stats.hidden=true;
  if(hero){
    const eyebrow=hero.querySelector<HTMLElement>(".eyebrow");
    if(eyebrow)eyebrow.textContent="YKS SAYACI";
  }
  return overview;
}

function createMainLayout(home:HTMLElement,nodes:{goal:HTMLElement;program:HTMLElement;quick:HTMLElement;countdown:HTMLElement|null;}):HTMLElement{
  const shell=document.createElement("div");
  shell.className="v6-home-layout";
  shell.dataset.v6HomeLayout="true";
  const main=document.createElement("main");
  main.className="v6-home-primary";
  main.append(nodes.goal,nodes.program);
  const side=document.createElement("aside");
  side.className="v6-home-side";
  side.appendChild(nodes.quick);
  if(nodes.countdown)side.appendChild(nodes.countdown);
  shell.append(main,side);
  home.appendChild(shell);
  return shell;
}

function installSecondary(home:HTMLElement,preserved:Set<HTMLElement>):void{
  if(home.querySelector("[data-v43-secondary]"))return;
  const candidates=Array.from(home.children)
    .filter((node):node is HTMLElement=>node instanceof HTMLElement)
    .filter(node=>!preserved.has(node));
  if(!candidates.length)return;

  const shell=document.createElement("section");
  shell.className="v43-secondary";
  shell.dataset.v43Secondary="true";
  const head=document.createElement("div");
  head.className="v43-secondary-head";
  head.innerHTML='<div><span class="v43-secondary-eyebrow">DİĞER ARAÇLAR</span><strong>Analiz, giriş ve haftalık araçlar</strong></div>';
  const body=document.createElement("div");
  body.className="v43-secondary-body";
  body.hidden=true;
  candidates.forEach(node=>body.appendChild(node));
  head.appendChild(makeDisclosure("Diğer araçları aç",body,"v43-secondary-toggle"));
  shell.append(head,body);
  home.appendChild(shell);
}

export function installTodayV43():{installed:boolean;validate:()=>string[]}{
  const home=byId("home");
  if(!home)return {installed:false,validate:()=>["home screen missing"]};
  if(home.dataset.v6Home==="ready")return {installed:true,validate:()=>[]};

  home.classList.add("v43-today","v6-home");
  home.dataset.v43Today="ready";
  home.dataset.v6Home="ready";

  const homeHead=home.querySelector<HTMLElement>(":scope > .home-head");
  const todayHub=byId("todayHub");
  const planTitle=byId("todayPlanTitle");
  const plan=byId("todayPlan");
  const overview=home.querySelector<HTMLElement>(":scope > .home-overview");

  createHeader(home,homeHead);
  if(todayHub)installTodayDetails(todayHub);

  if(todayHub&&planTitle&&plan){
    const goal=createGoalCard(todayHub);
    const program=createProgramCard(planTitle,plan);
    const quick=createQuickActions();
    const countdown=createCountdownCard(overview);
    createMainLayout(home,{goal,program,quick,countdown});
  }

  const preserved=new Set<HTMLElement>();
  Array.from(home.children).forEach(node=>{
    if(!(node instanceof HTMLElement))return;
    if(
      node.matches("[data-v6-home-header]")||
      node.matches("[data-v6-home-layout]")||
      node.id==="morningBox"||
      node.id==="dgBanner"||
      node.id==="restBanner"||
      node.id==="backupBanner"||
      node.id==="sozBox"
    )preserved.add(node);
  });
  installSecondary(home,preserved);

  return {installed:true,validate:()=>{
    const errors:string[]=[];
    if(home.dataset.v6Home!=="ready")errors.push("v6 home marker missing");
    for(const selector of ["[data-v6-home-header]","[data-v6-home-layout]","[data-v6-goal-card]","[data-v6-program-card]","[data-v6-quick-actions]","[data-v43-secondary]"]){
      if(!home.querySelector(selector))errors.push(selector+" missing");
    }
    return errors;
  }};
}
