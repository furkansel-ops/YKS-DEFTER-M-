const SETTINGS_ID="yksAccountSettingsCard";
let currentUser=null,currentAccount=null;

function clearLegacyGate(){
  document.getElementById("yksAuthGate")?.remove();
  document.getElementById("yksAuthSessionStyles")?.remove();
  try{localStorage.removeItem("yks_auth_remember_v1")}catch{}
  try{sessionStorage.removeItem("yks_auth_active_login_v1")}catch{}
  document.documentElement.dataset.authGate="removed";
  document.documentElement.dataset.authSessionGate="disabled";
}

function styles(){
  if(document.getElementById("yksAuthAccountStyles"))return;
  const s=document.createElement("style");
  s.id="yksAuthAccountStyles";
  s.textContent=`.yas-account{margin-top:12px}.yas-account-row{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.yas-account-meta{font-size:13px;color:var(--label-2,#667085);margin-top:4px}.yas-account-actions{display:flex;gap:8px;flex-wrap:wrap}`;
  document.head.append(s);
}

function settingsCard(){
  styles();
  let card=document.getElementById(SETTINGS_ID);
  if(card)return card;
  const target=document.getElementById("mrp_veri")||document.getElementById("more");
  if(!target)return null;
  card=document.createElement("section");
  card.id=SETTINGS_ID;
  card.className="restcard yas-account";
  card.setAttribute("aria-label","Hesap ayarları");
  card.innerHTML=`<div class="section-label">Hesap</div><div class="yas-account-row"><div><b data-account-title>Giriş yapılmadı</b><div class="yas-account-meta" data-account-meta>Bulut hesabı bağlı değil.</div></div><div class="yas-account-actions"><button class="btn green tiny" type="button" data-account-login>Giriş yap</button><button class="btn ghost tiny" type="button" data-account-logout hidden>Çıkış yap</button></div></div>`;
  card.querySelector("[data-account-login]")?.addEventListener("click",()=>document.getElementById("cloudLoginBtn")?.click());
  card.querySelector("[data-account-logout]")?.addEventListener("click",()=>document.getElementById("cloudLogoutBtn")?.click());
  target.append(card);
  return card;
}

function emitAuthState(){
  try{window.dispatchEvent(new CustomEvent("yks:auth-state",{detail:{signedIn:Boolean(currentUser),email:currentUser?.email||""}}))}catch{}
}

function renderSettings(){
  const card=settingsCard();
  if(!card)return;
  const title=card.querySelector("[data-account-title]"),meta=card.querySelector("[data-account-meta]"),login=card.querySelector("[data-account-login]"),logout=card.querySelector("[data-account-logout]");
  if(currentUser){
    title.textContent=currentUser.displayName||currentUser.email||"Hesap";
    meta.textContent=currentUser.email?`Bulut hesabı bağlı · ${currentUser.email}`:"Bulut hesabı bağlı";
    login.hidden=true;
    logout.hidden=false;
  }else{
    title.textContent="Giriş yapılmadı";
    meta.textContent="Bulut hesabı bağlı değil.";
    login.hidden=false;
    logout.hidden=true;
  }
  emitAuthState();
}

function installSettingsObserver(){
  renderSettings();
  window.addEventListener("yks:v4-bootstrap",renderSettings);
  setTimeout(renderSettings,0);
}

clearLegacyGate();
const base=window.YKSAccountAuth;
if(base){
  const originalBefore=typeof base.beforeSignIn==="function"?base.beforeSignIn.bind(base):null;
  const originalSignedIn=typeof base.onSignedIn==="function"?base.onSignedIn.bind(base):null;
  const originalSignedOut=typeof base.onSignedOut==="function"?base.onSignedOut.bind(base):null;
  base.beforeSignIn=async ctx=>{
    try{ctx.provider?.setCustomParameters?.({prompt:"select_account"})}catch{}
    return originalBefore?originalBefore(ctx):false;
  };
  base.onSignedIn=async args=>{
    const result=originalSignedIn?await originalSignedIn(args):null;
    currentUser=args.user;
    currentAccount=result;
    clearLegacyGate();
    renderSettings();
    return result;
  };
  base.onSignedOut=()=>{
    currentUser=currentAccount=null;
    try{originalSignedOut?.()}catch{}
    clearLegacyGate();
    renderSettings();
  };
}

installSettingsObserver();
window.dispatchEvent(new CustomEvent("yks:auth-session-ready",{detail:{version:"1.5.0",publicRegistration:"student-only",sessionGate:"removed"}}));
