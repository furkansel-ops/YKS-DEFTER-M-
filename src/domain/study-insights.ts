/** Aşama 3: salt-okunur öğrenci içgörüleri.
 * Yalnız etkinleşmeden sonraki veriler oyunlaştırma puanına dahil edilir.
 * TYT/AYT ayrımı kanıtlanamayan konu ve süreler yanlış derse atanmaz.
 */
import type {GamificationProfile,StudyGamificationState,StudyDayStatus} from "./study-gamification.ts";

export type MasteryTier="Başlangıç"|"Bronz"|"Gümüş"|"Altın"|"Elmas"|"Efsanevi";
export type SubjectMastery={
  key:string;label:string;minutes:number;questions:number;reviews:number;
  up:number;tier:MasteryTier;nextTier:MasteryTier|null;nextUp:number;progress:number;
};
export type CalendarDay={
  day:string;status:StudyDayStatus|"before-start"|"future";
  minutes:number;questions:number;goalMinutes:number;goalQuestions:number;
  xp:number;claimedTasks:number;
};
export type PersonalRecord={id:string;label:string;value:number;unit:string;day:string};
export type ExamProgress={type:"TYT"|"AYT"|"YDT"|"BRANS";count:number;bestNet:number|null;lastNet:number|null;maxGrowth:number};
export type StudyInsights={
  mastery:SubjectMastery[];records:PersonalRecord[];exams:ExamProgress[];
  calendar:CalendarDay[];totalReviews:number;maxNetGain:number;
  bestSubjectMinutes:number;subjectsAt50Hours:number;
  hidden:{nightOwl:boolean;earlyBird:boolean;lastMinute:boolean;perfectWeek:boolean;surprise:boolean};
};
type DataState=StudyGamificationState&{
  pomoSubj?:Record<string,Record<string,unknown>>;
  solvedTopic?:Record<string,Record<string,unknown>>;
  topics?:Record<string,{revDone?:Record<string,unknown>}>;
  sessions?:Record<string,Array<{t?:unknown;m?:unknown;type?:unknown;done?:unknown}>>;
  denemeler?:Array<{id?:unknown;at?:unknown;date?:unknown;type?:unknown;totalNet?:unknown;netOnly?:unknown}>;
};
const LIMITS:{tier:MasteryTier;up:number}[]=[
  {tier:"Bronz",up:20},{tier:"Gümüş",up:100},{tier:"Altın",up:300},
  {tier:"Elmas",up:700},{tier:"Efsanevi",up:1500}
];
const dayPattern=/^\d{4}-\d{2}-\d{2}$/;
function dayOk(day:string):boolean{
  if(!dayPattern.test(day))return false;
  const parsed=new Date(Number(day.slice(0,4)),Number(day.slice(5,7))-1,Number(day.slice(8)),12);
  return parsed.getFullYear()===Number(day.slice(0,4))&&
    parsed.getMonth()+1===Number(day.slice(5,7))&&parsed.getDate()===Number(day.slice(8));
}
function localDay(date:Date):string{
  return String(date.getFullYear()).padStart(4,"0")+"-"+String(date.getMonth()+1).padStart(2,"0")+
    "-"+String(date.getDate()).padStart(2,"0");
}
function dayDate(day:string):Date{
  return new Date(Number(day.slice(0,4)),Number(day.slice(5,7))-1,Number(day.slice(8)),12);
}
function addDay(day:string,n:number):string{
  const d=dayDate(day);d.setDate(d.getDate()+n);return localDay(d);
}
function number(value:unknown,cap:number):number{
  const n=Number(value);
  return Number.isFinite(n)?Math.min(cap,Math.max(0,Math.floor(n))):0;
}
function baseline(value:number,day:string,profile:GamificationProfile,kind:"minutes"|"questions"):number{
  if(day!==profile.activationDay)return value;
  const old=kind==="minutes"?profile.baselineMinutes:profile.baselineQuestions;
  return Math.max(0,value-old);
}
function goalOn(profile:GamificationProfile,day:string):{minutes:number;questions:number}{
  return [...profile.goals].filter(g=>dayOk(g.from)&&g.from<=day)
    .sort((a,b)=>b.from.localeCompare(a.from))[0]??{minutes:90,questions:60};
}
function rawDaily(state:DataState,profile:GamificationProfile,day:string){
  const minutes=baseline(number(state.pomoMin?.[day],1440),day,profile,"minutes");
  const questions=baseline(number(state.solved?.[day],5000),day,profile,"questions");
  return {minutes,questions};
}
function sourceName(name:string):{key:string;label:string}|null{
  const value=name.trim().replace(/\s+/g," ");
  if(!value||value.length>110)return null;
  const parts=value.split("|");
  if(parts.length>=2&&["TYT","AYT","YDT"].includes(parts[0]?.trim().toUpperCase()??"")){
    const exam=parts[0]!.trim().toUpperCase();
    const subject=parts[1]?.trim();
    if(!subject)return null;
    return {key:exam+"|"+subject,label:exam+" "+subject};
  }
  // Genel Matematik ile TYT Matematik eşit kabul edilmez.
  return {key:"GENEL|"+value,label:value+" (genel)"};
}
function topicName(name:string):{key:string;label:string}|null{
  const parts=name.split("|");
  return parts.length>=2&&["TYT","AYT","YDT"].includes((parts[0]??"").toUpperCase())?
    sourceName(parts.slice(0,2).join("|")):sourceName(name);
}
function tierOf(up:number):{tier:MasteryTier;nextTier:MasteryTier|null;nextUp:number;progress:number}{
  const idx=LIMITS.findIndex(item=>up<item.up);
  const reached=idx===-1?LIMITS.length:idx;
  const current=reached>0?LIMITS[reached-1]!.tier:"Başlangıç";
  if(idx===-1)return {tier:current,nextTier:null,nextUp:up,progress:100};
  const goal=LIMITS[idx]!,start=reached?LIMITS[reached-1]!.up:0;
  return {tier:current,nextTier:goal.tier,nextUp:goal.up,progress:Math.max(0,Math.min(100,Math.floor((up-start)/(goal.up-start)*100)))};
}
export function getStudyInsights(state:DataState,profile:GamificationProfile,now:Date,
  history:Record<string,StudyDayStatus>):StudyInsights{
  const today=localDay(now),activated=profile.activationDay;
  const masteryMap=new Map<string,{key:string;label:string;minutes:number;questions:number;reviews:number}>();
  const subject=(name:{key:string;label:string})=>{
    let row=masteryMap.get(name.key);
    if(!row){row={...name,minutes:0,questions:0,reviews:0};masteryMap.set(name.key,row);}
    return row;
  };
  for(const [day,subjects] of Object.entries(state.pomoSubj??{})){
    if(!dayOk(day)||day<activated||day>today||!subjects||typeof subjects!=="object")continue;
    for(const [raw,value] of Object.entries(subjects)){
      const parsed=sourceName(raw);if(!parsed)continue;
      // Eski profilde başlangıç gününe ait ders kırılımı bilinmiyorsa o gün puanlanmaz.
      const prior=day===activated?profile.baselineSubjectMinutes?.[raw]:0;
      if(day===activated&&prior==null)continue;
      subject(parsed).minutes+=Math.max(0,number(value,1440)-number(prior,1440));
    }
  }
  for(const [day,topics] of Object.entries(state.solvedTopic??{})){
    if(!dayOk(day)||day<activated||day>today||!topics||typeof topics!=="object")continue;
    for(const [raw,value] of Object.entries(topics)){
      const parsed=topicName(raw);if(!parsed)continue;
      const prior=day===activated?profile.baselineTopicQuestions?.[raw]:0;
      if(day===activated&&prior==null)continue;
      subject(parsed).questions+=Math.max(0,number(value,5000)-number(prior,5000));
    }
  }
  let totalReviews=0;
  for(const [topic,data] of Object.entries(state.topics??{})){
    const parsed=topicName(topic),log=data?.revDone;
    if(!parsed||!log||typeof log!=="object")continue;
    for(const date of Object.values(log)){
      // Yalnız gün bilgisi tutulduğu için etkinleşme günündeki eski tekrarları ayrıştırmak mümkün değil.
      if(typeof date!=="string"||!dayOk(date)||date<=activated||date>today)continue;
      subject(parsed).reviews++;totalReviews++;
    }
  }
  const mastery=[...masteryMap.values()].map(row=>{
    const up=Math.floor(row.minutes/10)*2+Math.floor(row.questions/10)*3+row.reviews*5;
    return {...row,up,...tierOf(up)};
  }).sort((a,b)=>b.up-a.up||a.label.localeCompare(b.label,"tr"));
  const dayData=new Map<string,{minutes:number;questions:number}>();
  const dates=new Set([...Object.keys(state.pomoMin??{}),...Object.keys(state.solved??{})]);
  for(const day of dates){
    if(!dayOk(day)||day<activated||day>today)continue;
    dayData.set(day,rawDaily(state,profile,day));
  }
  const sorted=[...dayData.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
  const peak=(source:"minutes"|"questions")=>{
    const item=[...sorted].sort((a,b)=>b[1][source]-a[1][source]||a[0].localeCompare(b[0]))[0];
    return {value:item?.[1][source]??0,day:item?.[0]??""};
  };
  const dailyMinutes=peak("minutes"),dailyQuestions=peak("questions");
  let weeklyRecord={value:0,day:""},weekly=0,weekStart="";
  for(const [day,{minutes}] of sorted){
    const date=dayDate(day),monday=addDay(day,-((date.getDay()+6)%7));
    if(monday!==weekStart){weekly=0;weekStart=monday;}
    weekly+=minutes;
    if(weekly>weeklyRecord.value)weeklyRecord={value:weekly,day:monday};
  }
  const types=["TYT","AYT","YDT","BRANS"] as const;
  const exams:ExamProgress[]=types.map(type=>{
    const rows=(state.denemeler??[]).filter(x=>x&&x.type===type&&dayOk(String(x.date??""))&&
      String(x.date)>=activated&&String(x.date)<=today&&Number.isFinite(Number(x.at))&&Number(x.at)>=profile.activatedAt&&
      Number(x.at)<=now.getTime()&&Number.isFinite(Number(x.totalNet)))
      .sort((a,b)=>String(a.date).localeCompare(String(b.date))||Number(a.at)-Number(b.at));
    let gain=0;
    for(let i=1;i<rows.length;i++)gain=Math.max(gain,
      Number(rows[i]!.totalNet)-Number(rows[i-1]!.totalNet));
    return {type,count:rows.length,bestNet:rows.length?Math.max(...rows.map(x=>Number(x.totalNet))):null,
      lastNet:rows.length?Number(rows.at(-1)!.totalNet):null,maxGrowth:Math.round(gain*100)/100};
  });
  // Branş denemeleri farklı dersleri kapsayabildiğinden genel +5 net rozetinde karıştırılmaz.
  const maxNetGain=Math.max(0,...exams.filter(x=>x.type!=="BRANS").map(x=>x.maxGrowth));
  const records:PersonalRecord[]=[
    {id:"day-focus",label:"Bir günde en çok odak",value:dailyMinutes.value,unit:"dk",day:dailyMinutes.day},
    {id:"day-questions",label:"Bir günde en çok soru",value:dailyQuestions.value,unit:"soru",day:dailyQuestions.day},
    {id:"week-focus",label:"Bir haftada en çok odak",value:weeklyRecord.value,unit:"dk",day:weeklyRecord.day}
  ];
  let bestSession={minutes:0,day:""};
  for(const logs of Object.values(state.sessions??{})){
    if(!Array.isArray(logs))continue;
    for(const entry of logs){
      const stamp=Number(entry?.t);
      if(entry?.type!=="work"||entry.done!==true||!Number.isSafeInteger(stamp)||
        stamp<profile.activatedAt||stamp>now.getTime())continue;
      const minutes=number(entry.m,1440);
      if(minutes>bestSession.minutes)bestSession={minutes,day:localDay(new Date(stamp))};
    }
  }
  if(bestSession.minutes>0)records.push({id:"longest-session",label:"En uzun odak oturumu",
    value:bestSession.minutes,unit:"dk",day:bestSession.day});
  let bestSubject={minutes:0,day:"",name:""};
  for(const [day,row] of Object.entries(state.pomoSubj??{})){
    if(!dayOk(day)||day<activated||day>today||!row||typeof row!=="object")continue;
    for(const [name,value] of Object.entries(row)){
      const previous=day===activated?profile.baselineSubjectMinutes?.[name]:0;
      if(previous==null)continue;
      const minutes=Math.max(0,number(value,1440)-number(previous,1440));
      if(minutes>bestSubject.minutes)bestSubject={minutes,day,name:sourceName(name)?.label??name};
    }
  }
  if(bestSubject.minutes>0)records.push({id:"subject-day",label:"Bir günde en çok ders: "+bestSubject.name,
    value:bestSubject.minutes,unit:"dk",day:bestSubject.day});
  let bestParagraph={questions:0,day:""};
  for(const [day,row] of Object.entries(state.solvedTopic??{})){
    if(!dayOk(day)||day<activated||day>today||!row||typeof row!=="object")continue;
    let count=0;
    for(const [key,value] of Object.entries(row)){
      if(!key.toLocaleLowerCase("tr-TR").includes("paragraf"))continue;
      const previous=day===activated?profile.baselineTopicQuestions?.[key]:0;
      if(previous==null)continue;
      count+=Math.max(0,number(value,5000)-number(previous,5000));
    }
    if(count>bestParagraph.questions)bestParagraph={questions:count,day};
  }
  if(bestParagraph.questions>0)records.push({id:"paragraph-day",label:"Günlük paragraf soru rekoru",
    value:bestParagraph.questions,unit:"soru",day:bestParagraph.day});

  for(const exam of exams.filter(x=>x.type==="TYT"||x.type==="AYT")){
    if(exam.bestNet!=null)records.push({id:"best-"+exam.type.toLowerCase(),label:"En iyi "+exam.type+" neti",
      value:exam.bestNet,unit:"net",day:""});
  }
  const calendar:CalendarDay[]=[];
  const first=addDay(today,-365);
  for(let day=first;day<=today;day=addDay(day,1)){
    const status:CalendarDay["status"]=day<activated?"before-start":history[day]??"pending";
    const data=day>=activated?dayData.get(day)??{minutes:0,questions:0}:{minutes:0,questions:0};
    const goals=goalOn(profile,day);
    const completed=status==="completed";
    const xp=Math.min(120,Math.floor(data.minutes/2))+Math.min(80,Math.floor(data.questions/2))+
      (completed?50:0);
    const claims=profile.tasks?.claims??{};
    const claimedTasks=Object.keys(claims).filter(id=>id.startsWith("daily:"+day+":")).length;
    calendar.push({day,status,minutes:data.minutes,questions:data.questions,
      goalMinutes:goals.minutes,goalQuestions:goals.questions,xp,claimedTasks});
  }
  let earlyBird=false,nightOwl=false;
  for(const sessions of Object.values(state.sessions??{})){
    if(!Array.isArray(sessions))continue;
    for(const session of sessions){
      if(session?.type!=="work"||session.done!==true||number(session.m,1440)<30)continue;
      const timestamp=Number(session.t);
      if(!Number.isSafeInteger(timestamp)||timestamp<profile.activatedAt||timestamp>now.getTime())continue;
      const hour=new Date(timestamp).getHours();
      if(hour>=6&&hour<9)earlyBird=true;
      if(hour>=19&&hour<22)nightOwl=true;
    }
  }
  const lastMinute=Object.entries(profile.tasks?.claims??{}).some(([id,claim])=>
    id.startsWith("weekly:")&&Number.isFinite(claim?.at)&&claim.at>=profile.activatedAt&&
    claim.at<=now.getTime()&&new Date(claim.at).getDay()===0);
  let perfectWeek=false;
  const checkWeek=addDay(today,-((dayDate(today).getDay()+6)%7));
  for(let start=addDay(checkWeek,-7);start>=activated&&start>=addDay(today,-385);start=addDay(start,-7)){
    let success=0,rests=0,valid=true;
    for(let n=0;n<7;n++){
      const status=history[addDay(start,n)];
      if(status==="completed")success++;
      else if(status==="rest")rests++;
      else valid=false;
    }
    if(valid&&((success===6&&rests===1)||(success===7&&rests===0))){perfectWeek=true;break;}
  }
  return {
    mastery,records,exams,calendar,totalReviews,maxNetGain,
    bestSubjectMinutes:Math.max(0,...mastery.map(x=>x.minutes)),
    subjectsAt50Hours:mastery.filter(x=>x.minutes>=3000).length,
    hidden:{nightOwl,earlyBird,lastMinute,perfectWeek,
      surprise:mastery.filter(x=>x.up>=100).length>=3}
  };
}
