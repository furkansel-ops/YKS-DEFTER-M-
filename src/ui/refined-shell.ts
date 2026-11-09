import {installRefinedProgram} from "./refined-program";
import {installRefinedSecondary} from "./refined-secondary";
import {installRefinedStudyScreens} from "./refined-study-screens";
import {installExamHubV73} from "./exam-hub-v73";
import {installProgressHubV74} from "./progress-hub-v74";
import {installAboutV78} from "./about-v78";
import {installBooksV89} from "./books-v89";
import {installWrongReviewV96} from "./wrong-review-v96";

type ShellWindow=Window&{go?:(screen:string)=>void;v30Action?:(action:string)=>void;setMoreTab?:(panel:string)=>void};
const legacy=()=>window as ShellWindow;
/* v100 yeni harita: 5 başlık — Bugün, Program, Çalış (Odak), Gelişim (Deneme+Konular+İlerleme), Ben (Merkez).
   Alt ekranlar bağlı oldukları başlığı seçili gösterir. Yalnız gezinme; ekranlar ve kayıtlar aynı. */
const PARENT:Record<string,string>={topics:"deneme",progress:"deneme",pp:"pomo"};
const LABELS:Record<string,string>={pomo:"Çalış",deneme:"Gelişim"};
const GROWTH:readonly (readonly [string,string])[]=[["deneme","Denemeler"],["topics","Konular"],["progress","İstatistik"]];

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
  for(const [s,label] of Object.entries(LABELS)){
    const tab=document.querySelector<HTMLElement>(`.tabbar .tab[data-s="${s}"]`),tl=tab?.querySelector<HTMLElement>(".tl");
    if(tl)tl.textContent=label;tab?.setAttribute("aria-label",label);
  }
  const pp=document.getElementById("pp");
  if(pp&&!pp.querySelector(":scope > .rb-back")){
    const back=document.createElement("button");back.type="button";back.className="rb-back";back.textContent="‹ Çalış";
    back.addEventListener("click",()=>legacy().go?.("pomo"));pp.prepend(back);
  }
  const pomo=document.getElementById("pomo");
  if(pomo&&!pomo.querySelector(":scope > .v100-work")){
    const row=document.createElement("nav");row.className="v100-work";row.setAttribute("aria-label","Çalışma kayıtları");
    row.innerHTML='<button type="button" data-v100-work="pp"><b>Paragraf &amp; Problem</b><small>Günlük kayıt</small></button><button type="button" data-v100-work="books"><b>Kitaplarım</b><small>+test, çözdüğün sorular</small></button>';
    row.addEventListener("click",event=>{
      const to=(event.target as Element).closest<HTMLElement>("[data-v100-work]")?.dataset.v100Work;
      if(to==="pp")legacy().go?.("pp");else if(to==="books")(window as Window&{YKSBooks?:{open:()=>void}}).YKSBooks?.open();
    });
    pomo.prepend(row);
  }
  // Gelişim şeridi: ekranların dışında tek şerit (ekran modülleri kendi çocuklarını yeniden dizdiği için içlerine girmez).
  let growth=document.getElementById("v100Growth");
  if(!growth){
    growth=document.createElement("nav");growth.id="v100Growth";growth.className="v100-growth";growth.setAttribute("aria-label","Gelişim");growth.hidden=true;
    for(const [to,label] of GROWTH){
      const b=document.createElement("button");b.type="button";b.dataset.v100Go=to;b.textContent=label;
      b.addEventListener("click",()=>legacy().go?.(to));growth.append(b);
    }
    document.getElementById("mainWrap")?.prepend(growth);
  }
  function sync(){
    const active=document.querySelector<HTMLElement>(".screen.active")?.id||"";
    if(growth){
      growth.hidden=!GROWTH.some(([s])=>s===active);
      for(const b of growth.querySelectorAll<HTMLElement>("button"))if(b.dataset.v100Go===active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
    }
    for(const tab of document.querySelectorAll<HTMLElement>(".tabbar .tab")){
      const child=PARENT[active]===tab.dataset.s;
      tab.classList.toggle("rb-child-active",child);
      if(child)tab.tabIndex=0;
    }
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
  window.addEventListener("yks:navigation-after",sync);sync();
  installRefinedSecondary();
  installRefinedStudyScreens();
  try{installExamHubV73();}catch(error){console.error("v73 deneme ekranı",error);}
  try{installBooksV89();}catch(error){console.error("v89 kitaplarım",error);}
  try{installWrongReviewV96();}catch(error){console.error("v96 tekrar çöz",error);}
  try{installProgressHubV74();}catch(error){console.error("v74 ilerleme ekranı",error);}
  try{installAboutV78();}catch(error){console.error("v78 Hakkında",error);}
  return {installed:true,validate(){return [!program.installed?"program":"",!document.getElementById("refinedBrand")?"brand":""].filter(Boolean);}};
}
