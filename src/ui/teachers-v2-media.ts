import "./teachers-v2-media.css";

type MediaVideo={
  id:string;
  title:string;
  url?:string;
  thumbnail?:string;
  channel?:string;
  channelId?:string;
  channelUrl?:string;
  duration?:number|null;
  timestamp?:number|null;
};

type MediaPlaylist={id:string;title:string;url:string};
type TeacherMedia={
  version?:number;
  name:string;
  subject?:string;
  subjects?:string[];
  channelName?:string;
  channelId?:string;
  channelUrl?:string;
  channelSource?:string;
  refreshedAt?:string|null;
  archiveFile?:string;
  archiveComplete?:boolean;
  videoCount?:number;
  playlistCount?:number;
  videos:MediaVideo[];
  playlists:MediaPlaylist[];
};
type TeachersFeed={
  version:number;
  generatedAt?:string|null;
  source?:string;
  teacherCount?:number;
  successCount?:number;
  totalVideos?:number;
  totalPlaylists?:number;
  teachers:Record<string,TeacherMedia>;
};
type WatchedRecord={
  at?:number;
  title?:string;
  subj?:string;
  topic?:string;
  ch?:string;
  hoca?:string;
};
type LegacyPlanCell={wk?:string;blk?:"r"|"s";i?:number;d?:number};
type LegacyWindow=Window&{
  watchedMap?:()=>Record<string,WatchedRecord>;
  save?:()=>void;
  toast?:(message:string)=>void;
  openDayPick?:(text:string,after?:()=>void)=>boolean;
  planFindCell?:(text:string)=>LegacyPlanCell|null;
  renderPlan?:()=>void;
  renderTodayPlan?:()=>void;
};
type FilterKind="all"|"tyt"|"ayt"|"soru"|"deneme"|"kamp"|"watched"|"unwatched";

const legacy=window as LegacyWindow;
const CACHE_KEY="yks_teachers_v2_media_cache";
const PLAYER_ID="teachersV2MediaPlayer";
const FEED_FILE="teachers-v2-feed.json";
const PAGE_SIZE=24;
let feed:TeachersFeed|null=null;
let feedPromise:Promise<TeachersFeed|null>|null=null;
let observer:MutationObserver|null=null;
let currentFilter:FilterKind="all";
let activeTeacher="";
let videoQuery="";
let visibleLimit=PAGE_SIZE;
let lastOverlay:HTMLElement|null=null;
const archiveCache=new Map<string,TeacherMedia>();
const archivePromises=new Map<string,Promise<TeacherMedia|null>>();

