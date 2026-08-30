import "./analysis-center-v43.css";
import {formatHoursMinutes} from "../services/format-service.ts";
import type {ExamAnalysis,ExamAnalysisType} from "../domain/exam-analysis-service.ts";
import type {ProgressAnalysis,SubjectInsight} from "../domain/progress-analysis-service.ts";

const GENERAL_EXAM_TYPES:[ExamAnalysisType,ExamAnalysisType,ExamAnalysisType]=["TYT","AYT","YDT"];
let selectedExamType:ExamAnalysisType|null=null;

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const element=document.getElementById(id);
  return element instanceof HTMLElement?element as T:null;
}
function clear(element:HTMLElement):void{while(element.firstChild)element.removeChild(element.firstChild);}
function node<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text=""):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);if(className)element.className=className;if(text)element.textContent=text;return element;
}
function add(parent:HTMLElement,...children:HTMLElement[]):void{children.forEach(child=>parent.appendChild(child));}
function signed(value:number|null,suffix=""):string{return value==null?"—":`${value>0?"+":""}${value}${suffix}`;}
function trendClass(value:number|null):string{return value==null||value===0?"flat":value>0?"up":"down";}
function latestDate(analysis:ExamAnalysis):string{return analysis.latest?.date??"";}
function metric(label:string,value:string,detail:string,className=""):HTMLElement{
  const item=node("article",`v43-analysis-metric ${className}`);add(item,node("span","",label),node("strong","",value),node("small","",detail));return item;
}
function dataBadge(progress:ProgressAnalysis,exam:ExamAnalysis):{label:string;className:string}{
  if(progress.dataLevel==="empty"&&exam.dataLevel==="empty")return {label:"Veri bekleniyor",className:"empty"};
  if(progress.dataLevel==="limited"||exam.dataLevel==="limited")return {label:"Veri birikiyor",className:"limited"};
  return {label:"Yeterli veri",className:"ready"};
}
function resolveExamAnalyses():{selected:ExamAnalysis;all:ExamAnalysis[]}|null{
  const api=window.__YKS_EXAM_ANALYSIS__;if(!api)return null;
  const all=GENERAL_EXAM_TYPES.map(type=>api.analyze(type,10));
  let selected=selectedExamType?all.find(item=>item.type===selectedExamType&&item.count>0):undefined;
  selected??=all.filter(item=>item.count>0).sort((a,b)=>latestDate(b).localeCompare(latestDate(a))||b.count-a.count)[0];
  selected??=all[0]!;selectedExamType=selected.type;return {selected,all};
}

function renderPeriodSummary(root:HTMLElement,seven:ProgressAnalysis,thirty:ProgressAnalysis):void{
  const section=node("section","v43-analysis-section v43-analysis-periods"),head=node("div","v43-analysis-section-head");
  add(head,node("div","","").appendChild(node("span","v43-analysis-eyebrow","Çalışma ritmi")).parentElement as HTMLElement,node("span","v43-analysis-muted","eşit dönemle karşılaştırma"));
  section.appendChild(head);
  const grid=node("div","v43-analysis-period-grid");
  const sevenCard=node("article","v43-analysis-period-card"),sevenHead=node("div","v43-analysis-period-head");add(sevenHead,node("strong","","Son 7 gün"),node("span",trendClass(seven.deltas.minutes.absolute),signed(seven.deltas.minutes.percent,"%")));sevenCard.appendChild(sevenHead);
  const sevenMetrics=node("div","v43-analysis-period-metrics");add(sevenMetrics,metric("Odak",formatHoursMinutes(seven.current.minutes),`${signed(Math.round(seven.deltas.minutes.absolute)," dk")} önceki döneme göre`),metric("Soru",String(seven.current.questions),`${signed(Math.round(seven.deltas.questions.absolute))} fark`),metric("Aktif gün",`${seven.current.activeDays}/7`,`${seven.rhythm.currentStreak} günlük seri`));sevenCard.appendChild(sevenMetrics);
  const thirtyCard=node("article","v43-analysis-period-card"),thirtyHead=node("div","v43-analysis-period-head");add(thirtyHead,node("strong","","Son 30 gün"),node("span",trendClass(thirty.exam.delta),thirty.exam.delta==null?"net verisi yok":signed(thirty.exam.delta," net")));thirtyCard.appendChild(thirtyHead);
  const thirtyMetrics=node("div","v43-analysis-period-metrics");add(thirtyMetrics,metric("Odak",formatHoursMinutes(thirty.current.minutes),`${thirty.current.activeDays} aktif gün`),metric("Soru",String(thirty.current.questions),`${signed(Math.round(thirty.deltas.questions.absolute))} fark`),metric("Tekrar",String(thirty.reviews.pending),thirty.reviews.overdue?`${thirty.reviews.overdue} gecikmiş`:"geciken yok"));thirtyCard.appendChild(thirtyMetrics);
  add(grid,sevenCard,thirtyCard);section.appendChild(grid);root.appendChild(section);
}

