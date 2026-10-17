import "./focus-session-guard-v43.css";

type FocusStartMode="pomo"|"sw";
const GENERAL_SUBJECT="Genel Çalışma";
type LegacyFn=(...args:any[])=>any;
type ChoiceKind="topic"|"task";

export interface FocusSessionGuardV43Api{
  installed:boolean;
  validate():string[];
}

declare global{
  interface Window{
    __YKS_FOCUS_SESSION_GUARD_V43__?:FocusSessionGuardV43Api;
  }
}

function legacy(name:string):LegacyFn|undefined{
  const value=(window as unknown as Record<string,unknown>)[name];
  return typeof value==="function"?value as LegacyFn:undefined;
}

function cardFor(mode:FocusStartMode):HTMLElement|null{
  return document.getElementById(mode==="pomo"?"focusCard":"swCard");
}

function needsPreparation(mode:FocusStartMode):boolean{
  const card=cardFor(mode);
  if(!card)return false;
  if((card.getAttribute("data-run")||"idle")!=="idle")return false;
  if(mode==="pomo"&&(card.getAttribute("data-phase")||"work")!=="work")return false;
  return true;
}

function hasLiveFocusSession():boolean{
  return (["pomo","sw"] as FocusStartMode[]).some(mode=>{
    const card=cardFor(mode);
    return !!card&&(card.getAttribute("data-run")||"idle")!=="idle";
  });
}

function setupCard():HTMLElement|null{
  return document.querySelector<HTMLElement>(".v29-session-setup");
}

function normalizeSubject(value:string):string{
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}

function currentFocusMode():FocusStartMode{
  return document.getElementById("segStop")?.classList.contains("on")?"sw":"pomo";
}

function buildPreparationUi():boolean{
  const setup=setupCard();
  const subjectPicker=document.getElementById("pomoSubjPick");
  const topic=document.getElementById("pomoTopic");
  const task=document.getElementById("pomoTask");
  if(!setup||!subjectPicker||!topic||!task)return false;
  if(setup.dataset.v46FocusPicker==="ready")return true;

  const legacySubjectLabel=subjectPicker.previousElementSibling;
  if(legacySubjectLabel instanceof HTMLElement&&legacySubjectLabel.classList.contains("eyebrow"))legacySubjectLabel.classList.add("v46-focus-legacy-label");

  const shell=document.createElement("div");
  shell.className="v46-focus-prep";
  shell.dataset.v46FocusPrep="ready";
  shell.innerHTML=`
    <div class="v46-focus-prep-head">
      <div class="v46-focus-prep-copy">
        <span class="v46-focus-kicker">İsteğe bağlı hazırlık</span>
        <h3 id="v46FocusPrepTitle">Çalışma ayrıntıları</h3>
        <p id="v46FocusPrepHint">Ders seçmeden doğrudan başlayabilirsin; süren Genel Çalışma olarak kaydedilir.</p>
      </div>
      <span class="v46-focus-mode" id="v46FocusModeBadge">Sayaç</span>
    </div>
    <section class="v46-focus-step v46-subject-step" aria-labelledby="v46SubjectStepTitle">
      <div class="v46-step-head">
        <span class="v46-step-no" aria-hidden="true">1</span>
        <div><b id="v46SubjectStepTitle">Ders seç (isteğe bağlı)</b><small>Ders seçmeden de çalışmaya başlayabilirsin.</small></div>
      </div>
      <label class="v46-subject-search" for="v46FocusSubjectSearch">
        <span aria-hidden="true">⌕</span>
        <input id="v46FocusSubjectSearch" type="search" placeholder="Ders ara…" autocomplete="off" aria-label="Derslerde ara">
      </label>
      <div class="v46-subject-slot" data-v46-subject-slot></div>
      <div class="v46-selected-subject" id="v46SelectedSubject" role="status" aria-live="polite">Ders seçilmedi · Genel Çalışma olarak kaydedilir</div>
    </section>
    <div class="v46-secondary-grid">
      <section class="v46-focus-step" aria-labelledby="v46TopicStepTitle">
        <div class="v46-step-head">
          <span class="v46-step-no" aria-hidden="true">2</span>
          <div><b id="v46TopicStepTitle">Konu seç</b><small>Dersine ait konulardan birini seçebilirsin.</small></div>
        </div>
        <div class="v46-select-slot" data-v46-topic-slot></div>
        <div class="v46-choice-grid" id="v46TopicChoices" data-kind="topic" role="group" aria-label="Konu seçenekleri"></div>
      </section>
      <section class="v46-focus-step" aria-labelledby="v46TaskStepTitle">
        <div class="v46-step-head">
          <span class="v46-step-no" aria-hidden="true">3</span>
          <div><b id="v46TaskStepTitle">Çalışma türü</b><small>İstersen oturumu bugünkü planındaki bir çalışmaya bağla.</small></div>
        </div>
        <div class="v46-select-slot" data-v46-task-slot></div>
        <div class="v46-choice-grid" id="v46TaskChoices" data-kind="task" role="group" aria-label="Çalışma türü seçenekleri"></div>
      </section>
    </div>`;

  if(legacySubjectLabel)legacySubjectLabel.insertAdjacentElement("afterend",shell);
  else{
    const head=setup.querySelector(".v29-setup-head");
    if(head)head.insertAdjacentElement("afterend",shell);
    else setup.prepend(shell);
  }
  shell.querySelector<HTMLElement>("[data-v46-subject-slot]")?.append(subjectPicker);
  shell.querySelector<HTMLElement>("[data-v46-topic-slot]")?.append(topic);
  shell.querySelector<HTMLElement>("[data-v46-task-slot]")?.append(task);
  [topic,task].forEach(select=>{
    select.setAttribute("aria-hidden","true");
    (select as HTMLSelectElement).tabIndex=-1;
  });
  setup.dataset.v46FocusPicker="ready";
  return true;
}

