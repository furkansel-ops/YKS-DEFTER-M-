import{collection,doc,getDoc,onSnapshot,query,where,setDoc,updateDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const PENDING_ROLE="yks_account_role_pending",ROLE_HINT="yks_account_role_hint",DAY=86400000;
const rt={auth:null,db:null,user:null,profile:null,stops:[],shareTimer:null,sharing:false,pending:false};
const text=(v,n=160)=>String(v??"").trim().slice(0,n);
const list=v=>Array.isArray(v)?v:[];
const finite=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
const state=()=>{try{return window.YKSLegacyState?.readState?.()||window.S||null}catch{return window.S||null}};
const save=()=>{try{return window.save?.()??window.YKSLegacyState?.save?.()}catch{return false}};
const toast=m=>{try{window.toast?.(m)}catch{console.info(m)}};
const today=()=>new Date().toISOString().slice(0,10);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForState(timeout=4000){const started=Date.now();while(Date.now()-started<timeout){if(state())return true;await wait(50)}return!!state()}

async function beforeSignIn(ctx){
  try{sessionStorage.setItem(PENDING_ROLE,"student")}catch{}
  try{
    ctx.status?.("Google açılıyor…","connecting","Öğrenci hesabı");
    await ctx.setPersistence(ctx.auth,ctx.browserLocalPersistence);
    await ctx.signInWithPopup(ctx.auth,ctx.provider);
  }catch(error){
    ctx.status?.("Giriş hatası","error",ctx.authErrorText?.(error)||text(error?.message,100));
  }
  return true;
}

async function ensureProfile(user,db){
  const ref=doc(db,"accountProfiles",user.uid),snap=await getDoc(ref);
  if(snap.exists())return snap.data();
  const name=text(user.displayName||String(user.email||"").split("@")[0],80)||"Öğrenci";
  const data={uid:user.uid,role:"student",displayName:name,coachTitle:"",specialization:"",createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  await setDoc(ref,data);
  return data;
}

function cleanup(){
  rt.stops.splice(0).forEach(fn=>{try{fn()}catch{}});
  clearTimeout(rt.shareTimer);rt.shareTimer=null;rt.sharing=false;rt.pending=false;
}
function sum(map,days){let n=0;for(let i=0;i<days;i++)n+=Number(map?.[new Date(Date.now()-i*DAY).toISOString().slice(0,10)]||0)||0;return n}
function topicParts(k){const p=String(k||"").split("|");return{exam:p[0]||"YKS",subject:p[1]||"Ders",topic:p.slice(2).join("|")||p[1]||k}}
function cleanProgramMatrix(value,rowCount){
  const src=Array.isArray(value)?value:[];
  return Array.from({length:rowCount},(_,r)=>{
    const row=Array.isArray(src[r])?src[r]:[];
    return Array.from({length:7},(_,d)=>text(row[d],220));
  });
}
function cleanProgramMap(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return{};
  const out={};
  Object.entries(value).slice(0,600).forEach(([key,val])=>{
    const k=text(key,80);if(!k)return;
    if(val&&typeof val==="object")out[k]=JSON.parse(JSON.stringify(val));
    else if(typeof val==="boolean")out[k]=val;
    else if(Number.isFinite(Number(val)))out[k]=Number(val);
    else out[k]=text(val,160);
  });
  return out;
}
function programWeekHasData(week){
  if(!week||typeof week!=="object")return false;
  const cells=[...(week.r||[]),...(week.s||[])];
  return cells.some(row=>Array.isArray(row)&&row.some(cell=>text(cell,220)))
    ||(Array.isArray(week.done)&&week.done.some(Boolean))
    ||Object.keys(week.dn||{}).length>0
    ||Object.keys(week.mv||{}).length>0;
}
function buildProgramShare(s){
  const rr=Math.max(1,Math.min(24,Number(s?.rows?.r)||2));
  const sr=Math.max(1,Math.min(24,Number(s?.rows?.s)||4));
  const weeks=Object.keys(s?.weeks||{})
    .filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&programWeekHasData(s.weeks[k]))
    .sort().slice(-80)
    .map(week=>{
      const raw=s.weeks[week]||{};
      return{week,data:{
        r:cleanProgramMatrix(raw.r,rr),
        s:cleanProgramMatrix(raw.s,sr),
        done:Array.from({length:7},(_,d)=>Boolean(raw?.done?.[d])),
        dn:cleanProgramMap(raw.dn),
        mv:cleanProgramMap(raw.mv)
      }};
    });
  return{
    version:3,
    rows:{r:rr,s:sr},
    rowLabels:{
      r:Array.from({length:rr},(_,i)=>text(s?.rowLabels?.r?.[i],80)),
      s:Array.from({length:sr},(_,i)=>text(s?.rowLabels?.s?.[i],80))
    },
    weeks,
    syncedAt:Date.now()
  };
}

function sharePayload(s,u){
  const topics=Object.entries(s.topics&&typeof s.topics==="object"?s.topics:{}).slice(0,500).map(([key,v])=>({key:text(key,220),...topicParts(key),st:finite(v?.st),deadline:text(v?.dl,10)}));
  const exams=list(s.denemeler).slice(-24).map(d=>({id:String(d?.id||""),type:text(d?.type,16),name:text(d?.name,100),date:text(d?.date,10),totalNet:finite(d?.totalNet),subjectResults:list(d?.subjectResults).slice(0,16).map(x=>({name:text(x?.name,60),net:finite(x?.net)}))}));
  const pp=list(s.lab?.paragraphLog).slice(-100).map(x=>({id:text(x?.id,80),at:finite(x?.at),words:finite(x?.words),seconds:finite(x?.seconds),wpm:finite(x?.wpm),score:finite(x?.score),title:text(x?.title,120)}));
  const errors=list(s.wrongLog).slice(-100).map(x=>({date:text(x?.date,10),subject:text(x?.subject,60),topic:text(x?.topic,100),n:Math.max(1,finite(x?.n,1))}));
  return{studentUid:u.uid,version:1,profile:{name:text(s.name||u.displayName,80),track:text(s.puanTuru,8),targetNetTYT:Number(s.targetNetTYT??s.targetNet??0),targetNetAYT:Number(s.targetNetAYT||0),targetUniversity:text(s.targetUniversity,120),targetDepartment:text(s.targetDepartment,120)},program:buildProgramShare(s),exams,progress:{minutes7:sum(s.pomoMin,7),questions7:sum(s.solved,7),completedTopics:topics.filter(x=>x.st>=3).length,activeTopics:topics.filter(x=>x.st>0&&x.st<3).length,overdueTopics:topics.filter(x=>x.deadline&&x.deadline<today()&&x.st<3).length},paragraphProblem:{entries:pp},topics:{items:topics},errorJournal:errors,updatedAt:serverTimestamp()};
}
async function publishShare(){
  if(rt.sharing){rt.pending=true;return}
  if(rt.profile?.role!=="student"||!rt.db||!rt.user)return;
  const s=state();if(!s){scheduleShare(500);return}rt.sharing=true;
  try{
    await setDoc(doc(rt.db,"coachingShares",rt.user.uid),sharePayload(s,rt.user),{merge:true});
    document.documentElement.dataset.coachShare="ready";
  }catch(error){
    console.error("Koç paylaşımı",error);document.documentElement.dataset.coachShare="error";
  }finally{
    rt.sharing=false;
    if(rt.pending){rt.pending=false;scheduleShare(120)}
  }
}
function scheduleShare(ms=900){clearTimeout(rt.shareTimer);rt.shareTimer=setTimeout(()=>void publishShare(),ms)}

function dateInfo(date){const d=new Date(date+"T12:00:00"),day=(d.getDay()+6)%7,t=new Date(d);t.setDate(t.getDate()-day);return{day,week:t.toISOString().slice(0,10)}}
function applyAction(a){
  const s=state();if(!s)throw new Error("Öğrenci verisi hazır değil");const p=a.payload||{};
  if(a.type==="program_task"||a.type==="post_exam_task"){
    const v=text(p.text,220),di=dateInfo(text(p.date,10)||today());if(!v)throw new Error("Görev boş");
    if(typeof window.addToDay!=="function")throw new Error("Program işlevi hazır değil");
    const prefix=a.type==="post_exam_task"?"Koç · Deneme sonrası · ":"Koç · ";
    if(window.addToDay(prefix+v,di.day,di.week)===false)throw new Error("Programda boş satır bulunamadı");
  }else if(a.type==="topic_deadline"){
    const k=text(p.key,220),d=text(p.date,10);if(!k||!/^\d{4}-\d{2}-\d{2}$/.test(d))throw new Error("Konu hedefi geçersiz");
    s.topics??={};s.topics[k]??={st:0,conf:0,ts:null,rev:[]};s.topics[k].dl=d;save();
  }else if(a.type==="coach_note"){
    const v=text(p.text,500);if(!v)throw new Error("Not boş");s.coachNotes??=[];s.coachNotes.push({id:`coach-${Date.now()}`,at:Date.now(),coachUid:a.coachUid,text:v});s.coachNotes=s.coachNotes.slice(-80);save();
  }else throw new Error("Desteklenmeyen işlem");
  return"Uygulandı";
}
async function handleAction(change){
  if(!["added","modified"].includes(change.type))return;const a=change.doc.data();if(a.status!=="pending")return;
  try{
    const result=applyAction(a);await updateDoc(change.doc.ref,{status:"applied",updatedAt:serverTimestamp(),handledAt:serverTimestamp(),result});
    toast("Koçundan yeni görev/not geldi ✓");scheduleShare(200);
  }catch(error){
    try{await updateDoc(change.doc.ref,{status:"rejected",updatedAt:serverTimestamp(),handledAt:serverTimestamp(),result:text(error?.message||"Uygulanamadı",500)})}catch{}
  }
}
async function startStudent(){
  await waitForState();
  scheduleShare(200);
  const changed=()=>scheduleShare();window.addEventListener("yks:data-changed",changed);rt.stops.push(()=>window.removeEventListener("yks:data-changed",changed));
  const q=query(collection(rt.db,"coachingActions"),where("studentUid","==",rt.user.uid));
  rt.stops.push(onSnapshot(q,snap=>snap.docChanges().forEach(change=>void handleAction(change)),error=>console.error("Koç action",error)));
}

async function onSignedIn({user,auth,db}){
  cleanup();rt.user=user;rt.auth=auth;rt.db=db;
  if(!user?.emailVerified)throw new Error("Doğrulanmış Google hesabı gerekli");
  const profile=await ensureProfile(user,db);rt.profile=profile;
  try{localStorage.setItem(ROLE_HINT,profile.role);sessionStorage.removeItem(PENDING_ROLE)}catch{}
  document.documentElement.dataset.accountRole=profile.role;
  if(profile.role==="student")await startStudent();
  return{role:profile.role,profile};
}
function onSignedOut(){cleanup();rt.user=rt.auth=rt.db=rt.profile=null;delete document.documentElement.dataset.accountRole}

let resolveAccountReady;try{window.__YKS_ACCOUNT_READY__=new Promise(resolve=>{resolveAccountReady=resolve})}catch{}
window.YKSAccountAuth={version:"1.2.2",beforeSignIn,onSignedIn,onSignedOut,publishShare};
try{resolveAccountReady?.(window.YKSAccountAuth)}catch{}
document.documentElement.dataset.studentCoachingBridge="ready";
window.dispatchEvent(new CustomEvent("yks:student-coaching-ready",{detail:{version:"1.2.2"}}));
