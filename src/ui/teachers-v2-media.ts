import "./teachers-v2-media.css";

type MediaVideo={
  id:string;
  title:string;
  url?:string;
  thumbnail?:string;
  channel?:string;
  channelId?:string;
  channelUrl?:string;
};
type MediaPlaylist={id:string;title:string;url:string;videos?:MediaVideo[];videoCount?:number;previewSource?:string};
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
  archiveIndex?:string;
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
type ArchiveIndex={
  version:number;
  name:string;
  subject?:string;
  subjects?:string[];
  channelName?:string;
  channelId?:string;
  channelUrl?:string;
  channelSource?:string;
  archiveComplete?:boolean;
  refreshedAt?:string|null;
  videoCount:number;
  playlistCount:number;
  pageSize:number;
  pageCount:number;
  pages:string[];
  playlists:MediaPlaylist[];
};
type ArchivePage={version:number;teacher:string;page:number;pageSize:number;total:number;videos:MediaVideo[]};
type ArchiveState={meta:ArchiveIndex;videos:MediaVideo[];loaded:Set<number>;loading:Set<number>};
type WatchedRecord={at?:number;title?:string;subj?:string;topic?:string;ch?:string;hoca?:string};
type LegacyPlanCell={wk?:string;blk?:"r"|"s";i?:number;d?:number};
type LegacyWindow=Window&{
  watchedMap?:()=>Record<string,WatchedRecord>;
  save?:()=>boolean|void;
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
const PLAYLIST_PAGE_SIZE=12;
let feed:TeachersFeed|null=null;
let feedPromise:Promise<TeachersFeed|null>|null=null;
let observer:MutationObserver|null=null;
let currentFilter:FilterKind="all";
let activeTeacher="";
let videoQuery="";
let playlistQuery="";
let activePlaylistId="";
let visibleLimit=PAGE_SIZE;
let playlistLimit=PLAYLIST_PAGE_SIZE;
let mediaView:"playlists"|"videos"="playlists";
let feedSettled=false;
let searchTimer=0;
let searchRevision=0;
let searching=false;
let linkUrl="",linkTitle="";
let lastOverlay:HTMLElement|null=null;
const archiveStates=new Map<string,ArchiveState>();
const archivePromises=new Map<string,Promise<ArchiveState|null>>();
const pagePromises=new Map<string,Promise<boolean>>();

function esc(value:unknown):string{
  return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function norm(value:unknown):string{
  return String(value??"").toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
}
function keyFor(name:string):string{return norm(name);}
function uniqueVideos(...groups:MediaVideo[][]):MediaVideo[]{
  const out:MediaVideo[]=[],seen=new Set<string>();
  for(const group of groups)for(const video of group||[]){if(!video?.id||seen.has(video.id))continue;seen.add(video.id);out.push(video);}
  return out;
}
function readCache():TeachersFeed|null{
  try{const raw=localStorage.getItem(CACHE_KEY);if(!raw)return null;const parsed=JSON.parse(raw) as TeachersFeed;return parsed&&typeof parsed==="object"&&parsed.teachers&&typeof parsed.teachers==="object"?parsed:null;}catch{return null;}
}
function writeCache(value:TeachersFeed):void{try{localStorage.setItem(CACHE_KEY,JSON.stringify(value));}catch{}}
function feedUrl(force=false):string{const url=new URL(FEED_FILE,document.baseURI);if(force)url.searchParams.set("refresh",String(Date.now()));return url.href;}
async function loadFeed(force=false):Promise<TeachersFeed|null>{
  if(feed&&!force)return feed;
  if(feedPromise&&!force)return feedPromise;
  const cached=readCache();
  if(!navigator.onLine&&cached){feed=cached;feedSettled=true;return feed;}
  feedPromise=(async()=>{
    try{
      const response=await fetch(feedUrl(force),{cache:force?"reload":"no-cache",credentials:"same-origin",signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const parsed=await response.json() as TeachersFeed;
      if(!parsed||typeof parsed!=="object"||!parsed.teachers||typeof parsed.teachers!=="object")throw new Error("geçersiz medya akışı");
      feed=Object.keys(parsed.teachers).length?parsed:(cached||parsed);writeCache(feed);return feed;
    }catch{feed=cached||feed;return feed;}
    finally{feedPromise=null;feedSettled=true;}
  })();
  return feedPromise;
}
function manifestMediaFor(name:string):TeacherMedia|null{
  if(!feed)return null;
  if(feed.teachers[name])return feed.teachers[name]||null;
  const wanted=keyFor(name);
  for(const [key,value] of Object.entries(feed.teachers))if(keyFor(key)===wanted)return value;
  return null;
}
function stateFor(name:string):ArchiveState|null{return archiveStates.get(keyFor(name))||null;}
function mediaFor(name:string):TeacherMedia|null{
  const manifest=manifestMediaFor(name);if(!manifest)return null;
  const state=stateFor(name);if(!state)return manifest;
  return {
    ...manifest,
    ...state.meta,
    archiveIndex:manifest.archiveIndex,
    videos:uniqueVideos(manifest.videos||[],state.videos),
    playlists:Array.isArray(state.meta.playlists)?state.meta.playlists:(manifest.playlists||[]),
    videoCount:Number(state.meta.videoCount||manifest.videoCount||state.videos.length),
    playlistCount:Number(state.meta.playlistCount||manifest.playlistCount||0)
  };
}
async function fetchJson<T>(path:string,force=false):Promise<T>{
  const url=new URL(path,document.baseURI);if(force)url.searchParams.set("refresh",String(Date.now()));
  const response=await fetch(url.href,{cache:"no-store",credentials:"same-origin",signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  return await response.json() as T;
}
async function loadArchivePage(name:string,index:number,force=false):Promise<boolean>{
  const state=stateFor(name);if(!state)return false;
  if(index<0||index>=state.meta.pages.length||state.loaded.has(index))return state.loaded.has(index);
  const key=`${keyFor(name)}:${index}`,pending=pagePromises.get(key);if(pending)return pending;
  const pagePath=state.meta.pages[index];if(!pagePath)return false;
  state.loading.add(index);
  const promise=(async()=>{
  try{
    const page=await fetchJson<ArchivePage>(pagePath,force);
    if(!page||!Array.isArray(page.videos))throw new Error("geçersiz arşiv sayfası");
    state.videos=uniqueVideos(state.videos,page.videos);state.loaded.add(index);return true;
  }catch{return false;}
  finally{state.loading.delete(index);pagePromises.delete(key);}
  })();pagePromises.set(key,promise);return promise;
}
async function loadArchiveIndex(name:string,force=false):Promise<ArchiveState|null>{
  const manifest=manifestMediaFor(name);if(!manifest?.archiveIndex)return null;
  const key=keyFor(name);
  if(!force){const cached=archiveStates.get(key);if(cached)return cached;const pending=archivePromises.get(key);if(pending)return pending;}
  const promise=(async()=>{
    try{
      const meta=await fetchJson<ArchiveIndex>(manifest.archiveIndex||"",force);
      if(!meta||!Array.isArray(meta.pages)||!Array.isArray(meta.playlists))throw new Error("geçersiz hoca arşiv indeksi");
      const state:ArchiveState={meta,videos:[],loaded:new Set<number>(),loading:new Set<number>()};
      archiveStates.set(key,state);
      return state;
    }catch{return null;}
    finally{archivePromises.delete(key);}
  })();
  archivePromises.set(key,promise);return promise;
}
function hasMoreArchive(name:string):boolean{
  const state=stateFor(name);if(!state)return Boolean(manifestMediaFor(name)?.archiveIndex);
  return state.loaded.size<state.meta.pages.length;
}
async function loadNextArchivePage(name:string,force=false):Promise<boolean>{
  let state=stateFor(name);if(!state){state=await loadArchiveIndex(name,force);if(!state)return false;}
  for(let i=0;i<state.meta.pages.length;i++)if(!state.loaded.has(i))return loadArchivePage(name,i,force);
  return false;
}
function watchedMap():Record<string,WatchedRecord>|null{try{const map=legacy.watchedMap?.();return map&&typeof map==="object"&&!Array.isArray(map)?map:null;}catch{return null;}}
function isWatched(videoId:string):boolean{const map=watchedMap();return Boolean(videoId&&map?.[videoId]);}
function watchedCount(media:TeacherMedia):number{const map=watchedMap();if(!map)return 0;return (media.videos||[]).reduce((sum,v)=>sum+(map[v.id]?1:0),0);}
function toggleWatched(video:MediaVideo,media:TeacherMedia):void{
  if(!video.id)return;const map=watchedMap();if(!map||typeof legacy.save!=="function"){legacy.toast?.("İzleme kaydı şu an hazır değil");return;}
  const previous=map[video.id],removing=Boolean(previous);
  if(removing)delete map[video.id];else map[video.id]={at:Date.now(),title:String(video.title||"").slice(0,120),subj:String(media.subject||"").slice(0,60),topic:"",ch:String(video.channel||media.channelName||media.name||"").slice(0,60),hoca:String(media.name||activeTeacher||"").slice(0,60)};
  try{if(legacy.save()===false)throw new Error("save failed");legacy.toast?.(removing?"İzledim işareti kaldırıldı":"İzledim ✓");}
  catch{if(previous)map[video.id]=previous;else delete map[video.id];legacy.toast?.("İzleme kaydı saklanamadı");}
}
function kindForTitle(title:string):FilterKind[]{
  const text=norm(title),out:FilterKind[]=["all"];
  if(/\btyt\b/.test(text))out.push("tyt");if(/\bayt\b/.test(text))out.push("ayt");
  if(/soru|test|problem|cozum|çözüm/.test(text))out.push("soru");if(/deneme|brans|branş/.test(text))out.push("deneme");
  if(/kamp|maraton|seri|bootcamp|tekrar kampi|tekrar kampı/.test(text))out.push("kamp");return out;
}
function filteredVideos(media:TeacherMedia):MediaVideo[]{
  let videos=(media.videos||[]).slice();
  if(currentFilter==="watched")videos=videos.filter(v=>isWatched(v.id));
  else if(currentFilter==="unwatched")videos=videos.filter(v=>!isWatched(v.id));
  else if(currentFilter!=="all")videos=videos.filter(v=>kindForTitle(v.title).includes(currentFilter));
  const query=norm(videoQuery);if(query)videos=videos.filter(v=>norm([v.title,v.channel||media.channelName||media.name].join(" ")).includes(query));return videos;
}
function youtubeSearchUrl(name:string,kind=""):string{
  const suffix:Record<string,string>={tyt:"TYT konu anlatımı",ayt:"AYT konu anlatımı",soru:"soru çözümü",deneme:"deneme branş çözümü",kamp:"kamp seri",playlist:"oynatma listesi"};
  return `https://www.youtube.com/results?search_query=${encodeURIComponent([name,suffix[kind]||"YKS"].filter(Boolean).join(" "))}`;
}
function playlistSearchUrl(name:string):string{const url=new URL("https://www.youtube.com/results");url.searchParams.set("search_query",`${name} YKS oynatma listesi`);url.searchParams.set("sp","EgIQAw==");return url.toString();}
function planVideoText(video:MediaVideo):string{
  const title=String(video.title||"Video").replace(/\s+/g," ").trim(),short=title.length>46?`${title.slice(0,46)}…`:title,url=video.id?`https://youtu.be/${video.id}`:String(video.url||"");
  return `▶ ${short}${url?` — ${url}`:""}`;
}
function planPlaylistText(item:MediaPlaylist):string{
  const title=String(item.title||"Oynatma listesi").replace(/\s+/g," ").trim(),short=title.length>46?`${title.slice(0,46)}…`:title;
  return `☰ ${short}${item.url?` — ${item.url}`:""}`;
}
function inProgram(text:string):boolean{try{return typeof legacy.planFindCell==="function"&&Boolean(legacy.planFindCell(text));}catch{return false;}}
function refreshLegacyProgram():void{try{legacy.renderTodayPlan?.();}catch{}try{legacy.renderPlan?.();}catch{}}
function addPlanText(text:string,label:string):boolean{
  if(inProgram(text)){legacy.toast?.(`${label} zaten Programım'da`);return false;}
  if(typeof legacy.openDayPick!=="function"){legacy.toast?.("Programım gün seçici şu an hazır değil");return false;}
  return legacy.openDayPick(text,()=>{refreshLegacyProgram();if(lastOverlay&&activeTeacher&&document.contains(lastOverlay))renderMediaSection(lastOverlay,activeTeacher);});
}
function videoCards(media:TeacherMedia,videos:MediaVideo[]):string{
  if(!videos.length){const filtered=currentFilter!=="all"||Boolean(videoQuery.trim());return `<div class="teachers-v2-media-empty"><b>${filtered?"Bu süzgeçte yüklenmiş video bulunamadı.":"Henüz video verisi yok."}</b><span>${hasMoreArchive(media.name)?"Arşivde daha fazla video var; aşağıdaki düğmeyle devam et.":"Aramayı veya süzgeci değiştir."}</span></div>`;}
  return videos.map(video=>{
    const seen=isWatched(video.id),planned=inProgram(planVideoText(video)),channel=video.channel||media.channelName||media.name;
    return `<article class="teachers-v2-video-card ${seen?"seen":""}" data-video-id="${esc(video.id)}" data-video-title="${esc(video.title)}" data-video-channel="${esc(channel)}" data-video-thumb="${esc(video.thumbnail||"")}">
      <button class="teachers-v2-video-main" type="button" data-media-action="play" data-video-id="${esc(video.id)}" data-video-title="${esc(video.title)}" aria-label="${esc(video.title)} videosunu oynat">
        <span class="teachers-v2-video-thumb">${video.thumbnail?`<img src="${esc(video.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:""}<i>▶</i>${seen?'<em>İzlendi</em>':""}</span>
        <span class="teachers-v2-video-copy"><b>${esc(video.title)}</b><small>${esc(channel)}</small></span>
      </button>
      <button class="teachers-v2-video-plan ${planned?"on":""}" type="button" data-media-action="program" data-video-id="${esc(video.id)}">${planned?"✓ Programda":"Programa ekle"}</button>
      <button class="teachers-v2-video-watch ${seen?"on":""}" type="button" data-media-action="watch" data-video-id="${esc(video.id)}" aria-pressed="${seen?"true":"false"}">${seen?"✓ İzlendi":"○ İzledim"}</button>
    </article>`;
  }).join("");
}
function allPlaylists(media:TeacherMedia):MediaPlaylist[]{return Array.isArray(media.playlists)?media.playlists:[];}
function visiblePlaylists(media:TeacherMedia):{items:MediaPlaylist[];total:number;matches:number}{
  const playlists=allPlaylists(media),query=norm(playlistQuery);
  const matches=query?playlists.filter(item=>norm(item.title).includes(query)):playlists;
  return {items:matches.slice(0,playlistLimit),total:playlists.length,matches:matches.length};
}
function findPlaylist(media:TeacherMedia,id:string):MediaPlaylist|undefined{return allPlaylists(media).find(item=>item.id===id);}
function findVideo(media:TeacherMedia,id:string):MediaVideo|undefined{
  const direct=(media.videos||[]).find(item=>item.id===id);if(direct)return direct;
  for(const playlist of allPlaylists(media)){const hit=(playlist.videos||[]).find(item=>item.id===id);if(hit)return hit;}
  return undefined;
}
function playlistEmbed(item:MediaPlaylist):string{
  if(!item.id)return "";
  return `https://www.youtube-nocookie.com/embed?listType=playlist&list=${encodeURIComponent(item.id)}&playsinline=1&rel=0`;
}
function playlistDetail(media:TeacherMedia,item:MediaPlaylist):string{
  const videos=Array.isArray(item.videos)?item.videos:[],planned=inProgram(planPlaylistText(item));
  return `<div class="teachers-v2-playlist-detail">
    <div class="teachers-v2-playlist-detail-head"><button type="button" data-media-action="playlist-back">‹ Listelere dön</button><div><b>${esc(item.title)}</b><small>${videos.length?`${videos.length} video önizlemesi · Listenin tamamı oynatıcıda`:"Listenin tamamını oynatıcıdan izle"}</small></div><button class="teachers-v2-playlist-plan ${planned?"on":""}" type="button" data-media-action="playlist-program" data-playlist-id="${esc(item.id)}">${planned?"✓ Programda":"Programa ekle"}</button><button type="button" data-media-action="playlist-play" data-playlist-id="${esc(item.id)}">Tüm listeyi izle</button></div>
    ${videos.length?`<div class="teachers-v2-playlist-video-grid">${videoCards(media,videos)}</div>`:'<p class="teachers-v2-playlist-note">Videolar arasında oynatıcının liste düğmesiyle geçebilirsin.</p>'}
  </div>`;
}
function playlistCards(media:TeacherMedia):string{
  const view=visiblePlaylists(media);
  if(!view.total)return `<button class="teachers-v2-playlist-fallback" type="button" data-media-action="playlist-search">Oynatma listelerini YouTube'da bul <span>→</span></button>`;
  if(!view.items.length)return `<div class="teachers-v2-playlist-empty"><b>Bu aramada liste bulunamadı.</b><span>Başka bir kelime dene veya bağlantısını aşağıya yapıştır.</span></div>`;
  return view.items.map(item=>{const planned=inProgram(planPlaylistText(item)),count=Number(item.videoCount||0),preview=item.videos?.length||0;return `<article class="teachers-v2-playlist-wrap"><button class="teachers-v2-playlist-card" type="button" data-media-action="playlist" data-playlist-id="${esc(item.id)}" aria-label="${esc(item.title)} oynatma listesini aç"><span>▤</span><span class="teachers-v2-playlist-copy"><b>${esc(item.title)}</b><small>${count?`${count} video`:preview?`${preview} video önizlemesi`:"Oynatma listesi"} · Listeyi aç</small></span><i>›</i></button><button class="teachers-v2-playlist-plan ${planned?"on":""}" type="button" data-media-action="playlist-program" data-playlist-id="${esc(item.id)}" aria-label="${esc(item.title)} listesini Programım'a ekle">${planned?"✓ Programda":"Programa ekle"}</button></article>`;}).join("");
}
function playlistSection(media:TeacherMedia):string{
  const active=activePlaylistId?findPlaylist(media,activePlaylistId):undefined,view=visiblePlaylists(media);
  if(active)return `<div class="teachers-v2-playlist-head"><div><h4>Oynatma listesi</h4><span>Videoları tek tek açabilir veya Programım'a ekleyebilirsin</span></div></div><div id="teachersV2PlaylistGrid" class="teachers-v2-playlist-grid detail">${playlistDetail(media,active)}</div>`;
  const summary=`${view.items.length} / ${view.matches} liste${hasMorePlaylistData(media.name)?" · diğer listeler yükleniyor":""}`;
  return `<div class="teachers-v2-playlist-head"><div><h4>Oynatma listeleri</h4><span>Bir seri seç, izle veya programına ekle.</span></div><span id="teachersV2PlaylistResult" aria-live="polite">${summary}</span></div><div class="teachers-v2-playlist-tools"><label class="teachers-v2-playlist-search"><span>⌕</span><input id="teachersV2PlaylistSearch" type="search" autocomplete="off" value="${esc(playlistQuery)}" placeholder="Oynatma listelerinde ara…" aria-label="Bu hocanın oynatma listelerinde ara"></label></div><div id="teachersV2PlaylistGrid" class="teachers-v2-playlist-grid">${playlistCards(media)}</div><button class="teachers-v2-playlist-more teachers-v2-load-more" type="button" data-media-action="playlist-more" ${view.items.length>=view.matches?"hidden":""}>Daha fazla liste göster</button>`;
}
function updatePlaylistGrid(section:HTMLElement,media:TeacherMedia):void{
  if(activePlaylistId)return;
  const view=visiblePlaylists(media),grid=section.querySelector<HTMLElement>("#teachersV2PlaylistGrid");
  if(grid)grid.innerHTML=playlistCards(media);
  const result=section.querySelector<HTMLElement>("#teachersV2PlaylistResult");
  if(result)result.textContent=`${view.items.length} / ${view.matches} liste`;
  const more=section.querySelector<HTMLButtonElement>(".teachers-v2-playlist-more");if(more)more.hidden=view.items.length>=view.matches;
}
function hasMorePlaylistData(name:string):boolean{return !stateFor(name)&&Boolean(manifestMediaFor(name)?.archiveIndex);}
function isCurrent(overlay:HTMLElement,name:string):boolean{return overlay===lastOverlay&&activeTeacher===name&&document.contains(overlay);}
async function openPlaylistForCurrent(id:string):Promise<void>{
  if(!activeTeacher||!lastOverlay||!id)return;
  const name=activeTeacher,overlay=lastOverlay;
  activePlaylistId=id;
  renderMediaSection(overlay,name);
  if(hasMorePlaylistData(name))await loadArchiveIndex(name,false);
  if(isCurrent(overlay,name)&&activePlaylistId===id)renderMediaSection(overlay,name);
}
async function ensurePlaylistArchive():Promise<void>{
  if(!activeTeacher||!lastOverlay||stateFor(activeTeacher)||!manifestMediaFor(activeTeacher)?.archiveIndex)return;
  const name=activeTeacher,overlay=lastOverlay;
  const state=await loadArchiveIndex(name,false);
  if(isCurrent(overlay,name)){const media=mediaFor(name),section=overlay.querySelector<HTMLElement>(".teachers-v2-media-section");if(media&&section){updatePlaylistGrid(section,media);if(!state){const result=section.querySelector("#teachersV2PlaylistResult");if(result)result.textContent="Diğer listeler yüklenemedi. Yenile ile tekrar deneyebilirsin.";}}}
}
function statusHtml(media:TeacherMedia|null):string{
  if(!media)return `<span class="teachers-v2-media-dot pending"></span>${feedSettled?"Bu hocanın arşivine şu an ulaşılamıyor. Bağlantı ekleyebilir veya yeniden deneyebilirsin.":"Kaynaklar yükleniyor…"}`;
  const loaded=media.videos.length,total=Math.max(loaded,Number(media.videoCount||0)),seen=watchedCount(media),lists=Math.max(media.playlists.length,Number(media.playlistCount||0));
  return `<span class="teachers-v2-media-dot ${loaded||lists?"ok":"pending"}"></span>Arşivde ${total} video · ${lists} liste${seen?` · ${seen} izlendi`:""}`;
}
function moreButtonState(media:TeacherMedia,filtered:MediaVideo[],visible:MediaVideo[]):{hidden:boolean;text:string}{
  const localLeft=Math.max(0,filtered.length-visible.length),remote=hasMoreArchive(media.name);
  if(localLeft>0)return {hidden:false,text:`Daha fazla göster (${localLeft} yüklü video)`};
  if(remote)return {hidden:false,text:"Arşivden daha fazla video yükle"};
  return {hidden:true,text:"Tüm videolar yüklendi"};
}
function updateVideoGrid(section:HTMLElement,media:TeacherMedia):void{
  const status=section.querySelector<HTMLElement>("#teachersV2MediaStatus");if(status)status.innerHTML=statusHtml(media);
  const filtered=filteredVideos(media),visible=filtered.slice(0,visibleLimit),grid=section.querySelector<HTMLElement>("#teachersV2VideoGrid");
  if(grid)grid.innerHTML=videoCards(media,visible);
  const result=section.querySelector<HTMLElement>("#teachersV2VideoResult");if(result)result.textContent=searching?`${filtered.length} sonuç · arşiv taranıyor…`:`${visible.length} / ${filtered.length} sonuç${hasMoreArchive(media.name)?" · arşivde devamı var":""}`;
  const more=section.querySelector<HTMLButtonElement>("#teachersV2LoadMore");if(more){const state=moreButtonState(media,filtered,visible);more.hidden=state.hidden;more.disabled=searching;more.textContent=searching?"Arşiv taranıyor…":state.text;}
  section.querySelectorAll<HTMLElement>("[data-media-action=filter]").forEach(button=>{const on=button.dataset.filter===currentFilter;button.classList.toggle("on",on);button.setAttribute("aria-pressed",String(on));});
}
function renderMediaSection(overlay:HTMLElement,name:string):void{
  const section=[...overlay.querySelectorAll<HTMLElement>(".teachers-v2-section")].find(node=>node.querySelector("h3")?.textContent?.trim()==="Video merkezi"||node.classList.contains("teachers-v2-media-section"));if(!section)return;
  const focused=document.activeElement as HTMLElement|null,focusId=focused&&section.contains(focused)?focused.id:"",linkOpen=Boolean(section.querySelector<HTMLDetailsElement>(".teachers-v2-link-form")?.open);
  const media=mediaFor(name),filtered=media?filteredVideos(media):[],visible=filtered.slice(0,visibleLimit);
  const moreState=media?moreButtonState(media,filtered,visible):{hidden:true,text:""};
  const empty=feedSettled?'<div class="teachers-v2-media-empty"><b>Arşiv şu an kullanılamıyor.</b><span>YouTube bağlantısıyla izlemeye ve programına eklemeye devam edebilirsin.</span></div>':'<div class="teachers-v2-media-loading"><i></i><span>Kaynaklar yükleniyor…</span></div>';
  section.classList.add("teachers-v2-media-section");
  section.dataset.mediaBrowser="restored";
  section.innerHTML=`<div class="teachers-v2-section-head teachers-v2-media-head"><div><h3>Ders kaynakları</h3><span id="teachersV2MediaStatus" class="teachers-v2-media-status">${statusHtml(media)}</span></div><div class="teachers-v2-media-head-actions"><button type="button" data-media-action="refresh">Yenile</button><button type="button" data-media-action="channel-videos">YouTube kanalı ↗</button></div></div>
    <div class="teachers-v2-media-tabs" role="tablist" aria-label="Kaynak türü">${([["playlists","Oynatma listeleri"],["videos","Videolar"]] as const).map(([view,label])=>`<button id="teachersV2Tab-${view}" type="button" role="tab" aria-controls="teachersV2Panel-${view}" aria-selected="${mediaView===view}" tabindex="${mediaView===view?0:-1}" data-media-action="tab" data-view="${view}">${label}</button>`).join("")}</div>
    <div id="teachersV2Panel-playlists" class="teachers-v2-media-panel" role="tabpanel" aria-labelledby="teachersV2Tab-playlists" ${mediaView==="playlists"?"":"hidden"}>${media?playlistSection(media):empty}</div>
    <div id="teachersV2Panel-videos" class="teachers-v2-media-panel" role="tabpanel" aria-labelledby="teachersV2Tab-videos" ${mediaView==="videos"?"":"hidden"}>
      <div class="teachers-v2-media-tools"><label class="teachers-v2-video-search"><span>⌕</span><input id="teachersV2VideoSearch" type="search" autocomplete="off" value="${esc(videoQuery)}" placeholder="Konu veya video adı ara…" aria-label="Bu hocanın video arşivinde ara"></label><span id="teachersV2VideoResult" class="teachers-v2-video-result" aria-live="polite">${media?`${visible.length} / ${filtered.length} sonuç`:""}</span></div>
      <div class="teachers-v2-media-filters" role="group" aria-label="Video filtresi">${([['all','Tümü'],['tyt','TYT'],['ayt','AYT'],['deneme','Deneme'],['soru','Soru'],['kamp','Kamp / Seri'],['unwatched','İzlenmedi'],['watched','İzlendi']] as [FilterKind,string][]).map(([value,label])=>`<button type="button" class="${currentFilter===value?"on":""}" data-media-action="filter" data-filter="${value}" aria-pressed="${currentFilter===value}">${label}</button>`).join("")}</div>
      <div id="teachersV2VideoGrid" class="teachers-v2-video-grid">${media?videoCards(media,visible):empty}</div>
      <button id="teachersV2LoadMore" class="teachers-v2-load-more" type="button" data-media-action="more" ${moreState.hidden?"hidden":""}>${esc(moreState.text)}</button>
    </div>
    <details class="teachers-v2-link-form"><summary>Bağlantıyla video veya liste ekle</summary><p>İstediğin YouTube kaynağını burada izle veya bir çalışma gününe ekle.</p><label for="teachersV2LinkUrl">YouTube bağlantısı</label><input id="teachersV2LinkUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://www.youtube.com/…" value="${esc(linkUrl)}"><label for="teachersV2LinkTitle">Kaynak adı (isteğe bağlı)</label><input id="teachersV2LinkTitle" type="text" maxlength="100" placeholder="Örn. TYT Problemler kampı" value="${esc(linkTitle)}"><div><button type="button" data-media-action="link-play">Uygulamada izle</button><button type="button" data-media-action="link-program">Programa ekle</button></div><p id="teachersV2LinkFeedback" role="status"></p></details>`;
  const search=section.querySelector<HTMLInputElement>("#teachersV2VideoSearch");
  search?.addEventListener("input",()=>{videoQuery=search.value;visibleLimit=PAGE_SIZE;searchRevision++;searching=false;const fresh=mediaFor(name);if(fresh)updateVideoGrid(section,fresh);window.clearTimeout(searchTimer);searchTimer=window.setTimeout(()=>void ensureFilterResults(),250);});
  const playlistSearch=section.querySelector<HTMLInputElement>("#teachersV2PlaylistSearch");
  playlistSearch?.addEventListener("input",()=>{playlistQuery=playlistSearch.value;playlistLimit=PLAYLIST_PAGE_SIZE;const fresh=mediaFor(name);if(fresh)updatePlaylistGrid(section,fresh);void ensurePlaylistArchive();});
  section.querySelector<HTMLInputElement>("#teachersV2LinkUrl")?.addEventListener("input",event=>{linkUrl=(event.target as HTMLInputElement).value;});
  section.querySelector<HTMLInputElement>("#teachersV2LinkTitle")?.addEventListener("input",event=>{linkTitle=(event.target as HTMLInputElement).value;});
  section.querySelector(".teachers-v2-media-tabs")?.addEventListener("keydown",event=>{const key=(event as KeyboardEvent).key;if(!["ArrowLeft","ArrowRight","Home","End"].includes(key))return;event.preventDefault();event.stopPropagation();const view=key==="Home"?"playlists":key==="End"?"videos":mediaView==="videos"?"playlists":"videos";switchMediaView(view);lastOverlay?.querySelector<HTMLElement>('#teachersV2Tab-'+view)?.focus();});
  const form=section.querySelector<HTMLDetailsElement>(".teachers-v2-link-form");if(form){form.open=linkOpen;section.querySelector(".teachers-v2-media-tabs")?.before(form);}
  if(focusId)section.querySelector<HTMLElement>('#'+focusId)?.focus({preventScroll:true});
}
async function previewOverlayMedia(overlay:HTMLElement,name:string,force=false):Promise<void>{
  await loadFeed(force);decorateCards();if(!isCurrent(overlay,name))return;renderMediaSection(overlay,name);
  // Fetch only the playlist index on entry. Video pages wait for browsing/search.
  void ensurePlaylistArchive();
  if(mediaView==="videos")void ensureFilterResults();
}
async function refreshOverlayMedia(overlay:HTMLElement,name:string,force=false):Promise<void>{
  searchRevision++;searching=false;
  const status=overlay.querySelector<HTMLElement>("#teachersV2MediaStatus");if(status)status.textContent="Kaynaklar yenileniyor…";
  if(force)archiveStates.delete(keyFor(name));
  await previewOverlayMedia(overlay,name,force);
}
function switchMediaView(view:"playlists"|"videos"):void{
  mediaView=view;searchRevision++;searching=false;
  if(!lastOverlay)return;
  lastOverlay.querySelectorAll<HTMLElement>("[data-media-action=tab]").forEach(tab=>{const on=tab.dataset.view===view;tab.setAttribute("aria-selected",String(on));tab.tabIndex=on?0:-1;});
  lastOverlay.querySelectorAll<HTMLElement>(".teachers-v2-media-panel").forEach(panel=>{panel.hidden=panel.id!==`teachersV2Panel-${view}`;});
  if(view==="playlists")void ensurePlaylistArchive();else void ensureFilterResults();
}
type LinkedResource={kind:"video"|"playlist";id:string;title:string;url:string};
function parseResourceLink(raw:string,title:string):LinkedResource|null{
  try{
    const url=new URL(raw.trim()),host=url.hostname.toLowerCase();
    if(!["https:","http:"].includes(url.protocol)||!["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com","youtu.be","www.youtu.be"].includes(host))return null;
    const list=url.searchParams.get("list");
    if(list&&/^[a-zA-Z0-9_-]{10,100}$/.test(list))return {kind:"playlist",id:list,title:title.trim()||"YouTube oynatma listesi",url:`https://www.youtube.com/playlist?list=${list}`};
    const id=(host.endsWith("youtu.be")?url.pathname.slice(1).split("/")[0]:url.searchParams.get("v")||url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1])||"";
    return /^[a-zA-Z0-9_-]{11}$/.test(id)?{kind:"video",id,title:title.trim()||"YouTube videosu",url:`https://youtu.be/${id}`}:null;
  }catch{return null;}
}
function handleResourceLink(play:boolean):void{
  const resource=parseResourceLink(linkUrl,linkTitle),feedback=lastOverlay?.querySelector<HTMLElement>("#teachersV2LinkFeedback");
  if(!resource){if(feedback)feedback.textContent="Geçerli bir YouTube video veya oynatma listesi bağlantısı yapıştır.";return;}
  if(feedback)feedback.textContent="";
  if(play){if(resource.kind==="playlist")openPlaylistPlayer(resource);else openPlayer(resource.id,resource.title);}
  else addPlanText(resource.kind==="playlist"?planPlaylistText(resource):planVideoText(resource),resource.kind==="playlist"?"Oynatma listesi":"Video");
}

function openExternal(url:string):void{if(url)window.open(url,"_blank","noopener,noreferrer");}
function openPlayer(videoId:string,title:string,playlist?:MediaPlaylist):void{
  if(!videoId)return;document.getElementById(PLAYER_ID)?.remove();const player=document.createElement("div");player.id=PLAYER_ID;player.className="teachers-v2-player-overlay";player.setAttribute("role","dialog");player.setAttribute("aria-modal","true");player.setAttribute("aria-label",title||"YouTube videosu");
  const embed=playlist?playlistEmbed(playlist):`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  player.innerHTML=`<div class="teachers-v2-player"><div class="teachers-v2-player-head"><b>${esc(title||"Video")}</b><div><button type="button" data-player-action="youtube">YouTube'da aç</button><button type="button" data-player-action="close">Kapat</button></div></div><div class="teachers-v2-player-frame"><iframe src="${embed}" title="${esc(title||"YouTube videosu")}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
  player.addEventListener("click",event=>{if(event.target===player){player.remove();return;}const action=(event.target as HTMLElement|null)?.closest<HTMLElement>("[data-player-action]")?.dataset.playerAction;if(action==="close")player.remove();if(action==="youtube")openExternal(playlist?.url||`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`);});document.body.appendChild(player);
}
function openPlaylistPlayer(item:MediaPlaylist):void{
  openPlayer(item.id,item.title,item);
}
async function loadMoreForCurrent():Promise<void>{
  if(!activeTeacher||!lastOverlay)return;
  const name=activeTeacher,overlay=lastOverlay,revision=++searchRevision;
  let media=mediaFor(name);if(!media)return;
  const section=overlay.querySelector<HTMLElement>(".teachers-v2-media-section");if(!section)return;
  const before=filteredVideos(media).length;visibleLimit+=PAGE_SIZE;
  if(visibleLimit-PAGE_SIZE<before){updateVideoGrid(section,media);return;}
  searching=true;updateVideoGrid(section,media);
  let tries=0,after=before;
  while(isCurrent(overlay,name)&&revision===searchRevision&&hasMoreArchive(name)&&after<=before&&tries<4){if(!await loadNextArchivePage(name,false))break;tries++;media=mediaFor(name);after=media?filteredVideos(media).length:after;}
  if(!isCurrent(overlay,name)||revision!==searchRevision)return;
  searching=false;media=mediaFor(name);if(media)updateVideoGrid(section,media);
}
async function ensureFilterResults():Promise<void>{
  if(!activeTeacher||!lastOverlay||mediaView!=="videos")return;
  const name=activeTeacher,overlay=lastOverlay,revision=++searchRevision;
  const section=overlay.querySelector<HTMLElement>(".teachers-v2-media-section");
  let media=mediaFor(name);if(!section||!media)return;
  searching=true;updateVideoGrid(section,media);
  while(isCurrent(overlay,name)&&revision===searchRevision&&filteredVideos(media).length<visibleLimit&&hasMoreArchive(name)){
    if(!await loadNextArchivePage(name,false))break;
    media=mediaFor(name)||media;
    if(isCurrent(overlay,name)&&revision===searchRevision)updateVideoGrid(section,media);
  }
  if(!isCurrent(overlay,name)||revision!==searchRevision)return;
  searching=false;updateVideoGrid(section,media);
}

function handleMediaClick(event:MouseEvent):void{
  const target=event.target as HTMLElement|null,action=target?.closest<HTMLElement>("[data-media-action]");if(!action||!activeTeacher)return;const media=mediaFor(activeTeacher),type=action.dataset.mediaAction||"";
  if(type==="tab"){switchMediaView(action.dataset.view==="videos"?"videos":"playlists");return;}
  if(type==="link-play"||type==="link-program"){handleResourceLink(type==="link-play");return;}
  if(type==="playlist-more"){playlistLimit+=PLAYLIST_PAGE_SIZE;const section=lastOverlay?.querySelector<HTMLElement>(".teachers-v2-media-section");if(section&&media)updatePlaylistGrid(section,media);return;}
  if(type==="playlist-play"){const item=media?findPlaylist(media,action.dataset.playlistId||""):undefined;if(item)openPlaylistPlayer(item);return;}
  if(type==="filter"){
    const value=action.dataset.filter as FilterKind|undefined;if(value&&["all","tyt","ayt","soru","deneme","kamp","watched","unwatched"].includes(value))currentFilter=value;visibleLimit=PAGE_SIZE;
    searchRevision++;searching=false;const section=lastOverlay?.querySelector<HTMLElement>(".teachers-v2-media-section");if(section&&media)updateVideoGrid(section,media);void ensureFilterResults();return;
  }
  if(type==="more"){void loadMoreForCurrent();return;}
  if(type==="refresh"){archiveStates.delete(keyFor(activeTeacher));if(lastOverlay)void refreshOverlayMedia(lastOverlay,activeTeacher,true);return;}
  if(type==="play"){openPlayer(action.dataset.videoId||"",action.dataset.videoTitle||"");return;}
  if(type==="watch"){const video=media?findVideo(media,action.dataset.videoId||""):undefined;if(video&&media){toggleWatched(video,media);if(lastOverlay)renderMediaSection(lastOverlay,activeTeacher);}return;}
  if(type==="program"){const video=media?findVideo(media,action.dataset.videoId||""):undefined;if(video)addPlanText(planVideoText(video),"Video");return;}
  if(type==="playlist"){void openPlaylistForCurrent(action.dataset.playlistId||"");return;}
  if(type==="playlist-back"){activePlaylistId="";if(lastOverlay&&media)renderMediaSection(lastOverlay,activeTeacher);return;}
  if(type==="playlist-youtube"){openExternal(action.dataset.playlistUrl||"");return;}
  if(type==="playlist-program"){const item=media?findPlaylist(media,action.dataset.playlistId||""):undefined;if(item)addPlanText(planPlaylistText(item),"Oynatma listesi");return;}
  if(type==="playlist-search"){openExternal(playlistSearchUrl(activeTeacher));return;}
  if(type==="channel"||type==="channel-videos"){const channel=media?.channelUrl||youtubeSearchUrl(activeTeacher,"");openExternal(type==="channel-videos"&&media?.channelUrl?`${media.channelUrl.replace(/\/$/,"")}/videos`:channel);return;}
  if(type==="search")openExternal(youtubeSearchUrl(activeTeacher,action.dataset.kind||""));
}
function enhanceOverlay(overlay:HTMLElement):void{
  const heading=overlay.querySelector(".teachers-v2-profile h2")?.textContent?.trim();if(!heading)return;activeTeacher=heading;currentFilter="all";videoQuery="";playlistQuery="";activePlaylistId="";visibleLimit=PAGE_SIZE;playlistLimit=PLAYLIST_PAGE_SIZE;mediaView="playlists";linkUrl="";linkTitle="";searchRevision++;searching=false;window.clearTimeout(searchTimer);lastOverlay=overlay;overlay.removeEventListener("click",handleMediaClick);overlay.addEventListener("click",handleMediaClick);renderMediaSection(overlay,heading);void previewOverlayMedia(overlay,heading,false);
}
function decorateCards():void{
  if(!feed)return;document.querySelectorAll<HTMLElement>(".teachers-v2-card[data-name]").forEach(card=>{
    const name=card.dataset.name||"",media=mediaFor(name);if(!media)return;const tags=card.querySelector(".teachers-v2-tags"),count=Math.max(media.videos.length,Number(media.videoCount||0));
    let mediaTag=tags?.querySelector<HTMLElement>(".teachers-v2-tag-media");if(!mediaTag&&tags){tags.insertAdjacentHTML("beforeend",'<span class="teachers-v2-tag teachers-v2-tag-media"></span>');mediaTag=tags.querySelector<HTMLElement>(".teachers-v2-tag-media");}
    const label=`● ${count} video`;if(mediaTag&&mediaTag.textContent!==label)mediaTag.textContent=label;
    const seen=watchedCount(media),existing=tags?.querySelector<HTMLElement>(".teachers-v2-tag-watched");if(seen){const text=`✓ ${seen} izlendi`;if(existing){if(existing.textContent!==text)existing.textContent=text;}else tags?.insertAdjacentHTML("beforeend",`<span class="teachers-v2-tag teachers-v2-tag-watched">${text}</span>`);}else existing?.remove();
  });
}
function scan():void{const overlay=document.getElementById("teachersV2Overlay") as HTMLElement|null;if(overlay&&overlay!==lastOverlay)enhanceOverlay(overlay);if(!overlay){lastOverlay=null;activeTeacher="";}decorateCards();}
function refreshWatchedUi():void{decorateCards();if(lastOverlay&&activeTeacher&&document.contains(lastOverlay))renderMediaSection(lastOverlay,activeTeacher);}
function install():void{
  decorateCards();observer=new MutationObserver(scan);observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&document.getElementById(PLAYER_ID))document.getElementById(PLAYER_ID)?.remove();});
  window.addEventListener("online",()=>{if(lastOverlay&&activeTeacher&&document.contains(lastOverlay))void previewOverlayMedia(lastOverlay,activeTeacher,true);});window.addEventListener("storage",event=>{if(event.key==="yks")refreshWatchedUi();});document.documentElement.dataset.teachersV2Media="ready";scan();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
export {};
