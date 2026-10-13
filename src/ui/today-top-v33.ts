/* Bugün v33 · Aşama 1. Görsel adaptör: görev ve çalışma verileri mevcut
   renderV25Today hesabından gelir. İkinci sayım veya Firebase yazımı yapmaz. */
export type TodayProgress={completed:number;total:number;percent:number;hasPlan:boolean};

export function parseTodayProgramProgress(percentText:string,completedText:string):TodayProgress{
  const ratio=String(completedText||"").match(/(\d+)\s*\/\s*(\d+)\s*Görev/i)
    ||String(completedText||"").match(/(\d+)\s*\/\s*(\d+)/);
  const completed=ratio?Math.max(0,Number(ratio[1])):0;
  const total=ratio?Math.max(0,Number(ratio[2])):0;
  const match=String(percentText||"").match(/(-?\d+(?:[.,]\d+)?)\s*%/);
  const fallback=total?Math.round(completed/total*100):0;
  const pct=match?Number(String(match[1]||"0").replace(",",".")):fallback;
  const percent=Math.min(100,Math.max(0,Number.isFinite(pct)?Math.round(pct):0));
  return{completed:Math.min(completed,total),total,percent:total?percent:0,hasPlan:total>0};
}

/* v36: small read-only adapter. Never reparent, delete or rewrite the
   legacy source nodes: existing app.js and v43 handlers still own their data. */
function installTodayWelcomeV36(){
  const fresh=document.getElementById("todayFreshStart");
  const visibleDate=document.getElementById("todayFreshDate");
  const visibleGreeting=document.getElementById("todayFreshGreeting");
  const visibleDays=document.getElementById("todayFreshDays");
  const visibleExamDate=document.getElementById("todayFreshExamDate");
  if(!fresh||!visibleDate||!visibleGreeting||!visibleDays||!visibleExamDate)return false;
  const oldGreeting=document.getElementById("greeting");
  const oldCountdown=document.getElementById("countdown");
  const oldExamDate=document.getElementById("examDateLabel");
  if(!oldGreeting||!oldCountdown||!oldExamDate)return false;
  if(fresh.dataset.todayWelcome==="ready")return true;

  const update=(node:HTMLElement,text:string)=>{
    if(node.textContent!==text)node.textContent=text;
  };
  const sync=()=>{
    update(visibleGreeting,(oldGreeting.textContent||"").trim()||"Merhaba");
    update(visibleDays,(oldCountdown.textContent||"").trim()||"—");
    update(visibleExamDate,(oldExamDate.textContent||"").trim());
    update(visibleDate,new Intl.DateTimeFormat("tr-TR",{
      weekday:"long",day:"numeric",month:"long"
    }).format(new Date()));
  };
  sync();
  if(typeof MutationObserver!=="undefined"){
    const observer=new MutationObserver(sync);
    for(const node of [oldGreeting,oldCountdown,oldExamDate])
      observer.observe(node,{subtree:true,childList:true,characterData:true});
  }
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible")sync();
  });
  fresh.dataset.todayWelcome="ready";
  return true;
}

/* v37: mirrors the real quote/program summary, not a second state owner.
   No DOM moves, storage writes, Firebase calls, or timers added to bootstrap. */
