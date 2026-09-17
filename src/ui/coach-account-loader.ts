type AccountWindow=Window&{
  __YKS_ACCOUNT_READY__?:Promise<boolean>;
  YKSAccountAuth?:{
    beforeSignIn?:(ctx:Record<string,any>)=>Promise<boolean>|boolean;
    onSignedIn?:(ctx:Record<string,any>)=>Promise<any>|any;
  };
};

const COACH_SCRIPT_ID="coachAccountRuntime";
const COACH_DIRECTORY_SCRIPT_ID="coachStudentDirectoryV2";
const COACH_LINK_HOTFIX_SCRIPT_ID="coachStudentLinkHotfix";
const COACH_PROGRAM_SHARE_V2_SCRIPT_ID="coachProgramShareV2";
const AUTH_SCRIPT_ID="authSessionRuntime";
const SETTINGS_SCRIPT_ID="settingsProfileRuntime";
const PENDING_ROLE="yks_account_role_pending";
const PENDING_COACH="yks_coach_profile_pending";
const COACH_PANEL_URL="https://furkansel-ops.github.io/YKS-DEFTER-M-Ko-Paneli/";

function loadModuleScript(id:string,src:string):Promise<boolean>{
  const existing=document.getElementById(id) as HTMLScriptElement|null;
  if(existing?.dataset.loaded==="1")return Promise.resolve(true);
  if(existing)return new Promise(resolve=>{
    existing.addEventListener("load",()=>resolve(true),{once:true});
    existing.addEventListener("error",()=>resolve(false),{once:true});
  });
  return new Promise(resolve=>{
    const script=document.createElement("script");
    script.id=id;
    script.type="module";
    script.src=src;
    script.addEventListener("load",()=>{script.dataset.loaded="1";resolve(true)},{once:true});
    script.addEventListener("error",()=>resolve(false),{once:true});
    document.head.appendChild(script);
  });
}

function forceStudentOnlyRegistration(win:AccountWindow):boolean{
  const auth=win.YKSAccountAuth;
  if(!auth)return false;
  auth.beforeSignIn=async ctx=>{
    try{
      sessionStorage.setItem(PENDING_ROLE,"student");
      sessionStorage.removeItem(PENDING_COACH);
    }catch{}
    try{
      ctx.status?.("Google açılıyor…","connecting","Öğrenci hesabı");
      await ctx.setPersistence(ctx.auth,ctx.browserLocalPersistence);
      await ctx.signInWithPopup(ctx.auth,ctx.provider);
    }catch(error){
      ctx.status?.("Giriş hatası","error",ctx.authErrorText?.(error)||String((error as Error)?.message||"Giriş yapılamadı").slice(0,100));
    }
    return true;
  };
  document.documentElement.dataset.publicRegistration="student-only";
  return true;
}

function routeCoachAccountsToStandalonePanel(win:AccountWindow):boolean{
  const auth=win.YKSAccountAuth;
  if(!auth?.onSignedIn)return false;
  const previousOnSignedIn=auth.onSignedIn.bind(auth);
  auth.onSignedIn=async ctx=>{
    let observer:MutationObserver|null=null;
    try{
      observer=new MutationObserver(()=>document.getElementById("yksCoachDashboard")?.remove());
      observer.observe(document.documentElement,{childList:true,subtree:true});
    }catch{}
    let result:any;
    try{
      result=await previousOnSignedIn(ctx);
    }finally{
      try{observer?.disconnect()}catch{}
      document.getElementById("yksCoachDashboard")?.remove();
    }
    if(result?.role==="coach"){
      window.location.replace(COACH_PANEL_URL);
      return {...result,redirected:true};
    }
    return result;
  };
  document.documentElement.dataset.coachDashboard="standalone";
  return true;
}

export function installCoachAccountLoader():boolean{
  const win=window as AccountWindow;
  if(win.__YKS_ACCOUNT_READY__)return true;
  win.__YKS_ACCOUNT_READY__=(async()=>{
    const coachReady=await loadModuleScript(COACH_SCRIPT_ID,"./coach-account-runtime.js?v=1.0.0");
    if(!coachReady||!forceStudentOnlyRegistration(win)||!routeCoachAccountsToStandalonePanel(win))return false;
    const directoryReady=await loadModuleScript(COACH_DIRECTORY_SCRIPT_ID,"./coach-student-directory-v2.js?v=2.0.1");
    if(!directoryReady)return false;
    const linkHotfixReady=await loadModuleScript(COACH_LINK_HOTFIX_SCRIPT_ID,"./coach-student-link-hotfix.js?v=1.0.0");
    if(!linkHotfixReady)return false;
    const programShareReady=await loadModuleScript(COACH_PROGRAM_SHARE_V2_SCRIPT_ID,"./coach-program-share-v2.js?v=2.0.0");
    if(!programShareReady)return false;
    const authReady=await loadModuleScript(AUTH_SCRIPT_ID,"./auth-session-runtime.js?v=1.6.0");
    if(!authReady)return false;
    return loadModuleScript(SETTINGS_SCRIPT_ID,"./settings-profile-runtime.js?v=2.1.0");
  })();
  return true;
}
