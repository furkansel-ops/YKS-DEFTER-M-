const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("öğrenci ayarlarında kalıcı Koç Kodum kartı kurulur",()=>{
  const runtime=read("public/coach-student-directory-v2.js");
  assert.match(runtime,/studentCoachCodeSettings/);
  assert.match(runtime,/Koç Kodum/);
  assert.match(runtime,/document\.getElementById\("mrp_ayar"\)/);
  assert.match(runtime,/Koç kodu oluştur/);
  assert.match(runtime,/Kodu yenile/);
  assert.match(runtime,/Kodu kopyala/);
});

test("öğrenci kodu 12 karakterlik tekrar kullanılabilir kriptografik koddur",()=>{
  const runtime=read("public/coach-student-directory-v2.js");
  assert.match(runtime,/CODE_LENGTH=12/);
  assert.match(runtime,/\^\[A-Z2-9\]\{12\}\$/);
  assert.match(runtime,/crypto\.getRandomValues/);
  assert.match(runtime,/studentCoachAccess/);
  assert.match(runtime,/studentCoachCodes/);
  assert.doesNotMatch(runtime,/expiresAt/);
  assert.doesNotMatch(runtime,/status:\s*["']claimed["']/);
});

test("yeni öğrenci kodu oluşturulurken rastgele aday belge önceden okunmaz",()=>{
  const runtime=read("public/coach-student-directory-v2.js");
  assert.match(runtime,/const candidateRef=doc\(state\.db,CODE_COLLECTION,candidate\)/);
  assert.doesNotMatch(runtime,/candidateSnap=await tx\.get\(candidateRef\)/);
  assert.match(runtime,/tx\.set\(candidateRef,\{code:candidate,studentUid:state\.user\.uid,active:true/);
  assert.match(runtime,/permission-denied/);
});

test("kod yenileme eski öğrenci kodunu dizinden kaldırır ama mevcut koç bağlantısını silmez",()=>{
  const runtime=read("public/coach-student-directory-v2.js");
  assert.match(runtime,/tx\.delete\(oldRef\)/);
  assert.match(runtime,/Mevcut bağlı koçların bağlantısı devam eder/);
  assert.doesNotMatch(runtime,/deleteDoc\(doc\(state\.db,LINK_COLLECTION/);
});

test("koç paneli Öğrencilerim alanında kalıcı öğrenci koduyla öğrenci ekler",()=>{
  const runtime=read("public/coach-student-directory-v2.js");
  assert.match(runtime,/Öğrencilerim/);
  assert.match(runtime,/Öğrenci ekle/);
  assert.match(runtime,/XXXX-XXXX-XXXX/);
  assert.match(runtime,/addStudentByCode/);
  assert.match(runtime,/accessCode/);
  assert.match(runtime,/coachingLinks/);
});

test("yeni koç dizini eski hesap runtimeından sonra ve auth başlamadan önce yüklenir",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  const coachAt=loader.indexOf("coach-account-runtime.js?v=1.0.0");
  const directoryAt=loader.indexOf("coach-student-directory-v2.js?v=2.0.1");
  const authAt=loader.indexOf("auth-session-runtime.js?v=1.6.0");
  assert.ok(coachAt>=0&&directoryAt>coachAt&&authAt>directoryAt);
  assert.match(loader,/COACH_DIRECTORY_SCRIPT_ID/);
  assert.match(read("public/coach-student-directory-v2.js"),/version:"2\.0\.1"/);
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

test("bağlantısı kesilmiş öğrenci aynı kalıcı kodla tekrar eklenebilir",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/resource\.data\.active == false/);
  assert.match(rules,/request\.resource\.data\.active == true/);
  assert.match(rules,/hasOnly\(\['active', 'accessCode', 'updatedAt'\]\)/);
  assert.match(rules,/reusableStudentCodeMatches\([\s\S]*resource\.data\.studentUid/);
});
