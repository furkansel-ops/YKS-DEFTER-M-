import type {ScreenModule} from "./contracts";
import {topicsLegacyAdapter} from "./legacy-adapters";

// v105: ders kartı, konu satırı ve özet doğrudan app.js'te çizilir; görünüm src/ui/topics-v105.css'te.
export const topicsScreen:ScreenModule={
  id:"topics",
  required:topicsLegacyAdapter.required,
  render(environment){
    topicsLegacyAdapter.render(environment);
  }
};
