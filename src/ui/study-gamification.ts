import {calculateStudyGamification} from "../domain/study-gamification";
import type {StudyBadge,StudyGamificationSnapshot,StudyGamificationState} from "../domain/study-gamification";
import "./study-gamification.css";

type LegacyWindow=Window&{
  YKSLegacyState?:{readState?:()=>StudyGamificationState|null};
  S?:StudyGamificationState;
  toast?:(message:string)=>void;
};
const runtime=window as LegacyWindow;
const ID="studyGamification";
let expanded=false;
let previousEarned:Set<string>|null=null;
let renderQueued=false;

function element<K extends keyof HTMLElementTagNameMap>(tag:K,className="",value=""):HTMLElementTagNameMap[K]{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(value)node.textContent=value;
  return node;
}
function append(parent:HTMLElement,...children:HTMLElement[]):void{children.forEach(child=>parent.appendChild(child));}
function valueState():StudyGamificationState|null{
  try{return runtime.YKSLegacyState?.readState?.()??runtime.S??null;}
  catch{return runtime.S??null;}
}
function mount():HTMLElement|null{
  const existing=document.getElementById(ID);
  if(existing)return existing;
  const home=document.getElementById("home"),anchor=home?.querySelector(".home-overview");
  if(!anchor)return null;
  const root=element("section","sg-panel");
  root.id=ID;
  root.setAttribute("aria-label","Çalışma serisi, deneyim ve başarımlar");
  anchor.insertAdjacentElement("afterend",root);
  return root;
}
function progressBar(percent:number,extraClass=""):HTMLElement{
  const rail=element("div","sg-rail "+extraClass);
  const fill=element("span","sg-rail-fill");
  fill.style.width=String(Math.max(0,Math.min(100,percent)))+"%";
  rail.appendChild(fill);
  return rail;
}
function badgeCard(badge:StudyBadge):HTMLElement{
  const item=element("article","sg-badge"+(badge.unlocked?" is-unlocked":" is-locked"));
  const icon=element("span","sg-badge-icon",badge.unlocked?badge.icon:"🔒");
  icon.setAttribute("aria-hidden","true");
  const content=element("div","sg-badge-copy");
  const title=element("strong","",badge.title);
  const description=element("span","",badge.description);
  const status=element("small","",badge.unlocked?"Kazanıldı · +"+badge.xp+" XP":Math.round(badge.progress/badge.goal*100)+"% tamamlandı");
  append(content,title,description,status);
  append(item,icon,content);
  if(!badge.unlocked)item.appendChild(progressBar(badge.progress/badge.goal*100,"sg-badge-progress"));
  return item;
}
function featuredBadges(snapshot:StudyGamificationSnapshot):StudyBadge[]{
  const earned=snapshot.badges.filter(badge=>badge.unlocked).slice(-2).reverse();
  const candidates=snapshot.badges.filter(badge=>!badge.unlocked)
    .sort((a,b)=>b.progress/b.goal-a.progress/a.goal).slice(0,4-earned.length);
  return [...earned,...candidates].slice(0,4);
}
function render(snapshot:StudyGamificationSnapshot,root:HTMLElement):void{
  root.textContent="";
  root.dataset.expanded=String(expanded);

  const header=element("div","sg-header");
  const headingBox=element("div");
  const eyebrow=element("div","sg-eyebrow","İLERLEME KULÜBÜ");
  const heading=element("h2","","Seri & Başarımlar");
  append(headingBox,eyebrow,heading);
  const more=element("button","sg-more",expanded?"Daha az göster":"Tüm rozetler");
  more.type="button";
  more.setAttribute("aria-expanded",String(expanded));
  more.addEventListener("click",()=>{expanded=!expanded;render(snapshot,root);});
  append(header,headingBox,more);

  const top=element("div","sg-top");
  const streak=element("div","sg-streak");
  const flame=element("div","sg-flame","🔥");
  flame.setAttribute("aria-hidden","true");
  const streakCopy=element("div","sg-streak-copy");
  append(streakCopy,element("strong","",String(snapshot.currentStreak)),
    element("span","","günlük çalışma serisi"),
    element("small","","En uzun seri: "+snapshot.longestStreak+" gün"));
  append(streak,flame,streakCopy);

  const levels=element("div","sg-level");
  const levelHead=element("div","sg-level-head");
  append(levelHead,element("strong","","Seviye "+snapshot.level+" · "+snapshot.rank),
    element("span","",snapshot.levelProgress+"/"+snapshot.levelGoal+" XP"));
  append(levels,levelHead,progressBar(snapshot.levelProgress/snapshot.levelGoal*100));
  const levelFoot=element("div","sg-level-foot");
  append(levelFoot,element("small","",snapshot.xp.toLocaleString("tr-TR")+" toplam XP"),
    element("small","",snapshot.earnedBadges+" / "+snapshot.badges.length+" rozet"));
  levels.appendChild(levelFoot);
  append(top,streak,levels);

  const daily=element("div","sg-daily");
  const dailyText=element("div","sg-daily-text");
  append(dailyText,element("strong","",snapshot.todayCompleted?"Bugünkü serin tamamlandı!":"Bugünkü hedefin"),
    element("span","",snapshot.todayMinutes+" / "+snapshot.dailyGoal+" dk"));
  append(daily,dailyText,progressBar(snapshot.todayMinutes/snapshot.dailyGoal*100,"sg-daily-progress"));
  if(!snapshot.todayCompleted){
    const remain=Math.max(0,snapshot.dailyGoal-snapshot.todayMinutes);
    daily.appendChild(element("p","sg-hint",remain+" dk daha odaklan, serini devam ettir."));
  }else{
    daily.appendChild(element("p","sg-hint sg-complete","Harika! Bugünün çalışma serisi koruma altında."));
  }

  const week=element("div","sg-week");
  const weekHead=element("div","sg-week-head");
  append(weekHead,element("span","","Bu hafta"),element("small","","En az 30 dk = aktif gün"));
  week.appendChild(weekHead);
  const weekGrid=element("div","sg-week-grid");
  snapshot.week.forEach(day=>{
    const cell=element("div","sg-day"+(day.completed?" is-done":"")+(day.today?" is-today":""));
    cell.title=day.key+(day.completed?" · tamamlandı":" · henüz tamamlanmadı");
    cell.setAttribute("aria-label",cell.title);
    append(cell,element("span","",day.label),element("b","",day.completed?"✓":"·"));
    weekGrid.appendChild(cell);
  });
  week.appendChild(weekGrid);

  const badgeArea=element("div","sg-badges");
  const badgeHead=element("div","sg-badges-head");
  append(badgeHead,element("strong","","Başarım koleksiyonu"),
    element("span","",snapshot.earnedBadges+" kazanıldı"));
  badgeArea.appendChild(badgeHead);
  const list=element("div","sg-badges-grid");
  (expanded?snapshot.badges:featuredBadges(snapshot)).forEach(badge=>list.appendChild(badgeCard(badge)));
  badgeArea.appendChild(list);
  append(root,header,top,daily,week,badgeArea);
}
function refresh():void{
  const root=mount();
  if(!root)return;
  const snapshot=calculateStudyGamification(valueState());
  const earned=new Set(snapshot.badges.filter(badge=>badge.unlocked).map(badge=>badge.id));
  if(previousEarned!==null){
    const newRewards=snapshot.badges.filter(badge=>earned.has(badge.id)&&!previousEarned?.has(badge.id));
    if(newRewards.length)runtime.toast?.("🏆 Yeni başarım: "+newRewards[0]?.title+
      (newRewards.length>1?" (+"+(newRewards.length-1)+" rozet)":""));
  }
  previousEarned=earned;
  render(snapshot,root);
}
function schedule():void{
  if(renderQueued)return;
  renderQueued=true;
  window.requestAnimationFrame(()=>{renderQueued=false;refresh();});
}
export function installStudyGamification():{installed:boolean}{
  if(!mount())return {installed:false};
  if(document.documentElement.dataset.studyGamificationListeners==="ready"){
    schedule();
    return {installed:true};
  }
  document.documentElement.dataset.studyGamificationListeners="ready";
  for(const name of ["yks:data-changed","yks:data-primary-ready","yks:auth-state","yks:navigation","yks:v4-bootstrap"]){
    window.addEventListener(name,schedule);
  }
  window.addEventListener("focus",schedule);
  window.addEventListener("pageshow",schedule);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)schedule();});
  window.setInterval(()=>{if(!document.hidden)schedule();},60_000);
  schedule();
  return {installed:true};
}
