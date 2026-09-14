type LegacyTeacher={
  a?:string;
  d?:string[];
};

type LegacyVideo={
  id?:string;
  title?:string;
  ch?:string;
  thumb?:string;
  date?:string;
};

type TeacherCardRenderer=(teacher:LegacyTeacher)=>string;
type TeacherListRenderer=()=>void;
type LegacyWindow={
  teacherCard?:TeacherCardRenderer;
  renderTeachers?:TeacherListRenderer;
  resolveChannel?:(teacher:string)=>Promise<string>;
  ytFetch?:(query:string,options?:Record<string,string>)=>Promise<LegacyVideo[]>;
  ytTeacher?:(teacher:string,kind:string,subject:string)=>unknown;
};

const legacyWindow=window as unknown as LegacyWindow;
const STYLE_ID="yks-teacher-videos-style";
const PLAYER_ID="yks-teacher-video-player";
const cache=new Map<string,LegacyVideo[]>();
const loading=new Set<string>();

function esc(value:unknown):string{
  return String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function injectStyles():void{
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement("style");
  style.id=STYLE_ID;
  style.textContent=`
.teacher-video-strip{margin-top:18px;padding-top:16px;border-top:.5px solid var(--sep,rgba(127,127,127,.25))}
.teacher-video-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
.teacher-video-head strong{font-size:16px;color:var(--label,#111)}
.teacher-video-head-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
.teacher-video-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
.teacher-video-item{appearance:none;-webkit-appearance:none;width:100%;border:.5px solid var(--sep,rgba(127,127,127,.25));background:var(--glass,rgba(255,255,255,.7));border-radius:14px;padding:0;overflow:hidden;text-align:left;color:inherit;cursor:pointer;box-shadow:var(--shadow-1,0 2px 10px rgba(0,0,0,.05));transition:transform .12s ease,border-color .12s ease}
.teacher-video-item:active{transform:scale(.985)}
.teacher-video-thumb{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:rgba(127,127,127,.14)}
.teacher-video-fallback{display:grid;place-items:center;width:100%;aspect-ratio:16/9;background:rgba(127,127,127,.12);font-size:30px}
.teacher-video-copy{display:block;padding:10px 11px 11px}
.teacher-video-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13.5px;font-weight:700;line-height:1.35;color:var(--label,#111)}
.teacher-video-meta{display:block;margin-top:5px;font-size:11.5px;line-height:1.3;color:var(--label-3,#777);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.teacher-video-state{padding:14px;border-radius:12px;background:rgba(127,127,127,.08);font-size:13px;line-height:1.45;color:var(--label-2,#555)}
.teacher-video-player{position:fixed;inset:0;z-index:950;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.72);backdrop-filter:blur(12px)}
.teacher-video-player-card{width:min(920px,100%);max-height:calc(100dvh - 36px);overflow:auto;border-radius:18px;background:var(--bg,#111);box-shadow:0 24px 80px rgba(0,0,0,.38)}
.teacher-video-player-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px}
.teacher-video-player-top strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--label,#fff)}
.teacher-video-player-frame{display:block;width:100%;aspect-ratio:16/9;border:0;background:#000}
.teacher-video-player-actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 14px}
@media(max-width:620px){.teacher-video-grid{grid-template-columns:1fr 1fr}.teacher-video-head{align-items:flex-start}.teacher-video-item{border-radius:12px}.teacher-video-copy{padding:8px}.teacher-video-title{font-size:12.5px}}
@media(max-width:430px){.teacher-video-grid{grid-template-columns:1fr}}
`;
  document.head.appendChild(style);
}

function stripMarkup(teacher:string,subject:string):string{
  return `<section class="teacher-video-strip" data-teacher="${esc(teacher)}" data-subject="${esc(subject)}" aria-label="${esc(teacher)} son videoları">
    <div class="teacher-video-head">
      <strong>Son videolar</strong>
      <span class="teacher-video-head-actions">
        <button class="btn ghost tiny teacher-video-all" type="button">Tüm videolar</button>
        <button class="btn ghost tiny teacher-video-refresh" type="button">Yenile</button>
      </span>
    </div>
    <div class="teacher-video-grid"><div class="teacher-video-state">Videolar hazırlanıyor…</div></div>
  </section>`;
}

function videoKey(teacher:string,subject:string):string{
  return `${teacher}\u0000${subject}`;
}

function validVideos(items:LegacyVideo[]):LegacyVideo[]{
  const seen=new Set<string>();
  return items.filter((item)=>{
    const id=String(item.id??"").trim();
    if(!id||seen.has(id))return false;
    seen.add(id);
    return true;
  }).slice(0,6);
}

async function fetchTeacherVideos(teacher:string,subject:string,force=false):Promise<LegacyVideo[]>{
  const key=videoKey(teacher,subject);
  if(force)cache.delete(key);
  const prior=cache.get(key);
  if(prior)return prior;
  const fetcher=legacyWindow.ytFetch;
  if(typeof fetcher!=="function")throw new Error("Video servisi henüz hazır değil");

  let channelId="";
  if(typeof legacyWindow.resolveChannel==="function"){
    try{channelId=await legacyWindow.resolveChannel(teacher);}catch{channelId="";}
  }
  const query=channelId
    ?(`${subject||"YKS"} YKS`.replace(/\s+/g," ").trim())
    :(`${teacher} ${subject} YKS`.replace(/\s+/g," ").trim());
  const options:Record<string,string>={};
  if(channelId)options.channelId=channelId;
  const result=validVideos(await fetcher(query,options));
  cache.set(key,result);
  return result;
}

function formatDate(value:string|undefined):string{
  if(!value)return "";
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return "";
  return date.toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"});
}

function closePlayer():void{
  document.getElementById(PLAYER_ID)?.remove();
}

function openPlayer(video:LegacyVideo):void{
  closePlayer();
  const id=String(video.id??"").replace(/[^A-Za-z0-9_-]/g,"");
  if(!id)return;
  const overlay=document.createElement("div");
  overlay.id=PLAYER_ID;
  overlay.className="teacher-video-player";
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.innerHTML=`<div class="teacher-video-player-card">
    <div class="teacher-video-player-top"><strong>${esc(video.title||"Video")}</strong><button class="btn ghost tiny teacher-video-close" type="button">Kapat</button></div>
    <iframe class="teacher-video-player-frame" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="${esc(video.title||"YouTube videosu")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    <div class="teacher-video-player-actions"><button class="btn ghost tiny teacher-video-youtube" type="button">YouTube'da aç</button></div>
  </div>`;
  overlay.addEventListener("click",(event)=>{if(event.target===overlay)closePlayer();});
  overlay.querySelector<HTMLButtonElement>(".teacher-video-close")?.addEventListener("click",closePlayer);
  overlay.querySelector<HTMLButtonElement>(".teacher-video-youtube")?.addEventListener("click",()=>{
    window.open(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,"_blank","noopener,noreferrer");
  });
  document.body.appendChild(overlay);
}

function renderVideos(host:HTMLElement,items:LegacyVideo[]):void{
  const grid=host.querySelector<HTMLElement>(".teacher-video-grid");
  if(!grid)return;
  if(!items.length){
    grid.innerHTML='<div class="teacher-video-state">Bu hoca için video bulunamadı. “Tüm videolar” ile geniş aramayı açabilirsin.</div>';
    return;
  }
  grid.innerHTML="";
  items.forEach((video)=>{
    const button=document.createElement("button");
    button.type="button";
    button.className="teacher-video-item";
    const meta=[video.ch,formatDate(video.date)].filter(Boolean).join(" · ");
    button.innerHTML=`${video.thumb?`<img class="teacher-video-thumb" src="${esc(video.thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'<span class="teacher-video-fallback">▶</span>'}<span class="teacher-video-copy"><span class="teacher-video-title">${esc(video.title||"YouTube videosu")}</span><span class="teacher-video-meta">${esc(meta||"YouTube")}</span></span>`;
    button.addEventListener("click",(event)=>{event.stopPropagation();openPlayer(video);});
    grid.appendChild(button);
  });
}

async function hydrate(host:HTMLElement,force=false):Promise<void>{
  const teacher=host.dataset.teacher?.trim()??"";
  const subject=host.dataset.subject?.trim()??"";
  if(!teacher)return;
  const key=videoKey(teacher,subject);
  host.querySelector<HTMLButtonElement>(".teacher-video-all")?.addEventListener("click",(event)=>{
    event.stopPropagation();
    if(typeof legacyWindow.ytTeacher==="function")legacyWindow.ytTeacher(teacher,"kanal",subject);
    else window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${teacher} ${subject} YKS`)}`,"_blank","noopener,noreferrer");
  },{once:true});
  host.querySelector<HTMLButtonElement>(".teacher-video-refresh")?.addEventListener("click",(event)=>{
    event.stopPropagation();
    void hydrate(host,true);
  },{once:true});

  if(loading.has(key)&&!force)return;
  loading.add(key);
  const grid=host.querySelector<HTMLElement>(".teacher-video-grid");
  if(grid)grid.innerHTML='<div class="teacher-video-state">Videolar getiriliyor…</div>';
  try{
    renderVideos(host,await fetchTeacherVideos(teacher,subject,force));
    host.dataset.videoState="ready";
  }catch(error){
    const message=error instanceof Error?error.message:String(error);
    if(grid)grid.innerHTML=`<div class="teacher-video-state">Videolar şu anda alınamadı: ${esc(message)}<br>“Tüm videolar” ile YouTube aramasını açabilirsin.</div>`;
    host.dataset.videoState="error";
  }finally{
    loading.delete(key);
  }
}

