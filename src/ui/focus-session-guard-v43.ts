import "./focus-session-guard-v43.css";

type FocusStartMode="pomo"|"sw";
type LegacyFn=(...args:any[])=>any;

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

function reducedMotion():boolean{
  try{return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches===true;}
  catch{return false;}
}

function setupCard():HTMLElement|null{
  return document.querySelector<HTMLElement>(".v29-session-setup");
}

function ensureGateMessage():HTMLElement|null{
  const setup=setupCard();
  if(!setup)return null;
  let message=document.getElementById("v43FocusStartGate");
  if(!message){
    message=document.createElement("div");
    message.id="v43FocusStartGate";
    message.className="v43-focus-start-gate";
    message.setAttribute("role","status");
    message.setAttribute("aria-live","polite");
    setup.appendChild(message);
  }
  return message;
}

function selectedSubjectLabel():string{
  return document.querySelector<HTMLElement>("#pomoSubjPick .chip.on")?.textContent?.trim()||"Ders";
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
        <span class="v46-focus-kicker">Hızlı hazırlık</span>
        <h3 id="v46FocusPrepTitle">Ne çalışacağını seç</h3>
        <p id="v46FocusPrepHint">Dersini seç, sonra istersen konu ve çalışma türünü belirle.</p>
      </div>
      <span class="v46-focus-mode" id="v46FocusModeBadge">Sayaç</span>
    </div>
    <section class="v46-focus-step v46-subject-step" aria-labelledby="v46SubjectStepTitle">
      <div class="v46-step-head">
        <span class="v46-step-no" aria-hidden="true">1</span>
        <div><b id="v46SubjectStepTitle">Ders seç</b><small>Bu oturum hangi derse yazılsın?</small></div>
      </div>
      <label class="v46-subject-search" for="v46FocusSubjectSearch">
        <span aria-hidden="true">⌕</span>
        <input id="v46FocusSubjectSearch" type="search" placeholder="Ders ara…" autocomplete="off" aria-label="Derslerde ara">
      </label>
      <div class="v46-subject-slot" data-v46-subject-slot></div>
      <div class="v46-selected-subject" id="v46SelectedSubject" role="status" aria-live="polite">Bir derse dokunarak seçimini onayla</div>
    </section>
    <div class="v46-secondary-grid">
      <section class="v46-focus-step" aria-labelledby="v46TopicStepTitle">
        <div class="v46-step-head">
          <span class="v46-step-no" aria-hidden="true">2</span>
          <div><b id="v46TopicStepTitle">Konu seç</b><small>İstersen konuyu netleştir.</small></div>
        </div>
        <div class="v46-select-slot" data-v46-topic-slot></div>
      </section>
      <section class="v46-focus-step" aria-labelledby="v46TaskStepTitle">
        <div class="v46-step-head">
          <span class="v46-step-no" aria-hidden="true">3</span>
          <div><b id="v46TaskStepTitle">Çalışma türü</b><small>Oturumun çıktısını belirle.</small></div>
        </div>
        <div class="v46-select-slot" data-v46-task-slot></div>
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
  setup.dataset.v46FocusPicker="ready";
  return true;
}

