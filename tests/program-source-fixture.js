const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
// v103: Program kaynağı testlerde VM içinde çalışır; zaman çizelgesi yardımcıları (refined-program-v103.ts)
// ayrı dosyada olduğu için içeri gömülür, CSS içe aktarımı atılır. Diğer içe aktarımları testler kendisi ayıklar.
function programSource(){
  const main=fs.readFileSync(path.join(root,"src/ui/refined-program.ts"),"utf8");
  const helpers=fs.readFileSync(path.join(root,"src/ui/refined-program-v103.ts"),"utf8").replace(/^export /gm,"");
  return main.replace(/^import "\.\/refined-program-v103\.css";\r?\n/m,"")
    .replace(/^import \{[^}]*\} from "\.\/refined-program-v103";\r?\n/m,()=>"")+"\n"+helpers;
}
module.exports={programSource};
