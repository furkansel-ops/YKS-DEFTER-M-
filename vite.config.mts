import {defineConfig} from "vite";

function removeDisabledCloudRuntime(){
  return {
    name:"remove-disabled-cloud-runtime",
    transformIndexHtml(html:string){
      const sanitized=html.replace(/<script type="application\/json" id="legacyFirebaseSyncModule"[\s\S]*?<\/script>\s*/u,"");
      if(sanitized===html)throw new Error("Devre dışı bırakılmış Firebase çalışma zamanı index.html içinde bulunamadı");
      return sanitized;
    }
  };
}

export default defineConfig({
  base:"./",
  publicDir:"public",
  plugins:[removeDisabledCloudRuntime()],
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
