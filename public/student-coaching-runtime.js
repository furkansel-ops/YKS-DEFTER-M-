import{collection,deleteDoc,doc,getDoc,getDocs,onSnapshot,query,where,setDoc,updateDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const PENDING_ROLE="yks_account_role_pending",ROLE_HINT="yks_account_role_hint",DAY=86400000;
const rt={auth:null,db:null,user:null,profile:null,stops:[],shareTimer:null,shareInterval:null,sharing:false,pending:false,inFlight:null,actionQueue:Promise.resolve(),session:0};
const text=(v,n=160)=>String(v??"").trim().slice(0,n);
const list=v=>Array.isArray(v)?v:[];
const finite=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
const state=()=>{try{return window.S||window.YKSLegacyState?.readState?.()||null}catch{return window.S||null}};
const save=()=>{try{return window.save?.()??window.YKSLegacyState?.save?.()}catch{return false}};
const toast=m=>{try{window.toast?.(m)}catch{console.info(m)}};
const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const today=()=>dateKey(new Date());
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForState(timeout=4000,session=rt.session){const started=Date.now();while(session===rt.session&&Date.now()-started<timeout){if(state())return true;await wait(50)}return!!state()}
function requireSession(session){if(session!==rt.session){const error=new Error("Hesap oturumu değişti");error.code="account-session-changed";throw error}}

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
  rt.session++;
  rt.stops.splice(0).forEach(fn=>{try{fn()}catch{}});
  clearTimeout(rt.shareTimer);rt.shareTimer=null;clearInterval(rt.shareInterval);rt.shareInterval=null;rt.sharing=false;rt.pending=false;rt.inFlight=null;rt.actionQueue=Promise.resolve();
  clearTimeout(rt.photoTimer);rt.photoTimer=null;rt.photoDocs=null;rt.photoFingerprint="";rt.photoSyncing=false;window.YKSCoachPhotoNotes={};
}
// Study dates belong to the student's local calendar, not the UTC day.
function localDayOffset(offset){
  const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);
  return dateKey(d);
}
function sum(map,days){
  let n=0;
  for(let i=0;i<days;i++)n+=Number(map?.[localDayOffset(-i)]||0)||0;
  return n;
}
function topicParts(k){const p=String(k||"").split("|");return{exam:p[0]||"YKS",subject:p[1]||"Ders",topic:p.slice(2).join("|")||p[1]||k}}
function cleanProgramMatrix(value,rowCount){
  const src=Array.isArray(value)?value:[];
  const out={};
  for(let r=0;r<src.length;r++){
    const row=Array.isArray(src[r])?src[r]:[];
    const cells=Array.from({length:7},(_,d)=>text(row[d],220));
    // Sparse Firestore rows keep large programs compact and retain real cell IDs.
    if(cells.some(Boolean))out[String(r)]=cells;
  }
  return out;
}
function cleanProgramMap(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return{};
  const out={};
  Object.entries(value).forEach(([key,val])=>{
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
  const weekKeys=Object.keys(s?.weeks||{})
    .filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&programWeekHasData(s.weeks[k]))
    .sort().slice(-80);
  const actual=blk=>Math.max(0,...weekKeys.map(k=>Array.isArray(s.weeks[k]?.[blk])?s.weeks[k][blk].length:0));
  const rr=Math.max(1,Math.floor(Number(s?.rows?.r)||2),actual("r"));
  const sr=Math.max(1,Math.floor(Number(s?.rows?.s)||4),actual("s"));
  const weeks=weekKeys.map(week=>{
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

/* v75: isteğe bağlı süre ve soru türü yalnız doluysa eklenir (Firestore undefined kabul etmez). */
function ppExtra(x){const out={},minutes=Math.max(0,Math.min(600,Math.floor(finite(x?.minutes))));if(minutes)out.minutes=minutes;const topic=text(x?.topic,40);if(topic)out.topic=topic;return out;}
/* v81: hata kaydının hangi denemeden geldiği ve hata türü (koçta tekrar eden hatalar için); yalnız doluysa eklenir. */
function errorExtra(x){const out={},exam=text(x?.deneme,40);if(exam)out.exam=exam;const kind=text(x?.kind,24);if(kind)out.kind=kind;return out;}
/* v77: kariyer özeti (seviye, XP, deneme rankları) yalnız sayı ve kısa metin olarak paylaşılır. */
function careerShare(){
  let raw=null;try{raw=window.YKSCareer?.summary?.()||null;}catch(e){raw=null;}
  if(!raw||typeof raw!=="object")return null;
  const rank=r=>r&&typeof r==="object"?{label:text(r.label,24),name:text(r.name,24),net:Math.round(finite(r.net)*100)/100,league:Math.max(0,Math.min(7,Math.floor(finite(r.league)))),tier:Math.max(0,Math.min(3,Math.floor(finite(r.tier))))}:null;
  return {level:Math.max(0,Math.floor(finite(raw.level))),xp:Math.max(0,Math.floor(finite(raw.xp))),tyt:rank(raw.tyt),ayt:rank(raw.ayt),ydt:rank(raw.ydt)};
}
function progressDaily(s,days=7){
  return Array.from({length:days},(_,index)=>{
    const date=localDayOffset(-(days-1-index));
    return{date,minutes:Math.max(0,Math.round(finite(s?.pomoMin?.[date]))),questions:Math.max(0,Math.round(finite(s?.solved?.[date])))};
  });
}
function progressSubjects(s,daily){
  const dates=new Set(daily.map(item=>item.date)),rows=new Map();
  const ensure=name=>{const key=text(name,60);if(!key)return null;if(!rows.has(key))rows.set(key,{name:key,minutes:0,questions:0});return rows.get(key)};
  for(const date of dates){
    const minutes=s?.pomoSubj?.[date];if(minutes&&typeof minutes==="object")for(const [name,value] of Object.entries(minutes)){const row=ensure(name);if(row)row.minutes+=Math.max(0,finite(value));}
    const questions=s?.solvedTopic?.[date];if(questions&&typeof questions==="object")for(const [key,value] of Object.entries(questions)){const parts=String(key||"").split("|"),row=ensure(parts[1]||parts[0]);if(row)row.questions+=Math.max(0,finite(value));}
  }
  return[...rows.values()].map(row=>({...row,minutes:Math.round(row.minutes),questions:Math.round(row.questions)})).filter(row=>row.minutes||row.questions).sort((a,b)=>(b.minutes+b.questions)-(a.minutes+a.questions)||a.name.localeCompare(b.name,"tr")).slice(0,12);
}

/* v80: hızlı okuma özeti (yalnız sayı): son 30 günün geçerli test ortalamaları ve son test. */
function readingShare(s){
  const raw=s?.speedReading;if(!raw||typeof raw!=="object")return null;
  const now=Date.now(),start=now-30*86400000;
  const tests=list(raw.sessions).filter(x=>x&&x.kind==="test"&&finite(x.readingMs)>=5000&&finite(x.at)>0&&finite(x.at)<=now).sort((a,b)=>finite(a.at)-finite(b.at));
  const recent=tests.filter(x=>finite(x.at)>=start),avg=key=>recent.length?Math.round(recent.reduce((total,x)=>total+finite(x[key]),0)/recent.length):0,last=tests.at(-1);
  const lessons=raw.lessons&&typeof raw.lessons==="object"?Object.keys(raw.lessons).length:0;
  return{tests30:recent.length,wpm30:avg("wpm"),comprehension30:avg("comprehension"),lessons:Math.min(4,lessons),last:last?{at:Math.floor(finite(last.at)),wpm:Math.max(0,Math.floor(finite(last.wpm))),comprehension:Math.max(0,Math.min(100,Math.floor(finite(last.comprehension))))}:null};
}
/* v86: koç müfredatın tamamını görür. Dokunulmamış konular st:0 ile gider; güven (1–5 yıldız),
   pekiştirme günü ve yapılan tekrarlar (3/7/21 gün) yalnız varsa eklenir (Firestore undefined almaz). */
function topicsShare(s){
  const src=s?.topics&&typeof s.topics==="object"?s.topics:{},curriculum=typeof CURRICULUM!=="undefined"&&CURRICULUM&&typeof CURRICULUM==="object"?CURRICULUM:null;
  const keys=[],seen=new Set(),add=key=>{if(!seen.has(key)){seen.add(key);keys.push(key)}};
  if(curriculum)for(const exam of ["TYT","AYT","YDT"])for(const subject of list(curriculum[exam]))for(const topic of list(subject?.topics))add(exam+"|"+subject?.name+"|"+topic);
  Object.keys(src).forEach(add);
  const items=keys.slice(0,500).map(key=>{
    const v=src[key]&&typeof src[key]==="object"?src[key]:{},item={key:text(key,220),...topicParts(key),st:finite(v.st),deadline:text(v.dl,10)};
    const conf=Math.floor(finite(v.conf));if(conf>=1&&conf<=5)item.conf=conf;
    if(item.st>=3&&/^\d{4}-\d{2}-\d{2}$/.test(String(v.ts||"")))item.ts=String(v.ts);
    const rev=[...new Set(list(v.rev).map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<=2))].sort();if(item.ts&&rev.length)item.rev=rev;
    return item;
  });
  return curriculum?{items,full:true}:{items};
}
/* v87: öğrencinin günlük paragraf / problem hedefi (yalnız koyduysa) koçta hedef çubuğu olur. */
function ppGoals(s){const g=s?.paragraphProblem?.goals,out={};if(!g||typeof g!=="object")return null;for(const kind of ["paragraph","problem"]){const n=Math.floor(finite(g[kind]));if(n>=1&&n<=500)out[kind]=n}return Object.keys(out).length?out:null}
/* v89: Kitaplarım koça gider. progress içinde: kural değişmez. v91: kapak da gider; yalnız geçerli küçük JPEG
   (≤12 KB) ve hepsi birlikte en fazla 240 KB, paylaşım kaydı Firestore'un 1 MB sınırından uzak kalsın. */
const BOOK_COVER_MAX=12000,BOOK_COVER_BUDGET=240000,BOOK_COVER_RE=/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/;
function booksShare(s){let budget=BOOK_COVER_BUDGET;return list(s?.books).slice(0,60).map(b=>{const total=Math.max(0,Math.min(2000,Math.floor(finite(b?.total)))),done=Math.max(0,Math.min(total,Math.floor(finite(b?.done)))),log=list(b?.log).map(x=>text(x?.d,10)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort(),out={id:text(b?.id,40),name:text(b?.name,120),subject:text(b?.subject,40),pub:text(b?.pub,40),exam:text(b?.exam,8),kind:text(b?.kind,40),total,done,perTest:Math.max(0,Math.min(400,Math.floor(finite(b?.perTest)))),last:log.at(-1)||""},c=typeof b?.cover==="string"?b.cover:"";if(c.length<=BOOK_COVER_MAX&&c.length<=budget&&BOOK_COVER_RE.test(c)){out.cover=c;budget-=c.length}return out}).filter(b=>b.id&&b.name&&b.total>0)}
function sharePayload(s,u){
  const topicShare=topicsShare(s),topics=topicShare.items;
  const exams=list(s.denemeler).slice(-24).map(d=>({id:String(d?.id||""),type:text(d?.type,16),name:text(d?.name,100),date:text(d?.date,10),totalNet:finite(d?.totalNet),subjectResults:list(d?.subjectResults).slice(0,16).map(x=>({name:text(x?.name,60),net:finite(x?.net),d:Math.max(0,Math.floor(finite(x?.d))),y:Math.max(0,Math.floor(finite(x?.y))),b:Math.max(0,Math.floor(finite(x?.b)))}))}));
  const pp=list(s.paragraphProblem?.entries).slice(-2000).map(x=>({id:text(x?.id,80),date:text(x?.date,10),kind:x?.kind==="problem"?"problem":"paragraph",correct:Math.max(0,Math.floor(finite(x?.correct))),wrong:Math.max(0,Math.floor(finite(x?.wrong))),blank:Math.max(0,Math.floor(finite(x?.blank))),createdAt:Math.max(0,finite(x?.createdAt)),...ppExtra(x)})).filter(x=>x.id&&/^\d{4}-\d{2}-\d{2}$/.test(x.date));
  const errors=list(s.wrongLog).slice(-100).map(x=>({date:text(x?.date,10),subject:text(x?.subject,60),topic:text(x?.topic,100),n:Math.max(1,finite(x?.n,1)),...errorExtra(x)}));
  const dayReviews=Object.entries(s.dayReview&&typeof s.dayReview==="object"?s.dayReview:{}).filter(([date])=>/^\d{4}-\d{2}-\d{2}$/.test(date)).sort(([a],[b])=>a.localeCompare(b)).slice(-14).map(([date,value])=>({date,mood:["good","mid","hard"].includes(value?.mood)?value.mood:"",note:text(value?.note,3000),at:finite(value?.at)})).filter(x=>x.mood||x.note);
  const daily14=progressDaily(s,14),subjects7=progressSubjects(s,daily14.slice(-7));
  // v83: koçun gün/hafta/ay raporu ve ders süzgeci için son 31 gün, gün gün ders kırılımıyla.
  const daily31=progressDaily(s,31).map(day=>({...day,subjects:progressSubjects(s,[day]).slice(0,8)}));
  return{studentUid:u.uid,version:1,profile:{name:text(s.name||u.displayName,80),track:text(s.puanTuru,8),targetNetTYT:Number(s.targetNetTYT??s.targetNet??0),targetNetAYT:Number(s.targetNetAYT||0),targetUniversity:text(s.targetUniversity,120),targetDepartment:text(s.targetDepartment,120),career:careerShare(),reading:readingShare(s)},program:buildProgramShare(s),exams,progress:{minutes7:sum(s.pomoMin,7),questions7:sum(s.solved,7),daily14,daily31,subjects7,completedTopics:topics.filter(x=>x.st>=3).length,activeTopics:topics.filter(x=>x.st>0&&x.st<3).length,overdueTopics:topics.filter(x=>x.deadline&&x.deadline<today()&&x.st<3).length,books:booksShare(s),dayReview:{entries:dayReviews}},paragraphProblem:ppGoals(s)?{entries:pp,goals:ppGoals(s)}:{entries:pp},topics:topicShare,errorJournal:errors,updatedAt:serverTimestamp()};
}
async function publishShare(options={}){
  const manual=options?.manual===true,session=rt.session;
  if(rt.sharing){
    rt.pending=true;
    if(manual&&rt.inFlight)await rt.inFlight;
    if(session!==rt.session){if(manual)requireSession(session);return false}
    if(manual&&document.documentElement.dataset.coachShare==="error")throw new Error(document.documentElement.dataset.coachShareError||"Öğrenci bilgileri gönderilemedi");
    return document.documentElement.dataset.coachShare==="ready";
  }
  if(rt.profile?.role!=="student"||!rt.db||!rt.user){
    if(manual)throw new Error("Öğrenci hesabı hazır değil");
    return false;
  }
  const s=state();
  if(!s){
    if(manual)throw new Error("Öğrenci verisi henüz hazır değil");
    scheduleShare(500);return false;
  }
  rt.sharing=true;
  rt.inFlight=(async()=>{
    try{
      const payload=sharePayload(s,rt.user);
      const ref=doc(rt.db,"coachingShares",rt.user.uid);
      try{
        await setDoc(ref,payload,{merge:true});
      }catch(mergeError){
        if(session!==rt.session){if(manual)requireSession(session);return false}
        console.warn("Koç paylaşımı eski belgeyle çakıştı; belge güncel şemayla yeniden kuruluyor.",mergeError);
        await setDoc(ref,payload);
      }
      if(session!==rt.session){if(manual)requireSession(session);return false}
      document.documentElement.dataset.coachShare="ready";
      delete document.documentElement.dataset.coachShareError;
      schedulePhotoSync();
      return true;
    }catch(error){
      if(session!==rt.session){if(manual)requireSession(session);return false}
      const code=text(error?.code||error?.message||"unknown",120);
      console.error("Koç paylaşımı",error);
      document.documentElement.dataset.coachShare="error";
      document.documentElement.dataset.coachShareError=code;
      if(!manual)scheduleShare(5000);
      if(manual)throw error;
      return false;
    }finally{
      if(session===rt.session){
        rt.sharing=false;
        rt.inFlight=null;
        if(rt.pending){rt.pending=false;scheduleShare(120)}
      }
    }
  })();
  return rt.inFlight;
}
function scheduleShare(ms=900){clearTimeout(rt.shareTimer);rt.shareTimer=setTimeout(()=>void publishShare(),ms)}

/* v82 · Hata Defteri fotoğrafları: yalnız aktif koç bağlantısı varken çözülmemiş yanlışların son 90 günlük
   fotoğrafları (en fazla 150) paylaşılır. Bilgi + küçük önizleme coachingErrorPhotos'ta, büyük fotoğraf
   coachingErrorPhotoImages'ta. Öğrenci paylaşımı kapatırsa (s.coachPhotoShare===false) ya da bağlantı biterse
   paylaşılanlar silinir. Koçun yorumu ve durumu yalnız okunur; öğrenci yazarken bu alanlara dokunmaz. */
const PHOTO_META="coachingErrorPhotos",PHOTO_IMAGE="coachingErrorPhotoImages",PHOTO_DAYS=90,PHOTO_MAX=150;
function photoHash(value){let h=5381;const s=String(value);for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36)}
function photoCandidates(s,now=Date.now()){
  const resolved=new Set(list(s?.errorJournal).filter(x=>x?.resolved&&String(x?.sourceRef||"").startsWith("wrong:")).map(x=>String(x.sourceRef).slice(6)));
  const since=dateKey(new Date(now-PHOTO_DAYS*DAY)),exams=new Map(list(s?.denemeler).map(d=>[String(d?.id),text(d?.name,100)])),out=[];
  for(const w of list(s?.wrongLog)){
    if(!w||w.resolved||resolved.has(String(w.id))||!/^\d{4}-\d{2}-\d{2}$/.test(String(w.date||""))||String(w.date)<since)continue;
    list(w.questionImgs).forEach((img,index)=>{
      if(typeof img!=="string"||!img.startsWith("data:image/")||img.length>900000)return;
      const meta={photoKey:text(w.id,40)+"-"+index,wrongId:text(w.id,40),subject:text(w.subject,60),topic:text(w.topic,100),date:text(w.date,10),exam:text(w.deneme,40),examName:exams.get(String(w.deneme))||"",question:text(w.q,6),kind:text(w.kind,24),note:text(w.note,600)};
      const imageSig=photoHash(img.length+":"+img.slice(-64));out.push({...meta,image:img,imageSig,sig:photoHash(JSON.stringify(meta))+"."+imageSig});
    });
  }
  return out.sort((a,b)=>b.date.localeCompare(a.date)||b.photoKey.localeCompare(a.photoKey)).slice(0,PHOTO_MAX);
}
/* Koçun yorumları yanlış kaydına göre (en yeni) toplanır; Hata Defteri kartında gösterilir. */
function photoCoachNotes(rows){
  const notes={};
  for(const row of rows){
    if(!row?.wrongId||!(row.coachComment||row.coachStatus))continue;
    const at=finite(row.coachAt?.toMillis?.()),old=notes[row.wrongId];
    if(!old||at>=old.at)notes[row.wrongId]={comment:text(row.coachComment,1000),status:["review","solved"].includes(row.coachStatus)?row.coachStatus:"",at};
  }
  return notes;
}
function photoThumb(src){
  return new Promise(resolve=>{try{
    const img=new Image();img.onerror=()=>resolve("");
    img.onload=()=>{try{const scale=Math.min(1,240/Math.max(img.naturalWidth||1,img.naturalHeight||1)),cv=document.createElement("canvas");cv.width=Math.max(1,Math.round((img.naturalWidth||1)*scale));cv.height=Math.max(1,Math.round((img.naturalHeight||1)*scale));cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);const out=cv.toDataURL("image/jpeg",.6);resolve(out.length<=60000?out:"")}catch{resolve("")}};
    img.src=src;
  }catch{resolve("")}});
}
async function activeCoachUid(){
  const snap=await getDocs(query(collection(rt.db,"coachingLinks"),where("studentUid","==",rt.user.uid)));
  return text(snap.docs.map(d=>d.data()).filter(x=>x?.active===true).sort((a,b)=>finite(b.updatedAt?.toMillis?.())-finite(a.updatedAt?.toMillis?.()))[0]?.coachUid,128);
}
async function syncErrorPhotos(session){
  if(rt.photoSyncing||Date.now()<(rt.photoBlockedUntil||0))return;
  const s=state();if(!s||!rt.user||!rt.db)return;
  rt.photoSyncing=true;
  try{
    const uid=rt.user.uid,coachUid=await activeCoachUid();requireSession(session);
    const wanted=coachUid&&s.coachPhotoShare!==false?photoCandidates(s):[],fingerprint=coachUid+"|"+wanted.map(x=>x.photoKey+":"+x.sig).join(",");
    if(fingerprint===rt.photoFingerprint)return;
    const existing=rt.photoDocs||new Map((await getDocs(query(collection(rt.db,PHOTO_META),where("studentUid","==",uid)))).docs.map(d=>[d.id,d.data()]));
    requireSession(session);
    const keep=new Set();
    for(const item of wanted){
      const id=uid+"_"+item.photoKey;keep.add(id);
      let old=existing.get(id);
      if(old&&old.coachUid!==coachUid){await deleteDoc(doc(rt.db,PHOTO_IMAGE,id)).catch(()=>{});await deleteDoc(doc(rt.db,PHOTO_META,id));old=null}
      if(old&&old.sig===item.sig)continue;
      let thumb=old?.thumb||"";
      if(!old||!thumb||String(old.sig||"").split(".")[1]!==item.imageSig){
        thumb=await photoThumb(item.image);if(!thumb)continue;
        await setDoc(doc(rt.db,PHOTO_IMAGE,id),{studentUid:uid,coachUid,photoKey:item.photoKey,image:item.image,updatedAt:serverTimestamp()});
      }
      const {image:_image,imageSig:_imageSig,...meta}=item;
      await setDoc(doc(rt.db,PHOTO_META,id),{...meta,studentUid:uid,coachUid,thumb,updatedAt:serverTimestamp()},{merge:true});
      requireSession(session);
    }
    for(const [id,row] of existing){
      if(keep.has(id)||row?.studentUid!==uid)continue;
      await deleteDoc(doc(rt.db,PHOTO_IMAGE,id)).catch(()=>{});await deleteDoc(doc(rt.db,PHOTO_META,id));
    }
    rt.photoFingerprint=fingerprint;
  }catch(error){
    // Kural henüz yayında değilse ya da bağlantı yoksa 10 dakika bekle; paylaşımın geri kalanı etkilenmez.
    if(String(error?.code||"").includes("permission-denied"))rt.photoBlockedUntil=Date.now()+600000;
    console.warn("Hata Defteri fotoğrafları paylaşılamadı",error);
  }finally{rt.photoSyncing=false}
}
function schedulePhotoSync(ms=4000){clearTimeout(rt.photoTimer);const session=rt.session;rt.photoTimer=setTimeout(()=>{if(session===rt.session)void syncErrorPhotos(session)},ms)}
function watchErrorPhotos(session){
  rt.stops.push(onSnapshot(query(collection(rt.db,PHOTO_META),where("studentUid","==",rt.user.uid)),snap=>{
    if(session!==rt.session)return;
    rt.photoDocs=new Map(snap.docs.map(d=>[d.id,d.data()]));
    window.YKSCoachPhotoNotes=photoCoachNotes([...rt.photoDocs.values()]);
    window.dispatchEvent(new CustomEvent("yks:coach-photo-notes"));
  },error=>{if(String(error?.code||"").includes("permission-denied"))rt.photoBlockedUntil=Date.now()+600000;console.warn("Koç fotoğraf notları",error)}));
}

function dateInfo(date){
  const d=new Date(date+"T12:00:00");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(d.getTime())||dateKey(d)!==date)throw new Error("Görev tarihi geçersiz");
  const now=new Date(),day=(d.getDay()+6)%7,currentDay=(now.getDay()+6)%7;
  const targetMonday=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()-day);
  const currentMonday=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()-currentDay);
  return{day,weekOffset:Math.round((targetMonday-currentMonday)/(7*DAY))};
}
function applyAction(a){
  const s=state();if(!s)throw new Error("Öğrenci verisi hazır değil");const p=a.payload||{};
  if(a.type==="program_task"||a.type==="post_exam_task"){
    const di=dateInfo(text(p.date,10)||today());
    if(a.type==="program_task"&&p.operation==="order"){
      const order=Array.isArray(p.order)?p.order.map(id=>text(id,40)).filter(Boolean):[];
      if(!order.length||order.some(id=>!/^[rs]-\d+-[0-6]$/.test(id)))throw new Error("Program sırası geçersiz");
      const target=new Date(text(p.date,10)+"T12:00:00");target.setDate(target.getDate()-di.day);const week=dateKey(target);
      if(typeof window.programSetDayOrder!=="function")throw new Error("Program sıralama işlevi hazır değil");
      if(window.programSetDayOrder(week,di.day,order)===false)throw new Error("Program sırası kaydedilemedi");
    }else if(a.type==="program_task"&&p.operation==="delete"){
      const sourceWeek=text(p.sourceWeek,10),taskId=text(p.taskId,40);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(sourceWeek)||!/^[rs]-\d+-[0-6]$/.test(taskId))throw new Error("Program silme bilgisi geçersiz");
      if(typeof window.programDeleteTask!=="function")throw new Error("Program silme işlevi hazır değil");
      if(window.programDeleteTask(sourceWeek,taskId)===false)throw new Error("Görev programdan silinemedi");
    }else if(a.type==="program_task"&&p.operation==="move"){
      const sourceWeek=text(p.sourceWeek,10),taskId=text(p.taskId,40),targetDate=text(p.date,10);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(sourceWeek)||!/^[rs]-\d+-[0-6]$/.test(taskId))throw new Error("Program taşıma bilgisi geçersiz");
      if(typeof window.programMoveTaskToDate!=="function")throw new Error("Program taşıma işlevi hazır değil");
      if(window.programMoveTaskToDate(sourceWeek,taskId,targetDate)===false)throw new Error("Görev hedef güne taşınamadı");
    }else if(a.type==="program_task"&&p.operation==="edit"){
      const sourceWeek=text(p.sourceWeek,10),taskId=text(p.taskId,40),value=text(p.text,600);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(sourceWeek)||!/^[rs]-\d+-[0-6]$/.test(taskId)||!value)throw new Error("Program düzenleme bilgisi geçersiz");
      const editTask=typeof window.programUpdateTask==="function"?window.programUpdateTask:window.programEditTask;
      if(typeof editTask!=="function")throw new Error("Program düzenleme işlevi hazır değil");
      if(editTask(sourceWeek,taskId,value)===false)throw new Error("Görev düzenlenemedi");
    }else{
      const v=text(p.text,600);if(!v)throw new Error("Görev boş");
      const prefix=a.type==="post_exam_task"?"Koç · Deneme sonrası · ":"Koç · ";
      if(typeof window.addToDays==="function"){
        const result=window.addToDays(prefix+v,[di.day],di.weekOffset);
        if(!result||result.ok!==true)throw new Error(result?.reason==="full"?"Programda boş satır bulunamadı":"Program görevi kaydedilemedi");
      }else{
        if(typeof window.addToDay!=="function")throw new Error("Program işlevi hazır değil");
        if(window.addToDay(prefix+v,di.day,di.weekOffset)===false)throw new Error("Programda boş satır bulunamadı");
      }
    }
  }else if(a.type==="topic_deadline"){
    const k=text(p.key,220),d=text(p.date,10);if(!k||!/^\d{4}-\d{2}-\d{2}$/.test(d))throw new Error("Konu hedefi geçersiz");
    dateInfo(d);
    s.topics??={};s.topics[k]??={st:0,conf:0,ts:null,rev:[]};s.topics[k].dl=d;save();
  }else if(a.type==="coach_note"&&p.operation==="resource_recommendation"){
    const kind=text(p.kind,20),resourceId=text(p.id,120),title=text(p.title,180),url=text(p.url,600),teacher=text(p.teacher,100),subject=text(p.subject,80),topic=text(p.topic,120),scope=text(p.scope,10),thumb=text(p.thumb,600);
    if(!["video","playlist"].includes(kind)||!resourceId||!title||!/^https?:\/\//i.test(url))throw new Error("Kaynak önerisi geçersiz");
    s.coachRecommendations=Array.isArray(s.coachRecommendations)?s.coachRecommendations:[];
    const key=kind+":"+resourceId,now=Date.now(),next={key,id:resourceId,kind,title,url,teacher,subject,topic,scope,thumb,coachUid:text(a.coachUid,120),at:now};
    s.coachRecommendations=s.coachRecommendations.filter(item=>String(item?.key||"")!==key);
    s.coachRecommendations.push(next);s.coachRecommendations=s.coachRecommendations.slice(-40);
    if(save()===false)throw new Error("Kaynak önerisi kaydedilemedi");
    window.dispatchEvent(new CustomEvent("yks:coach-recommendations-changed",{detail:{key}}));
  }else if(a.type==="coach_note"){
    const v=text(p.text,500);if(!v)throw new Error("Not boş");s.coachNotes??=[];s.coachNotes.push({id:`coach-${Date.now()}`,at:Date.now(),coachUid:a.coachUid,text:v});s.coachNotes=s.coachNotes.slice(-80);save();
  }else if(a.type==="resource_recommendation"){
    const kind=text(p.kind,20),resourceId=text(p.id,120),title=text(p.title,180),url=text(p.url,600),teacher=text(p.teacher,100),subject=text(p.subject,80),topic=text(p.topic,120),scope=text(p.scope,10),thumb=text(p.thumb,600);
    if(!["video","playlist"].includes(kind)||!resourceId||!title||!/^https?:\/\//i.test(url))throw new Error("Kaynak önerisi geçersiz");
    s.coachRecommendations=Array.isArray(s.coachRecommendations)?s.coachRecommendations:[];
    const key=kind+":"+resourceId,now=Date.now(),next={key,id:resourceId,kind,title,url,teacher,subject,topic,scope,thumb,coachUid:text(a.coachUid,120),at:now};
    s.coachRecommendations=s.coachRecommendations.filter(item=>String(item?.key||"")!==key);
    s.coachRecommendations.push(next);
    s.coachRecommendations=s.coachRecommendations.slice(-40);
    if(save()===false)throw new Error("Kaynak önerisi kaydedilemedi");
    window.dispatchEvent(new CustomEvent("yks:coach-recommendations-changed",{detail:{key}}));
  }else throw new Error("Desteklenmeyen işlem");
  return"Uygulandı";
}
function queueAction(change,session){
  rt.actionQueue=rt.actionQueue.then(()=>handleAction(change,session)).catch(error=>{if(session===rt.session)console.error("Koç action işleme",error)});
}
async function handleAction(change,session=rt.session){
  if(!["added","modified"].includes(change.type))return;const a=change.doc.data();if(a.status!=="pending")return;
  try{
    const ready=await waitForState(30000,session);requireSession(session);
    if(!ready){console.warn("Koç görevi öğrenci verisi hazır olmadığı için beklemede bırakıldı");return}
    const result=applyAction(a);requireSession(session);
    if(a.type==="program_task"||a.type==="post_exam_task"){
      try{await window.YKSStudentProgramShareV2?.publish?.(true)}catch(error){console.warn("Koç görevi program paylaşımı",error)}
    }
    requireSession(session);
    await updateDoc(change.doc.ref,{status:"applied",updatedAt:serverTimestamp(),handledAt:serverTimestamp(),result});
    if(session!==rt.session)return;
    toast(a.type==="resource_recommendation"||(a.type==="coach_note"&&a.payload?.operation==="resource_recommendation")?"Koçundan yeni video önerisi geldi ✓":"Koçundan yeni görev/not geldi ✓");scheduleShare(60);
  }catch(error){
    if(session!==rt.session)return;
    try{await updateDoc(change.doc.ref,{status:"rejected",updatedAt:serverTimestamp(),handledAt:serverTimestamp(),result:text(error?.message||"Uygulanamadı",500)})}catch{}
  }
}
async function startStudent(session){
  requireSession(session);
  const q=query(collection(rt.db,"coachingActions"),where("studentUid","==",rt.user.uid));
  rt.stops.push(onSnapshot(q,snap=>snap.docChanges().forEach(change=>queueAction(change,session)),error=>console.error("Koç action",error)));
  watchErrorPhotos(session);
  const changed=()=>scheduleShare(120);window.addEventListener("yks:data-changed",changed);rt.stops.push(()=>window.removeEventListener("yks:data-changed",changed));
  const wake=()=>{if(session!==rt.session)return;if(document.visibilityState&&document.visibilityState!=="visible")return;scheduleShare(60)};
  window.addEventListener("online",wake);rt.stops.push(()=>window.removeEventListener("online",wake));
  document.addEventListener?.("visibilitychange",wake);rt.stops.push(()=>document.removeEventListener?.("visibilitychange",wake));
  rt.shareInterval=setInterval(()=>scheduleShare(120),60000);
  const ready=await waitForState(4000,session);requireSession(session);if(ready)scheduleShare(60);
}

async function onSignedIn({user,auth,db}){
  cleanup();const session=rt.session;rt.user=user;rt.auth=auth;rt.db=db;
  if(!user?.emailVerified){
    // E-posta/şifre kaydı doğrulama bağlantısını bekler; karşılama ekranı bağlantıyı gönderip oturumu kapatır.
    if(list(user?.providerData).some(p=>p?.providerId==="password"))return{role:"reauth",profile:null};
    throw new Error("Doğrulanmış Google hesabı gerekli");
  }
  let profile,profileError;
  try{profile=await ensureProfile(user,db)}catch(error){profileError=error}
  requireSession(session);
  if(profileError)throw profileError;
  rt.profile=profile;
  try{localStorage.setItem(ROLE_HINT,profile.role);sessionStorage.removeItem(PENDING_ROLE)}catch{}
  document.documentElement.dataset.accountRole=profile.role;
  if(profile.role==="student")await startStudent(session);
  requireSession(session);
  return{role:profile.role,profile};
}
function onSignedOut(){cleanup();rt.user=rt.auth=rt.db=rt.profile=null;delete document.documentElement.dataset.accountRole}

let resolveAccountReady;try{window.__YKS_ACCOUNT_READY__=new Promise(resolve=>{resolveAccountReady=resolve})}catch{}
window.YKSAccountAuth={version:"1.2.32",beforeSignIn,onSignedIn,onSignedOut,publishShare};
try{resolveAccountReady?.(window.YKSAccountAuth)}catch{}
document.documentElement.dataset.studentCoachingBridge="ready";
window.dispatchEvent(new CustomEvent("yks:student-coaching-ready",{detail:{version:"1.2.32"}}));
