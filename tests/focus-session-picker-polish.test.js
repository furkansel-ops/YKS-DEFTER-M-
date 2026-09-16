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

test("her yeni oturum ders seçimini boş ve kullanıcı onaylı başlatır",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  assert.match(source,/subjectConfirmed=false/);
  assert.match(source,/if\(!subjectConfirmed\)button\.classList\.remove\("on"\)/);
  assert.match(source,/Henüz ders seçilmedi/);
  assert.match(source,/if\(!subjectConfirmed\)\{requestPreparation\(mode\);return undefined;\}/);
  assert.match(source,/subjectConfirmed=true/);
  assert.match(source,/pendingMode=currentFocusMode\(\)/);
});

test("ders seçici arama ve yeniden render sonrasında güvenli kalır",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  assert.match(source,/normalizeSubject/);
  assert.match(source,/button\.hidden=/);
  assert.match(source,/aria-pressed/);
  assert.match(source,/new MutationObserver/);
  assert.match(source,/subjectObserver\.observe\(picker,\{childList:true,subtree:false\}\)/);
});

test("konu ve çalışma türü select verisini bozmadan kartlara dönüştürür",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  const style=read("src/ui/focus-session-guard-v43.css");
  assert.match(source,/id="v46TopicChoices"/);
  assert.match(source,/id="v46TaskChoices"/);
  assert.match(source,/type ChoiceKind="topic"\|"task"/);
  assert.match(source,/Array\.from\(select\.options\)/);
  assert.match(source,/select\.dispatchEvent\(new Event\("change",\{bubbles:true\}\)\)/);
  assert.match(source,/Önce ders seç · konular burada görünecek/);
  assert.match(style,/\.v46-choice-grid/);
  assert.match(style,/\.v46-choice-card\.on::after/);
  assert.match(style,/\.v46-choice-empty/);
  assert.match(style,/\.v46-select-slot\{position:absolute!important/);
});

test("oturum kaydı sonrası hazırlık ve oturum amacı yeni oturum için temizlenir",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  assert.match(source,/resetPreparationForNextSession/);
  assert.match(source,/legacy\("setPomoTopic"\)\?\.\(""\)/);
  assert.match(source,/legacy\("setPomoTask"\)\?\.\(""\)/);
  assert.match(source,/legacy\("v29SetGoal"\)\?\.\(""\)/);
  assert.match(source,/originalRecordSession/);
  assert.match(source,/originalSwRecord/);
  assert.match(source,/window\.setTimeout\(resetPreparationForNextSession,0\)/);
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

test("seçici iyileştirmesi depolama motoruna doğrudan yazmaz",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/sessionStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/__YKS_DATA__/);
  assert.doesNotMatch(source,/\bsave\s*\(/);
  assert.match(source,/originalTogglePomo/);
  assert.match(source,/originalSwToggle/);
  assert.match(source,/originalSetSubject/);
});
