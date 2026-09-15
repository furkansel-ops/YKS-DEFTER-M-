import {readFile,readdir,stat} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,"..");
const read=path=>readFile(resolve(root,path),"utf8");
const fail=message=>{throw new Error(`Altyapı doğrulaması: ${message}`);};
const must=(value,message)=>{if(!value)fail(message);};

const [pkgText,versionText,tsconfigText,srcPkgText,ci,deploy,nvmrc,firestoreRules,firebaseConfigText,firebaseRcText,cloudHardener]=await Promise.all([
  read("package.json"),read("version.json"),read("tsconfig.json"),read("src/package.json"),
  read(".github/workflows/ci.yml"),read(".github/workflows/deploy-pages.yml"),read(".nvmrc"),
  read("firestore.rules"),read("firebase.json"),read(".firebaserc"),read("scripts/harden-firebase-dist.mjs")
]);
const pkg=JSON.parse(pkgText),version=JSON.parse(versionText),tsconfig=JSON.parse(tsconfigText),srcPkg=JSON.parse(srcPkgText);
const firebaseConfig=JSON.parse(firebaseConfigText),firebaseRc=JSON.parse(firebaseRcText);
const checkoutPin="actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1";
const setupNodePin="actions/setup-node@820762786026740c76f36085b0efc47a31fe5020";

must(pkg.private===true,"paket public npm yayınına açık olmamalı");
must(pkg.version===version.version,"package.json ve version.json sürümleri eşleşmiyor");
must(pkg.packageManager==="npm@10.9.8","npm sürümü sabitlenmemiş");
must(pkg.engines?.node===">=22 <25","Node çalışma aralığı beklenen değer değil");
must(pkg.scripts?.["infra:check"]==="node scripts/verify-infrastructure.mjs","infra:check komutu eksik");
must(pkg.scripts?.build?.includes("npm run typecheck")&&pkg.scripts?.build?.includes("vite build")&&pkg.scripts?.build?.includes("verify-dist.mjs"),"build doğrudan tür kontrolü + Vite + üretim doğrulamasını korumuyor");
must(pkg.scripts?.["build:assets"]?.includes("vite build")&&!pkg.scripts?.["build:assets"]?.includes("typecheck"),"build:assets yalnız varlık derlemesi olmalı");
must(pkg.scripts?.check==="npm run infra:check && npm run typecheck && npm test && npm run build:assets","check zinciri deterministik değil veya TypeScript'i gereksiz tekrar çalıştırıyor");

must(tsconfig.compilerOptions?.strict===true,"TypeScript strict kapatılmış");
must(tsconfig.compilerOptions?.noUncheckedIndexedAccess===true,"noUncheckedIndexedAccess kapatılmış");
must(tsconfig.compilerOptions?.noFallthroughCasesInSwitch===true,"switch düşüş koruması kapatılmış");
must(srcPkg.type==="module","src TypeScript ESM sınırı eksik");
must(nvmrc.trim()==="22",".nvmrc Node 22 tabanını göstermiyor");

