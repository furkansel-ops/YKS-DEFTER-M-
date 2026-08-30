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

export function installFocusSessionGuardV43():FocusSessionGuardV43Api{
  const originalTogglePomo=legacy("togglePomo"),originalSwToggle=legacy("swToggle"),originalSetSubject=legacy("setPomoSubject");
  let pendingMode:FocusStartMode|null=null,subjectConfirmed=false;

  const clearGate=():void=>{
    pendingMode=null;subjectConfirmed=false;
    const setup=setupCard();
    setup?.classList.remove("v43-session-required","v43-session-ready");
    setup?.removeAttribute("data-v43-start-mode");
    const message=document.getElementById("v43FocusStartGate");
    if(message)message.textContent="";
  };

  const requestPreparation=(mode:FocusStartMode):void=>{
    pendingMode=mode;subjectConfirmed=false;
    legacy("v29ToggleMinimal")?.(false);
    const setup=setupCard(),message=ensureGateMessage();
    if(!setup||!message)return;
    setup.classList.add("v43-session-required");
    setup.classList.remove("v43-session-ready");
    setup.dataset.v43StartMode=mode;
    message.textContent="Başlamadan önce dersini seç. Seçimden sonra Başlat'a tekrar bas.";
    setup.scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"center"});
    window.setTimeout(()=>document.querySelector<HTMLElement>("#pomoSubjPick .chip")?.focus(),reducedMotion()?0:220);
  };

  const guardedStart=(mode:FocusStartMode,original:LegacyFn|undefined):unknown=>{
    if(!original)return undefined;
    if(!needsPreparation(mode))return original();
    if(pendingMode!==mode||!subjectConfirmed){requestPreparation(mode);return undefined;}
    clearGate();
    return original();
  };

  if(originalTogglePomo)(window as unknown as Record<string,unknown>).togglePomo=()=>guardedStart("pomo",originalTogglePomo);
  if(originalSwToggle)(window as unknown as Record<string,unknown>).swToggle=()=>guardedStart("sw",originalSwToggle);
  if(originalSetSubject)(window as unknown as Record<string,unknown>).setPomoSubject=(subject:unknown)=>{
    const result=originalSetSubject(subject);
    if(pendingMode&&String(subject??"").trim()){
      subjectConfirmed=true;
      const setup=setupCard(),message=ensureGateMessage();
      setup?.classList.add("v43-session-ready");
      setup?.classList.remove("v43-session-required");
      if(message)message.textContent=`${selectedSubjectLabel()} seçildi ✓ Şimdi Başlat'a bas.`;
    }
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
      return errors;
    }
  };
  window.__YKS_FOCUS_SESSION_GUARD_V43__=api;
  return api;
}
