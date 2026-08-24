import {activeId,all,byId,emit} from "./dom";
import {isScreenId,type NavigationDetail,type NavigationSource,type ScreenId,type UiSnapshot} from "./types";

type LegacyGo=(screen:string)=>unknown;

const TITLES:Record<ScreenId,string>={
  home:"Bugün",
  program:"Program",
  topics:"Konular",
  deneme:"Denemeler",
  progress:"İlerleme",
  pomo:"Odak",
  more:"Daha"
};

export class NavigationController{
  readonly #legacyGo:LegacyGo;

  constructor(legacyGo:LegacyGo){
    this.#legacyGo=legacyGo;
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
    const result=this.#legacyGo(value);
    this.#syncShell(value);
    emit("yks:navigation-after",detail);
    return result;
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
