import {DATA_SCHEMA_VERSION,type YksStateCandidate} from "./contracts.ts";

export const MAX_REASONABLE_STATE_CHARS=20*1024*1024;

export type StateDecodeResult=
  |{ok:true;kind:"state";state:YksStateCandidate;json:string;schema:number;chars:number;bytes:number}
  |{ok:false;kind:"missing"|"too-large"|"invalid-json"|"invalid-shape"|"future-schema";message:string;schema?:number};

export type StateEncodeResult=
  |{ok:true;json:string;schema:number;chars:number;bytes:number}
  |{ok:false;message:string};

export function isRecord(value:unknown):value is Record<string,unknown>{
  return !!value&&typeof value==="object"&&!Array.isArray(value);
}

export function textBytes(text:string):number{
  return new TextEncoder().encode(text).byteLength;
}

export function stateHash(text:string):string{
  let hash=2166136261;
  for(let index=0;index<text.length;index++){
    hash^=text.charCodeAt(index);
    hash=Math.imul(hash,16777619);
  }
  return (hash>>>0).toString(16).padStart(8,"0");
}

export function stateSchema(value:YksStateCandidate):number{
  const schema=Number(value.v??1);
  return Number.isFinite(schema)&&schema>0?Math.floor(schema):1;
}

export function decodeState(text:string|null,currentSchema=DATA_SCHEMA_VERSION):StateDecodeResult{
  if(typeof text!=="string"||!text.trim())return {ok:false,kind:"missing",message:"Ana kayıt bulunamadı"};
  /* JSON.parse öncesi sınırla: aşırı büyük bulut/yedek/localStorage girdisi belleği gereksiz zorlamasın. */
  if(text.length>MAX_REASONABLE_STATE_CHARS)return {ok:false,kind:"too-large",message:"Ana kayıt güvenli boyut sınırını aştı"};
  let value:unknown;
  try{value=JSON.parse(text);}catch{return {ok:false,kind:"invalid-json",message:"Ana kayıt geçerli JSON değil"};}
  if(!isRecord(value))return {ok:false,kind:"invalid-shape",message:"Ana kayıt bir nesne olmalı"};
  const state=value as YksStateCandidate,schema=stateSchema(state);
  if(schema>currentSchema)return {ok:false,kind:"future-schema",message:"Kayıt daha yeni bir veri şemasına ait",schema};
  return {ok:true,kind:"state",state,json:text,schema,chars:text.length,bytes:textBytes(text)};
}

export function encodeState(state:YksStateCandidate,currentSchema=DATA_SCHEMA_VERSION):StateEncodeResult{
  if(!isRecord(state))return {ok:false,message:"Kaydedilecek veri bir nesne olmalı"};
  const schema=stateSchema(state);
  if(schema>currentSchema)return {ok:false,message:"Daha yeni şemadaki veri bu sürümle kaydedilemez"};
  try{
    const json=JSON.stringify(state);
    if(!json)return {ok:false,message:"Veri JSON biçimine dönüştürülemedi"};
    if(json.length>MAX_REASONABLE_STATE_CHARS)return {ok:false,message:"Veri boyutu güvenli sınırı aştı"};
    return {ok:true,json,schema,chars:json.length,bytes:textBytes(json)};
  }catch{
    return {ok:false,message:"Veri JSON biçimine dönüştürülemedi"};
  }
}
