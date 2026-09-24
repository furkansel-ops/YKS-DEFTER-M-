import "./more-v5.css";

type MoreDetail={to?:string};
const PANELS=["mrp_lab","mrp_kay","mrp_tak","mrp_roz","mrp_veri","mrp_ayar","v30AboutPanel"] as const;

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}
function polishTop(screen:HTMLElement):void{
  const title=screen.querySelector<HTMLElement>(":scope > .v30-more-title");
  if(title){
    title.classList.add("v5-more-title");
    const h1=title.querySelector("h1"),p=title.querySelector<HTMLElement>(".lead");
    if(h1)h1.textContent="Merkez";
    if(p)p.textContent="Öğrenme, kaynaklar, raporlar ve uygulama araçları tek yerde.";
  }
  screen.querySelector<HTMLElement>(":scope > .v30-search-card")?.classList.add("v5-more-search");
  byId("v30MoreHome")?.classList.add("v5-more-home");
}
function polishPanel(panel:HTMLElement,id:string):void{
  panel.classList.add("v5-more-panel");
  panel.dataset.v5MorePanel=id;
  const sub=panel.querySelector<HTMLElement>(":scope > .v30-subhead");
  if(sub){
    sub.classList.add("v5-more-subhead");
    const back=sub.querySelector<HTMLButtonElement>(".v30-back");
    if(back)back.textContent="‹ Merkez";
  }
  for(const heading of panel.querySelectorAll<HTMLElement>(":scope > h2"))heading.classList.add("v5-more-section-title");
  for(const card of panel.querySelectorAll<HTMLElement>(":scope > .card"))card.classList.add("v5-more-card");
}
function panelAccent(panel:HTMLElement,id:string):void{
  const accent:Record<string,string>={
    mrp_lab:"learning",mrp_kay:"resources",mrp_tak:"tactics",mrp_roz:"summary",
    mrp_veri:"data",mrp_ayar:"settings",v30AboutPanel:"about"
  };
  panel.dataset.v5MoreTone=accent[id]||"default";
}
function polishAll():void{
  const screen=byId("more");
  if(!screen)return;
  screen.classList.add("v5-more");
  screen.dataset.v5More="ready";
  polishTop(screen);
  for(const id of PANELS){
    const panel=byId(id);
    if(!panel)continue;
    polishPanel(panel,id);
    panelAccent(panel,id);
  }
  const tab=document.querySelector<HTMLElement>('.tabbar .tab[data-s="more"]');
  const label=tab?.querySelector<HTMLElement>(".tl");
  if(label)label.textContent="Merkez";
  if(tab)tab.setAttribute("aria-label","Merkez");
}
export function installMoreV5():{installed:boolean;validate:()=>string[]}{
  polishAll();
  window.addEventListener("yks:navigation-after",event=>{
    const detail=(event as CustomEvent<MoreDetail>).detail;
    if(detail?.to==="more")window.setTimeout(polishAll,0);
  });
  window.addEventListener("yks:more-after",()=>window.setTimeout(polishAll,0));
  return {installed:true,validate:()=>{
    const errors:string[]=[];
    const screen=byId("more");
    if(screen&&screen.dataset.v5More!=="ready")errors.push("more marker missing");
    for(const id of PANELS){const panel=byId(id);if(panel&&!panel.classList.contains("v5-more-panel"))errors.push(id+" not polished");}
    return errors;
  }};
}
