import "./learning-cycle-v43.css";
import {learningCycleAnalysisService,type LearningCycleStatus,type LearningCycleTopic} from "../domain/learning-cycle-analysis-service";
import type {YksStateCandidate} from "../data/contracts";

type LooseWindow=Window&Record<string,unknown>;
type CatalogItem={exam:string;subject:string;topic:string;subjectIndex:number;topicIndex:number};

const STATUS_LABEL:Record<LearningCycleStatus,string>={returned:"Yeniden geldi",repeating:"Tekrar ediyor",review:"Tekrar bekliyor",open:"Açık hata",resolved:"Şimdilik temiz",untracked:"Deftere bağlanmadı"};

function legacy():LooseWindow{return window as unknown as LooseWindow;}
function call(name:string,...args:unknown[]):unknown{const fn=legacy()[name];if(typeof fn!=="function")return undefined;try{return Reflect.apply(fn,window,args);}catch{return undefined;}}
function state():YksStateCandidate{const adapter=legacy()["YKSLegacyState"] as {readState?:()=>YksStateCandidate}|undefined;try{return adapter?.readState?.()??{};}catch{return {};}}
function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{const element=document.getElementById(id);return element instanceof HTMLElement?element as T:null;}
function node<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text=""):HTMLElementTagNameMap[K]{const element=document.createElement(tag);if(className)element.className=className;if(text)element.textContent=text;return element;}
function add(parent:HTMLElement,...children:HTMLElement[]):void{children.forEach(child=>parent.appendChild(child));}
function norm(value:unknown):string{return String(value??"").trim().toLocaleLowerCase("tr-TR").replace(/\s+/g," ");}
function canonicalSubject(value:unknown):string{return norm(value).replace(/\s*\((?:ayt|tyt|ydt)\)\s*$/i,"").replace(/^temel\s+/,"");}
function catalogs():CatalogItem[]{
  const api=legacy()["YKSLearningLab"] as {topicCatalog?:(exam:string)=>CatalogItem[]}|undefined,all:CatalogItem[]=[];
  for(const exam of ["TYT","AYT","YDT"]){try{const rows=api?.topicCatalog?.(exam);if(Array.isArray(rows))all.push(...rows);}catch{}}
  return all;
}
function resolveLab(item:LearningCycleTopic):CatalogItem|null{
  const topic=norm(item.topic),subject=canonicalSubject(item.subject),rows=catalogs().filter(row=>norm(row.topic)===topic&&canonicalSubject(row.subject)===subject);
  if(rows.length===1)return rows[0]??null;
  const topicOnly=catalogs().filter(row=>norm(row.topic)===topic);return topicOnly.length===1?topicOnly[0]??null:null;
}
function toast(message:string):void{call("toast",message);}
function openJournal(item:LearningCycleTopic):void{
  if(item.latestJournalId&&typeof legacy()["errorJournalOpen"]==="function"){call("errorJournalOpen",item.latestJournalId);return;}
  call("go","deneme");window.setTimeout(()=>byId("errorJournal")?.scrollIntoView({behavior:"smooth",block:"start"}),60);
}
function openTopic(item:LearningCycleTopic):void{
  if(item.latestJournalId&&typeof legacy()["errorJournalOpenTopic"]==="function"){call("errorJournalOpenTopic",item.latestJournalId);return;}
  const key=call("topicKeyOf",item.subject,item.topic);if(typeof key!=="string"||!key){toast("Bu konu müfredatta eşleşmedi");return;}
  const parts=key.split("|"),exam=parts[0]??"",subject=parts[1]??item.subject,topic=parts.slice(2).join("|")||item.topic;call("go","topics");window.setTimeout(()=>call("openTopicDetail",exam,subject,topic),70);
}
function openLab(item:LearningCycleTopic):void{
  const hit=resolveLab(item);if(!hit){toast("Bu konu için Laboratuvar rehberi bulunamadı");return;}
  if(typeof legacy()["v30OpenMore"]==="function")call("v30OpenMore","lab");else{call("go","more");call("setMoreTab","lab");}
  window.setTimeout(()=>{call("v320SetExam",hit.exam);window.setTimeout(()=>call("v4OpenLabTopic",Number(hit.subjectIndex),Number(hit.topicIndex)),40);},120);
}
function openReviews():void{call("go","topics");window.setTimeout(()=>byId("reviewBox")?.scrollIntoView({behavior:"smooth",block:"start"}),80);}
function action(label:string,handler:()=>void,primary=false):HTMLButtonElement{const button=node("button",primary?"btn green tiny":"btn ghost tiny",label);button.type="button";button.addEventListener("click",handler);return button;}
function step(label:string,value:string,stateName:string):HTMLElement{const item=node("div",`v43-cycle-step ${stateName}`);add(item,node("span","",label),node("strong","",value));return item;}
function statusDetail(item:LearningCycleTopic):string{
  if(item.status==="returned")return `Çözüldü işaretinden sonra ${item.latestWrongDate} tarihinde yeni yanlış kaydı var.`;
  if(item.status==="repeating")return `${item.differentWrongDays} farklı günde yanlış kaydı oluşmuş ve hata hâlâ açık.`;
  if(item.status==="review")return `${item.pendingReviews} tekrar tamamlanmayı bekliyor.`;
  if(item.status==="open")return "Hata Defteri kaydı açık; konu ve düzeltme notunu yeniden gözden geçir.";
  if(item.status==="resolved")return "Hata çözüldü; çözümden sonra yeni yanlış kaydı görünmüyor.";
  return "Yanlış kaydı var ancak henüz Hata Defteri kaydına bağlanmamış.";
}
function card(item:LearningCycleTopic):HTMLElement{
  const article=node("article",`v43-cycle-card ${item.status}`),head=node("div","v43-cycle-card-head"),copy=node("div"),title=node("strong","",`${item.subject} · ${item.topic}`),badge=node("span",`v43-cycle-status ${item.status}`,STATUS_LABEL[item.status]);add(copy,title,node("small","",statusDetail(item)));add(head,copy,badge);article.appendChild(head);
  const flow=node("div","v43-cycle-flow");add(flow,step("Hata",`${item.wrongTotal} yanlış`,item.wrongTotal?"done":"idle"),step("Öğren",item.journalEntries?`${item.journalEntries} kayıt`:"bağla",item.journalEntries?"done":"idle"),step("Tekrar",item.pendingReviews?`${item.pendingReviews} bekliyor`:item.completedReviews?"tamamlandı":"—",item.pendingReviews?"active":item.completedReviews?"done":"idle"),step("Kontrol",item.returnedAfterResolve?"yeniden geldi":item.status==="resolved"?"temiz":"izleniyor",item.returnedAfterResolve?"danger":item.status==="resolved"?"done":"active"));article.appendChild(flow);
  const actions=node("div","v43-cycle-actions");add(actions,action("Hata kaydı",()=>openJournal(item)),action("Konu",()=>openTopic(item)),action("Laboratuvar",()=>openLab(item)),action("Tekrarlar",openReviews,item.pendingReviews>0));article.appendChild(actions);return article;
}
function metric(label:string,value:string):HTMLElement{const item=node("div","v43-cycle-kpi");add(item,node("strong","",value),node("span","",label));return item;}

