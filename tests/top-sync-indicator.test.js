const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Üst senkron göstergesi arama düğmesinin hemen yanına eklenir",()=>{
  const source=read("src/ui/top-sync-indicator.ts");
  assert.match(source,/\.navbar \.searchbtn/);
  assert.match(source,/insertAdjacentElement\("afterend",indicator\)/);
  assert.match(source,/id=INDICATOR_ID/);
  assert.match(source,/role","status"/);
  assert.match(source,/aria-label/);
});

test("Üst senkron göstergesi mevcut cloudSync state sözleşmesini renk durumlarına dönüştürür",()=>{
  const source=read("src/ui/top-sync-indicator.ts");
  assert.match(source,/state==="synced"\)return "active"/);
  assert.match(source,/state==="syncing"\|\|state==="connecting"\)return "syncing"/);
  assert.match(source,/return "off"/);
  assert.match(source,/CLOUD_BOX_ID="cloudSyncBox"/);
  assert.match(source,/attributeFilter:\["data-state","data-online","data-account"\]/);
  assert.match(source,/!navigator\.onLine/);
});

test("Üst senkron noktasının renkleri yeşil turuncu kırmızı ve küçük tutulur",()=>{
  const css=read("src/ui/top-sync-indicator.css");
  assert.match(css,/width:9px;height:9px/);
  assert.match(css,/data-sync-state="active"[^\n]*var\(--success\)/);
  assert.match(css,/data-sync-state="syncing"[^\n]*var\(--time\)/);
  assert.match(css,/data-sync-state="off"[^\n]*var\(--danger\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});

test("Gösterge ana başlangıç paketini şişirmemek için dinamik yüklenir",()=>{
  const main=read("src/main.ts");
  assert.match(main,/import\("\.\/ui\/top-sync-indicator"\)/);
  assert.match(main,/installTopSyncIndicator/);
  assert.match(main,/dataset\.topSyncIndicator="loading"/);
  assert.doesNotMatch(main,/^import \{installTopSyncIndicator\}/m);
});
