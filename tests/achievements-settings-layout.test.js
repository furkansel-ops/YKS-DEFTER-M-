const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");

test("modern settings contains a real dedicated Achievements category",()=>{
  const settings=read("public/settings-profile-runtime.js");
  assert.match(settings,/\{id:"achievements",title:"Başarımlar"/);
  assert.match(settings,/section\("achievements",/);
  assert.match(settings,/id="ymsAchievementsContent"/);
  assert.match(settings,/yks:achievements-settings-ready/);
  assert.match(settings,/icons=\{/);
  assert.match(settings,/award:/);
  assert.match(settings,/id="ymsWeeklyGoalsSlot"/);
  assert.match(settings,/yks:home-tools-ready/);
  assert.doesNotMatch(settings,/\bs\.gamification\s*=/,"Settings must not overwrite XP");
});
test("same achievement, task and insights DOM panels are moved without duplicate data writes",()=>{
  for(const file of ["src/ui/study-gamification.ts","src/ui/study-tasks-panel.ts",
    "src/ui/study-insights-panel.ts"]){
    const src=read(file);
    assert.match(src,/ymsAchievementsContent/);
    assert.match(src,/yks:achievements-settings-ready/);
    assert.doesNotMatch(src,/localStorage\.(setItem|clear|removeItem)/);
  }
  const root=read("src/ui/study-gamification.ts");
  assert.match(root,/settingsHost\.appendChild\(existing\)/);
  assert.match(root,/renderTodayTeaser\(snapshot\)/);
  assert.match(root,/detail:\{category:"achievements"\}/);
  assert.match(root,/id="todayAchievementShortcut"|link\.id="todayAchievementShortcut"/);
  const settings=read("public/settings-profile-runtime.js");
  assert.match(settings,/data-yms-section/);
});
test("all existing achievement panels retain responsive CSS in Settings",()=>{
  for(const file of ["src/ui/study-gamification.css",
    "src/ui/study-tasks-panel.css","src/ui/study-insights-panel.css"]){
    const src=read(file);
    assert.match(src,/:is\(#home,#ymsAchievementsContent\)/);
  }
  const teaser=read("src/ui/study-gamification.css");
  assert.match(teaser,/sg-today-shortcut/);
  assert.match(teaser,/display:none!important/);
});
test("older weekly goal inputs are relocated to Settings, not deleted",()=>{
  const today=read("src/ui/today-v43.ts"),settings=read("public/settings-profile-runtime.js");
  for(const id of ["fh_soz","fb_soz"]){
    assert.match(today,new RegExp('document\\.getElementById\\("'+id+'"\\)'));
    assert.match(read("index.html"),new RegExp('id="'+id+'"'));
  }
  assert.match(today,/target\.append\(control,body\)/);
  assert.match(settings,/ymsWeeklyGoalsSlot/);
  assert.match(today,/archive\.append\(node\)/);
});
