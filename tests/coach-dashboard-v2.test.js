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
  for(const label of["Özet","Program","Deneme","İlerleme","Konular","Hata Defteri"]){
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

test("koç paneli v2.1 auth başlamadan önce yüklenir",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  const linkAt=loader.indexOf("coach-student-link-hotfix.js?v=1.0.0");
  const dashboardAt=loader.indexOf("coach-dashboard-v2.js?v=2.1.0");
  const authAt=loader.indexOf("auth-session-runtime.js?v=1.6.0");
  assert.ok(linkAt>=0&&dashboardAt>linkAt&&authAt>dashboardAt);
  assert.match(loader,/COACH_DASHBOARD_V2_SCRIPT_ID/);
  assert.match(read("public/coach-dashboard-v2.js"),/version:"2\.1\.0"/);
});

test("öğrenci seçildiğinde varsayılan görünüm özete döner ve canlı paylaşım yeniden bağlanır",()=>{
  const runtime=read("public/coach-dashboard-v2.js");
  assert.match(runtime,/runtime\.tab="summary"/);
  assert.match(runtime,/watchSelectedShare\(\)/);
  assert.match(runtime,/data-cd2-student/);
});

test("program ekranı Programım v2 verisini tam haftalık grid olarak kullanır",()=>{
  const runtime=read("public/coach-dashboard-v2.js");
  assert.match(runtime,/Programım · tam görünüm/);
  assert.match(runtime,/const DAYS=\["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"\]/);
  assert.match(runtime,/program\.rowLabels/);
  assert.match(runtime,/program\.rows/);
  assert.match(runtime,/week\.data\?\.dn/);
  assert.match(runtime,/week\.data\?\.mv/);
  assert.match(runtime,/week\.data\?\.done/);
  assert.match(runtime,/data-program-week/);
  assert.match(runtime,/Rutinler/);
  assert.match(runtime,/Ders Programım/);
  assert.match(runtime,/Gün tamamlandı/);
  assert.match(runtime,/Yarına taşınan görev/);
});

test("seçili öğrencinin coachingShares belgesi Firestore onSnapshot ile canlı izlenir",()=>{
  const runtime=read("public/coach-dashboard-v2.js");
  assert.match(runtime,/getDocs,onSnapshot,query/);
  assert.match(runtime,/onSnapshot\(doc\(runtime\.ctx\.db,SHARE_COLLECTION,uid\)/);
  assert.match(runtime,/stopShareWatch/);
  assert.match(runtime,/renderDetail\(\)/);
});
