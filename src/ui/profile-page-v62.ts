import "./profile-page-v62.css";
import {authErrorText,firebaseAuth,type FirebaseAuthApi} from "./auth-welcome-v60";

/* v62 — sağ üstteki profil simgesinin açtığı Profil sayfası.
 * Var olan Ayarlar sayfası olduğu gibi kalır ("Tüm ayarlar"). Hesap silme,
 * firestore.rules'taki sahibine ait silme kurallarını ve mevcut senkron
 * tombstone protokolünü (startsDeletion → chunk silme → completesDeletion) kullanır. */

type ProfileState={name?:string;puanTuru?:string;targetNetTYT?:number;targetNet?:number;targetNetAYT?:number;targetUniversity?:string;targetDepartment?:string};
type LegacyWindow=Window&{
  YKSLegacyState?:{readState?:()=>ProfileState|null};
  openWizard?:()=>unknown;
  v30Action?:(action:string)=>unknown;
  toast?:(message:string)=>unknown;
  YKSWelcome?:{open(view?:string):void};
};

const ROOT_ID="yksProfilePage";
const FIREBASE="https://www.gstatic.com/firebasejs/12.17.1/";
const TYT_DATE="2027-06-19";
const ENTRY_KEY="yks_entry_choice_v1";
const runtime=window as LegacyWindow;
const TRACK_NAMES:Record<string,string>={SAY:"Sayısal",EA:"Eşit Ağırlık",SOZ:"Sözel",DIL:"Dil"};

