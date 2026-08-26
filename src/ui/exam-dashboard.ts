import type {ExamAnalysis,ExamAnalysisType,ExamAnalysisWindow,ExamSubjectAnalysis} from "../domain/exam-analysis-service.ts";

declare global{interface Window{__YKS_RENDER_EXAM_DASHBOARD__?:()=>boolean;}}

function byId(id:string):HTMLElement|null{return document.getElementById(id);}
function clear(element:HTMLElement):void{while(element.firstChild)element.removeChild(element.firstChild);}
function node<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text=""):HTMLElementTagNameMap[K]{const element=document.createElement(tag);if(className)element.className=className;if(text)element.textContent=text;return element;}
function add(parent:HTMLElement,...children:HTMLElement[]):void{children.forEach(child=>parent.appendChild(child));}
function signed(value:number|null,suffix=""):string{return value==null?"—":`${value>0?"+":""}${value}${suffix}`;}
function tone(value:number|null,invert=false):string{if(value==null||value===0)return "";return (value>0)!==invert?"good":"bad";}
function selectedType():ExamAnalysisType{const item=document.querySelector<HTMLButtonElement>("#deneme .v315-type-seg button.on");const value=item?.id.replace("v315t","");return value==="AYT"||value==="YDT"||value==="BRANS"?value:"TYT";}
function selectedWindow():ExamAnalysisWindow{const item=document.querySelector<HTMLButtonElement>("#deneme .v315-window-seg button.on");return item?.id==="v315w5"?5:item?.id==="v315wAll"?0:10;}
function metric(label:string,value:string,detail:string,className=""):HTMLElement{const item=node("div",`v315-kpi ${className}`),key=node("span","k",label),main=node("span","v",value),small=node("span","s",detail);add(item,key,main,small);return item;}

