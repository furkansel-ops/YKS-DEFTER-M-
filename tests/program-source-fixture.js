const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
// v103: Program kaynağı testlerde VM içinde çalışır; zaman çizelgesi yardımcıları (refined-program-v103.ts)
// ayrı dosyada olduğu için içeri gömülür, CSS içe aktarımı atılır. Diğer içe aktarımları testler kendisi ayıklar.
// Etüt yardımcıları (program-etut.ts) da gömülür; pencere (program-etut-sheet.ts) DOM'a bağlı olduğu için yalnız içe aktarımı atılır.
function programSource(){
  const main=fs.readFileSync(path.join(root,"src/ui/refined-program.ts"),"utf8");
  const helper=file=>fs.readFileSync(path.join(root,file),"utf8").replace(/^export /gm,"");
  return main.replace(/^import "\.\/refined-program-v103\.css";\r?\n/m,"")
    .replace(/^import \{[^}]*\} from "\.\/refined-program-v103";\r?\n/m,()=>"")
    .replace(/^import \{[^}]*\} from "\.\/program-etut";\r?\n/m,()=>"")
    .replace(/^import \{[^}]*\} from "\.\/program-etut-sheet";\r?\n/m,()=>"")+"\n"+helper("src/ui/refined-program-v103.ts")+"\n"+helper("src/ui/program-etut.ts");
}
module.exports={programSource};
