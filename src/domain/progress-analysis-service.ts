import type {ExamRecord,SubjectResult,TopicProgress,WrongLogRecord,YksStateCandidate} from "../data/contracts";
import {addDaysToKey,parseDateKey,todayDateKey} from "../services/date-service.ts";
import type {SubjectDefinition} from "./contracts";

export type TrendDirection="up"|"down"|"flat"|"unknown";

export interface ProgressPeriodSnapshot{
  days:number;
  minutes:number;
  questions:number;
  activeDays:number;
  completedTopics:number;
}

export interface ProgressDelta{
  absolute:number;
  percent:number|null;
  direction:TrendDirection;
}

export interface ExamTrend{
  type:string;
  currentAverage:number|null;
  previousAverage:number|null;
  delta:number|null;
  currentCount:number;
  previousCount:number;
}

export interface SubjectInsight{
  name:string;
  minutes:number;
  questions:number;
  wrongs:number;
  examPercent:number|null;
  examDelta:number|null;
  examSamples:number;
  topicPercent:number|null;
  evidence:string[];
}

export interface ReviewSnapshot{
  due:number;
  completed:number;
  pending:number;
  overdue:number;
  completionPercent:number|null;
}

export interface StudyRhythm{
  consistencyPercent:number;
  currentStreak:number;
  longestStreak:number;
  bestDay:string|null;
  averageMinutesPerActiveDay:number;
}

export interface ProgressAnalysis{
  generatedAt:string;
  days:number;
  current:ProgressPeriodSnapshot;
  previous:ProgressPeriodSnapshot;
  deltas:{minutes:ProgressDelta;questions:ProgressDelta;activeDays:ProgressDelta;completedTopics:ProgressDelta};
  exam:ExamTrend;
  subjects:SubjectInsight[];
  strongest:SubjectInsight|null;
  needsAttention:SubjectInsight|null;
  topic:{completed:number;total:number;percent:number};
  reviews:ReviewSnapshot;
  rhythm:StudyRhythm;
  insights:string[];
  dataLevel:"empty"|"limited"|"ready";
}

interface PeriodBounds{start:string;end:string;}
interface MutableSubject{
  name:string;minutes:number;questions:number;wrongs:number;examValues:number[];previousExamValues:number[];
  topicPoints:number;topicTotal:number;
}

const DAY_LABELS=["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"] as const;

function finite(value:unknown):number{return Number.isFinite(Number(value))?Number(value):0;}
function round(value:number,digits=1):number{const power=10**digits;return Math.round(value*power)/power;}
function canonicalSubject(value:unknown):string{
  const name=String(value??"").trim().replace(/ \(AYT\)$/u,"");
  return name==="Temel Matematik"?"Matematik":name;
}
function bounds(today:string,days:number,offset=0):PeriodBounds{
  const end=addDaysToKey(today,-offset);return {start:addDaysToKey(end,-days+1),end};
}
function inBounds(value:unknown,period:PeriodBounds):value is string{
  return typeof value==="string"&&value>=period.start&&value<=period.end;
}
function delta(current:number,previous:number):ProgressDelta{
  const absolute=round(current-previous,1),direction:TrendDirection=absolute>0?"up":absolute<0?"down":"flat";
  return {absolute,percent:previous>0?Math.round(absolute/previous*100):(current>0?null:0),direction};
}
function topicKey(subject:SubjectDefinition,topic:string):string{return `${subject.exam}|${subject.name}|${topic}`;}
function recordFor(state:YksStateCandidate,key:string):TopicProgress|undefined{return state.topics?.[key] as TopicProgress|undefined;}

function periodSnapshot(state:YksStateCandidate,today:string,days:number,offset:number):ProgressPeriodSnapshot{
  const period=bounds(today,days,offset);let minutes=0,questions=0,activeDays=0,completedTopics=0;
  for(let index=0;index<days;index++){
    const key=addDaysToKey(period.end,-index),dayMinutes=finite(state.pomoMin?.[key]),dayQuestions=finite(state.solved?.[key]);
    minutes+=dayMinutes;questions+=dayQuestions;if(dayMinutes>0||dayQuestions>0)activeDays++;
  }
  for(const topic of Object.values(state.topics??{}))if(topic?.st===3&&inBounds(topic.ts,period))completedTopics++;
  return {days,minutes:Math.round(minutes),questions:Math.round(questions),activeDays,completedTopics};
}

