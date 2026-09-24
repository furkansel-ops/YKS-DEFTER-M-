const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Çalış V5 mevcut odak DOM sözleşmesini yeniden yerleştirir",()=>{
  const source=read("src/ui/focus-v5.ts");
  const html=read("index.html");
  for(const id of ["pomo","focusCard","swCard","pomoSubjPick","pomoTopic","pomoTask","v29GoalText","v29GoalQ","sessionList","v29DaySummary"])assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(source,/data-v5-focus-header|v5FocusHeader/);
  assert.match(source,/data-v5-focus-shell|v5FocusShell/);
  assert.match(source,/data-v5-current-session|v5CurrentSession/);
  assert.match(source,/data-v5-focus-secondary|v5FocusSecondary/);
});

test("Çalış V5 sayaç ve oturum kayıt fonksiyonlarını değiştirmez",()=>{
  const source=read("src/ui/focus-v5.ts");
  assert.doesNotMatch(source,/\.togglePomo\s*=/);
  assert.doesNotMatch(source,/\.swToggle\s*=/);
  assert.doesNotMatch(source,/\.startPomo\s*=/);
  assert.doesNotMatch(source,/\.saveSessionNote\s*=/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\.open/);
  assert.doesNotMatch(source,/new\s+Dexie/);
  assert.doesNotMatch(source,/\.weeks\s*\[/);
  assert.doesNotMatch(source,/coachingShares|setDoc|updateDoc/);
});

test("Çalış V5 mevcut odak güvenlik kapısından sonra fail-open yüklenir",()=>{
  const safe=read("src/ui/v43-safe-runtime.ts");
  const guardIndex=safe.indexOf('import("./focus-session-guard-v43")');
  const focusIndex=safe.indexOf('import("./focus-v5")');
  assert.ok(guardIndex>=0);
  assert.ok(focusIndex>guardIndex);
  assert.match(safe,/v5FocusErrors/);
  assert.match(safe,/installFocusV5/);
});

test("Çalış V5 premium ve mobil düzeni kapsar",()=>{
  const css=read("src/ui/focus-v5.css");
  assert.match(css,/\.v5-focus-shell/);
  assert.match(css,/\.v5-focus-main/);
  assert.match(css,/\.v5-focus-side/);
  assert.match(css,/\.v5-focus-current/);
  assert.match(css,/\.v5-focus-secondary/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
