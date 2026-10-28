import "./auth-welcome-v60.css";

/* v60 — ilk açılış karşılama ekranı ve e-posta/Google hesabı.
 * Bulut senkronu, profil ve koç bağlantısı mevcut Firebase çalışma zamanında kalır;
 * bu katman yalnız aynı Firebase Auth örneğinde oturum açar. Senkron kodu,
 * onAuthStateChanged üzerinden her zamanki gibi devreye girer. */

const ENTRY_KEY="yks_entry_choice_v1";
const GUEST_BANNER_KEY="yks_guest_banner_hidden_v1";
const PENDING_ROLE="yks_account_role_pending";
const FIREBASE="https://www.gstatic.com/firebasejs/12.17.1/";
const ROOT_ID="yksWelcome";
const GUEST_ID="yksGuestBanner";

type View="welcome"|"email"|"sent"|"verify";
type EmailMode="login"|"register"|"reset";
type FirebaseAuthApi={auth:any;m:any};

declare global{
  interface Window{
    YKSWelcome?:{open(view?:"welcome"|EmailMode):void;close():void};
    Capacitor?:{isNativePlatform?:()=>boolean};
  }
}

const ICON_BOOK=`<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/></svg>`;
const ICON_MAIL=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>`;
const ICON_GOOGLE=`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-7.9z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>`;
const ICON_BACK=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>`;

function store(key:string,value?:string):string{
  try{
    if(value!==undefined)localStorage.setItem(key,value);
    return localStorage.getItem(key)||"";
  }catch{return "";}
}

function isNativeApp():boolean{
  try{return !!window.Capacitor?.isNativePlatform?.();}catch{return false;}
}

/* Daha önce bulut hesabı kullanılmış cihazda Firebase oturumu açılmadan
   karşılama ekranı gösterilmez; aksi halde giriş yapmış kullanıcıda bir an parlar. */
function hadCloudAccount():boolean{
  return !!(store("yks_account_role_hint")||store("yks_last_sync_at"));
}

let firebasePromise:Promise<FirebaseAuthApi|null>|null=null;
function firebaseAuth():Promise<FirebaseAuthApi|null>{
  if(firebasePromise)return firebasePromise;
  firebasePromise=(async()=>{
    try{
      const appModule:any=await import(/* @vite-ignore */ FIREBASE+"firebase-app.js");
      // Bulut çalışma zamanı uygulamayı başlatır; aynı Auth örneğini kullanmak için onu bekle.
      for(let i=0;i<200&&!appModule.getApps().length;i++)await new Promise(resolve=>setTimeout(resolve,50));
      if(!appModule.getApps().length)return null;
      const m:any=await import(/* @vite-ignore */ FIREBASE+"firebase-auth.js");
      const auth=m.getAuth(appModule.getApp());
      try{auth.languageCode="tr";}catch{}
      return {auth,m};
    }catch(error){
      console.error("Hesap servisi yüklenemedi",error);
      return null;
    }
  })();
  void firebasePromise.then(api=>{if(!api)firebasePromise=null;});
  return firebasePromise;
}

function authErrorText(error:unknown):string{
  const code=String((error as {code?:string})?.code||"");
  const map:Record<string,string>={
    "auth/invalid-email":"E-posta adresi geçerli görünmüyor.",
    "auth/missing-email":"E-posta adresini yaz.",
    "auth/missing-password":"Şifreni yaz.",
    "auth/invalid-credential":"E-posta veya şifre hatalı.",
    "auth/wrong-password":"E-posta veya şifre hatalı.",
    "auth/user-not-found":"Bu e-posta ile kayıtlı hesap yok.",
    "auth/email-already-in-use":"Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.",
    "auth/weak-password":"Şifre en az 8 karakter olmalı.",
    "auth/too-many-requests":"Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.",
    "auth/network-request-failed":"İnternet bağlantısı yok gibi görünüyor.",
    "auth/operation-not-allowed":"E-posta ile giriş henüz açılmadı. Şimdilik Google ile devam edebilirsin.",
    "auth/popup-closed-by-user":"Google penceresi kapatıldı.",
    "auth/cancelled-popup-request":"Google girişi iptal edildi.",
    "auth/popup-blocked":"Google penceresi engellendi. Tarayıcıda açılır pencere izni ver.",
    "auth/unauthorized-domain":"Bu adres Firebase'de yetkili değil.",
    "auth/account-exists-with-different-credential":"Bu e-posta başka bir giriş yöntemiyle kayıtlı."
  };
  return map[code]||"Bir sorun oluştu. Tekrar dene.";
}