function latestExamType(exams:ExamRecord[],current:PeriodBounds):string{
  const currentLatest=exams.filter(exam=>exam.type!=="BRANS"&&inBounds(exam.date,current)).sort((a,b)=>b.date.localeCompare(a.date)||(finite(b.id)-finite(a.id)))[0];
  if(currentLatest)return currentLatest.type;
  return exams.filter(exam=>exam.type!=="BRANS").sort((a,b)=>b.date.localeCompare(a.date)||(finite(b.id)-finite(a.id)))[0]?.type??"";
}
function average(values:number[]):number|null{return values.length?round(values.reduce((sum,value)=>sum+value,0)/values.length,1):null;}
function examTrend(state:YksStateCandidate,today:string,days:number):ExamTrend{
  const exams=(state.denemeler??[]) as ExamRecord[],current=bounds(today,days),previous=bounds(today,days,days),type=latestExamType(exams,current);
  const values=(period:PeriodBounds)=>exams.filter(exam=>exam.type!=="BRANS"&&(!type||exam.type===type)&&inBounds(exam.date,period)).map(exam=>finite(exam.totalNet));
  const currentValues=values(current),previousValues=values(previous),currentAverage=average(currentValues),previousAverage=average(previousValues);
  return {type,currentAverage,previousAverage,delta:currentAverage!=null&&previousAverage!=null?round(currentAverage-previousAverage,1):null,currentCount:currentValues.length,previousCount:previousValues.length};
}

function subjectRow(map:Map<string,MutableSubject>,nameValue:unknown):MutableSubject|null{
  const name=canonicalSubject(nameValue);if(!name)return null;
  let row=map.get(name);if(!row){row={name,minutes:0,questions:0,wrongs:0,examValues:[],previousExamValues:[],topicPoints:0,topicTotal:0};map.set(name,row);}return row;
}
function addExamSubjects(map:Map<string,MutableSubject>,exam:ExamRecord,previous:boolean):void{
  for(const result of (exam.subjectResults??[]) as SubjectResult[]){
    const capacity=finite(result.cap);if(capacity<=0)continue;const row=subjectRow(map,result.name);if(!row)continue;
    (previous?row.previousExamValues:row.examValues).push(finite(result.net)/capacity*100);
  }
}
function topicStatusPercent(row:MutableSubject):number|null{return row.topicTotal?Math.round(row.topicPoints/(row.topicTotal*3)*100):null;}
function evidenceFor(row:MutableSubject,examPercent:number|null,examDelta:number|null,topicPercent:number|null):string[]{
  const evidence:string[]=[];
  if(row.examValues.length)evidence.push(`${row.examValues.length} denemede %${Math.round(examPercent??0)} başarı`);
  if(examDelta!=null)evidence.push(`önceki döneme göre ${examDelta>0?"+":""}${round(examDelta,1)} puan`);
  if(row.minutes)evidence.push(`${Math.round(row.minutes)} dk çalışma`);
  if(row.questions)evidence.push(`${Math.round(row.questions)} soru`);
  if(row.wrongs)evidence.push(`${Math.round(row.wrongs)} yanlış kaydı`);
  if(topicPercent!=null)evidence.push(`konular %${topicPercent}`);
  return evidence.slice(0,3);
}
function subjectInsights(state:YksStateCandidate,subjects:SubjectDefinition[],today:string,days:number):SubjectInsight[]{
  const map=new Map<string,MutableSubject>(),current=bounds(today,days),previous=bounds(today,days,days);
  for(const definition of subjects){const row=subjectRow(map,definition.name);if(!row)continue;for(const topic of definition.topics){const record=recordFor(state,topicKey(definition,topic));row.topicTotal++;row.topicPoints+=Math.max(0,Math.min(3,finite(record?.st)));}}
  for(const [date,values] of Object.entries(state.pomoSubj??{}))if(inBounds(date,current))for(const [name,value] of Object.entries(values??{})){const row=subjectRow(map,name);if(row)row.minutes+=finite(value);}
  for(const [date,values] of Object.entries(state.solvedTopic??{}))if(inBounds(date,current))for(const [key,value] of Object.entries(values??{})){const row=subjectRow(map,String(key).split("|")[1]);if(row)row.questions+=finite(value);}
  for(const wrong of (state.wrongLog??[]) as WrongLogRecord[])if(inBounds(wrong.date,current)){const row=subjectRow(map,wrong.subject);if(row)row.wrongs+=Math.max(1,finite(wrong.n));}
  for(const exam of (state.denemeler??[]) as ExamRecord[]){if(exam.type==="BRANS")continue;if(inBounds(exam.date,current))addExamSubjects(map,exam,false);else if(inBounds(exam.date,previous))addExamSubjects(map,exam,true);}
  return [...map.values()].map(row=>{
    const examPercent=average(row.examValues),previousPercent=average(row.previousExamValues),examDelta=examPercent!=null&&previousPercent!=null?round(examPercent-previousPercent,1):null,topicPercent=topicStatusPercent(row);
    return {name:row.name,minutes:Math.round(row.minutes),questions:Math.round(row.questions),wrongs:Math.round(row.wrongs),examPercent,examDelta,examSamples:row.examValues.length,topicPercent,evidence:evidenceFor(row,examPercent,examDelta,topicPercent)};
  }).filter(row=>row.minutes>0||row.questions>0||row.wrongs>0||row.examSamples>0||(row.topicPercent??0)>0).sort((a,b)=>(b.minutes+b.questions+b.examSamples*30)-(a.minutes+a.questions+a.examSamples*30));
}

