const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Firestore kuralları yalnız oturum açan kullanıcıya kendi eşitleme alanını açar",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/rules_version\s*=\s*'2'/);
  assert.match(rules,/request\.auth\s*!=\s*null/);
  assert.match(rules,/request\.auth\.uid\s*==\s*uid/);
  assert.match(rules,/request\.auth\.token\.email_verified\s*==\s*true/);
  assert.match(rules,/match\s+\/users\/\{uid\}\/sync\/meta/);
  assert.match(rules,/data\.format\s*==\s*4/);
  assert.match(rules,/match\s+\/users\/\{uid\}\/chunks\/\{chunkId\}/);
  assert.match(rules,/function\s+currentMeta\(uid\)/);
  assert.match(rules,/allow\s+read:\s*if\s+ownsUserSpace\(uid\)/);
  assert.match(rules,/allow\s+delete:[\s\S]*currentMeta\(uid\)\.get\('deleted',\s*false\)\s*==\s*true/);
  assert.match(rules,/resource\.data\.revision\s*<\s*currentMeta\(uid\)\.revision\s*-\s*2/);
  assert.match(rules,/allow\s+create,\s*update:[\s\S]*validChunk\(uid\)/);
  assert.match(rules,/match\s+\/users\/\{uid\}\/\{document=\*\*\}[\s\S]*allow\s+read,\s*write:\s*if\s+false/);
  assert.match(rules,/match\s+\/\{document=\*\*\}[\s\S]*allow\s+read,\s*write:\s*if\s+false/);
  assert.doesNotMatch(rules,/allow\s+read,\s*write:\s*if\s+true/);
});

test("Bulut kuralları alan sınırlarını, atomik parçaları ve tek yönlü silme tamamlamasını korur",()=>{
  const rules=read("firestore.rules");
  for(const marker of [
    "data.keys().hasOnly", "data.count <= 32", "data.hash.size() <= 64",
    "data.clientId.size() <= 80", "data.appVersion.size() <= 32", "data.schemaVersion <= 100",
    "data.data.size() <= 280000", "data.index < 32", "data.index < meta.count",
    "getAfter(", "meta.revision == data.revision", "currentMeta(uid).revision < data.revision",
    "request.resource.data.revision > resource.data.revision",
    "affectedKeys().hasOnly(['cleanupPending', 'updatedAt'])",
    "resource.data.get('cleanupPending', false) == true",
    "request.resource.data.cleanupPending == false"
  ])assert.ok(rules.includes(marker),marker);
  const metaRules=rules.split("match /users/{uid}/sync/meta {")[1].split("match /users/{uid}/chunks/{chunkId}")[0];
  assert.doesNotMatch(metaRules,/allow\s+delete/);
});

test("Firebase yapılandırması sürümlenen Firestore kuralını kullanır",()=>{
  const config=JSON.parse(read("firebase.json"));
  assert.equal(config.firestore?.rules,"firestore.rules");
});

test("Gizlilik politikası tüm cihazlarda isteğe bağlı eşitlemeyi ve hesap sınırını açıklar",()=>{
  const privacy=read("privacy.html");
  for(const marker of [
    "rastgele oluşturulan cihaz istemci kimliği",
    "kayıt sürümü (revision)",
    "veri şeması",
    "güncelleme zamanı",
    "çalışma içeriği taşımayan içeriksiz bir silme işareti",
    "hesap değiştirmek için kullanıcı önce cihaz verilerini silmelidir"
  ])assert.ok(privacy.toLocaleLowerCase("tr").includes(marker.toLocaleLowerCase("tr")),marker);
  assert.match(privacy,/kalıcı kaydetmek, yedeklemek veya eşitlemek için doğrulanmış bir hesapla giriş gerekir/);
  assert.match(privacy,/Deneme modunda eski çalışma kayıtları açılmaz, değiştirilmez, yedeklenmez veya buluta gönderilmez/);
  assert.match(privacy,/E-posta adresi doğrulanmadan çalışma verileri eşitlenmez/);
  assert.match(privacy,/aynı hesap kimliğini ve bulut kaydını kullanır/);
});
