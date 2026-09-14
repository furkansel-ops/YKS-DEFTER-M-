import "./teachers-v2.css";

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

const state:TeachersV2State={
  query:"",
  subject:"",
  level:"",
  favOnly:false,
  openName:""
};

function esc(value:unknown):string{
  return String(value??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function norm(value:unknown):string{
  return String(value??"").toLocaleLowerCase("tr-TR").replace(/\s+/g," ").trim();
}

function readYksState():Record<string,unknown>{
  try{
    const raw=localStorage.getItem("yks");
    const parsed=raw?JSON.parse(raw):{};
    return parsed&&typeof parsed==="object"&&!Array.isArray(parsed)?parsed:{};
  }catch{return {};}
}

function readPrefs():void{
  try{
    const raw=localStorage.getItem(PREF_KEY);
    if(!raw)return;
    const pref=JSON.parse(raw) as Partial<TeachersV2State>;
    if(typeof pref.subject==="string")state.subject=pref.subject;
    if(typeof pref.level==="string")state.level=pref.level;
    if(typeof pref.favOnly==="boolean")state.favOnly=pref.favOnly;
  }catch{}
}

function savePrefs():void{
  try{
    localStorage.setItem(PREF_KEY,JSON.stringify({subject:state.subject,level:state.level,favOnly:state.favOnly}));
  }catch{}
}

function favoriteNames():Set<string>{
  const stored=readYksState();
  const fav=Array.isArray(stored.favTeachers)?stored.favTeachers:[];
  return new Set(fav.map(String));
}

function currentTeachers():Teacher[]{
  try{
    const rows=legacy.allTeachers?.();
    if(!Array.isArray(rows))return [];
    return rows.filter((item):item is Teacher=>!!item&&typeof item.a==="string"&&Array.isArray(item.d));
  }catch{return [];}
}

function syncSignature():string{
  const stored=readYksState();
  const fav=Array.isArray(stored.favTeachers)?stored.favTeachers:[];
  const own=Array.isArray(stored.teachers)?stored.teachers:[];
  return JSON.stringify([fav,own]);
}

function initials(name:string):string{
  const parts=name.trim().split(/\s+/).filter(Boolean);
  if(!parts.length)return "YK";
  if(parts.length===1)return parts[0].slice(0,2).toLocaleUpperCase("tr-TR");
  return (parts[0][0]+parts[parts.length-1][0]).toLocaleUpperCase("tr-TR");
}

function subjects(teachers:Teacher[]):string[]{
  const values=new Set<string>();
  teachers.forEach(t=>t.d.forEach(s=>{if(s)values.add(String(s));}));
  return [...values].sort((a,b)=>a.localeCompare(b,"tr"));
}

function filteredTeachers(teachers:Teacher[],favs:Set<string>):Teacher[]{
  const q=norm(state.query);
  return teachers.filter(t=>{
    if(state.subject&&!t.d.includes(state.subject))return false;
    if(state.level&&t.l!==state.level&&t.l!=="hepsi")return false;
    if(state.favOnly&&!favs.has(t.a))return false;
    if(q){
      const hay=norm([t.a,t.n||"",...t.d].join(" "));
      if(!hay.includes(q))return false;
    }
    return true;
  }).sort((a,b)=>{
    const af=favs.has(a.a)?0:1;
    const bf=favs.has(b.a)?0:1;
    if(af!==bf)return af-bf;
    return a.a.localeCompare(b.a,"tr");
  });
}

function cardHtml(t:Teacher,favs:Set<string>):string{
  const favorite=favs.has(t.a);
  const content=(t.t&&t.t.length?t.t:["konu","soru"]).slice(0,3);
  const level=LEVEL_LABELS[t.l]||"Her seviye";
  return `<article class="teachers-v2-card" data-action="open" data-name="${esc(t.a)}" tabindex="0" role="button" aria-label="${esc(t.a)} ayrıntısını aç">
    <div class="teachers-v2-card-top">
      <div class="teachers-v2-avatar">${esc(initials(t.a))}</div>
      <div>
        <div class="teachers-v2-name">${esc(t.a)}</div>
        <div class="teachers-v2-card-meta">
          <span class="teachers-v2-level" data-level="${esc(t.l)}">${esc(level)}</span>
          ${t.d.slice(0,2).map(s=>`<span class="teachers-v2-subject">${esc(s)}</span>`).join("")}
        </div>
      </div>
      <button class="teachers-v2-star ${favorite?"on":""}" type="button" data-action="favorite" data-name="${esc(t.a)}" aria-label="${favorite?"Favorilerden çıkar":"Favoriye ekle"}">★</button>
    </div>
    <p class="teachers-v2-note">${esc(t.n||"Bu hoca için kişisel kaynak notun burada görünecek.")}</p>
    <div class="teachers-v2-tags">${content.map(x=>`<span class="teachers-v2-tag">${esc(TYPE_LABELS[x]||x)}</span>`).join("")}${t.own?'<span class="teachers-v2-tag">Senin eklediğin</span>':""}</div>
  </article>`;
}

function ensureRoot():HTMLElement|null{
  const list=document.getElementById("thList") as HTMLElement|null;
  if(!list)return null;
  legacyList=list;
  list.hidden=true;
  list.setAttribute("aria-hidden","true");
  ["thSubjChips","thLvlChips","thInfo"].forEach(id=>{
    const node=document.getElementById(id) as HTMLElement|null;
    if(node)node.style.display="none";
  });

  let root=document.getElementById(ROOT_ID) as HTMLElement|null;
  if(!root){
    root=document.createElement("section");
    root.id=ROOT_ID;
    root.className="teachers-v2-root";
    root.setAttribute("aria-label","Hocalar v2");
    list.parentNode?.insertBefore(root,list);
    buildShell(root);
  }
  return root;
}

function buildShell(root:HTMLElement):void{
  root.innerHTML=`<div class="teachers-v2-shell">
    <section class="teachers-v2-hero">
      <div class="teachers-v2-kicker">Kaynak merkezi</div>
      <h2 class="teachers-v2-title">Hocalar <span class="teachers-v2-badge">V2</span></h2>
      <p class="teachers-v2-sub">Hocalarını daha hızlı bul, favorilerini cihazların arasında eşitle ve ihtiyacın olan video türüne tek dokunuşla ulaş.</p>
      <div class="teachers-v2-meta">
        <span id="teachersV2Count">0 hoca</span>
        <span id="teachersV2FavCount">0 favori</span>
        <span>Favoriler + kendi hocaların bulutla eşitlenir</span>
      </div>
    </section>
    <div class="teachers-v2-toolbar">
      <label class="teachers-v2-search"><input id="teachersV2Search" type="search" autocomplete="off" placeholder="Hoca, ders veya açıklama ara…" aria-label="Hocalarda ara"></label>
      <button id="teachersV2FavToggle" class="teachers-v2-fav-toggle" type="button">★ Sadece favoriler</button>
    </div>
    <div id="teachersV2SubjectRow" class="teachers-v2-filter-row" aria-label="Ders filtresi"></div>
    <div id="teachersV2LevelRow" class="teachers-v2-filter-row" aria-label="Seviye filtresi"></div>
    <div class="teachers-v2-summary"><span id="teachersV2ResultText"></span><span id="teachersV2Sync" class="teachers-v2-sync"><i class="teachers-v2-sync-dot"></i><span>Bulut durumu</span></span></div>
    <div id="teachersV2Grid" class="teachers-v2-grid"></div>
  </div>`;

  const search=root.querySelector("#teachersV2Search") as HTMLInputElement|null;
  search?.addEventListener("input",()=>{state.query=search.value;renderGrid();});
  root.querySelector("#teachersV2FavToggle")?.addEventListener("click",()=>{
    state.favOnly=!state.favOnly;
    savePrefs();
    renderAll();
  });
  root.addEventListener("click",handleRootClick);
  root.addEventListener("keydown",event=>{
    if(event.key!=="Enter"&&event.key!==" ")return;
    const target=event.target as HTMLElement|null;
    const card=target?.closest<HTMLElement>(".teachers-v2-card[data-action='open']");
    if(card&&!target?.closest("button")){
      event.preventDefault();
      openDetail(card.dataset.name||"");
    }
  });
}

function renderSubjectRow(teachers:Teacher[]):void{
  const row=document.getElementById("teachersV2SubjectRow");
  if(!row)return;
  row.innerHTML=["",...subjects(teachers)].map(s=>`<button class="teachers-v2-chip ${state.subject===s?"on":""}" type="button" data-action="subject" data-value="${esc(s)}">${esc(s||"Tüm dersler")}</button>`).join("");
}

function renderLevelRow():void{
  const row=document.getElementById("teachersV2LevelRow");
  if(!row)return;
  const levels:[[string,string],[string,string],[string,string],[string,string]]=[
    ["","Tüm seviyeler"],["baslangic","Başlangıç"],["orta","Orta"],["ileri","İleri"]
  ];
  row.innerHTML=levels.map(([value,label])=>`<button class="teachers-v2-chip ${state.level===value?"on":""}" type="button" data-action="level" data-value="${value}">${label}</button>`).join("");
}

function renderGrid():void{
  const grid=document.getElementById("teachersV2Grid");
  if(!grid)return;
  const teachers=currentTeachers();
  const favs=favoriteNames();
  const list=filteredTeachers(teachers,favs);
  grid.innerHTML=list.length?list.map(t=>cardHtml(t,favs)).join(""):'<div class="teachers-v2-empty"><b>Bu filtrede hoca bulunamadı.</b><br>Aramayı veya filtreleri değiştir.</div>';
  const result=document.getElementById("teachersV2ResultText");
  if(result)result.textContent=`${list.length} sonuç · ${teachers.length} toplam`;
  const count=document.getElementById("teachersV2Count");
  if(count)count.textContent=`${teachers.length} hoca`;
  const favCount=document.getElementById("teachersV2FavCount");
  if(favCount)favCount.textContent=`${favs.size} favori`;
}

function renderSyncStatus():void{
  const target=document.getElementById("teachersV2Sync");
  if(!target)return;
  const cloudText=document.getElementById("cloudSyncText")?.textContent?.trim();
  const online=navigator.onLine;
  target.classList.toggle("offline",!online);
  const text=target.querySelector("span");
  if(text)text.textContent=!online?"Çevrimdışı":(cloudText||"Bulut senkronu açık");
}

function renderAll():void{
  const root=ensureRoot();
  if(!root)return;
  const teachers=currentTeachers();
  renderSubjectRow(teachers);
  renderLevelRow();
  const favToggle=document.getElementById("teachersV2FavToggle");
  favToggle?.classList.toggle("on",state.favOnly);
  renderGrid();
  renderSyncStatus();
  lastSyncSignature=syncSignature();
}

function handleRootClick(event:MouseEvent):void{
  const target=event.target as HTMLElement|null;
  if(!target)return;
  const actionNode=target.closest<HTMLElement>("[data-action]");
  if(!actionNode)return;
  const action=actionNode.dataset.action||"";
  if(action==="subject"){
    state.subject=actionNode.dataset.value||"";
    savePrefs();
    renderAll();
    return;
  }
  if(action==="level"){
    state.level=actionNode.dataset.value||"";
    savePrefs();
    renderAll();
    return;
  }
  if(action==="favorite"){
    event.stopPropagation();
    toggleFavorite(actionNode.dataset.name||"");
    return;
  }
  if(action==="open")openDetail(actionNode.dataset.name||"");
}

function toggleFavorite(name:string):void{
  if(!name)return;
  if(typeof legacy.toggleFavTeacher==="function"){
    try{legacy.toggleFavTeacher(name);}catch{}
    window.setTimeout(renderAll,50);
    window.setTimeout(renderAll,350);
  }
}

function youtubeQuery(teacher:Teacher,kind:string):string{
  const subject=state.subject||teacher.d[0]||"YKS";
  const suffix:Record<string,string>={
    channel:"",
    tyt:"TYT konu anlatımı",
    ayt:"AYT konu anlatımı",
    soru:"soru çözümü",
    deneme:"deneme branş çözümü"
  };
  return [teacher.a,subject,suffix[kind]??"YKS"].filter(Boolean).join(" ").replace(/\s+/g," ").trim();
}

function openYoutubeSearch(teacher:Teacher,kind:string):void{
  const query=youtubeQuery(teacher,kind);
  window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,"_blank","noopener,noreferrer");
}

function detailTeacher(name:string):Teacher|null{
  return currentTeachers().find(t=>t.a===name)||null;
}

function closeDetail():void{
  document.getElementById(OVERLAY_ID)?.remove();
  document.body.classList.remove("teachers-v2-open");
  state.openName="";
}

function openDetail(name:string):void{
  const teacher=detailTeacher(name);
  if(!teacher)return;
  closeDetail();
  state.openName=name;
  const fav=favoriteNames().has(name);
  const overlay=document.createElement("div");
  overlay.id=OVERLAY_ID;
  overlay.className="teachers-v2-overlay";
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label",`${teacher.a} ayrıntısı`);
  overlay.innerHTML=`<section class="teachers-v2-detail">
    <div class="teachers-v2-detail-head"><strong>Hocalar v2 · Kaynak profili</strong><button class="teachers-v2-close" type="button" data-detail-action="close">Kapat</button></div>
    <div class="teachers-v2-detail-body">
      <div class="teachers-v2-profile">
        <div class="teachers-v2-avatar">${esc(initials(teacher.a))}</div>
        <div>
          <h2>${esc(teacher.a)}</h2>
          <div class="teachers-v2-card-meta"><span class="teachers-v2-level" data-level="${esc(teacher.l)}">${esc(LEVEL_LABELS[teacher.l]||"Her seviye")}</span>${teacher.d.map(s=>`<span class="teachers-v2-subject">${esc(s)}</span>`).join("")}</div>
          <p>${esc(teacher.n||"Bu hoca için kişisel kaynak notun bulunmuyor.")}</p>
        </div>
        <button class="teachers-v2-detail-star ${fav?"on":""}" type="button" data-detail-action="favorite" aria-label="Favori">★</button>
      </div>

      <section class="teachers-v2-section">
        <div class="teachers-v2-section-head"><h3>Video merkezi</h3><span>V2 veri katmanı hazırlanıyor · aramalar doğrudan YouTube'a gider</span></div>
        <div class="teachers-v2-actions">
          <button class="teachers-v2-action" type="button" data-detail-action="youtube" data-kind="channel">Kanalı bul<small>Hoca + ders</small></button>
          <button class="teachers-v2-action" type="button" data-detail-action="youtube" data-kind="tyt">TYT konu<small>Konu anlatımı</small></button>
          <button class="teachers-v2-action" type="button" data-detail-action="youtube" data-kind="ayt">AYT konu<small>Konu anlatımı</small></button>
          <button class="teachers-v2-action" type="button" data-detail-action="youtube" data-kind="soru">Soru çözümü<small>Pratik ve kamp</small></button>
          <button class="teachers-v2-action" type="button" data-detail-action="youtube" data-kind="deneme">Deneme / branş<small>Çözüm videoları</small></button>
          <button class="teachers-v2-action" type="button" data-detail-action="youtube" data-kind="">Tüm sonuçlar<small>${esc(teacher.d[0]||"YKS")}</small></button>
        </div>
      </section>

      <section class="teachers-v2-section">
        <div class="teachers-v2-section-head"><h3>Senkronizasyon</h3><span>YKS Defterim bulut verisi</span></div>
        <div class="teachers-v2-sync-card"><span>↻</span><div><b>Cihazlar arasında korunur</b>Favori durumu ve kendi eklediğin hocalar mevcut YKS Defterim kayıt sisteminde tutulur. PC veya tablette yapılan değişiklik mevcut Firebase eşitleme hattından geçer.</div></div>
      </section>
      ${teacher.own&&Number.isFinite(teacher.id)?'<button class="teachers-v2-danger" type="button" data-detail-action="delete">Bu hocayı listemden sil</button>':""}
    </div>
  </section>`;

  overlay.addEventListener("click",event=>{
    if(event.target===overlay){closeDetail();return;}
    const target=event.target as HTMLElement|null;
    const action=target?.closest<HTMLElement>("[data-detail-action]");
    if(!action)return;
    const type=action.dataset.detailAction||"";
    if(type==="close"){closeDetail();return;}
    if(type==="favorite"){
      toggleFavorite(teacher.a);
      window.setTimeout(()=>openDetail(teacher.a),80);
      return;
    }
    if(type==="youtube"){
      openYoutubeSearch(teacher,action.dataset.kind||"");
      return;
    }
    if(type==="delete"&&teacher.own&&Number.isFinite(teacher.id)){
      if(window.confirm(`${teacher.a} listenden silinsin mi?`)){
        try{legacy.delTeacher?.(teacher.id as number);}catch{}
        closeDetail();
        window.setTimeout(renderAll,80);
      }
    }
  });
  document.body.appendChild(overlay);
  document.body.classList.add("teachers-v2-open");
}

function bindLegacyObserver():void{
  if(!legacyList)return;
  listObserver?.disconnect();
  listObserver=new MutationObserver(()=>window.setTimeout(renderAll,0));
  listObserver.observe(legacyList,{childList:true,subtree:true});
}

function tick():void{
  const root=ensureRoot();
  if(root&&!mounted){
    mounted=true;
    bindLegacyObserver();
    renderAll();
  }
  if(root){
    const sig=syncSignature();
    if(sig!==lastSyncSignature)renderAll();
    else renderSyncStatus();
  }
}

function installRuntime():void{
  readPrefs();
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&document.getElementById(OVERLAY_ID))closeDetail();});
  window.addEventListener("online",renderSyncStatus);
  window.addEventListener("offline",renderSyncStatus);
  window.addEventListener("storage",event=>{if(event.key==="yks")renderAll();});
  tick();
  refreshTimer=window.setInterval(tick,1000);
  document.documentElement.dataset.teachersV2="ready";
}

export function installTeachersV2():{installed:boolean;version:string;refresh:()=>void;destroy:()=>void}{
  if(document.documentElement.dataset.teachersV2==="ready"){
    return {installed:true,version:"2.0.0-alpha1",refresh:renderAll,destroy:()=>{}};
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installRuntime,{once:true});
  else installRuntime();
  return {
    installed:true,
    version:"2.0.0-alpha1",
    refresh:renderAll,
    destroy:()=>{
      if(refreshTimer)window.clearInterval(refreshTimer);
      listObserver?.disconnect();
      closeDetail();
      document.getElementById(ROOT_ID)?.remove();
      if(legacyList){legacyList.hidden=false;legacyList.removeAttribute("aria-hidden");}
      delete document.documentElement.dataset.teachersV2;
    }
  };
}
