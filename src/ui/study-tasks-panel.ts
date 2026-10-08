import {ensureCurrentTasks,grantCompletedTasks,taskPanel,
  scheduleDifficulty,rerollDailyTask} from "../domain/study-tasks.ts";
import type {StudyGamificationState,GamificationProfile} from "../domain/study-gamification.ts";
import type {StudyTaskView,TaskDifficulty} from "../domain/study-tasks.ts";
import "./study-tasks-panel.css";

type Port={readState:()=>StudyGamificationState|null;saveState:()=>boolean;toast?:(message:string)=>void};
let installed=false,queued=false;
const element=<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text=""):HTMLElementTagNameMap[K]=>{
  const el=document.createElement(tag);if(className)el.className=className;
  if(text)el.textContent=text;return el;
};
function mount():HTMLElement|null{
  const current=document.getElementById("studyTasksPanel");
  const parent=document.getElementById("studyGamification");
  const settingsHost=document.getElementById("ymsAchievementsContent");
  if(current){
    if(settingsHost&&parent?.parentElement===settingsHost&&current.parentElement!==settingsHost)
      parent.insertAdjacentElement("afterend",current);
    return current;
  }
  if(!parent)return null;
  const root=element("section","st-panel");root.id="studyTasksPanel";
  root.setAttribute("aria-label","Günlük görevler ve haftalık meydan okumalar");
  parent.insertAdjacentElement("afterend",root);
  return root;
}
function bar(value:number):HTMLElement{
  const outer=element("div","st-bar"),fill=element("span","st-bar-fill");
  fill.style.width=Math.min(100,Math.max(0,value))+"%";outer.appendChild(fill);return outer;
}
function mutate(port:Port,action:(p:GamificationProfile,s:StudyGamificationState)=>GamificationProfile):boolean{
  const state=port.readState();if(!state?.gamification)return false;
  const before=state.gamification;
  try{
    state.gamification=action(before,state);
    if(state.gamification===before)return true;
    if(!port.saveState()){state.gamification=before;port.toast?.("Görev tercihi kaydedilemedi.");return false;}
    return true;
  }catch(error){
    state.gamification=before;
    port.toast?.(error instanceof Error?error.message:"Görev işlemi yapılamadı.");
    return false;
  }
}
function taskCard(view:StudyTaskView,port:Port,onChange:()=>void,reroll:boolean):HTMLElement{
  const card=element("article","st-task"+(view.claimed?" st-claimed":""));
  const top=element("div","st-task-top"),details=element("div","st-task-copy");
  const title=element("strong","",view.task.title);
  const state=element("span","st-task-status",view.claimed?"✓ Tamamlandı":view.complete?"Ödül kaydı bekleniyor":"İlerliyor");
  details.append(title,state);
  const reward=element("span","st-reward","+"+view.task.xp+" XP");
  top.append(details,reward);
  card.append(top,bar(view.progress));
  const foot=element("div","st-task-foot");
  foot.append(element("small","",view.label),element("small","",view.progress+"%"));
  card.appendChild(foot);
  if(reroll&&!view.claimed&&view.progress===0){
    const button=element("button","st-reroll","Görevi değiştir");
    button.type="button";button.addEventListener("click",()=>{
      if(mutate(port,(profile,state)=>rerollDailyTask(state,profile,new Date(),view.task.id))){
        port.toast?.("🎯 Günlük görev değiştirildi.");onChange();
      }
    });
    card.appendChild(button);
  }
  return card;
}
function render(port:Port,root:HTMLElement,snapshot:ReturnType<typeof taskPanel>,refresh:()=>void):void{
  root.replaceChildren();
  const header=element("div","st-header");
  const names=element("div","st-headings");
  names.append(element("span","st-eyebrow","YKS KARİYERİ"),
    element("h2","","Görev Merkezi"));
  header.appendChild(names);root.appendChild(header);
  const settings=element("div","st-settings");
  const caption=element("label","st-settings-label","Görev zorluğu (yarından itibaren)");
  const select=element("select","st-difficulty");
  for(const [value,label] of [["easy","Kolay"],["normal","Normal"],["hard","Zor"]] as const){
    const option=element("option","",label);option.value=value;select.appendChild(option);
  }
  select.value=snapshot.nextDifficulty;
  select.setAttribute("aria-label","Yarından itibaren görev zorluğu");
  select.addEventListener("change",()=>{
    if(mutate(port,profile=>scheduleDifficulty(profile,new Date(),select.value as TaskDifficulty))){
      port.toast?.("Görev zorluğu yarından itibaren güncellendi.");refresh();
    }else select.value=snapshot.nextDifficulty;
  });
  caption.appendChild(select);settings.appendChild(caption);root.appendChild(settings);
  const daily=element("section","st-group");
  const dhead=element("div","st-group-head");
  dhead.append(element("strong","","🎯 Günlük Görevler"),
    element("span","",snapshot.dailyEarned+" XP kazanıldı"));
  daily.appendChild(dhead);
  if(snapshot.restToday){
    daily.appendChild(element("p","st-empty","🌿 Bugün planlı dinlenme günü. Günlük görev zorunluluğun yok."));
  }else if(!snapshot.daily.length){
    daily.appendChild(element("p","st-empty","Günlük görevler hazırlanıyor."));
  }else{
    const cards=element("div","st-list");
    snapshot.daily.forEach(view=>cards.appendChild(taskCard(view,port,refresh,snapshot.canReroll)));
    daily.appendChild(cards);
  }
  const weekly=element("section","st-group");
  const whead=element("div","st-group-head");
  whead.append(element("strong","","⚔️ Haftalık Meydan Okumalar"),
    element("span","",snapshot.weeklyEarned+" XP kazanıldı"));
  weekly.appendChild(whead);
  if(!snapshot.weekly.length)weekly.appendChild(element("p","st-empty","Haftalık hedefler hazırlanıyor."));
  else{
    const cards=element("div","st-list");
    snapshot.weekly.forEach(view=>cards.appendChild(taskCard(view,port,refresh,false)));
    weekly.appendChild(cards);
  }
  root.append(daily,weekly);
  root.appendChild(element("p","st-note",
    "Görev ilerlemesi kayıtlı odak süresi ve soru sayısından hesaplanır. Seri için iki kişisel hedef de gereklidir."));
}
export function installStudyTaskPanel(port:Port):void{
  if(installed)return;
  installed=true;
  const refresh=()=>{
    if(queued)return;
    queued=true;
    window.requestAnimationFrame(()=>{
      queued=false;
      const root=mount(),state=port.readState();
      if(!root||!state?.gamification)return;
      const now=new Date();
      const previous=state.gamification;
      let next=ensureCurrentTasks(previous,now,state);
      const reward=grantCompletedTasks({...state,gamification:next},next,now);
      next=reward.profile;
      if(next!==previous){
        state.gamification=next;
        if(!port.saveState()){
          state.gamification=previous;
        }else if(reward.granted.length){
          port.toast?.("🎯 "+reward.granted.length+" görev tamamlandı! +"+
            reward.granted.reduce((sum,t)=>sum+t.xp,0)+" XP");
        }
      }
      render(port,root,taskPanel(state,now),refresh);
    });
  };
  for(const name of ["yks:data-changed","yks:data-primary-ready","yks:auth-state","yks:navigation","yks:achievements-settings-ready"])
    window.addEventListener(name,refresh);
  window.addEventListener("pageshow",refresh);
  window.addEventListener("focus",refresh);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
  window.setInterval(()=>{if(!document.hidden)refresh();},60_000);
  refresh();
}
