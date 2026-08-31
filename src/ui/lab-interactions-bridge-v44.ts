interface LabInteractionsApi {ensure():boolean;}
interface LabInteractionsBridge {check():void;}

declare global {interface Window {YKSLabInteractionsBridgeV44?:LabInteractionsBridge;}}

export function installLabInteractionsBridgeV44():LabInteractionsBridge {
  if(window.YKSLabInteractionsBridgeV44)return window.YKSLabInteractionsBridgeV44;
  let api:LabInteractionsApi|null=null,loading=false;
  const visible=()=>{const lab=document.getElementById("v320LearningLab");return !!lab&&lab.getClientRects().length>0;};
  async function check(){
    if(api){api.ensure();return;}if(loading||!visible())return;loading=true;
    try{const module=await import("./lab-interactions-v44.ts");api=module.createLabInteractionsV44();api.ensure();}catch{/* Legacy laboratuvar çalışmaya devam eder. */}finally{loading=false;}
  }
  const schedule=()=>queueMicrotask(()=>{void check();});
  window.addEventListener("yks:navigation-after",schedule);document.addEventListener("yks:navigation-after",schedule);
  document.addEventListener("click",schedule,{passive:true});window.addEventListener("focus",schedule);
  schedule();
  const bridge={check:()=>{void check();}};window.YKSLabInteractionsBridgeV44=bridge;return bridge;
}
