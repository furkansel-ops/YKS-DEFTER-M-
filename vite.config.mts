import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {defineConfig,type Plugin} from "vite";

const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";
const FIREBASE_RUNTIME_RE=/<script type="application\/json" id="legacyFirebaseSyncModule"[^>]*>([\s\S]*?)<\/script>\s*/u;

function replaceRequired(source:string,needle:string,replacement:string,label:string):string{
  if(!source.includes(needle))throw new Error(`Firebase eşitleme sağlamlaştırması uygulanamadı: ${label}`);
  return source.replace(needle,replacement);
}

function hardenFirebaseRuntime(source:string):string{
  let next=source;

  next=replaceRequired(
    next,
    'function splitUtf8(str,max=240000){const out=[];let start=0;while(start<str.length){let end=Math.min(str.length,start+max);while(end>start&&new Blob([str.slice(start,end)]).size>280000)end-=Math.max(1000,Math.floor((end-start)/10));/* UTF-16 surrogate çiftini iki Firestore parçasına bölme; emoji/özel karakter bozulmasın. */if(end<str.length&&end>start){const a=str.charCodeAt(end-1),b=str.charCodeAt(end);if(a>=0xD800&&a<=0xDBFF&&b>=0xDC00&&b<=0xDFFF)end--;}out.push(str.slice(start,end));start=end;}return out;}',
    'function splitUtf8(str,max=640000){const out=[];let start=0;while(start<str.length){let end=Math.min(str.length,start+max);while(end>start&&new Blob([str.slice(start,end)]).size>720000)end-=Math.max(2000,Math.floor((end-start)/10));/* UTF-16 surrogate çiftini iki Firestore parçasına bölme; emoji/özel karakter bozulmasın. */if(end<str.length&&end>start){const a=str.charCodeAt(end-1),b=str.charCodeAt(end);if(a>=0xD800&&a<=0xDBFF&&b>=0xDC00&&b<=0xDFFF)end--;}out.push(str.slice(start,end));start=end;}return out;}',
    "daha az Firestore parçası"
  );

  next=replaceRequired(
    next,
    'const parts=splitUtf8(json); if(parts.length>32)throw new Error("Bulut verisi çok büyük (güvenli işlem sınırı aşıldı)");',
    'const parts=splitUtf8(json); if(parts.length>12)throw new Error("Bulut verisi çok büyük (güvenli işlem sınırı aşıldı)");',
    "transaction parça sınırı"
  );

  next=replaceRequired(
    next,
    'const snap=await getDocs(chunksCol(uid)); let docs=snap.docs;\n  if(format>=3&&rev>0){const p=revPrefix(rev);docs=docs.filter(d=>d.id.startsWith(p)).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,count);}\n  else docs=docs.filter(d=>/^\\d{4}$/.test(d.id)).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,count);\n  if(count&&docs.length!==count)throw new Error("Bulut kaydı eksik parça içeriyor");',
    'let docs=[];\n  if(count){\n    const ids=[];\n    if(format>=3&&rev>0){const p=revPrefix(rev);for(let i=0;i<count;i++)ids.push(p+String(i).padStart(4,"0"));}\n    else for(let i=0;i<count;i++)ids.push(String(i).padStart(4,"0"));\n    for(let i=0;i<ids.length;i+=8){const batch=await Promise.all(ids.slice(i,i+8).map(id=>getDoc(chunkRef(uid,id))));docs.push(...batch);}\n  }\n  if(count&&(docs.length!==count||docs.some(d=>!d.exists())))throw new Error("Bulut kaydı eksik parça içeriyor");',
    "yalnız aktif revizyonu okuma"
  );

  next=replaceRequired(
    next,
    'let user=null,timer=null,loading=false,lastJSON="",uploading=false,uploadQueued=false,stopRealtime=null;',
    'let user=null,timer=null,loading=false,lastJSON="",uploading=false,uploadQueued=false,stopRealtime=null,syncRetryCount=0;',
    "senkron retry sayacı"
  );

  next=replaceRequired(
    next,
    'function markSynced(){lastSyncAt=Date.now();try{localStorage.setItem(LAST_SYNC_KEY,String(lastSyncAt));}catch(e){}status("Senkronize","synced",syncAgo(lastSyncAt));}',
    'function markSynced(){syncRetryCount=0;lastSyncAt=Date.now();try{localStorage.setItem(LAST_SYNC_KEY,String(lastSyncAt));}catch(e){}status("Senkronize","synced",syncAgo(lastSyncAt));}',
    "başarılı senkron retry sıfırlama"
  );

  const helperNeedle='async function upload(){';
  const helper='function syncErrorText(error){return String(error&&((error.code&&String(error.code).replace(/^firestore\\//,""))||error.message)||"hata").slice(0,100);}\nfunction transientSyncError(error){const code=String(error&&error.code||"").toLowerCase();return ["unavailable","deadline-exceeded","aborted","resource-exhausted","cancelled","internal","unknown","network-request-failed"].some(x=>code.includes(x));}\nfunction syncRetryDelay(){const step=Math.min(6,Math.max(0,syncRetryCount-1)),base=Math.min(90000,1000*Math.pow(2,step)),jitter=.8+Math.random()*.4;return Math.max(700,Math.round(base*jitter));}\nasync function refreshCloudAuth(error){const code=String(error&&error.code||"");if(!user||typeof user.getIdToken!=="function"||(!code.includes("permission-denied")&&!code.includes("unauthenticated")))return false;try{await user.getIdToken(true);return true;}catch(_){return false;}}\nfunction reportSyncError(scope,error){syncRetryCount=Math.min(9,syncRetryCount+1);console.error(error);infraError(scope,error);const detail=syncErrorText(error),transient=transientSyncError(error);if(transient||syncRetryCount<=3)status("Buluta tekrar bağlanıyor…","syncing",detail+" · cihazda kayıtlı");else status("Senkron hatası","error",detail);}\nasync function upload(){';
  next=replaceRequired(next,helperNeedle,helper,"kontrollü senkron hata yönetimi");

  next=replaceRequired(next,'catch(x){if(!isCurrent())return;console.error(x);infraError("firebase-conflict",x);status("Senkron hatası","error",String(x.code||x.message||"hata").slice(0,100));}','catch(x){if(!isCurrent())return;await refreshCloudAuth(x);if(!isCurrent())return;reportSyncError("firebase-conflict",x);}',"çakışma hata kurtarma");
  next=replaceRequired(next,'const r=await readRemote(latest,uploadUser.uid);if(await mergeUploadConflict(r))uploadQueued=true;','const r=await readRemote(latest,uploadUser.uid);if(await mergeUploadConflict(r)){syncRetryCount=Math.max(syncRetryCount,1);uploadQueued=true;}',"çakışma sonrası jitter");
  next=replaceRequired(next,'}else{console.error(e);infraError("firebase-upload",e);status("Senkron hatası","error",String(e.code||e.message||"hata").slice(0,100));}','}else{await refreshCloudAuth(e);if(!isCurrent())return;reportSyncError("firebase-upload",e);}',"yükleme hata kurtarma");
  next=replaceRequired(next,'finally{if(isCurrent()){uploading=false;if(uploadQueued||(!loading&&user&&dirty)){uploadQueued=false;clearTimeout(timer);timer=setTimeout(upload,120);}}}','finally{if(isCurrent()){uploading=false;if(uploadQueued||(!loading&&user&&dirty)){uploadQueued=false;clearTimeout(timer);timer=setTimeout(upload,syncRetryCount?syncRetryDelay():120);}}}',"senkron jitter geri-deneme gecikmesi");
  next=replaceRequired(next,'window.yksCloudForceDirty=()=>{setDirty(true);if(user&&navigator.onLine){clearTimeout(timer);timer=setTimeout(upload,100);}};\nasync function downloadOrSeed(){','window.yksCloudForceDirty=()=>{setDirty(true);if(user&&navigator.onLine){clearTimeout(timer);timer=setTimeout(upload,100);}};\nfunction resumeCloudSync(){if(!user||loading||uploading||!dirty||!navigator.onLine)return;clearTimeout(timer);timer=setTimeout(upload,300+Math.floor(Math.random()*500));}\nwindow.addEventListener("online",resumeCloudSync);\ndocument.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")resumeCloudSync();});\nasync function downloadOrSeed(){',"çevrimiçi ve görünür olunca senkronu sürdürme");
  next=replaceRequired(next,'    if(r&&r.obj){await applyRemote(r,"login");}','    if(r&&r.obj){if(dirty){const localJSON=await cloudJSON();conflictBackupAdd(localJSON,r.rev);await applyMerged(r,safeJSONParse(localJSON));syncRetryCount=Math.max(syncRetryCount,1);clearTimeout(timer);timer=setTimeout(upload,syncRetryDelay());}else await applyRemote(r,"login");}',"ilk indirmede bekleyen yerel değişikliği koruma");
  next=replaceRequired(next,'}catch(e){console.error(e);infraError("firebase-download",e);status("Senkron hatası","error",String(e.code||e.message||"hata").slice(0,100));}\n  finally{loading=false;}','}catch(e){await refreshCloudAuth(e);reportSyncError("firebase-download",e);}\n  finally{loading=false;if(user&&dirty&&navigator.onLine&&syncRetryCount){clearTimeout(timer);timer=setTimeout(upload,syncRetryDelay());}}',"indirme hatası sonrası kontrollü kurtarma");

  next=replaceRequired(next,'login?.addEventListener("click",async()=>{try{status("Google açılıyor…","connecting","Hesap seçimi bekleniyor");await setPersistence(auth,browserLocalPersistence);await signInWithPopup(auth,provider);}catch(e){console.error(e);infraError("firebase-login",e);status("Giriş hatası","error",authErrorText(e));}});','async function waitAccountRuntime(){try{if(window.__YKS_ACCOUNT_LOADER_READY__){await Promise.race([window.__YKS_ACCOUNT_LOADER_READY__,new Promise(resolve=>setTimeout(()=>resolve(false),2500))]);return}if(window.YKSAccountAuth)return;if(window.__YKS_ACCOUNT_READY__){await Promise.race([window.__YKS_ACCOUNT_READY__,new Promise(resolve=>setTimeout(()=>resolve(false),2500))]);return}await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;window.removeEventListener("yks:student-coaching-ready",finish);resolve()};window.addEventListener("yks:student-coaching-ready",finish,{once:true});setTimeout(finish,2500)})}catch(e){}}\nlogin?.addEventListener("click",async()=>{try{await waitAccountRuntime();const hook=window.YKSAccountAuth?.beforeSignIn;if(typeof hook==="function"){const handled=await hook({auth,provider,setPersistence,browserLocalPersistence,signInWithPopup,status,authErrorText});if(handled)return;}status("Google açılıyor…","connecting","Hesap seçimi bekleniyor");await setPersistence(auth,browserLocalPersistence);await signInWithPopup(auth,provider);}catch(e){console.error(e);infraError("firebase-login",e);status("Giriş hatası","error",authErrorText(e));}});',"öğrenci-koç hesap seçimi");
  next=replaceRequired(next,'    login.style.display="none";logout.style.display="inline-block";status("Bağlanıyor…","connecting",u.email||u.displayName||"Google hesabı");\n    if(navigator.onLine)await downloadOrSeed();else status("Çevrimdışı","offline","Değişiklikler cihazda saklanır");','    login.style.display="none";logout.style.display="inline-block";status("Bağlanıyor…","connecting",u.email||u.displayName||"Google hesabı");\n    await waitAccountRuntime();if(authAttempt!==authSession)return;let account=null;try{account=await window.YKSAccountAuth?.onSignedIn?.({user:u,auth,db});if(authAttempt!==authSession)return;}catch(e){if(authAttempt!==authSession)return;console.error(e);infraError("account-profile",e);status("Hesap profili açılamadı","error",String(e.code||e.message||"hata").slice(0,100));await signOut(auth);return;}\n    if(account&&account.role==="reauth"){user=null;status("Giriş gerekli","signedout","Devam etmek için giriş yap");return;}\n    if(account&&account.role==="coach"){user=null;status("Koç hesabı","synced",u.email||u.displayName||"Koçluk Paneli");return;}\n    if(navigator.onLine){if(dirty)await upload();else await downloadOrSeed();}else status("Çevrimdışı","offline","Değişiklikler cihazda saklanır");',"koç hesabında öğrenci snapshot senkronunu ayırma");
  next=replaceRequired(next,'  }else{login.style.display="inline-block";logout.style.display="none";status("Giriş yapılmadı","signedout","Bulut senkronu kapalı");}','  }else{try{window.YKSAccountAuth?.onSignedOut?.();}catch(e){}login.style.display="inline-block";logout.style.display="none";status("Giriş yapılmadı","signedout","Bulut senkronu kapalı");}',"hesap çıkışı temizliği");

  return next;
}