export function renderLearningCycleV43():boolean{
  const root=byId("v43LearningCycle");if(!root)return false;const analysis=learningCycleAnalysisService.analyze(state());while(root.firstChild)root.removeChild(root.firstChild);
  const head=node("div","v43-cycle-head"),copy=node("div");add(copy,node("span","v43-cycle-eyebrow","Hata → Öğren → Tekrar → Kontrol"),node("h2","","Öğrenme Döngüsü"),node("p","","Aynı hatanın kapanıp kapanmadığını ve sonraki denemelerde geri dönüp dönmediğini tek yerden izle."));add(head,copy,node("span",`v43-cycle-data ${analysis.dataLevel}`,analysis.dataLevel==="ready"?"Veri hazır":analysis.dataLevel==="limited"?"Veri birikiyor":"Kayıt bekleniyor"));root.appendChild(head);
  const kpis=node("div","v43-cycle-kpis");add(kpis,metric("yeniden geldi",String(analysis.returned)),metric("tekrar ediyor",String(analysis.repeating)),metric("bekleyen tekrar",String(analysis.pendingReviews)),metric("şimdilik kapalı",String(analysis.resolved)));root.appendChild(kpis);
  const insight=node("div","v43-cycle-insights");analysis.insights.forEach(text=>{const p=node("p");add(p,node("i","","•"),node("span","",text));insight.appendChild(p);});root.appendChild(insight);
  const list=node("div","v43-cycle-list");if(!analysis.topics.length)list.appendChild(node("div","v43-cycle-empty","İlk yanlış veya Hata Defteri kaydından sonra konu döngüleri burada oluşacak."));else analysis.topics.slice(0,6).forEach(item=>list.appendChild(card(item)));root.appendChild(list);root.dataset.v43CycleRendered="ready";return true;
}

export function installLearningCycleV43():{installed:boolean;validate:()=>string[]}{
  const deneme=byId("deneme"),journal=byId("errorJournal");if(!deneme)return {installed:false,validate:()=>["deneme screen missing"]};let root=byId("v43LearningCycle");if(!root){root=node("section","v43-learning-cycle");root.id="v43LearningCycle";root.dataset.v43LearningCycle="ready";if(journal)journal.insertAdjacentElement("afterend",root);else deneme.prepend(root);}renderLearningCycleV43();
  return {installed:true,validate:()=>{const errors:string[]=[];if(root?.dataset.v43LearningCycle!=="ready")errors.push("learning cycle marker missing");if(!byId("errorJournal"))errors.push("error journal missing");if(typeof legacy()["errorJournalOpenTopic"]!=="function")errors.push("error journal topic bridge missing");return errors;}};
}

declare global{interface Window{__YKS_RENDER_LEARNING_CYCLE_V43__?:()=>boolean;}}
window.__YKS_RENDER_LEARNING_CYCLE_V43__=renderLearningCycleV43;
