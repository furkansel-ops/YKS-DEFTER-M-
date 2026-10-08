type FeatureApi={installed:boolean;validate():string[]};
type FeatureStatus={name:string;installed:boolean;errors:number};
type RenderBridge=()=>boolean|void;

export interface V43RuntimeReport{
  ok:boolean;
  startedAt:number;
  finishedAt:number;
  features:FeatureStatus[];
}

export interface V43RuntimeApi{
  installed:true;
  criticalReady:Promise<V43RuntimeReport>;
  ready:Promise<V43RuntimeReport>;
  latest():V43RuntimeReport|null;
}

declare global{
  interface Window{
    __YKS_V43_RUNTIME__?:V43RuntimeApi;
    __YKS_V43_RENDER_ANALYSIS__?:RenderBridge;
    __YKS_V43_RENDER_LEARNING_CYCLE__?:RenderBridge;
  }
}

function publishFeature(installedKey:string,errorKey:string,api:FeatureApi|null,error?:unknown):FeatureStatus{
  const errors=api?api.validate().length:1;
  const installed=!!api?.installed&&errors===0;
  document.documentElement.dataset[installedKey]=String(installed);
  document.documentElement.dataset[errorKey]=String(errors);
  if(error){try{console.error(`v4.3 feature failed: ${installedKey}`,error);}catch{}}
  return {name:installedKey,installed,errors};
}

async function loadFeature(installedKey:string,errorKey:string,loader:()=>Promise<FeatureApi>):Promise<FeatureStatus>{
  document.documentElement.dataset[installedKey]="loading";
  document.documentElement.dataset[errorKey]="0";
  try{return publishFeature(installedKey,errorKey,await loader());}
  catch(error){return publishFeature(installedKey,errorKey,null,error);}
}

async function loadAll(onCritical:(report:V43RuntimeReport)=>void):Promise<V43RuntimeReport>{
  const startedAt=Date.now();
  document.documentElement.dataset.v43Runtime="loading";
  const features:FeatureStatus[]=[];

  /* Açılış için yalnız ilk ekranda gerçekten gerekli üç modül beklenir.
     Ağ istekleri aynı anda başlatılır; kurulumlar belirlenmiş sırada uygulanır.
     Böylece yavaş mobil bağlantıda dokuz ayrı chunk art arda beklenmez. */
  const todayPromise=import("./today-v43");
  const navigationPromise=import("./navigation-v43");
  const shellPromise=import("./refined-shell");

  features.push(await loadFeature("v43Today","v43TodayErrors",async()=>{
    const mod=await todayPromise;return mod.installTodayV43();
  }));
  features.push(await loadFeature("v43Navigation","v43NavigationErrors",async()=>{
    const mod=await navigationPromise;return mod.installNavigationV43();
  }));
  features.push(await loadFeature("refinedShell","refinedShellErrors",async()=>{
    const mod=await shellPromise;return mod.installRefinedShell();
  }));

  const criticalFeatures=features.slice();
  const criticalReport:V43RuntimeReport={
    ok:criticalFeatures.every(feature=>feature.installed&&feature.errors===0),
    startedAt,
    finishedAt:Date.now(),
    features:criticalFeatures
  };
  onCritical(criticalReport);

  /* Deneme/analiz/kişiselleştirme/lab gibi ekranlar açılış perdesini tutmaz.
     Yine de release self-test için aynı runtime raporuna katılırlar. İstekleri
     paralel başlatılır ve her özellik kendi fail-open sınırında kalır. */
  const analysisPromise=import("./analysis-center-v43");
  const learningPromise=import("./learning-cycle-v43");
  const labPromise=import("./lab-quiz-v43");
  const personalizationPromise=import("./personalization-v43");
  const focusPromise=import("./focus-session-guard-v43");
  const resiliencePromise=import("./runtime-resilience-v431");

  features.push(await loadFeature("v43Analysis","v43AnalysisErrors",async()=>{
    const mod=await analysisPromise;
    window.__YKS_V43_RENDER_ANALYSIS__=mod.renderAnalysisCenterV43;
    return mod.installAnalysisCenterV43();
  }));
  features.push(await loadFeature("v43LearningCycle","v43LearningCycleErrors",async()=>{
    const mod=await learningPromise;
    window.__YKS_V43_RENDER_LEARNING_CYCLE__=mod.renderLearningCycleV43;
    return mod.installLearningCycleV43();
  }));
  features.push(await loadFeature("v43LabQuiz","v43LabQuizErrors",async()=>{
    const mod=await labPromise;return mod.installLabQuizV43();
  }));
  features.push(await loadFeature("v43Personalization","v43PersonalizationErrors",async()=>{
    const mod=await personalizationPromise;return mod.installPersonalizationV43();
  }));
  features.push(await loadFeature("v43FocusSessionGuard","v43FocusSessionGuardErrors",async()=>{
    const mod=await focusPromise;return mod.installFocusSessionGuardV43();
  }));
  features.push(await loadFeature("v431Resilience","v431ResilienceErrors",async()=>{
    const mod=await resiliencePromise;return mod.installRuntimeResilienceV431();
  }));

  const report:V43RuntimeReport={ok:features.every(feature=>feature.installed&&feature.errors===0),startedAt,finishedAt:Date.now(),features};
  document.documentElement.dataset.v43Runtime=report.ok?"ready":"degraded";
  document.documentElement.dataset.v43RuntimeErrors=String(features.filter(feature=>!feature.installed||feature.errors>0).length);
  window.dispatchEvent(new CustomEvent<V43RuntimeReport>("yks:v43-runtime",{detail:report}));
  return report;
}

export function installV43SafeRuntime():V43RuntimeApi{
  if(window.__YKS_V43_RUNTIME__)return window.__YKS_V43_RUNTIME__;
  let latestReport:V43RuntimeReport|null=null,resolveCritical:(report:V43RuntimeReport)=>void=()=>{};
  const criticalReady=new Promise<V43RuntimeReport>(resolve=>{resolveCritical=resolve;});
  const ready=new Promise<V43RuntimeReport>(resolve=>window.setTimeout(()=>{
    void loadAll(resolveCritical).then(report=>{latestReport=report;resolve(report);}).catch(error=>{
      try{console.error("v4.3 runtime loader",error);}catch{}
      const report:V43RuntimeReport={ok:false,startedAt:Date.now(),finishedAt:Date.now(),features:[]};
      latestReport=report;document.documentElement.dataset.v43Runtime="degraded";document.documentElement.dataset.v43RuntimeErrors="1";
      resolveCritical(report);resolve(report);
    });
  },0));
  const api:V43RuntimeApi={installed:true,criticalReady,ready,latest:()=>latestReport};
  window.__YKS_V43_RUNTIME__=api;return api;
}
