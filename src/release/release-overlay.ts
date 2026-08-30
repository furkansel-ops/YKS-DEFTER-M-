import {compareBuildVersions} from "../pwa/pwa-runtime.ts";
import {RELEASE_BUILD,RELEASE_VERSION} from "./version.ts";

type AnyFn=(...args:unknown[])=>unknown;
type RuntimeRecord=Record<string,unknown>;

function runtimeRecord():RuntimeRecord{return window as unknown as RuntimeRecord;}

function patchVersionUi():void{
  document.documentElement.dataset.appVersion=RELEASE_VERSION;
  document.documentElement.dataset.v4ReleaseBuild=RELEASE_BUILD;
  document.documentElement.dataset.v42ReleaseOverlay="ready";
  const label=document.getElementById("appVersionLabel");
  if(label)label.textContent=`${RELEASE_VERSION} · Kararlı`;
}

function patchInfrastructureVersion():void{
  const box=document.getElementById("infraBox");if(!box)return;
  for(const row of box.querySelectorAll<HTMLElement>(".dayrow")){
    const key=row.querySelector<HTMLElement>(".k"),value=row.querySelector<HTMLElement>(".v");
    if(key?.textContent?.trim()==="Sürüm"&&value)value.textContent=`v${RELEASE_VERSION} · şema 21`;
  }
}

async function patchDiagnosticsVersion():Promise<void>{
  const box=document.getElementById("v2DiagBox");if(!box)return;
  let remoteVersion="";
  try{
    const response=await fetch(`./version.json?v42=${Date.now()}`,{cache:"no-store"});
    if(response.ok){const data=await response.json() as {version?:unknown};remoteVersion=String(data.version??"");}
  }catch{}
  for(const row of box.querySelectorAll<HTMLElement>(".dayrow")){
    const key=row.querySelector<HTMLElement>(".k"),value=row.querySelector<HTMLElement>(".v");
    if(key?.textContent?.trim()!=="Sunucu sürümü"||!value)continue;
    const ok=remoteVersion===RELEASE_VERSION;
    value.classList.toggle("diag-ok",ok);value.classList.toggle("diag-bad",!ok);
    value.textContent=`${ok?"✓":"!"} v${remoteVersion||"?"} / cihaz v${RELEASE_VERSION}`;
  }
}

function wrapAfter(name:string,after:()=>void):void{
  const runtime=runtimeRecord(),original=runtime[name];if(typeof original!=="function")return;
  runtime[name]=((...args:unknown[])=>{
    const result=(original as AnyFn)(...args);queueMicrotask(after);return result;
  }) satisfies AnyFn;
}

function patchUpdateRuntime():void{
  const runtime=runtimeRecord();
  runtime.remoteVersionIsNewer=((value:unknown)=>typeof value==="string"&&value.length>0&&compareBuildVersions(value,RELEASE_BUILD)>0) satisfies AnyFn;
  const originalShow=runtime.showAppUpdate;
  if(typeof originalShow==="function")runtime.showAppUpdate=((...args:unknown[])=>{
    const result=(originalShow as AnyFn)(...args),detail=document.getElementById("appUpdateDetail"),remote=String(args[1]??"");
    if(detail)detail.textContent=remote?`${remote} hazır · mevcut ${RELEASE_BUILD}`:"Güncelleme birkaç saniye sürer.";
    return result;
  }) satisfies AnyFn;
}

function patchDiagnosticsRuntime():void{
  const runtime=runtimeRecord(),original=runtime.runFullDiagnostics;if(typeof original!=="function")return;
  runtime.runFullDiagnostics=(async(...args:unknown[])=>{
    const result=await Promise.resolve((original as AnyFn)(...args));await patchDiagnosticsVersion();return result;
  }) satisfies AnyFn;
}

export function installReleaseOverlay():void{
  if(document.documentElement.dataset.v42ReleaseOverlay==="ready")return;
  patchUpdateRuntime();
  wrapAfter("renderSettings",patchVersionUi);
  wrapAfter("renderInfraHealth",()=>{patchVersionUi();patchInfrastructureVersion();});
  patchDiagnosticsRuntime();
  patchVersionUi();patchInfrastructureVersion();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{patchVersionUi();patchInfrastructureVersion();},{once:true});
  window.addEventListener("yks:v4-bootstrap",()=>{patchVersionUi();patchInfrastructureVersion();});
}
