import "./teachers-v2.css";
import "./teachers-restored.css";

type TeacherLevel="baslangic"|"orta"|"ileri"|"hepsi"|string;
type Teacher={
  a:string;
  d:string[];
  l:TeacherLevel;
  n?:string;
  t?:string[];
  own?:boolean;
  id?:number;
};

type LegacyWindow=Window&{
  allTeachers?:()=>Teacher[];
  toggleFavTeacher?:(name:string)=>void;
  delTeacher?:(id:number)=>void;
  toast?:(message:string)=>void;
  closeDayPick?:()=>void;
  closePlayer?:()=>void;
};

type TeachersV2State={
  query:string;
  subject:string;
  level:string;
  favOnly:boolean;
  openName:string;
};

const legacy=window as LegacyWindow;
const ROOT_ID="teachersV2Root";
const OVERLAY_ID="teachersV2Overlay";
const PREF_KEY="yks_teachers_v2_prefs";
const LEVEL_LABELS:Record<string,string>={
  baslangic:"Başlangıç",
  orta:"Orta",
  ileri:"İleri",
  hepsi:"Her seviye"
};
const TYPE_LABELS:Record<string,string>={
  konu:"Konu anlatımı",
  soru:"Soru çözümü",
  deneme:"Deneme",
  kanal:"Kanal"
};

let legacyList:HTMLElement|null=null;
let listObserver:MutationObserver|null=null;
let refreshTimer=0;
let lastSyncSignature="";
let mounted=false;
let modalObserver:MutationObserver|null=null;
let previousModal:HTMLElement|null=null;
let modalTrigger:HTMLElement|null=null;
const modalReturn=new WeakMap<HTMLElement,{node:HTMLElement|null;selector:string}>();

