import type {ScreenModule} from "./contracts";
import {progressLegacyAdapter} from "./legacy-adapters";
import {renderProgressDashboard} from "../progress-dashboard";
import {renderAnalysisCenterV43} from "../analysis-center-v43";

export const progressScreen:ScreenModule={
  id:"progress",
  required:progressLegacyAdapter.required,
  render(environment){
    progressLegacyAdapter.render(environment);
    renderAnalysisCenterV43();
    renderProgressDashboard();
  }
};