function extractFirebaseRuntime(html:string):string{
  const runtimeMatch=html.match(FIREBASE_RUNTIME_RE);
  const sourceText=runtimeMatch?.[1];
  if(!runtimeMatch||!sourceText)throw new Error("Legacy Firebase eşitleme kaynağı index.html içinde bulunamadı");
  const keyed=sourceText.replace(/\r\n/g,"\n").replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`);
  const source=hardenFirebaseRuntime(keyed);
  if(!source.includes("signInWithPopup")||!source.includes("onAuthStateChanged")||!source.includes("runTransaction"))throw new Error("Firebase eşitleme çalışma zamanı eksik veya bozuk");
  return source;
}

function prepareWebCloudRuntime():Plugin{
  let runtimeSource=extractFirebaseRuntime(readFileSync(resolve(process.cwd(),"index.html"),"utf8"));
  return {
    name:"prepare-web-cloud-runtime",
    apply:"build",
    transformIndexHtml(html:string){
      const runtimeMatch=html.match(FIREBASE_RUNTIME_RE);
      if(!runtimeMatch)throw new Error("Legacy Firebase eşitleme kaynağı index.html içinde bulunamadı");
      runtimeSource=extractFirebaseRuntime(html);
      const withoutRuntime=html.replace(runtimeMatch[0],"");
      return withoutRuntime.replace(/<div id="cloudSyncBox"[\s\S]*?<\/div>\s*/u,"");
    },
    generateBundle(){
      if(!runtimeSource)throw new Error("Firebase eşitleme çalışma zamanı build sırasında hazırlanamadı");
      this.emitFile({type:"asset",fileName:"firebase-sync-runtime.js",source:runtimeSource});
    }
  };
}

const OFFLINE_STARTUP_MODULES=[
  "src/main.ts",
  "src/ui/onboarding-profile-v45.ts",
  "src/ui/teachers-v2-custom-fast.ts","src/ui/teachers-v2-media.ts","src/ui/teachers-v2-library.ts",
  "src/ui/top-sync-indicator.ts","src/ui/student-account-loader.ts",
  "src/ui/today-v43.ts","src/ui/analysis-center-v43.ts","src/ui/learning-cycle-v43.ts",
  "src/ui/lab-quiz-v43.ts","src/ui/navigation-v43.ts","src/ui/personalization-v43.ts",
  "src/ui/focus-session-guard-v43.ts","src/ui/runtime-resilience-v431.ts","src/ui/refined-shell.ts"
];

function prepareOfflineStartupAssets():Plugin{
  return {
    name:"prepare-offline-startup-assets",
    apply:"build",
    generateBundle:{order:"post",handler(_options,bundle){
      const chunks=Object.values(bundle).filter(item=>item.type==="chunk");
      const roots=OFFLINE_STARTUP_MODULES.map(module=>{
        const chunk=chunks.find(item=>Object.keys(item.modules).some(id=>id.replace(/\\/g,"/").endsWith("/"+module)));
        if(!chunk)throw new Error(`Çevrimdışı başlangıç modülü çıktıda bulunamadı: ${module}`);
        return chunk;
      });
      const entry=roots[0];
      if(!entry?.isEntry)throw new Error("Çevrimdışı başlangıç giriş dosyası bulunamadı");
      const assets=new Set<string>();
      const visit=(fileName:string):void=>{
        if(assets.has(fileName))return;
        const item=bundle[fileName];
        if(!item||!/^assets\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:js|css)$/.test(fileName))throw new Error(`Geçersiz çevrimdışı başlangıç dosyası: ${fileName}`);
        assets.add(fileName);
        if(item.type!=="chunk")return;
        for(const imported of item.imports)visit(imported);
        const metadata=(item as typeof item&{viteMetadata?:{importedCss?:Set<string>}}).viteMetadata;
        for(const css of metadata?.importedCss??[])visit(css);
      };
      /* Yalnız açılışta çağrılan modüller ve statik bağımlılıkları dahil edilir.
         dynamicImports izlenmez; isteğe bağlı Atlas/3B, fizik ve kimya indirilmez. */
      for(const chunk of roots)visit(chunk.fileName);
      this.emitFile({type:"asset",fileName:"offline-startup-assets.json",source:JSON.stringify({
        version:1,entry:"./"+entry.fileName,assets:[...assets].sort().map(fileName=>"./"+fileName)
      },null,2)});
    }}
  };
}

export default defineConfig({
  base:"./",
  publicDir:"public",
  plugins:[prepareWebCloudRuntime(),prepareOfflineStartupAssets()],
  build:{outDir:"dist",emptyOutDir:true,sourcemap:true},
  server:{host:"0.0.0.0",port:4173},
  preview:{host:"0.0.0.0",port:4174}
});
