import {createBackupPackage,inspectBackupPackage,type BackupBuildResult,type BackupInspectResult} from "./backup-service.ts";
import type {LegacyDataBridgeApi} from "./legacy-data-bridge.ts";
import type {ExternalApplyResult} from "./primary-store.ts";

export interface BackupBridgeApi{
  readonly version:"1.0.0";
  readonly format:3;
  build():Promise<BackupBuildResult>;
  inspect(text:string):BackupInspectResult;
  restore(text:string):Promise<BackupRestoreResult>;
}

export type BackupRestoreResult=
  |Extract<BackupInspectResult,{ok:false}>
  |{ok:false;kind:"restore";message:string}
  |{ok:true;summary:Extract<BackupInspectResult,{ok:true}>["summary"];result:ExternalApplyResult&{ok:true}};

declare global{
  interface Window{__YKS_BACKUP__?:BackupBridgeApi;}
}

export function installLegacyBackupBridge(data:LegacyDataBridgeApi,appVersion:string):BackupBridgeApi{
  const api:BackupBridgeApi={
    version:"1.0.0",format:3,
    async build(){
      await data.initialize();await data.captureLegacyWrite();await data.flush();
      const primary=await data.primaryJSON();
      return primary.ok?createBackupPackage(primary.json,appVersion):primary;
    },
    inspect:inspectBackupPackage,
    async restore(text){
      const inspected=inspectBackupPackage(text);
      if(!inspected.ok)return inspected;
      const result=await data.applyBackupJSON(inspected.json);
      if(!result.ok)return {ok:false,kind:"restore",message:result.message};
      return {ok:true,summary:inspected.summary,result:result as ExternalApplyResult&{ok:true}};
    }
  };
  window.__YKS_BACKUP__=api;
  document.documentElement.dataset.v4Backup="ready";
  return api;
}
