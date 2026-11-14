import {installRefinedProgram} from "./refined-program";
import {installRefinedSecondary} from "./refined-secondary";
import {installRefinedStudyScreens} from "./refined-study-screens";
import {installExamHubV73} from "./exam-hub-v73";
import {installProgressHubV74} from "./progress-hub-v74";
import {installAboutV78} from "./about-v78";
import {installBooksV89} from "./books-v89";
import {installWrongReviewV96} from "./wrong-review-v96";
import {installReviewReminderV113} from "./review-reminder-v113";
import {installErrorInsightsV117} from "./error-insights-v117";
import {installMoodChartV118} from "./mood-chart-v118";
import {installReviewGapsV119} from "./review-gaps-v119";
import {installExamCalendarV120} from "./exam-calendar-v120";
import {installScrollLockV122} from "./scroll-lock-v122";
import {installBreakReminderV123} from "./break-reminder-v123";
import {installReviewSheetV125} from "./review-sheet-v125";

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
    // v102 logo: mor kutu içinde tikli defter
    brand.innerHTML='<span class="rb-logo" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8l2 2 4-4"/></svg></span><span>YKS Defterim</span>';
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
  try{installExamHubV73();}catch(error){console.error("v73 deneme ekranı",error);}
  try{installBooksV89();}catch(error){console.error("v89 kitaplarım",error);}
  try{installWrongReviewV96();}catch(error){console.error("v96 tekrar çöz",error);}
  try{installErrorInsightsV117();}catch(error){console.error("v117 hata analizi",error);}
  try{installMoodChartV118();}catch(error){console.error("v118 ruh hali grafiği",error);}
  try{installReviewGapsV119();}catch(error){console.error("v119 tekrar aralıkları",error);}
  try{installExamCalendarV120();}catch(error){console.error("v120 deneme takvimi",error);}
  try{installScrollLockV122();}catch(error){console.error("v122 kaydırma kilidi",error);}
  try{installBreakReminderV123();}catch(error){console.error("v123 mola uyarısı",error);}
  try{installReviewSheetV125();}catch(error){console.error("v125 tekrar föyü",error);}
  try{installReviewReminderV113();}catch(error){console.error("v113 tekrar hatırlatması",error);}
  try{installProgressHubV74();}catch(error){console.error("v74 ilerleme ekranı",error);}
  try{installAboutV78();}catch(error){console.error("v78 Hakkında",error);}
  return {installed:true,validate(){return [!program.installed?"program":"",!document.getElementById("refinedBrand")?"brand":""].filter(Boolean);}};
}
