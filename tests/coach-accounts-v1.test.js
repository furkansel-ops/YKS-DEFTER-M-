const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("normal uygulama kaydı yeni hesapları yalnız öğrenci olarak oluşturur; başlangıç giriş ekranına bağlı değildir",()=>{
  const loader=read("src/ui/coach-account-loader.ts"),auth=read("public/auth-session-runtime.js");
  assert.match(loader,/sessionStorage\.setItem\(PENDING_ROLE,"student"\)/);
  assert.match(loader,/sessionStorage\.removeItem\(PENDING_COACH\)/);
  assert.match(loader,/publicRegistration="student-only"/);
  assert.match(auth,/sessionGate:"removed"/);
  assert.doesNotMatch(auth,/Hesabına giriş yap|Beni hatırla/);
});

test("koç kaydı ayrı sayfada davet kodu istemeden doğrulanmış Google hesabıyla yapılır",()=>{
  const html=read("public/coach-register.html"),script=read("public/coach-register.js");
  assert.match(html,/Koç hesabını oluştur/);
  assert.match(html,/Ayrı bir davet koduna ihtiyacın yok/);
  assert.match(script,/emailVerified/);
  assert.match(script,/runTransaction/);
  assert.match(script,/role:"coach"/);
  assert.match(script,/accountProfiles/);
  assert.doesNotMatch(script,/coachRegistrationInvites/);
  assert.doesNotMatch(script,/registrationInvite:invite/);
  assert.doesNotMatch(script,/URLSearchParams/);
});

test("Firestore doğrulanmış kullanıcının kendi yeni profilini öğrenci veya koç olarak oluşturmasına izin verir; rol sonradan değiştirilemez",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/match \/accountProfiles\/\{userId\}/);
  assert.match(rules,/allow create: if ownsUserSpace\(userId\)/);
  assert.match(rules,/validAccountRole/);
  assert.match(rules,/!request\.resource\.data\.keys\(\)\.hasAny\(\['registrationInvite'\]\)/);
  assert.match(rules,/request\.resource\.data\.role == resource\.data\.role/);
  assert.match(rules,/allow list: if false/);
});

test("eski koç davet yardımcı adresi artık doğrudan normal koç kayıt sayfasına yönlendirir",()=>{
  const html=read("public/coach-invites.html");
  assert.match(html,/coach-register\.html/);
  assert.match(html,/Artık davet kodu gerekmiyor/);
  assert.doesNotMatch(html,/Firebase Console/);
  assert.doesNotMatch(html,/crypto\.getRandomValues/);
});

test("mevcut bulut hesabı otomatik öğrenci olarak korunur ve hesap rolü değiştirilemez",()=>{
  const runtime=read("public/coach-account-runtime.js");
  const rules=read("firestore.rules");
  assert.match(runtime,/users",user\.uid,"sync","meta/);
  assert.match(runtime,/if\(!old\.exists\(\)\)role=/);
  assert.match(rules,/request\.resource\.data\.role == resource\.data\.role/);
  assert.match(rules,/registrationInvite', ''\) == resource\.data\.get\('registrationInvite', ''\)/);
});

test("koç ham öğrenci sync verisine değil coachingShares görünümüne erişir",()=>{
  const runtime=read("public/coach-account-runtime.js");
  assert.match(runtime,/coachingShares/);
  assert.match(runtime,/program:\{weeks\}/);
  assert.match(runtime,/paragraphProblem:\{entries:pp\}/);
  assert.match(runtime,/errorJournal:errors/);
  assert.doesNotMatch(runtime,/collection\(rt\.db,"users"/);
});

test("koç müdahaleleri doğrudan veri yazmak yerine dört kontrollü action tipini kullanır",()=>{
  const runtime=read("public/coach-account-runtime.js");
  for(const type of ["program_task","topic_deadline","coach_note","post_exam_task"])assert.ok(runtime.includes(type),type);
  assert.match(runtime,/coachingActions/);
  assert.match(runtime,/status:"pending"/);
  assert.match(runtime,/status:"applied"/);
  assert.match(runtime,/status:"rejected"/);
});

test("eski öğrenci-koç eşleşme modeli geriye uyumluluk için korunur",()=>{
  const runtime=read("public/coach-account-runtime.js");
  assert.match(runtime,/A-Z2-9/);
  assert.match(runtime,/24\*60\*60\*1000/);
  assert.match(runtime,/runTransaction/);
  assert.match(runtime,/coachInvites/);
  assert.match(runtime,/coachingLinks/);
  assert.match(runtime,/status:"claimed"/);
});

test("koç hesabı normal öğrenci bulut snapshot zincirini başlatmaz",()=>{
  const vite=read("vite.config.mts");
  assert.match(vite,/YKSAccountAuth/);
  assert.match(vite,/account&&account\.role/);
  assert.match(vite,/user=null;status\(\"Koç hesabı\"/);
  assert.match(vite,/await waitAccountRuntime\(\)/);
});

test("öğrenci verisi değiştiğinde koç görünümü yeniden yayınlanabilir",()=>{
  const bridge=read("src/data/legacy-data-bridge.ts");
  const runtime=read("public/coach-account-runtime.js");
  assert.match(bridge,/yks:data-changed/);
  assert.match(runtime,/addEventListener\("yks:data-changed"/);
  assert.match(runtime,/publishShare/);
});
