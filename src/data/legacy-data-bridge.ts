import {DATA_SCHEMA_VERSION,type YksStateCandidate} from "./contracts";
import {decodeState,stateHash} from "./codec";
import type {DomainStateAdapter} from "../domain/state-context";
import {buildCloudPayload,type CloudPayloadResult} from "./cloud-state";
import {DexieMigrationTarget,YksDatabase,type IndexedDatabaseSnapshot} from "./database";
import {LocalStateRepository,type DataSnapshot,type RepositoryReadResult,type RepositoryWriteResult} from "./local-state-repository";
import {PrimaryStateCoordinator,type ExternalApplyResult,type PrimaryInitResult,type PrimaryJSONResult,type PrimaryWriteResult} from "./primary-store";
import {YKS_STORAGE_KEYS} from "./storage-keys";

export interface LegacyDataBridgeApi{
  readonly version:"4.0.0-alpha.6";
  readonly storage:"localStorage";
  readonly indexedStorage:"Dexie";
  readonly schemaVersion:typeof DATA_SCHEMA_VERSION;
  readonly keys:typeof YKS_STORAGE_KEYS;
  readonly ready:Promise<PrimaryInitResult>;
  read():RepositoryReadResult;
  write(state:YksStateCandidate):RepositoryWriteResult;
  remove():{ok:true}|{ok:false;message:string};
  snapshot():DataSnapshot;
  indexedSnapshot():Promise<IndexedDatabaseSnapshot>;
  initialize():Promise<PrimaryInitResult>;
  captureLegacyWrite(json?:string):Promise<PrimaryWriteResult>;
  cloudPayload():Promise<CloudPayloadResult>;
  primaryJSON():Promise<PrimaryJSONResult|{ok:false;message:string}>;
  readCloudBaseline(uid:string):Promise<{ok:true;json:string;hash:string}|{ok:false;message:string}>;
  writeCloudBaseline(uid:string,json:string):Promise<{ok:true;hash:string}|{ok:false;message:string}>;
  clearCloudBaseline(uid:string):Promise<void>;
  applyCloudJSON(json:string):Promise<ExternalApplyResult>;
  applyBackupJSON(json:string):Promise<ExternalApplyResult>;
  flush():Promise<void>;
  validate():string[];
}

declare global{
  interface LegacyStateAdapter{
    readJSON():string;
    applyJSON(json:string):{ok:true;json:string}|{ok:false;message:string};
    readState?:DomainStateAdapter["readState"];
    save?:DomainStateAdapter["save"];
    memo?:DomainStateAdapter["memo"];
    subjects?:DomainStateAdapter["subjects"];
    reviewGaps?:DomainStateAdapter["reviewGaps"];
  }
  interface Window{
    __YKS_DATA__?:LegacyDataBridgeApi;
    YKSLegacyState?:LegacyStateAdapter;
    save?:(...args:unknown[])=>unknown;
  }
}

