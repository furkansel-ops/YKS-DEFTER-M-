import {getStudyInsights} from "../domain/study-insights.ts";
import {calculateStudyGamification} from "../domain/study-gamification.ts";
import type {StudyGamificationState} from "../domain/study-gamification.ts";
import type {CalendarDay,SubjectMastery} from "../domain/study-insights.ts";
import "./study-insights-panel.css";

type Bridge={readState:()=>StudyGamificationState|null;toast?:(message:string)=>void};
const make=<K extends keyof HTMLElementTagNameMap>(
  tag:K,classes="",value=""):HTMLElementTagNameMap[K]=>{
  const el=document.createElement(tag);if(classes)el.className=classes;
  if(value)el.textContent=value;return el;
};
let mounted=false,queued=false,monthOffset=0,selectedDay="";
const isActiveTab=()=>document.getElementById("studyGamification")?.dataset.activeTab==="career";
let recordBaseline:Map<string,number>|null=null,recordAccount="";
const labelDate=(day:string)=>new Date(day+"T12:00:00").toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
const dateKey=(date:Date)=>date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
const clamp=(value:number)=>Math.max(0,Math.min(100,value));
function bar(progress:number){
  const outer=make("div","si-rail"),inner=make("span","si-rail-fill");
  inner.style.width=clamp(progress)+"%";outer.appendChild(inner);return outer;
}
function rootNode():HTMLElement|null{
  const existing=document.getElementById("studyInsightsPanel");
  const anchor=document.getElementById("studyTasksPanel")??document.getElementById("studyGamification");
  const settingsHost=document.getElementById("ymsAchievementsContent");
  if(existing){
    if(settingsHost&&anchor?.parentElement===settingsHost&&existing.parentElement!==settingsHost)
      anchor.insertAdjacentElement("afterend",existing);
    existing.hidden=!isActiveTab();
    return existing;
  }
  if(!anchor)return null;
  const root=make("section","si-panel");root.id="studyInsightsPanel";
  root.setAttribute("aria-label","Çalışma takvimi, kişisel rekorlar ve ders ustalığı");
  anchor.insertAdjacentElement("afterend",root);
  root.hidden=!isActiveTab();return root;
}

function renderActivityTrend(container:HTMLElement,days:CalendarDay[],now:Date):void{
  const section=make("section","si-section si-activity");
  const head=make("div","si-head");
  const heading=make("div","si-activity-heading");
  heading.append(make("strong","","Son 14 günlük odak"),
    make("small","","Günlük kayıtlı dakika · sadece başarımlar başladıktan sonra"));
  head.appendChild(heading);section.append(head);
  const byDay=new Map(days.map(d=>[d.day,d]));
  const timeline:Array<{day:string;minutes:number;questions:number;status:CalendarDay["status"]}>=[];
  for(let offset=13;offset>=0;offset--){
    const date=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
    date.setDate(date.getDate()-offset);
    const key=dateKey(date),entry=byDay.get(key);
    timeline.push({day:key,minutes:entry?.minutes??0,questions:entry?.questions??0,
      status:entry?.status??"before-start"});
  }
  const current=timeline.slice(-7),previous=timeline.slice(0,7);
  const currentMinutes=current.reduce((sum,d)=>sum+d.minutes,0);
  const previousMinutes=previous.reduce((sum,d)=>sum+d.minutes,0);
  const complete=current.filter(d=>d.status==="completed").length;
  const kpis=make("div","si-activity-kpis");
  const weekly=make("div","si-activity-total");
  weekly.append(make("span","","Son 7 gün"),make("strong","",Math.floor(currentMinutes/60)+" sa "+currentMinutes%60+" dk"));
  const compared=make("div","si-activity-total");
  compared.append(make("span","","Önceki 7 gün"),make("strong","",Math.floor(previousMinutes/60)+" sa "+previousMinutes%60+" dk"));
  const achieved=make("div","si-activity-total");
  achieved.append(make("span","","Son 7 günde hedef"),make("strong","",complete+" gün"));
  kpis.append(weekly,compared,achieved);section.append(kpis);
  const chart=make("div","si-activity-chart");
  const peak=Math.max(1,...timeline.map(d=>d.minutes));
  for(const item of timeline){
    const day=make("div","si-activity-column");
    day.dataset.status=item.status;
    day.title=item.day+" · "+item.minutes+" dakika · "+item.questions+" soru";
    const barOuter=make("div","si-activity-column-track");
    const barInner=make("i","");
    barInner.style.height=(item.minutes?Math.max(8,item.minutes/peak*100):2)+"%";
    barOuter.append(barInner);
    const label=new Date(item.day+"T12:00:00").toLocaleDateString("tr-TR",{day:"numeric"});
    day.append(barOuter,make("span","",label));
    day.setAttribute("aria-label",item.day+" · "+item.minutes+" dakika çalışma");
    chart.append(day);
  }
  section.append(chart);
  section.append(make("p","si-activity-caption",
    "Grafik yalnız kayıtlı odak sürelerini gösterir. Sınav öncesi eski kayıtlar ve etkinleşmeden önceki çalışmalar dahil değildir."));
  container.append(section);
}