function hydrateOpenTeacher():void{
  const host=document.querySelector<HTMLElement>(".thcard.open .teacher-video-strip");
  if(host&&!host.dataset.hydrated){
    host.dataset.hydrated="1";
    void hydrate(host);
  }
}

export function installTeacherVideos():{installed:boolean}{
  injectStyles();
  const originalTeacherCard=legacyWindow.teacherCard;
  const originalRenderTeachers=legacyWindow.renderTeachers;
  if(typeof originalTeacherCard!=="function"||typeof originalRenderTeachers!=="function"){
    document.documentElement.dataset.teacherVideos="legacy-missing";
    return {installed:false};
  }
  if(document.documentElement.dataset.teacherVideos==="ready")return {installed:true};

  legacyWindow.teacherCard=(teacher:LegacyTeacher):string=>{
    const html=originalTeacherCard(teacher);
    if(!/class="thcard[^\"]*\bopen\b/u.test(html)||html.includes("teacher-video-strip"))return html;
    const teacherName=String(teacher.a??"").trim();
    const subject=String(teacher.d?.[0]??"").trim();
    const marker=stripMarkup(teacherName,subject);
    const lastClose=html.lastIndexOf("</div>");
    return lastClose>=0?`${html.slice(0,lastClose)}${marker}${html.slice(lastClose)}`:`${html}${marker}`;
  };

  legacyWindow.renderTeachers=():void=>{
    originalRenderTeachers();
    queueMicrotask(hydrateOpenTeacher);
  };

  document.addEventListener("keydown",(event)=>{if(event.key==="Escape")closePlayer();});
  document.documentElement.dataset.teacherVideos="ready";
  queueMicrotask(()=>{
    legacyWindow.renderTeachers?.();
    hydrateOpenTeacher();
  });
  return {installed:true};
}

export {};
