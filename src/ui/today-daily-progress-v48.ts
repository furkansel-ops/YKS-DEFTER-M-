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
type DueSummaryV52={key:string;exam:string;subj:string;topic:string;gi:number;gap:number;late:number};
type GapSummaryV52={exam:string;subj:string;topic:string;state:"open"|"recheck"|"working"|"verified";wrong:number};
type InsightSnapshotV52={
  date:string;dueCount:number;overdueCount:number;due:DueSummaryV52[];
  tracker:{total:number;open:number;working:number;verified:number;rows:GapSummaryV52[]};
};
type DailyWindow=Window&{
  yksTodayDailyProgressSnapshot?:()=>DailySnapshot;
  yksTodayInsightsSnapshot?:()=>InsightSnapshotV52;
  yksTodayInsightsOpenTopic?:(exam:string,subj:string,topic:string)=>boolean;
  go?:(page:string)=>void;
};
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
  // Tekrar/eksik analizi yalnız kart açıkken okunur; hesap sahibi app.js'de kalır.
  const readInsights=(date:string):InsightSnapshotV52|null=>{
    const read=(window as DailyWindow).yksTodayInsightsSnapshot;
    if(typeof read!=="function")return null;
    try{
      const value=read();
      return value&&value.date===date&&Array.isArray(value.due)&&
        value.tracker&&Array.isArray(value.tracker.rows)?value:null;
    }catch(error){
      console.error("Günlük özet için tekrar/eksik kaydı okunamadı",error);
      return null;
    }
  };
  const renderInsights=(snapshot:InsightSnapshotV52|null):HTMLElement=>{
    const box=create("section","today-daily-insights");
    box.setAttribute("aria-label","Tekrar ve eksik durumu");
    const top=create("div","today-daily-insights-heading");
    top.append(create("strong","","Tekrarlar ve eksikler"),create("small","","Konu kayıtlarına dayalı"));
    box.append(top);
    if(!snapshot){
      box.append(create("p","today-daily-insight-note","Tekrar ve eksik verileri henüz hazır değil."));
    }else{
      const values=create("div","today-daily-insight-stats");
      const tracker=snapshot.tracker,remaining=safe(tracker.open)+safe(tracker.working);
      const lines=[
        ["Bekleyen tekrar",safe(snapshot.dueCount),
          safe(snapshot.overdueCount)?safe(snapshot.overdueCount)+" gecikmiş":"Zamanı gelenler"],
        ["Aktif eksik",remaining,safe(tracker.working)?safe(tracker.working)+" üzerinde çalışılıyor":"Kayıtlara göre"],
        ["Pekiştirilen",safe(tracker.verified),"Kayıtlı kanıtla"]
      ];
      for(const [label,count,detail] of lines){
        const stat=create("div","today-daily-insight-stat");
        stat.append(create("small","",String(label)),create("strong","",String(count)),
          create("span","",String(detail)));
        values.append(stat);
      }
      box.append(values);
      const due=snapshot.due[0];
      if(safe(snapshot.dueCount)>0&&due){
        const info=create("p","today-daily-insight-note",
          "Sıradaki tekrar: "+due.subj+" · "+due.topic+" · "+safe(due.gap)+". gün"+
          (safe(due.late)>0?" · "+safe(due.late)+" gün gecikmiş":""));
        box.append(info);
      }else if(safe(snapshot.dueCount)===0){
        box.append(create("p","today-daily-insight-note","Şu an bekleyen 3–7–21 tekrarı yok."));
      }
      const gap=tracker.rows.find(row=>row.state!=="verified");
      if(gap){
        box.append(create("p","today-daily-insight-note",
          "Takip edilen eksik: "+gap.subj+" · "+gap.topic+
          (safe(gap.wrong)>0?" · "+safe(gap.wrong)+" kayıtlı yanlış":"")));
      }
      box.append(create("p","today-daily-insight-caveat",
        "Pekiştirilen, tekrar ve güven kayıtlarıyla desteklenen ilerlemedir; kesin ustalık anlamına gelmez."));
    }
    const actions=create("div","today-daily-insight-actions");
    const open=create("button","today-daily-open","Tekrarları ve eksikleri aç") as HTMLButtonElement;
    open.type="button";
    open.addEventListener("click",()=>{
      const details=document.getElementById("todayFreshInsights") as HTMLDetailsElement|null;
      if(details){
        details.open=true;
        details.scrollIntoView?.({behavior:"smooth",block:"start"});
      }else (window as DailyWindow).go?.("topics");
    });
    actions.append(open);
    if(snapshot){
      const gap=snapshot.tracker.rows.find(row=>row.state!=="verified");
      if(gap){
        const topic=create("button","today-daily-open","Eksik konuya git") as HTMLButtonElement;
        topic.type="button";
        topic.addEventListener("click",()=>{
          const api=(window as DailyWindow).yksTodayInsightsOpenTopic;
          if(!api?.(gap.exam,gap.subj,gap.topic)) (window as DailyWindow).go?.("topics");
        });
        actions.append(topic);
      }
    }
    box.append(actions);
    return box;
  };
  const render=(s:DailySnapshot,insights:InsightSnapshotV52|null)=>{
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
    footer.append(renderInsights(insights));
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
    const insights=readInsights(s.date);
    const next=JSON.stringify([s,insights]);
    if(next===signature)return;
    signature=next;render(s,insights);
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
