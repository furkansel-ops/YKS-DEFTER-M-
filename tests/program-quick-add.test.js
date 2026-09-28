const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const app=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
const plain=value=>JSON.parse(JSON.stringify(value));

function harness({saveResult=true,saveThrows=false,active=true}={}){
  const calls=[],persisted=[];
  const state={rows:{r:1,s:2},rowLabels:{r:["Rutin"],s:["Ders 1","Ders 2"]},weeks:{},solved:{"2026-09-25":30}};
  class Clock extends Date{constructor(...args){super(...(args.length?args:["2026-09-25T12:00:00"]));}}
  const context=vm.createContext({Date:Clock,S:state,
    save:()=>{calls.push("save");if(saveThrows)throw new Error("Storage blocked");if(saveResult===true)persisted.push(plain(state));return saveResult;},
    perfInvalidateState:()=>calls.push("invalidate"),renderTodayPlan:()=>calls.push("today"),renderSuggest:()=>calls.push("suggest"),renderPlan:()=>calls.push("plan"),
    el:()=>({classList:{contains:()=>active}}),toast:message=>calls.push(["toast",message])});
  for(const name of ["keyOf","parseKey","addDaysKey","dowOf","mondayOf","clone"]){
    const definition=app.match(new RegExp(`^function ${name}\\([^\\n]+$`,"m"));assert.ok(definition,name);vm.runInContext(definition[0],context);
  }
  for(const name of ["blankWeek","normWeek","addToDays"]){
    const definition=app.match(new RegExp(`function ${name}\\([^\\n]*\\)\\{[\\s\\S]*?\\r?\\n}`));assert.ok(definition,name);vm.runInContext(definition[0],context);
  }
  return {state,calls,persisted,context,add:context.addToDays,week:()=>context.blankWeek()};
}

test("quick add writes all selected future or past weekdays once without touching other data",()=>{
  for(const [offset,key] of [[1,"2026-09-28"],[-1,"2026-09-14"]]){
    const h=harness(),other=h.state.weeks["2026-09-21"]=h.week();other.s[0][0]="Existing task";
    const before=plain(h.state);
    assert.deepEqual(plain(h.add("  TYT Matematik · Problemler · 30 soru · 45 dk  ",[0,3,6],offset)),{ok:true,days:[0,3,6]});
    for(const day of [0,3,6])assert.equal(h.state.weeks[key].s[0][day],"TYT Matematik · Problemler · 30 soru · 45 dk");
    assert.deepEqual(plain(other),before.weeks["2026-09-21"]);assert.deepEqual(h.state.solved,before.solved);assert.deepEqual(h.state.rows,before.rows);assert.deepEqual(h.state.rowLabels,before.rowLabels);
    assert.equal(h.calls.filter(x=>x==="save").length,1);assert.equal(h.persisted.length,1);assert.deepEqual(h.persisted[0],plain(h.state));
    assert.deepEqual(h.calls.filter(x=>typeof x==="string"),["save","today","suggest","plan"]);assert.equal(h.calls.filter(x=>Array.isArray(x)&&x[0]==="toast").length,1);
  }
});

test("duplicate selected days consume one slot per day and leave existing tasks in place",()=>{
  const h=harness(),w=h.state.weeks["2026-09-21"]=h.week();w.s[0][1]="Keep me";
  assert.deepEqual(plain(h.add("Kimya",[1,1,4,1,4],0)),{ok:true,days:[1,4]});
  assert.equal(h.state.weeks["2026-09-21"].s[0][1],"Keep me");assert.equal(h.state.weeks["2026-09-21"].s[1][1],"Kimya");assert.equal(h.state.weeks["2026-09-21"].s[0][4],"Kimya");assert.equal(h.state.weeks["2026-09-21"].s[1][4],"");
});

test("one full selected day rejects the whole batch and a retry cannot duplicate earlier days",()=>{
  const h=harness(),w=h.state.weeks["2026-09-21"]=h.week();w.s[0][6]="A";w.s[1][6]="B";const before=JSON.stringify(h.state);
  assert.deepEqual(plain(h.add("Kimya",[0,6],0)),{ok:false,reason:"full"});assert.equal(JSON.stringify(h.state),before);assert.equal(h.state.weeks["2026-09-21"],w);assert.deepEqual(h.calls,[]);
  w.s[1][6]="";assert.equal(h.add("Kimya",[0,6],0).ok,true);
  assert.equal(h.state.weeks["2026-09-21"].s.flat().filter(x=>x==="Kimya").length,2);assert.equal(h.calls.filter(x=>x==="save").length,1);
});

