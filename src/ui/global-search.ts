import "./global-search.css";
import {GLOBAL_SEARCH_SHORTCUTS,rankSearchResults,type GlobalSearchItem} from "./global-search-core";
import {isMorePanelId,isScreenId,type MorePanelId,type ScreenId} from "./types";

type LegacySearchRow={g?:unknown;t?:unknown;d?:unknown;go?:unknown};
type GlobalSearchApi={
  readonly version:"1.0.0";
  open():void;
  close():void;
  search(query:string):GlobalSearchItem[];
};

declare global{
  interface Window{
    globalSearch?:(query:string)=>LegacySearchRow[];
    openGlobalSearch?:()=>void;
    __YKS_GLOBAL_SEARCH__?:GlobalSearchApi;
  }
}

const MAX_RESULTS=30;

function legacyRows(query:string):GlobalSearchItem[]{
  if(query.trim().length<2||typeof window.globalSearch!=="function")return [];
  let rows:LegacySearchRow[]=[];
  try{rows=window.globalSearch(query)||[];}catch{return [];}
  return rows.map(row=>({
    group:String(row.g||"Sonuç"),
    title:String(row.t||"Sonuç"),
    detail:String(row.d||""),
    screen:String(row.go||"more"),
    panel:inferPanel(row),
    source:"legacy" as const
  }));
}

function inferPanel(row:LegacySearchRow):string|undefined{
  if(String(row.go||"")!=="more")return undefined;
  const text=`${String(row.g||"")} ${String(row.t||"")} ${String(row.d||"")}`.toLocaleLowerCase("tr-TR");
  if(/laboratuvar|bilim kart|atlas|periyodik|kronoloji/.test(text))return "lab";
  if(/kaynak|arama/.test(text))return "kay";
  if(/ayar|hedef|tema/.test(text))return "ayar";
  if(/veri|yedek|senkron|sistem/.test(text))return "veri";
  return undefined;
}

function searchItems(query:string):GlobalSearchItem[]{
  const all=[...GLOBAL_SEARCH_SHORTCUTS,...legacyRows(query)];
  return rankSearchResults(query,all,MAX_RESULTS);
}

function isEditableTarget(target:EventTarget|null):boolean{
  return target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement||(target instanceof HTMLElement&&target.isContentEditable);
}

