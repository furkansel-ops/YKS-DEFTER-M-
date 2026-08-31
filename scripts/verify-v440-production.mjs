import {readFile,readdir,stat} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist"),assets=resolve(dist,"assets");
const fail=message=>{throw new Error(`v4.4.0 üretim kapısı: ${message}`);};
const index=await readFile(resolve(dist,"index.html"),"utf8");
const entry=index.match(/(?:src|href)="\.\/(assets\/index-[^"']+\.js)"/)?.[1];
if(!entry)fail("hash'li ana JavaScript paketi bulunamadı");

const files=await readdir(assets);
const resilienceJs=files.find(name=>/^runtime-resilience-v431-.+\.js$/.test(name));
const resilienceCss=files.find(name=>/^runtime-resilience-v431-.+\.css$/.test(name));
if(!resilienceJs||!resilienceCss)fail("runtime resilience ayrı lazy JS/CSS chunk olarak üretilmedi");

const v44Prefixes=[
  "biology-yks-question-v44","biology-layer-guide-v44","biology-topic-map-v44",
  "physics-lab-v44","chemistry-visuals-v44","lab-interactions-v44"
];
const v44Chunks=new Map();
for(const prefix of v44Prefixes){
  const file=files.find(name=>name.startsWith(`${prefix}-`)&&name.endsWith(".js"));
  if(!file)fail(`v4.4 lazy parçası bulunamadı: ${prefix}`);
  v44Chunks.set(prefix,file);
}

const [entryText,resilienceText,entryInfo,resilienceInfo]=await Promise.all([
  readFile(resolve(dist,entry),"utf8"),
  readFile(resolve(assets,resilienceJs),"utf8"),
  stat(resolve(dist,entry)),
  stat(resolve(assets,resilienceJs))
]);

if(entryInfo.size>260_000)fail(`ana JS ${entryInfo.size} bayt ile 260000 bayt bütçesini aştı`);
if(resilienceInfo.size>12_000)fail(`resilience lazy chunk ${resilienceInfo.size} bayt ile 12000 bayt bütçesini aştı`);
if(entryText.includes("Bir bölüm beklenmedik şekilde durdu."))fail("kurtarma arayüzü ana başlangıç paketine gömüldü");
if(entryText.includes("WebGLRenderer"))fail("Three.js/WebGL başlangıç paketine geri çekildi");
if(!resilienceText.includes("v431RuntimeNotice")||!resilienceText.includes("unhandledrejection"))fail("resilience chunk beklenen hata-kurtarma sözleşmesini taşımıyor");

for(const [prefix,file] of v44Chunks){
  const info=await stat(resolve(assets,file));
  if(info.size>40_000)fail(`${prefix} ${info.size} bayt ile 40000 bayt lazy bütçesini aştı`);
  if(entryText.includes(file)){
    // Dynamic import manifest referansı giriş paketinde olabilir; asıl özellik metninin gömülmesini aşağıdaki sınırlar yakalar.
  }
}
for(const forbidden of ["Molekül & Bağ Laboratuvarı","Önceki → seçili → sonraki","FİZİK DENEY MASASI"]){
  if(entryText.includes(forbidden))fail(`v4.4 ağır özellik içeriği başlangıç paketine gömüldü: ${forbidden}`);
}

console.log(`v4.4.0 üretim kapısı geçti: ana JS ${entryInfo.size} B, resilience ${resilienceInfo.size} B, ${v44Chunks.size} v4.4 lazy özellik parçası doğrulandı.`);
