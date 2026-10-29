const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const page=read("src/ui/profile-page-v62.ts");
const rules=read("firestore.rules");
const block=name=>rules.slice(rules.indexOf(`match /${name}/`),rules.indexOf("\n    }\n",rules.indexOf(`match /${name}/`)));

test("v62 profil sayfası startup-extras köprüsünde fail-open yüklenir ve profil simgesini devralır",()=>{
  const extras=read("src/ui/startup-extras.ts");
  assert.match(extras,/import\("\.\/profile-page-v62"\)/);
  assert.doesNotMatch(read("src/main.ts"),/profile-page-v62/);
  assert.match(page,/closest\?\.\("#refinedProfile"\)/);
  assert.match(page,/event\.stopImmediatePropagation\(\)/);
  assert.match(page,/data-action="settings"|row\("settings"/);
});

test("v62 hesap silme önce kimlik doğrular, veriye sonra dokunur, hesabı en son siler",()=>{
  const run=page.slice(page.indexOf("const runDelete"),page.indexOf("const open=async"));
  const reauth=run.indexOf("reauthenticateWith"),data=run.indexOf("deleteCloudData("),remove=run.indexOf("deleteUser(");
  assert.ok(reauth>0&&data>reauth&&remove>data,"sıra: yeniden doğrulama → bulut verisi → hesap");
  assert.doesNotMatch(page,/localStorage\.clear|Dexie\.delete|indexedDB\.deleteDatabase/);
});

test("v62 bulut silme mevcut tombstone protokolünü ve profil-önce sırasını kullanır",()=>{
  const cloud=page.slice(page.indexOf("async function deleteCloudData"),page.indexOf("export function installProfilePageV62"));
  assert.ok(cloud.indexOf('"accountProfiles"')<cloud.indexOf('"coachingShares"'),"profil paylaşımdan önce silinir");
  assert.match(cloud,/deleted:true,cleanupPending:true,deletedAt:fs\.serverTimestamp\(\),updatedAt:fs\.serverTimestamp\(\),count:0,hash:"",revision:Number\(meta\.revision\)\+1/);
  assert.match(cloud,/cleanupPending:false,updatedAt:fs\.serverTimestamp\(\)/);
  assert.doesNotMatch(cloud,/deleteDoc\(metaRef\)/);
  assert.match(cloud,/active:false,endedAt:fs\.serverTimestamp\(\),updatedAt:fs\.serverTimestamp\(\)/);
});

test("kurallar: kişi yalnız kendi profilini; öğrenci ya da koç kendi görev ve mesajlarını silebilir; meta ve bağlantı silinemez",()=>{
  const ownerDelete=/allow delete: if verifiedUser\(\)\s*&& \(request\.auth\.uid == resource\.data\.studentUid\s*\|\| request\.auth\.uid == resource\.data\.coachUid\);/;
  assert.match(block("accountProfiles"),/allow delete: if ownsUserSpace\(userId\);/);
  assert.match(block("coachingActions"),ownerDelete);
  assert.match(block("coachingMessages"),/allow update: if false;/);
  assert.match(block("coachingMessages"),ownerDelete);
  assert.match(block("coachingLinks"),/allow delete: if false;/);
  const metaAt=rules.indexOf("match /users/{userId}/sync/meta {");
  assert.match(rules.slice(metaAt,rules.indexOf("\n    }\n",metaAt)),/allow delete: if false;/);
});
