const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Sayaç ve Kronometre aynı iyileştirilmiş ders hazırlık akışını kullanır",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  assert.match(source,/data-v46-subject-slot/);
  assert.match(source,/v46FocusSubjectSearch/);
  assert.match(source,/document\.getElementById\("pomoSubjPick"\)/);
  assert.match(source,/document\.getElementById\("pomoTopic"\)/);
  assert.match(source,/document\.getElementById\("pomoTask"\)/);
  assert.match(source,/"Kronometre":"Sayaç"/);
  assert.match(source,/data-v46-mode/);
});

test("ders seçici arama, seçili durum ve yeniden render sonrasında güvenli kalır",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  assert.match(source,/normalizeSubject/);
  assert.match(source,/button\.hidden=/);
  assert.match(source,/aria-pressed/);
  assert.match(source,/new MutationObserver/);
  assert.match(source,/subjectObserver\.observe\(picker,\{childList:true,subtree:false\}\)/);
  assert.match(source,/karta dokunarak onayla/);
  assert.match(source,/subjectConfirmed=true/);
});

test("hazırlık cilası dokunmatik, mobil ve erişilebilir seçim durumlarını kapsar",()=>{
  const style=read("src/ui/focus-session-guard-v43.css");
  assert.match(style,/#pomoSubjPick\{display:grid!important/);
  assert.match(style,/#pomoSubjPick \.chip\.on::after/);
  assert.match(style,/#pomoSubjPick \.chip\[hidden\]/);
  assert.match(style,/\.v46-secondary-grid/);
  assert.match(style,/focus-visible/);
  assert.match(style,/@media \(max-width:700px\)/);
  assert.match(style,/@media \(pointer:coarse\)/);
  assert.match(style,/@media \(prefers-reduced-motion:reduce\)/);
});

test("seçici iyileştirmesi sayaç verisine veya depolamaya yazmaz",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/sessionStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/__YKS_DATA__/);
  assert.doesNotMatch(source,/\bsave\s*\(/);
  assert.match(source,/originalTogglePomo/);
  assert.match(source,/originalSwToggle/);
  assert.match(source,/originalSetSubject/);
});
