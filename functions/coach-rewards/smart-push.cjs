"use strict";
const{onDocumentWritten}=require("firebase-functions/v2/firestore");
const{onSchedule}=require("firebase-functions/v2/scheduler");
const{defineSecret}=require("firebase-functions/params");
const{getFirestore}=require("firebase-admin/firestore");
const webPush=require("web-push");
const crypto=require("node:crypto");
const db=getFirestore();
const privateKey=defineSecret("YKS_WEBPUSH_PRIVATE_KEY");
const publicKey=defineSecret("YKS_WEBPUSH_PUBLIC_KEY");
const subject=defineSecret("YKS_WEBPUSH_SUBJECT");
const secrets=[privateKey,publicKey,subject];

function localTime(date,zone){
  try{
    const parts=new Intl.DateTimeFormat("en-US",{
      timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hourCycle:"h23"
    }).formatToParts(date);
    const part=type=>parts.find(x=>x.type===type)?.value;
    return {day:part("year")+"-"+part("month")+"-"+part("day"),hour:Number(part("hour"))};
  }catch{return null;}
}
function quiet(hour,start=22,end=8){
  return start<end?hour>=start&&hour<end:hour>=start||hour<end;
}
function sender(){
  webPush.setVapidDetails(subject.value(),publicKey.value(),privateKey.value());
}
function notification(kind,id){
  const entries={
    "goal-nudge":{title:"🎯 YKS Defterim",body:"Günlük hedeflerini kontrol etmeyi unutma."},
    "streak-risk":{title:"🔥 YKS Defterim",body:"Günün çalışma hedeflerini kontrol et."},
    "coach-assigned":{title:"👨‍🏫 Koç görevi",body:"Koçundan yeni bir görev geldi."},
    "coach-approved":{title:"🏆 Görev onayı",body:"Koç görevinle ilgili yeni bir gelişme var."}
  };
  const entry=entries[kind];if(!entry)return null;
  return JSON.stringify({type:"yks-smart-v1",kind,id,title:entry.title,body:entry.body,path:"./"});
}
/**
 * Delivery receipt reserved before send, preventing duplicate on retried triggers.
 * The payload is intentionally generic to protect lockscreen privacy.
 */
async function sendOnce(ref,device,kind,id,day){
  const when=localTime(new Date(),device.timeZone||"Europe/Istanbul");
  if(!when||quiet(when.hour,device.quietStart,device.quietEnd))return false;
  if(!device.endpoint||!device.auth||!device.p256dh)return false;
  const payload=notification(kind,id);if(!payload)return false;
  const hash=crypto.createHash("sha256").update(ref.path+"|"+kind+"|"+id+"|"+day).digest("hex");
  const log=db.doc("smartPushLogs/"+hash);
  try{await log.create({devicePath:ref.path,kind,day,createdAt:new Date()});}
  catch(error){if(error?.code===6||error?.code==="already-exists")return false;throw error;}
  try{
    sender();
    await webPush.sendNotification({endpoint:device.endpoint,
      keys:{auth:device.auth,p256dh:device.p256dh}},payload,{TTL:3600,urgency:"normal"});
    await log.update({sentAt:new Date()});
    return true;
  }catch(error){
    if(error?.statusCode===404||error?.statusCode===410){
      await ref.delete().catch(()=>{});
      return false;
    }
    // Release reservation after definite delivery failure; caller may retry.
    await log.delete().catch(()=>{});
    console.warn("Web Push send failed",error?.statusCode||error?.message);
    return false;
  }
}
async function sendToStudent(uid,kind,messageId){
  if(!uid||typeof uid!=="string")return;
  const snapshot=await db.collection("users").doc(uid).collection("pushDevices").get();
  const today=new Date().toISOString().slice(0,10);
  for(const device of snapshot.docs){
    await sendOnce(device.ref,device.data(),kind,messageId,today);
  }
}
exports.onCoachChallengePush=onDocumentWritten({
  document:"coachChallenges/{challengeId}",region:"europe-west1",retry:false,secrets
},async event=>{
  const before=event.data?.before?.data(),after=event.data?.after?.data();
  if(!after)return;
  let kind=null;
  if(!before&&after.status==="assigned")kind="coach-assigned";
  else if(before?.status!==after.status&&after.status==="approved")kind="coach-approved";
  if(kind)await sendToStudent(after.studentUid,kind,event.params.challengeId+":"+after.status);
});
exports.sendSmartDailyReminders=onSchedule({
  schedule:"0 * * * *",timeZone:"UTC",region:"europe-west1",retry:false,secrets
},async()=>{
  const today=new Date();
  // Budgeted scan: cap work per execution. For larger deployments use sharding.
  let processed=0;
  const stream=db.collectionGroup("pushDevices").stream();
  for await(const entry of stream){
    if(processed++>=2000)break;
    const d=entry.data();
    const time=localTime(today,d.timeZone);
    if(!time||d.day!==time.day||d.restDay===true)continue;
    if(d.goalMinutes<=d.minutes&&d.goalQuestions<=d.questions)continue;
    if(quiet(time.hour,d.quietStart,d.quietEnd))continue;
    // Avoid false/stale warnings when device hasn't synced recently.
    const recorded=d.updatedAt?.toMillis?.();
    if(!recorded||today.getTime()-recorded>6*3600000)continue;
    const kind=time.hour===18?"goal-nudge":time.hour===20?"streak-risk":null;
    if(!kind)continue;
    await sendOnce(entry.ref,d,kind,time.day,time.day);
  }
});
module.exports._internal={localTime,quiet,notification};
