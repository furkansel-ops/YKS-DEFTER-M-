/** Pure local reminder scheduler: user goals remain the sole streak gate. */
import {calculateStudyGamification,keyOf} from "./study-gamification.ts";
import type {StudyGamificationState} from "./study-gamification.ts";
export type SmartReminderKind="goal-nudge"|"streak-risk"|"weekly-check";
export type SmartReminder={id:string;kind:SmartReminderKind;title:string;body:string};
export type ReminderSettings={enabled:boolean;quietStart:number;quietEnd:number;lastShown:Record<string,number>;maxPerDay:number};
export const defaultReminderSettings=():ReminderSettings=>({
  enabled:false,quietStart:22,quietEnd:8,lastShown:{},maxPerDay:2
});
export function validQuietHour(value:unknown):number{
  return typeof value==="number"&&Number.isInteger(value)&&value>=0&&value<=23?value:22;
}
export function isQuiet(hour:number,start:number,end:number):boolean{
  return start===end?false:start<end?hour>=start&&hour<end:hour>=start||hour<end;
}
export function recommendReminder(state:StudyGamificationState,now:Date,
  settings:ReminderSettings):SmartReminder|null{
  if(!settings.enabled||isQuiet(now.getHours(),settings.quietStart,settings.quietEnd))return null;
  const snap=calculateStudyGamification(state,now);
  if(!snap.activated||snap.todayCompleted||snap.history[keyOf(now)]==="rest")return null;
  const day=keyOf(now),prefix="smart:"+day+":";
  const shown=Object.keys(settings.lastShown).filter(k=>k.startsWith(prefix));
  if(shown.length>=Math.max(0,Math.min(2,settings.maxPerDay)))return null;
  const hour=now.getHours(),minutes=snap.goalMinutes-snap.todayMinutes,
    questions=snap.goalQuestions-snap.todayQuestions;
  if(hour>=20&&hour<22&&shown.length>0&&!settings.lastShown[prefix+"streak-risk"]){
    return {id:prefix+"streak-risk",kind:"streak-risk",title:"🔥 Günlük seri hatırlatması",
      body:"Bugünkü hedeflerin henüz tamamlanmadı. Uygulamadan kalan çalışmalarını kontrol et."};
  }
  if(hour>=17&&hour<20&&!settings.lastShown[prefix+"goal-nudge"]){
    const missing=minutes>0&&questions>0?"süre ve soru":minutes>0?"odak süresi":"soru";
    return {id:prefix+"goal-nudge",kind:"goal-nudge",title:"🎯 Günlük hedef kontrolü",
      body:"Bugün "+missing+" hedefin henüz tamamlanmadı. Planını gözden geçirebilirsin."};
  }
  return null;
}
export function recordReminder(settings:ReminderSettings,reminder:SmartReminder,now:Date):ReminderSettings{
  if(settings.lastShown[reminder.id])return settings;
  const history=Object.fromEntries(Object.entries(settings.lastShown)
    .filter(([,at])=>typeof at==="number"&&at>now.getTime()-21*86400000));
  history[reminder.id]=now.getTime();
  return {...settings,lastShown:history};
}
