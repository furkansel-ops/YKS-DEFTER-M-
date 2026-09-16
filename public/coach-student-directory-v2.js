import{collection,doc,getDoc,getDocs,query,where,runTransaction,serverTimestamp,updateDoc}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const CODE_LENGTH=12;
const CODE_RE=/^[A-Z2-9]{12}$/;
const CODE_CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ACCESS_COLLECTION="studentCoachAccess";
const CODE_COLLECTION="studentCoachCodes";
const LINK_COLLECTION="coachingLinks";
const PROFILE_COLLECTION="accountProfiles";
const state={user:null,db:null,profile:null};

const text=(value,max=160)=>String(value??"").trim().slice(0,max);
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
const normalizeCode=value=>String(value??"").toUpperCase().replace(/[^A-Z2-9]/g,"").slice(0,CODE_LENGTH);
const formatCode=value=>normalizeCode(value).replace(/(.{4})(?=.)/g,"$1-");
const toast=message=>{try{window.toast?.(message)}catch{console.info(message)}};

function randomCode(){
  const bytes=crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes,byte=>CODE_CHARS[byte%CODE_CHARS.length]).join("");
}

function styles(){
  if(document.getElementById("coachStudentDirectoryV2Styles"))return;
  const style=document.createElement("style");
  style.id="coachStudentDirectoryV2Styles";
  style.textContent=`
  .csd-settings{margin-top:16px;padding:18px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:18px;background:var(--glass,var(--surface,#151a24));color:var(--label,var(--ink,#f7f8fb))}
  .csd-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.csd-head h3{margin:3px 0 5px;font-size:18px}.csd-kicker{font-size:10px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:var(--accent,#6ea8ff)}
  .csd-muted{margin:0;color:var(--label-2,#aab2c0);font-size:12px;line-height:1.5}.csd-codebox{margin-top:14px;padding:15px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:15px;background:var(--fill,rgba(255,255,255,.04))}
  .csd-code{font:850 clamp(20px,3vw,28px)/1.15 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;word-break:break-word}.csd-code.empty{font:750 14px/1.4 var(--font,system-ui);letter-spacing:0;color:var(--label-2,#aab2c0)}
  .csd-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.csd-btn{min-height:38px;padding:8px 12px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:11px;background:var(--fill,rgba(255,255,255,.05));color:inherit;font:750 12px var(--font,system-ui);cursor:pointer}.csd-btn.primary{border-color:color-mix(in srgb,var(--accent,#6ea8ff) 38%,transparent);background:var(--accent-soft,rgba(80,140,255,.14));color:var(--accent,#8db8ff)}.csd-btn.danger{color:var(--danger,#ff7d86)}.csd-btn:disabled{opacity:.55;cursor:wait}
  .csd-coaches{display:grid;gap:8px;margin-top:14px}.csd-coach{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:12px;background:var(--fill,rgba(255,255,255,.035))}.csd-coach b,.csd-coach small{display:block}.csd-coach small{margin-top:2px;color:var(--label-3,#818b9b);font-size:10.5px}
  .csd-tabs{display:flex;gap:8px;margin:4px 0 12px}.csd-tab{min-height:38px;padding:8px 13px;border:1px solid color-mix(in srgb,var(--accent,#6ea8ff) 35%,var(--line,#2c3444));border-radius:11px;background:var(--accent-soft,rgba(80,140,255,.14));color:var(--accent,#8db8ff);font:800 12px system-ui}.csd-add-note{margin:7px 0 0;color:var(--label-2,#aab2c0);font-size:11px;line-height:1.45}
  .ca-form.csd-add-form input{letter-spacing:.08em;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.ca-form.csd-add-form .ca-btn{min-height:40px}
  @media(max-width:640px){.csd-head{display:block}.csd-code{font-size:20px}.csd-coach{align-items:flex-start;flex-direction:column}.csd-coach .csd-btn{width:100%}}
  `;
  document.head.append(style);
}

async function getAccess(){
  if(!state.user||!state.db)return null;
  const snap=await getDoc(doc(state.db,ACCESS_COLLECTION,state.user.uid));
  if(!snap.exists())return null;
  const data=snap.data();
  const code=normalizeCode(data.code);
  if(!data.active||!CODE_RE.test(code))return null;
  const codeSnap=await getDoc(doc(state.db,CODE_COLLECTION,code));
  if(!codeSnap.exists())return null;
  const codeData=codeSnap.data();
  return codeData.active===true&&codeData.studentUid===state.user.uid?{...data,code}:null;
}

