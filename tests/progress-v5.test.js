const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("İstatistikler V5 mevcut ilerleme kartlarını yeni hiyerarşiye taşır",()=>{
  const source=read("src/ui/progress-v5.ts");
  const html=read("index.html");
  for(const id of ["progress","prMin","prQ","prDays","v28Weekly","progressSubjects","v28Calendar","v4SubjectInsights","v4ProgressRhythm","v4TopicsReviews","progressNet"]){
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(source,/data-v5-progress-visuals|v5ProgressVisuals/);
  assert.match(source,/Haftalık gelişim/);
  assert.match(source,/Ders dağılımı/);
  assert.match(source,/İstikrar/);
  assert.match(source,/İstatistikler/);
});

test("İstatistikler V5 hesaplama veya çalışma verisini değiştirmez",()=>{
  const source=read("src/ui/progress-v5.ts");
  assert.doesNotMatch(source,/renderProgress\s*=/);
  assert.doesNotMatch(source,/__YKS_PROGRESS_ANALYSIS__\s*=/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\.open/);
  assert.doesNotMatch(source,/new\s+Dexie/);
  assert.doesNotMatch(source,/\.weeks\s*\[/);
  assert.doesNotMatch(source,/\bsave\s*\(/);
  assert.doesNotMatch(source,/setDoc|updateDoc|coachingShares/);
});

test("İstatistikler V5 fail-open runtime ve mobil görünümü içerir",()=>{
  const safe=read("src/ui/v43-safe-runtime.ts");
  const css=read("src/ui/progress-v5.css");
  assert.match(safe,/import\("\.\/progress-v5"\)/);
  assert.match(safe,/installProgressV5/);
  assert.match(safe,/v5ProgressErrors/);
  assert.match(css,/\.v5-progress-visuals/);
  assert.match(css,/\.v5-progress-kpis/);
  assert.match(css,/\.v5-progress-insight-grid/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
