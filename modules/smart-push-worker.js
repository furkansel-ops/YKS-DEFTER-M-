/* Shared PWA service worker: only notifications addressed to the smart reminder feature.
 * Does not touch focus timer notifications or intercept other SW event handlers. */
(function(worker){
  "use strict";
  const PREFIX="yks-smart:",KIND=new Set(["goal-nudge","streak-risk","coach-assigned","coach-approved"]);
  function clean(text,max){
    return typeof text==="string"?text.replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max):"";
  }
  function scopedPath(raw){
    try{
      const url=new URL(raw||"./",worker.registration.scope);
      const root=new URL(worker.registration.scope);
      if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname))return root.href;
      return url.href;
    }catch{return worker.registration.scope;}
  }
  worker.addEventListener("push",event=>{
    if(!event.data)return;
    let payload;try{payload=event.data.json();}catch{return;}
    if(!payload||payload.type!=="yks-smart-v1"||!KIND.has(payload.kind))return;
    const title=clean(payload.title,80)||"YKS Defterim";
    const body=clean(payload.body,160);
    const tag=PREFIX+clean(payload.id,100);
    const url=scopedPath(payload.path);
    event.waitUntil(worker.registration.showNotification(title,{
      body,tag,lang:"tr",dir:"ltr",
      icon:scopedPath("./icon-192.png"),
      badge:scopedPath("./notification-badge.png"),
      renotify:false,silent:false,requireInteraction:false,
      data:{type:"yks-smart",path:url}
    }));
  });
  worker.addEventListener("notificationclick",event=>{
    if(event.notification?.data?.type!=="yks-smart"||
      !String(event.notification.tag).startsWith(PREFIX))return;
    event.notification.close();
    const dest=scopedPath(event.notification.data.path);
    event.waitUntil((async()=>{
      const open=await worker.clients.matchAll({type:"window",includeUncontrolled:true});
      const base=new URL(worker.registration.scope);
      const inScope=open.filter(c=>{try{
        const u=new URL(c.url);return u.origin===base.origin&&u.pathname.startsWith(base.pathname);
      }catch{return false;}});
      if(inScope.length){
        const preferred=inScope.find(c=>c.focused)||inScope[0];
        if(preferred?.focus){await preferred.focus();preferred.postMessage({type:"YKS_SMART_NOTIFICATION_OPEN"});}
      }else if(worker.clients.openWindow)await worker.clients.openWindow(dest);
    })());
  });
})(self);
