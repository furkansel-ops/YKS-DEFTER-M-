import "./account-gate.css";

type AuthPhase="loading"|"signedout"|"unverified"|"signedin"|"blocked"|"error";
export type AccountState={phase:AuthPhase;email:string;busy:boolean;message:string;error:boolean;googleAvailable:boolean};
type AccountAPI={
  getState():AccountState;
  login(email:string,password:string):Promise<void>;
  register(email:string,password:string):Promise<void>;
  resetPassword(email:string):Promise<void>;
  resendVerification():Promise<void>;
  refreshVerification():Promise<void>;
  signOut():Promise<void>;
  googleSignIn():Promise<void>;
};
type SessionAPI={getState():{mode:string};enterGuest():void;};
type AccountWindow=Window&{__YKS_AUTH__?:AccountAPI;__YKS_SESSION__?:SessionAPI};
type View="login"|"register"|"reset";

export function installAccountGate():void{
  if(document.getElementById("accountGate"))return;
  const host=window as AccountWindow;
  const gate=document.createElement("section");
  gate.id="accountGate";
  gate.setAttribute("role","dialog");
  gate.setAttribute("aria-modal","true");
  gate.setAttribute("aria-labelledby","accountTitle");
  gate.innerHTML=`
    <div class="account-layout">
      <aside class="account-story" aria-label="YKS Defterim">
        <div class="account-brand"><img src="./icon-192.png" width="44" height="44" alt=""><span>YKS Defterim</span></div>
        <div class="account-story-copy"><p class="account-eyebrow">EMEĞİN BİR YERDE.</p><h2>Hedefin aynı.<br>Defterin her yerde.</h2><p>Telefonunda başla, bilgisayarında devam et. Çalışmalarını kendi hesabında bir arada tut.</p></div>
        <div class="account-benefits"><p><span aria-hidden="true">01</span> Çalışmaların ve ilerlemen</p><p><span aria-hidden="true">02</span> Telefon, bilgisayar ve web</p><p><span aria-hidden="true">03</span> Hesabınla eşitleme ve yedek</p></div>
        <p class="account-story-foot">Küçük adımlar. Biriken emek.</p>
      </aside>
      <div class="account-panel">
        <div class="account-mobile-brand"><img src="./icon-192.png" width="36" height="36" alt=""><span>YKS Defterim</span></div>
        <header><p class="account-eyebrow" id="accountEyebrow">DEFTERİNE HOŞ GELDİN</p><h1 id="accountTitle" tabindex="-1">Kaldığın yerden devam et.</h1><p id="accountDescription">Çalışmalarını kaydetmek, yedeklemek ve cihazların arasında eşitlemek için giriş yap.</p></header>
        <nav class="account-tabs" aria-label="Hesap işlemi" id="accountTabs"><button type="button" data-auth-view="login" aria-pressed="true">Giriş yap</button><button type="button" data-auth-view="register" aria-pressed="false">Hesap oluştur</button></nav>
        <p id="accountMessage" class="account-message" role="status" aria-live="polite" aria-atomic="true">Hesabın kontrol ediliyor…</p>
        <form id="accountLoginForm" class="account-form">
          <label for="loginEmail">E-posta adresin</label><input id="loginEmail" name="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" maxlength="254" required placeholder="ornek@eposta.com">
          <div class="account-label-row"><label for="loginPassword">Şifren</label><button type="button" class="account-text-button" data-auth-view="reset">Şifremi unuttum</button></div>
          <div class="account-password"><input id="loginPassword" name="password" type="password" autocomplete="current-password" maxlength="4096" required placeholder="Şifreni gir"><button type="button" data-password-toggle="loginPassword" aria-pressed="false" aria-label="Şifreyi göster">Göster</button></div>
          <button type="submit" class="account-primary">Giriş yap <span aria-hidden="true">→</span></button>
        </form>
        <form id="accountRegisterForm" class="account-form" hidden>
          <label for="registerEmail">E-posta adresin</label><input id="registerEmail" name="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" maxlength="254" required placeholder="ornek@eposta.com">
          <label for="registerPassword">Şifre oluştur</label><div class="account-password"><input id="registerPassword" name="password" type="password" autocomplete="new-password" minlength="10" maxlength="4096" required aria-describedby="registerPasswordHint" placeholder="En az 10 karakter"><button type="button" data-password-toggle="registerPassword" aria-pressed="false" aria-label="Şifreyi göster">Göster</button></div><small id="registerPasswordHint">Başka bir yerde kullanmadığın, en az 10 karakterli bir şifre seç.</small>
          <label for="registerConfirm">Şifreni tekrar yaz</label><input id="registerConfirm" name="password-confirm" type="password" autocomplete="new-password" minlength="10" maxlength="4096" required placeholder="Şifreni doğrula">
          <p class="account-fine-print">Hesabını açtıktan sonra e-posta adresini doğrulamanı isteyeceğiz. Zaten hesabın varsa yeni bir hesap oluşturma; aynı hesapla giriş yap.</p>
          <button type="submit" class="account-primary">Hesap oluştur <span aria-hidden="true">→</span></button>
        </form>
        <form id="accountResetForm" class="account-form" hidden>
          <label for="resetEmail">Hesabının e-posta adresi</label><input id="resetEmail" name="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" maxlength="254" required placeholder="ornek@eposta.com">
          <button type="submit" class="account-primary">Sıfırlama bağlantısı gönder</button>
          <button type="button" class="account-secondary" data-auth-view="login">Giriş ekranına dön</button>
        </form>
        <section id="accountVerification" hidden><p class="account-verify-email" id="accountVerificationEmail"></p><p>Gelen kutunu ve spam klasörünü kontrol et. E-postadaki doğrulama bağlantısını açtıktan sonra buraya dön.</p><button type="button" id="accountCheckVerification" class="account-primary">E-postamı doğruladım</button><button type="button" id="accountResendVerification" class="account-secondary">Doğrulama e-postasını tekrar gönder</button><button type="button" id="accountOtherAccount" class="account-text-button">Çıkış yap / başka hesap kullan</button></section>
        <button type="button" id="accountRetry" class="account-secondary" hidden>Yeniden yükle ve kontrol et</button><button type="button" id="accountRetrySignOut" class="account-text-button" hidden>Açık hesaptan çıkış yap</button>
        <div id="accountGoogleArea" hidden><div class="account-divider"><span>veya</span></div><button type="button" id="accountGoogle" class="account-secondary">Google ile devam et</button></div>
        <p id="accountExistingGoogle" class="account-fine-print" hidden>Google ile açtığın bir hesabın mı var? Web sürümünde aynı Google hesabına girip “Uygulamalar için şifre ekle” seçeneğini kullan. Burada o e-posta ve yeni uygulama şifrenle giriş yapabilirsin. <a href="https://furkansel-ops.github.io/YKS-DEFTER-M-/" target="_blank" rel="noopener noreferrer">Web sürümünü aç</a></p>
        <div class="account-guest-option"><button type="button" id="accountGuest" class="account-text-button">Kaydetmeden dene <span aria-hidden="true">↗</span></button><p>Deneme çalışması kaydedilmez, yedeklenmez veya eşitlenmez. Ekran yenilendiğinde ya da kapatıldığında silinir.</p></div>
        <footer class="account-footer"><a href="./privacy.html" target="_blank" rel="noopener">Gizlilik</a><span aria-hidden="true">·</span><a href="./data-deletion.html" target="_blank" rel="noopener">Verilerin ve silme</a></footer><button type="button" id="accountLocalDataDelete" class="account-text-button" hidden>Bu cihazdaki kayıtları sil</button>
      </div>
    </div>`;
  document.body.append(gate);
  document.getElementById("accountBoot")?.remove();
  const banner=document.createElement("aside");
  banner.id="accountGuestBanner";
  banner.hidden=true;
  banner.innerHTML=`<div><strong>Kaydetmeden deneme</strong><span>Bu oturumdaki çalışmalar saklanmaz.</span></div><button type="button" id="accountGuestLogin">Hesaba geç</button>`;
  document.body.append(banner);
  const dataPrompt=document.createElement("div");
  dataPrompt.id="accountDataPrompt";
  dataPrompt.innerHTML='<strong>Kayıt ve yedek için hesabına geç.</strong><p>Deneme çalışması sadece açık oturumda kalır. Eski hesap kayıtlarına dokunulmaz.</p><button type="button">Giriş ekranını aç</button>';
  document.getElementById("v30DataTop")?.prepend(dataPrompt);
  const get=<T extends HTMLElement=HTMLElement>(id:string)=>gate.querySelector<T>(`#${id}`)!;
  const input=(id:string)=>get<HTMLInputElement>(id);
  const message=get("accountMessage");
  let view:View="login";
  let timedOut=false;
  let dataReady=false;
  let dataFailed=false;
  let pendingKey="";
  let pendingTimer:number|undefined;
  let state:AccountState={phase:"loading",email:"",busy:false,message:"Hesabın kontrol ediliyor…",error:false,googleAvailable:false};
  const inertBefore=new Map<HTMLElement,boolean>();
  let previousFocus:HTMLElement|null=null;
  const isGuest=()=>host.__YKS_SESSION__?.getState().mode==="guest";
  const clearPasswords=()=>{
    for(const id of ["loginPassword","registerPassword","registerConfirm"]){input(id).value="";input(id).type="password";input(id).setCustomValidity("");}
    gate.querySelectorAll<HTMLButtonElement>("[data-password-toggle]").forEach(button=>{button.textContent="Göster";button.setAttribute("aria-pressed","false");button.setAttribute("aria-label","Şifreyi göster");});
  };
  const shield=()=>{
    if(gate.hidden)return;
    for(const child of document.body.children){
      if(!(child instanceof HTMLElement)||child===gate||child===banner||/^(SCRIPT|STYLE|LINK)$/.test(child.tagName))continue;
      if(!inertBefore.has(child))inertBefore.set(child,child.inert);
      child.inert=true;
    }
  };
  const setOpen=(open:boolean)=>{
    const wasOpen=!gate.hidden;
    gate.hidden=!open;
    document.documentElement.dataset.accountGate=open?"closed":"open";
    if(open){
      if(!wasOpen)previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
      shield();
      if(!wasOpen)get("accountTitle").focus({preventScroll:true});
    }else{
      for(const [element,wasInert] of inertBefore)element.inert=wasInert;
      inertBefore.clear();
      if(wasOpen){clearPasswords();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
    }
  };
  new MutationObserver(shield).observe(document.body,{childList:true});
  const showMessage=(text:string,error=false)=>{message.textContent=text;message.hidden=!text;message.dataset.error=String(error);};
  const render=()=>{
    const guest=isGuest();
    const verified=state.phase==="signedin"&&!guest&&dataReady;
    const pending=!guest&&!dataFailed&&(state.phase==="loading"||state.busy||state.phase==="signedin"&&!dataReady);
    const key=pending?`${state.phase}:${state.busy}:${dataReady}`:"";
    if(key!==pendingKey){
      window.clearTimeout(pendingTimer);pendingKey=key;timedOut=false;
      if(pending)pendingTimer=window.setTimeout(()=>{timedOut=true;render();},12000);
    }
    banner.hidden=!guest;
    document.documentElement.dataset.accountMode=guest?"guest":verified?"account":"locked";
    setOpen(!guest&&!verified);
    if(gate.hidden)return;
    const verification=state.phase==="unverified";
    const openingData=state.phase==="signedin"&&!dataReady;
    const loading=(state.phase==="loading"||openingData)&&!timedOut&&!dataFailed;
    const unavailable=state.phase==="error"||timedOut||dataFailed;
    get("accountTabs").hidden=verification;
    get("accountLoginForm").hidden=verification||view!=="login";
    get("accountRegisterForm").hidden=verification||view!=="register";
    get("accountResetForm").hidden=verification||view!=="reset";
    get("accountVerification").hidden=!verification;
    get("accountVerificationEmail").textContent=state.email;
    get("accountRetry").hidden=!unavailable;
    get("accountRetrySignOut").hidden=!(state.phase==="blocked"||state.phase==="error");
    get("accountLocalDataDelete").hidden=!window.__YKS_SESSION__?.getState().canClearDeviceStudyStorage||state.phase==="loading";
    get("accountGoogleArea").hidden=verification||view==="reset"||!state.googleAvailable;
    get("accountExistingGoogle").hidden=verification||view!=="login"||state.googleAvailable||loading;
    const heading=verification?"E-postanı doğrula.":view==="register"?"Emeğine bir hesap aç.":view==="reset"?"Yeni bir şifre, aynı defter.":"Kaldığın yerden devam et.";
    get("accountTitle").textContent=heading;
    get("accountEyebrow").textContent=verification?"SON BİR ADIM":view==="reset"?"ŞİFRENİ YENİLE":"DEFTERİNE HOŞ GELDİN";
    get("accountDescription").textContent=verification?"Kayıtlarını hesabına güvenle bağlamak için e-posta adresini doğrulaman gerekiyor.":view==="reset"?"Sana güvenli bir şifre yenileme bağlantısı göndereceğiz. Çalışma kayıtların değişmez.":view==="register"?"Çalışmalarını sakla, yedekle ve aynı hesapla her cihazdan devam et.":"Çalışmalarını kaydetmek, yedeklemek ve cihazların arasında eşitlemek için giriş yap.";
    gate.querySelectorAll<HTMLButtonElement>(".account-tabs button").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.authView===view)));
    gate.querySelectorAll<HTMLButtonElement|HTMLInputElement>("button,input").forEach(control=>{
      const alwaysAvailable=control.id==="accountGuest"||control.id==="accountRetry"||control.id==="accountRetrySignOut"||control.hasAttribute("data-auth-view");
      control.disabled=state.busy||(!alwaysAvailable&&(loading||unavailable));
    });
    get<HTMLButtonElement>("accountGuest").disabled=state.busy||!host.__YKS_SESSION__;
    get<HTMLButtonElement>("accountRetry").disabled=false;
    gate.setAttribute("aria-busy",String(state.busy||loading));
    showMessage(dataFailed?"Kayıt alanı açılamadı. Mevcut kayıtların silinmedi. Uygulamayı yeniden açıp deneyebilirsin.":timedOut?"Hesabın kontrolü tamamlanamadı. Bağlantını kontrol edip yeniden deneyebilir veya kaydetmeden kullanabilirsin.":openingData?"Hesabın açıldı. Kayıtların hazırlanıyor…":state.message,state.error||timedOut||dataFailed);
  };
  const changeView=(next:View)=>{
    if(state.busy)return;
    const email=input(view==="register"?"registerEmail":view==="reset"?"resetEmail":"loginEmail").value;
    clearPasswords();view=next;
    input(next==="register"?"registerEmail":next==="reset"?"resetEmail":"loginEmail").value=email;
    render();
    if(state.phase!=="loading"&&!state.error)showMessage("");
    get("accountTitle").focus({preventScroll:true});
  };
  gate.querySelectorAll<HTMLButtonElement>("[data-auth-view]").forEach(button=>button.addEventListener("click",()=>changeView(button.dataset.authView as View)));
  gate.querySelectorAll<HTMLButtonElement>("[data-password-toggle]").forEach(button=>button.addEventListener("click",()=>{
    const field=input(button.dataset.passwordToggle!);const visible=field.type==="password";
    field.type=visible?"text":"password";button.textContent=visible?"Gizle":"Göster";
    button.setAttribute("aria-pressed",String(visible));button.setAttribute("aria-label",visible?"Şifreyi gizle":"Şifreyi göster");
  }));
  const act=(action:(api:AccountAPI)=>Promise<void>)=>{
    const api=host.__YKS_AUTH__;
    if(!api||state.busy){if(!api)showMessage("Hesap hizmeti henüz hazır değil. Yeniden yükleyip deneyebilirsin.",true);return;}
    void action(api).catch(()=>showMessage("İşlem tamamlanamadı. Bağlantını kontrol edip yeniden dene.",true)).finally(clearPasswords);
  };
  get<HTMLFormElement>("accountLoginForm").addEventListener("submit",event=>{
    event.preventDefault();if(!(event.currentTarget as HTMLFormElement).reportValidity())return;
    const email=input("loginEmail").value.trim();let password=input("loginPassword").value;
    act(api=>{const pending=api.login(email,password);password="";return pending;});clearPasswords();
  });
  input("registerConfirm").addEventListener("input",()=>input("registerConfirm").setCustomValidity(""));
  input("registerPassword").addEventListener("input",()=>input("registerConfirm").setCustomValidity(""));
  get<HTMLFormElement>("accountRegisterForm").addEventListener("submit",event=>{
    event.preventDefault();const confirm=input("registerConfirm");confirm.setCustomValidity(confirm.value===input("registerPassword").value?"":"Şifreler aynı olmalı.");
    if(!(event.currentTarget as HTMLFormElement).reportValidity())return;
    const email=input("registerEmail").value.trim();let password=input("registerPassword").value;
    act(api=>{const pending=api.register(email,password);password="";return pending;});clearPasswords();
  });
  get<HTMLFormElement>("accountResetForm").addEventListener("submit",event=>{
    event.preventDefault();if(!(event.currentTarget as HTMLFormElement).reportValidity())return;
    act(api=>api.resetPassword(input("resetEmail").value.trim()));
  });
  get("accountGoogle").addEventListener("click",()=>act(api=>api.googleSignIn()));
  get("accountCheckVerification").addEventListener("click",()=>act(api=>api.refreshVerification()));
  get("accountResendVerification").addEventListener("click",()=>act(api=>api.resendVerification()));
  get("accountOtherAccount").addEventListener("click",()=>act(api=>api.signOut()));
  get("accountRetrySignOut").addEventListener("click",()=>act(api=>api.signOut()));
  get("accountLocalDataDelete").addEventListener("click",()=>document.querySelector<HTMLButtonElement>("[data-delete-device-data]")?.click());
  get("accountRetry").addEventListener("click",()=>location.reload());
  get("accountGuest").addEventListener("click",()=>{
    clearPasswords();try{host.__YKS_SESSION__?.enterGuest();}catch{showMessage("Deneme oturumu açılamadı. Tarayıcının depolama iznini kontrol et.",true);}
  });
  const returnToAccount=()=>{
    if(!confirm("Deneme oturumundaki çalışma kaydedilmeyecek. Kendi hesabına geçmek için giriş ekranı açılsın mı?"))return;
    location.reload();
  };
  document.getElementById("accountGuestLogin")!.addEventListener("click",returnToAccount);
  dataPrompt.querySelector("button")!.addEventListener("click",returnToAccount);
  gate.addEventListener("keydown",event=>{
    if(event.key==="Escape"){event.preventDefault();event.stopPropagation();if(view!=="login"&&state.phase!=="unverified")changeView("login");}
    if(event.key!=="Tab")return;
    const controls=[...gate.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href]')].filter(element=>element.getClientRects().length>0);
    const first=controls[0],last=controls.at(-1);
    if(!first||!last){event.preventDefault();get("accountTitle").focus();return;}
    if(event.shiftKey&&(document.activeElement===first||!controls.includes(document.activeElement as HTMLElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  document.addEventListener("focusin",event=>{if(!gate.hidden&&event.target instanceof Node&&!gate.contains(event.target))get("accountTitle").focus({preventScroll:true});});
  window.addEventListener("yks:auth-state",()=>{
    const next=host.__YKS_AUTH__?.getState();if(!next)return;
    const phaseChanged=next.phase!==state.phase;state=next;render();
    if(phaseChanged&&!gate.hidden){clearPasswords();get("accountTitle").focus({preventScroll:true});}
  });
  window.addEventListener("yks:cloud-runtime",event=>{
    const detail=(event as CustomEvent<{state:string;message?:string}>).detail;
    if(detail?.state==="error"&&state.phase==="loading"){timedOut=true;render();}
  });
  window.addEventListener("yks:session-mode",render);
  window.addEventListener("pagehide",clearPasswords);
  void window.__YKS_DATA__?.ready.then(result=>{dataReady=result.ok;dataFailed=!result.ok;render();}).catch(()=>{dataFailed=true;render();});
  state=host.__YKS_AUTH__?.getState()??state;
  render();get("accountTitle").focus({preventScroll:true});
}
