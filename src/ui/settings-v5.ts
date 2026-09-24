import "./settings-v5.css";

type MoreDetail={to?:string};

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}

function createQuickNav(root:HTMLElement):HTMLElement{
  const existing=root.querySelector<HTMLElement>("[data-v5-settings-quick]");
  if(existing)return existing;

  const nav=document.createElement("nav");
  nav.className="v5-settings-quick";
  nav.dataset.v5SettingsQuick="true";
  nav.setAttribute("aria-label","Ayarlar kısayolları");

  const items=[
    ["ymsAppearance","◐","Görünüm","Tema ve yazı"],
    ["ymsProfile","◎","Hedefler","Profil ve YKS"],
    ["ymsNotifications","◌","Bildirim","Hatırlatmalar"],
    ["ymsApplication","⌁","Uygulama","Veri ve sistem"]
  ] as const;

  for(const [target,icon,title,copy] of items){
    const button=document.createElement("button");
    button.type="button";
    button.dataset.v5SettingsJump=target;
    button.innerHTML='<i>'+icon+'</i><span><b>'+title+'</b><small>'+copy+'</small></span>';
    button.addEventListener("click",()=>{
      document.getElementById(target)?.scrollIntoView({behavior:"smooth",block:"start"});
    });
    nav.appendChild(button);
  }

  const content=root.querySelector<HTMLElement>(".yms-content");
  const hero=content?.querySelector<HTMLElement>(".yms-hero");
  if(hero)hero.insertAdjacentElement("afterend",nav);
  else content?.prepend(nav);
  return nav;
}

function enhanceThemeCards(root:HTMLElement):void{
  const appearance=root.querySelector<HTMLElement>("#ymsAppearance");
  const grid=appearance?.querySelector<HTMLElement>("#themeGrid");
  if(!grid)return;
  grid.dataset.v5ThemeGrid="true";
  const labels:Record<string,string>={
    thAuto:"Cihaz temasını otomatik takip eder",
    thPaper:"Açık, nötr ve uzun çalışma için",
    thNight:"Gece çalışırken daha düşük parlaklık",
    thForest:"Sakin yeşil tonlar",
    thOcean:"Serin mavi tonlar",
    thLavender:"Yumuşak mor tonlar",
    thSunset:"Sıcak turuncu tonlar",
    thGraphite:"Koyu ve nötr çalışma alanı"
  };
  grid.querySelectorAll<HTMLElement>(".theme-card").forEach(card=>{
    card.dataset.v5Theme="true";
    const small=card.querySelector<HTMLElement>("small");
    const copy=labels[card.id];
    if(small&&copy)small.textContent=copy;
  });
}

function enhanceSections(root:HTMLElement):void{
  const map:Record<string,[string,string]>={
    ymsAppearance:["Görünüm","Tema ve okunabilirlik"],
    ymsPersonal:["Kişiselleştirme","Ana ekran ve sınav kapsamı"],
    ymsNotifications:["Bildirimler","Yalnız gerekli hatırlatmalar"],
    ymsApplication:["Uygulama","Veri, yedek ve sistem araçları"]
  };
  for(const [id,[title,copy]] of Object.entries(map)){
    const section=root.querySelector<HTMLElement>("#"+id);
    if(!section)continue;
    section.dataset.v5SettingsSection="true";
    const h3=section.querySelector<HTMLElement>(".yms-section-head h3");
    const p=section.querySelector<HTMLElement>(".yms-section-head p");
    if(h3)h3.textContent=title;
    if(p)p.textContent=copy;
  }
}

function enhanceProfile(root:HTMLElement):void{
  const hero=root.querySelector<HTMLElement>(".yms-hero");
  if(!hero)return;
  hero.dataset.v5SettingsHero="true";
  const edit=hero.querySelector<HTMLButtonElement>(".yms-edit");
  if(edit)edit.textContent="Düzenle";
}

function hideLegacyNoise(panel:HTMLElement):void{
  const sub=panel.querySelector<HTMLElement>(":scope > .v30-subhead");
  if(sub){
    sub.classList.add("v5-settings-subhead");
    const back=sub.querySelector<HTMLButtonElement>(".v30-back");
    if(back)back.textContent="‹ Merkez";
    const h1=sub.querySelector("h1");
    const p=sub.querySelector("p");
    if(h1)h1.textContent="Ayarlar";
    if(p)p.textContent="Uygulamayı ve çalışma deneyimini kendine göre ayarla.";
  }
}

function polish():boolean{
  const panel=byId("mrp_ayar");
  const root=byId("yksModernSettings");
  if(!panel||!root)return false;

  panel.classList.add("v5-settings");
  panel.dataset.v5Settings="ready";
  root.classList.add("v5-settings-root");
  root.dataset.v5SettingsRoot="ready";

  hideLegacyNoise(panel);
  enhanceProfile(root);
  createQuickNav(root);
  enhanceSections(root);
  enhanceThemeCards(root);

  const coach=byId("studentCoachCodeSettings");
  if(coach)coach.classList.add("v5-settings-coach");
  const account=byId("yksAccountSettingsCard");
  if(account)account.classList.add("v5-settings-account");
  return true;
}

export function installSettingsV5():{installed:boolean;validate:()=>string[]}{
  let observer:MutationObserver|null=null;
  const attempt=()=>{
    if(polish()){
      observer?.disconnect();
      observer=null;
      return true;
    }
    const panel=byId("mrp_ayar");
    if(panel&&!observer){
      observer=new MutationObserver(()=>{if(polish()){observer?.disconnect();observer=null;}});
      observer.observe(panel,{childList:true,subtree:true});
    }
    return false;
  };

  attempt();
  window.addEventListener("yks:more-after",event=>{
    const detail=(event as CustomEvent<MoreDetail>).detail;
    if(detail?.to==="ayar")window.setTimeout(attempt,0);
  });
  window.addEventListener("yks:auth-state",()=>window.setTimeout(attempt,0));
  window.addEventListener("yks:data-changed",()=>window.setTimeout(attempt,0));

  return {
    installed:true,
    validate:()=>{
      const errors:string[]=[];
      const panel=byId("mrp_ayar");
      const root=byId("yksModernSettings");
      if(panel&&root){
        if(panel.dataset.v5Settings!=="ready")errors.push("settings v5 marker missing");
        if(!root.querySelector("[data-v5-settings-quick]"))errors.push("settings quick nav missing");
        if(!root.querySelector("#themeGrid[data-v5-theme-grid]"))errors.push("settings theme grid missing");
        if(document.getElementById("themeBtn"))errors.push("theme control escaped settings");
      }
      return errors;
    }
  };
}