const svg=(path:string)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const ICONS={
  back:svg('<path d="M15 18l-6-6 6-6"/>'),
  sync:svg('<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>'),
  lock:svg('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
  out:svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>'),
  palette:svg('<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1.1-2.6H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/>'),
  bell:svg('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>'),
  chat:svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>'),
  gear:svg('<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.5-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.5-1a7 7 0 0 0 2 1.2L10 21h4l.4-2.6a7 7 0 0 0 2-1.2l2.5 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/>'),
  shield:svg('<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>'),
  trash:svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
  user:svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  warn:svg('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>')
};

function esc(value:unknown):string{
  return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function state():ProfileState{
  try{return runtime.YKSLegacyState?.readState?.()||{};}catch{return {};}
}
function initials(name:string):string{
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part.charAt(0).toLocaleUpperCase("tr-TR")).join("")||"?";
}
function daysLeft():number{
  const today=new Date();today.setHours(0,0,0,0);
  return Math.max(0,Math.round((new Date(TYT_DATE+"T00:00:00").getTime()-today.getTime())/86400000));
}
function lastSyncText():string{
  let at=0;try{at=Number(localStorage.getItem("yks_last_sync_at"))||0;}catch{}
  if(!at)return "Henüz yok";
  const minutes=Math.floor((Date.now()-at)/60000);
  if(minutes<1)return "Az önce";
  if(minutes<60)return `${minutes} dk önce`;
  if(minutes<1440)return `${Math.floor(minutes/60)} sa önce`;
  return new Date(at).toLocaleDateString("tr-TR",{day:"numeric",month:"long"});
}
function toast(message:string):void{try{runtime.toast?.(message);}catch{}}
function openSettings(category:string):void{
  try{runtime.v30Action?.("settings");}catch{}
  window.dispatchEvent(new CustomEvent("yks:open-settings",{detail:{category}}));
}
function isPasswordUser(user:any):boolean{
  return Array.isArray(user?.providerData)&&user.providerData.some((p:any)=>p?.providerId==="password");
}

/* Öğrenciye ait bulut kayıtlarını siler. Sıra önemlidir: profil önce silinir ki
   koçluk köprüsü arka planda paylaşımı yeniden oluşturamasın (profileRole şartı). */
async function deleteCloudData(api:FirebaseAuthApi,uid:string,progress:(text:string)=>void):Promise<void>{
  const fs:any=await import(/* @vite-ignore */ FIREBASE+"firebase-firestore.js");
  const db=fs.getFirestore(api.app);
  const byStudent=(name:string)=>fs.getDocs(fs.query(fs.collection(db,name),fs.where("studentUid","==",uid)));

  progress("Koç görevleri ve mesajlar siliniyor…");
  for(const name of ["coachingActions","coachingMessages"]){
    const snap=await byStudent(name);
    for(const item of snap.docs)await fs.deleteDoc(item.ref);
  }
  // v69: randevu ve saat kilidi birlikte silinir (koçun takviminde saat boşalır).
  // Kural henüz yayında değilse randevu da olamaz; izin hatası silmeyi durdurmaz.
  progress("Randevular siliniyor…");
  try{
    const appts=await byStudent("coachAppointments");
    for(const item of appts.docs){const batch=fs.writeBatch(db);batch.delete(item.ref);batch.delete(fs.doc(db,"coachSlots",item.id));await batch.commit();}
  }catch(error){if(!String((error as {code?:string})?.code||"").includes("permission-denied"))throw error;}
  progress("Koç bağlantıları kapatılıyor…");
  const links=await byStudent("coachingLinks");
  for(const item of links.docs){
    if(item.data()?.active===true)await fs.updateDoc(item.ref,{active:false,endedAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()});
  }

  progress("Hesap profili siliniyor…");
  const profileRef=fs.doc(db,"accountProfiles",uid);
  if((await fs.getDoc(profileRef)).exists())await fs.deleteDoc(profileRef);

  progress("Koç paylaşımı siliniyor…");
  const accessRef=fs.doc(db,"studentCoachAccess",uid),access=await fs.getDoc(accessRef);
  if(access.exists()){
    const code=String(access.data()?.code||"");
    if(code){
      const codeRef=fs.doc(db,"studentCoachCodes",code);
      if((await fs.getDoc(codeRef)).exists())await fs.deleteDoc(codeRef);
    }
    await fs.deleteDoc(accessRef);
  }
  const shareRef=fs.doc(db,"coachingShares",uid);
  if((await fs.getDoc(shareRef)).exists())await fs.deleteDoc(shareRef);

  progress("Bulut yedeği siliniyor…");
  const metaRef=fs.doc(db,"users",uid,"sync","meta"),metaSnap=await fs.getDoc(metaRef);
  if(metaSnap.exists()){
    const meta=metaSnap.data()||{};
    if(Number(meta.format)!==4)throw Object.assign(new Error("Eski bulut biçimi"),{code:"yks/legacy-format"});
    if(meta.deleted!==true){
      await fs.updateDoc(metaRef,{deleted:true,cleanupPending:true,deletedAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp(),count:0,hash:"",revision:Number(meta.revision)+1});
    }
    const chunks=await fs.getDocs(fs.collection(db,"users",uid,"chunks"));
    for(const item of chunks.docs)await fs.deleteDoc(item.ref);
    if((await fs.getDoc(metaRef)).data()?.cleanupPending===true)await fs.updateDoc(metaRef,{cleanupPending:false,updatedAt:fs.serverTimestamp()});
  }
}

export function installProfilePageV62():{installed:boolean}{
  if(document.getElementById(ROOT_ID))return {installed:true};
  const root=document.createElement("div");
  root.id=ROOT_ID;
  root.className="ypg-root";
  root.hidden=true;
  root.setAttribute("role","dialog");
  root.setAttribute("aria-modal","true");
  root.setAttribute("aria-label","Profil");
  document.body.append(root);

  let user:any=null,deleting=false;

  const row=(action:string,icon:string,label:string,value="",tone="")=>`<button class="ypg-row" type="button" data-action="${action}"${tone?` data-tone="${tone}"`:""}><span class="ypg-ic">${icon}</span>${label}<span class="ypg-val">${esc(value)}${action==="none"?"":`<span class="ypg-chev" aria-hidden="true">›</span>`}</span></button>`;

  const render=()=>{
    const s=state();
    const name=String(s.name||user?.displayName||"").trim()||"YKS öğrencisi";
    const signedIn=!!user;
    const tyt=Number(s.targetNetTYT??s.targetNet)||0,ayt=Number(s.targetNetAYT)||0;
    const goal=[s.targetUniversity,s.targetDepartment].filter(Boolean).join(" · ");
    const sub=signedIn?String(user.email||"Hesap bağlı"):"Misafir · hesap bağlı değil";
    root.innerHTML=`<div class="ypg-shell">
      <div class="ypg-top"><button class="ypg-icon-btn" type="button" data-action="close" aria-label="Geri">${ICONS.back}</button><h2 id="ypgTitle">Profil</h2><span></span></div>
      <section class="ypg-hero" aria-labelledby="ypgName">
        <div class="ypg-av" data-guest="${!signedIn}" aria-hidden="true">${signedIn?esc(initials(name)):ICONS.user}</div>
        <div class="ypg-who"><b id="ypgName">${esc(name)}</b><span>${esc(sub)}</span>${goal?`<span>${esc(goal)}</span>`:""}
          <span class="ypg-pill" data-tone="${signedIn?"ok":"warn"}"><i></i>${signedIn?"Bulut senkronu açık":"Sadece bu cihazda"}</span></div>
        <button class="ypg-edit" type="button" data-action="edit">Düzenle</button>
      </section>
      ${signedIn?"":`<section class="ypg-cta"><b>Verilerini kaybetme</b><p>Hesap açınca çalışmaların yedeklenir, telefon değişse bile kalır ve koçunla senkron olur.</p><button type="button" data-action="signup">Hesap aç veya giriş yap</button></section>`}
      <div class="ypg-stats">
        <div class="ypg-stat"><b>${tyt||"—"}</b><span>TYT hedef</span></div>
        <div class="ypg-stat"><b>${ayt||"—"}</b><span>${s.puanTuru==="DIL"?"YDT":"AYT"} hedef</span></div>
        <div class="ypg-stat"><b>${daysLeft()}</b><span>gün kaldı</span></div>
      </div>
      ${signedIn?`<div class="ypg-grp"><p class="ypg-gl">HESAP</p><div class="ypg-list">
        ${row("account",ICONS.sync,"Son eşitleme",lastSyncText())}
        ${isPasswordUser(user)?row("password",ICONS.lock,"Şifreyi değiştir"):""}
        ${row("signout",ICONS.out,"Çıkış yap")}
      </div></div>`:""}
      <div class="ypg-grp"><p class="ypg-gl">UYGULAMA</p><div class="ypg-list">
        ${row("profile-settings",ICONS.user,"Profil ve hedefler",TRACK_NAMES[String(s.puanTuru)]||"")}
        ${row("appearance",ICONS.palette,"Görünüm ve tema")}
        ${row("notifications",ICONS.bell,"Bildirimler")}
        ${row("coach",ICONS.chat,"Koç bağlantısı")}
        ${row("settings",ICONS.gear,"Tüm ayarlar")}
        ${row("privacy",ICONS.shield,"Gizlilik politikası")}
      </div></div>
      ${signedIn?`<div class="ypg-grp"><div class="ypg-list">${row("delete",ICONS.trash,"Hesabı sil","","danger")}</div>
        <p class="ypg-note">Hesabını silmek bulut yedeğini ve koç bağlantını kaldırır. Bu cihazdaki çalışmaların kalır.</p></div>`:""}
    </div>`;
  };

  const renderDelete=()=>{
    const password=isPasswordUser(user);
    const sheet=document.createElement("div");
    sheet.className="ypg-dim";
    sheet.dataset.sheet="delete";
    sheet.innerHTML=`<div class="ypg-sheet" role="alertdialog" aria-modal="true" aria-labelledby="ypgDelTitle" aria-describedby="ypgDelDesc">
      <div class="ypg-grab" aria-hidden="true"></div>
      <div class="ypg-warn">${ICONS.warn}</div>
      <h3 id="ypgDelTitle">Hesabın silinsin mi?</h3>
      <p id="ypgDelDesc">Bu işlem geri alınamaz. Silinecekler:</p>
      <ul class="ypg-bul"><li>Bulut yedeğin ve hesap profilin</li><li>Koçunla bağlantın, paylaşılan özet, koç görevleri ve mesajlar</li><li>Giriş bilgilerin${user?.email?` (${esc(user.email)})`:""}</li></ul>
      <p>Bu cihazdaki çalışmaların silinmez; uygulamayı misafir olarak kullanmaya devam edersin.</p>
      ${password?`<label class="ypg-field">Güvenlik için şifren<input type="password" data-del-password autocomplete="current-password" maxlength="128"></label>`:`<p>Devam edince güvenlik için Google hesabını tekrar seçmen istenir.</p>`}
      <label class="ypg-field">Onaylamak için SİL yaz<input type="text" data-del-confirm autocomplete="off" autocapitalize="characters" maxlength="10"></label>
      <p class="ypg-progress" role="status" data-del-progress></p>
      <p class="ypg-err" role="alert" data-del-error></p>
      <button class="ypg-btn" type="button" data-tone="danger" data-action="delete-confirm" disabled>Hesabı kalıcı olarak sil</button>
      <button class="ypg-btn" type="button" data-tone="plain" data-action="delete-cancel">Vazgeç</button>
    </div>`;
    root.append(sheet);
    const confirm=sheet.querySelector<HTMLInputElement>("[data-del-confirm]")!;
    const button=sheet.querySelector<HTMLButtonElement>('[data-action="delete-confirm"]')!;
    // "SİL", "sil" ve noktasız "SIL" aynı kabul edilir.
    const typed=()=>confirm.value.trim().toLocaleUpperCase("tr-TR").replace(/İ/g,"I");
    const check=()=>{button.disabled=deleting||typed()!=="SIL"||(password&&!sheet.querySelector<HTMLInputElement>("[data-del-password]")?.value);};
    sheet.addEventListener("input",check);
    (sheet.querySelector<HTMLInputElement>("[data-del-password]")||confirm).focus();
  };

  const runDelete=async()=>{
    const sheet=root.querySelector<HTMLElement>('[data-sheet="delete"]');if(!sheet||deleting)return;
    const progressNode=sheet.querySelector("[data-del-progress]"),errorNode=sheet.querySelector("[data-del-error]");
    const progress=(text:string)=>{if(progressNode)progressNode.textContent=text;};
    const fail=(text:string)=>{if(errorNode)errorNode.textContent=text;progress("");};
    if(errorNode)errorNode.textContent="";
    deleting=true;
    sheet.querySelectorAll<HTMLButtonElement>("button,input").forEach(node=>{node.disabled=true;});
    try{
      const api=await firebaseAuth();
      const current=api?.auth.currentUser;
      if(!api||!current)throw Object.assign(new Error("Oturum yok"),{code:"yks/no-session"});
      progress("Kimliğin doğrulanıyor…");
      // Firebase hesabı silmek için yakın zamanda giriş ister; veriye dokunmadan önce doğrula.
      if(isPasswordUser(current)){
        const password=sheet.querySelector<HTMLInputElement>("[data-del-password]")?.value||"";
        await api.m.reauthenticateWithCredential(current,api.m.EmailAuthProvider.credential(current.email,password));
      }else{
        const provider=new api.m.GoogleAuthProvider();
        provider.setCustomParameters({prompt:"select_account"});
        await api.m.reauthenticateWithPopup(current,provider);
      }
      await deleteCloudData(api,current.uid,progress);
      progress("Hesap siliniyor…");
      await api.m.deleteUser(current);
      try{localStorage.setItem(ENTRY_KEY,"guest");localStorage.removeItem("yks_account_role_hint");localStorage.removeItem("yks_last_sync_at");}catch{}
      deleting=false;
      user=null;
      root.hidden=true;
      root.replaceChildren();
      toast("Hesabın silindi · bu cihazdaki çalışmaların duruyor");
    }catch(error){
      console.error("Hesap silinemedi",error);
      deleting=false;
      const code=String((error as {code?:string})?.code||"");
      fail(code.startsWith("auth/")?authErrorText(error)
        :code==="yks/legacy-format"?"Bulut yedeğin eski biçimde. Uygulamayı yenileyip bir kez eşitledikten sonra tekrar dene."
        :code.includes("permission-denied")?"Bazı bulut kayıtları silinemedi, hesabın silinmedi. Biraz sonra tekrar dene."
        :"Hesap silinemedi, hesabın olduğu gibi duruyor. Tekrar dene.");
      sheet.querySelectorAll<HTMLButtonElement>("button,input").forEach(node=>{node.disabled=false;});
      sheet.dispatchEvent(new Event("input"));
    }
  };

  const open=async()=>{
    const api=await firebaseAuth().catch(()=>null);
    user=api?.auth.currentUser||null;
    root.hidden=false;
    document.documentElement.dataset.profilePage="open";
    render();
    root.querySelector<HTMLElement>('[data-action="close"]')?.focus();
  };
  const close=()=>{
    if(deleting)return;
    root.hidden=true;
    root.replaceChildren();
    delete document.documentElement.dataset.profilePage;
  };

  root.addEventListener("click",event=>{
    const target=(event.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if(!target||!root.contains(target))return;
    const action=target.dataset.action;
    if(action==="close")close();
    else if(action==="edit"){close();runtime.openWizard?.();}
    else if(action==="signup"){close();runtime.YKSWelcome?.open("register");}
    else if(action==="account"){close();openSettings("account");}
    else if(action==="password")void(async()=>{
      const api=await firebaseAuth();
      if(!api||!user?.email)return;
      try{await api.m.sendPasswordResetEmail(api.auth,user.email);toast("Şifre değiştirme bağlantısı e-postana gönderildi");}
      catch(error){toast(authErrorText(error));}
    })();
    else if(action==="signout")void(async()=>{
      if(!window.confirm("Çıkış yapılsın mı? Bu cihazdaki çalışmaların kalır."))return;
      const logout=document.getElementById("cloudLogoutBtn");
      if(logout)logout.click();
      else{const api=await firebaseAuth();await api?.m.signOut(api.auth);}
      try{localStorage.setItem(ENTRY_KEY,"guest");}catch{}
      close();
      toast("Çıkış yapıldı");
    })();
    else if(action==="profile-settings"){close();openSettings("profile");}
    else if(action==="appearance"||action==="notifications"||action==="coach"){close();openSettings(action);}
    else if(action==="settings"){close();openSettings("");}
    else if(action==="privacy")window.open("./privacy.html","_blank","noopener");
    else if(action==="delete")renderDelete();
    else if(action==="delete-cancel"){if(!deleting)root.querySelector('[data-sheet="delete"]')?.remove();}
    else if(action==="delete-confirm")void runDelete();
  });
  root.addEventListener("keydown",event=>{
    if(event.key!=="Escape"||deleting)return;
    const sheet=root.querySelector('[data-sheet="delete"]');
    if(sheet)sheet.remove();else close();
  });

  /* Sağ üstteki profil simgesi bu sayfayı açar; eski dinleyici (doğrudan Ayarlar) çalışmaz. */
  document.addEventListener("click",event=>{
    const trigger=(event.target as HTMLElement).closest?.("#refinedProfile");
    if(!trigger)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void open();
  },true);
  const trigger=document.getElementById("refinedProfile");
  if(trigger)trigger.setAttribute("aria-label","Profil");

  document.documentElement.dataset.profilePageV62="ready";
  return {installed:true};
}
