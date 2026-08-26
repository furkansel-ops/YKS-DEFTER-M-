import {SCREEN_IDS,type ScreenId} from "../ui/types.ts";

export interface ReleaseCheck{
  name:string;
  ok:boolean;
  message?:string;
}

export interface ReleaseReport{
  version:"4.1.0";
  ok:boolean;
  startedAt:number;
  finishedAt:number;
  checks:ReleaseCheck[];
}

export interface ReleaseRunOptions{
  exerciseScreens?:boolean;
  persistRoundTrip?:boolean;
}

export interface ReleaseApi{
  readonly version:"4.1.0";
  run(options?:ReleaseRunOptions):Promise<ReleaseReport>;
  latest():ReleaseReport|null;
}

type LegacyReleaseResult={ok:boolean;checks?:unknown[]};

declare global{
  interface Window{
    __YKS_RELEASE__?:ReleaseApi;
    runReleaseSelfTest?:()=>LegacyReleaseResult;
  }
}

async function withTimeout<T>(promise:Promise<T>,milliseconds:number):Promise<T>{
  let timer:ReturnType<typeof setTimeout>|undefined;
  const timeout=new Promise<never>((_,reject)=>{timer=globalThis.setTimeout(()=>reject(new Error("Kontrol zaman aşımına uğradı")),milliseconds);});
  try{return await Promise.race([promise,timeout]);}
  finally{if(timer!==undefined)globalThis.clearTimeout(timer);}
}

function publish(documentRef:Document,report:ReleaseReport):void{
  documentRef.documentElement.dataset.v4Release=report.ok?"ready":"failed";
  documentRef.documentElement.dataset.v4ReleaseChecks=String(report.checks.length);
  let output=documentRef.getElementById("v4ReleaseResult");
  if(!output){output=documentRef.createElement("pre");output.id="v4ReleaseResult";output.hidden=true;documentRef.body.appendChild(output);}
  output.textContent=(report.ok?"YKS_V4_RELEASE_OK":"YKS_V4_RELEASE_FAIL")+" "+report.checks.map(check=>`${check.name}:${check.ok?"ok":"fail"}`).join(",");
}

export function createReleaseRuntime(host:Window,documentRef:Document):ReleaseApi{
  let lastReport:ReleaseReport|null=null,running:Promise<ReleaseReport>|null=null;
  const run=(options:ReleaseRunOptions={}):Promise<ReleaseReport>=>running??=runChecks(options).finally(()=>{running=null;});

  async function runChecks(options:ReleaseRunOptions):Promise<ReleaseReport>{
    const startedAt=Date.now(),checks:ReleaseCheck[]=[];
    documentRef.documentElement.dataset.v4Release="running";
    const add=async(name:string,test:()=>boolean|Promise<boolean>):Promise<void>=>{
      try{checks.push({name,ok:!!(await test())});}
      catch(error){checks.push({name,ok:false,message:error instanceof Error?error.message:String(error)});}
    };

    await add("bootstrap",()=>host.__YKS_V4_BOOTSTRAP__?.version==="4.1.0"&&host.__YKS_V4_BOOTSTRAP__?.channel==="stable"&&host.__YKS_V4_BOOTSTRAP__?.legacyRuntime===true);
    await add("common-services",()=>host.__YKS_SERVICES__?.validate().length===0);
    await add("domain-services",()=>host.__YKS_DOMAIN__?.validate().length===0);
    await add("screen-runtime",()=>host.__YKS_SCREEN_RUNTIME__?.validate().length===0);
    await add("ui-bridge",()=>host.__YKS_UI__?.validate().length===0);
    await add("data-bridge",()=>host.__YKS_DATA__?.validate().length===0&&host.__YKS_DATA__?.schemaVersion===21);
    await add("seven-screens",()=>documentRef.querySelectorAll(".screen").length===SCREEN_IDS.length);
    await add("one-active-screen",()=>documentRef.querySelectorAll(".screen.active").length===1);
    await add("legacy-release",()=>typeof host.runReleaseSelfTest==="function"&&host.runReleaseSelfTest().ok);

    const data=host.__YKS_DATA__,runtime=host.YKSLegacyState;
    let raw="";
    await add("dexie-ready",async()=>{
      if(!data)return false;
      const result=await withTimeout(data.ready,8_000);
      return result.ok&&!result.degraded;
    });
    if(options.persistRoundTrip!==false){
      await add("state-readable",()=>{raw=runtime?.readJSON()??"";const value=JSON.parse(raw);return value?.v===21;});
      await add("dexie-write-through",async()=>{
        if(!data||!raw)return false;
        const result=await data.captureLegacyWrite(raw);await data.flush();
        return result.ok;
      });
      await add("dexie-snapshot",async()=>{
        if(!data)return false;
        const snapshot=await data.indexedSnapshot();
        return snapshot.database==="yks-defterim-v4"&&snapshot.statePresent&&snapshot.schema===21&&!!snapshot.sourceHash;
      });
      let cloudJSON="";
      await add("firebase-payload",async()=>{
        if(!data)return false;
        const payload=await data.cloudPayload();
        if(!payload.ok)return false;
        cloudJSON=payload.json;
        const value=JSON.parse(payload.json);
        return payload.schema===21&&payload.source==="dexie"&&value.focus?.sw?.run===false&&value.yt?.key==="";
      });
      await add("firebase-download-path",async()=>{
        if(!data||!raw||!cloudJSON)return false;
        const result=await data.applyCloudJSON(raw);
        return result.ok&&result.status==="applied"&&JSON.parse(result.json??raw).v===21;
      });
    }

    if(options.exerciseScreens!==false){
      const ui=host.__YKS_UI__,original=ui?.snapshot().activeScreen??"home";
      await add("screen-transitions",()=>{
        if(!ui)return false;
        let valid=true;
        try{
          for(const screen of SCREEN_IDS){ui.navigate(screen);if(ui.snapshot().activeScreen!==screen)valid=false;}
        }finally{ui.navigate(original as ScreenId);}
        return valid;
      });
      await add("screen-restored",()=>host.__YKS_UI__?.snapshot().activeScreen===original);
      if(raw)await add("state-restored",async()=>!!data&&(await data.applyCloudJSON(raw)).ok);
    }

    const report:ReleaseReport={version:"4.1.0",ok:checks.every(check=>check.ok),startedAt,finishedAt:Date.now(),checks};
    lastReport=report;publish(documentRef,report);
    host.dispatchEvent(new CustomEvent<ReleaseReport>("yks:release-check",{detail:report}));
    return report;
  }

  return {version:"4.1.0",run,latest:()=>lastReport};
}

export function installReleaseRuntime():ReleaseApi{
  const api=createReleaseRuntime(window,document);
  window.__YKS_RELEASE__=api;
  try{
    if(new URLSearchParams(location.search).get("selftest")==="v4")window.setTimeout(()=>void api.run({exerciseScreens:true,persistRoundTrip:true}),1_200);
  }catch(error){console.warn("v4 kararlı sürüm kontrolü başlatılamadı",error);}
  return api;
}
