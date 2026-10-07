const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('koç kaynak önerisi mevcut güvenli coach_note kanalı üzerinden öğrenciye kaydedilir',()=>{
  const runtime=read('public/student-coaching-runtime.js');
  assert.match(runtime,/a\.type==="coach_note"&&p\.operation==="resource_recommendation"/);
  assert.match(runtime,/s\.coachRecommendations=Array\.isArray\(s\.coachRecommendations\)/);
  assert.match(runtime,/s\.coachRecommendations=s\.coachRecommendations\.slice\(-40\)/);
  assert.match(runtime,/yks:coach-recommendations-changed/);
  assert.match(runtime,/Koçundan yeni video önerisi geldi/);
});

test('Hocalar kütüphanesi koç önerilerini ayrı alanda gösterir',()=>{
  const source=read('src/ui/teachers-v2-library.ts');
  const css=read('src/ui/teachers-v2-library.css');
  assert.match(source,/type CoachRecommendation=/);
  assert.match(source,/function coachRecommendations\(\)/);
  assert.match(source,/Koçundan/);
  assert.match(source,/Önerilen kaynaklar/);
  assert.match(source,/data-library-action="coach-resource"/);
  assert.match(source,/yks:coach-recommendations-changed/);
  assert.match(css,/\.teachers-v2-coach-recs/);
  assert.match(css,/\.teachers-v2-coach-rec-card/);
});

test('Firestore kaynak kodu gelecekte ayrı öneri action tipini de kabul edebilir',()=>{
  const rules=read('firestore.rules');
  assert.match(rules,/resource_recommendation/);
});
