import "./today-v43.css";

const HOME_ID="home";

type HomeActionWindow=Window&{
  go?:(screen:string)=>unknown;
};

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

function subjectTone(text:string):string{
  const value=String(text||"").toLocaleLowerCase("tr-TR");
  if(value.includes("matematik"))return"math";
  if(value.includes("fizik"))return"physics";
  if(value.includes("kimya"))return"chemistry";
  if(value.includes("biyoloji"))return"biology";
  if(value.includes("türk"))return"turkish";
  if(value.includes("soru")||value.includes("deneme"))return"practice";
  return"other";
}

function installDatePill(home:HTMLElement):void{
  const head=home.querySelector<HTMLElement>(":scope > .home-head");
  if(!head||head.querySelector("[data-v5-date-pill]"))return;
  const greeting=head.querySelector<HTMLElement>("#greeting");
  const kicker=head.querySelector<HTMLElement>(".home-kicker");
  if(kicker)kicker.textContent="Bugün harika bir gün, hedeflerine bir adım daha yaklaş!";
  const pill=document.createElement("span");
  pill.className="v5-date-pill";
  pill.dataset.v5DatePill="true";
  pill.textContent=new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",weekday:"short"}).format(new Date());
  (greeting?.parentElement??head).appendChild(pill);
}

function installDailyGoal(todayHub:HTMLElement):HTMLElement{
  const existing=document.querySelector<HTMLElement>("[data-v5-daily-goal]");
  if(existing)return existing;

  const card=document.createElement("section");
  card.className="v5-daily-goal";
  card.dataset.v5DailyGoal="true";
  card.innerHTML=
    '<div class="v5-goal-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l2.4 2.4 3.4-.5.5 3.4L21 10.7 18.6 13l.5 3.4-3.4.5L13.3 19 11 16.6l-3.4.5-.5-3.4L4.4 11 6.8 8.6l-.5-3.4 3.4-.5L12 3z"/><path d="M8.7 11.2l2 2 4.6-4.6"/></svg></div>'+
    '<div class="v5-goal-main"><div class="v5-goal-line"><div><b>Günlük Hedef</b><span data-v5-goal-copy>Programını tamamla</span></div><strong data-v5-goal-pct>%0</strong></div><div class="v5-goal-track"><i data-v5-goal-bar></i></div></div>';

  const pctSource=getElement<HTMLElement>("todayHubPlan");
  const subSource=getElement<HTMLElement>("todayHubPlanSub");
  const pctText=card.querySelector<HTMLElement>("[data-v5-goal-pct]");
  const copy=card.querySelector<HTMLElement>("[data-v5-goal-copy]");
  const bar=card.querySelector<HTMLElement>("[data-v5-goal-bar]");

  const sync=()=>{
    const match=String(pctSource?.textContent||"").match(/(\d{1,3})/);
    const pct=Math.max(0,Math.min(100,Number(match?.[1]||0)));
    if(pctText)pctText.textContent="%"+pct;
    if(bar)bar.style.width=pct+"%";
    const raw=String(subSource?.textContent||"").trim();
    if(copy){
      const progress=raw.match(/(\d+)\s*\/\s*(\d+)/);
      copy.textContent=progress?progress[1]+"/"+progress[2]+" tamamlandı":raw&&raw!=="—"?raw:"Bugünkü programını tamamla";
    }
  };
  sync();
  const observer=new MutationObserver(sync);
  if(pctSource)observer.observe(pctSource,{childList:true,subtree:true,characterData:true});
  if(subSource)observer.observe(subSource,{childList:true,subtree:true,characterData:true});
  todayHub.insertAdjacentElement("beforebegin",card);
  return card;
}

function installPlanHeader(planTitle:HTMLElement):void{
  if(planTitle.querySelector("[data-v5-plan-all]"))return;
  planTitle.textContent="Bugünkü Program";
  const all=document.createElement("button");
  all.type="button";
  all.className="v5-plan-all";
  all.dataset.v5PlanAll="true";
  all.textContent="Tümünü Gör";
  all.addEventListener("click",event=>{
    event.stopPropagation();
    (window as HomeActionWindow).go?.("program");
  });
  planTitle.appendChild(all);
}

function installPlanTones(plan:HTMLElement):void{
  const apply=()=>{
    plan.querySelectorAll<HTMLElement>(".plancell").forEach(row=>{
      const text=(row.querySelector<HTMLElement>(".pl")?.textContent||"")+" "+(row.querySelector<HTMLElement>(".pt")?.textContent||"");
      row.dataset.tone=subjectTone(text);
    });
  };
  apply();
  new MutationObserver(apply).observe(plan,{childList:true,subtree:true});
}

