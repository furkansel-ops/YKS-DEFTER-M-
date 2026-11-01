import "./about-v78.css";
import {ABOUT_NEWS,NEWS_VISIBLE,SUPPORT_URL,dataState,diagnosticsText,releaseDateLabel} from "../domain/about-info.ts";
import {RELEASE_BUILD,RELEASE_DATE,RELEASE_VERSION} from "../release/version.ts";

/* v78 · Hakkında: amaç, sürüm ve güncelleme denetimi, bölüm kısayolları, son yenilikler, verilerin
   nerede durduğu, destek ve kurulum durumu tek sayfada. Öğrenci verisine yazmaz. Eski panel öğeleri
   (#appVersionLabel, #v30AboutSchema, #v4PwaCard) eski kodlar için yerinde kalır, yalnız gizlenir. */

type RenderFn=((...args:unknown[])=>unknown)&{__v78?:boolean};
type AboutWindow=Window&{
  go?:(screen:string)=>void;v30Action?:(action:string)=>void;toast?:(message:string)=>void;exportData?:()=>unknown;
  checkRemoteVersion?:()=>Promise<boolean>;remoteVersionIsNewer?:(value:unknown)=>boolean;v4InstallApp?:()=>Promise<boolean>;
  __YKS_PWA__?:{installState?:()=>string};v30RenderAbout?:RenderFn;
};
const win=()=>window as AboutWindow;
const esc=(value:unknown)=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));

const TILES=[
  {action:"go:program",icon:"▦",title:"Program ve odak",text:"Günlük plan, odak sayacı, hedef"},
  {action:"go:deneme",icon:"⌁",title:"Deneme ve hatalar",text:"Analiz, karşılaştırma, hata defteri"},
  {action:"go:topics",icon:"▤",title:"Konular ve ilerleme",text:"Konu durumu, tekrarlar, haftalık gidiş"},
  {action:"go:pp",icon:"¶",title:"Paragraf ve problem",text:"Günlük hedef, hızlı giriş"},
  {action:"settings:achievements",icon:"★",title:"Kariyer ve rank",text:"Seviye, XP, deneme rankı"},
  {action:"settings:coach",icon:"☺",title:"Koçunla çalış",text:"Program, mesaj, randevu"}
] as const;

function syncState():string{return String(document.getElementById("cloudSyncBox")?.dataset.state||"signedout");}
function installState():string{
  try{const state=win().__YKS_PWA__?.installState?.();if(state)return state;}catch{}
  return document.getElementById("v4PwaCard")?.dataset.state||"manual";
}
function openSettings(category:string):void{
  win().v30Action?.("settings");window.dispatchEvent(new CustomEvent("yks:open-settings",{detail:{category}}));
}
const row=(action:string,icon:string,title:string,text:string,end="›",tone="")=>
  `<button type="button" class="ab78-row" data-ab78="${action}"><span class="ab78-ico${tone?" is-"+tone:""}" aria-hidden="true">${icon}</span><span><b>${esc(title)}</b><small>${esc(text)}</small></span><i aria-hidden="true">${end}</i></button>`;
const info=(icon:string,title:string,text:string,tone="",extra="")=>
  `<div class="ab78-row is-static"><span class="ab78-ico${tone?" is-"+tone:""}" aria-hidden="true">${icon}</span><span><b>${esc(title)}</b><small>${esc(text)}</small></span>${extra||"<i></i>"}</div>`;

function installRow():string{
  const state=installState();
  if(state==="installed")return info("↧","Bu cihazda kurulu","Ana ekrandan açılıyor, çevrimdışı çalışır","ok");
  if(state==="installable")return info("↧","Uygulamayı kur","Ana ekrandan tek dokunuşla aç","",`<button type="button" class="ab78-mini" data-ab78="install">Kur</button>`);
  const hint=document.getElementById("v4PwaCopy")?.textContent?.trim()||"Tarayıcı menüsünden \"Ana ekrana ekle\" adımını kullan.";
  return info("↧","Ana ekrana ekle",hint);
}

