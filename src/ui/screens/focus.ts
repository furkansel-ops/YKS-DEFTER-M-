import type {ScreenModule} from "./contracts";
import {focusLegacyAdapter} from "./legacy-adapters";

export const focusScreen:ScreenModule={
  id:"pomo",
  required:focusLegacyAdapter.required,
  render(environment){
    focusLegacyAdapter.render(environment);
  }
};
