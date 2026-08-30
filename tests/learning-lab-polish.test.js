const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

test('Öğrenme Laboratuvarı premium cila ders, fen araçları ve Atlas yüzeylerini kapsar',()=>{
  const cssPath=path.join(root,'modules/ui-polish-learning-lab-v1.css');
  assert.equal(fs.existsSync(cssPath),true);
  const css=fs.readFileSync(cssPath,'utf8');
  const study=fs.readFileSync(path.join(root,'modules/study-intelligence-v5.css'),'utf8');
  assert.match(study,/ui-polish-learning-lab-v1\.css\?v=4\.1\.0-r1/);
  assert.match(css,/#mrp_lab \.v320-course-browser/);
  assert.match(css,/#mrp_lab \.v320-subject-card/);
  assert.match(css,/#mrp_lab \.v4-science-card/);
  assert.match(css,/#mrp_lab \.v320-element-grid/);
  assert.match(css,/#mrp_lab #v320Timeline\.v4-history-timeline/);
  assert.match(css,/#mrp_lab #v320PanelAtlas \.atlas-layout/);
  assert.match(css,/#mrp_lab #v320PanelAtlas \.atlas-model-stage/);
  assert.match(css,/#mrp_lab #v320PanelAtlas \.atlas-structure-list/);
  assert.match(css,/@media \(pointer:coarse\)/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
});

test('Laboratuvar cilası yalnız görünüm katmanıdır',()=>{
  const css=fs.readFileSync(path.join(root,'modules/ui-polish-learning-lab-v1.css'),'utf8');
  assert.doesNotMatch(css,/localStorage|indexedDB|firebase|fetch\(|addEventListener|onclick|S\./i);
  assert.match(css,/veri\/hesap\/3B davranışını değiştirmez/);
});