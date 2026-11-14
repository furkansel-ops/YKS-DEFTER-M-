import "./mood-chart-v118.css";
import {moodHistory,type Mood} from "../domain/mood-history.ts";

/* v118 · Ruh hali grafiği: İlerleme ekranında son 30 günün gün sonu ruh hali (İyi üstte, Zor altta).
   progress-hub-v74 kartı window.YKSMoodChart.html(state) ile ister; hiç kayıt yoksa kart çıkmaz. */
const DAYS=30;
const LABEL:Record<Mood,string>={good:"İyi",mid:"Orta",hard:"Zor"};
const FACE:Record<Mood,string>={good:"🙂",mid:"😐",hard:"😮‍💨"};
const ORDER:Mood[]=["good","mid","hard"];
function today():string{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function dayLabel(date:string):string{return new Date(Number(date.slice(0,4)),Number(date.slice(5,7))-1,Number(date.slice(8,10))).toLocaleDateString("tr-TR",{day:"numeric",month:"short"});}

export function moodChartHtml(state:{dayReview?:unknown}|null|undefined,now=today()):string{
  const h=moodHistory(state?.dayReview,now,DAYS);
  if(!h.total)return "";
  const summary=ORDER.map(m=>`${LABEL[m]} ${h.counts[m]}`).join(", ");
  return `<div class="card mc-card"><div class="ph-head"><b>Ruh hali</b><small>son ${DAYS} gün · ${h.total} kayıt</small></div>
    <div class="mc-plot" role="img" aria-label="Son ${DAYS} günde gün sonu ruh hali: ${summary}">${ORDER.map(m=>`<span class="mc-y" data-mood="${m}" aria-hidden="true">${FACE[m]}</span><s class="mc-line" data-mood="${m}"></s>`).join("")}${h.days.map((d,i)=>
      d.mood?`<i class="mc-dot" data-mood="${d.mood}" style="grid-column:${i+2}" title="${dayLabel(d.date)} · ${LABEL[d.mood]}"></i>`:"").join("")}</div>
    <div class="mc-axis" aria-hidden="true"><span>${dayLabel(h.days[0]!.date)}</span><span>bugün</span></div>
    <p class="mc-sum">${ORDER.map(m=>`<span data-mood="${m}">${FACE[m]} ${LABEL[m]} <b>${h.counts[m]}</b></span>`).join("")}</p></div>`;
}

export function installMoodChartV118():void{
  (window as unknown as Record<string,unknown>).YKSMoodChart={html:moodChartHtml};
}
