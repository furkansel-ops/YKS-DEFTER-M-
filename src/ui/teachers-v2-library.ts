import "./teachers-v2-library.css";

type MediaVideo={
  id:string;
  title:string;
  url?:string;
  thumbnail?:string;
  channel?:string;
};
type TeacherMedia={
  name:string;
  subject?:string;
  channelName?:string;
  videos?:MediaVideo[];
};
type TeachersFeed={teachers:Record<string,TeacherMedia>;generatedAt?:string|null};
type WatchedRecord={
  at?:number;
  title?:string;
  subj?:string;
  topic?:string;
  ch?:string;
  hoca?:string;
};
type VideoBookmark={
  id:string;
  title:string;
  teacher:string;
  channel:string;
  thumbnail:string;
  url:string;
  savedAt:number;
};
type LibraryState={favorites:Record<string,VideoBookmark>;updatedAt:number};
type IndexedVideo={video:MediaVideo;teacher:TeacherMedia};
type LegacyWindow=Window&{
  watchedMap?:()=>Record<string,WatchedRecord>;
  toast?:(message:string)=>void;
};

const legacy=window as LegacyWindow;
const LIB_PREF_KEY="teachersV2LibraryV1";
const FEED_CACHE_KEY="yks_teachers_v2_media_cache";
const FEED_FILE="teachers-v2-feed.json";
const PLAYER_ID="teachersV2MediaPlayer";
const ROOT_ID="teachersV2Root";
const PANEL_ID="teachersV2Library";
const EMPTY_LIBRARY:LibraryState={favorites:{},updatedAt:0};
let feed:TeachersFeed|null=null;
let videoIndex=new Map<string,IndexedVideo>();
let observer:MutationObserver|null=null;
let lastSignature="";
let installed=false;

