import {progressAnalysisService,type ProgressAnalysis} from "./progress-analysis-service.ts";
import type {DomainStateAdapter} from "./state-context";

export interface ProgressAnalysisApi{
  readonly version:"4.0.0-r14";
  analyze(days?:number):ProgressAnalysis;
  validate():string[];
}

declare global{
  interface Window{__YKS_PROGRESS_ANALYSIS__?:ProgressAnalysisApi;}
}

function adapterReady(adapter:LegacyStateAdapter|undefined):adapter is LegacyStateAdapter&DomainStateAdapter{
  return !!adapter&&typeof adapter.readState==="function"&&typeof adapter.subjects==="function"&&typeof adapter.reviewGaps==="function";
}

export function installLegacyProgressAnalysisBridge():ProgressAnalysisApi{
  const adapter=window.YKSLegacyState;
  const api:ProgressAnalysisApi={
    version:"4.0.0-r14",
    analyze(days=30){
      if(!adapterReady(adapter))return progressAnalysisService.analyze({},[],[],{days});
      return progressAnalysisService.analyze(adapter.readState(),adapter.subjects(),adapter.reviewGaps(),{days});
    },
    validate(){return adapterReady(adapter)?[]:["İlerleme analizi için çalışan state bağlamı bulunamadı"];}
  };
  window.__YKS_PROGRESS_ANALYSIS__=api;
  const errors=api.validate();document.documentElement.dataset.v4ProgressAnalysis=errors.length?"warning":"ready";
  window.dispatchEvent(new CustomEvent("yks:progress-analysis-ready",{detail:{version:api.version,errors}}));
  return api;
}