function installTodayOverviewV37(){
  const fresh=document.getElementById("todayFreshStart");
  const quoteCard=document.getElementById("todayFreshQuoteCard");
  const quoteText=document.getElementById("todayFreshQuoteText");
  const quoteAuthor=document.getElementById("todayFreshQuoteAuthor");
  const quoteButton=document.getElementById("todayFreshNewQuote");
  const progress=document.getElementById("todayFreshProgress");
  const ratio=document.getElementById("todayFreshRatio");
  const percent=document.getElementById("todayFreshPercent");
  const status=document.getElementById("todayFreshProgressStatus");
  const bar=document.getElementById("todayFreshProgressBar");
  const quoteSource=document.getElementById("sozBox");
  const stats=[
    ["todayHubQ","todayHubQSub","todayFreshQuestions","todayFreshQuestionsSub"],
    ["todayHubMin","todayHubMinSub","todayFreshMinutes","todayFreshMinutesSub"],
    ["todayHubPlan","todayHubPlanSub","todayFreshPlan","todayFreshPlanSub"],
    ["todayHubReview","todayHubReviewSub","todayFreshReviews","todayFreshReviewsSub"]
  ].map(ids=>ids.map(id=>document.getElementById(id)));
  if(!fresh||!quoteCard||!quoteText||!quoteAuthor||!quoteButton||!progress||
     !ratio||!percent||!status||!bar||!quoteSource||
     stats.some(nodes=>nodes.some(node=>!node)))return false;
  if(fresh.dataset.todayOverview==="ready")return true;
  const update=(node:HTMLElement|null|undefined,text:string)=>{
    if(node&&node.textContent!==text)node.textContent=text;
  };
  const read=(node:Element|null|undefined)=>String(node?.textContent||"").trim();
  const sync=()=>{
    const quote=quoteSource.querySelector(".sz");
    const author=quoteSource.querySelector(".sza");
    const originalQuote=read(quote);
    const originalAuthor=read(author);
    quoteCard.hidden=quoteSource.style.display==="none";
    update(quoteText,originalQuote||"Günün sözü hazırlanıyor…");
    update(quoteAuthor,originalAuthor);
    quoteButton.toggleAttribute("disabled",!quoteSource.querySelector(".szr"));

    for(const [valueSource,subSource,valueTarget,subTarget] of stats){
      update(valueTarget,read(valueSource)||"—");
      update(subTarget,read(subSource)||"—");
    }
    const planRow=stats[2]||[];
    const p=parseTodayProgramProgress(read(planRow[0]),read(planRow[1]));
    update(ratio,p.hasPlan?(p.completed+"/"+p.total):"—");
    update(percent,p.hasPlan?("%"+p.percent):"—");
    update(status,!p.hasPlan?"Bugün için henüz program görevi yok."
      :p.completed>=p.total?"Bugünkü program görevleri tamamlandı."
      :(p.total-p.completed)+" görev kaldı. Kendi hızında ilerle.");
    progress.style.setProperty("--today-fresh-percent",String(p.percent));
    bar.setAttribute("aria-valuenow",String(p.percent));
    bar.setAttribute("aria-valuetext",p.hasPlan
      ?p.completed+" / "+p.total+" görev, yüzde "+p.percent
      :"Bugün için program görevi yok");
  };
  quoteButton.addEventListener("click",()=>{
    const next=quoteSource.querySelector(".szr");
    if(next instanceof HTMLElement)next.click();
  });
  sync();
  if(typeof MutationObserver!=="undefined"){
    const observer=new MutationObserver(sync);
    observer.observe(quoteSource,{
      childList:true,subtree:true,characterData:true,
      attributes:true,attributeFilter:["style"]
    });
    for(const [valueSource,subSource] of stats){
      for(const node of [valueSource,subSource])
        if(node)observer.observe(node,{childList:true,subtree:true,characterData:true});
    }
  }
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible")sync();
  });
  fresh.dataset.todayOverview="ready";
  return true;
}

