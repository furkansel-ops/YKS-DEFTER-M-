import {readFile,readdir,stat} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist"),assets=resolve(dist,"assets");
const fail=message=>{throw new Error(`v4.3.1 üretim kapısı: ${message}`);};
const index=await readFile(resolve(dist,"index.html"),"utf8");
const entry=index.match(/(?:src|href)="\.\/(assets\/index-[^"']+\.js)"/)?.[1];
if(!entry)fail("hash'li ana JavaScript paketi bulunamadı");

const files=await readdir(assets);
const resilienceJs=files.find(name=>/^runtime-resilience-v431-.+\.js$/.test(name));
const resilienceCss=files.find(name=>/^runtime-resilience-v431-.+\.css$/.test(name));
if(!resilienceJs||!resilienceCss)fail("runtime resilience ayrı lazy JS/CSS chunk olarak üretilmedi");

const [entryText,resilienceText,entryInfo,resilienceInfo]=await Promise.all([
  readFile(resolve(dist,entry),"utf8"),
  readFile(resolve(assets,resilienceJs),"utf8"),
  stat(resolve(dist,entry)),
  stat(resolve(assets,resilienceJs))
]);

/* v4.3.0 gerçek üretim giriş paketi yaklaşık 223 kB idi. Cila katmanının yanlışlıkla
   başlangıca gömülmesini erken yakalamak için rahat ama anlamlı bir 260 kB tavan korunur. */
if(entryInfo.size>260_000)fail(`ana JS ${entryInfo.size} bayt ile 260000 bayt bütçesini aştı`);
if(resilienceInfo.size>12_000)fail(`resilience lazy chunk ${resilienceInfo.size} bayt ile 12000 bayt bütçesini aştı`);
if(entryText.includes("Bir bölüm beklenmedik şekilde durdu."))fail("kurtarma arayüzü ana başlangıç paketine gömüldü");
if(entryText.includes("WebGLRenderer"))fail("Three.js/WebGL başlangıç paketine geri çekildi");
if(!resilienceText.includes("v431RuntimeNotice")||!resilienceText.includes("unhandledrejection"))fail("resilience chunk beklenen hata-kurtarma sözleşmesini taşımıyor");

console.log(`v4.3.1 üretim kapısı geçti: ana JS ${entryInfo.size} B, resilience ${resilienceInfo.size} B, lazy CSS ${resilienceCss}.`);
