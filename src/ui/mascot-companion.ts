import "./mascot-companion.css";

export const MASCOTS=[
  {id:"book",name:"Defter",kind:"Kitap",hello:"Selam! Bugün de beraberiz."},
  {id:"owl",name:"Bilge",kind:"Baykuş",hello:"Selam! Birlikte yeni şeyler öğrenelim."},
  {id:"cat",name:"Mırmır",kind:"Kedi",hello:"Selam! Küçük bir adımla başlayalım."},
  {id:"fox",name:"Kıvılcım",kind:"Tilki",hello:"Selam! Bugünün planına hazırım."},
  {id:"panda",name:"Bambu",kind:"Panda",hello:"Selam! Kendi hızımızda ilerleyelim."},
  {id:"robot",name:"Piko",kind:"Robot",hello:"Selam! Yeni bir güne hazırım."},
  {id:"turtle",name:"Tosbi",kind:"Kaplumbağa",hello:"Selam! Her küçük adım önemli."},
  {id:"rabbit",name:"Pofi",kind:"Tavşan",hello:"Selam! Bugün neler öğreneceğiz?"},
  {id:"penguin",name:"Ponçik",kind:"Penguen",hello:"Selam! Çalışma arkadaşın burada."},
  {id:"dragon",name:"Alev",kind:"Ejderha",hello:"Selam! Birlikte keşfedelim."}
] as const;
type MascotId=typeof MASCOTS[number]["id"];
type Preference={id:MascotId;enabled:boolean};
export interface MascotCompanionApi{
  read():Preference&{name:string};
  open():void;
  setEnabled(enabled:boolean):void;
}
declare global{interface Window{__YKS_MASCOT__?:MascotCompanionApi}}
const STORAGE_KEY="yks:mascot-companion:v1";
const knownId=(value:unknown):value is MascotId=>MASCOTS.some(m=>m.id===value);
function readPreference():Preference{
  try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");return {id:knownId(saved?.id)?saved.id:"book",enabled:saved?.enabled!==false};}
  catch{return {id:"book",enabled:true};}
}
const asset=(id:MascotId)=>new URL(`./mascots/${id==="book"?"notebook":id==="owl"?"owl-v2":id}.webp`,document.baseURI).href;
const image=(id:MascotId,lazy=false)=>`<img src="${asset(id)}" alt="" width="112" height="112" decoding="async"${lazy?' loading="lazy"':""}><span class="rb-mascot-fallback" hidden aria-hidden="true">${MASCOTS.find(m=>m.id===id)!.name[0]}</span>`;
function handleImageError(event:Event){
  const img=event.target;if(!(img instanceof HTMLImageElement))return;
  img.hidden=true;const fallback=img.nextElementSibling;if(fallback instanceof HTMLElement&&fallback.classList.contains("rb-mascot-fallback"))fallback.hidden=false;
}

