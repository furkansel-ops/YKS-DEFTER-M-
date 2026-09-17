const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const exists=file=>fs.existsSync(path.join(root,file));

test("YKS Defterim normal girişini yalnız öğrenci hesabı olarak açar",()=>{
  const loader=read("src/ui/coach-account-loader.ts"),runtime=read("public/student-coaching-runtime.js");
  assert.match(loader,/sessionStorage\.setItem\(PENDING_ROLE,"student"\)/);
  assert.match(loader,/publicRegistration="student-only"/);
  assert.match(runtime,/role:"student"/);
  assert.doesNotMatch(runtime,/roleModal|Koçluk Paneli|coachDashboard/);
});

test("mevcut koç hesabı öğrenci uygulamasını açtığında otomatik olarak başka uygulamaya yönlendirilmez",()=>{
  const loader=read("src/ui/coach-account-loader.ts"),runtime=read("public/student-coaching-runtime.js");
  assert.doesNotMatch(loader,/YKS-DEFTER-M-Ko-Paneli/);
  assert.doesNotMatch(loader,/window\.location\.(?:replace|assign)/);
  assert.match(loader,/coachDashboard="external-only"/);
  assert.doesNotMatch(runtime,/yksCoachDashboard|Öğrencilerim|Öğrenciye müdahale/);
});

test("öğrenci koç paylaşımı yalnız güvenli coachingShares görünümünü günceller",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/coachingShares/);
  assert.match(runtime,/setDoc\(doc\(rt\.db,"coachingShares",rt\.user\.uid\),sharePayload\(s,rt\.user\),\{merge:true\}\)/);
  assert.doesNotMatch(runtime,/collection\(rt\.db,"users"/);
  assert.doesNotMatch(runtime,/program:\{weeks\}/);
});

test("Programım paylaşımı ayrı v2 köprüsünde korunur",()=>{
  const runtime=read("public/coach-program-share-v2.js"),loader=read("src/ui/coach-account-loader.ts");
  assert.match(runtime,/PROGRAM_VERSION=2/);
  assert.match(runtime,/rowLabels/);
  assert.match(runtime,/weeks/);
  assert.match(runtime,/done/);
  assert.match(runtime,/dn/);
  assert.match(runtime,/mv/);
  assert.match(loader,/coach-program-share-v2\.js\?v=2\.0\.0/);
});

test("koçtan öğrenciye müdahaleler yalnız kontrollü action tipleriyle uygulanır",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  for(const type of["program_task","topic_deadline","coach_note","post_exam_task"])assert.ok(runtime.includes(type),type);
  assert.match(runtime,/coachingActions/);
  assert.match(runtime,/status:"applied"/);
  assert.match(runtime,/status:"rejected"/);
});

test("öğrenci verisi değiştiğinde koç görünümü yeniden yayınlanır",()=>{
  const bridge=read("src/data/legacy-data-bridge.ts"),runtime=read("public/student-coaching-runtime.js");
  assert.match(bridge,/yks:data-changed/);
  assert.match(runtime,/addEventListener\("yks:data-changed"/);
  assert.match(runtime,/publishShare/);
});

test("gömülü koç uygulaması dosyaları YKS Defterim paketinden kaldırılmıştır",()=>{
  for(const file of["public/coach-dashboard-v2.js","public/coach-register.html","public/coach-register.js","public/coach-invites.html","public/coach-student-link-hotfix.js","public/coach-student-directory-v2.js","public/coach-account-runtime.js"])assert.equal(exists(file),false,file);
  assert.equal(exists("public/student-coaching-runtime.js"),true);
  assert.equal(exists("public/student-coach-link.js"),true);
});

test("koç hesabı normal öğrenci bulut snapshot zincirini başlatmaz",()=>{
  const vite=read("vite.config.mts");
  assert.match(vite,/account&&account\.role/);
  assert.match(vite,/user=null;status\("Koç hesabı"/);
  assert.match(vite,/await waitAccountRuntime\(\)/);
});
