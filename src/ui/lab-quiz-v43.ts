import {buildStructureQuiz,gradeStructureAnswer,summarizeStructureQuiz,type QuizAnswer,type QuizQuestion,type QuizStructure} from "../domain/lab-quiz-service.ts";
import "./lab-quiz-v43.css";

interface LabQuizRuntime {installed:true;version:string;validate():string[];refresh():void;stop():void;}
declare global {interface Window {__YKS_LAB_QUIZ_V43__?:LabQuizRuntime;}}

type Feedback={correct:boolean;picked:string;expected:string}|null;
const VERSION="4.3.0-stage4";
const text=(value:unknown)=>String(value??"").trim();
const esc=(value:unknown)=>text(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
const cleanLabel=(value:unknown)=>text(value).replace(/^\s*\d+\s*/,"").replace(/\s+/g," ").trim();

export function installLabQuizV43():LabQuizRuntime {
  if(window.__YKS_LAB_QUIZ_V43__)return window.__YKS_LAB_QUIZ_V43__;
  let panel:HTMLElement|null=null,box:HTMLElement|null=null,mode:"learn"|"quiz"="learn",questions:QuizQuestion[]=[],answers:QuizAnswer[]=[],index=0,awaiting=false,finished=false,feedback:Feedback=null;
  let startToken=0,restoreOrgan="",restoreLabels=true,restoreOpen=false,syncQueued=false;
  const pointLabels=new WeakMap<HTMLElement,{aria:string|null;title:string|null}>();

  const currentOrganButton=()=>panel?.querySelector<HTMLElement>('.atlas-organ-item[aria-pressed="true"]')||null;
  const currentOrganId=()=>currentOrganButton()?.dataset.id||"";
  const currentOrganName=()=>cleanLabel(currentOrganButton()?.querySelector("b")?.textContent)||"Seçili organ";
  function structures():QuizStructure[]{
    if(!panel)return [];
    return [...panel.querySelectorAll<HTMLElement>(".atlas-structure-list [data-atlas-structure]")].map(node=>({id:text(node.dataset.atlasStructure),label:cleanLabel(node.textContent),priority:node.classList.contains("is-must-know")})).filter(row=>row.id&&row.label);
  }
  function labelFor(id:string){return structures().find(row=>row.id===id)?.label||id;}
  function ensureBox(){
    if(!panel)return null;
    box=panel.querySelector<HTMLElement>("#v43LabQuiz")||null;if(box)return box;
    const header=panel.querySelector(".atlas-header");if(!header)return null;
    box=document.createElement("section");box.id="v43LabQuiz";box.className="v43-lab-quiz";box.setAttribute("aria-label","3B yapı sınaması");header.insertAdjacentElement("afterend",box);return box;
  }
  function maskModelPoints(){
    if(!panel)return;
    const points=[...panel.querySelectorAll<HTMLElement>(".atlas-model-point")];
    points.forEach((point,i)=>{
      if(mode==="quiz"){
        if(!pointLabels.has(point))pointLabels.set(point,{aria:point.getAttribute("aria-label"),title:point.getAttribute("title")});
        point.setAttribute("aria-label",`Yanıt noktası ${i+1}`);point.removeAttribute("title");
      }else{
        const saved=pointLabels.get(point);if(!saved)return;
        if(saved.aria===null)point.removeAttribute("aria-label");else point.setAttribute("aria-label",saved.aria);
        if(saved.title===null)point.removeAttribute("title");else point.setAttribute("title",saved.title);
      }
    });
  }
  function setPanelState(){
    if(!panel)return;
    panel.dataset.labQuizMode=mode;
    panel.dataset.labQuizAnswer=mode==="quiz"&&awaiting?"awaiting":feedback?(feedback.correct?"correct":"wrong"):finished?"finished":"idle";
    const target=ensureBox();if(target)target.dataset.active=String(mode==="quiz"&&!finished);
    maskModelPoints();
  }
  function render(){
    const target=ensureBox();if(!target)return;
    const organ=currentOrganName(),pool=structures(),summary=summarizeStructureQuiz(questions,answers);
    const modeButtons=`<div class="v43-lab-quiz-mode" role="group" aria-label="Atlas çalışma modu"><button type="button" data-lab-quiz-action="learn" aria-pressed="${mode==="learn"}">Öğren</button><button type="button" data-lab-quiz-action="quiz" aria-pressed="${mode==="quiz"}">Sınama</button></div>`;
    let body="";
    if(mode==="learn")body=`<div class="v43-lab-quiz-idle"><p><b>Öğren modu:</b> Etiketler, yapı açıklamaları ve YKS öncelikleri görünür. Hazır olduğunda isimleri kapatıp model üzerinde kendini sınayabilirsin.</p><button type="button" class="primary" data-lab-quiz-action="quiz">3B sınamayı başlat</button></div>`;
    else if(finished)body=`<div class="v43-lab-quiz-result"><strong>${summary.correct}/${summary.total}</strong><div><b>${summary.percent}% doğru · ${esc(organ)}</b><small>${summary.wrong?summary.wrong+" yapıyı yeniden gözden geçir.":"Bu turdaki bütün yapıları doğru buldun."}</small></div></div><div class="v43-lab-quiz-actions"><button type="button" class="primary" data-lab-quiz-action="restart">Aynı organı tekrar et</button><button type="button" data-lab-quiz-action="learn">Etiketleri aç · Öğren</button></div>`;
    else if(questions.length){
      const q=questions[index]!;
      body=`<div class="v43-lab-quiz-question"><span class="v43-lab-quiz-count">${index+1}/${questions.length}</span><p><b>${esc(organ)}</b> modelinde <strong>${esc(q.label)}</strong> yapısını bul ve <b>?</b> noktasına dokun.</p><span class="v43-lab-quiz-score">${summary.correct} doğru · ${summary.wrong} yanlış</span></div>`;
      if(feedback)body+=`<div class="v43-lab-quiz-feedback" data-result="${feedback.correct?"correct":"wrong"}" role="status"><b>${feedback.correct?"Doğru ✓":"Yanlış"}</b>${feedback.correct?`${esc(feedback.expected)} yapısını doğru seçtin.`:`Seçtiğin: ${esc(feedback.picked)} · Doğru yapı: ${esc(feedback.expected)}`}</div><div class="v43-lab-quiz-actions"><button type="button" class="primary" data-lab-quiz-action="next">${index===questions.length-1?"Sonucu gör":"Sonraki yapı"}</button><button type="button" data-lab-quiz-action="learn">Sınamayı bitir</button></div>`;
      else body+=`<div class="v43-lab-quiz-actions"><button type="button" data-lab-quiz-action="learn">Sınamayı bitir</button></div>`;
    }else body=`<div class="v43-lab-quiz-idle"><p>${pool.length?`${esc(organ)} için ${Math.min(6,pool.length)} yapılık etiketsiz sınama hazır.`:"3B organ görünümü hazırlanıyor. Organ açıldığında yapı sınaması kullanılabilir olacak."}</p><button type="button" class="primary" data-lab-quiz-action="restart" ${pool.length?"":"disabled"}>Sınamayı başlat</button></div>`;
    target.innerHTML=`<div class="v43-lab-quiz-head"><div><span>ÖĞRENME LABORATUVARI 3.0</span><b>3B Yapı Sınaması</b><small>Etiketsiz nokta seçimi · Sonuç yalnız bu oturumda tutulur · Programı değiştirmez</small></div>${modeButtons}</div><div class="v43-lab-quiz-body">${body}</div>`;
    setPanelState();
  }
  function restoreView(){
    if(!panel||!restoreOrgan||currentOrganId()!==restoreOrgan)return;
    const labels=panel.querySelector<HTMLElement>('#atlasModelLabels');if(labels&&((labels.getAttribute("aria-pressed")==="true")!==restoreLabels))labels.click();
    const open=panel.querySelector<HTMLElement>('#atlasModelOpen');if(open&&((open.getAttribute("aria-pressed")==="true")!==restoreOpen))open.click();
  }
  function stopQuiz(restore=true){
    startToken++;if(mode==="quiz"&&restore)restoreView();mode="learn";questions=[];answers=[];index=0;awaiting=false;finished=false;feedback=null;restoreOrgan="";render();
  }
  function prepareSurface(){
    if(!panel)return false;
    const modelMode=panel.querySelector<HTMLElement>('#atlasMode-model');if(modelMode?.getAttribute("aria-pressed")!=="true"){modelMode?.click();return false;}
    const modelView=panel.querySelector<HTMLElement>('[data-atlas-action="organ-view"][data-id="model"]');if(modelView&&modelView.getAttribute("aria-pressed")!=="true"){modelView.click();return false;}
    const pool=structures();if(!pool.length)return false;
    restoreOrgan=currentOrganId();const labels=panel.querySelector<HTMLElement>('#atlasModelLabels'),open=panel.querySelector<HTMLElement>('#atlasModelOpen');
    restoreLabels=labels?.getAttribute("aria-pressed")!=="false";restoreOpen=open?.getAttribute("aria-pressed")==="true";
    if(labels&&labels.getAttribute("aria-pressed")!=="true")labels.click();if(open&&open.getAttribute("aria-pressed")!=="true")open.click();return true;
  }
  function beginQuiz(){
    const token=++startToken,tryBegin=(attempt:number)=>{
      if(token!==startToken||!panel)return;
      if(!prepareSurface()){if(attempt<24)window.setTimeout(()=>tryBegin(attempt+1),70);else{mode="quiz";questions=[];render();}return;}
      questions=buildStructureQuiz(structures(),6);answers=[];index=0;awaiting=true;finished=false;feedback=null;mode="quiz";render();
      panel.querySelector<HTMLElement>("#v43LabQuiz")?.scrollIntoView?.({behavior:"smooth",block:"nearest"});
    };tryBegin(0);
  }
  function answer(id:string){
    if(mode!=="quiz"||!awaiting||finished)return false;
    const result=gradeStructureAnswer(questions[index],id);if(!result)return false;
    answers.push(result);awaiting=false;feedback={correct:result.correct,picked:labelFor(result.pickedId),expected:questions[index]!.label};render();return true;
  }
  function next(){
    if(!feedback)return;if(index>=questions.length-1){finished=true;awaiting=false;feedback=null;render();return;}
    index++;awaiting=true;feedback=null;render();
  }
  function onClick(event:Event){
    if(!panel||!(event.target instanceof Element))return;
    const action=event.target.closest<HTMLElement>("[data-lab-quiz-action]");
    if(action&&panel.contains(action)){
      event.preventDefault();const name=action.dataset.labQuizAction;
      if(name==="learn")stopQuiz();else if(name==="quiz"||name==="restart")beginQuiz();else if(name==="next")next();return;
    }
    if(mode==="quiz"&&awaiting){
      const point=event.target.closest<HTMLElement>("[data-model-point]");if(point?.dataset.modelPoint){answer(point.dataset.modelPoint);return;}
      const structure=event.target.closest<HTMLElement>("[data-atlas-structure]");if(structure?.dataset.atlasStructure){answer(structure.dataset.atlasStructure);return;}
    }
    const navigation=event.target.closest<HTMLElement>('[data-atlas-action="organ"],[data-atlas-action="topic"],[data-atlas-action="mode"]');if(navigation&&mode==="quiz")window.setTimeout(()=>stopQuiz(false),0);
  }
  function detectInfoSelection(){
    if(!panel||mode!=="quiz"||!awaiting)return;
    const label=cleanLabel(panel.querySelector("#atlasStructureInfo h4")?.textContent);if(!label)return;
    const hit=structures().find(row=>cleanLabel(row.label)===label);if(hit)answer(hit.id);
  }
  function scheduleSync(){
    if(syncQueued)return;syncQueued=true;queueMicrotask(()=>{syncQueued=false;if(!panel)return;ensureBox();maskModelPoints();if(mode==="learn")render();else setPanelState();});
  }
  let panelObserver:MutationObserver|null=null;
  function attach(next:HTMLElement){
    if(panel===next&&ensureBox())return;
    panelObserver?.disconnect();panel=next;box=null;mode="learn";questions=[];answers=[];feedback=null;awaiting=false;finished=false;
    panel.addEventListener("click",onClick,true);panelObserver=new MutationObserver(mutations=>{
      let outside=false,info=false;
      for(const mutation of mutations){const target=mutation.target;if(box&&box.contains(target))continue;outside=true;if(target instanceof Element&&(target.id==="atlasStructureInfo"||target.closest("#atlasStructureInfo")))info=true;}
      if(outside)scheduleSync();if(info)detectInfoSelection();
    });panelObserver.observe(panel,{childList:true,subtree:true});render();
  }
  function discover(){const next=document.querySelector<HTMLElement>('[data-atlas-version="3"]');if(next)attach(next);}
  const rootObserver=new MutationObserver(discover);rootObserver.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener("yks:navigation-after",discover);discover();
  const api:LabQuizRuntime={installed:true,version:VERSION,validate(){const issues:string[]=[];if(!rootObserver)issues.push("observer");if(panel&&panel.dataset.atlasVersion!=="3")issues.push("atlas-version");return issues;},refresh(){discover();render();},stop(){stopQuiz();panelObserver?.disconnect();rootObserver.disconnect();window.removeEventListener("yks:navigation-after",discover);}};
  window.__YKS_LAB_QUIZ_V43__=api;return api;
}
