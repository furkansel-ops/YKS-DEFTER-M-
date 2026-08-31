import type {LegacyScreenFunction,ScreenEnvironment} from "./contracts";

export interface LegacyScreenAdapter{
  readonly required:readonly LegacyScreenFunction[];
  render(environment:ScreenEnvironment):void;
}

export const homeLegacyAdapter:LegacyScreenAdapter={
  required:["renderHome"],
  render(environment){
    environment.call("renderHome");
  }
};

export const programLegacyAdapter:LegacyScreenAdapter={
  required:["renderPlan","renderCalendar","renderDayDetail","renderProcrast"],
  render(environment){
    environment.call("renderPlan");
    if(environment.isVisible("progCal")){
      environment.call("renderCalendar");
      environment.call("renderDayDetail");
      environment.afterPaint("program-procrast",()=>environment.call("renderProcrast"));
      return;
    }
    environment.afterPaint("program-secondary",()=>{
      environment.call("renderCalendar");
      environment.call("renderDayDetail");
      environment.call("renderProcrast");
    });
  }
};

export const topicsLegacyAdapter:LegacyScreenAdapter={
  required:["renderSubjects","renderReviewQueue"],
  render(environment){
    environment.call("renderSubjects");
    environment.call("renderReviewQueue");
  }
};

export const examsLegacyAdapter:LegacyScreenAdapter={
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

export const progressLegacyAdapter:LegacyScreenAdapter={
  required:["renderProgress"],
  render(environment){
    environment.call("renderProgress");
  }
};

export const focusLegacyAdapter:LegacyScreenAdapter={
  required:["renderPomo","renderTimeDist"],
  render(environment){
    environment.call("renderPomo");
    environment.call("renderTimeDist");
  }
};

export const moreLegacyAdapter:LegacyScreenAdapter={
  required:["activeMoreTab","setMoreTab"],
  render(environment){
    environment.call("setMoreTab",environment.call("activeMoreTab"));
  }
};
