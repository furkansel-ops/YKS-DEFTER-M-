import type {ScreenModule} from "./contracts";
import {topicsLegacyAdapter} from "./legacy-adapters";
import "../topics-hub-v46.css";

function ensureTopicsHub():void{
  const root=document.documentElement;
  if(root.dataset.topicsHubRuntime==="ready"||root.dataset.topicsHubRuntime==="loading")return;
  root.dataset.topicsHubRuntime="loading";
  void import("../topics-hub-v46")
    .then(async({installTopicsHubV46})=>{
      const runtime=installTopicsHubV46();
      if(runtime.installed){
        const {installTopicLegacyPanelsV46}=await import("../topics-hub-v46-extras");
        installTopicLegacyPanelsV46();
      }
      root.dataset.topicsHubRuntime=runtime.installed?"ready":"deferred";
    })
    .catch(error=>{
      root.dataset.topicsHubRuntime="deferred";
      console.error("Konu Haritası yüklenemedi",error);
    });
}

export const topicsScreen:ScreenModule={
  id:"topics",
  required:topicsLegacyAdapter.required,
  render(environment){
    topicsLegacyAdapter.render(environment);
    ensureTopicsHub();
  }
};
