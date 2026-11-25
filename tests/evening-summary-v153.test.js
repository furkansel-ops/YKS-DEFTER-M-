const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8"),css=fs.readFileSync(path.join(__dirname,"..","app.css"),"utf8");
const body=name=>{const i=app.indexOf("function "+name+"(");assert.ok(i>=0,name);const j=app.indexOf("\nfunction ",i+1);return app.slice(i,j);};

test("v153 akşam bildirimi görev sayısını söyler; plan boşsa eski metin",()=>{
  const t=body("eveningText");
  assert.match(t,/p=v25PlanToday\(\);\}catch\(e\)\{\}/,"plan okunamazsa eski metin");
  assert.ok(t.includes('"Bugün "+p.done+"/"+p.filled+" görev'),"x/y görev");
  assert.ok(t.includes('" görev kaldı."'));
  assert.ok(t.includes('head+" ✓ · "'),"hepsi bittiyse ✓");
  assert.ok(t.includes('"Bugünü işaretlemedin. "'),"plan boşken eski metin");
});

test("v153 toplu yarına taşıma tek yedek ve tek geri al kullanır; tek görev taşıma aynı çekirdeği kullanır",()=>{
  assert.match(body("movePlanCellTomorrow"),/planMoveCellCore\(c\)/);
  const m=body("moveUnfinishedTomorrow");
  assert.match(m,/v25PlanToday\(\)/);
  assert.ok(m.includes("items.filter(x=>!x.done&&(!Array.isArray(ids)||ids.includes(x.cid)))"),"ids verilirse yalnız onlar (v154)");
  assert.match(m,/planWeekBackup\(\[p\.wk,/,"bugünün ve yarının haftası birlikte yedeklenir");
  assert.equal((m.match(/pushUndo\(/g)||[]).length,1);
  assert.ok(!m.includes("movePlanCellTomorrow("),"döngüde tek tek taşıma (her biri ayrı geri al) yok");
  assert.ok(m.includes('pushUndo(n+" görev yarına taşındı"'));
  assert.ok(m.includes('" görev yarına taşındı ✓"'));
  assert.ok(m.includes('"all|"+'),"çift dokunuş kilidi");
});

test("v153 Günü kapat kartında 18:00 sonrası 'Kalan N görevi yarına taşı' düğmesi",()=>{
  const r=body("v25RenderClose");
  assert.match(r,/todayCarryBtn/);
  assert.match(r,/h>=18&&left>0/);
  assert.ok(r.includes('"Kalan "+left+" görevi yarına taşı"'));
  assert.match(css,/#home \.today-carry\{/);
});
