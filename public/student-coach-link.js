import{collection,doc,getDoc,getDocs,query,where,runTransaction,serverTimestamp,updateDoc}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const CODE_LENGTH=12;
const CODE_RE=/^[A-Z2-9]{12}$/;
const CODE_CHARS="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ACCESS_COLLECTION="studentCoachAccess";
const CODE_COLLECTION="studentCoachCodes";
const LINK_COLLECTION="coachingLinks";
const PROFILE_COLLECTION="accountProfiles";
const state={user:null,db:null,profile:null,sharing:false};
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
  if(document.getElementById("studentCoachLinkStyles"))return;
  const style=document.createElement("style");style.id="studentCoachLinkStyles";style.textContent=`
  .scl-settings{margin-top:16px;padding:18px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:18px;background:var(--glass,var(--surface,#151a24));color:var(--label,var(--ink,#f7f8fb))}.scl-head h3{margin:3px 0 5px;font-size:18px}.scl-kicker{font-size:10px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:var(--accent,#6ea8ff)}.scl-muted{margin:0;color:var(--label-2,#aab2c0);font-size:12px;line-height:1.5}.scl-codebox{margin-top:14px;padding:15px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:15px;background:var(--fill,rgba(255,255,255,.04))}.scl-code{font:850 clamp(20px,3vw,28px)/1.15 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;word-break:break-word}.scl-code.empty{font:750 14px/1.4 var(--font,system-ui);letter-spacing:0;color:var(--label-2,#aab2c0)}.scl-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.scl-btn{min-height:38px;padding:8px 12px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:11px;background:var(--fill,rgba(255,255,255,.05));color:inherit;font:750 12px var(--font,system-ui);cursor:pointer}.scl-btn.primary{border-color:color-mix(in srgb,var(--accent,#6ea8ff) 38%,transparent);background:var(--accent-soft,rgba(80,140,255,.14));color:var(--accent,#8db8ff)}.scl-btn.danger{color:var(--danger,#ff7d86)}.scl-btn.share{border-color:color-mix(in srgb,var(--green,#45d48a) 38%,transparent);background:color-mix(in srgb,var(--green,#45d48a) 12%,transparent);color:var(--green,#66e0a1)}.scl-btn:disabled{opacity:.55;cursor:wait}.scl-sharebox{margin-top:14px;padding:14px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:14px;background:var(--fill,rgba(255,255,255,.035))}.scl-sharebox b{display:block;font-size:13px;margin-bottom:4px}.scl-share-status{margin-top:8px;color:var(--label-3,#818b9b);font-size:11px}.scl-program-share{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:12px 0 14px;padding:13px 14px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:14px;background:var(--fill,rgba(255,255,255,.035))}.scl-program-share strong{display:block;font-size:13px}.scl-program-share small{display:block;margin-top:3px;color:var(--label-3,#818b9b);font-size:11px;line-height:1.35}@media(max-width:640px){.scl-program-share{align-items:stretch;flex-direction:column}.scl-program-share .scl-btn{width:100%}}.scl-coaches{display:grid;gap:8px;margin-top:14px}.scl-coach{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border:1px solid var(--glass-line,var(--line,#2c3444));border-radius:12px;background:var(--fill,rgba(255,255,255,.035))}.scl-coach b,.scl-coach small{display:block}.scl-coach small{margin-top:2px;color:var(--label-3,#818b9b);font-size:10.5px}@media(max-width:640px){.scl-code{font-size:20px}.scl-coach{align-items:flex-start;flex-direction:column}.scl-coach .scl-btn{width:100%}}`;
  document.head.append(style);
}
async function getAccess(){
  if(!state.user||!state.db)return null;
  const snap=await getDoc(doc(state.db,ACCESS_COLLECTION,state.user.uid));if(!snap.exists())return null;
  const data=snap.data(),code=normalizeCode(data.code);if(!data.active||!CODE_RE.test(code))return null;
  const codeSnap=await getDoc(doc(state.db,CODE_COLLECTION,code));if(!codeSnap.exists())return null;
  const codeData=codeSnap.data();return codeData.active===true&&codeData.studentUid===state.user.uid?{...data,code}:null;
}
async function createOrRotateCode(force=false){
  if(!state.user||!state.db||state.profile?.role!=="student")throw new Error("Öğrenci hesabı gerekli");
  if(!force){const current=await getAccess();if(current?.code)return current.code}
  let lastError=null;
  for(let attempt=0;attempt<10;attempt++){
    const candidate=randomCode();
    try{
      return await runTransaction(state.db,async tx=>{
        const accessRef=doc(state.db,ACCESS_COLLECTION,state.user.uid),accessSnap=await tx.get(accessRef),current=accessSnap.exists()?accessSnap.data():null,oldCode=normalizeCode(current?.code);
        if(!force&&current?.active===true&&CODE_RE.test(oldCode)){
          const existingRef=doc(state.db,CODE_COLLECTION,oldCode),existingSnap=await tx.get(existingRef);
          if(existingSnap.exists()&&existingSnap.data().studentUid===state.user.uid&&existingSnap.data().active===true)return oldCode;
        }
        if(candidate===oldCode){const error=new Error("code-collision");error.code="code-collision";throw error}
        const candidateRef=doc(state.db,CODE_COLLECTION,candidate);let oldRef=null,oldSnap=null;
        if(CODE_RE.test(oldCode)){oldRef=doc(state.db,CODE_COLLECTION,oldCode);oldSnap=await tx.get(oldRef)}
        const now=serverTimestamp();
        if(accessSnap.exists())tx.update(accessRef,{code:candidate,active:true,updatedAt:now});else tx.set(accessRef,{studentUid:state.user.uid,code:candidate,active:true,createdAt:now,updatedAt:now});
        tx.set(candidateRef,{code:candidate,studentUid:state.user.uid,active:true,createdAt:now,updatedAt:now});
        if(oldRef&&oldSnap?.exists()&&oldSnap.data().studentUid===state.user.uid)tx.delete(oldRef);
        return candidate;
      });
    }catch(error){lastError=error;const reason=String(error?.code||error?.message||"");if(reason!=="code-collision"&&!reason.includes("permission-denied"))throw error}
  }
  throw lastError||new Error("Koç kodu oluşturulamadı");
}
async function activeCoachLinks(){
  if(!state.user||!state.db)return[];
  const snap=await getDocs(query(collection(state.db,LINK_COLLECTION),where("studentUid","==",state.user.uid)));
  return snap.docs.map(item=>({id:item.id,...item.data()})).filter(item=>item.active===true);
}
async function coachProfile(uid){try{const snap=await getDoc(doc(state.db,PROFILE_COLLECTION,uid));return snap.exists()?snap.data():null}catch{return null}}
async function disconnectCoach(linkId){
  if(!state.db)return;await updateDoc(doc(state.db,LINK_COLLECTION,linkId),{active:false,endedAt:serverTimestamp(),updatedAt:serverTimestamp()});
  await renderStudentSettings();toast("Koç bağlantısı kesildi");
}
async function copyCode(code,button){
  try{await navigator.clipboard.writeText(formatCode(code));button.textContent="Kopyalandı ✓";setTimeout(()=>button.textContent="Kodu kopyala",1400)}catch{alert("Kod kopyalanamadı. Kodu seçip elle kopyalayabilirsin.")}
}
async function shareWithCoach(sourceButton){
  if(state.sharing)return;
  if(!state.user||!state.db||state.profile?.role!=="student")throw new Error("Öğrenci hesabı gerekli");
  const links=await activeCoachLinks();
  if(!links.length){toast("Önce bir koç bağlamalısın");throw new Error("Bağlı koç bulunamadı")}
  state.sharing=true;
  const buttons=[...document.querySelectorAll("[data-coach-share-now]")];
  const statuses=[...document.querySelectorAll("[data-coach-share-status]")];
  buttons.forEach(btn=>{btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent="Paylaşılıyor…"});
  statuses.forEach(node=>node.textContent="Güncel bilgiler koça gönderiliyor…");
  try{
    if(typeof window.YKSAccountAuth?.publishShare==="function")await window.YKSAccountAuth.publishShare();
    if(typeof window.YKSStudentProgramShareV2?.publish==="function")await window.YKSStudentProgramShareV2.publish(true);
    const stamp=new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
    statuses.forEach(node=>node.textContent="Koçla paylaşıldı ✓ · "+stamp);
    toast("Program ve bilgiler koçla paylaşıldı ✓");
  }catch(error){
    console.error("Koça manuel paylaşım",error);
    statuses.forEach(node=>node.textContent="Paylaşım başarısız. Tekrar deneyebilirsin.");
    throw error;
  }finally{
    state.sharing=false;
    buttons.forEach(btn=>{btn.disabled=false;btn.textContent=btn.dataset.oldText||"Koça bilgileri paylaş";delete btn.dataset.oldText});
    if(sourceButton)sourceButton.blur?.();
  }
}
function installProgramShareButton(){
  styles();
  const screen=document.getElementById("program");if(!screen||state.profile?.role!=="student")return false;
  let box=document.getElementById("studentCoachProgramShare");
  if(!box){
    box=document.createElement("div");box.id="studentCoachProgramShare";box.className="scl-program-share";
    box.innerHTML='<div><strong>Koçunla güncel programı paylaş</strong><small>Programını hazırladıktan sonra bu düğmeye bas. Güncel program ve öğrenci bilgilerin bağlı koçuna hemen gönderilir.</small><div class="scl-share-status" data-coach-share-status>Hazır.</div></div><button type="button" class="scl-btn share" data-coach-share-now>Koça bilgileri paylaş</button>';
    const anchor=screen.querySelector(".seg");anchor?.insertAdjacentElement("afterend",box);
    box.querySelector("[data-coach-share-now]").onclick=event=>void shareWithCoach(event.currentTarget).catch(error=>toast(text(error?.message,100)));
  }
  return true;
}
async function renderStudentSettings(){
  const card=document.getElementById("studentCoachCodeSettings");if(!card||state.profile?.role!=="student")return;
  const codeNode=card.querySelector("[data-code]"),actions=card.querySelector("[data-actions]"),coachesNode=card.querySelector("[data-coaches]");
  codeNode.classList.add("empty");codeNode.textContent="Kod bilgisi yükleniyor…";actions.innerHTML="";coachesNode.innerHTML="";
  try{
    const access=await getAccess(),code=access?.code||"";codeNode.classList.toggle("empty",!code);codeNode.textContent=code?formatCode(code):"Henüz koç kodun yok.";
    if(code){
      const copy=document.createElement("button");copy.type="button";copy.className="scl-btn primary";copy.textContent="Kodu kopyala";copy.onclick=()=>void copyCode(code,copy);
      const rotate=document.createElement("button");rotate.type="button";rotate.className="scl-btn";rotate.textContent="Kodu yenile";rotate.onclick=async()=>{if(!confirm("Eski kod artık yeni koç eklemek için kullanılamayacak. Mevcut bağlı koçların bağlantısı devam eder. Kodu yenileyelim mi?"))return;rotate.disabled=true;try{await createOrRotateCode(true);toast("Yeni koç kodu oluşturuldu ✓");await renderStudentSettings()}catch(error){alert("Kod yenilenemedi: "+text(error?.message,120));rotate.disabled=false}};
      actions.append(copy,rotate);
    }else{
      const create=document.createElement("button");create.type="button";create.className="scl-btn primary";create.textContent="Koç kodu oluştur";create.onclick=async()=>{create.disabled=true;try{await createOrRotateCode(false);toast("Koç kodun hazır ✓");await renderStudentSettings()}catch(error){alert("Kod oluşturulamadı: "+text(error?.message,120));create.disabled=false}};actions.append(create);
    }
    const links=await activeCoachLinks();
    if(!links.length){coachesNode.innerHTML='<p class="scl-muted">Henüz bağlı koç yok. Kodunu ayrı YKS Koç Paneli kullanan koçuna verebilirsin.</p>';return}
    const profiles=await Promise.all(links.map(item=>coachProfile(item.coachUid)));
    links.forEach((link,index)=>{const row=document.createElement("div");row.className="scl-coach";const profile=profiles[index]||{};row.innerHTML=`<div><b>${esc(profile.displayName||"Koç")}</b><small>${esc(profile.coachTitle||profile.specialization||"Bağlı koç")}</small></div><button type="button" class="scl-btn danger">Bağlantıyı kes</button>`;row.querySelector("button").onclick=async()=>{if(confirm("Bu koçun öğrenci görünümüne erişimini kapatmak istiyor musun?"))await disconnectCoach(link.id)};coachesNode.append(row)});
  }catch(error){
    console.error("Koç kodu görünümü",error);codeNode.classList.add("empty");codeNode.textContent="Koç kodu şu anda yüklenemedi.";actions.innerHTML='<button type="button" class="scl-btn" data-retry>Tekrar dene</button>';actions.querySelector("[data-retry]").onclick=()=>void renderStudentSettings();
  }
}
function installStudentSettings(){
  styles();let target=document.getElementById("mrp_ayar");if(!target)target=document.getElementById("more");if(!target)return false;
  let card=document.getElementById("studentCoachCodeSettings");
  if(!card){card=document.createElement("section");card.id="studentCoachCodeSettings";card.className="scl-settings";card.setAttribute("aria-label","Koç kodum");card.innerHTML=`<div class="scl-head"><div class="scl-kicker">Koç bağlantısı</div><h3>Koç Kodum</h3><p class="scl-muted">Bu kodu yalnız ayrı YKS Koç Paneli\'nde öğrencini eklemesi için koçunla paylaş.</p></div><div class="scl-codebox"><div class="scl-code empty" data-code>Henüz koç kodun yok.</div><div class="scl-actions" data-actions></div><p class="scl-muted" style="margin-top:10px">Kodu yenilemek mevcut bağlı koçları çıkarmaz.</p></div><div class="scl-sharebox"><b>Koça bilgileri paylaş</b><p class="scl-muted">Programın, ilerleme bilgilerin ve koç panelinde kullanılan güncel verilerin hemen gönderilir.</p><div class="scl-actions"><button type="button" class="scl-btn share" data-coach-share-now>Koça bilgileri paylaş</button></div><div class="scl-share-status" data-coach-share-status>Hazır.</div></div><div class="scl-coaches" data-coaches></div>`;target.append(card)}else if(card.parentElement!==target)target.append(card);
  const shareBtn=card.querySelector("[data-coach-share-now]");if(shareBtn)shareBtn.onclick=event=>void shareWithCoach(event.currentTarget).catch(error=>toast(text(error?.message,100)));
  installProgramShareButton();
  void renderStudentSettings();return true;
}
function cleanup(){document.getElementById("studentCoachCodeSettings")?.remove();document.getElementById("studentCoachProgramShare")?.remove();state.user=state.db=state.profile=null;state.sharing=false}
function install(){
  const auth=window.YKSAccountAuth;if(!auth||auth.__studentCoachLink)return false;auth.__studentCoachLink=true;
  const originalSignedIn=auth.onSignedIn?.bind(auth),originalSignedOut=auth.onSignedOut?.bind(auth);
  auth.onSignedIn=async ctx=>{const result=originalSignedIn?await originalSignedIn(ctx):null;state.user=ctx.user;state.db=ctx.db;state.profile=result?.profile||null;if(result?.role==="student"){installStudentSettings();installProgramShareButton();setTimeout(()=>{installStudentSettings();installProgramShareButton()},0)}return result};
  auth.onSignedOut=()=>{cleanup();return originalSignedOut?.()};
  window.addEventListener("yks:data-changed",()=>{if(state.profile?.role==="student"&&document.getElementById("studentCoachCodeSettings"))void renderStudentSettings()});
  document.documentElement.dataset.studentCoachLink="ready";
  window.dispatchEvent(new CustomEvent("yks:student-coach-link-ready",{detail:{version:"1.1.0"}}));
  return true;
}
install();
