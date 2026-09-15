const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const profile=()=>fs.readFileSync(path.join(root,'src/ui/onboarding-profile-v45.ts'),'utf8');
const main=()=>fs.readFileSync(path.join(root,'src/main.ts'),'utf8');

test('Yeni kayıt akışı sınav tarihi ve günlük soru hedefi sormadan hedef profili toplar',()=>{
  const s=profile();
  assert.match(s,/Ad Soyad/);assert.match(s,/Alan \/ puan türü/);assert.match(s,/TYT hedef neti/);assert.match(s,/AYT hedef neti/);assert.match(s,/Hedef üniversite \/ okul/);assert.match(s,/Hedef bölüm/);
  assert.match(s,/id=\\?"wizTytNet/);assert.match(s,/id=\\?"wizAytNet/);assert.match(s,/id=\\?"wizUniversity/);assert.match(s,/id=\\?"wizDepartment/);
  assert.doesNotMatch(s,/<label>Sınav tarihi<\/label>/);assert.doesNotMatch(s,/<label>Günlük soru hedefi<\/label>/);
});

test('2027 YKS tarihleri sabittir ve eski tek net hedefi TYT hedefine taşınır',()=>{
  const s=profile();
  assert.match(s,/TYT_DATE="2027-06-19"/);assert.match(s,/19 Haziran 2027 Cumartesi 10:15/);assert.match(s,/20 Haziran 2027 Pazar 10:15/);assert.match(s,/20 Haziran 2027 Pazar 15:45/);
  assert.match(s,/s\.targetNetTYT==null/);assert.match(s,/s\.targetNetTYT=num\(s\.targetNet,120\)/);assert.match(s,/s\.targetNet=s\.targetNetTYT/);
  assert.match(s,/blankNewUser\(s\).*Number\(s\.target\|\|0\)===150/);
});

test('Profil katmanı Vite başlangıcında fail-open kurulur',()=>{
  const s=main();
  assert.match(s,/installOnboardingProfileV45/);assert.match(s,/installOptional\("onboarding-profile"/);assert.match(s,/dataset\.onboardingProfileRuntime/);
});
