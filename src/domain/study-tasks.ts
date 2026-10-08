/** Aşama 2: ölçülebilir günlük ve haftalık görevler.
 * Sadece daha önce başlatılmış dönemlere ait görevler ödül üretebilir.
 * Çalışma verilerinden ilerleme hesaplanır, rozet/XP kaydı bir kez yapılır.
 */
import {keyOf,shiftDay,calculateStudyGamification} from "./study-gamification.ts";
import type {GamificationProfile,StudyGamificationState,DailyGoal} from "./study-gamification.ts";

export type TaskDifficulty="easy"|"normal"|"hard";
export type TaskMetric="focus"|"questions"|"balanced"|"extra-focus"|"extra-questions";
export type TaskScope="daily"|"weekly";
export type StudyTask={
  id:string;scope:TaskScope;period:string;metric:TaskMetric;
  title:string;difficulty:TaskDifficulty;xp:number;
  goalMinutes:number;goalQuestions:number;createdAt:number;
};
export type TaskClaim={at:number;xp:number};
export type TaskSettings={from:string;difficulty:TaskDifficulty};
export type StudyTaskStore={
  daily:Record<string,StudyTask[]>;
  weekly:Record<string,StudyTask[]>;
  claims:Record<string,TaskClaim>;
  difficultySchedule:TaskSettings[];
  rerolledDays:string[];
};
export type StudyTaskView={
  task:StudyTask;minutes:number;questions:number;
  progress:number;complete:boolean;claimed:boolean;expired:boolean;
  label:string;
};
export type TaskPanelSnapshot={
  day:string;week:string;difficulty:TaskDifficulty;nextDifficulty:TaskDifficulty;
  daily:StudyTaskView[];weekly:StudyTaskView[];
  dailyEarned:number;weeklyEarned:number;rewardXp:number;
  canReroll:boolean;restToday:boolean;
};
const LEVEL_RATE:Record<TaskDifficulty,number>={easy:.5,normal:.75,hard:1};
const DAILY_XP:Record<TaskDifficulty,number>={easy:15,normal:25,hard:35};

