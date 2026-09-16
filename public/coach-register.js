import{initializeApp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import{getAuth,GoogleAuthProvider,signInWithPopup,setPersistence,browserLocalPersistence,browserSessionPersistence,signOut}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import{getFirestore,doc,runTransaction,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const app=initializeApp({apiKey:"AIzaSyA0UMRKwah3Ji9Z8Sd3ZvgLJUKiC40fVSc",authDomain:"yks-uygulamam.firebaseapp.com",projectId:"yks-uygulamam"});
const auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
provider.setCustomParameters({prompt:"select_account"});

const REMEMBER_KEY="yks_auth_remember_v1",ACTIVE_LOGIN_KEY="yks_auth_active_login_v1",ROLE_HINT="yks_account_role_hint";
const form=document.getElementById("coachRegisterForm"),button=document.getElementById("coachRegisterBtn"),status=document.getElementById("coachRegisterStatus");
const nameInput=document.getElementById("coachName"),titleInput=document.getElementById("coachTitle"),specInput=document.getElementById("coachSpecialization"),rememberInput=document.getElementById("rememberCoach");
const text=(v,n)=>String(v??"").trim().slice(0,n);
function message(value,type=""){status.textContent=value;status.className=`status ${type}`.trim()}

form.addEventListener("submit",async event=>{
  event.preventDefault();
  const displayName=text(nameInput.value,80),coachTitle=text(titleInput.value,100),specialization=text(specInput.value,160),remember=!!rememberInput.checked;
  if(!displayName){message("Ad Soyad alanını doldur.","err");return}
  button.disabled=true;message("Google hesabı açılıyor…");
  let signedIn=false;
  try{
    await setPersistence(auth,remember?browserLocalPersistence:browserSessionPersistence);
    const result=await signInWithPopup(auth,provider),user=result.user;
    signedIn=true;
    if(!user?.emailVerified)throw new Error("Doğrulanmış Google hesabı gerekli");
    const registration=await runTransaction(db,async tx=>{
      const profileRef=doc(db,"accountProfiles",user.uid),profileSnap=await tx.get(profileRef);
      if(profileSnap.exists()){
        const existing=profileSnap.data();
        if(existing.role==="coach")return{existing:true};
        throw new Error("Bu Google hesabı zaten öğrenci hesabı olarak kayıtlı. Koç hesabı için farklı bir Google hesabı kullan.");
      }
      tx.set(profileRef,{uid:user.uid,role:"coach",displayName,coachTitle,specialization,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      return{existing:false};
    });
    try{
      if(remember)localStorage.setItem(REMEMBER_KEY,"1");else localStorage.removeItem(REMEMBER_KEY);
      localStorage.setItem(ROLE_HINT,"coach");
      sessionStorage.setItem(ACTIVE_LOGIN_KEY,"1");
    }catch{}
    message(registration.existing?"Koç hesabın zaten hazır. YKS Defterim açılıyor…":"Koç hesabı oluşturuldu. YKS Defterim açılıyor…","ok");
    setTimeout(()=>location.replace("./"),650);
  }catch(error){
    console.error(error);
    if(signedIn)try{await signOut(auth)}catch{}
    const code=String(error?.code||"");
    const friendly=code.includes("popup-closed")?"Google giriş penceresi kapatıldı.":code.includes("popup-blocked")?"Tarayıcı Google giriş penceresini engelledi. Açılır pencerelere izin verip tekrar dene.":code.includes("cancelled-popup")?"Google giriş işlemi iptal edildi.":text(error?.message||"Koç hesabı oluşturulamadı",220);
    message(friendly,"err");button.disabled=false;
  }
});