async function createOrRotateCode(force=false){
  if(!state.user||!state.db||state.profile?.role!=="student")throw new Error("Öğrenci hesabı gerekli");
  if(!force){const current=await getAccess();if(current?.code)return current.code}
  let lastError=null;
  for(let attempt=0;attempt<10;attempt++){
    const candidate=randomCode();
    try{
      const result=await runTransaction(state.db,async tx=>{
        const accessRef=doc(state.db,ACCESS_COLLECTION,state.user.uid);
        const accessSnap=await tx.get(accessRef);
        const current=accessSnap.exists()?accessSnap.data():null;
        const oldCode=normalizeCode(current?.code);
        if(!force&&current?.active===true&&CODE_RE.test(oldCode)){
          const existingCodeRef=doc(state.db,CODE_COLLECTION,oldCode);
          const existingCodeSnap=await tx.get(existingCodeRef);
          if(existingCodeSnap.exists()&&existingCodeSnap.data().studentUid===state.user.uid&&existingCodeSnap.data().active===true)return oldCode;
        }
        if(candidate===oldCode){const error=new Error("code-collision");error.code="code-collision";throw error}
        const candidateRef=doc(state.db,CODE_COLLECTION,candidate);
        let oldRef=null,oldSnap=null;
        if(CODE_RE.test(oldCode)){
          oldRef=doc(state.db,CODE_COLLECTION,oldCode);
          oldSnap=await tx.get(oldRef);
        }
        const now=serverTimestamp();
        if(accessSnap.exists())tx.update(accessRef,{code:candidate,active:true,updatedAt:now});
        else tx.set(accessRef,{studentUid:state.user.uid,code:candidate,active:true,createdAt:now,updatedAt:now});
        tx.set(candidateRef,{code:candidate,studentUid:state.user.uid,active:true,createdAt:now,updatedAt:now});
        if(oldRef&&oldSnap?.exists()&&oldSnap.data().studentUid===state.user.uid)tx.delete(oldRef);
        return candidate;
      });
      return result;
    }catch(error){
      lastError=error;
      const reason=String(error?.code||error?.message||"");
      if(reason!=="code-collision"&&!reason.includes("permission-denied"))throw error;
    }
  }
  throw lastError||new Error("Koç kodu oluşturulamadı");
}

async function activeCoachLinks(){
  if(!state.user||!state.db)return[];
  const snap=await getDocs(query(collection(state.db,LINK_COLLECTION),where("studentUid","==",state.user.uid)));
  return snap.docs.map(item=>({id:item.id,...item.data()})).filter(item=>item.active===true);
}

async function coachProfile(uid){
  try{const snap=await getDoc(doc(state.db,PROFILE_COLLECTION,uid));return snap.exists()?snap.data():null}catch{return null}
}

async function disconnectCoach(linkId){
  if(!state.db)return;
  await updateDoc(doc(state.db,LINK_COLLECTION,linkId),{active:false,endedAt:serverTimestamp(),updatedAt:serverTimestamp()});
  await renderStudentSettings();
  toast("Koç bağlantısı kesildi");
}

async function copyCode(code,button){
  try{await navigator.clipboard.writeText(formatCode(code));button.textContent="Kopyalandı ✓";setTimeout(()=>button.textContent="Kodu kopyala",1400)}
  catch{alert("Kod kopyalanamadı. Kodu seçip elle kopyalayabilirsin.")}
}

