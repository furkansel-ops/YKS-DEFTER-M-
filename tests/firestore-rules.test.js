const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Firestore kuralları yalnız doğrulanmış oturumdaki kullanıcının kendi senkron alanına erişmesine izin verir",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/rules_version\s*=\s*'2'/);
  assert.match(rules,/request\.auth\s*!=\s*null/);
  assert.match(rules,/request\.auth\.uid\s*==\s*userId/);
  assert.match(rules,/request\.auth\.token\.email_verified\s*==\s*true/);
  assert.match(rules,/match \/users\/\{userId\}\/sync\/meta/);
  assert.match(rules,/match \/users\/\{userId\}\/chunks\/\{chunkId\}/);
  assert.match(rules,/match \/\{document=\*\*\}[\s\S]*allow read, write: if false/);
  assert.doesNotMatch(rules,/allow\s+read\s*,\s*write\s*:\s*if\s+true/);
});

test("Firestore v4 protokolü production chunk sınırlarıyla birebir uyumludur",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/data\.format is int && data\.format == 4/);
  assert.match(rules,/data\.count is int && data\.count >= 0 && data\.count <= 12/);
  assert.match(rules,/data\.data is string && data\.data\.size\(\) <= 720000/);
  assert.match(rules,/data\.index is int && data\.index >= 0 && data\.index < 12/);
  assert.match(rules,/let meta = nextMeta\(userId\)/);
  assert.doesNotMatch(rules,/validChunk\([\s\S]*exists\(/);
  assert.match(rules,/allow create: if ownsUserSpace\(userId\) && validChunk\(userId\)/);
  assert.match(rules,/allow update: if false/);
});

test("Firebase yapılandırması Firestore kurallarını doğru projeye bağlar",()=>{
  const firebase=JSON.parse(read("firebase.json"));
  const rc=JSON.parse(read(".firebaserc"));
  assert.equal(firebase.firestore.rules,"firestore.rules");
  assert.equal(rc.projects.default,"yks-uygulamam");
});