function selectStrongest(rows:SubjectInsight[]):SubjectInsight|null{
  const reliable=rows.filter(row=>row.examSamples>=2&&row.examPercent!=null);if(reliable.length)return reliable.sort((a,b)=>(b.examPercent??0)-(a.examPercent??0))[0]!;
  const active=rows.filter(row=>row.minutes>=60||row.questions>=40);return active.sort((a,b)=>(b.topicPercent??0)-(a.topicPercent??0)||b.questions-a.questions||b.minutes-a.minutes)[0]??null;
}
function selectNeedsAttention(rows:SubjectInsight[]):SubjectInsight|null{
  const evidenced=rows.filter(row=>row.wrongs>=2||(row.examSamples>=2&&row.examPercent!=null));
  return evidenced.sort((a,b)=>{
    const aRisk=a.wrongs*8+(a.examSamples>=2?100-(a.examPercent??100):0)+(a.examDelta!=null&&a.examDelta<0?Math.abs(a.examDelta)*2:0);
    const bRisk=b.wrongs*8+(b.examSamples>=2?100-(b.examPercent??100):0)+(b.examDelta!=null&&b.examDelta<0?Math.abs(b.examDelta)*2:0);
    return bRisk-aRisk;
  })[0]??null;
}

function reviewSnapshot(state:YksStateCandidate,today:string,gaps:number[]):ReviewSnapshot{
  let due=0,completed=0,pending=0,overdue=0;
  for(const topic of Object.values(state.topics??{})){
    if(topic?.st!==3||typeof topic.ts!=="string")continue;
    const completedAt=topic.ts;gaps.forEach((gap,index)=>{const dueDate=addDaysToKey(completedAt,finite(gap)),done=Array.isArray(topic.rev)&&topic.rev.includes(index);if(dueDate<=today){due++;if(done)completed++;else{pending++;if(dueDate<today)overdue++;}}});
  }
  return {due,completed,pending,overdue,completionPercent:due?Math.round(completed/due*100):null};
}
function rhythm(state:YksStateCandidate,today:string,days:number,current:ProgressPeriodSnapshot):StudyRhythm{
  let currentStreak=0,longestStreak=0,rolling=0,bestScore=0,bestDay:string|null=null;
  for(let index=days-1;index>=0;index--){const key=addDaysToKey(today,-index),minutes=finite(state.pomoMin?.[key]),questions=finite(state.solved?.[key]),active=minutes>0||questions>0;if(active){rolling++;longestStreak=Math.max(longestStreak,rolling);const score=minutes+questions;if(score>bestScore){bestScore=score;bestDay=DAY_LABELS[parseDateKey(key).getDay()]??null;}}else rolling=0;}
  for(let index=0;index<days;index++){const key=addDaysToKey(today,-index);if(finite(state.pomoMin?.[key])>0||finite(state.solved?.[key])>0)currentStreak++;else break;}
  return {consistencyPercent:Math.round(current.activeDays/days*100),currentStreak,longestStreak,bestDay,averageMinutesPerActiveDay:current.activeDays?Math.round(current.minutes/current.activeDays):0};
}
function insightLines(analysis:Omit<ProgressAnalysis,"insights">):string[]{
  if(analysis.dataLevel==="empty")return ["İlk çalışma veya soru kaydından sonra değişim analizi burada oluşacak."];
  const lines:string[]=[];
  const minuteDelta=analysis.deltas.minutes;
  if(analysis.previous.minutes||analysis.current.minutes)lines.push(minuteDelta.direction==="up"?`Çalışma süren önceki ${analysis.days} güne göre ${minuteDelta.percent==null?`${minuteDelta.absolute} dk`: `%${Math.abs(minuteDelta.percent)} arttı`}.`:minuteDelta.direction==="down"?`Çalışma süren önceki döneme göre %${Math.abs(minuteDelta.percent??0)} azaldı.`:"Çalışma süren önceki dönemle aynı düzeyde.");
  if(analysis.exam.delta!=null)lines.push(`${analysis.exam.type} deneme ortalaman ${analysis.exam.delta>0?"+":""}${analysis.exam.delta} net değişti.`);
  if(analysis.needsAttention)lines.push(`${analysis.needsAttention.name} dikkat istiyor: ${analysis.needsAttention.evidence[0]??"kayıtlar diğer derslerin gerisinde"}.`);
  else if(analysis.strongest)lines.push(`${analysis.strongest.name} öne çıkıyor: ${analysis.strongest.evidence[0]??"çalışma düzeni güçlü"}.`);
  return lines.slice(0,3);
}

