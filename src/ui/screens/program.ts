import type {ScreenModule} from "./contracts";
import {programLegacyAdapter} from "./legacy-adapters";

export const programScreen:ScreenModule={
  id:"program",
  required:programLegacyAdapter.required,
  render(environment){
    programLegacyAdapter.render(environment);
  }
};
