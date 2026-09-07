import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {defineConfig,type Plugin} from "vite";

const FIREBASE_WEB_API_KEY="AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc";
const LEGACY_CLOUD_RUNTIME=/<script type="application\/json" id="legacyFirebaseSyncModule"[^>]*>([\s\S]*?)<\/script>\s*/u;

function extractCloudRuntime(html:string):{match:string;source:string}{
  const runtimeMatch=html.match(LEGACY_CLOUD_RUNTIME);
  const sourceText=runtimeMatch?.[1];
  if(!runtimeMatch||!sourceText)throw new Error("Legacy Firebase eşitleme kaynağı index.html içinde bulunamadı");
  if(!sourceText.includes("signInWithPopup")||!sourceText.includes("onAuthStateChanged")||!sourceText.includes("runTransaction")){
    throw new Error("Firebase eşitleme çalışma zamanı eksik veya bozuk");
  }
  return {match:runtimeMatch[0],source:sourceText};
}

function prepareWebCloudRuntime():Plugin{
  let projectRoot=process.cwd();
  let runtimeSource="";
  const cloudEntry="\0yks-cloud-runtime";
  return {
    name:"remove-disabled-cloud-runtime",
    apply:"build",
    configResolved(config){projectRoot=config.root;},
    async buildStart(){
      const sourceHtml=await readFile(resolve(projectRoot,"index.html"),"utf8");
      const {source}=extractCloudRuntime(sourceHtml);
      runtimeSource=source.replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`)
        .replace(/https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/firebase-(app|auth|firestore)\.js/g,"firebase/$1");
      this.emitFile({type:"chunk",id:cloudEntry,fileName:"firebase-sync-runtime.js"});
    },
    resolveId(id){if(id===cloudEntry)return id;},
    load(id){if(id===cloudEntry)return runtimeSource;},
    transformIndexHtml:{
      order:"pre",
      handler(html:string){
        const {match}=extractCloudRuntime(html);
        return html.replace(match,"").replace(/<div id="cloudSyncBox"[\s\S]*?<\/div>\s*/u,"");
      }
    }
  };
}

function isolateCloudShell():Plugin{
  return {
    name:"isolate-cloud-shell-by-build-target",apply:"build",enforce:"pre",
    transform(code,id){
      if(!/[\\/]src[\\/]ui[\\/]play-store-shell\.ts(?:\?|$)/u.test(id))return null;
      // The public client config belongs only to the bundled optional runtime.
      return {code:code.replace(/const FIREBASE_WEB_API_KEY="AIza[0-9A-Za-z_-]+";/u,'const FIREBASE_WEB_API_KEY="";'),map:null};
    }
  };
}

export default defineConfig(({mode})=>{
  const androidBuild=mode==="android";
  return {
    base:"./",
    publicDir:"public",
    define:{__YKS_BUILD_TARGET__:JSON.stringify(androidBuild?"android":mode==="desktop"?"desktop":"web")},
    plugins:[isolateCloudShell(),prepareWebCloudRuntime()],
    build:{
      outDir:"dist",
      emptyOutDir:true,
      minify:true,
      sourcemap:false
    },
    server:{
      host:"0.0.0.0",
      port:4173
    },
    preview:{
      host:"0.0.0.0",
      port:4174
    }
  };
});