export function installFocusSessionGuardV43():FocusSessionGuardV43Api{
  if(window.__YKS_FOCUS_SESSION_GUARD_V43__)return window.__YKS_FOCUS_SESSION_GUARD_V43__;

  const originalTogglePomo=legacy("togglePomo"),originalSwToggle=legacy("swToggle"),originalSetSubject=legacy("setPomoSubject"),originalRecordSession=legacy("recordSession"),originalSwRecord=legacy("swRecord");
  let subjectConfirmed=false;
  let subjectObserver:MutationObserver|null=null,topicObserver:MutationObserver|null=null,taskObserver:MutationObserver|null=null;

  buildPreparationUi();

  const subjectPicker=()=>document.getElementById("pomoSubjPick");
  const searchInput=()=>document.getElementById("v46FocusSubjectSearch") as HTMLInputElement|null;
  const selectedSummary=()=>document.getElementById("v46SelectedSubject");
  const topicSelect=()=>document.getElementById("pomoTopic") as HTMLSelectElement|null;
  const taskSelect=()=>document.getElementById("pomoTask") as HTMLSelectElement|null;
  const topicChoices=()=>document.getElementById("v46TopicChoices");
  const taskChoices=()=>document.getElementById("v46TaskChoices");

  const applySubjectFilter=():void=>{
    const query=normalizeSubject(searchInput()?.value||"");
    subjectPicker()?.querySelectorAll<HTMLButtonElement>(".chip").forEach(button=>{
      const label=normalizeSubject(button.textContent||"");
      button.hidden=!!query&&!label.includes(query);
    });
  };

  const decorateSubjectButtons=():void=>{
    subjectPicker()?.querySelectorAll<HTMLButtonElement>(".chip").forEach(button=>{
      button.type="button";
      if(!subjectConfirmed)button.classList.remove("on");
      button.setAttribute("aria-pressed",subjectConfirmed&&button.classList.contains("on")?"true":"false");
      button.setAttribute("title",`${button.textContent?.trim()||"Ders"} dersini seç`);
    });
    applySubjectFilter();
  };

  const updateSelectedUi=():void=>{
    const summary=selectedSummary();
    if(!summary)return;
    const selected=subjectConfirmed?document.querySelector<HTMLElement>("#pomoSubjPick .chip.on"):null;
    if(!selected){summary.textContent="Ders seçilmedi · Genel Çalışma olarak kaydedilir";summary.dataset.state="empty";return;}
    const label=selected.textContent?.trim()||"Ders";
    summary.textContent=`${label} seçildi ✓`;
    summary.dataset.state="ready";
  };

  const choiceTarget=(kind:ChoiceKind):HTMLElement|null=>kind==="topic"?topicChoices():taskChoices();
  const choiceSelect=(kind:ChoiceKind):HTMLSelectElement|null=>kind==="topic"?topicSelect():taskSelect();

  const renderChoiceButtons=(kind:ChoiceKind):void=>{
    const target=choiceTarget(kind),select=choiceSelect(kind);
    if(!target||!select)return;
    target.replaceChildren();
    if(kind==="topic"&&!subjectConfirmed){
      const empty=document.createElement("div");
      empty.className="v46-choice-empty";
      empty.textContent="Önce ders seç · konular burada görünecek";
      target.append(empty);
      return;
    }
    const options=Array.from(select.options).filter(option=>String(option.value||"").trim());
    if(!options.length){
      const empty=document.createElement("div");
      empty.className="v46-choice-empty";
      empty.textContent=kind==="topic"?"Bu ders için konu bulunamadı":"Bugün bağlanabilecek plan çalışması yok";
      target.append(empty);
      return;
    }
    const frag=document.createDocumentFragment();
    options.forEach(option=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="v46-choice-card";
      button.dataset.value=option.value;
      button.classList.toggle("on",select.value===option.value);
      button.setAttribute("aria-pressed",select.value===option.value?"true":"false");
      button.textContent=option.textContent?.trim()||option.value;
      button.addEventListener("click",()=>{
        const next=select.value===option.value?"":option.value;
        select.value=next;
        select.dispatchEvent(new Event("change",{bubbles:true}));
        renderChoiceButtons(kind);
      });
      frag.append(button);
    });
    target.append(frag);
  };

  const renderChoicePickers=():void=>{
    renderChoiceButtons("topic");
    renderChoiceButtons("task");
  };

  const syncModeUi=():void=>{
    const mode=currentFocusMode();
    const badge=document.getElementById("v46FocusModeBadge");
    const title=document.getElementById("v46FocusPrepTitle");
    const hint=document.getElementById("v46FocusPrepHint");
    if(badge)badge.textContent=mode==="sw"?"Kronometre":"Sayaç";
    if(title)title.textContent=mode==="sw"?"Kronometre oturumunu hazırla":"Sayaç oturumunu hazırla";
    if(hint)hint.textContent=mode==="sw"?"Ders seçmeden başlat; süre Genel Çalışma olarak kaydedilir. İstersen ders de seçebilirsin.":"Ders seçimi isteğe bağlı; boş bırakırsan sayaç Genel Çalışma olarak kaydedilir.";
    setupCard()?.setAttribute("data-v46-mode",mode);
  };

  const clearSessionGoal=():void=>{
    const input=document.getElementById("v29GoalText") as HTMLInputElement|null;
    if(input)input.value="";
    try{legacy("v29SetGoal")?.("");}catch{}
  };

  const resetPreparationForNextSession=():void=>{
    if(hasLiveFocusSession())return;
    subjectConfirmed=false;
    // Önceki ders, yeni ve boş başlayan bir oturuma yanlışlıkla taşınmasın.
    originalSetSubject?.(GENERAL_SUBJECT);
    const search=searchInput();
    if(search)search.value="";
    try{legacy("setPomoTopic")?.("");}catch{}
    try{legacy("setPomoTask")?.("");}catch{}
    if(topicSelect())topicSelect()!.value="";
    if(taskSelect())taskSelect()!.value="";
    clearSessionGoal();
    decorateSubjectButtons();
    updateSelectedUi();
    renderChoicePickers();
  };

  const installPickerEnhancements=():void=>{
    if(!buildPreparationUi())return;
    decorateSubjectButtons();
    updateSelectedUi();
    renderChoicePickers();
    syncModeUi();
    const setup=setupCard();
    if(setup?.dataset.v46FocusEnhancements==="ready")return;
    const picker=subjectPicker(),topic=topicSelect(),task=taskSelect();
    if(picker&&!subjectObserver){
      subjectObserver=new MutationObserver(()=>{decorateSubjectButtons();updateSelectedUi();});
      subjectObserver.observe(picker,{childList:true,subtree:false});
    }
    if(topic&&!topicObserver){
      topicObserver=new MutationObserver(()=>renderChoiceButtons("topic"));
      topicObserver.observe(topic,{childList:true,subtree:true});
      topic.addEventListener("change",()=>renderChoiceButtons("topic"));
    }
    if(task&&!taskObserver){
      taskObserver=new MutationObserver(()=>renderChoiceButtons("task"));
      taskObserver.observe(task,{childList:true,subtree:true});
      task.addEventListener("change",()=>renderChoiceButtons("task"));
    }
    searchInput()?.addEventListener("input",applySubjectFilter);
    ["segPomo","segStop"].forEach(id=>document.getElementById(id)?.addEventListener("click",()=>window.setTimeout(syncModeUi,0)));
    if(setup)setup.dataset.v46FocusEnhancements="ready";
  };

  installPickerEnhancements();
  if(!hasLiveFocusSession())window.setTimeout(resetPreparationForNextSession,0);

  const guardedStart=(mode:FocusStartMode,original:LegacyFn|undefined,args:unknown[]):unknown=>{
    if(!original)return undefined;
    if(!needsPreparation(mode))return original(...args);
    if(!subjectConfirmed){
      // İsteğe bağlı ders seçilmediyse süreyi hiçbir gerçek derse yazma.
      originalSetSubject?.(GENERAL_SUBJECT);
      legacy("setPomoTopic")?.("");
      legacy("setPomoTask")?.("");
    }
    return original(...args);
  };

  if(originalTogglePomo)(window as unknown as Record<string,unknown>).togglePomo=(...args:unknown[])=>guardedStart("pomo",originalTogglePomo,args);
  if(originalSwToggle)(window as unknown as Record<string,unknown>).swToggle=(...args:unknown[])=>guardedStart("sw",originalSwToggle,args);
  if(originalSetSubject)(window as unknown as Record<string,unknown>).setPomoSubject=(subject:unknown,...rest:unknown[])=>{
    const result=originalSetSubject(subject,...rest);
    const chosen=String(subject??"").trim();
    subjectConfirmed=!!chosen&&chosen!==GENERAL_SUBJECT;
    decorateSubjectButtons();
    updateSelectedUi();
    renderChoicePickers();
    return result;
  };
  if(originalRecordSession)(window as unknown as Record<string,unknown>).recordSession=(...args:unknown[])=>{
    const result=originalRecordSession(...args);
    window.setTimeout(resetPreparationForNextSession,0);
    return result;
  };
  if(originalSwRecord)(window as unknown as Record<string,unknown>).swRecord=(...args:unknown[])=>{
    const result=originalSwRecord(...args);
    window.setTimeout(resetPreparationForNextSession,0);
    return result;
  };

  const api:FocusSessionGuardV43Api={
    installed:!!(originalTogglePomo&&originalSwToggle&&originalSetSubject&&setupCard()),
    validate(){
      const errors:string[]=[];
      if(!originalTogglePomo)errors.push("togglePomo");
      if(!originalSwToggle)errors.push("swToggle");
      if(!originalSetSubject)errors.push("setPomoSubject");
      if(!setupCard())errors.push("session-setup");
      if(!document.getElementById("pomoSubjPick"))errors.push("subject-picker");
      if(!document.getElementById("v46FocusSubjectSearch"))errors.push("subject-search");
      if(!document.getElementById("v46TopicChoices"))errors.push("topic-choices");
      if(!document.getElementById("v46TaskChoices"))errors.push("task-choices");
      return errors;
    }
  };
  window.__YKS_FOCUS_SESSION_GUARD_V43__=api;
  void import("./focus-smart-picker-v58").then(mod=>mod.installFocusSmartPickerV58()).catch(console.error);
  return api;
}
