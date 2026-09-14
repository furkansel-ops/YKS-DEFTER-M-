(function(){
  "use strict";

  var STYLE_ID="yks-teacher-videos-style";
  var PLAYER_ID="yks-teacher-video-player";
  var PIPED_INSTANCES=[
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.leptons.xyz",
    "https://pipedapi.nosebs.ru"
  ];
  var cache=new Map();
  var loading=new Set();
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
    style.textContent="\n.teacher-video-strip{width:100%;max-width:760px;margin:22px auto 0;padding-top:18px;border-top:.5px solid var(--sep,rgba(127,127,127,.25));text-align:left!important}\n.teacher-video-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}\n.teacher-video-head strong{font-size:17px;color:var(--label,#111)}\n.teacher-video-head-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}\n.teacher-video-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}\n.teacher-video-item,.teacher-video-search{appearance:none;-webkit-appearance:none;width:100%;border:.5px solid var(--sep,rgba(127,127,127,.25));background:var(--glass,rgba(255,255,255,.7));border-radius:14px;padding:0;overflow:hidden;text-align:left;color:inherit;cursor:pointer;box-shadow:var(--shadow-1,0 2px 10px rgba(0,0,0,.05));transition:transform .12s ease,border-color .12s ease}\n.teacher-video-item:active,.teacher-video-search:active{transform:scale(.985)}\n.teacher-video-thumb{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:rgba(127,127,127,.14)}\n.teacher-video-fallback{display:grid;place-items:center;width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,rgba(255,0,0,.16),rgba(127,127,127,.08));font-size:30px}\n.teacher-video-copy{display:block;padding:10px 11px 11px}\n.teacher-video-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13.5px;font-weight:700;line-height:1.35;color:var(--label,#111)}\n.teacher-video-meta{display:block;margin-top:5px;font-size:11.5px;line-height:1.3;color:var(--label-3,#777);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.teacher-video-note{grid-column:1/-1;padding:12px 14px;border-radius:12px;background:rgba(127,127,127,.08);font-size:12.5px;line-height:1.45;color:var(--label-2,#555)}\n.teacher-video-search .teacher-video-fallback{font-size:27px;font-weight:800;color:#e11d48}\n.teacher-video-player{position:fixed;inset:0;z-index:950;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.72);backdrop-filter:blur(12px)}\n.teacher-video-player-card{width:min(920px,100%);max-height:calc(100dvh - 36px);overflow:auto;border-radius:18px;background:var(--bg,#111);box-shadow:0 24px 80px rgba(0,0,0,.38)}\n.teacher-video-player-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px}\n.teacher-video-player-top strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--label,#fff)}\n.teacher-video-player-frame{display:block;width:100%;aspect-ratio:16/9;border:0;background:#000}\n.teacher-video-player-actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 14px}\n@media(max-width:620px){.teacher-video-grid{grid-template-columns:1fr 1fr}.teacher-video-head{align-items:flex-start}.teacher-video-item,.teacher-video-search{border-radius:12px}.teacher-video-copy{padding:8px}.teacher-video-title{font-size:12.5px}}\n@media(max-width:430px){.teacher-video-grid{grid-template-columns:1fr}}\n";
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

  function videoKey(teacher,subject){return teacher+"\u0000"+subject;}

  function validVideos(items){
    var seen=new Set();
    return (Array.isArray(items)?items:[]).filter(function(item){
      var id=String(item&&item.id||"").trim();
      if(!id||seen.has(id))return false;
      seen.add(id);
      return true;
    }).slice(0,6);
  }

  function normalizePipedItem(item){
    if(!item||typeof item!=="object")return null;
    var url=String(item.url||"");
    var m=url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
    var id=m?m[1]:"";
    if(!id)return null;
    return {
      id:id,
      title:String(item.title||"YouTube videosu"),
      thumb:String(item.thumbnail||item.thumbnailUrl||("https://i.ytimg.com/vi/"+id+"/hqdefault.jpg")),
      ch:String(item.uploader||item.author||"YouTube"),
      when:String(item.uploadedDate||item.publishedText||""),
      date:""
    };
  }

  function fetchJSON(url,timeoutMs){
    var ctl=typeof AbortController!=="undefined"?new AbortController():null;
    var timer=ctl?setTimeout(function(){ctl.abort();},timeoutMs||5000):0;
    return fetch(url,{headers:{Accept:"application/json"},signal:ctl?ctl.signal:undefined,cache:"no-store"})
      .then(function(res){if(!res.ok)throw new Error("HTTP "+res.status);return res.json();})
      .finally(function(){if(timer)clearTimeout(timer);});
  }

  async function fetchViaPiped(query){
    var lastError=null;
    for(var i=0;i<PIPED_INSTANCES.length;i++){
      try{
        var url=PIPED_INSTANCES[i]+"/search?q="+encodeURIComponent(query)+"&filter=videos";
        var data=await fetchJSON(url,4500);
        var raw=Array.isArray(data)?data:(Array.isArray(data&&data.items)?data.items:[]);
        var out=validVideos(raw.map(normalizePipedItem).filter(Boolean));
        if(out.length)return out;
      }catch(error){lastError=error;}
    }
    throw lastError||new Error("piped-sonuc-yok");
  }

  async function fetchTeacherVideos(teacher,subject,force){
    var key=videoKey(teacher,subject);
    if(force)cache.delete(key);
    if(cache.has(key))return cache.get(key);

    var topic=String(subject||"YKS").trim();
    var query=(teacher+" "+topic+" YKS").replace(/\s+/g," ").trim();
    var nativeItems=[];

    if(typeof window.ytFetch==="function"){
      try{
        var channelId="";
        if(typeof window.resolveChannel==="function"){
          try{channelId=await window.resolveChannel(teacher);}catch(_error){channelId="";}
        }
        nativeItems=validVideos(await window.ytFetch(channelId?(topic+" YKS"):query,channelId?{channelId:channelId}:{}));
        if(!nativeItems.length&&channelId)nativeItems=validVideos(await window.ytFetch(query,{}));
      }catch(_nativeError){nativeItems=[];}
    }

    var result=nativeItems.length?nativeItems:await fetchViaPiped(query);
    cache.set(key,result);
    return result;
  }

  function formatDate(value){
    if(!value)return "";
    var date=new Date(value);
    if(Number.isNaN(date.getTime()))return "";
    return date.toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"});
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
    overlay.innerHTML='<div class="teacher-video-player-card"><div class="teacher-video-player-top"><strong>'+esc(video.title||"Video")+'</strong><button class="btn ghost tiny teacher-video-close" type="button">Kapat</button></div>'+
      '<iframe class="teacher-video-player-frame" src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0" title="'+esc(video.title||"YouTube videosu")+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'+
      '<div class="teacher-video-player-actions"><button class="btn ghost tiny teacher-video-youtube" type="button">YouTube\'da aç</button></div></div>';
    overlay.addEventListener("click",function(event){if(event.target===overlay)closePlayer();});
    var closeButton=overlay.querySelector(".teacher-video-close");
    if(closeButton)closeButton.addEventListener("click",closePlayer);
    var youtubeButton=overlay.querySelector(".teacher-video-youtube");
    if(youtubeButton)youtubeButton.addEventListener("click",function(){window.open("https://www.youtube.com/watch?v="+encodeURIComponent(id),"_blank","noopener,noreferrer");});
    document.body.appendChild(overlay);
  }

  function openSearch(teacher,subject,kind){
    if(typeof window.ytTeacher==="function"){
      try{window.ytTeacher(teacher,kind,subject);return;}catch(_error){}
    }
    var tail=kind==="soru"?"soru çözümü":kind==="deneme"?"deneme çözümü":"konu anlatımı";
    window.open("https://www.youtube.com/results?search_query="+encodeURIComponent((teacher+" "+subject+" "+tail+" YKS").replace(/\s+/g," ").trim()),"_blank","noopener,noreferrer");
  }

  function renderFallback(host,message){
    var grid=host.querySelector(".teacher-video-grid");
    if(!grid)return;
    var teacher=String(host.dataset.teacher||"").trim();
    var subject=String(host.dataset.subject||"YKS").trim()||"YKS";
    grid.innerHTML='<div class="teacher-video-note">'+esc(message||"Videoları açmak için bir seçenek seç.")+'</div>';
    [["▶","Konu anlatımı","konu"],["＋","Soru çözümü","soru"],["✓","Deneme çözümü","deneme"]].forEach(function(item){
      var button=document.createElement("button");
      button.type="button";
      button.className="teacher-video-search";
      button.dataset.kind=item[2];
      button.innerHTML='<span class="teacher-video-fallback">'+item[0]+'</span><span class="teacher-video-copy"><span class="teacher-video-title">'+esc(item[1])+'</span><span class="teacher-video-meta">'+esc(teacher+' · '+subject)+'</span></span>';
      grid.appendChild(button);
    });
  }

  function renderVideos(host,items){
    var grid=host.querySelector(".teacher-video-grid");
    if(!grid)return;
    if(!items.length){renderFallback(host,"Bu hoca için video sonucu alınamadı. YouTube seçeneklerini kullanabilirsin.");return;}
    grid.innerHTML="";
    items.forEach(function(video){
      var button=document.createElement("button");
      button.type="button";
      button.className="teacher-video-item";
      var when=String(video.when||"")||formatDate(video.date);
      var meta=[video.ch,when].filter(Boolean).join(" · ");
      button.innerHTML=(video.thumb?'<img class="teacher-video-thumb" src="'+esc(video.thumb)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<span class="teacher-video-fallback">▶</span>')+
        '<span class="teacher-video-copy"><span class="teacher-video-title">'+esc(video.title||"YouTube videosu")+'</span><span class="teacher-video-meta">'+esc(meta||"YouTube")+'</span></span>';
      button.addEventListener("click",function(event){event.stopPropagation();openPlayer(video);});
      grid.appendChild(button);
    });
  }

  async function hydrate(host,force){
    var teacher=String(host.dataset.teacher||"").trim();
    var subject=String(host.dataset.subject||"YKS").trim()||"YKS";
    if(!teacher)return;
    var key=videoKey(teacher,subject);
    if(loading.has(key)&&!force)return;
    loading.add(key);
    try{
      var items=await fetchTeacherVideos(teacher,subject,!!force);
      renderVideos(host,items);
      host.dataset.videoState="ready";
    }catch(error){
      renderFallback(host,"Gerçek video listesi alınamadı; aşağıdaki YouTube aramaları kullanılabilir.");
      host.dataset.videoState="fallback";
    }finally{
      loading.delete(key);
    }
  }

  function createHost(card,teacher,subject){
    var host=document.createElement("section");
    host.className="teacher-video-strip";
    host.dataset.teacher=teacher;
    host.dataset.subject=subject;
    host.setAttribute("aria-label",teacher+" son videoları");
    host.innerHTML='<div class="teacher-video-head"><strong>Son videolar</strong><span class="teacher-video-head-actions"><button class="btn ghost tiny teacher-video-all" type="button">Tüm videolar</button><button class="btn ghost tiny teacher-video-refresh" type="button">Yenile</button></span></div><div class="teacher-video-grid"></div>';
    var body=card.querySelector(".thb");
    if(body)body.appendChild(host);else card.appendChild(host);
    renderFallback(host,"Videolar yükleniyor…");
    return host;
  }

  function bindHost(host){
    if(host.dataset.videoBound==="1")return;
    host.dataset.videoBound="1";
    host.addEventListener("click",function(event){
      var target=event.target instanceof Element?event.target:null;
      if(!target)return;
      var teacher=String(host.dataset.teacher||"").trim();
      var subject=String(host.dataset.subject||"YKS").trim()||"YKS";
      var searchButton=target.closest(".teacher-video-search");
      if(searchButton){event.stopPropagation();openSearch(teacher,subject,String(searchButton.dataset.kind||"konu"));return;}
      if(target.closest(".teacher-video-refresh")){event.stopPropagation();renderFallback(host,"Videolar yenileniyor…");void hydrate(host,true);return;}
      if(target.closest(".teacher-video-all")){event.stopPropagation();openSearch(teacher,subject,"kanal");}
    });
  }

  function ensureCard(card){
    if(!(card instanceof Element)||!card.classList.contains("thcard")||!card.classList.contains("open"))return;
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

  function installGlobalObserver(){
    if(observer)observer.disconnect();
    var root=document.documentElement||document.body;
    if(!root)return false;
    observer=new MutationObserver(queueScan);
    observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
    document.addEventListener("click",function(event){
      var target=event.target instanceof Element?event.target:null;
      if(target&&target.closest(".thcard")){
        setTimeout(scanOpenTeachers,0);
        setTimeout(scanOpenTeachers,80);
        setTimeout(scanOpenTeachers,240);
      }
    },true);
    if(!healTimer)healTimer=window.setInterval(function(){if(document.querySelector(".thcard.open"))scanOpenTeachers();},700);
    scanOpenTeachers();
    return true;
  }

  function install(){
    injectStyles();
    document.addEventListener("keydown",function(event){if(event.key==="Escape")closePlayer();});
    if(!installGlobalObserver())return false;
    document.documentElement.dataset.teacherVideos="ready";
    document.documentElement.dataset.teacherVideosRuntimeVersion="hotfix3";
    return true;
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
})();