const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const mod=fs.readFileSync(path.join(root,"modules/progress-v2.js"),"utf8");
const stability=fs.readFileSync(path.join(root,"modules/stability.js"),"utf8");

test("İlerleme v2 7 ve 30 günlük dönemleri önceki eşit dönemle kıyaslar",()=>{
  assert.match(mod,/rangeAgg\(7,0\)/);
  assert.match(mod,/rangeAgg\(7,7\)/);
  assert.match(mod,/rangeAgg\(30,0\)/);
  assert.match(mod,/rangeAgg\(30,30\)/);
  assert.match(mod,/Son 7 gün/);
  assert.match(mod,/Son 30 gün/);
});

test("İlerleme v2 en çok gelişen dersi deneme ders ortalamalarından bulur",()=>{
  assert.match(mod,/function bestImprovingSubject/);
  assert.match(mod,/subjectAverages/);
  assert.match(mod,/Son 30 gün ↔ önceki 30 gün/);
});

test("İlerleme v2 Hata Defteri ile en sık açık hata konusunu bağlar",()=>{
  assert.match(mod,/S&&S\.errorJournal/);
  assert.match(mod,/!x\.resolved/);
  assert.match(mod,/En sık açık hata konusu/);
  assert.match(mod,/S&&S\.wrongLog/);
});

test("çalışma süresi ve net ilişkisi denemeden önceki 7 günlük odakla hesaplanır",()=>{
  assert.match(mod,/function pearson/);
  assert.match(mod,/studyBefore\(examDate\(d\),7\)/);
  assert.match(mod,/Çalışma süresi ↔ deneme neti/);
  assert.match(mod,/İlişki katsayısı/);
});

test("İlerleme v2 kararlı çalışma zamanından yüklenir",()=>{
  assert.match(stability,/progress-v2\.js\?v=4\.1\.0-r20/);
  assert.match(stability,/loadProgressV2/);
});