function visible(node:HTMLElement|null):node is HTMLElement{return Boolean(node?.isConnected&&!node.hidden&&node.getClientRects().length);}
function topModal():HTMLElement|null{
  for(const id of ["teachersV2MediaPlayer","playOverlay","dayPick",OVERLAY_ID]){
    const node=document.getElementById(id);if(visible(node))return node;
  }
  return null;
}
function focusable(node:HTMLElement):HTMLElement[]{return [...node.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href],summary,iframe,[tabindex="0"]')].filter(node=>visible(node)&&node.tabIndex>=0);}
function returnSelector(node:HTMLElement|null):string{
  if(!node)return "";
  if(node.id)return '#'+CSS.escape(node.id);
  const attrs=["data-media-action","data-video-id","data-playlist-id","data-detail-action","data-action","data-name","data-library-action"];
  const selector=attrs.filter(key=>node.hasAttribute(key)).map(key=>'['+key+'="'+CSS.escape(node.getAttribute(key)||"")+'"]');
  return selector.length?selector.join(""):"";
}
function syncModalFocus():void{
  const next=topModal();if(next===previousModal)return;
  const old=previousModal;previousModal=next;
  const closing=old&&!visible(old),saved=closing?modalReturn.get(old):undefined;
  if(closing)modalReturn.delete(old);
  if(next&&!modalReturn.has(next)){
    const trigger=visible(modalTrigger)?modalTrigger:(document.activeElement instanceof HTMLElement?document.activeElement:null);
    modalReturn.set(next,{node:trigger,selector:returnSelector(trigger)});
    next.setAttribute("role","dialog");next.setAttribute("aria-modal","true");
    if(next.id==="dayPick")next.setAttribute("aria-label","Programa eklenecek günü seç");
  }
  modalTrigger=null;
  const remembered=saved?.node;
  const replacement=saved?.selector?document.querySelector<HTMLElement>(saved.selector):null;
  const target=visible(remembered||null)?remembered:visible(replacement)?replacement:next?focusable(next)[0]:null;
  if(target&&(!next||next.contains(target)))target.focus({preventScroll:true});
  else if(next)focusable(next)[0]?.focus({preventScroll:true});
}
function rememberModalTrigger(event:MouseEvent):void{
  modalTrigger=(event.target as HTMLElement|null)?.closest<HTMLElement>('button,[role="button"],a')||null;
}
function handleModalKeys(event:KeyboardEvent):void{
  const top=topModal();if(!top)return;
  if(event.key==="Escape"){
    event.preventDefault();event.stopImmediatePropagation();
    if(top.id==="dayPick")legacy.closeDayPick?.();
    else if(top.id==="playOverlay")legacy.closePlayer?.();
    else if(top.id===OVERLAY_ID)closeDetail();
    else top.remove();
    syncModalFocus();return;
  }
  if(event.key==="Tab"){
    const items=focusable(top),first=items[0],last=items[items.length-1];
    if(!first){event.preventDefault();return;}
    if(!top.contains(document.activeElement)||(!event.shiftKey&&document.activeElement===last)){
      event.preventDefault();first.focus();
    }else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  }
}
function installModalFocus():void{
  document.addEventListener("click",rememberModalTrigger,true);
  document.addEventListener("keydown",handleModalKeys,true);
  modalObserver=new MutationObserver(syncModalFocus);
  modalObserver.observe(document.body,{childList:true});
  for(const id of ["dayPick","playOverlay"]){const node=document.getElementById(id);if(node)modalObserver.observe(node,{attributes:true,attributeFilter:["style","hidden"]});}
}


const state:TeachersV2State={query:"",subject:"",level:"",favOnly:false,openName:""};

function esc(value:unknown):string{return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function norm(value:unknown):string{return String(value??"").toLocaleLowerCase("tr-TR").replace(/\s+/g," ").trim();}
function readYksState():Record<string,unknown>{try{const raw=localStorage.getItem("yks"),parsed=raw?JSON.parse(raw):{};return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:{};}catch{return {};}}
function readPrefs():void{try{const raw=localStorage.getItem(PREF_KEY);if(!raw)return;const pref=JSON.parse(raw) as Partial<TeachersV2State>;if(typeof pref.subject==="string")state.subject=pref.subject;if(typeof pref.level==="string")state.level=pref.level;if(typeof pref.favOnly==="boolean")state.favOnly=pref.favOnly;}catch{}}
function savePrefs():void{try{localStorage.setItem(PREF_KEY,JSON.stringify({subject:state.subject,level:state.level,favOnly:state.favOnly}));}catch{}}
function favoriteNames():Set<string>{const stored=readYksState(),fav=Array.isArray(stored.favTeachers)?stored.favTeachers:[];return new Set(fav.map(String));}
function currentTeachers():Teacher[]{try{const rows=legacy.allTeachers?.();if(!Array.isArray(rows))return [];return rows.filter((item):item is Teacher=>!!item&&typeof item.a==="string"&&Array.isArray(item.d));}catch{return [];}}
function syncSignature():string{const stored=readYksState(),fav=Array.isArray(stored.favTeachers)?stored.favTeachers:[],own=Array.isArray(stored.teachers)?stored.teachers:[];return JSON.stringify([fav,own]);}
function initials(name:string):string{const parts=name.trim().split(/\s+/).filter(Boolean),first=parts[0]??"",last=parts[parts.length-1]??first;if(!first)return "YK";if(parts.length===1)return first.slice(0,2).toLocaleUpperCase("tr-TR");return ((first[0]??"")+(last[0]??"")).toLocaleUpperCase("tr-TR");}
function subjectLabel(subject:string):string{const value=String(subject||"").trim();if(!value)return "Tüm dersler";const ayt=value.match(/^(.+?)\s*\(AYT\)$/i);if(ayt)return `AYT ${ayt[1]}`;if(["Matematik","Geometri","Fizik","Kimya","Biyoloji","Tarih","Coğrafya","Türkçe","Felsefe","Din Kültürü"].includes(value))return `TYT ${value}`;if(value==="Edebiyat")return "AYT Edebiyat";return value;}
function subjects(teachers:Teacher[]):string[]{const values=new Set<string>();teachers.forEach(t=>t.d.forEach(s=>{if(s)values.add(String(s));}));return [...values].sort((a,b)=>subjectLabel(a).localeCompare(subjectLabel(b),"tr"));}
function filteredTeachers(teachers:Teacher[],favs:Set<string>):Teacher[]{const q=norm(state.query);return teachers.filter(t=>{if(state.subject&&!t.d.includes(state.subject))return false;if(state.level&&t.l!==state.level&&t.l!=="hepsi")return false;if(state.favOnly&&!favs.has(t.a))return false;if(q){const hay=norm([t.a,t.n||"",...t.d].join(" "));if(!hay.includes(q))return false;}return true;}).sort((a,b)=>{const af=favs.has(a.a)?0:1,bf=favs.has(b.a)?0:1;if(af!==bf)return af-bf;return a.a.localeCompare(b.a,"tr");});}
function cardHtml(t:Teacher,favs:Set<string>):string{
  const favorite=favs.has(t.a),content=(t.t&&t.t.length?t.t:["konu","soru"]).slice(0,2),level=LEVEL_LABELS[t.l]||"Her seviye";
  return `<article class="teachers-v2-card" data-action="open" data-name="${esc(t.a)}" tabindex="0" role="button" aria-label="${esc(t.a)} kaynaklarını aç">
    <div class="teachers-v2-card-main">
      <div class="teachers-v2-avatar" aria-hidden="true">${esc(initials(t.a))}</div>
      <div class="teachers-v2-card-copy">
        <div class="teachers-v2-card-title-row"><div class="teachers-v2-name">${esc(t.a)}</div><span class="teachers-v2-level" data-level="${esc(t.l)}">${esc(level)}</span></div>
        <div class="teachers-v2-card-subjects">${t.d.slice(0,3).map(s=>`<span>${esc(subjectLabel(s))}</span>`).join("")}</div>
      </div>
      <button class="teachers-v2-star ${favorite?"on":""}" type="button" data-action="favorite" data-name="${esc(t.a)}" aria-pressed="${favorite}" aria-label="${favorite?"Favorilerden çıkar":"Favoriye ekle"}">★</button>
    </div>
    <p class="teachers-v2-note">${esc(t.n||"Konu anlatımı ve soru çözümü kaynaklarını görüntüle.")}</p>
    <div class="teachers-v2-card-foot"><span>${content.map(x=>esc(TYPE_LABELS[x]||x)).join(" · ")}${t.own?" · Senin hocan":""}</span><b>Kaynakları aç →</b></div>
  </article>`;
}
function hideLegacyTeacherSurface(list:HTMLElement):HTMLElement{
  const hide=(node:Element|null)=>{if(node instanceof HTMLElement){node.hidden=true;node.dataset.teachersV2LegacyHidden="1";}};
  for(const id of ["directPlaylistUrl","thSearch","tvSubject","tvSuggest","watchList","wsBox"]){
    const node=document.getElementById(id);if(!node)continue;const block=node.closest(".card")||node;hide(block);if(block.previousElementSibling?.tagName==="H2")hide(block.previousElementSibling);
  }
  let head=list.previousElementSibling as HTMLElement|null;while(head&&head.tagName!=="H2")head=head.previousElementSibling as HTMLElement|null;
  hide(head);hide(list);return head||list;
}
function restoreLegacyTeacherSurface():void{document.querySelectorAll<HTMLElement>("[data-teachers-v2-legacy-hidden]").forEach(node=>{node.hidden=false;delete node.dataset.teachersV2LegacyHidden;});}
function ensureRoot():HTMLElement|null{
  const list=document.getElementById("thList") as HTMLElement|null;if(!list)return null;
  legacyList=list;
  const mountBefore=hideLegacyTeacherSurface(list);
  list.hidden=true;list.setAttribute("aria-hidden","true");
  ["thSubjChips","thLvlChips","thInfo"].forEach(id=>{const node=document.getElementById(id) as HTMLElement|null;if(node)node.style.display="none";});
  let root=document.getElementById(ROOT_ID) as HTMLElement|null;
  if(!root){
    root=document.createElement("section");root.id=ROOT_ID;root.className="teachers-v2-root";root.setAttribute("aria-label","Hocalar ve videolar");
    (mountBefore?.parentNode||list.parentNode)?.insertBefore(root,mountBefore||list);
    buildShell(root);
  }
  return root;
}
function buildShell(root:HTMLElement):void{
  root.innerHTML=`<div class="teachers-v2-shell">
    <section class="teachers-v2-hero">
      <div class="teachers-v2-kicker">Kaynak merkezi</div>
      <div class="teachers-v2-hero-row">
        <div><h2 class="teachers-v2-title">Hocalar</h2><p class="teachers-v2-sub">Hocanı seç, serileri incele ve çalışacağın videoları programına ekle.</p></div>
        <div class="teachers-v2-meta"><span id="teachersV2Count">0 hoca</span><span id="teachersV2FavCount">0 favori</span></div>
      </div>
    </section>
    <section class="teachers-v2-controls" aria-label="Hoca filtreleri">
      <div class="teachers-v2-toolbar">
        <label class="teachers-v2-search"><span aria-hidden="true">⌕</span><input id="teachersV2Search" type="search" autocomplete="off" placeholder="Hoca veya ders ara" aria-label="Hocalarda ara"></label>
        <button id="teachersV2FavToggle" class="teachers-v2-fav-toggle" type="button" aria-pressed="false">★ Favorilerim</button>
      </div>
      <div class="teachers-v2-filter-block"><span>Ders</span><div id="teachersV2SubjectRow" class="teachers-v2-filter-row" aria-label="Ders filtresi"></div></div>
      <div class="teachers-v2-filter-block"><span>Seviye</span><div id="teachersV2LevelRow" class="teachers-v2-filter-row" aria-label="Seviye filtresi"></div></div>
    </section>
    <div class="teachers-v2-summary"><div><strong id="teachersV2ResultText"></strong><span id="teachersV2Sync" class="teachers-v2-sync"><i class="teachers-v2-sync-dot"></i><span>Hazır</span></span></div><button type="button" class="teachers-v2-reset" data-action="reset">Filtreleri temizle</button></div>
    <div id="teachersV2Grid" class="teachers-v2-grid"></div>
  </div>`;
  const search=root.querySelector("#teachersV2Search") as HTMLInputElement|null;
  search?.addEventListener("input",()=>{state.query=search.value;renderGrid();});
  root.querySelector("#teachersV2FavToggle")?.addEventListener("click",()=>{state.favOnly=!state.favOnly;savePrefs();renderAll();});
  root.addEventListener("click",handleRootClick);
  root.addEventListener("keydown",event=>{if(event.key!=="Enter"&&event.key!==" ")return;const target=event.target as HTMLElement|null,card=target?.closest<HTMLElement>(".teachers-v2-card[data-action='open']");if(card&&!target?.closest("button")){event.preventDefault();openDetail(card.dataset.name||"");}});
}
function renderSubjectRow(teachers:Teacher[]):void{const row=document.getElementById("teachersV2SubjectRow");if(!row)return;row.innerHTML=["",...subjects(teachers)].map(s=>`<button class="teachers-v2-chip ${state.subject===s?"on":""}" type="button" data-action="subject" data-value="${esc(s)}">${esc(subjectLabel(s))}</button>`).join("");}
function renderLevelRow():void{const row=document.getElementById("teachersV2LevelRow");if(!row)return;const levels:[[string,string],[string,string],[string,string],[string,string]]=[["","Tüm seviyeler"],["baslangic","Başlangıç"],["orta","Orta"],["ileri","İleri"]];row.innerHTML=levels.map(([value,label])=>`<button class="teachers-v2-chip ${state.level===value?"on":""}" type="button" data-action="level" data-value="${value}">${label}</button>`).join("");}
function renderGrid():void{
  const grid=document.getElementById("teachersV2Grid");if(!grid)return;
  const teachers=currentTeachers(),favs=favoriteNames(),list=filteredTeachers(teachers,favs);
  grid.innerHTML=list.length?list.map(t=>cardHtml(t,favs)).join(""):'<div class="teachers-v2-empty"><b>Bu filtrede hoca bulunamadı.</b><span>Ders, seviye veya arama filtresini değiştir.</span></div>';
  const result=document.getElementById("teachersV2ResultText");if(result)result.textContent=`${list.length} hoca gösteriliyor`;
  const count=document.getElementById("teachersV2Count");if(count)count.textContent=`${teachers.length} hoca`;
  const favCount=document.getElementById("teachersV2FavCount");if(favCount)favCount.textContent=`${favs.size} favori`;
  const reset=document.querySelector<HTMLButtonElement>(".teachers-v2-reset");if(reset)reset.hidden=!state.query&&!state.subject&&!state.level&&!state.favOnly;
}
function renderSyncStatus():void{const target=document.getElementById("teachersV2Sync");if(!target)return;const cloudText=document.getElementById("cloudSyncText")?.textContent?.trim(),online=navigator.onLine;target.classList.toggle("offline",!online);const text=target.querySelector("span");if(text)text.textContent=!online?"Çevrimdışı":(cloudText||"Bulut senkronu açık");}
function renderAll():void{const root=ensureRoot();if(!root)return;const teachers=currentTeachers();renderSubjectRow(teachers);renderLevelRow();const favToggle=document.getElementById("teachersV2FavToggle");favToggle?.classList.toggle("on",state.favOnly);favToggle?.setAttribute("aria-pressed",String(state.favOnly));renderGrid();renderSyncStatus();lastSyncSignature=syncSignature();}
function handleRootClick(event:MouseEvent):void{
  const target=event.target as HTMLElement|null;if(!target)return;const actionNode=target.closest<HTMLElement>("[data-action]");if(!actionNode)return;const action=actionNode.dataset.action||"";
  if(action==="subject"){state.subject=actionNode.dataset.value||"";savePrefs();renderAll();return;}
  if(action==="level"){state.level=actionNode.dataset.value||"";savePrefs();renderAll();return;}
  if(action==="favorite"){event.stopPropagation();toggleFavorite(actionNode.dataset.name||"");return;}
  if(action==="reset"){state.query="";state.subject="";state.level="";state.favOnly=false;savePrefs();const search=document.getElementById("teachersV2Search") as HTMLInputElement|null;if(search)search.value="";renderAll();return;}
  if(action==="open")openDetail(actionNode.dataset.name||"");
}
function toggleFavorite(name:string):void{if(!name)return;if(typeof legacy.toggleFavTeacher==="function"){try{legacy.toggleFavTeacher(name);}catch{}window.setTimeout(renderAll,50);window.setTimeout(renderAll,350);}}
function youtubeQuery(teacher:Teacher,kind:string):string{const subject=state.subject||teacher.d[0]||"YKS",suffix:Record<string,string>={channel:"",tyt:"TYT konu anlatımı",ayt:"AYT konu anlatımı",soru:"soru çözümü",deneme:"deneme branş çözümü"};return [teacher.a,subject,suffix[kind]??"YKS"].filter(Boolean).join(" ").replace(/\s+/g," ").trim();}
function openYoutubeSearch(teacher:Teacher,kind:string):void{const query=youtubeQuery(teacher,kind);window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,"_blank","noopener,noreferrer");}
function detailTeacher(name:string):Teacher|null{return currentTeachers().find(t=>t.a===name)||null;}
function closeDetail():void{document.getElementById(OVERLAY_ID)?.remove();document.body.classList.remove("teachers-v2-open");state.openName="";}
function openDetail(name:string):void{
  const teacher=detailTeacher(name);if(!teacher)return;closeDetail();state.openName=name;
  const fav=favoriteNames().has(name),overlay=document.createElement("div");overlay.id=OVERLAY_ID;overlay.className="teachers-v2-overlay";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-label",`${teacher.a} kaynakları`);
  overlay.innerHTML=`<section class="teachers-v2-detail">
    <div class="teachers-v2-detail-head"><div><small>Hoca kaynakları</small><strong>${esc(teacher.a)}</strong></div><button class="teachers-v2-close" type="button" data-detail-action="close" aria-label="Hoca detayını kapat">Kapat</button></div>
    <div class="teachers-v2-detail-body">
      <section class="teachers-v2-profile">
        <div class="teachers-v2-avatar" aria-hidden="true">${esc(initials(teacher.a))}</div>
        <div class="teachers-v2-profile-copy"><h2>${esc(teacher.a)}</h2><div class="teachers-v2-card-meta"><span class="teachers-v2-level" data-level="${esc(teacher.l)}">${esc(LEVEL_LABELS[teacher.l]||"Her seviye")}</span>${teacher.d.map(s=>`<span class="teachers-v2-subject">${esc(subjectLabel(s))}</span>`).join("")}</div><p>${esc(teacher.n||"Bu hocanın oynatma listelerini ve video arşivini aşağıdan inceleyebilirsin.")}</p></div>
        <button class="teachers-v2-detail-star ${fav?"on":""}" type="button" data-detail-action="favorite" aria-pressed="${fav}" aria-label="Favori durumunu değiştir">★</button>
      </section>
      <section class="teachers-v2-section teachers-v2-media-host"><div class="teachers-v2-section-head"><div><h3>Video merkezi</h3><span>Oynatma listeleri ve videolar hazırlanıyor</span></div></div><div class="teachers-v2-detail-loading"><i></i><span>Kaynaklar hazırlanıyor…</span></div></section>
      <details class="teachers-v2-quick-search"><summary>YouTube'da hızlı ara</summary><div><button type="button" data-detail-action="youtube" data-kind="channel">Kanalı bul</button><button type="button" data-detail-action="youtube" data-kind="tyt">TYT konu</button><button type="button" data-detail-action="youtube" data-kind="ayt">AYT konu</button><button type="button" data-detail-action="youtube" data-kind="soru">Soru çözümü</button></div></details>
      ${teacher.own&&Number.isFinite(teacher.id)?'<button class="teachers-v2-danger" type="button" data-detail-action="delete">Bu hocayı listemden sil</button>':""}
    </div>
  </section>`;
  overlay.addEventListener("click",event=>{if(event.target===overlay){closeDetail();return;}const target=event.target as HTMLElement|null,action=target?.closest<HTMLElement>("[data-detail-action]");if(!action)return;const type=action.dataset.detailAction||"";if(type==="close"){closeDetail();return;}if(type==="favorite"){toggleFavorite(teacher.a);window.setTimeout(()=>{const on=favoriteNames().has(teacher.a);action.classList.toggle("on",on);action.setAttribute("aria-pressed",String(on));},80);return;}if(type==="youtube"){openYoutubeSearch(teacher,action.dataset.kind||"");return;}if(type==="delete"&&teacher.own&&Number.isFinite(teacher.id)&&window.confirm(`${teacher.a} listenden silinsin mi?`)){try{legacy.delTeacher?.(teacher.id as number);}catch{}closeDetail();window.setTimeout(renderAll,80);}});
  document.body.appendChild(overlay);document.body.classList.add("teachers-v2-open");
}
function bindLegacyObserver():void{if(!legacyList)return;listObserver?.disconnect();listObserver=new MutationObserver(()=>window.setTimeout(renderAll,0));listObserver.observe(legacyList,{childList:true,subtree:true});}
function tick():void{const root=ensureRoot();if(root&&!mounted){mounted=true;bindLegacyObserver();renderAll();}if(root){const sig=syncSignature();if(sig!==lastSyncSignature)renderAll();else renderSyncStatus();}}
function installRuntime():void{readPrefs();installModalFocus();window.addEventListener("online",renderSyncStatus);window.addEventListener("offline",renderSyncStatus);window.addEventListener("storage",event=>{if(event.key==="yks")renderAll();});tick();refreshTimer=window.setInterval(tick,1000);document.documentElement.dataset.teachersV2="ready";}
export function installTeachersV2():{installed:boolean;version:string;refresh:()=>void;destroy:()=>void}{if(document.documentElement.dataset.teachersV2==="ready")return {installed:true,version:"2.0.0-alpha1",refresh:renderAll,destroy:()=>{}};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installRuntime,{once:true});else installRuntime();return {installed:true,version:"2.0.0-alpha1",refresh:renderAll,destroy:()=>{if(refreshTimer)window.clearInterval(refreshTimer);listObserver?.disconnect();modalObserver?.disconnect();document.removeEventListener("click",rememberModalTrigger,true);document.removeEventListener("keydown",handleModalKeys,true);closeDetail();document.getElementById(ROOT_ID)?.remove();if(legacyList){legacyList.hidden=false;legacyList.removeAttribute("aria-hidden");}restoreLegacyTeacherSurface();delete document.documentElement.dataset.teachersV2;}};}