function renderTrendBars(analysis:ExamAnalysis):HTMLElement{
  const chart=node("div","v43-analysis-trend");chart.setAttribute("role","img");chart.setAttribute("aria-label",`${analysis.type} son ${analysis.trend.points.length} deneme net eğilimi`);
  const points=analysis.trend.points;if(!points.length){chart.appendChild(node("div","v43-analysis-empty","Deneme verisi eklendikçe net eğilimi burada görünecek."));return chart;}
  const values=points.map(item=>item.net),min=Math.min(...values),max=Math.max(...values),range=Math.max(1,max-min);
  points.forEach(item=>{const wrap=node("div","v43-analysis-bar-wrap"),bar=node("i","v43-analysis-bar"),label=node("small","",String(item.net));bar.style.height=`${24+Math.round((item.net-min)/range*72)}%`;bar.title=`${item.name}: ${item.net} net`;add(wrap,label,bar);chart.appendChild(wrap);});
  return chart;
}
function renderExamTrend(root:HTMLElement,analysis:ExamAnalysis,all:ExamAnalysis[]):void{
  const section=node("section","v43-analysis-section"),head=node("div","v43-analysis-section-head"),title=node("div");add(title,node("span","v43-analysis-eyebrow","Deneme eğilimi"),node("strong","",analysis.count?`${analysis.type} · son ${analysis.count} deneme`:"Deneme verisi bekleniyor"));
  const tabs=node("div","v43-analysis-exam-tabs");GENERAL_EXAM_TYPES.forEach(type=>{const item=all.find(row=>row.type===type),button=node("button",type===analysis.type?"on":"",type);button.type="button";button.disabled=!item?.count;button.setAttribute("aria-pressed",String(type===analysis.type));button.title=item?.count?`${item.count} kayıt`:`${type} kaydı yok`;button.addEventListener("click",()=>{selectedExamType=type;renderAnalysisCenterV43();});tabs.appendChild(button);});add(head,title,tabs);section.appendChild(head);
  const grid=node("div","v43-analysis-exam-grid"),kpis=node("div","v43-analysis-exam-kpis");add(kpis,metric("Son net",analysis.latest?String(analysis.latest.net):"—",analysis.latest?.name??"kayıt yok"),metric("Ortalama",analysis.average==null?"—":String(analysis.average),`${analysis.count} deneme`),metric("Dönem farkı",signed(analysis.period.delta," net"),analysis.period.delta==null?"karşılaştırma yok":`${analysis.period.currentCount} ↔ ${analysis.period.previousCount}`,trendClass(analysis.period.delta)),metric("İstikrar",analysis.trend.volatility==null?"—":String(analysis.trend.volatility),analysis.trend.direction==="up"?"yükseliş":analysis.trend.direction==="down"?"düşüş":analysis.trend.direction==="flat"?"yatay":"veri bekleniyor"));
  add(grid,kpis,renderTrendBars(analysis));section.appendChild(grid);root.appendChild(section);
}

function subjectLine(subject:SubjectInsight):HTMLElement{
  const row=node("article","v43-analysis-subject"),top=node("div","v43-analysis-subject-top"),name=node("strong","",subject.name),context=node("span","",subject.examPercent==null?"Deneme bağlamı yok":`%${Math.round(subject.examPercent)} başarı${subject.examDelta==null?"":` · ${signed(subject.examDelta)}`}`);add(top,name,context);
  const meta=node("div","v43-analysis-subject-meta");add(meta,node("span","",formatHoursMinutes(subject.minutes)),node("span","",`${subject.questions} soru`),node("span",subject.wrongs>0?"attention":"",`${subject.wrongs} yanlış`));add(row,top,meta);return row;
}
function renderSubjectContext(root:HTMLElement,analysis:ProgressAnalysis):void{
  const section=node("section","v43-analysis-section"),head=node("div","v43-analysis-section-head"),title=node("div");add(title,node("span","v43-analysis-eyebrow","Ders bağlamı"),node("strong","","Çalışma süresi ↔ deneme başarısı"));add(head,title,node("span","v43-analysis-muted","son 30 gün"));section.appendChild(head);
  const list=node("div","v43-analysis-subject-list");if(!analysis.subjects.length)list.appendChild(node("div","v43-analysis-empty","Ders bazlı çalışma ve deneme kayıtları biriktikçe karşılaştırma burada oluşacak."));else analysis.subjects.slice(0,6).forEach(subject=>list.appendChild(subjectLine(subject)));section.appendChild(list);root.appendChild(section);
}

