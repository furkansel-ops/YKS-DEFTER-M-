import "./mascot-companion.css";
import type {MascotScene} from "./mascot-scene";
import {createMascotConversation,mascotConversationContext,type ConversationAction} from "./mascot-conversation";

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
const portraits=new Map<string,string>();
const knownId=(value:unknown):value is MascotId=>MASCOTS.some(m=>m.id===value);
function readPreference():Preference{
  try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");return {id:knownId(saved?.id)?saved.id:"book",enabled:saved?.enabled!==false};}
  catch{return {id:"book",enabled:true};}
}
const asset=(id:MascotId)=>new URL(`./mascots/${id==="book"?"notebook":id==="owl"?"owl-v2":id}.webp`,document.baseURI).href;
const image=(id:MascotId,lazy=false)=>`<img data-mascot-image="${id}" src="${portraits.get(id)||asset(id)}" alt="" width="112" height="112" decoding="async"${lazy?' loading="lazy"':""}><span class="rb-mascot-fallback" hidden aria-hidden="true">${MASCOTS.find(m=>m.id===id)!.name[0]}</span>`;
function handleImageError(event:Event){
  const img=event.target;if(!(img instanceof HTMLImageElement))return;
  img.hidden=true;const fallback=img.nextElementSibling;if(fallback instanceof HTMLElement&&fallback.classList.contains("rb-mascot-fallback"))fallback.hidden=false;
}

