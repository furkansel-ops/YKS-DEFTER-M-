const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const dataUrl=file=>pathToFileURL(path.join(root,"src/data",file)).href;

test("başarısız yedek uygulaması değişmiş ana kaydı otomatik geri alır",async()=>{
  const oldWindow=global.window,oldDocument=global.document;
  global.window={};global.document={documentElement:{dataset:{}}};
  try{
    const [{createBackupPackage},{stateHash},{installLegacyBackupBridge}]=await Promise.all([
      import(dataUrl("backup-service.ts")),import(dataUrl("codec.ts")),import(dataUrl("legacy-backup-bridge.ts"))
    ]);
    const beforeJSON=JSON.stringify({v:21,name:"Önceki",denemeler:[],topics:{}}),incoming={v:21,name:"Yeni",denemeler:[{id:1}],topics:{mat:{st:3}}};
    const built=createBackupPackage(JSON.stringify(incoming),"4.1.0");assert.equal(built.ok,true);
    let current=beforeJSON,firstApply=true;
    const primary=()=>({ok:true,json:current,hash:stateHash(current),schema:21,source:"dexie",updatedAt:1});
    const data={
      initialize:async()=>({ok:true}),captureLegacyWrite:async()=>({ok:true}),flush:async()=>{},read:()=>({ok:true,json:current,schema:21}),primaryJSON:async()=>primary(),
      applyBackupJSON:async json=>{current=json;if(firstApply){firstApply=false;return {ok:false,status:"failed",message:"Runtime uygulaması kesildi"};}return {ok:true,status:"applied",message:"ok",json,hash:stateHash(json),updatedAt:2};}
    };
    const bridge=installLegacyBackupBridge(data,"4.1.0"),result=await bridge.restore(built.text);
    assert.equal(result.ok,false);assert.equal(result.kind,"restore");assert.equal(result.rolledBack,true);assert.match(result.message,/otomatik geri alındı/);assert.equal(current,beforeJSON);
  }finally{
    if(oldWindow===undefined)delete global.window;else global.window=oldWindow;
    if(oldDocument===undefined)delete global.document;else global.document=oldDocument;
  }
});

test("Kurtarma Merkezi erişilebilir önizleme ile yeni import akışını çalışma zamanına bağlar",()=>{
  const source=fs.readFileSync(path.join(root,"src/ui/recovery-center.ts"),"utf8"),main=fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
  assert.match(source,/v42RecoveryCenter/);assert.match(source,/aria-modal/);assert.match(source,/Yedek önizlemesi/);assert.match(source,/backup\.preview\(text\)/);assert.match(source,/backup\.restore\(text\)/);assert.match(source,/runtime\.importData=input/);assert.match(source,/yksCloudForceDirty/);assert.match(source,/otomatik geri almaya çalışır/);
  assert.doesNotMatch(source,/\.weeks\b|\.rows\b|rowLabels/);assert.match(main,/installRecoveryCenter\(data,backup\)/);assert.match(main,/v4RecoveryErrors/);
});
