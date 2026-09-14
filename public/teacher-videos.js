(function(){
  "use strict";

  var STYLE_ID="yks-teacher-videos-style";
  var PLAYER_ID="yks-teacher-video-player";
  var cache=new Map();
  var loading=new Set();
  var installed=false;

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
    style.textContent="\n.teacher-video-strip{margin-top:18px;padding-top:16px;border-top:.5px solid var(--sep,rgba(127,127,127,.25))}\n.teacher-video-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}\n.teacher-video-head strong{font-size:16px;color:var(--label,#111)}\n.teacher-video-head-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}\n.teacher-video-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}\n.teacher-video-item{appearance:none;-webkit-appearance:none;width:100%;border:.5px solid var(--sep,rgba(127,127,127,.25));background:var(--glass,rgba(255,255,255,.7));border-radius:14px;padding:0;overflow:hidden;text-align:left;color:inherit;cursor:pointer;box-shadow:var(--shadow-1,0 2px 10px rgba(0,0,0,.05));transition:transform .12s ease,border-color .12s ease}\n.teacher-video-item:active{transform:scale(.985)}\n.teacher-video-thumb{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:rgba(127,127,127,.14)}\n.teacher-video-fallback{display:grid;place-items:center;width:100%;aspect-ratio:16/9;background:rgba(127,127,127,.12);font-size:30px}\n.teacher-video-copy{display:block;padding:10px 11px 11px}\n.teacher-video-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13.5px;font-weight:700;line-height:1.35;color:var(--label,#111)}\n.teacher-video-meta{display:block;margin-top:5px;font-size:11.5px;line-height:1.3;color:var(--label-3,#777);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.teacher-video-state{padding:14px;border-radius:12px;background:rgba(127,127,127,.08);font-size:13px;line-height:1.45;color:var(--label-2,#555)}\n.teacher-video-player{position:fixed;inset:0;z-index:950;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.72);backdrop-filter:blur(12px)}\n.teacher-video-player-card{width:min(920px,100%);max-height:calc(100dvh - 36px);overflow:auto;border-radius:18px;background:var(--bg,#111);box-shadow:0 24px 80px rgba(0,0,0,.38)}\n.teacher-video-player-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px}\n.teacher-video-player-top strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--label,#fff)}\n.teacher-video-player-frame{display:block;width:100%;aspect-ratio:16/9;border:0;background:#000}\n.teacher-video-player-actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 14px}\n@media(max-width:620px){.teacher-video-grid{grid-template-columns:1fr 1fr}.teacher-video-head{align-items:flex-start}.teacher-video-item{border-radius:12px}.teacher-video-copy{padding:8px}.teacher-video-title{font-size:12.5px}}\n@media(max-width:430px){.teacher-video-grid{grid-template-columns:1fr}}\n";
    document.head.appendChild(style);
  }

  function stripMarkup(teacher,subject){
    return '<section class="teacher-video-strip" data-teacher="'+esc(teacher)+'" data-subject="'+esc(subject)+'" aria-label="'+esc(teacher)+' son videoları">'+
      '<div class="teacher-video-head"><strong>Son videolar</strong><span class="teacher-video-head-actions">'+
      '<button class="btn ghost tiny teacher-video-all" type="button">Tüm videolar</button>'+
      '<button class="btn ghost tiny teacher-video-refresh" type="button">Yenile</button></span></div>'+
      '<div class="teacher-video-grid"><div class="teacher-video-state">Videolar hazırlanıyor…</div></div></section>';
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

  async function fetchTeacherVideos(teacher,subject,force){
    var key=videoKey(teacher,subject);
    if(force)cache.delete(key);
    if(cache.has(key))return cache.get(key);
    if(typeof window.ytFetch!=="function")throw new Error("Video servisi henüz hazır değil");

    var channelId="";
    if(typeof window.resolveChannel==="function"){
      try{channelId=await window.resolveChannel(teacher);}catch(_error){channelId="";}
    }

    var topic=String(subject||"YKS").trim();
    var query=channelId?(topic+" YKS"):(teacher+" "+topic+" YKS");
    var options=channelId?{channelId:channelId}:{};
    var result=validVideos(await window.ytFetch(query.replace(/\s+/g," ").trim(),options));

    if(!result.length&&channelId){
      result=validVideos(await window.ytFetch((teacher+" "+topic+" YKS").replace(/\s+/g," ").trim(),{}));
    }

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

  function renderVideos(host,items){
    var grid=host.querySelector(".teacher-video-grid");
    if(!grid)return;
    if(!items.length){
      grid.innerHTML='<div class="teacher-video-state">Bu hoca için video bulunamadı. “Tüm videolar” ile geniş aramayı açabilirsin.</div>';
      return;
    }
    grid.innerHTML="";
    items.forEach(function(video){
      var button=document.createElement("button");
      button.type="button";
      button.className="teacher-video-item";
      var meta=[video.ch,formatDate(video.date)].filter(Boolean).join(" · ");
      button.innerHTML=(video.thumb?'<img class="teacher-video-thumb" src="'+esc(video.thumb)+'" alt="" loading="lazy" referrerpolicy="no-referrer">':'<span class="teacher-video-fallback">▶</span>')+
        '<span class="teacher-video-copy"><span class="teacher-video-title">'+esc(video.title||"YouTube videosu")+'</span><span class="teacher-video-meta">'+esc(meta||"YouTube")+'</span></span>';
      button.addEventListener("click",function(event){event.stopPropagation();openPlayer(video);});
      grid.appendChild(button);
    });
  }

  function bindHost(host){
    if(host.dataset.videoBound==="1")return;
    host.dataset.videoBound="1";
    host.addEventListener("click",function(event){
      var target=event.target instanceof Element?event.target:null;
      if(!target)return;
      var teacher=String(host.dataset.teacher||"").trim();
      var subject=String(host.dataset.subject||"").trim();
      if(target.closest(".teacher-video-refresh")){
        event.stopPropagation();
        void hydrate(host,true);
        return;
      }
      if(target.closest(".teacher-video-all")){
        event.stopPropagation();
        if(typeof window.ytTeacher==="function")window.ytTeacher(teacher,"kanal",subject);
        else window.open("https://www.youtube.com/results?search_query="+encodeURIComponent((teacher+" "+subject+" YKS").trim()),"_blank","noopener,noreferrer");
      }
    });
  }

  async function hydrate(host,force){
    var teacher=String(host.dataset.teacher||"").trim();
    var subject=String(host.dataset.subject||"").trim();
    if(!teacher)return;
    bindHost(host);
    var key=videoKey(teacher,subject);
    if(loading.has(key)&&!force)return;
    loading.add(key);
    var grid=host.querySelector(".teacher-video-grid");
    if(grid)grid.innerHTML='<div class="teacher-video-state">Videolar getiriliyor…</div>';
    try{
      renderVideos(host,await fetchTeacherVideos(teacher,subject,!!force));
      host.dataset.videoState="ready";
    }catch(error){
      var message=error instanceof Error?error.message:String(error);
      if(grid)grid.innerHTML='<div class="teacher-video-state">Videolar şu anda alınamadı: '+esc(message)+'<br>“Tüm videolar” ile YouTube aramasını açabilirsin.</div>';
      host.dataset.videoState="error";
    }finally{
      loading.delete(key);
    }
  }

  function hydrateOpenTeachers(){
    document.querySelectorAll(".thcard.open .teacher-video-strip").forEach(function(host){
      if(host.dataset.hydrated!=="1"){
        host.dataset.hydrated="1";
        void hydrate(host,false);
      }
    });
  }

  function install(){
    if(installed)return true;
    injectStyles();
    var originalTeacherCard=window.teacherCard;
    var originalRenderTeachers=window.renderTeachers;
    if(typeof originalTeacherCard!=="function"||typeof originalRenderTeachers!=="function"){
      document.documentElement.dataset.teacherVideos="legacy-missing";
      return false;
    }

    window.teacherCard=function(teacher){
      var html=originalTeacherCard.apply(this,arguments);
      if(typeof html!=="string"||!/class="thcard[^\"]*\bopen\b/u.test(html)||html.indexOf("teacher-video-strip")>=0)return html;
      var teacherName=String(teacher&&teacher.a||"").trim();
      var subject=String(teacher&&Array.isArray(teacher.d)&&teacher.d[0]||"").trim();
      if(!teacherName)return html;
      var marker=stripMarkup(teacherName,subject);
      var lastClose=html.lastIndexOf("</div>");
      return lastClose>=0?html.slice(0,lastClose)+marker+html.slice(lastClose):html+marker;
    };

    window.renderTeachers=function(){
      var result=originalRenderTeachers.apply(this,arguments);
      queueMicrotask(hydrateOpenTeachers);
      return result;
    };

    document.addEventListener("keydown",function(event){if(event.key==="Escape")closePlayer();});
    document.documentElement.dataset.teacherVideos="ready";
    installed=true;
    queueMicrotask(function(){
      try{window.renderTeachers();}catch(error){console.error("Hoca videoları yenilenemedi",error);}
      hydrateOpenTeachers();
    });
    return true;
  }

  var attempts=0;
  function tryInstall(){
    if(install())return;
    attempts+=1;
    if(attempts<20)setTimeout(tryInstall,100);
    else document.documentElement.dataset.teacherVideos="deferred";
  }

  tryInstall();
})();
