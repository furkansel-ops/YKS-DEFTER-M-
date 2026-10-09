"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");

test("Settings presents Achievements as a distinct destination with real-data level preview",()=>{
  const settings=read("public/settings-profile-runtime.js"),career=read("src/ui/study-gamification.ts");
  assert.match(settings,/\{id:"achievements",title:"Başarımlar"/);
  assert.match(settings,/yms-achievement-entry/);
  assert.match(settings,/data-yms-achievements-overview/);
  assert.match(settings,/data-yms-career-summary/);
  assert.match(settings,/data-yms-career-progress/);
  assert.match(settings,/ymsAchievementsContent/);
  assert.match(settings,/Başarımlar hakkında sık sorulanlar/);
  assert.match(career,/function renderSettingsOverview\(snapshot:StudyGamificationSnapshot\)/);
  assert.match(career,/snapshot\.xp\.toLocaleString\("tr-TR"\)/);
  assert.match(career,/renderSettingsOverview\(snapshot\)/);
  assert.match(career,/aria-valuetext/);
});

test("Badge search/sort does not leak locked secret details or remove focus on every input",()=>{
  const source=read("src/ui/study-gamification.ts");
  assert.match(source,/type BadgeSort="nearest"\|"recent"\|"reward"\|"name"/);
  assert.match(source,/function filteredBadges\(/);
  assert.match(source,/const secret=Boolean\(b\.hidden&&!b\.unlocked\)/);
  assert.match(source,/secret\?"Gizli Başarım Gizli rozet kilitli"/);
  assert.match(source,/badgeQuery\.trim\(\)\.toLocaleLowerCase\("tr-TR"\)/);
  assert.match(source,/function updateBadgeCollection\(/);
  assert.match(source,/search\.addEventListener\("input",\(\)=>\{badgeQuery=search\.value;update\(\);\}\)/);
  assert.match(source,/sort\.addEventListener\("change",\(\)=>\{badgeSort=sort\.value as BadgeSort;update\(\);\}\)/);
  assert.match(source,/grid\.replaceChildren\(\.\.\.items\.map\(badgeCard\)\)/);
  assert.doesNotMatch(source,/search\.addEventListener\("input",\(\)=>\{.*schedule\(\)/);
  assert.match(source,/badgeSort="nearest";badgeQuery=""/);
  for(const q of ['İlerlemeye göre','Son kazanılan','XP ödülüne göre','Alfabetik']){
    assert.ok(source.includes(q),q);
  }
});

test("Settings achievement screen is responsive and retains user state / XP formulas",()=>{
  const settings=read("public/settings-profile-runtime.js"),
    styles=read("src/ui/study-gamification.css"),
    domain=read("src/domain/study-gamification.ts");
  assert.match(settings,/yms-career-help/);
  assert.match(styles,/sg-collection-controls/);
  assert.match(styles,/max-width:550px/);
  assert.match(domain,/xpSources:\{study:workXp,badges:earnedXp,tasks:taskRewardXp\}/);
  assert.doesNotMatch(settings,/localStorage\.setItem\([^)]*gamification/);
});
