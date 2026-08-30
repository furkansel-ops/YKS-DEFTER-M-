declare global{
  interface Window{
    YKSRepeatCenterV42?:{version:string;render():unknown};
  }
}

const SCRIPT_SRC="./modules/repeat-center-v42.js?v=4.2.0-r1";

/** Load after the legacy intelligence scripts, without changing their bootstrap contract. */
export function installRepeatCenterV42():void{
  if(window.YKSRepeatCenterV42||document.querySelector("script[data-yks-repeat-center-v42]"))return;
  const script=document.createElement("script");
  script.src=SCRIPT_SRC;
  script.async=false;
  script.setAttribute("data-yks-repeat-center-v42","1");
  script.onerror=()=>{
    try{(window as unknown as {infraError?:(scope:string,error:unknown)=>unknown}).infraError?.("repeat-center-v42-load",new Error("Akıllı Tekrar Merkezi 2.0 yüklenemedi"));}catch{}
  };
  document.head.appendChild(script);
}
