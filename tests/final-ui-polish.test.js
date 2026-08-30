const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

test('final tutarlılık cilası form, modal, navigasyon ve erişilebilirliği kapsar',()=>{
  const css=fs.readFileSync(path.join(root,'modules/ui-polish-final-v1.css'),'utf8');
  const study=fs.readFileSync(path.join(root,'modules/study-intelligence-v5.css'),'utf8');
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  assert.match(css,/\.v26-topic-modal/);
  assert.match(css,/\.toast/);
  assert.match(css,/\.tabbar \.tab/);
  assert.match(css,/:is\(input,select,textarea\)/);
  assert.match(css,/focus-visible/);
  assert.match(css,/pointer:coarse/);
  assert.match(css,/data-theme="dark"/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(study,/ui-polish-final-v1\.css\?v=4\.1\.0-r1/);
  assert.match(sw,/ui-polish-final-v1\.css\?v=4\.1\.0-r1/);
  assert.match(sw,/const CACHE="yks-core-v4\.1\.0-r40"/);
});

test('final cila Program mantığını değiştiren bir script değildir',()=>{
  const css=fs.readFileSync(path.join(root,'modules/ui-polish-final-v1.css'),'utf8');
  assert.doesNotMatch(css,/localStorage|indexedDB|Dexie|firebase|program\.push|program\.splice/i);
  assert.match(css,/Yalnızca görsel\/etkileşim katmanı/);
});