must(firebaseConfig?.firestore?.rules==="firestore.rules","firebase.json Firestore kural dosyasına bağlı değil");
must(firebaseRc?.projects?.default==="yks-uygulamam","Firebase varsayılan projesi beklenen proje değil");
must(/request\.auth\s*!=\s*null/.test(firestoreRules),"Firestore kuralları oturum zorunluluğunu korumuyor");
must(/request\.auth\.uid\s*==\s*userId/.test(firestoreRules),"Firestore kuralları kullanıcı UID sınırını korumuyor");
must(/request\.auth\.token\.email_verified\s*==\s*true/.test(firestoreRules),"Firestore kuralları doğrulanmış e-posta sınırını korumuyor");
must(/match \/users\/\{userId\}\/sync\/meta/.test(firestoreRules),"Firestore sync/meta yolu tanımlı değil");
must(/match \/users\/\{userId\}\/chunks\/\{chunkId\}/.test(firestoreRules),"Firestore chunks yolu tanımlı değil");
must(/data\.format is int && data\.format == 4/.test(firestoreRules),"Firestore v4 format zorunluluğu eksik");
must(/data\.count is int && data\.count >= 0 && data\.count <= 12/.test(firestoreRules),"Firestore parça sayısı production sınırıyla uyumlu değil");
must(firestoreRules.includes("data.hash.matches('^[0-9a-f]{64}$')"),"Firestore aktif meta SHA-256 zorunluluğu eksik");
must(firestoreRules.includes("chunkId.matches('^[0-9]{10}_[0-9]{4}$')"),"Firestore chunk kimliği biçim doğrulaması eksik");
must(/data\.data is string[\s\S]*data\.data\.size\(\) > 0 && data\.data\.size\(\) <= 720000/.test(firestoreRules),"Firestore chunk boyutu/boş içerik sınırı production sözleşmesiyle uyumlu değil");
must(/let meta = nextMeta\(userId\)/.test(firestoreRules),"Firestore chunk doğrulaması getAfter meta durumunu kullanmıyor");
must(/meta\.updatedAt is timestamp && meta\.updatedAt == request\.time/.test(firestoreRules),"Firestore chunk yazımı aynı transaction meta zamanına bağlanmamış");
must(/request\.resource\.data\.revision == resource\.data\.revision \+ 1/.test(firestoreRules),"Firestore meta revizyonları tek-adım ilerlemeye zorlanmıyor");
must(/allow create: if ownsUserSpace\(userId\)[\s\S]*validChunk\(userId, chunkId\)/.test(firestoreRules),"Firestore chunk create kuralı güvenli v4 doğrulamasını kullanmıyor");
must(/allow update: if false/.test(firestoreRules),"Firestore aktif chunk üzerine yazmayı açık bırakıyor");
must(/allow delete: if false/.test(firestoreRules),"Firestore meta silmeyi açık bırakıyor");
must(/function startsDeletion/.test(firestoreRules)&&/function completesDeletion/.test(firestoreRules),"Firestore güvenli silme/tombstone yaşam döngüsü eksik");
must(/match \/\{document=\*\*\}[\s\S]*allow read, write: if false/.test(firestoreRules),"Firestore varsayılan reddetme kuralı eksik");
must(!/allow\s+read\s*,\s*write\s*:\s*if\s+true/.test(firestoreRules),"Firestore kuralları herkese açık erişim içeriyor");

must(/async function cloudHash\(txt\)/.test(cloudHardener),"Firebase production runtime SHA-256 bulut hash katmanını üretmiyor");
must(/subtle\.digest\("SHA-256",bytes\)/.test(cloudHardener),"Firebase SHA-256 Web Crypto doğrulaması eksik");
must(/hash=await cloudHash\(json\)/.test(cloudHardener),"Yeni Firebase snapshot'ları SHA-256 ile yazılmıyor");
must(/storedHash\.length===64\?await cloudHash\(json\):infraHash\(json\)/.test(cloudHardener),"Eski 8 haneli bulut hash geçiş uyumluluğu eksik");

for(const [name,text] of [["CI",ci],["Pages",deploy]]){
  must(text.includes(checkoutPin),`${name} değişmez checkout SHA'sını kullanmıyor`);
  must(text.includes(setupNodePin),`${name} değişmez Node kurulum SHA'sını kullanmıyor`);
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
const workflowTexts=await Promise.all(workflows.filter(name=>/\.ya?ml$/i.test(name)).map(name=>read(`.github/workflows/${name}`)));
must(!workflowTexts.some(text=>/uses:\s+[^\s#]+@v\d+/i.test(text)),"hareketli GitHub Action etiketi kalmış; eylemler tam SHA ile sabitlenmeli");

const budgets={"app.js":1_100_000,"app.css":320_000,"index.html":180_000,"sw.js":32_000};
for(const [file,max] of Object.entries(budgets)){
  const info=await stat(resolve(root,file));
  must(info.size<=max,`${file} ${info.size} bayt ile ${max} bayt kaynak bütçesini aştı`);
}

console.log(`Altyapı doğrulandı: Node 22 tabanı + Node 24 uyumluluğu, salt-okunur CI, SHA-256 bütünlüğü, transaction bağlı Firestore v4 güvenliği, deterministik build ve ${Object.keys(budgets).length} kaynak bütçesi.`);
