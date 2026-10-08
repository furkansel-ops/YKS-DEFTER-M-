"use strict";

/** Pure validation shared by server trigger and unit tests. */
const XP={easy:20,normal:35,hard:50};
const SLOT=/^[012]$/;
const DAY=/^\d{4}-\d{2}-\d{2}$/;

function rewardFromTransition(before,after,documentId){
  if(!before||!after||typeof documentId!=="string")return null;
  const {studentUid,coachUid,weekStart,slot,kind,status,difficulty}=after;
  if(typeof studentUid!=="string"||typeof coachUid!=="string"||
    !DAY.test(weekStart)||!SLOT.test(slot)||
    documentId!==studentUid+"_"+weekStart+"_"+slot||
    !Object.prototype.hasOwnProperty.call(XP,difficulty)||after.xp!==XP[difficulty])return null;
  if(before.status===status)return null;
  const measurable=kind==="minutes"||kind==="questions"||kind==="both";
  if(measurable){
    if(!["assigned","in_progress"].includes(before.status)||status!=="completed")return null;
    if(!Number.isInteger(after.minutesDone)||!Number.isInteger(after.questionsDone)||
      after.minutesDone<after.goalMinutes||after.questionsDone<after.goalQuestions)return null;
  }else if(kind==="manual"){
    if(before.status!=="submitted"||status!=="approved"||!after.approvedAt)return null;
  }else return null;
  if(!Number.isInteger(after.goalMinutes)||!Number.isInteger(after.goalQuestions)||
    after.goalMinutes<0||after.goalQuestions<0||after.goalMinutes>480||after.goalQuestions>300)
    return null;
  return {studentUid,coachUid,weekStart,slot,challengeId:documentId,kind,
    difficulty,xp:XP[difficulty]};
}
module.exports={rewardFromTransition,XP};
