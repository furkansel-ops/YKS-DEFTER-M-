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

test("Production Firebase çıktısı Firestore v4 protokolüne yükseltilir",()=>{
  const source=distHardening();
  assert.match(source,/const CLOUD_FORMAT=3,/);
  assert.match(source,/const CLOUD_FORMAT=4,/);
  assert.match(source,/\{data:part,revision:targetRev,index:i\}/);
  assert.match(source,/\{data:part,revision:targetRev,index:i,format:CLOUD_FORMAT\}/);
  assert.match(source,/Firestore v4 meta biçimi/);
  assert.match(source,/Firestore v4 chunk biçimi/);
});

test("Yeni v4 bulut snapshot'ları SHA-256 ile korunur, eski 8 haneli hash okunabilir kalır",()=>{
  const source=distHardening();
  assert.match(source,/async function cloudHash\(txt\)/);
  assert.match(source,/subtle\.digest\("SHA-256",bytes\)/);
  assert.match(source,/storedHash\.length!==8&&storedHash\.length!==64/);
  assert.match(source,/storedHash\.length===64\?await cloudHash\(json\):infraHash\(json\)/);
  assert.match(source,/hash=await cloudHash\(json\)/);
  assert.match(source,/Güvenli SHA-256 desteği bulunamadı/);
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
  assert.match(source,/syncRetryBlocked=false,authRefreshUsed=false,authRecoveryTimer=null/);
  assert.match(source,/syncRetryBlocked=!transient/);
  assert.match(source,/dirty&&!syncRetryBlocked/);
  assert.match(source,/syncRetryCount&&!syncRetryBlocked/);
  assert.match(source,/if\(retryAfterAuth\)status\("Oturum doğrulanıyor…"/);
  assert.match(source,/else status\("Senkron hatası","error",detail\)/);
});

test("Firebase oturum hatasında kimlik jetonunu yalnız bir kez tazeler",()=>{
  const source=distHardening();
  assert.match(source,/if\(authRefreshUsed\|\|!user/);
  assert.match(source,/authRefreshUsed=true/);
  assert.match(source,/user\.getIdToken\(true\)/);
  assert.match(source,/retryAfterAuth=false/);
});

test("İlk indirmede auth veya geçici ağ hatası olursa bulut indirmesi kontrollü tekrar denenir",()=>{
  const source=distHardening();
  assert.match(source,/if\(\(authRetry\|\|!syncRetryBlocked\)&&!dirty\)/);
  assert.match(source,/authRecoveryTimer=setTimeout\(\(\)=>\{if\(user&&navigator\.onLine&&!loading&&!dirty\)downloadOrSeed\(\);\}/);
  assert.match(source,/authRetry\?600\+Math\.floor\(Math\.random\(\)\*500\):syncRetryDelay\(\)/);
  assert.match(source,/Firebase erişim izni reddedildi/);
  assert.match(source,/Bulut oturumu doğrulanamadı/);
  assert.match(source,/ilk indirme auth veya geçici ağ hatası sonrası kontrollü yeniden indirme/);
});

test("Kalıcı permission-denied görünürlük veya ağ dönüşünde tekrar tekrar tetiklenmez",()=>{
  const source=distHardening();
  assert.match(source,/function resumeCloudSync\(\)\{if\(!user\|\|loading\|\|uploading\|\|!dirty\|\|!navigator\.onLine\|\|syncRetryBlocked\)return/);
  assert.match(source,/user=u;syncRetryBlocked=false;authRefreshUsed=false;clearTimeout\(authRecoveryTimer\);authRecoveryTimer=null/);
});

test("Firebase tablet uykusu veya ağ dönüşünde bekleyen geçici yerel kaydı yeniden sürdürür",()=>{
  const source=vite();
  const hardening=distHardening();
  assert.match(source,/function resumeCloudSync/);
  assert.match(source,/addEventListener\("online",resumeCloudSync\)/);
  assert.match(source,/visibilitychange/);
  assert.match(source,/document\.visibilityState===\"visible\"/);
  assert.match(hardening,/function resumeCloudSync\(\)/);
});

test("Firebase çakışma birleştirmesinden sonra aynı anda yazan cihazlara jitter uygular",()=>{
  const source=vite();
  const hardening=distHardening();
  assert.match(source,/applyMerged\(r,safeJSONParse\(json\)\);syncRetryCount=Math\.max\(syncRetryCount,1\);uploadQueued=true/);
  assert.match(hardening,/syncRetryBlocked=false;syncRetryCount=Math\.max\(syncRetryCount,1\);uploadQueued=true/);
});

test("Uygulama açılışında bekleyen yerel değişiklik bulut indirmesiyle ezilmez",()=>{
  const source=vite();
  assert.match(source,/if\(navigator\.onLine\)\{if\(dirty\)await upload\(\);else await downloadOrSeed\(\);\}/);
});

test("İlk bulut indirmesi sürerken yerel değişiklik oluşursa uzak kayıt yerine güvenli merge yapılır",()=>{
  const source=vite();
  assert.match(source,/if\(r&&r\.obj\)\{if\(dirty\)\{const localJSON=await cloudJSON\(\);conflictBackupAdd\(localJSON,r\.rev\);await applyMerged\(r,safeJSONParse\(localJSON\)\)/);
  assert.match(source,/timer=setTimeout\(upload,syncRetryDelay\(\)\)/);
  assert.match(source,/ilk indirmede bekleyen yerel değişikliği koruma/);
});

test("Web ve Android build zinciri Firebase dist sağlamlaştırmasını uygular",()=>{
  const source=pkg();
  assert.match(source,/scripts\/harden-firebase-dist\.mjs/);
  assert.match(source,/vite build --config vite\.runtime-hardening\.mts/);
});
