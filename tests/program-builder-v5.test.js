const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Program Oluştur dört adımlı kullanıcı onaylı akışı içerir",()=>{
  const source=read("src/ui/program-builder-v5.ts");
  const css=read("src/ui/program-builder-v5.css");
  for(const text of ["Kendim Oluştur","Akıllı Oluştur","Hedefini seç","DERS VE KONU","YOĞUNLUK","ÖNİZLEME","Bu programı kullan"])assert.ok(source.includes(text),text);
  assert.match(source,/data-goal/);
  assert.match(source,/data-subject/);
  assert.match(source,/data-topic/);
  assert.match(source,/data-daily/);
  assert.match(css,/\.v5-builder-mode-grid/);
  assert.match(css,/\.v5-builder-subjects/);
  assert.match(css,/\.v5-builder-preview/);
});

test("Akıllı Oluştur yalnız final onayında mevcut Program gridine yazar",()=>{
  const source=read("src/ui/program-builder-v5.ts");
  assert.match(source,/function applyDraft/);
  assert.match(source,/#gridS \[data-blk="s"\]/);
  assert.match(source,/dispatchEvent\(new Event\("input"/);
  assert.match(source,/\(window as HostWindow\)\.save\?\.\(\)/);
  assert.match(source,/step===4\?"Bu programı kullan"/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\.open/);
  assert.doesNotMatch(source,/new\s+Dexie/);
  assert.doesNotMatch(source,/setDoc|updateDoc|coachingShares/);
  assert.doesNotMatch(source,/\.weeks\s*\[/);
});

test("Akıllı Oluştur matematik, fen dengesi ve hafif hafta sonu kurallarını uygular",()=>{
  const source=read("src/ui/program-builder-v5.ts");
  assert.match(source,/mathDaily/);
  assert.match(source,/noTripleScience/);
  assert.match(source,/lightWeekend/);
  assert.match(source,/reviews/);
  assert.match(source,/Fen üçlüsü aynı güne yığılmasın/);
  assert.match(source,/Matematik her gün olsun/);
  assert.match(source,/days\[day\]!\.filter\(task=>isScience\(task\.subject\)\)\.length>=2/);
});

test("Program Oluştur fail-open runtime ve Ana Sayfa hızlı erişimi üzerinden açılır",()=>{
  const safe=read("src/ui/v43-safe-runtime.ts");
  const home=read("src/ui/today-v43.ts");
  const builder=read("src/ui/program-builder-v5.ts");
  assert.match(safe,/import\("\.\/program-builder-v5"\)/);
  assert.match(safe,/installProgramBuilderV5/);
  assert.match(safe,/v5ProgramBuilderErrors/);
  assert.match(home,/yks:open-program-builder/);
  assert.match(builder,/data-v5-builder-trigger|v5BuilderTrigger/);
  assert.match(builder,/data-v5-builder-inline|v5BuilderInline/);
});
