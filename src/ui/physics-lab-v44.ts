import {PHYSICS_SIMULATIONS,evaluatePhysicsSimulation,getPhysicsSimulation,type PhysicsSimulationId} from "../domain/physics-simulation-service.ts";

if(typeof document!=="undefined")void import("./physics-lab-v44.css").catch(()=>{});

interface PhysicsLabApi {mount(panel:HTMLElement|null):boolean;suspend():void;}
const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]||char));
const fmt=(value:number)=>Number.isFinite(value)?String(Math.abs(value)>=1000?Math.round(value):Number(value.toFixed(2))):"—";
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

export function createPhysicsLabV44():PhysicsLabApi {
  let panel:HTMLElement|null=null,selected:PhysicsSimulationId="motion",signature="";
  const values:Record<string,number>={};const bound=new WeakSet<HTMLElement>();
  const definition=()=>getPhysicsSimulation(selected)!;
  const resetValues=()=>{for(const spec of definition().inputs)values[spec.key]=spec.initial;};
  resetValues();
  const find=<T extends HTMLElement>(id:string)=>panel?.querySelector<T>("#"+id)||null;
  function visual(result:NonNullable<ReturnType<typeof evaluatePhysicsSimulation>>):string {
    const v=result.values;
    if(result.id==="motion"){
      const x=clamp(250+(v.dx||0)*5,45,555),dir=(v.v||0)>=0?1:-1;
      return `<svg viewBox="0 0 600 220" role="img" aria-label="Hareket deney görünümü"><path d="M35 165H565" class="phy-line"/><path d="M70 140V188M530 140V188" class="phy-mark"/><circle cx="${x}" cy="145" r="25" class="phy-object"/><path d="M${x} 105h${dir*70}" class="phy-vector"/><text x="300" y="45">v = ${fmt(v.v)} m/s · Δx = ${fmt(v.dx)} m · F = ${fmt(v.force)} N</text></svg>`;
    }
    if(result.id==="energy-momentum"){
      const k=clamp(Math.abs(v.kinetic||0)/400,0,1),p=clamp(Math.abs(v.momentum||0)/150,0,1),i=clamp(Math.abs(v.impulse||0)/150,0,1);
      return `<svg viewBox="0 0 600 220" role="img" aria-label="Enerji momentum deney görünümü"><circle cx="110" cy="115" r="38" class="phy-object"/><path d="M155 115H260" class="phy-vector"/><g class="phy-bars"><rect x="320" y="${175-120*k}" width="55" height="${120*k}"/><rect x="405" y="${175-120*p}" width="55" height="${120*p}"/><rect x="490" y="${175-120*i}" width="55" height="${120*i}"/></g><text x="347" y="198">K</text><text x="432" y="198">p</text><text x="517" y="198">I</text></svg>`;
    }
    if(result.id==="circuits"){
      return `<svg viewBox="0 0 600 220" role="img" aria-label="Seri ve paralel devre karşılaştırması"><path d="M45 65H155V35H255V95H155V65M255 65H300" class="phy-circuit"/><rect x="168" y="24" width="72" height="22" rx="7"/><path d="M320 35H545V185H320Z" class="phy-circuit"/><rect x="375" y="24" width="72" height="22" rx="7"/><rect x="375" y="174" width="72" height="22" rx="7"/><text x="75" y="125">Seri: ${fmt(v.series)} Ω</text><text x="355" y="125">Paralel: ${fmt(v.parallel)} Ω</text><text x="75" y="150">I = ${fmt(v.iSeries)} A</text><text x="355" y="150">I = ${fmt(v.iParallel)} A</text></svg>`;
    }
    if(result.id==="fields"){
      const negative=result.state==="negative-charge";
      return `<svg viewBox="0 0 600 220" role="img" aria-label="Elektrik ve manyetik alan görünümü"><defs><marker id="phyArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z"/></marker></defs><circle cx="300" cy="110" r="34" class="phy-object"/><text x="300" y="116" text-anchor="middle">${negative?"−":"+"}</text><path d="M95 110H250" class="phy-vector"/><path d="M350 110H505" class="phy-vector"/><text x="95" y="75">E</text><text x="390" y="75">Fe = ${fmt(v.electric)}</text><text x="390" y="165">Fm = ${fmt(v.magnetic)}</text></svg>`;
    }
    if(result.id==="optics"){
      const refl=clamp(v.reflection||0,0,80),refr=v.refraction<0?80:clamp(v.refraction||0,0,80),toX=(angle:number,sign:number)=>300+sign*Math.sin(angle*Math.PI/180)*155;
      return `<svg viewBox="0 0 600 260" role="img" aria-label="Yansıma kırılma ve mercek görünümü"><path d="M45 130H555" class="phy-line"/><path d="M300 25V235" class="phy-normal"/><path d="M${toX(refl,-1)} 25L300 130L${toX(refl,1)} 25" class="phy-ray"/><path d="M300 130L${toX(refr,1)} 235" class="phy-ray ${result.state==="total-internal-reflection"?"is-hidden":""}"/><text x="40" y="35">i = r = ${fmt(v.reflection)}°</text><text x="365" y="225">${result.state==="total-internal-reflection"?"Tam yansıma":`kırılma ≈ ${fmt(v.refraction)}°`}</text></svg>`;
    }
    if(result.id==="waves"){
      const lambda=Math.max(.2,v.wavelength||1),points:Array<string>=[];for(let px=0;px<=540;px+=12){const y=110-Math.sin(px/lambda*.11)*42;points.push(`${30+px},${y}`);}
      return `<svg viewBox="0 0 600 220" role="img" aria-label="Dalga ve girişim görünümü"><polyline points="${points.join(" ")}" class="phy-wave"/><path d="M60 175H540" class="phy-line"/><text x="60" y="45">λ = ${fmt(v.wavelength)} m</text><text x="350" y="45">${result.state==="constructive"?"Yapıcı girişim":result.state==="destructive"?"Söndürücü girişim":"Kısmi girişim"}</text></svg>`;
    }
    if(result.id==="matter"){
      const h=clamp((v.pressure||0)/150000,0,1),b=clamp((v.buoyancy||0)/800,0,1);
      return `<svg viewBox="0 0 600 240" role="img" aria-label="Isı basınç ve kaldırma görünümü"><path d="M70 45V205H260V45" class="phy-vessel"/><rect x="71" y="${85-25*h}" width="188" height="${120+25*h}" class="phy-water"/><rect x="132" y="95" width="66" height="70" rx="8" class="phy-object"/><path d="M165 155V${155-85*b}" class="phy-vector"/><g class="phy-thermo"><rect x="390" y="45" width="34" height="150" rx="17"/><rect x="399" y="${185-clamp((v.heat||0)/4000000,0,1)*125}" width="16" height="${clamp((v.heat||0)/4000000,0,1)*125}" rx="8"/></g><text x="310" y="75">p = ${fmt(v.pressure)} Pa</text><text x="310" y="105">Fk = ${fmt(v.buoyancy)} N</text><text x="310" y="135">Q = ${fmt(v.heat)} J</text></svg>`;
    }
    const emitted=result.state==="emission";
    return `<svg viewBox="0 0 600 220" role="img" aria-label="Fotoelektrik olay görünümü"><rect x="405" y="35" width="28" height="150" rx="8" class="phy-plate"/><path d="M70 60L380 95M70 105L380 110M70 150L380 125" class="phy-photons"/>${emitted?'<circle cx="475" cy="80" r="8" class="phy-electron"/><circle cx="515" cy="120" r="8" class="phy-electron"/><circle cx="470" cy="155" r="8" class="phy-electron"/>':""}<text x="65" y="35">f / f₀ deneyi</text><text x="455" y="195">${emitted?"Elektron çıkışı var":"Eşik altında"}</text></svg>`;
  }
  function render() {
    if(!panel)return;const sim=definition(),result=evaluatePhysicsSimulation(selected,values);if(!result)return;
    const next=JSON.stringify([selected,values]);if(signature===next)return;signature=next;
    const tabs=find("phyLabTabs");if(tabs)tabs.innerHTML=PHYSICS_SIMULATIONS.map(item=>`<button type="button" data-phy-sim="${item.id}" aria-pressed="${item.id===selected}"><span>${esc(item.eyebrow)}</span>${esc(item.title)}</button>`).join("");
    const title=find("phyLabTitle");if(title)title.textContent=sim.title;const desc=find("phyLabDesc");if(desc)desc.textContent=sim.description;const formula=find("phyLabFormula");if(formula)formula.textContent=sim.formula;
    const controls=find("phyLabControls");if(controls)controls.innerHTML=sim.inputs.map(spec=>`<label><span>${esc(spec.label)} <output for="phy-${spec.key}">${fmt(values[spec.key]??spec.initial)} ${esc(spec.unit)}</output></span><input id="phy-${spec.key}" type="range" data-phy-input="${spec.key}" min="${spec.min}" max="${spec.max}" step="${spec.step}" value="${values[spec.key]??spec.initial}"></label>`).join("");
    const stage=find("phyLabStage");if(stage)stage.innerHTML=visual(result);const summary=find("phyLabSummary");if(summary)summary.textContent=result.summary;const cue=find("phyLabCue");if(cue)cue.textContent=result.cue;
    const linked=find("phyLabLinked");if(linked)linked.textContent=`Bağlı kartlar: ${sim.cardIds.length} · ${sim.cardIds.join(" · ")}`;
  }
  function choose(id:string){const sim=getPhysicsSimulation(id);if(!sim)return;selected=sim.id;for(const key of Object.keys(values))delete values[key];resetValues();signature="";render();}
  function onInput(event:Event){const target=event.target;if(!(target instanceof HTMLInputElement)||!target.dataset.phyInput)return;const spec=definition().inputs.find(item=>item.key===target.dataset.phyInput);if(!spec)return;values[spec.key]=clamp(Number(target.value),spec.min,spec.max);signature="";render();}
  function onClick(event:Event){const target=event.target instanceof Element?event.target.closest<HTMLElement>("[data-phy-sim],[data-phy-action]"):null;if(!target||!panel?.contains(target))return;if(target.dataset.phySim){choose(target.dataset.phySim);return;}if(target.dataset.phyAction==="reset"){for(const key of Object.keys(values))delete values[key];resetValues();signature="";render();}}
  function mount(target:HTMLElement|null){if(!target)return false;panel=target;if(target.dataset.physicsLabVersion!=="44"){target.dataset.physicsLabVersion="44";target.innerHTML=`<header class="phy-lab-head"><div><span>FİZİK SİMÜLASYONLARI · v4.4</span><h3>Değiştir · gözle · bağı kur</h3><p>Kaydırıcıları değiştir; formülün sonucu ve görsel aynı anda güncellensin.</p></div><button type="button" data-phy-action="reset">Deneyi sıfırla</button></header><nav id="phyLabTabs" class="phy-lab-tabs" aria-label="Fizik deneyleri"></nav><section class="phy-lab-workbench"><div><div class="phy-lab-copy"><span id="phyLabLinked"></span><h4 id="phyLabTitle"></h4><p id="phyLabDesc"></p><code id="phyLabFormula"></code></div><div id="phyLabControls" class="phy-lab-controls"></div></div><div class="phy-lab-stage-wrap"><div id="phyLabStage" class="phy-lab-stage"></div><p id="phyLabSummary" class="phy-lab-summary" role="status" aria-live="polite"></p><aside class="phy-lab-cue"><b>YKS’de dikkat</b><p id="phyLabCue"></p></aside></div></section><p class="phy-lab-note">Öğretici, ölçekli olmayan simülasyonlardır. Kart ilerlemesini, Konular durumunu veya Programı değiştirmez.</p>`;if(!bound.has(target)){bound.add(target);target.addEventListener("click",onClick);target.addEventListener("input",onInput);}}
    signature="";render();return true;
  }
  function suspend(){/* Sürekli renderer yok; sekme gizlenince durdurulacak iş yok. */}
  return {mount,suspend};
}
