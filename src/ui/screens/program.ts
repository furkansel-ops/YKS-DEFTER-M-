import type {ScreenModule} from "./contracts";

export const programScreen:ScreenModule={
  id:"program",
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
