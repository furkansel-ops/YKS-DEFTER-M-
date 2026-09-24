const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const mod=fs.readFileSync(path.join(root,"modules/personal-upgrades.js"),"utf8");
const stability=fs.readFileSync(path.join(root,"modules/stability.js"),"utf8");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");

test("Program manuel kalır; Akıllı Oluştur yalnız açık kullanıcı onayıyla eklenir",()=>{
  const builder=fs.readFileSync(path.join(root,"src/ui/program-builder-v5.ts"),"utf8");
  assert.match(mod,/onayın olmadan programa yazmaz/);
  assert.match(app,/contenteditable="true"/);
  assert.match(builder,/Bu programı kullan/);
  assert.match(builder,/applyDraft/);
  assert.match(builder,/data-next/);
  assert.doesNotMatch(builder,/setInterval|localStorage\.setItem|indexedDB\.open/);
});

test("PC program girişi Enter dikey ve Tab yatay gezinir",()=>{
  assert.match(mod,/event\.key==="Enter"/);
  assert.match(mod,/verticalTarget/);
  assert.match(mod,/event\.key==="Tab"/);
  assert.match(mod,/horizontalTarget/);
  assert.match(mod,/event\.preventDefault\(\)/);
});

test("çok satırlı yapıştırma tek hücrede güvenli metne dönüşür",()=>{
  assert.match(mod,/function cleanCellText/);
  assert.match(mod,/replace\(\/\[\\r\\n\]\+\/g," · "\)/);
  assert.match(mod,/clipboardData/);
  assert.match(mod,/dispatchEvent\(new Event\("input"/);
});

test("Bugün program satırları tek dokunuş ve klavye ile tamamlanabilir",()=>{
  assert.match(app,/onclick="toggleCellDone/);
  assert.match(mod,/setAttribute\("role","button"\)/);
  assert.match(mod,/\["Enter"," "\]/);
  assert.match(mod,/row\.click\(\)/);
});

test("kişisel iyileştirme modülü kararlı çalışma zamanından yüklenir",()=>{
  assert.match(stability,/personal-upgrades\.js\?v=4\.1\.0-r20/);
  assert.match(stability,/loadPersonalUpgrades/);
  assert.equal(fs.existsSync(path.join(root,"modules/personal-upgrades.js")),true);
});
