/** Pure coach-XP receipt validation, shared by student UI and Node tests.
 * Firestore cache is NOT authoritative: only reconcile from a server snapshot.
 */
export const REWARD_XP=Object.freeze({easy:20,normal:35,hard:50});
export function canonicalCoachRewards(entries,studentUid,activatedAt){
  if(typeof studentUid!=="string"||!studentUid||
    !Number.isSafeInteger(activatedAt)||activatedAt<=0)return{};
  const rewards={};
  for(const [id,receipt] of entries){
    if(typeof id!=="string"||!receipt||typeof receipt!=="object"||
      receipt.studentUid!==studentUid||!["0","1","2"].includes(receipt.slot)||
      receipt.xp!==REWARD_XP[receipt.difficulty]||
      !/^\d{4}-\d{2}-\d{2}$/.test(receipt.weekStart)||
      id!==studentUid+"_"+receipt.weekStart+"_"+receipt.slot)continue;
    const at=receipt.createdAt?.toMillis?.(),assignedAt=receipt.assignedAt?.toMillis?.();
    if(!Number.isSafeInteger(at)||!Number.isSafeInteger(assignedAt)||
      at<activatedAt||assignedAt<activatedAt||at<assignedAt)continue;
    rewards[id]={at,xp:receipt.xp};
  }
  return rewards;
}
export function rewardsDiffer(a,b){
  const entries=o=>Object.entries(o&&typeof o==="object"?o:{}).sort(([x],[y])=>x.localeCompare(y));
  return JSON.stringify(entries(a))!==JSON.stringify(entries(b));
}
export function canUseReceiptSnapshot(snapshot){
  // A cache snapshot may omit real server receipts. Do not erase XP until
  // Firestore confirms this is a current server snapshot.
  return Boolean(snapshot?.metadata&&snapshot.metadata.fromCache===false&&
    snapshot.metadata.hasPendingWrites===false);
}
