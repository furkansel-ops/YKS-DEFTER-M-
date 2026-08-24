import {decodeState,stateHash,type StateDecodeResult} from "./codec.ts";
import type {MirrorMetadata,RepositoryReadResult} from "./local-state-repository.ts";
import {LEGACY_IMPORT_META_KEY,PRIMARY_INDEXED_STATE_KEY,type IndexedStateRecord,type MigrationMetaRecord,type MigrationTarget} from "./migration.ts";

export interface PrimaryMirror{
  read():RepositoryReadResult;
  readMirrorMetadata():MirrorMetadata;
  writeMirrorMetadata(hash:string,updatedAt:number):{ok:true}|{ok:false;message:string};
}

export interface LegacyRuntimeAdapter{
  applyJSON(json:string):{ok:true;json:string}|{ok:false;message:string};
}

export type PrimaryInitStatus="ready"|"seeded-indexed"|"local-newer"|"indexed-newer"|"restored-local"|"fallback-local"|"no-data"|"failed";

export interface PrimaryInitResult{
  ok:boolean;
  status:PrimaryInitStatus;
  primary:"dexie"|"localStorage"|"none";
  degraded:boolean;
  message:string;
  hash?:string;
  schema?:number;
}

export interface PrimaryWriteResult{
  ok:boolean;
  status:"written"|"unchanged"|"invalid"|"failed";
  message:string;
  hash?:string;
  updatedAt?:number;
}

function indexedState(record:IndexedStateRecord|undefined):StateDecodeResult|null{
  if(!record)return null;
  const decoded=decodeState(record.json);
  if(!decoded.ok||stateHash(record.json)!==record.sourceHash)return null;
  return decoded;
}

export class PrimaryStateCoordinator{
  readonly #mirror:PrimaryMirror;
  readonly #target:MigrationTarget;
  readonly #runtime:LegacyRuntimeAdapter;
  readonly #now:()=>number;

  constructor(mirror:PrimaryMirror,target:MigrationTarget,runtime:LegacyRuntimeAdapter,now:()=>number=Date.now){
    this.#mirror=mirror;this.#target=target;this.#runtime=runtime;this.#now=now;
  }

