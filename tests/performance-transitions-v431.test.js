const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3.1 ekran runtime ağır ikincil işleri paint/idle sonrasına taşır ve hatayı çekirdeğe yaymaz",()=>{
  const source=read("src/ui/screen-runtime.ts");
  assert.match(source,/#safeDeferred/);
  assert.match(source,/this\.optional\("infraError",`screen-deferred:\$\{key\}`,error\)/);
  assert.match(source,/perfAfterPaint/);
  assert.match(source,/requestAnimationFrame\(safe\)/);
  assert.match(source,/perfIdle/);
  assert.match(source,/window\.setTimeout\(safe,Math\.min\(timeout,120\)\)/);
});

test("v4.3.1 navigasyon yalnız istenen ekranı çizer ve legacy fallback'i korur",()=>{
  const source=read("src/ui/navigation.ts");
  assert.match(source,/this\.#screenRuntime\.render\(value,source\)/);
  assert.match(source,/result=this\.#legacyGo\(value\)/);
  assert.match(source,/classList\.toggle\("active",node\.id===screen\)/);
  assert.doesNotMatch(source,/biology-atlas|WebGLRenderer|import\(.+biology/i);
});

test("v4.3.1 production kapısı başlangıç JS bütçesini ve resilience lazy chunk sınırını kilitler",()=>{
  const gate=read("scripts/verify-v431-production.mjs");
  const pkg=JSON.parse(read("package.json"));
  assert.match(gate,/260_000/);
  assert.match(gate,/12_000/);
  assert.match(gate,/runtime-resilience-v431/);
  assert.match(gate,/WebGLRenderer/);
  assert.match(gate,/Bir bölüm beklenmedik şekilde durdu\./);
  assert.match(pkg.scripts["release:check"],/verify-v431-production\.mjs/);
});

test("v4.3.1 performans kapısı Program veya çalışma verisi mutasyonu içermez",()=>{
  const gate=read("scripts/verify-v431-production.mjs");
  assert.doesNotMatch(gate,/weeklyPlan|addToDay|addToToday|wrongLog|studyPrefs|localStorage\.setItem|Dexie|firebase/i);
});
