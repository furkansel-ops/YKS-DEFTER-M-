import {addDaysToKey,daysBetweenKeys} from "../services/date-service.ts";
import type {IsoDateKey} from "../data/contracts";
import type {ReviewQueueEntry,SubjectDefinition,SubjectProgressSummary,TopicConfidence,TopicRecord,TopicStateSlice,TopicStatus} from "./contracts";

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

export const topicService={topicKey,topicFor,setTopicStatus,setTopicConfidence,subjectProgress,overallTopicProgress,reviewQueue,completeReview} as const;
