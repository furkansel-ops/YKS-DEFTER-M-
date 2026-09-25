import {installRefinedProgram} from "./refined-program";
import {installRefinedSecondary} from "./refined-secondary";
import {installRefinedStudyScreens} from "./refined-study-screens";

type ShellWindow=Window&{go?:(screen:string)=>void;v30Action?:(action:string)=>void;setMoreTab?:(panel:string)=>void};
const legacy=()=>window as ShellWindow;
const CHILD_SCREENS=new Set(["progress","pomo","pp"]);

/** Navigation only: never changes the student's data or saved theme. */
export function installRefinedShell(){
  const program=installRefinedProgram();
  const navbar=document.querySelector(".navbar"),tools=document.querySelector(".navtools");
  if(navbar&&!document.getElementById("refinedBrand")){
    const brand=document.createElement("button");brand.id="refinedBrand";brand.className="rb-brand";brand.type="button";
    brand.setAttribute("aria-label","YKS Defterim, Bugün sayfası");
    brand.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5C9 2 5 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-7-2-10 1Zm0 0v15"/></svg><span>YKS Defterim</span>';
    brand.addEventListener("click",()=>legacy().go?.("home"));navbar.prepend(brand);
  }
  if(tools&&!document.getElementById("refinedProfile")){
    const profile=document.createElement("button");profile.id="refinedProfile";profile.className="rb-profile";profile.type="button";
    profile.setAttribute("aria-label","Profil ve ayarlar");
    profile.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg>';
    profile.addEventListener("click",()=>{legacy().v30Action?.("settings");window.dispatchEvent(new CustomEvent("yks:open-settings",{detail:{category:"profile"}}));});tools.append(profile);
  }
  for(const id of CHILD_SCREENS){
    const screen=document.getElementById(id);if(!screen||screen.querySelector(":scope > .rb-back"))continue;
    const back=document.createElement("button");back.type="button";back.className="rb-back";back.textContent="‹ Merkez";
    back.addEventListener("click",()=>{legacy().go?.("more");legacy().setMoreTab?.("home");});screen.prepend(back);
  }
  const media=window.matchMedia("(max-width:759px)");
  function sync(){
    const active=document.querySelector<HTMLElement>(".screen.active")?.id;
    const more=document.querySelector<HTMLElement>('.tabbar [data-s="more"]');
    more?.classList.toggle("rb-child-active",!!active&&CHILD_SCREENS.has(active));
    if(more)more.tabIndex=active==="more"||(media.matches&&!!active&&CHILD_SCREENS.has(active))?0:-1;
  }
  const tabs=document.querySelector(".tabbar");
  tabs?.addEventListener("keydown",event=>{
    const key=(event as KeyboardEvent).key;if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(key))return;
    const visible=Array.from(tabs.querySelectorAll<HTMLButtonElement>(".tab")).filter(tab=>tab.getClientRects().length>0);
    const current=visible.indexOf(event.target as HTMLButtonElement);if(current<0)return;
    event.preventDefault();
    const next=key==="Home"?0:key==="End"?visible.length-1:(current+(["ArrowRight","ArrowDown"].includes(key)?1:-1)+visible.length)%visible.length;
    visible[next]?.focus();visible[next]?.click();
  });
  media.addEventListener("change",sync);window.addEventListener("yks:navigation-after",sync);sync();
  installRefinedSecondary();
  installRefinedStudyScreens();
  return {installed:true,validate(){return [!program.installed?"program":"",!document.getElementById("refinedBrand")?"brand":""].filter(Boolean);}};
}
