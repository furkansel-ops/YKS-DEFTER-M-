import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {defineConfig,type Plugin} from "vite";

const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";
const LEGACY_FIREBASE_RUNTIME=/<script type="application\/json" id="legacyFirebaseSyncModule"[^>]*>([\s\S]*?)<\/script>\s*/u;

function prepareWebCloudRuntime():Plugin{
  let runtimeSource="";
  let projectRoot=process.cwd();

  function prepareRuntime(html:string):void{
    const runtimeMatch=html.match(LEGACY_FIREBASE_RUNTIME);
    const sourceText=runtimeMatch?.[1];
    if(!runtimeMatch||!sourceText)throw new Error("Legacy Firebase eşitleme kaynağı index.html içinde bulunamadı");
    const prepared=sourceText.replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`);
    if(!prepared.includes("signInWithPopup")||!prepared.includes("onAuthStateChanged")||!prepared.includes("runTransaction")){
      throw new Error("Firebase eşitleme çalışma zamanı eksik veya bozuk");
    }
    runtimeSource=prepared;
  }

  return {
    name:"prepare-web-cloud-runtime",
    apply:"build",
    configResolved(config){
      projectRoot=config.root;
    },
    buildStart(){
      /* Vite 8/Rolldown generateBundle, transformIndexHtml'den önce çalışabilir.
         Firebase kaynağını build başında hazırlayarak hook sırasına bağımlılığı kaldırırız. */
      prepareRuntime(readFileSync(resolve(projectRoot,"index.html"),"utf8"));
    },
    transformIndexHtml(html:string){
      if(!runtimeSource)prepareRuntime(html);
      const runtimeMatch=html.match(LEGACY_FIREBASE_RUNTIME);
      if(!runtimeMatch)throw new Error("Legacy Firebase eşitleme kaynağı index.html içinde bulunamadı");
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