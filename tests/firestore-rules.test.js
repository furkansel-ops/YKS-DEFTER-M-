const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Firestore kuralları yalnız oturumdaki kullanıcının kendi senkron alanına erişmesine izin verir",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/rules_version\s*=\s*'2'/);
  assert.match(rules,/request\.auth\s*!=\s*null/);
  assert.match(rules,/request\.auth\.uid\s*==\s*userId/);
  assert.match(rules,/match \/users\/\{userId\}\/sync\/meta/);
  assert.match(rules,/match \/users\/\{userId\}\/chunks\/\{chunkId\}/);
  assert.match(rules,/match \/\{document=\*\*\}[\s\S]*allow read, write: if false/);
  assert.doesNotMatch(rules,/allow\s+read\s*,\s*write\s*:\s*if\s+true/);
});

test("Firebase yapılandırması Firestore kurallarını doğru projeye bağlar",()=>{
  const firebase=JSON.parse(read("firebase.json"));
  const rc=JSON.parse(read(".firebaserc"));
  assert.equal(firebase.firestore.rules,"firestore.rules");
  assert.equal(rc.projects.default,"yks-uygulamam");
});
