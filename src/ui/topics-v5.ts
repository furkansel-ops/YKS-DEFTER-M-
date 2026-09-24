import "./topics-v5.css";

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}
function directHeadingBefore(node:HTMLElement|null):HTMLElement|null{
  const prev=node?.previousElementSibling;
  return prev instanceof HTMLElement&&/^H[1-6]$/.test(prev.tagName)?prev:null;
}
function cardBlock(id:string,title:string,copy:string):HTMLElement|null{
  const node=byId(id);
  if(!node)return null;
  const section=node.closest<HTMLElement>(".v5-topics-block");
  if(section)return section;
  const wrap=document.createElement("section");
  wrap.className="v5-topics-block";
  wrap.dataset.block=id;
  const head=document.createElement("header");
  head.innerHTML="<div><span>KONULAR</span><h2></h2><p></p></div>";
  const h=head.querySelector("h2"),p=head.querySelector("p");
  if(h)h.textContent=title;
  if(p)p.textContent=copy;
  const old=directHeadingBefore(node);
  old?.remove();
  node.insertAdjacentElement("beforebegin",wrap);
  wrap.append(head,node);
  return wrap;
}
function installHeader(screen:HTMLElement):void{
  if(screen.querySelector("[data-v5-topics-header]"))return;
  const tools=screen.querySelector<HTMLElement>(":scope > .v26-topic-tools");
  const header=document.createElement("header");
  header.className="v5-topics-header";
  header.dataset.v5TopicsHeader="true";
  header.innerHTML='<div><span>KONULAR</span><h1>Konular</h1><p>Müfredatı, tekrarları ve riskli konuları tek çalışma alanında yönet.</p></div>';
  screen.insertBefore(header,tools||screen.firstChild);
}
function installOverview(screen:HTMLElement):void{
  if(screen.querySelector("[data-v5-topics-overview]"))return;
  const host=document.createElement("div");
  host.className="v5-topics-overview";
  host.dataset.v5TopicsOverview="true";
  const blocks=[
    cardBlock("v26TopicOverview","Konu özeti","Tamamlanan, çalışan ve bekleyen konuların."),
    cardBlock("v4TopicGoals","Konu hedefleri","Yaklaşan hedefler ve öncelikli bitişler."),
    cardBlock("v26TopicAttention","Dikkat isteyenler","Risk ve tekrar sinyali yüksek konular.")
  ].filter(Boolean) as HTMLElement[];
  if(!blocks.length)return;
  const first=blocks[0]!;
  first.insertAdjacentElement("beforebegin",host);
  blocks.forEach(block=>host.appendChild(block));
}
function installReviewGrid(screen:HTMLElement):void{
  if(screen.querySelector("[data-v5-topics-review-grid]"))return;
  const curriculum=cardBlock("curBox","Müfredat projeksiyonu","Mevcut hızına göre ilerleme görünümü.");
  const review=cardBlock("reviewBox","Tekrar zamanı","3 · 7 · 21 günlük tekrar kuyruğun.");
  if(!curriculum&&!review)return;
  const grid=document.createElement("div");
  grid.className="v5-topics-review-grid";
  grid.dataset.v5TopicsReviewGrid="true";
  const first=curriculum||review!;
  first.insertAdjacentElement("beforebegin",grid);
  if(curriculum)grid.appendChild(curriculum);
  if(review)grid.appendChild(review);
}
function installCatalog(screen:HTMLElement):void{
  if(screen.querySelector("[data-v5-topics-catalog]"))return;
  const seg=screen.querySelector<HTMLElement>(":scope > .seg");
  const list=byId("subjectList");
  const note=list?.nextElementSibling instanceof HTMLElement&&list.nextElementSibling.classList.contains("note")
    ?list.nextElementSibling:null;
  if(!seg||!list)return;
  const section=document.createElement("section");
  section.className="v5-topics-catalog";
  section.dataset.v5TopicsCatalog="true";
  const head=document.createElement("header");
  head.innerHTML='<div><span>DERSLER</span><h2>Müfredat</h2><p>Sınav türünü seç, ders kartını aç ve konu durumunu güncelle.</p></div>';
  seg.insertAdjacentElement("beforebegin",section);
  section.append(head,seg,list);
  if(note)section.appendChild(note);
}
function installSecondary(screen:HTMLElement):void{
  if(screen.querySelector("[data-v5-topics-secondary]"))return;
  const secondary=document.createElement("section");
  secondary.className="v5-topics-secondary";
  secondary.dataset.v5TopicsSecondary="true";
  const toggle=document.createElement("button");
  toggle.type="button";
  toggle.className="v5-topics-secondary-toggle";
  toggle.setAttribute("aria-expanded","false");
  toggle.innerHTML='<span><b>Ek konu araçları</b><small>Kaynak bağlantıları ve konu bitiş hedefleri</small></span><em>+</em>';
  const body=document.createElement("div");
  body.className="v5-topics-secondary-body";
  body.hidden=true;
  for(const id of ["fh_kaynak","fb_kaynak","fh_hedef","fb_hedef"]){
    const node=byId(id);if(node)body.appendChild(node);
  }
  toggle.addEventListener("click",()=>{
    body.hidden=!body.hidden;
    toggle.setAttribute("aria-expanded",String(!body.hidden));
    const em=toggle.querySelector("em");if(em)em.textContent=body.hidden?"+":"−";
  });
  secondary.append(toggle,body);
  screen.appendChild(secondary);
}
function renameNavigation():void{
  const tab=document.querySelector<HTMLElement>('.tabbar .tab[data-s="topics"]');
  const label=tab?.querySelector<HTMLElement>(".tl");
  if(label)label.textContent="Konular";
  if(tab)tab.setAttribute("aria-label","Konular");
}
export function installTopicsV5():{installed:boolean;validate:()=>string[]}{
  const screen=byId("topics");
  if(!screen)return {installed:false,validate:()=>["topics screen missing"]};
  if(screen.dataset.v5Topics==="ready")return {installed:true,validate:()=>[]};
  screen.classList.add("v5-topics");
  screen.dataset.v5Topics="ready";
  renameNavigation();
  installHeader(screen);
  installOverview(screen);
  installReviewGrid(screen);
  installCatalog(screen);
  installSecondary(screen);
  return {installed:true,validate:()=>{
    const errors:string[]=[];
    for(const selector of ["[data-v5-topics-header]","[data-v5-topics-overview]","[data-v5-topics-review-grid]","[data-v5-topics-catalog]","[data-v5-topics-secondary]"]){
      if(!screen.querySelector(selector))errors.push(selector+" missing");
    }
    return errors;
  }};
}
