import {examAnalysisService,type ExamAnalysis,type ExamAnalysisType,type ExamAnalysisWindow} from "./exam-analysis-service.ts";
import type {DomainStateAdapter} from "./state-context";

export interface ExamAnalysisApi{readonly version:"4.0.0-r15";analyze(type?:ExamAnalysisType,window?:ExamAnalysisWindow):ExamAnalysis;validate():string[];}

declare global{interface Window{__YKS_EXAM_ANALYSIS__?:ExamAnalysisApi;}}

function ready(adapter:LegacyStateAdapter|undefined):adapter is LegacyStateAdapter&DomainStateAdapter{return !!adapter&&typeof adapter.readState==="function";}

export function installLegacyExamAnalysisBridge():ExamAnalysisApi{
  const adapter=window.YKSLegacyState,api:ExamAnalysisApi={version:"4.0.0-r15",analyze(type="TYT",window=10){return examAnalysisService.analyze(ready(adapter)?adapter.readState():{},type,window);},validate(){return ready(adapter)?[]:["Deneme analizi için çalışan state bağlamı bulunamadı"];}};
  window.__YKS_EXAM_ANALYSIS__=api;const errors=api.validate();document.documentElement.dataset.v4ExamAnalysis=errors.length?"warning":"ready";window.dispatchEvent(new CustomEvent("yks:exam-analysis-ready",{detail:{version:api.version,errors}}));return api;
}
