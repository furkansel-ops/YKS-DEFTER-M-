/* YKS Defterim — dayanıklı PWA katmanı | v4.1.0 */
const APP_VERSION="4.1.0";
const APP_BUILD="4.1.0-r20";
const CACHE="yks-core-v4.1.0-r37";
const CACHE_LINEAGE=["yks-core-v4.1.0-r20","yks-core-v4.1.0-r21","yks-core-v4.1.0-r22","yks-core-v4.1.0-r23","yks-core-v4.1.0-r24","yks-core-v4.1.0-r25","yks-core-v4.1.0-r26","yks-core-v4.1.0-r27","yks-core-v4.1.0-r28","yks-core-v4.1.0-r29","yks-core-v4.1.0-r30","yks-core-v4.1.0-r31","yks-core-v4.1.0-r32","yks-core-v4.1.0-r33","yks-core-v4.1.0-r34","yks-core-v4.1.0-r35","yks-core-v4.1.0-r36"];
const READY_KEY="./__offline_ready__";
const CORE=["./","./index.html","./app.css","./app.js?v=4.1.0-r20","./modules/core-utils.js?v=4.1.0-r27","./modules/stability.js?v=4.1.0-r28","./modules/topic-guides.js?v=4.1.0-r20","./modules/learning-lab.js?v=4.1.0-r26","./modules/learning-lab-v2.js?v=4.1.0-r24","./modules/learning-lab-v3.js?v=4.1.0-r28","./modules/target-center.js?v=4.1.0-r20","./modules/export-center.js?v=4.1.0-r20","./modules/error-journal.js?v=4.1.0-r20","./modules/personal-upgrades.js?v=4.1.0-r20","./modules/progress-v2.js?v=4.1.0-r20","./modules/release-selftest.js?v=4.1.0-r20","./modules/motivation-quotes-v1.js?v=4.1.0-r2","./modules/motivation-quotes-v2.css?v=4.1.0-r1","./modules/study-intelligence-v5.css?v=4.1.0-r1","./modules/ui-polish-v1.css?v=4.1.0-r1","./modules/ui-polish-home-v2.css?v=4.1.0-r1","./modules/ui-polish-focus-v1.css?v=4.1.0-r1","./modules/ui-polish-exam-v1.css?v=4.1.0-r1","./modules/ui-polish-topics-v1.css?v=4.1.0-r1","./modules/ui-polish-error-journal-v1.css?v=4.1.0-r1","./modules/ui-polish-progress-v1.css?v=4.1.0-r1","./modules/ui-polish-progress-v2.css?v=4.1.0-r1","./modules/ui-polish-more-v1.css?v=4.1.0-r1","./modules/ui-polish-program-v1.css?v=4.1.0-r1","./manifest.webmanifest?v=4.1.0-r20","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png"];
const OFFLINE_TEXT="Çevrimdışı";

