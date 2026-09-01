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

test("Paragraf ve Problem Daha içinde bağımsız alt sayfadır",()=>{
  const source=read("src/ui/paragraph-problem-tracker.ts");
  const types=read("src/ui/types.ts");
  const panels=read("src/ui/more-panels.ts");
  assert.match(source,/PANEL_ID="mrp_pp"/);
  assert.match(source,/v30-subhead/);
  assert.match(source,/data-pp-back/);
  assert.match(source,/target==="pp"/);
  assert.match(source,/__YKS_UI__\?\.openMore/);
  assert.match(types,/"pp"/);
  assert.match(panels,/"pp"/);
});

test("Takipçi UI köprüsünden önce yüklenerek pp yönlendirmesini resmi hale getirir",()=>{
  const main=read("src/main.ts");
  const trackerAt=main.indexOf("const paragraphProblem=installParagraphProblemTracker()");
  const bridgeAt=main.indexOf("const ui=installLegacyUiBridge(screens)");
  assert.ok(trackerAt>=0);
  assert.ok(bridgeAt>=0);
  assert.ok(trackerAt<bridgeAt);
  assert.match(main,/paragraphProblemTracker/);
});
