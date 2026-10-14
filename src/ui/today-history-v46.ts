import "./today-history-v46.css";

/* Bugün v46: yalnız mevcut veri sahibinden okur. Açılana kadar 84 gün çizilmez.
   Yeni kronometre, yeni hedef veya ikinci kayıt sistemi oluşturulmaz. */
type HistoryDayV46={
  date:string;min:number;questions:number;tasks:number;done:number;future:boolean;
};
type HistoryMetricV46={
  id:string;label:string;value:number|null;current:number;goal:number;weight:number;
};
type HistorySnapshotV46={
  today:string;start:string;days:HistoryDayV46[];totalMin:number;activeDays:number;
  week:{
    monday:string;elapsedDays:number;trackedDays:number;minutes:number;questions:number;
    tasks:number;done:number;score:number|null;components:HistoryMetricV46[];
  };
};
type HistoryWindowV46=Window&{yksTodayHistorySnapshot?:()=>HistorySnapshotV46};

const LEVELS=[0,30,60,120,240];
function minutesLabel(raw:number):string{
  const minutes=Math.max(0,Math.round(Number(raw)||0));
  const hours=Math.floor(minutes/60),rest=minutes%60;
  return hours?(rest?hours+" sa "+rest+" dk":hours+" sa"):minutes+" dk";
}
function levelOf(min:number):number{
  const safe=Math.max(0,Number(min)||0);
  if(!safe)return 0;
  return safe<LEVELS[1]?1:safe<LEVELS[2]?2:safe<LEVELS[3]?3:4;
}
function make<K extends keyof HTMLElementTagNameMap>(tag:K,className:string,value?:string):HTMLElementTagNameMap[K]{
  const el=document.createElement(tag);
  el.className=className;
  if(value!==undefined)el.textContent=value;
  return el;
}
function put(el:Element,value:string):void{
  if(el.textContent!==value)el.textContent=value;
}
function dayLabel(key:string):string{
  const value=new Date(key+"T12:00:00");
  return Number.isNaN(value.getTime())?key:new Intl.DateTimeFormat("tr-TR",{
    weekday:"short",day:"numeric",month:"short",year:"numeric"
  }).format(value);
}

