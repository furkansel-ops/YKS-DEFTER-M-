import {access,readFile} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist");
const required=[
  "index.html","app.js","app.css","sw.js","version.json","manifest.webmanifest",
  "modules/core-utils.js","modules/stability.js","modules/topic-guides.js",
  "modules/learning-lab.js","modules/target-center.js","modules/export-center.js",
  "modules/release-selftest.js"
];

for(const file of required)await access(resolve(dist,file));
const index=await readFile(resolve(dist,"index.html"),"utf8");
if(!/assets\/index-[^"']+\.js/.test(index))throw new Error("TypeScript üretim paketi index.html içine bağlanmadı");
if(!index.includes('./app.js?v=4.1.0-r20')||!index.includes('./modules/learning-lab.js?v=4.1.0-r20'))throw new Error("Uygulama çalışma zamanı üretim paketinde bağlı değil");
const bundlePath=index.match(/(?:src|href)="\.\/(assets\/index-[^"']+\.js)"/)?.[1];
if(!bundlePath)throw new Error("Kararlı sürüm JavaScript paketi bulunamadı");
const [bundle,app,sw,versionText]=await Promise.all([
  readFile(resolve(dist,bundlePath),"utf8"),
  readFile(resolve(dist,"app.js"),"utf8"),
  readFile(resolve(dist,"sw.js"),"utf8"),
  readFile(resolve(dist,"version.json"),"utf8")
]);
if(!bundle.includes("YKS_V4_RELEASE_OK")||!bundle.includes("4.1.0")||!bundle.includes("stable"))throw new Error("v4 kararlı sürüm denetimi üretim paketine girmedi");
if(!bundle.includes("4.1.0-r20")||!/(?:assets\/manifest-[^"']+|manifest\.webmanifest)\?v=4\.1\.0-r20/.test(index))throw new Error("r20 PWA çalışma zamanı üretim paketine girmedi");
if(!app.includes('const APP_VERSION="4.1.0"')||!app.includes('const APP_BUILD="4.1.0-r20"'))throw new Error("Kopyalanan app.js kararlı sürümle eşleşmiyor");
if(!sw.includes('const APP_VERSION="4.1.0"')||!sw.includes('const APP_BUILD="4.1.0-r20"')||!sw.includes('const CACHE="yks-core-v4.1.0-r20"'))throw new Error("Kopyalanan service worker kararlı sürümle eşleşmiyor");
let version;
try{version=JSON.parse(versionText);}catch{throw new Error("Kopyalanan version.json geçerli JSON değil");}
if(version?.version!=="4.1.0"||version?.build!=="4.1.0-r20"||version?.schema!==21)throw new Error("Kopyalanan version.json kararlı sürümle eşleşmiyor");
console.log(`Üretim paketi doğrulandı: ${required.length} geçiş dosyası + TypeScript paketi + sürüm bütünlüğü`);
