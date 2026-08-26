/* YKS Defterim — kişisel kullanım iyileştirmeleri | Program + Bugün v2 */
(function(){
  "use strict";
  if(window.__YKS_PERSONAL_UPGRADES__)return;
  window.__YKS_PERSONAL_UPGRADES__=true;
  const $=id=>document.getElementById(id);
  const sel=(blk,i,d)=>document.querySelector('.gtx[data-blk="'+blk+'"][data-i="'+i+'"][data-d="'+d+'"]');

  function focusCell(node){
    if(!node)return false;node.focus();
    try{const r=document.createRange(),s=getSelection();r.selectNodeContents(node);r.collapse(false);s.removeAllRanges();s.addRange(r);}catch(e){}
    return true;
  }
  function verticalTarget(node,dir){
    const blk=node.dataset.blk,i=+node.dataset.i,d=+node.dataset.d;
    if(!blk||!Number.isFinite(i)||!Number.isFinite(d))return null;
    const all=[...document.querySelectorAll('.gtx[data-blk="'+blk+'"][data-d="'+d+'"]')].sort((a,b)=>(+a.dataset.i)-(+b.dataset.i));
    const at=all.indexOf(node);if(at<0)return null;
    return all[(at+dir+all.length)%all.length]||null;
  }
  function horizontalTarget(node,dir){
    const blk=node.dataset.blk,i=+node.dataset.i,d=+node.dataset.d;
    if(!blk||!Number.isFinite(i)||!Number.isFinite(d))return null;
    let nd=d+dir,ni=i;
    if(nd>6){nd=0;ni++;}else if(nd<0){nd=6;ni=Math.max(0,ni-1);}
    let target=sel(blk,ni,nd);
    if(!target&&ni!==i)target=sel(blk,i,nd);
    return target;
  }
  function cleanCellText(v){return String(v||"").replace(/\u00a0/g," ").replace(/[\r\n]+/g," · ").replace(/\s{2,}/g," ").trim().slice(0,300);}
  function bindProgramGrid(){
    const root=$("program");if(!root||root.dataset.fastEntryBound==="1")return;
    root.dataset.fastEntryBound="1";
    root.addEventListener("keydown",event=>{
      const node=event.target&&event.target.closest&&event.target.closest(".gtx[contenteditable='true']");if(!node)return;
      if(event.key==="Enter"){
        event.preventDefault();
        try{node.dispatchEvent(new Event("input",{bubbles:true}));}catch(e){}
        focusCell(verticalTarget(node,event.shiftKey?-1:1));return;
      }
      if(event.key==="Tab"){
        event.preventDefault();
        try{node.dispatchEvent(new Event("input",{bubbles:true}));}catch(e){}
        focusCell(horizontalTarget(node,event.shiftKey?-1:1));return;
      }
      if(event.key==="Escape"){event.preventDefault();node.blur();}
    });
    root.addEventListener("paste",event=>{
      const node=event.target&&event.target.closest&&event.target.closest(".gtx[contenteditable='true']");if(!node)return;
      const text=cleanCellText(event.clipboardData&&event.clipboardData.getData("text/plain"));if(!text)return;
      event.preventDefault();node.textContent=text;node.dispatchEvent(new Event("input",{bubbles:true}));
    });
    root.addEventListener("focusin",event=>{const node=event.target&&event.target.closest&&event.target.closest(".gtx[contenteditable='true']");if(node)node.setAttribute("aria-label","Program görevi. Enter alt hücre, Tab sağ hücre.");});
  }
  function addProgramHint(){
    const overview=$("programWeekOverview");if(!overview||$("programFastEntryHint"))return;
    const hint=document.createElement("div");hint.id="programFastEntryHint";hint.className="program-fast-entry-hint";hint.innerHTML='<span>⌨️ PC hızlı giriş</span><b>Enter ↓</b><b>Tab →</b><small>Programı yalnız sen doldurursun; uygulama sadece kaydeder ve Bugün ekranına taşır.</small>';
    overview.insertAdjacentElement("afterend",hint);
  }
  function enhanceTodayPlan(){
    const root=$("todayPlan");if(!root)return;
    root.querySelectorAll(".plancell").forEach(node=>{
      node.setAttribute("role","button");node.setAttribute("tabindex","0");
      node.setAttribute("aria-label",(node.classList.contains("pd")?"Tamamlandı. ":"Tamamlanmadı. ")+"Tek dokunuşla durumu değiştir.");
    });
  }
  function bindTodayKeyboard(){
    const root=$("todayPlan");if(!root||root.dataset.keyboardBound==="1")return;root.dataset.keyboardBound="1";
    root.addEventListener("keydown",event=>{const row=event.target&&event.target.closest&&event.target.closest(".plancell");if(!row||!["Enter"," "].includes(event.key))return;if(event.target.closest("button"))return;event.preventDefault();row.click();});
  }
  function injectStyle(){
    if($("personalProgramV2Style"))return;const s=document.createElement("style");s.id="personalProgramV2Style";
    s.textContent='.program-fast-entry-hint{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 12px;padding:8px 10px;border:1px solid var(--glass-line);border-radius:12px;background:var(--fill);font-size:11px;color:var(--label-2)}.program-fast-entry-hint span{font-weight:800;color:var(--label-1)}.program-fast-entry-hint b{padding:2px 6px;border-radius:6px;background:var(--glass);font-size:10px}.program-fast-entry-hint small{margin-left:auto}.gcell .gtx{min-height:28px;display:flex;align-items:center;outline:none}.gcell .gtx:focus{box-shadow:inset 0 0 0 1.5px var(--accent);border-radius:7px}.plancell[role="button"]{cursor:pointer}.plancell[role="button"]:focus-visible{outline:2px solid var(--accent);outline-offset:2px}@media(pointer:coarse){.gcell{min-height:52px}.gcell .gtx{min-height:42px}.gcell .tick{min-width:34px;min-height:34px;display:grid;place-items:center}.plancell{min-height:52px}}@media(max-width:720px){.program-fast-entry-hint small{width:100%;margin-left:0}}';document.head.appendChild(s);
  }
  function patchRenders(){
    const rp=window.renderPlan;if(typeof rp==="function"&&!rp.__personalV2){const f=function(){const out=rp.apply(this,arguments);setTimeout(()=>{bindProgramGrid();addProgramHint();},0);return out;};f.__personalV2=true;window.renderPlan=f;}
    const rt=window.renderTodayPlan;if(typeof rt==="function"&&!rt.__personalV2){const f=function(){const out=rt.apply(this,arguments);setTimeout(()=>{enhanceTodayPlan();bindTodayKeyboard();},0);return out;};f.__personalV2=true;window.renderTodayPlan=f;}
    const v25=window.renderV25Today;if(typeof v25==="function"&&!v25.__personalV2){const f=function(){const out=v25.apply(this,arguments);setTimeout(enhanceTodayPlan,0);return out;};f.__personalV2=true;window.renderV25Today=f;}
  }
  function start(){injectStyle();bindProgramGrid();addProgramHint();enhanceTodayPlan();bindTodayKeyboard();patchRenders();setTimeout(()=>{patchRenders();bindProgramGrid();addProgramHint();enhanceTodayPlan();},180);}
  document.addEventListener("yks:navigation-after",e=>{const screen=e&&e.detail&&e.detail.screen;if(screen==="program")setTimeout(()=>{bindProgramGrid();addProgramHint();},0);if(screen==="home")setTimeout(()=>{enhanceTodayPlan();bindTodayKeyboard();},0);});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.YKSPersonalUpgrades={version:"2.0.0",bindProgramGrid,enhanceTodayPlan};
})();
