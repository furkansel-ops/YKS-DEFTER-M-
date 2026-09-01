export const SCREEN_IDS=["home","program","topics","deneme","progress","pomo","pp","more"] as const;
export type ScreenId=(typeof SCREEN_IDS)[number];

export const MORE_PANEL_IDS=["home","lab","kay","tak","roz","veri","ayar","about"] as const;
export type MorePanelId=(typeof MORE_PANEL_IDS)[number];

export type NavigationSource="legacy"|"inline"|"api";

export interface NavigationDetail{
  from:ScreenId|null;
  to:ScreenId;
  source:NavigationSource;
  at:number;
}

export interface UiSnapshot{
  activeScreen:ScreenId|null;
  activeMorePanel:MorePanelId|null;
  screenCount:number;
  tabCount:number;
}

export interface UiBridgeApi{
  readonly version:"4.0.0-alpha.7";
  navigate(screen:ScreenId):unknown;
  openMore(panel:MorePanelId):unknown;
  snapshot():UiSnapshot;
  validate():string[];
}

export function isScreenId(value:unknown):value is ScreenId{
  return typeof value==="string"&&(SCREEN_IDS as readonly string[]).includes(value);
}

export function isMorePanelId(value:unknown):value is MorePanelId{
  return typeof value==="string"&&(MORE_PANEL_IDS as readonly string[]).includes(value);
}
