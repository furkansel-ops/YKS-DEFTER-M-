import type {ScreenModule} from "./contracts";
import {topicsLegacyAdapter} from "./legacy-adapters";
import "../topics-overview-v45.css";

function ensureTopicsOverview():void{
  const root=document.documentElement;
  if(root.dataset.topicsOverviewRuntime==="ready"||root.dataset.topicsOverviewRuntime==="loading")return;
  root.dataset.topicsOverviewRuntime="loading";
  void import("../topics-overview-v45")
    .then(({installTopicsOverviewV45})=>{
      const runtime=installTopicsOverviewV45();
      root.dataset.topicsOverviewRuntime=runtime.installed?"ready":"deferred";
    })
    .catch(error=>{
      root.dataset.topicsOverviewRuntime="deferred";
      console.error("Konular özet arayüzü yüklenemedi",error);
    });
}

export const topicsScreen:ScreenModule={
  id:"topics",
  required:topicsLegacyAdapter.required,
  render(environment){
    topicsLegacyAdapter.render(environment);
    ensureTopicsOverview();
  }
};
