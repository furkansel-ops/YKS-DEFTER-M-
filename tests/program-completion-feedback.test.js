const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const app=fs.readFileSync(path.resolve(__dirname,"../app.js"),"utf8");
const plain=value=>JSON.parse(JSON.stringify(value));
const weekKey="2026-09-28",today=3;

function harness(){
  class Clock extends Date{constructor(...args){super(...(args.length?args:["2026-10-01T12:00:00"]));}}
  const state={rows:{r:1,s:2},rowLabels:{r:["Rutin"],s:["Matematik","Türkçe"]},weeks:{},focus:{autoNext:false}};
  const week={r:[Array(7).fill("")],s:[Array(7).fill(""),Array(7).fill("")],dn:{},done:Array(7).fill(false),mv:{}};
  week.s[0][today]="Matematik · Problemler";week.s[1][today]="Türkçe · Paragraf";state.weeks[weekKey]=week;
  const events=[],calls=[],persisted=[];
  const noop=()=>{};
  const context=vm.createContext({Date:Clock,S:state,window:{dispatchEvent:event=>{
    events.push({type:event.type,detail:plain(event.detail),persisted:plain(persisted.at(-1))});
  }},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},
    save:()=>{calls.push("save");persisted.push(plain(state));return true;},perfInvalidateState:()=>calls.push("invalidate"),
    el:()=>({classList:{contains:()=>true}}),renderPlan:()=>calls.push("renderPlan"),renderTodayPlan:()=>calls.push("renderTodayPlan"),renderGun:()=>calls.push("renderGun"),
    SUBJ_NAMES:["Matematik","Türkçe"],ALL_SUBJECTS:[{name:"Matematik",topics:["Problemler"]},{name:"Türkçe",topics:["Paragraf"]}],
    gunIdx:0,toast:message=>calls.push(message),pomoTask:"s-0-3",pomoIsWork:true,pomoTimer:1,pomoState:"running",
    creditMinutes:noop,recordSession:noop,clearInterval:noop,stopNoise:noop,releaseWake:noop,beep:noop,
    navigator:{},isLongBreakNext:()=>false,pomoPhaseMin:()=>25,renderPomo:noop,renderTimeDist:noop,checkBadges:noop
  });
  for(const name of ["keyOf","parseKey","addDaysKey","dowOf","mondayOf"]){
    const match=app.match(new RegExp(`^function ${name}\\([^\\n]+$`,"m"));assert.ok(match,name);vm.runInContext(match[0],context);
  }
  for(const name of ["blankWeek","normWeek","getWeek","programDayStats","programTaskCompleted","programSetCellDone","toggleCellDone","gunTasks","gunToggle","gunDoneNext","v25PlanToday","v25TaskMeta","finishPhase"]){
    const match=app.match(new RegExp(`function ${name}\\([^\\n]*\\)\\{[\\s\\S]*?\\r?\\n}`));assert.ok(match,name);vm.runInContext(match[0],context);
  }
  const next=app.match(/^function v25DoneNext\([^\n]+$/m);assert.ok(next);vm.runInContext(next[0],context);
  return {context,state,week,events,calls,persisted};
}

test("plan completion emits once after persistence with the real subject, topic and daily progress",()=>{
  const h=harness();assert.equal(h.context.toggleCellDone(weekKey,"s-0-3"),true);
  assert.equal(h.events.length,1);assert.equal(h.events[0].type,"yks:task-completed");
  assert.deepEqual(h.events[0].detail,{taskId:"2026-09-28:s-0-3",week:weekKey,cellId:"s-0-3",subject:"Matematik",topic:"Problemler",completedCount:1,totalCount:2});
  assert.equal(h.events[0].persisted.weeks[weekKey].dn["s-0-3"],1);
  assert.equal(h.context.programSetCellDone(weekKey,"s-0-3",true),true);assert.equal(h.events.length,1);assert.equal(h.persisted.length,1);
  assert.equal(h.context.toggleCellDone(weekKey,"s-0-3"),true);assert.equal(h.events.length,1);assert.equal(h.week.dn["s-0-3"],undefined);
  assert.equal(h.context.toggleCellDone(weekKey,"s-0-3"),true);assert.equal(h.events.length,2);
});

