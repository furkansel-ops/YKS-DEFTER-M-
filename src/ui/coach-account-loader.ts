type AccountWindow=Window&{
  __YKS_ACCOUNT_READY__?:Promise<boolean>;
};

const SCRIPT_ID="coachAccountRuntime";

export function installCoachAccountLoader():boolean{
  const win=window as AccountWindow;
  if(document.getElementById(SCRIPT_ID))return true;
  let settle:(value:boolean)=>void=()=>{};
  win.__YKS_ACCOUNT_READY__=new Promise<boolean>(resolve=>{settle=resolve;});
  const script=document.createElement("script");
  script.id=SCRIPT_ID;
  script.type="module";
  script.src="./coach-account-runtime.js";
  script.addEventListener("load",()=>settle(true),{once:true});
  script.addEventListener("error",()=>settle(false),{once:true});
  document.head.appendChild(script);
  return true;
}
