/* YKS Defterim · Akıllı Tekrar Merkezi 2.0
   Görsel/tercih katmanıdır. Program, konu seviyesi ve çalışma kayıtlarını değiştirmez. */
(function(){
  "use strict";
  const Core=globalThis.YKSStudyIntelCore;
  if(!Core)return;
  const STORE_KEY="yks_repeat_actions_v42",STYLE_HREF="./modules/repeat-center-v42.css?v=4.2.0-r1";
  let centerObserver=null,rootObserver=null,renderScheduled=false;

  const safe=value=>typeof esc==="function"?esc(String(value==null?"":value)):String(value==null?"":value).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const today=()=>typeof todayKey==="function"?todayKey():new Date().toISOString().slice(0,10);
  function addDays(key,days){const parts=String(key).split("-").map(Number),d=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]+days));return d.toISOString().slice(0,10);}
  function actionKey(row){return Core.topicKey?Core.topicKey(row.subject,row.topic):String(row.subject||"").toLocaleLowerCase("tr-TR")+"|"+String(row.topic||"").toLocaleLowerCase("tr-TR");}
  function ensureStyles(){
    if(document.querySelector('link[data-yks-repeat-v42-style]'))return;
    const link=document.createElement("link");link.rel="stylesheet";link.href=STYLE_HREF;link.setAttribute("data-yks-repeat-v42-style","1");document.head.appendChild(link);
  }
  function getStore(){try{const value=JSON.parse(localStorage.getItem(STORE_KEY)||"{}");return value&&typeof value==="object"?value:{}}catch(e){return {}}}
  function saveStore(store){try{localStorage.setItem(STORE_KEY,JSON.stringify(store));return true}catch(e){return false}}
  function activeAction(row,store,day=today()){
    const value=store[actionKey(row)];if(!value||typeof value!=="object")return null;
    if(value.state==="done"&&value.date===day)return value;
    if(value.state==="deferred"&&String(value.until||"")>day)return value;
    return null;
  }
  function cleanStore(store,day=today()){
    let changed=false;
    for(const [key,value] of Object.entries(store)){
      if(!value||typeof value!=="object"||(value.state==="done"&&value.date!==day)||(value.state==="deferred"&&String(value.until||"")<=day)){delete store[key];changed=true;}
    }
    if(changed)saveStore(store);
    return store;
  }
  function setAction(row,state){
    const store=cleanStore(getStore()),key=actionKey(row),day=today();
    if(state==="done")store[key]={state:"done",date:day,at:Date.now()};
    else if(state==="deferred")store[key]={state:"deferred",until:addDays(day,3),at:Date.now()};
    else delete store[key];
    saveStore(store);schedule(true);
  }
  function clearActive(){
    const day=today(),store=getStore();let changed=false;
    for(const [key,value] of Object.entries(store))if(value&&typeof value==="object"&&((value.state==="done"&&value.date===day)||(value.state==="deferred"&&String(value.until||"")>day))){delete store[key];changed=true;}
    if(changed)saveStore(store);schedule(true);
  }
  function recommendations(){
    try{const api=globalThis.YKSStudyIntelligence;return api&&typeof api.getRecommendations==="function"?(api.getRecommendations()||[]):[]}catch(e){return []}
  }
  function reasonHtml(row){
    const reasons=(row.why&&row.why.length?row.why:row.reasons||[]).slice(0,3);
    return reasons.length?reasons.map(reason=>'<span class="intel-repeat-reason">'+safe(reason)+'</span>').join(''):'<span class="intel-repeat-reason">Veri biriktikçe nedenler ayrıntılanır.</span>';
  }
  function rowHtml(row,index){
    return '<article class="intel-repeat-v42-row" data-repeat-key="'+safe(actionKey(row))+'">'
      +'<div class="intel-repeat-rank">'+(index+1)+'</div>'
      +'<div class="intel-repeat-main"><div class="intel-repeat-title">'+safe(row.subject+' · '+row.topic)+'</div>'
      +'<div class="intel-repeat-question">Neden burada?</div><div class="intel-repeat-reasons">'+reasonHtml(row)+'</div>'
      +'<div class="intel-repeat-actions"><button type="button" class="btn ghost tiny" data-repeat-done>Bugün tamamladım</button><button type="button" class="btn ghost tiny" data-repeat-defer>3 gün ertele</button><button type="button" class="btn ghost tiny" data-repeat-topics>Konuya git</button></div></div>'
      +'<div class="intel-repeat-side"><span class="intel-badge '+safe(row.severity)+'">'+safe(row.label)+'</span><small>'+Math.round(Number(row.score)||0)+' puan</small></div></article>';
  }
  function bindRows(center,visible){
    center.querySelectorAll(".intel-repeat-v42-row").forEach((element,index)=>{
      const row=visible[index];if(!row)return;
      element.querySelector("[data-repeat-done]")?.addEventListener("click",()=>setAction(row,"done"));
      element.querySelector("[data-repeat-defer]")?.addEventListener("click",()=>setAction(row,"deferred"));
      element.querySelector("[data-repeat-topics]")?.addEventListener("click",()=>{
        try{if(globalThis.__YKS_UI__?.navigate)globalThis.__YKS_UI__.navigate("topics");else if(typeof go==="function")go("topics");}catch(e){}
        setTimeout(()=>{const input=document.getElementById("topicSearch");if(input){input.value=row.topic;input.dispatchEvent(new Event("input",{bubbles:true}));input.focus({preventScroll:true});input.scrollIntoView({block:"center"});}},80);
      });
    });
    center.querySelector("[data-repeat-reset]")?.addEventListener("click",clearActive);
  }
  function render(force=false){
    const center=document.getElementById("intelRepeatCenter");if(!center)return false;
    if(!force&&center.dataset.repeatV42==="ready")return true;
    const all=recommendations(),store=cleanStore(getStore()),hidden=all.filter(row=>activeAction(row,store)).length,visible=all.filter(row=>!activeAction(row,store)).slice(0,8);
    const header='<div class="intel-head"><div><h3>Akıllı Tekrar Merkezi 2.0</h3><p>Yanlış sıklığı, farklı günler, deneme yanlışları, tekrar gecikmesi, güven ve son çalışma zamanını birlikte sıralar.</p></div><span class="intel-repeat-v42-version">Açıklanabilir sıra</span></div>';
    const body=visible.length?'<div class="intel-repeat-v42-list">'+visible.map(rowHtml).join('')+'</div>':'<div class="empty">Şu an açık bir tekrar önerisi yok. Tamamladığın veya ertelediğin öneriler zamanı gelince yeniden görünür.</div>';
    const hiddenBar=hidden?'<div class="intel-repeat-hidden"><span>'+hidden+' öneri bugün tamamlandı veya ertelendi.</span><button type="button" class="btn ghost tiny" data-repeat-reset>Geri getir</button></div>':'';
    center.innerHTML=header+body+hiddenBar+'<div class="intel-note"><strong>Program tamamen manuel.</strong> “Tamamladım” ve “Ertele” yalnız bu öneri listesini yönetir; Program, konu seviyesi ve çalışma kayıtlarına otomatik yazmaz.</div><div class="intel-actions"><button class="btn ghost tiny" type="button" data-repeat-all-topics>Konuları aç</button></div>';
    center.dataset.repeatV42="ready";
    bindRows(center,visible);
    center.querySelector("[data-repeat-all-topics]")?.addEventListener("click",()=>{try{if(globalThis.__YKS_UI__?.navigate)globalThis.__YKS_UI__.navigate("topics");else if(typeof go==="function")go("topics");}catch(e){}});
    document.documentElement.dataset.repeatCenterV42="ready";
    return true;
  }
  function schedule(force=false){
    if(force){const center=document.getElementById("intelRepeatCenter");if(center)delete center.dataset.repeatV42;}
    if(renderScheduled)return;renderScheduled=true;
    const run=()=>{renderScheduled=false;render(force);};
    if(typeof requestAnimationFrame==="function")requestAnimationFrame(run);else setTimeout(run,0);
  }
  function observeCenter(center){
    if(centerObserver)return;
    centerObserver=new MutationObserver(()=>{if(center.dataset.repeatV42!=="ready")schedule();});
    centerObserver.observe(center,{childList:true});
    render(true);
  }
  function start(){
    ensureStyles();
    const existing=document.getElementById("intelRepeatCenter");if(existing){observeCenter(existing);return;}
    rootObserver=new MutationObserver(()=>{const center=document.getElementById("intelRepeatCenter");if(center){rootObserver.disconnect();rootObserver=null;observeCenter(center);}});
    rootObserver.observe(document.body,{childList:true,subtree:true});
  }
  window.addEventListener("storage",event=>{if(event.key===STORE_KEY)schedule(true)});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  globalThis.YKSRepeatCenterV42={version:"2.0.0",storage:STORE_KEY,render:()=>render(true),getActions:()=>cleanStore(getStore()),clearActive};
})();
