/* v119 · Ayarlar › Tekrar aralıkları: pekişen konunun kaçıncı günlerde tekrar listesine düşeceği (varsayılan 3, 7, 21).
   Değer app.js'teki setReviewGaps ile S.studyPrefs.reviewGaps'e yazılır; doğrulama orada (1–120, artan, 3 adım).
   index.html boyut sınırı nedeniyle kart buradan eklenir (Bildirimler kartının üstüne). */
type LegacyWindow=Window&Record<string,any>&{YKSLegacyState?:{reviewGaps?:()=>number[]}};
const L=window as unknown as LegacyWindow;
const DEFAULTS=[3,7,21],IDS=["reviewGap1","reviewGap2","reviewGap3"];
let installed=false;

function toast(text:string):void{try{(L.toast as ((t:string)=>void)|undefined)?.(text);}catch{}}
function current():number[]{try{const g=L.YKSLegacyState?.reviewGaps?.();return Array.isArray(g)&&g.length===3?g:DEFAULTS;}catch{return DEFAULTS;}}
function fill():void{const g=current();IDS.forEach((id,i)=>{const input=document.getElementById(id) as HTMLInputElement|null;if(input&&document.activeElement!==input)input.value=String(g[i]);});}
function apply(values:number[]):void{
  const ok=typeof L.setReviewGaps==="function"&&(L.setReviewGaps as (g:number[])=>boolean)(values);
  toast(ok?`Tekrar aralıkları: ${values.join(", ")}. gün`:"Günler 1–120 arasında ve küçükten büyüğe olmalı (örn. 3, 7, 21)");
  if(ok)fill();
}
function mount():void{
  const anchor=document.getElementById("notifStatus")?.closest(".card");
  if(!anchor||document.getElementById("reviewGapsCard"))return;
  const card=document.createElement("div");card.className="card";card.id="reviewGapsCard";
  card.innerHTML=`<p class="eyebrow">Tekrar aralıkları</p>
    <p class="hint">Bir konuyu 3. kademeye aldıktan kaç gün sonra tekrar listene düşsün? Üç tekrar da küçükten büyüğe olmalı.</p>
    <div class="row2">${IDS.map((id,i)=>`<div><label for="${id}">${i+1}. tekrar (gün)</label><input type="number" id="${id}" min="1" max="120" inputmode="numeric"></div>`).join("")}</div>
    <div class="row2" style="margin-top:10px"><button type="button" class="btn green small" data-gaps="save">Kaydet</button><button type="button" class="btn ghost small" data-gaps="reset">Varsayılan (3, 7, 21)</button></div>`;
  card.addEventListener("click",event=>{
    const act=(event.target as HTMLElement).closest<HTMLElement>("[data-gaps]")?.dataset.gaps;
    if(act==="save")apply(IDS.map(id=>Number((document.getElementById(id) as HTMLInputElement|null)?.value)));
    else if(act==="reset")apply(DEFAULTS.slice());
  });
  anchor.before(card);fill();
}

export function installReviewGapsV119():void{
  if(installed)return;installed=true;
  mount();
  const base=L.renderSettings as (()=>void)|undefined;
  if(typeof base==="function")L.renderSettings=()=>{base();mount();fill();};
}
