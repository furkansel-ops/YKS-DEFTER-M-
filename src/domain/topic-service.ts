import {addDaysToKey,daysBetweenKeys} from "../services/date-service.ts";
import type {IsoDateKey} from "../data/contracts";
import type {ReviewQueueEntry,SubjectDefinition,SubjectProgressSummary,TopicConfidence,TopicGoalEntry,TopicGoalSummary,TopicProgressSnapshot,TopicRecord,TopicStateSlice,TopicStatus,UpcomingReviewEntry} from "./contracts";

export function topicKey(exam:string,subject:string,topic:string):string{
  return `${exam}|${subject}|${topic}`;
}

export function topicFor(state:TopicStateSlice,key:string):TopicRecord{
  return state.topics[key]??{st:0,conf:0,ts:null,rev:[]};
}

export function setTopicStatus(state:TopicStateSlice,key:string,status:TopicStatus,today:IsoDateKey|string):TopicRecord|null{
  const topic:TopicRecord={conf:0,ts:null,rev:[],...state.topics[key],st:status};
  if(status===3&&!topic.ts)topic.ts=today as IsoDateKey;
  if(status<3){topic.ts=null;topic.rev=[];topic.revDone={};}
  if(status===0&&!topic.conf&&!topic.dl){delete state.topics[key];return null;}
  state.topics[key]=topic;
  return topic;
}

export function setTopicConfidence(state:TopicStateSlice,key:string,confidence:TopicConfidence):TopicRecord|null{
  const current=state.topics[key],topic:TopicRecord={st:0,conf:0,ts:null,rev:[],...current};
  topic.conf=topic.conf===confidence?0:confidence;
  if(topic.st===0&&!topic.conf&&!topic.dl){delete state.topics[key];return null;}
  state.topics[key]=topic;
  return topic;
}

export function subjectProgress(state:TopicStateSlice,exam:string,subject:Pick<SubjectDefinition,"name"|"topics">):SubjectProgressSummary{
  let sum=0,full=0;
  for(const topic of subject.topics){
    const progress=topicFor(state,topicKey(exam,subject.name,topic));
    sum+=progress.st;
    if(progress.st===3)full++;
  }
  return {pct:Math.round(sum/(3*subject.topics.length)*100),full,total:subject.topics.length};
}

export function overallTopicProgress(state:TopicStateSlice,subjects:readonly SubjectDefinition[]):number{
  let sum=0,total=0;
  for(const subject of subjects){
    for(const topic of subject.topics){total+=3;sum+=topicFor(state,topicKey(subject.exam,subject.name,topic)).st;}
  }
  return total?Math.round(sum/total*100):0;
}

export function examTopicProgress(state:TopicStateSlice,subjects:readonly SubjectDefinition[],exam:string):TopicProgressSnapshot{
  const rows=subjects.filter(subject=>subject.exam===exam).flatMap(subject=>subject.topics.map(topic=>topicFor(state,topicKey(exam,subject.name,topic))));
  const total=rows.length,done=rows.filter(topic=>topic.st===3).length,working=rows.filter(topic=>topic.st===1||topic.st===2).length;
  const steps=rows.reduce((sum,topic)=>sum+Math.max(0,Math.min(3,Number(topic.st)||0)),0);
  return {exam,pct:total?Math.round(steps/(total*3)*100):0,done,working,untouched:Math.max(0,total-done-working),total,remainingSteps:Math.max(0,total*3-steps)};
}

export function topicGoals(state:TopicStateSlice,today:IsoDateKey|string):TopicGoalSummary{
  const entries:TopicGoalEntry[]=Object.entries(state.topics).flatMap(([key,record])=>{
    if(!record.dl)return [];
    const [exam="",subject="",...topicParts]=key.split("|"),topic=topicParts.join("|"),daysLeft=daysBetweenKeys(today,record.dl),done=record.st===3;
    const status=done?"completed":daysLeft<0?"overdue":daysLeft===0?"today":"upcoming";
    return [{key,exam,subject,topic,date:record.dl,daysLeft,done,status} as TopicGoalEntry];
  }).sort((left,right)=>left.done===right.done?String(left.date).localeCompare(String(right.date)):left.done?1:-1);
  return {total:entries.length,active:entries.filter(entry=>!entry.done).length,overdue:entries.filter(entry=>entry.status==="overdue").length,upcoming:entries.filter(entry=>entry.status==="today"||entry.status==="upcoming").length,completed:entries.filter(entry=>entry.done).length,entries};
}

export function upcomingReviewPlan(state:TopicStateSlice,today:IsoDateKey|string,gaps:readonly number[],horizonDays=7):UpcomingReviewEntry[]{
  const plan:UpcomingReviewEntry[]=[];
  for(const [key,topicRecord] of Object.entries(state.topics)){
    if(topicRecord.st!==3||!topicRecord.ts)continue;
    const nextIndex=gaps.findIndex((_gap,index)=>!topicRecord.rev.includes(index));
    if(nextIndex<0)continue;
    const gap=gaps[nextIndex]??0,due=addDaysToKey(topicRecord.ts as string,gap),daysLeft=daysBetweenKeys(today,due);
    if(daysLeft>Math.max(0,horizonDays))continue;
    const [exam="",subj="",...topicParts]=key.split("|");
    plan.push({key,gi:nextIndex,gap,due,exam,subj,topic:topicParts.join("|"),late:Math.max(0,-daysLeft),status:daysLeft<0?"overdue":daysLeft===0?"today":"upcoming"});
  }
  return plan.sort((left,right)=>String(left.due).localeCompare(String(right.due))||left.subj.localeCompare(right.subj,"tr"));
}

export function reviewQueue(state:TopicStateSlice,today:IsoDateKey|string,gaps:readonly number[]):ReviewQueueEntry[]{
  const queue:ReviewQueueEntry[]=[];
  for(const [key,topic] of Object.entries(state.topics)){
    if(topic.st!==3||!topic.ts)continue;
    gaps.forEach((gap,index)=>{
      if(topic.rev.includes(index))return;
      const due=addDaysToKey(topic.ts as string,gap);
      if(due>today)return;
      const parts=key.split("|");
      queue.push({key,gi:index,gap,due,exam:parts[0]??"",subj:parts[1]??"",topic:parts[2]??"",late:daysBetweenKeys(due,today)});
    });
  }
  return queue.sort((left,right)=>right.late-left.late);
}

export function completeReview(state:TopicStateSlice,key:string,index:number,today:IsoDateKey|string):boolean{
  const topic=state.topics[key];
  if(!topic)return false;
  if(!topic.rev.includes(index))topic.rev.push(index);
  if(!topic.revDone||typeof topic.revDone!=="object")topic.revDone={};
  if(!topic.revDone[String(index)])topic.revDone[String(index)]=today as IsoDateKey;
  return true;
}

export function isTopicStatus(value:unknown):value is TopicStatus{
  return value===0||value===1||value===2||value===3;
}

export function isTopicConfidence(value:unknown):value is TopicConfidence{
  return value===0||value===1||value===2||value===3||value===4||value===5;
}

export const topicService={topicKey,topicFor,setTopicStatus,setTopicConfidence,subjectProgress,overallTopicProgress,examTopicProgress,topicGoals,reviewQueue,upcomingReviewPlan,completeReview} as const;
