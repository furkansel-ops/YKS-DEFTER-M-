const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

test('Öğrenme Laboratuvarı v3 paragraf aracını kaldırır ve üç ana aracı kurar',()=>{
  const file=path.join(root,'modules/learning-lab-v3.js');
  assert.equal(fs.existsSync(file),true);
  const s=fs.readFileSync(file,'utf8');
  const stability=fs.readFileSync(path.join(root,'modules/stability.js'),'utf8');
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  assert.match(s,/v320TabParagraph/);
  assert.match(s,/v320PanelParagraph/);
  assert.match(s,/\.remove\(\)/);
  assert.match(s,/Periyodik Tablo/);
  assert.match(s,/Kronoloji/);
  assert.match(s,/Bilim Kartları/);
  assert.match(s,/Biyoloji/);
  assert.match(s,/Fizik/);
  assert.match(s,/deepDives/);
  assert.match(s,/Sık hata/);
  assert.match(s,/YKS taktiği/);
  assert.match(stability,/learning-lab-v3\.js\?v=4\.1\.0-r21/);
  assert.match(sw,/learning-lab-v3\.js\?v=4\.1\.0-r21/);
  assert.match(sw,/yks-core-v4\.1\.0-r21/);
});
