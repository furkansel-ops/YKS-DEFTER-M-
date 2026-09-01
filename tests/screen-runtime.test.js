const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

function read(file){return fs.readFileSync(path.join(root,file),"utf8");}

test("yedi ana ekran tek TypeScript registry üzerinden kayıtlıdır",()=>{
  const runtime=read("src/ui/screen-runtime.ts"),registry=read("src/ui/screens/registry.ts");
  const imports=["homeScreen","programScreen","topicsScreen","examsScreen","progressScreen","focusScreen","moreScreen"];
  for(const name of imports){
    assert.match(registry,new RegExp(`import \\{${name}\\}`));
    assert.equal((registry.match(new RegExp(`\\b${name}\\b`,"g"))||[]).length,2,name);
  }
  assert.match(registry,/new Map<ScreenId,ScreenModule>/);
  assert.match(runtime,/import \{getScreenModule,SCREEN_MODULES\} from "\.\/screens\/registry"/);
  assert.doesNotMatch(runtime,/from "\.\/screens\/(home|program|topics|exams|progress|focus|more)"/);
});

test("legacy ekran adaptörleri çizim sırasını ve performans ertelemelerini korur",()=>{
  const adapters=read("src/ui/screens/legacy-adapters.ts");
  assert.ok(adapters.indexOf('call("renderPlan")')<adapters.indexOf('afterPaint("program-secondary"'));
  assert.match(adapters,/isVisible\("progCal"\)/);
  assert.match(adapters,/idle\("deneme-secondary"/);
  assert.match(adapters,/call\("setAnaTab",environment\.call\("activeAnaTab"\)\)/);
  assert.ok(adapters.indexOf('call("renderPomo")')<adapters.indexOf('call("renderTimeDist")'));
  assert.match(adapters,/call\("setMoreTab",environment\.call\("activeMoreTab"\)\)/);
});

test("aktif ekran yenilemesi güvenli biçimde TypeScript'e bağlanır ve legacy yönlendirme korunur",()=>{
  const runtime=read("src/ui/screen-runtime.ts"),navigation=read("src/ui/navigation.ts");
  assert.match(runtime,/legacyRefresh/);assert.match(runtime,/renderCurrent\("external-state"\)\|\|legacyRefresh\(\)/);
  const legacyAt=navigation.indexOf("result=this.#legacyGo(value)");
  const ppAt=navigation.indexOf('if(value==="pp")');
  assert.ok(legacyAt>=0&&ppAt>legacyAt);
  assert.match(navigation,/else if\(\(legacyFailed\|\|active!==value\)&&this\.#screenRuntime\)/);
  assert.match(navigation,/this\.#screenRuntime\.render\(value,source\)/);
  assert.match(navigation,/classList\.toggle\("wide",screen==="program"\)/);
});
