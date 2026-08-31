import {buildBiologyYksQuestionFocus} from "../domain/biology-yks-question-service.ts";
import {atlasEscape as esc} from "./biology-atlas-diagrams.ts";
import "./biology-yks-question-v44.css";

interface BiologyYksQuestionEnhancer {refresh(): void; dispose(): void;}
const instances=new WeakMap<HTMLElement,BiologyYksQuestionEnhancer>();

function selectedOrgan(panel:HTMLElement):string {
  return panel.querySelector<HTMLElement>('.atlas-organ-item[aria-pressed="true"]')?.dataset.id||"";
}
function selectedStructure(panel:HTMLElement):string {
  return panel.querySelector<HTMLElement>('.atlas-structure-list [data-atlas-structure][aria-pressed="true"]')?.dataset.atlasStructure||"";
}
function targetInfo(panel:HTMLElement):HTMLElement|null {
  return panel.querySelector<HTMLElement>("#atlasStructureInfo")||panel.querySelector<HTMLElement>(".atlas-organ-workbench .atlas-organ-explanation");
}
function cardMarkup(organId:string,structureId:string):string {
  const focus=buildBiologyYksQuestionFocus(organId,structureId);if(!focus)return "";
  return `<section class="atlas-yks-question-v44" data-priority="${focus.priority}" data-yks-question-key="${esc(organId+":"+structureId)}"><div class="atlas-yks-question-v44__head"><span>YKS'DE BURADAN NE SORULUR?</span><b>${focus.priority==="high"?"Yüksek öncelik":"Destek yapı"}</b></div><h5>${esc(focus.label)}</h5><div class="atlas-yks-question-v44__grid"><div class="atlas-yks-question-v44__item"><strong>Temel kazanım</strong><p>${esc(focus.core)}</p></div><div class="atlas-yks-question-v44__item"><strong>Nasıl soruya dönüşür?</strong><p>${esc(focus.questionAngle)}</p></div><div class="atlas-yks-question-v44__item atlas-yks-question-v44__item--wide"><strong>İşleyişi kur</strong><p>${esc(focus.mechanism)}</p></div><div class="atlas-yks-question-v44__item"><strong>En kritik ayrım</strong><p>${esc(focus.distinction)}</p></div><div class="atlas-yks-question-v44__item"><strong>Bağlantı rotası</strong><p>${esc(focus.route)}</p></div></div><p class="atlas-yks-question-v44__note">${esc(focus.disclaimer)}</p></section>`;
}

/** Adds a read-only YKS question-focus card after Atlas structure selection. */
export function installBiologyYksQuestionFocus(panel:HTMLElement):BiologyYksQuestionEnhancer {
  const current=instances.get(panel);if(current){current.refresh();return current;}
  let disposed=false,lastKey="";
  const refresh=()=>{
    if(disposed||!panel.isConnected)return;
    const organId=selectedOrgan(panel),structureId=selectedStructure(panel),target=targetInfo(panel);
    if(!target||!organId||!structureId){lastKey="";target?.querySelector(".atlas-yks-question-v44")?.remove();return;}
    const key=organId+":"+structureId,existing=target.querySelector<HTMLElement>(".atlas-yks-question-v44");
    if(existing?.dataset.yksQuestionKey===key&&lastKey===key)return;
    existing?.remove();const html=cardMarkup(organId,structureId);if(!html)return;
    target.insertAdjacentHTML("beforeend",html);lastKey=key;
  };
  let queued=false;
  const schedule=()=>{if(queued||disposed)return;queued=true;queueMicrotask(()=>{queued=false;refresh();});};
  const observer=new MutationObserver(schedule);
  observer.observe(panel,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-pressed"]});
  panel.addEventListener("click",schedule);
  const api:BiologyYksQuestionEnhancer={refresh,dispose(){if(disposed)return;disposed=true;observer.disconnect();panel.removeEventListener("click",schedule);instances.delete(panel);}};
  instances.set(panel,api);schedule();return api;
}
