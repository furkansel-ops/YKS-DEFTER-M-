interface ChemistryVisualsApi {mount(panel:HTMLElement|null):boolean;}
interface ChemistryVisualsBridge {ensure():boolean;close():void;}

declare global {interface Window {YKSChemistryVisualsBridgeV44?:ChemistryVisualsBridge;}}

export function installChemistryVisualsBridgeV44():ChemistryVisualsBridge {
  if(window.YKSChemistryVisualsBridgeV44)return window.YKSChemistryVisualsBridgeV44;
  let visuals:ChemistryVisualsApi|null=null,loading=false,open=false;
  const host=()=>document.getElementById("v320PanelPeriodic");
  const dock=()=>document.getElementById("v44ChemistryDock");
  const panel=()=>document.getElementById("v44ChemistryPanel");
  const button=()=>document.getElementById("v44ChemistryToggle") as HTMLButtonElement|null;
  const status=()=>document.getElementById("v44ChemistryStatus");

  function ensure():boolean {
    const target=host();if(!target)return false;
    if(!dock()){
      const section=document.createElement("section");section.id="v44ChemistryDock";section.className="v44-chemistry-dock";
      section.innerHTML='<div class="v44-chemistry-launch"><div><span>KİMYA GÖRSEL LABORATUVARI · v4.4</span><b>Molekül & Bağ Görselleri</b><p>Lewis çiftleri, bağ mertebesi, geometri, polarite ve YKS karıştırma noktalarını tek görselde incele.</p></div><button id="v44ChemistryToggle" type="button" data-v44-chemistry-toggle aria-expanded="false" aria-controls="v44ChemistryPanel">Molekül laboratuvarını aç</button></div><p id="v44ChemistryStatus" class="v44-chemistry-status" role="status" aria-live="polite"></p><div id="v44ChemistryPanel" hidden></div>';
      target.appendChild(section);
    }
    return true;
  }

  function setOpen(next:boolean){
    open=next;const target=panel(),control=button();if(target)target.hidden=!next;
    if(control){control.setAttribute("aria-expanded",String(next));control.textContent=next?"Molekül laboratuvarını kapat":"Molekül laboratuvarını aç";}
  }

  async function openVisuals(){
    if(!ensure())return;setOpen(true);const target=panel();if(!target||visuals||loading){visuals?.mount(target||null);return;}
    loading=true;const note=status();if(note)note.textContent="Molekül görselleri hazırlanıyor…";
    try{
      const module=await import("./chemistry-visuals-v44.ts");visuals=module.createChemistryVisualsV44();visuals.mount(target);
      if(note)note.textContent="9 temel yapı hazır. Görünüm seçimini değiştirebilirsin.";
    }catch{
      setOpen(false);if(note)note.textContent="Molekül görselleri açılamadı. Periyodik tabloyu kullanmaya devam edebilirsin.";
    }finally{loading=false;}
  }

  function close(){setOpen(false);}
  function onClick(event:Event){
    const target=event.target instanceof Element?event.target.closest<HTMLElement>("[data-v44-chemistry-toggle]"):null;
    if(!target)return;if(open){close();return;}void openVisuals();
  }
  document.addEventListener("click",onClick);
  const refresh=()=>{if(ensure()&&open)visuals?.mount(panel());};
  window.addEventListener("yks:navigation-after",refresh);document.addEventListener("yks:navigation-after",refresh);
  window.addEventListener("focus",()=>{if(open)refresh();});
  queueMicrotask(ensure);
  const api={ensure,close};window.YKSChemistryVisualsBridgeV44=api;return api;
}
