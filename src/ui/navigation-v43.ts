import "./navigation-v43.css";

type CategoryId="learning"|"analysis"|"settings"|"system";
type MoreAction="lab"|"resources"|"tactics"|"archive"|"success"|"reports"|"settings"|"about"|"data"|"system"|"backup"|"log"|"progress"|"deneme"|"pp";
interface MoreItem{action:MoreAction;label:string;description:string;icon:string;}
interface MoreCategory{id:CategoryId;label:string;description:string;icon:string;items:readonly MoreItem[];}
interface NavigationRuntime{installed:true;version:string;validate():string[];refresh():void;}
type LegacyWindow=Window&{v30Action?:(action:string)=>unknown;go?:(screen:string)=>unknown;};
type RouteDetail={to?:string};
declare global{interface Window{__YKS_NAV_V43__?:NavigationRuntime;}}

const VERSION="4.3.0-stage5";
const MOBILE_QUERY="(max-width: 760px)";
const SECONDARY_MOBILE_ROUTES=new Set(["deneme","progress","pp"]);
const CATEGORIES:readonly MoreCategory[]=[
  {id:"learning",label:"Öğrenme",description:"Laboratuvar, kaynaklar ve yanlışlardan öğrenme",icon:"◎",items:[
    {action:"pp",label:"Paragraf & Problem",description:"Günlük soru hacmi, doğruluk ve çalışma geçmişi",icon:"¶"},
    {action:"lab",label:"Öğrenme Laboratuvarı",description:"Konu atlası, 3B organlar ve bilim kartları",icon:"⌁"},
    {action:"resources",label:"Kaynaklar & videolar",description:"Kitaplar, hocalar, listeler ve izleme geçmişi",icon:"▤"},
    {action:"tactics",label:"Taktikler",description:"Çalışma ve sınav stratejileri",icon:"◈"},
    {action:"archive",label:"Yanlış soru arşivi",description:"Fotoğraflı yanlışlarını aç ve tekrar et",icon:"▣"}
  ]},
  {id:"analysis",label:"Analiz",description:"İlerleme, karne ve dönem raporları",icon:"↗",items:[
    {action:"deneme",label:"Denemeler",description:"Deneme sonuçlarını gir, karşılaştır ve incele",icon:"◇"},
    {action:"progress",label:"Analiz Merkezi",description:"7/30 gün, net eğilimi ve kritik konu sinyalleri",icon:"↗"},
    {action:"success",label:"Çalışma özeti",description:"Haftalık karne, çalışma düzeni ve geçmiş",icon:"▦"},
    {action:"reports",label:"Raporlar & geçmiş",description:"Ay raporu, retrospektif ve dönem geçmişi",icon:"≋"}
  ]},
  {id:"settings",label:"Ayarlar",description:"Görünüm, hedefler ve uygulama tercihleri",icon:"⚙",items:[
    {action:"settings",label:"Ayarlar",description:"Tema, hedefler, bildirimler ve video seçenekleri",icon:"⚙"},
    {action:"about",label:"Hakkında",description:"Sürüm, geliştirici ve uygulama bilgileri",icon:"i"}
  ]},
  {id:"system",label:"Veri & Sistem",description:"Yerel kayıt, yedek, kurtarma ve sistem sağlığı",icon:"⇅",items:[
    {action:"data",label:"Veri & yedek",description:"Yerel kayıt, içe/dışa aktarma ve ham veri",icon:"⇅"},
    {action:"system",label:"Sistem durumu",description:"PWA, depolama, veri şeması ve kontroller",icon:"✓"},
    {action:"backup",label:"JSON yedek",description:"Manuel geri dönüş kopyası oluştur",icon:"⇩"},
    {action:"log",label:"Değişiklik günlüğü",description:"Son ekleme ve silmeleri incele",icon:"≡"}
  ]}
];

const esc=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
const legacy=()=>window as LegacyWindow;

