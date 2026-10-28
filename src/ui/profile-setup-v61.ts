import "./profile-setup-v61.css";

/* v61 — profil kurulumu. Eski sihirbazla aynı alanları aynı state'e yazar
 * (name, puanTuru, targetNetTYT/AYT, targetUniversity/Department, workdays,
 * wizardDone); yalnız görünüm değişir. Eski #wizOverlay DOM'u yerinde kalır. */

type Track="SAY"|"EA"|"SOZ"|"DIL";
type ProfileState={
  wizardDone?:boolean;name?:string;examDate?:string;puanTuru?:string;
  targetNet?:number;targetNetTYT?:number;targetNetAYT?:number;
  targetUniversity?:string;targetDepartment?:string;workdays?:number;
};
type Draft={name:string;track:Track;tyt:number;ayt:number;university:string;department:string;days:number};
type LegacyWindow=Window&{
  YKSLegacyState?:{readState?:()=>ProfileState|null;save?:()=>unknown};
  openWizard?:()=>unknown;
  skipWizard?:()=>unknown;
  renderAll?:()=>unknown;
  go?:(screen:string)=>unknown;
  toast?:(message:string)=>unknown;
};

const ROOT_ID="yksProfileSetup";
const TYT_DATE="2027-06-19";
const FIREBASE="https://www.gstatic.com/firebasejs/12.17.1/";
const runtime=window as LegacyWindow;
const TRACKS:{id:Track;name:string;lessons:string;ayt:string}[]=[
  {id:"SAY",name:"Sayısal",lessons:"Mat · Fizik · Kimya · Biyoloji",ayt:"AYT · Sayısal"},
  {id:"EA",name:"Eşit Ağırlık",lessons:"Mat · Edebiyat · Tarih · Coğrafya",ayt:"AYT · Eşit Ağırlık"},
  {id:"SOZ",name:"Sözel",lessons:"Edebiyat · Tarih · Coğrafya · Felsefe",ayt:"AYT · Sözel"},
  {id:"DIL",name:"Dil",lessons:"YDT · yabancı dil",ayt:"YDT"}
];
const DEPARTMENTS:Record<Track,string[]>={
  SAY:["Bilgisayar Mühendisliği","Tıp","Elektrik-Elektronik Mühendisliği","Yazılım Mühendisliği","Diş Hekimliği","Eczacılık"],
  EA:["Hukuk","Psikoloji","İşletme","Ekonomi","Sınıf Öğretmenliği","Uluslararası İlişkiler"],
  SOZ:["Türk Dili ve Edebiyatı","Tarih","Gazetecilik","Halkla İlişkiler","Türkçe Öğretmenliği","Coğrafya"],
  DIL:["İngilizce Öğretmenliği","Mütercim-Tercümanlık","İngiliz Dili ve Edebiyatı","Almanca Öğretmenliği"]
};
const ICON_BACK=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>`;

function esc(value:unknown):string{
  return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function state():ProfileState|null{
  try{return runtime.YKSLegacyState?.readState?.()||null;}catch{return null;}
}
function clamp(value:unknown,max:number,fallback:number):number{
  const n=Number(value);
  return Number.isFinite(n)&&n>0?Math.max(0,Math.min(max,Math.round(n))):fallback;
}
function daysLeft():number{
  const today=new Date();today.setHours(0,0,0,0);
  const exam=new Date(TYT_DATE+"T00:00:00");
  return Math.max(0,Math.round((exam.getTime()-today.getTime())/86400000));
}
function trackOf(id:Track){return TRACKS.find(track=>track.id===id)||TRACKS[0]!;}

/* Hesapla giriş yapıldıysa adı Firebase oturumundan önerir; uygulama başlatılmadıysa beklemez. */
async function accountName():Promise<string>{
  try{
    const app:any=await import(/* @vite-ignore */ FIREBASE+"firebase-app.js");
    if(!app.getApps().length)return "";
    const auth:any=await import(/* @vite-ignore */ FIREBASE+"firebase-auth.js");
    return String(auth.getAuth(app.getApp()).currentUser?.displayName||"").trim().slice(0,80);
  }catch{return "";}
}

export function installProfileSetupV61():{installed:boolean}{
  if(document.getElementById(ROOT_ID))return {installed:true};
  const root=document.createElement("div");
  root.id=ROOT_ID;
  root.className="yp-root";
  root.hidden=true;
  root.setAttribute("role","dialog");
  root.setAttribute("aria-modal","true");
  root.setAttribute("aria-label","Profil kurulumu");
  document.body.append(root);

  let step=1,nameFromAccount=false;
  let draft:Draft={name:"",track:"SAY",tyt:80,ayt:50,university:"",department:"",days:6};

  const top=()=>`<div class="yp-top"><div class="yp-bars" aria-hidden="true">${[1,2,3,4].map(i=>`<i class="${i<=step?"on":""}"></i>`).join("")}</div><button class="yp-skip" type="button" data-skip>Atla</button></div>`;
  const nav=(last=false)=>`<div class="yp-spacer"></div><div class="yp-nav">${step>1?`<button class="yp-btn yp-back" type="button" data-prev aria-label="Geri">${ICON_BACK}</button>`:""}<button class="yp-btn yp-primary" type="button" data-next>${last?"Bitir":"Devam"}</button></div>`;
  const head=(title:string,sub:string)=>`<p class="yp-kicker">ADIM ${step} / 4</p><h2 class="yp-h" id="ypTitle">${title}</h2><p class="yp-sub">${sub}</p>`;
  const net=(key:"tyt"|"ayt",label:string,max:number)=>{
    const value=draft[key];
    return `<div class="yp-net"><div class="yp-net-top"><b>${esc(label)}</b><span>${max} soru</span></div>
      <div class="yp-stepper"><button type="button" data-net="${key}" data-delta="-1" aria-label="${esc(label)} hedefini azalt">−</button><div class="yp-val" data-val="${key}">${value} <small>net</small></div><button type="button" data-net="${key}" data-delta="1" aria-label="${esc(label)} hedefini artır">+</button></div>
      <input class="yp-range" type="range" min="0" max="${max}" step="1" value="${value}" data-range="${key}" aria-label="${esc(label)} hedef neti" style="--p:${Math.round(value/max*100)}%"></div>`;
  };

  const render=()=>{
    let html="";
    if(step===1){
      html=top()+head("Seni tanıyalım","Programın ve analizlerin buna göre şekillenir.")+
        `<label class="yp-lbl" for="ypName">Adın</label><span class="yp-input"><input id="ypName" type="text" maxlength="80" autocomplete="name" placeholder="Ad Soyad" value="${esc(draft.name)}" class="${nameFromAccount?"yp-has-from":""}">${nameFromAccount?`<span class="yp-from" data-from>Hesaptan</span>`:""}</span>
        <span class="yp-lbl" id="ypTrackLabel">Alanın</span>
        <div class="yp-tracks" role="radiogroup" aria-labelledby="ypTrackLabel">${TRACKS.map(track=>`<button class="yp-track" type="button" role="radio" aria-checked="${draft.track===track.id}" data-track="${track.id}"><b>${track.name}</b><span>${track.lessons}</span></button>`).join("")}</div>`+nav();
    }else if(step===2){
      html=top()+head("Net hedeflerin","Kaba bir hedef yeter, sonra değiştirebilirsin.")+
        net("tyt","TYT",120)+net("ayt",trackOf(draft.track).ayt,80)+
        `<p class="yp-hint">Denemelerini girdikçe hedefe ne kadar yaklaştığını gösteririz.</p>`+nav();
    }else if(step===3){
      html=top()+head("Hedefin ne?","İsteğe bağlı. Boş bırakabilirsin.")+
        `<label class="yp-lbl" for="ypUniversity">Üniversite</label><span class="yp-input"><input id="ypUniversity" type="text" maxlength="120" placeholder="Örn. İstanbul Teknik Üniversitesi" value="${esc(draft.university)}"></span>
        <label class="yp-lbl" for="ypDepartment">Bölüm</label><span class="yp-input"><input id="ypDepartment" type="text" maxlength="120" placeholder="Örn. Bilgisayar Mühendisliği" value="${esc(draft.department)}"></span>
        <div class="yp-chips">${DEPARTMENTS[draft.track].map(name=>`<button class="yp-chip" type="button" data-dept="${esc(name)}" aria-pressed="${draft.department===name}">${esc(name)}</button>`).join("")}</div>`+nav();
    }else if(step===4){
      html=top()+head("Haftada kaç gün?","Bir dinlenme günü bırakmak programı gerçekçi yapar.")+
        `<div class="yp-days" role="radiogroup" aria-label="Haftada çalışma günü">${[1,2,3,4,5,6,7].map(n=>`<button type="button" role="radio" aria-checked="${draft.days===n}" data-days="${n}">${n}</button>`).join("")}</div>
        <span class="yp-lbl">2027 YKS takvimi</span>
        <div class="yp-dates"><div><b>TYT</b><span>19 Haziran Cmt · 10:15<em>${daysLeft()} gün</em></span></div><div><b>AYT</b><span>20 Haziran Paz · 10:15</span></div><div><b>YDT</b><span>20 Haziran Paz · 15:45</span></div></div>`+nav(true);
    }else{
      const first=draft.name.split(/\s+/)[0]||"";
      const goal=[draft.university,draft.department].filter(Boolean).join(" · ")||"Belirtilmedi";
      html=`<div class="yp-done"><div class="yp-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg></div>
        <h2 class="yp-h" id="ypTitle" style="margin-top:16px">Hazırsın${first?", "+esc(first):""}</h2>
        <p class="yp-sub">Profilin kaydedildi. Ayarlar'dan her zaman değiştirebilirsin.</p>
        <div class="yp-sum"><div><span>Alan</span><b>${trackOf(draft.track).name}</b></div><div><span>Hedef</span><b>TYT ${draft.tyt} · ${draft.track==="DIL"?"YDT":"AYT"} ${draft.ayt}</b></div><div><span>Okul</span><b>${esc(goal)}</b></div><div><span>Tempo</span><b>Haftada ${draft.days} gün</b></div></div>
        <div class="yp-count"><b>${daysLeft()}</b><span>gün kaldı<br>İlk odak oturumunla başla.</span></div></div>
        <button class="yp-btn yp-primary" type="button" data-start style="flex:none;width:100%">Uygulamaya başla</button>`;
    }
    root.innerHTML=`<div class="yp-shell"><section class="yp-step" aria-labelledby="ypTitle">${html}</section></div>`;
    root.scrollTop=0;
  };

  const readInputs=()=>{
    const value=(id:string)=>(root.querySelector<HTMLInputElement>("#"+id)?.value||"").trim();
    if(step===1)draft.name=value("ypName").slice(0,80);
    if(step===3){draft.university=value("ypUniversity").slice(0,120);draft.department=value("ypDepartment").slice(0,120);}
  };

  const save=()=>{
    const s=state();if(!s)return false;
    s.name=draft.name;
    s.puanTuru=draft.track;
    s.targetNetTYT=draft.tyt;s.targetNet=draft.tyt;
    s.targetNetAYT=draft.ayt;
    s.targetUniversity=draft.university;s.targetDepartment=draft.department;
    s.examDate=TYT_DATE;
    s.workdays=draft.days;
    s.wizardDone=true;
    try{runtime.YKSLegacyState?.save?.();}catch{}
    return true;
  };

  const close=()=>{root.hidden=true;root.replaceChildren();delete document.documentElement.dataset.profileSetup;};

  const open=()=>{
    const s=state();
    draft={
      name:String(s?.name||"").trim().slice(0,80),
      track:(TRACKS.some(track=>track.id===s?.puanTuru)?s?.puanTuru:"SAY") as Track,
      tyt:clamp(s?.targetNetTYT??s?.targetNet,120,80),
      ayt:clamp(s?.targetNetAYT,80,50),
      university:String(s?.targetUniversity||"").slice(0,120),
      department:String(s?.targetDepartment||"").slice(0,120),
      days:clamp(s?.workdays,7,6)||6
    };
    nameFromAccount=false;step=1;
    document.getElementById("wizOverlay")?.style.setProperty("display","none");
    root.hidden=false;
    document.documentElement.dataset.profileSetup="open";
    render();
    if(!draft.name)void accountName().then(name=>{
      if(!name||draft.name||root.hidden||step!==1)return;
      const input=root.querySelector<HTMLInputElement>("#ypName");
      if(input&&input.value.trim())return;
      draft.name=name;nameFromAccount=true;render();
    });
  };

  const setNet=(key:"tyt"|"ayt",value:number)=>{
    const max=key==="tyt"?120:80;
    draft[key]=Math.max(0,Math.min(max,Math.round(value)));
    const label=root.querySelector(`[data-val="${key}"]`),range=root.querySelector<HTMLInputElement>(`[data-range="${key}"]`);
    if(label)label.innerHTML=`${draft[key]} <small>net</small>`;
    if(range){range.value=String(draft[key]);range.style.setProperty("--p",Math.round(draft[key]/max*100)+"%");}
  };

  root.addEventListener("click",event=>{
    const target=(event.target as HTMLElement).closest<HTMLElement>("button");
    if(!target)return;
    if(target.hasAttribute("data-skip")){
      // Eski "Şimdilik geç" ile aynı: veriye dokunmadan bir daha sorma.
      const s=state();if(s){s.wizardDone=true;try{runtime.YKSLegacyState?.save?.();}catch{}}
      close();return;
    }
    if(target.hasAttribute("data-prev")){readInputs();step=Math.max(1,step-1);render();return;}
    if(target.hasAttribute("data-next")){
      readInputs();
      if(step<4){step++;render();return;}
      save();step=5;render();return;
    }
    if(target.hasAttribute("data-start")){
      close();
      try{runtime.renderAll?.();}catch{}
      try{runtime.go?.("home");}catch{}
      return;
    }
    if(target.dataset.track){readInputs();draft.track=target.dataset.track as Track;render();return;}
    if(target.dataset.net){const key=target.dataset.net as "tyt"|"ayt";setNet(key,draft[key]+Number(target.dataset.delta||0));return;}
    if(target.dataset.dept!==undefined){
      draft.department=draft.department===target.dataset.dept?"":target.dataset.dept;
      draft.university=(root.querySelector<HTMLInputElement>("#ypUniversity")?.value||"").trim().slice(0,120);
      render();return;
    }
    if(target.dataset.days){draft.days=Number(target.dataset.days)||6;render();}
  });
  root.addEventListener("input",event=>{
    const input=event.target as HTMLInputElement;
    if(input.dataset.range)setNet(input.dataset.range as "tyt"|"ayt",Number(input.value));
    if(input.id==="ypName"&&nameFromAccount){nameFromAccount=false;root.querySelector("[data-from]")?.remove();input.classList.remove("yp-has-from");}
    if(input.id==="ypDepartment")root.querySelectorAll<HTMLElement>("[data-dept]").forEach(chip=>chip.setAttribute("aria-pressed",String(chip.dataset.dept===input.value.trim())));
  });
  root.addEventListener("keydown",event=>{
    if(event.key==="Enter"&&(event.target as HTMLElement).tagName==="INPUT"){event.preventDefault();root.querySelector<HTMLButtonElement>("[data-next]")?.click();}
  });

  /* Eski sihirbaz yerine bu ekran açılır (ilk açılış ve Ayarlar > Kurulum sihirbazı). */
  runtime.openWizard=()=>{open();return undefined;};
  // app.js ilk açılışta setTimeout(openWizard) ile eski referansı tutar; görünür olduğu an devral.
  const legacyOverlay=document.getElementById("wizOverlay");
  const takeOver=()=>{if(legacyOverlay&&legacyOverlay.style.display&&legacyOverlay.style.display!=="none"&&root.hidden)open();};
  if(legacyOverlay)new MutationObserver(takeOver).observe(legacyOverlay,{attributes:true,attributeFilter:["style"]});
  takeOver();

  // Bulut senkronu profili getirirse (ör. başka cihazda tamamlanmış) ekranı kapat.
  const closeIfDone=()=>{if(!root.hidden&&step<5&&state()?.wizardDone)close();};
  for(const name of ["yks:data-changed","yks:auth-state","yks:data-primary-ready"])window.addEventListener(name,()=>window.setTimeout(closeIfDone,0));

  document.documentElement.dataset.profileSetupV61="ready";
  return {installed:true};
}
