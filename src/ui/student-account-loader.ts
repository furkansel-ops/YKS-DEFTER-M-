type AccountWindow=Window&{
  __YKS_ACCOUNT_READY__?:Promise<boolean>;
  __YKS_ACCOUNT_LOADER_READY__?:Promise<boolean>;
  __YKS_DATA__?:{flush?:()=>Promise<void>};
  save?:(...args:unknown[])=>unknown;
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
const pendingScripts=new Map<string,Promise<boolean>>();

function loadModuleScript(id:string,src:string):Promise<boolean>{
  const existing=document.getElementById(id) as HTMLScriptElement|null;
  if(existing?.dataset.loaded==="1")return Promise.resolve(true);
  const pending=pendingScripts.get(id);if(pending)return pending;
  const result=new Promise<boolean>(resolve=>{
    const script=existing||document.createElement("script");
    script.id=id;
    script.type="module";
    if(!existing){
      script.src=src;
    }
    const finish=(ok:boolean)=>{
      script.removeEventListener("load",onLoad);script.removeEventListener("error",onError);
      if(ok)script.dataset.loaded="1";
      else script.remove();
      resolve(ok);
    };
    const onLoad=()=>finish(true),onError=()=>finish(false);
    script.addEventListener("load",onLoad,{once:true});
    script.addEventListener("error",onError,{once:true});
    if(!existing)try{document.head.appendChild(script);}catch{finish(false);}
  });
  pendingScripts.set(id,result);
  void result.then(()=>{if(pendingScripts.get(id)===result)pendingScripts.delete(id);});
  return result;
}

function showAccountRecovery(win:AccountWindow):void{
  if(document.getElementById("studentAccountRecovery"))return;
  const host=document.getElementById("cloudSyncBox")||document.getElementById("mrp_ayar");
  if(!host)return;
  const notice=document.createElement("div"),message=document.createElement("p"),button=document.createElement("button");
  notice.id="studentAccountRecovery";notice.setAttribute("role","status");
  message.textContent="Hesap araçları yüklenemedi. Bağlantını kontrol edip yeniden yükleyebilirsin.";
  button.type="button";button.className="btn";button.textContent="Hesabı tekrar yükle";
  button.addEventListener("click",async()=>{
    if(button.disabled)return;
    button.disabled=true;
    let timeout:ReturnType<typeof setTimeout>|undefined;
    try{
      if(win.save?.()===false)throw new Error("Yerel kayıt tamamlanamadı");
      await Promise.race([
        win.__YKS_DATA__?.flush?.()??Promise.resolve(),
        new Promise<never>((_,reject)=>{timeout=setTimeout(()=>reject(new Error("Kayıt bekleniyor")),5000);})
      ]);
      // A full reload resets failed transitive module imports and initializes
      // every account hook against the same current Firebase session.
      win.location.reload();
    }catch{
      message.textContent="Cihazdaki kayıt tamamlanamadı. Verilerini korumak için sayfa yenilenmedi; tekrar deneyebilirsin.";
      button.disabled=false;
    }finally{if(timeout!==undefined)clearTimeout(timeout);}
  });
  notice.append(message,button);host.appendChild(notice);
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
  if(win.__YKS_ACCOUNT_LOADER_READY__)return true;
  const settingsReady=loadModuleScript(SETTINGS_SCRIPT_ID,"./settings-profile-runtime.js?v=3.0.0");
  document.documentElement.dataset.studentAccountRuntime="loading";
  const ready=(async()=>{
    const bridgeReady=await loadModuleScript(STUDENT_COACHING_RUNTIME_ID,"./student-coaching-runtime.js?v=1.2.7");
    if(!bridgeReady||!forceStudentOnlyRegistration(win))return false;
    const linkReady=await loadModuleScript(STUDENT_COACH_LINK_ID,"./student-coach-link.js?v=1.2.0");
    if(!linkReady)return false;
    const programShareReady=await loadModuleScript(STUDENT_PROGRAM_SHARE_V2_SCRIPT_ID,"./student-program-share-v2.js?v=3.6.1");
    if(!programShareReady)return false;
    const authReady=await loadModuleScript(AUTH_SCRIPT_ID,"./auth-session-runtime.js?v=1.6.0");
    if(!authReady)return false;
    return settingsReady;
  })().catch(error=>{console.error("Öğrenci hesap modülleri yüklenemedi",error);return false;});
  win.__YKS_ACCOUNT_READY__=ready;
  win.__YKS_ACCOUNT_LOADER_READY__=ready;
  void ready.then(ok=>{
    // The bridge replaces the shared auth-ready promise; this chain still owns recovery.
    document.documentElement.dataset.studentAccountRuntime=ok?"ready":"deferred";
    if(!ok)showAccountRecovery(win);
  });
  return true;
}
