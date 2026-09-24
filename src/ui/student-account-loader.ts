type AccountWindow=Window&{
  __YKS_ACCOUNT_READY__?:Promise<boolean>;
  YKSAccountAuth?:{
    beforeSignIn?:(ctx:Record<string,any>)=>Promise<boolean>|boolean;
    onSignedIn?:(ctx:Record<string,any>)=>Promise<any>|any;
  };
};

const STUDENT_COACHING_RUNTIME_ID="studentCoachingRuntime";
const STUDENT_COACH_LINK_ID="studentCoachLink";
const STUDENT_PROGRAM_SHARE_V2_SCRIPT_ID="studentProgramShareV2";
const AUTH_SCRIPT_ID="authSessionRuntime";
const SETTINGS_SCRIPT_ID="settingsProfileRuntime";
const PENDING_ROLE="yks_account_role_pending";
const LEGACY_PENDING_COACH="yks_coach_profile_pending";

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
    try{sessionStorage.setItem(PENDING_ROLE,"student");sessionStorage.removeItem(LEGACY_PENDING_COACH)}catch{}
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

export function installStudentAccountLoader():boolean{
  const win=window as AccountWindow;
  if(win.__YKS_ACCOUNT_READY__)return true;
  const settingsReady=loadModuleScript(SETTINGS_SCRIPT_ID,"./settings-profile-runtime.js?v=2.6.0");
  win.__YKS_ACCOUNT_READY__=(async()=>{
    const bridgeReady=await loadModuleScript(STUDENT_COACHING_RUNTIME_ID,"./student-coaching-runtime.js?v=1.2.1");
    if(!bridgeReady)return settingsReady;
    forceStudentOnlyRegistration(win);
    const linkReady=await loadModuleScript(STUDENT_COACH_LINK_ID,"./student-coach-link.js?v=1.0.0");
    if(!linkReady)return settingsReady;
    const programShareReady=await loadModuleScript(STUDENT_PROGRAM_SHARE_V2_SCRIPT_ID,"./student-program-share-v2.js?v=3.1.0");
    if(!programShareReady)return settingsReady;
    await loadModuleScript(AUTH_SCRIPT_ID,"./auth-session-runtime.js?v=1.6.0");
    return settingsReady;
  })();
  return true;
}
