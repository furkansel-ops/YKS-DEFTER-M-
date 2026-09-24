const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const mod=fs.readFileSync(path.join(root,"modules/personal-upgrades.js"),"utf8");
const stability=fs.readFileSync(path.join(root,"modules/stability.js"),"utf8");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");

test("Program manuel kalır ve otomatik program üreticisi eklenmez",()=>{
  assert.doesNotMatch(mod,/generateProgram|autoProgram|akıllı program oluştur/i);
  assert.match(mod,/Programı yalnız sen doldurursun/);
  assert.match(app,/contenteditable="true"/);
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
