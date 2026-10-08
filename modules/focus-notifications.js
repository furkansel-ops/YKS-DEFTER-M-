(function(){
  "use strict";
  if(window.YKSFocusNotifications)return;
  const KEY="yks-focus-notification-link-v1",RUNTIME="yks_focus_runtime_v1";
  let meta={},revision=0,ready=false,reconciling=true,applying=false,closed=false,serial=0,chain=Promise.resolve();
  try{meta=JSON.parse(localStorage.getItem(KEY)||"{}")||{};revision=Number(meta.revision)||0;}catch(_){}
  const supported=()=>"serviceWorker" in navigator&&typeof MessageChannel!=="undefined";
  const enabled=()=>typeof Notification!=="undefined"&&Notification.permission==="granted"&&typeof notifCfg==="function"&&notifCfg().on&&notifCfg().pomo;
  const uuid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
  const sender=uuid()+":";let requestNumber=0;
  function saveMeta(){try{localStorage.setItem(KEY,JSON.stringify(meta));}catch(_){} }
  function status(text){const node=document.getElementById("focusNotificationStatus");if(node)node.textContent=text;}
  function stopIntervals(){clearInterval(pomoTimer);pomoTimer=null;clearInterval(swTimer);swTimer=null;}
  function pauseOther(mode){
    if(mode==="sw"&&pomoState==="running"){
      creditMinutes();pomoLeft=Math.max(0,(pomoEndAt-Date.now())/1000);pomoState="paused";pomoEndAt=0;
      clearInterval(pomoTimer);pomoTimer=null;stopNoise();window.YKSStability?.persistRuntime(true);renderPomo();
    }
    if(mode==="pomo"&&sw().run){
      const watch=sw(),now=Date.now(),start=watch.start||now,elapsed=swElapsed();
      watch.acc=elapsed;watch.run=false;watch.start=0;swCreditElapsed(elapsed);
      swHistoryAdd(Math.max(0,now-start),pomoSubject,start,now);clearInterval(swTimer);swTimer=null;save();renderSw();
    }
  }
  function resumeIntervals(){
    if(reconciling)return;
    if(pomoState==="running"&&!pomoTimer)pomoTimer=setInterval(()=>window.pomoTick(),1000);
    if(sw().run&&!swTimer)swTimer=setInterval(()=>window.swTick(),100);
  }
  function snapshot(preferred=meta.mode||S.focus.mode){
    const watch=sw(),mode=preferred==="sw"&&(watch.run||watch.acc>0)?"sw":pomoState!=="idle"?"pomo":watch.run||watch.acc>0?"sw":"pomo";
    const state=mode==="sw"?(watch.run?"running":watch.acc>0?"paused":"idle"):pomoState;
    if(state==="idle")return null;
    if(!meta.id||meta.mode!==mode){meta={id:uuid(),mode,revision,historyElapsed:mode==="sw"?watch.acc:0};saveMeta();}
    const now=Date.now();
    return {version:1,id:meta.id,mode,state,isWork:mode==="sw"||!!pomoIsWork,total:mode==="sw"?43200:pomoTotal,
      left:mode==="sw"?0:state==="running"?Math.max(0,(pomoEndAt-now)/1000):pomoLeft,
      endAt:mode==="pomo"&&state==="running"?pomoEndAt:0,
      elapsed:mode==="sw"?swElapsed():0,startedAt:mode==="sw"?(meta.startedAt||watch.start||now-watch.acc):pomoStartedAt,
      credited:mode==="sw"?watch.cr:pomoCredited,subject:String(pomoSubject||"").slice(0,80),
      topic:String(typeof pomoTopic!=="undefined"?pomoTopic:"").slice(0,100),task:String(pomoTask||"").slice(0,100),savedAt:now};
  }
  function checkpoint(){
    if(!meta.id)return;
    const credited=meta.mode==="sw"?sw().cr:pomoCredited;if(meta.credited===credited)return;
    meta.credited=credited;saveMeta();
  }
  function timeout(promise,ms){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error("Bildirim bağlantısı zaman aşımına uğradı.")),ms);Promise.resolve(promise).then(v=>{clearTimeout(timer);resolve(v);},e=>{clearTimeout(timer);reject(e);});});}
  async function request(operation,value){
    if(!supported())throw new Error("Bu tarayıcı bildirimden kontrolü desteklemiyor.");
    let reg=await timeout(navigator.serviceWorker.getRegistration(new URL("./",document.baseURI).href),2500);
    if(!reg?.active)reg=await timeout(navigator.serviceWorker.ready,3500);
    const worker=reg?.active;if(!worker)throw new Error("Bildirim bağlantısı hazır değil. Sayfayı yenileyip tekrar dene.");
    return new Promise((resolve,reject)=>{
      const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(new Error("Bildirim kontrolü hazır değil. Uygulamayı bir kez yenile."));},3500);
      channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};
      worker.postMessage({type:"YKS_FOCUS_REQUEST",requestId:sender+(++requestNumber),operation,expectedRevision:revision,snapshot:value,enabled:enabled()},[channel.port2]);
    });
  }
  function recordMeta(record){
    revision=record.revision;
    const x=record.snapshot;
    if(x){meta={...(meta.id===x.id?meta:{}),id:x.id,mode:x.mode||"pomo",revision,startedAt:x.startedAt};}
    else meta={revision};
    saveMeta();
  }
  function apply(record){
    if(!record||!Number.isFinite(record.revision)||record.revision<revision)return;
    const x=record.snapshot,previousId=meta.id;
    if(x&&Date.now()-x.savedAt>12*60*60*1000)return;
    applying=true;stopIntervals();
    try{
      if(!x){
        if(meta.mode==="sw"){sw().run=false;sw().start=0;sw().acc=0;sw().cr=0;save();renderSw();}
        else {pomoState="idle";pomoStartedAt=0;pomoCredited=0;pomoEndAt=0;pomoLeft=pomoTotal;window.YKSStability?.clearRuntime();renderPomo();}
        recordMeta(record);return;
      }
      const same=previousId===x.id,credited=Math.max(x.credited||0,same?(meta.credited||0):0),historyElapsed=same&&Number.isFinite(meta.historyElapsed)?meta.historyElapsed:0;
      recordMeta(record);
      pauseOther(x.mode||"pomo");
      pomoSubject=x.subject||pomoSubject;pomoTask=x.task||"";if(typeof pomoTopic!=="undefined")pomoTopic=x.topic||"";
      if(x.mode==="sw"){
        const watch=sw(),now=Date.now(),elapsed=Math.min(86400000,Math.max(0,x.elapsed+(x.state==="running"?now-x.savedAt:0)));
        const priorElapsed=historyElapsed;
        watch.cr=Math.max(credited,same?watch.cr||0:0);watch.acc=elapsed;watch.start=x.state==="running"?now:0;watch.run=x.state==="running";
        swCreditElapsed(elapsed);
        if(x.state==="paused"&&elapsed>priorElapsed){swHistoryAdd(elapsed-priorElapsed,pomoSubject,x.savedAt-(elapsed-priorElapsed),x.savedAt);meta.historyElapsed=elapsed;}
        S.focus.mode="sw";save();renderSw();renderSwHistory();
      }else{
        let savedCredit=0;try{const saved=JSON.parse(localStorage.getItem(RUNTIME)||"null");if(same)savedCredit=saved?.credited||0;}catch(_){}
        const now=Date.now(),left=x.state==="running"?Math.max(0,(x.endAt-now)/1000):x.left;
        pomoCredited=Math.max(credited,same?pomoCredited:0,savedCredit);pomoTotal=x.total;pomoIsWork=x.isWork;
        pomoLeft=Math.max(0,Math.min(x.total,left));pomoEndAt=x.state==="running"?x.endAt:0;
        pomoStartedAt=x.isWork?now-(x.total-pomoLeft)*1000:0;pomoState=x.state;
        creditMinutes();window.YKSStability?.persistRuntime(true);renderPomo();
      }
      recordMeta(record);checkpoint();
      if(typeof setFocusMode==="function")setFocusMode(x.mode||"pomo",true);
      if(x.state==="paused"){stopNoise();releaseWake();}
      else if(!document.hidden){try{requestWake();}catch(_){} }
    }finally{applying=false;resumeIntervals();}
    if(x?.mode!=="sw"&&x?.state==="running"&&pomoLeft<=0&&!reconciling)window.pomoTick();
  }
  function delivery(result){
    if(result.notificationError)status("Süre korunuyor, fakat bildirim gösterilemedi. Ayarlar → Bildirimler bölümündeki izinleri kontrol et.");
    else if(enabled())status("Bildirimden duraklatabilir ve devam edebilirsin. Arka planda bitiş saati esas alınır.");
    else status("Süreyi bildirimden kontrol etmek için bildirimleri aç.");
  }
  function publish(value=snapshot()){
    if(closed||applying||!ready)return;
    const at=serial;
    chain=chain.catch(()=>{}).then(async()=>{
      const result=await request(value?"sync":"clear",value);
      if(!result?.ok){if(result?.error==="revision_conflict"){apply(result);return;}throw new Error("Bildirimden kontrol şu an kullanılamıyor. Süren uygulamada devam ediyor.");}
      revision=result.revision;if(at===serial){recordMeta(result);checkpoint();}else{meta.revision=revision;saveMeta();}delivery(result);
    }).catch(error=>status(error.message));
  }
  async function reconcile(restore){
    if(closed||reconciling&&ready)return;
    reconciling=true;stopIntervals();const at=serial;
    try{
      await chain.catch(()=>{});
      const result=await request("read");
      if(!result?.ok)throw new Error("Bildirimden kontrol şu an kullanılamıyor. Süren uygulamada devam ediyor.");
      if(at===serial){
        if(result.snapshot)apply(result);
        else if(!result.snapshot&&result.revision>revision&&meta.id)apply(result);
        else {revision=result.revision;restore?.();}
      }else revision=result.revision;
    }catch(error){restore?.();status(error.message);}
    finally{reconciling=false;ready=true;resumeIntervals();}
    if(pomoState==="running"&&pomoEndAt<=Date.now())window.pomoTick();
    publish();
  }
  function changed(name){
    if(applying)return;serial++;
    if(name==="swStart"&&sw().run)pauseOther("sw");
    if(name==="startPomo"&&pomoState==="running"){pauseOther("pomo");if(pomoIsWork)pomoStartedAt=Date.now()-(pomoTotal-pomoLeft)*1000;}
    if(name==="resetPomo"||name==="finishPhase"||name==="swReset"){
      const value=name==="swReset"?(pomoState==="running"?snapshot("pomo"):null):(sw().run?snapshot("sw"):null);publish(value);if(!value){meta={revision};saveMeta();}
    }else{
      const value=snapshot(name.startsWith("sw")?"sw":"pomo");if(value){if(name==="swPause")meta.historyElapsed=value.elapsed;meta.credited=value.credited;saveMeta();}publish(value);
    }
  }
  for(const name of ["startPomo","pausePomo","resetPomo","finishPhase","skipPhase","swStart","swPause","swReset"]){
    const original=window[name];if(typeof original!=="function")continue;
    window[name]=function(){const result=original.apply(this,arguments);changed(name);return result;};
  }
  for(const name of ["pomoTick","swTick"]){const original=window[name];window[name]=function(){if(reconciling)return;const result=original.apply(this,arguments);checkpoint();return result;};}
  function openFocus(){window.go?.("pomo");if(typeof setFocusMode==="function")setFocusMode(meta.mode||"pomo",true);}
  navigator.serviceWorker?.addEventListener("message",event=>{
    if(closed)return;
    const workerUrl=event.source?.scriptURL;if(!workerUrl||new URL(workerUrl).href!==new URL("./sw.js",document.baseURI).href)return;
    if(typeof event.data?.requestId==="string"&&event.data.requestId.startsWith(sender))return;
    if(event.data?.type==="YKS_FOCUS_STATE"&&event.data.revision>revision){apply(event.data);delivery(event.data);}
    if(event.data?.type==="YKS_FOCUS_OPEN"){openFocus();void reconcile();}
  });
  navigator.serviceWorker?.addEventListener("controllerchange",()=>{if(ready)void reconcile();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){checkpoint();window.YKSStability?.persistRuntime(true);}else if(ready)void reconcile();},true);
  document.addEventListener("freeze",()=>{reconciling=true;stopIntervals();checkpoint();window.YKSStability?.persistRuntime(true);});
  document.addEventListener("resume",()=>{reconciling=false;void reconcile();});
  window.addEventListener("pagehide",checkpoint);
  window.addEventListener("pageshow",event=>{if(event.persisted){reconciling=false;void reconcile();}});
  window.addEventListener("yks:notification-settings",()=>publish());
  function installUi(){
    const host=document.querySelector("#pomo .v29-session-setup");if(!host)return;
    const panel=document.createElement("div");panel.id="focusNotificationControls";panel.innerHTML='<button type="button" class="btn ghost tiny" id="focusNotificationEnable">Bildirimden kontrol et</button><p class="hint" id="focusNotificationStatus" role="status">Süreyi bildirimden duraklatıp devam ettirebilirsin. Uygulama uyutulursa bitiş alarmı gecikebilir.</p>';
    host.appendChild(panel);panel.querySelector("button").addEventListener("click",async()=>{if(await window.askNotif?.()==="granted"){notifCfg().pomo=true;save();renderNotifSettings();}publish();});
    if(new URL(location.href).searchParams.get("focus")==="1"){setTimeout(openFocus,300);const url=new URL(location.href);url.searchParams.delete("focus");history.replaceState(history.state,"",url.href);}
  }
  async function shutdown(){
    closed=true;ready=false;reconciling=true;stopIntervals();await chain.catch(()=>{});
    try{const latest=await request("read");if(latest.ok){revision=latest.revision;await request("clear");}}catch(_){}
  }
  window.YKSFocusNotifications={restore:callback=>reconcile(callback),refresh:()=>reconcile(),snapshot,checkpoint,shutdown};
  stopIntervals();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installUi,{once:true});else installUi();
})();