  async initialize():Promise<PrimaryInitResult>{
    const local=this.#mirror.read(),mirrorMeta=this.#mirror.readMirrorMetadata();
    let indexed:IndexedStateRecord|undefined;
    try{indexed=await this.#target.readState();}
    catch(error){
      if(local.ok)return {ok:true,status:"fallback-local",primary:"localStorage",degraded:true,message:"IndexedDB açılamadı; güvenli yerel ayna kullanılıyor",hash:stateHash(local.json),schema:local.schema};
      return {ok:false,status:"failed",primary:"none",degraded:true,message:error instanceof Error?error.message:"Hiçbir veri kaynağı açılamadı"};
    }

    const indexedDecoded=indexedState(indexed);
    if(!local.ok&&!indexedDecoded){
      if(local.kind==="missing"&&!indexed)return {ok:true,status:"no-data",primary:"none",degraded:false,message:"Henüz kayıt bulunmuyor"};
      return {ok:false,status:"failed",primary:"none",degraded:true,message:"Geçerli ana kayıt bulunamadı"};
    }

    if(local.ok&&!indexedDecoded){
      const written=await this.persistJSON(local.json,Math.max(this.#now(),mirrorMeta.updatedAt));
      return written.ok
        ?{ok:true,status:indexed?"local-newer":"seeded-indexed",primary:"dexie",degraded:false,message:"Yerel ayna Dexie ana kaydına aktarıldı",hash:written.hash,schema:local.schema}
        :{ok:true,status:"fallback-local",primary:"localStorage",degraded:true,message:written.message,hash:stateHash(local.json),schema:local.schema};
    }

    if(!local.ok&&indexed&&indexedDecoded?.ok){
      return this.#restoreIndexed(indexed,"restored-local");
    }

    if(!local.ok||!indexed||!indexedDecoded?.ok)return {ok:false,status:"failed",primary:"none",degraded:true,message:"Ana kayıt uzlaştırılamadı"};
    const localHash=stateHash(local.json);
    if(localHash===indexed.sourceHash&&local.json===indexed.json){
      this.#mirror.writeMirrorMetadata(localHash,Math.max(mirrorMeta.updatedAt,indexed.updatedAt));
      return {ok:true,status:"ready",primary:"dexie",degraded:false,message:"Dexie ana kaydı ve güvenli ayna eşleşiyor",hash:localHash,schema:local.schema};
    }

    const mirrorTracked=mirrorMeta.hash===localHash&&mirrorMeta.updatedAt>0;
    if(!mirrorTracked||mirrorMeta.updatedAt>=indexed.updatedAt){
      const written=await this.persistJSON(local.json,Math.max(this.#now(),mirrorMeta.updatedAt,indexed.updatedAt+1));
      return written.ok
        ?{ok:true,status:"local-newer",primary:"dexie",degraded:false,message:"Daha yeni yerel değişiklik Dexie'ye aktarıldı",hash:written.hash,schema:local.schema}
        :{ok:true,status:"fallback-local",primary:"localStorage",degraded:true,message:written.message,hash:localHash,schema:local.schema};
    }
    return this.#restoreIndexed(indexed,"indexed-newer");
  }

  async capture(json?:string,updatedAt=this.#now()):Promise<PrimaryWriteResult>{
    const source=typeof json==="string"?decodeState(json):this.#mirror.read();
    if(!source.ok)return {ok:false,status:"invalid",message:source.message};
    const hash=stateHash(source.json),stamp=Math.max(1,Math.floor(updatedAt));
    this.#mirror.writeMirrorMetadata(hash,stamp);
    try{
      const existing=await this.#target.readState();
      if(existing?.sourceHash===hash&&existing.json===source.json){
        return {ok:true,status:"unchanged",message:"Dexie ana kaydı zaten güncel",hash,updatedAt:existing.updatedAt};
      }
      return this.persistJSON(source.json,stamp);
    }catch(error){
      return {ok:false,status:"failed",message:error instanceof Error?error.message:"Dexie ana kaydı güncellenemedi",hash,updatedAt:stamp};
    }
  }

  async persistJSON(json:string,updatedAt=this.#now()):Promise<PrimaryWriteResult>{
    const decoded=decodeState(json);
    if(!decoded.ok)return {ok:false,status:"invalid",message:decoded.message};
    const hash=stateHash(json),stamp=Math.max(1,Math.floor(updatedAt));
    const state:IndexedStateRecord={key:PRIMARY_INDEXED_STATE_KEY,json,schema:decoded.schema,chars:decoded.chars,bytes:decoded.bytes,source:"localStorage",sourceHash:hash,updatedAt:stamp};
    const meta:MigrationMetaRecord={key:LEGACY_IMPORT_META_KEY,migrationVersion:1,stateKey:PRIMARY_INDEXED_STATE_KEY,schema:decoded.schema,source:"localStorage",sourceHash:hash,sourceChars:decoded.chars,sourceBytes:decoded.bytes,updatedAt:stamp,primaryMode:"dexie-primary"};
    try{
      await this.#target.commit(state,meta);
      const verified=await this.#target.readState();
      if(!verified||verified.json!==json||verified.sourceHash!==hash)throw new Error("Dexie ana kaydı doğrulanamadı");
      this.#mirror.writeMirrorMetadata(hash,stamp);
      return {ok:true,status:"written",message:"Dexie ana kaydı güncellendi",hash,updatedAt:stamp};
    }catch(error){
      return {ok:false,status:"failed",message:error instanceof Error?error.message:"Dexie ana kaydı güncellenemedi",hash,updatedAt:stamp};
    }
  }

  #restoreIndexed(indexed:IndexedStateRecord,status:"indexed-newer"|"restored-local"):PrimaryInitResult{
    const applied=this.#runtime.applyJSON(indexed.json);
    if(!applied.ok)return {ok:false,status:"failed",primary:"none",degraded:true,message:applied.message};
    const hash=stateHash(applied.json);
    this.#mirror.writeMirrorMetadata(hash,indexed.updatedAt);
    return {ok:true,status,primary:"dexie",degraded:false,message:"Dexie ana kaydı güvenli yerel aynaya yüklendi",hash,schema:indexed.schema};
  }
}
