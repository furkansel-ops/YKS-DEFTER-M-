import "./progress-v5.css";

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}

function closestSection(id:string):HTMLElement|null{
  const node=byId(id);
  const section=node?.closest("section");
  return section instanceof HTMLElement?section:null;
}

function renameHeader(screen:HTMLElement):void{
  const head=screen.querySelector<HTMLElement>(":scope > .progress-head");
  if(!head)return;
  head.classList.add("v5-progress-head");
  const title=head.querySelector("h1");
  const lead=head.querySelector<HTMLElement>(".lead");
  if(title)title.textContent="İstatistikler";
  if(lead)lead.textContent="Çalışma ritmini, ders dağılımını ve gelişimini tek bakışta gör.";
}

function buildKpiStrip(screen:HTMLElement):HTMLElement|null{
  const stats=screen.querySelector<HTMLElement>(":scope > .progress-stats");
  if(!stats)return null;
  stats.classList.add("v5-progress-kpis");
  const labels=[
    ["prMin","Çalışma süresi","Bu dönemde"],
    ["prQ","Çözülen soru","Toplam"],
    ["prDays","Aktif gün","Düzen"]
  ];
  for(const [id,title,meta] of labels){
    const value=byId(id);
    const stat=value?.closest<HTMLElement>(".stat");
    if(!stat)continue;
    const t=stat.querySelector<HTMLElement>(".t");
    if(t)t.textContent=title;
    if(!stat.querySelector(".v5-kpi-meta")){
      const small=document.createElement("small");
      small.className="v5-kpi-meta";
      small.textContent=meta;
      stat.appendChild(small);
    }
  }
  return stats;
}

function makeVisualGrid(screen:HTMLElement):HTMLElement{
  const old=screen.querySelector<HTMLElement>("[data-v5-progress-visuals]");
  if(old)return old;
  const grid=document.createElement("section");
  grid.className="v5-progress-visuals";
  grid.dataset.v5ProgressVisuals="true";

  const specs=[
    ["v28Weekly","Haftalık gelişim","Son haftaların çalışma ritmi","wide"],
    ["progressSubjects","Ders dağılımı","Süren hangi derslere gidiyor",""],
    ["v28Calendar","İstikrar","Çalıştığın günlerin görünümü",""]
  ] as const;

  for(const [id,title,copy,cls] of specs){
    const section=closestSection(id);
    if(!section)continue;
    section.classList.add("v5-progress-visual",cls);
    const h2=section.querySelector("h2");
    if(h2)h2.textContent=title;
    if(!section.querySelector(".v5-progress-visual-copy")){
      const p=document.createElement("p");
      p.className="v5-progress-visual-copy";
      p.textContent=copy;
      h2?.insertAdjacentElement("afterend",p);
    }
    grid.appendChild(section);
  }
  const core=byId("v4ProgressCoreGrid");
  if(core)core.insertAdjacentElement("beforebegin",grid);
  else screen.appendChild(grid);
  return grid;
}

function restructureCore(screen:HTMLElement):HTMLElement|null{
  const core=byId("v4ProgressCoreGrid");
  if(!core)return null;
  core.classList.add("v5-progress-insight-grid");
  const priorities=["v4SubjectInsights","v4ProgressRhythm","v4TopicsReviews","progressNet"];
  priorities.forEach((id,index)=>{
    const section=closestSection(id);
    if(section){
      section.dataset.v5Priority=String(index+1);
      core.appendChild(section);
    }
  });
  return core;
}

function polishDetails(screen:HTMLElement):void{
  const details=screen.querySelector<HTMLDetailsElement>(":scope > .v4-progress-details");
  if(!details)return;
  details.classList.add("v5-progress-details");
  const summary=details.querySelector("summary");
  if(summary)summary.textContent="Daha fazla analiz göster";
}

export function installProgressV5():{installed:boolean;validate:()=>string[]}{
  const screen=byId("progress");
  if(!screen)return {installed:false,validate:()=>["progress screen missing"]};
  screen.classList.add("v5-progress");
  screen.dataset.v5Progress="ready";
  renameHeader(screen);
  buildKpiStrip(screen);
  makeVisualGrid(screen);
  restructureCore(screen);
  polishDetails(screen);

  return {
    installed:true,
    validate:()=>{
      const errors:string[]=[];
      if(screen.dataset.v5Progress!=="ready")errors.push("progress marker missing");
      if(!screen.querySelector("[data-v5-progress-visuals]"))errors.push("progress visuals missing");
      for(const id of ["prMin","prQ","prDays","v28Weekly","progressSubjects","v28Calendar","v4SubjectInsights","v4ProgressRhythm"]){
        if(!document.getElementById(id))errors.push(id+" missing");
      }
      return errors;
    }
  };
}
