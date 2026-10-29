import "./launch-screen-v63.css";

/* v63 — uygulama her açıldığında gelen açılış ekranı.
 * Giriş yapmış kullanıcı tek dokunuşla girer (şifre sorulmaz); giriş yapmamışsa
 * giriş seçenekleri burada. Günün sözü #sozBox'taki mevcut kaynaktan okunur;
 * yeni bir söz havuzu ya da state sahibi eklenmez. */

type LaunchDeps={
  firebaseAuth:()=>Promise<{auth:any;m:any}|null>;
  signInWithGoogle:()=>Promise<void>;
  openWelcome:(view:"login"|"register")=>void;
  authErrorText:(error:unknown)=>string;
  entryKey:string;
};
type DailySnapshot={focusMin:number;focusGoal:number;questions:number;questionGoal:number;tasks:number;done:number};
type TaskOption={txt:string;lbl?:string;done:boolean};
type LegacyWindow=Window&{
  YKSLegacyState?:{readState?:()=>{name?:string;pomoMin?:Record<string,number>}|null};
  yksTodayDailyProgressSnapshot?:()=>DailySnapshot;
  todayTaskOptions?:()=>TaskOption[];
};
const legacy=window as LegacyWindow;
const DAY_NAMES=["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"];

function dayKey(date:Date):string{
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function minutesText(value:number):string{
  const n=Math.max(0,Math.round(Number(value)||0)),h=Math.floor(n/60),m=n%60;
  return h?`${h} sa${m?` ${m} dk`:""}`:`${m} dk`;
}
/* Dar istatistik kutusu için kısa biçim: 45 dk, 1:10 sa. */
function clockText(value:number):string{
  const n=Math.max(0,Math.round(Number(value)||0));
  return n<60?`${n} dk`:`${Math.floor(n/60)}:${String(n%60).padStart(2,"0")} sa`;
}
function pct(value:number,goal:number):number{
  return goal>0?Math.max(0,Math.min(100,Math.round(value/goal*100))):0;
}
/* Salt okunur: Bugün ekranının kullandığı özet ve program listesi. Veri yazmaz. */
function todaySnapshot():DailySnapshot|null{
  try{return legacy.yksTodayDailyProgressSnapshot?.()||null;}catch{return null;}
}
function pendingTasks():{items:TaskOption[];total:number}{
  try{
    const all=legacy.todayTaskOptions?.()||[];
    return {items:all.filter(task=>!task.done),total:all.length};
  }catch{return {items:[],total:0};}
}
function lastSevenDays():{label:string;minutes:number;today:boolean}[]{
  let minutes:Record<string,number>={};
  try{minutes=legacy.YKSLegacyState?.readState?.()?.pomoMin||{};}catch{}
  return Array.from({length:7},(_,index)=>{
    const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()-(6-index));
    return {label:DAY_NAMES[date.getDay()]||"",minutes:Math.max(0,Number(minutes[dayKey(date)])||0),today:index===6};
  });
}
function studyStreak(days:{minutes:number}[]):number{
  let minutes:Record<string,number>={};
  try{minutes=legacy.YKSLegacyState?.readState?.()?.pomoMin||{};}catch{}
  const date=new Date();date.setHours(12,0,0,0);
  if(!(Number(minutes[dayKey(date)])>0))date.setDate(date.getDate()-1);
  let count=0;
  while(Number(minutes[dayKey(date)])>0&&count<1000){count++;date.setDate(date.getDate()-1);}
  return days.length?count:0;
}

const ROOT_ID="yksLaunch";
const SESSION_KEY="yks_launch_seen_v1";
const TYT_DATE="2027-06-19";
const ICON_BOOK=`<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/></svg>`;
const ICON_MAIL=`<svg viewBox="0 0 24 24" fill="none" stroke="#0A55C4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`;
const ICON_GOOGLE=`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M22.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-7.9zM12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23zM5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8zM12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>`;

