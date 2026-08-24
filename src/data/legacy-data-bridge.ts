import {DATA_SCHEMA_VERSION,type YksStateCandidate} from "./contracts";
import {DexieMigrationTarget,YksDatabase,type IndexedDatabaseSnapshot} from "./database";
import {LocalStateRepository,type DataSnapshot,type RepositoryReadResult,type RepositoryWriteResult} from "./local-state-repository";
import {migrateLegacyState,type LegacyMigrationResult} from "./migration";
import {YKS_STORAGE_KEYS} from "./storage-keys";

export interface LegacyDataBridgeApi{
  readonly version:"4.0.0-alpha.4";
  readonly storage:"localStorage";
  readonly indexedStorage:"Dexie";
  readonly schemaVersion:typeof DATA_SCHEMA_VERSION;
  readonly keys:typeof YKS_STORAGE_KEYS;
  readonly ready:Promise<LegacyMigrationResult>;
  read():RepositoryReadResult;
  write(state:YksStateCandidate):RepositoryWriteResult;
  remove():{ok:true}|{ok:false;message:string};
  snapshot():DataSnapshot;
  indexedSnapshot():Promise<IndexedDatabaseSnapshot>;
  migrate():Promise<LegacyMigrationResult>;
  validate():string[];
}

declare global{
  interface Window{
    __YKS_DATA__?:LegacyDataBridgeApi;
  }
}

export function installLegacyDataBridge():LegacyDataBridgeApi{
  const repository=new LocalStateRepository();
  const database=new YksDatabase(),target=new DexieMigrationTarget(database);
  let migration:Promise<LegacyMigrationResult>|null=null;
  const migrate=()=>migration??=migrateLegacyState(repository,target);
  const api:LegacyDataBridgeApi={
    version:"4.0.0-alpha.4",
    storage:"localStorage",
    indexedStorage:"Dexie",
    schemaVersion:DATA_SCHEMA_VERSION,
    keys:YKS_STORAGE_KEYS,
    ready:migrate(),
    read:()=>repository.read(),
    write:state=>repository.write(state),
    remove:()=>repository.remove(),
    snapshot:()=>repository.snapshot(),
    indexedSnapshot:()=>target.snapshot(),
    migrate,
    validate:()=>repository.validate()
  };
  window.__YKS_DATA__=api;
  const errors=api.validate();
  document.documentElement.dataset.v4Data=errors.length?"warning":"migrating";
  document.documentElement.dataset.v4DataErrors=String(errors.length);
  if(errors.length)console.warn("TypeScript veri katmanı kontrolleri:",errors);
  void api.ready.then(result=>{
    document.documentElement.dataset.v4Data=result.ok?"ready":"warning";
    document.documentElement.dataset.v4Migration=result.status;
    window.dispatchEvent(new CustomEvent<LegacyMigrationResult>("yks:data-migration",{detail:result}));
    if(!result.ok)console.warn("IndexedDB veri taşıması:",result.message);
  });
  return api;
}
