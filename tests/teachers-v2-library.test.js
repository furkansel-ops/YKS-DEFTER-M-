const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const library=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-library.ts"),"utf8");
const css=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-library.css"),"utf8");
const main=()=>fs.readFileSync(path.join(root,"src/main.ts"),"utf8");

test("Hocalar v2 kaydedilen videolar mevcut studyPrefs ve save zincirinden taşınır",()=>{
  const source=library();
  assert.match(source,/const LIB_PREF_KEY="teachersV2LibraryV1"/);
  assert.match(source,/const prefs=isRecord\(state\.studyPrefs\)\?state\.studyPrefs:\{autoPlan:false\}/);
  assert.match(source,/prefs\[LIB_PREF_KEY\]=/);
  assert.match(source,/window\.YKSLegacyState\?\.save\?\.\(\)/);
  assert.doesNotMatch(source,/localStorage\.setItem\(["']yks["']/);
  assert.doesNotMatch(source,/DATA_SCHEMA_VERSION\s*[+=]/);
});

test("Hocalar v2 son izlenenleri yeni kayıt üretmeden mevcut watched zaman damgalarından çıkarır",()=>{
  const source=library();
  assert.match(source,/const map=watchedMap\(\)/);
  assert.match(source,/sort\(\(a,b\)=>Number\(b\.record\?\.at\|\|0\)-Number\(a\.record\?\.at\|\|0\)\)/);
  assert.match(source,/slice\(0,8\)/);
  assert.match(source,/Son izlediğin/);
  assert.match(source,/↻ Son izlenenler/);
  assert.doesNotMatch(source,/watchedMap\(\)\[[^\]]+\]\s*=/);
});

test("Hocalar v2 video kütüphanesi kaydetme ve tekrar açma yüzeylerini paketler",()=>{
  const source=library();
  assert.match(source,/Kütüphanem/);
  assert.match(source,/★ Kaydettiklerim/);
  assert.match(source,/data-library-action="toggle"/);
  assert.match(source,/★ Kaydedildi/);
  assert.match(source,/youtube-nocookie\.com\/embed/);
  assert.match(source,/if\(button\.textContent!==label\)button\.textContent=label/);
});

test("Hocalar v2 kişisel kütüphanesi medya sonrasında lazy ve fail-open yüklenir",()=>{
  const source=main();
  const style=css();
  assert.match(source,/import\("\.\/ui\/teachers-v2-media"\)/);
  assert.match(source,/\.then\(\(\)=>import\("\.\/ui\/teachers-v2-library"\)\.catch/);
  assert.match(source,/dataset\.teachersV2Library="deferred"/);
  assert.match(style,/@media\(pointer:coarse\)/);
  assert.match(style,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(style,/teachers-v2-video-save/);
});
