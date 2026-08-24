import type {NavigationSource,ScreenId} from "../types";

export type ScreenRenderSource=NavigationSource|"external-state";

export type LegacyScreenFunction=
  |"activeAnaTab"
  |"activeMoreTab"
  |"infraError"
  |"perfAfterPaint"
  |"perfIdle"
  |"renderBlankWrong"
  |"renderCalendar"
  |"renderCompareOpts"
  |"renderDayDetail"
  |"renderDenemeGun"
  |"renderDenemeHistory"
  |"renderExam2"
  |"renderHome"
  |"renderNetGain"
  |"renderPlan"
  |"renderPomo"
  |"renderProcrast"
  |"renderProgress"
  |"renderRank"
  |"renderReviewQueue"
  |"renderSubjects"
  |"renderTargets"
  |"renderTimeDist"
  |"renderWrongTopics"
  |"setAnaTab"
  |"setMoreTab";

export interface ScreenRenderContext{
  readonly source:ScreenRenderSource;
  readonly at:number;
}

export interface ScreenEnvironment{
  has(name:LegacyScreenFunction):boolean;
  call(name:LegacyScreenFunction,...args:unknown[]):unknown;
  optional(name:LegacyScreenFunction,...args:unknown[]):unknown;
  afterPaint(key:string,callback:()=>void):void;
  idle(key:string,callback:()=>void,timeout:number):void;
  isVisible(id:string):boolean;
}

export interface ScreenModule{
  readonly id:ScreenId;
  readonly required:readonly LegacyScreenFunction[];
  render(environment:ScreenEnvironment,context:ScreenRenderContext):void;
}

export interface ScreenRuntimeApi{
  readonly version:"4.0.0-alpha.7";
  render(screen:ScreenId,source?:ScreenRenderSource):boolean;
  renderCurrent(source?:ScreenRenderSource):boolean;
  validate():string[];
}
