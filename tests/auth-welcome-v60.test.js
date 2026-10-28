const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const welcome=read("src/ui/auth-welcome-v60.ts");

test("v60 karşılama ekranı ayrı chunk ve fail-open sınırında kurulur",()=>{
  // Ana paket bütçesi için yükleme startup-extras köprüsündedir.
  const extras=read("src/ui/startup-extras.ts");
  assert.match(read("src/main.ts"),/import\("\.\/ui\/startup-extras"\)/);
  assert.match(extras,/import\("\.\/auth-welcome-v60"\)/);
  assert.match(extras,/dataset\.authWelcome="deferred"/);
  assert.match(read("vite.config.mts"),/"src\/ui\/auth-welcome-v60\.ts"/);
});

test("v60 native pakette ve önceki bulut kullanıcısında ekranı zorla açmaz",()=>{
  assert.match(welcome,/if\(isNativeApp\(\)\)return \{installed:false,reason:"native"\}/);
  assert.match(welcome,/yks_account_role_hint/);
  assert.match(welcome,/authStateReady/);
  assert.match(welcome,/if\(api\.auth\.currentUser\)store\(ENTRY_KEY,"account"\)/);
});

test("v60 misafir seçimi verilere dokunmadan saklanır ve bant kapatılabilir",()=>{
  assert.match(welcome,/ENTRY_KEY="yks_entry_choice_v1"/);
  assert.match(welcome,/data-guest/);
  assert.match(welcome,/GUEST_BANNER_KEY/);
  assert.doesNotMatch(welcome,/localStorage\.clear|Dexie\.delete|indexedDB\.deleteDatabase/);
});

test("v60 e-posta kaydı doğrulama ister ve doğrulanmamış oturumu kapatır",()=>{
  assert.match(welcome,/createUserWithEmailAndPassword/);
  assert.match(welcome,/sendEmailVerification/);
  assert.match(welcome,/sendPasswordResetEmail/);
  assert.match(welcome,/if\(!credential\.user\.emailVerified\)/);
  assert.match(welcome,/await api\.m\.signOut\(api\.auth\)/);
});

test("doğrulanmamış e-posta hesabı senkron başlatmaz ama zorla çıkış da yapılmaz",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/providerId==="password"\)\)return\{role:"reauth",profile:null\}/);
  assert.match(runtime,/throw new Error\("Doğrulanmış Google hesabı gerekli"\)/);
  assert.match(read("vite.config.mts"),/account\.role==="reauth"/);
});

test("Ayarlar'daki giriş düğmesi karşılama ekranını açar, Google düğmesi korunur",()=>{
  assert.match(welcome,/\[data-account-login\]/);
  assert.match(welcome,/open\("login"\)/);
  assert.match(read("src/ui/play-store-shell.ts"),/id="cloudLoginBtn"/);
});
