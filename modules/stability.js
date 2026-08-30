(function(){
  "use strict";
  const RUNTIME_KEY="yks_focus_runtime_v1";
  let recoveryBusy=false,lastRuntimeWrite=0;

  window.YKSSafeRender=function(scope,fn,fallbackId){
    try{return fn();}
    catch(error){
      try{if(typeof infraError==="function")infraError("section:"+scope,error);}catch(_){}
      const box=document.getElementById(fallbackId||"");
      if(box)box.innerHTML='<div class="v311-recovery"><b>Bu bölüm geçici olarak açılamadı.</b><span>Diğer verilerin güvende. Bölümü yeniden açmayı deneyebilirsin.</span><button class="btn ghost tiny" type="button" onclick="location.reload()">Yeniden yükle</button></div>';
      return false;
    }
  };

  function runtimeSnapshot(){
    try{
      return {version:1,app:APP_VERSION,state:pomoState,isWork:!!pomoIsWork,endAt:Number(pomoEndAt)||0,
        left:Math.max(0,Number(pomoLeft)||0),total:Math.max(1,Number(pomoTotal)||1),
        startedAt:Number(pomoStartedAt)||0,credited:Math.max(0,Number(pomoCredited)||0),
        subject:String(pomoSubject||"").slice(0,80),topic:String(typeof pomoTopic!=="undefined"?pomoTopic:"").slice(0,100),
        task:String(pomoTask||"").slice(0,100),savedAt:Date.now()};
    }catch(e){return null;}
  }
  function persistRuntime(force){
    const now=Date.now();if(!force&&now-lastRuntimeWrite<12000)return true;lastRuntimeWrite=now;
    try{
      const snap=runtimeSnapshot();
      if(!snap||snap.state==="idle")localStorage.removeItem(RUNTIME_KEY);
      else localStorage.setItem(RUNTIME_KEY,JSON.stringify(snap));
      return true;
    }catch(e){try{infraError("focus-runtime-save",e);}catch(_){}return false;}
  }
  function clearRuntime(){try{localStorage.removeItem(RUNTIME_KEY);}catch(e){}return true;}
  function readRuntime(){
    try{
      const x=JSON.parse(localStorage.getItem(RUNTIME_KEY)||"null");
      if(!x||x.version!==1||!["running","paused"].includes(x.state))return null;
      if(!Number.isFinite(+x.savedAt)||Date.now()-x.savedAt>12*60*60*1000)return null;
      if(!Number.isFinite(+x.total)||x.total<1||x.total>12*60*60)return null;
      return x;
    }catch(e){return null;}
  }
  function restoreRuntime(){
    if(recoveryBusy)return false;recoveryBusy=true;
    const x=readRuntime();if(!x){clearRuntime();recoveryBusy=false;return false;}
    try{
      clearInterval(pomoTimer);pomoTimer=null;
      pomoIsWork=!!x.isWork;pomoTotal=Math.max(1,+x.total||1);pomoStartedAt=Math.max(0,+x.startedAt||0);pomoCredited=Math.max(0,+x.credited||0);
      pomoSubject=x.subject||pomoSubject;pomoTask=x.task||"";if(typeof pomoTopic!=="undefined")pomoTopic=x.topic||"";
      const sameDay=pomoStartedAt&&typeof keyOf==="function"&&keyOf(new Date(pomoStartedAt))===todayKey();
      if(x.state==="running"&&+x.endAt>Date.now()){
        pomoState="running";pomoEndAt=+x.endAt;pomoLeft=Math.max(1,Math.round((pomoEndAt-Date.now())/1000));
        pomoTimer=setInterval(pomoTick,1000);try{requestWake();}catch(e){}
        renderPomo();toast("Odak oturumu kaldığı yerden devam ediyor");
      }else if(x.state==="running"&&sameDay&&Date.now()-(+x.endAt||0)<6*60*60*1000){
        pomoState="running";pomoEndAt=Date.now();pomoLeft=0;renderPomo();setTimeout(()=>{try{finishPhase();}catch(e){infraError("focus-runtime-finish",e);}},80);
      }else{
        pomoState="paused";pomoEndAt=0;pomoLeft=Math.max(1,Math.min(pomoTotal,+x.left||1));renderPomo();
        toast("Önceki odak oturumu duraklatılmış olarak kurtarıldı");
      }
      return true;
    }catch(e){clearRuntime();try{infraError("focus-runtime-restore",e);}catch(_){}return false;}
    finally{recoveryBusy=false;}
  }

  function wrapTimerFunction(name,mode){
    const original=window[name];if(typeof original!=="function")return;
    window[name]=function(){
      const result=original.apply(this,arguments);
      if(mode==="clear")clearRuntime();else persistRuntime(true);
      return result;
    };
  }

  function updateOnlineBanner(){
    const banner=document.getElementById("v311OfflineBanner");if(!banner)return;
    const offline=navigator.onLine===false;
    banner.hidden=!offline;banner.setAttribute("aria-hidden",offline?"false":"true");
    const cloud=document.getElementById("cloudSyncBox"),signedIn=cloud&&cloud.dataset.state!=="signedout";
    banner.textContent=offline?("Çevrimdışısın · değişiklikler bu cihazda güvenle saklanıyor"+(signedIn?" ve bağlantı gelince bulut senkronu sürecek":"")):"";
    document.documentElement.classList.toggle("is-offline",offline);
  }

  function bindAccessibility(){
    document.addEventListener("wheel",event=>{
      const target=event.target;
      if(target&&target.matches&&target.matches('input[type="number"]')&&document.activeElement===target)target.blur();
    },{passive:true});
    const nav=document.querySelector('.tabbar[role="tablist"]');
    nav?.addEventListener("keydown",event=>{
      if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
      const tabs=[...nav.querySelectorAll('[role="tab"]')].filter(x=>x.offsetParent!==null);if(!tabs.length)return;
      let index=Math.max(0,tabs.indexOf(document.activeElement));
      if(event.key==="Home")index=0;else if(event.key==="End")index=tabs.length-1;else index=(index+(event.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
      event.preventDefault();tabs[index].focus();
    });
  }

  function loadScriptOnce(src,dataKey,globalFlag,scope){
    if(window[globalFlag]||document.querySelector('script['+dataKey+']'))return;
    const s=document.createElement("script");s.src=src;s.setAttribute(dataKey,"1");s.async=false;
    s.onerror=()=>{try{if(typeof infraError==="function")infraError(scope,new Error(src+" yüklenemedi"));}catch(e){}};
    document.head.appendChild(s);
  }
  function loadPersonalUpgrades(){loadScriptOnce("./modules/personal-upgrades.js?v=4.1.0-r20","data-yks-personal-upgrades","__YKS_PERSONAL_UPGRADES__","personal-upgrades-load");}
  function loadProgressV2(){loadScriptOnce("./modules/progress-v2.js?v=4.1.0-r20","data-yks-progress-v2","__YKS_PROGRESS_V2__","progress-v2-load");}
  function loadLearningLabV2(){loadScriptOnce("./modules/learning-lab-v2.js?v=4.1.0-r24","data-yks-learning-lab-v2","__YKS_LEARNING_LAB_V2__","learning-lab-v2-load");}
  function loadLearningLabV3(){loadScriptOnce("./modules/learning-lab-v3.js?v=4.1.0-r28","data-yks-learning-lab-v3","__YKS_LEARNING_LAB_V3__","learning-lab-v3-load");}

  function start(){
    wrapTimerFunction("startPomo","save");wrapTimerFunction("pausePomo","save");wrapTimerFunction("resetPomo","clear");wrapTimerFunction("finishPhase","clear");wrapTimerFunction("skipPhase","save");
    window.addEventListener("offline",updateOnlineBanner);window.addEventListener("online",updateOnlineBanner);
    document.addEventListener("visibilitychange",()=>{if(document.hidden)persistRuntime(true);});
    window.addEventListener("pagehide",()=>persistRuntime(true));
    setInterval(()=>{try{if(pomoState==="running")persistRuntime(false);}catch(e){}},15000);
    bindAccessibility();updateOnlineBanner();loadPersonalUpgrades();loadProgressV2();loadLearningLabV2();loadLearningLabV3();setTimeout(restoreRuntime,180);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.YKSStability={persistRuntime,restoreRuntime,clearRuntime,updateOnlineBanner,loadPersonalUpgrades,loadProgressV2,loadLearningLabV2,loadLearningLabV3};
})();

(function(){
  "use strict";
  function loadMotivationQuotes(){
    if(window.__YKS_MOTIVATION_QUOTES_READY__||document.querySelector('script[data-yks-motivation-quotes]'))return;
    const s=document.createElement("script");
    s.src="./modules/motivation-quotes-v1.js?v=4.1.0-r2";
    s.async=false;
    s.setAttribute("data-yks-motivation-quotes","1");
    s.onerror=()=>{try{if(typeof infraError==="function")infraError("motivation-quotes-load",new Error("Motivasyon sözleri yüklenemedi"));}catch(e){}};
    document.head.appendChild(s);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",loadMotivationQuotes,{once:true});else loadMotivationQuotes();
})();

(function(){
  "use strict";
  function loadGlobalSearchV42(){
    if(window.__YKS_GLOBAL_SEARCH_V42__||document.querySelector('script[data-yks-global-search-v42]'))return;
    const s=document.createElement("script");
    s.src="./modules/global-search-v42.js?v=4.2.0-r1";
    s.async=false;
    s.setAttribute("data-yks-global-search-v42","1");
    s.onerror=()=>{try{if(typeof infraError==="function")infraError("global-search-v42-load",new Error("Global arama yüklenemedi"));}catch(e){}};
    document.head.appendChild(s);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",loadGlobalSearchV42,{once:true});else loadGlobalSearchV42();
})();

(function(){
  "use strict";
  function loadSmartRepeatV42(){
    if(window.__YKS_SMART_REPEAT_V42__||document.querySelector('script[data-yks-smart-repeat-v42]'))return;
    const s=document.createElement("script");
    s.src="./modules/smart-repeat-v42.js?v=4.2.0-r1";
    s.async=false;
    s.setAttribute("data-yks-smart-repeat-v42","1");
    s.onerror=()=>{try{if(typeof infraError==="function")infraError("smart-repeat-v42-load",new Error("Akıllı Tekrar Merkezi 2.0 yüklenemedi"));}catch(e){}};
    document.head.appendChild(s);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",loadSmartRepeatV42,{once:true});else loadSmartRepeatV42();
})();
