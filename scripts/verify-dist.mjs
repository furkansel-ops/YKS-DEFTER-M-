import {access,readFile} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist");
const required=[
  "index.html","404.html","app.js","app.css","sw.js","version.json","manifest.webmanifest",
  "modules/core-utils.js","modules/stability.js","modules/topic-guides.js",
  "modules/learning-lab.js","modules/learning-lab-v2.js","modules/learning-lab-v3.js","modules/target-center.js","modules/export-center.js",
  "modules/error-journal.js","modules/personal-upgrades.js","modules/progress-v2.js",
  "modules/release-selftest.js"
];

for(const file of required)await access(resolve(dist,file));
const index=await readFile(resolve(dist,"index.html"),"utf8");
if(!/assets\/index-[^"']+\.js/.test(index))throw new Error("TypeScript üretim paketi index.html içine bağlanmadı");
if(!index.includes('./app.js?v=4.1.0-r20')||!index.includes('./modules/stability.js?v=4.1.0-r24')||!index.includes('./modules/learning-lab.js?v=4.1.0-r20')||!index.includes('./modules/error-journal.js?v=4.1.0-r20'))throw new Error("Uygulama çalışma zamanı üretim paketinde bağlı değil");
const bundlePath=index.match(/(?:src|href)="\.\/(assets\/index-[^"']+\.js)"/)?.[1];
if(!bundlePath)throw new Error("Kararlı sürüm JavaScript paketi bulunamadı");
const [bundle,app,sw,versionText,recovery,stability,personal,progress,labV2,labV3]=await Promise.all([
  readFile(resolve(dist,bundlePath),"utf8"),
  readFile(resolve(dist,"app.js"),"utf8"),
  readFile(resolve(dist,"sw.js"),"utf8"),
  readFile(resolve(dist,"version.json"),"utf8"),
  readFile(resolve(dist,"404.html"),"utf8"),
  readFile(resolve(dist,"modules/stability.js"),"utf8"),
  readFile(resolve(dist,"modules/personal-upgrades.js"),"utf8"),
  readFile(resolve(dist,"modules/progress-v2.js"),"utf8"),
  readFile(resolve(dist,"modules/learning-lab-v2.js"),"utf8"),
  readFile(resolve(dist,"modules/learning-lab-v3.js"),"utf8")
]);
if(!bundle.includes("YKS_V4_RELEASE_OK")||!bundle.includes("4.1.0")||!bundle.includes("stable"))throw new Error("v4 kararlı sürüm denetimi üretim paketine girmedi");
if(!bundle.includes("4.1.0-r20")||!/(?:assets\/manifest-[^"']+|manifest\.webmanifest)\?v=4\.1\.0-r20/.test(index))throw new Error("r20 PWA çalışma zamanı üretim paketine girmedi");
if(!app.includes('const APP_VERSION="4.1.0"')||!app.includes('const APP_BUILD="4.1.0-r20"'))throw new Error("Kopyalanan app.js kararlı sürümle eşleşmiyor");
if(!sw.includes('const APP_VERSION="4.1.0"')||!sw.includes('const APP_BUILD="4.1.0-r20"')||!sw.includes('const CACHE="yks-core-v4.1.0-r25"'))throw new Error("Kopyalanan service worker kararlı sürüm/cache revizyonuyla eşleşmiyor");
for(const asset of ["error-journal.js?v=4.1.0-r20","personal-upgrades.js?v=4.1.0-r20","progress-v2.js?v=4.1.0-r20","learning-lab-v2.js?v=4.1.0-r24","learning-lab-v3.js?v=4.1.0-r24"])if(!sw.includes(asset))throw new Error("Kişisel modül çevrimdışı çekirdekte eksik: "+asset);
if(!stability.includes("personal-upgrades.js?v=4.1.0-r20")||!stability.includes("progress-v2.js?v=4.1.0-r20")||!stability.includes("learning-lab-v2.js?v=4.1.0-r24")||!stability.includes("learning-lab-v3.js?v=4.1.0-r24"))throw new Error("Kişisel geliştirme modülleri çalışma zamanında yüklenmiyor");
if(!personal.includes("enforceSingleUser")||!personal.includes("bindProgramGrid"))throw new Error("Tek kullanıcı / Program v2 üretim paketinde eksik");
if(!progress.includes("studyNetRelation")||!progress.includes("bestImprovingSubject"))throw new Error("İlerleme v2 üretim paketinde eksik");
if(!labV2.includes("PARAGRAPH_TIPS")||!labV2.includes("fetchElementMedia")||!labV2.includes("DEEP_DIVES")||!labV2.includes("ERA_CARDS")||!/const group=groupOf\(z\)/.test(labV2))throw new Error("Öğrenme Laboratuvarı v2 üretim paketinde eksik veya blok hesabı kararsız");
if(!labV3.includes("v320TabParagraph")||!labV3.includes("Bilim Kartları")||!labV3.includes("v4SetScienceSubject")||!labV3.includes("deepDives")||!labV3.includes("v4PeriodicSetType")||!labV3.includes("YKS trend paneli")||!labV3.includes("Kronoloji timeline")||!labV3.includes("decorateTimeline")||!labV3.includes("bindMainTabs")||!labV3.includes('version:"3.2.1"'))throw new Error("Öğrenme Laboratuvarı v3 / periyodik ve kronoloji çalışma katmanı üretim paketinde eksik");
if(!sw.includes("Response.redirect(appRootUrl(),302)")||!sw.includes("self.registration.scope"))throw new Error("PWA eski başlangıç yolu kurtarma mantığı üretim paketinde yok");
if(!recovery.includes('/YKS-DEFTER-M-/')||!recovery.includes('location.replace'))throw new Error("GitHub Pages 404 kurtarma sayfası doğru uygulama köküne yönlendirmiyor");
let version;
try{version=JSON.parse(versionText);}catch{throw new Error("Kopyalanan version.json geçerli JSON değil");}
if(version?.version!=="4.1.0"||version?.build!=="4.1.0-r20"||version?.schema!==21)throw new Error("Kopyalanan version.json kararlı sürümle eşleşmiyor");
console.log(`Üretim paketi doğrulandı: ${required.length} geçiş dosyası + TypeScript paketi + sürüm/PWA/kişisel modül bütünlüğü`);
