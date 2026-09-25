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
  const bridgeAt=loader.indexOf("student-coaching-runtime.js?v=1.2.5");
  const linkAt=loader.indexOf("student-coach-link.js?v=1.0.0");
  const programAt=loader.indexOf("student-program-share-v2.js?v=3.4.0");
  const authAt=loader.indexOf("auth-session-runtime.js?v=1.6.0");
  assert.ok(bridgeAt>=0&&linkAt>bridgeAt&&programAt>linkAt&&authAt>programAt);
});

test("öğrenci koç paylaşımı yalnız güvenli coachingShares görünümünü günceller",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/coachingShares/);
  assert.match(runtime,/const payload=sharePayload\(s,rt\.user\)/);
  assert.match(runtime,/const ref=doc\(rt\.db,"coachingShares",rt\.user\.uid\)/);
  assert.match(runtime,/await setDoc\(ref,payload,\{merge:true\}\)/);
  assert.doesNotMatch(runtime,/collection\(rt\.db,"users"/);
  assert.doesNotMatch(runtime,/program:\{weeks\}/);
});

test("koç paylaşımı yazma sürerken gelen son öğrenci değişikliğini tekrar yayınlar",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/sharing:false,pending:false/);
  assert.match(runtime,/if\(rt\.sharing\)\{rt\.pending=true;return\}/);
  assert.match(runtime,/rt\.sharing=false;\s*if\(rt\.pending\)\{rt\.pending=false;scheduleShare\(120\)\}/);
  assert.match(runtime,/rt\.shareTimer=null;clearInterval\(rt\.shareInterval\);rt\.shareInterval=null;rt\.sharing=false;rt\.pending=false/);
});

test("Programım paylaşımı öğrenci köprüsünde tam yapıyı korur",()=>{
  const runtime=read("public/student-program-share-v2.js");
  for(const token of["PROGRAM_VERSION=3","MAX_PROGRAM_WEEKS=80","rowLabels","rows","weeks","done","dn","mv","coachingShares"])assert.ok(runtime.includes(token),token);
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


test("Programım v3 koç aynası için değişiklikleri canlı ve tekrarsız yayınlar",()=>{
  const runtime=read("public/student-program-share-v2.js");
  for(const token of["PROGRAM_VERSION=3","syncedAt:Date.now()","payloadHash","lastHash","studentProgramSync=\"v3\""])assert.ok(runtime.includes(token),token);
  assert.match(runtime,/if\(hash&&hash===rt\.lastHash\)return/);
  assert.match(runtime,/rt\.lastHash=hash/);
});


test("Programım paylaşımı yerel değişiklikleri event olmasa da izler",()=>{
  const runtime=read("public/student-program-share-v2.js");
  for(const token of["watchLocalProgram","setInterval(watchLocalProgram,1500)","localProgramHash","version:\"3.4.0\""])assert.ok(runtime.includes(token),token);
  assert.match(runtime,/remoteHash!==currentHash/);
});


test("Ana koç paylaşımı Programım verisini doğrudan taşır",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  for(const token of["buildProgramShare","program:buildProgramShare(s)","version:3","rowLabels","weeks"])assert.ok(runtime.includes(token),token);
  assert.match(runtime,/programWeekHasData/);
  assert.match(runtime,/cleanProgramMatrix/);
});


test("Koç eşitleme runtime web ve native açılışta garanti edilir ve save sinyali üretir",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  const loader=read("src/ui/student-account-loader.ts");
  const runtime=read("public/student-coaching-runtime.js");
  const app=read("app.js");
  assert.match(shell,/import\("\.\/student-account-loader"\)/);
  assert.match(shell,/installStudentAccountLoader\(\)/);
  assert.match(shell,/const native=isNativeApp\(\)/);
  assert.match(loader,/student-coaching-runtime\.js\?v=1\.2\.5/);
  assert.match(runtime,/version:\"1\.2\.5\"/);
  assert.match(app,/CustomEvent\(\"yks:data-changed\"/);
  assert.match(app,/source:\"save\"/);
});


test("Program paylaşımı coachingShares yoksa tam güvenli belge oluşturur",()=>{
  const runtime=read("public/student-program-share-v2.js");
  assert.match(runtime,/bootstrapSharePayload/);
  assert.match(runtime,/writeProgramShare/);
  assert.match(runtime,/setDoc\(ref,\{program,updatedAt:serverTimestamp\(\)\},\{merge:true\}\)/);
  assert.match(runtime,/setDoc\(ref,bootstrapSharePayload\(program\)\)/);
  assert.match(runtime,/profile:\{name,track:"",targetNetTYT:0,targetNetAYT:0,targetUniversity:"",targetDepartment:""\}/);
});


test("koç paylaşımı eski coachingShares belgesini güvenli tam yazımla onarır ve periyodik yeniler",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/await setDoc\(ref,payload,\{merge:true\}\)/);
  assert.match(runtime,/await setDoc\(ref,payload\)/);
  assert.match(runtime,/scheduleShare\(5000\)/);
  assert.match(runtime,/setInterval\(\(\)=>scheduleShare\(120\),60000\)/);
  assert.match(runtime,/clearInterval\(rt\.shareInterval\)/);
});
