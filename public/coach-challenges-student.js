import{collection,query,where,onSnapshot,updateDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import{canonicalCoachRewards,rewardsDiffer,canUseReceiptSnapshot}from"./coach-receipt-ledger.mjs";

/** Firebase bağlantısına bağlı öğrenci özel görevleri.
 * Telefon bildirimi değil: uygulama açıkken gelen, yerel kaydedilmiş bildirim merkezi.
 */
const rootId="studentCoachChallenges",str=(x,n=100)=>String(x??"").trim().slice(0,n);
const dateKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const finite=(v,max)=>Number.isFinite(Number(v))?Math.min(max,Math.max(0,Math.floor(Number(v)))):0;
const state=()=>{try{return window.S||window.YKSLegacyState?.readState?.()||null}catch{return window.S||null}};
const save=()=>{
  try{
    if(typeof window.YKSLegacyState?.save==="function")
      return window.YKSLegacyState.save()!==false;
    if(typeof window.save==="function")return window.save()!==false;
    return false; // No persistence API must never be interpreted as a successful save.
  }catch{return false;}
};
const day=(s)=>{const d=new Date(s+"T12:00:00");return /^\d{4}-\d{2}-\d{2}$/.test(s)&&dateKey(d)===s;};
const el=(tag,cls="",label="")=>{const x=document.createElement(tag);if(cls)x.className=cls;x.textContent=label;return x;};
let items=[],uid="",stopEvents=[],timer=null,busy=new Set(),trustedReceipts=null;
let sessionGeneration=0,receiptsVerified=false;
const visibleToast=(text)=>{
  const hour=new Date().getHours();
  if(hour>=8&&hour<22)try{window.toast?.(text)}catch{}
};
function syncNotice(id,task,status){
  const s=state(),profile=s?.gamification;
  if(!profile||!profile.activatedAt)return;
  profile.coachSeen??={};
  if(profile.coachSeen[id]===status)return;
  const before=profile.coachSeen[id];
  profile.coachSeen[id]=status;
  profile.coachNotifications??=[];
  const label=status==="assigned"?"Koçundan yeni görev":
    status==="approved"?"Özel ödev onaylandı":
    status==="completed"?"Koç görevi tamamlandı":
    status==="submitted"?"Görev onaya gönderildi":
    status==="cancelled"?"Koç görevi iptal edildi":"Görev ilerliyor";
  if(status!=="in_progress"){
    profile.coachNotifications.unshift({id:id+":"+status,at:Date.now(),title:label,
      text:str(task.title,120),status});
    profile.coachNotifications=profile.coachNotifications.slice(0,100);
  }
  if(!save()){
    if(before===undefined)delete profile.coachSeen[id];else profile.coachSeen[id]=before;
    profile.coachNotifications=profile.coachNotifications.filter(x=>x.id!==id+":"+status);
    return;
  }
  if(status==="assigned"||status==="approved"||status==="completed")visibleToast("🎯 "+label+": "+str(task.title,70));
}
// XP is never issued from a user-editable challenge progress/status document.
// Only read-only, server-created coachXpReceipts can supply coach reward points.
function refreshTrustedReceipts(){
  // Offline snapshots must never revoke earned XP. Reconcile only after the
  // server confirms the full receipts query for this authenticated account.
  if(!receiptsVerified||!trustedReceipts||!uid)return;
  const profile=state()?.gamification;
  if(!profile||!Number.isSafeInteger(profile.activatedAt))return;
  const canonical=canonicalCoachRewards(trustedReceipts,uid,profile.activatedAt);
  const current=profile.coachRewards??{};
  if(!rewardsDiffer(current,canonical))return;
  profile.coachRewards=canonical;
  if(!save())profile.coachRewards=current;
}
function recorded(task){
  const s=state();let minutes=0,questions=0;
  const today=dateKey(new Date()),last=task.dueDay<today?task.dueDay:today;
  if(!day(task.startDay)||!day(task.dueDay))return {minutes:0,questions:0};
  const name=str(task.subject,100),exact=name.includes("|");
  for(let key=task.startDay;key<=last;){
    if(!name){
      minutes+=finite(s?.pomoMin?.[key],1440);
      questions+=finite(s?.solved?.[key],5000);
    }else{
      minutes+=finite(s?.pomoSubj?.[key]?.[name],1440);
      const lines=s?.solvedTopic?.[key]??{};
      for(const [topic,value] of Object.entries(lines)){
        if(exact?topic.startsWith(name+"|"):
          topic.split("|")[1]===name||topic.startsWith(name+"|"))
          questions+=finite(value,5000);
      }
    }
    const d=new Date(key+"T12:00:00");d.setDate(d.getDate()+1);key=dateKey(d);
  }
  return {minutes,questions};
}
async function updateProgress(task){
  if(!uid||task.studentUid!==uid||!["assigned","in_progress"].includes(task.status)||
    task.kind==="manual"||busy.has(task.id)||!day(task.startDay)||
    dateKey(new Date())<task.startDay)return;
  const data=recorded(task);
  const minutesDone=Math.max(finite(task.minutesDone,24000),Math.min(24000,data.minutes));
  const questionsDone=Math.max(finite(task.questionsDone,100000),Math.min(100000,data.questions));
  const complete=minutesDone>=task.goalMinutes&&questionsDone>=task.goalQuestions;
  const status=complete?"completed":"in_progress";
  if(!complete&&minutesDone===task.minutesDone&&questionsDone===task.questionsDone)return;
  busy.add(task.id);
  try{
    await updateDoc(task.ref,{minutesDone,questionsDone,status,updatedAt:serverTimestamp()});
  }catch(error){console.warn("Koç görev ilerlemesi saklanamadı",error);}
  finally{busy.delete(task.id);}
}
function render(){
  let root=document.getElementById(rootId);
  if(!root){
    const anchor=document.getElementById("studyInsightsPanel")??document.getElementById("studyTasksPanel")??
      document.getElementById("studyGamification")??document.querySelector("#home .home-overview");
    if(!anchor)return;
    root=el("section","scc-panel");root.id=rootId;root.setAttribute("aria-label","Koç görevleri ve bildirimler");
    anchor.insertAdjacentElement("afterend",root);
    const style=document.createElement("link");style.rel="stylesheet";
    style.href=new URL("./coach-challenges-student.css",import.meta.url).href;
    document.head.appendChild(style);
  }
  root.replaceChildren();
  root.append(el("h2","","👨‍🏫 Koç Görevlerim"));
  const profile=state()?.gamification,notifications=profile?.coachNotifications??[];
  const list=el("div","scc-list");
  const tasks=items.filter(x=>x.studentUid===uid).sort((a,b)=>String(b.startDay).localeCompare(String(a.startDay)));
  if(!tasks.length)list.append(el("p","scc-empty","Koçun görev gönderdiğinde burada görünecek."));
  for(const task of tasks.slice(0,35)){
    const card=el("article","scc-item");
    const head=el("div","scc-item-head");
    const recordedReward=Boolean(profile?.coachRewards?.[task.id]);
    const rewardLabel=!task.xp?"Ödülsüz":
      recordedReward?(receiptsVerified?"✓ +":"Önbellek: +")+task.xp+" XP":
      "🎁 "+task.xp+" XP hedefi";
    head.append(el("strong","",str(task.title,120)),el("b","",rewardLabel));
    card.append(head,el("p","",str(task.subject,100)||"Genel çalışma"));
    const label={assigned:"Atandı",in_progress:"İlerliyor",submitted:"Koç onayı bekleniyor",
      completed:"Tamamlandı",approved:"Onaylandı",cancelled:"İptal edildi"}[task.status]||"Bekliyor";
    card.append(el("small","",task.startDay+" – "+task.dueDay+" · "+label));
    if(task.kind!=="manual")
      card.append(el("p","",[
        task.goalMinutes?task.minutesDone+" / "+task.goalMinutes+" dakika":"",
        task.goalQuestions?task.questionsDone+" / "+task.goalQuestions+" soru":""
      ].filter(Boolean).join(" · ")));
    if(task.kind==="manual"&&task.status==="assigned"&&dateKey(new Date())>=task.startDay){
      const button=el("button","scc-submit","Tamamladım · Koça gönder");
      button.type="button";button.addEventListener("click",async()=>{
        if(busy.has(task.id))return;busy.add(task.id);button.disabled=true;
        try{await updateDoc(task.ref,{status:"submitted",submittedAt:serverTimestamp(),updatedAt:serverTimestamp()});}
        catch(error){visibleToast("Görev gönderilemedi: "+str(error?.message,80));button.disabled=false;}
        finally{busy.delete(task.id);}
      });card.appendChild(button);
    }
    list.append(card);
  }
  root.appendChild(list);
  const history=el("details","scc-notifications"),summary=el("summary","","🔔 Koç bildirimleri ("+notifications.length+")");
  history.appendChild(summary);
  for(const item of notifications.slice(0,20))
    history.append(el("p","",str(item.title,80)+" · "+str(item.text,140)));
  root.append(history);
  root.append(el("p","scc-note","Uygulama içi bildirimler kaydedilir. Uygulama tamamen kapalıyken telefon bildirimi için Web Push ayrıca gereklidir."));
}
function schedule(){
  if(timer)return;timer=setTimeout(()=>{
    timer=null;render();for(const task of items)void updateProgress(task);
  },450);
}
export function installCoachStudentChallenges({db,user}){
  if(!db||!user?.uid)return()=>{};
  const generation=++sessionGeneration;
  uid=user.uid;
  items=[];busy.clear();
  receiptsVerified=false;trustedReceipts=null;
  const q=query(collection(db,"coachChallenges"),where("studentUid","==",uid));
  const stop=onSnapshot(q,snapshot=>{
    if(generation!==sessionGeneration)return;
    items=snapshot.docs.map(row=>({id:row.id,ref:row.ref,...row.data()}));
    for(const item of items)syncNotice(item.id,item,item.status);
    schedule();
  },error=>{
    if(generation===sessionGeneration)console.warn("Koç görevleri henüz okunamıyor",error);
  });
  const stopReceipts=onSnapshot(query(collection(db,"coachXpReceipts"),
    where("studentUid","==",uid)),{includeMetadataChanges:true},snapshot=>{
      if(generation!==sessionGeneration)return;
      if(!canUseReceiptSnapshot(snapshot)){
        // Keep locally stored confirmed rewards until the live server catches up.
        schedule();return;
      }
      trustedReceipts=new Map(snapshot.docs.map(row=>[row.id,row.data()]));
      receiptsVerified=true;
      refreshTrustedReceipts();schedule();
  },error=>{
    if(generation===sessionGeneration)console.warn("Koç XP makbuzları okunamadı",error);
  });
  const changed=()=>{
    if(generation!==sessionGeneration)return;
    refreshTrustedReceipts();schedule();
  };
  window.addEventListener("yks:data-changed",changed);
  window.addEventListener("pageshow",changed);
  window.addEventListener("online",changed);
  document.addEventListener("visibilitychange",changed);
  const stops=[()=>window.removeEventListener("yks:data-changed",changed),
    ()=>window.removeEventListener("pageshow",changed),
    ()=>window.removeEventListener("online",changed),
    ()=>document.removeEventListener("visibilitychange",changed)];
  stopEvents=stops;
  schedule();
  return()=>{
    stop();stopReceipts();for(const fn of stops)fn();
    if(generation!==sessionGeneration)return;
    sessionGeneration++;
    stopEvents=[];
    receiptsVerified=false;trustedReceipts=null;
    uid="";items=[];busy.clear();
    if(timer){clearTimeout(timer);timer=null;}
    document.getElementById(rootId)?.remove();
  };
}