function signalCard(title:string,detail:string,meta:string,kind=""):HTMLElement{
  const card=node("article",`v43-analysis-signal ${kind}`);add(card,node("strong","",title),node("p","",detail),node("small","",meta));return card;
}
function renderSignals(root:HTMLElement,progress:ProgressAnalysis,exam:ExamAnalysis):void{
  const section=node("section","v43-analysis-section"),head=node("div","v43-analysis-section-head"),title=node("div");add(title,node("span","v43-analysis-eyebrow","Kritik sinyaller"),node("strong","","Nerede dikkat gerekiyor?"));add(head,title,node("span","v43-analysis-muted","yalnız kayıtlı veriden"));section.appendChild(head);
  const grid=node("div","v43-analysis-signal-grid");exam.wrongTopics.slice(0,3).forEach((item,index)=>grid.appendChild(signalCard(`${item.subject} · ${item.name}`,`${item.wrong} yanlış · ${item.examCount} denemede tekrarlandı`,`Bağlı yanlışların %${item.sharePercent}'i`,index===0?"critical":"")));
  if(!exam.wrongTopics.length&&progress.needsAttention)grid.appendChild(signalCard(progress.needsAttention.name,progress.needsAttention.evidence.join(" · ")||"Ders kayıtları dikkat sinyali veriyor.","Ders düzeyi sinyali","critical"));
  if(!grid.children.length)grid.appendChild(node("div","v43-analysis-empty","Kritik sinyal üretmek için yeterli hata veya deneme kaydı yok."));section.appendChild(grid);root.appendChild(section);
}
function renderEvidence(root:HTMLElement,progress:ProgressAnalysis,exam:ExamAnalysis):void{
  const section=node("section","v43-analysis-section v43-analysis-evidence"),head=node("div","v43-analysis-section-head"),title=node("div");add(title,node("span","v43-analysis-eyebrow","Kanıt özeti"),node("strong","","Verilerin ne söylüyor?"));head.appendChild(title);section.appendChild(head);
  const list=node("div","v43-analysis-evidence-list"),lines=[...progress.insights,...exam.insights].filter((text,index,all)=>text&&all.indexOf(text)===index).slice(0,5);if(!lines.length)lines.push("Çalışma ve deneme verileri biriktikçe açıklanabilir analizler burada görünecek.");lines.forEach(text=>{const row=node("p");add(row,node("i","","•"),node("span","",text));list.appendChild(row);});section.appendChild(list);root.appendChild(section);
}

export function renderAnalysisCenterV43():boolean{
  const root=byId("v43AnalysisCenter"),progressApi=window.__YKS_PROGRESS_ANALYSIS__,examParts=resolveExamAnalyses();if(!root||!progressApi||!examParts)return false;clear(root);
  const seven=progressApi.analyze(7),thirty=progressApi.analyze(30),exam=examParts.selected,badge=dataBadge(thirty,exam),header=node("header","v43-analysis-header"),copy=node("div");add(copy,node("span","v43-analysis-eyebrow","v4.3"),node("h2","","Analiz Merkezi"),node("p","","Çalışma, deneme, ders ve hata sinyallerini tek bakışta gör."));add(header,copy,node("span",`v43-analysis-data ${badge.className}`,badge.label));root.appendChild(header);
  renderPeriodSummary(root,seven,thirty);renderExamTrend(root,exam,examParts.all);renderSubjectContext(root,thirty);renderSignals(root,thirty,exam);renderEvidence(root,thirty,exam);root.dataset.v43AnalysisRendered="ready";return true;
}

export function installAnalysisCenterV43():{installed:boolean;validate:()=>string[]}{
  const progress=byId("progress");if(!progress)return {installed:false,validate:()=>["progress screen missing"]};
  let root=byId("v43AnalysisCenter");if(!root){root=node("section","v43-analysis-center");root.id="v43AnalysisCenter";root.dataset.v43Analysis="ready";progress.prepend(root);}renderAnalysisCenterV43();
  return {installed:true,validate:()=>{const errors:string[]=[];if(root?.dataset.v43Analysis!=="ready")errors.push("analysis center marker missing");if(!window.__YKS_PROGRESS_ANALYSIS__)errors.push("progress analysis api missing");if(!window.__YKS_EXAM_ANALYSIS__)errors.push("exam analysis api missing");return errors;}};
}
