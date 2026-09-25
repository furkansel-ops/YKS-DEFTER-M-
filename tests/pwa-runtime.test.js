const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const runtimePath=path.resolve(__dirname,"../src/pwa/pwa-runtime.ts");
const runtimeUrl=pathToFileURL(runtimePath).href;

test("PWA yapı karşılaştırması aynı uygulama sürümündeki revizyonları ayırır",async()=>{
  const {parseBuildVersion,compareBuildVersions}=await import(runtimeUrl);
  assert.deepEqual(parseBuildVersion("4.0.0-r19"),{major:4,minor:0,patch:0,revision:19});
  assert.equal(compareBuildVersions("4.0.0-r19","4.0.0-r18"),1);
  assert.equal(compareBuildVersions("4.0.0-r19","4.0.0-r19"),0);
  assert.equal(compareBuildVersions("4.1.0-r1","4.0.0-r99"),1);
  assert.equal(compareBuildVersions("4.4.0-r4","4.4.0-r3"),1);
});

test("PWA elle kurulum yardımı cihaz türüne uygun Türkçe yol gösterir",async()=>{
  const {manualInstallHint}=await import(runtimeUrl);
  assert.match(manualInstallHint("Mozilla/5.0 Android Chrome"),/Chrome menüsü.*Ana ekrana ekle/);
  assert.match(manualInstallHint("Mozilla/5.0 iPad Safari"),/Safari.*Ana Ekrana Ekle/);
  assert.match(manualInstallHint("Mozilla/5.0 Windows Chrome"),/adres çubuğundaki yükle simgesi/);
});

test("mevcut uygulama kaydı service worker güncellemesini HTTP cache dışından zorlar",()=>{
  const app=fs.readFileSync(path.resolve(__dirname,"../app.js"),"utf8");
  assert.match(app,/navigator\.serviceWorker\.register\("sw\.js",\{updateViaCache:"none"\}\)/);
  assert.match(app,/reg\.update\(\)\.catch\(\(\)=>\{\}\)/);
});

test("service worker online shell ve kritik JS CSS için eski cache'i öne almaz",()=>{
  const sw=fs.readFileSync(path.resolve(__dirname,"../sw.js"),"utf8");
  assert.match(sw,/function cacheLatestShell\(response\)/);
  assert.match(sw,/if\(isAppEntry\(url\)\)await cacheLatestShell\(res\)/);
  assert.match(sw,/function isCriticalAsset\(url\)/);
  assert.match(sw,/function networkFirstStatic\(req\)/);
  assert.match(sw,/if\(isCriticalAsset\(url\)\)[\s\S]*event\.respondWith\(networkFirstStatic\(req\)\)/);
  assert.match(sw,/cacheCore\(\)\.then\(\(\)=>self\.skipWaiting\(\)\)/);
});
