const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("normal giriş yeni hesapları yalnız öğrenci olarak oluşturur",()=>{
  const loader=read("src/ui/coach-account-loader.ts"),auth=read("public/auth-session-runtime.js");
  assert.match(loader,/sessionStorage\.setItem\(PENDING_ROLE,"student"\)/);
  assert.match(loader,/sessionStorage\.removeItem\(PENDING_COACH\)/);
  assert.match(loader,/publicRegistration="student-only"/);
  assert.match(auth,/yeni hesaplar Öğrenci hesabıdır/);
  assert.match(auth,/özel, tek kullanımlık koç davet bağlantısıyla/);
});

test("koç kaydı ayrı sayfada 24 karakterlik davetle transaction içinde yapılır",()=>{
  const html=read("public/coach-register.html"),script=read("public/coach-register.js");
  assert.match(html,/Özel koç daveti/);
  assert.match(script,/coachRegistrationInvites/);
  assert.match(script,/\^\[A-Z2-9\]\{24\}\$/);
  assert.match(script,/runTransaction/);
  assert.match(script,/role:"coach"/);
  assert.match(script,/registrationInvite:invite/);
  assert.match(script,/status:"used"/);
});

test("Firestore normal kullanıcıya koç rolü vermez; koç rolü yalnız önceden açılmış tek kullanımlık davetle oluşturulur",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/function validCoachRegistrationInvite/);
  assert.match(rules,/match \/coachRegistrationInvites\/\{inviteCode\}/);
  assert.match(rules,/allow list, create, delete: if false/);
  assert.match(rules,/request\.resource\.data\.role == 'student'/);
  assert.match(rules,/request\.resource\.data\.role == 'coach'/);
  assert.match(rules,/validCoachRegistrationInvite\(userId, request\.resource\.data\.registrationInvite\)/);
  assert.match(rules,/after\.usedBy == userId/);
});

test("davet yardımcı sayfası yalnız kod ve paylaşım linki üretir; yetkiyi Firebase belgesi belirler",()=>{
  const html=read("public/coach-invites.html");
  assert.match(html,/coachRegistrationInvites/);
  assert.match(html,/Firebase Console/);
  assert.match(html,/crypto\.getRandomValues/);
  assert.match(html,/coach-register\.html/);
  assert.doesNotMatch(html,/firebase-firestore\.js/);
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

test("öğrenci-koç eşleşmesi 10 karakterlik 24 saatlik tek kullanımlık kodla transaction içinde kurulur",()=>{
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
