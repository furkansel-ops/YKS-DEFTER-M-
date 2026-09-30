(function(){
  "use strict";

  var STYLE_ID="yks-teacher-videos-style";
  var PLAYER_ID="yks-teacher-video-player";
  var PIPED_INSTANCES=[
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.tokhmi.xyz",
    "https://pipedapi.moomoo.me",
    "https://pipedapi.syncpundit.io",
    "https://api-piped.mha.fi",
    "https://piped-api.garudalinux.org",
    "https://pipedapi.rivo.lol",
    "https://pipedapi.leptons.xyz",
    "https://piped-api.lunar.icu",
    "https://pipedapi.colinslegacy.com",
    "https://pipedapi-libre.kavin.rocks",
    "https://pipedapi.adminforge.de",
    "https://api.piped.yt",
    "https://api.piped.private.coffee"
  ];
  var cache=new Map();
  var loading=new Map();
  var observer=null;
  var scanQueued=false;
  var healTimer=0;

  function esc(value){
    return String(value==null?"":value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }

  function injectStyles(){
    if(document.getElementById(STYLE_ID))return;
    var style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent="\n.teacher-video-strip{width:100%;max-width:760px;margin:22px auto 0;padding-top:18px;border-top:.5px solid var(--sep,rgba(127,127,127,.25));text-align:left!important}\n.teacher-video-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}\n.teacher-video-head strong{font-size:17px;color:var(--label,#111)}\n.teacher-video-head-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}\n.teacher-video-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}\n.teacher-video-item,.teacher-video-search{appearance:none;-webkit-appearance:none;width:100%;border:.5px solid var(--sep,rgba(127,127,127,.25));background:var(--glass,rgba(255,255,255,.7));border-radius:14px;padding:0;overflow:hidden;text-align:left;color:inherit;cursor:pointer;box-shadow:var(--shadow-1,0 2px 10px rgba(0,0,0,.05));transition:transform .12s ease,border-color .12s ease}\n.teacher-video-item:active,.teacher-video-search:active{transform:scale(.985)}\n.teacher-video-thumb{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:rgba(127,127,127,.14)}\n.teacher-video-copy{display:block;padding:10px 11px 11px}\n.teacher-video-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13.5px;font-weight:700;line-height:1.35;color:var(--label,#111)}\n.teacher-video-meta{display:block;margin-top:5px;font-size:11.5px;line-height:1.3;color:var(--label-3,#777);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.teacher-video-note{grid-column:1/-1;padding:14px;border-radius:12px;background:rgba(127,127,127,.08);font-size:13px;line-height:1.45;color:var(--label-2,#555)}\n.teacher-video-loading{display:flex;align-items:center;gap:10px}\n.teacher-video-spinner{width:17px;height:17px;border:2px solid rgba(127,127,127,.25);border-top-color:var(--accent,#0a6cff);border-radius:50%;animation:yksTeacherSpin .75s linear infinite;flex:none}\n@keyframes yksTeacherSpin{to{transform:rotate(360deg)}}\n.teacher-video-search{padding:14px 15px;font-weight:700;text-align:center}\n.teacher-video-player{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.72);backdrop-filter:blur(12px)}\n.teacher-video-player-card{width:min(920px,100%);max-height:calc(100dvh - 36px);overflow:auto;border-radius:18px;background:var(--bg,#111);box-shadow:0 24px 80px rgba(0,0,0,.38)}\n.teacher-video-player-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px}\n.teacher-video-player-top strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--label,#fff)}\n.teacher-video-player-frame{display:block;width:100%;aspect-ratio:16/9;border:0;background:#000}\n.teacher-video-player-actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 14px}\nbody.teacher-open #cloudSyncBox{display:none!important}\n@media(max-width:620px){.teacher-video-grid{grid-template-columns:1fr 1fr}.teacher-video-head{align-items:flex-start}.teacher-video-item{border-radius:12px}.teacher-video-copy{padding:8px}.teacher-video-title{font-size:12.5px}}\n@media(max-width:430px){.teacher-video-grid{grid-template-columns:1fr}}\n";
    document.head.appendChild(style);
  }

  function teacherNameFromCard(card){
    var title=card.querySelector(".tht");
    if(!title)return "";
    var clone=title.cloneNode(true);
    clone.querySelectorAll(".thown").forEach(function(node){node.remove();});
    return String(clone.textContent||"").replace(/\s+/g," ").trim();
  }

  function subjectFromCard(card){
    var meta=card.querySelector(".thm");
    if(!meta)return "YKS";
    var text=String(meta.textContent||"").replace(/\s+/g," ").trim();
    var dot=text.indexOf("·");
    if(dot>=0)text=text.slice(dot+1).trim();
    return (text.split(",")[0]||"YKS").trim()||"YKS";
  }

  function keyFor(teacher,subject){return teacher+"\u0000"+subject;}

  function validVideos(items){
    var seen=new Set();
    return (Array.isArray(items)?items:[]).filter(function(item){
      var id=String(item&&item.id||"").trim();
      if(!/^[A-Za-z0-9_-]{6,}$/.test(id)||seen.has(id))return false;
      seen.add(id);
      return true;
    }).slice(0,6);
  }

  function normalizePipedItem(item){
    if(!item||typeof item!=="object")return null;
    var url=String(item.url||item.videoUrl||"");
    var m=url.match(/[?&]v=([A-Za-z0-9_-]{6,})/)||url.match(/\/watch\/([A-Za-z0-9_-]{6,})/)||url.match(/^([A-Za-z0-9_-]{6,})$/);
    var id=m?m[1]:String(item.id||"");
    if(!/^[A-Za-z0-9_-]{6,}$/.test(id))return null;
    return {
      id:id,
      title:String(item.title||"YouTube videosu"),
      thumb:String(item.thumbnail||item.thumbnailUrl||("https://i.ytimg.com/vi/"+id+"/hqdefault.jpg")),
      ch:String(item.uploaderName||item.uploader||item.author||"YouTube"),
      when:String(item.uploadedDate||item.publishedText||""),
      date:""
    };
  }

  function fetchJSON(url,timeoutMs){
    var ctl=typeof AbortController!=="undefined"?new AbortController():null;
    var timer=ctl?setTimeout(function(){ctl.abort();},timeoutMs||4500):0;
    return fetch(url,{headers:{Accept:"application/json"},signal:ctl?ctl.signal:undefined,cache:"no-store",credentials:"omit"})
      .then(function(res){if(!res.ok)throw new Error("HTTP "+res.status);return res.json();})
      .finally(function(){if(timer)clearTimeout(timer);});
  }

  function searchOneInstance(base,query){
    var url=base+"/search?q="+encodeURIComponent(query)+"&filter=videos";
    return fetchJSON(url,4200).then(function(data){
      var raw=Array.isArray(data)?data:(Array.isArray(data&&data.items)?data.items:[]);
      var out=validVideos(raw.map(normalizePipedItem).filter(Boolean));
      if(!out.length)throw new Error("empty");
      return out;
    });
  }

  function fetchViaPiped(query){
    return new Promise(function(resolve,reject){
      var done=false;
      var failed=0;
      var total=PIPED_INSTANCES.length;
      PIPED_INSTANCES.forEach(function(base){
        searchOneInstance(base,query).then(function(items){
          if(done)return;
          done=true;
          resolve(items);
        }).catch(function(){
          failed+=1;
          if(!done&&failed>=total){done=true;reject(new Error("video-kaynagi-yok"));}
        });
      });
    });
  }

  function nativeVideos(teacher,subject,query){
    if(typeof window.ytFetch!=="function")return Promise.resolve([]);
    return Promise.resolve().then(async function(){
      var channelId="";
      if(typeof window.resolveChannel==="function"){
        try{channelId=await window.resolveChannel(teacher);}catch(_error){channelId="";}
      }
      var items=[];
      try{items=validVideos(await window.ytFetch(channelId?(subject+" YKS"):query,channelId?{channelId:channelId}:{}));}catch(_error){items=[];}
      if(!items.length&&channelId){try{items=validVideos(await window.ytFetch(query,{}));}catch(_error2){items=[];}}
      return items;
    });
  }

  async function fetchTeacherVideos(teacher,subject,force){
    var key=keyFor(teacher,subject);
    if(force)cache.delete(key);
    if(cache.has(key))return cache.get(key);
    var query=(teacher+" "+subject+" YKS").replace(/\s+/g," ").trim();
    var items=await nativeVideos(teacher,subject,query);
    if(!items.length)items=await fetchViaPiped(query);
    cache.set(key,items);
    return items;
  }

  function closePlayer(){
    var node=document.getElementById(PLAYER_ID);
    if(node)node.remove();
  }

  function openPlayer(video){
    closePlayer();
    var id=String(video&&video.id||"").replace(/[^A-Za-z0-9_-]/g,"");
    if(!id)return;
    var overlay=document.createElement("div");
    overlay.id=PLAYER_ID;
    overlay.className="teacher-video-player";
    overlay.setAttribute("role","dialog");
    overlay.setAttribute("aria-modal","true");
    overlay.innerHTML='<div class="teacher-video-player-card"><div class="teacher-video-player-top"><strong>'+esc(video.title||"Video")+'</strong><button class="btn ghost tiny teacher-video-close" type="button">Kapat</button></div><iframe class="teacher-video-player-frame" src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0" title="'+esc(video.title||"YouTube videosu")+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><div class="teacher-video-player-actions"><button class="btn ghost tiny teacher-video-youtube" type="button">YouTube\'da aç</button></div></div>';
    overlay.addEventListener("click",function(event){if(event.target===overlay)closePlayer();});
    overlay.querySelector(".teacher-video-close").addEventListener("click",closePlayer);
    overlay.querySelector(".teacher-video-youtube").addEventListener("click",function(){window.open("https://www.youtube.com/watch?v="+encodeURIComponent(id),"_blank","noopener,noreferrer");});
    document.body.appendChild(overlay);
  }

  function openSearch(teacher,subject){
    window.open("https://www.youtube.com/results?search_query="+encodeURIComponent((teacher+" "+subject+" YKS").replace(/\s+/g," ").trim()),"_blank","noopener,noreferrer");
  }

  function showLoading(host,label){
    var grid=host.querySelector(".teacher-video-grid");
    if(!grid)return;
    grid.innerHTML='<div class="teacher-video-note teacher-video-loading"><span class="teacher-video-spinner" aria-hidden="true"></span><span>'+esc(label||"Gerçek videolar getiriliyor…")+'</span></div>';
  }

  function showError(host){
    var grid=host.querySelector(".teacher-video-grid");
    if(!grid)return;
    grid.innerHTML='<div class="teacher-video-note">Video kaynağı şu an yanıt vermedi. Aşağıdaki düğme hocanın YouTube sonuçlarını açar.</div><button class="teacher-video-search" type="button">YouTube\'da ara</button>';
    var button=grid.querySelector(".teacher-video-search");
    if(button)button.addEventListener("click",function(event){event.stopPropagation();openSearch(String(host.dataset.teacher||""),String(host.dataset.subject||"YKS"));});
  }

  function renderVideos(host,items){
    var grid=host.querySelector(".teacher-video-grid");
    if(!grid)return;
    if(!items.length){showError(host);return;}
    grid.innerHTML="";
    items.forEach(function(video){
      var button=document.createElement("button");
      button.type="button";
      button.className="teacher-video-item";
      var meta=[video.ch,video.when].filter(Boolean).join(" · ");
      button.innerHTML='<img class="teacher-video-thumb" src="'+esc(video.thumb||("https://i.ytimg.com/vi/"+video.id+"/hqdefault.jpg"))+'" alt="" loading="lazy" referrerpolicy="no-referrer"><span class="teacher-video-copy"><span class="teacher-video-title">'+esc(video.title||"YouTube videosu")+'</span><span class="teacher-video-meta">'+esc(meta||"YouTube")+'</span></span>';
      button.addEventListener("click",function(event){event.stopPropagation();openPlayer(video);});
      grid.appendChild(button);
    });
  }

  function hydrate(host,force){
    var teacher=String(host.dataset.teacher||"").trim();
    var subject=String(host.dataset.subject||"YKS").trim()||"YKS";
    if(!teacher)return Promise.resolve(false);
    var key=keyFor(teacher,subject);
    if(loading.has(key)&&!force)return loading.get(key);
    showLoading(host,force?"Videolar yenileniyor…":"Gerçek videolar getiriliyor…");
    var promise=fetchTeacherVideos(teacher,subject,!!force).then(function(items){
      if(!document.contains(host))return false;
      renderVideos(host,items);
      host.dataset.videoState="ready";
      return true;
    }).catch(function(){
      if(document.contains(host))showError(host);
      host.dataset.videoState="error";
      return false;
    }).finally(function(){loading.delete(key);});
    loading.set(key,promise);
    return promise;
  }

  function createHost(card,teacher,subject){
    var host=document.createElement("section");
    host.className="teacher-video-strip";
    host.dataset.teacher=teacher;
    host.dataset.subject=subject;
    host.setAttribute("aria-label",teacher+" son videoları");
    host.innerHTML='<div class="teacher-video-head"><strong>Son videolar</strong><span class="teacher-video-head-actions"><button class="btn ghost tiny teacher-video-all" type="button">YouTube\'da tümü</button><button class="btn ghost tiny teacher-video-refresh" type="button">Yenile</button></span></div><div class="teacher-video-grid"></div>';
    var body=card.querySelector(".thb");
    if(body)body.appendChild(host);else card.appendChild(host);
    showLoading(host,"Gerçek videolar getiriliyor…");
    return host;
  }

  function bindHost(host){
    if(host.dataset.videoBound==="1")return;
    host.dataset.videoBound="1";
    host.addEventListener("click",function(event){
      var target=event.target instanceof Element?event.target:null;
      if(!target)return;
      if(target.closest(".teacher-video-refresh")){event.stopPropagation();void hydrate(host,true);return;}
      if(target.closest(".teacher-video-all")){event.stopPropagation();openSearch(String(host.dataset.teacher||""),String(host.dataset.subject||"YKS"));}
    });
  }

  function ensureCard(card){
    if(!(card instanceof Element)||!card.classList.contains("open"))return;
    var teacher=teacherNameFromCard(card);
    if(!teacher)return;
    var subject=subjectFromCard(card);
    var host=card.querySelector(".teacher-video-strip");
    if(!host)host=createHost(card,teacher,subject);
    host.dataset.teacher=teacher;
    host.dataset.subject=subject;
    bindHost(host);
    if(host.dataset.hydrated!=="1"){
      host.dataset.hydrated="1";
      void hydrate(host,false);
    }
    document.documentElement.dataset.teacherVideosVisible="1";
  }

  function scanOpenTeachers(){
    scanQueued=false;
    var cards=document.querySelectorAll(".thcard.open");
    cards.forEach(ensureCard);
    document.documentElement.dataset.teacherVideosModal=cards.length?"open":"closed";
  }

  function queueScan(){
    if(scanQueued)return;
    scanQueued=true;
    if(typeof queueMicrotask==="function")queueMicrotask(scanOpenTeachers);
    else Promise.resolve().then(scanOpenTeachers);
  }

  function install(){
    injectStyles();
    document.addEventListener("keydown",function(event){if(event.key==="Escape")closePlayer();});
    observer=new MutationObserver(queueScan);
    observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
    document.addEventListener("click",function(event){
      var target=event.target instanceof Element?event.target:null;
      if(target&&target.closest(".thcard")){
        setTimeout(scanOpenTeachers,0);
        setTimeout(scanOpenTeachers,100);
        setTimeout(scanOpenTeachers,300);
      }
    },true);
    if(!healTimer)healTimer=window.setInterval(function(){if(document.querySelector(".thcard.open"))scanOpenTeachers();},900);
    scanOpenTeachers();
    document.documentElement.dataset.teacherVideos="ready";
    document.documentElement.dataset.teacherVideosRuntimeVersion="hotfix4";
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
})();