import type {ScreenModule} from "./contracts";
import {renderExamDashboard} from "../exam-dashboard";
import {renderLearningCycleV43} from "../learning-cycle-v43";

export const examsScreen:ScreenModule={
  id:"deneme",
  required:["renderDenemeHistory","renderBlankWrong","activeAnaTab","setAnaTab"],
  render(environment){
    environment.call("renderDenemeHistory");
    environment.call("renderBlankWrong");
    environment.optional("renderExam2");
    environment.call("setAnaTab",environment.call("activeAnaTab"));
    environment.idle("deneme-secondary",()=>{
      environment.optional("renderCompareOpts");
      environment.optional("renderWrongTopics");
    },700);
    environment.optional("renderRank");
    environment.optional("renderDenemeGun");
    if(environment.has("renderTargets")){
      environment.call("renderTargets");
      environment.optional("renderNetGain");
    }
    renderExamDashboard();
    renderLearningCycleV43();
  }
};
