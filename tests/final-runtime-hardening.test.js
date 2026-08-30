const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("legacy save Dexie yazmalarını birleştirir ve son değişikliği kaçırmaz",()=>{
  const source=read("src/data/legacy-data-bridge.ts");
  assert.match(source,/pendingLegacyCapture/);
  assert.match(source,/legacyCaptureDirty=true/);
  assert.match(source,/do\{[\s\S]*legacyCaptureDirty=false;[\s\S]*coordinator\.capture\(\)[\s\S]*\}while\(legacyCaptureDirty\)/);
  assert.match(source,/if\(legacyCaptureDirty\)void captureLegacyWrite\(\)/);
  assert.match(source,/const pending=pendingLegacyCapture/);
  assert.match(source,/await writeTail/);
});

test("Dexie başlatma reddi yakalanır ve uygulama durumuna warning olarak yansır",()=>{
  const source=read("src/data/legacy-data-bridge.ts");
  assert.match(source,/api\.ready\.then\([\s\S]*\.catch\(error=>/);
  assert.match(source,/dataset\.v4Data="warning"/);
  assert.match(source,/dataset\.v4Reconcile="failed"/);
});

test("PWA cache probe kaynaklarını temizler ve eski async sonucu yeni UI durumunun üstüne yazmaz",()=>{
  const source=read("src/pwa/pwa-runtime.ts");
  assert.match(source,/clearTimeout\(readyTimer\)/);
  assert.match(source,/channel\.port1\.close\(\);channel\.port2\.close\(\)/);
  assert.match(source,/worker\.postMessage[\s\S]*catch\{finish\(false\);\}/);
  assert.match(source,/renderGeneration/);
  assert.match(source,/generation!==renderGeneration/);
});
