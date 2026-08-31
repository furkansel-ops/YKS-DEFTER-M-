import {comparePeriodicElements,timelineNeighborhood,type PeriodicElementLite,type TimelineEventLite} from "../domain/lab-interaction-service-v44.ts";

if(typeof document!=="undefined")void import("./lab-interactions-v44.css").catch(()=>{});

type LabSource={elements?:readonly PeriodicElementLite[];timeline?:readonly TimelineEventLite[]};
const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]||char));
const source=():LabSource|undefined=>(window as Window&{YKSLearningLab?:LabSource}).YKSLearningLab;

export interface LabInteractionsV44Api {ensure():boolean;}

export function createLabInteractionsV44():LabInteractionsV44Api {
  let leftNumber=11,rightNumber=17,timelineId="";

  function elementByNumber(value:number){return source()?.elements?.find(item=>item.n===value);}
  function eventList(){return source()?.timeline?.filter(item=>item&&item.id&&item.title)||[];}

  function elementCard(element:PeriodicElementLite,group:string,block:string):string {
    return `<article class="v44-element-readout"><b>${esc(element.symbol)}</b><strong>${esc(element.name)}</strong><dl><div><dt>Atom no</dt><dd>${element.n}</dd></div><div><dt>Periyot</dt><dd>${element.period}</dd></div><div><dt>Grup</dt><dd>${esc(group)}</dd></div><div><dt>Blok</dt><dd>${esc(block)}</dd></div><div><dt>Sınıf</dt><dd>${esc(element.type)}</dd></div></dl></article>`;
  }

  function renderPeriodic(){
    const root=document.getElementById("v44PeriodicCompare");if(!root)return;
    const elements=source()?.elements||[];if(!elements.length){root.hidden=true;return;}root.hidden=false;
    if(!elementByNumber(leftNumber))leftNumber=elements[0]?.n||1;
    if(!elementByNumber(rightNumber))rightNumber=elements[1]?.n||leftNumber;
    const left=elementByNumber(leftNumber),right=elementByNumber(rightNumber);if(!left||!right)return;
    const options=elements.map(item=>`<option value="${item.n}">${item.n} · ${esc(item.symbol)} · ${esc(item.name)}</option>`).join("");
    const leftSelect=root.querySelector<HTMLSelectElement>("#v44ElementLeft"),rightSelect=root.querySelector<HTMLSelectElement>("#v44ElementRight");
    if(leftSelect&&leftSelect.dataset.options!==options){leftSelect.innerHTML=options;leftSelect.dataset.options=options;}if(rightSelect&&rightSelect.dataset.options!==options){rightSelect.innerHTML=options;rightSelect.dataset.options=options;}
    if(leftSelect)leftSelect.value=String(leftNumber);if(rightSelect)rightSelect.value=String(rightNumber);
    const comparison=comparePeriodicElements(left,right),grid=root.querySelector("#v44CompareGrid"),cue=root.querySelector("#v44CompareCue");
    if(grid)grid.innerHTML=elementCard(left,comparison.leftGroup,comparison.leftBlock)+'<div class="v44-vs">VS</div>'+elementCard(right,comparison.rightGroup,comparison.rightBlock);
    if(cue)cue.textContent=comparison.cue;
  }

  function ensurePeriodic():boolean {
    const host=document.getElementById("v320PanelPeriodic");if(!host)return false;
    let root=document.getElementById("v44PeriodicCompare");
    if(!root){
      root=document.createElement("section");root.id="v44PeriodicCompare";root.className="v44-periodic-compare";
      root.innerHTML='<header class="v44-interaction-head"><div><span>PERİYODİK TABLO ETKİLEŞİMİ · v4.4</span><h3>İki elementi yan yana oku</h3><p>Periyot, grup, blok ve sınıfı karşılaştır; genel YKS eğilimini konum üzerinden kur.</p></div></header><div class="v44-compare-controls"><label>Element A<select id="v44ElementLeft"></select></label><label>Element B<select id="v44ElementRight"></select></label></div><div id="v44CompareGrid" class="v44-compare-grid"></div><p id="v44CompareCue" class="v44-compare-cue"></p>';
      const anchor=document.getElementById("v4PeriodicStudy");if(anchor&&anchor.parentElement===host)anchor.insertAdjacentElement("afterend",root);else host.prepend(root);
    }
    renderPeriodic();return true;
  }

  function timelineCard(label:string,event:TimelineEventLite|null,current=false):string {
    if(!event)return `<article class="v44-chain-card"><small>${label}</small><b>—</b><p>Bu yönde başka olay yok.</p></article>`;
    return `<article class="v44-chain-card ${current?"is-current":""}"><small>${label}</small><b>${esc(event.title)}</b><span>${esc(event.year)} · ${esc(event.era)}</span><p>${esc(event.detail)}</p></article>`;
  }

  function renderTimeline(){
    const root=document.getElementById("v44TimelineChain");if(!root)return;const events=eventList();if(!events.length){root.hidden=true;return;}root.hidden=false;
    if(!events.some(item=>item.id===timelineId))timelineId=events[0]?.id||"";
    const options=events.map(item=>`<option value="${esc(item.id)}">${esc(item.year)} · ${esc(item.title)}</option>`).join(""),select=root.querySelector<HTMLSelectElement>("#v44TimelineSelect");
    if(select&&select.dataset.options!==options){select.innerHTML=options;select.dataset.options=options;}if(select)select.value=timelineId;
    const chain=timelineNeighborhood(events,timelineId),grid=root.querySelector("#v44TimelineGrid");if(grid)grid.innerHTML=timelineCard("ÖNCEKİ",chain.previous)+timelineCard(`${chain.index+1} / ${chain.total} · SEÇİLİ`,chain.current,true)+timelineCard("SONRAKİ",chain.next);
    const previous=root.querySelector<HTMLButtonElement>("#v44TimelinePrev"),next=root.querySelector<HTMLButtonElement>("#v44TimelineNext");if(previous)previous.disabled=!chain.previous;if(next)next.disabled=!chain.next;
  }

  function ensureTimeline():boolean {
    const host=document.getElementById("v320PanelTimeline");if(!host)return false;
    let root=document.getElementById("v44TimelineChain");
    if(!root){
      root=document.createElement("section");root.id="v44TimelineChain";root.className="v44-timeline-chain";
      root.innerHTML='<header class="v44-interaction-head"><div><span>KRONOLOJİ ETKİLEŞİMİ · v4.4</span><h3>Önceki → seçili → sonraki</h3><p>Bir olayı tek başına ezberlemek yerine tarih akışındaki komşularıyla birlikte gör.</p></div></header><div class="v44-timeline-picker"><label>Odak olay<select id="v44TimelineSelect"></select></label><button id="v44TimelinePrev" type="button" data-v44-timeline-step="-1">← Önceki</button><button id="v44TimelineNext" type="button" data-v44-timeline-step="1">Sonraki →</button></div><div id="v44TimelineGrid" class="v44-chain-grid"></div>';
      const timeline=document.getElementById("v320Timeline");if(timeline&&timeline.parentElement===host)host.insertBefore(root,timeline);else host.prepend(root);
    }
    renderTimeline();return true;
  }

  function onChange(event:Event){const target=event.target;if(!(target instanceof HTMLSelectElement))return;if(target.id==="v44ElementLeft"){leftNumber=Number(target.value);renderPeriodic();}else if(target.id==="v44ElementRight"){rightNumber=Number(target.value);renderPeriodic();}else if(target.id==="v44TimelineSelect"){timelineId=target.value;renderTimeline();}}
  function onClick(event:Event){const target=event.target instanceof Element?event.target.closest<HTMLButtonElement>("[data-v44-timeline-step]"):null;if(!target)return;const events=eventList(),chain=timelineNeighborhood(events,timelineId),step=Number(target.dataset.v44TimelineStep);const nextIndex=chain.index+(step<0?-1:1);const next=events[nextIndex];if(next){timelineId=next.id;renderTimeline();}}
  document.addEventListener("change",onChange);document.addEventListener("click",onClick);
  function ensure(){const periodic=ensurePeriodic(),timeline=ensureTimeline();return periodic||timeline;}
  return {ensure};
}
