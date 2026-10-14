/* Ayarlar → Görünüm: the whole theme card is a reliable touch target.
   Delegation survives the modern settings panel moving the original fieldset. */
const YKS_CARD_THEMES=new Set(["auto","refined-blue","paper","night","forest","ocean","lavender","sunset","graphite"]);
let themeCardsInstalled=false;
export function installThemeCardInteractionV46():{installed:boolean}{
  if(themeCardsInstalled)return {installed:true};
  themeCardsInstalled=true;
  const choose=(value:string)=>{
    if(!YKS_CARD_THEMES.has(value))return;
    const legacy=window as Window & {setTheme?:(theme:string)=>unknown;applyTheme?:()=>void};
    try{
      if(typeof legacy.setTheme==="function")legacy.setTheme(value);
      else console.warn("Tema seçici henüz hazır değil");
    }catch(error){console.error("Tema seçimi uygulanamadı",error);}
  };
  document.addEventListener("click",event=>{
    const target=event.target;
    if(!(target instanceof Element))return;
    const card=target.closest("#appearancePreferences .yks-theme-choice");
    if(!card)return;
    const input=card.querySelector('input[name="yksTheme"]');
    if(!(input instanceof HTMLInputElement)||input.disabled)return;
    if(target!==input){
      // Prevent label's delayed synthetic click from re-selecting an old radio.
      event.preventDefault();
      input.focus({preventScroll:true});
    }
    choose(input.value);
  });
  document.addEventListener("change",event=>{
    const input=event.target;
    if(!(input instanceof HTMLInputElement)||input.name!=="yksTheme")return;
    if(!input.closest("#appearancePreferences"))return;
    choose(input.value);
  });
  return {installed:true};
}
