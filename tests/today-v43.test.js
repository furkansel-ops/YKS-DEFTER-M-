const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3 Today 2.0 keeps the existing home contracts and promotes the manual plan",()=>{
  const source=read("src/ui/today-v43.ts");
  const index=read("index.html");
  assert.match(source,/todayHub/);
  assert.match(source,/todayPlanTitle/);
  assert.match(source,/todayPlan/);
  assert.match(source,/insertAdjacentElement\("afterend",plan\)/);
  assert.match(index,/id="todayHub"/);
  assert.match(index,/id="todayPlanTitle"/);
  assert.match(index,/id="todayPlan"/);
});

test("v4.3 Today 2.0 collapses secondary information without writing study data",()=>{
  const source=read("src/ui/today-v43.ts");
  assert.match(source,/Günün detaylarını göster/);
  assert.match(source,/Diğer araçları aç/);
  assert.match(source,/data-v43-secondary|v43Secondary/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\./);
  assert.doesNotMatch(source,/\bDexie\b/);
  assert.doesNotMatch(source,/\bFirebase\b/);
  assert.doesNotMatch(source,/\baddToToday\s*\(/);
  assert.doesNotMatch(source,/\baddToDay\s*\(/);
});

test("v4.3 Today 2.0 güvenli TypeScript runtime tarafından yüklenir ve tablet erişilebilirliğini korur",()=>{
  const main=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts"),css=read("src/ui/today-v43.css");
  assert.match(main,/installV43SafeRuntime/);
  assert.doesNotMatch(main,/from "\.\/ui\/today-v43"/);
  assert.match(safe,/import\("\.\/today-v43"\)/);
  assert.match(safe,/installTodayV43/);
  assert.match(safe,/v43Today/);
  assert.match(safe,/v43TodayErrors/);
  assert.match(css,/@media \(max-width:760px\)/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\[hidden\]/);
});

test("v4.3 Today 2.0 only becomes flex while the home screen is active",()=>{
  const css=read("src/ui/today-v43.css");
  assert.doesNotMatch(css,/#home\.v43-today\s*\{[^}]*display\s*:\s*flex/s);
  assert.match(css,/#home\.v43-today\.active\s*\{[^}]*display\s*:\s*flex/s);
});
