import {CHEMISTRY_STRUCTURES,type ChemistryStructureId} from "../data/chemistry-molecules.ts";
import {buildChemistryVisual} from "../domain/chemistry-visual-service.ts";

if(typeof document!=="undefined")void import("./chemistry-visuals-v44.css").catch(()=>{});

type ChemistryView="shape"|"lewis"|"exam";
export interface ChemistryVisualsApi {mount(panel:HTMLElement|null):boolean;}
const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]||char));
const sx=(value:number)=>45+value*4.1,sy=(value:number)=>32+value*2.85;

export function createChemistryVisualsV44():ChemistryVisualsApi {
  let panel:HTMLElement|null=null,selected:ChemistryStructureId="water",view:ChemistryView="shape",signature="";const bound=new WeakSet<HTMLElement>();
  const find=<T extends HTMLElement>(id:string)=>panel?.querySelector<T>("#"+id)||null;
  function moleculeSvg():string {
    const plan=buildChemistryVisual(selected);if(!plan)return "";const showLewis=view==="lewis",structure=plan.structure;
    const bonds=plan.bondLines.map(line=>`<line x1="${sx(line.x1)}" y1="${sy(line.y1)}" x2="${sx(line.x2)}" y2="${sy(line.y2)}" class="chem-bond ${line.ionic?"is-ionic":""}"/>`).join("");
    const atoms=structure.atoms.map(atom=>`<g class="chem-atom chem-${atom.symbol.toLowerCase()}" transform="translate(${sx(atom.x)} ${sy(atom.y)})"><circle r="${atom.symbol==="H"?20:27}"/><text text-anchor="middle" dominant-baseline="central">${esc(atom.symbol)}</text>${atom.charge?`<text class="chem-charge" x="22" y="-20">${atom.charge>0?"+":"−"}</text>`:""}</g>`).join("");
    const pairs=showLewis?structure.atoms.flatMap(atom=>(plan.lonePairs[atom.id]||[]).map(pair=>`<g class="chem-pair"><circle cx="${sx(pair.x1)}" cy="${sy(pair.y1)}" r="3"/><circle cx="${sx(pair.x2)}" cy="${sy(pair.y2)}" r="3"/></g>`)).join(""):"";
    return `<svg viewBox="0 0 500 350" role="img" aria-label="${esc(structure.name)} ${showLewis?"Lewis elektron çiftleri":"bağ ve geometri"} görseli"><g class="chem-grid"><path d="M30 175H470M250 20V330"/></g>${bonds}${atoms}${pairs}<text class="chem-formula" x="250" y="325" text-anchor="middle">${esc(structure.formula)} · ${esc(structure.geometry)}</text></svg>`;
  }
  function render(){
    if(!panel)return;const plan=buildChemistryVisual(selected);if(!plan)return;const s=plan.structure,next=`${selected}|${view}`;if(signature===next)return;signature=next;
    const list=find("chemStructures");if(list)list.innerHTML=CHEMISTRY_STRUCTURES.map(item=>`<button type="button" data-chem-structure="${item.id}" aria-pressed="${item.id===selected}"><b>${esc(item.formula)}</b><span>${esc(item.name)}</span></button>`).join("");
    for(const mode of ["shape","lewis","exam"] as const)find(`chemView-${mode}`)?.setAttribute("aria-pressed",String(view===mode));
    const stage=find("chemStage");if(stage)stage.innerHTML=moleculeSvg();
    const title=find("chemTitle");if(title)title.textContent=`${s.formula} · ${s.name}`;const kind=find("chemKind");if(kind)kind.textContent=s.kind==="ionic"?"İyonik yapı / formül birimi":"Molekül";
    const geometry=find("chemGeometry");if(geometry)geometry.textContent=s.geometry;const polarity=find("chemPolarity");if(polarity)polarity.textContent=s.polarity;const bond=find("chemBondFocus");if(bond)bond.textContent=s.bondFocus;
    const exam=find("chemExam");if(exam)exam.textContent=s.exam;const trap=find("chemTrap");if(trap)trap.textContent=s.trap;
    const focus=find("chemExamPanel");if(focus)focus.hidden=view!=="exam";const lewis=find("chemLewisHint");if(lewis)lewis.hidden=view!=="lewis";
  }
  function onClick(event:Event){const target=event.target instanceof Element?event.target.closest<HTMLElement>("[data-chem-structure],[data-chem-view]"):null;if(!target||!panel?.contains(target))return;if(target.dataset.chemStructure){if(CHEMISTRY_STRUCTURES.some(item=>item.id===target.dataset.chemStructure)){selected=target.dataset.chemStructure as ChemistryStructureId;signature="";render();}return;}const mode=target.dataset.chemView;if(mode==="shape"||mode==="lewis"||mode==="exam"){view=mode;signature="";render();}}
  function mount(target:HTMLElement|null){if(!target)return false;const changed=panel!==target||target.dataset.chemistryVisualVersion!=="44";panel=target;if(changed){target.dataset.chemistryVisualVersion="44";target.innerHTML=`<header class="chem-head"><div><span>KİMYA GÖRSEL LABORATUVARI · v4.4</span><h3>Molekülü gör · bağı ayır · tuzağa düşme</h3><p>Bağ mertebesi, Lewis elektron çiftleri, geometri ve polariteyi aynı yapı üzerinde karşılaştır.</p></div></header><div class="chem-layout"><nav id="chemStructures" class="chem-structures" aria-label="Molekül ve iyonik yapı seçimi"></nav><section class="chem-workbench"><div class="chem-view-tabs" role="group" aria-label="Kimya görsel görünümü"><button id="chemView-shape" type="button" data-chem-view="shape">Bağ + şekil</button><button id="chemView-lewis" type="button" data-chem-view="lewis">Lewis çiftleri</button><button id="chemView-exam" type="button" data-chem-view="exam">YKS odağı</button></div><div id="chemStage" class="chem-stage"></div><p id="chemLewisHint" class="chem-lewis-hint" hidden>Noktalar ortaklanmamış elektron çiftlerini temsil eder. Çizim öğreticidir; gerçek orbital şekli değildir.</p></section><aside class="chem-info"><span id="chemKind"></span><h4 id="chemTitle"></h4><dl><div><dt>Geometri</dt><dd id="chemGeometry"></dd></div><div><dt>Polarite</dt><dd id="chemPolarity"></dd></div><div><dt>Bağ odağı</dt><dd id="chemBondFocus"></dd></div></dl><div id="chemExamPanel" class="chem-exam" hidden><b>YKS’de buradan ne sorulur?</b><p id="chemExam"></p><b>Karıştırma</b><p id="chemTrap"></p></div></aside></div><p class="chem-note">Özgün öğretici görsellerdir; ölçekli moleküler model değildir ve çalışma verisine yazmaz.</p>`;if(!bound.has(target)){bound.add(target);target.addEventListener("click",onClick);}signature="";}render();return true;}
  return {mount};
}
