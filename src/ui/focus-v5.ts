import "./focus-v5.css";

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}

function createHeader(screen:HTMLElement):HTMLElement{
  const old=screen.querySelector<HTMLElement>("[data-v5-focus-header]");
  if(old)return old;
  const header=document.createElement("header");
  header.className="v5-focus-header";
  header.dataset.v5FocusHeader="true";
  header.innerHTML=
    '<div><span>ÇALIŞ</span><h1>Odaklan ve bitir</h1><p>Tek oturum, tek hedef. Süre ve ürettiğin işi birlikte takip et.</p></div>'+
    '<button type="button" class="v5-focus-minimal">Minimal mod</button>';
  header.querySelector<HTMLButtonElement>(".v5-focus-minimal")?.addEventListener("click",()=>{
    const fn=(window as unknown as {v29ToggleMinimal?:()=>unknown}).v29ToggleMinimal;
    if(typeof fn==="function")fn();
  });
  screen.prepend(header);
  return header;
}

function createCurrentCard(setup:HTMLElement):HTMLElement{
  const old=setup.querySelector<HTMLElement>("[data-v5-current-session]");
  if(old)return old;
  const card=document.createElement("section");
  card.className="v5-focus-current";
  card.dataset.v5CurrentSession="true";
  card.innerHTML=
    '<div class="v5-current-icon">◎</div>'+
    '<div class="v5-current-copy"><span>SEÇİLİ OTURUM</span><b data-v5-current-title>Dersini seç</b><small data-v5-current-meta>Konu ve hedef seçtiğinde burada görünür.</small></div>'+
    '<div class="v5-current-goal"><b data-v5-current-q>—</b><span>soru hedefi</span></div>';
  setup.prepend(card);

  const title=card.querySelector<HTMLElement>("[data-v5-current-title]");
  const meta=card.querySelector<HTMLElement>("[data-v5-current-meta]");
  const question=card.querySelector<HTMLElement>("[data-v5-current-q]");
  const subject=byId("pomoSubjPick");
  const topic=byId<HTMLSelectElement>("pomoTopic");
  const task=byId<HTMLSelectElement>("pomoTask");
  const goal=byId<HTMLInputElement>("v29GoalText");
  const goalQ=byId<HTMLInputElement>("v29GoalQ");

  const sync=()=>{
    const chosen=subject?.querySelector<HTMLElement>(".chip.on")?.textContent?.trim()||"Dersini seç";
    const topicText=topic?.selectedOptions?.[0]?.textContent?.trim()||"";
    const taskText=task?.selectedOptions?.[0]?.textContent?.trim()||"";
    const goalText=goal?.value?.trim()||"";
    if(title)title.textContent=chosen;
    if(meta)meta.textContent=[topicText,taskText,goalText].filter(Boolean).slice(0,2).join(" · ")||"Konu ve hedef seçtiğinde burada görünür.";
    if(question)question.textContent=String(Math.max(0,Number(goalQ?.value||0)))||"—";
  };
  sync();
  for(const node of [subject,topic,task,goal,goalQ]){
    if(!node)continue;
    node.addEventListener("input",sync);
    node.addEventListener("change",sync);
  }
  if(subject)new MutationObserver(sync).observe(subject,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  return card;
}

function sectionTitle(title:string,copy:string):HTMLElement{
  const head=document.createElement("div");
  head.className="v5-focus-section-head";
  head.innerHTML='<div><span>BUGÜN</span><h2>'+title+'</h2></div><p>'+copy+'</p>';
  return head;
}

function installShell(screen:HTMLElement):HTMLElement|null{
  const old=screen.querySelector<HTMLElement>("[data-v5-focus-shell]");
  if(old)return old;

  const seg=screen.querySelector<HTMLElement>(":scope > .seg");
  const dashboard=byId("v29Dashboard");
  const setup=screen.querySelector<HTMLElement>(":scope > .v29-session-setup");
  const pomo=byId("focusPomo");
  const stop=byId("focusStop");
  const stats=screen.querySelector<HTMLElement>(":scope > .stats");
  const pause=byId("pauseStat");
  const sessions=byId("sessionList");
  const daySummary=byId("v29DaySummary");
  if(!seg||!setup||!pomo||!stop)return null;

  createCurrentCard(setup);

  const shell=document.createElement("div");
  shell.className="v5-focus-shell";
  shell.dataset.v5FocusShell="true";

  const main=document.createElement("main");
  main.className="v5-focus-main";
  main.append(seg,setup,pomo,stop);

  const side=document.createElement("aside");
  side.className="v5-focus-side";
  side.appendChild(sectionTitle("Bugünün özeti","Odak süren, bölünmelerin ve tamamlanan oturumların."));
  if(dashboard)side.appendChild(dashboard);
  if(stats)side.appendChild(stats);
  if(pause)side.appendChild(pause);
  if(sessions){
    const block=document.createElement("section");
    block.className="v5-focus-session-block";
    block.innerHTML='<div class="v5-focus-subhead"><b>Bugünün oturumları</b><span>Son çalışmaların</span></div>';
    block.appendChild(sessions);
    side.appendChild(block);
  }
  if(daySummary){
    const block=document.createElement("section");
    block.className="v5-focus-day-block";
    block.innerHTML='<div class="v5-focus-subhead"><b>Gün sonu</b><span>Kısa özet</span></div>';
    block.appendChild(daySummary);
    side.appendChild(block);
  }

  shell.append(main,side);
  screen.appendChild(shell);
  for(const heading of Array.from(screen.querySelectorAll<HTMLElement>(":scope > h2"))){
    const label=heading.textContent?.trim()||"";
    if(label==="Bugünün oturumları"||label==="Gün sonu özeti")heading.remove();
  }
  return shell;
}

function installSecondary(screen:HTMLElement,shell:HTMLElement):void{
  if(screen.querySelector("[data-v5-focus-secondary]"))return;
  const secondary=document.createElement("section");
  secondary.className="v5-focus-secondary";
  secondary.dataset.v5FocusSecondary="true";

  const head=document.createElement("button");
  head.type="button";
  head.className="v5-focus-secondary-toggle";
  head.setAttribute("aria-expanded","false");
  head.innerHTML='<span><b>Diğer odak araçları</b><small>Geçmiş, analiz, nefes, simülasyon ve ayarlar</small></span><em>+</em>';

  const body=document.createElement("div");
  body.className="v5-focus-secondary-body";
  body.hidden=true;

  const nodes=Array.from(screen.children).filter((node):node is HTMLElement=>
    node instanceof HTMLElement&&
    node!==shell&&
    !node.matches("[data-v5-focus-header]")&&
    !node.matches("[data-v5-focus-secondary]")
  );
  for(const node of nodes)body.appendChild(node);

  head.addEventListener("click",()=>{
    body.hidden=!body.hidden;
    head.setAttribute("aria-expanded",String(!body.hidden));
    const icon=head.querySelector("em");
    if(icon)icon.textContent=body.hidden?"+":"−";
  });

  secondary.append(head,body);
  screen.appendChild(secondary);
}

export function installFocusV5():{installed:boolean;validate:()=>string[]}{
  const screen=byId("pomo");
  if(!screen)return {installed:false,validate:()=>["focus screen missing"]};
  screen.classList.add("v5-focus");
  screen.dataset.v5Focus="ready";
  createHeader(screen);
  const shell=installShell(screen);
  if(shell)installSecondary(screen,shell);

  return {
    installed:true,
    validate:()=>{
      const errors:string[]=[];
      if(screen.dataset.v5Focus!=="ready")errors.push("focus marker missing");
      if(!screen.querySelector("[data-v5-focus-header]"))errors.push("focus header missing");
      if(!screen.querySelector("[data-v5-focus-shell]"))errors.push("focus shell missing");
      if(!screen.querySelector("[data-v5-current-session]"))errors.push("current session card missing");
      if(!screen.querySelector("[data-v5-focus-secondary]"))errors.push("focus secondary area missing");
      for(const id of ["focusCard","swCard","pomoSubjPick","v29GoalText","v29GoalQ"])if(!document.getElementById(id))errors.push(id+" missing");
      return errors;
    }
  };
}
