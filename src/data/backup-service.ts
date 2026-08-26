import {DATA_SCHEMA_VERSION,type YksStateCandidate} from "./contracts.ts";
import {decodeState,isRecord,stateHash,textBytes} from "./codec.ts";

export const BACKUP_FORMAT_VERSION=3 as const;
export const MAX_BACKUP_BYTES=25*1024*1024;

export interface BackupSummary{
  format:number;
  appVersion:string;
  exportedAt:string|null;
  schema:number;
  bytes:number;
  integrity:"verified"|"legacy";
  days:number;
  exams:number;
  topics:number;
  cards:number;
}

export interface BackupPackage{
  app:"YKS Defterim";
  format:typeof BACKUP_FORMAT_VERSION;
  appVersion:string;
  schemaVersion:number;
  exportedAt:string;
  integrity:{algorithm:"fnv1a-32";hash:string};
  data:YksStateCandidate;
}

export type BackupBuildResult=
  |{ok:true;text:string;hash:string;summary:BackupSummary}
  |{ok:false;message:string};

export type BackupInspectResult=
  |{ok:true;json:string;state:YksStateCandidate;summary:BackupSummary}
  |{ok:false;kind:"too-large"|"invalid-json"|"invalid-package"|"integrity"|"future-schema";message:string};

function safeCount(value:unknown):number{
  return Array.isArray(value)?value.length:0;
}

function objectCount(value:unknown):number{
  return isRecord(value)?Object.keys(value).length:0;
}

function dayCount(state:YksStateCandidate):number{
  const days=new Set<string>();
  for(const source of [state.solved,state.pomoMin])if(isRecord(source))for(const key of Object.keys(source))days.add(key);
  return days.size;
}

function summarize(state:YksStateCandidate,format:number,appVersion:string,exportedAt:string|null,bytes:number,integrity:"verified"|"legacy"):BackupSummary{
  const learning=isRecord(state.learning)?state.learning:null;
  return {
    format,appVersion,exportedAt,schema:Number(state.v??1),bytes,integrity,
    days:dayCount(state),exams:safeCount(state.denemeler),topics:objectCount(state.topics),cards:safeCount(learning?.cards)
  };
}

function sanitizedState(source:YksStateCandidate):YksStateCandidate{
  /* decodeState kaynağı saf JSON'dur; bu klon eski WebView/Safari sürümlerinde de structuredClone gerektirmez. */
  const state=JSON.parse(JSON.stringify(source)) as YksStateCandidate;
  if(isRecord(state.yt))state.yt.key="";
  if(isRecord(state.focus)&&isRecord(state.focus.sw)){
    state.focus.sw.run=false;
    state.focus.sw.start=0;
  }
  return state;
}

export function createBackupPackage(sourceJSON:string,appVersion:string,now:()=>Date=()=>new Date()):BackupBuildResult{
  const decoded=decodeState(sourceJSON);
  if(!decoded.ok)return {ok:false,message:decoded.message};
  const data=sanitizedState(decoded.state),json=JSON.stringify(data),hash=stateHash(json),exportedAt=now().toISOString();
  const payload:BackupPackage={
    app:"YKS Defterim",format:BACKUP_FORMAT_VERSION,appVersion,schemaVersion:decoded.schema,exportedAt,
    integrity:{algorithm:"fnv1a-32",hash},data
  };
  const text=JSON.stringify(payload,null,2),bytes=textBytes(text);
  if(bytes>MAX_BACKUP_BYTES)return {ok:false,message:"Yedek dosyası güvenli boyut sınırını aştı"};
  return {ok:true,text,hash,summary:summarize(data,BACKUP_FORMAT_VERSION,appVersion,exportedAt,bytes,"verified")};
}

export function inspectBackupPackage(text:string):BackupInspectResult{
  if(textBytes(text)>MAX_BACKUP_BYTES)return {ok:false,kind:"too-large",message:"Yedek dosyası 25 MB sınırını aşıyor"};
  let parsed:unknown;
  try{parsed=JSON.parse(text);}catch{return {ok:false,kind:"invalid-json",message:"Dosya geçerli JSON değil"};}
  if(!isRecord(parsed))return {ok:false,kind:"invalid-package",message:"Yedek içeriği bir veri nesnesi olmalı"};

  const format=Number(parsed.format??1);
  const wrapped=format>=2;
  const candidate=wrapped?parsed.data:parsed;
  if(!isRecord(candidate))return {ok:false,kind:"invalid-package",message:"Yedekte uygulama verisi bulunamadı"};
  const json=JSON.stringify(candidate),decoded=decodeState(json);
  if(!decoded.ok){
    if(decoded.kind==="future-schema")return {ok:false,kind:"future-schema",message:decoded.message};
    return {ok:false,kind:"invalid-package",message:decoded.message};
  }

  let integrity:"verified"|"legacy"="legacy";
  if(format>=BACKUP_FORMAT_VERSION){
    if(parsed.app!=="YKS Defterim"||!isRecord(parsed.integrity)||parsed.integrity.algorithm!=="fnv1a-32"||typeof parsed.integrity.hash!=="string"){
      return {ok:false,kind:"invalid-package",message:"Yedek kimliği veya bütünlük bilgisi eksik"};
    }
    if(parsed.integrity.hash!==stateHash(json))return {ok:false,kind:"integrity",message:"Yedek bütünlük kontrolünü geçemedi; dosya bozulmuş veya değiştirilmiş"};
    integrity="verified";
  }
  const appVersion=typeof parsed.appVersion==="string"?parsed.appVersion:"Eski sürüm";
  const exportedAt=typeof parsed.exportedAt==="string"&&Number.isFinite(Date.parse(parsed.exportedAt))?parsed.exportedAt:null;
  return {ok:true,json,state:decoded.state,summary:summarize(decoded.state,format,appVersion,exportedAt,textBytes(text),integrity)};
}

export const backupService={create:createBackupPackage,inspect:inspectBackupPackage} as const;
