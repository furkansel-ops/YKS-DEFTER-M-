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
let expanded=false,editing=false,renderQueued=false;
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
    if(settingsHost&&existing.parentElement!==settingsHost)settingsHost.appendChild(existing);
    return existing;
  }
  const fallback=document.querySelector("#home .home-overview");
  if(!settingsHost&&!fallback)return null;
  const root=node("section","sg-panel");
  root.id=ROOT_ID;root.setAttribute("aria-label","Günlük seri, XP ve başarımlar");
  if(settingsHost)settingsHost.appendChild(root);
  else fallback?.insertAdjacentElement("afterend",root);
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

/** Keep Today focused: only a tiny progress summary, full tools live in Settings. */
function renderTodayTeaser(snapshot:StudyGamificationSnapshot):void{
  const home=document.getElementById("home"),hub=document.getElementById("todayHub");
  if(!home||!hub)return;
  let link=document.getElementById("todayAchievementShortcut") as HTMLButtonElement|null;
  if(!link){
    link=node("button","sg-today-shortcut") as HTMLButtonElement;
    link.id="todayAchievementShortcut";link.type="button";
    link.setAttribute("aria-label","Ayarlar içindeki Başarımlar bölümünü aç");
    const left=node("span","sg-today-shortcut-title","🏆 Başarımlar");
    const right=node("span","sg-today-shortcut-metrics");
    right.dataset.sgQuickMetrics="true";
    const arrow=node("span","sg-today-shortcut-arrow","›");
    link.append(left,right,arrow);link.addEventListener("click",openAchievements);
    hub.insertAdjacentElement("afterend",link);
  }
  const summary=link.querySelector<HTMLElement>("[data-sg-quick-metrics]");
  const text=snapshot.activated?
    `🔥 ${snapshot.currentStreak} gün   ·   ⚡ ${snapshot.xp} XP   ·   🏅 ${snapshot.earnedBadges}/${snapshot.badges.length}`:
    "Serini ve rozetlerini başlat";
  if(summary&&summary.textContent!==text)summary.textContent=text;
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

function badgeCard(badge:StudyBadge):HTMLElement{
  const locked=!badge.unlocked;
  const card=node("article","sg-badge"+(locked?" is-locked":" is-unlocked"));
  const icon=node("span","sg-badge-icon",badge.unlocked?badge.icon:"🔒");
  icon.setAttribute("aria-hidden","true");
  const copy=node("div","sg-badge-copy");
  const title=node("strong","",badge.hidden&&!badge.unlocked?"Gizli Başarım":badge.title);
  const description=node("span","",badge.hidden&&!badge.unlocked?"???":badge.description);
  const status=node("small","",
    badge.unlocked?"Kazanıldı · +"+badge.xp+" XP":
    badge.hidden?"Henüz keşfedilmedi":
    badge.pending?"Sonraki aşamada aktif":
      Math.round(badge.progress/badge.goal*100)+"% · "+badge.rarity);
  add(copy,title,description,status);add(card,icon,copy);
  if(locked&&!badge.pending&&!badge.hidden)card.appendChild(bar(badge.progress/badge.goal*100,"sg-badge-progress"));
  card.title=badge.rarity+" başarım";
  return card;
}
function featured(snapshot:StudyGamificationSnapshot):StudyBadge[]{
  const earned=snapshot.badges.filter(b=>b.unlocked).slice(-2).reverse();
  const candidates=snapshot.badges.filter(b=>!b.unlocked&&!b.pending&&!b.hidden)
    .sort((a,b)=>b.progress/b.goal-a.progress/a.goal);
  return [...earned,...candidates].slice(0,4);
}
function render(snapshot:StudyGamificationSnapshot,root:HTMLElement):void{
  root.replaceChildren();
  const header=node("div","sg-header"),heading=node("div");
  add(heading,node("span","sg-eyebrow","YKS KARİYERİ"),node("h2","","Seri & Başarımlar"));
  header.appendChild(heading);
  if(snapshot.activated){
    const more=node("button","sg-more",expanded?"Özet görünüm":"Tüm rozetler");
    more.type="button";more.setAttribute("aria-expanded",String(expanded));
    more.addEventListener("click",()=>{expanded=!expanded;render(snapshot,root);});
    header.appendChild(more);
  }
  root.appendChild(header);
  if(!snapshot.activated){
    root.appendChild(node("p","sg-intro","Günlük süre ve soru hedeflerini belirle, serini ve seviyeni sıfırdan oluşturmaya başla."));
    root.appendChild(goalForm(snapshot,true));return;
  }
  const top=node("div","sg-top"),streak=node("div","sg-streak"),flame=node("div","sg-flame","🔥"),streakCopy=node("div","sg-streak-copy");
  add(streakCopy,node("strong","",String(snapshot.currentStreak)),node("span","","başarılı günlük seri"),
    node("small","","En uzun seri: "+snapshot.longestStreak+" gün"));
  add(streak,flame,streakCopy);
  const levels=node("div","sg-level"),levelHead=node("div","sg-level-head");
  add(levelHead,node("strong","","Seviye "+snapshot.level+" · "+snapshot.rank),
    node("span","",snapshot.levelProgress+"/"+snapshot.levelGoal+" XP"));
  add(levels,levelHead,bar(snapshot.levelProgress/snapshot.levelGoal*100));
  const levelFoot=node("div","sg-level-foot");
  add(levelFoot,node("small","",snapshot.xp.toLocaleString("tr-TR")+" toplam XP"),
    node("small","",snapshot.earnedBadges+" / "+snapshot.badges.length+" rozet"));
  levels.appendChild(levelFoot);add(top,streak,levels);
  const daily=node("div","sg-daily");
  const dailyHead=node("div","sg-daily-text");
  add(dailyHead,node("strong","",snapshot.todayCompleted?"Bugünün iki hedefi tamam!":"Bugünkü hedeflerin"));
  const edit=node("button","sg-goal-edit","Hedefi düzenle");
  edit.type="button";
  edit.addEventListener("click",()=>{editing=!editing;render(snapshot,root);});
  add(dailyHead,edit);daily.appendChild(dailyHead);
  for(const [label,value,goal] of [["Odak",snapshot.todayMinutes,snapshot.goalMinutes],
    ["Soru",snapshot.todayQuestions,snapshot.goalQuestions]] as const){
    const row=node("div","sg-daily-text");
    add(row,node("span","",label),node("strong","",value+" / "+goal+(label==="Odak"?" dk":"")));
    daily.appendChild(row);
    daily.appendChild(bar(value/goal*100,"sg-daily-progress"));
  }
  daily.appendChild(node("p","sg-hint",snapshot.todayCompleted?
    "Tebrikler! İki hedefi de tamamladın. 🔥":
    "Seriyi artırmak için hem süre hem soru hedefi tamamlanmalı."));
  if(editing)daily.appendChild(goalForm(snapshot,false));
  const week=node("div","sg-week"),weekHead=node("div","sg-week-head");
  add(weekHead,node("span","","Bu hafta"),node("small","","İki hedef tamamlanmalı"));
  week.appendChild(weekHead);
  const weekGrid=node("div","sg-week-grid");
  snapshot.week.forEach(day=>{
    const cell=node("div","sg-day is-"+day.status+(day.today?" is-today":""));
    const labels={completed:"Tamamlandı",rest:"Dinlenme",shield:"Kalkanla korundu",missed:"Hedef kaçırıldı",pending:"Bekliyor"};
    cell.title=day.key+" · "+labels[day.status];
    add(cell,node("span","",day.label),node("b","",{
      completed:"✓",rest:"🌿",shield:"🛡️",missed:"×",pending:"·"
    }[day.status]));
    weekGrid.appendChild(cell);
  });
  week.appendChild(weekGrid);
  const badgeArea=node("div","sg-badges"),badgeHead=node("div","sg-badges-head");
  add(badgeHead,node("strong","","Başarım koleksiyonu"),node("span","",snapshot.earnedBadges+" kazanıldı"));
  badgeArea.appendChild(badgeHead);
  const badgeGrid=node("div","sg-badges-grid");
  (expanded?snapshot.badges:featured(snapshot)).forEach(badge=>badgeGrid.appendChild(badgeCard(badge)));
  badgeArea.appendChild(badgeGrid);
  add(root,top,daily,protectionPanel(snapshot),week,badgeArea);
}
function refresh():void{
  const root=mount(),state=readState();
  if(!root||!state)return;
  let snapshot=calculateStudyGamification(state);
  const profile=state.gamification;
  const profileKey=profile?.activatedAt?String(profile.activatedAt):"inactive";
  if(previousProfileKey!==profileKey){previousProfileKey=profileKey;previousLevel=0;expanded=false;editing=false;}
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
