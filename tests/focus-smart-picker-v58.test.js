const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,".."),read=name=>fs.readFileSync(path.join(root,name),"utf8");
const picker=read("src/ui/focus-smart-picker-v58.ts");
const css=read("src/ui/focus-smart-picker-v58.css");
const host=read("src/ui/focus-session-guard-v43.ts");

test("v58 optional picker loads after v43 focus guard without blocking application startup",()=>{
  assert.match(host,/import\("\.\/focus-smart-picker-v58"\)/);
  assert.match(picker,/export function installFocusSmartPickerV58/);
  assert.match(picker,/if\(!setup\|\|!subjectStep\|\|!search\|\|!taskSelect\|\|!topicSelect\)return/);
  assert.match(picker,/if\(document\.getElementById\("v58PlanPicker"\)\)/);
});
test("v58 reads existing plan and derives subject and topic from original task metadata",()=>{
  assert.match(picker,/old\("todayTaskOptions"\)/);
  assert.match(picker,/old\("v25TaskMeta"\)/);
  assert.match(picker,/subject:String\(meta\.subj\|\|""\)/);
  assert.match(picker,/topic:String\(meta\.topic\|\|""\)/);
  assert.match(picker,/rows\.filter\(row=>/);
  assert.match(picker,/rows\.filter/);
  assert.match(picker,/rows\.filter\(row=>row&&typeof row\.cid/);
});
test("v58 plan selection uses existing setters and never credits or marks any work",()=>{
  assert.match(picker,/old\("setPomoSubject"\)\?\.\(item\.subject\)/);
  assert.match(picker,/old\("setPomoTopic"\)\?\.\(item\.topic\)/);
  assert.match(picker,/old\("setPomoTask"\)\?\.\(item\.id\)/);
  assert.match(picker,/topicSelect\.dispatchEvent\(new Event\("change"/);
  assert.match(picker,/taskSelect\.dispatchEvent\(new Event\("change"/);
  assert.doesNotMatch(picker,/localStorage|sessionStorage|indexedDB|fetch\(|save\(|S\.pomoMin|S\.pomoSubj|programSetCellDone|swCreditElapsed/);
});
test("v58 prevents changing the linked task during a live stopwatch or Pomodoro",()=>{
  assert.match(picker,/function liveSession\(\)/);
  assert.match(picker,/\["focusCard","swCard"\]/);
  assert.match(picker,/if\(liveSession\(\)\)\{notify\("Çalışma sürerken program görevi değiştirilmez\."/);
  assert.match(picker,/if\(liveSession\(\)\)return;/);
});
test("v58 quick access to recent subjects uses real completed sessions and safe mobile styling",()=>{
  assert.match(picker,/old\("v29SessionList"\)\?\.\(14\)/);
  assert.match(picker,/const recent=make\("div","v58-recent-subjects"\)/);
  assert.match(picker,/subjectAvailable/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:540px\)/);
  assert.match(css,/grid-template-columns:1fr/);
  assert.match(css,/var\(--label\)/);
  assert.match(css,/var\(--glass\)/);
});
