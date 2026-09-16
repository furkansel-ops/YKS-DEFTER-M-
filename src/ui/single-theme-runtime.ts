const SIGNATURE_THEME="graphite";
const SIGNATURE_THEME_COLOR="#121418";
const SETTINGS_COPY="Hesap, hedefler, kişiselleştirme ve bildirimler";
const PERSONALIZATION_COPY="Sınav kapsamı ve Bugün ekranındaki yardımcı alanları tek yerden düzenle. Uygulamanın görünümü YKS Defterim imza temasında sabittir.";

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
  root.dataset.themeControl="single";
  const meta=document.getElementById("metaTheme");
  if(meta instanceof HTMLMetaElement)meta.content=SIGNATURE_THEME_COLOR;
}

function polishSingleThemeUi():void{
  document.getElementById("themeBtn")?.remove();
  document.getElementById("themeGrid")?.closest(".card")?.setAttribute("hidden","");
  document.querySelectorAll(".v43-theme-group").forEach(node=>node.remove());

  const personalizationHint=document.querySelector<HTMLElement>("#v43Personalization .v43-personal-head .hint");
  if(personalizationHint&&personalizationHint.textContent!==PERSONALIZATION_COPY)personalizationHint.textContent=PERSONALIZATION_COPY;

  const settingsSub=document.querySelector<HTMLElement>("#mrp_ayar .v30-subhead p");
  if(settingsSub&&settingsSub.textContent!==SETTINGS_COPY)settingsSub.textContent=SETTINGS_COPY;

  document.querySelectorAll<HTMLElement>(".v30-menu-card").forEach(card=>{
    if(!card.getAttribute("onclick")?.includes("settings"))return;
    const small=card.querySelector<HTMLElement>("small");
    if(small&&small.textContent!==SETTINGS_COPY)small.textContent=SETTINGS_COPY;
  });
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
    polishSingleThemeUi();
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
  polishSingleThemeUi();

  let forcing=false;
  let polishQueued=false;
  const schedulePolish=()=>{
    if(polishQueued)return;
    polishQueued=true;
    queueMicrotask(()=>{
      polishQueued=false;
      forceRootTheme();
      polishSingleThemeUi();
    });
  };

  const rootObserver=new MutationObserver(()=>{
    if(forcing||document.documentElement.getAttribute("data-theme")===SIGNATURE_THEME)return;
    forcing=true;
    forceRootTheme();
    forcing=false;
  });
  rootObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});

  const bodyObserver=new MutationObserver(schedulePolish);
  if(document.body)bodyObserver.observe(document.body,{childList:true,subtree:true});

  const keepSingle=()=>{
    migrateLegacyTheme(win);
    installLegacyGuards(win);
    forceRootTheme();
    polishSingleThemeUi();
  };
  window.addEventListener("yks:data-primary-ready",keepSingle);
  window.addEventListener("yks:data-changed",keepSingle);
  window.addEventListener("yks:v43-personalization",keepSingle);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")keepSingle();});

  return {
    installed:true,
    theme:SIGNATURE_THEME,
    destroy:()=>{rootObserver.disconnect();bodyObserver.disconnect();}
  };
}

export {SIGNATURE_THEME,SIGNATURE_THEME_COLOR};
