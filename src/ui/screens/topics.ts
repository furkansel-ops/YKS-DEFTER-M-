import type {ScreenModule} from "./contracts";
import {topicsLegacyAdapter} from "./legacy-adapters";

export const topicsScreen:ScreenModule={
  id:"topics",
  required:topicsLegacyAdapter.required,
  render(environment){
    topicsLegacyAdapter.render(environment);
  }
};
