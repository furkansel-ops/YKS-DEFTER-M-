import {NavigationController} from "./navigation";
import {MorePanelsController} from "./more-panels";
import {isMorePanelId,type MorePanelId,type ScreenId,type UiBridgeApi} from "./types";

declare global{
  interface Window{
    go?:(screen:string)=>unknown;
    setMoreTab?:(panel:string)=>unknown;
    __YKS_UI__?:UiBridgeApi;
  }
}

export function installLegacyUiBridge():UiBridgeApi{
  const legacyGo=window.go;
  const legacySetMoreTab=window.setMoreTab;
  if(typeof legacyGo!=="function")throw new Error("Eski ekran yöneticisi bulunamadı");
  if(typeof legacySetMoreTab!=="function")throw new Error("Eski Daha panel yöneticisi bulunamadı");

  const more=new MorePanelsController(legacySetMoreTab.bind(window));
  const navigation=new NavigationController(legacyGo.bind(window));
  const api:UiBridgeApi={
    version:"4.0.0-alpha.2",
    navigate:(screen:ScreenId)=>navigation.open(screen,"api"),
    openMore:(panel:MorePanelId)=>more.open(panel),
    snapshot:()=>navigation.snapshot(more.current()),
    validate:()=>[...navigation.validate(),...more.validate()]
  };

  window.go=(screen:string)=>navigation.open(screen,"inline");
  window.setMoreTab=(panel:string)=>more.open(isMorePanelId(panel)?panel:"home");
  window.__YKS_UI__=api;

  const errors=api.validate();
  document.documentElement.dataset.v4Ui=errors.length?"warning":"ready";
  if(errors.length)console.warn("TypeScript arayüz köprüsü kontrolleri:",errors);
  return api;
}
