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

// Konu haritası Atlas'ın kendi lazy sınırında statik kullanılır; ayrı JS isteği zorlanmaz.
// Diğer v4.4 araçları bağımsız kullanıcı etkileşimleri olduğu için ayrı lazy JS olarak kalır.
const v44StandalonePrefixes=[
  "biology-yks-question-v44","biology-layer-guide-v44",
  "physics-lab-v44","chemistry-visuals-v44","lab-interactions-v44"
];
const v44Chunks=new Map();
for(const prefix of v44StandalonePrefixes){
  const file=files.find(name=>name.startsWith(`${prefix}-`)&&name.endsWith(".js"));
  if(!file)fail(`v4.4 lazy parçası bulunamadı: ${prefix}`);
  v44Chunks.set(prefix,file);
}
const atlasJs=files.find(name=>/^biology-atlas-(?!model-).+\.js$/.test(name));
const topicMapCss=files.find(name=>/^biology-topic-map-v44-.+\.css$/.test(name));
if(!atlasJs||!topicMapCss)fail("Biyoloji konu haritası Atlas lazy sınırında paketlenmedi");

const [entryText,resilienceText,atlasText,entryInfo,resilienceInfo,atlasInfo]=await Promise.all([
  readFile(resolve(dist,entry),"utf8"),
  readFile(resolve(assets,resilienceJs),"utf8"),
  readFile(resolve(assets,atlasJs),"utf8"),
  stat(resolve(dist,entry)),
  stat(resolve(assets,resilienceJs)),
  stat(resolve(assets,atlasJs))
]);

if(entryInfo.size>260_000)fail(`ana JS ${entryInfo.size} bayt ile 260000 bayt bütçesini aştı`);
if(resilienceInfo.size>12_000)fail(`resilience lazy chunk ${resilienceInfo.size} bayt ile 12000 bayt bütçesini aştı`);
if(atlasInfo.size>180_000)fail(`Biyoloji Atlası ${atlasInfo.size} bayt ile 180000 bayt lazy bütçesini aştı`);
if(entryText.includes("Bir bölüm beklenmedik şekilde durdu."))fail("kurtarma arayüzü ana başlangıç paketine gömüldü");
if(entryText.includes("WebGLRenderer"))fail("Three.js/WebGL başlangıç paketine geri çekildi");
if(entryText.includes("AYT GÖRSEL KONU HARİTASI"))fail("Biyoloji konu haritası başlangıç paketine geri çekildi");
if(!atlasText.includes("AYT GÖRSEL KONU HARİTASI")||!atlasText.includes("Kavramları tek bakışta bağla"))fail("Biyoloji konu haritası Atlas lazy paketinde bulunamadı");
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

console.log(`v4.4.0 üretim kapısı geçti: ana JS ${entryInfo.size} B, resilience ${resilienceInfo.size} B, Atlas ${atlasInfo.size} B + konu haritası ve ${v44Chunks.size} bağımsız v4.4 lazy parçası doğrulandı.`);
