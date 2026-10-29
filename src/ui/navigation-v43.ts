import "./navigation-v43.css";

type GroupId="learning"|"analysis"|"system";
type MoreAction="lab"|"resources"|"tactics"|"archive"|"success"|"reports"|"settings"|"about"|"data"|"system"|"backup"|"log"|"progress";
interface MoreItem{action:MoreAction;label:string;description:string;icon:string;}
interface MoreGroup{id:GroupId;label:string;items:readonly MoreItem[];}
interface Shortcut{screen?:string;action?:MoreAction;label:string;icon:string;}
interface NavigationRuntime{installed:true;version:string;validate():string[];refresh():void;}
type LegacyWindow=Window&{v30Action?:(action:string)=>unknown;go?:(screen:string)=>unknown;lastManualBackup?:()=>number;};
type RouteDetail={to?:string};
declare global{interface Window{__YKS_NAV_V43__?:NavigationRuntime;}}

const VERSION="4.4.0-merkez";
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
    {action:"lab",label:"Öğrenme Laboratuvarı",description:"Konu atlası, 3B organlar ve bilim kartları",icon:"⌁"},
    {action:"resources",label:"Kaynaklar & videolar",description:"Kitaplar, oynatma listeleri ve izleme geçmişi",icon:"▤"},
    {action:"tactics",label:"Taktikler",description:"Sana uyan çalışma ve sınav stratejileri",icon:"◈"}
  ]},
  {id:"analysis",label:"Analiz ve geçmiş",items:[
    {action:"success",label:"Çalışma özeti",description:"Haftalık karne, çalışma düzeni ve geçmiş",icon:"▦"},
    {action:"reports",label:"Raporlar & geçmiş",description:"Ay raporu, retrospektif ve dönem geçmişi",icon:"≋"},
    {action:"log",label:"Değişiklik günlüğü",description:"Son ekleme ve silmeleri incele",icon:"≡"}
  ]},
  {id:"system",label:"Veri ve uygulama",items:[
    {action:"data",label:"Veri & yedek",description:"Yerel kayıt, içe/dışa aktarma ve ham veri",icon:"⇅"},
    {action:"backup",label:"Yedek indir",description:"JSON geri dönüş kopyası oluştur",icon:"⇩"},
    {action:"system",label:"Sistem durumu",description:"PWA, depolama, veri şeması ve kontroller",icon:"✓"},
    {action:"settings",label:"Ayarlar",description:"Profil, bildirimler ve koç bağlantısı",icon:"⚙"},
    {action:"about",label:"Hakkında",description:"Sürüm, geliştirici ve uygulama bilgileri",icon:"i"}
  ]}
];

const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
const legacy=()=>window as LegacyWindow;

/* Son yedeğin yaşı: mevcut lastManualBackup() okunur, hiçbir şey yazılmaz. */
function backupNote():string{
  let at=0;try{at=Number(legacy().lastManualBackup?.())||0;}catch{}
  if(!at)return "Henüz yedek yok";
  const days=Math.floor((Date.now()-at)/86400000);
  return days<1?"Bugün yedeklendi":`Son yedek ${days} gün önce`;
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
      const note=item.action==="data"?`<em class="v43-more-note">${esc(backupNote())}</em>`:"";
      return `<button type="button" class="v43-more-tool" data-v43-more-action="${item.action}"><span class="v43-more-tool-icon" aria-hidden="true">${esc(item.icon)}</span><span><b>${esc(item.label)}</b><small>${esc(item.description)}</small>${note}</span><i aria-hidden="true">›</i></button>`;
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
      hub.innerHTML=`<header class="v43-more-head"><h1>Merkez</h1><p>Araçların, raporların ve verin.</p></header><div id="v43MoreSearchSlot" class="v43-more-search"></div><div class="v43-more-shortcuts" aria-label="Sık kullanılan ekranlar">${SHORTCUTS.map(item=>`<button type="button" ${item.screen?`data-v43-screen="${item.screen}"`:`data-v43-more-action="${item.action}"`}><svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg><span>${esc(item.label)}</span></button>`).join("")}</div><div id="v43MoreTools" class="v43-more-tools"></div><details class="v43-more-quick"><summary>Kişisel kısayollarım</summary><div id="v43MoreQuickSlot"></div></details>`;
      const status=document.getElementById("v30MoreStatus");if(status&&status.parentElement===home)status.insertAdjacentElement("afterend",hub);else home.prepend(hub);
      hub.addEventListener("click",event=>{
        if(!(event.target instanceof Element))return;
        const screen=event.target.closest<HTMLElement>("[data-v43-screen]")?.dataset.v43Screen;
        if(screen){legacy().go?.(screen);return;}
        const actionButton=event.target.closest<HTMLElement>("[data-v43-more-action]");const action=actionButton?.dataset.v43MoreAction as MoreAction|undefined;if(!action)return;
        if(action==="progress")legacy().go?.("progress");else legacy().v30Action?.(action);
      });
    }
    const quick=document.getElementById("v30QuickGrid"),slot=document.getElementById("v43MoreQuickSlot");if(quick&&slot&&quick.parentElement!==slot)slot.appendChild(quick);
    const status=document.getElementById("v30MoreStatus");if(status&&slot&&status.parentElement!==slot)slot.append(status);
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
  });
  mount();
  const api:NavigationRuntime={installed:true,version:VERSION,validate(){const issues:string[]=[];if(!document.getElementById("v43MoreHub"))issues.push("hub");if(document.querySelectorAll("[data-v43-more-group]").length!==3)issues.push("groups");const more=document.querySelector<HTMLElement>('[data-s="more"]');if(more&&more.getAttribute("aria-label")!=="Merkez")issues.push("nav-label");return issues;},refresh};
  window.__YKS_NAV_V43__=api;return api;
}
