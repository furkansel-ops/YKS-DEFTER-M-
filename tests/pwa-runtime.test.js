const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const runtimeUrl=pathToFileURL(path.resolve(__dirname,"../src/pwa/pwa-runtime.ts")).href;

test("PWA yapı karşılaştırması aynı uygulama sürümündeki revizyonları ayırır",async()=>{
  const {parseBuildVersion,compareBuildVersions}=await import(runtimeUrl);
  assert.deepEqual(parseBuildVersion("4.0.0-r19"),{major:4,minor:0,patch:0,revision:19});
  assert.equal(compareBuildVersions("4.0.0-r19","4.0.0-r18"),1);
  assert.equal(compareBuildVersions("4.0.0-r19","4.0.0-r19"),0);
  assert.equal(compareBuildVersions("4.1.0-r1","4.0.0-r99"),1);
});

test("PWA elle kurulum yardımı cihaz türüne uygun Türkçe yol gösterir",async()=>{
  const {manualInstallHint}=await import(runtimeUrl);
  assert.match(manualInstallHint("Mozilla/5.0 Android Chrome"),/Chrome menüsü.*Ana ekrana ekle/);
  assert.match(manualInstallHint("Mozilla/5.0 iPad Safari"),/Safari.*Ana Ekrana Ekle/);
  assert.match(manualInstallHint("Mozilla/5.0 Windows Chrome"),/adres çubuğundaki yükle simgesi/);
});
