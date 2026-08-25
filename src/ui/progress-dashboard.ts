import {formatHoursMinutes} from "../services/format-service.ts";
import type {ProgressAnalysis,ProgressDelta,SubjectInsight} from "../domain/progress-analysis-service.ts";

declare global{interface Window{__YKS_RENDER_PROGRESS_DASHBOARD__?:()=>boolean;}}

function byId(id:string):HTMLElement|null{return document.getElementById(id);}
function clear(element:HTMLElement):void{while(element.firstChild)element.removeChild(element.firstChild);}
function node<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text=""):HTMLElementTagNameMap[K]{const element=document.createElement(tag);if(className)element.className=className;if(text)element.textContent=text;return element;}
function add(parent:HTMLElement,...children:HTMLElement[]):void{children.forEach(child=>parent.appendChild(child));}
function signed(value:number,suffix=""):string{return `${value>0?"+":""}${value}${suffix}`;}
function deltaText(value:ProgressDelta,unit=""):string{
  if(value.percent==null)return value.absolute>0?`+${Math.round(value.absolute)} ${unit} yeni`.trim():"veri bekleniyor";
  return `${signed(value.percent,"%")} · ${signed(Math.round(value.absolute),unit?` ${unit}`:"")}`;
}
function trendClass(value:number|null):string{return value==null||value===0?"flat":value>0?"up":"down";}
function activeRange():number{const selected=document.querySelector<HTMLButtonElement>("#progressRangeSeg button.on");const value=Number(selected?.id.replace("pr",""));return [7,30,90].includes(value)?value:30;}

function renderOverview(analysis:ProgressAnalysis):void{
  const root=byId("v4ProgressOverview");if(!root)return;clear(root);
  const head=node("div","v4-progress-overview-head"),title=node("div"),eyebrow=node("span","v4-progress-eyebrow",`${analysis.days} günlük görünüm`),heading=node("h2","",analysis.dataLevel==="empty"?"Kayıt bekleniyor":analysis.dataLevel==="limited"?"Veri birikiyor":"Genel durum");add(title,eyebrow,heading);head.appendChild(title);
  const badge=node("span",`v4-data-badge ${analysis.dataLevel}`,analysis.dataLevel==="ready"?"Yeterli veri":analysis.dataLevel==="limited"?"Sınırlı veri":"Henüz veri yok");head.appendChild(badge);root.appendChild(head);
  const grid=node("div","v4-progress-kpis"),items=[
    ["Çalışma değişimi",deltaText(analysis.deltas.minutes,"dk"),trendClass(analysis.deltas.minutes.absolute)],
    ["Soru değişimi",deltaText(analysis.deltas.questions),trendClass(analysis.deltas.questions.absolute)],
    ["Net değişimi",analysis.exam.delta==null?"karşılaştırma yok":signed(analysis.exam.delta," net"),trendClass(analysis.exam.delta)],
    ["Güncel seri",`${analysis.rhythm.currentStreak} gün`,analysis.rhythm.currentStreak>0?"up":"flat"]
  ];
  items.forEach(([label,value,direction])=>{const item=node("div",`v4-progress-kpi ${direction}`),strong=node("strong","",value),small=node("span","",label);add(item,strong,small);grid.appendChild(item);});root.appendChild(grid);
  const insights=node("div","v4-progress-insights");analysis.insights.forEach(text=>{const row=node("p"),mark=node("i","","•"),copy=node("span","",text);add(row,mark,copy);insights.appendChild(row);});root.appendChild(insights);
}

function subjectBlock(label:string,subject:SubjectInsight|null,kind:"strong"|"attention"):HTMLElement{
  const block=node("article",`v4-subject-callout ${kind}`),top=node("div","v4-subject-callout-top"),tag=node("span","",label),name=node("strong","",subject?.name??"Yeterli veri yok");add(top,tag,name);block.appendChild(top);
  const copy=node("p","",subject?subject.evidence.join(" · "):"En az birkaç ders kaydı veya iki deneme sonucu olduğunda güvenilir yorum oluşacak.");block.appendChild(copy);return block;
}
function renderSubjects(analysis:ProgressAnalysis):void{
  const root=byId("v4SubjectInsights");if(!root)return;clear(root);const grid=node("div","v4-subject-callouts");add(grid,subjectBlock("Güçlü görünen",analysis.strongest,"strong"),subjectBlock("Dikkat isteyen",analysis.needsAttention,"attention"));root.appendChild(grid);
  if(analysis.subjects.length){const list=node("div","v4-subject-list");analysis.subjects.slice(0,5).forEach(subject=>{const row=node("div","v4-subject-line"),name=node("b","",subject.name),meta=node("span","",`${formatHoursMinutes(subject.minutes)} · ${subject.questions} soru${subject.examPercent!=null?` · deneme %${Math.round(subject.examPercent)}`:""}`);add(row,name,meta);list.appendChild(row);});root.appendChild(list);}
}
function metric(label:string,value:string):HTMLElement{const item=node("div","v4-mini-metric"),strong=node("strong","",value),span=node("span","",label);add(item,strong,span);return item;}
function renderRhythm(analysis:ProgressAnalysis):void{
  const root=byId("v4ProgressRhythm");if(!root)return;clear(root);const grid=node("div","v4-mini-grid");add(grid,metric("aktiflik",`%${analysis.rhythm.consistencyPercent}`),metric("en uzun seri",`${analysis.rhythm.longestStreak} gün`),metric("aktif gün ort.",formatHoursMinutes(analysis.rhythm.averageMinutesPerActiveDay)),metric("en verimli gün",analysis.rhythm.bestDay??"—"));root.appendChild(grid);
}
function renderTopicsAndReviews(analysis:ProgressAnalysis):void{
  const root=byId("v4TopicsReviews");if(!root)return;clear(root);const grid=node("div","v4-mini-grid");add(grid,metric("konu ilerlemesi",`%${analysis.topic.percent}`),metric("pekiştirilen",`${analysis.topic.completed}/${analysis.topic.total}`),metric("bekleyen tekrar",String(analysis.reviews.pending)),metric("tekrar başarısı",analysis.reviews.completionPercent==null?"—":`%${analysis.reviews.completionPercent}`));root.appendChild(grid);
  const progress=node("div","v4-simple-progress"),fill=node("i");fill.style.width=`${analysis.topic.percent}%`;progress.appendChild(fill);root.appendChild(progress);
}

export function renderProgressDashboard():boolean{
  const api=window.__YKS_PROGRESS_ANALYSIS__;if(!api)return false;const analysis=api.analyze(activeRange());renderOverview(analysis);renderSubjects(analysis);renderRhythm(analysis);renderTopicsAndReviews(analysis);document.documentElement.dataset.v4ProgressDashboard="ready";return true;
}

window.__YKS_RENDER_PROGRESS_DASHBOARD__=renderProgressDashboard;
