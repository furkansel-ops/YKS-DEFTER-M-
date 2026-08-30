import type {ScreenModule} from "./contracts";
import {examsLegacyAdapter} from "./legacy-adapters";
import {renderExamDashboard} from "../exam-dashboard";

function renderLearningCycleV43():void{
  try{window.__YKS_V43_RENDER_LEARNING_CYCLE__?.();}catch(error){try{console.error("v4.3 learning cycle render",error);}catch{}}
}

export const examsScreen:ScreenModule={
  id:"deneme",
  required:examsLegacyAdapter.required,
  render(environment){
    examsLegacyAdapter.render(environment);
    renderExamDashboard();
    renderLearningCycleV43();
  }
};
