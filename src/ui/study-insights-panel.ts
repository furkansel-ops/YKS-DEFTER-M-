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
    return existing;
  }
  if(!anchor)return null;
  const root=make("section","si-panel");root.id="studyInsightsPanel";
  root.setAttribute("aria-label","Çalışma takvimi, kişisel rekorlar ve ders ustalığı");
  anchor.insertAdjacentElement("afterend",root);return root;
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
      e.type+" "+e.count+" adet · en iyi "+(e.bestNet??0).toLocaleString("tr-TR")+" net").join("  |  "));
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
      root.replaceChildren();
      const heading=make("div","si-title");
      heading.append(make("span","","YKS KARİYERİ"),make("h2","","Gelişimim"));
      root.appendChild(heading);
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
