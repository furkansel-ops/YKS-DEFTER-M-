/** YKS Defterim: bağımsız, deterministik Aşama 1 oyunlaştırma hesabı.
 * İlk etkinleştirmeden önceki kayıtlar ödül üretmez. Hiçbir eski istatistik silinmez.
 */
export type DailyGoal={from:string;minutes:number;questions:number};
export type EarnedBadge={at:number;xp:number};
export type GamificationProfile={
  version:1;
  activatedAt:number;
  activationDay:string;
  baselineMinutes:number;
  baselineQuestions:number;
  goals:DailyGoal[];
  earned:Record<string,EarnedBadge>;
  /** Dinlenme günleri yalnız önceden planlanır; haftada en fazla bir gün. */
  restDays?:string[];
  tasks?:import("./study-tasks.ts").StudyTaskStore;
};
export type StudyGamificationState={
  pomoMin?:Record<string,unknown>;
  solved?:Record<string,unknown>;
  denemeler?:Array<{date?:unknown;at?:unknown;type?:unknown}>;
  gamification?:GamificationProfile;
};
export type BadgeRarity="Bronz"|"Gümüş"|"Altın"|"Elmas"|"Efsanevi";
export type StudyBadge={
  id:string;icon:string;title:string;description:string;
  rarity:BadgeRarity;xp:number;progress:number;goal:number;
  unlocked:boolean;unlockedAt:number|null;pending:boolean;
};
export type StudyDayStatus="completed"|"rest"|"shield"|"missed"|"pending";
export type StudyWeekDay={key:string;label:string;completed:boolean;today:boolean;status:StudyDayStatus};
export type StudyGamificationSnapshot={
  activated:boolean;todayKey:string;todayMinutes:number;todayQuestions:number;
  goalMinutes:number;goalQuestions:number;todayCompleted:boolean;
  currentStreak:number;longestStreak:number;activeDays:number;
  shields:number;shieldsUsed:number;shieldLimit:number;restDays:string[];
  totalMinutes:number;totalQuestions:number;totalExams:number;
  xp:number;level:number;rank:string;levelProgress:number;levelGoal:number;
  earnedBadges:number;badges:StudyBadge[];newBadgeIds:string[];
  week:StudyWeekDay[];
};
const WEEKDAYS=["Pz","Pt","Sa","Ça","Pe","Cu","Ct"] as const;
const XP_BY_RARITY:Record<BadgeRarity,number>={Bronz:30,"Gümüş":75,"Altın":150,"Elmas":300,"Efsanevi":600};

