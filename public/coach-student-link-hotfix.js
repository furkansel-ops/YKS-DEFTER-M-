import{collection,doc,getDoc,getDocs,query,where,setDoc,serverTimestamp,updateDoc}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const CODE_LENGTH=12;
const CODE_RE=/^[A-Z2-9]{12}$/;
const CODE_COLLECTION="studentCoachCodes";
const LINK_COLLECTION="coachingLinks";
const PROFILE_COLLECTION="accountProfiles";
const text=(value,max=160)=>String(value??"").trim().slice(0,max);
const normalizeCode=value=>String(value??"").toUpperCase().replace(/[^A-Z2-9]/g,"").slice(0,CODE_LENGTH);
const toast=message=>{try{window.toast?.(message)}catch{console.info(message)}};

async function existingCoachLink(db,coachUid,studentUid){
  const snap=await getDocs(query(collection(db,LINK_COLLECTION),where("coachUid","==",coachUid)));
  return snap.docs.map(item=>({id:item.id,...item.data()})).find(item=>item.studentUid===studentUid)||null;
}

async function addStudentByCode(ctx,profile,rawCode){
  const user=ctx?.user;
  const db=ctx?.db;
  if(!user||!db||profile?.role!=="coach")throw new Error("Koç hesabı gerekli");
  const accessCode=normalizeCode(rawCode);
  if(!CODE_RE.test(accessCode))throw new Error("12 karakterlik öğrenci kodunu kontrol et");

  const codeSnap=await getDoc(doc(db,CODE_COLLECTION,accessCode));
  if(!codeSnap.exists())throw new Error("Öğrenci kodu bulunamadı");
  const codeData=codeSnap.data();
  if(codeData.active!==true||normalizeCode(codeData.code)!==accessCode)throw new Error("Bu öğrenci kodu artık aktif değil");

  const studentUid=text(codeData.studentUid,128);
  if(!studentUid)throw new Error("Öğrenci bilgisi bulunamadı");
  const profileSnap=await getDoc(doc(db,PROFILE_COLLECTION,studentUid));
  if(!profileSnap.exists()||profileSnap.data().role!=="student")throw new Error("Bu kod bir öğrenci hesabına ait değil");

  const existing=await existingCoachLink(db,user.uid,studentUid);
  if(existing?.active===true)return{studentUid,already:true,name:profileSnap.data().displayName||"Öğrenci"};

  const now=serverTimestamp();
  if(existing){
    await updateDoc(doc(db,LINK_COLLECTION,existing.id),{active:true,accessCode,updatedAt:now});
  }else{
    await setDoc(doc(db,LINK_COLLECTION,`${studentUid}_${user.uid}`),{
      studentUid,
      coachUid:user.uid,
      accessCode,
      active:true,
      createdAt:now,
      updatedAt:now
    });
  }
  return{studentUid,already:false,name:profileSnap.data().displayName||"Öğrenci"};
}

function patchCoachForm(ctx,result){
  if(result?.role!=="coach")return false;
  const dashboard=document.getElementById("yksCoachDashboard");
  const form=dashboard?.querySelector("form.csd-add-form");
  if(!dashboard||!form)return false;
  if(form.dataset.linkHotfix==="1")return true;
  form.dataset.linkHotfix="1";
  form.onsubmit=async event=>{
    event.preventDefault();
    const input=form.elements.namedItem("code");
    const button=form.querySelector("button[type='submit']")||form.querySelector("button");
    if(button)button.disabled=true;
    try{
      const resultLink=await addStudentByCode(ctx,result.profile,input?.value||"");
      form.reset();
      await Promise.resolve(dashboard.querySelector("[data-refresh]")?.click());
      toast(resultLink.already?"Öğrenci zaten bağlı":"Öğrenci eklendi ✓");
    }catch(error){
      const message=text(error?.message,140)||"Öğrenci eklenemedi";
      alert("Öğrenci eklenemedi: "+message);
    }finally{
      if(button)button.disabled=false;
    }
  };
  return true;
}

function install(){
  const auth=window.YKSAccountAuth;
  if(!auth||auth.__coachStudentLinkHotfix)return false;
  auth.__coachStudentLinkHotfix=true;
  const originalSignedIn=auth.onSignedIn?.bind(auth);
  auth.onSignedIn=async ctx=>{
    const result=originalSignedIn?await originalSignedIn(ctx):null;
    if(result?.role==="coach"){
      patchCoachForm(ctx,result);
      setTimeout(()=>patchCoachForm(ctx,result),0);
    }
    return result;
  };
  document.documentElement.dataset.coachStudentLinkHotfix="ready";
  window.dispatchEvent(new CustomEvent("yks:coach-student-link-hotfix-ready",{detail:{version:"1.0.0"}}));
  return true;
}

install();
