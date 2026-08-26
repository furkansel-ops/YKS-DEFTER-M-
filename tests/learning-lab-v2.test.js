const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('Öğrenme Laboratuvarı v2 Türkçe, periyodik, tarih ve ders atlasını paketler',()=>{
  const file=path.join(root,'modules/learning-lab-v2.js');
  assert.equal(fs.existsSync(file),true);
  const s=fs.readFileSync(file,'utf8'),stability=fs.readFileSync(path.join(root,'modules/stability.js'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  assert.match(s,/const WORDS=\[/);assert.match(s,/yadsımak/);assert.match(s,/kanıksamak/);assert.match(s,/PARAGRAPH_TIPS/);assert.match(s,/Ana düşünce/);assert.match(s,/Cümle yerleştirme/);
  assert.match(s,/fetchElementMedia/);assert.match(s,/w\/api\.php/);assert.match(s,/Wikimedia/);assert.match(s,/Periyodik eğilim/);
  assert.match(s,/ERA_CARDS/);assert.match(s,/Milli Mücadele/);assert.match(s,/DEEP_DIVES/);assert.match(s,/Kalp/);assert.match(s,/Böbrek/);assert.match(s,/Dalak/);assert.match(s,/Fizik/);assert.match(s,/Kimya/);
  assert.match(s,/YKSTopicGuides/);assert.match(s,/curriculum/);assert.match(stability,/learning-lab-v2\.js\?v=4\.1\.0-r20/);assert.match(sw,/learning-lab-v2\.js\?v=4\.1\.0-r20/);
});
// Normal kullanıcı push'u CI ve Vite Pages hattını son kez tetiklemek için tutulur.
