import type {ScreenModule} from "./contracts";
import {homeLegacyAdapter} from "./legacy-adapters";

export const homeScreen:ScreenModule={
  id:"home",
  required:homeLegacyAdapter.required,
  render(environment){
    homeLegacyAdapter.render(environment);
  }
};
