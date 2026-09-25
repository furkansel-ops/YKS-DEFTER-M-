const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"src/ui/refined-program.ts"),"utf8");
const runtime=stripTypeScriptTypes(source.replace(/^import "\.\/refined-program\.css";\r?\n/,""),{mode:"strip"}).replace(/^export /gm,"");
const api=vm.runInNewContext(runtime+"\n({refinedProgramTasks,refinedProgramWeekOffset,createRefinedProgramController})",{Date});
const plain=value=>JSON.parse(JSON.stringify(value));
const rows=()=>[Array(7).fill(""),Array(7).fill("")];
function week(){return {r:rows(),s:rows(),dn:{},done:Array(7).fill(false),mv:{}};}
function harness(){
  const fixed=new Date("2026-09-25T12:00:00"),calls=[];
  const state={rows:{r:2,s:2},rowLabels:{r:["Sabah rutini",""],s:["Fen",""]},weeks:{"2026-09-21":week(),"2026-09-28":week()}};
  class Clock extends Date{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed.getTime();}}
  const context=vm.createContext({Date:Clock,S:state,curWeek:new Clock("2026-09-21T12:00:00"),
    save:()=>{calls.push(["save"]);return true;},renderPlan:()=>calls.push(["renderPlan"]),renderTodayPlan:()=>{},renderSuggest:()=>{},toast:message=>calls.push(["toast",message]),el:()=>({classList:{contains:()=>true}})});
  const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
  for(const name of ["keyOf","parseKey","addDaysKey","dowOf","mondayOf","thisWeek"]){
    const definition=app.match(new RegExp(`^function ${name}\\([^\\n]+$`,"m"));assert.ok(definition,name);vm.runInContext(definition[0],context);
  }
  for(const name of ["blankWeek","normWeek","getWeek","toggleCellDone","shiftWeek","addToDay"]){
    const definition=app.match(new RegExp(`function ${name}\\([^\\n]*\\)\\{[\\s\\S]*?\\r?\\n}`));assert.ok(definition,name);vm.runInContext(definition[0],context);
  }
  const controller=api.createRefinedProgramController({readState:()=>state,visibleWeek:()=>context.keyOf(context.curWeek),shiftWeek:context.shiftWeek,thisWeek:context.thisWeek,
    setProgTab:tab=>calls.push(["setProgTab",tab]),toggleCellDone:context.toggleCellDone,addToDay:context.addToDay,
    openPlanCellMenu:(...args)=>calls.push(["menu",...args])},()=>fixed);
  return {state,calls,controller,context};
}

test("daily cards read only real cells, preserve their identity and never mutate a snapshot",()=>{
  const h=harness(),data=h.state.weeks["2026-09-21"];
  data.r[0][4]="  Paragraf · 20 soru  ";data.s[1][4]="AYT Biyoloji\nHücre";data.s[0][5]="Cumartesi çalışması";data.dn["r-0-4"]=1;data.done[4]=true;
  const before=JSON.stringify(h.state),tasks=plain(h.controller.snapshot().tasks);
  assert.deepEqual(tasks,[{id:"r-0-4",block:"r",row:0,day:4,text:"Paragraf · 20 soru",label:"Sabah rutini",done:true},{id:"s-1-4",block:"s",row:1,day:4,text:"AYT Biyoloji\nHücre",label:"Çalışma",done:false}]);
  assert.equal(JSON.stringify(h.state),before);assert.equal(h.controller.snapshot().date,"2026-09-25");
  assert.deepEqual(plain(h.controller.snapshot().days[4]),{label:"Cum",date:"2026-09-25",count:2,done:1});
});

test("day and week selection use the same legacy week hooks and preserve every task",()=>{
  const h=harness();h.state.weeks["2026-09-28"].s[0][1]="Gelecek salı";const before=JSON.stringify(h.state);
  assert.equal(h.controller.moveWeek(1),true);assert.equal(h.controller.selectDay(1),true);assert.equal(h.controller.snapshot().date,"2026-09-29");assert.equal(h.controller.snapshot().tasks[0].text,"Gelecek salı");
  h.controller.setView("week");assert.equal(h.controller.snapshot().view,"week");h.controller.setView("day");assert.equal(h.controller.snapshot().view,"day");
  assert.deepEqual(h.calls.filter(call=>call[0]==="setProgTab"),[["setProgTab","week"],["setProgTab","week"]]);
  h.controller.today();assert.equal(h.controller.snapshot().date,"2026-09-25");assert.equal(h.controller.selectDay(7),false);assert.equal(h.controller.moveWeek(4),false);
  assert.equal(JSON.stringify(h.state),before);
});

test("adding work delegates to actual addToDay for the chosen future or past day",()=>{
  for(const [offset,date] of [[1,"2026-09-28"],[-1,"2026-09-14"]]){
    const h=harness();h.controller.moveWeek(offset);h.controller.selectDay(6);
    assert.equal(h.controller.add("  Kimya · Atom · 30 dk  "),true);
    assert.equal(h.state.weeks[date].s[0][6],"Kimya · Atom · 30 dk");assert.equal(h.state.weeks["2026-09-21"].s[0][6],"");
    assert.equal(h.calls.filter(call=>call[0]==="save").length,1);assert.equal(h.controller.snapshot().tasks[0].done,false);
  }
});

test("full days and blank submissions cannot overwrite existing plan cells",()=>{
  const h=harness();h.state.weeks["2026-09-21"].s[0][4]="Matematik";h.state.weeks["2026-09-21"].s[1][4]="Biyoloji";
  const before=JSON.stringify(h.state);assert.equal(h.controller.add("   "),false);assert.equal(h.controller.add("Kimya"),false);
  assert.equal(JSON.stringify(h.state),before);assert.equal(h.calls.filter(call=>call[0]==="save").length,0);
});

test("completion and task actions keep legacy cell keys, saving, and menu behavior",()=>{
  const h=harness(),data=h.state.weeks["2026-09-21"];data.s[1][4]="Fizik";
  assert.equal(h.controller.toggleTask("s-1-4"),true);assert.equal(data.dn["s-1-4"],1);assert.equal(h.controller.snapshot().tasks[0].done,true);
  assert.equal(h.controller.openTask("s-1-4"),true);assert.deepEqual(h.calls.find(call=>call[0]==="menu"),["menu","2026-09-21","s",1,4]);
  assert.equal(h.controller.toggleTask("s-1-4"),true);assert.equal(data.dn["s-1-4"],undefined);assert.equal(h.calls.filter(call=>call[0]==="save").length,2);
  data.s[1][4]="";assert.equal(h.controller.toggleTask("s-1-4"),false);assert.equal(h.controller.openTask("s-1-4"),false);assert.deepEqual(data.dn,{});
});

test("week offsets use calendar dates and reject invalid or non-Monday targets",()=>{
  assert.equal(api.refinedProgramWeekOffset("2026-03-30",new Date("2026-03-23T12:00:00")),1);
  assert.equal(api.refinedProgramWeekOffset("2026-03-23",new Date("2026-03-30T12:00:00")),-1);
  assert.equal(api.refinedProgramWeekOffset("2026-02-30",new Date("2026-02-23T12:00:00")),null);
  assert.equal(api.refinedProgramWeekOffset("2026-09-25",new Date("2026-09-25T12:00:00")),null);
  assert.deepEqual(plain(api.refinedProgramTasks({weeks:{bad:{s:[["fake"]]}}},"bad",0)),[]);
  assert.deepEqual(plain(api.refinedProgramTasks(null,"2026-09-21",0)),[]);
});