async function renderStudentSettings(){
  const card=document.getElementById("studentCoachCodeSettings");
  if(!card||state.profile?.role!=="student")return;
  const codeNode=card.querySelector("[data-code]");
  const actions=card.querySelector("[data-actions]");
  const coachesNode=card.querySelector("[data-coaches]");
  codeNode.classList.add("empty");codeNode.textContent="Kod bilgisi yükleniyor…";actions.innerHTML="";coachesNode.innerHTML="";
  try{
    const access=await getAccess();
    const code=access?.code||"";
    codeNode.classList.toggle("empty",!code);
    codeNode.textContent=code?formatCode(code):"Henüz koç kodun yok.";
    if(code){
      const copy=document.createElement("button");copy.type="button";copy.className="csd-btn primary";copy.textContent="Kodu kopyala";copy.onclick=()=>void copyCode(code,copy);
      const rotate=document.createElement("button");rotate.type="button";rotate.className="csd-btn";rotate.textContent="Kodu yenile";rotate.onclick=async()=>{if(!confirm("Eski kod artık yeni koç eklemek için kullanılamayacak. Mevcut bağlı koçların bağlantısı devam eder. Kodu yenileyelim mi?"))return;rotate.disabled=true;try{await createOrRotateCode(true);toast("Yeni koç kodu oluşturuldu ✓");await renderStudentSettings()}catch(error){alert("Kod yenilenemedi: "+text(error?.message,120));rotate.disabled=false}};
      actions.append(copy,rotate);
    }else{
      const create=document.createElement("button");create.type="button";create.className="csd-btn primary";create.textContent="Koç kodu oluştur";create.onclick=async()=>{create.disabled=true;try{await createOrRotateCode(false);toast("Koç kodun hazır ✓");await renderStudentSettings()}catch(error){alert("Kod oluşturulamadı: "+text(error?.message,120));create.disabled=false}};
      actions.append(create);
    }
    const links=await activeCoachLinks();
    if(!links.length){coachesNode.innerHTML='<p class="csd-muted">Henüz bağlı koç yok. Kodunu koçuna verdiğinde seni Öğrencilerim bölümüne ekleyebilir.</p>';return}
    const profiles=await Promise.all(links.map(item=>coachProfile(item.coachUid)));
    links.forEach((link,index)=>{
      const row=document.createElement("div");row.className="csd-coach";
      const profile=profiles[index]||{};
      row.innerHTML=`<div><b>${esc(profile.displayName||"Koç")}</b><small>${esc(profile.coachTitle||profile.specialization||"Bağlı koç")}</small></div><button type="button" class="csd-btn danger">Bağlantıyı kes</button>`;
      row.querySelector("button").onclick=async()=>{if(confirm("Bu koçun öğrenci görünümüne erişimini kapatmak istiyor musun?"))await disconnectCoach(link.id)};
      coachesNode.append(row);
    });
  }catch(error){
    console.error("Koç kodu görünümü",error);
    codeNode.classList.add("empty");codeNode.textContent="Koç kodu şu anda yüklenemedi.";
    actions.innerHTML='<button type="button" class="csd-btn" data-retry>Tekrar dene</button>';
    actions.querySelector("[data-retry]").onclick=()=>void renderStudentSettings();
  }
}

function installStudentSettings(){
  styles();
  document.getElementById("yksStudentCoachEntry")?.remove();
  let target=document.getElementById("mrp_ayar");
  if(!target)target=document.getElementById("more");
  if(!target)return false;
  let card=document.getElementById("studentCoachCodeSettings");
  if(!card){
    card=document.createElement("section");
    card.id="studentCoachCodeSettings";
    card.className="csd-settings";
    card.setAttribute("aria-label","Koç kodum");
    card.innerHTML=`<div class="csd-head"><div><div class="csd-kicker">Koç bağlantısı</div><h3>Koç Kodum</h3><p class="csd-muted">Bu kod sana ait kalıcı öğrenci kimliği gibi çalışır. Koçun, Öğrencilerim → Öğrenci ekle alanına bu kodu yazar.</p></div></div><div class="csd-codebox"><div class="csd-code empty" data-code>Henüz koç kodun yok.</div><div class="csd-actions" data-actions></div><p class="csd-muted" style="margin-top:10px">Kod tek kullanımlık değildir. İstersen yenileyebilirsin; kodu yenilemek mevcut bağlı koçları çıkarmaz.</p></div><div class="csd-coaches" data-coaches></div>`;
    target.append(card);
  }else if(card.parentElement!==target)target.append(card);
  void renderStudentSettings();
  return true;
}

async function addStudentByCode(rawCode){
  if(!state.user||!state.db||state.profile?.role!=="coach")throw new Error("Koç hesabı gerekli");
  const accessCode=normalizeCode(rawCode);
  if(!CODE_RE.test(accessCode))throw new Error("12 karakterlik öğrenci kodunu kontrol et");
  return runTransaction(state.db,async tx=>{
    const codeRef=doc(state.db,CODE_COLLECTION,accessCode);
    const codeSnap=await tx.get(codeRef);
    if(!codeSnap.exists())throw new Error("Öğrenci kodu bulunamadı");
    const codeData=codeSnap.data();
    if(codeData.active!==true||normalizeCode(codeData.code)!==accessCode)throw new Error("Bu öğrenci kodu artık aktif değil");
    const studentUid=text(codeData.studentUid,128);
    if(!studentUid)throw new Error("Öğrenci bilgisi bulunamadı");
    const profileRef=doc(state.db,PROFILE_COLLECTION,studentUid);
    const profileSnap=await tx.get(profileRef);
    if(!profileSnap.exists()||profileSnap.data().role!=="student")throw new Error("Bu kod bir öğrenci hesabına ait değil");
    const linkRef=doc(state.db,LINK_COLLECTION,`${studentUid}_${state.user.uid}`);
    const linkSnap=await tx.get(linkRef);
    const now=serverTimestamp();
    if(linkSnap.exists()){
      const existing=linkSnap.data();
      if(existing.active===true)return{studentUid,already:true,name:profileSnap.data().displayName||"Öğrenci"};
      tx.update(linkRef,{active:true,accessCode,updatedAt:now});
    }else{
      tx.set(linkRef,{studentUid,coachUid:state.user.uid,accessCode,active:true,createdAt:now,updatedAt:now});
    }
    return{studentUid,already:false,name:profileSnap.data().displayName||"Öğrenci"};
  });
}

