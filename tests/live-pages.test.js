const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const scriptUrl=pathToFileURL(path.resolve(__dirname,"../scripts/verify-live-pages.mjs")).href;

test("canlı Pages denetimi gerçek release sürümünü ve eski çalışma zamanı paketini doğrular",async()=>{
  const {extractBundlePath,verifyLiveAssets}=await import(scriptUrl);
  const index='<script type="module" src="./assets/index-AbC123.js"></script><script src="./app.js?v=4.1.0-r20"></script><script src="./modules/release-selftest.js?v=4.1.0-r20"></script>';
  assert.equal(extractBundlePath(index),"assets/index-AbC123.js");
  assert.deepEqual(verifyLiveAssets({index,bundle:"YKS_V4_RELEASE_OK 4.3.0 stable",legacyApp:'const APP_VERSION="4.1.0";const APP_BUILD="4.1.0-r20"'}),{bundlePath:"assets/index-AbC123.js",release:"4.3.0",legacyVersion:"4.1.0",build:"4.1.0-r20"});
});

test("canlı Pages denetimi yanlış release, kaynak TypeScript veya bozuk UTF-8 paketini reddeder",async()=>{
  const {verifyLiveAssets}=await import(scriptUrl);
  const legacy='<script src="./app.js?v=4.1.0-r20"></script><script src="./modules/release-selftest.js?v=4.1.0-r20"></script>',app='const APP_VERSION="4.1.0";const APP_BUILD="4.1.0-r20"';
  assert.throws(()=>verifyLiveAssets({index:`<script type="module" src="./assets/index-x.js"></script>${legacy}`,bundle:"YKS_V4_RELEASE_OK 4.1.0 stable",legacyApp:app}),/4\.3\.0/);
  assert.throws(()=>verifyLiveAssets({index:`<script type="module" src="./src/main.ts"></script><script type="module" src="./assets/index-x.js"></script>${legacy}`,bundle:"YKS_V4_RELEASE_OK 4.3.0 stable",legacyApp:app}),/TypeScript kaynak/);
  assert.throws(()=>verifyLiveAssets({index:`<script type="module" src="./assets/index-x.js"></script>${legacy}`,bundle:"YKS_V4_RELEASE_OK 4.3.0 stable",legacyApp:app+'/*�*/'}),/UTF-8/);
});
