
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, writeBatch, runTransaction, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig={
 apiKey:"",
 authDomain:"yks-uygulamam.firebaseapp.com",
 projectId:"yks-uygulamam",
 storageBucket:"yks-uygulamam.firebasestorage.app",
 messagingSenderId:"156401606126",
 appId:"1:156401606126:web:451e6d6ac42f14f2c5c2ff",
 measurementId:"G-E0BG5MMDNV"
};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
const box=document.getElementById("cloudSyncBox"),txt=document.getElementById("cloudSyncText"),meta=document.getElementById("cloudSyncMeta"),login=document.getElementById("cloudLoginBtn"),logout=document.getElementById("cloudLogoutBtn");
const CLOUD_FORMAT=3, LAST_SYNC_KEY="yks_last_sync_at", BASE_REV_KEY="yks_cloud_base_rev", DIRTY_KEY="yks_cloud_dirty", DEVICE_KEY="yks_device_id";
let user=null,timer=null,loading=false,lastJSON="",uploading=false,uploadQueued=false,stopRealtime=null;
let cloudCacheEpoch=-1,cloudCacheJSON="";
let dirtyGeneration=0;
let authSession=0;
let lastSyncAt=Number(localStorage.getItem(LAST_SYNC_KEY)||0)||0;
let baseRev=Number(localStorage.getItem(BASE_REV_KEY)||0)||0;
let dirty=localStorage.getItem(DIRTY_KEY)==="1";
let deviceId=localStorage.getItem(DEVICE_KEY)||"";
if(!deviceId){deviceId=(crypto&&crypto.randomUUID?crypto.randomUUID():"dev-"+Date.now()+"-"+Math.random().toString(36).slice(2));try{localStorage.setItem(DEVICE_KEY,deviceId);}catch(e){}}
const metaRef=uid=>doc(db,"users",uid,"sync","meta");
const chunksCol=uid=>collection(db,"users",uid,"chunks");
const chunkRef=(uid,id)=>doc(db,"users",uid,"chunks",id);
function setDirty(v){dirty=!!v;if(dirty)dirtyGeneration++;try{localStorage.setItem(DIRTY_KEY,dirty?"1":"0");}catch(e){}}
function setBaseRev(v){baseRev=Math.max(0,Number(v)||0);try{localStorage.setItem(BASE_REV_KEY,String(baseRev));}catch(e){}}
function syncAgo(ts){
  if(!ts)return ""; const d=Math.max(0,Date.now()-ts),s=Math.floor(d/1000);
  if(s<10)return "Son senkron: az önce"; if(s<60)return "Son senkron: "+s+" sn önce";
  const m=Math.floor(s/60); if(m<60)return "Son senkron: "+m+" dk önce";
  const dt=new Date(ts),now=new Date();
  if(dt.toDateString()===now.toDateString())return "Son senkron: "+dt.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
  return "Son senkron: "+dt.toLocaleDateString("tr-TR",{day:"numeric",month:"short"})+" "+dt.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
}
function status(x,state="signedout",sub=""){if(txt)txt.textContent=x;if(box)box.dataset.state=state;if(meta)meta.textContent=sub||(lastSyncAt?syncAgo(lastSyncAt):"");}
function markSynced(){lastSyncAt=Date.now();try{localStorage.setItem(LAST_SYNC_KEY,String(lastSyncAt));}catch(e){}status("Senkronize","synced",syncAgo(lastSyncAt));}
setInterval(()=>{if(!document.hidden&&box&&box.dataset.state==="synced"&&meta)meta.textContent=syncAgo(lastSyncAt);},30000);
function splitUtf8(str,max=240000){const out=[];let start=0;while(start<str.length){let end=Math.min(str.length,start+max);while(end>start&&new Blob([str.slice(start,end)]).size>280000)end-=Math.max(1000,Math.floor((end-start)/10));/* UTF-16 surrogate çiftini iki Firestore parçasına bölme; emoji/özel karakter bozulmasın. */if(end<str.length&&end>start){const a=str.charCodeAt(end-1),b=str.charCodeAt(end);if(a>=0xD800&&a<=0xDBFF&&b>=0xDC00&&b<=0xDFFF)end--;}out.push(str.slice(start,end));start=end;}return out;}
async function cloudJSON(){
  const session=authSession,epoch=Number(window.__YKS_STATE_EPOCH||0);
  if(cloudCacheJSON&&cloudCacheEpoch===epoch){try{PERF_STATE.lastCloudBuildMs=0;}catch(e){}return cloudCacheJSON;}
  const t0=(typeof performance!=="undefined"&&performance.now)?performance.now():Date.now();
  let json="";
  try{
    if(window.__YKS_DATA__?.cloudPayload){const payload=await window.__YKS_DATA__.cloudPayload();if(payload.ok)json=payload.json;else throw new Error(payload.message);}
  }catch(e){try{infraError("dexie-cloud-read",e);}catch(_){}}
  if(!json){
    const state=window.S||{};
    json=JSON.stringify(state,function(k,v){
      if(this===state&&k==="v")return DATA_SCHEMA;
      if(state.focus&&this===state.focus&&k==="sw")return {run:false,start:0,acc:0,cr:0};
      if(state.focus&&this===state.focus&&k==="swLaps")return [];
      if(state.yt&&this===state.yt&&k==="key")return "";
      return v;
    });
  }
  if(session===authSession&&epoch===Number(window.__YKS_STATE_EPOCH||0)){cloudCacheEpoch=epoch;cloudCacheJSON=json;}
  try{PERF_STATE.lastCloudBuildMs=((typeof performance!=="undefined"&&performance.now)?performance.now():Date.now())-t0;}catch(e){}
  return json;
}
function revPrefix(rev){return String(Math.max(0,rev|0)).padStart(10,"0")+"_";}
async function readRemote(metaSnap,uid=user?.uid){
  const m=metaSnap&&metaSnap.exists()?metaSnap:await getDoc(metaRef(uid));
  if(!m.exists())return null;
  const md=m.data()||{},format=Number(md.format||md.version||2),rev=Number(md.revision||0),rawCount=Number(md.count||0);
  if(!Number.isFinite(rawCount)||rawCount<0||(format>=3&&rawCount>32)||(format<3&&rawCount>100))throw new Error("Bulut meta parça sayısı geçersiz");
  const count=Math.floor(rawCount);
  const snap=await getDocs(chunksCol(uid)); let docs=snap.docs;
  if(format>=3&&rev>0){const p=revPrefix(rev);docs=docs.filter(d=>d.id.startsWith(p)).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,count);}
  else docs=docs.filter(d=>/^\d{4}$/.test(d.id)).sort((a,b)=>a.id.localeCompare(b.id)).slice(0,count);
  if(count&&docs.length!==count)throw new Error("Bulut kaydı eksik parça içeriyor");
  if(format>=3){docs.forEach((d,i)=>{const x=d.data()||{};if(Number(x.revision)!==rev||Number(x.index)!==i)throw new Error("Bulut parça sırası/tutarlılığı bozuk")});}
  const json=docs.map(d=>String((d.data()||{}).data||"")).join("");
  if(!json)return {meta:md,rev:rev,json:"",obj:null};
  if(format>=3&&md.hash&&String(md.hash)!==infraHash(json))throw new Error("Bulut veri bütünlüğü doğrulanamadı");
  const obj=JSON.parse(json);
  if(obj&&Number(obj.v||1)>DATA_SCHEMA)throw new Error("Buluttaki veri daha yeni uygulama sürümüne ait");
  return {meta:md,rev:rev,json:json,obj:obj};
}
async function applyRemote(remote,reason="remote"){
  if(!remote||!remote.obj)return false;
  try{if(typeof window.autoBackupRun==="function")window.autoBackupRun(true);}catch(e){}
  const localSw=window.S&&window.S.focus&&window.S.focus.sw?JSON.parse(JSON.stringify(window.S.focus.sw)):null;
  const localLaps=window.S&&window.S.focus&&Array.isArray(window.S.focus.swLaps)?JSON.parse(JSON.stringify(window.S.focus.swLaps)):[];
  let next=normalize(Object.assign({},JSON.parse(JSON.stringify(DEF)),migrateState(remote.obj)));
  if(localSw){next.focus.sw=localSw;next.focus.swLaps=localLaps;}
  /* Önce diske yaz; depolama doluysa çalışan yerel durumu yarıda değiştirme. */
  let persisted=JSON.stringify(next);
  if(window.__YKS_DATA__?.applyCloudJSON){const applied=await window.__YKS_DATA__.applyCloudJSON(persisted);if(!applied.ok)throw new Error(applied.message);persisted=applied.json||persisted;next=window.S||next;}
  else{localStorage.setItem(STORAGE_KEY,persisted);window.S=next;S=next;lastPersistedJSON=persisted;perfInvalidateState();persistStateHashMaybe(persisted,true);}
  setBaseRev(remote.rev); setDirty(false); lastJSON=await cloudJSON();
  if(typeof renderAfterExternalState==="function")renderAfterExternalState(); else if(typeof renderAll==="function")renderAll();
  if(typeof renderSw==="function")renderSw(); markSynced();
  return true;
}
async function applyMerged(remote,localObj){
  if(!remote||!remote.obj||!window.YKSCore||typeof window.YKSCore.mergeStates!=="function")return applyRemote(remote,"merge-fallback");
  try{if(typeof window.autoBackupRun==="function")window.autoBackupRun(true);}catch(e){}
  const localSw=window.S&&window.S.focus&&window.S.focus.sw?JSON.parse(JSON.stringify(window.S.focus.sw)):null;
  const localLaps=window.S&&window.S.focus&&Array.isArray(window.S.focus.swLaps)?JSON.parse(JSON.stringify(window.S.focus.swLaps)):[];
  const raw=window.YKSCore.mergeStates(remote.obj,localObj,DATA_SCHEMA);
  let next=normalize(Object.assign({},JSON.parse(JSON.stringify(DEF)),migrateState(raw)));
  if(localSw){next.focus.sw=localSw;next.focus.swLaps=localLaps;}
  let persisted=JSON.stringify(next);
  if(window.__YKS_DATA__?.applyCloudJSON){const applied=await window.__YKS_DATA__.applyCloudJSON(persisted);if(!applied.ok)throw new Error(applied.message);persisted=applied.json||persisted;next=window.S||next;}
  else{localStorage.setItem(STORAGE_KEY,persisted);window.S=next;S=next;lastPersistedJSON=persisted;perfInvalidateState();persistStateHashMaybe(persisted,true);}
  setBaseRev(remote.rev);setDirty(true);lastJSON="";
  if(typeof renderAfterExternalState==="function")renderAfterExternalState();else if(typeof renderAll==="function")renderAll();
  if(typeof renderSw==="function")renderSw();
  status("Çakışma birleştirildi","syncing","İki cihazdaki benzersiz kayıtlar korunuyor");
  return true;
}
async function safeCleanupOldRevisions(currentRev,uid=user?.uid){
  try{
    const again=await getDoc(metaRef(uid)); if(!again.exists()||Number((again.data()||{}).revision||0)!==currentRev)return;
    const snap=await getDocs(chunksCol(uid)),cut=currentRev-2,del=[];
    for(const d of snap.docs){const mm=d.id.match(/^(\d{10})_/);if(mm&&Number(mm[1])<cut)del.push(d.ref);}
    for(let p=0;p<del.length;p+=400){const b=writeBatch(db);del.slice(p,p+400).forEach(r=>b.delete(r));await b.commit();}
  }catch(e){console.warn("Eski bulut parçaları temizlenemedi",e);}
}
async function upload(){
  if(!user||loading)return;
  if(uploading){uploadQueued=true;return;}
  if(!navigator.onLine){status("Çevrimdışı","offline","Değişiklikler cihazda saklandı");return;}
  uploading=true;uploadQueued=false;
  const uploadGeneration=dirtyGeneration,uploadUser=user,uploadSession=authSession;
  const isCurrent=()=>user===uploadUser&&authSession===uploadSession;
  let json="";
  async function mergeUploadConflict(remote){
    if(!isCurrent())return false;
    const mergeGeneration=dirtyGeneration;
    if(mergeGeneration!==uploadGeneration)json=await cloudJSON();
    if(!isCurrent())return false;
    if(mergeGeneration!==dirtyGeneration){uploadQueued=true;return false;}
    conflictBackupAdd(json,remote?.rev??baseRev);
    await applyMerged(remote,safeJSONParse(json));
    return isCurrent();
  }
  try{
    json=await cloudJSON();
    if(!isCurrent())return;
    if(!dirty&&json===lastJSON){markSynced();return;}
    status("Kaydediliyor…","syncing",lastSyncAt?syncAgo(lastSyncAt):"Buluta gönderiliyor");
    const m=await getDoc(metaRef(uploadUser.uid)),md=m.exists()?(m.data()||{}):{};
    if(!isCurrent())return;
    const remoteFormat=Number(md.format||md.version||2),remoteRev=Number(md.revision||0);
    const remoteStamp=md.updatedAt&&typeof md.updatedAt.toMillis==="function"?md.updatedAt.toMillis():0;
    /* Başka cihaz bizden sonra yazdıysa veya yeni biçimi görmüş bu cihazın
       karşısına eski istemci tekrar legacy meta yazdıysa sessizce üzerine basma. */
    const remoteChanged=(remoteFormat>=3&&remoteRev>baseRev)||(remoteFormat<3&&baseRev>0);
    if(m.exists()&&remoteChanged){
      const r=await readRemote(m,uploadUser.uid);
      if(!isCurrent())return;
      const hadDirty=dirty&&(dirtyGeneration!==uploadGeneration||json!==lastJSON);
      if(hadDirty){if(await mergeUploadConflict(r))uploadQueued=true;}
      else{await applyRemote(r,"conflict");if(!isCurrent())return;}
      if(!hadDirty)status("Senkronize","synced",syncAgo(lastSyncAt));
      return;
    }
    const parts=splitUtf8(json); if(parts.length>32)throw new Error("Bulut verisi çok büyük (güvenli işlem sınırı aşıldı)");
    const expectedRev=remoteRev,expectedFormat=remoteFormat,expectedStamp=remoteStamp,hash=infraHash(json);
    if(!isCurrent())return;
    let targetRev=0;
    await runTransaction(db,async tx=>{
      if(!isCurrent())throw new Error("CLOUD_SESSION_CHANGED");
      const current=await tx.get(metaRef(uploadUser.uid)); const cd=current.exists()?(current.data()||{}):{};
      if(!isCurrent())throw new Error("CLOUD_SESSION_CHANGED");
      const cf=Number(cd.format||cd.version||2),cr=Number(cd.revision||0);
      const cs=cd.updatedAt&&typeof cd.updatedAt.toMillis==="function"?cd.updatedAt.toMillis():0;
      if(current.exists()){
        if(expectedFormat>=3&&(cf<3||cr!==expectedRev)){const er=new Error("SYNC_CONFLICT");er.syncConflict=true;throw er;}
        if(expectedFormat<3&&(cf>=3||cr!==expectedRev||(expectedStamp&&cs&&cs!==expectedStamp))){const er=new Error("SYNC_CONFLICT");er.syncConflict=true;throw er;}
      }else if(m.exists()){const er=new Error("SYNC_CONFLICT");er.syncConflict=true;throw er;}
      targetRev=Math.max(cr,baseRev)+1; const prefix=revPrefix(targetRev);
      parts.forEach((part,i)=>tx.set(chunkRef(uploadUser.uid,prefix+String(i).padStart(4,"0")),{data:part,revision:targetRev,index:i}));
      tx.set(metaRef(uploadUser.uid),{format:CLOUD_FORMAT,revision:targetRev,count:parts.length,hash:hash,clientId:deviceId,appVersion:APP_VERSION,schemaVersion:DATA_SCHEMA,updatedAt:serverTimestamp()});
    });
    if(!isCurrent())return;
    lastJSON=json;setBaseRev(targetRev);
    if(dirtyGeneration===uploadGeneration){setDirty(false);markSynced();}
    else{uploadQueued=true;status("Kaydediliyor…","syncing","Son değişiklikler buluta gönderilmeyi bekliyor");}
    safeCleanupOldRevisions(targetRev,uploadUser.uid);
  }catch(e){
    if(!isCurrent())return;
    if(e&&e.syncConflict){
      try{const latest=await getDoc(metaRef(uploadUser.uid));if(!isCurrent())return;const r=await readRemote(latest,uploadUser.uid);if(await mergeUploadConflict(r))uploadQueued=true;}
      catch(x){if(!isCurrent())return;console.error(x);infraError("firebase-conflict",x);status("Senkron hatası","error",String(x.code||x.message||"hata").slice(0,100));}
    }else{console.error(e);infraError("firebase-upload",e);status("Senkron hatası","error",String(e.code||e.message||"hata").slice(0,100));}
  }
  finally{if(isCurrent()){uploading=false;if(uploadQueued||(!loading&&user&&dirty)){uploadQueued=false;clearTimeout(timer);timer=setTimeout(upload,120);}}}
}
window.yksCloudSchedule=()=>{setDirty(true);if(!user||loading)return;if(!navigator.onLine){status("Çevrimdışı","offline","Değişiklikler cihazda saklandı");return;}clearTimeout(timer);timer=setTimeout(upload,900);};
window.yksCloudForceDirty=()=>{setDirty(true);if(user&&navigator.onLine){clearTimeout(timer);timer=setTimeout(upload,100);}};
async function downloadOrSeed(){
  loading=true;status("Veriler alınıyor…","connecting",lastSyncAt?syncAgo(lastSyncAt):"Buluta bağlanıyor");
  try{
    const m=await getDoc(metaRef(user.uid));
    if(!m.exists()){loading=false;setDirty(true);await upload();return;}
    const r=await readRemote(m);
    if(r&&r.obj){await applyRemote(r,"login");}
    else{loading=false;setDirty(true);await upload();return;}
  }catch(e){console.error(e);infraError("firebase-download",e);status("Senkron hatası","error",String(e.code||e.message||"hata").slice(0,100));}
  finally{loading=false;}
}
function authErrorText(e){
  const c=(e&&e.code)||"";
  if(c==="auth/unauthorized-domain")return "Firebase Authorized domains içine furkansel-ops.github.io eklenmeli";
  if(c==="auth/popup-blocked")return "Giriş penceresi engellendi — Chrome site ayarlarından pop-up izni ver";
  if(c==="auth/popup-closed-by-user")return "Google giriş penceresi kapatıldı";
  if(c==="auth/cancelled-popup-request")return "Giriş isteği iptal edildi — tekrar dene";
  return String(c||e?.message||"bilinmeyen hata");
}
login?.addEventListener("click",async()=>{try{status("Google açılıyor…","connecting","Hesap seçimi bekleniyor");await setPersistence(auth,browserLocalPersistence);await signInWithPopup(auth,provider);}catch(e){console.error(e);infraError("firebase-login",e);status("Giriş hatası","error",authErrorText(e));}});
logout?.addEventListener("click",()=>signOut(auth));
onAuthStateChanged(auth,async u=>{
  const authAttempt=++authSession;
  uploading=false;uploadQueued=false;clearTimeout(timer);timer=null;cloudCacheEpoch=-1;cloudCacheJSON="";
  if(stopRealtime){try{stopRealtime();}catch(e){}stopRealtime=null;}
  user=u;
  if(u){
    login.style.display="none";logout.style.display="inline-block";status("Bağlanıyor…","connecting",u.email||u.displayName||"Google hesabı");
    if(navigator.onLine)await downloadOrSeed();else status("Çevrimdışı","offline","Değişiklikler cihazda saklanır");
    if(authAttempt!==authSession)return;
    let first=true;
    stopRealtime=onSnapshot(metaRef(u.uid),async snap=>{
      if(first){first=false;return;} if(!snap.exists()||loading)return;
      const sd=snap.data()||{},sf=Number(sd.format||sd.version||2),rr=Number(sd.revision||0);
      if(sf>=3&&rr<=baseRev)return;
      /* Eski istemci meta'yı v2 biçiminde yazarsa da değişikliği fark et. */
      try{if(dirty){clearTimeout(timer);timer=setTimeout(upload,80);}else{loading=true;const r=await readRemote(snap);await applyRemote(r,"realtime");}}catch(e){console.error(e);infraError("firebase-realtime",e);status("Bağlantı hatası","error",String(e.code||e.message||"hata").slice(0,100));}finally{loading=false;}
    },e=>{console.error(e);infraError("firebase-listener",e);status("Bağlantı hatası","error",String(e.code||"hata"));});
  }else{login.style.display="inline-block";logout.style.display="none";status("Giriş yapılmadı","signedout","Bulut senkronu kapalı");}
});
window.addEventListener("offline",()=>{if(user)status("Çevrimdışı","offline","Değişiklikler cihazda saklanır");});
window.addEventListener("online",()=>{if(!user)return;status("Bağlantı geldi","connecting",lastSyncAt?syncAgo(lastSyncAt):"Bulut kontrol ediliyor");clearTimeout(timer);timer=setTimeout(()=>dirty?upload():downloadOrSeed(),180);});