export function keyOf(date:Date):string{
  return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
}
function isDayKey(key:string):boolean{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return false;
  const d=new Date(Number(key.slice(0,4)),Number(key.slice(5,7))-1,Number(key.slice(8)),12);
  return key===keyOf(d);
}
export function shiftDay(key:string,n:number):string{
  const d=new Date(Number(key.slice(0,4)),Number(key.slice(5,7))-1,Number(key.slice(8)),12);
  d.setDate(d.getDate()+n);
  return keyOf(d);
}
function amount(value:unknown,max:number):number{
  const n=Number(value);
  return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
}
function validGoals(goals:DailyGoal[],day:string):DailyGoal{
  const rows=goals.filter(g=>isDayKey(g.from)&&g.from<=day).sort((a,b)=>b.from.localeCompare(a.from));
  return rows[0]??{from:day,minutes:90,questions:60};
}
function normalizedGoals(goals:DailyGoal[]):DailyGoal[]{
  return [...goals].filter(g=>isDayKey(g.from)&&Number.isInteger(g.minutes)&&g.minutes>=15&&g.minutes<=480
    &&Number.isInteger(g.questions)&&g.questions>=10&&g.questions<=300)
    .sort((a,b)=>a.from.localeCompare(b.from)).slice(-400);
}
export function createGamificationProfile(
  now:Date,minutes:number,questions:number,state:StudyGamificationState
):GamificationProfile{
  if(!Number.isInteger(minutes)||minutes<15||minutes>480)throw new Error("Süre hedefi 15–480 dakika olmalı.");
  if(!Number.isInteger(questions)||questions<10||questions>300)throw new Error("Soru hedefi 10–300 arasında olmalı.");
  const day=keyOf(now);
  return {version:1,activatedAt:now.getTime(),activationDay:day,
    baselineMinutes:amount(state.pomoMin?.[day],1440),
    baselineQuestions:amount(state.solved?.[day],5000),
    goals:[{from:day,minutes,questions}],earned:{},restDays:[]};
}
export function setNextDayGoal(
  profile:GamificationProfile,now:Date,minutes:number,questions:number
):GamificationProfile{
  if(!Number.isInteger(minutes)||minutes<15||minutes>480)throw new Error("Süre hedefi 15–480 dakika olmalı.");
  if(!Number.isInteger(questions)||questions<10||questions>300)throw new Error("Soru hedefi 10–300 arasında olmalı.");
  const next=shiftDay(keyOf(now),1);
  return {...profile,goals:[...profile.goals.filter(g=>g.from!==next),{from:next,minutes,questions}]
    .sort((a,b)=>a.from.localeCompare(b.from))};
}
/** Yalnız gün başlamadan planlama yapılır. Aynı ISO haftasına ikinci dinlenme eklenmez. */
export function planRestDay(profile:GamificationProfile,day:string,now:Date):GamificationProfile{
  if(!isDayKey(day)||day<=keyOf(now)||day<profile.activationDay)
    throw new Error("Dinlenme günü ancak gelecek bir tarih için seçilebilir.");
  const existing=(profile.restDays??[]).filter(isDayKey);
  const monday=(key:string)=>{
    const date=new Date(Number(key.slice(0,4)),Number(key.slice(5,7))-1,Number(key.slice(8)),12);
    return shiftDay(key,-(date.getDay()+6)%7);
  };
  if(existing.some(key=>monday(key)===monday(day)))
    throw new Error("Bu hafta için dinlenme günü zaten belirlendi.");
  return {...profile,restDays:[...existing,day].sort()};
}

