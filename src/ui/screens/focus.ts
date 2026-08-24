import type {ScreenModule} from "./contracts";

export const focusScreen:ScreenModule={
  id:"pomo",
  required:["renderPomo","renderTimeDist"],
  render(environment){
    environment.call("renderPomo");
    environment.call("renderTimeDist");
  }
};
