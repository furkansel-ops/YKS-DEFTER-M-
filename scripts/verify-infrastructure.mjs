import {readFile,readdir,stat} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,"..");
const read=path=>readFile(resolve(root,path),"utf8");
const fail=message=>{throw new Error(`Altyapı doğrulaması: ${message}`);};
const must=(value,message)=>{if(!value)fail(message);};

const [pkgText,versionText,tsconfigText,srcPkgText,ci,deploy,nvmrc]=await Promise.all([
  read("package.json"),read("version.json"),read("tsconfig.json"),read("src/package.json"),
  read(".github/workflows/ci.yml"),read(".github/workflows/deploy-pages.yml"),read(".nvmrc")
]);
const pkg=JSON.parse(pkgText),version=JSON.parse(versionText),tsconfig=JSON.parse(tsconfigText),srcPkg=JSON.parse(srcPkgText);

must(pkg.private===true,"paket public npm yayınına açık olmamalı");
must(pkg.version===version.version,"package.json ve version.json sürümleri eşleşmiyor");
must(pkg.packageManager==="npm@10.9.8","npm sürümü sabitlenmemiş");
must(pkg.engines?.node===">=22 <25","Node çalışma aralığı beklenen değer değil");
must(pkg.scripts?.["infra:check"]==="node scripts/verify-infrastructure.mjs","infra:check komutu eksik");
must(pkg.scripts?.build?.includes("npm run typecheck")&&pkg.scripts?.build?.includes("npm run build:assets"),"build tür kontrolü + varlık derlemesi ayrımını korumuyor");
must(pkg.scripts?.check==="npm run infra:check && npm run typecheck && npm test && npm run build:assets","check zinciri deterministik değil veya TypeScript'i gereksiz tekrar çalıştırıyor");

must(tsconfig.compilerOptions?.strict===true,"TypeScript strict kapatılmış");
must(tsconfig.compilerOptions?.noUncheckedIndexedAccess===true,"noUncheckedIndexedAccess kapatılmış");
must(tsconfig.compilerOptions?.noFallthroughCasesInSwitch===true,"switch düşüş koruması kapatılmış");
must(srcPkg.type==="module","src TypeScript ESM sınırı eksik");
must(nvmrc.trim()==="22",".nvmrc Node 22 tabanını göstermiyor");

for(const [name,text] of [["CI",ci],["Pages",deploy]]){
  must(text.includes("actions/checkout@v7"),`${name} güncel checkout eylemini kullanmıyor`);
  must(text.includes("actions/setup-node@v7"),`${name} güncel Node kurulum eylemini kullanmıyor`);
  must(text.includes("node-version: 22"),`${name} ana doğrulamayı Node 22 ile yapmıyor`);
  must(text.includes("persist-credentials: false"),`${name} checkout kimlik bilgilerini gereksiz yere kalıcı tutuyor`);
  must(text.includes("npm ci --no-audit --no-fund"),`${name} deterministik/hafif npm ci komutunu kullanmıyor`);
}
must(/permissions:\s*\n\s*contents: read/.test(ci),"CI salt-okunur içerik iznini korumuyor");
must(!/contents:\s*write/.test(ci),"CI içerik yazma izni almamalı");
must(/pages:\s*write/.test(deploy)&&/id-token:\s*write/.test(deploy),"Pages için gerekli en dar yayın izinleri eksik");
must(deploy.includes("npm run release:check"),"Pages dağıtımı release kontrolünden geçmiyor");
must(ci.includes("node-version: 24"),"Node 24 uyumluluk kapısı eksik");

const workflows=await readdir(resolve(root,".github/workflows"));
must(!workflows.some(name=>/upgrade|once|temp|temporary/i.test(name)),"geçici/tek-seferlik workflow kalmış");

const budgets={"app.js":1_100_000,"app.css":320_000,"index.html":180_000,"sw.js":32_000};
for(const [file,max] of Object.entries(budgets)){
  const info=await stat(resolve(root,file));
  must(info.size<=max,`${file} ${info.size} bayt ile ${max} bayt kaynak bütçesini aştı`);
}

console.log(`Altyapı doğrulandı: Node 22 tabanı + Node 24 uyumluluğu, salt-okunur CI, ESM sınırı, deterministik build ve ${Object.keys(budgets).length} kaynak bütçesi.`);
