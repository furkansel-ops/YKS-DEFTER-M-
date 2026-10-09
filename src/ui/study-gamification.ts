import {calculateStudyGamification,createGamificationProfile,setNextDayGoal,planRestDay,shiftDay,keyOf} from "../domain/study-gamification";
import type {StudyBadge,StudyGamificationSnapshot,StudyGamificationState} from "../domain/study-gamification";
import {installStudyTaskPanel} from "./study-tasks-panel.ts";
import {installStudyInsightsPanel} from "./study-insights-panel.ts";
import {achievementOverview,badgeProgressPercent} from "../domain/achievement-overview.ts";
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
type BadgeSort="nearest"|"recent"|"reward"|"name";
let activeTab:CareerTab="general",badgeFilter:BadgeFilter="all",badgeSort:BadgeSort="nearest",
  badgeQuery="",editing=false,renderQueued=false;
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

function renderSettingsOverview(snapshot:StudyGamificationSnapshot):void{
  const holder=document.querySelector<HTMLElement>("[data-yms-achievements-overview]");
  if(!holder)return;
  const label=holder.querySelector<HTMLElement>("[data-yms-career-summary]");
  const bar=holder.querySelector<HTMLElement>(".yms-career-overview-rail");
  const fill=holder.querySelector<HTMLElement>("[data-yms-career-progress]");
  let remaining=holder.querySelector<HTMLElement>("[data-yms-career-remaining]");
  if(!remaining){
    remaining=node("span","sg-settings-remaining");
    remaining.dataset.ymsCareerRemaining="true";
    holder.appendChild(remaining);
  }
  const progress=snapshot.activated?Math.min(100,Math.max(0,
    snapshot.levelProgress/Math.max(1,snapshot.levelGoal)*100)):0;
  if(label)label.textContent=snapshot.activated?
    "Seviye "+snapshot.level+" · "+snapshot.xp.toLocaleString("tr-TR")+" XP · "+
    snapshot.earnedBadges+"/"+snapshot.badges.length+" rozet":
    "Hedeflerini belirle, kariyerini başlat";
  if(fill)fill.style.width=progress+"%";
  if(remaining)remaining.textContent=snapshot.activated?
    "Sonraki seviyeye "+Math.max(0,snapshot.levelGoal-snapshot.levelProgress)+" XP kaldı":
    "İlk başarımların için günlük hedef belirle";
  if(bar){
    bar.setAttribute("aria-valuenow",String(Math.round(progress)));
    bar.setAttribute("aria-valuetext",snapshot.activated?
      "Sonraki seviyeye "+Math.max(0,snapshot.levelGoal-snapshot.levelProgress)+" XP kaldı":
      "Kariyer henüz başlatılmadı");
  }
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
    hidden?"Bu gizli başarımın koşulu keşfedilene kadar sürpriz kalacak.":
      "İlerlemen kayıtlı çalışmalardan ölçülür; koşulu tamamladığında rozet bir kez kazanılır.");
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
      node("strong","",fmt(badge.progress)+" / "+fmt(badge.goal)+" · "+badgeProgressPercent(badge)+"%"));
    progress.append(line,bar(pct(badge.progress,badge.goal),"sg-dialog-rail"));
    if(badge.unlockedAt){
      progress.append(node("small","sg-dialog-date",
        "Kazanıldığı tarih: "+new Date(badge.unlockedAt).toLocaleDateString("tr-TR")));
    }else{
      progress.append(node("small","sg-dialog-date",
        badge.pending?"Bu ödül henüz aktif değil.":"Kalan: "+fmt(Math.max(0,badge.goal-badge.progress))));
    }
    body.insertBefore(progress,reward);
    const how=node("div","sg-dialog-method");
    how.append(node("strong","","Nasıl kazanılır?"),node("span","",badge.description));
    body.insertBefore(how,progress);
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
    badge.unlocked?"✓ Kazanıldı"+(badge.unlockedAt?" · "+new Date(badge.unlockedAt).toLocaleDateString("tr-TR"):""):
      secret?"Gizli ödül":fmt(badge.progress)+" / "+fmt(badge.goal)+" · "+badgeProgressPercent(badge)+"%");
  const reward=node("span","sg-medal-reward",
    secret?"Sürpriz":"+"+fmt(badge.xp)+" XP");
  copy.append(title,description,node("small","sg-medal-rarity",badge.rarity),status);
  card.append(crest,copy,reward);
  if(locked&&!secret)card.append(bar(pct(badge.progress,badge.goal),"sg-badge-progress"));
  card.setAttribute("aria-label",(secret?"Gizli başarım":badge.title)+
    " · "+badge.rarity+" · "+(badge.unlocked?"Kazanıldı":"Kilitli")+" · Detayları aç");
  card.addEventListener("click",()=>openBadgeDetail(badge,card));
  return card;
}
function renderWeekReview(snapshot:StudyGamificationSnapshot):HTMLElement{
  const details=achievementOverview(snapshot),panel=node("section","sg-week-review");
  const head=node("div","sg-section-head");
  const copy=node("div");
  copy.append(node("span","sg-section-eyebrow","SON 7 GÜN DEĞİL · BU HAFTA"),
    node("h3","","Haftalık çalışma ritmin"),
    node("p","","Her gün odak ve soru hedeflerini birlikte tamamlamaya çalış."));
  const score=node("strong","sg-week-score",details.week.completed+" / 7");
  head.append(copy,score);panel.append(head);
  const list=node("div","sg-week-days");
  const labels:Record<string,string>={completed:"Hedef tamamlandı",rest:"Dinlenme",shield:"Kalkan kullanıldı",missed:"Hedef kaçırıldı",pending:"Bekliyor"};
  for(const day of snapshot.week){
    const cell=node("div","sg-week-day");
    cell.dataset.status=day.status;
    cell.dataset.today=String(day.today);
    const status=day.key>snapshot.todayKey?"Gelecek":labels[day.status];
    cell.title=day.key+" · "+status;
    cell.setAttribute("aria-label",day.label+" "+day.key+" · "+status);
    cell.append(node("span","",day.label),
      node("strong","",day.status==="completed"?"✓":day.status==="rest"?"🌿":day.status==="shield"?"🛡":day.status==="missed"?"×":"·"),
      node("small","",day.key.slice(-2)));
    list.append(cell);
  }
  panel.append(list);
  panel.append(node("p","sg-week-caption",
    "Bu hafta "+details.week.completed+" başarılı gün"+
    (details.week.rest?" · "+details.week.rest+" planlı dinlenme":"")+
    (details.week.shield?" · "+details.week.shield+" kalkan günü":"")+
    (details.week.missed?" · "+details.week.missed+" kaçırılan gün":"")+"."));
  return panel;
}
function renderNextBadges(snapshot:StudyGamificationSnapshot):HTMLElement{
  const model=achievementOverview(snapshot),panel=node("section","sg-next-badges");
  const head=node("div","sg-section-head");
  const titles=node("div");
  titles.append(node("span","sg-section-eyebrow","SIRADAKİ KİLOMETRE TAŞLARI"),
    node("h3","","Bir sonraki rozetlerin"),
    node("p","","Kazanılmaya en yakın, koşulları görünen başarımların."));
  const all=node("button","sg-text-link","Koleksiyonu aç →");
  all.type="button";all.addEventListener("click",()=>chooseCareerTab("badges"));
  head.append(titles,all);panel.append(head);
  if(!model.near.length){
    panel.append(node("p","sg-empty",
      "Şu an ilerleyebileceğin açık rozet yok. Kariyer sekmesindeki kayıtlarını takip et."));
    return panel;
  }
  const grid=node("div","sg-milestone-grid");
  for(const badge of model.near){
    const item=node("button","sg-milestone");
    item.type="button";item.dataset.rarity=rarityKey(badge.rarity);
    const icon=node("span","sg-milestone-icon",badge.icon);
    const body=node("span","sg-milestone-body");
    body.append(node("strong","",badge.title),
      node("small","",badge.description),
      node("span","sg-milestone-info",fmt(badge.progress)+" / "+fmt(badge.goal)+
        " · "+badgeProgressPercent(badge)+"% tamamlandı"));
    body.append(bar(badgeProgressPercent(badge),"sg-milestone-progress"));
    const xp=node("b","sg-milestone-xp","+"+fmt(badge.xp)+" XP");
    item.append(icon,body,xp);
    item.addEventListener("click",()=>openBadgeDetail(badge,item));
    grid.append(item);
  }
  panel.append(grid);return panel;
}
function renderRecentBadges(snapshot:StudyGamificationSnapshot):HTMLElement{
  const recent=achievementOverview(snapshot).recent,panel=node("section","sg-recent-badges");
  const head=node("div","sg-section-head");
  const label=node("div");
  label.append(node("span","sg-section-eyebrow","KAZANILAN ÖDÜLLER"),
    node("h3","","Son başarımların"));
  head.append(label);panel.append(head);
  if(!recent.length){
    panel.append(node("p","sg-empty","Henüz rozet kazanmadın. İlk odak, soru veya günlük hedefini tamamlayarak başlayabilirsin."));
    return panel;
  }
  const list=node("div","sg-recent-list");
  for(const badge of recent){
    const item=node("button","sg-recent-item");
    item.type="button";item.dataset.rarity=rarityKey(badge.rarity);
    const meta=node("span","sg-recent-meta");
    meta.append(node("strong","",badge.title),
      node("small","",badge.rarity+" · "+(badge.unlockedAt?new Date(badge.unlockedAt).toLocaleDateString("tr-TR"):"Tarih yok")));
    item.append(node("span","sg-recent-icon",badge.icon),meta,
      node("b","","+"+fmt(badge.xp)+" XP"));
    item.addEventListener("click",()=>openBadgeDetail(badge,item));list.append(item);
  }
  panel.append(list);return panel;
}
function renderRarityProgress(snapshot:StudyGamificationSnapshot):HTMLElement{
  const data=achievementOverview(snapshot),panel=node("section","sg-rarity-progress");
  const head=node("div","sg-section-head");
  const copy=node("div");
  copy.append(node("span","sg-section-eyebrow","KOLEKSİYON DURUMU"),
    node("h3","","Nadirlik kademeleri"));
  head.append(copy,node("strong","sg-rarity-count",data.collectionPercent+"% tamamlandı"));
  panel.append(head);
  const list=node("div","sg-rarity-list");
  for(const tier of data.tiers){
    const row=node("div","sg-rarity-row");
    row.dataset.rarity=rarityKey(tier.rarity);
    const details=node("div","sg-rarity-row-head");
    details.append(node("strong","",tier.rarity),
      node("span","",tier.unlocked+" / "+tier.total+" · "+
        (tier.total?Math.round(tier.unlocked/tier.total*100):0)+"%"));
    row.append(details,bar(tier.total?tier.unlocked/tier.total*100:0,"sg-rarity-track"));list.append(row);
  }
  panel.append(list);return panel;
}
function filteredBadges(snapshot:StudyGamificationSnapshot):StudyBadge[]{
  const q=badgeQuery.trim().toLocaleLowerCase("tr-TR");
  return snapshot.badges.filter(b=>{
    if(!(badgeFilter==="all"||(badgeFilter==="earned"&&b.unlocked)||
      (badgeFilter==="locked"&&!b.unlocked)||b.rarity===badgeFilter))return false;
    if(!q)return true;
    const secret=Boolean(b.hidden&&!b.unlocked);
    const safeText=secret?"Gizli Başarım Gizli rozet kilitli":
      b.title+" "+b.description+" "+b.rarity+" "+(b.unlocked?"Kazanıldı":"Kilitli");
    return safeText.toLocaleLowerCase("tr-TR").includes(q);
  }).sort((a,b)=>{
    if(badgeSort==="name")return (a.hidden&&!a.unlocked?"Gizli Başarım":a.title)
      .localeCompare(b.hidden&&!b.unlocked?"Gizli Başarım":b.title,"tr");
    if(badgeSort==="reward")return b.xp-a.xp||
      Number(b.unlocked)-Number(a.unlocked)||a.id.localeCompare(b.id);
    if(badgeSort==="recent")return Number(b.unlocked)-Number(a.unlocked)||
      (b.unlockedAt??0)-(a.unlockedAt??0)||a.id.localeCompare(b.id);
    if(a.unlocked!==b.unlocked)return a.unlocked?-1:1;
    if(a.unlocked&&b.unlocked)return (b.unlockedAt??0)-(a.unlockedAt??0);
    return Number(Boolean(a.hidden))-Number(Boolean(b.hidden))||
      badgeProgressPercent(b)-badgeProgressPercent(a)||a.id.localeCompare(b.id);
  });
}
function updateBadgeCollection(snapshot:StudyGamificationSnapshot,
  grid:HTMLElement,count:HTMLElement):void{
  const items=filteredBadges(snapshot);
  grid.replaceChildren(...items.map(badgeCard));
  if(!items.length)grid.append(node("p","sg-empty",
    "Bu arama ve filtreyle eşleşen rozet bulunamadı."));
  count.textContent=items.length+" rozet gösteriliyor";
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
  const root=document.getElementById(ROOT_ID);
  if(root){
    root.dataset.activeTab=next;
    root.querySelector(".sg-tab-content")?.setAttribute("hidden","");
  }
  // Sibling task/insight panels must be hidden before the next animation frame.
  syncTabPanels();
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
  // External sync updates can arrive while the student is typing a badge query.
  const oldSearch=root.querySelector<HTMLInputElement>(".sg-collection-input");
  const restoreSearchFocus=Boolean(oldSearch&&document.activeElement===oldSearch);
  const searchCaret=restoreSearchFocus?oldSearch?.selectionStart:null;
  root.replaceChildren();
  root.classList.add("sg-career-center");
  root.dataset.activeTab=activeTab;
  const hero=node("header","sg-career-hero");
  const leading=node("div","sg-career-hero-text");
  leading.append(node("span","sg-eyebrow","YKS KARİYER MERKEZİ"),
    node("h2","","Başarımlar"),
    node("p","","Rozet yolculuğun, haftalık çalışma ritmin ve gerçek XP kazanımların tek yerde."));
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
    ["🏁",snapshot.longestStreak+" gün","En uzun seri"],
    ["🏅",snapshot.earnedBadges+" / "+snapshot.badges.length,"Rozetler"],
    ["🛡️",snapshot.shields+" / "+snapshot.shieldLimit,"Kalkan"],
    ["📆",snapshot.activeDays+" gün","Başarılı gün"],
    ["⏱️",Math.floor(snapshot.totalMinutes/60)+" sa "+snapshot.totalMinutes%60+" dk","Toplam odak"]
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
      const track=bar(snapshot.xp>0?value/snapshot.xp*100:0,"sg-xp-source-track");
      track.setAttribute("role","progressbar");track.setAttribute("aria-label",label+" XP payı");
      track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax","100");
      track.setAttribute("aria-valuenow",String(snapshot.xp>0?Math.round(value/snapshot.xp*100):0));
      row.append(track);
      explanation.append(row);
    }
    const info=node("div","sg-career-tip",
      "Rozetler XP kazandırır. Kalkan ise 7 gerçek başarılı günün sonunda kazanılır.");
    area.append(renderWeekReview(snapshot),current,explanation,renderNextBadges(snapshot),
      renderRecentBadges(snapshot),protectionPanel(snapshot),info);
  }else if(activeTab==="badges"){
    const collection=node("div","sg-collection-head");
    collection.append(node("h3","","Rozet koleksiyonu"),
      node("p","",snapshot.earnedBadges+" kazanıldı · "+snapshot.badges.length+" toplam rozet"));
    area.append(renderRarityProgress(snapshot));
    const filters=node("div","sg-medal-filters");
    filters.setAttribute("aria-label","Rozetleri filtrele");
    filterNames.forEach(item=>{
      const count=item.key==="all"?snapshot.badges.length:
        item.key==="earned"?snapshot.earnedBadges:
        item.key==="locked"?snapshot.badges.length-snapshot.earnedBadges:
        snapshot.badges.filter(b=>b.rarity===item.key).length;
      const filter=node("button","sg-filter",item.label+" · "+count);
      filter.type="button";
      filter.setAttribute("aria-pressed",String(badgeFilter===item.key));
      filter.addEventListener("click",()=>{badgeFilter=item.key;schedule();});
      filters.append(filter);
    });
    const controls=node("div","sg-collection-controls");
    const searchLabel=node("label","sg-collection-search");
    const searchName=node("span","","Rozet ara");
    const search=node("input","sg-collection-input") as HTMLInputElement;
    search.type="search";search.placeholder="Rozet adı veya hedefi…";
    search.autocomplete="off";search.maxLength=90;search.value=badgeQuery;
    search.setAttribute("aria-label","Rozetlerde ara");
    searchLabel.append(searchName,search);
    const sortLabel=node("label","sg-collection-sort");
    sortLabel.append(node("span","","Sıralama"));
    const sort=node("select","sg-collection-select") as HTMLSelectElement;
    for(const [value,label] of [
      ["nearest","İlerlemeye göre"],["recent","Son kazanılan"],
      ["reward","XP ödülüne göre"],["name","Alfabetik"]
    ] as const){
      const option=node("option","",label);option.value=value;sort.append(option);
    }
    sort.value=badgeSort;sort.setAttribute("aria-label","Rozet sıralaması");
    sortLabel.append(sort);controls.append(searchLabel,sortLabel);
    const visible=node("p","sg-collection-count");visible.setAttribute("role","status");
    visible.setAttribute("aria-live","polite");
    const collectionGrid=node("div","sg-medal-grid sg-medal-collection");
    const update=()=>updateBadgeCollection(snapshot,collectionGrid,visible);
    // Only the result grid is updated while typing: preserve input focus and caret.
    search.addEventListener("input",()=>{badgeQuery=search.value;update();});
    sort.addEventListener("change",()=>{badgeSort=sort.value as BadgeSort;update();});
    update();
    const note=node("p","sg-hint",
      "Rozete dokun: koşul, gerçek ilerleme, kazanım tarihi ve XP ödülünü gör. Gizli başarımlar sürpriz kalır.");
    area.append(collection,controls,filters,visible,collectionGrid,note);
  }else if(activeTab==="tasks"){
    area.append(node("h3","","Görev Merkezi"),
      node("p","sg-hint","Her görevin hedefi, anlık ilerlemesi, zorluk seviyesi ve tek seferlik XP ödülü aşağıda. Odak süresi ve çözdüğün sorular kayıtlarından otomatik hesaplanır."));
  }else{
    area.append(node("h3","","Kariyer geçmişin"));
    const grid=node("div","sg-career-records");
    for(const [title,value] of [
      ["Toplam çalışma",Math.floor(snapshot.totalMinutes/60)+" sa "+snapshot.totalMinutes%60+" dk"],
      ["Çözülen soru",fmt(snapshot.totalQuestions)],
      ["Kaydedilen deneme",fmt(snapshot.totalExams)],
      ["En uzun seri",snapshot.longestStreak+" gün"]
    ]){const card=node("div","sg-career-record");card.append(node("span","",title),node("strong","",value));grid.append(card);}
    area.append(grid,renderWeekReview(snapshot),node("p","sg-hint",
      "Aşağıda çalışma takvimi, kişisel rekorlar ve ders ustalığın kayıtlarından hesaplanır."));
  }
  root.append(area);
  syncTabPanels();
  if(restoreSearchFocus){
    const nextSearch=root.querySelector<HTMLInputElement>(".sg-collection-input");
    if(nextSearch){
      nextSearch.focus({preventScroll:true});
      if(searchCaret!==null&&searchCaret!==undefined)
        nextSearch.setSelectionRange(searchCaret,searchCaret);
    }
  }
}

function refresh():void{
  const root=mount(),state=readState();
  if(!root||!state)return;
  let snapshot=calculateStudyGamification(state);
  const profile=state.gamification;
  const profileKey=profile?.activatedAt?String(profile.activatedAt):"inactive";
  if(previousProfileKey!==profileKey){previousProfileKey=profileKey;previousLevel=0;activeTab="general";
    badgeFilter="all";badgeSort="nearest";badgeQuery="";editing=false;}
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
  renderSettingsOverview(snapshot);
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