function passwordLevel(value:string):number{
  if(!value)return 0;
  let level=value.length>=8?1:0;
  if(level&&/\d/.test(value))level++;
  if(level&&/[a-zçğıöşü]/.test(value)&&/[A-ZÇĞİÖŞÜ]/.test(value))level++;
  if(level&&(value.length>=12||/[^\p{L}\d]/u.test(value)))level++;
  return Math.min(4,level);
}
const LEVEL_TEXT=["En az 8 karakter, bir rakam","Zayıf · bir rakam ekle","Orta","İyi","Güçlü"];

function markup():string{
  return `
  <div class="yw-shell">
    <section class="yw-view" data-view="welcome" aria-labelledby="ywBrand">
      <div class="yw-glow" aria-hidden="true"></div>
      <div class="yw-hero">
        <div class="yw-mark">${ICON_BOOK}</div>
        <h1 class="yw-brand" id="ywBrand">YKS Defterim</h1>
        <p class="yw-tag">Programın, odak süren ve denemelerin tek bir yerde.</p>
        <ul class="yw-feats">
          <li><span><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg></span>Odak sayacı ve çalışma geçmişi</li>
          <li><span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg></span>Günlük ve haftalık program</li>
          <li><span><svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg></span>Deneme ve eksik analizi</li>
          <li><span><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 11a3 3 0 1 0 0-6M21.5 20a5.5 5.5 0 0 0-4-5.3"/></svg></span>Koçunla senkron</li>
        </ul>
      </div>
      <div class="yw-actions">
        <p class="yw-error" role="alert" data-error="welcome"></p>
        <button class="yw-btn yw-primary" type="button" data-go="login">${ICON_MAIL}E-posta ile devam et</button>
        <button class="yw-btn yw-outline" type="button" data-google>${ICON_GOOGLE}Google ile devam et</button>
        <button class="yw-btn yw-ghost" type="button" data-guest>Misafir olarak devam et</button>
        <p class="yw-legal">Devam ederek <a href="./privacy.html" target="_blank" rel="noopener">Gizlilik Politikası</a>'nı kabul etmiş olursun.</p>
      </div>
    </section>

    <section class="yw-view" data-view="email" hidden aria-labelledby="ywEmailTitle">
      <div class="yw-top"><button class="yw-back" type="button" data-back aria-label="Geri">${ICON_BACK}</button></div>
      <h2 class="yw-h" id="ywEmailTitle">Tekrar hoş geldin</h2>
      <p class="yw-sub" data-email-sub>Hesabına giriş yap, verilerin tüm cihazlarında eşitlensin.</p>
      <div class="yw-seg" role="tablist" aria-label="Hesap işlemi" data-seg>
        <button type="button" role="tab" data-mode="login" aria-selected="true">Giriş yap</button>
        <button type="button" role="tab" data-mode="register" aria-selected="false">Kayıt ol</button>
      </div>
      <form class="yw-form" novalidate data-form>
        <label class="yw-field" data-only="register" hidden>Ad Soyad
          <span class="yw-input"><input type="text" name="name" autocomplete="name" maxlength="80" placeholder="Ad Soyad"></span>
        </label>
        <label class="yw-field">E-posta
          <span class="yw-input"><input type="email" name="email" autocomplete="email" inputmode="email" maxlength="120" placeholder="ornek@mail.com" required></span>
        </label>
        <label class="yw-field" data-only="login register">Şifre
          <span class="yw-input"><input class="yw-has-eye" type="password" name="password" autocomplete="current-password" maxlength="128" placeholder="Şifre"><button class="yw-eye" type="button" data-eye aria-label="Şifreyi göster">Göster</button></span>
          <span class="yw-meter" data-only="register" data-level="0" hidden aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          <span class="yw-hint" data-only="register" data-strength hidden>${LEVEL_TEXT[0]}</span>
        </label>
        <div class="yw-link-row" data-only="login"><button class="yw-link" type="button" data-go="reset">Şifremi unuttum</button></div>
        <label class="yw-check" data-only="register" hidden><input type="checkbox" name="consent"><span><a href="./privacy.html" target="_blank" rel="noopener">Gizlilik Politikası</a> ve KVKK aydınlatma metnini okudum, kabul ediyorum.</span></label>
        <p class="yw-error" role="alert" data-error="email"></p>
        <button class="yw-btn yw-primary" type="submit" data-submit>Giriş yap</button>
      </form>
      <div class="yw-spacer"></div>
      <div data-only="login register">
        <div class="yw-or">veya</div>
        <button class="yw-btn yw-outline" type="button" data-google>${ICON_GOOGLE}Google ile devam et</button>
      </div>
    </section>

    <section class="yw-view" data-view="sent" hidden aria-labelledby="ywSentTitle">
      <div class="yw-top"><button class="yw-back" type="button" data-go="login" aria-label="Girişe dön">${ICON_BACK}</button></div>
      <div class="yw-done">
        <div class="yw-done-ic">${ICON_MAIL}</div>
        <h2 class="yw-h" id="ywSentTitle" data-sent-title>E-postanı kontrol et</h2>
        <p class="yw-sub" data-sent-sub>Şifre sıfırlama bağlantısını gönderdik:</p>
        <div class="yw-mail" data-sent-mail></div>
        <p class="yw-note" data-sent-note>Gelmediyse spam klasörüne bak.</p>
      </div>
      <p class="yw-error" role="alert" data-error="sent"></p>
      <div class="yw-actions">
        <button class="yw-btn yw-primary" type="button" data-go="login">Girişe dön</button>
        <button class="yw-btn yw-ghost" type="button" data-resend disabled>Tekrar gönder</button>
      </div>
    </section>
  </div>`;
}

