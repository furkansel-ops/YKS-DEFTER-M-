import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";

const file=resolve(process.cwd(),"dist/firebase-sync-runtime.js");
let source=readFileSync(file,"utf8");

function replaceRequired(needle,replacement,label){
  if(!source.includes(needle))throw new Error(`Firebase dist sağlamlaştırması uygulanamadı: ${label}`);
  source=source.replace(needle,replacement);
}

if(!source.includes('const CLOUD_FORMAT=4,')){
  replaceRequired(
    'const CLOUD_FORMAT=3,',
    'const CLOUD_FORMAT=4,',
    "Firestore v4 meta biçimi"
  );
}

if(!source.includes('index:i,format:CLOUD_FORMAT')){
  replaceRequired(
    '{data:part,revision:targetRev,index:i}',
    '{data:part,revision:targetRev,index:i,format:CLOUD_FORMAT}',
    "Firestore v4 chunk biçimi"
  );
}

/* v4 aktif bulut snapshot'larında FNV-1a yerine SHA-256 kullan.
   Eski 8 haneli v3/v4 kayıtları okunabilir kalır; bir sonraki başarılı yazım
   onları otomatik olarak 64 haneli SHA-256 meta hash'ine taşır. */
if(!source.includes('async function cloudHash(txt)')){
  replaceRequired(
    'function revPrefix(rev){return String(Math.max(0,rev|0)).padStart(10,"0")+"_";}',
    'async function cloudHash(txt){const subtle=globalThis.crypto&&globalThis.crypto.subtle;if(!subtle||typeof TextEncoder!=="function")throw new Error("Güvenli SHA-256 desteği bulunamadı");const bytes=new TextEncoder().encode(String(txt||"")),digest=await subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");}\nfunction revPrefix(rev){return String(Math.max(0,rev|0)).padStart(10,"0")+"_";}',
    "SHA-256 bulut bütünlük özeti"
  );
}

if(source.includes('if(format>=3&&md.hash&&String(md.hash)!==infraHash(json))throw new Error("Bulut veri bütünlüğü doğrulanamadı");')){
  replaceRequired(
    'if(format>=3&&md.hash&&String(md.hash)!==infraHash(json))throw new Error("Bulut veri bütünlüğü doğrulanamadı");',
    'if(format>=3&&md.hash){const storedHash=String(md.hash);if(storedHash.length!==8&&storedHash.length!==64)throw new Error("Bulut bütünlük özeti geçersiz");const expectedHash=storedHash.length===64?await cloudHash(json):infraHash(json);if(storedHash!==expectedHash)throw new Error("Bulut veri bütünlüğü doğrulanamadı");}',
    "eski hash uyumluluğu ve SHA-256 doğrulama"
  );
}

if(source.includes('expectedStamp=remoteStamp,hash=infraHash(json);')){
  replaceRequired(
    'expectedStamp=remoteStamp,hash=infraHash(json);',
    'expectedStamp=remoteStamp,hash=await cloudHash(json);',
    "yeni snapshot SHA-256 hash üretimi"
  );
}

if(source.includes("authRecoveryTimer=null")){
  writeFileSync(file,source,"utf8");
  console.log("Firebase v4 + SHA-256 protokolü ve permission/auth kurtarma sınırı zaten uygulanmış.");
  process.exit(0);
}

replaceRequired(
  'let user=null,timer=null,loading=false,lastJSON="",uploading=false,uploadQueued=false,stopRealtime=null,syncRetryCount=0;',
  'let user=null,timer=null,loading=false,lastJSON="",uploading=false,uploadQueued=false,stopRealtime=null,syncRetryCount=0,syncRetryBlocked=false,authRefreshUsed=false,authRecoveryTimer=null;',
  "retry ve auth kurtarma durum alanları"
);

replaceRequired(
  'function markSynced(){syncRetryCount=0;lastSyncAt=Date.now();try{localStorage.setItem(LAST_SYNC_KEY,String(lastSyncAt));}catch(e){}status("Senkronize","synced",syncAgo(lastSyncAt));}',
  'function markSynced(){syncRetryCount=0;syncRetryBlocked=false;authRefreshUsed=false;clearTimeout(authRecoveryTimer);authRecoveryTimer=null;lastSyncAt=Date.now();try{localStorage.setItem(LAST_SYNC_KEY,String(lastSyncAt));}catch(e){}status("Senkronize","synced",syncAgo(lastSyncAt));}',
  "başarı sonrası retry ve auth kurtarmayı sıfırlama"
);

replaceRequired(
  'function syncErrorText(error){return String(error&&((error.code&&String(error.code).replace(/^firestore\\\//,""))||error.message)||"hata").slice(0,100);}',
  'function syncErrorText(error){const code=String(error&&error.code||"").toLowerCase();if(code.includes("permission-denied"))return "Firebase erişim izni reddedildi";if(code.includes("unauthenticated"))return "Bulut oturumu doğrulanamadı";return String(error&&((error.code&&String(error.code).replace(/^firestore\\\//,""))||error.message)||"hata").slice(0,100);}',
  "anlaşılır auth hata metni"
);

