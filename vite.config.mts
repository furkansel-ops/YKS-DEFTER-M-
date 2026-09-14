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

  /* Firestore belge sınırı 1 MiB. Eski 240 KB parçalama aynı veriyi çok fazla
     transaction yazısına bölüyordu. 640 KB hedef + 720 KB sert byte sınırı,
     toplam isteği güvenli bölgede tutarken parça/yazma sayısını ciddi azaltır. */
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

  /* readRemote daha önce chunks koleksiyonundaki bütün eski revizyonları indirip
     tarayıcıda süzüyordu. Uzun kullanımda bu hem gereksiz okuma hem de kota/ağ
     hatası üretebilir. Meta hangi revizyonu istiyorsa sadece o belge kimliklerini oku. */
  next=replaceRequired(
    next,
    'const snap=await getDocs(chunksCol(user.uid)); let docs=snap.docs;\n  if(format>=3&&rev>0){const p=revPrefix(rev);docs=docs.filter(d=>d.id.startsWith(p)).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,count);}\n  else docs=docs.filter(d=>/^\\d{4}$/.test(d.id)).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,count);\n  if(count&&docs.length!==count)throw new Error("Bulut kaydı eksik parça içeriyor");',
    'let docs=[];\n  if(count){\n    const ids=[];\n    if(format>=3&&rev>0){const p=revPrefix(rev);for(let i=0;i<count;i++)ids.push(p+String(i).padStart(4,"0"));}\n    else for(let i=0;i<count;i++)ids.push(String(i).padStart(4,"0"));\n    for(let i=0;i<ids.length;i+=8){const batch=await Promise.all(ids.slice(i,i+8).map(id=>getDoc(chunkRef(user.uid,id))));docs.push(...batch);}\n  }\n  if(count&&(docs.length!==count||docs.some(d=>!d.exists())))throw new Error("Bulut kaydı eksik parça içeriyor");',
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
  const helper='function syncErrorText(error){return String(error&&((error.code&&String(error.code).replace(/^firestore\\//,""))||error.message)||"hata").slice(0,100);}\nasync function refreshCloudAuth(error){const code=String(error&&error.code||"");if(!user||typeof user.getIdToken!=="function"||(!code.includes("permission-denied")&&!code.includes("unauthenticated")))return false;try{await user.getIdToken(true);return true;}catch(_){return false;}}\nfunction reportSyncError(scope,error){syncRetryCount=Math.min(8,syncRetryCount+1);console.error(error);infraError(scope,error);const detail=syncErrorText(error);if(syncRetryCount<=3)status("Yeniden deneniyor…","syncing",detail);else status("Senkron hatası","error",detail);}\nasync function upload(){';
  next=replaceRequired(next,helperNeedle,helper,"kontrollü senkron hata yönetimi");

  next=replaceRequired(
    next,
    'catch(x){console.error(x);infraError("firebase-conflict",x);status("Senkron hatası","error",String(x.code||x.message||"hata").slice(0,100));}',
    'catch(x){await refreshCloudAuth(x);reportSyncError("firebase-conflict",x);}',
    "çakışma hata kurtarma"
  );
  next=replaceRequired(
    next,
    '}else{console.error(e);infraError("firebase-upload",e);status("Senkron hatası","error",String(e.code||e.message||"hata").slice(0,100));}',
    '}else{await refreshCloudAuth(e);reportSyncError("firebase-upload",e);}',
    "yükleme hata kurtarma"
  );
  next=replaceRequired(
    next,
    'finally{uploading=false;if(uploadQueued||(!loading&&user&&dirty)){uploadQueued=false;clearTimeout(timer);timer=setTimeout(upload,120);}}',
    'finally{uploading=false;if(uploadQueued||(!loading&&user&&dirty)){uploadQueued=false;clearTimeout(timer);const wait=syncRetryCount?Math.min(60000,1200*Math.pow(2,Math.min(syncRetryCount-1,5))):120;timer=setTimeout(upload,wait);}}',
    "senkron geri-deneme gecikmesi"
  );

  return next;
}

function extractFirebaseRuntime(html:string):string{
  const runtimeMatch=html.match(FIREBASE_RUNTIME_RE);
  const sourceText=runtimeMatch?.[1];
  if(!runtimeMatch||!sourceText)throw new Error("Legacy Firebase eşitleme kaynağı index.html içinde bulunamadı");
  const keyed=sourceText.replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`);
  const source=hardenFirebaseRuntime(keyed);
  if(!source.includes("signInWithPopup")||!source.includes("onAuthStateChanged")||!source.includes("runTransaction")){
    throw new Error("Firebase eşitleme çalışma zamanı eksik veya bozuk");
  }
  return source;
}

/* Migration note: remove-disabled-cloud-runtime was the Play-only transition step.
   Web Firebase sync is restored through prepare-web-cloud-runtime below. */
function prepareWebCloudRuntime():Plugin{
  /* Vite 8/rolldown generateBundle'i transformIndexHtml'den önce çalıştırabilir.
     Kaynağı build başında hazırlamak hook sırasından bağımsız ve deterministik kalır. */
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

export default defineConfig({
  base:"./",
  publicDir:"public",
  plugins:[prepareWebCloudRuntime()],
  build:{
    outDir:"dist",
    emptyOutDir:true,
    sourcemap:true
  },
  server:{
    host:"0.0.0.0",
    port:4173
  },
  preview:{
    host:"0.0.0.0",
    port:4174
  }
});