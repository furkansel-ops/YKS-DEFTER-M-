const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"src/ui/refined-program.ts"),"utf8");
const runtime=stripTypeScriptTypes(source.replace(/^import "\.\/refined-program\.css";\r?\n/,""),{mode:"strip"}).replace(/^export /gm,"");
const api=vm.runInNewContext(runtime+"\n({refinedProgramTasks,refinedProgramWeekOffset,refinedProgramQuickText,createRefinedProgramController})",{Date});
const plain=value=>JSON.parse(JSON.stringify(value));
const rows=()=>[Array(7).fill(""),Array(7).fill("")];
function week(){return {r:rows(),s:rows(),dn:{},done:Array(7).fill(false),mv:{}};}
function harness(){
  const fixed=new Date("2026-09-25T12:00:00"),calls=[];
  const state={rows:{r:2,s:2},rowLabels:{r:["Sabah rutini",""],s:["Fen",""]},weeks:{"2026-09-21":week(),"2026-09-28":week()}};
  class Clock extends Date{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed.getTime();}}
  const context=vm.createContext({Date:Clock,S:state,curWeek:new Clock("2026-09-21T12:00:00"),
    save:()=>{calls.push(["save"]);return true;},perfInvalidateState:()=>calls.push(["invalidate"]),renderPlan:()=>calls.push(["renderPlan"]),renderTodayPlan:()=>{},renderSuggest:()=>{},toast:message=>calls.push(["toast",message]),el:()=>({classList:{contains:()=>true}})});
  const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
  for(const name of ["keyOf","parseKey","addDaysKey","dowOf","mondayOf","thisWeek","clone"]){
    const definition=app.match(new RegExp(`^function ${name}\\([^\\n]+$`,"m"));assert.ok(definition,name);vm.runInContext(definition[0],context);
  }
  for(const name of ["blankWeek","normWeek","getWeek","toggleCellDone","shiftWeek","addToDay","addToDays"]){
    const definition=app.match(new RegExp(`function ${name}\\([^\\n]*\\)\\{[\\s\\S]*?\\r?\\n}`));assert.ok(definition,name);vm.runInContext(definition[0],context);
  }
  const controller=api.createRefinedProgramController({readState:()=>state,visibleWeek:()=>context.keyOf(context.curWeek),shiftWeek:context.shiftWeek,thisWeek:context.thisWeek,
    setProgTab:tab=>calls.push(["setProgTab",tab]),toggleCellDone:context.toggleCellDone,addToDay:context.addToDay,addToDays:context.addToDays,
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

test("quick planning stays anchored to its draft week after visible-week navigation",()=>{
  const h=harness(),draft=h.controller.snapshot().week;
  h.state.weeks[draft].s[0][0]="Existing Monday";h.state.weeks[draft].r[0][6]="Routine";h.state.weeks[draft].dn["r-0-6"]=1;
  const nextWeek=JSON.stringify(h.state.weeks["2026-09-28"]);
  h.controller.moveWeek(1);h.controller.selectDay(2);
  assert.deepEqual(plain(h.controller.addMany("  TYT Matematik · Problemler  ",[6,0,6],draft)),{ok:true,days:[0,6]});
  assert.equal(h.controller.snapshot().week,"2026-09-28");assert.equal(h.controller.snapshot().day,2);assert.equal(JSON.stringify(h.state.weeks["2026-09-28"]),nextWeek);
  assert.equal(h.state.weeks[draft].s[0][0],"Existing Monday");assert.equal(h.state.weeks[draft].s[1][0],"TYT Matematik · Problemler");assert.equal(h.state.weeks[draft].s[0][6],"TYT Matematik · Problemler");assert.equal(h.state.weeks[draft].s[1][6],"");
  assert.equal(h.state.weeks[draft].r[0][6],"Routine");assert.equal(h.state.weeks[draft].dn["r-0-6"],1);assert.equal(h.calls.filter(call=>call[0]==="save").length,1);
});

test("quick planning defaults to the displayed week and exposes every weekday without mutation",()=>{
  const h=harness();h.controller.moveWeek(1);h.controller.setView("week");
  assert.equal(h.controller.addMany("AYT Kimya",[1,3]).ok,true);
  const before=JSON.stringify(h.state);
  assert.equal(h.controller.tasksForDay(1)[0].text,"AYT Kimya");assert.equal(h.controller.tasksForDay(3)[0].day,3);assert.deepEqual(plain(h.controller.tasksForDay(8)),[]);assert.deepEqual(plain(h.controller.tasksForDay(-1)),[]);
  assert.deepEqual(plain(h.controller.snapshot().days.map(day=>day.count)),[0,1,0,1,0,0,0]);assert.equal(JSON.stringify(h.state),before);assert.equal(h.state.weeks["2026-09-21"].s[0][1],"");
});

test("quick planning forwards full and save failures without retaining partial tasks",()=>{
  const h=harness(),key=h.controller.snapshot().week,w=h.state.weeks[key];w.s[0][3]="A";w.s[1][3]="B";
  const before=JSON.stringify(h.state);
  assert.deepEqual(plain(h.controller.addMany("New",[0,3])),{ok:false,reason:"full"});assert.equal(JSON.stringify(h.state),before);assert.equal(h.calls.filter(call=>call[0]==="save").length,0);
  h.context.save=()=>false;
  assert.deepEqual(plain(h.controller.addMany("New",[0,6])),{ok:false,reason:"save"});assert.equal(JSON.stringify(h.state),before);assert.equal(h.state.weeks[key],w);
  h.context.save=()=>true;
  assert.equal(h.controller.addMany("New",[0,6]).ok,true);assert.equal(h.state.weeks[key].s.flat().filter(text=>text==="New").length,2);
});

test("quick planning rejects invalid day sets, text and target weeks before writes",()=>{
  const h=harness(),before=JSON.stringify(h.state);
  const cases=[[" ",[0]],["x".repeat(601),[0]],["New",[]],["New",[0,7]],["New",[-1]],["New",[1.5]],["New",["1"]],["New",Array(1)],["New",[0],"2026-09-22"],["New",[0],"2026-02-30"]];
  for(const args of cases)assert.deepEqual(plain(h.controller.addMany(...args)),{ok:false,reason:"invalid"});
  assert.equal(JSON.stringify(h.state),before);assert.equal(h.calls.filter(call=>call[0]==="save").length,0);
  const unavailable=api.createRefinedProgramController({visibleWeek:()=>"2026-09-21"},()=>new Date("2026-09-25T12:00:00"));
  assert.deepEqual(plain(unavailable.addMany("New",[0])),{ok:false,reason:"invalid"});
});

test("quick text formats only selected goals and validates meaningful numeric bounds",()=>{
  assert.equal(api.refinedProgramQuickText("  TYT Matematik  "," Problemler ","030","045"),"TYT Matematik · Problemler · 30 soru · 45 dk");
  assert.equal(api.refinedProgramQuickText("AYT Kimya","","",""),"AYT Kimya");
  assert.equal(api.refinedProgramQuickText("TYT Türkçe","Paragraf","20",""),"TYT Türkçe · Paragraf · 20 soru");
  assert.equal(api.refinedProgramQuickText("YDT İngilizce","","","45"),"YDT İngilizce · 45 dk");
  assert.equal(api.refinedProgramQuickText("Matematik","","1000","1440"),"Matematik · 1000 soru · 1440 dk");
  assert.equal(api.refinedProgramQuickText(" ","Problemler","30",""),null);assert.equal(api.refinedProgramQuickText("A".repeat(121),"","",""),null);assert.equal(api.refinedProgramQuickText("Matematik","A".repeat(201),"",""),null);
  for(const [questions,minutes] of [["0",""],["-1",""],["1.5",""],["1e2",""],["1001",""],["","0"],["","-1"],["","1.5"],["","1441"]])assert.equal(api.refinedProgramQuickText("Matematik","",questions,minutes),null);
});
