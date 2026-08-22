/* YKS Defterim — sağlam PWA katmanı | v1.8.0 */
const APP_VERSION="1.8.0";
const CACHE="yks-core-v1.8.0";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

self.addEventListener("install",event=>{
  /* Yeni worker bekler; kullanıcı uygulamadaki Güncelle düğmesiyle geçirir. */
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    for(const u of CORE){try{const r=await fetch(u,{cache:"no-store"});if(r&&r.ok)await cache.put(u,r);}catch(e){}}
  }));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("yks-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("message",event=>{
  const t=event.data&&event.data.type;
  if(t==="SKIP_WAITING")self.skipWaiting();
  if(t==="GET_VERSION"&&event.source)event.source.postMessage({type:"APP_VERSION",version:APP_VERSION});
});
self.addEventListener("fetch",event=>{
  const req=event.request;if(req.method!=="GET")return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  /* version.json kesinlikle cache'e girmez; güncelleme kontrolü her zaman ağdan. */
  if(url.pathname.endsWith("/version.json")||url.pathname.endsWith("version.json")){event.respondWith(fetch(req,{cache:"no-store"}));return;}
  if(req.mode==="navigate"){
    event.respondWith(fetch(req,{cache:"no-store"}).then(async res=>{if(res&&res.ok){const c=await caches.open(CACHE);await c.put("./index.html",res.clone());}return res;}).catch(async()=>await caches.match("./index.html")||await caches.match("./")));return;
  }
  event.respondWith(caches.match(req).then(cached=>{
    const fresh=fetch(req,{cache:"no-cache"}).then(async res=>{if(res&&res.ok){const c=await caches.open(CACHE);await c.put(req,res.clone());}return res;}).catch(()=>null);
    return cached||fresh.then(r=>r||new Response("Çevrimdışı",{status:503,headers:{"Content-Type":"text/plain;charset=utf-8"}}));
  }));
});
self.addEventListener("notificationclick",event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{for(const c of list){if("focus" in c)return c.focus();}if(self.clients.openWindow)return self.clients.openWindow("./index.html");}));});
