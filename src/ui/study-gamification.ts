import {calculateStudyGamification,createGamificationProfile,setNextDayGoal,planRestDay,shiftDay,keyOf} from "../domain/study-gamification";
import type {StudyBadge,StudyGamificationSnapshot,StudyGamificationState} from "../domain/study-gamification";
import {installStudyTaskPanel} from "./study-tasks-panel.ts";
import {installStudyInsightsPanel} from "./study-insights-panel.ts";
import "./study-gamification.css";

type LegacyWindow=Window&{
  YKSLegacyState?:{readState?:()=>StudyGamificationState|null;save?:()=>unknown};
  S?:StudyGamificationState;
  save?:()=>unknown;
  toast?:(message:string)=>void;
};
const runtime=window as LegacyWindow;
const ROOT_ID="studyGamification";
type CareerTab="general"|"badges"|"tasks"|"career";
type BadgeFilter="all"|"earned"|"locked"|"Bronz"|"Gümüş"|"Altın"|"Elmas"|"Efsanevi";
let activeTab:CareerTab="general",badgeFilter:BadgeFilter="all",editing=false,renderQueued=false;
let previousProfileKey="";
let previousLevel=0;

function node<K extends keyof HTMLElementTagNameMap>(tag:K,className="",value=""):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(value)element.textContent=value;
  return element;
}
function add(parent:HTMLElement,...children:HTMLElement[]):void{children.forEach(child=>parent.appendChild(child));}
function readState():StudyGamificationState|null{
  try{return runtime.YKSLegacyState?.readState?.()??runtime.S??null;}
  catch{return runtime.S??null;}
}
function saveState():boolean{
  try{
    if(typeof runtime.YKSLegacyState?.save==="function")return runtime.YKSLegacyState.save()!==false;
    if(typeof runtime.save==="function")return runtime.save()!==false;
    return false;
  }catch(error){console.error("Başarım kaydı yapılamadı",error);return false;}
}
function mount():HTMLElement|null{
  const existing=document.getElementById(ROOT_ID);
  const settingsHost=document.getElementById("ymsAchievementsContent");
  if(existing){
    if(settingsHost){
      if(existing.parentElement!==settingsHost)settingsHost.appendChild(existing);
      // Move related panels as one unit, irrespective of event listener order.
      for(const id of ["studyTasksPanel","studyInsightsPanel"]){
        const section=document.getElementById(id);
        if(section&&section.parentElement!==settingsHost)settingsHost.appendChild(section);
      }
      settingsHost.querySelector("[data-yms-achievements-loading]")?.setAttribute("hidden","");
    }
    return existing;
  }
  const fallback=document.querySelector("#home .home-overview");
  if(!settingsHost&&!fallback)return null;
  const root=node("section","sg-panel");
  root.id=ROOT_ID;root.setAttribute("aria-label","Günlük seri, XP ve başarımlar");
  if(settingsHost){
    settingsHost.appendChild(root);
    settingsHost.querySelector("[data-yms-achievements-loading]")?.setAttribute("hidden","");
  }else fallback?.insertAdjacentElement("afterend",root);
  return root;
}

function openAchievements():void{
  const win=window as LegacyWindow&{v30Action?:(action:string)=>unknown;go?:(screen:string)=>unknown};
  try{
    if(typeof win.v30Action==="function")win.v30Action("settings");
    else win.go?.("more");
    window.dispatchEvent(new CustomEvent("yks:open-settings",{detail:{category:"achievements"}}));
  }catch(error){console.warn("Başarımlar açılamadı",error);}
}

