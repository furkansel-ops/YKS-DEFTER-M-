import type {ScreenModule} from "./contracts";

export const moreScreen:ScreenModule={
  id:"more",
  required:["activeMoreTab","setMoreTab"],
  render(environment){
    environment.call("setMoreTab",environment.call("activeMoreTab"));
  }
};
