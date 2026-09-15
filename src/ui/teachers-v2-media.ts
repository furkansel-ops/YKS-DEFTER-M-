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
const DEFAULT_PLAYLIST_LIMIT=8;
let feed:TeachersFeed|null=null;
let feedPromise:Promise<TeachersFeed|null>|null=null;
let observer:MutationObserver|null=null;
let currentFilter:FilterKind="all";
let activeTeacher="";
let videoQuery="";
let playlistQuery="";
let activePlaylistId="";
let visibleLimit=PAGE_SIZE;
let lastOverlay:HTMLElement|null=null;
const archiveStates=new Map<string,ArchiveState>();
const archivePromises=new Map<string,Promise<ArchiveState|null>>();

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
  if(!navigator.onLine&&cached){feed=cached;return feed;}
  feedPromise=(async()=>{
    try{
      const response=await fetch(feedUrl(force),{cache:force?"reload":"no-cache",credentials:"same-origin"});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const parsed=await response.json() as TeachersFeed;
      if(!parsed||typeof parsed!=="object"||!parsed.teachers||typeof parsed.teachers!=="object")throw new Error("geçersiz medya akışı");
      feed=parsed;writeCache(parsed);return parsed;
    }catch{feed=cached||feed;return feed;}
    finally{feedPromise=null;}
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
  const response=await fetch(url.href,{cache:"no-store",credentials:"same-origin"});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  return await response.json() as T;
}
async function loadArchivePage(name:string,index:number,force=false):Promise<boolean>{
  const state=stateFor(name);if(!state)return false;
  if(index<0||index>=state.meta.pages.length||state.loaded.has(index)||state.loading.has(index))return state.loaded.has(index);
  const pagePath=state.meta.pages[index];if(!pagePath)return false;
  state.loading.add(index);
  try{
    const page=await fetchJson<ArchivePage>(pagePath,force);
    if(!page||!Array.isArray(page.videos))throw new Error("geçersiz arşiv sayfası");
    state.videos=uniqueVideos(state.videos,page.videos);state.loaded.add(index);return true;
  }catch{return false;}
  finally{state.loading.delete(index);}
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
      if(meta.pages.length)await loadArchivePage(name,0,force);
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
  for(let i=0;i<state.meta.pages.length;i++)if(!state.loaded.has(i)&&!state.loading.has(i))return loadArchivePage(name,i,force);
  return false;
}
function watchedMap():Record<string,WatchedRecord>|null{try{const map=legacy.watchedMap?.();return map&&typeof map==="object"&&!Array.isArray(map)?map:null;}catch{return null;}}
function isWatched(videoId:string):boolean{const map=watchedMap();return Boolean(videoId&&map?.[videoId]);}
function watchedCount(media:TeacherMedia):number{const map=watchedMap();if(!map)return 0;return (media.videos||[]).reduce((sum,v)=>sum+(map[v.id]?1:0),0);}
function toggleWatched(video:MediaVideo,media:TeacherMedia):void{
  if(!video.id)return;const map=watchedMap();if(!map||typeof legacy.save!=="function"){legacy.toast?.("İzleme kaydı şu an hazır değil");return;}
  const previous=map[video.id],removing=Boolean(previous);
  if(removing)delete map[video.id];else map[video.id]={at:Date.now(),title:String(video.title||"").slice(0,120),subj:String(media.subject||"").slice(0,60),topic:"",ch:String(video.channel||media.channelName||media.name||"").slice(0,60),hoca:String(media.name||activeTeacher||"").slice(0,60)};
  try{legacy.save();legacy.toast?.(removing?"İzledim işareti kaldırıldı":"İzledim ✓");}
  catch{if(previous)map[video.id]=previous;else delete map[video.id];legacy.toast?.("İzleme kaydı saklanamadı");}
}
function formatDate(value:string|null|undefined):string{if(!value)return "";const date=new Date(value);return Number.isNaN(date.getTime())?"":date.toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"});}
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
      <button class="teachers-v2-video-plan ${planned?"on":""}" type="button" data-media-action="program" data-video-id="${esc(video.id)}">${planned?"✓ Programda":"＋ Programım"}</button>
      <button class="teachers-v2-video-watch ${seen?"on":""}" type="button" data-media-action="watch" data-video-id="${esc(video.id)}" aria-pressed="${seen?"true":"false"}">${seen?"✓ İzlendi":"○ İzledim"}</button>
    </article>`;
  }).join("");
}
function playlistScore(item:MediaPlaylist,media:TeacherMedia):number{
  const text=norm(item.title);let score=0;
  if(/\btyt\b/.test(text))score+=12;if(/\bayt\b/.test(text))score+=12;if(/\byks\b/.test(text))score+=7;
  if(/kamp|konu anlat|video ders|ders anlat|tekrar|seri/.test(text))score+=8;
  if(/soru|cozum|çözüm|deneme|problem/.test(text))score+=5;
  const focus=[media.subject||"",...(media.subjects||[])].map(x=>norm(String(x).replace(/\(ayt\)/ig,""))).filter(x=>x.length>2&&x!=="yks");
  if(focus.some(term=>text.includes(term)))score+=10;
  if(/rehberlik|motivasyon|sarki|şarkı|eslesme|eşleşme|vlog|shorts|korhay/.test(text))score-=18;
  return score;
}
function allPlaylists(media:TeacherMedia):MediaPlaylist[]{return Array.isArray(media.playlists)?media.playlists:[];}
function visiblePlaylists(media:TeacherMedia):{items:MediaPlaylist[];total:number;featured:boolean}{
  const playlists=allPlaylists(media),query=norm(playlistQuery);
  if(query)return {items:playlists.filter(item=>norm(item.title).includes(query)),total:playlists.length,featured:false};
  const ranked=playlists.map((item,index)=>({item,index,score:playlistScore(item,media)})).sort((a,b)=>b.score-a.score||a.index-b.index);
  let items=ranked.filter(row=>row.score>0).slice(0,DEFAULT_PLAYLIST_LIMIT).map(row=>row.item);
  if(items.length<4)items=ranked.slice(0,Math.min(DEFAULT_PLAYLIST_LIMIT,ranked.length)).map(row=>row.item);
  return {items,total:playlists.length,featured:true};
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
    <div class="teachers-v2-playlist-detail-head"><button type="button" data-media-action="playlist-back">‹ Listelere dön</button><div><b>${esc(item.title)}</b><small>${videos.length?`${videos.length} video önizlemesi`:`Playlist uygulama içinde açıldı`}</small></div><button class="teachers-v2-playlist-plan ${planned?"on":""}" type="button" data-media-action="playlist-program" data-playlist-id="${esc(item.id)}">${planned?"✓ Programda":"＋ Programım"}</button><button type="button" data-media-action="playlist-youtube" data-playlist-url="${esc(item.url)}">YouTube</button></div>
    ${videos.length?`<div class="teachers-v2-playlist-video-grid">${videoCards(media,videos)}</div>`:`<div class="teachers-v2-playlist-embed"><iframe src="${esc(playlistEmbed(item))}" title="${esc(item.title)}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><p>Bu listenin kart önizlemesi henüz önbelleğe alınmadı. Oynatıcıdan videolar arasında geçebilir veya YouTube'da açabilirsin.</p></div>`}
  </div>`;
}
function playlistCards(media:TeacherMedia):string{
  const view=visiblePlaylists(media);
  if(!view.total)return `<button class="teachers-v2-playlist-fallback" type="button" data-media-action="playlist-search">Oynatma listelerini YouTube'da bul <span>→</span></button>`;
  if(!view.items.length)return `<div class="teachers-v2-playlist-empty"><b>Bu aramada playlist bulunamadı.</b><span>Başka bir kelime dene; gizlenen listeler silinmedi.</span></div>`;
  return view.items.map(item=>{const planned=inProgram(planPlaylistText(item)),count=Array.isArray(item.videos)?item.videos.length:Number(item.videoCount||0);return `<article class="teachers-v2-playlist-wrap"><button class="teachers-v2-playlist-card" type="button" data-media-action="playlist" data-playlist-id="${esc(item.id)}" aria-label="${esc(item.title)} oynatma listesini aç"><span>▤</span><span class="teachers-v2-playlist-copy"><b>${esc(item.title)}</b><small>${count?`${count} video önizlemesi · `:""}Listeyi aç</small></span><i>›</i></button><button class="teachers-v2-playlist-plan ${planned?"on":""}" type="button" data-media-action="playlist-program" data-playlist-id="${esc(item.id)}" aria-label="${esc(item.title)} listesini Programım'a ekle">${planned?"✓":"＋"}</button></article>`;}).join("");
}
function playlistSection(media:TeacherMedia):string{
  const active=activePlaylistId?findPlaylist(media,activePlaylistId):undefined,view=visiblePlaylists(media);
  if(active)return `<div class="teachers-v2-playlist-head"><div><h4>Oynatma listesi</h4><span>Videoları tek tek açabilir veya Programım'a ekleyebilirsin</span></div></div><div id="teachersV2PlaylistGrid" class="teachers-v2-playlist-grid detail">${playlistDetail(media,active)}</div>`;
  const summary=playlistQuery?`${view.items.length} sonuç · toplam ${view.total}`:`Öne çıkan ${view.items.length} · toplam ${view.total}`;
  return `<div class="teachers-v2-playlist-head"><div><h4>Öne çıkan oynatma listeleri</h4><span>Gerekli seriler önde; diğerleri aramada duruyor</span></div><span id="teachersV2PlaylistResult">${summary}</span></div><div class="teachers-v2-playlist-tools"><label class="teachers-v2-playlist-search"><span>⌕</span><input id="teachersV2PlaylistSearch" type="search" autocomplete="off" value="${esc(playlistQuery)}" placeholder="Oynatma listelerinde ara…" aria-label="Bu hocanın oynatma listelerinde ara"></label></div><div id="teachersV2PlaylistGrid" class="teachers-v2-playlist-grid">${playlistCards(media)}</div>`;
}
function updatePlaylistGrid(section:HTMLElement,media:TeacherMedia):void{
  if(activePlaylistId)return;
  const view=visiblePlaylists(media),grid=section.querySelector<HTMLElement>("#teachersV2PlaylistGrid");
  if(grid)grid.innerHTML=playlistCards(media);
  const result=section.querySelector<HTMLElement>("#teachersV2PlaylistResult");
  if(result)result.textContent=playlistQuery?`${view.items.length} sonuç · toplam ${view.total}`:`Öne çıkan ${view.items.length} · toplam ${view.total}`;
}
async function openPlaylistForCurrent(id:string):Promise<void>{
  if(!activeTeacher||!lastOverlay||!id)return;
  activePlaylistId=id;
  let media=mediaFor(activeTeacher);
  if(media&&findPlaylist(media,id)?.videos?.length){renderMediaSection(lastOverlay,activeTeacher);return;}
  const section=lastOverlay.querySelector<HTMLElement>(".teachers-v2-media-section");
  const grid=section?.querySelector<HTMLElement>("#teachersV2PlaylistGrid");
  if(grid)grid.innerHTML='<div class="teachers-v2-media-loading"><i></i><span>Playlist videoları yükleniyor…</span></div>';
  if(!stateFor(activeTeacher)&&manifestMediaFor(activeTeacher)?.archiveIndex)await loadArchiveIndex(activeTeacher,false);
  if(!lastOverlay||!document.contains(lastOverlay)||!activeTeacher)return;
  media=mediaFor(activeTeacher);if(media)renderMediaSection(lastOverlay,activeTeacher);
}
async function ensurePlaylistArchive():Promise<void>{
  if(!activeTeacher||!lastOverlay||stateFor(activeTeacher)||!manifestMediaFor(activeTeacher)?.archiveIndex)return;
  await loadArchiveIndex(activeTeacher,false);
  if(lastOverlay&&document.contains(lastOverlay)){const media=mediaFor(activeTeacher),section=lastOverlay.querySelector<HTMLElement>(".teachers-v2-media-section");if(media&&section)updatePlaylistGrid(section,media);}
}
function statusHtml(media:TeacherMedia|null):string{
  if(!media)return `<span class="teachers-v2-media-dot pending"></span>Bu hoca için video akışı henüz eşleşmedi`;
  const loaded=media.videos.length,total=Math.max(loaded,Number(media.videoCount||0)),seen=watchedCount(media),date=formatDate(media.refreshedAt||feed?.generatedAt),more=hasMoreArchive(media.name);
  return `<span class="teachers-v2-media-dot ${loaded?"ok":"pending"}"></span>${loaded?`${total} video · ${loaded} yüklendi · ${seen} izlendi${more?" · arşiv sayfalı":""}${date?` · ${date}`:""}`:"Video akışı bekleniyor"}`;
}
function moreButtonState(media:TeacherMedia,filtered:MediaVideo[],visible:MediaVideo[]):{hidden:boolean;text:string}{
  const localLeft=Math.max(0,filtered.length-visible.length),remote=hasMoreArchive(media.name);
  if(localLeft>0)return {hidden:false,text:`Daha fazla göster (${localLeft} yüklü video)`};
  if(remote)return {hidden:false,text:"Arşivden daha fazla video yükle"};
  return {hidden:true,text:"Tüm videolar yüklendi"};
}
function updateVideoGrid(section:HTMLElement,media:TeacherMedia):void{
  const filtered=filteredVideos(media),visible=filtered.slice(0,visibleLimit),grid=section.querySelector<HTMLElement>("#teachersV2VideoGrid");
  if(grid)grid.innerHTML=videoCards(media,visible);
  const result=section.querySelector<HTMLElement>("#teachersV2VideoResult");if(result)result.textContent=`${visible.length} / ${filtered.length} yüklü sonuç · toplam ${Math.max(media.videos.length,Number(media.videoCount||0))}`;
  const more=section.querySelector<HTMLButtonElement>("#teachersV2LoadMore");if(more){const state=moreButtonState(media,filtered,visible);more.hidden=state.hidden;more.textContent=state.text;}
}
function renderMediaSection(overlay:HTMLElement,name:string):void{
  const section=[...overlay.querySelectorAll<HTMLElement>(".teachers-v2-section")].find(node=>node.querySelector("h3")?.textContent?.trim()==="Video merkezi"||node.classList.contains("teachers-v2-media-section"));if(!section)return;
  const media=mediaFor(name),seen=media?watchedCount(media):0,total=media?Math.max(media.videos.length,Number(media.videoCount||0)):0,filtered=media?filteredVideos(media):[],visible=filtered.slice(0,visibleLimit),manifest=manifestMediaFor(name),loading=Boolean(manifest?.archiveIndex&&!stateFor(name));
  const moreState=media?moreButtonState(media,filtered,visible):{hidden:true,text:""};
  section.classList.add("teachers-v2-media-section");
  section.innerHTML=`<div class="teachers-v2-section-head teachers-v2-media-head"><div><h3>Video arşivi</h3><span id="teachersV2MediaStatus" class="teachers-v2-media-status">${loading?'<span class="teachers-v2-media-dot pending"></span>Hoca arşivi sayfa sayfa yükleniyor…':statusHtml(media)}</span></div><div class="teachers-v2-media-head-actions"><button type="button" data-media-action="refresh">Yenile</button><button type="button" data-media-action="channel-videos">Kanalın tüm videoları</button></div></div>
    ${media&&total?`<div class="teachers-v2-media-progress" aria-label="İzleme ilerlemesi"><span><b>${seen}</b> izlendi</span><span>${Math.max(0,total-seen)} arşivde</span><span><b>${media.playlists.length}</b> playlist</span></div>`:""}
    <div class="teachers-v2-media-tools"><label class="teachers-v2-video-search"><span>⌕</span><input id="teachersV2VideoSearch" type="search" autocomplete="off" value="${esc(videoQuery)}" placeholder="Bu hocanın videolarında ara…" aria-label="Bu hocanın video arşivinde ara"></label><span id="teachersV2VideoResult" class="teachers-v2-video-result">${media?`${visible.length} / ${filtered.length} yüklü sonuç`:""}</span></div>
    <div class="teachers-v2-media-filters" role="tablist" aria-label="Video filtresi">${([['all','Tümü'],['tyt','TYT'],['ayt','AYT'],['deneme','Deneme'],['soru','Soru'],['kamp','Kamp / Seri'],['unwatched','İzlenmedi'],['watched','İzlendi']] as [FilterKind,string][]).map(([value,label])=>`<button type="button" class="${currentFilter===value?"on":""}" data-media-action="filter" data-filter="${value}" aria-pressed="${currentFilter===value?"true":"false"}">${label}</button>`).join("")}</div>
    <div id="teachersV2VideoGrid" class="teachers-v2-video-grid">${media?videoCards(media,visible):'<div class="teachers-v2-media-loading"><i></i><span>Video arşivi hazırlanıyor…</span></div>'}</div>
    <button id="teachersV2LoadMore" class="teachers-v2-load-more" type="button" data-media-action="more" ${moreState.hidden?"hidden":""}>${esc(moreState.text)}</button>
    ${media?playlistSection(media):'<div class="teachers-v2-media-skeleton"></div>'}
    <div class="teachers-v2-media-shortcuts"><button type="button" data-media-action="search" data-kind="tyt">YouTube'da TYT ara</button><button type="button" data-media-action="search" data-kind="ayt">AYT ara</button><button type="button" data-media-action="search" data-kind="soru">Soru çözümü</button><button type="button" data-media-action="search" data-kind="deneme">Deneme</button><button type="button" data-media-action="playlist-search">Playlist ara</button></div>`;
  const search=section.querySelector<HTMLInputElement>("#teachersV2VideoSearch");search?.addEventListener("input",()=>{videoQuery=search.value;visibleLimit=PAGE_SIZE;const fresh=mediaFor(name);if(fresh)updateVideoGrid(section,fresh);});
  const playlistSearch=section.querySelector<HTMLInputElement>("#teachersV2PlaylistSearch");
  playlistSearch?.addEventListener("focus",()=>{void ensurePlaylistArchive();});
  playlistSearch?.addEventListener("input",()=>{playlistQuery=playlistSearch.value;activePlaylistId="";const fresh=mediaFor(name);if(fresh)updatePlaylistGrid(section,fresh);void ensurePlaylistArchive();});
}
async function refreshOverlayMedia(overlay:HTMLElement,name:string,force=false):Promise<void>{
  const status=overlay.querySelector<HTMLElement>("#teachersV2MediaStatus");if(status)status.innerHTML='<span class="teachers-v2-media-dot pending"></span>Arşiv yenileniyor…';
  await loadFeed(force);if(!document.contains(overlay)||activeTeacher!==name)return;renderMediaSection(overlay,name);
  if(force)archiveStates.delete(keyFor(name));await loadArchiveIndex(name,force);if(!document.contains(overlay)||activeTeacher!==name)return;renderMediaSection(overlay,name);
}
function openExternal(url:string):void{if(url)window.open(url,"_blank","noopener,noreferrer");}
function openPlayer(videoId:string,title:string):void{
  if(!videoId)return;document.getElementById(PLAYER_ID)?.remove();const player=document.createElement("div");player.id=PLAYER_ID;player.className="teachers-v2-player-overlay";player.setAttribute("role","dialog");player.setAttribute("aria-modal","true");player.setAttribute("aria-label",title||"YouTube videosu");
  const embed=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
  player.innerHTML=`<div class="teachers-v2-player"><div class="teachers-v2-player-head"><b>${esc(title||"Video")}</b><div><button type="button" data-player-action="youtube">YouTube'da aç</button><button type="button" data-player-action="close">Kapat</button></div></div><div class="teachers-v2-player-frame"><iframe src="${embed}" title="${esc(title||"YouTube videosu")}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
  player.addEventListener("click",event=>{if(event.target===player){player.remove();return;}const action=(event.target as HTMLElement|null)?.closest<HTMLElement>("[data-player-action]")?.dataset.playerAction;if(action==="close")player.remove();if(action==="youtube")openExternal(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`);});document.body.appendChild(player);
}
async function loadMoreForCurrent():Promise<void>{
  if(!activeTeacher||!lastOverlay)return;let media=mediaFor(activeTeacher);if(!media)return;const section=lastOverlay.querySelector<HTMLElement>(".teachers-v2-media-section");if(!section)return;
  const before=filteredVideos(media).length;
  if(visibleLimit<before){visibleLimit+=PAGE_SIZE;updateVideoGrid(section,media);return;}
  if(!hasMoreArchive(activeTeacher))return;
  const more=section.querySelector<HTMLButtonElement>("#teachersV2LoadMore");if(more){more.disabled=true;more.textContent="Arşiv yükleniyor…";}
  let tries=0,after=before;
  while(hasMoreArchive(activeTeacher)&&after<=before&&tries<4){await loadNextArchivePage(activeTeacher,false);tries++;media=mediaFor(activeTeacher);after=media?filteredVideos(media).length:after;}
  media=mediaFor(activeTeacher);visibleLimit+=PAGE_SIZE;if(media)renderMediaSection(lastOverlay,activeTeacher);
}
async function ensureFilterResults():Promise<void>{
  if(!activeTeacher||!lastOverlay||currentFilter==="all")return;let media=mediaFor(activeTeacher);if(!media)return;let count=filteredVideos(media).length,tries=0;
  while(count<PAGE_SIZE&&hasMoreArchive(activeTeacher)&&tries<5){await loadNextArchivePage(activeTeacher,false);tries++;media=mediaFor(activeTeacher);count=media?filteredVideos(media).length:count;}
  if(media&&document.contains(lastOverlay))renderMediaSection(lastOverlay,activeTeacher);
}
function handleMediaClick(event:MouseEvent):void{
  const target=event.target as HTMLElement|null,action=target?.closest<HTMLElement>("[data-media-action]");if(!action||!activeTeacher)return;const media=mediaFor(activeTeacher),type=action.dataset.mediaAction||"";
  if(type==="filter"){
    const value=action.dataset.filter as FilterKind|undefined;if(value&&["all","tyt","ayt","soru","deneme","kamp","watched","unwatched"].includes(value))currentFilter=value;visibleLimit=PAGE_SIZE;
    const section=lastOverlay?.querySelector<HTMLElement>(".teachers-v2-media-section");if(section&&media)updateVideoGrid(section,media);void ensureFilterResults();return;
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
  const heading=overlay.querySelector(".teachers-v2-profile h2")?.textContent?.trim();if(!heading)return;activeTeacher=heading;currentFilter="all";videoQuery="";playlistQuery="";activePlaylistId="";visibleLimit=PAGE_SIZE;lastOverlay=overlay;overlay.removeEventListener("click",handleMediaClick);overlay.addEventListener("click",handleMediaClick);renderMediaSection(overlay,heading);void refreshOverlayMedia(overlay,heading,false);
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
  void loadFeed(false).then(()=>{decorateCards();scan();});observer=new MutationObserver(scan);observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&document.getElementById(PLAYER_ID))document.getElementById(PLAYER_ID)?.remove();});
  window.addEventListener("online",()=>{void loadFeed(true).then(()=>{decorateCards();scan();});});window.addEventListener("storage",event=>{if(event.key==="yks")refreshWatchedUi();});document.documentElement.dataset.teachersV2Media="ready";scan();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
export {};