export function installFocusSessionGuardV43():FocusSessionGuardV43Api{
  if(window.__YKS_FOCUS_SESSION_GUARD_V43__)return window.__YKS_FOCUS_SESSION_GUARD_V43__;

  const originalTogglePomo=legacy("togglePomo"),originalSwToggle=legacy("swToggle"),originalSetSubject=legacy("setPomoSubject");
  let pendingMode:FocusStartMode|null=null,subjectConfirmed=false;
  let subjectObserver:MutationObserver|null=null;

  buildPreparationUi();

  const subjectPicker=()=>document.getElementById("pomoSubjPick");
  const searchInput=()=>document.getElementById("v46FocusSubjectSearch") as HTMLInputElement|null;
  const selectedSummary=()=>document.getElementById("v46SelectedSubject");

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
      button.setAttribute("aria-pressed",button.classList.contains("on")?"true":"false");
      button.setAttribute("title",`${button.textContent?.trim()||"Ders"} dersini seç`);
    });
    applySubjectFilter();
  };

  const updateSelectedUi=(confirmed=subjectConfirmed):void=>{
    const summary=selectedSummary();
    if(!summary)return;
    const selected=document.querySelector<HTMLElement>("#pomoSubjPick .chip.on");
    if(!selected){summary.textContent="Bir derse dokunarak seçimini onayla";summary.dataset.state="empty";return;}
    const label=selected.textContent?.trim()||"Ders";
    summary.textContent=confirmed?`${label} seçildi ✓`:`${label} hazır görünüyor · karta dokunarak onayla`;
    summary.dataset.state=confirmed?"ready":"preview";
  };

  const syncModeUi=():void=>{
    const mode=currentFocusMode();
    const badge=document.getElementById("v46FocusModeBadge");
    const title=document.getElementById("v46FocusPrepTitle");
    const hint=document.getElementById("v46FocusPrepHint");
    if(badge)badge.textContent=mode==="sw"?"Kronometre":"Sayaç";
    if(title)title.textContent=mode==="sw"?"Kronometre oturumunu hazırla":"Sayaç oturumunu hazırla";
    if(hint)hint.textContent=mode==="sw"?"Dersini seç; kronometrede geçen süre doğrudan bu çalışmaya yazılsın.":"Dersini seç; sonra konu ve çalışma türüyle oturumu netleştir.";
    setupCard()?.setAttribute("data-v46-mode",mode);
  };

  const installPickerEnhancements=():void=>{
    if(!buildPreparationUi())return;
    decorateSubjectButtons();
    updateSelectedUi(false);
    syncModeUi();
    const setup=setupCard();
    if(setup?.dataset.v46FocusEnhancements==="ready")return;
    const picker=subjectPicker();
    if(picker&&!subjectObserver){
      subjectObserver=new MutationObserver(()=>{decorateSubjectButtons();updateSelectedUi();});
      subjectObserver.observe(picker,{childList:true,subtree:false});
    }
    searchInput()?.addEventListener("input",applySubjectFilter);
    ["segPomo","segStop"].forEach(id=>document.getElementById(id)?.addEventListener("click",()=>window.setTimeout(syncModeUi,0)));
    if(setup)setup.dataset.v46FocusEnhancements="ready";
  };

  installPickerEnhancements();

  const clearGate=():void=>{
    pendingMode=null;subjectConfirmed=false;
    const setup=setupCard();
    setup?.classList.remove("v43-session-required","v43-session-ready");
    setup?.removeAttribute("data-v43-start-mode");
    const message=document.getElementById("v43FocusStartGate");
    if(message)message.textContent="";
    updateSelectedUi(false);
  };

  const requestPreparation=(mode:FocusStartMode):void=>{
    pendingMode=mode;subjectConfirmed=false;
    try{legacy("v29ToggleMinimal")?.(false);}catch{}
    installPickerEnhancements();
    syncModeUi();
    updateSelectedUi(false);
    const setup=setupCard(),message=ensureGateMessage();
    if(!setup||!message)return;
    setup.classList.add("v43-session-required");
    setup.classList.remove("v43-session-ready");
    setup.dataset.v43StartMode=mode;
    message.textContent="Başlamadan önce dersini seç. Seçimden sonra Başlat'a tekrar bas.";
    try{setup.scrollIntoView?.({behavior:reducedMotion()?"auto":"smooth",block:"center"});}catch{}
    window.setTimeout(()=>document.querySelector<HTMLElement>("#pomoSubjPick .chip.on,#pomoSubjPick .chip")?.focus(),reducedMotion()?0:220);
  };

  const guardedStart=(mode:FocusStartMode,original:LegacyFn|undefined,args:unknown[]):unknown=>{
    if(!original)return undefined;
    if(!needsPreparation(mode))return original(...args);
    if(pendingMode!==mode||!subjectConfirmed){requestPreparation(mode);return undefined;}
    clearGate();
    return original(...args);
  };

  if(originalTogglePomo)(window as unknown as Record<string,unknown>).togglePomo=(...args:unknown[])=>guardedStart("pomo",originalTogglePomo,args);
  if(originalSwToggle)(window as unknown as Record<string,unknown>).swToggle=(...args:unknown[])=>guardedStart("sw",originalSwToggle,args);
  if(originalSetSubject)(window as unknown as Record<string,unknown>).setPomoSubject=(subject:unknown,...rest:unknown[])=>{
    const result=originalSetSubject(subject,...rest);
    decorateSubjectButtons();
    if(pendingMode&&String(subject??"").trim()){
      subjectConfirmed=true;
      const setup=setupCard(),message=ensureGateMessage();
      setup?.classList.add("v43-session-ready");
      setup?.classList.remove("v43-session-required");
      if(message)message.textContent=`${selectedSubjectLabel()} seçildi ✓ Şimdi Başlat'a bas.`;
    }
    updateSelectedUi();
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
      return errors;
    }
  };
  window.__YKS_FOCUS_SESSION_GUARD_V43__=api;
  return api;
}
