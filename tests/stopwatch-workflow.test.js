const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("kronometre tur, mola ve ders değiştirme araçlarını birlikte sunar",()=>{
  const html=read("index.html"),app=read("app.js"),css=read("app.css");
  assert.match(html,/id="swActiveSubject"/);
  assert.match(html,/id="swSubjectSwitch"/);
  assert.match(html,/onclick="swMarkBreak\(\)"/);
  assert.match(app,/function swSwitchSubject/);
  assert.match(app,/swCreditElapsed\(elapsed\)/);
  assert.match(app,/swHistoryAdd\(Math\.max\(0,now-runStart\),current,runStart,now\)/);
  assert.match(app,/s\.acc=elapsed/);
  assert.match(app,/s\.start=now/);
  assert.match(app,/function swMarkBreak/);
  assert.match(app,/setPauseReason\("break"\)/);
  assert.match(app,/function swRenderTools/);
  assert.match(css,/\.sw-session-tools/);
  assert.match(css,/\.sw-lap-row\.is-switch/);
});
