const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("öğrenci ayarlarında yalnız Koç Kodum bağlantı kartı kurulur",()=>{
  const runtime=read("public/student-coach-link.js");
  assert.match(runtime,/studentCoachCodeSettings/);
  assert.match(runtime,/Koç Kodum/);
  assert.match(runtime,/document\.getElementById\("mrp_ayar"\)/);
  assert.match(runtime,/Koç kodu oluştur/);
  assert.match(runtime,/Kodu yenile/);
  assert.match(runtime,/Kodu kopyala/);
});

test("öğrenci kodu 12 karakterlik tekrar kullanılabilir kriptografik koddur",()=>{
  const runtime=read("public/student-coach-link.js");
  assert.match(runtime,/CODE_LENGTH=12/);
  assert.match(runtime,/\^\[A-Z2-9\]\{12\}\$/);
  assert.match(runtime,/crypto\.getRandomValues/);
  assert.match(runtime,/studentCoachAccess/);
  assert.match(runtime,/studentCoachCodes/);
  assert.doesNotMatch(runtime,/expiresAt|status:\s*["']claimed["']/);
});

test("kod yenileme eski kodu kaldırır ama mevcut koç bağlantısını silmez",()=>{
  const runtime=read("public/student-coach-link.js");
  assert.match(runtime,/tx\.delete\(oldRef\)/);
  assert.match(runtime,/Mevcut bağlı koçların bağlantısı devam eder/);
  assert.doesNotMatch(runtime,/deleteDoc\(doc\(state\.db,LINK_COLLECTION/);
});

test("YKS Defterim bağlantı modülünde koç paneli yönetimi bulunmaz",()=>{
  const runtime=read("public/student-coach-link.js");
  assert.doesNotMatch(runtime,/addStudentByCode|enhanceCoachDashboard|Öğrencilerim|Öğrenci ekle|yksCoachDashboard/);
  assert.match(runtime,/Bağlantıyı kes/);
  assert.match(runtime,/ayrı YKS Koç Paneli/);
});

test("öğrenci bağlantı köprüsü auth çalışmadan önce yüklenir",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  const bridgeAt=loader.indexOf("student-coaching-runtime.js?v=1.1.0");
  const linkAt=loader.indexOf("student-coach-link.js?v=1.0.0");
  const authAt=loader.indexOf("auth-session-runtime.js?v=1.6.0");
  assert.ok(bridgeAt>=0&&linkAt>bridgeAt&&authAt>linkAt);
  assert.match(loader,/STUDENT_COACH_LINK_ID/);
});

test("Firestore kalıcı öğrenci kodunu yalnız tam kodla okutur ve listelemeyi kapatır",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/function validStudentCoachCode/);
  assert.ok(rules.includes("accessCode.matches('^[A-Z2-9]{12}$')"));
  assert.match(rules,/match \/studentCoachAccess\/\{studentUid\}/);
  assert.match(rules,/match \/studentCoachCodes\/\{accessCode\}/);
  assert.match(rules,/match \/studentCoachCodes\/\{accessCode\}[\s\S]*allow list: if false/);
  assert.match(rules,/profileRole\(request\.auth\.uid, 'coach'\)/);
});

test("kalıcı kod koçluk linkine dönüşürken öğrenci ham sync verisi kapalı kalır",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/reusableStudentCodeMatches/);
  assert.match(rules,/request\.resource\.data\.keys\(\)\.hasAll\(\['accessCode'\]\)/);
  assert.match(rules,/activeCoachingLink\(studentUid, request\.auth\.uid\)/);
  assert.match(rules,/match \/users\/\{userId\}\/sync\/meta[\s\S]*allow read: if ownsUserSpace\(userId\)/);
  assert.doesNotMatch(rules,/match \/users\/\{userId\}\/sync\/meta[\s\S]{0,240}reusableStudentCodeMatches/);
});