export function installNavigationV43():NavigationRuntime{
  if(window.__YKS_NAV_V43__)return window.__YKS_NAV_V43__;
  let current:CategoryId="learning";
  let home:HTMLElement|null=null,hub:HTMLElement|null=null;
  const mobileMedia=typeof window.matchMedia==="function"?window.matchMedia(MOBILE_QUERY):null;

  function syncPrimaryNavigation(requested?:string){
    const active=requested||document.querySelector<HTMLElement>(".screen.active")?.id||"home";
    const mobile=mobileMedia?.matches??window.innerWidth<=760;
    const proxyToMore=mobile&&SECONDARY_MOBILE_ROUTES.has(active);
    for(const tab of document.querySelectorAll<HTMLButtonElement>(".tabbar .tab[data-s]")){
      const selected=proxyToMore?tab.dataset.s==="more":tab.dataset.s===active;
      tab.classList.toggle("v43-mobile-proxy-active",proxyToMore&&tab.dataset.s==="more");
      if(selected)tab.setAttribute("aria-current","page");else tab.removeAttribute("aria-current");
      if(mobile){tab.setAttribute("aria-selected",String(selected));tab.tabIndex=selected?0:-1;}
      else{const actual=tab.dataset.s===active;tab.setAttribute("aria-selected",String(actual));tab.tabIndex=actual?0:-1;}
    }
  }

  function renameNavigation(){
    const moreTab=document.querySelector<HTMLElement>('.bottomnav [data-s="more"], nav [data-s="more"]');
    const label=moreTab?.querySelector<HTMLElement>(".tl");if(label&&label.textContent!=="Merkez")label.textContent="Merkez";
    if(moreTab?.getAttribute("aria-label")!=="Merkez")moreTab?.setAttribute("aria-label","Merkez");
    for(const back of document.querySelectorAll<HTMLElement>("#more .v30-back"))if(back.textContent!=="‹ Merkez")back.textContent="‹ Merkez";
    const moreScreen=document.getElementById("more");const title=document.getElementById("navTitle");
    if(moreScreen?.classList.contains("active")&&title&&title.textContent!=="Merkez")title.textContent="Merkez";
  }
  function renderCategory(){
    if(!hub)return;
    for(const button of hub.querySelectorAll<HTMLElement>("[data-v43-more-category]"))button.setAttribute("aria-pressed",String(button.dataset.v43MoreCategory===current));
    const category=CATEGORIES.find(row=>row.id===current)!;
    const target=hub.querySelector<HTMLElement>("#v43MoreTools");if(!target)return;
    target.innerHTML=`<div class="v43-more-tools-head"><div><span>${esc(category.label.toLocaleUpperCase("tr-TR"))}</span><b>${esc(category.description)}</b></div><small>${category.items.length} araç</small></div><div class="v43-more-tool-grid">${category.items.map(item=>`<button type="button" class="v43-more-tool" data-v43-more-action="${item.action}"><span class="v43-more-tool-icon" aria-hidden="true">${esc(item.icon)}</span><span><b>${esc(item.label)}</b><small>${esc(item.description)}</small></span><i aria-hidden="true">›</i></button>`).join("")}</div>`;
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
      hub=document.createElement("section");hub.id="v43MoreHub";hub.className="v43-more-hub";hub.setAttribute("aria-label","Merkez kategorileri");
      hub.innerHTML=`<header class="v43-more-head"><div><span>MERKEZ</span><h1>Ne yapmak istiyorsun?</h1><p>Kalabalık araç listesi yerine alanını seç; yalnız ihtiyacın olan seçenekleri gör.</p></div></header><div class="v43-more-categories" role="group" aria-label="Merkez kategorileri">${CATEGORIES.map(category=>`<button type="button" data-v43-more-category="${category.id}" aria-pressed="${category.id===current}"><span aria-hidden="true">${esc(category.icon)}</span><span><b>${esc(category.label)}</b><small>${esc(category.description)}</small></span></button>`).join("")}</div><section id="v43MoreTools" class="v43-more-tools" aria-live="polite"></section><section class="v43-more-quick"><div class="v43-more-quick-head"><span>HIZLI ERİŞİM</span><b>Sık kullandıkların</b></div><div id="v43MoreQuickSlot"></div></section>`;
      const status=document.getElementById("v30MoreStatus");if(status&&status.parentElement===home)status.insertAdjacentElement("afterend",hub);else home.prepend(hub);
      hub.addEventListener("click",event=>{
        if(!(event.target instanceof Element))return;
        const categoryButton=event.target.closest<HTMLElement>("[data-v43-more-category]");
        if(categoryButton?.dataset.v43MoreCategory){current=categoryButton.dataset.v43MoreCategory as CategoryId;renderCategory();return;}
        const actionButton=event.target.closest<HTMLElement>("[data-v43-more-action]");const action=actionButton?.dataset.v43MoreAction as MoreAction|undefined;if(!action)return;
        if(action==="progress")legacy().go?.("progress");
        else if(action==="deneme")legacy().go?.("deneme");
        else if(action==="pp")legacy().go?.("pp");
        else legacy().v30Action?.(action);
      });
    }
    const quick=document.getElementById("v30QuickGrid"),slot=document.getElementById("v43MoreQuickSlot");if(quick&&slot&&quick.parentElement!==slot)slot.appendChild(quick);
    renderCategory();renameNavigation();syncPrimaryNavigation();return true;
  }
  let queued=false;
  const refresh=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;mount();});};

  /* Eski sürüm bütün document ağacını MutationObserver ile izleyip alakasız her DOM
     değişiminde Daha araçlarını yeniden innerHTML ile çiziyordu. Bu, tıklama anında
     düğümün değiştirilmesine ve tabletlerde gereksiz ana iş parçacığı yüküne yol açıyordu.
     Hub artık yalnız Daha ekranına gerçekten girildiğinde yenilenir. */
  window.addEventListener("yks:navigation-after",event=>{
    const detail=(event as CustomEvent<RouteDetail>).detail;
    syncPrimaryNavigation(detail?.to);
    if(detail?.to==="more")refresh();
  });
  window.addEventListener("yks:more-after",event=>{
    const detail=(event as CustomEvent<RouteDetail>).detail;
    if(detail?.to==="home")refresh();
  });
  const handleViewportChange=()=>syncPrimaryNavigation();
  if(mobileMedia){
    if(typeof mobileMedia.addEventListener==="function")mobileMedia.addEventListener("change",handleViewportChange);
    else mobileMedia.addListener(handleViewportChange);
  }
  mount();
  const api:NavigationRuntime={installed:true,version:VERSION,validate(){const issues:string[]=[];if(!document.getElementById("v43MoreHub"))issues.push("hub");if(document.querySelectorAll("[data-v43-more-category]").length!==4)issues.push("categories");const more=document.querySelector<HTMLElement>('[data-s="more"]');if(more&&more.getAttribute("aria-label")!=="Merkez")issues.push("nav-label");return issues;},refresh};
  window.__YKS_NAV_V43__=api;return api;
}
