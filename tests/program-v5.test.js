const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Program V5 mevcut haftalık plan DOM sözleşmesini koruyarak yapısal kabuk kurar",()=>{
  const source=read("src/ui/program-v5.ts");
  const index=read("index.html");
  for(const id of ["program","progWeek","progCal","gridR","gridS","programWeekOverview","fh_kamp","fh_sablon"]){
    assert.match(index,new RegExp('id="'+id+'"'));
  }
  assert.match(source,/data-v5-program-header|v5ProgramHeader/);
  assert.match(source,/data-v5-program-shell|v5ProgramShell/);
  assert.match(source,/sectionForGrid\("gridR"/);
  assert.match(source,/sectionForGrid\("gridS"/);
  assert.match(source,/data-v5-mobile-planner|v5MobilePlanner/);
  assert.match(source,/data-v5-program-editor|v5ProgramEditor/);
  assert.match(source,/Günlük/);
  assert.match(source,/Haftalık/);
  assert.match(source,/Aylık/);
  assert.match(source,/collectDayTasks/);
  assert.match(source,/focusEditorCell/);
});

test("Program V5 yalnız görünüm katmanıdır; program veya senkron verisine doğrudan yazmaz",()=>{
  const source=read("src/ui/program-v5.ts");
  assert.doesNotMatch(source,/\blocalStorage\b/);
  assert.doesNotMatch(source,/\bindexedDB\b/);
  assert.doesNotMatch(source,/\bDexie\b/);
  assert.doesNotMatch(source,/\bFirebase\b|Firestore|setDoc|updateDoc/);
  assert.doesNotMatch(source,/\bsave\s*\(/);
  assert.doesNotMatch(source,/\.weeks\s*\[/);
  assert.doesNotMatch(source,/yks:data-changed/);
});

test("Program V5 fail-open runtime üzerinden yüklenir ve mobil düzen içerir",()=>{
  const safe=read("src/ui/v43-safe-runtime.ts");
  const css=read("src/ui/program-v5.css");
  assert.match(safe,/import\("\.\/program-v5"\)/);
  assert.match(safe,/installProgramV5/);
  assert.match(safe,/v5Program/);
  assert.match(safe,/v5ProgramErrors/);
  assert.match(css,/\.v5-program-shell/);
  assert.match(css,/\.v5-program-main/);
  assert.match(css,/\.v5-program-rail/);
  assert.match(css,/APPROVED PROGRAM MOCKUP/);
  assert.match(css,/\.v5-mobile-planner/);
  assert.match(css,/\.v5-week-strip/);
  assert.match(css,/\.v5-timeline/);
  assert.match(css,/\.v5-program-fab/);
  assert.match(css,/\.v5-time-row\[data-tone="math"\]/);
  assert.match(css,/@media \(max-width:760px\)/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
});


test("Program V5 mobil zaman çizelgesi mevcut gridlerden okur ve ikinci veri modeli oluşturmaz",()=>{
  const source=read("src/ui/program-v5.ts");
  assert.match(source,/querySelectorAll<HTMLElement>\('#grid'\+block\.toUpperCase\(\)/);
  assert.match(source,/\.gtx/);
  assert.match(source,/\.glabel|data-lbl/);
  assert.match(source,/MutationObserver/);
  assert.match(source,/setProgTab/);
  assert.match(source,/shiftWeek/);
  assert.doesNotMatch(source,/\bfetch\s*\(/);
  assert.doesNotMatch(source,/XMLHttpRequest/);
  assert.doesNotMatch(source,/coachingShares/);
});
