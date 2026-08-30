import type {ScreenModule} from "./contracts";
import {moreLegacyAdapter} from "./legacy-adapters";

export const moreScreen:ScreenModule={
  id:"more",
  required:moreLegacyAdapter.required,
  render(environment){
    moreLegacyAdapter.render(environment);
  }
};
