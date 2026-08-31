const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3.1 Dexie arızasında geçerli localStorage aynasını veri kaybetmeden fallback olarak korur",()=>{
  const source=read("src/data/primary-store.ts");
  assert.match(source,/status:"fallback-local",primary:"localStorage",degraded:true/);
  assert.match(source,/if\(local\.ok\)return \{ok:true,json:local\.json/);
  assert.match(source,/decodeState\(record\.json\)/);
  assert.match(source,/stateHash\(record\.json\)!==record\.sourceHash/);
});

test("v4.3.1 Dexie yazması commit sonrası yeniden okunup doğrulanmadan ayna damgasını ilerletmez",()=>{
  const source=read("src/data/primary-store.ts");
  const commit=source.indexOf("await this.#target.commit(state,meta)");
  const verify=source.indexOf("const verified=await this.#target.readState()",commit);
  const guard=source.indexOf("Dexie ana kaydı doğrulanamadı",verify);
  const mirror=source.indexOf("this.#mirror.writeMirrorMetadata(hash,stamp)",guard);
  assert.ok(commit>=0&&verify>commit&&guard>verify&&mirror>guard,"commit → readback → doğrulama → mirror sırası korunmalı");
});

test("v4.3.1 Firebase ve yedek dış veri yolları doğrulamadan çalışma durumuna uygulanamaz",()=>{
  const source=read("src/data/primary-store.ts");
  assert.match(source,/replaceFromExternal\(json:string/);
  assert.match(source,/const decoded=decodeState\(json\);\s*if\(!decoded\.ok\)return \{ok:false,status:"invalid"/);
  assert.match(source,/persistJSON\(json,updatedAt,source\)/);
  assert.match(source,/const applied=this\.#runtime\.applyJSON\(json\)/);
  assert.ok(source.indexOf("persistJSON(json,updatedAt,source)")<source.indexOf("const applied=this.#runtime.applyJSON(json)"));
});

test("v4.3.1 legacy save fırtınası tek kuyrukta birleşir ve bulut çıktısı flush bekler",()=>{
  const bridge=read("src/data/legacy-data-bridge.ts");
  assert.match(bridge,/let writeTail:Promise<void>=Promise\.resolve\(\)/);
  assert.match(bridge,/pendingLegacyCapture/);
  assert.match(bridge,/legacyCaptureDirty/);
  assert.match(bridge,/do\{\s*legacyCaptureDirty=false;\s*result=await coordinator\.capture\(\);\s*\}while\(legacyCaptureDirty\)/);
  assert.match(bridge,/await initialize\(\);await flush\(\);/);
});

test("v4.3.1 PWA çekirdeği atomik kurulur, bozuk yeni cache silinir ve eski cache soyu temizlenir",()=>{
  const sw=read("sw.js");
  assert.match(sw,/const READY_KEY="\.\/__offline_ready__"/);
  assert.match(sw,/await Promise\.all\(required\.map/);
  assert.match(sw,/await cache\.put\(READY_KEY,new Response\(APP_BUILD/);
  assert.match(sw,/catch\(error\)\{await caches\.delete\(CACHE\);throw error;\}/);
  assert.match(sw,/k\.startsWith\("yks-core-"\)/);
  assert.match(sw,/\/version\.json/);
  assert.match(sw,/cache:"no-store"/);
});

test("v4.3.1 büyük anatomi varlıklarını çekirdek PWA kurulumuna almaz ve yalnız istek üzerine cacheler",()=>{
  const sw=read("sw.js");
  const coreMatch=sw.match(/const CORE=\[(.*?)\];/s);
  assert.ok(coreMatch,"CORE listesi bulunmalı");
  assert.doesNotMatch(coreMatch[1],/anatomy\/(models|images|thumbs)/);
  assert.match(sw,/\/anatomy\\\/\(models\|images\|thumbs\)/);
  assert.match(sw,/45000/);
  assert.match(sw,/await cache\.put\(req,copy\)/);
});

test("v4.3.1 tanı katmanı storage engelini uygulama katmanı hatası saymadan ayrı degraded sinyali verir",()=>{
  const resilience=read("src/ui/runtime-resilience-v431.ts");
  assert.match(resilience,/validate:\(\)=>\[\]/);
  assert.match(resilience,/v431Storage=storage\.localStorage&&storage\.indexedDb\?"ready":"degraded"/);
  assert.doesNotMatch(resilience,/Dexie|firebase|firestore|weeklyPlan|addToDay|addToToday/i);
});
