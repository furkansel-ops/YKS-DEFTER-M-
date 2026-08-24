import type {ScreenModule} from "./contracts";

export const progressScreen:ScreenModule={
  id:"progress",
  required:["renderProgress"],
  render(environment){
    environment.call("renderProgress");
  }
};
