/* Bugün v48 · tek bir salt-okunur günlük ilerleme özeti.
   Var olan program, soru ve odak sayaçlarını kullanır; yeni veri yazmaz. */
import "./today-daily-progress-v48.css";

type StudySubject={name:string;min:number};
type LastStudy={subject:string;topic:string;minutes:number}|null;
type DailySnapshot={
  date:string;focusMin:number;focusGoal:number;questions:number;questionGoal:number;
  tasks:number;done:number;subjects:StudySubject[];
  unassignedMin:number;hasMismatch:boolean;latest:LastStudy;
};
type DailyWindow=Window&{yksTodayDailyProgressSnapshot?:()=>DailySnapshot;go?:(page:string)=>void};
type Metric={value:number;goal:number|null;remaining:number|null;percent:number|null;complete:boolean};

const safe=(value:number):number=>{
  const num=Number(value);
  return Number.isFinite(num)?Math.max(0,Math.round(num)):0;
};
export function dailyProgressMetric(value:number,goal:number):Metric{
  const current=safe(value),target=safe(goal);
  return {value:current,goal:target||null,remaining:target?Math.max(0,target-current):null,
    percent:target?Math.max(0,Math.min(100,Math.round(current/target*100))):null,
    complete:target>0&&current>=target};
}
function minutesText(value:number):string{
  const n=safe(value),h=Math.floor(n/60),m=n%60;
  return h?(h+" sa"+(m?" "+m+" dk":"")):(m+" dk");
}
function create(tag:string,cls:string,value?:string):HTMLElement{
  const el=document.createElement(tag);el.className=cls;
  if(value!==undefined)el.textContent=value;
  return el;
}
export function installTodayDailyProgressV48():{installed:boolean}{
  const root=document.getElementById("todayFreshDailyProgress") as HTMLDetailsElement|null;
  const content=document.getElementById("todayDailyProgressContent");
  const headline=document.getElementById("todayDailyProgressHeadline");
  if(!root||!content||!headline)return{installed:false};
  if(root.dataset.dailyProgressReady==="true")return{installed:true};

  const metric=(label:string,current:number,target:number,format:(n:number)=>string,kind:string)=>{
    const status=dailyProgressMetric(current,target);
    const card=create("div","today-daily-metric");
    const top=create("div","today-daily-metric-top");
    top.append(create("strong","",label),create("span","",status.goal===null?"Hedef yok":status.complete?"Hedefe ulaşıldı":"Devam ediyor"));
    const value=create("p","today-daily-metric-value",
      format(status.value)+(status.goal===null?"":" / "+format(status.goal)));
    card.append(top,value);
    if(status.percent!==null){
      const meter=create("div","today-daily-meter");
      meter.setAttribute("role","progressbar");
      meter.setAttribute("aria-label",label+" hedefi");
      meter.setAttribute("aria-valuemin","0");
      meter.setAttribute("aria-valuemax","100");
      meter.setAttribute("aria-valuenow",String(status.percent));
      meter.setAttribute("aria-valuetext",format(status.value)+" / "+format(status.goal||0));
      meter.style.setProperty("--today-daily-pct",status.percent+"%");
      meter.append(create("i",""));
      card.append(meter);
    }
    card.append(create("small","today-daily-metric-note",
      status.goal===null?"Hedef belirlenmemiş":status.complete?"Günlük hedef tamamlandı":
      format(status.remaining||0)+" kaldı"));
    card.dataset.kind=kind;
    return card;
  };
  let signature="";
  const render=(s:DailySnapshot)=>{
    const task=dailyProgressMetric(s.done,s.tasks),focus=dailyProgressMetric(s.focusMin,s.focusGoal);
    const questions=dailyProgressMetric(s.questions,s.questionGoal);
    const grid=create("div","today-daily-grid");
    grid.append(metric("Program",s.done,s.tasks,n=>n+" görev","program"),
      metric("Odak",s.focusMin,s.focusGoal,minutesText,"focus"),
      metric("Soru",s.questions,s.questionGoal,n=>n+" soru","questions"));
    const footer=create("div","today-daily-details");
    const remaining:string[]=[];
    if(task.remaining!==null&&task.remaining>0)remaining.push(task.remaining+" görev");
    if(focus.remaining!==null&&focus.remaining>0)remaining.push(minutesText(focus.remaining)+" odak");
    if(questions.remaining!==null&&questions.remaining>0)remaining.push(questions.remaining+" soru");
    const allAssigned=task.goal!==null&&focus.goal!==null&&questions.goal!==null;
    const remainingText=remaining.length?"Kalan hedeflerin: "+remaining.join(" · ")
      :allAssigned?"Belirlediğin üç günlük hedef tamamlandı."
      :"Kayıtlı hedefler için kalan iş yok; belirlenmeyen hedefler hesaba katılmadı.";
    footer.append(create("p","today-daily-remaining",remainingText));
    if(Array.isArray(s.subjects)&&s.subjects.length){
      const tags=create("div","today-daily-subjects");
      tags.append(create("strong","","Çalışılan dersler"));
      for(const row of s.subjects.slice(0,3)){
        if(!safe(row.min))continue;
        tags.append(create("span","today-daily-subject",row.name+" · "+minutesText(row.min)));
      }
      if(s.unassignedMin>0)tags.append(create("span","today-daily-subject","Derse ayrılmamış · "+minutesText(s.unassignedMin)));
      footer.append(tags);
    }
    if(s.hasMismatch)footer.append(create("p","today-daily-caution",
      "Ders süreleri ile toplam odak kaydı farklı. Süreler tekrar toplanmadı."));
    if(s.latest&&safe(s.latest.minutes)>0){
      const latest=create("p","today-daily-last","Son kaydedilen çalışma: "+
        s.latest.subject+(s.latest.topic?" · "+s.latest.topic:"")+" · "+minutesText(s.latest.minutes));
      footer.append(latest);
    }
    const actions=create("div","today-daily-actions");
    const program=create("button","today-daily-open","Programı aç") as HTMLButtonElement;
    const focusButton=create("button","today-daily-open","Odak ekranı") as HTMLButtonElement;
    program.type="button";focusButton.type="button";
    program.addEventListener("click",()=>{(window as DailyWindow).go?.("program")});
    focusButton.addEventListener("click",()=>{(window as DailyWindow).go?.("pomo")});
    actions.append(program,focusButton);
    footer.append(actions);
    content.replaceChildren(grid,footer);
  };
  const sync=()=>{
    const read=(window as DailyWindow).yksTodayDailyProgressSnapshot;
    if(typeof read!=="function"){headline.textContent="Veri hazırlanıyor";return;}
    let s:DailySnapshot;
    try{s=read()}catch(error){console.error("Günlük ilerleme özeti alınamadı",error);headline.textContent="Veri alınamadı";return;}
    if(!s||typeof s.date!=="string")return;
    const title=(safe(s.tasks)?safe(s.done)+"/"+safe(s.tasks)+" görev":"Program yok")+
      " · "+minutesText(s.focusMin)+" · "+safe(s.questions)+" soru";
    if(headline.textContent!==title)headline.textContent=title;
    if(!root.open)return; // Kapalı kart DOM'u yenilenmez; eski veriler korunur.
    const next=JSON.stringify(s);
    if(next===signature)return;
    signature=next;render(s);
  };
  root.addEventListener("toggle",sync);
  window.addEventListener("yks:data-changed",sync);
  document.addEventListener("yks:navigation-after",()=>{
    if(document.getElementById("home")?.classList.contains("active"))sync();
  });
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")sync()});
  sync();
  root.dataset.dailyProgressReady="true";
  return{installed:true};
}
