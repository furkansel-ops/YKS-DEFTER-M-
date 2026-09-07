import {access,readFile,readdir} from "node:fs/promises";
import {relative,resolve} from "node:path";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist");
const target=process.argv[2]||"web";
if(!["web","android","desktop"].includes(target))throw new Error(`Bilinmeyen release hedefi: ${target}`);

async function distTextFiles(directory){
  const entries=await readdir(directory,{withFileTypes:true}),files=[];
  for(const entry of entries){
    const absolute=resolve(directory,entry.name);
    if(entry.isDirectory())files.push(...await distTextFiles(absolute));
    else if(/\.(?:css|html?|js|json|map|txt|webmanifest|xml)$/iu.test(entry.name))files.push(absolute);
  }
  return files;
}

async function cloudTargetIsValid(){
  const files=await distTextFiles(dist),runtimePath=resolve(dist,"firebase-sync-runtime.js"),apiKeyFiles=[];
  const serverSecret=/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|["']private_key["']\s*:\s*["'][^"']+|["']type["']\s*:\s*["']service_account["']|["']client_email["']\s*:\s*["'][^"']+\.iam\.gserviceaccount\.com["']/u;
  for(const file of files){
    const text=await readFile(file,"utf8");
    if(file.endsWith(".map")||/www\.gstatic\.com\/firebasejs/iu.test(text)||serverSecret.test(text))return false;
    if(file.endsWith(".js")&&/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["'`]((?:https?:)?\/\/[^"'`]+)["'`]/u.test(text))return false;
    if(/AIza[0-9A-Za-z_-]{30,}/u.test(text))apiKeyFiles.push(relative(dist,file).replaceAll("\\","/"));
  }
  try{await access(runtimePath);}catch{return false;}
  if(apiKeyFiles.length!==1||apiKeyFiles[0]!=="firebase-sync-runtime.js")return false;
  const runtime=await readFile(runtimePath,"utf8");
  const sdkChunks=Array.from(runtime.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)["'`]([^"'`]+)["'`]/gu),match=>match[1]);
  let sdkSource=runtime;
  for(const chunk of sdkChunks){
    if(!/^\.\/assets\/[^/]+-[\w-]+\.js$/u.test(chunk))return false;
    try{await access(resolve(dist,chunk));}catch{return false;}
    sdkSource+=await readFile(resolve(dist,chunk),"utf8");
  }
  return ["@firebase/app","@firebase/auth","@firebase/firestore"].every(marker=>sdkSource.includes(marker));
}

const pkg=JSON.parse(await readFile(resolve(root,"package.json"),"utf8"));
const localVersion=JSON.parse(await readFile(resolve(root,"version.json"),"utf8"));
if(pkg.version!==localVersion.version)throw new Error(`Paket/version.json sürüm sapması: ${pkg.version} / ${localVersion.version}`);
if(localVersion.version!=="4.4.0"||localVersion.build!=="4.4.0-r3"||localVersion.schema!==21)throw new Error(`Beklenmeyen v4.4.0 kimliği: ${JSON.stringify(localVersion)}`);
const index=await readFile(resolve(dist,"index.html"),"utf8"),asset=index.match(/(?:src|href)="\.\/(assets\/index-[^"']+\.js)"/)?.[1];
if(!asset)throw new Error("Derlenmiş v4 paketi bulunamadı");
const bundle=await readFile(resolve(dist,asset),"utf8"),legacy=await readFile(resolve(dist,"modules/release-selftest.js"),"utf8"),sw=await readFile(resolve(dist,"sw.js"),"utf8"),version=JSON.parse(await readFile(resolve(dist,"version.json"),"utf8"));
const v43Markers=["v43Runtime","v43RuntimeErrors","v43Today","v43Analysis","v43LearningCycle","v43LabQuiz","v43Navigation","v43Personalization","v43FocusSessionGuard"];
const checks={
  version:bundle.includes(localVersion.version)&&version.version===localVersion.version&&version.build===localVersion.build&&version.schema===21,
  stable:bundle.includes("stable"),runtime:bundle.includes("YKS_V4_RELEASE_OK"),legacy:legacy.includes("v4-bootstrap"),
  legacyCore:bundle.includes("4.1.0-r20"),releaseOverlay:bundle.includes("v42ReleaseOverlay")&&bundle.includes("remoteVersionIsNewer"),
  recovery:bundle.includes("v42RecoveryCenter")&&bundle.includes("v4BackupVersion")&&bundle.includes("backup-recovery"),
  bundledOptionalCloud:!index.includes("firebaseSyncModule")&&!index.includes("legacyFirebaseSyncModule")&&!index.includes("www.gstatic.com/firebasejs")&&!index.includes("cloudSyncBox")&&await cloudTargetIsValid(),
  dexie:bundle.includes("yks-defterim-v4"),screens:bundle.includes("screen-transitions"),
  v43:v43Markers.every(marker=>bundle.includes(marker))&&bundle.includes("degraded"),
  pwa:sw.includes(`const APP_VERSION="${localVersion.version}"`)&&sw.includes(`const APP_BUILD="${localVersion.build}"`)&&sw.includes(`const CACHE="yks-core-v${localVersion.build}"`)&&sw.includes('"yks-core-v4.3.1-r1"')&&sw.includes('"yks-core-v4.3.0-r1"')&&sw.includes('"yks-core-v4.2.0-r1"')
};
const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length)throw new Error(`Kararlı sürüm kontrolleri başarısız: ${failed.join(", ")}`);
console.log(`YKS Defterim ${pkg.version} ${target} kararlı sürümü doğrulandı: ${Object.keys(checks).length} paket kontrolü + izole v4.3 runtime + v4.4 özellik sınırı`);