export function installGlobalSearch():GlobalSearchApi{
  if(window.__YKS_GLOBAL_SEARCH__)return window.__YKS_GLOBAL_SEARCH__;

  const overlay=document.createElement("div");
  overlay.id="yksGlobalSearch";
  overlay.className="yks-global-search";
  overlay.hidden=true;
  overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label","Uygulamada ara");
  overlay.innerHTML=`<div class="yks-global-search-panel">
    <div class="yks-global-search-head">
      <span class="yks-global-search-icon" aria-hidden="true">⌕</span>
      <input id="yksGlobalSearchInput" type="search" autocomplete="off" spellcheck="false" placeholder="Konu, deneme, hata, not veya ekran ara…" aria-label="Uygulamada ara" aria-controls="yksGlobalSearchResults">
      <kbd class="yks-global-search-kbd">ESC</kbd>
    </div>
    <div class="yks-global-search-meta"><span id="yksGlobalSearchCount">Hızlı geçiş</span><span>En az 2 harfle tüm kayıtları ara</span></div>
    <div class="yks-global-search-results" id="yksGlobalSearchResults" role="listbox" aria-label="Arama sonuçları"></div>
    <div class="yks-global-search-foot"><span><kbd>↑</kbd><kbd>↓</kbd> seç</span><span><kbd>Enter</kbd> aç</span><span><kbd>Esc</kbd> kapat</span></div>
  </div>`;
  document.body.appendChild(overlay);

  const input=overlay.querySelector<HTMLInputElement>("#yksGlobalSearchInput")!;
  const results=overlay.querySelector<HTMLElement>("#yksGlobalSearchResults")!;
  const count=overlay.querySelector<HTMLElement>("#yksGlobalSearchCount")!;
  let rows:GlobalSearchItem[]=[],activeIndex=0,lastFocus:HTMLElement|null=null;

  function render(query=input.value):void{
    rows=searchItems(query);activeIndex=Math.min(activeIndex,Math.max(0,rows.length-1));
    const detailed=query.trim().length>=2;
    count.textContent=detailed?`${rows.length} sonuç`:"Hızlı geçiş";
    results.replaceChildren();
    if(!rows.length){
      const empty=document.createElement("div");empty.className="yks-global-search-empty";empty.textContent=`“${query.trim()}” için sonuç bulunamadı.`;results.appendChild(empty);return;
    }
    rows.forEach((row,index)=>{
      const button=document.createElement("button");
      button.type="button";button.className="yks-global-search-item";button.setAttribute("role","option");button.setAttribute("aria-selected",String(index===activeIndex));button.dataset.index=String(index);
      const main=document.createElement("span");main.className="yks-global-search-main";
      const title=document.createElement("span");title.className="yks-global-search-title";title.textContent=row.title;
      const detail=document.createElement("span");detail.className="yks-global-search-detail";detail.textContent=row.detail;
      const group=document.createElement("span");group.className="yks-global-search-group";group.textContent=row.group;
      main.append(title,detail);button.append(main,group);
      button.addEventListener("mouseenter",()=>{activeIndex=index;syncSelection(false);});
      button.addEventListener("click",()=>activate(index));
      results.appendChild(button);
    });
  }

  function syncSelection(scroll=true):void{
    const buttons=[...results.querySelectorAll<HTMLButtonElement>(".yks-global-search-item")];
    buttons.forEach((button,index)=>button.setAttribute("aria-selected",String(index===activeIndex)));
    if(scroll)buttons[activeIndex]?.scrollIntoView({block:"nearest"});
  }

  function navigate(screen:ScreenId,panel?:MorePanelId):void{
    const ui=window.__YKS_UI__;
    if(ui){ui.navigate(screen);if(screen==="more"&&panel)ui.openMore(panel);return;}
    const go=(window as unknown as {go?:(id:string)=>unknown}).go;
    if(typeof go==="function")go(screen);
    if(screen==="more"&&panel){const setMore=(window as unknown as {setMoreTab?:(id:string)=>unknown}).setMoreTab;if(typeof setMore==="function")setMore(panel);}
  }

  function focusTopic(title:string):void{
    window.setTimeout(()=>{
      const field=document.getElementById("topicSearch") as HTMLInputElement|null;
      if(!field)return;
      field.value=title;field.dispatchEvent(new Event("input",{bubbles:true}));field.focus({preventScroll:true});
      field.scrollIntoView({behavior:"smooth",block:"center"});
    },90);
  }

  function activate(index:number):void{
    const row=rows[index];if(!row)return;
    close();
    const screen=isScreenId(row.screen)?row.screen:"more";
    const panel=isMorePanelId(row.panel)?row.panel:undefined;
    navigate(screen,panel);
    if(screen==="topics"&&row.source==="legacy"&&/konu/i.test(row.group))focusTopic(row.title);
  }

  function open():void{
    if(!overlay.hidden)return;
    lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    overlay.hidden=false;document.documentElement.classList.add("yks-search-lock");
    input.value="";activeIndex=0;render("");
    requestAnimationFrame(()=>input.focus());
  }

  function close():void{
    if(overlay.hidden)return;
    overlay.hidden=true;document.documentElement.classList.remove("yks-search-lock");
    lastFocus?.focus?.({preventScroll:true});
  }

  input.addEventListener("input",()=>{activeIndex=0;render();});
  input.addEventListener("keydown",event=>{
    if(event.key==="ArrowDown"){event.preventDefault();activeIndex=rows.length?(activeIndex+1)%rows.length:0;syncSelection();}
    else if(event.key==="ArrowUp"){event.preventDefault();activeIndex=rows.length?(activeIndex-1+rows.length)%rows.length:0;syncSelection();}
    else if(event.key==="Enter"){event.preventDefault();activate(activeIndex);}
    else if(event.key==="Escape"){event.preventDefault();close();}
  });
  overlay.addEventListener("mousedown",event=>{if(event.target===overlay)close();});
  document.addEventListener("keydown",event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLocaleLowerCase("tr-TR")==="k"){
      event.preventDefault();overlay.hidden?open():close();return;
    }
    if(event.key==="/"&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!isEditableTarget(event.target)){
      event.preventDefault();open();
    }
  });

  const trigger=document.querySelector<HTMLButtonElement>(".searchbtn");
  if(trigger){trigger.title="Uygulamada ara · Ctrl/⌘ K";trigger.setAttribute("aria-keyshortcuts","Control+K Meta+K");}

  const api:GlobalSearchApi={version:"1.0.0",open,close,search:searchItems};
  window.openGlobalSearch=open;window.__YKS_GLOBAL_SEARCH__=api;
  document.documentElement.dataset.v42GlobalSearch="ready";
  return api;
}
