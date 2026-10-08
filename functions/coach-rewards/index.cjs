"use strict";
const {onDocumentUpdated}=require("firebase-functions/v2/firestore");
const {initializeApp}=require("firebase-admin/app");
const {getFirestore,FieldValue}=require("firebase-admin/firestore");
const {rewardFromTransition}=require("./reward-policy.cjs");
initializeApp();
const firestore=getFirestore();

/**
 * Server-issued receipts are immutable and use the exact rewarded challenge ID.
 * Duplicate/retried Firestore events cannot pay twice: transaction.create().
 * The service account must have document create permission; Firestore Rules
 * deliberately deny client writes to this collection.
 *
 * Warning: client's recorded focus/question totals are not cryptographic proof
 * of studying. Do not treat "verified receipt" as proof of genuine study effort.
 */
exports.issueCoachChallengeXp=onDocumentUpdated({
  document:"coachChallenges/{challengeId}",
  region:"europe-west1",
  retry:true
},async(event)=>{
  const before=event.data?.before?.data(),after=event.data?.after?.data();
  const claim=rewardFromTransition(before,after,event.params.challengeId);
  if(!claim)return;
  const source=firestore.doc("coachChallenges/"+event.params.challengeId);
  const receipt=firestore.doc("coachXpReceipts/"+event.params.challengeId);
  await firestore.runTransaction(async(tx)=>{
    const [oldReceipt,current]=await Promise.all([tx.get(receipt),tx.get(source)]);
    if(oldReceipt.exists)return;
    const latest=current.data();
    // A cancelled or changed source cannot trigger a reward.
    if(!latest||latest.studentUid!==claim.studentUid||
       latest.coachUid!==claim.coachUid||
       latest.weekStart!==claim.weekStart||latest.slot!==claim.slot||
       latest.xp!==claim.xp||
       latest.status!==(claim.kind==="manual"?"approved":"completed"))return;
    tx.create(receipt,{...claim,createdAt:FieldValue.serverTimestamp()});
  });
});
