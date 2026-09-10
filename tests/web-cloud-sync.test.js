const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Firebase eşitleme kaynağı inert HTML içinde güvenli birleştirme ve sınırlı retry ile korunur",()=>{
  const index=read("index.html");
  assert.match(index,/type="application\/json" id="legacyFirebaseSyncModule"/);
  assert.match(index,/apiKey:\s*""/);
  for(const marker of [
    "signInWithPopup","signInWithRedirect","getRedirectResult","onAuthStateChanged",
    "runTransaction(db","SYNC_CONFLICT","baselineKnown","applyMerged","RETRY_DELAYS",
    "scheduleRetry","yksCloudPrepareForDeletion","deleteCloudCopy","Bulut kopyası silindi",
    "readBaseSnapshot","storeBaseSnapshot","mergeStates(remote.obj,localObj,DATA_SCHEMA,base||undefined)",
    "deleted:true","cleanupPending:true","cleanupDeletedCloud","handleRemoteDeletion","markReseedRequested",
    "replacingDeleted","syncMatches","pendingRemote","accountMismatchNotice","waitForCloudIdle"
  ])assert.ok(index.includes(marker),marker);
  assert.match(index,/retryAttempt>=RETRY_DELAYS\.length/);
  assert.match(index,/p\+=450/);
  assert.match(index,/const CLOUD_FORMAT=4/);
  assert.match(index,/index:i,format:CLOUD_FORMAT/);
  assert.match(index,/const unknownBaseline=!replacingDeleted/);
  assert.match(index,/readRemote\(snap,u\.uid\)/);
  assert.match(index,/applyRemote\(r,"realtime",u\.uid,listenerGeneration\)/);
  assert.match(index,/handleRemoteDeletion\(u\.uid,listenerGeneration\)/);
  assert.match(index,/accountId&&accountId!==u\.uid/);
  assert.match(index,/window\.yksCloudPrepareForDeletion=async[\s\S]*await waitForCloudIdle\(\)/);
  assert.doesNotMatch(index,/snap\.docs\.length>498/);
  assert.doesNotMatch(index,/finally\{uploading=false;if\(uploadQueued\|\|\(!loading&&user&&dirty\)\)/);
});

test("Dexie köprüsü hesap bazlı üç yönlü birleştirme tabanını saklar",()=>{
  const bridge=read("src/data/legacy-data-bridge.ts"),migration=read("src/data/migration.ts");
  for(const marker of ["readCloudBaseline","writeCloudBaseline","clearCloudBaseline","cloud-base:"])assert.ok(bridge.includes(marker),marker);
  assert.match(bridge,/sourceHash!==hash/);
  assert.match(migration,/key:string/);
});