export function installLegacyDataBridge():LegacyDataBridgeApi{
  const repository=new LocalStateRepository();
  const database=new YksDatabase(),target=new DexieMigrationTarget(database);
  const runtime:LegacyStateAdapter=window.YKSLegacyState??{
    readJSON:()=>{const stored=repository.read();return stored.ok?stored.json:"";},
    applyJSON:json=>{
      try{
        const decoded=repository.write(JSON.parse(json));
        return decoded.ok?{ok:true,json:decoded.json}:{ok:false,message:decoded.message};
      }catch{return {ok:false,message:"Dexie kaydı güvenli yerel aynaya uygulanamadı"};}
    }
  };
  const coordinator=new PrimaryStateCoordinator(repository,target,runtime);
  let initialization:Promise<PrimaryInitResult>|null=null;
  const initialize=()=>initialization??=coordinator.initialize();
  let writeTail:Promise<void>=Promise.resolve();
  const enqueue=<T>(task:()=>Promise<T>):Promise<T>=>{
    const result=writeTail.then(task,task);
    writeTail=result.then(()=>undefined,()=>undefined);
    return result;
  };

  /* Legacy save() kısa sürede art arda çalışabiliyor (yazı girişi, sayaç, kart işaretleri).
     Aynı anlık durumu onlarca kez Dexie'ye yazmak yerine kuyruğu birleştir; işlem sürerken
     yeni bir save gelirse dirty bayrağı son durumu bir kez daha yakalatır. Açık JSON ile
     yapılan kritik yazılar (yedek/bridge çağrıları) ise sırasını koruyarak ayrı kuyruğa girer. */
  let pendingLegacyCapture:Promise<PrimaryWriteResult>|null=null,legacyCaptureDirty=false;
  const captureLegacyWrite=(json?:string):Promise<PrimaryWriteResult>=>{
    if(typeof json==="string")return enqueue(async()=>{await initialize();return coordinator.capture(json);});
    legacyCaptureDirty=true;
    if(pendingLegacyCapture)return pendingLegacyCapture;
    pendingLegacyCapture=enqueue(async()=>{
      await initialize();
      let result:PrimaryWriteResult;
      do{
        legacyCaptureDirty=false;
        result=await coordinator.capture();
      }while(legacyCaptureDirty);
      return result;
    }).finally(()=>{
      pendingLegacyCapture=null;
      /* Çok dar bir microtask aralığında save geldiyse son değişikliği kaçırma. */
      if(legacyCaptureDirty)void captureLegacyWrite();
    });
    return pendingLegacyCapture;
  };
  const applyCloudJSON=(json:string):Promise<ExternalApplyResult>=>enqueue(async()=>{await initialize();return coordinator.replaceFromExternal(json);});
  const applyBackupJSON=(json:string):Promise<ExternalApplyResult>=>enqueue(async()=>{await initialize();return coordinator.replaceFromExternal(json,Date.now(),"backup");});
  const flush=async()=>{
    const pending=pendingLegacyCapture;
    if(pending)await pending.catch(()=>undefined);
    await writeTail;
  };
  const cloudPayload=async():Promise<CloudPayloadResult>=>{
    await initialize();await flush();
    const primary=await coordinator.readPrimaryJSON();
    return primary.ok?buildCloudPayload(primary.json,primary.source):primary;
  };
  const cloudBaselineKey=(uid:string)=>`cloud-base:${String(uid||"").slice(0,256)}`;
  const readCloudBaseline=async(uid:string):Promise<{ok:true;json:string;hash:string}|{ok:false;message:string}>=>{
    if(!uid)return {ok:false,message:"Bulut hesabı tanımlı değil"};
    await initialize();await flush();
    try{
      const row=await database.state.get(cloudBaselineKey(uid));
      if(!row)return {ok:false,message:"Bulut birleştirme tabanı bulunamadı"};
      const decoded=decodeState(row.json),hash=stateHash(row.json);
      if(!decoded.ok||hash!==row.sourceHash)return {ok:false,message:"Bulut birleştirme tabanı doğrulanamadı"};
      return {ok:true,json:row.json,hash};
    }catch(error){return {ok:false,message:error instanceof Error?error.message:"Bulut birleştirme tabanı okunamadı"};}
  };
  const writeCloudBaseline=async(uid:string,json:string):Promise<{ok:true;hash:string}|{ok:false;message:string}>=>{
    if(!uid)return {ok:false,message:"Bulut hesabı tanımlı değil"};
    const decoded=decodeState(json);
    if(!decoded.ok)return {ok:false,message:decoded.message};
    const hash=stateHash(json);
    try{
      await initialize();await flush();
      await database.state.put({
        key:cloudBaselineKey(uid),json,schema:decoded.schema,chars:decoded.chars,bytes:decoded.bytes,
        source:"firebase",sourceHash:hash,updatedAt:Date.now()
      });
      const verified=await database.state.get(cloudBaselineKey(uid));
      if(!verified||verified.sourceHash!==hash||verified.json!==json)throw new Error("Bulut birleştirme tabanı doğrulanamadı");
      return {ok:true,hash};
    }catch(error){return {ok:false,message:error instanceof Error?error.message:"Bulut birleştirme tabanı yazılamadı"};}
  };
  const clearCloudBaseline=async(uid:string):Promise<void>=>{
    if(!uid)return;
    try{await initialize();await flush();await database.state.delete(cloudBaselineKey(uid));}catch(error){console.warn("Bulut birleştirme tabanı silinemedi",error);}
  };
  const api:LegacyDataBridgeApi={
    version:"4.0.0-alpha.6",
    storage:"localStorage",
    indexedStorage:"Dexie",
    schemaVersion:DATA_SCHEMA_VERSION,
    keys:YKS_STORAGE_KEYS,
    ready:initialize(),
    read:()=>repository.read(),
    write:state=>{const result=repository.write(state);if(result.ok)void captureLegacyWrite(result.json);return result;},
    remove:()=>repository.remove(),
    snapshot:()=>repository.snapshot(),
    indexedSnapshot:()=>target.snapshot(),
    initialize,
    captureLegacyWrite,
    cloudPayload,
    primaryJSON:async()=>{await initialize();await flush();return coordinator.readPrimaryJSON();},
    readCloudBaseline,
    writeCloudBaseline,
    clearCloudBaseline,
    applyCloudJSON,
    applyBackupJSON,
    flush,
    validate:()=>repository.validate()
  };
  window.__YKS_DATA__=api;
  const legacySave=window.save;
  if(typeof legacySave==="function")window.save=function(...args:unknown[]){
    const result=legacySave.apply(window,args);
    if(result!==false)void captureLegacyWrite();
    return result;
  };
  const errors=api.validate();
  document.documentElement.dataset.v4Data=errors.length?"warning":"initializing";
  document.documentElement.dataset.v4DataErrors=String(errors.length);
  if(errors.length)console.warn("TypeScript veri katmanı kontrolleri:",errors);
  void api.ready.then(result=>{
    document.documentElement.dataset.v4Data=result.ok&&!result.degraded?"ready":"warning";
    document.documentElement.dataset.v4Primary=result.primary;
    document.documentElement.dataset.v4Reconcile=result.status;
    window.dispatchEvent(new CustomEvent<PrimaryInitResult>("yks:data-primary-ready",{detail:result}));
    if(!result.ok||result.degraded)console.warn("Dexie ana kayıt durumu:",result.message);
  }).catch(error=>{
    document.documentElement.dataset.v4Data="warning";
    document.documentElement.dataset.v4Primary="none";
    document.documentElement.dataset.v4Reconcile="failed";
    try{(window as unknown as {infraError?:(scope:string,error:unknown)=>unknown}).infraError?.("data-primary-ready",error);}catch{}
    console.error("Dexie ana kayıt başlatması beklenmedik biçimde başarısız oldu",error);
  });
  return api;
}
