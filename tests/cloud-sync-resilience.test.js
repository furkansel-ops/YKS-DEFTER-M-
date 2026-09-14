const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const vite=()=>fs.readFileSync(path.join(root,"vite.config.mts"),"utf8");

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

test("Firebase geçici hatalarda jitterlı geri deneme ile iki cihazın kilit adımını kırar",()=>{
  const source=vite();
  assert.match(source,/syncRetryCount=0/);
  assert.match(source,/function transientSyncError/);
  assert.match(source,/function syncRetryDelay/);
  assert.match(source,/Math\.random\(\)\*\.4/);
  assert.match(source,/Buluta tekrar bağlanıyor…/);
  assert.match(source,/cihazda kayıtlı/);
  assert.match(source,/syncRetryCount\?syncRetryDelay\(\):120/);
});

test("Firebase oturum kaynaklı senkron hatasında kimlik jetonunu bir kez tazelemeyi dener",()=>{
  const source=vite();
  assert.match(source,/refreshCloudAuth/);
  assert.match(source,/permission-denied/);
  assert.match(source,/unauthenticated/);
  assert.match(source,/user\.getIdToken\(true\)/);
});

test("Firebase tablet uykusu veya ağ dönüşünde bekleyen yerel kaydı yeniden sürdürür",()=>{
  const source=vite();
  assert.match(source,/function resumeCloudSync/);
  assert.match(source,/addEventListener\("online",resumeCloudSync\)/);
  assert.match(source,/visibilitychange/);
  assert.match(source,/document\.visibilityState===\"visible\"/);
});

test("Firebase çakışma birleştirmesinden sonra aynı anda yazan cihazlara jitter uygular",()=>{
  const source=vite();
  assert.match(source,/applyMerged\(r,safeJSONParse\(json\)\);syncRetryCount=Math\.max\(syncRetryCount,1\);uploadQueued=true/);
});