export function installAuthWelcomeV60():{installed:boolean;reason:string}{
  if(isNativeApp())return {installed:false,reason:"native"};
  if(document.getElementById(ROOT_ID))return {installed:true,reason:"ready"};

  const root=document.createElement("div");
  root.id=ROOT_ID;
  root.className="yw-root";
  root.hidden=true;
  root.setAttribute("role","dialog");
  root.setAttribute("aria-modal","true");
  root.setAttribute("aria-label","YKS Defterim hesabı");
  root.innerHTML=markup();
  document.body.append(root);

  const q=<T extends Element=HTMLElement>(selector:string)=>root.querySelector(selector) as T|null;
  const qa=<T extends Element=HTMLElement>(selector:string)=>Array.from(root.querySelectorAll(selector)) as T[];
  const form=q<HTMLFormElement>("[data-form]")!;
  const field=(name:string)=>form.elements.namedItem(name) as HTMLInputElement;
  let mode:EmailMode="login",busy=false,resendAt=0,resendTimer:number|undefined,sentKind:"reset"|"verify"="reset";
  let lastEmail="",lastPassword="",entryView:"welcome"|EmailMode="welcome";

  const setError=(scope:string,message:string)=>{const node=q(`[data-error="${scope}"]`);if(node)node.textContent=message;};
  const clearErrors=()=>qa("[data-error]").forEach(node=>{node.textContent="";});

  const show=(view:View)=>{
    qa<HTMLElement>("[data-view]").forEach(node=>{node.hidden=node.dataset.view!==(view==="verify"?"sent":view);});
    clearErrors();
    root.scrollTop=0;
  };

  const setBusy=(value:boolean)=>{
    busy=value;
    qa<HTMLButtonElement>("button").forEach(button=>{if(!button.hasAttribute("data-resend"))button.disabled=value;});
    const submit=q<HTMLButtonElement>("[data-submit]");
    if(submit)submit.textContent=value?"Bekle…":mode==="register"?"Hesabı oluştur":mode==="reset"?"Bağlantı gönder":"Giriş yap";
  };

  const setMode=(next:EmailMode)=>{
    mode=next;
    const title=q("#ywEmailTitle"),sub=q("[data-email-sub]"),seg=q("[data-seg]");
    if(title)title.textContent=next==="register"?"Hesap oluştur":next==="reset"?"Şifreni sıfırla":"Tekrar hoş geldin";
    if(sub)sub.textContent=next==="register"?"Bir dakikadan kısa sürer.":next==="reset"?"Hesabının e-postasını yaz, sıfırlama bağlantısı gönderelim.":"Hesabına giriş yap, verilerin tüm cihazlarında eşitlensin.";
    if(seg)seg.hidden=next==="reset";
    qa<HTMLButtonElement>("[data-mode]").forEach(button=>button.setAttribute("aria-selected",String(button.dataset.mode===next)));
    qa<HTMLElement>("[data-only]").forEach(node=>{node.hidden=!(node.dataset.only||"").split(" ").includes(next);});
    field("password").autocomplete=next==="register"?"new-password":"current-password";
    setBusy(false);
    clearErrors();
  };

  const startResendTimer=()=>{
    resendAt=Date.now()+60000;
    window.clearInterval(resendTimer);
    const tick=()=>{
      const button=q<HTMLButtonElement>("[data-resend]");if(!button)return;
      const left=Math.max(0,Math.ceil((resendAt-Date.now())/1000));
      button.disabled=left>0;
      button.textContent=left>0?`Tekrar gönder (0:${String(left).padStart(2,"0")})`:"Tekrar gönder";
      if(!left)window.clearInterval(resendTimer);
    };
    tick();resendTimer=window.setInterval(tick,1000);
  };

  const showSent=(kind:"reset"|"verify",email:string)=>{
    sentKind=kind;
    show("sent");
    const title=q("[data-sent-title]"),sub=q("[data-sent-sub]"),mail=q("[data-sent-mail]"),note=q("[data-sent-note]");
    if(title)title.textContent=kind==="verify"?"E-postanı doğrula":"E-postanı kontrol et";
    if(sub)sub.textContent=kind==="verify"?"Hesabını etkinleştirmek için doğrulama bağlantısı gönderdik:":"Şifre sıfırlama bağlantısını gönderdik:";
    if(mail)mail.textContent=email;
    if(note)note.textContent=kind==="verify"?"Bağlantıya tıkladıktan sonra buraya dönüp giriş yap. Gelmediyse spam klasörüne bak.":"Gelmediyse spam klasörüne bak.";
    startResendTimer();
  };

  const finish=(choice:"guest"|"account")=>{
    store(ENTRY_KEY,choice);
    root.hidden=true;
    setBusy(false);
    document.documentElement.dataset.welcome=choice;
    renderGuestBanner();
  };

  const close=()=>{
    root.hidden=true;
    setBusy(false);
    document.documentElement.dataset.welcome=store(ENTRY_KEY)||"closed";
    renderGuestBanner();
  };

  const open=(view:"welcome"|EmailMode="welcome")=>{
    entryView=view;
    root.hidden=false;
    setBusy(false);
    document.documentElement.dataset.welcome="open";
    if(view==="welcome")show("welcome");
    else{show("email");setMode(view);}
  };

  const continueUrl=()=>({url:location.origin+location.pathname,handleCodeInApp:false});
  const sendVerification=async(api:FirebaseAuthApi,user:any)=>{
    try{await api.m.sendEmailVerification(user,continueUrl());}
    catch{await api.m.sendEmailVerification(user);}
  };

  /* Doğrulanmamış e-posta hesabı Firestore kurallarına göre senkron yapamaz.
     Bağlantıyı gönderip oturumu kapatırız; doğrulamadan sonra normal giriş yapılır. */
  const requireVerification=async(api:FirebaseAuthApi,user:any,email:string)=>{
    await sendVerification(api,user);
    try{await api.m.signOut(api.auth);}catch{}
    showSent("verify",email);
  };

  const fillProfileName=(name:string)=>{
    const clean=name.trim().slice(0,80);
    if(!clean)return;
    try{
      const legacy=(window as unknown as {YKSLegacyState?:{readState?:()=>{name?:string}|null;save?:()=>unknown}}).YKSLegacyState;
      const state=legacy?.readState?.();
      if(state&&!String(state.name||"").trim()){state.name=clean;legacy?.save?.();}
    }catch{}
  };

  const submit=async()=>{
    if(busy)return;
    clearErrors();
    const email=field("email").value.trim(),password=field("password").value,name=field("name").value;
    field("email").setAttribute("aria-invalid",String(!/^\S+@\S+\.\S+$/.test(email)));
    if(!/^\S+@\S+\.\S+$/.test(email)){setError("email","Geçerli bir e-posta adresi yaz.");return;}
    if(mode!=="reset"&&!password){setError("email","Şifreni yaz.");return;}
    if(mode==="register"){
      if(passwordLevel(password)<2){setError("email","Şifre en az 8 karakter olmalı ve bir rakam içermeli.");return;}
      if(!field("consent").checked){setError("email","Devam etmek için Gizlilik Politikası'nı kabul et.");return;}
    }
    setBusy(true);
    const api=await firebaseAuth();
    if(!api){setBusy(false);setError("email","Hesap servisine ulaşılamadı. İnternet bağlantını kontrol et.");return;}
    try{
      const {auth,m}=api;
      if(mode==="reset"){
        try{await m.sendPasswordResetEmail(auth,email,continueUrl());}
        catch(error){if(String((error as {code?:string})?.code||"").includes("continue"))await m.sendPasswordResetEmail(auth,email);else throw error;}
        lastEmail=email;
        showSent("reset",email);
        return;
      }
      await m.setPersistence(auth,m.browserLocalPersistence);
      try{sessionStorage.setItem(PENDING_ROLE,"student");}catch{}
      if(mode==="register"){
        const credential=await m.createUserWithEmailAndPassword(auth,email,password);
        if(name.trim())try{await m.updateProfile(credential.user,{displayName:name.trim().slice(0,80)});}catch{}
        fillProfileName(name);
        lastEmail=email;lastPassword=password;
        await requireVerification(api,credential.user,email);
        return;
      }
      const credential=await m.signInWithEmailAndPassword(auth,email,password);
      if(!credential.user.emailVerified){
        lastEmail=email;lastPassword=password;
        await requireVerification(api,credential.user,email);
        return;
      }
      finish("account");
      try{(window as unknown as {toast?:(m:string)=>void}).toast?.("Giriş yapıldı · verilerin eşitleniyor");}catch{}
    }catch(error){
      console.error("E-posta hesabı",error);
      setError("email",authErrorText(error));
    }finally{
      if(!root.hidden)setBusy(false);
    }
  };

  const resend=async()=>{
    if(Date.now()<resendAt)return;
    setError("sent","");
    const api=await firebaseAuth();
    if(!api){setError("sent","Hesap servisine ulaşılamadı.");return;}
    try{
      if(sentKind==="reset")await api.m.sendPasswordResetEmail(api.auth,lastEmail);
      else{
        // Doğrulama e-postası oturum gerektirir: kısa süreli giriş, gönderim, çıkış.
        const credential=await api.m.signInWithEmailAndPassword(api.auth,lastEmail,lastPassword);
        if(credential.user.emailVerified){finish("account");return;}
        await sendVerification(api,credential.user);
        try{await api.m.signOut(api.auth);}catch{}
      }
      startResendTimer();
    }catch(error){setError("sent",authErrorText(error));}
  };

  const google=async(scope:"welcome"|"email")=>{
    if(busy)return;
    clearErrors();
    setBusy(true);
    const api=await firebaseAuth();
    if(!api){setBusy(false);setError(scope,"Hesap servisine ulaşılamadı. İnternet bağlantını kontrol et.");return;}
    try{
      const provider=new api.m.GoogleAuthProvider();
      provider.setCustomParameters({prompt:"select_account"});
      try{sessionStorage.setItem(PENDING_ROLE,"student");}catch{}
      await api.m.setPersistence(api.auth,api.m.browserLocalPersistence);
      await api.m.signInWithPopup(api.auth,provider);
      finish("account");
      try{(window as unknown as {toast?:(m:string)=>void}).toast?.("Giriş yapıldı · verilerin eşitleniyor");}catch{}
    }catch(error){
      console.error("Google hesabı",error);
      setError(scope,authErrorText(error));
    }finally{
      if(!root.hidden)setBusy(false);
    }
  };

  root.addEventListener("click",event=>{
    const target=(event.target as HTMLElement).closest<HTMLElement>("button");
    if(!target||!root.contains(target))return;
    if(target.hasAttribute("data-guest")){finish("guest");return;}
    if(target.hasAttribute("data-google")){void google(q<HTMLElement>('[data-view="welcome"]')?.hidden?"email":"welcome");return;}
    // Uygulamanın içinden (bant, Ayarlar) açıldıysa geri tuşu ekranı kapatır.
    if(target.hasAttribute("data-back")){if(mode==="reset")setMode("login");else if(entryView!=="welcome")close();else show("welcome");return;}
    if(target.hasAttribute("data-resend")){void resend();return;}
    if(target.hasAttribute("data-eye")){
      const input=field("password"),visible=input.type==="text";
      input.type=visible?"password":"text";
      target.textContent=visible?"Göster":"Gizle";
      target.setAttribute("aria-label",visible?"Şifreyi göster":"Şifreyi gizle");
      return;
    }
    const go=target.dataset.go as EmailMode|undefined;
    if(go){show("email");setMode(go);return;}
    const nextMode=target.dataset.mode as EmailMode|undefined;
    if(nextMode)setMode(nextMode);
  });
  form.addEventListener("submit",event=>{event.preventDefault();void submit();});
  field("password").addEventListener("input",()=>{
    const level=passwordLevel(field("password").value);
    const meter=q("[data-only='register'][data-level]"),hint=q("[data-strength]");
    if(meter)meter.dataset.level=String(level);
    if(hint)hint.textContent=LEVEL_TEXT[level]??"";
  });
  root.addEventListener("keydown",event=>{
    if(event.key!=="Escape"||busy||!q<HTMLElement>('[data-view="welcome"]')?.hidden)return;
    if(mode==="reset")setMode("login");else if(entryView!=="welcome")close();else show("welcome");
  });

  /* Ayarlar'daki "Giriş yap" artık bu ekranı açar. Google düğmesi (cloudLoginBtn) aynen kalır. */
  document.addEventListener("click",event=>{
    const login=(event.target as HTMLElement).closest?.("[data-account-login]");
    if(!login)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open("login");
  },true);

  window.addEventListener("yks:auth-state",event=>{
    // Doğrulama bekleyen e-posta hesabı da kısa süre "signedIn" görünebilir; o akış kendi kapanır.
    const signedIn=(event as CustomEvent<{signedIn?:boolean}>).detail?.signedIn;
    if(signedIn&&!root.hidden&&!busy&&q<HTMLElement>('[data-view="sent"]')?.hidden)finish("account");
    renderGuestBanner();
  });

  window.YKSWelcome={open,close};

  const choice=store(ENTRY_KEY);
  if(choice){
    document.documentElement.dataset.welcome=choice;
    renderGuestBanner();
  }else if(hadCloudAccount()){
    // Önceki bulut kullanıcısı: oturum geri gelirse karşılama hiç görünmez.
    void firebaseAuth().then(async api=>{
      if(!api)return;
      try{await api.auth.authStateReady?.();}catch{}
      if(api.auth.currentUser)finish("account");
      else if(!store(ENTRY_KEY))open("welcome");
    });
  }else{
    open("welcome");
    void firebaseAuth();
  }
  return {installed:true,reason:choice||"first-run"};
}

