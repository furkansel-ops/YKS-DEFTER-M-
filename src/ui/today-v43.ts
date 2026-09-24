import "./today-v43.css";

type AppWindow=Window&{
  go?:(screen:string)=>unknown;
  openGun?:()=>unknown;
  saveJournal?:()=>unknown;
  shareCard?:()=>unknown;
};

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}
function txt(id:string,fallback="—"):string{
  const value=(byId(id)?.textContent||"").trim();
  return value||fallback;
}
function dateText():string{
  return new Intl.DateTimeFormat("tr-TR",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
}
function subjectTone(value:string):string{
  const text=value.toLocaleLowerCase("tr-TR");
  if(text.includes("matematik"))return "math";
  if(text.includes("fizik"))return "physics";
  if(text.includes("kimya"))return "chemistry";
  if(text.includes("biyoloji"))return "biology";
  if(text.includes("türk")||text.includes("paragraf"))return "turkish";
  return "other";
}
function makeBridge(home:HTMLElement):HTMLElement{
  const existing=home.querySelector<HTMLElement>(":scope > .v7-home-legacy");
  if(existing)return existing;
  const bridge=document.createElement("div");
  bridge.className="v7-home-legacy";
  bridge.hidden=true;
  bridge.setAttribute("aria-hidden","true");
  while(home.firstChild)bridge.appendChild(home.firstChild);
  home.appendChild(bridge);
  return bridge;
}
function metric(label:string,id:string,subId:string):HTMLElement{
  const item=document.createElement("article");
  item.className="v7-metric";
  item.dataset.valueId=id;
  item.dataset.subId=subId;
  item.innerHTML="<span></span><b>—</b><small>—</small>";
  const span=item.querySelector("span");
  if(span)span.textContent=label;
  return item;
}
function createHeader():HTMLElement{
  const header=document.createElement("header");
  header.className="v7-home-header";
  header.innerHTML='<div class="v7-greeting"><span>BUGÜN</span><h1>Merhaba</h1><p>Bugünkü odağın net olsun; gerisi sırayla gelir.</p></div><div class="v7-date"><span>BUGÜN</span><b></b></div>';
  const date=header.querySelector(".v7-date b");
  if(date)date.textContent=dateText();
  return header;
}
function createGoal():HTMLElement{
  const card=document.createElement("section");
  card.className="v7-card v7-goal";
  card.innerHTML='<header><div><span>BUGÜN</span><h2>Günlük hedef</h2></div></header><div class="v7-metrics"></div><button type="button" class="v7-details" data-day-details>Günün detayları</button>';
  const grid=card.querySelector<HTMLElement>(".v7-metrics");
  grid?.append(
    metric("Soru","todayHubQ","todayHubQSub"),
    metric("Odak","todayHubMin","todayHubMinSub"),
    metric("Program","todayHubPlan","todayHubPlanSub"),
    metric("Tekrar","todayHubReview","todayHubReviewSub")
  );
  card.querySelector<HTMLButtonElement>("[data-day-details]")?.addEventListener("click",()=>{
    (window as AppWindow).openGun?.();
  });
  return card;
}
function createProgram():HTMLElement{
  const card=document.createElement("section");
  card.className="v7-card v7-program";
  card.dataset.v7Program="true";
  card.innerHTML='<header class="v7-card-head"><div><span>BUGÜNKÜ PROGRAM</span><h2>Bugün ne yapıyorum?</h2></div><button type="button" data-open-program>Tüm program</button></header><div class="v7-plan-list"></div>';
  card.querySelector<HTMLButtonElement>("[data-open-program]")?.addEventListener("click",()=>{
    (window as AppWindow).go?.("program");
  });
  return card;
}
function createQuick():HTMLElement{
  const card=document.createElement("section");
  card.className="v7-card v7-quick";
  card.innerHTML='<header><span>HIZLI İŞLEMLER</span><h2>Devam et</h2></header><div class="v7-quick-grid"></div>';
  const grid=card.querySelector<HTMLElement>(".v7-quick-grid");
  const items=[
    ["program","▦","Programım","Bugünkü planı düzenle"],
    ["pomo","◎","Çalış","Odak oturumu başlat"],
    ["notes","✎","Notlarım","Günün notunu yaz"],
    ["progress","⌁","İstatistik","Gelişimini incele"]
  ] as const;
  for(const [route,icon,title,copy] of items){
    const button=document.createElement("button");
    button.type="button";
    button.dataset.route=route;
    button.innerHTML="<i>"+icon+"</i><span><b>"+title+"</b><small>"+copy+"</small></span><em>›</em>";
    grid?.appendChild(button);
  }
  return card;
}
function createCountdown():HTMLElement{
  const card=document.createElement("section");
  card.className="v7-card v7-countdown";
  card.innerHTML='<header><span>YKS SAYACI</span><small id="v7ExamDate">—</small></header><div class="v7-count-main"><b id="v7Countdown">—</b><em>gün</em></div><div class="v7-count-line"><i></i></div><div class="v7-streaks"><article><span>Plan serisi</span><b id="v7PlanStreak">0</b><small>gün</small></article><article><span>Hedef serisi</span><b id="v7TargetStreak">0</b><small>gün</small></article></div>';
  return card;
}
function createNotes():HTMLElement{
  const overlay=document.createElement("div");
  overlay.className="v7-note-overlay";
  overlay.hidden=true;
  overlay.innerHTML='<section class="v7-note-sheet" role="dialog" aria-modal="true" aria-labelledby="v7NoteTitle"><header><div><span>GÜNÜN NOTU</span><h2 id="v7NoteTitle">Bugün nasıl geçti?</h2></div><button type="button" data-note-close aria-label="Kapat">×</button></header><textarea id="v7NoteInput" maxlength="1000" placeholder="Bugün nasıl geçti? Tek cümle yeter."></textarea><button type="button" class="v7-note-save" data-note-save>Notu kaydet</button><button type="button" class="v7-note-share" data-note-share>Günün kartını indir</button></section>';
  return overlay;
}
function createView(home:HTMLElement):HTMLElement{
  const shell=document.createElement("div");
  shell.className="v7-home-view";
  shell.dataset.v7HomeView="true";
  const header=createHeader();
  const layout=document.createElement("div");
  layout.className="v7-layout";
  const main=document.createElement("main");
  main.className="v7-primary";
  main.append(createGoal(),createProgram());
  const side=document.createElement("aside");
  side.className="v7-side";
  side.append(createQuick(),createCountdown());
  layout.append(main,side);
  shell.append(header,layout);
  home.append(shell,createNotes());
  return shell;
}
function openNotes(home:HTMLElement):void{
  const overlay=home.querySelector<HTMLElement>(".v7-note-overlay");
  const input=home.querySelector<HTMLTextAreaElement>("#v7NoteInput");
  const legacy=byId<HTMLTextAreaElement>("journalInput");
  if(input)input.value=legacy?.value||"";
  if(overlay){
    overlay.hidden=false;
    document.documentElement.classList.add("v7-note-open");
    window.setTimeout(()=>input?.focus(),20);
  }
}
function closeNotes(home:HTMLElement):void{
  const overlay=home.querySelector<HTMLElement>(".v7-note-overlay");
  if(overlay)overlay.hidden=true;
  document.documentElement.classList.remove("v7-note-open");
}
function bindActions(home:HTMLElement):void{
  home.querySelector(".v7-quick")?.addEventListener("click",event=>{
    const button=(event.target as Element|null)?.closest<HTMLButtonElement>("button[data-route]");
    if(!button)return;
    const route=button.dataset.route;
    if(route==="notes"){openNotes(home);return;}
    if(route)(window as AppWindow).go?.(route);
  });
  home.querySelector("[data-note-close]")?.addEventListener("click",()=>closeNotes(home));
  home.querySelector(".v7-note-overlay")?.addEventListener("click",event=>{
    if(event.target===event.currentTarget)closeNotes(home);
  });
  home.querySelector("[data-note-save]")?.addEventListener("click",()=>{
    const input=home.querySelector<HTMLTextAreaElement>("#v7NoteInput");
    const legacy=byId<HTMLTextAreaElement>("journalInput");
    if(input&&legacy)legacy.value=input.value;
    (window as AppWindow).saveJournal?.();
    closeNotes(home);
  });
  home.querySelector("[data-note-share]")?.addEventListener("click",()=>{
    (window as AppWindow).shareCard?.();
  });
  window.addEventListener("keydown",event=>{if(event.key==="Escape")closeNotes(home);});
}
function syncMetrics(home:HTMLElement):void{
  const greeting=home.querySelector<HTMLElement>(".v7-greeting h1");
  if(greeting)greeting.textContent=txt("greeting","Merhaba");
  home.querySelectorAll<HTMLElement>(".v7-metric").forEach(item=>{
    const valueId=item.dataset.valueId||"";
    const subId=item.dataset.subId||"";
    const value=item.querySelector("b");
    const sub=item.querySelector("small");
    if(value)value.textContent=txt(valueId,"—");
    if(sub)sub.textContent=txt(subId,"—");
  });
}
function syncCountdown(home:HTMLElement):void{
  const set=(selector:string,value:string)=>{const node=home.querySelector<HTMLElement>(selector);if(node)node.textContent=value;};
  set("#v7Countdown",txt("countdown","—"));
  set("#v7ExamDate",txt("examDateLabel","—"));
  set("#v7PlanStreak",txt("streakPlan","0"));
  set("#v7TargetStreak",txt("streakTarget","0"));
  const legacyLine=byId("timeline");
  const line=home.querySelector<HTMLElement>(".v7-count-line i");
  if(line&&legacyLine)line.style.width=legacyLine.style.width||"0%";
}
function syncPlan(home:HTMLElement):void{
  const legacy=byId("todayPlan");
  const list=home.querySelector<HTMLElement>(".v7-plan-list");
  if(!legacy||!list)return;

  const rows=Array.from(legacy.querySelectorAll<HTMLElement>(".plancell"));
  list.replaceChildren();
  if(!rows.length){
    const empty=document.createElement("div");
    empty.className="v7-plan-empty";
    empty.innerHTML="<b>Bugün için görev görünmüyor.</b><span>Programım ekranından bugüne görev ekleyebilirsin.</span>";
    list.appendChild(empty);
    return;
  }

  rows.forEach((row,index)=>{
    const label=(row.querySelector(".pl")?.textContent||row.querySelector("b")?.textContent||"Görev").trim();
    const task=(row.querySelector(".pt")?.textContent||row.querySelector("small")?.textContent||"").trim();
    const item=document.createElement("article");
    item.className="v7-plan-item";
    item.classList.toggle("done",row.classList.contains("pd"));
    item.dataset.tone=subjectTone(label+" "+task);
    item.innerHTML='<div><b></b><span></span></div><div class="v7-plan-tools"></div>';
    const b=item.querySelector("b"),span=item.querySelector("span");
    if(b)b.textContent=label;
    if(span)span.textContent=task||"Plan görevi";

    const tools=item.querySelector<HTMLElement>(".v7-plan-tools");
    const video=row.querySelector<HTMLButtonElement>(".cvid");
    if(video){
      const btn=document.createElement("button");btn.type="button";btn.textContent="▶";btn.title="Videoyu aç";
      btn.addEventListener("click",event=>{event.stopPropagation();video.click();});
      tools?.appendChild(btn);
    }
    const tomorrow=row.querySelector<HTMLButtonElement>(".plan-tomorrow");
    if(tomorrow){
      const btn=document.createElement("button");btn.type="button";btn.textContent="Yarın";btn.title="Yarına taşı";
      btn.addEventListener("click",event=>{event.stopPropagation();tomorrow.click();});
      tools?.appendChild(btn);
    }
    item.addEventListener("click",event=>{
      if((event.target as Element).closest("button"))return;
      rows[index]?.click();
    });
    list.appendChild(item);
  });
}
function syncAll(home:HTMLElement):void{
  syncMetrics(home);
  syncCountdown(home);
  syncPlan(home);
}
function observeLegacy(home:HTMLElement,bridge:HTMLElement):void{
  let queued=false;
  const schedule=()=>{
    if(queued)return;
    queued=true;
    window.requestAnimationFrame(()=>{queued=false;syncAll(home);});
  };
  new MutationObserver(schedule).observe(bridge,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["style","class"]});
  window.addEventListener("yks:data-changed",schedule);
  window.addEventListener("yks:navigation-after",schedule);
  window.addEventListener("focus",schedule);
  schedule();
}
export function installTodayV43():{installed:boolean;validate:()=>string[]}{
  const home=byId("home");
  if(!home)return {installed:false,validate:()=>["home screen missing"]};
  if(home.dataset.v7Home==="ready")return {installed:true,validate:()=>[]};

  home.classList.remove("v43-today","v6-home");
  home.classList.add("v7-home");
  home.dataset.v43Today="ready";
  home.dataset.v7Home="ready";

  const bridge=makeBridge(home);
  createView(home);
  bindActions(home);
  observeLegacy(home,bridge);

  return {installed:true,validate:()=>{
    const errors:string[]=[];
    if(home.dataset.v7Home!=="ready")errors.push("v7 marker missing");
    if(!home.querySelector(":scope > .v7-home-legacy[hidden]"))errors.push("legacy bridge not hidden");
    if(!home.querySelector(":scope > [data-v7-home-view]"))errors.push("v7 view missing");
    if(!home.querySelector(".v7-program"))errors.push("v7 program missing");
    if(!home.querySelector(".v7-quick"))errors.push("v7 quick actions missing");
    return errors;
  }};
}