/** Compact, real-data level bar on Today; opening it navigates to Career Center. */
function renderTodayTeaser(snapshot:StudyGamificationSnapshot):void{
  const home=document.getElementById("home"),hub=document.getElementById("todayHub");
  if(!home||!hub)return;
  let link=document.getElementById("todayAchievementShortcut") as HTMLButtonElement|null;
  if(!link){
    link=node("button","sg-today-shortcut") as HTMLButtonElement;
    link.id="todayAchievementShortcut";link.type="button";
    link.setAttribute("aria-label","YKS Kariyeri: seviye ve başarımlar detayını aç");
    const head=node("div","sg-today-shortcut-head");
    head.append(node("span","sg-today-shortcut-title","⚡ YKS Kariyerim"),
      node("strong","sg-today-level"),node("span","sg-today-shortcut-arrow","›"));
    const rail=node("span","sg-today-level-rail");
    rail.setAttribute("role","progressbar");rail.setAttribute("aria-label","Seviye XP ilerlemesi");
    const fill=node("i","sg-today-level-fill");rail.append(fill);
    const line=node("div","sg-today-shortcut-line");
    line.append(node("span","sg-today-xp"),node("span","sg-today-shortcut-metrics"));
    line.lastElementChild?.setAttribute("data-sg-quick-metrics","true");
    link.append(head,rail,line);
    link.addEventListener("click",openAchievements);
    hub.insertAdjacentElement("beforebegin",link);
  }
  const level=link.querySelector<HTMLElement>(".sg-today-level");
  const xp=link.querySelector<HTMLElement>(".sg-today-xp");
  const summary=link.querySelector<HTMLElement>("[data-sg-quick-metrics]");
  const rail=link.querySelector<HTMLElement>(".sg-today-level-rail");
  const fill=link.querySelector<HTMLElement>(".sg-today-level-fill");
  const progress=snapshot.activated?Math.max(0,snapshot.levelProgress):0;
  const goal=snapshot.activated?Math.max(1,snapshot.levelGoal):1;
  if(level)level.textContent=snapshot.activated?
    "Seviye "+snapshot.level+" · "+snapshot.rank:"Kariyerini başlat";
  if(xp)xp.textContent=snapshot.activated?
    progress+" / "+goal+" XP · Sonraki seviye için "+Math.max(0,goal-progress)+" XP":"Hedeflerini seç, XP kazanmaya başla";
  if(summary)summary.textContent=snapshot.activated?
    "🔥 "+snapshot.currentStreak+" gün  ·  🏅 "+snapshot.earnedBadges+"/"+snapshot.badges.length+"  ·  🛡️ "+snapshot.shields:
    "Rozet ve görev koleksiyonun";
  if(fill)fill.style.width=Math.min(100,progress/goal*100)+"%";
  if(rail){
    rail.setAttribute("aria-valuenow",String(progress));
    rail.setAttribute("aria-valuemin","0");
    rail.setAttribute("aria-valuemax",String(goal));
  }
  link.title="Ayarlar → Başarımlar";
}

