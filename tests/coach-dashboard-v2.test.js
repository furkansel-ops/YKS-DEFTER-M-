const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("koç ana paneli yalnız önemli özet metriklerini öne çıkarır",()=>{
  const runtime=read("public/coach-dashboard-v2.js");
  assert.match(runtime,/7 gün çalışma/);
  assert.match(runtime,/7 gün soru/);
  assert.match(runtime,/Son deneme/);
  assert.match(runtime,/Geciken konu/);
  assert.match(runtime,/Dikkat edilmesi gerekenler/);
  assert.match(runtime,/Programdan son görevler/);
  assert.match(runtime,/Son denemeler/);
  assert.match(runtime,/Hızlı işlemler/);
});

test("ayrıntılar tek ekrana yığılmak yerine sekmelere ayrılır",()=>{
  const runtime=read("public/coach-dashboard-v2.js");
  for(const label of ["Özet","Program","Deneme","İlerleme","Konular","Hata Defteri"]){
    assert.ok(runtime.includes(`\"${label}\"`));
  }
  assert.match(runtime,/function renderSummary/);
  assert.match(runtime,/function renderProgram/);
  assert.match(runtime,/function renderExams/);
  assert.match(runtime,/function renderProgress/);
  assert.match(runtime,/function renderTopics/);
  assert.match(runtime,/function renderErrors/);
});

test("özet panel dikkat gerektiren konu, hata ve net düşüşünü hesaplar",()=>{
  const runtime=read("public/coach-dashboard-v2.js");
  assert.match(runtime,/topicStats/);
  assert.match(runtime,/topErrors/);
  assert.match(runtime,/exams\.delta!=null&&exams\.delta<0/);
  assert.match(runtime,/En çok hata yapılan konu/);
  assert.match(runtime,/Son denemede net düşüşü/);
});

test("koç hızlı işlemleri mevcut güvenli coachingActions kanalını kullanır",()=>{
  const runtime=read("public/coach-dashboard-v2.js");
  assert.match(runtime,/coachingActions/);
  assert.match(runtime,/program_task/);
  assert.match(runtime,/coach_note/);
  assert.match(runtime,/post_exam_task/);
  assert.match(runtime,/topic_deadline/);
  assert.doesNotMatch(runtime,/users\/.*sync/);
});

test("koç paneli v2 link hotfixinden sonra auth başlamadan önce yüklenir",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  const linkAt=loader.indexOf("coach-student-link-hotfix.js?v=1.0.0");
  const dashboardAt=loader.indexOf("coach-dashboard-v2.js?v=2.0.0");
  const authAt=loader.indexOf("auth-session-runtime.js?v=1.6.0");
  assert.ok(linkAt>=0&&dashboardAt>linkAt&&authAt>dashboardAt);
  assert.match(loader,/COACH_DASHBOARD_V2_SCRIPT_ID/);
  assert.match(read("public/coach-dashboard-v2.js"),/version:"2\.0\.0"/);
});

test("öğrenci seçildiğinde varsayılan görünüm yeniden özete döner",()=>{
  const runtime=read("public/coach-dashboard-v2.js");
  assert.match(runtime,/runtime\.tab="summary";renderStudentList\(\);renderDetail\(\)/);
  assert.match(runtime,/data-cd2-student/);
});