function rankFor(level:number):string{
  if(level>=35)return "YKS Efsanesi";
  if(level>=20)return "Usta";
  if(level>=10)return "Savaşçı";
  if(level>=5)return "Çırak";
  return "Acemi";
}
export function levelForXp(xp:number):{level:number;progress:number;goal:number}{
  let level=1,progress=Math.max(0,Math.floor(xp));
  // 1→2 = 200 XP, her sonraki geçiş +50 XP.
  while(progress>=200+(level-1)*50&&level<100000){
    progress-=200+(level-1)*50;
    level++;
  }
  return {level,progress,goal:200+(level-1)*50};
}
type BadgeDefinition={id:string;icon:string;title:string;description:string;rarity:BadgeRarity;goal:number;value:number;pending?:boolean};
function definitions(s:{minutes:number;questions:number;successfulDays:number;longest:number;exams:number}):BadgeDefinition[]{
  return [
    {id:"first-focus",icon:"🌱",title:"İlk Adım",description:"30 dakika odaklan",rarity:"Bronz",goal:30,value:s.minutes},
    {id:"first-streak",icon:"🔥",title:"İlk Kıvılcım",description:"İlk günlük hedefi tamamla",rarity:"Bronz",goal:1,value:s.successfulDays},
    {id:"first-25q",icon:"🎯",title:"Soruya Giriş",description:"25 soru çöz",rarity:"Bronz",goal:25,value:s.questions},
    {id:"first-exam",icon:"📝",title:"İlk Denemem",description:"Yeni bir deneme analizi kaydet",rarity:"Bronz",goal:1,value:s.exams},
    {id:"streak-7",icon:"🔥",title:"Alev Aldı",description:"7 başarılı seri günü",rarity:"Gümüş",goal:7,value:s.longest},
    {id:"questions-250",icon:"🧠",title:"Soru Avcısı",description:"250 soru çöz",rarity:"Gümüş",goal:250,value:s.questions},
    {id:"hours-10",icon:"⏱️",title:"Odak Ustası",description:"10 saat çalış",rarity:"Gümüş",goal:600,value:s.minutes},
    {id:"reviews-10",icon:"📚",title:"Tekrarcı",description:"10 doğrulanmış konu tekrarı",rarity:"Gümüş",goal:10,value:0,pending:true},
    {id:"streak-30",icon:"🏆",title:"Disiplin Ustası",description:"30 başarılı seri günü",rarity:"Altın",goal:30,value:s.longest},
    {id:"questions-1000",icon:"🎯",title:"Binlik Kulüp",description:"1.000 soru çöz",rarity:"Altın",goal:1000,value:s.questions},
    {id:"hours-50",icon:"📖",title:"Çalışkan",description:"50 saat çalış",rarity:"Altın",goal:3000,value:s.minutes},
    {id:"net-5",icon:"📈",title:"Net Avcısı",description:"Aynı deneme türünde +5 net",rarity:"Altın",goal:5,value:0,pending:true},
    {id:"streak-60",icon:"💎",title:"Sarsılmaz",description:"60 başarılı seri günü",rarity:"Elmas",goal:60,value:s.longest},
    {id:"questions-3000",icon:"🧩",title:"Soru Makinesi",description:"3.000 soru çöz",rarity:"Elmas",goal:3000,value:s.questions},
    {id:"hours-150",icon:"⏳",title:"Zamanın Efendisi",description:"150 saat çalış",rarity:"Elmas",goal:9000,value:s.minutes},
    {id:"subject-40h",icon:"🎓",title:"Ders Uzmanı",description:"Tek derste 40 saat çalış",rarity:"Elmas",goal:2400,value:0,pending:true},
    {id:"streak-100",icon:"👑",title:"Yıkılmaz Seri",description:"100 başarılı seri günü",rarity:"Efsanevi",goal:100,value:s.longest},
    {id:"questions-10000",icon:"🚀",title:"10 Bin Kulübü",description:"10.000 soru çöz",rarity:"Efsanevi",goal:10000,value:s.questions},
    {id:"hours-300",icon:"🌟",title:"Çalışma Efsanesi",description:"300 saat çalış",rarity:"Efsanevi",goal:18000,value:s.minutes},
    {id:"subjects-3x50h",icon:"🏅",title:"Çok Yönlü Usta",description:"3 derste 50'şer saat çalış",rarity:"Efsanevi",goal:3,value:0,pending:true}
  ];
}
export function calculateStudyGamification(state:StudyGamificationState|null|undefined,now=new Date()):StudyGamificationSnapshot{
  const todayKey=keyOf(now),profile=state?.gamification;
  const activated=!!profile&&profile.version===1&&isDayKey(profile.activationDay)&&
    Number.isFinite(profile.activatedAt)&&profile.activatedAt>0&&profile.activatedAt<=now.getTime();
  const goals=activated?normalizedGoals(profile.goals):[];
  const dayRecords=new Map<string,{minutes:number;questions:number;completed:boolean}>();
  let totalMinutes=0,totalQuestions=0,workXp=0,activeDays=0;
  if(activated){
    const allKeys=new Set([...Object.keys(state?.pomoMin??{}),...Object.keys(state?.solved??{})]);
    for(const key of allKeys){
      if(!isDayKey(key)||key<profile.activationDay||key>todayKey)continue;
      const baseline=key===profile.activationDay;
      const minutes=Math.max(0,amount(state?.pomoMin?.[key],1440)-(baseline?profile.baselineMinutes:0));
      const questions=Math.max(0,amount(state?.solved?.[key],5000)-(baseline?profile.baselineQuestions:0));
      const goal=validGoals(goals,key);
      dayRecords.set(key,{minutes,questions,completed:minutes>=goal.minutes&&questions>=goal.questions});
      totalMinutes+=minutes;totalQuestions+=questions;
      workXp+=Math.min(120,Math.floor(minutes/2))+Math.min(80,Math.floor(questions/2));
    }
  }
  // Kalkan durumu kayıtlardan yeniden hesaplanır: offline gelen çalışma eksik
  // günü tamamlarsa yanlışlıkla harcanmış kalkan otomatik geri kazanılır.
  const restDays=(activated?profile.restDays??[]:[]).filter(isDayKey);
  const plannedRest=new Set<string>();
  const plannedWeeks=new Set<string>();
  for(const day of [...restDays].sort()){
    const date=new Date(Number(day.slice(0,4)),Number(day.slice(5,7))-1,Number(day.slice(8)),12);
    const monday=shiftDay(day,-((date.getDay()+6)%7));
    if(day>=profile!.activationDay&&!plannedWeeks.has(monday)){
      plannedWeeks.add(monday);plannedRest.add(day);
    }
  }
  let shields=0,shieldsUsed=0,earnedCounter=0,currentStreak=0,longestStreak=0;
  const dayStatuses=new Map<string,StudyDayStatus>();
  if(activated){
    let day=profile.activationDay,guard=0;
    while(day<=todayKey&&guard++<36600){
      const record=dayRecords.get(day);
      let status:StudyDayStatus;
      if(plannedRest.has(day))status="rest";
      else if(record?.completed){
        status="completed";activeDays++;currentStreak++;
        workXp+=50;
        earnedCounter++;
        if(earnedCounter===7){earnedCounter=0;shields=Math.min(2,shields+1);}
      }else if(day===todayKey)status="pending";
      else if(currentStreak>0&&shields>0){
        status="shield";shields--;shieldsUsed++;
      }else {status="missed";currentStreak=0;}
      longestStreak=Math.max(longestStreak,currentStreak);
      dayStatuses.set(day,status);
      day=shiftDay(day,1);
    }
  }
  const todayCompleted=dayStatuses.get(todayKey)==="completed";
  const totalExams=activated?(state?.denemeler??[]).filter(exam=>{
    const stamp=Number(exam?.at);
    return Number.isFinite(stamp)&&stamp>=profile.activatedAt&&stamp<=now.getTime()
      &&typeof exam.date==="string"&&isDayKey(exam.date);
  }).length:0;
  const badgeDefinitions=definitions({minutes:totalMinutes,questions:totalQuestions,successfulDays:activeDays,longest:longestStreak,exams:totalExams});
  const earned=activated?profile.earned??{}:{};
  const newBadgeIds:string[]=[];
  const badges:StudyBadge[]=badgeDefinitions.map(b=>{
    const old=earned[b.id],wasEarned=!!old&&Number.isFinite(old.at)&&old.at>0;
    const qualifies=!b.pending&&b.value>=b.goal;
    if(qualifies&&!wasEarned)newBadgeIds.push(b.id);
    return {id:b.id,icon:b.icon,title:b.title,description:b.description,rarity:b.rarity,
      xp:XP_BY_RARITY[b.rarity],progress:Math.min(b.goal,b.value),goal:b.goal,
      unlocked:wasEarned,unlockedAt:wasEarned?old.at:null,pending:!!b.pending};
  });
  const earnedXp=badges.reduce((sum,b)=>{
    if(!b.unlocked)return sum;
    const value=earned[b.id]?.xp;
    return sum+(typeof value==="number"&&Number.isFinite(value)?value:b.xp);
  },0);
  const taskRewardXp=Object.entries(profile?.tasks?.claims??{}).reduce((total,[id,claim])=>{
    // Ödül yalnız günlük 15/25/35 ya da haftalık 100 XP olabilir.
    const valid=id.startsWith("daily:")?[15,25,35].includes(claim?.xp):
      id.startsWith("weekly:")?claim?.xp===100:false;
    return total+(valid&&Number.isFinite(claim?.at)&&claim.at>=profile!.activatedAt?claim.xp:0);
  },0);
  const xp=workXp+earnedXp+taskRewardXp,levelInfo=levelForXp(xp);
  const goal=validGoals(goals,todayKey);
  const todayRecord=dayRecords.get(todayKey);
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  const monday=new Date(today);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
  const week:Array<StudyWeekDay>=Array.from({length:7},(_,i)=>{
    const day=new Date(monday);day.setDate(day.getDate()+i);
    const key=keyOf(day);
    const status=dayStatuses.get(key)??"pending";
    return {key,label:WEEKDAYS[day.getDay()]??"?",completed:status==="completed",today:key===todayKey,status};
  });
  return {activated,todayKey,todayMinutes:todayRecord?.minutes??0,todayQuestions:todayRecord?.questions??0,
    goalMinutes:goal.minutes,goalQuestions:goal.questions,todayCompleted,
    currentStreak,longestStreak,activeDays,totalMinutes,totalQuestions,totalExams,
    shields,shieldsUsed,shieldLimit:2,restDays:[...plannedRest].sort(),
    xp,level:levelInfo.level,rank:rankFor(levelInfo.level),
    levelProgress:levelInfo.progress,levelGoal:levelInfo.goal,
    earnedBadges:badges.filter(b=>b.unlocked).length,badges,newBadgeIds,week};
}
