/** Günlük çalışma serisi ve başarımlar; mevcut öğrenci kayıtlarından türetilir.
 * Ayrı XP sayacı tutulmaz: aynı kayıt yeniden işlenince ödül tekrar verilmez.
 */
export type StudyGamificationState={
  pomoMin?:Record<string,unknown>;
  solved?:Record<string,unknown>;
  denemeler?:Array<{date?:unknown}>;
};
export type StudyBadge={
  id:string;
  icon:string;
  title:string;
  description:string;
  unlocked:boolean;
  progress:number;
  goal:number;
  xp:number;
};
export type StudyWeekDay={key:string;label:string;completed:boolean;today:boolean};
export type StudyGamificationSnapshot={
  todayKey:string;
  todayMinutes:number;
  dailyGoal:number;
  todayCompleted:boolean;
  currentStreak:number;
  longestStreak:number;
  activeDays:number;
  totalMinutes:number;
  totalQuestions:number;
  totalExams:number;
  xp:number;
  level:number;
  rank:string;
  levelProgress:number;
  levelGoal:number;
  earnedBadges:number;
  badges:StudyBadge[];
  week:StudyWeekDay[];
};

const DAILY_GOAL=30;
const LEVEL_STEP=450;
const WEEKDAYS=["Pz","Pt","Sa","Ça","Pe","Cu","Ct"];

function dayKey(date:Date):string{
  return String(date.getFullYear()).padStart(4,"0")+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
}
function validKey(value:string):boolean{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const year=Number(value.slice(0,4)),month=Number(value.slice(5,7)),day=Number(value.slice(8));
  if(year<2000||year>2100)return false;
  const date=new Date(year,month-1,day);
  return date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day;
}
function shiftKey(key:string,offset:number):string{
  const date=new Date(Number(key.slice(0,4)),Number(key.slice(5,7))-1,Number(key.slice(8)),12);
  date.setDate(date.getDate()+offset);
  return dayKey(date);
}
function count(value:unknown,limit:number):number{
  const numeric=Number(value);
  return Number.isFinite(numeric)?Math.max(0,Math.min(limit,Math.floor(numeric))):0;
}
function rankFor(level:number):string{
  if(level>=40)return "YKS Efsanesi";
  if(level>=25)return "Usta";
  if(level>=14)return "Savaşçı";
  if(level>=6)return "Çırak";
  return "Acemi";
}
function badge(id:string,icon:string,title:string,description:string,progress:number,goal:number,xp:number):StudyBadge{
  return {id,icon,title,description,progress:Math.min(progress,goal),goal,xp,unlocked:progress>=goal};
}

/** Tarih hesapları cihazın yerel takvim gününe göre yapılır. Gece yarısında
 * bugünkü çalışma başlamadıysa dünkü seri hâlâ görünür. */
export function calculateStudyGamification(state:StudyGamificationState|null|undefined,now=new Date()):StudyGamificationSnapshot{
  const todayKey=dayKey(now);
  const focus=state?.pomoMin??{},questions=state?.solved??{};
  const days=new Map<string,{minutes:number;questions:number}>();
  for(const key of new Set([...Object.keys(focus),...Object.keys(questions)])){
    if(!validKey(key)||key>todayKey)continue;
    days.set(key,{minutes:count(focus[key],1440),questions:count(questions[key],5000)});
  }
  let totalMinutes=0,totalQuestions=0,xp=0;
  const completedKeys:string[]=[];
  for(const [key,record] of days){
    totalMinutes+=record.minutes;
    totalQuestions+=record.questions;
    const completed=record.minutes>=DAILY_GOAL;
    if(completed)completedKeys.push(key);
    // Günlük XP üst sınırı aynı oturumu şişirerek sınırsız puan kazanmayı zorlaştırır.
    xp+=Math.min(record.minutes,480)*2+Math.min(record.questions,200)+(completed?25:0);
  }
  completedKeys.sort();
  const completed=new Set(completedKeys);
  let longestStreak=0,run=0,previous="";
  for(const key of completedKeys){
    run=previous&&shiftKey(previous,1)===key?run+1:1;
    longestStreak=Math.max(longestStreak,run);
    previous=key;
  }
  let cursor=completed.has(todayKey)?todayKey:shiftKey(todayKey,-1);
  let currentStreak=0;
  while(completed.has(cursor)&&currentStreak<36600){
    currentStreak++;
    cursor=shiftKey(cursor,-1);
  }
  const totalExams=(state?.denemeler??[]).filter(exam=>
    typeof exam?.date==="string"&&validKey(exam.date)&&exam.date<=todayKey
  ).length;
  const activeDays=completedKeys.length;
  const badges=[
    badge("first-focus","🌱","İlk Adım","İlk 30 dakikalık çalışma",activeDays,1,50),
    badge("streak-3","🔥","Kıvılcım","3 gün üst üste çalış",longestStreak,3,75),
    badge("streak-7","🔥","Alev Aldı","7 günlük çalışma serisi",longestStreak,7,150),
    badge("streak-30","🏆","Disiplin Ustası","30 günlük çalışma serisi",longestStreak,30,400),
    badge("streak-100","👑","Sarsılmaz","100 günlük çalışma serisi",longestStreak,100,900),
    badge("questions-100","🎯","100 Soru","Toplam 100 soru çöz",totalQuestions,100,75),
    badge("questions-500","🧠","Soru Avcısı","Toplam 500 soru çöz",totalQuestions,500,150),
    badge("questions-1000","💎","Binlik Kulüp","Toplam 1000 soru çöz",totalQuestions,1000,250),
    badge("hours-10","⏱️","10 Saat","Toplam 10 saat odaklan",totalMinutes,600,100),
    badge("hours-50","📚","Azim","Toplam 50 saat odaklan",totalMinutes,3000,250),
    badge("hours-100","🚀","Maraton","Toplam 100 saat odaklan",totalMinutes,6000,400),
    badge("exams-1","📝","İlk Deneme","İlk deneme analizini kaydet",totalExams,1,75),
    badge("exams-10","🥇","Deneme Uzmanı","10 deneme analizi kaydet",totalExams,10,200)
  ];
  xp+=badges.reduce((sum,item)=>sum+(item.unlocked?item.xp:0),0);
  const level=Math.floor(xp/LEVEL_STEP)+1;
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  const monday=new Date(today);
  monday.setDate(monday.getDate()-(monday.getDay()+6)%7);
  const week:StudyWeekDay[]=Array.from({length:7},(_,index)=>{
    const date=new Date(monday);
    date.setDate(date.getDate()+index);
    const key=dayKey(date);
    return {key,label:WEEKDAYS[date.getDay()]??"?",completed:completed.has(key),today:key===todayKey};
  });
  return {
    todayKey,todayMinutes:days.get(todayKey)?.minutes??0,dailyGoal:DAILY_GOAL,
    todayCompleted:completed.has(todayKey),currentStreak,longestStreak,
    activeDays,totalMinutes,totalQuestions,totalExams,
    xp,level,rank:rankFor(level),levelProgress:xp%LEVEL_STEP,levelGoal:LEVEL_STEP,
    earnedBadges:badges.filter(item=>item.unlocked).length,badges,week
  };
}
