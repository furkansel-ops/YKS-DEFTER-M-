(function(){
  "use strict";
  function runReleaseSelfTest(){
    const checks=[],add=(name,value)=>checks.push([name,!!value]);
    try{
      add("version",typeof APP_VERSION!=="undefined"&&APP_VERSION==="3.2.7"&&DATA_SCHEMA===21);
      add("modular-assets",!!document.querySelector('link[href="./app.css"]')&&!!document.querySelector('script[src="./app.js"]'));
      add("stability",!!window.YKSStability&&!!document.getElementById("v311OfflineBanner"));
      add("removed-tools",!document.getElementById("v312Coach")&&!document.getElementById("v313Learning")&&!document.getElementById("swHistory"));
      const labCurriculum=window.YKSLearningLab?.curriculum?.(),guideCoverage=window.YKSTopicGuides?.coverage?.(labCurriculum);
      add("learning-lab",window.YKSLearningLab?.elements?.length===118&&window.YKSLearningLab?.timeline?.length>=40&&typeof window.YKSLearningLab?.paragraphSummary==="function"&&typeof window.YKSLearningLab?.filterElements==="function"&&typeof window.YKSLearningLab?.filterTimeline==="function"&&labCurriculum?.TYT?.length>0&&guideCoverage?.total===240&&guideCoverage?.specific===240&&!!document.getElementById("mrp_lab")&&!!document.getElementById("v320LearningLab"));
      add("target-center",typeof window.v321RenderTargetCenter==="function"&&!!document.getElementById("v321TargetKpis"));
      add("exports",window.YKSExportCenter&&typeof window.YKSExportCenter.buildICS==="function"&&!!document.getElementById("v322ExportCenter"));
      const merged=window.YKSCore.mergeStates({denemeler:[{id:1}],topics:{},lab:{paragraphLog:[{id:7,at:1}]}},{denemeler:[{id:2}],topics:{},lab:{paragraphLog:[{id:8,at:2}]}},21);
      add("sync-merge",merged.denemeler.length===2&&merged.lab.paragraphLog.length===2&&merged.v===21);
      const next=window.YKSCore.srsNext({interval:0,ease:2.5,reps:0,lapses:0},2,"2026-08-24");
      add("srs",next.interval===1&&next.due==="2026-08-25");
      add("youtube-key",typeof YT_BUILTIN_KEY!=="undefined"&&YT_BUILTIN_KEY==="");
      add("legacy-tabs-removed",!document.querySelector(".v30-legacy-tabs"));
      add("quotes-turkish",Array.isArray(window.SOZLER)&&window.SOZLER.length===1000&&!window.SOZLER.some(x=>x.c==="İnsan Sözü"&&/\b(the|and|with|from|that|this|your|which)\b/i.test(x.q)));
      add("render-lab",window.v320RenderLearningLab()!==false);
      add("render-target",window.v321RenderTargetCenter()!==false);
      add("v4-bootstrap",window.__YKS_V4_BOOTSTRAP__?.version==="4.0.0"&&window.__YKS_V4_BOOTSTRAP__?.channel==="stable"&&window.__YKS_V4_BOOTSTRAP__?.stableRelease===true);
      add("v4-services",window.__YKS_SERVICES__?.validate?.().length===0&&window.__YKS_DOMAIN__?.validate?.().length===0);
      add("v4-screens",window.__YKS_SCREEN_RUNTIME__?.validate?.().length===0&&window.__YKS_UI__?.validate?.().length===0);
      add("v4-data",window.__YKS_DATA__?.schemaVersion===21&&window.__YKS_DATA__?.validate?.().length===0);
      add("v4-release",window.__YKS_RELEASE__?.version==="4.0.0"&&typeof window.__YKS_RELEASE__?.run==="function");
    }catch(error){checks.push(["exception",false]);try{infraError("release-selftest",error);}catch(_){}}
    const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-release-selftest",ok?"ok":"fail");
    let output=document.getElementById("releaseSelfTestResult");if(!output){output=document.createElement("pre");output.id="releaseSelfTestResult";output.hidden=true;document.body.appendChild(output);}
    output.textContent=(ok?"YKS_RELEASE_SELFTEST_OK":"YKS_RELEASE_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");
    return {ok,checks};
  }
  window.runReleaseSelfTest=runReleaseSelfTest;
  const previous=window.runBuiltInSelfTest;
  if(typeof previous==="function")window.runBuiltInSelfTest=function(){const result=previous.apply(this,arguments),release=runReleaseSelfTest();if(!release.ok){document.documentElement.setAttribute("data-selftest","fail");const out=document.getElementById("selfTestResult");if(out)out.textContent="YKS_SELFTEST_FAIL";}return result;};
  try{if(new URLSearchParams(location.search).get("selftest")==="release")setTimeout(runReleaseSelfTest,950);}catch(e){}
})();