function signedInNow():boolean{
  return document.getElementById("cloudSyncBox")?.dataset.account==="connected";
}

function renderGuestBanner():void{
  const existing=document.getElementById(GUEST_ID);
  const visible=store(ENTRY_KEY)==="guest"&&!store(GUEST_BANNER_KEY)&&!signedInNow();
  if(!visible){existing?.remove();return;}
  if(existing)return;
  const host=document.getElementById("todayFreshStart");
  if(!host)return;
  const banner=document.createElement("div");
  banner.id=GUEST_ID;
  banner.className="yw-guest";
  banner.setAttribute("role","note");
  banner.innerHTML=`<span class="yw-guest-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M12 8v5M12 16h.01"/></svg></span>
    <p><b>Verilerin sadece bu cihazda</b>Hesap aç, yedeklensin.</p>
    <button class="yw-guest-open" type="button">Hesap aç</button>
    <button class="yw-guest-close" type="button" aria-label="Bu uyarıyı gizle">×</button>`;
  banner.querySelector(".yw-guest-open")?.addEventListener("click",()=>window.YKSWelcome?.open("register"));
  banner.querySelector(".yw-guest-close")?.addEventListener("click",()=>{store(GUEST_BANNER_KEY,"1");banner.remove();});
  host.prepend(banner);
}
