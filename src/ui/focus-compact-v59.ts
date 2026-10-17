import "./focus-compact-v59.css";

/* Odak v60: real legacy fields are MOVED (never cloned) into a compact
 * disclosure toolbar. The stopwatch, Pomodoro, data and program logic stay put.
 * Keep the exported v59 installer signature for a safe rollback. */
export function installFocusCompactV59(setup:HTMLElement,plan:HTMLElement):boolean{
  if(setup.dataset.v60Compact==="ready")return true;
  const prep=setup.querySelector<HTMLElement>(".v46-focus-prep");
  const subjectStep=prep?.querySelector<HTMLElement>(".v46-subject-step");
  const secondary=prep?.querySelector<HTMLElement>(".v46-secondary-grid");
  const topicStep=secondary?.querySelector<HTMLElement>("#v46TopicStepTitle")?.closest<HTMLElement>(".v46-focus-step");
  const taskStep=secondary?.querySelector<HTMLElement>("#v46TaskStepTitle")?.closest<HTMLElement>(".v46-focus-step");
  const goals=setup.querySelector<HTMLElement>(".v29-goal-fields");
  const goalTextField=goals?.children.item(0) as HTMLElement|null;
  const goalQField=goals?.children.item(1) as HTMLElement|null;
  const setupLine=setup.querySelector<HTMLElement>("#v29SetupLine");
  const search=setup.querySelector<HTMLInputElement>("#v46FocusSubjectSearch");
  const subjectPicker=setup.querySelector<HTMLElement>("#pomoSubjPick");
  const selectedSummary=setup.querySelector<HTMLElement>("#v46SelectedSubject");
  const topicSelect=setup.querySelector<HTMLSelectElement>("#pomoTopic");
  const minimal=setup.querySelector<HTMLButtonElement>(".v29-setup-head button");
  if(!prep||!subjectStep||!topicStep||!taskStep||!goals||!goalTextField||!goalQField||
    !search||!subjectPicker||!selectedSummary||!topicSelect||!minimal)return false;

  const make=<K extends keyof HTMLElementTagNameMap>(tag:K,cls:string,text?:string):HTMLElementTagNameMap[K]=>{
    const el=document.createElement(tag);el.className=cls;if(text)el.textContent=text;return el;
  };
  const toolbar=make("div","v60-focus-toolbar");
  const head=make("div","v60-head");
  head.append(make("strong","v60-title","Odak oturumu"),minimal);
  const controls=make("div","v60-controls");
  const subjectButton=make("button","v60-choice v60-subject");
  const topicButton=make("button","v60-choice v60-topic");
  const subjectTitle=make("span","v60-choice-label","DERS · İSTEĞE BAĞLI");
  const subjectValue=make("strong","v60-choice-value","Genel Çalışma");
  const subjectIcon=make("span","v60-choice-arrow","⌄");
  subjectIcon.setAttribute("aria-hidden","true");
  subjectButton.append(subjectTitle,subjectValue,subjectIcon);
  const topicTitle=make("span","v60-choice-label","KONU");
  const topicValue=make("strong","v60-choice-value","Konu seç");
  const topicIcon=make("span","v60-choice-arrow","⌄");
  topicIcon.setAttribute("aria-hidden","true");
  topicButton.append(topicTitle,topicValue,topicIcon);
  const subjectMenu=make("div","v60-popup v60-subject-menu");
  const topicMenu=make("div","v60-popup v60-topic-menu");
  subjectMenu.id="v60SubjectMenu";topicMenu.id="v60TopicMenu";
  subjectMenu.hidden=true;topicMenu.hidden=true;
  for(const [button,menu] of [[subjectButton,subjectMenu],[topicButton,topicMenu]] as const){
    button.type="button";
    button.setAttribute("aria-expanded","false");
    button.setAttribute("aria-haspopup","true");
    button.setAttribute("aria-controls",menu.id);
  }
  subjectButton.setAttribute("aria-label","Ders seçmek veya değiştirmek için menüyü aç");
  topicButton.setAttribute("aria-label","Konu seçmek veya değiştirmek için menüyü aç");
  const goal=make("div","v60-goal");
  goalQField.classList.add("v60-goal-field");
  goal.append(goalQField);
  controls.append(subjectButton,topicButton,goal);
  subjectMenu.append(subjectStep);
  topicMenu.append(topicStep);
  toolbar.append(head,controls,subjectMenu,topicMenu);

  const extra=document.createElement("details");
  extra.className="v60-more";
  const summary=document.createElement("summary");
  summary.textContent="Diğer seçenekler";
  const body=make("div","v60-more-body");
  body.append(plan,taskStep,goalTextField);
  if(setupLine)body.append(setupLine);
  extra.append(summary,body);
  prep.insertAdjacentElement("beforebegin",toolbar);
  toolbar.insertAdjacentElement("afterend",extra);

  const syncLabels=():void=>{
    const chosen=selectedSummary.dataset.state==="ready"?
      subjectPicker.querySelector<HTMLElement>(".chip.on")?.textContent?.trim():"";
    subjectValue.textContent=chosen||"Genel Çalışma";
    subjectButton.dataset.selected=chosen?"true":"false";
    const selected=topicSelect.selectedOptions.item(0);
    const topic=topicSelect.value&&selected?selected.textContent?.trim()||"":"";
    topicValue.textContent=topic||"Konu seç";
    topicButton.dataset.selected=topic?"true":"false";
  };
  function close():void{
    subjectMenu.hidden=true;topicMenu.hidden=true;
    subjectButton.setAttribute("aria-expanded","false");
    topicButton.setAttribute("aria-expanded","false");
    toolbar.classList.remove("v60-open");
  }
  function open(which:"subject"|"topic"):void{
    const menu=which==="subject"?subjectMenu:topicMenu;
    const button=which==="subject"?subjectButton:topicButton;
    if(!menu.hidden){close();return;}
    close();
    menu.hidden=false;
    button.setAttribute("aria-expanded","true");
    toolbar.classList.add("v60-open");
    if(which==="subject")search!.focus({preventScroll:true});
  }
  subjectButton.addEventListener("click",()=>open("subject"));
  topicButton.addEventListener("click",()=>open("topic"));
  subjectMenu.addEventListener("click",event=>{
    if(!(event.target instanceof Element)||!event.target.closest(".chip,.v58-recent-chip"))return;
    window.setTimeout(()=>{syncLabels();close();},0);
  });
  topicMenu.addEventListener("click",event=>{
    if(!(event.target instanceof Element)||!event.target.closest(".v46-choice-card"))return;
    window.setTimeout(()=>{syncLabels();close();},0);
  });
  document.addEventListener("pointerdown",event=>{
    if(!(event.target instanceof Node)||toolbar.contains(event.target))return;
    if(!subjectMenu.hidden||!topicMenu.hidden)close();
  });
  toolbar.addEventListener("keydown",event=>{
    if(event.key!=="Escape")return;
    if(subjectMenu.hidden&&topicMenu.hidden)return;
    const target=subjectMenu.hidden?topicButton:subjectButton;
    close();target.focus();event.preventDefault();
  });
  const selectionObserver=new MutationObserver(syncLabels);
  selectionObserver.observe(selectedSummary,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["data-state"]});
  const optionsObserver=new MutationObserver(syncLabels);
  optionsObserver.observe(topicSelect,{childList:true,subtree:true});
  topicSelect.addEventListener("change",syncLabels);
  for(const id of ["segPomo","segStop"])document.getElementById(id)?.addEventListener("click",close);
  syncLabels();
  setup.classList.add("v60-compact");
  setup.dataset.v60Compact="ready";
  return true;
}
