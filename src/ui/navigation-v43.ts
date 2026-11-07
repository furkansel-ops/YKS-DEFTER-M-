import "./navigation-v43.css";

type GroupId="learning"|"analysis"|"system";
type MoreAction="lab"|"books"|"resources"|"tactics"|"archive"|"success"|"reports"|"settings"|"about"|"data"|"system"|"backup"|"log"|"progress";
interface MoreItem{action:MoreAction;label:string;description:string;icon:string;}
interface MoreGroup{id:GroupId;label:string;items:readonly MoreItem[];}
interface Shortcut{screen?:string;action?:MoreAction;label:string;icon:string;}
interface NavigationRuntime{installed:true;version:string;validate():string[];refresh():void;}
type LegacyWindow=Window&{v30Action?:((action:string)=>unknown)&{__v76?:boolean};v30QuickItems?:(()=>QuickItem[])&{__v76?:boolean};go?:(screen:string)=>unknown;exportData?:()=>unknown;v320SetTab?:(tab:string)=>unknown;toast?:(text:string)=>void;YKSExamHub?:{openPhotos?:()=>void};};
interface QuickItem{k:string;label:string;sub:string;icon:string;n?:number;base?:number;}
type RouteDetail={to?:string};
declare global{interface Window{__YKS_NAV_V43__?:NavigationRuntime;}}

const VERSION="4.4.0-merkez-v76";
/* Merkez: sekme yok; bütün araçlar tek kaydırmada üç grupta. "İlerleme" kısayolu
   Analiz Merkezi'ni, "Yanlış arşivi" kısayolu fotoğraflı yanlışları açar. */
