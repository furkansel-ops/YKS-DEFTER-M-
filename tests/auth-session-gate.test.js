const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("uygulama açılışında giriş kapısı vardır; aynı oturum ve Beni hatırla geçiş sağlar",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/YKS Defterim/);
  assert.match(runtime,/Hesabına giriş yap/);
  assert.match(runtime,/Beni hatırla/);
  assert.match(runtime,/yks_auth_remember_v1/);
  assert.match(runtime,/if\(remembered\(\)\|\|isActive\(\)\)hideGate\(\);else showGate\(\)/);
  assert.match(runtime,/dataset\.authSessionGate="ready"/);
  assert.doesNotMatch(runtime,/AUTH_GATE_REQUIRED=false/);
});

test("Beni hatırla kapalı olsa bile başarılı manuel giriş aynı oturumda yeniden giriş istemez",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/const sessionAuthorized=isActive\(\)/);
  assert.match(runtime,/!remembered\(\)&&!sessionAuthorized/);
  assert.match(runtime,/currentUser=args\.user;currentAccount=result;if\(remembered\(\)\)setActive\(false\);hideGate\(\)/);
  assert.doesNotMatch(runtime,/currentUser=args\.user;currentAccount=result;setActive\(false\);hideGate\(\)/);
  assert.match(runtime,/sessionGate:"fixed"/);
});

test("Beni hatırla kapalıysa Firebase session persistence kullanılır ve yeni oturum reauth ister",()=>{
  const runtime=read("public/auth-session-runtime.js");
  const vite=read("vite.config.mts");
  assert.match(runtime,/browserSessionPersistence/);
  assert.match(runtime,/useRemember\?ctx\.browserLocalPersistence:browserSessionPersistence/);
  assert.match(runtime,/signOut\(args\.auth\)/);
  assert.match(runtime,/role:"reauth"/);
  assert.match(vite,/account&&account\.role===\"reauth\"/);
});

test("Beni hatırla açıkken local persistence korunur",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/localStorage\.setItem\(REMEMBER_KEY,"1"\)/);
  assert.match(runtime,/if\(remembered\(\)\)setActive\(false\)/);
});

test("Ayarlar hesap kartında Çıkış yap bulunur ve remember ile oturum işareti temizlenir",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/yksAccountSettingsCard/);
  assert.match(runtime,/Çıkış yap/);
  assert.match(runtime,/setRemember\(false\);setActive\(false\)/);
  assert.match(runtime,/cloudLogoutBtn/);
});

test("normal kayıt öğrenci-only kalır ve auth runtime cache bust ile yüklenir",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  assert.match(loader,/sessionStorage\.setItem\(PENDING_ROLE,"student"\)/);
  assert.match(loader,/sessionStorage\.removeItem\(PENDING_COACH\)/);
  assert.match(loader,/publicRegistration="student-only"/);
  assert.match(loader,/auth-session-runtime\.js\?v=1\.3\.0/);
  assert.match(loader,/__YKS_ACCOUNT_READY__/);
});

test("Firebase production retry sözleşmesi dist hardener ile uyumludur",()=>{
  const vite=read("vite.config.mts");
  assert.match(vite,/syncRetryCount=Math\.min\(9,syncRetryCount\+1\)/);
  assert.doesNotMatch(vite,/syncRetryCount=Math\.min\(9,Math\.max\(0,syncRetryCount\)\+1\)/);
});
