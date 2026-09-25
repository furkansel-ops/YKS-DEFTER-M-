const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("uygulama açılışında giriş kapısı tamamen kaldırılmıştır",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.doesNotMatch(runtime,/Hesabına giriş yap/);
  assert.doesNotMatch(runtime,/Beni hatırla/);
  assert.doesNotMatch(runtime,/className="yas-gate"/);
  assert.doesNotMatch(runtime,/function showGate|function hideGate|function gate\(/);
  assert.match(runtime,/document\.getElementById\("yksAuthGate"\)\?\.remove\(\)/);
  assert.match(runtime,/dataset\.authSessionGate="disabled"/);
  assert.match(runtime,/sessionGate:"removed"/);
});

test("eski giriş kapısının kalıcı ve oturum işaretleri temizlenir",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/localStorage\.removeItem\("yks_auth_remember_v1"\)/);
  assert.match(runtime,/sessionStorage\.removeItem\("yks_auth_active_login_v1"\)/);
  assert.doesNotMatch(runtime,/signOut\(args\.auth\)/);
  assert.doesNotMatch(runtime,/role:"reauth"/);
});

test("hesap altyapısı isteğe bağlı kalır ve giriş çıkış işlemleri görünürdür",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/yksAccountSettingsCard/);
  assert.match(runtime,/Bulut hesabı bağlı değil/);
  assert.match(runtime,/data-account-login/);
  assert.match(runtime,/data-account-logout/);
  assert.match(runtime,/cloudLoginBtn/);
  assert.match(runtime,/cloudLogoutBtn/);
  assert.match(runtime,/base\.onSignedIn/);
  assert.match(runtime,/base\.onSignedOut/);
  assert.doesNotMatch(runtime,/Bulut ve koçluk hesabı/);
});

test("hesap durumu modern ayarlara olayla bildirilir",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/yks:auth-state/);
  assert.match(runtime,/signedIn:Boolean\(currentUser\)/);
  assert.match(runtime,/profileDegraded:currentAccount\?\.degraded===true/);
  assert.match(runtime,/version:"1\.6\.0"/);
});

test("öğrenci profil bootstrap hatası bulut oturumunu düşürmez",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/function profileBootstrapRecoverable/);
  assert.match(runtime,/permission-denied/);
  assert.match(runtime,/failed-precondition/);
  assert.match(runtime,/function fallbackStudentAccount/);
  assert.match(runtime,/role:"student",profile:null,degraded:true/);
  assert.match(runtime,/dataset\.accountProfile="degraded"/);
  assert.match(runtime,/if\(!profileBootstrapRecoverable\(error\)\|\|knownCoachAccount\(\)\)throw error/);
  assert.match(runtime,/currentUser=args\.user/);
});

test("normal kayıt öğrenci-only kalır ve öğrenci köprüleri yeni cache anahtarlarıyla yüklenir",()=>{
  const loader=read("src/ui/student-account-loader.ts");
  assert.match(loader,/sessionStorage\.setItem\(PENDING_ROLE,"student"\)/);
  assert.match(loader,/sessionStorage\.removeItem\(LEGACY_PENDING_COACH\)/);
  assert.match(loader,/publicRegistration="student-only"/);
  assert.match(loader,/student-coaching-runtime\.js\?v=1\.2\.6/);
  assert.match(loader,/student-coach-link\.js\?v=1\.2\.0/);
  assert.doesNotMatch(loader,/coach-account-runtime\.js/);
  assert.match(loader,/auth-session-runtime\.js\?v=1\.6\.0/);
  assert.match(loader,/settings-profile-runtime\.js\?v=2\.6\.0/);
  assert.match(loader,/__YKS_ACCOUNT_READY__/);
});

test("öğrenci uygulaması koç rolü algılasa bile ayrı koç paneline otomatik yönlendirme yapmaz",()=>{
  const loader=read("src/ui/student-account-loader.ts");
  assert.doesNotMatch(loader,/window\.location\.(?:replace|assign)/);
  assert.doesNotMatch(loader,/YKS-DEFTER-M-Ko-Paneli/);
  assert.doesNotMatch(loader,/routeCoachAccountsToStandalonePanel/);
  assert.doesNotMatch(loader,/coachDashboard/);
});

test("Firebase production retry sözleşmesi dist hardener ile uyumludur",()=>{
  const vite=read("vite.config.mts");
  assert.match(vite,/syncRetryCount=Math\.min\(9,syncRetryCount\+1\)/);
  assert.doesNotMatch(vite,/syncRetryCount=Math\.min\(9,Math\.max\(0,syncRetryCount\)\+1\)/);
});
