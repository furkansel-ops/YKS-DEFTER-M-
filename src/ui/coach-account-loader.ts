type AccountWindow=Window&{
  __YKS_ACCOUNT_READY__?:Promise<boolean>;
};

const COACH_SCRIPT_ID="coachAccountRuntime";
const AUTH_SCRIPT_ID="authSessionRuntime";

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

export function installCoachAccountLoader():boolean{
  const win=window as AccountWindow;
  if(win.__YKS_ACCOUNT_READY__)return true;
  win.__YKS_ACCOUNT_READY__=(async()=>{
    const coachReady=await loadModuleScript(COACH_SCRIPT_ID,"./coach-account-runtime.js");
    if(!coachReady)return false;
    return loadModuleScript(AUTH_SCRIPT_ID,"./auth-session-runtime.js");
  })();
  return true;
}
