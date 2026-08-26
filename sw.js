/* YKS Defterim — dayanıklı PWA katmanı | v4.0.0 */
const APP_VERSION="4.0.0";
const CACHE="yks-core-v4.0.0-r18";
const CORE=["./","./index.html","./app.css","./app.js?v=4.0.0-r18","./modules/core-utils.js?v=4.0.0-r18","./modules/stability.js?v=4.0.0-r18","./modules/topic-guides.js?v=4.0.0-r18","./modules/learning-lab.js?v=4.0.0-r18","./modules/target-center.js?v=4.0.0-r18","./modules/export-center.js?v=4.0.0-r18","./modules/release-selftest.js?v=4.0.0-r18","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];
const OFFLINE_TEXT="Çevrimdışı";

async function fetchWithTimeout(request,options={},timeoutMs=4500){
  if(typeof AbortController==="undefined")return fetch(request,options);
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeoutMs);
  try{return await fetch(request,Object.assign({},options,{signal:ctl.signal}));}
  finally{clearTimeout(timer);}
}
async function cacheCore(){
  const cache=await caches.open(CACHE);
  await Promise.allSettled(CORE.map(async u=>{
    const r=await fetchWithTimeout(u,{cache:"no-store"},6500);
    if(r&&r.ok)await cache.put(u,r.clone());
  }));
  /* Eksik/yarım yeni sürüm eski sağlam worker'ın yerini almasın. */
  const shell=await cache.match("./index.html");
  if(!shell)throw new Error("Uygulama kabuğu önbelleğe alınamadı");
}
async function navigationResponse(req){
  try{
    const res=await fetchWithTimeout(req,{cache:"no-store"},4500);
    if(!res||!res.ok){
      if(res&&res.status<500)return res;
      throw new Error("navigation-network");
    }
    try{const cache=await caches.open(CACHE);await cache.put("./index.html",res.clone());}catch(e){}
    return res;
  }catch(e){
    return (await currentCacheMatch("./index.html"))||(await currentCacheMatch("./"))||
      new Response(OFFLINE_TEXT,{status:503,headers:{"Content-Type":"text/plain;charset=utf-8","Cache-Control":"no-store"}});
  }
}
function offlineResponse(){return new Response(OFFLINE_TEXT,{status:503,headers:{"Content-Type":"text/plain;charset=utf-8","Cache-Control":"no-store"}});}
async function currentCacheMatch(request){
  try{const cache=await caches.open(CACHE);return (await cache.match(request))||null;}catch(e){return null;}
}

self.addEventListener("install",event=>{
  /* Yeni worker ancak temel uygulama kabuğu gerçekten hazırsa kurulmuş sayılır. */
  event.waitUntil(cacheCore());
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    /* Yalnız bu uygulamanın çekirdek cache'lerini temizle; başka yks-* cache'lerine dokunma. */
    keys.filter(k=>k.startsWith("yks-core-")&&k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
self.addEventListener("message",event=>{
  const t=event.data&&event.data.type;
  if(t==="SKIP_WAITING")self.skipWaiting();
  if(t==="GET_VERSION"){
    const msg={type:"APP_VERSION",version:APP_VERSION};
    if(event.ports&&event.ports[0])event.ports[0].postMessage(msg);
    else if(event.source)event.source.postMessage(msg);
  }
});
self.addEventListener("fetch",event=>{
  const req=event.request;if(!req||req.method!=="GET")return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  /* Sürüm dosyası cache'e girmez ve kötü bağlantıda sonsuza kadar beklemez. */
  if(url.pathname.endsWith("/version.json")||url.pathname.endsWith("version.json")){
    /* Sürüm kontrolü çevrimdışıyken rejected Response bırakmasın. */
    event.respondWith(fetchWithTimeout(req,{cache:"no-store"},3500).catch(()=>offlineResponse()));return;
  }
  if(req.mode==="navigate"){
    event.respondWith(navigationResponse(req));return;
  }
  /* Statik dosyalarda cache-first + arka planda yenileme: açılış hızlı, dosya güncel kalır. */
  const fresh=fetchWithTimeout(req,{cache:"no-cache"},5000).then(async res=>{
    if(res&&res.ok){try{const cache=await caches.open(CACHE);await cache.put(req,res.clone());}catch(e){}}
    return res;
  });
  event.waitUntil(fresh.then(()=>{}).catch(()=>{}));
  event.respondWith(currentCacheMatch(req).then(cached=>cached||fresh.catch(()=>null).then(r=>r||offlineResponse())));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const c of list){if("focus" in c)return c.focus();}
    if(self.clients.openWindow)return self.clients.openWindow("./index.html");
  }));
});
