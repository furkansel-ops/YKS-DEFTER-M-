const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const exists=file=>fs.existsSync(path.join(root,file));

test("öğrenci uygulaması yalnız öğrenci hesabı olarak açılır ve koç paneline yönlendirme içermez",()=>{
  const loader=read("src/ui/student-account-loader.ts"),runtime=read("public/student-coaching-runtime.js");
  assert.match(loader,/sessionStorage\.setItem\(PENDING_ROLE,"student"\)/);
  assert.match(loader,/publicRegistration="student-only"/);
  assert.doesNotMatch(loader,/YKS-DEFTER-M-Ko-Paneli|window\.location\.(?:replace|assign)|coachDashboard/);
  assert.match(runtime,/role:"student"/);
  assert.doesNotMatch(runtime,/roleModal|Koçluk Paneli|coachDashboard/);
});

test("öğrenci hesap köprüleri auth başlamadan önce güvenli sırada yüklenir",()=>{
  const loader=read("src/ui/student-account-loader.ts");
  const bridgeAt=loader.indexOf("student-coaching-runtime.js?v=1.1.0");
  const linkAt=loader.indexOf("student-coach-link.js?v=1.0.0");
  const programAt=loader.indexOf("student-program-share-v2.js?v=2.0.0");
  const authAt=loader.indexOf("auth-session-runtime.js?v=1.6.0");
  assert.ok(bridgeAt>=0&&linkAt>bridgeAt&&programAt>linkAt&&authAt>programAt);
});

test("öğrenci koç paylaşımı yalnız güvenli coachingShares görünümünü günceller",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/coachingShares/);
  assert.match(runtime,/setDoc\(doc\(rt\.db,"coachingShares",rt\.user\.uid\),sharePayload\(s,rt\.user\),\{merge:true\}\)/);
  assert.doesNotMatch(runtime,/collection\(rt\.db,"users"/);
  assert.doesNotMatch(runtime,/program:\{weeks\}/);
});

test("Programım paylaşımı öğrenci köprüsünde tam yapıyı korur",()=>{
  const runtime=read("public/student-program-share-v2.js");
  for(const token of["PROGRAM_VERSION=2","MAX_PROGRAM_WEEKS=80","rowLabels","rows","weeks","done","dn","mv","coachingShares"])assert.ok(runtime.includes(token),token);
  assert.match(runtime,/version:PROGRAM_VERSION,rows,rowLabels:labels,weeks/);
  assert.match(runtime,/yks:data-changed/);
  assert.match(runtime,/onSnapshot\(ref/);
  assert.match(runtime,/YKSStudentProgramShareV2/);
  assert.doesNotMatch(runtime,/users.*sync/);
});

test("koçtan öğrenciye işlemler yalnız kontrollü action tipleriyle uygulanır",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  for(const type of["program_task","topic_deadline","coach_note","post_exam_task"])assert.ok(runtime.includes(type),type);
  assert.match(runtime,/coachingActions/);
  assert.match(runtime,/status:"applied"/);
  assert.match(runtime,/status:"rejected"/);
});

test("öğrenci ayarlarında yalnız Koç Kodum bağlantı kartı bulunur",()=>{
  const runtime=read("public/student-coach-link.js");
  assert.match(runtime,/studentCoachCodeSettings/);
  assert.match(runtime,/Koç Kodum/);
  assert.match(runtime,/CODE_LENGTH=12/);
  assert.match(runtime,/crypto\.getRandomValues/);
  assert.match(runtime,/studentCoachAccess/);
  assert.match(runtime,/studentCoachCodes/);
  assert.match(runtime,/Bağlantıyı kes/);
  assert.doesNotMatch(runtime,/addStudentByCode|enhanceCoachDashboard|Öğrencilerim|Öğrenci ekle|yksCoachDashboard/);
});

test("Firestore koç bağlantısı sözleşmesini korurken ham öğrenci sync verisini kapalı tutar",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/function validStudentCoachCode/);
  assert.ok(rules.includes("accessCode.matches('^[A-Z2-9]{12}$')"));
  assert.match(rules,/match \/studentCoachAccess\/\{studentUid\}/);
  assert.match(rules,/match \/studentCoachCodes\/\{accessCode\}/);
  assert.match(rules,/match \/studentCoachCodes\/\{accessCode\}[\s\S]*allow list: if false/);
  assert.match(rules,/activeCoachingLink\(studentUid, request\.auth\.uid\)/);
  assert.match(rules,/match \/users\/\{userId\}\/sync\/meta[\s\S]*allow read: if ownsUserSpace\(userId\)/);
});

test("koç paneli uygulama dosyaları öğrenci paketinde bulunmaz",()=>{
  for(const file of[
    "public/coach-dashboard-v2.js","public/coach-register.html","public/coach-register.js","public/coach-invites.html",
    "public/coach-student-link-hotfix.js","public/coach-student-directory-v2.js","public/coach-account-runtime.js",
    "public/coach-program-share-v2.js","src/ui/coach-account-loader.ts"
  ])assert.equal(exists(file),false,file);
  for(const file of["public/student-coaching-runtime.js","public/student-coach-link.js","public/student-program-share-v2.js","src/ui/student-account-loader.ts"])assert.equal(exists(file),true,file);
});

test("koç hesabı normal öğrenci bulut snapshot zincirini başlatmaz",()=>{
  const vite=read("vite.config.mts");
  assert.match(vite,/account&&account\.role/);
  assert.match(vite,/user=null;status\("Koç hesabı"/);
  assert.match(vite,/await waitAccountRuntime\(\)/);
});
