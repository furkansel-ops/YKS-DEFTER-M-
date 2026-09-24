const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("V6 Ana Sayfa gerçek yapısal blokları kurar",()=>{
  const source=read("src/ui/today-v43.ts");
  const index=read("index.html");
  for(const id of ["home","todayHub","todayPlanTitle","todayPlan","journalInput"])assert.match(index,new RegExp('id="'+id+'"'));
  for(const marker of ["v6HomeHeader","v6HomeLayout","v6GoalCard","v6ProgramCard","v6QuickActions"])assert.match(source,new RegExp(marker));
  assert.match(source,/Bugün ne yapıyorum\?/);
  assert.match(source,/Programım/);
  assert.match(source,/İstatistik/);
});

test("V6 Ana Sayfa mevcut plan ve not fonksiyonlarını yeniden yazmaz",()=>{
  const source=read("src/ui/today-v43.ts");
  assert.match(source,/\.plancell/);
  assert.match(source,/toggleFold/);
  assert.match(source,/go\?\:/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\./);
  assert.doesNotMatch(source,/new\s+Dexie/);
  assert.doesNotMatch(source,/setDoc|updateDoc|coachingShares/);
  assert.doesNotMatch(source,/renderTodayPlan\s*=/);
});

test("V6 Ana Sayfa güvenli runtime içinde ve mobil uyumlu kalır",()=>{
  const main=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts"),css=read("src/ui/today-v43.css");
  assert.match(main,/installV43SafeRuntime/);
  assert.match(safe,/import\("\.\/today-v43"\)/);
  assert.match(safe,/installTodayV43/);
  assert.match(css,/\.v6-home-layout/);
  assert.match(css,/\.v6-quick-actions/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/\[hidden\]/);
});

test("V6 Ana Sayfa yalnız aktif ekranda flex olur",()=>{
  const css=read("src/ui/today-v43.css");
  assert.doesNotMatch(css,/#home\.v43-today\.v6-home\s*\{[^}]*display\s*:\s*flex/s);
  assert.match(css,/#home\.v43-today\.v6-home\.active\s*\{[^}]*display\s*:\s*flex/s);
});
