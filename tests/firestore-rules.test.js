const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Firestore yalnız doğrulanmış oturumdaki kullanıcının kendi senkron alanına erişmesine izin verir",()=>{
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

test("Aktif Firestore v4 meta snapshot güçlü alan sözleşmesi ve SHA-256 ister",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/function validMetaShape/);
  assert.match(rules,/data\.format is int && data\.format == 4/);
  assert.match(rules,/data\.count is int && data\.count >= 0 && data\.count <= 12/);
  assert.match(rules,/data\.clientId\.matches\('\^\[A-Za-z0-9\._:-\]\+\$'\)/);
  assert.match(rules,/data\.appVersion\.matches/);
  assert.ok(rules.includes("data.hash.matches('^[0-9a-f]{64}$')"));
  assert.match(rules,/data\.count >= 1 && data\.count <= 12/);
  assert.match(rules,/request\.resource\.data\.revision == resource\.data\.revision \+ 1/);
  assert.match(rules,/allow delete: if false/);
});

test("Silme tombstone yaşam döngüsü tek yönlü ve cleanup tamamlanmadan reseed kapalıdır",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/function startsDeletion/);
  assert.match(rules,/request\.resource\.data\.cleanupPending == true/);
  assert.match(rules,/request\.resource\.data\.deletedAt == request\.time/);
  assert.match(rules,/function completesDeletion/);
  assert.match(rules,/request\.resource\.data\.cleanupPending == false/);
  assert.match(rules,/hasOnly\(\['cleanupPending', 'updatedAt'\]\)/);
  assert.match(rules,/resource\.data\.get\('cleanupPending', true\) == false/);
});

test("Chunk yalnız aynı transaction içindeki v4 meta snapshot'a bağlanır ve sonradan değiştirilemez",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/function validChunk\(userId, chunkId\)/);
  assert.ok(rules.includes("chunkId.matches('^[0-9]{10}_[0-9]{4}$')"));
  assert.match(rules,/data\.data is string[\s\S]*data\.data\.size\(\) > 0 && data\.data\.size\(\) <= 720000/);
  assert.match(rules,/data\.index is int && data\.index >= 0 && data\.index < 12/);
  assert.match(rules,/let meta = nextMeta\(userId\)/);
  assert.ok(rules.includes("meta.hash.matches('^[0-9a-f]{64}$')"));
  assert.match(rules,/meta\.updatedAt is timestamp && meta\.updatedAt == request\.time/);
  assert.match(rules,/allow create: if ownsUserSpace\(userId\)[\s\S]*validChunk\(userId, chunkId\)/);
  assert.match(rules,/allow update: if false/);
});

test("Eski chunk temizliği yalnız güvenli revizyon aralığında veya tombstone arkasında mümkündür",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/function canDeleteChunk\(userId, chunkId\)/);
  assert.match(rules,/resource\.data\.revision < meta\.revision - 2/);
  assert.match(rules,/meta\.get\('deleted', false\) == true/);
});

test("Firebase yapılandırması Firestore kurallarını doğru projeye bağlar",()=>{
  const firebase=JSON.parse(read("firebase.json"));
  const rc=JSON.parse(read(".firebaserc"));
  assert.equal(firebase.firestore.rules,"firestore.rules");
  assert.equal(rc.projects.default,"yks-uygulamam");
});
