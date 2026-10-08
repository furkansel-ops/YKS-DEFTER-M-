"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {spawnSync}=require("node:child_process");
const fs=require("node:fs"),path=require("node:path");
const {rewardFromTransition,XP}=require("../functions/coach-rewards/reward-policy.cjs");
const clean={studentUid:"studentOne",coachUid:"coachOne",weekStart:"2026-10-05",slot:"0",
  kind:"both",status:"completed",difficulty:"normal",xp:35,
  goalMinutes:60,goalQuestions:40,minutesDone:60,questionsDone:40};
test("only unique student-week slots receive a server XP receipt",()=>{
  assert.deepEqual(rewardFromTransition({status:"in_progress"},clean,"studentOne_2026-10-05_0"),
    {studentUid:"studentOne",coachUid:"coachOne",weekStart:"2026-10-05",slot:"0",
      challengeId:"studentOne_2026-10-05_0",kind:"both",difficulty:"normal",xp:35});
  assert.equal(rewardFromTransition({status:"completed"},clean,"studentOne_2026-10-05_0"),null);
  assert.equal(rewardFromTransition({status:"assigned"},clean,"studentOne_coachOne_2026-10-05_0"),null);
  assert.equal(rewardFromTransition({status:"assigned"},{...clean,slot:"free-12345678",xp:0},
    "studentOne_coachOne_2026-10-05_free-12345678"),null);
  assert.equal(rewardFromTransition({status:"assigned"},{...clean,slot:"3"},
    "studentOne_2026-10-05_3"),null);
  assert.equal(rewardFromTransition({status:"assigned"},{...clean,xp:600},
    "studentOne_2026-10-05_0"),null);
  assert.equal(rewardFromTransition({status:"assigned"},{...clean,minutesDone:59},
    "studentOne_2026-10-05_0"),null);
  assert.equal(XP.hard,50);
});
test("manual coach approval issues one receipt, not submission or cancellation",()=>{
  const manual={...clean,kind:"manual",goalMinutes:0,goalQuestions:0,
    minutesDone:0,questionsDone:0,status:"approved",approvedAt:{seconds:123}};
  assert.equal(rewardFromTransition({status:"submitted"},manual,"studentOne_2026-10-05_0").xp,35);
  assert.equal(rewardFromTransition({status:"assigned"},manual,"studentOne_2026-10-05_0"),null);
  assert.equal(rewardFromTransition({status:"submitted"},{...manual,status:"cancelled"},
    "studentOne_2026-10-05_0"),null);
});
test("rules keep old program sync and deny client-side receipt writes",()=>{
  const rules=fs.readFileSync(path.resolve(__dirname,"../firestore.rules"),"utf8");
  assert.equal((rules.match(/match \/coachChallenges\/\{challengeId\}/g)||[]).length,1);
  assert.equal((rules.match(/match \/coachingActions\/\{actionId\}/g)||[]).length,1);
  assert.equal((rules.match(/match \/coachXpReceipts\/\{receiptId\}/g)||[]).length,1);
  assert.match(rules,/allow create, update, delete: if false;/);
  assert.match(rules,/data\.studentUid \+ '_' \+ data\.weekStart \+ '_' \+ data\.slot/);
  assert.ok(rules.endsWith("\n  }\n}\n"),"Rules must end in a single, intact database block");
  const stat=spawnSync(process.execPath,["--check","functions/coach-rewards/index.cjs"],{
    cwd:path.resolve(__dirname,".."),encoding:"utf8",timeout:10000
  });
  assert.equal(stat.status,0,stat.stderr);
  const client=fs.readFileSync(path.resolve(__dirname,"../public/coach-challenges-student.js"),"utf8");
  assert.match(client,/coachXpReceipts/);
  assert.doesNotMatch(client,/syncReward\(id,task\)/);
});
