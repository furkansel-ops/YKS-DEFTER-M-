import {createBackupPackage,inspectBackupPackage,previewBackupPackage,type BackupBuildResult,type BackupInspectResult,type BackupPreviewResult} from "./backup-service.ts";
import type {LegacyDataBridgeApi} from "./legacy-data-bridge.ts";
import type {ExternalApplyResult} from "./primary-store.ts";

export interface BackupBridgeApi{
  readonly version:"2.0.0";
  readonly format:3;
  build():Promise<BackupBuildResult>;
  inspect(text:string):BackupInspectResult;
  preview(text:string):BackupPreviewResult;
  restore(text:string):Promise<BackupRestoreResult>;
}

export type BackupRestoreResult=
  |Extract<BackupInspectResult,{ok:false}>
  |{ok:false;kind:"restore";message:string;rolledBack:boolean}
  |{ok:true;summary:Extract<BackupInspectResult,{ok:true}>["summary"];result:ExternalApplyResult&{ok:true};previousHash?:string};

declare global{
  interface Window{__YKS_BACKUP__?:BackupBridgeApi;}
}

export function installLegacyBackupBridge(data:LegacyDataBridgeApi,appVersion:string):BackupBridgeApi{
  const api:BackupBridgeApi={
    version:"2.0.0",format:3,
    async build(){
      await data.initialize();await data.captureLegacyWrite();await data.flush();
      const primary=await data.primaryJSON();
      return primary.ok?createBackupPackage(primary.json,appVersion):primary;
    },
    inspect:inspectBackupPackage,
    preview(text){
      const current=data.read();
      return previewBackupPackage(text,current.ok?current.json:null);
    },
    async restore(text){
      const inspected=inspectBackupPackage(text);
      if(!inspected.ok)return inspected;
      await data.initialize();await data.captureLegacyWrite();await data.flush();
      const before=await data.primaryJSON();
      const result=await data.applyBackupJSON(inspected.json);
      if(!result.ok){
        let rolledBack=false;
        if(before.ok){
          const after=await data.primaryJSON();
          if(after.ok&&after.hash!==before.hash){
            const rollback=await data.applyBackupJSON(before.json);
            rolledBack=rollback.ok;
          }
        }
        const suffix=rolledBack?" Önceki kayıt otomatik geri alındı.":"";
        return {ok:false,kind:"restore",message:result.message+suffix,rolledBack};
      }
      return {ok:true,summary:inspected.summary,result:result as ExternalApplyResult&{ok:true},previousHash:before.ok?before.hash:undefined};
    }
  };
  window.__YKS_BACKUP__=api;
  document.documentElement.dataset.v4Backup="ready";
  document.documentElement.dataset.v4BackupVersion=api.version;
  return api;
}
