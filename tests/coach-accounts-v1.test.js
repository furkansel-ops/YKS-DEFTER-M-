const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("kayıt ekranı öğrenci ve koç rolünü ayrı hesap türü olarak sunar",()=>{
  const runtime=read("public/coach-account-runtime.js");
  assert.match(runtime,/data-role="student"/);
  assert.match(runtime,/data-role="coach"/);
  assert.match(runtime,/Öğrenci/);
  assert.match(runtime,/Koç/);
  assert.match(runtime,/COACH_PROFILE_PENDING_KEY/);
  assert.match(runtime,/coachTitle/);
  assert.match(runtime,/specialization/);
});

test("mevcut bulut hesabı otomatik öğrenci olarak korunur ve hesap rolü değiştirilemez",()=>{
  const runtime=read("public/coach-account-runtime.js");
  const rules=read("firestore.rules");
  assert.match(runtime,/users",user\.uid,"sync","meta/);
  assert.match(runtime,/if\(!oldMeta\.exists\(\)\)role=/);
  assert.match(rules,/request\.resource\.data\.role == resource\.data\.role/);
});

test("koç ham öğrenci sync verisine değil coachingShares görünümüne erişir",()=>{
  const runtime=read("public/coach-account-runtime.js");
  assert.match(runtime,/coachingShares/);
  assert.match(runtime,/program:\{weeks:programWeeks\}/);
  assert.match(runtime,/paragraphProblem:\{entries:pp\}/);
  assert.match(runtime,/errorJournal:wrong/);
  assert.doesNotMatch(runtime,/collection\(runtime\.db,"users"/);
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
  assert.match(vite,/account&&account\.role===\"coach\"/);
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
