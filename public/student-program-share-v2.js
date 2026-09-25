import{doc,onSnapshot,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const PROGRAM_VERSION=3;
const MAX_PROGRAM_WEEKS=80;
const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const rt={db:null,user:null,shareReady:false,timer:null,watchTimer:null,stopShare:null,stopData:null,writing:false,pending:false,bootstrapping:false,lastHash:""};
const state=()=>{try{return window.YKSLegacyState?.readState?.()||window.S||null}catch{return window.S||null}};
const txt=(v,n=220)=>String(v??"").trim().slice(0,n);
const int=(v,fallback)=>{const n=Math.floor(Number(v));return Number.isFinite(n)&&n>0?n:fallback};

function cloneValue(value,fallback){
  try{return JSON.parse(JSON.stringify(value??fallback))}catch{return fallback}
}
function cleanMatrix(value,rowCount){
  const src=Array.isArray(value)?value:[];
  return Array.from({length:rowCount},(_,r)=>{
    const row=Array.isArray(src[r])?src[r]:[];
    return Array.from({length:7},(_,d)=>txt(row[d],220));
  });
}
function cleanMap(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return{};
  const out={};
  Object.entries(value).slice(0,600).forEach(([key,val])=>{
    const k=txt(key,80);if(!k)return;
    if(val&&typeof val==="object")out[k]=cloneValue(val,{});
    else if(typeof val==="boolean")out[k]=val;
    else if(Number.isFinite(Number(val)))out[k]=Number(val);
    else out[k]=txt(val,160);
  });
  return out;
}
function weekHasData(week){
  if(!week||typeof week!=="object")return false;
  const cells=[...(week.r||[]),...(week.s||[])];
  return cells.some(row=>Array.isArray(row)&&row.some(cell=>txt(cell)))
    ||(Array.isArray(week.done)&&week.done.some(Boolean))
    ||Object.keys(week.dn||{}).length>0
    ||Object.keys(week.mv||{}).length>0;
}
function programPayload(s){
  const rows={r:Math.min(24,int(s?.rows?.r,2)),s:Math.min(24,int(s?.rows?.s,4))};
  const labels={
    r:Array.from({length:rows.r},(_,i)=>txt(s?.rowLabels?.r?.[i],80)),
    s:Array.from({length:rows.s},(_,i)=>txt(s?.rowLabels?.s?.[i],80))
  };
  const keys=Object.keys(s?.weeks||{}).filter(k=>DATE_RE.test(k)&&weekHasData(s.weeks[k])).sort().slice(-MAX_PROGRAM_WEEKS);
  const weeks=keys.map(week=>{
    const raw=s.weeks[week]||{};
    return{week,data:{
      r:cleanMatrix(raw.r,rows.r),
      s:cleanMatrix(raw.s,rows.s),
      done:Array.from({length:7},(_,d)=>Boolean(raw?.done?.[d])),
      dn:cleanMap(raw.dn),
      mv:cleanMap(raw.mv)
    }};
  });
  return{version:PROGRAM_VERSION,rows,rowLabels:labels,weeks,syncedAt:Date.now()};
}
function payloadHash(value){
  try{return JSON.stringify(value)}catch{return""}
}
function stableProgramHash(program){
  if(!program||typeof program!=="object")return"";
  return payloadHash({...program,syncedAt:0});
}
async function ensureShareDocument(){
  if(rt.shareReady)return true;
  if(rt.bootstrapping)return false;
  rt.bootstrapping=true;
  try{
    if(typeof auth?.publishShare==="function")await auth.publishShare();
  }catch(error){
    console.error("Koç paylaşımı başlangıcı",error);
  }finally{rt.bootstrapping=false}
  return rt.shareReady;
}
function bootstrapSharePayload(program){
  const name=txt(rt.user?.displayName||String(rt.user?.email||"").split("@")[0],80)||"Öğrenci";
  return{
    studentUid:rt.user.uid,
    version:1,
    profile:{name,track:"",targetNetTYT:0,targetNetAYT:0,targetUniversity:"",targetDepartment:""},
    program,
    exams:[],
    progress:{minutes7:0,questions7:0,completedTopics:0,activeTopics:0,overdueTopics:0},
    paragraphProblem:{entries:[]},
    topics:{items:[]},
    errorJournal:[],
    updatedAt:serverTimestamp()
  };
}
async function writeProgramShare(program){
  const ref=doc(rt.db,"coachingShares",rt.user.uid);
  try{
    await setDoc(ref,{program,updatedAt:serverTimestamp()},{merge:true});
  }catch(firstError){
    console.warn("Program paylaşımı mevcut belgeye yazılamadı; güvenli belge yeniden kuruluyor.",firstError);
    await setDoc(ref,bootstrapSharePayload(program));
  }
}
async function publishProgram(force=false){
  if(rt.writing){rt.pending=true;return}
  if(!rt.db||!rt.user)return;
  const s=state();if(!s)return;
  const program=programPayload(s),hash=stableProgramHash(program);
  if(!force&&hash&&hash===rt.lastHash)return;
  rt.writing=true;
  try{
    await writeProgramShare(program);
    rt.shareReady=true;
    rt.lastHash=hash;
    document.documentElement.dataset.studentProgramShare="ready";
  }catch(error){
    console.error("Program paylaşımı",error);
    document.documentElement.dataset.studentProgramShare="error";
  }finally{
    rt.writing=false;
    if(rt.pending){rt.pending=false;schedule(120)}
  }
}
function schedule(ms=1250){
  clearTimeout(rt.timer);
  rt.timer=setTimeout(()=>void publishProgram(),ms);
}
function localProgramHash(){
  const s=state();if(!s)return"";
  return stableProgramHash(programPayload(s));
}
function watchLocalProgram(){
  if(!rt.shareReady||!rt.db||!rt.user)return;
  const hash=localProgramHash();
  if(hash&&hash!==rt.lastHash)schedule(80);
}
function stop(){
  clearTimeout(rt.timer);rt.timer=null;clearInterval(rt.watchTimer);rt.watchTimer=null;
  try{rt.stopShare?.()}catch{}rt.stopShare=null;
  try{rt.stopData?.()}catch{}rt.stopData=null;
  rt.db=null;rt.user=null;rt.shareReady=false;rt.writing=false;rt.pending=false;rt.bootstrapping=false;rt.lastHash="";
}
function start(ctx){
  stop();rt.db=ctx.db;rt.user=ctx.user;
  const ref=doc(rt.db,"coachingShares",rt.user.uid);
  rt.stopShare=onSnapshot(ref,snap=>{
    rt.shareReady=snap.exists();
    if(!snap.exists()){void ensureShareDocument().finally(()=>schedule(600));return}
    const remote=snap.data()?.program;
    const remoteHash=Number(remote?.version||0)===PROGRAM_VERSION?stableProgramHash(remote):"";
    const currentHash=localProgramHash();
    rt.lastHash=remoteHash;
    if(!remoteHash||remoteHash!==currentHash)schedule(120);
  },error=>console.error("Program paylaşım dinleyicisi",error));
  const changed=()=>schedule();
  window.addEventListener("yks:data-changed",changed);
  rt.stopData=()=>window.removeEventListener("yks:data-changed",changed);
  rt.watchTimer=setInterval(watchLocalProgram,1500);
  schedule(250);
}

const auth=window.YKSAccountAuth;
if(auth&&!auth.__programShareV2){
  const previousSignIn=auth.onSignedIn?.bind(auth);
  const previousSignOut=auth.onSignedOut?.bind(auth);
  auth.onSignedIn=async ctx=>{
    const result=previousSignIn?await previousSignIn(ctx):null;
    const role=result?.role||result?.profile?.role||document.documentElement.dataset.accountRole;
    if(role==="student")start(ctx);else stop();
    return result;
  };
  auth.onSignedOut=(...args)=>{stop();return previousSignOut?.(...args)};
  auth.__programShareV2=true;
}
window.YKSStudentProgramShareV2={version:"3.5.0",publish:force=>publishProgram(Boolean(force)),build:programPayload};
document.documentElement.dataset.studentProgramSync="v3";
