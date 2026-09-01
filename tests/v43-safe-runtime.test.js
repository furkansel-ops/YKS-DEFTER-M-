const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v4.3 ürün modülleri ana bootstrap içinde statik kurulmaz",()=>{
  const main=read("src/main.ts");
  assert.match(main,/installV43SafeRuntime/);
  for(const file of ["today-v43","analysis-center-v43","learning-cycle-v43","lab-quiz-v43","navigation-v43","personalization-v43","focus-session-guard-v43"]){
    assert.doesNotMatch(main,new RegExp(`from ["']\\.\\/ui\\/${file}["']`));
  }
  assert.match(main,/window\.__YKS_V4_BOOTSTRAP__=bootstrap/);
  assert.match(main,/dispatchEvent\(new CustomEvent<BootstrapState>\("yks:v4-bootstrap"/);
  assert.match(main,/const v43Runtime=installV43SafeRuntime\(\)/);
});

test("her v4.3 özelliği ayrı dynamic import ve hata sınırında yüklenir",()=>{
  const source=read("src/ui/v43-safe-runtime.ts");
  for(const file of ["today-v43","analysis-center-v43","learning-cycle-v43","lab-quiz-v43","navigation-v43","personalization-v43","focus-session-guard-v43"]){
    assert.match(source,new RegExp(`import\\(["']\\.\\/${file}["']\\)`));
  }
  assert.match(source,/async function loadFeature/);
  assert.match(source,/try\{return publishFeature/);
  assert.match(source,/catch\(error\)\{return publishFeature/);
  assert.match(source,/window\.setTimeout/);
  assert.match(source,/__YKS_V43_RUNTIME__/);
  assert.match(source,/dataset\.v43Runtime=report\.ok\?"ready":"degraded"/);
});

test("ekran modülleri v4.3 ürün chunklarını başlangıç paketine geri çekmez",()=>{
  const safe=read("src/ui/v43-safe-runtime.ts"),progress=read("src/ui/screens/progress.ts"),exams=read("src/ui/screens/exams.ts");
  assert.doesNotMatch(progress,/from "\.\.\/analysis-center-v43"/);
  assert.doesNotMatch(exams,/from "\.\.\/learning-cycle-v43"/);
  assert.match(progress,/__YKS_V43_RENDER_ANALYSIS__/);
  assert.match(exams,/__YKS_V43_RENDER_LEARNING_CYCLE__/);
  assert.match(safe,/__YKS_V43_RENDER_ANALYSIS__=mod\.renderAnalysisCenterV43/);
  assert.match(safe,/__YKS_V43_RENDER_LEARNING_CYCLE__=mod\.renderLearningCycleV43/);
});

test("tek özellik arızası çekirdek bootstrap veya yerel veri katmanını bloke edemez",()=>{
  const main=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts"),html=read("index.html"),vite=read("vite.config.mts");
  assert.match(main,/const services=installLegacyServiceBridge\(\)/);
  assert.match(main,/const data=installLegacyDataBridge\(\)/);
  assert.match(main,/document\.documentElement\.dataset\.v4Runtime="ready"/);
  assert.match(safe,/Tek bir v4\.3 özelliği hata verse bile legacy çekirdek ve yerel veri katmanı çalışmaya devam eder/);
  assert.doesNotMatch(html,/type="module" id="firebaseSyncModule"/);
  assert.match(html,/type="application\/json" id="legacyFirebaseSyncModule" data-disabled="play-store-release"/);
  assert.match(vite,/remove-disabled-cloud-runtime/);
});

test("release gate izole runtime tamamen hazır olana kadar bekler",()=>{
  const release=read("src/release/release.ts");
  assert.match(release,/__YKS_V43_RUNTIME__/);
  assert.match(release,/await add\("v43-runtime",async\(\)=>/);
  assert.match(release,/withTimeout\(runtime\.ready,12_000\)/);
  assert.match(release,/dataset\.v43Runtime==="ready"/);
  assert.match(release,/dataset\.v43RuntimeErrors==="0"/);
});
