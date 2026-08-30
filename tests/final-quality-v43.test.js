const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3 final release runtime yedi yeni ürün katmanını izole kurulum durumuyla doğrular",()=>{
  const release=read("src/release/release.ts"),main=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts");
  const checks=[
    ["v43-today","v43Today","v43TodayErrors","today-v43"],
    ["v43-analysis","v43Analysis","v43AnalysisErrors","analysis-center-v43"],
    ["v43-learning-cycle","v43LearningCycle","v43LearningCycleErrors","learning-cycle-v43"],
    ["v43-lab-quiz","v43LabQuiz","v43LabQuizErrors","lab-quiz-v43"],
    ["v43-navigation","v43Navigation","v43NavigationErrors","navigation-v43"],
    ["v43-personalization","v43Personalization","v43PersonalizationErrors","personalization-v43"],
    ["v43-focus-session-guard","v43FocusSessionGuard","v43FocusSessionGuardErrors","focus-session-guard-v43"]
  ];
  assert.match(main,/installV43SafeRuntime/);
  for(const [name,installed,error,module] of checks){
    assert.ok(release.includes(`\"${name}\"`),name);
    assert.ok(release.includes(`\"${installed}\"`),installed);
    assert.ok(release.includes(`\"${error}\"`),error);
    assert.ok(safe.includes(`dataset.${installed}=`)||safe.includes(`\"${installed}\"`),installed);
    assert.ok(safe.includes(`dataset.${error}=`)||safe.includes(`\"${error}\"`),error);
    assert.ok(safe.includes(`import(\"./${module}\")`),module);
  }
  assert.match(release,/v43Ready/);
  assert.match(release,/v43-runtime/);
  assert.match(release,/withTimeout\(runtime\.ready,12_000\)/);
});

test("production ve canlı Pages doğrulaması release kimliği sapmasını yakalar",()=>{
  const verify=read("scripts/verify-release.mjs"),live=read("scripts/verify-live-pages.mjs");
  assert.match(verify,/v43Markers/);
  for(const marker of ["v43Today","v43Analysis","v43LearningCycle","v43LabQuiz","v43Navigation","v43Personalization","v43FocusSessionGuard"])assert.ok(verify.includes(`\"${marker}\"`),marker);
  assert.match(live,/version\.json/);
  assert.match(live,/localRelease\.version/);
  assert.doesNotMatch(live,/const RELEASE_MARKER="4\.[0-9]+\.0"/);
});

test("v4.3 final kalite kapısı veri şeması ve manuel Program sözleşmesini değiştirmez",()=>{
  const data=read("src/data/contracts.ts"),version=JSON.parse(read("version.json"));
  const files=[
    "src/ui/today-v43.ts","src/ui/analysis-center-v43.ts","src/ui/learning-cycle-v43.ts","src/ui/lab-quiz-v43.ts",
    "src/ui/navigation-v43.ts","src/ui/personalization-v43.ts","src/ui/focus-session-guard-v43.ts","src/ui/screens/legacy-adapters.ts","src/release/release.ts"
  ];
  const source=files.map(read).join("\n");
  assert.equal(version.schema,21);
  assert.match(data,/DATA_SCHEMA_VERSION=21/);
  assert.doesNotMatch(source,/addToToday\s*\(|addToDay\s*\(|auto(?:matic)?Program|generateProgram/i);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
});
