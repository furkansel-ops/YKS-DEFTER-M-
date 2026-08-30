import type {ScreenModule} from "./contracts";
import {renderProgressDashboard} from "../progress-dashboard";
import {renderAnalysisCenterV43} from "../analysis-center-v43";

export const progressScreen:ScreenModule={
  id:"progress",
  required:["renderProgress"],
  render(environment){
    environment.call("renderProgress");
    renderAnalysisCenterV43();
    renderProgressDashboard();
  }
};