export function installTodayHistoryV46():{installed:boolean}{
  const root=document.getElementById("todayFreshActivity") as HTMLDetailsElement|null;
  const panel=document.getElementById("todayFreshHistory");
  const weeks=document.getElementById("todayFreshHistoryWeeks");
  const summary=document.getElementById("todayFreshHistorySummary");
  const selection=document.getElementById("todayFreshHistorySelection");
  const score=document.getElementById("todayFreshWeekScore");
  const breakdown=document.getElementById("todayFreshScoreBreakdown");
  const note=document.getElementById("todayFreshScoreNote");
  if(!root||!panel||!weeks||!summary||!selection||!score||!breakdown||!note)return{installed:false};
  if(panel.dataset.historyReady==="true")return{installed:true};

  let prior="",selectedDate="";
  const detail=(day:HistoryDayV46)=>{
    const parts=[minutesLabel(day.min)+" odak",day.questions+" soru"];
    if(day.tasks)parts.push(day.done+" / "+day.tasks+" görev");
    put(selection,dayLabel(day.date)+": "+parts.join(" · "));
  };
  const select=(day:HistoryDayV46,button:HTMLButtonElement)=>{
    selectedDate=day.date;
    const old=weeks.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if(old&&old!==button){old.setAttribute("aria-pressed","false");old.classList.remove("is-selected");}
    button.setAttribute("aria-pressed","true");button.classList.add("is-selected");
    detail(day);
  };
  const renderHeatmap=(snapshot:HistorySnapshotV46)=>{
    const nodes:HTMLElement[]=[];
    let previousMonth=-1;
    for(let i=0;i<12;i++){
      const seven=snapshot.days.slice(i*7,(i+1)*7);
      const first=new Date(seven[0].date+"T12:00:00");
      const currentMonth=first.getMonth();
      const column=make("div","today-history-week");
      const month=make("span","today-history-month",
        i===0||currentMonth!==previousMonth
          ?new Intl.DateTimeFormat("tr-TR",{month:"short"}).format(first)
          :"");
      previousMonth=currentMonth;
      column.append(month);
      for(const day of seven){
        const cell=make("button","today-history-day"+(day.future?" is-future":"")+
          (day.date===snapshot.today?" is-today":"")) as HTMLButtonElement;
        cell.type="button";
        cell.disabled=day.future;
        cell.dataset.level=String(levelOf(day.min));
        cell.dataset.date=day.date;
        cell.setAttribute("aria-label",day.future?dayLabel(day.date)+": gelecek gün":
          dayLabel(day.date)+": "+minutesLabel(day.min)+" odak, "+day.questions+" soru"+
          (day.tasks?", "+day.done+"/"+day.tasks+" görev":""));
        const selected=!day.future&&day.date===selectedDate;
        cell.setAttribute("aria-pressed",String(selected));
        if(selected)cell.classList.add("is-selected");
        if(!day.future)cell.addEventListener("click",()=>select(day,cell));
        column.append(cell);
      }
      nodes.push(column);
    }
    weeks.replaceChildren(...nodes);
    const chosen=snapshot.days.find(day=>!day.future&&day.date===selectedDate)
      ||snapshot.days.find(day=>day.date===snapshot.today&&!day.future);
    if(chosen){
      selectedDate=chosen.date;
      const chosenButton=Array.from(weeks.querySelectorAll<HTMLButtonElement>("button"))
        .find(button=>button.dataset.date===chosen.date);
      if(chosenButton){chosenButton.setAttribute("aria-pressed","true");chosenButton.classList.add("is-selected");}
      detail(chosen);
    }
  };
  const renderScore=(snapshot:HistorySnapshotV46)=>{
    const result=snapshot.week;
    put(score,result.score===null?"—":String(result.score));
    const cells=result.components.map(metric=>{
      const item=make("div","today-history-breakdown-item");
      const heading=make("span","",metric.label+" · "+metric.weight+"%");
      const value=make("strong","",metric.value===null?"—":"%"+metric.value);
      const help=metric.id==="program"?
        (metric.goal?metric.current+" / "+metric.goal+" görev":"Kayıtlı plan yok"):
        metric.goal?(metric.id==="focus"?
          minutesLabel(metric.current)+" / "+minutesLabel(metric.goal):
          metric.current+" / "+metric.goal+" soru"):
          "Hedef belirlenmedi";
      item.append(heading,value,make("small","",help));
      return item;
    });
    breakdown.replaceChildren(...cells);
    put(note,result.score===null
      ?"Bu hafta için puanlanabilir bir görev veya hedef kaydı yok. Skor üretilmedi."
      :"Bu bir YKS sınav puanı değil, yalnızca çalışma ilerleme göstergesidir. "+
        "Program %45, odak %35, soru %20 ağırlıklıdır; hedefi olmayan kalemler hesaba katılmaz. "+
        "Mevcut günlük hedefler "+result.trackedDays+" kayıtlı günle karşılaştırıldı.");
  };
  const sync=()=>{
    if(!root.open)return;
    const read=(window as HistoryWindowV46).yksTodayHistorySnapshot;
    if(typeof read!=="function"){
      put(summary,"Çalışma kayıtları hazırlanıyor…");
      return;
    }
    try{
      const snapshot=read();
      if(!snapshot||!Array.isArray(snapshot.days)||snapshot.days.length!==84||
        !snapshot.week||!Array.isArray(snapshot.week.components))return;
      put(summary,snapshot.activeDays+" aktif gün · "+minutesLabel(snapshot.totalMin));
      const signature=JSON.stringify([snapshot.today,snapshot.days,snapshot.week]);
      if(signature===prior&&weeks.dataset.rendered==="true")return;
      prior=signature;weeks.dataset.rendered="true";
      renderHeatmap(snapshot);renderScore(snapshot);
    }catch(error){
      console.error("Çalışma geçmişi açılamadı",error);
      put(summary,"Geçmiş görüntülenemiyor");
      put(selection,"Kayıtlar şu an okunamadı. Verilerin değiştirilmedi.");
    }
  };
  root.addEventListener("toggle",()=>{if(root.open)sync()});
  window.addEventListener("yks:data-changed",sync);
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible")sync();
  });
  document.addEventListener("yks:navigation-after",sync);
  panel.dataset.historyReady="true";
  if(root.open)sync();
  return{installed:true};
}