test("new work resets only its cell metadata and the selected day's completion",()=>{
  const h=harness(),w=h.state.weeks["2026-09-21"]=h.week();w.s[0][2]="Old work";w.dn={"s-0-2":1,"s-1-2":1,"r-0-4":1};w.mv={"s-0-2":{from:"2026-09-23"},"s-1-2":{from:"2026-09-21"},"r-0-4":{from:"2026-09-24"}};w.done[2]=true;w.done[4]=true;const before=plain(w);
  assert.equal(h.add("New work",[2],0).ok,true);const current=h.state.weeks["2026-09-21"];
  assert.deepEqual(plain(current.dn),{"s-0-2":1,"r-0-4":1});assert.deepEqual(plain(current.mv),{"s-0-2":{from:"2026-09-23"},"r-0-4":{from:"2026-09-24"}});assert.equal(current.done[2],false);assert.equal(current.done[4],true);assert.deepEqual(plain(w),before,"The original reference was never mutated");
});

test("save failure or exception restores the original week reference and emits no success",()=>{
  for(const options of [{saveResult:false},{saveResult:undefined},{saveThrows:true}]){
    const h=harness(options);if(Object.hasOwn(options,"saveResult")&&options.saveResult===undefined)h.context.save=()=>{h.calls.push("save");return undefined;};
    const w=h.state.weeks["2026-09-21"]=h.week();w.s[0][1]="Existing";const before=JSON.stringify(h.state);
    assert.deepEqual(plain(h.add("New",[0,1,6],0)),{ok:false,reason:"save"});assert.equal(h.state.weeks["2026-09-21"],w);assert.equal(JSON.stringify(h.state),before);assert.deepEqual(h.calls,["save","invalidate"]);assert.deepEqual(h.persisted,[]);
  }
});

test("a failed first save leaves no empty week or partial work behind and can be retried",()=>{
  const h=harness({saveResult:false}),before=JSON.stringify(h.state);
  assert.deepEqual(plain(h.add("New",[0,6],1)),{ok:false,reason:"save"});assert.equal(JSON.stringify(h.state),before);assert.equal(Object.hasOwn(h.state.weeks,"2026-09-28"),false);
  h.context.save=()=>{h.calls.push("save");return true;};assert.equal(h.add("New",[0,6],1).ok,true);assert.equal(h.state.weeks["2026-09-28"].s.flat().filter(x=>x==="New").length,2);
});

test("invalid text, weekdays and week offsets do not create weeks or call save",()=>{
  const h=harness(),before=JSON.stringify(h.state);
  const cases=[[" ",[0],0],[null,[0],0],["x".repeat(601),[0],0],["Good",[],0],["Good",Array(1),0],["Good",[0,7],0],["Good",[-1],0],["Good",[1.5],0],["Good",["1"],0],["Good",null,0],["Good",[0],undefined],["Good",[0],Infinity],["Good",[0],0.5],["Good",[0],521],["Good",[0],-521]];
  for(const args of cases)assert.deepEqual(plain(h.add(...args)),{ok:false,reason:"invalid"});
  assert.equal(JSON.stringify(h.state),before);assert.deepEqual(h.calls,[]);
});

test("inactive program refreshes shared views once without rendering the hidden table",()=>{
  const h=harness({active:false});assert.equal(h.add("x".repeat(600),[0],0).ok,true);assert.deepEqual(h.calls.filter(x=>typeof x==="string"),["save","today","suggest"]);
});

test("optional program goals retain user input while legacy numeric controls still clamp",()=>{
  class Input{
    constructor(value,program=false,type="number"){this.value=value;this.program=program;this.type=type;this.min="1";this.max="1000";this.step="1";}
    hasAttribute(name){return this.program&&name==="data-program-number";}
  }
  const source=app.match(/^function v2InputGuard\([^\n]+$/m);assert.ok(source);
  const guard=vm.runInNewContext(source[0]+"\nv2InputGuard",{HTMLInputElement:Input});
  for(const value of ["","0","1.5","1001","30"]){const target=new Input(value,true);guard({target});assert.equal(target.value,value,"Program goals must be validated without changing what was entered");}
  for(const [value,expected] of [["","1"],["0","1"],["1.5","2"],["1001","1000"],["30","30"]]){const target=new Input(value);guard({target});assert.equal(target.value,expected,"Existing numeric controls retain their clamping behavior");}
  const text=new Input("0",false,"text");guard({target:text});assert.equal(text.value,"0");assert.doesNotThrow(()=>guard({target:{}}));
});
