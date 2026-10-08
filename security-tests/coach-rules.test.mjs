import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import {initializeTestEnvironment,assertFails,assertSucceeds} from "@firebase/rules-unit-testing";
import {doc,setDoc,getDoc,updateDoc,serverTimestamp,collection,query,where,getDocs}
  from "firebase/firestore";

const projectId="demo-coach-security";
const rules=readFileSync(new URL("../firestore.rules",import.meta.url),"utf8");
const env=await initializeTestEnvironment({projectId,firestore:{rules}});
const coach="coachAlpha",other="coachBeta",student="studentOne";
const week="2026-10-05";
const claim=(slot)=>student+"_"+week+"_"+slot;
const data=(slot="0",override={})=>({
  studentUid:student,coachUid:coach,weekStart:week,slot,
  title:"Matematik problemler",subject:"TYT|Matematik",note:"60 dk 40 soru",
  kind:"both",difficulty:"normal",xp:35,goalMinutes:60,goalQuestions:40,
  startDay:"2026-10-09",dueDay:"2026-10-15",status:"assigned",
  minutesDone:0,questionsDone:0,createdAt:serverTimestamp(),
  updatedAt:serverTimestamp(),...override
});
async function seed(){
  await env.withSecurityRulesDisabled(async ctx=>{
    const db=ctx.firestore();
    for(const [uid,role] of [[coach,"coach"],[other,"coach"],[student,"student"]]){
      await setDoc(doc(db,"accountProfiles",uid),{uid,role,displayName:uid,
        createdAt:new Date(),updatedAt:new Date()});
    }
    for(const uid of [coach,other]){
      await setDoc(doc(db,"coachingLinks",student+"_"+uid),
        {studentUid:student,coachUid:uid,active:true,
         createdAt:new Date(),updatedAt:new Date()});
    }
  });
}
const c=env.authenticatedContext(coach,{email_verified:true}).firestore();
const o=env.authenticatedContext(other,{email_verified:true}).firestore();
const s=env.authenticatedContext(student,{email_verified:true}).firestore();
const outsider=env.authenticatedContext("stranger",{email_verified:true}).firestore();
try{
  await seed();
  const path=doc(c,"coachChallenges",claim("0"));
  await assertSucceeds(setDoc(path,data()));
  await assertSucceeds(getDoc(doc(s,"coachChallenges",claim("0"))));
  await assertFails(getDoc(doc(outsider,"coachChallenges",claim("0"))));
  await assertFails(setDoc(doc(s,"coachChallenges",claim("1")),data("1")));
  await assertFails(setDoc(doc(o,"coachChallenges",claim("0")),
    data("0",{coachUid:other,title:"Ödül hilesi"})));
  await assertFails(setDoc(doc(c,"coachChallenges",student+"_"+coach+"_"+week+"_1"),data("1")));
  await assertFails(setDoc(doc(c,"coachChallenges",claim("3")),data("3")));
  await assertFails(setDoc(doc(c,"coachChallenges",claim("1")),data("1",{xp:1000})));
  await assertSucceeds(setDoc(doc(c,"coachChallenges",claim("1")),data("1")));
  await assertSucceeds(setDoc(doc(c,"coachChallenges",claim("2")),data("2")));
  await assertFails(setDoc(doc(o,"coachChallenges",claim("2")),data("2",{coachUid:other})));
  await assertFails(updateDoc(doc(s,"coachChallenges",claim("0")),{xp:999,
    updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(s,"coachChallenges",claim("0")),{
    status:"completed",minutesDone:59,questionsDone:40,updatedAt:serverTimestamp()}));
  await assertSucceeds(updateDoc(doc(s,"coachChallenges",claim("0")),{
    status:"completed",minutesDone:60,questionsDone:40,updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(s,"coachChallenges",claim("0")),{
    minutesDone:120,updatedAt:serverTimestamp()}));
  await assertFails(setDoc(doc(s,"coachXpReceipts",claim("0")),{xp:35,studentUid:student}));
  await assertFails(setDoc(doc(c,"coachXpReceipts",claim("0")),{xp:35,studentUid:student}));
  await assertFails(getDoc(doc(outsider,"coachXpReceipts",claim("0"))));
  // Simulate the trusted Cloud Function receipt write (rules-disabled server context).
  // Verify student and author-coach sync while another coach cannot read the receipt.
  await env.withSecurityRulesDisabled(async ctx=>{
    await setDoc(doc(ctx.firestore(),"coachXpReceipts",claim("0")),{
      studentUid:student,coachUid:coach,weekStart:week,slot:"0",
      challengeId:claim("0"),xp:35,difficulty:"normal",kind:"both",
      assignedAt:new Date(),createdAt:new Date()
    });
  });
  await assertSucceeds(getDoc(doc(s,"coachXpReceipts",claim("0"))));
  await assertSucceeds(getDoc(doc(c,"coachXpReceipts",claim("0"))));
  await assertFails(getDoc(doc(o,"coachXpReceipts",claim("0"))));
  const earned=await assertSucceeds(getDocs(query(collection(s,"coachXpReceipts"),
    where("studentUid","==",student))));
  assert.equal(earned.size,1);
  await assertFails(updateDoc(doc(s,"coachXpReceipts",claim("0")),{xp:300}));
  await assertFails(updateDoc(doc(c,"coachXpReceipts",claim("0")),{xp:300}));
  // The trusted service account writes receipts using Admin SDK, not client SDK.
  const manual="free-12345678";
  const freeId=student+"_"+coach+"_"+week+"_"+manual;
  await assertSucceeds(setDoc(doc(c,"coachChallenges",freeId),
    data(manual,{xp:0,kind:"manual",goalMinutes:0,goalQuestions:0})));
  await assertSucceeds(updateDoc(doc(s,"coachChallenges",freeId),
    {status:"submitted",submittedAt:serverTimestamp(),updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(s,"coachChallenges",freeId),
    {status:"approved",approvedAt:serverTimestamp(),updatedAt:serverTimestamp()}));
  await assertSucceeds(updateDoc(doc(c,"coachChallenges",freeId),
    {status:"approved",approvedAt:serverTimestamp(),updatedAt:serverTimestamp()}));
  await assertFails(updateDoc(doc(c,"coachChallenges",freeId),
    {status:"approved",approvedAt:serverTimestamp(),updatedAt:serverTimestamp()}));
  await assertSucceeds(getDocs(query(collection(s,"coachChallenges"),where("studentUid","==",student))));
  // A coach may query only their own linked tasks, not a stranger's collection.
  await assertFails(getDocs(collection(outsider,"coachChallenges")));
  // Push enrollment belongs only to the authenticated student.
  const pushDevice="ab12cd34ef56gh78";
  const devicePayload={
    deviceId:pushDevice,endpoint:"https://push.example.com/endpoint-"+pushDevice,
    auth:"abcdef1234567890aabbccddeeff",
    p256dh:"abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOP",
    day:"2026-10-08",goalMinutes:60,goalQuestions:40,
    minutes:15,questions:10,restDay:false,quietStart:22,quietEnd:8,
    timeZone:"Europe/Istanbul",createdAt:serverTimestamp(),updatedAt:serverTimestamp()
  };
  const subPath="users/"+student+"/pushDevices/"+pushDevice;
  await assertSucceeds(setDoc(doc(s,subPath),devicePayload));
  await assertSucceeds(getDoc(doc(s,subPath)));
  await assertFails(getDoc(doc(c,subPath)));
  await assertFails(setDoc(doc(c,"users/"+student+"/pushDevices/otherdevice"),
    {...devicePayload,deviceId:"otherdevice"}));
  await assertFails(updateDoc(doc(s,subPath),{endpoint:"http://untrusted",
    updatedAt:serverTimestamp()}));
  await assertSucceeds(updateDoc(doc(s,subPath),{
    minutes:25,questions:20,updatedAt:serverTimestamp()
  }));
  // Public VAPID is safe for verified users to read, but not to mutate.
  await assertSucceeds(getDoc(doc(outsider,"publicConfig","push")));
  await assertFails(setDoc(doc(s,"publicConfig","push"),{vapidPublicKey:"fake"}));
  await assertFails(setDoc(doc(s,"smartPushLogs","fake"),{status:"sent"}));
  console.log("PASS: Firestore emulator — assignment, limits, tampering, approval, receipts, queries");
}catch(err){console.error("FAIL: Firestore emulator challenge security",err);process.exitCode=1;}
finally{await env.cleanup();}
