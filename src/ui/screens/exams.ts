import type {ScreenModule} from "./contracts";

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
  }
};