/** Visual preferences are device-local and never touch study data or cloud sync. */
export function installMascotCompanion():MascotCompanionApi{
  if(window.__YKS_MASCOT__)return window.__YKS_MASCOT__;
  let preference=readPreference(),animationTimer=0,chatOpen=false;
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const strip=document.createElement("aside");strip.id="refinedCompanion";strip.className="rb-companion";strip.setAttribute("aria-label","Çalışma arkadaşın");
  strip.innerHTML='<span class="rb-companion-bubble" aria-hidden="true"></span><section class="rb-companion-chat" aria-label="Çalışma arkadaşınla konuş" hidden><div class="rb-companion-chat-head"><span><b data-chat-name></b><small data-chat-status>Çalışma arkadaşın</small></span><button type="button" data-chat-close aria-label="Sohbeti kapat">×</button></div><div class="rb-companion-chat-log" data-chat-log aria-live="polite" aria-relevant="additions"></div><div class="rb-companion-actions" data-chat-actions><button type="button" data-chat-action="talk">Biraz konuşalım</button><button type="button" data-chat-action="today">Bugünkü programım</button><button type="button" data-chat-action="motivate">Motivasyon ver</button><button type="button" data-chat-action="study">Ne çalışayım?</button><button type="button" data-chat-action="break">Moladayım</button></div><form class="rb-companion-chat-form" data-chat-form hidden><input data-chat-input maxlength="180" autocomplete="off" placeholder="Nasıl gidiyor? Bir şey yaz…" aria-label="Mesajın"><button type="submit" aria-label="Gönder">Gönder</button></form></section><button type="button" class="rb-companion-mascot"><span class="rb-companion-picture" aria-hidden="true"></span><span class="rb-companion-shadow" aria-hidden="true"></span></button><span class="rb-mascot-sr" id="mascotDragHelp">Konuşmak için dokun. Yerini değiştirmek için sürükle; yön tuşlarıyla da taşıyabilirsin.</span>';
  document.body.append(strip);
  const picture=strip.querySelector<HTMLElement>(".rb-companion-picture")!;
  picture.dataset.renderer="fallback";picture.dataset.celebrations="0";
  let scene:MascotScene|null=null,loading=false,loadGeneration=0,failed3d=false,pendingCelebrationUntil=0;
  function refreshPortraits(){
    if(!scene||portraits.size===MASCOTS.length)return;
    for(const [id,url] of scene.previews(MASCOTS.map(m=>m.id)))portraits.set(id,url);
    document.querySelectorAll<HTMLImageElement>("[data-mascot-image]").forEach(img=>{const url=portraits.get(img.dataset.mascotImage||"");if(url){img.src=url;img.hidden=false;const fallback=img.nextElementSibling;if(fallback instanceof HTMLElement)fallback.hidden=true;}});
  }
  function ensure3d(){
    if(!preference.enabled||scene||loading||failed3d)return;
    const generation=++loadGeneration;loading=true;
    // Three.js stays outside the initial application bundle and disabled startup.
    import("./mascot-scene").then(({createMascotScene})=>{
      if(generation!==loadGeneration||!preference.enabled)return;
      scene=createMascotScene(picture,preference.id,()=>{scene=null;failed3d=true;picture.dataset.renderer="fallback";syncMotion();});
      if(dialog?.open)refreshPortraits();syncMotion();
    }).catch(()=>{if(generation===loadGeneration){failed3d=true;picture.dataset.renderer="fallback";syncMotion();}})
      .finally(()=>{if(generation===loadGeneration)loading=false;});
  }
  const mascotButton=strip.querySelector<HTMLButtonElement>(".rb-companion-mascot")!;
  mascotButton.setAttribute("aria-describedby","mascotDragHelp");
  strip.addEventListener("error",handleImageError,true);
  const message=strip.querySelector<HTMLElement>(".rb-companion-bubble")!;
  const chat=strip.querySelector<HTMLElement>(".rb-companion-chat")!,chatLog=strip.querySelector<HTMLElement>("[data-chat-log]")!,chatForm=strip.querySelector<HTMLFormElement>("[data-chat-form]")!,chatInput=strip.querySelector<HTMLInputElement>("[data-chat-input]")!;
  let dialog:HTMLDialogElement|null=null;
  const current=()=>MASCOTS.find(m=>m.id===preference.id)!;
  const focusRunning=()=>Boolean(document.querySelector('#focusCard[data-run="running"],#swCard[data-run="running"]'));
  const overlaySelector='dialog[open],.teachers-v2-overlay,.teachers-v2-player-overlay,.v42-recovery-backdrop,.v42-search-overlay,.v26-topic-modal,.v29-minimal-overlay,.simov,.qaviewer,.vidov,.playov,.brov,.gunov,.optikov,.anaov,.wizov,[role="dialog"][aria-modal="true"]';
  const overlayOpen=()=>Array.from(document.querySelectorAll<HTMLElement>(overlaySelector)).some(node=>node.getClientRects().length>0&&getComputedStyle(node).visibility!=="hidden");
  const editing=()=>document.activeElement instanceof HTMLElement&&document.activeElement.matches('textarea,input:not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]),[contenteditable="true"]');
  const keyboardOpen=()=>editing()&&(matchMedia("(pointer: coarse)").matches||(window.visualViewport?.height??innerHeight)<innerHeight-120);
  let obscured=false;
  const quiet=()=>!preference.enabled||document.hidden||reduced.matches||focusRunning()||obscured;
  function stopMotion(){
    clearTimeout(animationTimer);strip.classList.remove("is-greeting","is-celebrating");
  }
  function greet(){
    if(!preference.enabled||document.hidden||obscured)return;
    strip.classList.remove("is-greeting");void picture.offsetWidth;strip.classList.add("is-greeting");
    clearTimeout(animationTimer);scene?.mode("idle");syncMotion();animationTimer=window.setTimeout(()=>{strip.classList.remove("is-greeting");syncMotion();},2800);
  }
  function celebrate(){
    pendingCelebrationUntil=0;stopMotion();strip.classList.add("is-celebrating");
    scene?.mode(reduced.matches?"quiet":"celebrate",true);
    picture.dataset.celebrations=String(Number(picture.dataset.celebrations||0)+1);
    message.textContent="Harika! Bir görev daha tamamlandı.";
    animationTimer=window.setTimeout(()=>{strip.classList.remove("is-celebrating");syncMotion();},3600);
  }
  const conversation=createMascotConversation(`${preference.id}:${Math.random()}`);
  const context=()=>{let state:unknown;try{state=window.YKSLegacyState?.readState?.();}catch{/* Read failures leave conversation usable without inventing a plan. */}return mascotConversationContext(state,new Date(),current().name,focusRunning());};
  function refreshChatStatus(){const data=context(),status=strip.querySelector<HTMLElement>("[data-chat-status]");if(status)status.textContent=data.tasks.length?`Bugün ${data.tasks.filter(task=>task.done).length}/${data.tasks.length} görev tamamlandı`:"Çalışma arkadaşın · Buradayım";}
  const addChat=(who:"mascot"|"user",text:string,id=preference.id)=>{const wrap=document.createElement("div");wrap.className=`rb-chat-row is-${who}`;if(who==="mascot"){const avatar=document.createElement("span");avatar.className="rb-chat-avatar";avatar.innerHTML=image(id,true);wrap.append(avatar);}const row=document.createElement("p");row.className=`rb-chat-message is-${who}`;row.textContent=text;wrap.append(row);chatLog.append(wrap);while(chatLog.childElementCount>44)chatLog.firstElementChild?.remove();chatLog.scrollTop=chatLog.scrollHeight;};
  let replyTimer=0,pendingReply:{text:string;id:MascotId;typing:HTMLElement}|null=null;
  function setChatBusy(busy:boolean){chatLog.setAttribute("aria-busy",String(busy));chat.querySelectorAll<HTMLButtonElement>("[data-chat-action],button[type=submit]").forEach(button=>button.disabled=busy);}
  function finishReply(){clearTimeout(replyTimer);replyTimer=0;const pending=pendingReply;pendingReply=null;if(pending){pending.typing.remove();addChat("mascot",pending.text,pending.id);}setChatBusy(false);positionChat();}
  function respond(value:string,action?:ConversationAction){
    // Keep reply order and the next draft intact when Enter is pressed twice.
    if(pendingReply)return false;
    const reply=conversation.reply(value,context(),action);if(value)addChat("user",value);
    const typing=document.createElement("div");typing.className="rb-chat-row is-mascot rb-chat-typing-row";typing.setAttribute("aria-hidden","true");typing.innerHTML=`<span class="rb-chat-avatar">${image(preference.id,true)}</span><span class="rb-chat-typing"><i></i><i></i><i></i></span>`;chatLog.append(typing);chatLog.scrollTop=chatLog.scrollHeight;
    pendingReply={text:reply,id:preference.id,typing};setChatBusy(true);replyTimer=window.setTimeout(finishReply,reduced.matches?0:420);refreshChatStatus();positionChat();return true;
  }
  function openChat(){chatOpen=true;chat.hidden=false;chatForm.hidden=false;strip.classList.add("is-chatting");strip.classList.remove("is-greeting");refreshPortraits();const n=strip.querySelector<HTMLElement>("[data-chat-name]");if(n)n.textContent=current().name;if(!chatLog.childElementCount)addChat("mascot",conversation.greeting(context()));refreshChatStatus();positionChat();syncMotion();}
  function closeChat(){finishReply();if(document.activeElement instanceof HTMLElement&&chat.contains(document.activeElement))document.activeElement.blur();chatOpen=false;chat.hidden=true;strip.classList.remove("is-chatting","is-typing");chatForm.hidden=true;syncMotion();}
  function syncMotion(){
    obscured=overlayOpen()||(!chatOpen&&keyboardOpen());strip.dataset.obscured=String(obscured);
    strip.inert=obscured;const running=focusRunning();document.documentElement.dataset.mascotMotion=quiet()?"quiet":"ready";
    if(quiet()&&(!reduced.matches||!preference.enabled||document.hidden||running||obscured))stopMotion();
    if(pendingCelebrationUntil>Date.now()&&preference.enabled&&!document.hidden&&!running&&!obscured&&!strip.classList.contains("is-dragging"))celebrate();
    else if(pendingCelebrationUntil&&pendingCelebrationUntil<=Date.now())pendingCelebrationUntil=0;
    const mode=strip.classList.contains("is-dragging")?"paused":quiet()?"quiet":strip.classList.contains("is-celebrating")?"celebrate":strip.classList.contains("is-greeting")?"greet":chatOpen?"chat":"idle";
    scene?.mode(mode);if(!scene)picture.dataset.action=mode;
    message.textContent=strip.classList.contains("is-celebrating")?"Harika! Bir görev daha tamamlandı.":running?"Sen odaklan, ben buradayım.":current().hello;
  }
  const watched=new WeakSet<Element>(),focusObserver=new MutationObserver(syncMotion),overlays=new WeakSet<Element>(),overlayObserver=new MutationObserver(syncMotion);
  function watchFocus(){
    for(const card of document.querySelectorAll("#focusCard,#swCard"))if(!watched.has(card)){watched.add(card);focusObserver.observe(card,{attributes:true,attributeFilter:["data-run"]});}
    for(const overlay of document.querySelectorAll(`${overlaySelector},dialog`))if(!overlays.has(overlay)){overlays.add(overlay);overlayObserver.observe(overlay,{attributes:true,attributeFilter:["style","class","hidden","aria-hidden","open"]});}
    syncMotion();
  }
  function render(){
    const mascot=current();strip.hidden=!preference.enabled;
    if(preference.enabled){
      if(picture.dataset.mascot!==mascot.id){
        scene?.character(mascot.id);picture.querySelectorAll("img,.rb-mascot-fallback").forEach(node=>node.remove());picture.insertAdjacentHTML("afterbegin",image(mascot.id));picture.dataset.mascot=mascot.id;
        const name=strip.querySelector<HTMLElement>("[data-chat-name]");if(name)name.textContent=mascot.name;
      }
      clampPosition();
      ensure3d();
    }else{++loadGeneration;loading=false;scene?.dispose();scene=null;picture.dataset.renderer="fallback";closeChat();pendingCelebrationUntil=0;}
    mascotButton.setAttribute("aria-label",`${mascot.name} ile konuş`);
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
  function setEnabled(enabled:boolean){preference={...preference,enabled};save();if(enabled)greet();}
  function open(){
    if(dialog?.open){dialog.querySelector<HTMLElement>("[data-mascot-close]")?.focus();return;}
    const opener=document.activeElement instanceof HTMLElement?document.activeElement:null;
    dialog=document.createElement("dialog");dialog.id="mascotChooser";dialog.className="rb-mascot-dialog";
    dialog.setAttribute("aria-labelledby","mascotChooserTitle");dialog.setAttribute("aria-describedby","mascotChooserDescription");
    refreshPortraits();
    dialog.innerHTML=`<div class="rb-mascot-dialog-head"><div><span class="rb-mascot-eyebrow">ÇALIŞMA ARKADAŞIN</span><h2 id="mascotChooserTitle">Sana kim eşlik etsin?</h2><p id="mascotChooserDescription">10 hareketli arkadaş. Boşta oynar, görevlerini bitirdiğinde seninle kutlar.</p></div><button type="button" class="rb-mascot-close" data-mascot-close aria-label="Maskot seçimini kapat">×</button></div><div class="rb-mascot-grid" role="group" aria-label="Maskotlar">${MASCOTS.map(m=>`<button type="button" class="rb-mascot-option" data-mascot-choice="${m.id}" aria-pressed="false" aria-label="${m.name}, ${m.kind}">${image(m.id,true)}<b>${m.name}</b><small>${m.kind}</small><span class="rb-mascot-check" aria-hidden="true">✓</span></button>`).join("")}</div><div class="rb-mascot-preference"><span><b>Maskot bana eşlik etsin</b><small>Selamlar, kutlar; odaklanırken sessizce bekler.</small></span><button type="button" class="rb-mascot-switch" data-mascot-enabled role="switch" aria-label="Maskot bana eşlik etsin" aria-checked="true"></button></div><div class="rb-mascot-dialog-foot"><p data-mascot-status role="status"></p><button type="button" class="rb-mascot-done" data-mascot-close>Tamam</button></div>`;
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
      const target=opener?.getClientRects().length?opener:document.getElementById("refinedProfile");target?.focus({preventScroll:true});greet();
    },{once:true});
    document.body.append(opened);render();opened.showModal();syncMotion();
    opened.querySelector<HTMLElement>(`[data-mascot-choice="${preference.id}"]`)?.focus({preventScroll:true});
  }
  // Keep the small companion movable without turning a drag into a greeting.
  let drag:{id:number;x:number;y:number;left:number;top:number;moved:boolean}|null=null,suppressClickUntil=0;
  function positionChat(){
    if(!chatOpen)return;
    if(innerWidth<760){for(const name of ["position","left","right","top","bottom","width","max-height"])chat.style.removeProperty(name);chat.dataset.below="false";chat.style.removeProperty("--chat-arrow-right");return;}
    const rect=strip.getBoundingClientRect(),nav=document.querySelector(".tabbar")?.getBoundingClientRect(),header=document.querySelector(".navbar")?.getBoundingClientRect();
    const width=Math.min(360,innerWidth-24),minTop=(header?.bottom??0)+12,minLeft=Math.min(innerWidth-width-12,Math.max(12,(nav?.right??0)+12));
    chat.style.position="fixed";chat.style.width=`${width}px`;chat.style.maxHeight=`${Math.max(120,innerHeight-minTop-12)}px`;chat.style.right="auto";chat.style.bottom="auto";
    const height=chat.offsetHeight,left=Math.max(minLeft,Math.min(rect.right-width,innerWidth-width-12)),below=rect.top-height-8<minTop&&rect.bottom+8+height<=innerHeight-12;
    const preferred=below?rect.bottom+8:rect.top-height-8,top=Math.max(minTop,Math.min(preferred,innerHeight-height-12));
    chat.style.left=`${left}px`;chat.style.top=`${top}px`;chat.dataset.below=String(below);chat.style.setProperty("--chat-arrow-right",`${Math.max(22,Math.min(width-22,left+width-(rect.left+rect.width/2)))}px`);
  }
  function place(left:number,top:number){
    const nav=document.querySelector(".tabbar")?.getBoundingClientRect(),header=document.querySelector(".navbar")?.getBoundingClientRect();
    const mobile=innerWidth<760,minX=mobile?8:(nav?.right??0)+12,minY=(header?.bottom??0)+18;
    const maxX=Math.max(minX,innerWidth-strip.offsetWidth-8),maxY=Math.max(minY,(mobile?(nav?.top??innerHeight):innerHeight)-strip.offsetHeight-14);
    const x=Math.min(Math.max(left,minX),maxX),y=Math.min(Math.max(top,minY),maxY);
    strip.style.left=`${x}px`;strip.style.top=`${y}px`;strip.style.right="auto";strip.style.bottom="auto";
    strip.style.setProperty("--bubble-shift",`${Math.max(0,198-x-strip.offsetWidth)}px`);
    strip.dataset.nearTop=String(y<(header?.bottom??0)+90);
    positionChat();
  }
  function clampPosition(){
    if(!strip.hidden&&strip.style.left)place(parseFloat(strip.style.left),parseFloat(strip.style.top));
  }
  mascotButton.addEventListener("pointerdown",event=>{
    if(event.button!==0||!event.isPrimary)return;const rect=strip.getBoundingClientRect();
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,moved:false};
    mascotButton.setPointerCapture(event.pointerId);
  });
  mascotButton.addEventListener("pointermove",event=>{
    if(!drag||drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<8)return;
    drag.moved=true;strip.classList.add("is-dragging");place(drag.left+dx,drag.top+dy);syncMotion();
  });
  const endDrag=()=>{if(drag?.moved)suppressClickUntil=Date.now()+500;drag=null;strip.classList.remove("is-dragging");syncMotion();};
  mascotButton.addEventListener("pointerup",endDrag);mascotButton.addEventListener("pointercancel",endDrag);mascotButton.addEventListener("lostpointercapture",endDrag);
  chat.addEventListener("pointerdown",event=>event.stopPropagation());
  chat.addEventListener("click",event=>event.stopPropagation());
  chatInput.addEventListener("pointerdown",event=>event.stopPropagation());
  chatInput.addEventListener("focus",()=>{strip.classList.add("is-typing");obscured=false;strip.inert=false;});
  // Keep the form anchored during submit: mobile blur happens before click.
  // Moving it on blur used to place the mascot over the Send button.
  strip.querySelector("[data-chat-close]")?.addEventListener("click",closeChat);
  strip.querySelectorAll<HTMLButtonElement>("[data-chat-action]").forEach(button=>button.addEventListener("click",()=>{const action=button.dataset.chatAction as ConversationAction;respond("",action);if(action==="talk")chatInput.focus();}));
  chatForm.addEventListener("submit",event=>{event.preventDefault();const value=chatInput.value.trim().slice(0,180);if(value&&respond(value))chatInput.value="";});
  chat.addEventListener("keydown",event=>{event.stopPropagation();if(event.key==="Escape"){event.preventDefault();closeChat();mascotButton.focus({preventScroll:true});}});
  mascotButton.addEventListener("click",()=>{if(Date.now()>suppressClickUntil){if(chatOpen)closeChat();else openChat();}});
  mascotButton.addEventListener("keydown",event=>{
    if(event.key==="Enter"||event.key===" "){event.stopPropagation();return;}
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;event.preventDefault();event.stopPropagation();
    const rect=strip.getBoundingClientRect(),step=24;place(rect.left+(event.key==="ArrowLeft"?-step:event.key==="ArrowRight"?step:0),rect.top+(event.key==="ArrowUp"?-step:event.key==="ArrowDown"?step:0));
  });
  window.addEventListener("storage",event=>{if(event.key===STORAGE_KEY||event.key===null){preference=readPreference();render();window.dispatchEvent(new CustomEvent("yks:mascot-change"));}});
  window.addEventListener("yks:navigation-after",watchFocus);
  window.addEventListener("yks:mascot-open",open);
  window.addEventListener("yks:data-changed",()=>{if(chatOpen)refreshChatStatus();});
  window.addEventListener("yks:task-completed",()=>{if(chatOpen)refreshChatStatus();if(!preference.enabled)return;pendingCelebrationUntil=Date.now()+30000;syncMotion();});
  window.addEventListener("pagehide",()=>{finishReply();++loadGeneration;loading=false;scene?.dispose();scene=null;picture.dataset.renderer="fallback";});
  window.addEventListener("pageshow",ensure3d);
  document.addEventListener("visibilitychange",syncMotion);reduced.addEventListener("change",syncMotion);
  document.addEventListener("focusin",syncMotion);document.addEventListener("focusout",()=>queueMicrotask(syncMotion));
  window.visualViewport?.addEventListener("resize",syncMotion);
  window.addEventListener("resize",()=>{clampPosition();positionChat();syncMotion();});
  // Only direct body insertions and known overlay attributes are observed; mascot renders never retrigger this observer.
  new MutationObserver(watchFocus).observe(document.body,{childList:true});
  const api:MascotCompanionApi={read:()=>({...preference,name:current().name}),open,setEnabled};window.__YKS_MASCOT__=api;
  render();watchFocus();greet();window.dispatchEvent(new CustomEvent("yks:mascot-change"));
  return api;
}
