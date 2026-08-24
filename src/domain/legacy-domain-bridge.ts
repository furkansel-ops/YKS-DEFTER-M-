import {todayDateKey} from "../services/date-service.ts";
import {activityService} from "./activity-service.ts";
import {DomainStateContext,type DomainStateAdapter} from "./state-context.ts";
import {isTopicConfidence,isTopicStatus,topicService} from "./topic-service.ts";
import type {SubjectDefinition,TopicConfidence,TopicStatus} from "./contracts";

type LegacyFunction=(...args:unknown[])=>unknown;
type LegacyWindow=Window&Record<string,unknown>;

const DOMAIN_HELPERS=[
  "tkey","tget","tsetStatus","tsetConf","subjStat","overallPct","reviewQueue","markReview",
  "totalSolved","totalMinutes","fullTopicCount","completedReviewCount","todaySessions","workCyclesToday","isLongBreakNext"
] as const;

export interface DomainServicesApi{
  readonly version:"4.0.0-alpha.9";
  readonly topics:typeof topicService;
  readonly activity:typeof activityService;
  validate():string[];
}

declare global{
  interface Window{
    __YKS_DOMAIN__?:DomainServicesApi;
  }
}

function callable(target:LegacyWindow,name:string):LegacyFunction|undefined{
  const value=target[name];
  return typeof value==="function"?value as LegacyFunction:undefined;
}

function isDomainAdapter(adapter:LegacyStateAdapter|undefined):adapter is LegacyStateAdapter&DomainStateAdapter{
  return !!adapter&&typeof adapter.readState==="function"&&typeof adapter.save==="function"&&typeof adapter.subjects==="function"&&typeof adapter.reviewGaps==="function";
}

export function installLegacyDomainBridge():DomainServicesApi{
  const target=window as unknown as LegacyWindow,adapter=window.YKSLegacyState;
  const original=new Map<string,LegacyFunction>();
  for(const name of DOMAIN_HELPERS){const fn=callable(target,name);if(fn)original.set(name,fn);}
  if(!isDomainAdapter(adapter)){
    const api:DomainServicesApi={version:"4.0.0-alpha.9",topics:topicService,activity:activityService,validate:()=>["Eski state bağlamı bulunamadı"]};
    window.__YKS_DOMAIN__=api;document.documentElement.dataset.v4Domain="warning";return api;
  }
  const context=new DomainStateContext(adapter);
  const fallback=(name:string,args:unknown[])=>original.get(name)?.apply(window,args);
  const replacements:Record<(typeof DOMAIN_HELPERS)[number],LegacyFunction>={
    tkey:(exam,subject,topic)=>topicService.topicKey(String(exam),String(subject),String(topic)),
    tget:key=>topicService.topicFor(context.state(),String(key)),
    tsetStatus:(key,status)=>{
      if(!isTopicStatus(status))return fallback("tsetStatus",[key,status]);
      topicService.setTopicStatus(context.state(),String(key),status as TopicStatus,todayDateKey());return context.save();
    },
    tsetConf:(key,confidence)=>{
      if(!isTopicConfidence(confidence))return fallback("tsetConf",[key,confidence]);
      topicService.setTopicConfidence(context.state(),String(key),confidence as TopicConfidence);return context.save();
    },
    subjStat:(exam,subject)=>topicService.subjectProgress(context.state(),String(exam),subject as SubjectDefinition),
    overallPct:()=>context.memo("overallPct",()=>topicService.overallTopicProgress(context.state(),context.subjects())),
    reviewQueue:()=>{const today=todayDateKey();return context.memo(`reviewQueue:${today}`,()=>topicService.reviewQueue(context.state(),today,context.reviewGaps()));},
    markReview:(key,index)=>{const changed=topicService.completeReview(context.state(),String(key),Number(index),todayDateKey());return changed?context.save():undefined;},
    totalSolved:()=>context.memo("totalSolved",()=>activityService.totalSolved(context.state())),
    totalMinutes:()=>context.memo("totalMinutes",()=>activityService.totalMinutes(context.state())),
    fullTopicCount:()=>context.memo("fullTopicCount",()=>activityService.completedTopicCount(context.state())),
    completedReviewCount:()=>activityService.completedReviewCount(context.state()),
    todaySessions:()=>activityService.sessionsForDate(context.state(),todayDateKey()),
    workCyclesToday:()=>activityService.completedWorkCycles(context.state(),todayDateKey()),
    isLongBreakNext:()=>activityService.longBreakIsNext(context.state(),todayDateKey())
  };
  for(const name of DOMAIN_HELPERS)target[name]=replacements[name];
  const api:DomainServicesApi={
    version:"4.0.0-alpha.9",
    topics:topicService,
    activity:activityService,
    validate:()=>{
      const errors:string[]=[];
      for(const name of DOMAIN_HELPERS)if(target[name]!==replacements[name])errors.push(`Alan yardımcısı TypeScript'e bağlı değil: ${name}`);
      const state=context.state();
      if(!state||typeof state!=="object")errors.push("Çalışan state okunamadı");
      if(!Array.isArray(context.reviewGaps()))errors.push("Tekrar aralıkları okunamadı");
      return errors;
    }
  };
  window.__YKS_DOMAIN__=api;
  const errors=api.validate();
  document.documentElement.dataset.v4Domain=errors.length?"warning":"ready";
  if(errors.length)console.warn("TypeScript alan servisi kontrolleri:",errors);
  window.dispatchEvent(new CustomEvent("yks:domain-ready",{detail:{version:api.version,errors}}));
  return api;
}
