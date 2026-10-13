/* Bugün v33 · Aşama 1. Görsel adaptör: görev ve çalışma verileri mevcut
   renderV25Today hesabından gelir. İkinci sayım veya Firebase yazımı yapmaz. */
export type TodayProgress={completed:number;total:number;percent:number;hasPlan:boolean};

export function parseTodayProgramProgress(percentText:string,completedText:string):TodayProgress{
  const ratio=String(completedText||"").match(/(\d+)\s*\/\s*(\d+)\s*Görev/i)
    ||String(completedText||"").match(/(\d+)\s*\/\s*(\d+)/);
  const completed=ratio?Math.max(0,Number(ratio[1])):0;
  const total=ratio?Math.max(0,Number(ratio[2])):0;
  const match=String(percentText||"").match(/(\d+(?:[.,]\d+)?)\s*%/);
  const fallback=total?Math.round(completed/total*100):0;
  const pct=match?Number(String(match[1]||"0").replace(",",".")):fallback;
  const percent=Math.min(100,Math.max(0,Number.isFinite(pct)?Math.round(pct):0));
  return{completed:Math.min(completed,total),total,percent:total?percent:0,hasPlan:total>0};
}

export function installTodayTopV33():{installed:boolean}{
  const plan=document.getElementById("todayHubPlan");
  const planSub=document.getElementById("todayHubPlanSub");
  const root=document.querySelector<HTMLElement>("#home .v33-home-progress");
  const ratio=document.getElementById("v33ProgramRatio");
  const percent=document.getElementById("v33ProgramPercent");
  const status=document.getElementById("v33ProgramStatus");
  const bar=document.getElementById("v33ProgressBar");
  const date=document.getElementById("v33HomeDate");
  if(!plan||!planSub||!root||!ratio||!percent||!status||!bar||!date)return{installed:false};

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
