import type {ScreenModule} from "./contracts";
import {examsLegacyAdapter} from "./legacy-adapters";
import {renderExamDashboard} from "../exam-dashboard";
import {renderLearningCycleV43} from "../learning-cycle-v43";

export const examsScreen:ScreenModule={
  id:"deneme",
  required:examsLegacyAdapter.required,
  render(environment){
    examsLegacyAdapter.render(environment);
    renderExamDashboard();
    renderLearningCycleV43();
  }
};
