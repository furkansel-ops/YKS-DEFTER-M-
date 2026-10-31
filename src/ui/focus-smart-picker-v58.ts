import "./focus-smart-picker-v58.css";
import {installFocusCompactV59} from "./focus-compact-v59";
import {installFocusRefineV70} from "./focus-refine-v70";

type PlanItem={id:string;text:string;subject:string;topic:string;done:boolean};

function old(name:string):((...args:any[])=>any)|null{
  const fn=(window as unknown as Record<string,unknown>)[name];
  return typeof fn==="function"?fn as (...args:any[])=>any:null;
}
function planItems():PlanItem[]{
  try{
    const rows=old("todayTaskOptions")?.();
    if(!Array.isArray(rows))return [];
    return rows.filter(row=>row&&typeof row.cid==="string"&&typeof row.txt==="string").slice(0,60).map(row=>{
      const meta=old("v25TaskMeta")?.(row)||{};
      return {id:row.cid,text:row.txt,subject:String(meta.subj||""),topic:String(meta.topic||""),done:!!row.done};
    });
  }catch{return [];}
}
function recentSubjects():string[]{
  try{
    const sessions=old("v29SessionList")?.(14);
    if(!Array.isArray(sessions))return [];
    const result:string[]=[],seen=new Set<string>();
    for(const item of sessions.slice().reverse()){
      const subject=String(item?.subj||"").trim();
      if(!subject||seen.has(subject))continue;
      seen.add(subject);result.push(subject);
      if(result.length>=4)break;
    }
    return result;
  }catch{return [];}
}
function liveSession():boolean{
  return ["focusCard","swCard"].some(id=>{
    const card=document.getElementById(id);
    return !!card&&(card.getAttribute("data-run")||"idle")!=="idle";
  });
}
function make<K extends keyof HTMLElementTagNameMap>(tag:K,className:string):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);element.className=className;return element;
}
function subjectAvailable(subject:string):boolean{
  return Array.from(document.querySelectorAll<HTMLElement>("#pomoSubjPick .chip"))
    .some(button=>button.textContent?.trim()===subject);
}
function selectedTask():string{
  return (document.getElementById("pomoTask") as HTMLSelectElement|null)?.value||"";
}
function notify(message:string):void{
  const status=document.getElementById("v58PlanStatus");if(status)status.textContent=message;
}

