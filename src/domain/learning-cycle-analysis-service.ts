import type {WrongLogRecord,YksStateCandidate} from "../data/contracts";

export type LearningCycleStatus="returned"|"repeating"|"review"|"open"|"resolved"|"untracked";

export interface LearningCycleTopic{
  subject:string;
  topic:string;
  wrongTotal:number;
  wrongEvents:number;
  differentWrongDays:number;
  journalEntries:number;
  openJournal:number;
  pendingReviews:number;
  completedReviews:number;
  latestWrongDate:string;
  lastResolvedAt:number;
  latestJournalId:string;
  latestKind:string;
  returnedAfterResolve:boolean;
  status:LearningCycleStatus;
  priority:number;
}

export interface LearningCycleAnalysis{
  topics:LearningCycleTopic[];
  returned:number;
  repeating:number;
  pendingReviews:number;
  resolved:number;
  open:number;
  dataLevel:"empty"|"limited"|"ready";
  insights:string[];
}

type LooseRecord=Record<string,unknown>;

function text(value:unknown):string{return String(value??"").trim();}
function finite(value:unknown):number{return Number.isFinite(Number(value))?Number(value):0;}
function norm(value:unknown):string{return text(value).toLocaleLowerCase("tr-TR").replace(/\s+/g," ");}
function key(subject:unknown,topic:unknown):string{return `${norm(subject)}\u0000${norm(topic)}`;}
function rows(state:YksStateCandidate,name:string):LooseRecord[]{const value=state[name];return Array.isArray(value)?value.filter((item):item is LooseRecord=>!!item&&typeof item==="object"):[];}
function dateKey(value:unknown):string{return /^\d{4}-\d{2}-\d{2}$/.test(text(value))?text(value):"";}
function dayFromMs(value:unknown):string{const amount=finite(value);if(amount<=0)return "";try{return new Date(amount).toISOString().slice(0,10);}catch{return "";}}
function journalId(value:unknown):string{return text(value);}
function isDoneReview(row:LooseRecord):boolean{return finite(row.completedAt)>0;}
function statusOf(input:{returned:boolean;days:number;openJournal:number;pendingReviews:number;journalEntries:number}):LearningCycleStatus{
  if(input.returned)return "returned";
  if(input.days>=2&&input.openJournal>0)return "repeating";
  if(input.pendingReviews>0)return "review";
  if(input.openJournal>0)return "open";
  if(input.journalEntries>0)return "resolved";
  return "untracked";
}
function priorityOf(status:LearningCycleStatus,wrongTotal:number,pendingReviews:number,days:number):number{
  const base:Record<LearningCycleStatus,number>={returned:120,repeating:95,review:80,open:65,untracked:45,resolved:15};
  return base[status]+Math.min(30,wrongTotal*3)+Math.min(15,pendingReviews*5)+Math.min(10,days*2);
}

export function analyzeLearningCycle(state:YksStateCandidate):LearningCycleAnalysis{
  const wrongLog=((state.wrongLog??[]) as WrongLogRecord[]).filter(Boolean),journal=rows(state,"errorJournal"),reviews=rows(state,"manualReviews"),groups=new Map<string,{subject:string;topic:string;wrongs:WrongLogRecord[];journal:LooseRecord[];reviews:LooseRecord[]}>();
  const ensure=(subjectValue:unknown,topicValue:unknown)=>{
    const subject=text(subjectValue),topic=text(topicValue);if(!subject||!topic)return null;const id=key(subject,topic);let group=groups.get(id);if(!group){group={subject,topic,wrongs:[],journal:[],reviews:[]};groups.set(id,group);}return group;
  };
  wrongLog.forEach(row=>ensure(row.subject,row.topic)?.wrongs.push(row));
  journal.forEach(row=>ensure(row.subject,row.topic)?.journal.push(row));
  reviews.forEach(row=>ensure(row.subject,row.topic)?.reviews.push(row));

  const topics=[...groups.values()].map(group=>{
    const wrongTotal=group.wrongs.reduce((sum,row)=>sum+Math.max(1,finite(row.n)),0),wrongDays=[...new Set(group.wrongs.map(row=>dateKey(row.date)).filter(Boolean))].sort(),latestWrongDate=wrongDays.at(-1)??"";
    const openJournal=group.journal.filter(row=>!Boolean(row.resolved)).length,lastResolvedAt=Math.max(0,...group.journal.filter(row=>Boolean(row.resolved)).map(row=>finite(row.resolvedAt))),resolvedDay=dayFromMs(lastResolvedAt),returnedAfterResolve=!!(resolvedDay&&latestWrongDate&&latestWrongDate>resolvedDay);
    const pendingReviews=group.reviews.filter(row=>!isDoneReview(row)).length,completedReviews=group.reviews.filter(isDoneReview).length;
    const latestJournal=group.journal.slice().sort((a,b)=>finite(b.createdAt)-finite(a.createdAt))[0],latestWrong=group.wrongs.slice().sort((a,b)=>dateKey(b.date).localeCompare(dateKey(a.date))||finite(b.id)-finite(a.id))[0];
    const status=statusOf({returned:returnedAfterResolve,days:wrongDays.length,openJournal,pendingReviews,journalEntries:group.journal.length});
    return {subject:group.subject,topic:group.topic,wrongTotal,wrongEvents:group.wrongs.length,differentWrongDays:wrongDays.length,journalEntries:group.journal.length,openJournal,pendingReviews,completedReviews,latestWrongDate,lastResolvedAt,latestJournalId:journalId(latestJournal?.id),latestKind:text(latestWrong?.kind||latestJournal?.type),returnedAfterResolve,status,priority:priorityOf(status,wrongTotal,pendingReviews,wrongDays.length)} satisfies LearningCycleTopic;
  }).filter(item=>item.wrongTotal>0||item.journalEntries>0||item.pendingReviews>0).sort((a,b)=>b.priority-a.priority||b.wrongTotal-a.wrongTotal||a.topic.localeCompare(b.topic,"tr"));

  const returned=topics.filter(item=>item.status==="returned").length,repeating=topics.filter(item=>item.status==="repeating").length,pendingReviews=topics.reduce((sum,item)=>sum+item.pendingReviews,0),resolved=topics.filter(item=>item.status==="resolved").length,open=topics.filter(item=>item.openJournal>0).length;
  const signal=topics.reduce((sum,item)=>sum+item.wrongTotal+item.journalEntries+item.pendingReviews,0),dataLevel:LearningCycleAnalysis["dataLevel"]=signal===0?"empty":topics.length<2?"limited":"ready",insights:string[]=[];
  if(returned)insights.push(`${returned} konuda çözüldü işaretinden sonra yeni yanlış kaydı oluştu.`);
  if(repeating)insights.push(`${repeating} konu farklı günlerde tekrar eden açık hata sinyali veriyor.`);
  if(pendingReviews)insights.push(`${pendingReviews} Hata Defteri tekrarı tamamlanmayı bekliyor.`);
  if(!insights.length&&resolved)insights.push(`${resolved} konu hata döngüsünü şimdilik kapatmış görünüyor.`);
  if(!insights.length)insights.push("Yanlış ve Hata Defteri kayıtları arttıkça öğrenme döngüsü burada görünür olacak.");
  return {topics,returned,repeating,pendingReviews,resolved,open,dataLevel,insights:insights.slice(0,3)};
}

export const learningCycleAnalysisService={analyze:analyzeLearningCycle} as const;
