import type {StudyBadge,StudyGamificationSnapshot,BadgeRarity} from "./study-gamification.ts";

/** Read-only presentation data. Does not issue XP or mutate saved achievements. */
export const RARITIES:readonly BadgeRarity[]=["Bronz","Gümüş","Altın","Elmas","Efsanevi"];
const ratio=(badge:StudyBadge)=>badge.goal>0?
  Math.max(0,Math.min(100,Math.round(badge.progress/badge.goal*100))):0;
export function achievementOverview(snapshot:StudyGamificationSnapshot){
  const available=snapshot.badges.filter(b=>!b.hidden&&!b.pending&&!b.unlocked);
  const next=[...available].sort((a,b)=>
    ratio(b)-ratio(a)||Math.max(0,a.goal-a.progress)-Math.max(0,b.goal-b.progress)||a.id.localeCompare(b.id)).slice(0,3);
  const recent=snapshot.badges.filter(b=>b.unlocked&&b.unlockedAt!=null)
    .sort((a,b)=>(b.unlockedAt??0)-(a.unlockedAt??0)||a.id.localeCompare(b.id)).slice(0,4);
  const tiers=RARITIES.map(rarity=>({
    rarity,total:snapshot.badges.filter(b=>b.rarity===rarity).length,
    unlocked:snapshot.badges.filter(b=>b.rarity===rarity&&b.unlocked).length
  }));
  const week={
    completed:snapshot.week.filter(d=>d.status==="completed").length,
    rest:snapshot.week.filter(d=>d.status==="rest"&&d.key<=snapshot.todayKey).length,
    shield:snapshot.week.filter(d=>d.status==="shield").length,
    missed:snapshot.week.filter(d=>d.status==="missed").length
  };
  return {near:next,recent,tiers,week,collectionPercent:snapshot.badges.length?
    Math.round(snapshot.earnedBadges/snapshot.badges.length*100):0};
}
export function badgeProgressPercent(badge:StudyBadge):number{return ratio(badge);}
