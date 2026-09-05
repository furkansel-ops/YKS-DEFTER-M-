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
  assert.match(rules,/match\s+\/users\/\{uid\}\/sync\/meta/);
  assert.match(rules,/request\.resource\.data\.format\s*==\s*4/);
  assert.match(rules,/match\s+\/users\/\{uid\}\/chunks\/\{chunkId\}/);
  assert.match(rules,/function\s+currentMeta\(uid\)/);
  assert.match(rules,/allow\s+read:\s*if\s+ownsUserSpace\(uid\)/);
  assert.match(rules,/allow\s+delete:[\s\S]*currentMeta\(uid\)\.deleted\s*==\s*true/);
  assert.match(rules,/resource\.data\.revision\s*<\s*currentMeta\(uid\)\.revision\s*-\s*2/);
  assert.match(rules,/allow\s+create,\s*update:[\s\S]*request\.resource\.data\.format\s*==\s*4/);
  assert.match(rules,/match\s+\/users\/\{uid\}\/\{document=\*\*\}[\s\S]*allow\s+read,\s*write:\s*if\s+false/);
  assert.match(rules,/match\s+\/\{document=\*\*\}[\s\S]*allow\s+read,\s*write:\s*if\s+false/);
  assert.doesNotMatch(rules,/allow\s+read,\s*write:\s*if\s+true/);
});

test("Firebase yapılandırması sürümlenen Firestore kuralını kullanır",()=>{
  const config=JSON.parse(read("firebase.json"));
  assert.equal(config.firestore?.rules,"firestore.rules");
});

test("Gizlilik politikası web eşitleme metadata bilgisini açıklar ve Android'i yerel tutar",()=>{
  const privacy=read("privacy.html");
  for(const marker of [
    "rastgele oluşturulan cihaz istemci kimliği",
    "kayıt sürümü (revision)",
    "veri şeması",
    "güncelleme zamanı",
    "çalışma içeriği taşımayan içeriksiz bir silme işareti",
    "hesap değiştirmek için kullanıcı önce cihaz verilerini silmelidir"
  ])assert.ok(privacy.includes(marker),marker);
  assert.match(privacy,/Google Play'den dağıtılan Android paketi kullanıcı hesabı oluşturmaz ve çalışma kayıtlarını bir bulut hizmetine göndermez/);
  assert.match(privacy,/Android Play paketi bu çalışma zamanını içermez/);
});
