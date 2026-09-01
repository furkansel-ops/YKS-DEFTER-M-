import {byId,emit} from "./dom";
import {isMorePanelId,type MorePanelId} from "./types";

type LegacySetMoreTab=(panel:string)=>unknown;

export class MorePanelsController{
  readonly #legacySetMoreTab:LegacySetMoreTab;
  #current:MorePanelId="home";

  constructor(legacySetMoreTab:LegacySetMoreTab){
    this.#legacySetMoreTab=legacySetMoreTab;
    this.#current=this.#detect();
  }

  current():MorePanelId{
    return this.#current;
  }

  open(value:unknown):unknown{
    if(!isMorePanelId(value)){
      console.warn("Geçersiz Daha paneli isteği:",value);
      value="home";
    }
    const panel=value as MorePanelId,previous=this.#current;
    emit("yks:more-before",{from:previous,to:panel,at:Date.now()});
    const result=this.#legacySetMoreTab(panel);
    this.#current=panel;
    document.documentElement.dataset.activeMorePanel=panel;
    emit("yks:more-after",{from:previous,to:panel,at:Date.now()});
    return result;
  }

  validate():string[]{
    const errors:string[]=[];
    for(const panel of ["lab","kay","tak","roz","veri","ayar","pp"] as const){
      if(!byId(`mrp_${panel}`))errors.push(`Daha paneli bulunamadı: ${panel}`);
    }
    if(!byId("v30MoreHome"))errors.push("Daha ana sayfası bulunamadı");
    if(!byId("v30AboutPanel"))errors.push("Hakkında paneli bulunamadı");
    return errors;
  }

  #detect():MorePanelId{
    const about=byId("v30AboutPanel");
    if(about&&about.style.display!=="none")return "about";
    for(const panel of ["lab","kay","tak","roz","veri","ayar","pp"] as const){
      const element=byId(`mrp_${panel}`);
      if(element&&element.style.display!=="none")return panel;
    }
    return "home";
  }
}
