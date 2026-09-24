import "./exams-v5.css";

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}
function directHeadingBefore(node:HTMLElement|null):HTMLElement|null{
  const prev=node?.previousElementSibling;
  return prev instanceof HTMLElement&&/^H[1-6]$/.test(prev.tagName)?prev:null;
}
function installHeader(screen:HTMLElement):void{
  if(screen.querySelector("[data-v5-exams-header]"))return;
  const header=document.createElement("header");
  header.className="v5-exams-header";
  header.dataset.v5ExamsHeader="true";
  header.innerHTML='<div><span>DENEMELER</span><h1>Denemeler</h1><p>Net trendini, ders değişimini ve hatalarını aynı performans merkezinde takip et.</p></div><button type="button" class="v5-exams-add">+ Deneme Ekle</button>';
  header.querySelector<HTMLButtonElement>(".v5-exams-add")?.addEventListener("click",()=>{
    const legacy=(window as unknown as {toggleV315ExamForm?:()=>unknown}).toggleV315ExamForm;
    if(typeof legacy==="function")legacy();
    window.setTimeout(()=>byId("v315ExamFormCard")?.scrollIntoView({behavior:"smooth",block:"start"}),80);
  });
  screen.prepend(header);
}
function moveDashboard(screen:HTMLElement):void{
  const dashboard=byId("v315Dashboard");
  const header=screen.querySelector("[data-v5-exams-header]");
  if(dashboard&&header)header.insertAdjacentElement("afterend",dashboard);
  dashboard?.classList.add("v5-exams-dashboard");
}
function enhanceForm():void{
  const form=byId("v315ExamFormCard");
  if(!form)return;
  form.classList.add("v5-exams-form");
  if(form.querySelector("[data-v5-exams-form-head]"))return;
  const head=document.createElement("div");
  head.className="v5-exams-form-head";
  head.dataset.v5ExamsFormHead="true";
  head.innerHTML='<div><span>YENİ KAYIT</span><h2>Deneme ekle</h2><p>Sonucu ders bazında gir; analizler otomatik güncellensin.</p></div>';
  form.prepend(head);
}
function enhanceJournal():void{
  const journal=byId("errorJournal");
  if(!journal)return;
  journal.classList.add("v5-exams-journal");
  const head=journal.querySelector<HTMLElement>(".error-journal-head");
  const h2=head?.querySelector("h2");
  const p=head?.querySelector<HTMLElement>(".hint");
  if(h2)h2.textContent="Hata Defteri";
  if(p)p.textContent="Yanlışlarının nedenini kaydet; tekrar listene taşı ve aynı hatayı yeniden yakala.";
}
function installLatest(screen:HTMLElement):void{
  if(screen.querySelector("[data-v5-exams-latest]"))return;
  const overview=byId("v27Overview");
  const latest=byId("v27Latest");
  if(!overview||!latest)return;
  const heading=directHeadingBefore(overview.closest<HTMLElement>(".card"));
  const overviewCard=overview.closest<HTMLElement>(".card");
  const wrap=document.createElement("section");
  wrap.className="v5-exams-latest";
  wrap.dataset.v5ExamsLatest="true";
  wrap.innerHTML='<header><div><span>SON DURUM</span><h2>Son denemeler</h2><p>Yakın dönem performansını hızlıca karşılaştır.</p></div></header>';
  const anchor=heading||overviewCard;
  anchor?.insertAdjacentElement("beforebegin",wrap);
  heading?.remove();
  if(overviewCard)wrap.appendChild(overviewCard);
  wrap.appendChild(latest);
}
function installAnalysisShell(screen:HTMLElement):void{
  if(screen.querySelector("[data-v5-exams-analysis]"))return;
  const seg=screen.querySelector<HTMLElement>(".seg.pent");
  if(!seg)return;
  const heading=directHeadingBefore(seg);
  const shell=document.createElement("section");
  shell.className="v5-exams-analysis";
  shell.dataset.v5ExamsAnalysis="true";
  shell.innerHTML='<header><div><span>DERİN ANALİZ</span><h2>Analiz merkezi</h2><p>Trend, ders, karşılaştırma, puan ve verim görünümü.</p></div></header>';
  (heading||seg).insertAdjacentElement("beforebegin",shell);
  heading?.remove();
  shell.appendChild(seg);
  const ids=["anp_trend","anp_ders","anp_kar","anp_puan","anp_verim"];
  for(const id of ids){const node=byId(id);if(node)shell.appendChild(node);}
}
function renameNavigation():void{
  const tab=document.querySelector<HTMLElement>('.tabbar .tab[data-s="deneme"]');
  const label=tab?.querySelector<HTMLElement>(".tl");
  if(label)label.textContent="Denemeler";
  if(tab)tab.setAttribute("aria-label","Denemeler");
}
export function installExamsV5():{installed:boolean;validate:()=>string[]}{
  const screen=byId("deneme");
  if(!screen)return {installed:false,validate:()=>["deneme screen missing"]};
  screen.classList.add("v5-exams");
  screen.dataset.v5Exams="ready";
  renameNavigation();
  installHeader(screen);
  moveDashboard(screen);
  enhanceForm();
  enhanceJournal();
  installLatest(screen);
  installAnalysisShell(screen);
  return {installed:true,validate:()=>{
    const errors:string[]=[];
    for(const selector of ["[data-v5-exams-header]","[data-v5-exams-form-head]","[data-v5-exams-latest]","[data-v5-exams-analysis]"]){
      if(!screen.querySelector(selector))errors.push(selector+" missing");
    }
    return errors;
  }};
}
