import type {ScreenModule} from "./contracts";
import {renderProgressDashboard} from "../progress-dashboard";

export const progressScreen:ScreenModule={
  id:"progress",
  required:["renderProgress"],
  render(environment){
    environment.call("renderProgress");
    renderProgressDashboard();
  }
};
