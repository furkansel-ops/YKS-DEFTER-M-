import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist");
const pkg=JSON.parse(await readFile(resolve(root,"package.json"),"utf8"));
if(pkg.version!=="4.0.0-rc.1")throw new Error(`Beklenmeyen paket sürümü: ${pkg.version}`);
const index=await readFile(resolve(dist,"index.html"),"utf8"),asset=index.match(/(?:src|href)="\.\/(assets\/index-[^"']+\.js)"/)?.[1];
if(!asset)throw new Error("Derlenmiş v4 paketi bulunamadı");
const bundle=await readFile(resolve(dist,asset),"utf8"),legacy=await readFile(resolve(dist,"modules/release-selftest.js"),"utf8");
const checks={
  version:bundle.includes("4.0.0-rc.1"),runtime:bundle.includes("YKS_V4_RELEASE_OK"),legacy:legacy.includes("v4-bootstrap"),
  transaction:bundle.includes("runTransaction as"),conflict:bundle.includes("SYNC_CONFLICT"),hash:bundle.includes("infraHash("),
  dexie:bundle.includes("yks-defterim-v4"),screens:bundle.includes("screen-transitions")
};
const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length)throw new Error(`Sürüm adayı kontrolleri başarısız: ${failed.join(", ")}`);
console.log(`YKS Defterim ${pkg.version} sürüm adayı doğrulandı: ${Object.keys(checks).length} paket kontrolü`);
