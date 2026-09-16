function movePanel(grid:HTMLElement,id:string,kicker:string,title:string,wide=false):void{
  const panel=document.getElementById(id);
  if(!(panel instanceof HTMLElement)||panel.closest(".v46-analysis-legacy"))return;
  const section=document.createElement("section");
  section.className="v46-analysis-legacy"+(wide?" wide":"");
  const head=document.createElement("div");
  head.className="v46-analysis-legacy-head";
  const copy=document.createElement("div");
  const small=document.createElement("small");small.textContent=kicker;
  const strong=document.createElement("b");strong.textContent=title;
  copy.append(small,strong);
  head.appendChild(copy);
  if(id==="reviewBox"){
    const count=document.getElementById("revCount");
    if(count instanceof HTMLElement){
      count.classList.add("v46-analysis-count");
      head.appendChild(count);
    }
  }
  section.append(head,panel);
  grid.appendChild(section);
}

export function installTopicLegacyPanelsV46():void{
  const grid=document.getElementById("v46AnalysisGrid");
  if(!(grid instanceof HTMLElement))return;
  movePanel(grid,"curBox","PLAN","Müfredat projeksiyonu");
  movePanel(grid,"reviewBox","TEKRAR","Tekrar zamanı",true);
  document.documentElement.dataset.topicsLegacyPanelsV46="ready";
}