function esc(value:unknown):string{
  return String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function isRecord(value:unknown):value is Record<string,unknown>{
  return Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
}

function cloneBookmark(value:unknown,id=""):VideoBookmark|null{
  if(!isRecord(value))return null;
  const videoId=String(value.id||id||"").trim();
  if(!videoId)return null;
  return {
    id:videoId,
    title:String(value.title||"YouTube videosu").slice(0,180),
    teacher:String(value.teacher||"").slice(0,80),
    channel:String(value.channel||"").slice(0,80),
    thumbnail:String(value.thumbnail||"").slice(0,500),
    url:String(value.url||`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`).slice(0,600),
    savedAt:Number.isFinite(Number(value.savedAt))?Math.max(0,Math.floor(Number(value.savedAt))):0
  };
}

function normalizeLibrary(value:unknown):LibraryState{
  const next:LibraryState={favorites:{},updatedAt:0};
  if(!isRecord(value))return next;
  const rawFavorites=isRecord(value.favorites)?value.favorites:{};
  Object.entries(rawFavorites).slice(0,300).forEach(([id,item])=>{
    const bookmark=cloneBookmark(item,id);
    if(bookmark)next.favorites[bookmark.id]=bookmark;
  });
  const updatedAt=Number(value.updatedAt||0);
  next.updatedAt=Number.isFinite(updatedAt)?Math.max(0,Math.floor(updatedAt)):0;
  return next;
}

function stateRecord():Record<string,unknown>|null{
  try{
    const state=window.YKSLegacyState?.readState?.();
    return isRecord(state)?state:null;
  }catch{return null;}
}

function readLibrary():LibraryState{
  const state=stateRecord();
  if(!state||!isRecord(state.studyPrefs))return normalizeLibrary(EMPTY_LIBRARY);
  return normalizeLibrary(state.studyPrefs[LIB_PREF_KEY]);
}

function saveLibrary(next:LibraryState):boolean{
  const state=stateRecord();
  if(!state)return false;
  const prefs=isRecord(state.studyPrefs)?state.studyPrefs:{autoPlan:false};
  state.studyPrefs=prefs;
  prefs[LIB_PREF_KEY]={
    favorites:{...next.favorites},
    updatedAt:next.updatedAt
  };
  try{
    window.YKSLegacyState?.save?.();
    return true;
  }catch{return false;}
}

function watchedMap():Record<string,WatchedRecord>{
  try{
    const value=legacy.watchedMap?.();
    return value&&typeof value==="object"&&!Array.isArray(value)?value:{};
  }catch{return {};}
}

function cachedFeed():TeachersFeed|null{
  try{
    const raw=localStorage.getItem(FEED_CACHE_KEY);
    const parsed=raw?JSON.parse(raw):null;
    return parsed&&isRecord(parsed)&&isRecord(parsed.teachers)?parsed as unknown as TeachersFeed:null;
  }catch{return null;}
}

function buildIndex(value:TeachersFeed|null):void{
  videoIndex=new Map();
  if(!value?.teachers)return;
  Object.values(value.teachers).forEach(teacher=>{
    const videos=Array.isArray(teacher.videos)?teacher.videos:[];
    videos.forEach(video=>{
      if(video&&video.id&&!videoIndex.has(video.id))videoIndex.set(video.id,{video,teacher});
    });
  });
}

async function loadFeed():Promise<void>{
  const cached=cachedFeed();
  if(cached){feed=cached;buildIndex(cached);}
  try{
    const response=await fetch(new URL(FEED_FILE,document.baseURI).href,{cache:"no-cache",credentials:"same-origin"});
    if(!response.ok)return;
    const parsed=await response.json() as TeachersFeed;
    if(parsed&&isRecord(parsed.teachers)){
      feed=parsed;
      buildIndex(parsed);
    }
  }catch{}
}

function visibleCardBookmark(id:string):VideoBookmark|null{
  const card=[...document.querySelectorAll<HTMLElement>(".teachers-v2-video-card[data-video-id]")].find(node=>node.dataset.videoId===id);
  if(!card)return null;
  const title=String(card.dataset.videoTitle||"").trim();
  const channel=String(card.dataset.videoChannel||"").trim();
  const thumbnail=String(card.dataset.videoThumb||"").trim();
  const teacher=String(document.querySelector(".teachers-v2-profile h2")?.textContent||"").trim();
  if(!title)return null;
  return {
    id,
    title:title.slice(0,180),
    teacher:teacher.slice(0,80),
    channel:channel.slice(0,80),
    thumbnail:(thumbnail||`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`).slice(0,500),
    url:`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
    savedAt:Date.now()
  };
}

function bookmarkFor(id:string):VideoBookmark|null{
  const indexed=videoIndex.get(id);
  if(!indexed)return visibleCardBookmark(id);
  const {video,teacher}=indexed;
  return {
    id:video.id,
    title:String(video.title||"YouTube videosu"),
    teacher:String(teacher.name||""),
    channel:String(video.channel||teacher.channelName||teacher.name||""),
    thumbnail:String(video.thumbnail||`https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`),
    url:String(video.url||`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`),
    savedAt:Date.now()
  };
}

function toggleFavorite(id:string):void{
  if(!id)return;
  const current=readLibrary();
  const previous=current.favorites[id];
  if(previous)delete current.favorites[id];
  else{
    const bookmark=bookmarkFor(id);
    if(!bookmark){legacy.toast?.("Video bilgisi henüz hazır değil");return;}
    current.favorites[id]=bookmark;
  }
  current.updatedAt=Date.now();
  if(!saveLibrary(current)){
    legacy.toast?.("Video kaydı saklanamadı");
    return;
  }
  legacy.toast?.(previous?"Video kaydedilenlerden çıkarıldı":"Video kaydedildi ★");
  lastSignature="";
  refresh();
}

function relativeTime(at:number):string{
  if(!at)return "";
  const diff=Math.max(0,Date.now()-at);
  const minute=60_000,hour=60*minute,day=24*hour;
  if(diff<minute)return "az önce";
  if(diff<hour)return `${Math.max(1,Math.floor(diff/minute))} dk önce`;
  if(diff<day)return `${Math.max(1,Math.floor(diff/hour))} sa önce`;
  return `${Math.max(1,Math.floor(diff/day))} gün önce`;
}

function recentItems():VideoBookmark[]{
  const map=watchedMap();
  return Object.entries(map)
    .map(([id,record])=>({id,record,indexed:videoIndex.get(id)}))
    .filter(row=>Boolean(row.indexed||row.record?.hoca))
    .sort((a,b)=>Number(b.record?.at||0)-Number(a.record?.at||0))
    .slice(0,8)
    .map(({id,record,indexed})=>({
      id,
      title:String(indexed?.video.title||record?.title||"İzlenen video"),
      teacher:String(indexed?.teacher.name||record?.hoca||""),
      channel:String(indexed?.video.channel||record?.ch||indexed?.teacher.channelName||""),
      thumbnail:String(indexed?.video.thumbnail||`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`),
      url:String(indexed?.video.url||`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`),
      savedAt:Number(record?.at||0)
    }));
}

function favoriteItems():VideoBookmark[]{
  return Object.values(readLibrary().favorites).sort((a,b)=>b.savedAt-a.savedAt).slice(0,12);
}

function libraryCard(item:VideoBookmark,kind:"favorite"|"recent"):string{
  const time=relativeTime(item.savedAt);
  return `<article class="teachers-v2-library-card" data-video-id="${esc(item.id)}">
    <button type="button" class="teachers-v2-library-play" data-library-action="play" data-video-id="${esc(item.id)}" data-video-title="${esc(item.title)}" aria-label="${esc(item.title)} videosunu oynat">
      <span class="teachers-v2-library-thumb"><img src="${esc(item.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer"><i>▶</i></span>
      <span class="teachers-v2-library-copy"><small>${esc(item.teacher||item.channel||"Hoca")}${time?` · ${esc(time)}`:""}</small><b>${esc(item.title)}</b></span>
    </button>
    ${kind==="favorite"?`<button type="button" class="teachers-v2-library-remove" data-library-action="remove" data-video-id="${esc(item.id)}" aria-label="Kaydedilenlerden çıkar">★</button>`:""}
  </article>`;
}

function emptyRow(text:string):string{
  return `<div class="teachers-v2-library-empty">${esc(text)}</div>`;
}

function signature():string{
  const library=readLibrary();
  const watched=watchedMap();
  const favPart=Object.values(library.favorites).map(item=>`${item.id}:${item.savedAt}`).sort().join("|");
  const recentPart=Object.entries(watched)
    .filter(([id,item])=>Boolean(item?.hoca||videoIndex.has(id)))
    .sort((a,b)=>Number(b[1]?.at||0)-Number(a[1]?.at||0))
    .slice(0,30)
    .map(([id,item])=>`${id}:${Number(item?.at||0)}`)
    .join("|");
  return `${feed?.generatedAt||""}::${favPart}::${recentPart}`;
}

function ensurePanel():HTMLElement|null{
  const root=document.getElementById(ROOT_ID);
  if(!(root instanceof HTMLElement))return null;
  let panel=document.getElementById(PANEL_ID);
  if(!(panel instanceof HTMLElement)){
    panel=document.createElement("section");
    panel.id=PANEL_ID;
    panel.className="teachers-v2-library";
    panel.setAttribute("aria-label","Video kütüphanem");
    const hero=root.querySelector(".teachers-v2-hero");
    if(hero)hero.insertAdjacentElement("afterend",panel);else root.prepend(panel);
  }
  return panel;
}

function renderLibrary(force=false):void{
  const panel=ensurePanel();
  if(!panel)return;
  const nextSignature=signature();
  if(!force&&nextSignature===lastSignature)return;
  lastSignature=nextSignature;
  const favorites=favoriteItems();
  const recent=recentItems();
  const latest=recent[0]||null;
  panel.hidden=!favorites.length&&!recent.length;
  if(panel.hidden){panel.replaceChildren();return;}
  panel.innerHTML=`<div class="teachers-v2-library-head">
      <div><span class="teachers-v2-library-kicker">Kişisel video alanın</span><h3>Kütüphanem</h3></div>
      <span class="teachers-v2-library-stats">${favorites.length} kaydedilen · ${recent.length} son izlenen</span>
    </div>
    ${latest?`<button type="button" class="teachers-v2-library-continue" data-library-action="play" data-video-id="${esc(latest.id)}" data-video-title="${esc(latest.title)}"><span>Son izlediğin</span><b>${esc(latest.title)}</b><em>Tekrar aç →</em></button>`:""}
    <div class="teachers-v2-library-columns">
      <section><div class="teachers-v2-library-subhead"><h4>★ Kaydettiklerim</h4><span>${favorites.length}</span></div><div class="teachers-v2-library-row">${favorites.length?favorites.slice(0,6).map(item=>libraryCard(item,"favorite")).join(""):emptyRow("Kaydettiğin videolar burada görünür.")}</div></section>
      <section><div class="teachers-v2-library-subhead"><h4>↻ Son izlenenler</h4><span>${recent.length}</span></div><div class="teachers-v2-library-row">${recent.length?recent.slice(0,6).map(item=>libraryCard(item,"recent")).join(""):emptyRow("İzledim dediğin videolar burada görünür.")}</div></section>
    </div>`;
}

function decorateVideoCards():void{
  const favorites=readLibrary().favorites;
  document.querySelectorAll<HTMLElement>(".teachers-v2-video-card[data-video-id]").forEach(card=>{
    const id=card.dataset.videoId||"";
    if(!id)return;
    let button=card.querySelector<HTMLButtonElement>(".teachers-v2-video-save");
    if(!button){
      button=document.createElement("button");
      button.type="button";
      button.className="teachers-v2-video-save";
      button.dataset.libraryAction="toggle";
      button.dataset.videoId=id;
      card.appendChild(button);
    }
    const on=Boolean(favorites[id]);
    button.classList.toggle("on",on);
    button.setAttribute("aria-pressed",String(on));
    button.setAttribute("aria-label",on?"Kaydedilenlerden çıkar":"Videoyu kaydet");
    const label=on?"★ Kaydedildi":"☆ Kaydet";
    if(button.textContent!==label)button.textContent=label;
  });
}

function openPlayer(videoId:string,title:string):void{
  if(!videoId)return;
  document.getElementById(PLAYER_ID)?.remove();
  const overlay=document.createElement("div");
  overlay.id=PLAYER_ID;
  overlay.className="teachers-v2-player-overlay";
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label",title||"YouTube videosu");
  const embed=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  overlay.innerHTML=`<div class="teachers-v2-player"><div class="teachers-v2-player-head"><b>${esc(title||"Video")}</b><div><button type="button" data-library-action="youtube" data-video-id="${esc(videoId)}">YouTube'da aç</button><button type="button" data-library-action="close-player">Kapat</button></div></div><div class="teachers-v2-player-frame"><iframe src="${embed}" title="${esc(title||"YouTube videosu")}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
  document.body.appendChild(overlay);
}

function handleClick(event:MouseEvent):void{
  const target=event.target as HTMLElement|null;
  const action=target?.closest<HTMLElement>("[data-library-action]");
  if(!action)return;
  const kind=action.dataset.libraryAction||"";
  const id=action.dataset.videoId||"";
  if(kind==="toggle"||kind==="remove"){
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(id);
    return;
  }
  if(kind==="play"){
    event.preventDefault();
    openPlayer(id,action.dataset.videoTitle||videoIndex.get(id)?.video.title||"");
    return;
  }
  if(kind==="youtube"){
    window.open(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,"_blank","noopener,noreferrer");
    return;
  }
  if(kind==="close-player")document.getElementById(PLAYER_ID)?.remove();
}

function refresh(force=false):void{
  decorateVideoCards();
  renderLibrary(force);
}

function scan():void{refresh(false);}

function install():void{
  if(installed)return;
  installed=true;
  document.addEventListener("click",handleClick,true);
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape")document.getElementById(PLAYER_ID)?.remove();
  });
  observer=new MutationObserver(scan);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener("storage",event=>{if(event.key==="yks"){lastSignature="";refresh(true);}});
  window.addEventListener("yks:data-primary-ready",()=>{lastSignature="";refresh(true);});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){lastSignature="";refresh(true);}});
  void loadFeed().finally(()=>{lastSignature="";refresh(true);});
  document.documentElement.dataset.teachersV2Library="ready";
  refresh(true);
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();

export {};