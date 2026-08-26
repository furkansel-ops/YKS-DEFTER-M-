import {activeId,byId,emit} from "./dom";
import {isScreenId,type ScreenId} from "./types";
import type {LegacyScreenFunction,ScreenEnvironment,ScreenModule,ScreenRenderSource,ScreenRuntimeApi} from "./screens/contracts";
import {homeScreen} from "./screens/home";
import {programScreen} from "./screens/program";
import {topicsScreen} from "./screens/topics";
import {examsScreen} from "./screens/exams";
import {progressScreen} from "./screens/progress";
import {focusScreen} from "./screens/focus";
import {moreScreen} from "./screens/more";

type LegacyFunction=(...args:unknown[])=>unknown;
type LegacyWindow=Window&Record<string,unknown>;

const SCREEN_MODULES:readonly ScreenModule[]=[
  homeScreen,programScreen,topicsScreen,examsScreen,progressScreen,focusScreen,moreScreen
];

const SCREEN_MAP=new Map<ScreenId,ScreenModule>(SCREEN_MODULES.map(module=>[module.id,module]));

class BrowserScreenEnvironment implements ScreenEnvironment{
  readonly #legacyWindow:LegacyWindow;

  constructor(legacyWindow:LegacyWindow){
    this.#legacyWindow=legacyWindow;
  }

  has(name:LegacyScreenFunction):boolean{
    return typeof this.#legacyWindow[name]==="function";
  }

  call(name:LegacyScreenFunction,...args:unknown[]):unknown{
    const callback=this.#legacyWindow[name];
    if(typeof callback!=="function")throw new Error(`Eski ekran işlevi bulunamadı: ${name}`);
    return (callback as LegacyFunction).apply(window,args);
  }

  optional(name:LegacyScreenFunction,...args:unknown[]):unknown{
    return this.has(name)?this.call(name,...args):undefined;
  }

  #safeDeferred(key:string,callback:()=>void):()=>void{
    return ()=>{
      try{callback();}
      catch(error){
        try{this.optional("infraError",`screen-deferred:${key}`,error);}catch{}
        console.error(`Ertelenmiş ekran işi başarısız: ${key}`,error);
      }
    };
  }

  afterPaint(key:string,callback:()=>void):void{
    const safe=this.#safeDeferred(key,callback);
    if(this.has("perfAfterPaint")){
      this.call("perfAfterPaint",key,safe);
      return;
    }
    requestAnimationFrame(safe);
  }

  idle(key:string,callback:()=>void,timeout:number):void{
    const safe=this.#safeDeferred(key,callback);
    if(this.has("perfIdle")){
      this.call("perfIdle",key,safe,timeout);
      return;
    }
    window.setTimeout(safe,Math.min(timeout,120));
  }

  isVisible(id:string):boolean{
    const element=byId(id);
    return !!element&&element.style.display!=="none";
  }
}

class ScreenRuntime implements ScreenRuntimeApi{
  readonly version="4.0.0-alpha.7" as const;
  readonly #environment:ScreenEnvironment;

  constructor(environment:ScreenEnvironment){
    this.#environment=environment;
  }

  render(screen:ScreenId,source:ScreenRenderSource="api"):boolean{
    const module=SCREEN_MAP.get(screen);
    if(!module)return false;
    const detail={screen,source,at:Date.now()};
    emit("yks:screen-render-before",detail);
    try{
      module.render(this.#environment,{source,at:detail.at});
      document.documentElement.dataset.v4Screen=screen;
      emit("yks:screen-render-after",detail);
      return true;
    }catch(error){
      this.#environment.optional("infraError",`screen:${screen}`,error);
      console.error(`TypeScript ekranı çizilemedi: ${screen}`,error);
      emit("yks:screen-render-error",{...detail,error:String(error)});
      return false;
    }
  }

  renderCurrent(source:ScreenRenderSource="external-state"):boolean{
    const id=activeId(".screen");
    return isScreenId(id)?this.render(id,source):false;
  }

  validate():string[]{
    const errors:string[]=[];
    for(const module of SCREEN_MODULES){
      for(const name of module.required){
        if(!this.#environment.has(name))errors.push(`${module.id} ekran işlevi bulunamadı: ${name}`);
      }
    }
    return errors;
  }
}

declare global{
  interface Window{
    __YKS_SCREEN_RUNTIME__?:ScreenRuntimeApi;
    renderActiveScreenNoScroll?:()=>unknown;
  }
}

export function installScreenRuntime():ScreenRuntimeApi{
  const legacyWindow=window as unknown as LegacyWindow;
  const legacyRefresh=window.renderActiveScreenNoScroll?.bind(window);
  const runtime:ScreenRuntimeApi=new ScreenRuntime(new BrowserScreenEnvironment(legacyWindow));
  window.__YKS_SCREEN_RUNTIME__=runtime;
  if(legacyRefresh){
    window.renderActiveScreenNoScroll=()=>runtime.renderCurrent("external-state")||legacyRefresh();
  }
  const errors=runtime.validate();
  document.documentElement.dataset.v4Screens=errors.length?"warning":"ready";
  if(errors.length)console.warn("TypeScript ekran modülü kontrolleri:",errors);
  return runtime;
}
