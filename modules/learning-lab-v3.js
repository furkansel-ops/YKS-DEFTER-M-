/* YKS Defterim — Öğrenme Laboratuvarı v3 | ana araç sadeleştirme */
(function(){
  "use strict";
  if(window.__YKS_LEARNING_LAB_V3__)return;
  window.__YKS_LEARNING_LAB_V3__=true;

  const $=id=>document.getElementById(id);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])||c);
  let active="periodic",science="Biyoloji",observer=null,queued=false;

  function injectStyle(){
    if($("v4LearningLabV3Style"))return;
    const s=document.createElement("style");s.id="v4LearningLabV3Style";s.textContent=`
      #v320LearningLab .v4lab-main-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
      #v320LearningLab .v4lab-main-tabs button{min-height:42px;padding:9px 11px;border-radius:11px;white-space:normal}
      #v320PanelScience{padding-top:2px}
      .v4-science-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:4px 0 12px}
      .v4-science-head small,.v4-science-head b,.v4-science-head p{display:block}.v4-science-head small{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--label-3);font-weight:800}.v4-science-head b{font-size:18px;margin-top:3px}.v4-science-head p{font-size:11px;color:var(--label-2);margin:4px 0 0;line-height:1.45}
      .v4-science-switch{display:flex;gap:6px;flex-wrap:wrap}.v4-science-switch button{border:.5px solid var(--glass-line);background:var(--fill);color:var(--label-2);border-radius:999px;padding:7px 11px;font-size:10px;font-weight:800}.v4-science-switch button.on{background:var(--accent);color:#fff;border-color:transparent}
      .v4-science-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v4-science-card{display:flex;gap:10px;padding:11px;border:.5px solid var(--glass-line);border-radius:15px;background:var(--glass)}.v4-science-card>i{font-style:normal;font-size:28px;line-height:1}.v4-science-card b{display:block;font-size:13px}.v4-science-card p{font-size:10.5px;line-height:1.45;color:var(--label-1);margin:4px 0}.v4-science-card small,.v4-science-card em{display:block;font-size:9.5px;line-height:1.4;color:var(--label-2);font-style:normal;margin-top:4px}.v4-science-card strong{color:var(--label-1)}
      .v4-science-empty{padding:18px;border:.5px dashed var(--glass-line);border-radius:14px;color:var(--label-3);font-size:11px;text-align:center}
      @media(max-width:760px){#v320LearningLab .v4lab-main-tabs,.v4-science-grid{grid-template-columns:1fr}.v4-science-head{flex-direction:column}}
    `;document.head.appendChild(s);
  }

  function scienceRows(){
    const dives=window.YKSLearningLabV2?.deepDives||{};
    return Array.isArray(dives[science])?dives[science]:[];
  }
  function renderScience(){
    const root=$("v4ScienceCards");if(!root)return;
    $("v4ScienceBiology")?.classList.toggle("on",science==="Biyoloji");
    $("v4SciencePhysics")?.classList.toggle("on",science==="Fizik");
    const rows=scienceRows();
    root.innerHTML=rows.length?'<div class="v4-science-grid">'+rows.map(x=>'<article class="v4-science-card"><i>'+esc(x[0])+'</i><div><b>'+esc(x[1])+'</b><p>'+esc(x[2])+'</p><small><strong>Sık hata:</strong> '+esc(x[3])+'</small><em><strong>YKS taktiği:</strong> '+esc(x[4])+'</em></div></article>').join("")+'</div>':'<div class="v4-science-empty">Bilim kartları hazırlanıyor.</div>';
  }

  function setTab(next){
    active=["periodic","timeline","science"].includes(next)?next:"periodic";
    [["Periodic","periodic"],["Timeline","timeline"],["Science","science"]].forEach(([name,key])=>{
      $("v320Tab"+name)?.classList.toggle("on",active===key);
      const panel=$("v320Panel"+name);if(panel)panel.hidden=active!==key;
    });
    if(active==="periodic")try{window.v320RenderElements?.();}catch(e){}
    if(active==="timeline")try{window.v320RenderTimeline?.();}catch(e){}
    if(active==="science")renderScience();
    return true;
  }

  function ensureStructure(){
    injectStyle();
    const lab=$("v320LearningLab"),toolbox=lab?.querySelector?.(".v320-toolbox");if(!lab||!toolbox)return false;
    $("v320TabParagraph")?.remove();
    $("v320PanelParagraph")?.remove();
    $("v4TurkishUpgrade")?.remove();

    const tabs=toolbox.querySelector(".v320-tabs");
    if(tabs&&!$("v320TabScience")){
      tabs.className="seg v320-tabs v4lab-main-tabs";
      tabs.setAttribute("role","tablist");
      tabs.setAttribute("aria-label","Öğrenme laboratuvarı araçları");
      tabs.innerHTML='<button id="v320TabPeriodic" type="button" onclick="v320SetTab(\'periodic\')">Periyodik Tablo</button><button id="v320TabTimeline" type="button" onclick="v320SetTab(\'timeline\')">Kronoloji</button><button id="v320TabScience" type="button" onclick="v320SetTab(\'science\')">Bilim Kartları</button>';
    }

    if(!$("v320PanelScience")){
      const panel=document.createElement("div");panel.id="v320PanelScience";panel.hidden=true;
      panel.innerHTML='<div class="v4-science-head"><div><small>Hızlı fen tekrarı</small><b>Biyoloji / Fizik kartları</b><p>Temel yapı, sık hata ve YKS taktiğini aynı kartta gör.</p></div><div class="v4-science-switch" role="tablist" aria-label="Bilim kartı dersi"><button id="v4ScienceBiology" class="on" type="button" onclick="v4SetScienceSubject(\'Biyoloji\')">Biyoloji</button><button id="v4SciencePhysics" type="button" onclick="v4SetScienceSubject(\'Fizik\')">Fizik</button></div></div><div id="v4ScienceCards"></div>';
      toolbox.appendChild(panel);
    }

    window.v320SetTab=setTab;
    setTab(active);
    return true;
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensureStructure();});}
  function start(){
    let tries=0;const timer=setInterval(()=>{
      tries++;
      if($("v320LearningLab")&&window.YKSLearningLabV2){clearInterval(timer);ensureStructure();observer=new MutationObserver(schedule);observer.observe($("v320LearningLab"),{childList:true,subtree:true});}
      else if(tries>60)clearInterval(timer);
    },120);
  }

  window.v4SetScienceSubject=value=>{science=value==="Fizik"?"Fizik":"Biyoloji";renderScience();};
  document.addEventListener("yks:navigation-after",()=>setTimeout(ensureStructure,70));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.YKSLearningLabV3={version:"3.0.0",setTab,renderScience,ensureStructure};
})();
