import {stateHash} from "./codec.ts";
import type {RepositoryReadResult} from "./local-state-repository.ts";

export const PRIMARY_INDEXED_STATE_KEY="primary" as const;
export const LEGACY_IMPORT_META_KEY="legacy-localstorage-import-v1" as const;

export interface IndexedStateRecord{
  key:typeof PRIMARY_INDEXED_STATE_KEY;
  json:string;
  schema:number;
  chars:number;
  bytes:number;
  source:"localStorage";
  sourceHash:string;
  updatedAt:number;
}

export interface MigrationMetaRecord{
  key:typeof LEGACY_IMPORT_META_KEY;
  migrationVersion:1;
  stateKey:typeof PRIMARY_INDEXED_STATE_KEY;
  schema:number;
  source:"localStorage";
  sourceHash:string;
  sourceChars:number;
  sourceBytes:number;
  updatedAt:number;
  primaryMode?:"migration"|"dexie-primary";
}

export interface LegacyStateSource{
  read():RepositoryReadResult;
}

export interface MigrationTarget{
  readState():Promise<IndexedStateRecord|undefined>;
  readMeta():Promise<MigrationMetaRecord|undefined>;
  commit(state:IndexedStateRecord,meta:MigrationMetaRecord):Promise<void>;
}

export type MigrationStatus="copied"|"refreshed"|"already-current"|"no-local-state"|"source-invalid"|"source-future"|"storage-unavailable"|"failed";

export interface LegacyMigrationResult{
  ok:boolean;
  status:MigrationStatus;
  message:string;
  schema?:number;
  hash?:string;
  chars?:number;
  bytes?:number;
}

export async function migrateLegacyState(source:LegacyStateSource,target:MigrationTarget,now:()=>number=Date.now):Promise<LegacyMigrationResult>{
  const legacy=source.read();
  if(!legacy.ok){
    if(legacy.kind==="missing")return {ok:true,status:"no-local-state",message:"Taşınacak yerel kayıt bulunamadı"};
    if(legacy.kind==="future-schema")return {ok:false,status:"source-future",message:legacy.message,schema:legacy.schema};
    if(legacy.kind==="storage-unavailable")return {ok:false,status:"storage-unavailable",message:legacy.message};
    return {ok:false,status:"source-invalid",message:legacy.message};
  }

  const hash=stateHash(legacy.json);
  try{
    const [existing,meta]=await Promise.all([target.readState(),target.readMeta()]);
    if(existing?.sourceHash===hash&&existing.json===legacy.json&&meta?.sourceHash===hash){
      return {ok:true,status:"already-current",message:"IndexedDB kaydı güncel",schema:legacy.schema,hash,chars:legacy.chars,bytes:legacy.bytes};
    }

    const updatedAt=now();
    const record:IndexedStateRecord={
      key:PRIMARY_INDEXED_STATE_KEY,json:legacy.json,schema:legacy.schema,chars:legacy.chars,bytes:legacy.bytes,
      source:"localStorage",sourceHash:hash,updatedAt
    };
    const marker:MigrationMetaRecord={
      key:LEGACY_IMPORT_META_KEY,migrationVersion:1,stateKey:PRIMARY_INDEXED_STATE_KEY,schema:legacy.schema,
      source:"localStorage",sourceHash:hash,sourceChars:legacy.chars,sourceBytes:legacy.bytes,updatedAt,primaryMode:"migration"
    };
    await target.commit(record,marker);
    const verified=await target.readState();
    if(!verified||verified.sourceHash!==hash||verified.json!==legacy.json)throw new Error("IndexedDB kopyası doğrulanamadı");
    return {ok:true,status:existing?"refreshed":"copied",message:existing?"IndexedDB kopyası güncellendi":"Yerel kayıt IndexedDB'ye kopyalandı",schema:legacy.schema,hash,chars:legacy.chars,bytes:legacy.bytes};
  }catch(error){
    return {ok:false,status:"failed",message:error instanceof Error?error.message:"IndexedDB taşıması tamamlanamadı",schema:legacy.schema,hash,chars:legacy.chars,bytes:legacy.bytes};
  }
}