function renderKpis(analysis:ExamAnalysis):void{
  const root=byId("v315Kpis");if(!root)return;clear(root);add(root,
    metric("Son net",analysis.latest?String(analysis.latest.net):"—",analysis.latest?.name??"Henüz kayıt yok"),
    metric(analysis.window?`Son ${analysis.count} ort.`:"Tüm ortalama",analysis.average==null?"—":String(analysis.average),`${analysis.count} deneme`),
    metric("En iyi",analysis.best?String(analysis.best.net):"—",analysis.best?.name??"Veri bekleniyor"),
    metric("Dönem değişimi",signed(analysis.period.delta),analysis.period.delta==null?"Karşılaştırma için daha fazla deneme gerekli":`${analysis.period.currentCount} deneme ↔ önceki ${analysis.period.previousCount}`,tone(analysis.period.delta))
  );
}
function renderInsights(analysis:ExamAnalysis):void{
  const root=byId("v4ExamInsights");if(!root)return;clear(root);const head=node("div","v4-exam-insight-head"),title=node("strong","",analysis.dataLevel==="ready"?"Veriye dayalı özet":analysis.dataLevel==="limited"?"Veri birikiyor":"Kayıt bekleniyor"),badge=node("span",`v4-exam-data ${analysis.dataLevel}`,analysis.dataLevel==="ready"?"Yeterli veri":analysis.dataLevel==="limited"?"Sınırlı veri":"Veri yok");add(head,title,badge);root.appendChild(head);const list=node("div","v4-exam-insight-list");analysis.insights.forEach(text=>{const row=node("p"),mark=node("i","","•"),copy=node("span","",text);add(row,mark,copy);list.appendChild(row);});root.appendChild(list);
  const meta=byId("v315TrendMeta");if(meta)meta.textContent=`${analysis.type==="BRANS"?"Branş":analysis.type} · ${analysis.count} deneme${analysis.trend.volatility!=null?` · oynaklık ${analysis.trend.volatility}`:""}`;
}
function renderWrongTopics(analysis:ExamAnalysis):void{
  const root=byId("v315WrongTopics");if(!root)return;clear(root);if(!analysis.wrongTopics.length){root.appendChild(node("div","empty","Denemeye bağlı yanlış kaydı ekledikçe konu yoğunluğu burada oluşacak."));return;}const max=analysis.wrongTopics[0]?.wrong||1;
  analysis.wrongTopics.forEach((item,index)=>{const row=node("div","v315-topic-row"),main=node("div","v315-topic-main"),name=node("b","",`${index+1}. ${item.name}`),meta=node("small","",`${item.subject} · ${item.examCount} deneme · yanlışların %${item.sharePercent}`),bar=node("div","v315-topic-bar"),fill=node("i");fill.style.width=`${Math.max(8,Math.round(item.wrong/max*100))}%`;bar.appendChild(fill);add(main,name,meta,bar);add(row,main,node("div","v315-topic-count",String(item.wrong)));root.appendChild(row);});
}
function subjectCallout(label:string,subject:ExamSubjectAnalysis|null,kind:string):HTMLElement{const item=node("div",`v4-exam-subject-callout ${kind}`),small=node("span","",label),strong=node("strong","",subject?.name??"Yeterli veri yok"),copy=node("p","",subject?`%${subject.successPercent??0} başarı · ${subject.samples} deneme${subject.periodDelta!=null?` · dönem ${signed(subject.periodDelta)}`:""}`:"En az iki ayrıntılı deneme sonucu gerekli.");add(item,small,strong,copy);return item;}
function renderSubjects(analysis:ExamAnalysis):void{
  const root=byId("v315SubjectPerformance");if(!root)return;clear(root);const callouts=node("div","v4-exam-subject-callouts");add(callouts,subjectCallout("Güçlü görünen",analysis.strongest,"strong"),subjectCallout("Dikkat isteyen",analysis.needsAttention,"attention"));root.appendChild(callouts);if(!analysis.subjects.length)return;const table=node("table","v315-subject-table"),header=node("tr");["Ders","Ort. net","Başarı","Dönem farkı"].forEach(text=>header.appendChild(node("th","",text)));table.appendChild(header);analysis.subjects.slice(0,8).forEach(subject=>{const row=node("tr"),name=node("td"),bold=node("b","",subject.name);name.appendChild(bold);add(row,name,node("td","",String(subject.averageNet)),node("td","",subject.successPercent==null?"—":`%${subject.successPercent}`),node("td",`v315-change ${tone(subject.periodDelta)}`,signed(subject.periodDelta)));table.appendChild(row);});root.appendChild(table);
}
function renderBalance(analysis:ExamAnalysis):void{
  const root=byId("v315Balance"),meta=byId("v315BalanceMeta");if(!root)return;clear(root);if(meta)meta.textContent=`${analysis.count} deneme`;if(!analysis.count){root.appendChild(node("div","empty","Deneme verisi bekleniyor."));return;}const grid=node("div","v315-balance-grid");[["Doğru",analysis.balance.correctAverage],["Yanlış",analysis.balance.wrongAverage],["Boş",analysis.balance.blankAverage]].forEach(([label,value])=>{const item=node("div","v315-balance-stat");add(item,node("small","",String(label)),node("b","",value==null?"—":String(value)));grid.appendChild(item);});root.appendChild(grid);[["Doğru oranı",analysis.balance.correctPercent==null?"—":`%${analysis.balance.correctPercent}`],["Boş oranı",analysis.balance.blankPercent==null?"—":`%${analysis.balance.blankPercent}`],["Ortalama süre",analysis.balance.durationAverage==null?"—":`${analysis.balance.durationAverage} dk`]].forEach(([label,value])=>{const row=node("div","v315-balance-line");add(row,node("span","",String(label)),node("b","",String(value)));root.appendChild(row);});
}
function compareMetric(label:string,value:string,className=""):HTMLElement{const item=node("div",`v4-exam-compare-metric ${className}`);add(item,node("span","",label),node("strong","",value));return item;}
function renderPair(analysis:ExamAnalysis):void{
  const root=byId("v4ExamComparison");if(!root)return;clear(root);if(!analysis.pair.available){root.appendChild(node("div","empty","Son iki denemeyi karşılaştırmak için aynı türde en az iki kayıt gerekli."));return;}const names=node("div","v4-exam-compare-names");add(names,node("span","",analysis.pair.previousName),node("i","","→"),node("strong","",analysis.pair.latestName));root.appendChild(names);const metrics=node("div","v4-exam-compare-grid");add(metrics,compareMetric("Net",signed(analysis.pair.netDelta),tone(analysis.pair.netDelta)),compareMetric("Süre",signed(analysis.pair.durationDelta," dk"),tone(analysis.pair.durationDelta,true)),compareMetric("Yanlış",signed(analysis.pair.wrongDelta),tone(analysis.pair.wrongDelta,true)),compareMetric("Boş",signed(analysis.pair.blankDelta),tone(analysis.pair.blankDelta,true)));root.appendChild(metrics);if(analysis.pair.subjects.length){const rows=node("div","v4-exam-pair-subjects");analysis.pair.subjects.slice(0,4).forEach(subject=>{const row=node("div"),name=node("span","",subject.name),value=node("b",tone(subject.delta),`${subject.previousNet} → ${subject.latestNet} · ${signed(subject.delta)}`);add(row,name,value);rows.appendChild(row);});root.appendChild(rows);}
}

export function renderExamDashboard():boolean{const api=window.__YKS_EXAM_ANALYSIS__;if(!api)return false;const analysis=api.analyze(selectedType(),selectedWindow());renderKpis(analysis);renderInsights(analysis);renderWrongTopics(analysis);renderSubjects(analysis);renderBalance(analysis);renderPair(analysis);document.documentElement.dataset.v4ExamDashboard="ready";return true;}
window.__YKS_RENDER_EXAM_DASHBOARD__=renderExamDashboard;