function bar(percent:number,className=""):HTMLElement{
  const track=node("div","sg-rail "+className),fill=node("span","sg-rail-fill");
  fill.style.width=Math.max(0,Math.min(100,percent))+"%";
  track.appendChild(fill);return track;
}
function numericField(label:string,value:number,min:number,max:number):{wrap:HTMLElement;input:HTMLInputElement}{
  const wrap=node("label","sg-goal-label"),title=node("span","",label);
  const input=node("input","sg-goal-input");
  input.type="number";input.inputMode="numeric";input.min=String(min);input.max=String(max);
  input.step="1";input.required=true;input.value=String(value);
  add(wrap,title,input);return {wrap,input};
}
function goalForm(snapshot:StudyGamificationSnapshot,initial:boolean):HTMLElement{
  const form=node("form","sg-form");
  const explanation=node("p","sg-hint",initial?
    "Başarımlar bugünden itibaren başlar. Önceki çalışmaların silinmez ve XP kazandırmaz.":
    "Yeni hedeflerin yarından itibaren geçerli olacak. Bugünkü hedef değişmeyecek.");
  const fields=node("div","sg-goal-fields");
  const time=numericField("Günlük odak (15–480 dk)",snapshot.goalMinutes,15,480);
  const question=numericField("Günlük soru (10–300)",snapshot.goalQuestions,10,300);
  add(fields,time.wrap,question.wrap);
  const actions=node("div","sg-form-actions");
  const submit=node("button","sg-cta",initial?"Başarımlarımı başlat":"Yarından itibaren kaydet");
  submit.type="submit";actions.appendChild(submit);
  if(!initial){
    const cancel=node("button","sg-cancel","Vazgeç");
    cancel.type="button";cancel.addEventListener("click",()=>{editing=false;schedule();});
    actions.appendChild(cancel);
  }
  const status=node("p","sg-feedback");
  status.setAttribute("role","status");
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const minutes=Number(time.input.value),questions=Number(question.input.value);
    const current=readState();
    if(!current){status.textContent="Öğrenci verileri henüz hazır değil.";return;}
    try{
      const before=current.gamification;
      if(initial){
        if(before){status.textContent="Başarımlar zaten etkin. Sayfayı yenile.";return;}
        current.gamification=createGamificationProfile(new Date(),minutes,questions,current);
      }else{
        if(!before)return;
        current.gamification=setNextDayGoal(before,new Date(),minutes,questions);
      }
      if(!saveState()){
        current.gamification=before;
        status.textContent="Kayıt başarısız. Veriler değiştirilmedi, tekrar dene.";return;
      }
      editing=false;
      runtime.toast?.(initial?"🎯 Başarım yolculuğun başladı!":"Hedefler yarından itibaren geçerli.");
      schedule();
    }catch(error){status.textContent=error instanceof Error?error.message:"Geçersiz hedefler.";}
  });
  add(form,explanation,fields,actions,status);
  return form;
}
/* Hafif rozet/level kutlaması; yalnız kaydedilmiş yeni ödüllerde görünür. */
let celebrationTimer=0;
function celebrate(title:string,description:string,icon:string,rarity=""):void{
  const existing=document.getElementById("sgRewardNotice");
  existing?.remove();
  if(celebrationTimer)window.clearTimeout(celebrationTimer);
  const notice=node("section","sg-reward-notice");
  notice.id="sgRewardNotice";notice.setAttribute("role","status");
  notice.setAttribute("aria-live","polite");
  notice.dataset.rarity=rarity;
  const symbol=node("span","sg-reward-symbol",icon);
  symbol.setAttribute("aria-hidden","true");
  const content=node("div","sg-reward-copy");
  add(content,node("strong","",title),node("span","",description));
  const close=node("button","sg-reward-close","×");
  close.type="button";close.setAttribute("aria-label","Kutlamayı kapat");
  close.addEventListener("click",()=>{notice.remove();if(celebrationTimer)window.clearTimeout(celebrationTimer);});
  add(notice,symbol,content,close);
  document.body.appendChild(notice);
  celebrationTimer=window.setTimeout(()=>notice.remove(),5200);
}
function protectionPanel(snapshot:StudyGamificationSnapshot):HTMLElement{
  const root=node("section","sg-protection");
  const header=node("div","sg-protection-head");
  add(header,node("strong","","🛡️ Seri koruması"),
    node("span","",snapshot.shields+" / "+snapshot.shieldLimit+" kalkan"));
  root.appendChild(header);
  root.appendChild(node("p","sg-hint",
    "7 gerçek başarılı çalışma gününde 1 kalkan kazanırsın. En fazla 2 kalkan birikir."));
  if(snapshot.shieldsUsed){
    root.appendChild(node("small","sg-protection-meta",snapshot.shieldsUsed+" gün kalkanla korundu."));
  }
  const rest=node("div","sg-rest-section");
  const label=node("label","sg-rest-label","🌿 Esnek dinlenme gününü planla");
  const picker=node("select","sg-rest-select");
  picker.setAttribute("aria-label","Gelecek dinlenme gününü seç");
  const today=keyOf(new Date());
  const planned=new Set(snapshot.restDays);
  const weekKey=(key:string)=>{
    const day=new Date(key+"T12:00:00");
    return shiftDay(key,-((day.getDay()+6)%7));
  };
  const occupiedWeeks=new Set(snapshot.restDays.map(weekKey));
  for(let offset=1;offset<=14;offset++){
    const key=shiftDay(today,offset);
    if(planned.has(key)||occupiedWeeks.has(weekKey(key)))continue;
    const date=new Date(key+"T12:00:00");
    const option=node("option","",date.toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"}));
    option.value=key;picker.appendChild(option);
  }
  const button=node("button","sg-rest-button","Dinlenme günü seç");
  button.type="button";button.disabled=!picker.options.length;
  const feedback=node("p","sg-feedback");feedback.setAttribute("role","status");
  button.addEventListener("click",()=>{
    const state=readState(),before=state?.gamification;
    if(!state||!before||!picker.value)return;
    try{
      state.gamification=planRestDay(before,picker.value,new Date());
      if(!saveState()){
        state.gamification=before;
        feedback.textContent="Dinlenme günü kaydedilemedi, lütfen tekrar dene.";
        return;
      }
      runtime.toast?.("🌿 Dinlenme günün planlandı.");
      schedule();
    }catch(error){state.gamification=before;feedback.textContent=error instanceof Error?error.message:"Tarih seçilemedi.";}
  });
  const options=node("div","sg-rest-options");
  add(options,picker,button);
  add(rest,label,options,feedback);
  root.appendChild(rest);
  if(snapshot.restDays.length){
    const days=snapshot.restDays.filter(k=>k>=today).slice(0,2)
      .map(k=>new Date(k+"T12:00:00").toLocaleDateString("tr-TR",{day:"numeric",month:"long"}));
    if(days.length)root.appendChild(node("p","sg-hint","Planlanan dinlenme: "+days.join(", ")));
  }
  return root;
}

const rarityKey=(rarity:string)=>({
  "Bronz":"bronze","Gümüş":"silver","Altın":"gold","Elmas":"diamond","Efsanevi":"legendary"
} as Record<string,string>)[rarity]??"bronze";
const pct=(a:number,b:number)=>Math.min(100,Math.max(0,Math.round(a/Math.max(1,b)*100)));
const fmt=(n:number)=>n.toLocaleString("tr-TR");
const filterNames:readonly {key:BadgeFilter;label:string}[]=[
  {key:"all",label:"Tümü"},{key:"earned",label:"Kazanılan"},{key:"locked",label:"Kilitli"},
  {key:"Bronz",label:"Bronz"},{key:"Gümüş",label:"Gümüş"},{key:"Altın",label:"Altın"},
  {key:"Elmas",label:"Elmas"},{key:"Efsanevi",label:"Efsanevi"}
];
function openBadgeDetail(badge:StudyBadge,opener:HTMLElement):void{
  document.getElementById("sgBadgeDetail")?.remove();
  const dialog=node("dialog","sg-badge-dialog");
  dialog.id="sgBadgeDetail";
  dialog.setAttribute("aria-labelledby","sgBadgeDetailTitle");
  const hidden=Boolean(badge.hidden&&!badge.unlocked);
  dialog.dataset.rarity=rarityKey(badge.rarity);
  const close=()=>dialog.close();
  const closeButton=node("button","sg-dialog-close","×");
  closeButton.type="button";closeButton.setAttribute("aria-label","Başarım detayını kapat");
  closeButton.addEventListener("click",close);
  const medal=node("div","sg-dialog-medal",hidden?"✦":badge.icon);
  medal.setAttribute("aria-hidden","true");
  const label=node("span","sg-dialog-rarity",badge.rarity+" · "+(badge.unlocked?"Kazanıldı":"Kilitli"));
  const title=node("h3","",hidden?"Gizli Başarım":badge.title);
  title.id="sgBadgeDetailTitle";
  const description=node("p","sg-dialog-description",
    hidden?"Bu gizli başarımın koşulu keşfedilene kadar sürpriz kalacak.":badge.description);
  const reward=node("div","sg-dialog-reward");
  reward.append(node("span","","Rozet ödülü"),node("strong","",
    hidden?"Sürpriz ödül":"+"+fmt(badge.xp)+" XP"));
  const rule=node("p","sg-dialog-rule",
    "Bu başarımın ödülü XP ve koleksiyon rozetidir; ekstra güç veya kalkan vermez.");
  const body=node("div","sg-dialog-body");
  body.append(closeButton,medal,label,title,description,reward,rule);
  if(!hidden){
    const progress=node("div","sg-dialog-progress");
    const line=node("div","sg-dialog-progress-line");
    line.append(node("span","",badge.unlocked?"Başarım tamamlandı":"İlerleme"),
      node("strong","",fmt(badge.progress)+" / "+fmt(badge.goal)));
    progress.append(line,bar(pct(badge.progress,badge.goal),"sg-dialog-rail"));
    if(badge.unlockedAt){
      progress.append(node("small","sg-dialog-date",
        "Kazanıldığı tarih: "+new Date(badge.unlockedAt).toLocaleDateString("tr-TR")));
    }else{
      progress.append(node("small","sg-dialog-date",
        badge.pending?"Bu ödül henüz aktif değil.":"Kalan: "+fmt(Math.max(0,badge.goal-badge.progress))));
    }
    body.insertBefore(progress,reward);
  }
  dialog.append(body);
  dialog.addEventListener("click",event=>{if(event.target===dialog)close();});
  dialog.addEventListener("close",()=>{
    dialog.remove();if(opener.isConnected)opener.focus({preventScroll:true});
  },{once:true});
  document.body.append(dialog);
  try{dialog.showModal();}catch{dialog.setAttribute("open","");closeButton.focus();}
}
function badgeCard(badge:StudyBadge):HTMLElement{
  const locked=!badge.unlocked,secret=Boolean(badge.hidden&&locked);
  const card=node("button","sg-badge sg-medal-card"+(locked?" is-locked":" is-unlocked"));
  card.type="button";
  card.dataset.rarity=rarityKey(badge.rarity);
  const crest=node("span","sg-medal-crest",secret?"✦":badge.icon);
  crest.setAttribute("aria-hidden","true");
  const copy=node("span","sg-badge-copy");
  const title=node("strong","",secret?"Gizli Başarım":badge.title);
  const description=node("span","",secret?"Henüz keşfedilmedi":badge.description);
  const status=node("small","",
    badge.unlocked?"✓ Kazanıldı":secret?"Gizli ödül":fmt(badge.progress)+" / "+fmt(badge.goal));
  const reward=node("span","sg-medal-reward",
    secret?"Sürpriz":"+"+fmt(badge.xp)+" XP");
  copy.append(title,description,status);
  card.append(crest,copy,reward);
  if(locked&&!secret)card.append(bar(pct(badge.progress,badge.goal),"sg-badge-progress"));
  card.setAttribute("aria-label",(secret?"Gizli başarım":badge.title)+
    " · "+badge.rarity+" · "+(badge.unlocked?"Kazanıldı":"Kilitli")+" · Detayları aç");
  card.addEventListener("click",()=>openBadgeDetail(badge,card));
  return card;
}
function featured(snapshot:StudyGamificationSnapshot):StudyBadge[]{
  const earned=snapshot.badges.filter(b=>b.unlocked).slice(-2).reverse();
  const candidates=snapshot.badges.filter(b=>!b.unlocked&&!b.pending&&!b.hidden)
    .sort((a,b)=>pct(b.progress,b.goal)-pct(a.progress,a.goal));
  return [...earned,...candidates].slice(0,4);
}
function syncTabPanels():void{
  const tasks=document.getElementById("studyTasksPanel");
  const insights=document.getElementById("studyInsightsPanel");
  if(tasks)tasks.hidden=activeTab!=="tasks";
  if(insights)insights.hidden=activeTab!=="career";
}
function chooseCareerTab(next:CareerTab,restoreFocus=true):void{
  if(activeTab===next)return;
  activeTab=next;
  schedule();
  if(restoreFocus){
    // The tablist is re-rendered. Restore focus to the new active tab.
    window.requestAnimationFrame(()=>{
      document.querySelector<HTMLButtonElement>(
        '#studyGamification [data-career-tab="'+next+'"]')?.focus({preventScroll:true});
    });
  }
}
function makeTabButton(id:CareerTab,title:string):HTMLButtonElement{
  const button=node("button","sg-tab",title) as HTMLButtonElement;
  button.type="button";button.setAttribute("role","tab");
  button.dataset.careerTab=id;
  button.setAttribute("aria-selected",String(activeTab===id));
  button.tabIndex=activeTab===id?0:-1;
  button.setAttribute("aria-controls","sgCareerTabPanel");
  button.addEventListener("click",()=>chooseCareerTab(id));
  button.addEventListener("keydown",event=>{
    const tabs:CareerTab[]=["general","badges","tasks","career"];
    const index=tabs.indexOf(id);
    const next=event.key==="ArrowRight"?tabs[(index+1)%tabs.length]:
      event.key==="ArrowLeft"?tabs[(index+tabs.length-1)%tabs.length]:
      event.key==="Home"?tabs[0]:event.key==="End"?tabs[tabs.length-1]:undefined;
    if(next){
      event.preventDefault();chooseCareerTab(next);
    }
  });
  return button;
}
function render(snapshot:StudyGamificationSnapshot,root:HTMLElement):void{
  root.replaceChildren();
  root.classList.add("sg-career-center");
  root.dataset.activeTab=activeTab;
  const hero=node("header","sg-career-hero");
  const leading=node("div","sg-career-hero-text");
  leading.append(node("span","sg-eyebrow","YKS KARİYER MERKEZİ"),
    node("h2","","Başarımlar"),node("p","","Emek verdikçe seviye atla, rozetlerini keşfet."));
  const emblem=node("span","sg-hero-emblem","🏆");emblem.setAttribute("aria-hidden","true");
  hero.append(leading,emblem);
  root.append(hero);
  if(!snapshot.activated){
    root.append(node("p","sg-intro",
      "Başarım yolculuğunu başlatmak için günlük odak ve soru hedeflerini belirle."),
      goalForm(snapshot,true));
    syncTabPanels();return;
  }
  const top=node("div","sg-career-profile");
  const rank=node("div","sg-career-rank");
  rank.append(node("span","sg-rank-icon","⚡"),
    node("span","sg-career-rank-label","Seviye "+snapshot.level),
    node("strong","sg-career-rank-title",snapshot.rank));
  const total=node("span","sg-career-total",fmt(snapshot.xp)+" toplam XP");
  const levelHead=node("div","sg-career-level-head");
  levelHead.append(node("strong","","Sonraki seviyeye doğru"),
    node("span","",fmt(snapshot.levelProgress)+" / "+fmt(snapshot.levelGoal)+" XP"));
  const levelLine=bar(pct(snapshot.levelProgress,snapshot.levelGoal),"sg-career-rail");
  levelLine.setAttribute("role","progressbar");
  levelLine.setAttribute("aria-label","Seviye XP ilerlemesi");
  levelLine.setAttribute("aria-valuemin","0");
  levelLine.setAttribute("aria-valuemax",String(snapshot.levelGoal));
  levelLine.setAttribute("aria-valuenow",String(snapshot.levelProgress));
  const next=node("p","sg-career-next",
    fmt(Math.max(0,snapshot.levelGoal-snapshot.levelProgress))+" XP sonra seviye "+(snapshot.level+1));
  top.append(rank,total,levelHead,levelLine,next);
  const stats=node("div","sg-career-stats");
  for(const item of [
    ["🔥",snapshot.currentStreak+" gün","Güncel seri"],
    ["🏅",snapshot.earnedBadges+" / "+snapshot.badges.length,"Rozetler"],
    ["🛡️",snapshot.shields+" / "+snapshot.shieldLimit,"Kalkan"],
    ["📆",snapshot.activeDays+" gün","Başarılı gün"]
  ]){
    const card=node("div","sg-career-stat");
    card.append(node("span","",item[0]),node("strong","",item[1]),
      node("small","",item[2]));
    stats.append(card);
  }
  root.append(top,stats);
  const tabs=node("div","sg-career-tabs");
  tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Başarım kategorileri");
  for(const [id,label] of [
    ["general","Genel"],["badges","Rozetler"],["tasks","Görevler"],["career","Kariyer"]
  ] as const)tabs.append(makeTabButton(id,label));
  root.append(tabs);
  const area=node("section","sg-tab-content");
  area.id="sgCareerTabPanel";
  area.setAttribute("role","tabpanel");
  area.setAttribute("aria-label",(
    {general:"Genel",badges:"Rozetler",tasks:"Görevler",career:"Kariyer"} as const)[activeTab]);
  if(activeTab==="general"){
    const current=node("section","sg-career-daily");
    const dailyHead=node("div","sg-daily-text");
    dailyHead.append(node("strong","",snapshot.todayCompleted?"🎯 Bugünün hedefleri tamamlandı":"Bugünkü hedefler"));
    const edit=node("button","sg-goal-edit","Hedefi düzenle");
    edit.type="button";edit.addEventListener("click",()=>{editing=!editing;schedule();});
    dailyHead.append(edit);current.append(dailyHead);
    for(const [name,value,goal,unit] of [
      ["Odak",snapshot.todayMinutes,snapshot.goalMinutes," dk"],
      ["Soru",snapshot.todayQuestions,snapshot.goalQuestions," soru"]
    ] as const){
      const row=node("div","sg-daily-text");
      row.append(node("span","",name),node("strong","",fmt(value)+" / "+fmt(goal)+unit));
      current.append(row,bar(pct(value,goal),"sg-daily-progress"));
    }
    if(editing)current.append(goalForm(snapshot,false));
    const near=node("section","sg-career-featured");
    const nearHead=node("div","sg-badges-head");
    nearHead.append(node("strong","","🏅 Rozet koleksiyonun"),
      node("span","",snapshot.earnedBadges+" / "+snapshot.badges.length+" açıldı"));
    const grid=node("div","sg-medal-grid");
    for(const badge of featured(snapshot))grid.append(badgeCard(badge));
    const all=node("button","sg-open-collection","Tüm rozetleri gör →");
    all.type="button";all.addEventListener("click",()=>chooseCareerTab("badges"));
    near.append(nearHead,grid,all);
    const explanation=node("section","sg-xp-breakdown");
    explanation.setAttribute("aria-label","XP kaynakları");
    const explanationHead=node("div","sg-xp-breakdown-head");
    explanationHead.append(node("h3","","⚡ XP nereden geldi?"),
      node("strong","",fmt(snapshot.xp)+" XP"));
    explanation.append(explanationHead);
    for(const [icon,label,value,detail] of [
      ["⏱️","Odak, sorular ve başarılı günler",snapshot.xpSources.study,"Kayıtlı çalışmalarından"],
      ["🏅","Açtığın rozetler",snapshot.xpSources.badges,"Bir kez kazanılan rozet ödülleri"],
      ["🎯","Tamamlanan görevler",snapshot.xpSources.tasks,"Günlük ve haftalık görev ödülleri"]
    ] as const){
      const row=node("div","sg-xp-breakdown-row");
      row.append(node("span","sg-xp-breakdown-icon",icon));
      const copy=node("div","sg-xp-breakdown-copy");
      copy.append(node("strong","",label),node("small","",detail));
      row.append(copy,node("b","",fmt(value)+" XP"));
      explanation.append(row);
    }
    const info=node("div","sg-career-tip",
      "Rozetler XP kazandırır. Kalkan ise 7 gerçek başarılı günün sonunda kazanılır.");
    area.append(current,explanation,near,protectionPanel(snapshot),info);
  }else if(activeTab==="badges"){
    const collection=node("div","sg-collection-head");
    collection.append(node("h3","","Rozet koleksiyonu"),
      node("p","",snapshot.earnedBadges+" kazanıldı · "+snapshot.badges.length+" toplam rozet"));
    const filters=node("div","sg-medal-filters");
    filters.setAttribute("aria-label","Rozetleri filtrele");
    filterNames.forEach(item=>{
      const filter=node("button","sg-filter",item.label);
      filter.type="button";
      filter.setAttribute("aria-pressed",String(badgeFilter===item.key));
      filter.addEventListener("click",()=>{badgeFilter=item.key;schedule();});
      filters.append(filter);
    });
    const filtered=snapshot.badges.filter(b=>
      badgeFilter==="all"||(badgeFilter==="earned"&&b.unlocked)||
      (badgeFilter==="locked"&&!b.unlocked)||b.rarity===badgeFilter);
    const collectionGrid=node("div","sg-medal-grid sg-medal-collection");
    filtered.forEach(b=>collectionGrid.append(badgeCard(b)));
    const note=node("p","sg-hint",
      "Bir rozete dokun: açılma koşulunu, ilerlemeni, tarihini ve XP ödülünü gör. Gizli başarımlar sürpriz kalır.");
    area.append(collection,filters,collectionGrid,note);
    if(!filtered.length)area.append(node("p","sg-empty","Bu filtrede henüz rozet bulunmuyor."));
  }else if(activeTab==="tasks"){
    area.append(node("h3","","Görev Merkezi"),
      node("p","sg-hint","Günlük ve haftalık görevler ilerlemeni ve kazanılacak gerçek XP'yi gösterir."));
  }else{
    area.append(node("h3","","Kariyer geçmişin"));
    const grid=node("div","sg-career-records");
    for(const [title,value] of [
      ["Toplam çalışma",Math.floor(snapshot.totalMinutes/60)+" sa "+snapshot.totalMinutes%60+" dk"],
      ["Çözülen soru",fmt(snapshot.totalQuestions)],
      ["Kaydedilen deneme",fmt(snapshot.totalExams)],
      ["En uzun seri",snapshot.longestStreak+" gün"]
    ]){const card=node("div","sg-career-record");card.append(node("span","",title),node("strong","",value));grid.append(card);}
    area.append(grid,node("p","sg-hint",
      "Aşağıda çalışma takvimi, kişisel rekorlar ve ders ustalığın kayıtlarından hesaplanır."));
  }
  root.append(area);
  syncTabPanels();
}

function refresh():void{
  const root=mount(),state=readState();
  if(!root||!state)return;
  let snapshot=calculateStudyGamification(state);
  const profile=state.gamification;
  const profileKey=profile?.activatedAt?String(profile.activatedAt):"inactive";
  if(previousProfileKey!==profileKey){previousProfileKey=profileKey;previousLevel=0;activeTab="general";badgeFilter="all";editing=false;}
  // Tekil rozet kimliği saklanır; her yeniden çizimde aynı ödül yazılmaz.
  if(snapshot.activated&&profile&&snapshot.newBadgeIds.length){
    const time=Date.now();
    const priorEarned={...(profile.earned??{})};
    profile.earned??={};
    for(const id of snapshot.newBadgeIds){
      const badge=snapshot.badges.find(item=>item.id===id);
      if(badge&&!profile.earned[id])profile.earned[id]={at:time,xp:badge.xp};
    }
    if(saveState()){
      const prize=snapshot.badges.find(item=>item.id===snapshot.newBadgeIds[0]);
      if(prize)celebrate("🏆 "+prize.title,
        prize.rarity+" başarım · +"+prize.xp+" XP"+
        (snapshot.newBadgeIds.length>1?" · "+(snapshot.newBadgeIds.length-1)+" rozet daha":""),
        prize.icon,prize.rarity);
    }else profile.earned=priorEarned;
    snapshot=calculateStudyGamification(state);
  }
  if(previousLevel>0&&snapshot.level>previousLevel)celebrate("⚡ Seviye "+snapshot.level,"Yeni unvan: "+snapshot.rank,"✨");
  previousLevel=snapshot.level;
  render(snapshot,root);
  renderTodayTeaser(snapshot);
}
function schedule():void{
  if(renderQueued)return;
  renderQueued=true;
  window.requestAnimationFrame(()=>{renderQueued=false;refresh();});
}
export function installStudyGamification():{installed:boolean}{
  if(!mount())return {installed:false};
  if(document.documentElement.dataset.studyGamificationListeners==="ready"){schedule();return {installed:true};}
  document.documentElement.dataset.studyGamificationListeners="ready";
  installStudyTaskPanel({readState,saveState,toast:message=>runtime.toast?.(message)});
  installStudyInsightsPanel({readState,toast:message=>runtime.toast?.(message)});
  for(const event of ["yks:data-changed","yks:data-primary-ready","yks:auth-state","yks:navigation","yks:achievements-settings-ready"]){
    window.addEventListener(event,schedule);
  }
  window.addEventListener("focus",schedule);
  window.addEventListener("pageshow",schedule);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)schedule();});
  window.setInterval(()=>{if(!document.hidden)schedule();},60_000);
  schedule();return {installed:true};
}
