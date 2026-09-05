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

function prepareWebCloudRuntime(webCloudEnabled:boolean):Plugin{
  let projectRoot=process.cwd();
  return {
    name:"remove-disabled-cloud-runtime",
    apply:"build",
    configResolved(config){projectRoot=config.root;},
    async buildStart(){
      const sourceHtml=await readFile(resolve(projectRoot,"index.html"),"utf8");
      const {source}=extractCloudRuntime(sourceHtml);
      if(!webCloudEnabled)return;
      const runtimeSource=source.replace(/apiKey:\s*"[^"]*"/,`apiKey:"${FIREBASE_WEB_API_KEY}"`);
      this.emitFile({type:"asset",fileName:"firebase-sync-runtime.js",source:runtimeSource});
    },
    transformIndexHtml:{
      order:"pre",
      handler(html:string){
        const {match}=extractCloudRuntime(html);
        return html.replace(match,"").replace(/<div id="cloudSyncBox"[\s\S]*?<\/div>\s*/u,"");
      }
    }
  };
}

function isolateCloudShell(androidBuild:boolean):Plugin{
  return {
    name:"isolate-cloud-shell-by-build-target",
    apply:"build",
    enforce:"pre",
    transform(code,id){
      if(!/[\\/]src[\\/]ui[\\/]play-store-shell\.ts(?:\?|$)/u.test(id))return null;
      const keyDeclaration=/const FIREBASE_WEB_API_KEY="AIza[0-9A-Za-z_-]+";/u;
      if(!keyDeclaration.test(code))this.error("Play Store shell Firebase anahtar sınırı bulunamadı");
      if(!androidBuild)return {code:code.replace(keyDeclaration,'const FIREBASE_WEB_API_KEY="";'),map:null};

      const cloudStart=code.indexOf("function installEmbeddedCloudSyncCard():boolean{");
      const policyStart=code.indexOf("function installPolicyCard():boolean{");
      if(cloudStart<0||policyStart<=cloudStart)this.error("Android yerel-veri shell sınırı hazırlanamadı");
      const localOnlyCloudFunctions=`function installEmbeddedCloudSyncCard():boolean{return false;}
function activateWebCloudSync():boolean{return false;}

`;
      const withoutCloudConstants=code
        .replace(/import "\.\/cloud-sync-indicator\.css";\r?\n/u,"")
        .replace(/const CLOUD_BOX_ID=.*?\nconst CLOUD_RUNTIME_ID=.*?\nconst LEGACY_CLOUD_SOURCE_ID=.*?\nconst FIREBASE_WEB_API_KEY=.*?\n/u,"");
      const adjustedCloudStart=withoutCloudConstants.indexOf("function installEmbeddedCloudSyncCard():boolean{");
      const adjustedPolicyStart=withoutCloudConstants.indexOf("function installPolicyCard():boolean{");
      if(adjustedCloudStart<0||adjustedPolicyStart<=adjustedCloudStart)this.error("Android shell dönüşümü tutarsız kaldı");
      return {
        code:withoutCloudConstants.slice(0,adjustedCloudStart)+localOnlyCloudFunctions+withoutCloudConstants.slice(adjustedPolicyStart),
        map:null
      };
    }
  };
}

export default defineConfig(({mode})=>{
  const androidBuild=mode==="android";
  return {
    base:"./",
    publicDir:"public",
    plugins:[isolateCloudShell(androidBuild),prepareWebCloudRuntime(!androidBuild)],
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