function esc(value:unknown):string{
  return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function greeting(hour:number):string{
  if(hour>=5&&hour<12)return "Günaydın";
  if(hour>=12&&hour<18)return "İyi günler";
  if(hour>=18&&hour<23)return "İyi akşamlar";
  return "İyi geceler";
}
function daysLeft():number{
  const today=new Date();today.setHours(0,0,0,0);
  return Math.max(0,Math.round((new Date(TYT_DATE+"T00:00:00").getTime()-today.getTime())/86400000));
}
function firstName():string{
  try{return String(legacy.YKSLegacyState?.readState?.()?.name||"").trim().split(/\s+/)[0]||"";}catch{return "";}
}
function initials(text:string):string{
  return text.split(/[\s@.]+/).filter(Boolean).slice(0,2).map(part=>part.charAt(0).toLocaleUpperCase("tr-TR")).join("")||"?";
}
/* Mevcut motivasyon modülünün #sozBox çıktısından okur. */
function readQuote():{text:string;by:string}|null{
  const box=document.getElementById("sozBox");
  if(!box||box.style.display==="none")return null;
  const text=(box.querySelector(".sz")?.textContent||"").trim().replace(/^[“"]+|[”"]+$/g,"");
  if(!text)return null;
  const author=(box.querySelector(".sza")?.textContent||"").trim();
  const category=(box.querySelector(".szcat")?.textContent||"").trim();
  return {text,by:author||category};
}

export function installLaunchScreenV63(deps:LaunchDeps):{installed:boolean}{
  if(document.getElementById(ROOT_ID))return {installed:true};
  document.documentElement.dataset.launchQuote="moved";
  // Oturum başına bir kez: sayfa yenilemede tekrar gelmez, uygulama kapatılıp açılınca gelir.
  try{
    if(sessionStorage.getItem(SESSION_KEY)){document.documentElement.dataset.launch="skipped";return {installed:false};}
    sessionStorage.setItem(SESSION_KEY,"1");
  }catch{}
  const root=document.createElement("div");
  root.id=ROOT_ID;
  root.className="yl-root";
  root.setAttribute("role","dialog");
  root.setAttribute("aria-modal","true");
  root.setAttribute("aria-labelledby","ylHello");
  document.body.append(root);
  document.documentElement.dataset.launch="open";

  type Mode="wait"|"in"|"out";
  let mode:Mode="wait",email="",displayName="",busy=false;

  const close=()=>{
    root.remove();
    document.documentElement.dataset.launch="done";
  };

  const actions=()=>{
    if(mode==="wait")return `<div class="yl-wait" role="status">Hesabın kontrol ediliyor…</div>`;
    if(mode==="in"){
      const who=email||displayName||"Hesabın";
      return `<button class="yl-btn yl-white" type="button" data-enter>Uygulamaya gir</button>
        <div class="yl-acct"><span class="yl-av" aria-hidden="true">${esc(initials(displayName||email))}</span><span>${esc(who)}</span><button class="yl-link" type="button" data-switch>Hesap değiştir</button></div>`;
    }
    return `<p class="yl-error" role="alert" data-error></p>
      <button class="yl-btn yl-white" type="button" data-login>${ICON_MAIL}Giriş yap</button>
      <button class="yl-btn yl-glass" type="button" data-google>${ICON_GOOGLE}Google ile devam et</button>
      <div class="yl-links"><button class="yl-link" type="button" data-register>Hesap oluştur</button><button class="yl-link" type="button" data-guest>Misafir devam et</button></div>`;
  };

  const renderQuote=()=>{
    const slot=root.querySelector("[data-quote]");if(!slot)return;
    const quote=readQuote();
    slot.innerHTML=quote?`<div class="yl-quote"><div class="yl-ql">GÜNÜN SÖZÜ<button class="yl-new" type="button" data-new-quote aria-label="Başka bir söz">↻</button></div><p class="yl-qt">“${esc(quote.text)}”</p>${quote.by?`<p class="yl-qa">${esc(quote.by)}</p>`:""}</div>`:"";
  };

  const stat=(label:string,value:string,goal:string,percent:number|null)=>`<div class="yl-stat"><span>${label}</span><b>${esc(value)}</b><small>${esc(goal)}</small>${percent===null?"":`<i class="yl-bar" style="--p:${percent}%" aria-hidden="true"></i>`}</div>`;

  const renderToday=():boolean=>{
    const slot=root.querySelector("[data-today]");if(!slot)return true;
    const snap=todaySnapshot();
    if(!snap){slot.innerHTML=`<div class="yl-card yl-skel" aria-hidden="true"></div>`;return false;}
    const {items,total}=pendingTasks();
    const focusGoal=Number(snap.focusGoal)||0,questionGoal=Number(snap.questionGoal)||0,tasks=Number(snap.tasks)||total,done=Number(snap.done)||0;
    const next=items.slice(0,3).map(task=>`<li><span aria-hidden="true"></span>${esc(String(task.txt).replace(/^Koç\s*·\s*(?:Deneme sonrası\s*·\s*)?/i,""))}</li>`).join("");
    slot.innerHTML=`<section class="yl-card" aria-label="Bugünün özeti">
      <div class="yl-card-head"><b>Bugün</b><span>${tasks?`${done}/${tasks} görev`:"Program yok"}</span></div>
      <div class="yl-stats">
        ${stat("Odak",clockText(snap.focusMin),focusGoal?`hedef ${minutesText(focusGoal)}`:"hedef yok",focusGoal?pct(snap.focusMin,focusGoal):null)}
        ${stat("Soru",String(Math.round(Number(snap.questions)||0)),questionGoal?`hedef ${questionGoal}`:"hedef yok",questionGoal?pct(snap.questions,questionGoal):null)}
        ${stat("Program",tasks?`%${pct(done,tasks)}`:"—",tasks?`${tasks-done} kaldı`:"görev yok",tasks?pct(done,tasks):null)}
      </div>
      ${next?`<p class="yl-sub">Sıradaki</p><ul class="yl-next">${next}</ul>`:tasks?`<p class="yl-done-all">Bugünkü programın tamam 🎉</p>`:`<p class="yl-done-all">Bugün için program görevi yok.</p>`}
    </section>`;
    return true;
  };

  const renderWeek=()=>{
    const slot=root.querySelector("[data-week]");if(!slot)return;
    const days=lastSevenDays(),max=Math.max(60,...days.map(day=>day.minutes)),total=days.reduce((sum,day)=>sum+day.minutes,0),streak=studyStreak(days);
    slot.innerHTML=`<section class="yl-card" aria-label="Son 7 gün">
      <div class="yl-card-head"><b>Son 7 gün</b><span>${minutesText(total)}${streak?` · ${streak} gün seri`:""}</span></div>
      <div class="yl-week">${days.map(day=>`<div class="yl-day${day.today?" is-today":""}" title="${esc(day.label)}: ${esc(minutesText(day.minutes))}"><i style="--h:${Math.max(day.minutes?8:3,Math.round(day.minutes/max*100))}%"></i><span>${esc(day.label)}</span></div>`).join("")}</div>
    </section>`;
  };

  const render=()=>{
    const name=firstName()||(displayName.split(/\s+/)[0]||"");
    const date=new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",weekday:"long"});
    root.innerHTML=`<div class="yl-shell">
      <div class="yl-brand"><span class="yl-mark">${ICON_BOOK}</span>YKS Defterim</div>
      <div class="yl-grid">
        <div class="yl-intro">
          <p class="yl-date">${esc(date)}</p>
          <h1 class="yl-hello" id="ylHello">${esc(greeting(new Date().getHours()))}${name?`,<br>${esc(name)}`:""}</h1>
          <span class="yl-count"><b>${daysLeft()}</b> gün kaldı · TYT 19 Haziran</span>
        </div>
        <div class="yl-today" data-today></div>
        <div class="yl-weekslot" data-week></div>
        <div class="yl-quoteslot" data-quote></div>
      </div>
      <div class="yl-acts" data-acts>${actions()}</div>
    </div>`;
    renderQuote();
    renderWeek();
    // Bugün özeti uygulama modülleri hazır olunca dolar; hazır değilse kısa süre yeniden dener.
    if(!renderToday()){
      let tries=0;
      const timer=window.setInterval(()=>{
        if(!root.isConnected||renderToday()){window.clearInterval(timer);return;}
        if(++tries>30){window.clearInterval(timer);const slot=root.querySelector("[data-today]");if(slot)slot.innerHTML="";}
      },250);
    }
    (root.querySelector<HTMLElement>("[data-enter]")||root.querySelector<HTMLElement>("[data-login]"))?.focus({preventScroll:true});
  };

  const setMode=(next:Mode)=>{
    mode=next;
    const acts=root.querySelector("[data-acts]");
    if(acts){acts.innerHTML=actions();(root.querySelector<HTMLElement>("[data-enter]")||root.querySelector<HTMLElement>("[data-login]"))?.focus({preventScroll:true});}
    else render();
    const hello=root.querySelector("#ylHello");
    const name=firstName()||(displayName.split(/\s+/)[0]||"");
    if(hello)hello.innerHTML=`${esc(greeting(new Date().getHours()))}${name?`,<br>${esc(name)}`:""}`;
  };

  const showError=(text:string)=>{const node=root.querySelector("[data-error]");if(node)node.textContent=text;};

  root.addEventListener("click",event=>{
    const target=(event.target as HTMLElement).closest<HTMLElement>("button");
    if(!target||busy)return;
    if(target.hasAttribute("data-enter"))close();
    else if(target.hasAttribute("data-guest")){try{localStorage.setItem(deps.entryKey,"guest");}catch{}close();}
    else if(target.hasAttribute("data-login"))deps.openWelcome("login");
    else if(target.hasAttribute("data-register"))deps.openWelcome("register");
    else if(target.hasAttribute("data-new-quote")){
      document.querySelector<HTMLElement>("#sozBox .szr")?.click();
      window.setTimeout(renderQuote,0);
    }
    else if(target.hasAttribute("data-google"))void(async()=>{
      busy=true;target.setAttribute("disabled","");showError("");
      try{await deps.signInWithGoogle();close();}
      catch(error){showError(deps.authErrorText(error));}
      finally{busy=false;target.removeAttribute("disabled");}
    })();
    else if(target.hasAttribute("data-switch"))void(async()=>{
      if(!window.confirm("Bu hesaptan çıkıp başka bir hesapla giriş yapılsın mı? Bu cihazdaki çalışmaların kalır."))return;
      busy=true;
      const logout=document.getElementById("cloudLogoutBtn");
      if(logout)logout.click();
      else{const api=await deps.firebaseAuth();if(api)await api.m.signOut(api.auth);}
      busy=false;email="";displayName="";
      setMode("out");
    })();
  });
  root.addEventListener("keydown",event=>{if(event.key==="Escape"&&mode==="in")close();});
  // Karşılama ekranından giriş veya misafir seçimi tamamlanınca açılış da kapanır.
  window.addEventListener("yks:entry-finished",()=>{if(root.isConnected)close();});

  render();

  const settle=(user:any)=>{
    if(!root.isConnected)return;
    if(user){email=String(user.email||"");displayName=String(user.displayName||"");setMode("in");}
    else setMode("out");
  };
  const timeout=new Promise<"timeout">(resolve=>window.setTimeout(()=>resolve("timeout"),6000));
  void Promise.race([
    deps.firebaseAuth().then(async api=>{
      if(!api)return null;
      try{await api.auth.authStateReady?.();}catch{}
      return api.auth.currentUser||null;
    }).catch(()=>null),
    timeout
  ]).then(result=>{
    // Bağlantı yoksa: daha önce hesapla girilmiş cihazda içeri girişi engelleme.
    if(result==="timeout"){
      let account=false;try{account=localStorage.getItem(deps.entryKey)==="account";}catch{}
      settle(account?{email:"",displayName:""}:null);
      return;
    }
    settle(result);
  });

  return {installed:true};
}
