const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const vite=()=>fs.readFileSync(path.join(root,"vite.config.mts"),"utf8");
const distHardening=()=>fs.readFileSync(path.join(root,"scripts/harden-firebase-dist.mjs"),"utf8");
const pkg=()=>fs.readFileSync(path.join(root,"package.json"),"utf8");

test("Firebase senkronu yeni yüklemelerde daha az ve güvenli boyutta parça üretir",()=>{
  const source=vite();
  assert.match(source,/splitUtf8\(str,max=640000\)/);
  assert.match(source,/size>720000/);
  assert.match(source,/parts\.length>12/);
});

test("Firebase uzaktaki durumu bütün eski chunks koleksiyonunu taramadan okur",()=>{
  const source=vite();
  assert.match(source,/yalnız aktif revizyonu okuma/);
  assert.match(source,/ids\.slice\(i,i\+8\)\.map\(id=>getDoc\(chunkRef\(user\.uid,id\)\)\)/);
  assert.match(source,/docs\.some\(d=>!d\.exists\(\)\)/);
});

test("Firebase geçici hatalarda jitterlı geri deneme kullanır",()=>{
  const source=vite();
  assert.match(source,/syncRetryCount=0/);
  assert.match(source,/function transientSyncError/);
  assert.match(source,/function syncRetryDelay/);
  assert.match(source,/Math\.random\(\)\*\.4/);
  assert.match(source,/Buluta tekrar bağlanıyor…/);
  assert.match(source,/cihazda kayıtlı/);
  assert.match(source,/syncRetryCount\?syncRetryDelay\(\):120/);
});

test("Kalıcı Firebase hatası otomatik retry döngüsüne girmez",()=>{
  const source=distHardening();
  assert.match(source,/syncRetryBlocked=false,authRefreshUsed=false/);
  assert.match(source,/syncRetryBlocked=!transient/);
  assert.match(source,/dirty&&!syncRetryBlocked/);
  assert.match(source,/syncRetryCount&&!syncRetryBlocked/);
  assert.match(source,/if\(transient\)status\("Buluta tekrar bağlanıyor…"/);
  assert.match(source,/else status\("Senkron hatası","error",detail\)/);
});

test("Firebase oturum hatasında kimlik jetonunu yalnız bir kez tazeler",()=>{
  const source=distHardening();
  assert.match(source,/if\(authRefreshUsed\|\|!user/);
  assert.match(source,/authRefreshUsed=true/);
  assert.match(source,/user\.getIdToken\(true\)/);
  assert.match(source,/retryAfterAuth=false/);
});

test("Firebase tablet uykusu veya ağ dönüşünde bekleyen yerel kaydı yeniden sürdürür",()=>{
  const source=vite();
  const hardening=distHardening();
  assert.match(source,/function resumeCloudSync/);
  assert.match(source,/addEventListener\("online",resumeCloudSync\)/);
  assert.match(source,/visibilitychange/);
  assert.match(source,/document\.visibilityState===\"visible\"/);
  assert.match(hardening,/resumeCloudSync\(\)\{if\(!user\|\|loading\|\|uploading\|\|!dirty\|\|!navigator\.onLine\)return;syncRetryBlocked=false;authRefreshUsed=false/);
});

test("Firebase çakışma birleştirmesinden sonra aynı anda yazan cihazlara jitter uygular",()=>{
  const source=vite();
  const hardening=distHardening();
  assert.match(source,/applyMerged\(r,safeJSONParse\(json\)\);syncRetryCount=Math\.max\(syncRetryCount,1\);uploadQueued=true/);
  assert.match(hardening,/syncRetryBlocked=false;syncRetryCount=Math\.max\(syncRetryCount,1\);uploadQueued=true/);
});

test("Web ve Android build zinciri Firebase dist sağlamlaştırmasını uygular",()=>{
  const source=pkg();
  assert.match(source,/scripts\/harden-firebase-dist\.mjs/);
  assert.match(source,/vite --config vite\.runtime-hardening\.mts build/);
});
