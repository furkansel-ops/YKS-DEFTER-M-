import {readFile} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist");
const pkg=JSON.parse(await readFile(resolve(root,"package.json"),"utf8"));
if(pkg.version!=="4.2.0")throw new Error(`Beklenmeyen paket sürümü: ${pkg.version}`);
const index=await readFile(resolve(dist,"index.html"),"utf8"),asset=index.match(/(?:src|href)="\.\/(assets\/index-[^"']+\.js)"/)?.[1];
if(!asset)throw new Error("Derlenmiş v4 paketi bulunamadı");
const bundle=await readFile(resolve(dist,asset),"utf8"),legacy=await readFile(resolve(dist,"modules/release-selftest.js"),"utf8"),sw=await readFile(resolve(dist,"sw.js"),"utf8"),version=JSON.parse(await readFile(resolve(dist,"version.json"),"utf8"));
const v43Markers=["v43Today","v43Analysis","v43LearningCycle","v43LabQuiz","v43Navigation","v43Personalization"];
const checks={
  version:bundle.includes("4.2.0")&&version.version==="4.2.0"&&version.build==="4.2.0-r1",
  stable:bundle.includes("stable"),runtime:bundle.includes("YKS_V4_RELEASE_OK"),legacy:legacy.includes("v4-bootstrap"),
  legacyCore:bundle.includes("4.1.0-r20"),releaseOverlay:bundle.includes("v42ReleaseOverlay")&&bundle.includes("remoteVersionIsNewer"),
  recovery:bundle.includes("v42RecoveryCenter")&&bundle.includes("v4BackupVersion")&&bundle.includes("backup-recovery"),
  transaction:bundle.includes("runTransaction as"),conflict:bundle.includes("SYNC_CONFLICT"),hash:bundle.includes("infraHash("),
  dexie:bundle.includes("yks-defterim-v4"),screens:bundle.includes("screen-transitions"),
  v43:v43Markers.every(marker=>bundle.includes(marker)),
  pwa:sw.includes('const APP_VERSION="4.2.0"')&&sw.includes('const APP_BUILD="4.2.0-r1"')&&sw.includes('const CACHE="yks-core-v4.2.0-r1"')
};
const failed=Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length)throw new Error(`Kararlı sürüm kontrolleri başarısız: ${failed.join(", ")}`);
console.log(`YKS Defterim ${pkg.version} kararlı sürümü doğrulandı: ${Object.keys(checks).length} paket kontrolü + v4.3 özellik kapısı`);
