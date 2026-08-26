const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const mod=fs.readFileSync(path.join(root,"modules/personal-upgrades.js"),"utf8");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");

test("tek kullanıcı katmanı eski koç modunu kesin olarak etkisizleştirir",()=>{
  assert.match(mod,/S\.role!=="ogrenci"/);
  assert.match(mod,/S\.role="ogrenci"/);
  assert.match(mod,/window\.isCoach=function\(\)\{return false;\}/);
  assert.match(mod,/window\.coachBlock=function\(\)\{return false;\}/);
  assert.match(mod,/classList\.remove\("koc","mode-coach"\)/);
});

test("rol seçici ve eski koç arayüzü çalışma anında kaldırılır",()=>{
  assert.match(mod,/\["coachBoard","cnWrap","noteBoxWrap"\]/);
  assert.match(mod,/const seg=\$\("roleSeg"\)/);
  assert.match(mod,/seg\.remove\(\)/);
  assert.match(mod,/Kişisel kullanım · tek kullanıcı/);
  assert.match(mod,/removeAttribute\("data-coach-only"\)/);
});

test("legacy yedek uyumluluğu korunur fakat normal kayıtlar artık koç kipinde bloklanamaz",()=>{
  assert.match(app,/role:"ogrenci",coachNotes:\[\]/);
  assert.match(app,/function coachBlock/);
  assert.match(mod,/window\.coachBlock=function\(\)\{return false;\}/);
  assert.doesNotMatch(mod,/delete S\.coachNotes|S\.coachNotes=\[\]/);
});

test("koç notu çizimleri kişisel çalışma zamanında no-op olur",()=>{
  assert.match(mod,/\["addCoachNote","renderCoachNotes","renderCoachBoard"\]/);
  assert.match(mod,/window\[name\]=function\(\)\{return false;\}/);
});
