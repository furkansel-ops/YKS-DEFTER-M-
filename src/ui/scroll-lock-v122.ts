/* v122 · Ekranı kaplayan pencere (profil, konu detayı, deneme formu …) açıkken arkadaki sayfa kaymaz:
   sağda iki kaydırma çubuğu yerine yalnız pencereninki kalır. Pencereleri tek tek saymak yerine
   ekranın ortasındaki öğenin ekranı kaplayan sabit (fixed) bir atası var mı diye bakar. */
let timer=0;

export function coversViewport(start:Element|null,w:number,h:number):boolean{
  for(let e=start;e&&e!==document.body&&e!==document.documentElement;e=e.parentElement){
    if(getComputedStyle(e).position!=="fixed")continue;
    const r=e.getBoundingClientRect();
    if(r.width>=w*0.9&&r.height>=h*0.9)return true;
  }
  return false;
}

function sync():void{
  timer=0;
  const w=window.innerWidth,h=window.innerHeight;
  document.documentElement.toggleAttribute("data-overlay-open",coversViewport(document.elementFromPoint(w/2,h/2),w,h));
}
const schedule=()=>{if(!timer)timer=window.setTimeout(sync,60);};

export function installScrollLockV122():void{
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","hidden","style","open","aria-hidden"]});
  window.addEventListener("resize",schedule);
  sync();
}
