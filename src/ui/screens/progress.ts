import type {ScreenModule} from "./contracts";
import {progressLegacyAdapter} from "./legacy-adapters";
import {renderProgressDashboard} from "../progress-dashboard";

function renderAnalysisCenterV43():void{
  try{window.__YKS_V43_RENDER_ANALYSIS__?.();}catch(error){try{console.error("v4.3 analysis render",error);}catch{}}
}

export const progressScreen:ScreenModule={
  id:"progress",
  required:progressLegacyAdapter.required,
  render(environment){
    progressLegacyAdapter.render(environment);
    renderAnalysisCenterV43();
    renderProgressDashboard();
  }
};
