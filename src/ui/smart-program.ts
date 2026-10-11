import "./smart-program.css";

/** Smart Program is a read-only view of the existing planner and focus records. */
export type SmartTask={id:string;day:number;text:string;subject:string;done:boolean};
export type SmartProgramInput={
  week:string;
  today:string;
  tasks:SmartTask[];
  focusMinutes?:unknown;
};
export type SmartDay={
  date:string;label:string;total:number;done:number;plannedMinutes:number;actualMinutes:number;
};
export type SmartSubject={name:string;total:number;done:number};
export type SmartOverview={
  total:number;done:number;rate:number;unfinished:number;overdue:number;
  plannedMinutes:number;actualMinutes:number;activeDays:number;
  days:SmartDay[];subjects:SmartSubject[];backlog:SmartTask[];nextTasks:SmartTask[];
  suggestedDay:number;
};
const DAYS=["Pzt","Sal","Çar","Per","Cum","Cts","Paz"];
function asRecord(raw:unknown):Record<string,unknown>{
  return raw!==null&&typeof raw==="object"&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
}
function keyAt(week:string,index:number):string{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(week))return "";
  const date=new Date(week+"T12:00:00Z");
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==week)return "";
  date.setUTCDate(date.getUTCDate()+index);
  return date.toISOString().slice(0,10);
}
/** Only explicitly specified task durations count as planned minutes. */
export function smartTaskMinutes(text:string):number{
  const clean=String(text||"").replace(/https?:\/\/\S+/g,"");
  const hour=clean.match(/(?:^|[\s·])(\d{1,2})\s*(?:sa|saat)(?:\s*(\d{1,2})\s*dk)?(?:\b|$)/i);
  if(hour){const total=Number(hour[1])*60+Number(hour[2]||0);return total>0&&total<=1440?total:0;}
  const minute=clean.match(/(?:^|[\s·])(\d{1,4})\s*(?:dk|dakika)(?:\b|$)/i);
  const total=minute?Number(minute[1]):0;
  return total>0&&total<=1440?total:0;
}
export function smartProgramAnalyze(input:SmartProgramInput):SmartOverview{
  const focus=asRecord(input.focusMinutes),days:SmartDay[]=DAYS.map((label,index)=>{
    const date=keyAt(input.week,index),raw=focus[date],minutes=Number(raw);
    return {date,label,total:0,done:0,plannedMinutes:0,actualMinutes:Number.isFinite(minutes)?Math.max(0,Math.min(1440,minutes)):0};
  });
  const subjects=new Map<string,SmartSubject>();
  const safeTasks=(Array.isArray(input.tasks)?input.tasks:[]).filter(task=>
    task&&Number.isInteger(task.day)&&task.day>=0&&task.day<7&&typeof task.text==="string"&&task.text.trim().length>0);
  for(const task of safeTasks){
    const day=days[task.day]!;
    day.total++;
    if(task.done)day.done++;
    day.plannedMinutes+=smartTaskMinutes(task.text);
    const name=String(task.subject||"Çalışma").trim().slice(0,70)||"Çalışma";
    let subject=subjects.get(name);
    if(!subject){subject={name,total:0,done:0};subjects.set(name,subject);}
    subject.total++;if(task.done)subject.done++;
  }
  const validToday=/^\d{4}-\d{2}-\d{2}$/.test(input.today)?input.today:"";
  const backlog=safeTasks.filter(task=>!task.done&&days[task.day]!.date!==""&&days[task.day]!.date<validToday)
    .sort((a,b)=>a.day-b.day||a.subject.localeCompare(b.subject,"tr"));
  const nextTasks=safeTasks.filter(task=>!task.done&&!backlog.includes(task))
    .sort((a,b)=>a.day-b.day||a.subject.localeCompare(b.subject,"tr"));
  const total=safeTasks.length,done=safeTasks.filter(task=>task.done).length;
  const todayIndex=days.findIndex(day=>day.date===validToday);
  const suggestedDay=todayIndex>=0?Math.min(6,todayIndex+1):0;
  return {
    total,done,rate:total?Math.round(done/total*100):0,unfinished:total-done,overdue:backlog.length,
    plannedMinutes:days.reduce((sum,day)=>sum+day.plannedMinutes,0),
    actualMinutes:days.reduce((sum,day)=>sum+day.actualMinutes,0),
    activeDays:days.filter(day=>day.actualMinutes>0).length,
    days,subjects:[...subjects.values()].sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name,"tr")),
    backlog,nextTasks,suggestedDay
  };
}
function el<K extends keyof HTMLElementTagNameMap>(tag:K,cls="",value=""):HTMLElementTagNameMap[K]{
  const item=document.createElement(tag);item.className=cls;if(value)item.textContent=value;return item;
}
function btn(label:string,fn:()=>void,cls=""):HTMLButtonElement{
  const item=el("button",cls,label);item.type="button";item.addEventListener("click",fn);return item;
}
function card(title:string,description:string,cls=""):HTMLElement{
  const item=el("section","sp-card "+cls),head=el("div","sp-card-head");
  head.append(el("h3","",title),el("p","",description));item.append(head);return item;
}
function formatMinutes(amount:number):string{
  if(amount<=0)return "0 dk";
  const hours=Math.floor(amount/60),minutes=Math.round(amount%60);
  return hours?(hours+" sa"+(minutes?" "+minutes+" dk":"")):(minutes+" dk");
}
/** Render the concept into the existing Programım view without changing planner data. */
export function renderSmartProgram(
  host:HTMLElement,input:SmartProgramInput,
  actions:{onDraft:(text:string,day:number)=>void;onWeekly:()=>void;onAdd:()=>void}
):void{
  const data=smartProgramAnalyze(input);
  const container=el("div","sp-dashboard");
  const hero=el("section","sp-hero"),heroText=el("div","sp-hero-text");
  heroText.append(el("span","sp-kicker","AKILLI PROGRAM · 4.0"),el("h2","","Çalışmalarını daha akıllı planla"),
    el("p","","Eksiklerini gör, çalışma yükünü dengele ve haftanı gerçek kayıtlarınla takip et."));
  const heroRight=el("div","sp-hero-rate"),heroValue=el("strong","",String(data.rate)+"%");
  heroRight.append(heroValue,el("span","","Haftalık görev ilerlemesi"));
  const heroBar=el("div","sp-progress"),filled=el("i");filled.style.width=data.rate+"%";heroBar.append(filled);heroRight.append(heroBar);
  hero.append(heroText,heroRight);container.append(hero);
  const stats=el("div","sp-stats");
  for(const [icon,value,label] of [
    ["▣",String(data.total),"Toplam görev"],
    ["✓",String(data.done),"Tamamlanan"],
    ["↗",String(data.unfinished),"Kalan görev"],
    ["◷",formatMinutes(data.actualMinutes),"Kaydedilen odak"]
  ]){
    const item=el("div","sp-stat");
    item.append(el("span","sp-stat-icon",icon),el("strong","",value),el("small","",label));stats.append(item);
  }
  container.append(stats);
  const top=el("div","sp-grid");
  const backlog=card("Eksik Kapatma","Görüntülediğin haftada geçmiş günlerden tamamlanmayan çalışmalar.","sp-backlog");
  const backlogBody=el("div","sp-stack");
  if(!data.backlog.length){
    backlogBody.append(el("p","sp-empty","Geçmiş günlerden bekleyen çalışma görünmüyor. Harika!"));
  }else for(const task of data.backlog.slice(0,5)){
    const item=el("div","sp-task-row"),copy=el("div","sp-task-copy");
    copy.append(el("strong","",task.subject),el("small","",task.text));
    item.append(copy,btn("Taslağa al",()=>actions.onDraft(task.text,data.suggestedDay),"sp-small-button"));backlogBody.append(item);
  }
  if(data.backlog.length>5)backlogBody.append(el("small","sp-muted","+"+(data.backlog.length-5)+" bekleyen çalışma daha var."));
  backlog.append(backlogBody);
  const next=card("Önerilen Adımlar","Programına göre oluşturulmuş, kontrolün sende olduğu öneriler.","sp-recommend");
  const nextBody=el("div","sp-stack"),suggested=data.backlog[0]||data.nextTasks[0];
  if(suggested){
    const priority=el("div","sp-tip");
    priority.append(el("span","sp-tip-icon","✦"),el("div","","Öncelik: "+suggested.subject+" çalışmasını planında gözden geçir."));
    nextBody.append(priority);
    const taskRow=el("div","sp-task-row"),copy=el("div","sp-task-copy");
    copy.append(el("strong","",suggested.subject),el("small","",suggested.text));
    taskRow.append(copy,btn("Planla",()=>actions.onDraft(suggested.text,data.suggestedDay),"sp-small-button"));
    nextBody.append(taskRow);
    if(data.overdue)nextBody.append(el("p","sp-muted",data.overdue+" geciken görev var. Bunları bitirmek için yeni bir gün seçebilirsin."));
  }else{
    nextBody.append(el("p","sp-empty",data.total?"Bu haftanın bütün görevleri tamamlanmış.":"Bu hafta henüz çalışma yok. Önce bir hedef oluştur."));
    nextBody.append(btn("Çalışma ekle",actions.onAdd,"sp-primary"));
  }
  next.append(nextBody);top.append(backlog,next);container.append(top);
  const bottom=el("div","sp-grid");
  const timing=card("Planlanan / Gerçekleşen","Planlanan: göreve yazılan süre · Gerçekleşen: odak kayıtları.");
  const numbers=el("div","sp-time-head");
  const planned=el("div");planned.append(el("small","","Planlanan"),el("strong","",formatMinutes(data.plannedMinutes)));
  const actual=el("div");actual.append(el("small","","Kaydedilen odak"),el("strong","",formatMinutes(data.actualMinutes)));
  numbers.append(planned,actual);timing.append(numbers);
  const graph=el("div","sp-chart"),maximum=Math.max(1,...data.days.flatMap(day=>[day.plannedMinutes,day.actualMinutes]));
  for(const day of data.days){
    const column=el("div","sp-chart-column"),bars=el("div","sp-bars");
    const a=el("i","sp-planned"),b=el("i","sp-actual");
    a.style.height=(day.plannedMinutes/maximum*100)+"%";b.style.height=(day.actualMinutes/maximum*100)+"%";
    bars.append(a,b);column.append(bars,el("span","",day.label));
    column.title=day.label+": "+formatMinutes(day.plannedMinutes)+" plan · "+formatMinutes(day.actualMinutes)+" odak";
    graph.append(column);
  }
  timing.append(graph);
  const legend=el("div","sp-legend"),legendPlan=el("span","","Planlanan"),legendActual=el("span","","Odak");
  legendPlan.className="sp-legend-plan";legendActual.className="sp-legend-actual";legend.append(legendPlan,legendActual);
  timing.append(legend,el("p","sp-muted","Süre hedefi girilmeyen çalışmalar planlanan dakikaya katılmaz. Odak süreleri görev tamamlama durumundan bağımsızdır."));
  const distribution=card("Ders Dengesi","Bu hafta programındaki çalışmaların derslere dağılımı.");
  const subjectList=el("div","sp-subject-list"),largest=Math.max(1,...data.subjects.map(item=>item.total));
  if(!data.subjects.length)subjectList.append(el("p","sp-empty","Ders eklediğinde dağılımı burada göreceksin."));
  for(const subject of data.subjects.slice(0,7)){
    const line=el("div","sp-subject"),head=el("div","sp-subject-head");
    head.append(el("b","",subject.name),el("span","",subject.done+"/"+subject.total+" tamamlandı"));
    const bar=el("div","sp-subject-bar"),fill=el("i");fill.style.width=(subject.total/largest*100)+"%";bar.append(fill);
    line.append(head,bar);subjectList.append(line);
  }
  distribution.append(subjectList);bottom.append(timing,distribution);container.append(bottom);
  const footer=card("Haftalık Değerlendirme","Bu hafta için anlık özet.");
  const footerGrid=el("div","sp-evaluation");
  const evaluation=[
    [String(data.rate)+"%","Görev tamamlama"],
    [String(data.activeDays)+"/7","Odak kaydı olan gün"],
    [String(data.overdue),"Geçmiş günden kalan"],
    [formatMinutes(data.actualMinutes),"Haftalık odak"]
  ];
  for(const [value,label] of evaluation){
    const item=el("div");item.append(el("strong","",value),el("span","",label));footerGrid.append(item);
  }
  footer.append(footerGrid,btn("Haftalık takvimi aç →",actions.onWeekly,"sp-week-button"));container.append(footer);
  host.replaceChildren(container);
}