function enhanceCoachDashboard(){
  styles();
  const dashboard=document.getElementById("yksCoachDashboard");
  if(!dashboard)return false;
  const layout=dashboard.querySelector(".ca-layout");
  if(layout&&!dashboard.querySelector(".csd-tabs")){
    const tabs=document.createElement("nav");tabs.className="csd-tabs";tabs.setAttribute("aria-label","Koç paneli bölümleri");tabs.innerHTML='<button type="button" class="csd-tab" aria-current="page">Öğrencilerim</button>';
    layout.insertAdjacentElement("beforebegin",tabs);
  }
  const oldForm=dashboard.querySelector("[data-claim]");
  if(oldForm&&!oldForm.classList.contains("csd-add-form")){
    const form=document.createElement("form");
    form.className="ca-form csd-add-form";form.dataset.claim="v2";
    form.innerHTML='<input name="code" maxlength="14" autocomplete="off" spellcheck="false" placeholder="Öğrenci kodu · XXXX-XXXX-XXXX" aria-label="Öğrenci kodu"><button class="ca-btn" type="submit">Öğrenci ekle</button><p class="csd-add-note">Öğrencinin Ayarlar → Koç Kodum bölümündeki kalıcı kodu gir.</p>';
    form.onsubmit=async event=>{event.preventDefault();const input=form.elements.namedItem("code");const button=form.querySelector("button");button.disabled=true;try{const result=await addStudentByCode(input.value);form.reset();dashboard.querySelector("[data-refresh]")?.click();toast(result.already?"Öğrenci zaten bağlı":"Öğrenci eklendi ✓")}catch(error){alert("Öğrenci eklenemedi: "+text(error?.message,140))}finally{button.disabled=false}};
    oldForm.replaceWith(form);
  }
  const heading=dashboard.querySelector(".ca-layout aside h3");
  if(heading)heading.textContent="Öğrencilerim";
  document.documentElement.dataset.coachDirectory="v2";
  return true;
}

function cleanupV2(){
  document.getElementById("studentCoachCodeSettings")?.remove();
  delete document.documentElement.dataset.coachDirectory;
  state.user=state.db=state.profile=null;
}

function install(){
  const auth=window.YKSAccountAuth;
  if(!auth||auth.__studentDirectoryV2)return false;
  auth.__studentDirectoryV2=true;
  const originalSignedIn=auth.onSignedIn?.bind(auth);
  const originalSignedOut=auth.onSignedOut?.bind(auth);
  const originalStudentPanel=auth.openStudentPanel?.bind(auth);
  auth.onSignedIn=async ctx=>{
    const result=originalSignedIn?await originalSignedIn(ctx):null;
    state.user=ctx.user;state.db=ctx.db;state.profile=result?.profile||null;
    if(result?.role==="student"){
      document.getElementById("yksStudentCoachEntry")?.remove();
      installStudentSettings();
      setTimeout(()=>{document.getElementById("yksStudentCoachEntry")?.remove();installStudentSettings()},0);
      auth.openStudentPanel=()=>{installStudentSettings();document.getElementById("studentCoachCodeSettings")?.scrollIntoView({block:"center",behavior:"smooth"})};
    }else if(result?.role==="coach"){
      enhanceCoachDashboard();
      setTimeout(enhanceCoachDashboard,0);
    }
    return result;
  };
  auth.onSignedOut=()=>{cleanupV2();return originalSignedOut?.()};
  if(originalStudentPanel)auth.__legacyOpenStudentPanel=originalStudentPanel;
  window.addEventListener("yks:data-changed",()=>{if(state.profile?.role==="student"&&document.getElementById("studentCoachCodeSettings"))void renderStudentSettings()});
  document.documentElement.dataset.coachStudentCodes="ready";
  window.dispatchEvent(new CustomEvent("yks:coach-student-directory-ready",{detail:{version:"2.0.1"}}));
  return true;
}

install();
