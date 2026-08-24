import {decodeState,stateHash} from "./codec.ts";
import {DATA_SCHEMA_VERSION} from "./contracts.ts";

export interface CloudPayload{
  ok:true;
  json:string;
  hash:string;
  schema:typeof DATA_SCHEMA_VERSION;
  source:"dexie"|"localStorage";
  chars:number;
  bytes:number;
}

export type CloudPayloadResult=CloudPayload|{ok:false;message:string};

export function buildCloudPayload(sourceJSON:string,source:"dexie"|"localStorage"):CloudPayloadResult{
  const decoded=decodeState(sourceJSON);
  if(!decoded.ok)return {ok:false,message:decoded.message};
  const state=decoded.state;
  try{
    const json=JSON.stringify(state,function(key,value){
      if(this===state&&key==="v")return DATA_SCHEMA_VERSION;
      if(state.focus&&this===state.focus&&key==="sw")return {run:false,start:0,acc:0,cr:0};
      if(state.focus&&this===state.focus&&key==="swLaps")return [];
      if(state.yt&&this===state.yt&&key==="key")return "";
      return value;
    });
    if(!json)return {ok:false,message:"Bulut verisi oluşturulamadı"};
    const checked=decodeState(json);
    if(!checked.ok)return {ok:false,message:checked.message};
    return {ok:true,json,hash:stateHash(json),schema:DATA_SCHEMA_VERSION,source,chars:checked.chars,bytes:checked.bytes};
  }catch{return {ok:false,message:"Bulut verisi oluşturulamadı"};}
}
