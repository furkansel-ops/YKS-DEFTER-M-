import {defineConfig} from "vite";

const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";

function prepareWebCloudRuntime(){
  let runtimeSource="";
  return {
    name:"prepare-web-cloud-runtime",
    transformIndexHtml(html:string){
      const runtimeMatch=html.match(/<script type="application\/json" id="legacyFirebaseSyncModule"[^>]*>([\s\S]*?)<\/script>\s*/u);
      if(!runtimeMatch)throw new Error("Legacy Firebase eşitleme kaynağı index.html içinde bulunamadı");
      runtimeSource=runtimeMatch[1].replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`);
      if(!runtimeSource.includes("signInWithPopup")||!runtimeSource.includes("onAuthStateChanged")||!runtimeSource.includes("runTransaction")){
        throw new Error("Firebase eşitleme çalışma zamanı eksik veya bozuk");
      }
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