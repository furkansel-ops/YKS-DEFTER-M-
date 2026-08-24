import {decodeState,encodeState,type StateDecodeResult,type StateEncodeResult} from "./codec";
import {DATA_SCHEMA_VERSION,type YksStateCandidate} from "./contracts";
import {YKS_STORAGE_KEYS} from "./storage-keys";

type StorageProvider=()=>Storage;
type TextResult={ok:true;value:string|null}|{ok:false;message:string};
export type RepositoryReadResult=StateDecodeResult|{ok:false;kind:"storage-unavailable";message:string};
export type RepositoryWriteResult=StateEncodeResult|{ok:false;message:string};

export interface DataSnapshot{
  storage:"localStorage";
  available:boolean;
  primary:"valid"|"missing"|"invalid"|"future"|"unavailable";
  schema:number|null;
  chars:number;
  bytes:number;
  keyCount:number;
}

export interface MirrorMetadata{
  hash:string;
  updatedAt:number;
}

export class LocalStateRepository{
  readonly #provider:StorageProvider;

  constructor(provider:StorageProvider=()=>window.localStorage){
    this.#provider=provider;
  }

  readText(key:string):TextResult{
    try{return {ok:true,value:this.#provider().getItem(key)};}
    catch{return {ok:false,message:"Yerel depolamaya erişilemiyor"};}
  }

  writeText(key:string,value:string):{ok:true}|{ok:false;message:string}{
    try{this.#provider().setItem(key,value);return {ok:true};}
    catch{return {ok:false,message:"Yerel depolamaya yazılamadı"};}
  }

  removeText(key:string):{ok:true}|{ok:false;message:string}{
    try{this.#provider().removeItem(key);return {ok:true};}
    catch{return {ok:false,message:"Yerel depolamadaki kayıt kaldırılamadı"};}
  }

  read():RepositoryReadResult{
    const stored=this.readText(YKS_STORAGE_KEYS.primary);
    if(!stored.ok)return {ok:false,kind:"storage-unavailable",message:stored.message};
    return decodeState(stored.value,DATA_SCHEMA_VERSION);
  }

  write(state:YksStateCandidate):RepositoryWriteResult{
    const encoded=encodeState(state,DATA_SCHEMA_VERSION);
    if(!encoded.ok)return encoded;
    const written=this.writeText(YKS_STORAGE_KEYS.primary,encoded.json);
    return written.ok?encoded:written;
  }

  remove():{ok:true}|{ok:false;message:string}{
    return this.removeText(YKS_STORAGE_KEYS.primary);
  }

  readMirrorMetadata():MirrorMetadata{
    const hash=this.readText(YKS_STORAGE_KEYS.legacyMirrorHash),updated=this.readText(YKS_STORAGE_KEYS.legacyMirrorUpdatedAt);
    return {
      hash:hash.ok&&typeof hash.value==="string"?hash.value:"",
      updatedAt:updated.ok?Math.max(0,Number(updated.value)||0):0
    };
  }

  writeMirrorMetadata(hash:string,updatedAt:number):{ok:true}|{ok:false;message:string}{
    const savedHash=this.writeText(YKS_STORAGE_KEYS.legacyMirrorHash,String(hash||""));
    if(!savedHash.ok)return savedHash;
    return this.writeText(YKS_STORAGE_KEYS.legacyMirrorUpdatedAt,String(Math.max(0,Math.floor(updatedAt))));
  }

  snapshot():DataSnapshot{
    const read=this.read();
    let keyCount=0,available=true;
    try{keyCount=this.#provider().length;}catch{available=false;}
    if(!read.ok){
      const primary=read.kind==="missing"?"missing":read.kind==="future-schema"?"future":read.kind==="storage-unavailable"?"unavailable":"invalid";
      return {storage:"localStorage",available:available&&read.kind!=="storage-unavailable",primary,schema:read.kind==="future-schema"?(read.schema??null):null,chars:0,bytes:0,keyCount};
    }
    return {storage:"localStorage",available,primary:"valid",schema:read.schema,chars:read.chars,bytes:read.bytes,keyCount};
  }

  validate():string[]{
    const read=this.read();
    if(read.ok||read.kind==="missing")return [];
    if(read.kind==="future-schema")return [`Ana kayıt daha yeni şemada: ${read.schema??"?"}`];
    return [read.message];
  }
}
