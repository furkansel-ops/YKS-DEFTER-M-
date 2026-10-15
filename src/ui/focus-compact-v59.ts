import "./focus-compact-v59.css";

/* v59: Small-screen presentation only. Existing pickers and save/timer logic
 * remain the sole owners of subjects, topics, goals and program links. */
export function installFocusCompactV59(setup:HTMLElement,plan:HTMLElement):boolean{
  if(setup.dataset.v59Compact==="ready")return true;
  const prep=setup.querySelector<HTMLElement>(".v46-focus-prep");
  const subjectStep=prep?.querySelector<HTMLElement>(".v46-subject-step");
  const stepHead=subjectStep?.querySelector<HTMLElement>(".v46-step-head");
  const secondary=prep?.querySelector<HTMLElement>(".v46-secondary-grid");
  const goals=setup.querySelector<HTMLElement>(".v29-goal-fields");
  const setupLine=setup.querySelector<HTMLElement>("#v29SetupLine");
  const search=setup.querySelector<HTMLInputElement>("#v46FocusSubjectSearch");
  const subjectPicker=setup.querySelector<HTMLElement>("#pomoSubjPick");
  const task=setup.querySelector<HTMLSelectElement>("#pomoTask");
  if(!prep||!subjectStep||!stepHead||!secondary||!goals||!search||!subjectPicker||!task)return false;

  const all=document.createElement("button");
  all.type="button";
  all.className="v59-all-subjects";
  all.textContent="Tüm dersler";
  all.setAttribute("aria-expanded","false");
  all.setAttribute("aria-controls","pomoSubjPick");
  stepHead.append(all);

  const planDetails=document.createElement("details");
  planDetails.className="v59-fold v59-plan-fold";
  const planToggle=document.createElement("summary");
  planToggle.textContent="Bugünkü programdan seç";
  planDetails.append(planToggle);
  subjectStep.insertAdjacentElement("afterend",planDetails);
  planDetails.append(plan);

  const extra=document.createElement("details");
  extra.className="v59-fold v59-extra-fold";
  const extraToggle=document.createElement("summary");
  extraToggle.textContent="Konu, görev ve hedef ekle";
  extra.append(extraToggle,secondary,goals);
  if(setupLine)extra.append(setupLine);
  planDetails.insertAdjacentElement("afterend",extra);

  function setExpanded(open:boolean):void{
    setup.classList.toggle("v59-subject-open",open);
    all.textContent=open?"Dersleri daralt":"Tüm dersler";
    all.setAttribute("aria-expanded",open?"true":"false");
    if(open){
      search.focus({preventScroll:true});
    }else{
      search.value="";
      search.dispatchEvent(new Event("input",{bubbles:true}));
    }
  }
  all.addEventListener("click",()=>setExpanded(!setup.classList.contains("v59-subject-open")));
  subjectStep.addEventListener("click",event=>{
    if(!(event.target instanceof Element))return;
    if(!event.target.closest("#pomoSubjPick .chip, .v58-recent-chip"))return;
    // Legacy subject selection may re-render its buttons synchronously.
    window.setTimeout(()=>setExpanded(false),0);
  });
  planDetails.addEventListener("click",event=>{
    if(!(event.target instanceof Element)||!event.target.closest(".v58-plan-item"))return;
    window.setTimeout(()=>{
      if(task.value&&plan.querySelector(".v58-plan-item.on"))planDetails.open=false;
    },0);
  });

  setup.classList.add("v59-compact");
  setup.dataset.v59Compact="ready";
  return true;
}
