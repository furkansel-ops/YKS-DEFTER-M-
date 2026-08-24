import {DATA_SCHEMA_VERSION,type YksStateCandidate} from "./contracts";
import {LocalStateRepository,type DataSnapshot,type RepositoryReadResult,type RepositoryWriteResult} from "./local-state-repository";
import {YKS_STORAGE_KEYS} from "./storage-keys";

export interface LegacyDataBridgeApi{
  readonly version:"4.0.0-alpha.3";
  readonly storage:"localStorage";
  readonly schemaVersion:typeof DATA_SCHEMA_VERSION;
  readonly keys:typeof YKS_STORAGE_KEYS;
  read():RepositoryReadResult;
  write(state:YksStateCandidate):RepositoryWriteResult;
  remove():{ok:true}|{ok:false;message:string};
  snapshot():DataSnapshot;
  validate():string[];
}

declare global{
  interface Window{
    __YKS_DATA__?:LegacyDataBridgeApi;
  }
}

export function installLegacyDataBridge():LegacyDataBridgeApi{
  const repository=new LocalStateRepository();
  const api:LegacyDataBridgeApi={
    version:"4.0.0-alpha.3",
    storage:"localStorage",
    schemaVersion:DATA_SCHEMA_VERSION,
    keys:YKS_STORAGE_KEYS,
    read:()=>repository.read(),
    write:state=>repository.write(state),
    remove:()=>repository.remove(),
    snapshot:()=>repository.snapshot(),
    validate:()=>repository.validate()
  };
  window.__YKS_DATA__=api;
  const errors=api.validate();
  document.documentElement.dataset.v4Data=errors.length?"warning":"ready";
  document.documentElement.dataset.v4DataErrors=String(errors.length);
  if(errors.length)console.warn("TypeScript veri katmanı kontrolleri:",errors);
  return api;
}
