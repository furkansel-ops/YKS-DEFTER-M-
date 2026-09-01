const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Paragraf ve problem takipçisi günlük D/Y/B kaydı ve YKS net hesabını korur",()=>{
  const source=read("src/ui/paragraph-problem-tracker.ts");
  assert.match(source,/kind:\s*Kind/);
  assert.match(source,/correct:number;wrong:number;blank:number/);
  assert.match(source,/e\.correct-e\.wrong\/4/);
  assert.match(source,/paragraphProblem/);
  assert.match(source,/win\.save\?\.\(\)/);
  assert.match(source,/Son 7 gün/);
  assert.match(source,/Paragraf & Problem/);
});

test("Paragraf ve Problem gerçek ana ekran olarak Odak ile Daha arasına eklenir",()=>{
  const source=read("src/ui/paragraph-problem-tracker.ts");
  const types=read("src/ui/types.ts");
  const navigation=read("src/ui/navigation.ts");
  const registry=read("src/ui/screens/registry.ts");
  assert.match(types,/"pomo","pp","more"/);
  assert.match(source,/SCREEN_ID="pp"/);
  assert.match(source,/className="screen pp-screen"/);
  assert.match(source,/tabbar\.insertBefore\(tab,moreTab\)/);
  assert.match(source,/data-s=\"pp\"|dataset\.s="pp"/);
  assert.match(source,/P &amp; P/);
  assert.match(navigation,/pp:"Paragraf & Problem"/);
  assert.match(registry,/paragraphProblemScreen/);
});

test("Paragraf ve Problem ayrıntılı performans merkezi 7, 14 ve 30 günlük analizleri içerir",()=>{
  const source=read("src/ui/paragraph-problem-tracker.ts");
  const css=read("src/ui/paragraph-problem-tracker.css");
  for(const token of ["Performans merkezi","Son 14 gün","Performans sinyalleri","Son 7 gün ↔ önceki 7 gün","30 günlük ritim","Günlük döküm","Geçmiş oturumlar"])assert.match(source,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  assert.match(source,/currentStreak/);
  assert.match(source,/bestDay/);
  assert.match(source,/deltaPercent/);
  assert.match(source,/wrongRate/);
  assert.match(source,/data-pp-kind-filter/);
  assert.match(source,/data-pp-range-filter/);
  assert.match(css,/\.pp-kind-grid/);
  assert.match(css,/\.pp-trend/);
  assert.match(css,/\.pp-heatmap/);
  assert.match(css,/@media\(pointer:coarse\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("Ayrıntılı P & P cilası mevcut veri şemasını büyütmeden yalnız entries kaydını kullanır",()=>{
  const source=read("src/ui/paragraph-problem-tracker.ts");
  assert.match(source,/type Tracker=\{entries:Entry\[\]\}/);
  assert.doesNotMatch(source,/paragraphGoal|problemGoal|schemaVersion/);
  assert.match(source,/\.slice\(-2000\)/);
});

test("Takipçi navigasyon doğrulanmadan önce ekran kabuğunu kurar",()=>{
  const main=read("src/main.ts");
  const trackerAt=main.indexOf("const paragraphProblem=installParagraphProblemTracker()");
  const screensAt=main.indexOf("const screens=installScreenRuntime()");
  const bridgeAt=main.indexOf("const ui=installLegacyUiBridge(screens)");
  assert.ok(trackerAt>=0&&screensAt>=0&&bridgeAt>=0);
  assert.ok(trackerAt<screensAt);
  assert.ok(screensAt<bridgeAt);
  assert.match(main,/paragraphProblemTracker/);
});