function markup():string{
  const data=dataState(syncState(),navigator.onLine);
  const news=ABOUT_NEWS.map((item,index)=>`<li${index>=NEWS_VISIBLE?" hidden data-ab78-extra":""}><small>${esc(item.when)}</small><span><b>${esc(item.title)}</b><em>${esc(item.text)}</em></span></li>`).join("");
  const dataRow=data.guest?row("account","!",data.title,data.text,"Hesap aç ›","warn"):info(data.tone==="ok"?"✓":"!",data.title,data.text,data.tone);
  return `<section class="ab78-hero" aria-label="YKS Defterim">
    <div class="ab78-id"><span class="ab78-mark" aria-hidden="true">YD</span><div><h2>YKS Defterim</h2><p>YKS'ye hazırlanırken çalışmanı, denemelerini ve ilerlemeni tek yerde takip et.</p></div></div>
    <div class="ab78-ver"><span><b>Sürüm ${esc(RELEASE_VERSION)}</b><small>Kararlı · ${esc(releaseDateLabel(RELEASE_DATE))}</small></span><button type="button" data-ab78="update">Güncellemeleri denetle</button></div>
    <p class="ab78-update" role="status" hidden></p>
  </section>
  <section aria-label="Neler yapabilirsin"><h2 class="ab78-label">Neler yapabilirsin</h2>
    <div class="ab78-tiles">${TILES.map(tile=>`<button type="button" class="ab78-tile" data-ab78="${tile.action}"><i aria-hidden="true">${tile.icon}</i><b>${esc(tile.title)}</b><small>${esc(tile.text)}</small></button>`).join("")}</div>
  </section>
  <section aria-label="Son yenilikler"><h2 class="ab78-label">Son yenilikler</h2>
    <div class="ab78-news"><ul>${news}</ul>${ABOUT_NEWS.length>NEWS_VISIBLE?`<button type="button" class="ab78-more" data-ab78="news" aria-expanded="false">Tümünü gör</button>`:""}</div>
  </section>
  <section aria-label="Verilerin"><h2 class="ab78-label">Verilerin</h2>
    <div class="ab78-list">${dataRow}
      ${data.guest?"":row("coach","☺","Koçun yalnız özetleri görür","Paylaştığın çalışma, deneme ve rank özetleri")}
      ${row("export","↓","Verilerimi indir","Tüm kayıtlarını dosya olarak sakla")}
      <div class="ab78-links"><a href="./privacy.html" target="_blank" rel="noopener">Gizlilik politikası ↗</a><a href="./data-deletion.html" target="_blank" rel="noopener">Veri silme ↗</a></div>
    </div>
  </section>
  <section aria-label="Destek"><h2 class="ab78-label">Destek</h2>
    <div class="ab78-list"><a class="ab78-row" href="${SUPPORT_URL}" target="_blank" rel="noopener"><span class="ab78-ico" aria-hidden="true">?</span><span><b>Sorun bildir</b><small>Destek sayfası açılır (herkese açık)</small></span><i aria-hidden="true">↗</i></a>
      ${row("copy","⧉","Tanılama bilgisini kopyala","Sürüm, cihaz, kurulum ve eşitleme durumu")}</div>
    <p class="ab78-hint ab78-support-hint">Bildirime e-posta, şifre ya da kişisel bilgi yazma. Tanılama bilgisinde kişisel veri yok.</p>
  </section>
  <section aria-label="Uygulama"><h2 class="ab78-label">Uygulama</h2><div class="ab78-list">${installRow()}</div></section>
  <p class="ab78-foot">Furkan Sel tarafından geliştirildi · © 2026</p>`;
}