test("Production build web, Android ve Windows için aynı yerel SDK eşitlemesini paketler",()=>{
  const vite=read("vite.config.mts"),pkg=JSON.parse(read("package.json"));
  assert.match(vite,/prepareWebCloudRuntime/);
  assert.match(vite,/isolateCloudShell/);
  assert.match(vite,/legacyFirebaseSyncModule/);
  assert.match(vite,/firebase-sync-runtime\.js/);
  assert.match(vite,/emitFile/);
  assert.match(vite,/FIREBASE_WEB_API_KEY="AIza/);
  assert.match(vite,/mode==="android"/);
  assert.match(vite,/mode==="desktop"/);
  assert.match(vite,/type:"chunk",id:cloudEntry/);
  assert.match(vite,/"firebase\/\$1"/);
  assert.equal(pkg.dependencies.firebase,"12.17.1");
  assert.equal(pkg.scripts["build:android"].includes("--mode android"),true);
  assert.equal(pkg.scripts["build:desktop"].includes("--mode desktop"),true);
  assert.equal(pkg.scripts["android:sync"],"npm run build:android && cap sync android");
});

test("Cihazlar arası eşitleme Merkez > Veri içinde normal kart ve taşınabilir giriş sunar",()=>{
  const shell=read("src/ui/play-store-shell.ts"),css=read("src/ui/cloud-sync-indicator.css");
  assert.match(shell,/installEmbeddedCloudSyncCard/);
  assert.match(shell,/getElementById\("mrp_veri"\)/);
  assert.match(shell,/web-cloud-sync-card/);
  for(const marker of ["cloudSyncText","cloudSyncMeta","cloudLoginBtn","cloudRetryBtn","cloudDeleteBtn","Google ile giriş","Bulut kopyasını sil","activateWebCloudSync"])assert.ok(shell.includes(marker),marker);
  assert.match(shell,/document\.getElementById\(CLOUD_RUNTIME_ID\)\?\.remove\(\)/);
  assert.match(shell,/dataset\.webCloudRuntimeRetry/);
  assert.match(shell,/window\.addEventListener\("online"/);
  assert.doesNotMatch(shell,/if\(isNativeApp\(\)\)return false/);
  assert.match(shell,/box\.dataset\.embeddedApp=String\(isNativeApp\(\)\)/);
  for(const marker of ["cloudAuthForm","cloudEmail","cloudPassword","cloudSignupBtn","cloudResetBtn","cloudLinkForm","cloudVerification","cloudCheckVerificationBtn"])assert.ok(shell.includes(marker),marker);
  assert.match(shell,/firebase-sync-runtime\.js\?v=4\.4\.0-r4/);
  assert.match(css,/#cloudSyncBox\.web-cloud-sync-card\{/);
  assert.match(css,/position:static!important/);
  assert.match(css,/backdrop-filter:none!important/);
  assert.doesNotMatch(css,/position:fixed/);
});

test("Taşınabilir oturum doğrulanmış e-posta kullanır ve mevcut Google hesabına şifre bağlar",()=>{
  const index=read("index.html"),shell=read("src/ui/play-store-shell.ts");
  for(const marker of ["signInWithEmailAndPassword","createUserWithEmailAndPassword","sendPasswordResetEmail","sendEmailVerification","EmailAuthProvider.credential","linkWithCredential","indexedDBLocalPersistence"])assert.ok(index.includes(marker),marker);
  assert.match(index,/if\(u&&!u\.emailVerified\)\{user=null;/);
  assert.match(index,/if\(embeddedApp\)\{authNotice\("Android ve Windows'ta e-posta ile giriş yap/);
  assert.match(index,/current\.getIdToken\(true\)/);
  assert.match(index,/window\.__YKS_AUTH__=Object\.freeze/);
  assert.match(shell,/Google şifreni değil/);
  assert.match(shell,/autocomplete="new-password"/);
  assert.doesNotMatch(index,/(?:localStorage|sessionStorage)\.setItem\([^;]*(?:passwordInput|linkPassword)/);
});

test("Cihaz silme gecikmiş kayıtları durdurur, web hesabından çıkar ve yerel depoları temizler",()=>{
  const shell=read("src/ui/play-store-shell.ts"),app=read("app.js");
  assert.match(shell,/__YKS_DELETE_IN_PROGRESS=true/);
  assert.match(shell,/yksBeginDeviceDeletion/);
  assert.match(shell,/yksCloudPrepareForDeletion/);
  assert.match(shell,/await host\.__YKS_DATA__\?\.flush/);
  assert.match(shell,/Dexie\.delete\(YKS_DATABASE_NAME\)/);
  assert.match(shell,/clearYksStorage\(localStorage\)/);
  assert.match(shell,/clearYksStorage\(sessionStorage\)/);
  assert.doesNotMatch(shell,/(?:localStorage|sessionStorage)\.clear\(\)/);
  assert.match(app,/function deviceDeletionGuarded/);
  assert.match(app,/window\.yksBeginDeviceDeletion/);
  assert.match(app,/pagehide[\s\S]*deviceDeletionGuarded/);
});

test("Bulut yardımcı katmanı hata verirse ana uygulama açılışı devam eder",()=>{
  const main=read("src/main.ts");
  assert.match(main,/installOptional\([\s\S]*"play-store-shell"[\s\S]*installPlayStoreShell/);
  assert.match(main,/v4OptionalErrors/);
});
