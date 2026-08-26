const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const app=fs.readFileSync('app.js','utf8');
test('program yazarken haftalık özet her tuşta yeniden çizilmez',()=>{
  assert.match(app,/function programSummarySchedule\(/);
  assert.match(app,/setTimeout\(\(\)=>\{programSummaryTimer=null;programSummaryRefreshNow\(\);\},320\)/);
  assert.match(app,/saveSoon\(220\);programSummarySchedule\(\)/);
  assert.match(app,/flushSaveSoon\(\);programSummaryRefreshNow\(\)/);
  const start=app.indexOf('document.querySelectorAll("#gridR [data-blk],#gridS [data-blk]")');
  const end=app.indexOf('function bindPlanLongPress()',start);
  const block=app.slice(start,end);
  assert.doesNotMatch(block,/perfRAF\("program-summary"/);
});
