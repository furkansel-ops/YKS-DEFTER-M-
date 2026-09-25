import {decodeState,stateHash,type StateDecodeResult} from "./codec.ts";
import type {MirrorMetadata,RepositoryReadResult} from "./local-state-repository.ts";
import {LEGACY_IMPORT_META_KEY,PRIMARY_INDEXED_STATE_KEY,type IndexedStateRecord,type MigrationMetaRecord,type MigrationTarget,type StateWriteSource} from "./migration.ts";

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

export interface PrimaryJSONResult{
  ok:true;
  json:string;
  hash:string;
  schema:number;
  source:"dexie"|"localStorage";
  updatedAt:number;
}

export interface ExternalApplyResult{
  ok:boolean;
  status:"applied"|"invalid"|"failed";
  message:string;
  json?:string;
  hash?:string;
  updatedAt?:number;
  rolledBack?:boolean;
}

interface ExternalSnapshot{
  local:RepositoryReadResult;
  mirrorMeta:MirrorMetadata;
  indexed:IndexedStateRecord|undefined;
  meta:MigrationMetaRecord|undefined;
}

function indexedState(record:IndexedStateRecord|undefined):StateDecodeResult|null{
  if(!record)return null;
  const decoded=decodeState(record.json);
  if(!decoded.ok&&decoded.kind==="future-schema")return decoded;
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
    if(!local.ok&&local.kind==="future-schema")return {ok:false,status:"failed",primary:"none",degraded:true,message:local.message};
    let indexed:IndexedStateRecord|undefined;
    try{indexed=await this.#target.readState();}
    catch(error){
      if(local.ok)return {ok:true,status:"fallback-local",primary:"localStorage",degraded:true,message:"IndexedDB açılamadı; güvenli yerel ayna kullanılıyor",hash:stateHash(local.json),schema:local.schema};
      return {ok:false,status:"failed",primary:"none",degraded:true,message:error instanceof Error?error.message:"Hiçbir veri kaynağı açılamadı"};
    }

    const indexedDecoded=indexedState(indexed);
    if(indexedDecoded&&!indexedDecoded.ok)return {ok:false,status:"failed",primary:"none",degraded:true,message:indexedDecoded.message};
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
    const local=this.#mirror.read();
    if(!local.ok&&local.kind==="future-schema")return {ok:false,status:"invalid",message:local.message};
    const source=typeof json==="string"?decodeState(json):this.#mirror.read();
    if(!source.ok)return {ok:false,status:"invalid",message:source.message};
    const hash=stateHash(source.json),stamp=Math.max(1,Math.floor(updatedAt));
    try{
      const existing=await this.#target.readState();
      if(existing?.sourceHash===hash&&existing.json===source.json){
        this.#mirror.writeMirrorMetadata(hash,Math.max(stamp,existing.updatedAt));
        return {ok:true,status:"unchanged",message:"Dexie ana kaydı zaten güncel",hash,updatedAt:existing.updatedAt};
      }
      return this.persistJSON(source.json,stamp);
    }catch(error){
      return {ok:false,status:"failed",message:error instanceof Error?error.message:"Dexie ana kaydı güncellenemedi",hash,updatedAt:stamp};
    }
  }

  async readPrimaryJSON():Promise<PrimaryJSONResult|{ok:false;message:string}>{
    const local=this.#mirror.read(),mirrorMeta=this.#mirror.readMirrorMetadata();
    if(!local.ok&&local.kind==="future-schema")return {ok:false,message:local.message};
    let indexed:IndexedStateRecord|undefined;
    try{indexed=await this.#target.readState();}catch{
      if(local.ok)return {ok:true,json:local.json,hash:stateHash(local.json),schema:local.schema,source:"localStorage",updatedAt:mirrorMeta.updatedAt};
      return {ok:false,message:"Ana kayıt okunamadı"};
    }
    const decoded=indexedState(indexed);
    if(decoded&&!decoded.ok)return {ok:false,message:decoded.message};
    if(local.ok&&indexed&&decoded?.ok){
      const localHash=stateHash(local.json);
      if(localHash===indexed.sourceHash&&local.json===indexed.json)return {ok:true,json:indexed.json,hash:indexed.sourceHash,schema:indexed.schema,source:"dexie",updatedAt:indexed.updatedAt};
      const tracked=mirrorMeta.hash===localHash&&mirrorMeta.updatedAt>0;
      if(tracked&&mirrorMeta.updatedAt<indexed.updatedAt)return {ok:true,json:indexed.json,hash:indexed.sourceHash,schema:indexed.schema,source:"dexie",updatedAt:indexed.updatedAt};
      return {ok:true,json:local.json,hash:localHash,schema:local.schema,source:"localStorage",updatedAt:mirrorMeta.updatedAt};
    }
    if(indexed&&decoded?.ok)return {ok:true,json:indexed.json,hash:indexed.sourceHash,schema:indexed.schema,source:"dexie",updatedAt:indexed.updatedAt};
    if(local.ok)return {ok:true,json:local.json,hash:stateHash(local.json),schema:local.schema,source:"localStorage",updatedAt:mirrorMeta.updatedAt};
    return {ok:false,message:"Geçerli ana kayıt bulunamadı"};
  }

  async replaceFromExternal(json:string,updatedAt=this.#now(),source:Extract<StateWriteSource,"firebase"|"backup">="firebase"):Promise<ExternalApplyResult>{
    const decoded=decodeState(json);
    if(!decoded.ok)return {ok:false,status:"invalid",message:decoded.message};
    let before:ExternalSnapshot;
    try{
      const [indexed,meta]=await Promise.all([this.#target.readState(),this.#target.readMeta()]);
      before={indexed,meta,local:this.#mirror.read(),mirrorMeta:this.#mirror.readMirrorMetadata()};
    }catch(error){return {ok:false,status:"failed",message:error instanceof Error?error.message:"Önceki kayıt güvenle okunamadı"};}
    const fail=async(message:string,runtimeAttempted:boolean):Promise<ExternalApplyResult>=>{
      const rolledBack=await this.#rollbackExternal(before,runtimeAttempted);
      return {ok:false,status:"failed",message:message+(rolledBack?" Önceki kayıt otomatik geri alındı.":""),rolledBack};
    };
    const written=await this.persistJSON(json,updatedAt,source);
    if(!written.ok)return written.status==="invalid"?{...written,status:"invalid"}:fail(written.message,false);
    try{
      const applied=this.#runtime.applyJSON(json);
      if(!applied.ok)return fail(applied.message,true);
      const appliedHash=stateHash(applied.json);
      let appliedAt=written.updatedAt;
      if(applied.json!==json){
        const normalized=await this.persistJSON(applied.json,Math.max(updatedAt,this.#now()),source);
        if(!normalized.ok)return fail(normalized.message,true);
        appliedAt=normalized.updatedAt;
      }else this.#mirror.writeMirrorMetadata(appliedHash,written.updatedAt??updatedAt);
      return {ok:true,status:"applied",message:source==="backup"?"Yedek Dexie ana kaydına uygulandı":"Bulut kaydı Dexie ana kaydına uygulandı",json:applied.json,hash:appliedHash,updatedAt:appliedAt};
    }catch(error){return fail(error instanceof Error?error.message:"Kayıt çalışma zamanına uygulanamadı",true);}
  }

  async persistJSON(json:string,updatedAt=this.#now(),source:StateWriteSource="localStorage"):Promise<PrimaryWriteResult>{
    const decoded=decodeState(json);
    if(!decoded.ok)return {ok:false,status:"invalid",message:decoded.message};
    const hash=stateHash(json),stamp=Math.max(1,Math.floor(updatedAt));
    const state:IndexedStateRecord={key:PRIMARY_INDEXED_STATE_KEY,json,schema:decoded.schema,chars:decoded.chars,bytes:decoded.bytes,source,sourceHash:hash,updatedAt:stamp};
    const meta:MigrationMetaRecord={key:LEGACY_IMPORT_META_KEY,migrationVersion:1,stateKey:PRIMARY_INDEXED_STATE_KEY,schema:decoded.schema,source,sourceHash:hash,sourceChars:decoded.chars,sourceBytes:decoded.bytes,updatedAt:stamp,primaryMode:"dexie-primary"};
    try{
      const local=this.#mirror.read(),existing=await this.#target.readState(),existingDecoded=indexedState(existing);
      if(!local.ok&&local.kind==="future-schema")return {ok:false,status:"invalid",message:local.message};
      if(existingDecoded&&!existingDecoded.ok)return {ok:false,status:"invalid",message:existingDecoded.message};
      await this.#target.commit(state,meta);
      const verified=await this.#target.readState();
      if(!verified||verified.json!==json||verified.sourceHash!==hash)throw new Error("Dexie ana kaydı doğrulanamadı");
      this.#mirror.writeMirrorMetadata(hash,stamp);
      return {ok:true,status:"written",message:"Dexie ana kaydı güncellendi",hash,updatedAt:stamp};
    }catch(error){
      return {ok:false,status:"failed",message:error instanceof Error?error.message:"Dexie ana kaydı güncellenemedi",hash,updatedAt:stamp};
    }
  }

  async #rollbackExternal(before:ExternalSnapshot,runtimeAttempted:boolean):Promise<boolean>{
    const indexedDecoded=indexedState(before.indexed);
    const previous=before.local.ok?before.local:indexedDecoded?.ok?indexedDecoded:null;
    if(!previous)return false;
    const stamp=Math.max(1,before.mirrorMeta.updatedAt||this.#now());
    const state:IndexedStateRecord=before.indexed&&indexedDecoded?.ok?before.indexed:{
      key:PRIMARY_INDEXED_STATE_KEY,json:previous.json,schema:previous.schema,chars:previous.chars,bytes:previous.bytes,
      source:"localStorage",sourceHash:stateHash(previous.json),updatedAt:stamp
    };
    const meta:MigrationMetaRecord=before.meta??{
      key:LEGACY_IMPORT_META_KEY,migrationVersion:1,stateKey:PRIMARY_INDEXED_STATE_KEY,schema:state.schema,
      source:state.source,sourceHash:state.sourceHash,sourceChars:state.chars,sourceBytes:state.bytes,updatedAt:state.updatedAt,primaryMode:"dexie-primary"
    };
    let indexedRestored=false,runtimeRestored=!runtimeAttempted;
    /* Eski kalıcı kopyayı çalışma zamanı yeniden hata verse bile kurtar. */
    try{
      await this.#target.commit(state,meta);
      const verified=await this.#target.readState();
      indexedRestored=verified?.json===state.json&&verified.sourceHash===state.sourceHash;
    }catch{/* Her depodaki kurtarma diğerinin kullanılabilirliğinden bağımsızdır. */}
    if(runtimeAttempted){
      try{runtimeRestored=this.#runtime.applyJSON(previous.json).ok;}catch{/* Kalıcı eski kopya korunur. */}
    }
    const local=this.#mirror.read();
    if(local.ok&&local.json===previous.json){
      this.#mirror.writeMirrorMetadata(before.local.ok?before.mirrorMeta.hash:stateHash(previous.json),before.local.ok?before.mirrorMeta.updatedAt:state.updatedAt);
    }
    return indexedRestored&&runtimeRestored;
  }

  #restoreIndexed(indexed:IndexedStateRecord,status:"indexed-newer"|"restored-local"):PrimaryInitResult{
    const applied=this.#runtime.applyJSON(indexed.json);
    if(!applied.ok)return {ok:false,status:"failed",primary:"none",degraded:true,message:applied.message};
    const hash=stateHash(applied.json);
    this.#mirror.writeMirrorMetadata(hash,indexed.updatedAt);
    return {ok:true,status,primary:"dexie",degraded:false,message:"Dexie ana kaydı güvenli yerel aynaya yüklendi",hash,schema:indexed.schema};
  }
}
