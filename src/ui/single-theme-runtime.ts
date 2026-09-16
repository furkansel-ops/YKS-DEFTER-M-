import "./single-theme-runtime.css";

const SIGNATURE_THEME="graphite";
const SIGNATURE_THEME_COLOR="#121418";

type LegacyState={theme?:string;[key:string]:unknown};
type SingleThemeWindow=Window&{
  S?:LegacyState;
  setTheme?:(theme?:string)=>unknown;
  cycleTheme?:()=>unknown;
  YKSLegacyState?:{
    readState?:()=>LegacyState|null|undefined;
    save?:()=>unknown;
  };
};

function forceRootTheme():void{
  const root=document.documentElement;
  if(root.getAttribute("data-theme")!==SIGNATURE_THEME)root.setAttribute("data-theme",SIGNATURE_THEME);
  root.style.colorScheme="dark";
  root.dataset.themeMode="single";
  root.dataset.themeName="yks-defterim";
  const meta=document.getElementById("metaTheme");
  if(meta instanceof HTMLMetaElement)meta.content=SIGNATURE_THEME_COLOR;
}

function migrateLegacyTheme(win:SingleThemeWindow):void{
  try{
    const state=win.YKSLegacyState?.readState?.()||win.S;
    if(!state||typeof state!=="object"||state.theme===SIGNATURE_THEME)return;
    state.theme=SIGNATURE_THEME;
    win.YKSLegacyState?.save?.();
  }catch{}
}

function installLegacyGuards(win:SingleThemeWindow):void{
  const apply=()=>{
    migrateLegacyTheme(win);
    forceRootTheme();
    return SIGNATURE_THEME;
  };
  win.setTheme=()=>apply();
  win.cycleTheme=()=>apply();
}

export function installSingleThemeRuntime():{installed:true;theme:string;destroy:()=>void}{
  const win=window as SingleThemeWindow;
  forceRootTheme();
  migrateLegacyTheme(win);
  installLegacyGuards(win);

  let forcing=false;
  const observer=new MutationObserver(()=>{
    if(forcing||document.documentElement.getAttribute("data-theme")===SIGNATURE_THEME)return;
    forcing=true;
    forceRootTheme();
    forcing=false;
  });
  observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});

  const keepSingle=()=>{
    migrateLegacyTheme(win);
    installLegacyGuards(win);
    forceRootTheme();
  };
  window.addEventListener("yks:data-primary-ready",keepSingle);
  window.addEventListener("yks:data-changed",keepSingle);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")keepSingle();});

  return {installed:true,theme:SIGNATURE_THEME,destroy:()=>observer.disconnect()};
}

export {SIGNATURE_THEME,SIGNATURE_THEME_COLOR};