replaceRequired(
  'async function refreshCloudAuth(error){const code=String(error&&error.code||"");if(!user||typeof user.getIdToken!=="function"||(!code.includes("permission-denied")&&!code.includes("unauthenticated")))return false;try{await user.getIdToken(true);return true;}catch(_){return false;}}\nfunction reportSyncError(scope,error){syncRetryCount=Math.min(9,syncRetryCount+1);console.error(error);infraError(scope,error);const detail=syncErrorText(error),transient=transientSyncError(error);if(transient||syncRetryCount<=3)status("Buluta tekrar bağlanıyor…","syncing",detail+" · cihazda kayıtlı");else status("Senkron hatası","error",detail);}',
  'async function refreshCloudAuth(error){const code=String(error&&error.code||"");if(authRefreshUsed||!user||typeof user.getIdToken!=="function"||(!code.includes("permission-denied")&&!code.includes("unauthenticated")))return false;authRefreshUsed=true;try{await user.getIdToken(true);return true;}catch(_){return false;}}\nfunction reportSyncError(scope,error,retryAfterAuth=false){const transient=transientSyncError(error)||retryAfterAuth;syncRetryBlocked=!transient;if(transient)syncRetryCount=Math.min(9,syncRetryCount+1);else syncRetryCount=0;console.error(error);infraError(scope,error);const detail=syncErrorText(error);if(retryAfterAuth)status("Oturum doğrulanıyor…","syncing","Bulut oturumu yenileniyor · cihazda kayıtlı");else if(transient)status("Buluta tekrar bağlanıyor…","syncing",detail+" · cihazda kayıtlı");else status("Senkron hatası","error",detail);}',
  "geçici, kalıcı ve auth kurtarma hata ayrımı"
);

replaceRequired(
  'catch(x){await refreshCloudAuth(x);reportSyncError("firebase-conflict",x);}',
  'catch(x){const authRetry=await refreshCloudAuth(x);reportSyncError("firebase-conflict",x,authRetry);}',
  "çakışma auth retry"
);

replaceRequired(
  'const r=await readRemote(latest);await applyMerged(r,safeJSONParse(json));syncRetryCount=Math.max(syncRetryCount,1);uploadQueued=true;',
  'const r=await readRemote(latest);await applyMerged(r,safeJSONParse(json));syncRetryBlocked=false;syncRetryCount=Math.max(syncRetryCount,1);uploadQueued=true;',
  "çakışma retry kilidi"
);

replaceRequired(
  '}else{await refreshCloudAuth(e);reportSyncError("firebase-upload",e);}',
  '}else{const authRetry=await refreshCloudAuth(e);reportSyncError("firebase-upload",e,authRetry);}',
  "yükleme auth retry"
);

replaceRequired(
  'finally{uploading=false;if(uploadQueued||(!loading&&user&&dirty)){uploadQueued=false;clearTimeout(timer);timer=setTimeout(upload,syncRetryCount?syncRetryDelay():120);}}',
  'finally{uploading=false;if(uploadQueued||(!loading&&user&&dirty&&!syncRetryBlocked)){uploadQueued=false;clearTimeout(timer);timer=setTimeout(upload,syncRetryCount?syncRetryDelay():120);}}',
  "kalıcı hatada otomatik retry durdurma"
);

replaceRequired(
  'window.yksCloudForceDirty=()=>{setDirty(true);if(user&&navigator.onLine){clearTimeout(timer);timer=setTimeout(upload,100);}};\nfunction resumeCloudSync(){if(!user||loading||uploading||!dirty||!navigator.onLine)return;clearTimeout(timer);timer=setTimeout(upload,300+Math.floor(Math.random()*500));}',
  'window.yksCloudForceDirty=()=>{setDirty(true);if(user&&navigator.onLine&&!syncRetryBlocked){clearTimeout(timer);timer=setTimeout(upload,100);}};\nfunction resumeCloudSync(){if(!user||loading||uploading||!dirty||!navigator.onLine||syncRetryBlocked)return;clearTimeout(timer);timer=setTimeout(upload,300+Math.floor(Math.random()*500));}',
  "kalıcı auth hatasını görünürlük/ağ dönüşünde tekrar tekrar tetiklememe"
);

replaceRequired(
  '}catch(e){await refreshCloudAuth(e);reportSyncError("firebase-download",e);}\n  finally{loading=false;if(user&&dirty&&navigator.onLine&&syncRetryCount){clearTimeout(timer);timer=setTimeout(upload,syncRetryDelay());}}',
  '}catch(e){const authRetry=await refreshCloudAuth(e);reportSyncError("firebase-download",e,authRetry);if(authRetry){clearTimeout(authRecoveryTimer);authRecoveryTimer=setTimeout(()=>{if(user&&navigator.onLine&&!loading)downloadOrSeed();},600+Math.floor(Math.random()*500));}}\n  finally{loading=false;if(user&&dirty&&navigator.onLine&&syncRetryCount&&!syncRetryBlocked){clearTimeout(timer);timer=setTimeout(upload,syncRetryDelay());}}',
  "ilk indirme permission-denied sonrası token yenileyip yeniden indirme"
);

replaceRequired(
  '  user=u;\n  if(u){',
  '  user=u;syncRetryBlocked=false;authRefreshUsed=false;clearTimeout(authRecoveryTimer);authRecoveryTimer=null;\n  if(u){',
  "auth durumu değişince kurtarma kilidini sıfırlama"
);

writeFileSync(file,source,"utf8");
console.log("Firebase v4 protokolü, SHA-256 bütünlüğü, permission/auth kurtarma ve geçici hata retry sağlamlaştırması dist çıktısına uygulandı.");