function renderMastery(container:HTMLElement,subjects:SubjectMastery[]){
  const section=make("section","si-section"),head=make("div","si-head");
  head.append(make("strong","","📚 Ders Ustalığı"),
    make("span","","Çalışma + soru + konu tekrarı"));
  section.appendChild(head);
  if(!subjects.length)section.appendChild(make("p","si-empty","İlk ders kayıtlarınla ustalık puanları burada görünecek."));
  else{
    const list=make("div","si-mastery-list");
    for(const item of subjects.slice(0,10)){
      const row=make("article","si-mastery"),top=make("div","si-mastery-top");
      const identity=make("div","si-mastery-name");
      identity.append(make("strong","",item.label),make("span","",item.tier+" Ustalık"));
      const points=make("b","",item.up+" UP");top.append(identity,points);
      row.append(top,bar(item.progress),
        make("small","",item.minutes+" dk · "+item.questions+" soru · "+item.reviews+
          " tekrar"+(item.nextTier?" · "+item.nextTier+" için "+Math.max(0,item.nextUp-item.up)+" UP":" · En yüksek kademe")));
      list.appendChild(row);
    }
    section.appendChild(list);
  }
  container.appendChild(section);
}
function renderRecords(container:HTMLElement,records:ReturnType<typeof getStudyInsights>["records"],
  exams:ReturnType<typeof getStudyInsights>["exams"]){
  const section=make("section","si-section"),head=make("div","si-head");
  head.append(make("strong","","🏆 Kişisel Rekorlar"),make("span","","Oyunlaştırma başlangıcından itibaren"));
  section.appendChild(head);
  const list=make("div","si-record-grid");
  for(const record of records){
    const card=make("article","si-record");
    card.append(make("span","",record.label),make("strong","",record.value.toLocaleString("tr-TR")+
      " "+record.unit));
    if(record.day)card.appendChild(make("small","",labelDate(record.day)));
    list.appendChild(card);
  }
  section.appendChild(list);
  const available=exams.filter(e=>e.count>0);
  if(available.length){
    const row=make("p","si-exam-line","📝 Denemeler: "+available.map(e=>
      e.type+" "+e.count+" adet · en iyi "+(e.bestNet==null?"—":e.bestNet.toLocaleString("tr-TR"))+" net").join("  |  "));
    section.appendChild(row);
  }
  container.appendChild(section);
}
function renderCalendar(container:HTMLElement,days:CalendarDay[],now:Date,refresh:()=>void){
  const section=make("section","si-section"),head=make("div","si-head");
  head.appendChild(make("strong","","🗓️ Çalışma Takvimi"));
  const navigation=make("div","si-month-nav"),back=make("button","","‹"),forward=make("button","","›");
  back.type="button";forward.type="button";back.setAttribute("aria-label","Önceki ay");
  forward.setAttribute("aria-label","Sonraki ay");
  const month=new Date(now.getFullYear(),now.getMonth()+monthOffset,1,12);
  const monthName=make("span","",month.toLocaleDateString("tr-TR",{month:"long",year:"numeric"}));
  forward.disabled=monthOffset>=0;
  const oldest=days[0]?.day??dateKey(now),monthStart=dateKey(month);
  back.disabled=monthStart<=oldest.slice(0,7)+"-01";
  back.addEventListener("click",()=>{monthOffset--;selectedDay="";refresh();});
  forward.addEventListener("click",()=>{monthOffset++;selectedDay="";refresh();});
  navigation.append(back,monthName,forward);head.appendChild(navigation);section.appendChild(head);
  const daysByKey=new Map(days.map(x=>[x.day,x]));
  const grid=make("div","si-cal-grid");
  for(const label of ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"])
    grid.appendChild(make("span","si-cal-weekday",label));
  const year=month.getFullYear(),monthIndex=month.getMonth();
  const pad=(month.getDay()+6)%7;
  for(let i=0;i<pad;i++)grid.appendChild(make("span","si-cal-spacer"));
  const last=new Date(year,monthIndex+1,0).getDate();
  let monthMinutes=0,monthQuestions=0,completed=0;
  for(let day=1;day<=last;day++){
    const key=dateKey(new Date(year,monthIndex,day,12)),item=daysByKey.get(key);
    if(item){monthMinutes+=item.minutes;monthQuestions+=item.questions;if(item.status==="completed")completed++;}
    const status=item?.status??(key>dateKey(now)?"future":"before-start");
    const button=make("button","si-cal-day si-"+status,day.toString());
    button.type="button";button.disabled=!item||status==="before-start"||status==="future";
    button.setAttribute("aria-label",labelDate(key)+" · "+
      ({completed:"Hedef tamamlandı",rest:"Dinlenme",shield:"Kalkan",missed:"Kaçırıldı",pending:"Bekliyor",
        "before-start":"Sistem öncesi",future:"Gelecek"}[status]));
    button.setAttribute("aria-pressed",String(selectedDay===key));
    button.title=button.getAttribute("aria-label")??"";
    button.addEventListener("click",()=>{selectedDay=selectedDay===key?"":key;refresh();});
    grid.appendChild(button);
  }
  section.appendChild(grid);
  section.appendChild(make("p","si-calendar-totals",
    "Bu ay: "+monthMinutes+" dakika · "+monthQuestions+" soru · "+completed+" başarılı gün"));
  if(selectedDay){
    const item=daysByKey.get(selectedDay);
    if(item){
      const detail=make("div","si-day-detail");
      detail.append(make("strong","",labelDate(item.day)),
        make("p","",item.minutes+" dakika çalışma · "+item.questions+" soru"),
        make("p","",item.goalMinutes+" dk / "+item.goalQuestions+
          " soru kişisel hedefi · "+item.xp+" temel XP"));
      section.appendChild(detail);
    }
  }
  const legend=make("p","si-legend","✓ Hedef tamamlandı · 🌿 Dinlenme · 🛡️ Kalkan · • Bekliyor");
  section.appendChild(legend);container.appendChild(section);
}
export function installStudyInsightsPanel(port:Bridge):void{
  if(mounted)return;mounted=true;
  const refresh=()=>{
    if(queued)return;queued=true;
    window.requestAnimationFrame(()=>{
      queued=false;
      const root=rootNode(),state=port.readState();
      if(!root||!state?.gamification)return;
      const now=new Date(),base=calculateStudyGamification(state,now);
      if(!base.activated)return;
      const model=getStudyInsights(state,state.gamification,now,base.history);
      const account=String(state.gamification.activatedAt);
      if(account!==recordAccount){recordBaseline=null;recordAccount=account;}
      if(recordBaseline){
        const changed=model.records.find(row=>row.value>0&&row.value>(recordBaseline?.get(row.id)??0));
        if(changed)port.toast?.("🏆 Yeni kişisel rekor: "+changed.label+" — "+
          changed.value.toLocaleString("tr-TR")+" "+changed.unit);
      }
      recordBaseline=new Map(model.records.map(row=>[row.id,row.value]));
      root.hidden=!isActiveTab();
      root.replaceChildren();
      const heading=make("div","si-title");
      heading.append(make("span","","YKS KARİYERİ"),make("h2","","Gelişimim"));
      root.appendChild(heading);
      renderActivityTrend(root,model.calendar,now);
      renderCalendar(root,model.calendar,now,refresh);
      renderRecords(root,model.records,model.exams);
      renderMastery(root,model.mastery);
    });
  };
  for(const event of ["yks:data-changed","yks:data-primary-ready","yks:auth-state","yks:achievements-settings-ready"])
    window.addEventListener(event,refresh);
  window.addEventListener("pageshow",refresh);
  window.addEventListener("focus",refresh);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
  refresh();
}
