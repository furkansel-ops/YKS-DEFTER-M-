import {activeId,all,byId,emit} from "./dom";
import {isScreenId,type NavigationDetail,type NavigationSource,type ScreenId,type UiSnapshot} from "./types";
import type {ScreenRuntimeApi} from "./screens/contracts";

type LegacyGo=(screen:string)=>unknown;

const TITLES:Record<ScreenId,string>={
  home:"Bugün",
  program:"Program",
  topics:"Konular",
  deneme:"Denemeler",
  progress:"İlerleme",
  pomo:"Odak",
  pp:"Paragraf & Problem",
  more:"Daha"
};

const keyboardRails=new WeakSet<HTMLElement>();

export function bindPrimaryNavigationKeyboard(rail:HTMLElement,navigate:(screen:ScreenId)=>unknown):void{
  if(keyboardRails.has(rail))return;
  keyboardRails.add(rail);
  rail.addEventListener("keydown",event=>{
    if(event.defaultPrevented||event.isComposing||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
    if(!(event.target instanceof Element))return;
    const current=event.target.closest<HTMLButtonElement>(".tab[data-s]");
    if(!current||!rail.contains(current))return;
    const tabs=Array.from(rail.querySelectorAll<HTMLButtonElement>(".tab[data-s]")).filter(tab=>!tab.hidden&&!tab.disabled&&tab.getClientRects().length>0);
    const index=tabs.indexOf(current);
    if(index<0||tabs.length===0)return;
    let next:number;
    if(event.key==="ArrowDown"||event.key==="ArrowRight")next=(index+1)%tabs.length;
    else if(event.key==="ArrowUp"||event.key==="ArrowLeft")next=(index+tabs.length-1)%tabs.length;
    else if(event.key==="Home")next=0;
    else if(event.key==="End")next=tabs.length-1;
    else return;
    const target=tabs[next],screen=target?.dataset.s;
    if(!target||!isScreenId(screen))return;
    event.preventDefault();
    navigate(screen);
    target.focus();
  });
}

export class NavigationController{
  readonly #legacyGo:LegacyGo;
  readonly #screenRuntime:ScreenRuntimeApi|undefined;

  constructor(legacyGo:LegacyGo,screenRuntime?:ScreenRuntimeApi){
    this.#legacyGo=legacyGo;
    this.#screenRuntime=screenRuntime;
    const rail=document.querySelector<HTMLElement>(".tabbar");
    if(rail)bindPrimaryNavigationKeyboard(rail,screen=>this.open(screen,"inline"));
  }

  current():ScreenId|null{
    const id=activeId(".screen");
    return isScreenId(id)?id:null;
  }

  open(value:unknown,source:NavigationSource="api"):unknown{
    if(!isScreenId(value)){
      console.warn("Geçersiz ekran isteği:",value);
      return false;
    }
    const from=this.current(),detail:NavigationDetail={from,to:value,source,at:Date.now()};
    emit("yks:navigation-before",detail);

    /* Legacy go(), yıllar içinde Daha/Program/Deneme gibi ekranların tüm yan etkilerini
       ve güvenlik yamalarını biriktirdi. Ana ekran geçişinde otorite olmaya devam eder.
       TypeScript runtime yalnız yeni P & P çizimini ve gerçek bir legacy arızasında fallback'i sağlar. */
    let result:unknown=false,legacyFailed=false;
    try{result=this.#legacyGo(value);}
    catch(error){
      legacyFailed=true;
      console.error(`Legacy ekran geçişi başarısız: ${value}`,error);
    }

    const active=this.current();
    if(value==="pp"){
      if(active!==value)this.#activateShell(value);
      this.#screenRuntime?.render(value,source);
    }else if((legacyFailed||active!==value)&&this.#screenRuntime){
      this.#activateShell(value);
      this.#screenRuntime.render(value,source);
    }

    this.#syncShell(value);
    emit("yks:navigation-after",detail);
    return result;
  }

  #activateShell(screen:ScreenId):void{
    for(const node of all<HTMLElement>(".screen"))node.classList.toggle("active",node.id===screen);
    for(const tab of all<HTMLButtonElement>(".tab[data-s]"))tab.classList.toggle("active",tab.dataset.s===screen);
    byId("mainWrap")?.classList.toggle("wide",screen==="program");
    const updateNav=(window as unknown as Window&Record<string,unknown>)["updateNav"];
    if(typeof updateNav==="function")(updateNav as (id:string)=>unknown)(screen);
    window.scrollTo(0,0);
  }

  snapshot(activeMorePanel:UiSnapshot["activeMorePanel"]):UiSnapshot{
    return {
      activeScreen:this.current(),
      activeMorePanel,
      screenCount:all(".screen").length,
      tabCount:all(".tab[data-s]").length
    };
  }

  validate():string[]{
    const errors:string[]=[];
    for(const id of Object.keys(TITLES) as ScreenId[]){
      if(!byId(id))errors.push(`Ekran bulunamadı: ${id}`);
      if(!document.querySelector(`.tab[data-s="${id}"]`))errors.push(`Sekme bulunamadı: ${id}`);
    }
    const activeScreens=all(".screen.active");
    if(activeScreens.length!==1)errors.push(`Aktif ekran sayısı 1 olmalı: ${activeScreens.length}`);
    return errors;
  }

  #syncShell(screen:ScreenId):void{
    const title=byId("navTitle");
    if(title)title.textContent=TITLES[screen];
    for(const tab of all<HTMLButtonElement>(".tab[data-s]")){
      const selected=tab.dataset.s===screen;
      tab.setAttribute("aria-selected",String(selected));
      tab.tabIndex=selected?0:-1;
    }
    document.documentElement.dataset.activeScreen=screen;
  }
}
