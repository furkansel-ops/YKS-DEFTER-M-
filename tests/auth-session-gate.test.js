const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("uygulama açılışında giriş kapısı ve Beni hatırla seçeneği vardır",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/YKS Defterim/);
  assert.match(runtime,/Hesabına giriş yap/);
  assert.match(runtime,/Beni hatırla/);
  assert.match(runtime,/yks_auth_remember_v1/);
  assert.match(runtime,/showGate\(\)/);
});

test("Beni hatırla kapalıysa Firebase session persistence kullanılır ve sonraki açılış reauth ister",()=>{
  const runtime=read("public/auth-session-runtime.js");
  const vite=read("vite.config.mts");
  assert.match(runtime,/browserSessionPersistence/);
  assert.match(runtime,/!remembered\(\)&&!manual/);
  assert.match(runtime,/signOut\(args\.auth\)/);
  assert.match(runtime,/role:"reauth"/);
  assert.match(vite,/account&&account\.role===\"reauth\"/);
  assert.match(vite,/Giriş gerekli/);
});

test("Beni hatırla açıkken local persistence korunur",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/useRemember\?ctx\.browserLocalPersistence:browserSessionPersistence/);
  assert.match(runtime,/localStorage\.setItem\(REMEMBER_KEY,"1"\)/);
});

test("Ayarlar hesap kartında Çıkış yap bulunur ve remember durumu temizlenir",()=>{
  const runtime=read("public/auth-session-runtime.js");
  assert.match(runtime,/yksAccountSettingsCard/);
  assert.match(runtime,/Çıkış yap/);
  assert.match(runtime,/setRemember\(false\)/);
  assert.match(runtime,/cloudLogoutBtn/);
});

test("koç ve auth oturum runtime'ları Firebase başlamadan önce sırayla yüklenir",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  assert.match(loader,/coach-account-runtime\.js/);
  assert.match(loader,/auth-session-runtime\.js/);
  assert.match(loader,/__YKS_ACCOUNT_READY__/);
});

test("Firebase production retry sözleşmesi dist hardener ile uyumludur",()=>{
  const vite=read("vite.config.mts");
  assert.match(vite,/syncRetryCount=Math\.min\(9,syncRetryCount\+1\)/);
  assert.doesNotMatch(vite,/syncRetryCount=Math\.min\(9,Math\.max\(0,syncRetryCount\)\+1\)/);
});
