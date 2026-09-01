interface LabInteractionsApi {ensure():boolean;}
interface LabInteractionsBridge {check():void;}
type RouteDetail={to?:string};

declare global {interface Window {YKSLabInteractionsBridgeV44?:LabInteractionsBridge;}}

export function installLabInteractionsBridgeV44():LabInteractionsBridge {
  if(window.YKSLabInteractionsBridgeV44)return window.YKSLabInteractionsBridgeV44;
  let api:LabInteractionsApi|null=null,loading=false,scheduled=false;
  const visible=()=>{const lab=document.getElementById("v320LearningLab");return !!lab&&lab.isConnected&&lab.getClientRects().length>0;};
  async function check(){
    if(api){if(visible())api.ensure();return;}
    if(loading||!visible())return;
    loading=true;
    try{const module=await import("./lab-interactions-v44.ts");api=module.createLabInteractionsV44();if(visible())api.ensure();}
    catch{/* Legacy laboratuvar çalışmaya devam eder. */}
    finally{loading=false;}
  }
  const schedule=()=>{
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{scheduled=false;void check();});
  };
  window.addEventListener("yks:more-after",event=>{
    const detail=(event as CustomEvent<RouteDetail>).detail;
    if(detail?.to==="lab")schedule();
  });
  window.addEventListener("yks:navigation-after",event=>{
    const detail=(event as CustomEvent<RouteDetail>).detail;
    if(detail?.to==="more"&&visible())schedule();
  });
  if(visible())schedule();
  const bridge={check:()=>{void check();}};
  window.YKSLabInteractionsBridgeV44=bridge;
  return bridge;
}