export function installTodayTopV33():{installed:boolean}{
  const welcomeV36=installTodayWelcomeV36();
  const overviewV37=installTodayOverviewV37();
  // v38 is a separately cached optional chunk. A failure must never block boot.
  if(document.documentElement)void import("./today-workspace-v38")
    .then(({installTodayWorkspaceV38})=>{
      try{
        const work=installTodayWorkspaceV38();
        document.documentElement.dataset.todayWorkspaceV38=work.installed?"ready":"deferred";
      }catch(error){
        document.documentElement.dataset.todayWorkspaceV38="deferred";
        console.error("Çalışma Merkezi başlatılamadı",error);
      }
    })
    .catch(error=>{
      document.documentElement.dataset.todayWorkspaceV38="deferred";
      console.error("Çalışma Merkezi yüklenemedi",error);
    });
  // v39 opens only as an optional chunk; legacy save/coach logic owns persistence.
  if(document.documentElement)void import("./today-review-v39")
    .then(({installTodayReviewV39})=>{
      try{
        const review=installTodayReviewV39();
        document.documentElement.dataset.todayReviewV39=review.installed?"ready":"deferred";
      }catch(error){
        document.documentElement.dataset.todayReviewV39="deferred";
        console.error("Gün sonu değerlendirmesi başlatılamadı",error);
      }
    })
    .catch(error=>{
      document.documentElement.dataset.todayReviewV39="deferred";
      console.error("Gün sonu değerlendirmesi yüklenemedi",error);
    });
  // v40: independent optional display chunk; a failure cannot block boot.
  if(document.documentElement)void import("./today-activity-v40")
    .then(({installTodayActivityV40})=>{
      try{
        const activity=installTodayActivityV40();
        document.documentElement.dataset.todayActivityV40=activity.installed?"ready":"deferred";
      }catch(error){
        document.documentElement.dataset.todayActivityV40="deferred";
        console.error("Haftalık çalışma ritmi başlatılamadı",error);
      }
    })
    .catch(error=>{
      document.documentElement.dataset.todayActivityV40="deferred";
      console.error("Haftalık çalışma ritmi yüklenemedi",error);
    });
  // v41: independent read-only subject breakdown; never blocks initial boot.
  if(document.documentElement)void import("./today-subjects-v41")
    .then(({installTodaySubjectsV41})=>{
      try{
        const view=installTodaySubjectsV41();
        document.documentElement.dataset.todaySubjectsV41=view.installed?"ready":"deferred";
      }catch(error){
        document.documentElement.dataset.todaySubjectsV41="deferred";
        console.error("Günlük ders dağılımı başlatılamadı",error);
      }
    })
    .catch(error=>{
      document.documentElement.dataset.todaySubjectsV41="deferred";
      console.error("Günlük ders dağılımı yüklenemedi",error);
    });
  const plan=document.getElementById("todayHubPlan");
  const planSub=document.getElementById("todayHubPlanSub");
  const root=document.querySelector<HTMLElement>("#home .v33-home-progress");
  const ratio=document.getElementById("v33ProgramRatio");
  const percent=document.getElementById("v33ProgramPercent");
  const status=document.getElementById("v33ProgramStatus");
  const bar=document.getElementById("v33ProgressBar");
  const date=document.getElementById("v33HomeDate");
  if(!plan||!planSub||!root||!ratio||!percent||!status||!bar||!date)return{installed:welcomeV36||overviewV37};

  const sync=()=>{
    const p=parseTodayProgramProgress(plan.textContent||"",planSub.textContent||"");
    ratio.textContent=p.hasPlan?(p.completed+"/"+p.total):"—";
    percent.textContent=p.hasPlan?("%"+p.percent):"—";
    status.textContent=!p.hasPlan?"Bugün için henüz program görevi yok."
      :p.completed===p.total?"Bugünkü program görevleri tamamlandı."
      :(p.total-p.completed)+" görev kaldı. Kendi hızında ilerle.";
    root.style.setProperty("--v33-progress",String(p.percent));
    bar.setAttribute("aria-valuenow",String(p.percent));
    bar.setAttribute("aria-valuetext",p.hasPlan?(p.completed+" / "+p.total+" görev, yüzde "+p.percent):"Bugün için program yok");
    date.textContent=new Intl.DateTimeFormat("tr-TR",{weekday:"long",day:"numeric",month:"long"})
      .format(new Date());
  };
  sync();
  if(typeof MutationObserver!=="undefined"){
    const observer=new MutationObserver(sync);
    observer.observe(plan,{subtree:true,childList:true,characterData:true});
    observer.observe(planSub,{subtree:true,childList:true,characterData:true});
  }
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible")sync();
  });
  return{installed:true};
}
