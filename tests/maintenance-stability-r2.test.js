const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("ana navigasyon legacy go yolunu korur ve TypeScript yalnız fallback/P&P çizimi yapar",()=>{
  const source=read("src/ui/navigation.ts");
  const legacyAt=source.indexOf("result=this.#legacyGo(value)");
  const ppAt=source.indexOf('if(value==="pp")');
  assert.ok(legacyAt>=0&&ppAt>legacyAt);
  assert.match(source,/legacyFailed\|\|active!==value/);
  assert.match(source,/#screenRuntime\?\.render\(value,source\)/);
});

test("Daha hub bütün document ağacını izleyip tıklama sırasında yeniden çizilmez",()=>{
  const source=read("src/ui/navigation-v43.ts");
  assert.doesNotMatch(source,/new MutationObserver/);
  assert.doesNotMatch(source,/observer\.observe\(document\.documentElement/);
  assert.match(source,/detail\?\.to==="more"/);
  assert.match(source,/detail\?\.to==="home"/);
});

test("Laboratuvar yardımcıları global her tıklamada veya çift navigation dinleyicisinde çalışmaz",()=>{
  const lab=read("src/ui/lab-interactions-bridge-v44.ts");
  const chemistry=read("src/ui/chemistry-visuals-bridge.ts");
  assert.doesNotMatch(lab,/document\.addEventListener\("click",schedule/);
  assert.doesNotMatch(lab,/document\.addEventListener\("yks:navigation-after"/);
  assert.match(lab,/yks:more-after/);
  assert.doesNotMatch(chemistry,/document\.addEventListener\("click",onClick/);
  assert.doesNotMatch(chemistry,/document\.addEventListener\("yks:navigation-after"/);
  assert.match(chemistry,/section\.addEventListener\("click",onClick\)/);
});

test("4.4.0-r2 bakım build kimliği PWA cache ve release dosyalarında aynıdır",()=>{
  const version=read("src/release/version.ts"),json=JSON.parse(read("version.json")),sw=read("sw.js");
  assert.match(version,/RELEASE_BUILD="4\.4\.0-r2"/);
  assert.equal(json.build,"4.4.0-r2");
  assert.match(sw,/APP_BUILD="4\.4\.0-r2"/);
  assert.match(sw,/CACHE="yks-core-v4\.4\.0-r2"/);
  assert.match(sw,/yks-core-v4\.4\.0-r1/);
  assert.match(sw,/app\.js\?v=4\.4\.0-r2/);
  assert.match(sw,/core-utils\.js\?v=4\.4\.0-r2/);
});

test("eşitleme kartı normal içerik akışında kalır ve ağır cam efektine dönmez",()=>{
  const base=read("src/ui/cloud-sync-indicator.css"),stability=read("src/ui/recent-feature-stability.css");
  assert.match(base,/#cloudSyncBox\.web-cloud-sync-card/);
  assert.match(base,/position:static!important/);
  assert.match(base,/backdrop-filter:none!important/);
  assert.match(base,/cloudSyncPulse/);
  assert.doesNotMatch(stability,/\.cloud-sync-indicator/);
});

test("dokunmatik cihazda dekoratif arka plan blur filtresi kapatılır",()=>{
  const css=read("src/ui/visual-stability-hotfix.css");
  assert.match(css,/@media \(pointer:coarse\)[\s\S]*body::before[\s\S]*filter:none !important/);
});

test("cihaz verisi silinirken odak kurtarma kaydı yeniden oluşturulmaz",()=>{
  const stability=read("modules/stability.js");
  assert.match(stability,/function deviceDeletionGuarded\(\)\{return window\.__YKS_DELETE_IN_PROGRESS===true;\}/);
  assert.match(stability,/function persistRuntime\(force\)\{\s*if\(deviceDeletionGuarded\(\)\)return false;/);
  assert.match(stability,/function clearRuntime\(\)\{if\(deviceDeletionGuarded\(\)\)return false;/);
  assert.match(stability,/function restoreRuntime\(\)\{\s*if\(deviceDeletionGuarded\(\)\|\|recoveryBusy\)return false;/);
  assert.match(stability,/pagehide[\s\S]*if\(!deviceDeletionGuarded\(\)\)persistRuntime\(true\)/);
  assert.match(stability,/setInterval\(\(\)=>\{try\{if\(!deviceDeletionGuarded\(\)&&pomoState==="running"\)persistRuntime\(false\)/);
});
