(function(){
"use strict";
const KEY="yks_trial_archive_v1";
const SOURCES=[
  {id:"yedek-2526",exam:"Tümü",year:"2025-2026",publisher:"Kanal Arşivi",title:"2025–2026 Yedek PDF Arşivi",detail:"YKS/KPSS PDF yedek arşivi. Deneme ve kaynak paylaşımlarına Telegram üzerinden eriş.",url:"https://t.me/yks_kpss_pdf_kanal",kind:"Arşiv"},
  {id:"deneme-2026",exam:"TYT/AYT",year:"2026",publisher:"Türkiye Geneli",title:"2026 Deneme PDF + Cevap Anahtarı",detail:"Türkiye geneli YKS denemeleri ve cevap anahtarı paylaşımları için kanal bağlantısı.",url:"https://t.me/+WrDdPcgOPgMxYzA0",kind:"Deneme"},
  {id:"cevap-2026",exam:"TYT/AYT",year:"2026",publisher:"Deneme Arşivi",title:"2026 YKS Deneme Cevap Arşivi",detail:"Deneme ve cevap anahtarı paylaşımlarını tek kanaldan takip et.",url:"https://t.me/yks_deneme_cevap",kind:"Cevap anahtarı"},
  {id:"tg-2026",exam:"TYT/AYT",year:"2026",publisher:"Türkiye Geneli",title:"2026 TG Denemeleri",detail:"Türkiye geneli deneme paylaşımlarına hızlı erişim.",url:"https://t.me/tg_denemeleri_2026",kind:"Deneme"}
];
let state=load();
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||"{}");return {fav:Array.isArray(v.fav)?v.fav:[],done:Array.isArray(v.done)?v.done:[]};}catch(e){return {fav:[],done:[]};}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn("Deneme arşivi durumu kaydedilemedi",e);}}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function norm(v){return String(v||"").toLocaleLowerCase("tr-TR");}
function el(id){return document.getElementById(id);}
function selected(){
  const q=norm(el("v4TrialSearch")?.value),exam=el("v4TrialExam")?.value||"Tümü",year=el("v4TrialYear")?.value||"Tümü",onlyFav=!!el("v4TrialFavOnly")?.checked,onlyDone=!!el("v4TrialDoneOnly")?.checked;
  return SOURCES.filter(x=>{
    const hay=norm([x.title,x.publisher,x.detail,x.exam,x.year,x.kind].join(" "));
    const examOk=exam==="Tümü"||x.exam==="Tümü"||x.exam.includes(exam);
    const yearOk=year==="Tümü"||x.year.includes(year);
    return (!q||hay.includes(q))&&examOk&&yearOk&&(!onlyFav||state.fav.includes(x.id))&&(!onlyDone||state.done.includes(x.id));
  });
}
function render(){
  const grid=el("v4TrialArchiveGrid"),meta=el("v4TrialArchiveMeta");if(!grid)return;
  const items=selected();
  if(meta)meta.textContent=`${items.length} kaynak · ${state.fav.length} favori · ${state.done.length} çözüldü`;
  grid.innerHTML=items.length?items.map(x=>{
    const fav=state.fav.includes(x.id),done=state.done.includes(x.id);
    return `<article class="v4-trial-card${done?" is-done":""}">
      <div class="v4-trial-card-top"><div><span class="v4-trial-kind">${esc(x.kind)}</span><h3>${esc(x.title)}</h3></div><button class="v4-trial-icon${fav?" on":""}" type="button" aria-label="Favori" onclick="v4TrialToggleFav('${esc(x.id)}')">${fav?"★":"☆"}</button></div>
      <p>${esc(x.detail)}</p>
      <div class="v4-trial-tags"><span>${esc(x.exam)}</span><span>${esc(x.year)}</span><span>${esc(x.publisher)}</span></div>
      <div class="v4-trial-actions"><a class="btn green small" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Telegram'da aç</a><button class="btn ghost small" type="button" onclick="v4TrialToggleDone('${esc(x.id)}')">${done?"Çözüldü ✓":"Çözdüm"}</button></div>
    </article>`;
  }).join(""):`<div class="card"><p class="lead" style="margin:0">Bu filtrelerle eşleşen kaynak yok.</p><p class="hint">Filtreleri temizleyip yeniden deneyebilirsin.</p></div>`;
}
function toggle(list,id){const i=list.indexOf(id);if(i>=0)list.splice(i,1);else list.push(id);save();render();}
window.v4TrialArchiveRender=render;
window.v4TrialToggleFav=id=>toggle(state.fav,id);
window.v4TrialToggleDone=id=>toggle(state.done,id);
window.v4TrialResetFilters=()=>{const q=el("v4TrialSearch"),e=el("v4TrialExam"),y=el("v4TrialYear"),f=el("v4TrialFavOnly"),d=el("v4TrialDoneOnly");if(q)q.value="";if(e)e.value="Tümü";if(y)y.value="Tümü";if(f)f.checked=false;if(d)d.checked=false;render();};
window.v4TrialArchiveStats=()=>({sources:SOURCES.length,favorites:state.fav.length,done:state.done.length});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();
})();
