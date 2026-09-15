import{initializeApp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import{getAuth,GoogleAuthProvider,signInWithPopup,setPersistence,browserLocalPersistence,browserSessionPersistence,signOut}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import{getFirestore,doc,runTransaction,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const app=initializeApp({apiKey:"AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc",authDomain:"yks-uygulamam.firebaseapp.com",projectId:"yks-uygulamam"});
const auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
provider.setCustomParameters({prompt:"select_account"});

const REMEMBER_KEY="yks_auth_remember_v1",ACTIVE_LOGIN_KEY="yks_auth_active_login_v1";
const params=new URLSearchParams(location.search),invite=String(params.get("invite")||"").toUpperCase().replace(/[^A-Z2-9]/g,"").slice(0,24);
const form=document.getElementById("coachRegisterForm"),button=document.getElementById("coachRegisterBtn"),status=document.getElementById("coachRegisterStatus");
const nameInput=document.getElementById("coachName"),titleInput=document.getElementById("coachTitle"),specInput=document.getElementById("coachSpecialization"),rememberInput=document.getElementById("rememberCoach");
const text=(v,n)=>String(v??"").trim().slice(0,n);
function message(value,type=""){status.textContent=value;status.className=`status ${type}`.trim()}
function invalidInvite(){form.hidden=true;message("Bu koç davet bağlantısı geçersiz. Yeni bir davet bağlantısı iste.","err")}
if(!/^[A-Z2-9]{24}$/.test(invite))invalidInvite();else message("Davet bağlantısı hazır. Bilgilerini doldurup Google hesabınla devam edebilirsin.");

form.addEventListener("submit",async event=>{
  event.preventDefault();
  if(!/^[A-Z2-9]{24}$/.test(invite))return invalidInvite();
  const displayName=text(nameInput.value,80),coachTitle=text(titleInput.value,100),specialization=text(specInput.value,160),remember=!!rememberInput.checked;
  if(!displayName){message("Ad Soyad alanını doldur.","err");return}
  button.disabled=true;message("Google hesabı açılıyor…");
  try{
    await setPersistence(auth,remember?browserLocalPersistence:browserSessionPersistence);
    const result=await signInWithPopup(auth,provider),user=result.user;
    if(!user?.emailVerified)throw new Error("Doğrulanmış Google hesabı gerekli");
    await runTransaction(db,async tx=>{
      const profileRef=doc(db,"accountProfiles",user.uid),inviteRef=doc(db,"coachRegistrationInvites",invite);
      const [profileSnap,inviteSnap]=await Promise.all([tx.get(profileRef),tx.get(inviteRef)]);
      if(profileSnap.exists()){
        const existing=profileSnap.data();
        if(existing.role==="coach")throw new Error("Bu Google hesabı zaten koç hesabı olarak kayıtlı");
        throw new Error("Bu Google hesabı zaten öğrenci hesabı olarak kayıtlı");
      }
      if(!inviteSnap.exists())throw new Error("Koç daveti bulunamadı");
      const data=inviteSnap.data();
      if(data.status!=="open")throw new Error("Bu koç daveti daha önce kullanılmış veya iptal edilmiş");
      if(!data.expiresAt?.toMillis||data.expiresAt.toMillis()<=Date.now())throw new Error("Koç davetinin süresi dolmuş");
      tx.set(profileRef,{uid:user.uid,role:"coach",displayName,coachTitle,specialization,registrationInvite:invite,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      tx.update(inviteRef,{status:"used",usedBy:user.uid,usedAt:serverTimestamp(),updatedAt:serverTimestamp()});
    });
    try{
      if(remember)localStorage.setItem(REMEMBER_KEY,"1");else localStorage.removeItem(REMEMBER_KEY);
      sessionStorage.setItem(ACTIVE_LOGIN_KEY,"1");
    }catch{}
    message("Koç hesabı oluşturuldu. YKS Defterim açılıyor…","ok");
    setTimeout(()=>location.replace("./"),700);
  }catch(error){
    console.error(error);
    try{await signOut(auth)}catch{}
    const code=String(error?.code||"");
    const friendly=code.includes("popup-closed")?"Google giriş penceresi kapatıldı.":code.includes("popup-blocked")?"Tarayıcı Google giriş penceresini engelledi. Açılır pencerelere izin verip tekrar dene.":text(error?.message||"Koç hesabı oluşturulamadı",220);
    message(friendly,"err");button.disabled=false;
  }
});