function installQuickActions(primary:HTMLElement):HTMLElement{
  const existing=primary.querySelector<HTMLElement>("[data-v5-quick-actions]");
  if(existing)return existing;
  const quick=document.createElement("section");
  quick.className="v5-quick-actions";
  quick.dataset.v5QuickActions="true";
  const actions=[
    ["program","Program Oluştur","<svg viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"15\" rx=\"3\"/><path d=\"M8 3v4M16 3v4M4 10h16\"/></svg>"],
    ["pomo","Çalışmaya Başla","<svg viewBox=\"0 0 24 24\"><path d=\"M9 7l8 5-8 5V7z\"/><circle cx=\"12\" cy=\"12\" r=\"9\"/></svg>"],
    ["notes","Notlarım","<svg viewBox=\"0 0 24 24\"><path d=\"M6 3h9l3 3v15H6z\"/><path d=\"M9 11h6M9 15h6\"/></svg>"],
    ["progress","İstatistikler","<svg viewBox=\"0 0 24 24\"><path d=\"M5 20V10M10 20V5M15 20v-7M20 20V8\"/></svg>"]
  ] as const;
  for(const [id,label,icon] of actions){
    const button=document.createElement("button");
    button.type="button";
    button.className="v5-quick";
    button.dataset.action=id;
    button.innerHTML='<span class="v5-quick-icon">'+icon+'</span><b>'+label+'</b>';
    button.addEventListener("click",()=>{
      if(id==="notes"){
        const secondary=document.querySelector<HTMLElement>(".v43-secondary-body");
        if(secondary?.hidden)document.querySelector<HTMLButtonElement>(".v43-secondary-toggle")?.click();
        const note=getElement<HTMLElement>("fh_gunluk");
        if(note){
          window.setTimeout(()=>{note.scrollIntoView({behavior:"smooth",block:"center"});},80);
        }
        return;
      }
      if(id==="program"){
        (window as HomeActionWindow).go?.("program");
        window.setTimeout(()=>window.dispatchEvent(new CustomEvent("yks:open-program-builder")),80);
        return;
      }
      (window as HomeActionWindow).go?.(id);
    });
    quick.appendChild(button);
  }
  primary.appendChild(quick);
  return quick;
}

function installPrimaryLayout(home:HTMLElement,todayHub:HTMLElement,planTitle:HTMLElement,plan:HTMLElement):HTMLElement{
  const existing=home.querySelector<HTMLElement>("[data-v5-home-layout]");
  if(existing)return existing;

  const layout=document.createElement("section");
  layout.className="v5-home-layout";
  layout.dataset.v5HomeLayout="true";

  const primary=document.createElement("main");
  primary.className="v5-home-primary";

  const intro=document.createElement("div");
  intro.className="v5-home-primary-head";
  intro.innerHTML='<span>BUGÜN</span><div><h2>Önce bugünü bitir</h2><p>Programın, kalan işlerin ve gün içi ilerlemen tek yerde.</p></div>';

  const goal=installDailyGoal(todayHub);
  installPlanHeader(planTitle);
  installPlanTones(plan);
  primary.append(intro,goal,todayHub,planTitle,plan);
  installQuickActions(primary);

  const rail=document.createElement("aside");
  rail.className="v5-home-rail";
  rail.setAttribute("aria-label","Hafta ve hedef özeti");

  const railHead=document.createElement("div");
  railHead.className="v5-home-rail-head";
  railHead.innerHTML='<span>HAFTA</span><b>Genel durum</b>';
  rail.appendChild(railHead);

  const quote=getElement<HTMLElement>("sozBox");
  const overview=home.querySelector<HTMLElement>(":scope > .home-overview");
  if(quote)rail.appendChild(quote);
  if(overview)rail.appendChild(overview);

  layout.append(primary,rail);
  const actions=home.querySelector<HTMLElement>(":scope > .home-actions");
  if(actions)actions.insertAdjacentElement("afterend",layout);
  else home.prepend(layout);
  return layout;
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
  installDatePill(home);
  home.dataset.v43Today="ready";

  const todayHub=getElement<HTMLElement>("todayHub");
  if(todayHub)installTodayDetails(todayHub);

  const planTitle=getElement<HTMLElement>("todayPlanTitle");
  const plan=getElement<HTMLElement>("todayPlan");
  let primaryLayout:HTMLElement|null=null;
  if(todayHub&&planTitle&&plan){
    todayHub.insertAdjacentElement("afterend",plan);
    todayHub.insertAdjacentElement("afterend",planTitle);
    primaryLayout=installPrimaryLayout(home,todayHub,planTitle,plan);
  }

  const preserved=new Set<HTMLElement>();
  Array.from(home.children).forEach(node=>{
    if(!(node instanceof HTMLElement))return;
    if(
      node.classList.contains("home-head")||
      node.id==="sozBox"||
      node.classList.contains("home-overview")||
      node.classList.contains("home-actions")||
      node===primaryLayout||
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
      if(todayHub&&planTitle&&plan&&!home.querySelector("[data-v5-home-layout]"))errors.push("v5 primary layout missing");
      if(todayHub&&!home.querySelector("[data-v5-daily-goal]"))errors.push("v5 daily goal missing");
      if(plan&&!home.querySelector("[data-v5-quick-actions]"))errors.push("v5 quick actions missing");
      if(todayHub&&!todayHub.querySelector("[data-v43-today-details]"))errors.push("today detail disclosure missing");
      if(planTitle&&plan&&planTitle.nextElementSibling!==plan)errors.push("today plan order invalid");
      return errors;
    }
  };
}
