const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const scriptUrl=pathToFileURL(path.resolve(__dirname,"../scripts/verify-live-pages.mjs")).href;
const goodBundle="YKS_V4_RELEASE_OK 4.4.0 stable v43Runtime v43RuntimeErrors degraded v43FocusSessionGuard";
const goodSw='const APP_VERSION="4.4.0";const APP_BUILD="4.4.0-r2";const CACHE="yks-core-v4.4.0-r2"';

test("canlı Pages denetimi gerçek release sürümünü, güvenli runtime'ı ve eski çalışma zamanı paketini doğrular",async()=>{
  const {extractBundlePath,verifyLiveAssets,verifyPolicyPages}=await import(scriptUrl);
  const index='<script type="module" src="./assets/index-AbC123.js"></script><script src="./app.js?v=4.4.0-r2"></script><script src="./modules/core-utils.js?v=4.4.0-r2"></script><script src="./modules/release-selftest.js?v=4.1.0-r20"></script>';
  assert.equal(extractBundlePath(index),"assets/index-AbC123.js");
  assert.deepEqual(verifyLiveAssets({index,bundle:goodBundle,legacyApp:'const APP_VERSION="4.1.0";const APP_BUILD="4.1.0-r20"',serviceWorker:goodSw}),{bundlePath:"assets/index-AbC123.js",release:"4.4.0",releaseBuild:"4.4.0-r2",legacyVersion:"4.1.0",legacyBuild:"4.1.0-r20"});
  assert.deepEqual(verifyPolicyPages({privacy:"YKS Defterim Gizlilik Politikası IndexedDB/Dexie Google Cloud Firestore Android paketi",deletion:"YKS Defterim cihaz verilerini silme Cihaz verilerini sil Bulut kopyasını sil IndexedDB/Dexie"}),{privacy:true,deletion:true});
});

test("canlı Play politika sayfaları eksik veya eski davranışta başarısız olur",async()=>{
  const {verifyPolicyPages}=await import(scriptUrl);
  assert.throws(()=>verifyPolicyPages({privacy:"404",deletion:"404"}),/gizlilik politikası/);
  assert.throws(()=>verifyPolicyPages({privacy:"YKS Defterim Gizlilik Politikası IndexedDB\/Dexie Google Cloud Firestore Android paketi Firebase",deletion:"YKS Defterim cihaz verilerini silme Cihaz verilerini sil Bulut kopyasını sil IndexedDB\/Dexie"}),/uyumsuz/);
});

test("canlı Pages denetimi yanlış release, kaynak TypeScript, bozuk UTF-8 veya yanlış PWA cache'ini reddeder",async()=>{
  const {verifyLiveAssets}=await import(scriptUrl);
  const legacy='<script src="./app.js?v=4.4.0-r2"></script><script src="./modules/core-utils.js?v=4.4.0-r2"></script><script src="./modules/release-selftest.js?v=4.1.0-r20"></script>',app='const APP_VERSION="4.1.0";const APP_BUILD="4.1.0-r20"',index=`<script type="module" src="./assets/index-x.js"></script>${legacy}`;
  assert.throws(()=>verifyLiveAssets({index,bundle:goodBundle.replace("4.4.0","4.3.1"),legacyApp:app,serviceWorker:goodSw}),/4\.4\.0/);
  assert.throws(()=>verifyLiveAssets({index:`<script type="module" src="./src/main.ts"></script><script type="module" src="./assets/index-x.js"></script>${legacy}`,bundle:goodBundle,legacyApp:app,serviceWorker:goodSw}),/TypeScript kaynak/);
  assert.throws(()=>verifyLiveAssets({index,bundle:goodBundle,legacyApp:app+'/*�*/',serviceWorker:goodSw}),/UTF-8/);
  assert.throws(()=>verifyLiveAssets({index,bundle:goodBundle,legacyApp:app,serviceWorker:goodSw.replace("4.4.0-r2","4.3.1-r1")}),/service worker/);
});