test("different tasks and weeks keep separate identities and use each day's actual completion count",()=>{
  const h=harness();h.context.toggleCellDone(weekKey,"s-0-3");h.context.toggleCellDone(weekKey,"s-1-3");
  assert.equal(h.events[1].detail.completedCount,2);assert.equal(h.events[1].detail.totalCount,2);assert.equal(h.events[1].detail.subject,"Türkçe");assert.equal(h.events[1].detail.topic,"Paragraf");
  const other="2026-10-05";h.state.weeks[other]=plain(h.week);h.state.weeks[other].dn={};
  assert.equal(h.context.programSetCellDone(other,"s-0-3",true),true);
  assert.notEqual(h.events[0].detail.taskId,h.events[2].detail.taskId);assert.equal(h.events[2].detail.completedCount,1);
});

test("false, missing and throwing saves roll back completion and never celebrate",()=>{
  for(const save of [()=>false,()=>undefined,()=>{throw new Error("Storage full");}]){
    const h=harness(),before=plain(h.state);h.context.save=save;
    assert.equal(h.context.toggleCellDone(weekKey,"s-0-3"),false);assert.deepEqual(plain(h.state),before);assert.equal(h.events.length,0);
    h.week.dn["s-0-3"]=7;
    assert.equal(h.context.toggleCellDone(weekKey,"s-0-3"),false);assert.equal(h.week.dn["s-0-3"],7);assert.equal(h.events.length,0);
    assert.equal(h.calls.includes("renderPlan"),false);assert.ok(h.calls.includes("invalidate"));
  }
});

test("invalid or empty cells cannot create completion records or feedback",()=>{
  const h=harness(),before=plain(h.state);
  for(const [week,id] of [[weekKey,"s-0-2"],[weekKey,"s-0-7"],[weekKey,"s-20-3"],[weekKey,"x-0-3"],[weekKey,"__proto__"],[weekKey,null],["2026-10-05","s-0-3"]]){
    assert.equal(h.context.programSetCellDone(week,id,true),false);
  }
  assert.deepEqual(plain(h.state),before);assert.deepEqual(h.events,[]);assert.equal(h.persisted.length,0);
});

test("tablet Gün actions share the committed hook and next actions never repeat a completed task's celebration",()=>{
  const h=harness();assert.equal(h.context.gunToggle(),true);assert.equal(h.events.length,1);
  h.context.gunDoneNext();assert.equal(h.events.length,1);assert.equal(h.context.gunIdx,1);
  h.context.gunDoneNext();assert.equal(h.events.length,2);assert.equal(h.events[1].detail.completedCount,2);
  h.context.gunDoneNext();assert.equal(h.events.length,2);
  assert.equal(h.context.gunToggle(),false);assert.equal(h.events.length,2);assert.equal(h.week.dn["s-1-3"],undefined);
});

test("tablet and Bugün next actions do not advance or announce success after a failed save",()=>{
  const h=harness();h.context.save=()=>false;
  assert.equal(h.context.gunDoneNext(),false);assert.equal(h.context.gunIdx,0);assert.equal(h.context.gunToggle(),false);
  assert.equal(h.context.v25DoneNext(),false);assert.deepEqual(plain(h.week.dn),{});assert.deepEqual(h.events,[]);
  h.context.save=()=>{h.persisted.push(plain(h.state));return true;};assert.equal(h.context.v25DoneNext(),true);assert.equal(h.events.length,1);
});

test("finishing a linked Pomodoro task celebrates only its first successfully saved completion",()=>{
  const h=harness();h.context.finishPhase();assert.equal(h.events.length,1);assert.equal(h.week.dn["s-0-3"],1);
  h.context.pomoIsWork=true;h.context.finishPhase();assert.equal(h.events.length,1);
  const failed=harness();failed.context.save=()=>false;failed.context.finishPhase();assert.equal(failed.events.length,0);assert.deepEqual(plain(failed.week.dn),{});
  const removed=harness();removed.week.s[0][today]="";removed.context.finishPhase();assert.equal(removed.events.length,0);assert.deepEqual(plain(removed.week.dn),{});
});

test("reading, rendering, restoring and reopening saved completion do not dispatch task feedback",()=>{
  const h=harness();h.week.dn["s-0-3"]=1;const restored=plain(h.state);
  h.context.v25PlanToday();h.context.gunTasks();h.context.renderPlan();h.context.renderTodayPlan();
  h.state.weeks[weekKey]=plain(restored.weeks[weekKey]);h.context.programSetCellDone(weekKey,"s-0-3",true);
  assert.equal(h.events.length,0);assert.equal(h.persisted.length,0);assert.deepEqual(plain(h.state),restored);
});
