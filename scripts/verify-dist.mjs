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
if(!index.includes('./app.js?v=4.0.0-r14')||!index.includes('./modules/learning-lab.js?v=4.0.0-r14'))throw new Error("Uygulama çalışma zamanı üretim paketinde bağlı değil");
const bundlePath=index.match(/(?:src|href)="\.\/(assets\/index-[^"']+\.js)"/)?.[1];
if(!bundlePath)throw new Error("Kararlı sürüm JavaScript paketi bulunamadı");
const bundle=await readFile(resolve(dist,bundlePath),"utf8");
if(!bundle.includes("YKS_V4_RELEASE_OK")||!bundle.includes("4.0.0")||!bundle.includes("stable"))throw new Error("v4 kararlı sürüm denetimi üretim paketine girmedi");
console.log(`Üretim paketi doğrulandı: ${required.length} geçiş dosyası + TypeScript paketi`);