const SHORTCUTS:readonly Shortcut[]=[
  {screen:"pomo",label:"Odaklan",icon:'<circle cx="12" cy="13" r="8"/><path d="M9 2h6m-3 6v5l3 2"/>'},
  {action:"progress",label:"İlerleme",icon:'<path d="M4 20V10m8 10V4m8 16v-7"/>'},
  {screen:"pp",label:"Paragraf & problem",icon:'<path d="M4 4h16v16H4zM8 8h8m-8 4h8m-8 4h4"/>'},
  {action:"archive",label:"Yanlış arşivi",icon:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 13h6"/>'}
];
const GROUPS:readonly MoreGroup[]=[
  {id:"learning",label:"Öğrenme",items:[
    {action:"books",label:"Kitaplarım",description:"Soru bankaların, çözdüğün test ve sorular",icon:"▤"},
    {action:"lab",label:"Hızlı Okuma",description:"Okuma hızını ve anlamanı ölç, düzenli çalış",icon:"»"},
    {action:"tactics",label:"Taktikler",description:"Sana uyan çalışma ve sınav stratejileri",icon:"◈"}
  ]},
  {id:"analysis",label:"Analiz ve geçmiş",items:[
    {action:"success",label:"Çalışma özeti",description:"Haftalık karne, çalışma düzeni ve geçmiş",icon:"▦"},
    {action:"reports",label:"Raporlar & geçmiş",description:"Ay raporu, retrospektif ve dönem geçmişi",icon:"≋"},
    {action:"log",label:"Değişiklik günlüğü",description:"Son ekleme ve silmeleri incele",icon:"≡"}
  ]},
  {id:"system",label:"Uygulama",items:[
    {action:"settings",label:"Ayarlar",description:"Profil, bildirimler, koç bağlantısı ve verilerin",icon:"⚙"},
    {action:"about",label:"Hakkında",description:"Sürüm, uygulama kurulumu ve destek",icon:"i"}
  ]}
];
/* v76: Veri & yedek, Yedek indir, Sistem durumu, Kaynaklar & videolar ve ayrı arşiv girişi menüden kalktı.
   Eski bağlantılar yeni yerine gider; kod ve veri silinmez. */
const REMOVED_ACTIONS=new Set(["data","backup","system","resources","archive"]);
const QUICK_FALLBACK:readonly QuickItem[]=[
  {k:"lab",label:"Hızlı Okuma",sub:"Okuma çalışması",icon:"»"},{k:"reports",label:"Raporlar",sub:"Ay & geçmiş",icon:"↗"},
  {k:"success",label:"Çalışma özeti",sub:"Karne & geçmiş",icon:"▦"},{k:"settings",label:"Ayarlar",sub:"Görünüm & hedef",icon:"⚙"},
  {k:"tactics",label:"Taktikler",sub:"Stratejiler",icon:"◎"},{k:"about",label:"Hakkında",sub:"Sürüm bilgisi",icon:"i"}
];
/* Rapor sayfasında kalanlar: ay raporu, retrospektif, değişiklik günlüğü. Yedek, dışa aktarma, sistem ve ham veri gizlenir. */
const REPORT_HIDDEN=["v322ExportCenter","abBox","consBox","infraBox","dataBox"];

const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
const legacy=()=>window as LegacyWindow;

/* Eşitleme durumu: yalnız bulut eşitleme kutusunun durumu okunur, hiçbir şey yazılmaz. */
function syncLine():{text:string;tone:string;guest:boolean}{
  const box=document.getElementById("cloudSyncBox"),state=String(box?.dataset.state||"signedout");
  if(!navigator.onLine||state==="offline")return {text:"Çevrimdışı · bağlantı gelince eşitlenir",tone:"warn",guest:false};
  if(state==="synced")return {text:"Verilerin hesabınla eşitleniyor ✓",tone:"ok",guest:false};
  if(state==="syncing"||state==="connecting")return {text:"Verilerin eşitleniyor…",tone:"ok",guest:false};
  if(state==="error")return {text:"Eşitleme şu an yapılamıyor · verilerin bu cihazda güvende",tone:"warn",guest:false};
  return {text:"Verilerin yalnız bu cihazda",tone:"warn",guest:true};
}
function openPhotos():void{const hub=legacy().YKSExamHub;if(hub?.openPhotos)hub.openPhotos();else legacy().go?.("deneme");}
function exportAll():void{
  try{const result=legacy().exportData?.();if(result instanceof Promise)result.catch(()=>legacy().toast?.("Veri dosyası hazırlanamadı"));}
  catch{legacy().toast?.("Veri dosyası hazırlanamadı");}
}
/* Eski bağlantılar (Ayarlar'daki veri düğmesi, kişisel kısayollar) kaldırılan sayfalar yerine yeni yerlerine gider. */
function patchLegacyActions():void{
  const w=legacy(),original=w.v30Action;
  if(typeof original==="function"&&!original.__v76){
    const routed=Object.assign((action:string)=>{
      if(action==="data"||action==="backup"){exportAll();return;}
      if(action==="system")return original("about");
      if(action==="resources"){w.go?.("topics");return;}
      if(action==="archive"){openPhotos();return;}
      return original(action);
    },{__v76:true});
    w.v30Action=routed;
  }
  const quick=w.v30QuickItems;
  if(typeof quick==="function"&&!quick.__v76){
    w.v30QuickItems=Object.assign(()=>{
      const kept=quick().filter(item=>!REMOVED_ACTIONS.has(item.k)).map(item=>item.k==="lab"?{...item,label:"Hızlı Okuma",sub:"Okuma çalışması",icon:"»"}:item);
      for(const item of QUICK_FALLBACK){if(kept.length>=4)break;if(!kept.some(x=>x.k===item.k))kept.push(item);}
      return kept.slice(0,4);
    },{__v76:true});
  }
}
function trimReports():void{
  const panel=document.getElementById("mrp_veri");if(!panel||panel.dataset.v76)return;panel.dataset.v76="ready";
  const title=panel.querySelector<HTMLElement>(".v30-subhead h1"),lead=panel.querySelector<HTMLElement>(".v30-subhead p");
  if(title)title.textContent="Raporlar & geçmiş";if(lead)lead.textContent="Ay raporu, ay sonu retrospektifi ve değişiklik günlüğü";
  const hide=(node:Element|null|undefined)=>node?.classList.add("v76-hidden");
  hide(document.getElementById("v30DataTop"));hide(document.getElementById("v2DiagBox"));
  for(const id of REPORT_HIDDEN){const node=document.getElementById(id);hide(node);const heading=node?.previousElementSibling;if(heading?.tagName==="H2")hide(heading);}
  // Uygulama kurulum kartı Hakkında'ya taşınır; kimliği ve düğmeleri aynı kalır.
  const pwa=document.getElementById("v4PwaCard"),about=document.getElementById("v30AboutPanel");
  if(pwa&&about&&!about.contains(pwa)){const heading=pwa.previousElementSibling;if(heading?.tagName==="H2")about.append(heading);about.append(pwa);}
}

/* v79: Öğrenme Laboratuvarı kalktı; aynı sayfada yalnız Hızlı Okuma kalır. Konu rehberi, periyodik tablo,
   kronoloji, bilim kartları ve atlas gizlenir; kod ve kayıtlar silinmez. */
function speedReadingOnly():void{
  document.documentElement.dataset.labRetired="true";
  const panel=document.getElementById("mrp_lab");if(!panel||panel.dataset.v79Speed)return;panel.dataset.v79Speed="ready";
  const title=panel.querySelector<HTMLElement>(".v30-subhead h1");if(title)title.textContent="Hızlı Okuma";
  const toolbox=panel.querySelector<HTMLDetailsElement>("details.v320-toolbox");if(toolbox)toolbox.open=true;
}
function openSpeedReading():void{
  speedReadingOnly();
  const run=()=>{const setTab=legacy().v320SetTab;if(typeof setTab!=="function")return false;setTab("speed");return true;};
  if(!run())window.setTimeout(run,150);
}

export function installNavigationV43():NavigationRuntime{
  if(window.__YKS_NAV_V43__)return window.__YKS_NAV_V43__;
  let home:HTMLElement|null=null,hub:HTMLElement|null=null;

  function renameNavigation(){
    const moreTab=document.querySelector<HTMLElement>('.bottomnav [data-s="more"], nav [data-s="more"]');
    const label=moreTab?.querySelector<HTMLElement>(".tl");if(label&&label.textContent!=="Merkez")label.textContent="Merkez";
    if(moreTab?.getAttribute("aria-label")!=="Merkez")moreTab?.setAttribute("aria-label","Merkez");
    for(const back of document.querySelectorAll<HTMLElement>("#more .v30-back"))if(back.textContent!=="‹ Merkez")back.textContent="‹ Merkez";
    const moreScreen=document.getElementById("more");const title=document.getElementById("navTitle");
    if(moreScreen?.classList.contains("active")&&title&&title.textContent!=="Merkez")title.textContent="Merkez";
  }
  function renderGroups(){
    if(!hub)return;
    const target=hub.querySelector<HTMLElement>("#v43MoreTools");if(!target)return;
    target.innerHTML=GROUPS.map(group=>`<section class="v43-more-group" data-v43-more-group="${group.id}" aria-label="${esc(group.label)}"><h2 class="v43-more-group-label">${esc(group.label)}</h2><div class="v43-more-tool-grid">${group.items.map(item=>{
      return `<button type="button" class="v43-more-tool" data-v43-more-action="${item.action}"><span class="v43-more-tool-icon" aria-hidden="true">${esc(item.icon)}</span><span><b>${esc(item.label)}</b><small>${esc(item.description)}</small></span><i aria-hidden="true">›</i></button>`;
    }).join("")}</div></section>`).join("");
  }
  function hideLegacyMenu(){
    if(!home)return;
    for(const grid of home.querySelectorAll<HTMLElement>(":scope > .v30-menu-grid")){grid.hidden=true;grid.dataset.v43LegacyHidden="true";}
    for(const heading of home.querySelectorAll<HTMLElement>(":scope > h2")){heading.hidden=true;heading.dataset.v43LegacyHidden="true";}
  }
  function mount(){
    home=document.getElementById("v30MoreHome");if(!home)return false;
    renameNavigation();hideLegacyMenu();
    hub=document.getElementById("v43MoreHub");
    if(!hub){
      hub=document.createElement("section");hub.id="v43MoreHub";hub.className="v43-more-hub";hub.setAttribute("aria-label","Merkez");
      hub.innerHTML=`<header class="v43-more-head"><h1>Merkez</h1><p>Araçların, raporların ve ayarların.</p><div class="v43-more-sync" id="v43MoreSync" role="status"></div></header><div id="v43MoreSearchSlot" class="v43-more-search"></div><div class="v43-more-shortcuts" aria-label="Sık kullanılan ekranlar">${SHORTCUTS.map(item=>`<button type="button" ${item.screen?`data-v43-screen="${item.screen}"`:`data-v43-more-action="${item.action}"`}><svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg><span>${esc(item.label)}</span></button>`).join("")}</div><div id="v43MoreTools" class="v43-more-tools"></div><details class="v43-more-quick"><summary>Kişisel kısayollarım</summary><div id="v43MoreQuickSlot"></div></details>`;
      const status=document.getElementById("v30MoreStatus");if(status&&status.parentElement===home)status.insertAdjacentElement("afterend",hub);else home.prepend(hub);
      hub.addEventListener("click",event=>{
        if(!(event.target instanceof Element))return;
        if(event.target.closest("[data-v76-account]")){legacy().v30Action?.("settings");window.dispatchEvent(new CustomEvent("yks:open-settings",{detail:{category:"account"}}));return;}
        const screen=event.target.closest<HTMLElement>("[data-v43-screen]")?.dataset.v43Screen;
        if(screen){legacy().go?.(screen);return;}
        const actionButton=event.target.closest<HTMLElement>("[data-v43-more-action]");const action=actionButton?.dataset.v43MoreAction as MoreAction|undefined;if(!action)return;
        if(action==="progress")legacy().go?.("progress");else if(action==="archive")openPhotos();
        else if(action==="books")(window as Window&{YKSBooks?:{open:()=>void}}).YKSBooks?.open();else legacy().v30Action?.(action);
      });
    }
    const quick=document.getElementById("v30QuickGrid"),slot=document.getElementById("v43MoreQuickSlot");if(quick&&slot&&quick.parentElement!==slot)slot.appendChild(quick);
    // Eski "Yalnız cihazda · son yedek" kutusu yerine başlıktaki gerçek eşitleme satırı kullanılır.
    const status=document.getElementById("v30MoreStatus");if(status)status.classList.add("v76-hidden");
    const sync=document.getElementById("v43MoreSync");
    if(sync){const line=syncLine();sync.dataset.tone=line.tone;sync.innerHTML=`<i aria-hidden="true"></i><span>${esc(line.text)}</span>${line.guest?'<button type="button" data-v76-account>Hesap aç</button>':""}`;}
    patchLegacyActions();trimReports();speedReadingOnly();
    // Kayıt araması gizli bir açılır alan yerine Merkez'in en üstünde görünür.
    const search=document.querySelector<HTMLElement>("#more .v30-search-card"),searchSlot=document.getElementById("v43MoreSearchSlot");
    if(search&&searchSlot&&search.parentElement!==searchSlot)searchSlot.append(search);
    renderGroups();renameNavigation();return true;
  }
  let queued=false;
  const refresh=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;mount();});};

  /* Eski sürüm bütün document ağacını MutationObserver ile izleyip alakasız her DOM
     değişiminde Daha araçlarını yeniden innerHTML ile çiziyordu. Bu, tıklama anında
     düğümün değiştirilmesine ve tabletlerde gereksiz ana iş parçacığı yüküne yol açıyordu.
     Hub artık yalnız Daha ekranına gerçekten girildiğinde yenilenir. */
  window.addEventListener("yks:navigation-after",event=>{
    const detail=(event as CustomEvent<RouteDetail>).detail;
    if(detail?.to==="more")refresh();
  });
  window.addEventListener("yks:more-after",event=>{
    const detail=(event as CustomEvent<RouteDetail>).detail;
    if(detail?.to==="home")refresh();
    if(detail?.to==="lab")openSpeedReading();
  });
  mount();
  const api:NavigationRuntime={installed:true,version:VERSION,validate(){const issues:string[]=[];if(!document.getElementById("v43MoreHub"))issues.push("hub");if(document.querySelectorAll("[data-v43-more-group]").length!==3)issues.push("groups");const more=document.querySelector<HTMLElement>('[data-s="more"]');if(more&&more.getAttribute("aria-label")!=="Merkez")issues.push("nav-label");return issues;},refresh};
  window.__YKS_NAV_V43__=api;return api;
}