/** Visual preferences are device-local and never touch study data or cloud sync. */
export function installMascotCompanion():MascotCompanionApi{
  if(window.__YKS_MASCOT__)return window.__YKS_MASCOT__;
  let preference=readPreference(),idleTimer=0,animationTimer=0;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const brand=document.getElementById("refinedBrand");
  const originalMark=brand?.querySelector<SVGElement>("svg");
  const brandImage=document.createElement("img");brandImage.className="rb-mascot-brand";brandImage.alt="";brandImage.width=40;brandImage.height=40;
  if(brand)brand.prepend(brandImage);
  const strip=document.createElement("aside");strip.id="refinedCompanion";strip.className="rb-companion";strip.setAttribute("aria-label","Çalışma arkadaşın");
  strip.innerHTML='<span class="rb-companion-picture" aria-hidden="true"></span><span class="rb-companion-copy"><b></b><span></span></span><button type="button" class="rb-companion-choose" aria-label="Maskotunu seç">Değiştir <span aria-hidden="true">↗</span></button>';
  document.getElementById("mainWrap")?.prepend(strip);
  const picture=strip.querySelector<HTMLElement>(".rb-companion-picture")!;
  strip.addEventListener("error",handleImageError,true);
  const name=strip.querySelector<HTMLElement>(".rb-companion-copy b")!;
  const message=strip.querySelector<HTMLElement>(".rb-companion-copy>span")!;
  let dialog:HTMLDialogElement|null=null;
  const current=()=>MASCOTS.find(m=>m.id===preference.id)!;
  const focusRunning=()=>Boolean(document.querySelector('#focusCard[data-run="running"],#swCard[data-run="running"]'));
  const quiet=()=>!preference.enabled||document.hidden||reduced.matches||focusRunning()||!!dialog?.open;
  function stopMotion(){
    clearTimeout(idleTimer);clearTimeout(animationTimer);
    strip.classList.remove("is-greeting","is-idle");brandImage.classList.remove("is-greeting","is-idle");
  }
  function animate(kind:"greeting"|"idle"){
    if(quiet())return;
    strip.classList.add(`is-${kind}`);brandImage.classList.add(`is-${kind}`);
    clearTimeout(animationTimer);animationTimer=window.setTimeout(()=>{strip.classList.remove(`is-${kind}`);brandImage.classList.remove(`is-${kind}`);},1900);
  }
  function scheduleIdle(){
    clearTimeout(idleTimer);
    if(quiet())return;
    idleTimer=window.setTimeout(()=>{animate("idle");scheduleIdle();},55000+Math.round(Math.random()*20000));
  }
  function syncMotion(){
    const running=focusRunning();document.documentElement.dataset.mascotMotion=quiet()?"quiet":"ready";
    if(quiet())stopMotion();else scheduleIdle();
    message.textContent=running?"Sen odaklan, ben buradayım.":current().hello;
  }
  const watched=new WeakSet<Element>(),focusObserver=new MutationObserver(syncMotion);
  function watchFocus(){
    for(const card of document.querySelectorAll("#focusCard,#swCard"))if(!watched.has(card)){watched.add(card);focusObserver.observe(card,{attributes:true,attributeFilter:["data-run"]});}
    syncMotion();
  }
  function render(){
    const mascot=current();strip.hidden=!preference.enabled;brandImage.hidden=!preference.enabled;
    if(originalMark)originalMark.style.display=preference.enabled?"none":"";
    if(preference.enabled){
      if(brandImage.getAttribute("src")!==asset(mascot.id))brandImage.src=asset(mascot.id);
      if(picture.dataset.mascot!==mascot.id){picture.innerHTML=image(mascot.id);picture.dataset.mascot=mascot.id;}
      if(brandImage.complete&&!brandImage.naturalWidth){brandImage.hidden=true;if(originalMark)originalMark.style.display="";}
    }
    name.textContent=`${mascot.name} yanında`;
    document.documentElement.dataset.mascot=preference.enabled?mascot.id:"off";
    if(dialog){
      dialog.querySelectorAll<HTMLButtonElement>("[data-mascot-choice]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.mascotChoice===preference.id)));
      const toggle=dialog.querySelector<HTMLButtonElement>("[data-mascot-enabled]");toggle?.setAttribute("aria-checked",String(preference.enabled));
      const status=dialog.querySelector<HTMLElement>("[data-mascot-status]");if(status)status.textContent=preference.enabled?`${mascot.name} sana eşlik ediyor.`:"Maskot kapalı. İstediğinde tekrar açabilirsin.";
    }
    syncMotion();
  }
  function save(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(preference));}
    catch{ /* Remain usable for this session when browser storage is unavailable. */ }
    render();window.dispatchEvent(new CustomEvent("yks:mascot-change"));
  }
  function setEnabled(enabled:boolean){preference={...preference,enabled};save();if(enabled)animate("greeting");}
  function open(){
    if(dialog?.open){dialog.querySelector<HTMLElement>("[data-mascot-close]")?.focus();return;}
    const opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
    dialog=document.createElement("dialog");dialog.id="mascotChooser";dialog.className="rb-mascot-dialog";
    dialog.setAttribute("aria-labelledby","mascotChooserTitle");dialog.setAttribute("aria-describedby","mascotChooserDescription");
    dialog.innerHTML=`<div class="rb-mascot-dialog-head"><div><span class="rb-mascot-eyebrow">ÇALIŞMA ARKADAŞIN</span><h2 id="mascotChooserTitle">Sana kim eşlik etsin?</h2><p id="mascotChooserDescription">10 arkadaş, her birinin ayrı bir havası var.</p></div><button type="button" class="rb-mascot-close" data-mascot-close aria-label="Maskot seçimini kapat">×</button></div><div class="rb-mascot-grid" role="group" aria-label="Maskotlar">${MASCOTS.map(m=>`<button type="button" class="rb-mascot-option" data-mascot-choice="${m.id}" aria-pressed="false" aria-label="${m.name}, ${m.kind}">${image(m.id,true)}<b>${m.name}</b><small>${m.kind}</small><span class="rb-mascot-check" aria-hidden="true">✓</span></button>`).join("")}</div><div class="rb-mascot-preference"><span><b>Maskot bana eşlik etsin</b><small>Açılışta selamlar, odaklanırken sessizce bekler.</small></span><button type="button" class="rb-mascot-switch" data-mascot-enabled role="switch" aria-label="Maskot bana eşlik etsin" aria-checked="true"></button></div><div class="rb-mascot-dialog-foot"><p data-mascot-status role="status"></p><button type="button" class="rb-mascot-done" data-mascot-close>Tamam</button></div>`;
    const opened=dialog;
    opened.addEventListener("error",handleImageError,true);
    opened.addEventListener("keydown",event=>{event.stopPropagation();if(event.key==="Escape"){event.preventDefault();opened.close();}});
    for(const close of opened.querySelectorAll("[data-mascot-close]"))close.addEventListener("click",()=>opened.close());
    for(const choice of opened.querySelectorAll<HTMLButtonElement>("[data-mascot-choice]"))choice.addEventListener("click",()=>{
      const id=choice.dataset.mascotChoice;if(!knownId(id))return;preference={id,enabled:true};save();
    });
    opened.querySelector("[data-mascot-enabled]")?.addEventListener("click",()=>setEnabled(!preference.enabled));
    opened.addEventListener("click",event=>{if(event.target===opened){const rect=opened.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)opened.close();}});
    opened.addEventListener("close",()=>{
      opened.remove();if(dialog!==opened)return;dialog=null;render();
      const target=opener?.getClientRects().length?opener:brand;target?.focus({preventScroll:true});animate("greeting");
    },{once:true});
    document.body.append(opened);render();opened.showModal();syncMotion();
    opened.querySelector<HTMLElement>(`[data-mascot-choice="${preference.id}"]`)?.focus({preventScroll:true});
  }
  strip.querySelector("button")?.addEventListener("click",open);
  brandImage.addEventListener("error",()=>{brandImage.hidden=true;if(originalMark)originalMark.style.display="";});
  brandImage.addEventListener("load",()=>{brandImage.hidden=!preference.enabled;if(originalMark)originalMark.style.display=preference.enabled?"none":"";});
  window.addEventListener("storage",event=>{if(event.key===STORAGE_KEY||event.key===null){preference=readPreference();render();window.dispatchEvent(new CustomEvent("yks:mascot-change"));}});
  window.addEventListener("yks:navigation-after",watchFocus);
  window.addEventListener("yks:mascot-open",open);
  document.addEventListener("visibilitychange",syncMotion);reduced.addEventListener("change",syncMotion);
  const api:MascotCompanionApi={read:()=>({...preference,name:current().name}),open,setEnabled};window.__YKS_MASCOT__=api;
  render();watchFocus();animate("greeting");window.dispatchEvent(new CustomEvent("yks:mascot-change"));
  return api;
}
