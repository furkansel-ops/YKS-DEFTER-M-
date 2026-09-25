const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const scriptUrl=pathToFileURL(path.resolve(root,"scripts/verify-live-pages.mjs")).href;
const goodBundle="YKS_V4_RELEASE_OK 4.4.0 4.4.0-r3 stable v43Runtime v43RuntimeErrors degraded v43FocusSessionGuard";
const goodSw='const APP_VERSION="4.4.0";const APP_BUILD="4.4.0-r3";const CACHE="yks-core-v4.4.0-r3"';
const privacy=fs.readFileSync(path.resolve(root,"privacy.html"),"utf8");
const deletion=fs.readFileSync(path.resolve(root,"data-deletion.html"),"utf8");

test("canlı Pages denetimi gerçek release sürümünü, güvenli runtime'ı ve güncel politika sayfalarını doğrular",async()=>{
  const {extractBundlePath,verifyLiveAssets,verifyPolicyPages}=await import(scriptUrl);
  const index='<script type="module" src="./assets/index-AbC123.js"></script><script src="./app.js?v=4.1.0-r20"></script><script src="./modules/release-selftest.js?v=4.1.0-r20"></script>';
  assert.equal(extractBundlePath(index),"assets/index-AbC123.js");
  assert.deepEqual(verifyLiveAssets({index,bundle:goodBundle,legacyApp:'const APP_VERSION="4.1.0";const APP_BUILD="4.1.0-r20"',serviceWorker:goodSw}),{bundlePath:"assets/index-AbC123.js",release:"4.4.0",releaseBuild:"4.4.0-r3",legacyVersion:"4.1.0",legacyBuild:"4.1.0-r20"});
  assert.deepEqual(verifyPolicyPages({privacy,deletion}),{privacy:true,deletion:true});
});

test("canlı politika denetimi Android-local ve Web/PWA bulut ayrımının kaybolmasını reddeder",async()=>{
  const {verifyPolicyPages}=await import(scriptUrl);
  assert.throws(()=>verifyPolicyPages({privacy:"404",deletion:"404"}),/gizlilik politikası/);
  assert.throws(()=>verifyPolicyPages({privacy:privacy.replaceAll("Web/PWA sürümünde","Web sürümünde"),deletion}),/gizlilik politikası/);
  assert.throws(()=>verifyPolicyPages({privacy,deletion:deletion.replaceAll("Web/PWA bulut verileri ve hesap","Bulut verileri")}),/veri silme sayfası/);
});

test("canlı Pages denetimi yanlış release, kaynak TypeScript, bozuk UTF-8 veya yanlış PWA cache'ini reddeder",async()=>{
  const {verifyLiveAssets}=await import(scriptUrl);
  const legacy='<script src="./app.js?v=4.1.0-r20"></script><script src="./modules/release-selftest.js?v=4.1.0-r20"></script>',app='const APP_VERSION="4.1.0";const APP_BUILD="4.1.0-r20"',index=`<script type="module" src="./assets/index-x.js"></script>${legacy}`;
  assert.throws(()=>verifyLiveAssets({index,bundle:goodBundle.replaceAll("4.4.0","4.3.1"),legacyApp:app,serviceWorker:goodSw}),/4\.4\.0/);
  assert.throws(()=>verifyLiveAssets({index,bundle:goodBundle.replace("4.4.0-r3","4.4.0-r2"),legacyApp:app,serviceWorker:goodSw}),/4\.4\.0-r3/);
  assert.throws(()=>verifyLiveAssets({index:`<script type="module" src="./src/main.ts"></script><script type="module" src="./assets/index-x.js"></script>${legacy}`,bundle:goodBundle,legacyApp:app,serviceWorker:goodSw}),/TypeScript kaynak/);
  assert.throws(()=>verifyLiveAssets({index,bundle:goodBundle,legacyApp:app+'/*�*/',serviceWorker:goodSw}),/UTF-8/);
  assert.throws(()=>verifyLiveAssets({index,bundle:goodBundle,legacyApp:app,serviceWorker:goodSw.replace("4.4.0-r3","4.3.1-r1")}),/service worker/);
});
