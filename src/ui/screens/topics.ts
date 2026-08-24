import type {ScreenModule} from "./contracts";

export const topicsScreen:ScreenModule={
  id:"topics",
  required:["renderSubjects","renderReviewQueue"],
  render(environment){
    environment.call("renderSubjects");
    environment.call("renderReviewQueue");
  }
};
