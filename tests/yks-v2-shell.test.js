const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("YKS V2 kabuğu ana runtime tarafından yüklenir",()=>{
  const main=read("src/main.ts");
  const source=read("src/ui/yks-v2-shell.ts");
  assert.match(main,/import\("\.\/ui\/yks-v2-shell"\)/);
  assert.match(main,/installYksV2Shell/);
  assert.match(main,/yksV2Shell/);
  assert.doesNotMatch(main,/from "\.\/ui\/yks-v2-shell"/);
  assert.match(source,/installYksV2Shell/);
  assert.match(source,/data-yks-v2-smart|yksV2Smart|data-yks-v2-smart/i);
  assert.match(source,/Akıllı oluştur/);
});

test("akıllı program mevcut S.weeks sözleşmesini ve save senkron hattını korur",()=>{
  const source=read("src/ui/yks-v2-shell.ts");
  assert.match(source,/YKSLegacyState/);
  assert.match(source,/readState/);
  assert.match(source,/weeks/);
  assert.match(source,/legacyApi\(\)\?\.save\?\.\(\)/);
  assert.match(source,/renderPlan/);
  assert.match(source,/renderTodayPlan/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\./);
  assert.doesNotMatch(source,/\bDexie\b/);
});

test("akıllı program kullanıcı tercihleriyle dengeli haftalık taslak üretir",()=>{
  const source=read("src/ui/yks-v2-shell.ts");
  assert.match(source,/mathDaily/);
  assert.match(source,/noTripleScience/);
  assert.match(source,/lightWeekend/);
  assert.match(source,/review/);
  assert.match(source,/replace/);
  assert.match(source,/Fizik, Kimya, Biyoloji aynı güne yığılmasın/);
  assert.match(source,/Matematik her gün olsun/);
  assert.match(source,/Bu programı kullan/);
});

test("V2 tasarım sistemi açık tema, mobil yerleşim ve azaltılmış hareket desteği içerir",()=>{
  const css=read("src/ui/yks-v2-shell.css");
  assert.match(css,/:root\.yks-v2\[data-theme="paper"\]/);
  assert.doesNotMatch(css,/:root\.yks-v2\[data-theme="auto"\]\s*\{/);
  assert.match(css,/\.yks-v2-program-head/);
  assert.match(css,/\.yks-v2-planner-card/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