async function checkUpdate(button:HTMLButtonElement,output:HTMLElement):Promise<void>{
  button.disabled=true;button.textContent="Denetleniyor…";
  let message="Denetlenemedi · bağlantını kontrol edip tekrar dene";
  try{
    if(!navigator.onLine)throw new Error("offline");
    const response=await fetch(`./version.json?about=${Date.now()}`,{cache:"no-store"});
    if(!response.ok)throw new Error(String(response.status));
    const remote=await response.json() as {build?:unknown;version?:unknown};
    const w=win(),newer=w.remoteVersionIsNewer?.(String(remote.build||remote.version||""))===true;
    if(newer){await w.checkRemoteVersion?.();message="Yeni sürüm hazır · ekrandaki Güncelle düğmesine dokun";}
    else message="✓ En güncel sürümü kullanıyorsun";
  }catch{}
  output.hidden=false;output.textContent=message;button.disabled=false;button.textContent="Güncellemeleri denetle";
}
async function copyDiagnostics():Promise<void>{
  const text=diagnosticsText({version:RELEASE_VERSION,build:RELEASE_BUILD,channel:"Kararlı",
    schema:document.getElementById("v30AboutSchema")?.textContent?.trim()||"",install:installState(),sync:syncState(),online:navigator.onLine,
    screen:`${window.innerWidth}×${window.innerHeight}`,userAgent:navigator.userAgent,date:new Date().toISOString()});
  let copied=false;
  try{await navigator.clipboard.writeText(text);copied=true;}catch{
    try{const area=document.createElement("textarea");area.value=text;area.setAttribute("readonly","");area.className="ab78-copy";document.body.append(area);area.select();copied=document.execCommand("copy");area.remove();}catch{copied=false;}
  }
  if(copied){win().toast?.("Tanılama bilgisi kopyalandı");return;}
  // Pano izni yoksa metin seçilebilir kutuda gösterilir; öğrenci elle kopyalar.
  const hint=document.querySelector<HTMLElement>("#v30AboutPanel .ab78-support-hint");if(!hint)return;
  let box=hint.parentElement?.querySelector<HTMLTextAreaElement>(".ab78-diag");
  if(!box){box=document.createElement("textarea");box.className="ab78-diag";box.readOnly=true;box.rows=8;box.setAttribute("aria-label","Tanılama bilgisi");hint.before(box);}
  box.value=text;box.focus();box.select();
  win().toast?.("Kopyalanamadı · metni seçip kopyala");
}
function exportAll():void{
  try{const result=win().exportData?.();if(result instanceof Promise)result.catch(()=>win().toast?.("Veri dosyası hazırlanamadı"));}
  catch{win().toast?.("Veri dosyası hazırlanamadı");}
}

function onClick(event:Event):void{
  const target=(event.target as Element|null)?.closest<HTMLElement>("[data-ab78]");if(!target)return;
  const action=target.dataset.ab78||"",w=win();
  if(action.startsWith("go:")){w.go?.(action.slice(3));return;}
  if(action.startsWith("settings:")){openSettings(action.slice(9));return;}
  if(action==="update"){const output=target.closest(".ab78-hero")?.querySelector<HTMLElement>(".ab78-update");if(output)void checkUpdate(target as HTMLButtonElement,output);return;}
  if(action==="news"){
    const open=target.getAttribute("aria-expanded")!=="true";
    target.closest(".ab78-news")?.querySelectorAll<HTMLElement>("[data-ab78-extra]").forEach(item=>{item.hidden=!open;});
    target.setAttribute("aria-expanded",String(open));target.textContent=open?"Daha az göster":"Tümünü gör";return;
  }
  if(action==="account"){openSettings("account");return;}
  if(action==="coach"){openSettings("coach");return;}
  if(action==="export"){exportAll();return;}
  if(action==="copy"){void copyDiagnostics();return;}
  if(action==="install"){void Promise.resolve(w.v4InstallApp?.()).finally(()=>renderAbout());}
}

export function renderAbout():void{
  const panel=document.getElementById("v30AboutPanel");if(!panel)return;
  let root=panel.querySelector<HTMLElement>(":scope > .ab78");
  if(!root){root=document.createElement("div");root.className="ab78";root.addEventListener("click",onClick);panel.append(root);}
  panel.dataset.aboutV78="ready";root.innerHTML=markup();
}

export function installAboutV78():{installed:boolean}{
  const w=win(),original=w.v30RenderAbout;
  if(typeof original==="function"&&!original.__v78){
    w.v30RenderAbout=Object.assign((...args:unknown[])=>{
      const result=original(...args);
      try{renderAbout();}catch(error){console.error("v78 Hakkında",error);}
      return result;
    },{__v78:true});
  }
  renderAbout();
  return {installed:!!document.getElementById("v30AboutPanel")};
}