export function analyzeProgress(state:YksStateCandidate,subjects:SubjectDefinition[],reviewGaps:number[],options:{today?:string;days?:number}={}):ProgressAnalysis{
  const today=options.today??todayDateKey(),days=[7,30,90].includes(options.days??30)?options.days??30:30,current=periodSnapshot(state,today,days,0),previous=periodSnapshot(state,today,days,days),exam=examTrend(state,today,days),rows=subjectInsights(state,subjects,today,days),strongest=selectStrongest(rows),needsAttention=selectNeedsAttention(rows),reviews=reviewSnapshot(state,today,reviewGaps),studyRhythm=rhythm(state,today,days,current);
  let totalTopics=0,topicPoints=0,completed=0;for(const definition of subjects)for(const topic of definition.topics){totalTopics++;const record=recordFor(state,topicKey(definition,topic));topicPoints+=Math.max(0,Math.min(3,finite(record?.st)));if(record?.st===3)completed++;}
  const signals=current.minutes+current.questions+current.completedTopics+exam.currentCount+rows.reduce((sum,row)=>sum+row.wrongs,0),dataLevel:ProgressAnalysis["dataLevel"]=signals===0?"empty":current.activeDays<3&&exam.currentCount<2?"limited":"ready";
  const base:Omit<ProgressAnalysis,"insights">={generatedAt:new Date().toISOString(),days,current,previous,deltas:{minutes:delta(current.minutes,previous.minutes),questions:delta(current.questions,previous.questions),activeDays:delta(current.activeDays,previous.activeDays),completedTopics:delta(current.completedTopics,previous.completedTopics)},exam,subjects:rows,strongest,needsAttention,topic:{completed,total:totalTopics,percent:totalTopics?Math.round(topicPoints/(totalTopics*3)*100):0},reviews,rhythm:studyRhythm,dataLevel};
  return {...base,insights:insightLines(base)};
}

export const progressAnalysisService={analyze:analyzeProgress} as const;