async function fetchWithTimeout(request,options={},timeoutMs=4500){
  if(typeof AbortController==="undefined")return fetch(request,options);
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeoutMs);
  try{return await fetch(request,Object.assign({},options,{signal:ctl.signal}));}
  finally{clearTimeout(timer);}
}
function buildAssets(html){
  const out=[];for(const match of String(html||"").matchAll(/(?:src|href)=["'](?:\.\/)?(assets\/[^"']+)["']/g))out.push("./"+match[1]);
  return [...new Set(out)];
}
async function cacheCore(){
  const cache=await caches.open(CACHE);
  try{
    const shell=await fetchWithTimeout("./index.html",{cache:"no-store"},6500);
    if(!shell||!shell.ok)throw new Error("Uygulama kabuğu indirilemedi");
    const html=await shell.clone().text(),required=[...new Set(CORE.concat(buildAssets(html)))];
    await Promise.all(required.map(async u=>{
      const r=u==="./index.html"?shell.clone():await fetchWithTimeout(u,{cache:"no-store"},6500);
      if(!r||!r.ok)throw new Error("Çevrimdışı dosya alınamadı: "+u);
      await cache.put(u,r.clone());
    }));
    await cache.put(READY_KEY,new Response(APP_BUILD,{headers:{"Content-Type":"text/plain;charset=utf-8"}}));
  }catch(error){await caches.delete(CACHE);throw error;}
}
function appRootUrl(){
  try{return self.registration&&self.registration.scope?self.registration.scope:new URL("./",self.location.href).href;}
  catch(e){return "./";}
}
function isAppEntry(url){
  try{
    const root=new URL(appRootUrl()),entry=new URL("index.html",root);
    return url.href===root.href||url.href===entry.href||url.pathname===root.pathname||url.pathname===entry.pathname;
  }catch(e){return false;}
}
function isLegacyIndexEntry(url){
  try{
    const root=new URL(appRootUrl()),entry=new URL("index.html",root);
    return url.origin===root.origin&&url.pathname===entry.pathname;
  }catch(e){return false;}
}
async function navigationResponse(req){
  const url=new URL(req.url);
  /* Eski Android/iOS ana ekran kurulumları ./index.html adresini saklamış olabilir.
     Uygulama kimliğini bozmadan bu eski giriş noktasını kanonik klasör köküne taşı. */
  if(isLegacyIndexEntry(url))return Response.redirect(appRootUrl(),302);
  try{
    const res=await fetchWithTimeout(req,{cache:"no-store"},4500);
    if(res&&res.ok)return res;
    /* Eski ana ekran kısayolu proje içinde artık var olmayan bir yola gidiyorsa
       404 sayfasını göstermek yerine kanonik uygulama köküne dön. */
    if(res&&(res.status===404||res.status===410)&&!isAppEntry(url))return Response.redirect(appRootUrl(),302);
    if(res&&res.status<500)return res;
    throw new Error("navigation-network");
  }catch(e){
    /* Çevrimdışıyken de eski/derin bir başlangıç yolu göreli asset yollarını bozmasın. */
    if(!isAppEntry(url))return Response.redirect(appRootUrl(),302);
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
    /* Güncel çekirdek dışında kalan önceki cache'ler ve aynı ailedeki eski çekirdekler temizlenir. */
    keys.filter(k=>k!==CACHE&&(CACHE_LINEAGE.includes(k)||k.startsWith("yks-core-"))).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
self.addEventListener("message",event=>{
  const t=event.data&&event.data.type;
  if(t==="SKIP_WAITING")self.skipWaiting();
  if(t==="GET_VERSION"){
    const msg={type:"APP_VERSION",version:APP_VERSION,build:APP_BUILD};
    if(event.ports&&event.ports[0])event.ports[0].postMessage(msg);
    else if(event.source)event.source.postMessage(msg);
  }
  if(t==="GET_CACHE_STATUS"){
    event.waitUntil(caches.open(CACHE).then(cache=>cache.match(READY_KEY)).then(marker=>{
      const msg={type:"CACHE_STATUS",ready:!!marker,version:APP_VERSION,build:APP_BUILD,cache:CACHE};
      if(event.ports&&event.ports[0])event.ports[0].postMessage(msg);else if(event.source)event.source.postMessage(msg);
    }).catch(()=>{}));
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
  /* Sabit sürümden doğrulanmış büyük modeller yalnız isteğe bağlı yüklenir.
     Ziyaret başına yeniden indirme yok; uygulama kurulumu bunları beklemez. */
  if(/\/anatomy\/(models|images|thumbs)\/[a-z]+\.(glb|webp)$/.test(url.pathname)){
    const response=currentCacheMatch(req).then(async cached=>{
      if(cached)return cached;
      try{
        const result=await fetchWithTimeout(req,{},45000);
        if(result&&result.ok){
          const copy=result.clone();
          event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{}));
        }
        return result||offlineResponse();
      }catch(e){return offlineResponse();}
    });
    event.waitUntil(response.then(()=>{}).catch(()=>{}));
    event.respondWith(response);return;
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
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    const client=list.find(c=>"focus" in c);
    if(client){client.navigate?.(appRootUrl());return client.focus();}
    if(clients.openWindow)return clients.openWindow(appRootUrl());
  }));
});