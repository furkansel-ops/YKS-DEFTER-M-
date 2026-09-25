type KnownTeacherSource={subject:string;channelId:string;channelName:string};
type LegacyTeacher={a?:string;own?:boolean};
type LegacyWindow=Window&{allTeachers?:()=>LegacyTeacher[]};

const KNOWN_SOURCES:Record<string,KnownTeacherSource>={
  ferrum:{subject:"Kimya",channelId:"UC0yco2kB3xW3WI__8E8HaKw",channelName:"Ferrum"}
};

const legacy=window as LegacyWindow;
let observer:MutationObserver|null=null;

function norm(value:unknown):string{
  return String(value??"")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g," ")
    .trim();
}

function esc(value:unknown):string{
  return String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function isOwnTeacher(name:string):boolean{
  try{
    const rows=legacy.allTeachers?.();
    return Array.isArray(rows)&&rows.some(item=>item?.a===name&&item.own===true);
  }catch{return false;}
}

function subjectFor(overlay:HTMLElement,known:KnownTeacherSource|null):string{
  if(known?.subject)return known.subject;
  return overlay.querySelector<HTMLElement>(".teachers-v2-profile .teachers-v2-subject")?.textContent?.trim()||"YKS";
}

function youtubeSearchUrl(name:string,subject:string,kind=""):string{
  const suffix:Record<string,string>={
    channel:"",
    tyt:"TYT konu anlatımı",
    ayt:"AYT konu anlatımı",
    soru:"soru çözümü",
    deneme:"deneme branş çözümü",
    playlist:"oynatma listesi"
  };
  const url=new URL("https://www.youtube.com/results");
  url.searchParams.set("search_query",[name,subject,suffix[kind]??"YKS"].filter(Boolean).join(" "));
  if(kind==="playlist")url.searchParams.set("sp","EgIQAw==");
  return url.toString();
}

function waitingForMatch(section:HTMLElement):boolean{
  const status=section.querySelector<HTMLElement>("#teachersV2MediaStatus")?.textContent||"";
  const grid=section.querySelector<HTMLElement>("#teachersV2VideoGrid")?.textContent||"";
  return status.includes("video akışı henüz eşleşmedi")||grid.includes("Video arşivi hazırlanıyor");
}

function patchOverlay(overlay:HTMLElement):void{
  const name=overlay.querySelector<HTMLElement>(".teachers-v2-profile h2")?.textContent?.trim()||"";
  if(!name||!isOwnTeacher(name))return;
  const section=overlay.querySelector<HTMLElement>(".teachers-v2-media-section");
  if(!section||section.dataset.mediaBrowser==="restored"||!waitingForMatch(section))return;

  const known=KNOWN_SOURCES[norm(name)]||null;
  const subject=subjectFor(overlay,known);
  const status=section.querySelector<HTMLElement>("#teachersV2MediaStatus");
  const tools=section.querySelector<HTMLElement>(".teachers-v2-media-tools");
  const filters=section.querySelector<HTMLElement>(".teachers-v2-media-filters");
  const grid=section.querySelector<HTMLElement>("#teachersV2VideoGrid");
  const playlistHead=section.querySelector<HTMLElement>(".teachers-v2-playlist-head");
  const playlistGrid=section.querySelector<HTMLElement>("#teachersV2PlaylistGrid");

  if(status){
    status.innerHTML=known
      ?`<span class="teachers-v2-media-dot ok"></span>${esc(known.channelName)} kanalı hazır · arşiv yalnız istersen yüklenir`
      :'<span class="teachers-v2-media-dot pending"></span>Kendi hocan · hızlı erişim hazır, arşiv yalnız istersen yüklenir';
  }
  tools?.setAttribute("hidden","");
  filters?.setAttribute("hidden","");
  playlistHead?.setAttribute("hidden","");
  playlistGrid?.setAttribute("hidden","");

  if(grid){
    const channelUrl=known?`https://www.youtube.com/channel/${known.channelId}/videos`:youtubeSearchUrl(name,subject,"channel");
    grid.innerHTML=`<div class="teachers-v2-media-empty teachers-v2-custom-fast">
      <b>${known?`${esc(known.channelName)} için doğrudan kanal hazır.`:"Bu hoca kendi listende."}</b>
      <span>Arşivi beklemeden ${esc(subject)} sonuçlarına gidebilir, istersen tam YKS Defterim arşivini sonradan yükleyebilirsin.</span>
      <div class="teachers-v2-media-shortcuts">
        <button type="button" data-custom-fast-url="${esc(channelUrl)}">Kanal / videolar</button>
        <button type="button" data-custom-fast-url="${esc(youtubeSearchUrl(name,subject,"tyt"))}">TYT ${esc(subject)}</button>
        <button type="button" data-custom-fast-url="${esc(youtubeSearchUrl(name,subject,"ayt"))}">AYT ${esc(subject)}</button>
        <button type="button" data-custom-fast-url="${esc(youtubeSearchUrl(name,subject,"soru"))}">Soru çözümü</button>
        <button type="button" data-custom-fast-url="${esc(youtubeSearchUrl(name,subject,"playlist"))}">Playlist</button>
        <button type="button" data-media-action="refresh">YKS arşivini yükle</button>
      </div>
    </div>`;
  }
}

function scan():void{
  const overlay=document.getElementById("teachersV2Overlay") as HTMLElement|null;
  if(overlay)patchOverlay(overlay);
}

function install():void{
  document.addEventListener("click",event=>{
    const node=(event.target as HTMLElement|null)?.closest<HTMLElement>("[data-custom-fast-url]");
    const url=node?.dataset.customFastUrl;
    if(!url)return;
    window.open(url,"_blank","noopener,noreferrer");
  });
  observer=new MutationObserver(()=>window.setTimeout(scan,0));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  scan();
  document.documentElement.dataset.teachersV2CustomFast="ready";
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();

export {};