export function installFocusSmartPickerV58():{installed:boolean;validate():string[]}{
  const setup=document.querySelector<HTMLElement>(".v29-session-setup");
  const subjectStep=setup?.querySelector<HTMLElement>(".v46-subject-step");
  const search=document.getElementById("v46FocusSubjectSearch") as HTMLInputElement|null;
  const taskSelect=document.getElementById("pomoTask") as HTMLSelectElement|null;
  const topicSelect=document.getElementById("pomoTopic") as HTMLSelectElement|null;
  if(!setup||!subjectStep||!search||!taskSelect||!topicSelect)return {installed:false,validate:()=>["focus-preparation"]};
  if(document.getElementById("v58PlanPicker"))return {installed:true,validate:()=>[]};

  const section=make("section","v58-plan-picker");
  section.id="v58PlanPicker";
  section.setAttribute("aria-labelledby","v58PlanTitle");
  const head=make("div","v58-plan-head");
  const heading=make("div","v58-plan-heading");
  const kicker=make("span","v58-plan-kicker");kicker.textContent="Programım ile bağlantılı";
  const title=make("strong","");title.id="v58PlanTitle";title.textContent="Bugünkü programdan seç";
  heading.append(kicker,title);
  const hint=make("span","v58-plan-hint");hint.textContent="Ders ve konu otomatik eşleşir";
  head.append(heading,hint);
  const list=make("div","v58-plan-list");list.id="v58PlanList";
  const status=make("p","v58-plan-status");status.id="v58PlanStatus";
  status.setAttribute("role","status");status.setAttribute("aria-live","polite");
  section.append(head,list,status);
  subjectStep.insertAdjacentElement("beforebegin",section);

  const recent=make("div","v58-recent-subjects");recent.id="v58RecentSubjects";
  const subjectSlot=subjectStep.querySelector("[data-v46-subject-slot]");
  if(subjectSlot)subjectSlot.insertAdjacentElement("beforebegin",recent);
  else subjectStep.append(recent);

  function selectPlan(item:PlanItem):void{
    if(liveSession()){notify("Çalışma sürerken program görevi değiştirilmez.");return;}
    if(!item.subject||!subjectAvailable(item.subject)){
      notify("Bu görevin dersini otomatik eşleştiremedim. Aşağıdan dersi seçerek devam edebilirsin.");return;
    }
    // Existing focus setters remain the only owners of the running session.
    old("setPomoSubject")?.(item.subject);
    old("setPomoTopic")?.(item.topic);
    old("setPomoTask")?.(item.id);
    topicSelect!.value=item.topic;
    taskSelect!.value=item.id;
    topicSelect!.dispatchEvent(new Event("change",{bubbles:true}));
    taskSelect!.dispatchEvent(new Event("change",{bubbles:true}));
    notify(item.subject+(item.topic?" · "+item.topic:"")+" · programa bağlandı. Başlatabilirsin.");
    render();
  }
  let lastListKey="";
  function renderPlan(force=false):void{
    const rows=planItems();
    const pending=rows.filter(x=>!x.done).slice(0,6);
    const key=JSON.stringify({pending,selected:selectedTask()});
    if(!force&&lastListKey===key)return;
    lastListKey=key;list.replaceChildren();
    if(!pending.length){
      const empty=make("p","v58-plan-empty");
      empty.textContent=rows.length
        ?"Bugünkü görevler tamamlandı. İstersen ders seç, istersen Genel Çalışma olarak başla."
        :"Bugün için plan görevi yok. Ders seçmeden de Genel Çalışma olarak başlayabilirsin.";
      list.append(empty);return;
    }
    for(const item of pending){
      const button=make("button","v58-plan-item");
      button.type="button";button.classList.toggle("on",selectedTask()===item.id);
      button.setAttribute("aria-pressed",selectedTask()===item.id?"true":"false");
      const label=make("span","v58-plan-text");label.textContent=item.text;
      const sub=make("small","v58-plan-sub");
      sub.textContent=[item.subject||"Ders eşleştirmesi gerekli",item.topic].filter(Boolean).join(" · ");
      button.append(label,sub);
      button.addEventListener("click",()=>selectPlan(item));
      list.append(button);
    }
  }
  function renderRecent():void{
    recent.replaceChildren();
    const subjects=recentSubjects().filter(subjectAvailable);
    if(!subjects.length)return;
    const heading=make("span","v58-recent-caption");heading.textContent="Son çalıştığın dersler";
    recent.append(heading);
    for(const subject of subjects){
      const button=make("button","v58-recent-chip");
      button.type="button";button.textContent=subject;
      button.addEventListener("click",()=>{
        old("setPomoSubject")?.(subject);
        search!.value="";search!.dispatchEvent(new Event("input",{bubbles:true}));
        notify(subject+" seçildi. İstersen aşağıdan konu veya görev bağlayabilirsin.");
      });
      recent.append(button);
    }
  }
  function render():void{renderPlan();renderRecent();}
  taskSelect.addEventListener("change",()=>{
    if(liveSession()){renderPlan(true);return;}
    const item=planItems().find(row=>row.id===taskSelect.value);
    if(item?.subject&&subjectAvailable(item.subject)){
      old("setPomoSubject")?.(item.subject);
      old("setPomoTopic")?.(item.topic);
      topicSelect.value=item.topic;
      topicSelect.dispatchEvent(new Event("change",{bubbles:true}));
      notify(item.subject+" · Seçilen görevle eşleştirildi.");
    }
    renderPlan(true);
  });
  document.getElementById("pomoSubjPick")?.addEventListener("click",event=>{
    if(liveSession())return;
    if(!(event.target instanceof Element)||!event.target.closest(".chip"))return;
    const current=event.target.closest(".chip")?.textContent?.trim()||"";
    const linked=planItems().find(row=>row.id===selectedTask());
    if(linked?.subject&&linked.subject!==current){
      old("setPomoTask")?.("");
      taskSelect.value="";taskSelect.dispatchEvent(new Event("change",{bubbles:true}));
      notify("Ders değiştiği için farklı derse ait eski program görevi kaldırıldı.");
    }
  });
  window.addEventListener("yks:data-changed",()=>{
    if(!liveSession()&&document.getElementById("pomo")?.classList.contains("active"))renderPlan();
  });
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)render();});
  render();
  installFocusCompactV59(setup,section);
  installFocusRefineV70();
  return {installed:true,validate:()=>document.getElementById("v58PlanList")&&document.getElementById("v58RecentSubjects")?[]:["quick-pick-dom"]};
}
