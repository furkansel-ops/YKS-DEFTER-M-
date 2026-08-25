import {pathToFileURL} from "node:url";

const RELEASE_MARKER="4.0.0";
const LEGACY_VERSION="4.0.0";

export function extractBundlePath(index){
  return index.match(/(?:src|href)=["'](?:\.\/)?(assets\/index-[^"']+\.js)["']/)?.[1]??null;
}

export function verifyLiveAssets({index,bundle,legacyApp}){
  const bundlePath=extractBundlePath(index);
  if(!bundlePath)throw new Error("Canlı sayfada Vite JavaScript paketi bulunamadı");
  if(!index.includes('./app.js?v=4.0.0')||!index.includes('./modules/release-selftest.js?v=4.0.0'))throw new Error("Canlı sayfada beklenen çalışma zamanı dosyaları bağlı değil");
  if(/src=["']\.\/src\/main\.ts["']/.test(index))throw new Error("Canlı sayfa üretim paketi yerine TypeScript kaynak dosyasını kullanıyor");
  if(!bundle.includes("YKS_V4_RELEASE_OK")||!bundle.includes(RELEASE_MARKER)||!bundle.includes("stable"))throw new Error("Canlı Vite paketi beklenen kararlı sürüm işaretlerini taşımıyor");
  if(!legacyApp.includes(`const APP_VERSION="${LEGACY_VERSION}"`))throw new Error("Canlı çalışma zamanı sürümü beklenen değerle eşleşmiyor");
  if(legacyApp.includes("\uFFFD"))throw new Error("Canlı çalışma zamanı bozuk UTF-8 karakteri içeriyor");
  return {bundlePath,release:RELEASE_MARKER,legacyVersion:LEGACY_VERSION};
}

function cacheBusted(url,token){
  const value=new URL(url);
  value.searchParams.set("__yks_verify",token);
  return value;
}

async function fetchText(url,token){
  const response=await fetch(cacheBusted(url,token),{
    cache:"no-store",
    headers:{"cache-control":"no-cache"},
    signal:AbortSignal.timeout(15000)
  });
  if(!response.ok)throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

export async function verifyLivePages(baseUrl,{attempts=12,delayMs=5000}={}){
  const base=new URL(baseUrl.endsWith("/")?baseUrl:`${baseUrl}/`);
  let lastError;
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const token=`${Date.now()}-${attempt}`;
      const index=await fetchText(base,token);
      const bundlePath=extractBundlePath(index);
      if(!bundlePath)throw new Error("Canlı sayfada Vite JavaScript paketi bulunamadı");
      const [bundle,legacyApp]=await Promise.all([
        fetchText(new URL(bundlePath,base),token),
        fetchText(new URL("app.js?v=4.0.0",base),token)
      ]);
      return verifyLiveAssets({index,bundle,legacyApp});
    }catch(error){
      lastError=error;
      if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,delayMs));
    }
  }
  throw new Error(`Canlı GitHub Pages doğrulaması başarısız: ${lastError instanceof Error?lastError.message:String(lastError)}`);
}

const invokedPath=process.argv[1]?pathToFileURL(process.argv[1]).href:"";
if(import.meta.url===invokedPath){
  const liveUrl=process.env.LIVE_URL||process.argv[2];
  if(!liveUrl)throw new Error("LIVE_URL ortam değişkeni veya URL argümanı gerekli");
  const result=await verifyLivePages(liveUrl);
  console.log(`Canlı GitHub Pages doğrulandı: ${result.release}, çalışma zamanı ${result.legacyVersion}, ${result.bundlePath}`);
}
