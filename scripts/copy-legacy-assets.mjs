import {cp,mkdir} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,"..");
const output=resolve(root,"dist");
const assets=[
  "app.js",
  "app.css",
  "sw.js",
  "404.html",
  "modules",
  "manifest.webmanifest",
  "version.json",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png"
];

await mkdir(output,{recursive:true});
for(const asset of assets)await cp(resolve(root,asset),resolve(output,asset),{recursive:true,force:true});
console.log(`Legacy geçiş dosyaları dist içine kopyalandı: ${assets.length}`);
