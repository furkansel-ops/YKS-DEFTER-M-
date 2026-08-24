const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

function read(file){return fs.readFileSync(path.join(root,file),"utf8");}

test("yedi ana ekranın her biri tek TypeScript modülüyle kayıtlıdır",()=>{
  const runtime=read("src/ui/screen-runtime.ts");
  const imports=["homeScreen","programScreen","topicsScreen","examsScreen","progressScreen","focusScreen","moreScreen"];
  for(const name of imports){
    assert.match(runtime,new RegExp(`import \\{${name}\\}`));
    assert.equal((runtime.match(new RegExp(`\\b${name}\\b`,"g"))||[]).length,2,name);
  }
  assert.match(runtime,/new Map<ScreenId,ScreenModule>/);
});

test("ekran modülleri mevcut çizim sırasını ve performans ertelemelerini korur",()=>{
  const program=read("src/ui/screens/program.ts"),exams=read("src/ui/screens/exams.ts"),focus=read("src/ui/screens/focus.ts"),more=read("src/ui/screens/more.ts");
  assert.ok(program.indexOf('call("renderPlan")')<program.indexOf('afterPaint("program-secondary"'));
  assert.match(program,/isVisible\("progCal"\)/);assert.match(exams,/idle\("deneme-secondary"/);assert.match(exams,/call\("setAnaTab",environment\.call\("activeAnaTab"\)\)/);
  assert.ok(focus.indexOf('call("renderPomo")')<focus.indexOf('call("renderTimeDist")'));
  assert.match(more,/call\("setMoreTab",environment\.call\("activeMoreTab"\)\)/);
});

test("aktif ekran yenilemesi güvenli biçimde TypeScript'e bağlanır",()=>{
  const runtime=read("src/ui/screen-runtime.ts"),navigation=read("src/ui/navigation.ts");
  assert.match(runtime,/legacyRefresh/);assert.match(runtime,/renderCurrent\("external-state"\)\|\|legacyRefresh\(\)/);
  assert.match(navigation,/if\(!this\.#screenRuntime\.render\(value,source\)\)result=this\.#legacyGo\(value\)/);
  assert.match(navigation,/classList\.toggle\("wide",screen===\"program\"\)/);
});
