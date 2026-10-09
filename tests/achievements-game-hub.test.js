const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");

test("Today displays the real level progress rather than a fake hard-coded XP value",()=>{
  const s=read("src/ui/study-gamification.ts");
  assert.match(s,/renderTodayTeaser\(snapshot\)/);
  assert.match(s,/snapshot\.levelProgress/);
  assert.match(s,/snapshot\.levelGoal/);
  assert.match(s,/snapshot\.currentStreak/);
  assert.match(s,/snapshot\.shields/);
  assert.match(s,/aria-valuenow/);
  assert.match(s,/aria-valuemax/);
  assert.match(s,/beforebegin",link/);
  assert.match(s,/detail:\{category:"achievements"\}/);
});
test("Career Center exposes general, badge, task and career tabs without rewriting XP formulas",()=>{
  const s=read("src/ui/study-gamification.ts");
  for(const tab of ['general','badges','tasks','career']){
    assert.match(s,new RegExp('\\["'+tab+'","'));
  }
  assert.match(s,/role","tablist"/);
  assert.match(s,/role","tab"/);
  assert.match(s,/aria-selected/);
  assert.match(s,/ArrowRight/);
  assert.match(s,/ArrowLeft/);
  assert.match(s,/id="studyTasksPanel"|getElementById\("studyTasksPanel"\)/);
  assert.match(s,/getElementById\("studyInsightsPanel"\)/);
  assert.match(s,/tasks\.hidden=activeTab!=="tasks"/);
  assert.match(s,/insights\.hidden=activeTab!=="career"/);
  assert.match(s,/snapshot\.totalQuestions/);
  assert.match(s,/snapshot\.totalMinutes/);
  assert.match(s,/snapshot\.longestStreak/);
  assert.match(s,/pct\(snapshot\.levelProgress,snapshot\.levelGoal\)/);
  assert.doesNotMatch(s,/localStorage\.(setItem|clear|removeItem)/);
});
test("all 25 original badge definitions are retained, including the five hidden achievements",()=>{
  const domain=read("src/domain/study-gamification.ts");
  const ids=[...domain.matchAll(/\{id:"([^"]+)",icon:/g)].map(x=>x[1]);
  assert.equal(ids.length,25);
  assert.equal(new Set(ids).size,25);
  assert.equal(ids.filter(x=>x.startsWith("hidden-")).length,5);
  assert.match(domain,/Bronz:30,"Gümüş":75,"Altın":150,"Elmas":300,"Efsanevi":600/);
});
test("badge dialog supports progress, reward XP, unlock date and deliberate hidden badge secrecy",()=>{
  const s=read("src/ui/study-gamification.ts"),styles=read("src/ui/study-gamification.css");
  assert.match(s,/function openBadgeDetail\(/);
  assert.match(s,/dialog\.showModal\(\)/);
  assert.match(s,/dialog\.addEventListener\("close"/);
  assert.match(s,/badge\.hidden&&!badge\.unlocked/);
  assert.match(s,/Gizli Başarım/);
  assert.match(s,/Henüz keşfedilmedi/);
  assert.match(s,/new Date\(badge\.unlockedAt\)/);
  assert.match(s,/badge\.goal-badge\.progress/);
  assert.match(s,/badge\.xp/);
  assert.match(styles,/\.sg-dialog-reward/);
  assert.match(styles,/\.sg-medal-crest/);
  assert.match(styles,/\[data-rarity="legendary"\]/);
  assert.match(styles,/prefers-reduced-motion/);
});
