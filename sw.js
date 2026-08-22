/* YKS Defterim — PWA çevrimdışı katmanı | 2026.08.22.3 */
const CACHE="yks-v3-20260822-3";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];

self.addEventListener("install",event=>{
  /* Güncellemede otomatik skipWaiting YOK: uygulama kullanıcıya Güncelle butonu gösterir. */
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).catch(()=>{}));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener("message",event=>{
  if(event.data&&event.data.type==="SKIP_WAITING")self.skipWaiting();
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  /* Sayfa geçişleri: önce ağ. Böylece GitHub'daki yeni index hızlıca gelir. */
  if(req.mode==="navigate"){
    event.respondWith(fetch(req,{cache:"no-store"}).then(res=>{
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put("./index.html",copy)).catch(()=>{}); return res;
    }).catch(()=>caches.match("./index.html").then(r=>r||caches.match("./"))));
    return;
  }

  /* Statik dosyalar: cache hızlı, arka planda ağdan tazele. */
  event.respondWith(caches.match(req).then(cached=>{
    const fresh=fetch(req).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});}return res;}).catch(()=>cached);
    return cached||fresh;
  }));
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const c of list){if("focus" in c)return c.focus();}
    if(self.clients.openWindow)return self.clients.openWindow("./index.html");
  }));
});
