import type {ActivityStateSlice} from "./contracts";

function sum(values:Record<string,number>):number{
  return Object.keys(values).reduce((total,key)=>total+(Number(values[key])||0),0);
}

export function totalSolved(state:ActivityStateSlice):number{
  return sum(state.solved);
}

export function totalMinutes(state:ActivityStateSlice):number{
  return sum(state.pomoMin);
}

export function completedTopicCount(state:ActivityStateSlice):number{
  return Object.values(state.topics).filter(topic=>topic.st===3).length;
}

export function completedReviewCount(state:ActivityStateSlice):number{
  return Object.values(state.topics).reduce((total,topic)=>total+(Array.isArray(topic.rev)?topic.rev.length:0),0);
}

export function sessionsForDate(state:ActivityStateSlice,date:string){
  return state.sessions[date]??=[];
}

export function completedWorkCycles(state:ActivityStateSlice,date:string):number{
  return sessionsForDate(state,date).filter(session=>session.type==="work"&&session.done).length;
}

export function longBreakIsNext(state:ActivityStateSlice,date:string):boolean{
  const cycles=state.focus.cycles||4,completed=completedWorkCycles(state,date);
  return completed>0&&completed%cycles===0;
}

export const activityService={totalSolved,totalMinutes,completedTopicCount,completedReviewCount,sessionsForDate,completedWorkCycles,longBreakIsNext} as const;