function dayOk(day:string):boolean{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return false;
  const y=Number(day.slice(0,4)),m=Number(day.slice(5,7)),d=Number(day.slice(8));
  const parsed=new Date(y,m-1,d,12);
  return y>=2000&&parsed.getFullYear()===y&&parsed.getMonth()===m-1&&parsed.getDate()===d;
}
function safeCount(value:unknown,max:number):number{
  const n=Number(value);
  return Number.isFinite(n)?Math.min(max,Math.max(0,Math.floor(n))):0;
}
function validDifficulty(value:unknown):TaskDifficulty{
  return value==="easy"||value==="hard"?value:"normal";
}
function cloneStore(store:StudyTaskStore):StudyTaskStore{
  return {daily:{...store.daily},weekly:{...store.weekly},claims:{...store.claims},
    difficultySchedule:[...store.difficultySchedule],rerolledDays:[...store.rerolledDays]};
}
export function taskStore(profile:GamificationProfile):StudyTaskStore{
  const existing=profile.tasks;
  return {
    daily:existing?.daily&&typeof existing.daily==="object"?existing.daily:{},
    weekly:existing?.weekly&&typeof existing.weekly==="object"?existing.weekly:{},
    claims:existing?.claims&&typeof existing.claims==="object"?existing.claims:{},
    difficultySchedule:Array.isArray(existing?.difficultySchedule)?existing.difficultySchedule:[],
    rerolledDays:Array.isArray(existing?.rerolledDays)?existing.rerolledDays:[]
  };
}
function mondayOf(day:string):string{
  const d=new Date(Number(day.slice(0,4)),Number(day.slice(5,7))-1,Number(day.slice(8)),12);
  return shiftDay(day,-((d.getDay()+6)%7));
}
export function difficultyForDay(profile:GamificationProfile,day:string):TaskDifficulty{
  const rows=taskStore(profile).difficultySchedule.filter(x=>dayOk(x.from)&&x.from<=day)
    .sort((a,b)=>a.from.localeCompare(b.from));
  return validDifficulty(rows.at(-1)?.difficulty);
}
export function scheduleDifficulty(profile:GamificationProfile,now:Date,difficulty:TaskDifficulty):GamificationProfile{
  if(!["easy","normal","hard"].includes(difficulty))throw new Error("Geçersiz görev zorluğu.");
  const from=shiftDay(keyOf(now),1);
  const store=cloneStore(taskStore(profile));
  store.difficultySchedule=[...store.difficultySchedule.filter(x=>x.from!==from),{from,difficulty}]
    .sort((a,b)=>a.from.localeCompare(b.from));
  return {...profile,tasks:store};
}
function goalOn(profile:GamificationProfile,day:string):DailyGoal{
  return [...profile.goals].filter(x=>dayOk(x.from)&&x.from<=day)
    .sort((a,b)=>a.from.localeCompare(b.from)).at(-1)
    ??{from:profile.activationDay,minutes:90,questions:60};
}
function effectiveDay(state:StudyGamificationState,profile:GamificationProfile,day:string){
  const offset=day===profile.activationDay;
  return {
    minutes:Math.max(0,safeCount(state.pomoMin?.[day],1440)-(offset?profile.baselineMinutes:0)),
    questions:Math.max(0,safeCount(state.solved?.[day],5000)-(offset?profile.baselineQuestions:0))
  };
}
function restDays(profile:GamificationProfile):Set<string>{
  const used=new Set<string>(),days=new Set<string>();
  for(const day of [...(profile.restDays??[])].sort()){
    if(!dayOk(day)||day<profile.activationDay)continue;
    const week=mondayOf(day);
    if(!used.has(week)){used.add(week);days.add(day);}
  }
  return days;
}
function eligibleWeeklyDays(profile:GamificationProfile,monday:string):string[]{
  const days=restDays(profile),end=shiftDay(monday,6),out:string[]=[];
  for(let day=monday;day<=end;day=shiftDay(day,1)){
    if(day>=profile.activationDay&&!days.has(day))out.push(day);
  }
  return out;
}
function dailyTask(profile:GamificationProfile,day:string,metric:TaskMetric,slot:number,now:Date):StudyTask{
  const goal=goalOn(profile,day),difficulty=difficultyForDay(profile,day);
  const factor=LEVEL_RATE[difficulty];
  let goalMinutes=0,goalQuestions=0,title="";
  if(metric==="focus"){goalMinutes=Math.max(10,Math.round(goal.minutes*factor));title=goalMinutes+" dakika odaklan";}
  else if(metric==="questions"){goalQuestions=Math.max(5,Math.round(goal.questions*factor));title=goalQuestions+" soru çöz";}
  else if(metric==="extra-focus"){goalMinutes=Math.max(10,Math.round(goal.minutes*(factor+.2)));title=goalMinutes+" dakika odak bonusu";}
  else if(metric==="extra-questions"){goalQuestions=Math.max(5,Math.round(goal.questions*(factor+.2)));title=goalQuestions+" soru bonusu";}
  else {goalMinutes=Math.max(10,Math.round(goal.minutes*factor*.65));goalQuestions=Math.max(5,Math.round(goal.questions*factor*.65));title="Dengeli çalışma: "+goalMinutes+" dk + "+goalQuestions+" soru";}
  return {id:"daily:"+day+":"+slot,scope:"daily",period:day,metric,title,difficulty,
    xp:DAILY_XP[difficulty],goalMinutes,goalQuestions,createdAt:now.getTime()};
}
function weeklyTasks(profile:GamificationProfile,week:string,now:Date):StudyTask[]{
  const days=eligibleWeeklyDays(profile,week),difficulty=difficultyForDay(profile,keyOf(now));
  const factor=LEVEL_RATE[difficulty];
  const minuteTarget=days.reduce((sum,day)=>sum+goalOn(profile,day).minutes,0);
  const questionTarget=days.reduce((sum,day)=>sum+goalOn(profile,day).questions,0);
  const minutes=Math.max(10,Math.round(minuteTarget*factor));
  const questions=Math.max(5,Math.round(questionTarget*factor));
  return [
    {id:"weekly:"+week+":focus",scope:"weekly",period:week,metric:"focus",title:"Odak maratonu: "+minutes+" dk",
      difficulty,xp:100,goalMinutes:minutes,goalQuestions:0,createdAt:now.getTime()},
    {id:"weekly:"+week+":questions",scope:"weekly",period:week,metric:"questions",title:"Soru maratonu: "+questions+" soru",
      difficulty,xp:100,goalMinutes:0,goalQuestions:questions,createdAt:now.getTime()}
  ];
}
/** Her iki türün de dönemi ilk kez açıldığında tek seferlik, değişmez tanımı kaydedilir. */
export function ensureCurrentTasks(profile:GamificationProfile,now:Date):GamificationProfile{
  const day=keyOf(now);
  if(day<profile.activationDay||now.getTime()<profile.activatedAt)return profile;
  const week=mondayOf(day),store=cloneStore(taskStore(profile));
  let dirty=false;
  if(!Array.isArray(store.daily[day])&&!restDays(profile).has(day)){
    store.daily[day]=[dailyTask(profile,day,"focus",0,now),
      dailyTask(profile,day,"questions",1,now),dailyTask(profile,day,"balanced",2,now)];
    dirty=true;
  }
  if(!Array.isArray(store.weekly[week])){
    store.weekly[week]=weeklyTasks(profile,week,now);
    dirty=true;
  }
  return dirty?{...profile,tasks:store}:profile;
}
function measured(state:StudyGamificationState,profile:GamificationProfile,task:StudyTask){
  if(task.scope==="daily")return effectiveDay(state,profile,task.period);
  const start=task.period,end=shiftDay(start,6),total={minutes:0,questions:0};
  for(let day=start;day<=end;day=shiftDay(day,1)){
    if(day<profile.activationDay)continue;
    const record=effectiveDay(state,profile,day);
    total.minutes+=record.minutes;total.questions+=record.questions;
  }
  return total;
}
export function taskView(state:StudyGamificationState,profile:GamificationProfile,
  task:StudyTask,now:Date):StudyTaskView{
  const data=measured(state,profile,task),store=taskStore(profile);
  const values=[
    ...(task.goalMinutes>0?[Math.min(1,data.minutes/task.goalMinutes)]:[]),
    ...(task.goalQuestions>0?[Math.min(1,data.questions/task.goalQuestions)]:[])
  ];
  const progress=Math.round((values.length?Math.min(...values):0)*100);
  const claim=store.claims[task.id];
  const claimed=!!claim&&Number.isFinite(claim.at)&&claim.at>0;
  const expired=task.scope==="daily"?task.period<keyOf(now):shiftDay(task.period,6)<keyOf(now);
  return {task,minutes:data.minutes,questions:data.questions,progress,
    complete:progress===100,claimed,expired,
    label:[task.goalMinutes?data.minutes+" / "+task.goalMinutes+" dk":"",
      task.goalQuestions?data.questions+" / "+task.goalQuestions+" soru":""].filter(Boolean).join(" · ")};
}
function allTasks(store:StudyTaskStore):StudyTask[]{
  return [...Object.values(store.daily),...Object.values(store.weekly)]
    .flat().filter((t):t is StudyTask=>!!t&&typeof t.id==="string"&&
      (t.scope==="daily"||t.scope==="weekly")&&dayOk(t.period));
}
/** Offline kayıtlar sonradan gelirse, daha önceden atanmış göreve ait XP de doğrulanabilir. */
export function grantCompletedTasks(state:StudyGamificationState,profile:GamificationProfile,
  now:Date):{profile:GamificationProfile;granted:StudyTask[]}{
  const store=cloneStore(taskStore(profile)),granted:StudyTask[]=[];
  const today=keyOf(now),rests=restDays(profile);
  for(const task of allTasks(store)){
    if(task.period>today||task.createdAt<profile.activatedAt||task.createdAt>now.getTime())continue;
    if(task.scope==="daily"&&rests.has(task.period))continue;
    if(store.claims[task.id])continue;
    const view=taskView(state,profile,task,now);
    if(!view.complete)continue;
    store.claims[task.id]={at:now.getTime(),xp:task.xp};
    granted.push(task);
  }
  return {profile:granted.length?{...profile,tasks:store}:profile,granted};
}
/** Günlük yeniden seçme ancak ilerleme başlamadıysa ve günde bir defa mümkündür. */
export function rerollDailyTask(state:StudyGamificationState,profile:GamificationProfile,
  now:Date,id:string):GamificationProfile{
  const day=keyOf(now),store=cloneStore(taskStore(profile));
  if(store.rerolledDays.includes(day))throw new Error("Günlük değiştirme hakkın kullanıldı.");
  if(restDays(profile).has(day))throw new Error("Dinlenme gününde görev değiştirilemez.");
  const tasks=store.daily[day],index=tasks?.findIndex(task=>task.id===id)??-1;
  if(index<0||!tasks)throw new Error("Değiştirilecek görev bulunamadı.");
  const current=tasks[index]!;
  if(store.claims[current.id]||taskView(state,profile,current,now).progress>0)
    throw new Error("Başlanmış görev değiştirilemez.");
  const kind:TaskMetric=current.goalQuestions>0&&current.goalMinutes===0?"extra-focus":"extra-questions";
  const replaced=dailyTask(profile,day,kind,Number(current.id.split(":").at(-1)),now);
  store.daily[day]=tasks.map((task,i)=>i===index?replaced:task);
  store.rerolledDays=[...store.rerolledDays,day];
  return {...profile,tasks:store};
}
export function taskPanel(state:StudyGamificationState,now=new Date()):TaskPanelSnapshot{
  const profile=state.gamification,day=keyOf(now),week=mondayOf(day);
  if(!profile||now.getTime()<profile.activatedAt){
    return {day,week,difficulty:"normal",nextDifficulty:"normal",daily:[],weekly:[],
      dailyEarned:0,weeklyEarned:0,rewardXp:0,canReroll:false,restToday:false};
  }
  const store=taskStore(profile),rests=restDays(profile);
  const daily=(rests.has(day)?[]:store.daily[day]??[]).map(t=>taskView(state,profile,t,now));
  const weekly=(store.weekly[week]??[]).map(t=>{
    const view=taskView(state,profile,t,now);
    // Haftada dinlenme günü sonradan planlandıysa haftalık hedef yalnız düşebilir.
    const effectiveDays=eligibleWeeklyDays(profile,week);
    const multiplier=LEVEL_RATE[t.difficulty];
    const target=t.goalMinutes>0?
      Math.max(10,Math.round(effectiveDays.reduce((sum,k)=>sum+goalOn(profile,k).minutes,0)*multiplier)):
      Math.max(5,Math.round(effectiveDays.reduce((sum,k)=>sum+goalOn(profile,k).questions,0)*multiplier));
    if(t.goalMinutes>0){
      const newGoal=Math.min(t.goalMinutes,target);
      return {...view,progress:Math.min(100,Math.round(view.minutes/newGoal*100)),
        complete:view.minutes>=newGoal,label:view.minutes+" / "+newGoal+" dk"};
    }
    const newGoal=Math.min(t.goalQuestions,target);
    return {...view,progress:Math.min(100,Math.round(view.questions/newGoal*100)),
      complete:view.questions>=newGoal,label:view.questions+" / "+newGoal+" soru"};
  });
  const rewardXp=Object.values(store.claims).reduce((sum,c)=>sum+
    (Number.isFinite(c?.xp)&&c.xp>=0&&c.xp<=100?c.xp:0),0);
  return {day,week,difficulty:difficultyForDay(profile,day),
    nextDifficulty:difficultyForDay(profile,shiftDay(day,1)),daily,weekly,
    dailyEarned:daily.filter(x=>x.claimed).reduce((sum,x)=>sum+x.task.xp,0),
    weeklyEarned:weekly.filter(x=>x.claimed).reduce((sum,x)=>sum+x.task.xp,0),
    rewardXp,restToday:rests.has(day),
    canReroll:!store.rerolledDays.includes(day)&&!rests.has(day)};
}
