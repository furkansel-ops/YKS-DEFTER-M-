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

test("Takipçi uygulama başlangıcında yüklenir",()=>{
  const main=read("src/main.ts");
  assert.match(main,/installParagraphProblemTracker/);
  assert.match(main,/paragraphProblemTracker/);
});
