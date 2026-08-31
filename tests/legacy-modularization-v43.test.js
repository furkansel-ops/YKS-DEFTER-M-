const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

function read(file){return fs.readFileSync(path.join(root,file),"utf8");}

test("v4.3 yedi ekranın legacy çağrılarını tipli adaptör sınırına taşır",()=>{
  const screens={home:"homeLegacyAdapter",program:"programLegacyAdapter",topics:"topicsLegacyAdapter",exams:"examsLegacyAdapter",progress:"progressLegacyAdapter",focus:"focusLegacyAdapter",more:"moreLegacyAdapter"};
  for(const [file,adapter] of Object.entries(screens)){
    const source=read(`src/ui/screens/${file}.ts`);
    assert.match(source,new RegExp(`import \\{${adapter}\\} from "\\.\\/legacy-adapters"`),file);
    assert.match(source,new RegExp(`required:${adapter}\\.required`),file);
    assert.match(source,new RegExp(`${adapter}\\.render\\(environment\\)`),file);
    assert.doesNotMatch(source,/environment\.(call|optional|idle|afterPaint)\(/,file);
  }
});

test("legacy adaptör sözleşmesi ekran fonksiyonlarını tek yerde ve tür güvenli tutar",()=>{
  const source=read("src/ui/screens/legacy-adapters.ts");
  assert.match(source,/interface LegacyScreenAdapter/);
  assert.match(source,/readonly required:readonly LegacyScreenFunction\[\]/);
  for(const fn of ["renderHome","renderPlan","renderSubjects","renderDenemeHistory","renderProgress","renderPomo","setMoreTab"])assert.match(source,new RegExp(`"${fn}"`),fn);
  assert.match(source,/afterPaint\("program-secondary"/);
  assert.match(source,/idle\("deneme-secondary"/);
});

test("legacy modülerleştirme Program veya veri katmanına yazmaz",()=>{
  const source=read("src/ui/screens/legacy-adapters.ts");
  assert.doesNotMatch(source,/localStorage|indexedDB|firebase|firestore|YKSLegacyState/);
  assert.doesNotMatch(source,/\.save\s*\(|addToToday|addToDay|weeks\s*\[|rows\s*\[/);
  assert.doesNotMatch(source,/smartPlan|autoPlan|Program.*otomatik/i);
});

test("modern Deneme ve İlerleme katmanları legacy adaptörün dışında ve lazy köprüde kalır",()=>{
  const exams=read("src/ui/screens/exams.ts"),progress=read("src/ui/screens/progress.ts"),safe=read("src/ui/v43-safe-runtime.ts"),registry=read("src/ui/screens/registry.ts"),runtime=read("src/ui/screen-runtime.ts");
  const examRender=exams.slice(exams.indexOf("export const examsScreen"));
  const progressRender=progress.slice(progress.indexOf("export const progressScreen"));
  assert.ok(examRender.indexOf("examsLegacyAdapter.render(environment)")<examRender.indexOf("renderExamDashboard()"));
  assert.ok(examRender.indexOf("renderExamDashboard()")<examRender.indexOf("renderLearningCycleV43()"));
  assert.ok(progressRender.indexOf("progressLegacyAdapter.render(environment)")<progressRender.indexOf("renderAnalysisCenterV43()"));
  assert.ok(progressRender.indexOf("renderAnalysisCenterV43()")<progressRender.indexOf("renderProgressDashboard()"));
  assert.doesNotMatch(exams,/from "\.\.\/learning-cycle-v43"/);assert.doesNotMatch(progress,/from "\.\.\/analysis-center-v43"/);
  assert.match(safe,/__YKS_V43_RENDER_LEARNING_CYCLE__/);assert.match(safe,/__YKS_V43_RENDER_ANALYSIS__/);
  assert.match(registry,/export const SCREEN_MODULES:readonly ScreenModule\[\]/);
  assert.match(runtime,/getScreenModule\(screen\)/);
});
