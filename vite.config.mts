import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {defineConfig,type Plugin} from "vite";

const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";
const FIREBASE_RUNTIME_RE=/<script type="application\/json" id="legacyFirebaseSyncModule"[^>]*>([\s\S]*?)<\/script>\s*/u;

function extractFirebaseRuntime(html:string):string{
  const runtimeMatch=html.match(FIREBASE_RUNTIME_RE);
  const sourceText=runtimeMatch?.[1];
  if(!runtimeMatch||!sourceText)throw new Error("Legacy Firebase eşitleme kaynağı index.html içinde bulunamadı");
  const source=sourceText.replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`);
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