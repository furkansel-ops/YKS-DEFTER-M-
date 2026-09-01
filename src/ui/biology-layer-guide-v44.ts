import {buildBiologyLayerPlan} from "../domain/biology-layer-service.ts";
import {atlasEscape as esc} from "./biology-atlas-diagrams.ts";
import "./biology-layer-guide-v44.css";

type LayerMode="surface"|"internal"|"priority";
interface LayerGuideApi {refresh():void;dispose():void;}
const instances=new WeakMap<HTMLElement,LayerGuideApi>();

const activeOrgan=(panel:HTMLElement)=>panel.querySelector<HTMLElement>('.atlas-organ-item[aria-pressed="true"]')?.dataset.id||"";
const activeStructure=(panel:HTMLElement)=>panel.querySelector<HTMLElement>('.atlas-structure-list [data-atlas-structure][aria-pressed="true"]')?.dataset.atlasStructure||"";
const isOpen=(panel:HTMLElement)=>panel.querySelector<HTMLElement>('#atlasModelOpen')?.getAttribute("aria-pressed")==="true";
function modelView(panel:HTMLElement){panel.querySelector<HTMLButtonElement>('[data-atlas-action="organ-view"][data-id="model"]')?.click();}
function setOpen(panel:HTMLElement,wanted:boolean){const button=panel.querySelector<HTMLButtonElement>("#atlasModelOpen");if(button&&(button.getAttribute("aria-pressed")==="true")!==wanted)button.click();}
function choose(panel:HTMLElement,id:string){panel.querySelector<HTMLButtonElement>(`.atlas-structure-list [data-atlas-structure="${CSS.escape(id)}"]`)?.click();}

export function installBiologyLayerGuide(panel:HTMLElement):LayerGuideApi {
  const existing=instances.get(panel);if(existing){existing.refresh();return existing;}
  let disposed=false,lastOrgan="",mode:LayerMode="surface",priorityIndex=-1,queued=false,lastHost:HTMLElement|null=null,lastMarkup="";
  const render=()=>{
    if(disposed||!panel.isConnected)return;
    const organId=activeOrgan(panel),plan=buildBiologyLayerPlan(organId),tabs=panel.querySelector<HTMLElement>(".atlas-organ-tabs");
    if(!plan||!tabs){panel.querySelector(".atlas-layer-guide-v44")?.remove();return;}
    if(lastOrgan!==organId){lastOrgan=organId;priorityIndex=-1;mode=isOpen(panel)?"internal":"surface";}
    if(mode!=="priority")mode=isOpen(panel)?"internal":"surface";
    const current=activeStructure(panel);if(mode==="priority"&&current){const idx=plan.priority.indexOf(current);if(idx>=0)priorityIndex=idx;}
    let host=tabs.parentElement?.querySelector<HTMLElement>(":scope > .atlas-layer-guide-v44");
    const copy=mode==="surface"?`Dış yüzey · ${plan.surface.length} dış yapı`:mode==="internal"?`İç yapılar · ${plan.internal.length} iç yapı`:`YKS rotası · ${plan.priority.length} öncelikli yapı`;
    const markup=`<div class="atlas-layer-guide-v44__copy"><span>3B KATMAN GEZGİNİ</span><p>${esc(copy)} · ${esc(plan.route)}</p></div><div class="atlas-layer-guide-v44__controls" role="group" aria-label="3B organ katmanları"><button type="button" data-v44-layer="surface" aria-pressed="${mode==="surface"}">1 · Dış yüzey</button><button type="button" data-v44-layer="internal" aria-pressed="${mode==="internal"}">2 · İç yapılar</button><button type="button" data-v44-layer="priority" aria-pressed="${mode==="priority"}">3 · YKS rotası</button><button type="button" class="atlas-layer-guide-v44__next" data-v44-layer-next ${plan.priority.length?"":"disabled"}>Sonraki YKS yapısı →</button></div>`;
    if(!host){host=document.createElement("section");host.className="atlas-layer-guide-v44";host.setAttribute("aria-label","3B katman gezgini");tabs.insertAdjacentElement("afterend",host);}
    /* Katman gezgininin kendi childList mutasyonu gözlemciyi yeniden çalıştırır.
       Aynı çıktıyı tekrar yazmamak, sonsuz microtask zincirini ve UI kilidini önler. */
    if(host!==lastHost||markup!==lastMarkup){host.innerHTML=markup;lastHost=host;lastMarkup=markup;}
  };
  const schedule=()=>{if(queued||disposed)return;queued=true;queueMicrotask(()=>{queued=false;render();});};
  const click=(event:Event)=>{
    const target=event.target instanceof Element?event.target.closest<HTMLElement>("[data-v44-layer],[data-v44-layer-next]"):null;if(!target||!panel.contains(target))return;
    const plan=buildBiologyLayerPlan(activeOrgan(panel));if(!plan)return;
    if(target.hasAttribute("data-v44-layer-next")){
      if(!plan.priority.length)return;mode="priority";modelView(panel);setOpen(panel,true);priorityIndex=(priorityIndex+1)%plan.priority.length;choose(panel,plan.priority[priorityIndex]!);schedule();return;
    }
    const next=target.dataset.v44Layer as LayerMode|undefined;if(!next)return;mode=next;modelView(panel);
    if(next==="surface"){setOpen(panel,false);priorityIndex=-1;}
    else if(next==="internal")setOpen(panel,true);
    else {setOpen(panel,true);if(plan.priority.length){priorityIndex=Math.max(0,plan.priority.indexOf(activeStructure(panel)));choose(panel,plan.priority[priorityIndex]||plan.priority[0]!);}}
    schedule();
  };
  const observer=new MutationObserver(mutations=>{
    if(mutations.some(mutation=>!(mutation.target instanceof Element)||!mutation.target.closest(".atlas-layer-guide-v44")))schedule();
  });observer.observe(panel,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-pressed"]});panel.addEventListener("click",click);
  const api:LayerGuideApi={refresh:render,dispose(){if(disposed)return;disposed=true;observer.disconnect();panel.removeEventListener("click",click);panel.querySelector(".atlas-layer-guide-v44")?.remove();instances.delete(panel);}};instances.set(panel,api);schedule();return api;
}
