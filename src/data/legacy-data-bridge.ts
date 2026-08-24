import {DATA_SCHEMA_VERSION,type YksStateCandidate} from "./contracts";
import {DexieMigrationTarget,YksDatabase,type IndexedDatabaseSnapshot} from "./database";
import {LocalStateRepository,type DataSnapshot,type RepositoryReadResult,type RepositoryWriteResult} from "./local-state-repository";
import {PrimaryStateCoordinator,type PrimaryInitResult,type PrimaryWriteResult} from "./primary-store";
import {YKS_STORAGE_KEYS} from "./storage-keys";

export interface LegacyDataBridgeApi{
  readonly version:"4.0.0-alpha.5";
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
  flush():Promise<void>;
  validate():string[];
}

declare global{
  interface LegacyStateAdapter{
    readJSON():string;
    applyJSON(json:string):{ok:true;json:string}|{ok:false;message:string};
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
  let writeQueue:Promise<PrimaryWriteResult>|null=null;
  const captureLegacyWrite=(json?:string):Promise<PrimaryWriteResult>=>{
    const run=async()=>{await initialize();return coordinator.capture(json);};
    writeQueue=writeQueue?writeQueue.then(run,run):run();
    return writeQueue;
  };
  const flush=async()=>{if(writeQueue)await writeQueue.then(()=>undefined,()=>undefined);};
  const api:LegacyDataBridgeApi={
    version:"4.0.0-alpha.5",
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
  });
  return api;
}
