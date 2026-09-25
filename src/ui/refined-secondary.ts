/** Group existing live controls without copying them or owning any student data. */
function disclosure(parent:HTMLElement,id:string,label:string){
  const existing=document.getElementById(id) as HTMLDetailsElement|null;if(existing)return existing;
  const section=document.createElement("details");section.id=id;section.className="rb-secondary-details";
  const summary=document.createElement("summary");summary.textContent=label;section.append(summary);parent.append(section);return section;
}

export function installRefinedSecondary(){
  const focus=document.getElementById("pomo");
  if(focus){
    const title=document.createElement("h1");title.className="rb-secondary-title";title.textContent="Odaklan";
    focus.querySelector(".rb-back")?.insertAdjacentElement("afterend",title);
    const details=disclosure(focus,"refinedFocusDetails","Oturumlarım, egzersizler ve odak ayarları");
    for(const node of Array.from(focus.children)){
      if(node instanceof HTMLElement&&!node.matches(".rb-back,.rb-secondary-title,.seg,.desktop-focus-workspace,#refinedFocusDetails"))details.append(node);
    }
  }
  function progress(){
    const root=document.getElementById("progress");if(!root)return;
    const details=disclosure(root,"refinedProgressDetails","Ayrıntılı ilerleme raporları");
    for(const node of Array.from(root.children)){
      if(node instanceof HTMLElement&&!node.matches(".rb-back,#v43AnalysisCenter,#refinedProgressDetails"))details.append(node);
    }
  }
  let paragraphOpen=false;
  function paragraph(){
    const root=document.getElementById("paragraphProblemTracker");if(!root)return;
    const details=disclosure(root,"refinedParagraphDetails","Eğilimler ve geçmiş çalışmalarım");
    if(!details.dataset.bound){details.dataset.bound="true";details.open=paragraphOpen;details.addEventListener("toggle",()=>{paragraphOpen=details.open;});}
    for(const node of Array.from(root.children)){
      if(node instanceof HTMLElement&&!node.matches(".pp-entry-card,.pp-kpis,.pp-kind-grid,#refinedParagraphDetails"))details.append(node);
    }
  }
  const tracker=document.getElementById("paragraphProblemTracker");
  if(tracker){
    const observer=new MutationObserver(()=>{observer.disconnect();paragraph();observe();});
    const observe=()=>observer.observe(tracker,{childList:true});paragraph();observe();
  }
  window.addEventListener("yks:navigation-after",event=>{const to=(event as CustomEvent<{to?:string}>).detail?.to;if(to==="progress")queueMicrotask(progress);if(to==="pp")queueMicrotask(paragraph);});
  window.addEventListener("yks:screen-render-after",event=>{if((event as CustomEvent<{screen?:string}>).detail?.screen==="progress")queueMicrotask(progress);});
  progress();paragraph();
}