function esc(value:unknown):string{
  return String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function norm(value:unknown):string{
  return String(value??"").toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
}

function readCache():TeachersFeed|null{
  try{
    const raw=localStorage.getItem(CACHE_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw) as TeachersFeed;
    if(!parsed||typeof parsed!=="object"||!parsed.teachers||typeof parsed.teachers!=="object")return null;
    return parsed;
  }catch{return null;}
}

function writeCache(value:TeachersFeed):void{
  try{localStorage.setItem(CACHE_KEY,JSON.stringify(value));}catch{}
}

function feedUrl(force=false):string{
  const url=new URL(FEED_FILE,document.baseURI);
  if(force)url.searchParams.set("refresh",String(Date.now()));
  return url.href;
}

async function loadFeed(force=false):Promise<TeachersFeed|null>{
  if(feed&&!force)return feed;
  if(feedPromise&&!force)return feedPromise;
  const cached=readCache();
  if(!navigator.onLine&&cached){feed=cached;return feed;}
  feedPromise=(async()=>{
    try{
      const response=await fetch(feedUrl(force),{cache:force?"reload":"no-cache",credentials:"same-origin"});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const parsed=await response.json() as TeachersFeed;
      if(!parsed||typeof parsed!=="object"||!parsed.teachers||typeof parsed.teachers!=="object")throw new Error("geçersiz medya akışı");
      feed=parsed;
      writeCache(parsed);
      return parsed;
    }catch{
      feed=cached||feed;
      return feed;
    }finally{
      feedPromise=null;
    }
  })();
  return feedPromise;
}

function manifestMediaFor(name:string):TeacherMedia|null{
  if(!feed)return null;
  if(feed.teachers[name])return feed.teachers[name]||null;
  const wanted=norm(name);
  for(const [key,value] of Object.entries(feed.teachers)){
    if(norm(key)===wanted)return value;
  }
  return null;
}

function mediaFor(name:string):TeacherMedia|null{
  const direct=archiveCache.get(name);
  if(direct)return direct;
  const wanted=norm(name);
  for(const [key,value] of archiveCache.entries())if(norm(key)===wanted)return value;
  return manifestMediaFor(name);
}

async function loadTeacherArchive(name:string,force=false):Promise<TeacherMedia|null>{
  const manifest=manifestMediaFor(name);
  if(!manifest?.archiveFile)return manifest;
  if(!force){
    const cached=archiveCache.get(name);
    if(cached)return cached;
    const pending=archivePromises.get(name);
    if(pending)return pending;
  }
  const promise=(async()=>{
    try{
      const url=new URL(manifest.archiveFile||"",document.baseURI);
      if(force)url.searchParams.set("refresh",String(Date.now()));
      const response=await fetch(url.href,{cache:force?"reload":"default",credentials:"same-origin"});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const parsed=await response.json() as TeacherMedia;
      if(!parsed||typeof parsed!=="object"||!Array.isArray(parsed.videos))throw new Error("geçersiz hoca arşivi");
      const merged:TeacherMedia={...manifest,...parsed,videos:parsed.videos||[],playlists:Array.isArray(parsed.playlists)?parsed.playlists:[]};
      archiveCache.set(name,merged);
      return merged;
    }catch{
      return manifest;
    }finally{
      archivePromises.delete(name);
    }
  })();
  archivePromises.set(name,promise);
  return promise;
}

function watchedMap():Record<string,WatchedRecord>|null{
  try{
    const map=legacy.watchedMap?.();
    if(map&&typeof map==="object"&&!Array.isArray(map))return map;
  }catch{}
  return null;
}

function isWatched(videoId:string):boolean{
  if(!videoId)return false;
  const map=watchedMap();
  return !!map?.[videoId];
}

function watchedCount(media:TeacherMedia):number{
  const map=watchedMap();
  if(!map)return 0;
  return (Array.isArray(media.videos)?media.videos:[]).reduce((count,video)=>count+(map[video.id]?1:0),0);
}

function toggleWatched(video:MediaVideo,media:TeacherMedia):void{
  if(!video.id)return;
  const map=watchedMap();
  if(!map||typeof legacy.save!=="function"){
    legacy.toast?.("İzleme kaydı şu an hazır değil");
    return;
  }
  const previous=map[video.id];
  const removing=!!previous;
  if(removing)delete map[video.id];
  else map[video.id]={
    at:Date.now(),
    title:String(video.title||"").slice(0,120),
    subj:String(media.subject||"").slice(0,60),
    topic:"",
    ch:String(video.channel||media.channelName||media.name||"").slice(0,60),
    hoca:String(media.name||activeTeacher||"").slice(0,60)
  };
  try{
    legacy.save();
    legacy.toast?.(removing?"İzledim işareti kaldırıldı":"İzledim ✓");
  }catch{
    if(previous)map[video.id]=previous;
    else delete map[video.id];
    legacy.toast?.("İzleme kaydı saklanamadı");
  }
}

function formatDate(value:string|null|undefined):string{
  if(!value)return "";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return "";
  return date.toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"});
}

function kindForTitle(title:string):FilterKind[]{
  const text=norm(title);
  const out:FilterKind[]=["all"];
  if(/\btyt\b/.test(text))out.push("tyt");
  if(/\bayt\b/.test(text))out.push("ayt");
  if(/soru|test|problem|cozum/.test(text))out.push("soru");
  if(/deneme|brans/.test(text))out.push("deneme");
  if(/kamp|maraton|seri|bootcamp|tekrar kampi/.test(text))out.push("kamp");
  return out;
}

function filteredVideos(media:TeacherMedia):MediaVideo[]{
  let videos=Array.isArray(media.videos)?media.videos.slice():[];
  if(currentFilter==="watched")videos=videos.filter(video=>isWatched(video.id));
  else if(currentFilter==="unwatched")videos=videos.filter(video=>!isWatched(video.id));
  else if(currentFilter!=="all")videos=videos.filter(video=>kindForTitle(video.title).includes(currentFilter));
  const query=norm(videoQuery);
  if(query)videos=videos.filter(video=>norm([video.title,video.channel||media.channelName||media.name].join(" ")).includes(query));
  return videos;
}

function youtubeSearchUrl(name:string,kind=""):string{
  const suffix:Record<string,string>={tyt:"TYT konu anlatımı",ayt:"AYT konu anlatımı",soru:"soru çözümü",deneme:"deneme branş çözümü",kamp:"kamp seri",playlist:"oynatma listesi"};
  const query=[name,suffix[kind]||"YKS"].filter(Boolean).join(" ");
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function playlistSearchUrl(name:string):string{
  const url=new URL("https://www.youtube.com/results");
  url.searchParams.set("search_query",`${name} YKS oynatma listesi`);
  url.searchParams.set("sp","EgIQAw==");
  return url.toString();
}

function planVideoText(video:MediaVideo):string{
  const title=String(video.title||"Video").replace(/\s+/g," ").trim();
  const short=title.length>46?`${title.slice(0,46)}…`:title;
  const url=video.id?`https://youtu.be/${video.id}`:String(video.url||"");
  return `▶ ${short}${url?` — ${url}`:""}`;
}

function planPlaylistText(item:MediaPlaylist):string{
  const title=String(item.title||"Oynatma listesi").replace(/\s+/g," ").trim();
  const short=title.length>46?`${title.slice(0,46)}…`:title;
  return `☰ ${short}${item.url?` — ${item.url}`:""}`;
}

function inProgram(text:string):boolean{
  try{return typeof legacy.planFindCell==="function"&&!!legacy.planFindCell(text);}catch{return false;}
}

function refreshLegacyProgram():void{
  try{legacy.renderTodayPlan?.();}catch{}
  try{legacy.renderPlan?.();}catch{}
}

function addPlanText(text:string,label:string):boolean{
  if(inProgram(text)){
    legacy.toast?.(`${label} zaten Programım'da`);
    return false;
  }
  if(typeof legacy.openDayPick!=="function"){
    legacy.toast?.("Programım gün seçici şu an hazır değil");
    return false;
  }
  return legacy.openDayPick(text,()=>{
    refreshLegacyProgram();
    if(lastOverlay&&activeTeacher&&document.contains(lastOverlay))renderMediaSection(lastOverlay,activeTeacher);
  });
}

function videoCards(media:TeacherMedia,videos:MediaVideo[]):string{
  if(!videos.length){
    const filtered=currentFilter!=="all"||!!videoQuery.trim();
    return `<div class="teachers-v2-media-empty"><b>${filtered?"Bu süzgeçte video bulunamadı.":"Henüz video verisi yok."}</b><span>${filtered?"Aramayı veya süzgeci değiştir.":"YouTube aramasıyla devam edebilirsin."}</span></div>`;
  }
  return videos.map(video=>{
    const seen=isWatched(video.id);
    const planText=planVideoText(video);
    const planned=inProgram(planText);
    const channel=video.channel||media.channelName||media.name;
    return `<article class="teachers-v2-video-card ${seen?"seen":""}" data-video-id="${esc(video.id)}" data-video-title="${esc(video.title)}" data-video-channel="${esc(channel)}" data-video-thumb="${esc(video.thumbnail||"")}">
      <button class="teachers-v2-video-main" type="button" data-media-action="play" data-video-id="${esc(video.id)}" data-video-title="${esc(video.title)}" aria-label="${esc(video.title)} videosunu oynat">
        <span class="teachers-v2-video-thumb">${video.thumbnail?`<img src="${esc(video.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:""}<i>▶</i>${seen?'<em>İzlendi</em>':""}</span>
        <span class="teachers-v2-video-copy"><b>${esc(video.title)}</b><small>${esc(channel)}</small></span>
      </button>
      <button class="teachers-v2-video-plan ${planned?"on":""}" type="button" data-media-action="program" data-video-id="${esc(video.id)}">${planned?"✓ Programda":"＋ Programım"}</button>
      <button class="teachers-v2-video-watch ${seen?"on":""}" type="button" data-media-action="watch" data-video-id="${esc(video.id)}" aria-pressed="${seen?"true":"false"}">${seen?"✓ İzlendi":"○ İzledim"}</button>
    </article>`;
  }).join("");
}

function playlistCards(media:TeacherMedia):string{
  const playlists=Array.isArray(media.playlists)?media.playlists:[];
  if(!playlists.length)return `<button class="teachers-v2-playlist-fallback" type="button" data-media-action="playlist-search">Oynatma listelerini YouTube'da bul <span>→</span></button>`;
  return playlists.map(item=>{
    const planned=inProgram(planPlaylistText(item));
    return `<article class="teachers-v2-playlist-wrap"><button class="teachers-v2-playlist-card" type="button" data-media-action="playlist" data-playlist-url="${esc(item.url)}"><span>▤</span><b>${esc(item.title)}</b></button><button class="teachers-v2-playlist-plan ${planned?"on":""}" type="button" data-media-action="playlist-program" data-playlist-id="${esc(item.id)}">${planned?"✓ Programda":"＋ Programım"}</button></article>`;
  }).join("");
}

function statusHtml(media:TeacherMedia|null):string{
  if(!media)return `<span class="teachers-v2-media-dot pending"></span>Bu hoca için günlük akış henüz eşleşmedi`;
  const loaded=Array.isArray(media.videos)?media.videos.length:0;
  const total=Math.max(loaded,Number(media.videoCount||0));
  const suffix=media.archiveComplete?"":"+";
  const seen=watchedCount(media);
  const date=formatDate(media.refreshedAt||feed?.generatedAt);
  return `<span class="teachers-v2-media-dot ${loaded?"ok":"pending"}"></span>${loaded?`${total}${suffix} video arşivi · ${seen} izlendi${date?` · ${date}`:""}`:"Video akışı bekleniyor"}`;
}

function updateVideoGrid(section:HTMLElement,media:TeacherMedia):void{
  const filtered=filteredVideos(media);
  const visible=filtered.slice(0,visibleLimit);
  const grid=section.querySelector<HTMLElement>("#teachersV2VideoGrid");
  if(grid)grid.innerHTML=videoCards(media,visible);
  const result=section.querySelector<HTMLElement>("#teachersV2VideoResult");
  if(result)result.textContent=`${visible.length} / ${filtered.length} gösteriliyor`;
  const more=section.querySelector<HTMLButtonElement>("#teachersV2LoadMore");
  if(more){
    more.hidden=visible.length>=filtered.length;
    more.textContent=`Daha fazla göster (${Math.max(0,filtered.length-visible.length)} kaldı)`;
  }
}

function renderMediaSection(overlay:HTMLElement,name:string):void{
  const section=[...overlay.querySelectorAll<HTMLElement>(".teachers-v2-section")].find(node=>node.querySelector("h3")?.textContent?.trim()==="Video merkezi"||node.classList.contains("teachers-v2-media-section"));
  if(!section)return;
  const media=mediaFor(name);
  const seen=media?watchedCount(media):0;
  const total=media?Math.max(media.videos.length,Number(media.videoCount||0)):0;
  const filtered=media?filteredVideos(media):[];
  const visible=filtered.slice(0,visibleLimit);
  const archiveLoading=Boolean(manifestMediaFor(name)?.archiveFile&&!archiveCache.has(name));
  section.classList.add("teachers-v2-media-section");
  section.innerHTML=`<div class="teachers-v2-section-head teachers-v2-media-head"><div><h3>Video arşivi</h3><span id="teachersV2MediaStatus" class="teachers-v2-media-status">${archiveLoading?'<span class="teachers-v2-media-dot pending"></span>Geniş hoca arşivi yükleniyor…':statusHtml(media)}</span></div><div class="teachers-v2-media-head-actions"><button type="button" data-media-action="refresh">Yenile</button><button type="button" data-media-action="channel-videos">Kanalın tüm videoları</button></div></div>
    ${media&&total?`<div class="teachers-v2-media-progress" aria-label="İzleme ilerlemesi"><span><b>${seen}</b> izlendi</span><span>${Math.max(0,total-seen)} izlenmedi</span><span><b>${media.playlists.length}</b> playlist</span></div>`:""}
    <div class="teachers-v2-media-tools">
      <label class="teachers-v2-video-search"><span>⌕</span><input id="teachersV2VideoSearch" type="search" autocomplete="off" value="${esc(videoQuery)}" placeholder="Bu hocanın tüm arşivinde ara…" aria-label="Bu hocanın video arşivinde ara"></label>
      <span id="teachersV2VideoResult" class="teachers-v2-video-result">${media?`${visible.length} / ${filtered.length} gösteriliyor`:""}</span>
    </div>
    <div class="teachers-v2-media-filters" role="tablist" aria-label="Video filtresi">
      ${([['all','Tümü'],['tyt','TYT'],['ayt','AYT'],['deneme','Deneme'],['soru','Soru'],['kamp','Kamp / Seri'],['unwatched','İzlenmedi'],['watched','İzlendi']] as [FilterKind,string][]).map(([value,label])=>`<button type="button" class="${currentFilter===value?"on":""}" data-media-action="filter" data-filter="${value}" aria-pressed="${currentFilter===value?"true":"false"}">${label}</button>`).join("")}
    </div>
    <div id="teachersV2VideoGrid" class="teachers-v2-video-grid">${media?videoCards(media,visible):'<div class="teachers-v2-media-loading"><i></i><span>Video arşivi hazırlanıyor…</span></div>'}</div>
    <button id="teachersV2LoadMore" class="teachers-v2-load-more" type="button" data-media-action="more" ${!media||visible.length>=filtered.length?"hidden":""}>Daha fazla göster (${Math.max(0,filtered.length-visible.length)} kaldı)</button>
    <div class="teachers-v2-playlist-head"><h4>Oynatma listeleri</h4><span>${media?.playlists.length||0} kamp ve seri</span></div>
    <div id="teachersV2PlaylistGrid" class="teachers-v2-playlist-grid">${media?playlistCards(media):'<div class="teachers-v2-media-skeleton"></div>'}</div>
    <div class="teachers-v2-media-shortcuts">
      <button type="button" data-media-action="search" data-kind="tyt">YouTube'da TYT ara</button><button type="button" data-media-action="search" data-kind="ayt">AYT ara</button><button type="button" data-media-action="search" data-kind="soru">Soru çözümü</button><button type="button" data-media-action="search" data-kind="deneme">Deneme</button><button type="button" data-media-action="playlist-search">Playlist ara</button>
    </div>`;
  const search=section.querySelector<HTMLInputElement>("#teachersV2VideoSearch");
  search?.addEventListener("input",()=>{
    videoQuery=search.value;
    visibleLimit=PAGE_SIZE;
    if(media)updateVideoGrid(section,media);
  });
}

async function refreshOverlayMedia(overlay:HTMLElement,name:string,force=false):Promise<void>{
  const status=overlay.querySelector<HTMLElement>("#teachersV2MediaStatus");
  if(status)status.innerHTML='<span class="teachers-v2-media-dot pending"></span>Arşiv yenileniyor…';
  await loadFeed(force);
  if(!document.contains(overlay)||activeTeacher!==name)return;
  renderMediaSection(overlay,name);
  await loadTeacherArchive(name,force);
  if(!document.contains(overlay)||activeTeacher!==name)return;
  renderMediaSection(overlay,name);
}

function openExternal(url:string):void{
  if(!url)return;
  window.open(url,"_blank","noopener,noreferrer");
}

function openPlayer(videoId:string,title:string):void{
  if(!videoId)return;
  document.getElementById(PLAYER_ID)?.remove();
  const player=document.createElement("div");
  player.id=PLAYER_ID;
  player.className="teachers-v2-player-overlay";
  player.setAttribute("role","dialog");
  player.setAttribute("aria-modal","true");
  player.setAttribute("aria-label",title||"YouTube videosu");
  const embed=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  player.innerHTML=`<div class="teachers-v2-player"><div class="teachers-v2-player-head"><b>${esc(title||"Video")}</b><div><button type="button" data-player-action="youtube">YouTube'da aç</button><button type="button" data-player-action="close">Kapat</button></div></div><div class="teachers-v2-player-frame"><iframe src="${embed}" title="${esc(title||"YouTube videosu")}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
  player.addEventListener("click",event=>{
    if(event.target===player){player.remove();return;}
    const action=(event.target as HTMLElement|null)?.closest<HTMLElement>("[data-player-action]")?.dataset.playerAction;
    if(action==="close")player.remove();
    if(action==="youtube")openExternal(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`);
  });
  document.body.appendChild(player);
}

function handleMediaClick(event:MouseEvent):void{
  const target=event.target as HTMLElement|null;
  const action=target?.closest<HTMLElement>("[data-media-action]");
  if(!action||!activeTeacher)return;
  const media=mediaFor(activeTeacher);
  const type=action.dataset.mediaAction||"";
  if(type==="filter"){
    const value=action.dataset.filter as FilterKind|undefined;
    if(value&&["all","tyt","ayt","soru","deneme","kamp","watched","unwatched"].includes(value))currentFilter=value;
    visibleLimit=PAGE_SIZE;
    const section=lastOverlay?.querySelector<HTMLElement>(".teachers-v2-media-section");
    section?.querySelectorAll<HTMLElement>("[data-media-action='filter']").forEach(button=>{
      const on=button.dataset.filter===currentFilter;
      button.classList.toggle("on",on);
      button.setAttribute("aria-pressed",String(on));
    });
    if(section&&media)updateVideoGrid(section,media);
    return;
  }
  if(type==="more"){
    visibleLimit+=PAGE_SIZE;
    const section=lastOverlay?.querySelector<HTMLElement>(".teachers-v2-media-section");
    if(section&&media)updateVideoGrid(section,media);
    return;
  }
  if(type==="refresh"){
    archiveCache.delete(activeTeacher);
    if(lastOverlay)void refreshOverlayMedia(lastOverlay,activeTeacher,true);
    return;
  }
  if(type==="play"){
    openPlayer(action.dataset.videoId||"",action.dataset.videoTitle||"");
    return;
  }
  if(type==="watch"){
    const video=media?.videos.find(item=>item.id===action.dataset.videoId);
    if(video&&media){
      toggleWatched(video,media);
      if(lastOverlay)renderMediaSection(lastOverlay,activeTeacher);
    }
    return;
  }
  if(type==="program"){
    const video=media?.videos.find(item=>item.id===action.dataset.videoId);
    if(video)addPlanText(planVideoText(video),"Video");
    return;
  }
  if(type==="playlist"){
    openExternal(action.dataset.playlistUrl||"");
    return;
  }
  if(type==="playlist-program"){
    const item=media?.playlists.find(row=>row.id===action.dataset.playlistId);
    if(item)addPlanText(planPlaylistText(item),"Oynatma listesi");
    return;
  }
  if(type==="playlist-search"){
    openExternal(playlistSearchUrl(activeTeacher));
    return;
  }
  if(type==="channel"||type==="channel-videos"){
    const channel=media?.channelUrl||youtubeSearchUrl(activeTeacher,"");
    openExternal(type==="channel-videos"&&media?.channelUrl?`${media.channelUrl.replace(/\/$/,"")}/videos`:channel);
    return;
  }
  if(type==="search")openExternal(youtubeSearchUrl(activeTeacher,action.dataset.kind||""));
}

function enhanceOverlay(overlay:HTMLElement):void{
  const heading=overlay.querySelector(".teachers-v2-profile h2")?.textContent?.trim();
  if(!heading)return;
  activeTeacher=heading;
  currentFilter="all";
  videoQuery="";
  visibleLimit=PAGE_SIZE;
  lastOverlay=overlay;
  overlay.removeEventListener("click",handleMediaClick);
  overlay.addEventListener("click",handleMediaClick);
  renderMediaSection(overlay,heading);
  void refreshOverlayMedia(overlay,heading,false);
}

function decorateCards():void{
  if(!feed)return;
  document.querySelectorAll<HTMLElement>(".teachers-v2-card[data-name]").forEach(card=>{
    const name=card.dataset.name||"";
    const media=mediaFor(name);
    if(!media)return;
    const tags=card.querySelector(".teachers-v2-tags");
    const count=Math.max(media.videos.length,Number(media.videoCount||0));
    let mediaTag=tags?.querySelector<HTMLElement>(".teachers-v2-tag-media");
    if(!mediaTag&&tags){tags.insertAdjacentHTML("beforeend",'<span class="teachers-v2-tag teachers-v2-tag-media"></span>');mediaTag=tags.querySelector<HTMLElement>(".teachers-v2-tag-media");}
    if(mediaTag)mediaTag.textContent=`● ${count}${media.archiveComplete?"":"+"} video`;
    const seen=watchedCount(media);
    const existing=tags?.querySelector<HTMLElement>(".teachers-v2-tag-watched");
    if(seen){
      if(existing)existing.textContent=`✓ ${seen} izlendi`;
      else tags?.insertAdjacentHTML("beforeend",`<span class="teachers-v2-tag teachers-v2-tag-watched">✓ ${seen} izlendi</span>`);
    }else existing?.remove();
  });
}

function scan():void{
  const overlay=document.getElementById("teachersV2Overlay") as HTMLElement|null;
  if(overlay&&overlay!==lastOverlay)enhanceOverlay(overlay);
  if(!overlay){lastOverlay=null;activeTeacher="";}
  decorateCards();
}

function refreshWatchedUi():void{
  decorateCards();
  if(lastOverlay&&activeTeacher&&document.contains(lastOverlay))renderMediaSection(lastOverlay,activeTeacher);
}

function install():void{
  void loadFeed(false).then(()=>{decorateCards();scan();});
  observer=new MutationObserver(scan);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&document.getElementById(PLAYER_ID))document.getElementById(PLAYER_ID)?.remove();
  });
  window.addEventListener("online",()=>{void loadFeed(true).then(()=>{decorateCards();scan();});});
  window.addEventListener("storage",event=>{if(event.key==="yks")refreshWatchedUi();});
  document.documentElement.dataset.teachersV2Media="ready";
  scan();
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();

export {};