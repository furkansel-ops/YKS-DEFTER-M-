import type {ScreenModule} from "./contracts";

export const homeScreen:ScreenModule={
  id:"home",
  required:["renderHome"],
  render(environment){
    environment.call("renderHome");
  }
};
