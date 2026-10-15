const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const script=fs.readFileSync(path.join(root,"modules/stopwatch-day-reset-v57.js"),"utf8");

function harness({run=true,minutes=0,credited=0,day="2026-10-14",startHour=23,startMin=50,breakActive=false,missingDay=false}={}){
 let now=new Date(2026,9,14,startHour,startMin,0,0).getTime();
 let timerSerial=0,saves=0,historyRefresh=0;
 const handles=new Map(),events={};
 class Clock extends Date{
  constructor(...args){super(...(args.length?args:[now]));}
  static now(){return now;}
 }
 const keyOf=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
 const nextDay=(d,n)=>{const x=new Date(d+"T00:00:00");x.setDate(x.getDate()+n);return keyOf(x);};
 const watch={run,start:run?now:0,acc:minutes*60000,cr:credited};
 if(!missingDay)watch.day=day;
 const history=[];const S={
  focus:{sw:watch,swLaps:[{t:1000,subj:"Tur"}],swBreak:breakActive?{start:now-60000,targetMin:15}:null},
  swHistory:{},pomoMin:{},pomoSubj:{},sessions:{}
 };
 const env={window:null,document:{hidden:false,addEventListener:(x,fn)=>events["doc:"+x]=fn},
  Date:Clock,console,Math,Number,String,Array,Object,Set,
  S,pomoSubject:"Matematik",SUBJ_NAMES:["Matematik"],
  keyOf,todayKey:()=>keyOf(new Clock()),
  validDateKey:s=>s.length===10&&s[4]==="-"&&s[7]==="-",
  addDaysKey:nextDay,sw:()=>watch,
  swElapsedAt:(w,t)=>w.acc+(w.run?Math.max(0,t-w.start):0),
  swElapsed:()=>watch.acc+(watch.run?Math.max(0,now-watch.start):0),
  swStart:()=>{watch.run=true;watch.start=now;return true;},
  swPause:()=>{watch.acc+=now-watch.start;watch.run=false;watch.start=0;return true;},
  swReset:()=>{watch.acc=0;watch.cr=0;watch.start=0;watch.run=false;},
  swLap:()=>true,swSwitchSubject:()=>true,
  swHistoryAdd:(ms,subject,start,end)=>{
   const k=keyOf(new Clock(end)),list=S.swHistory[k]||(S.swHistory[k]=[]);
   list.push({ms,subj:subject,at:start,end});history.push(k);return true;
  },
  save:()=>{saves++;return true;},
  renderSw:()=>{},renderSwHistory:()=>{historyRefresh++;},renderSessions:()=>{},renderTimeDist:()=>{},
  isCoach:()=>false,
  setTimeout:(fn,ms)=>{handles.set(++timerSerial,{fn,ms});return timerSerial;},
  clearTimeout:id=>handles.delete(id),
  swCreditElapsed(ms){
   const mins=Math.floor(ms/60000),delta=mins-watch.cr;
   if(delta>0){const day=keyOf(new Clock());S.pomoMin[day]=(S.pomoMin[day]||0)+delta;
    watch.cr=mins;}
  },
  addEventListener:(name,fn)=>events["win:"+name]=fn
 };
 env.window=env;
 vm.runInNewContext(script,env);
 return{env,S,watch,history,events,handles,at:(y,m,d,h,min)=>{now=new Date(y,m-1,d,h,min,0,0).getTime();},
 get saves(){return saves},get historyRefresh(){return historyRefresh},clock:()=>now};
}
test("v57 running stopwatch splits at local midnight; yesterday credited once, new day counts from zero",()=>{
 const h=harness({credited:9});
 h.S.pomoMin["2026-10-14"]=9;h.S.pomoSubj["2026-10-14"]={Matematik:9};
 h.at(2026,10,15,0,0);
 assert.equal(h.env.swElapsed(),0);
 assert.equal(h.watch.run,true);
 assert.equal(h.watch.start,h.clock());
 assert.equal(h.watch.day,"2026-10-15");
 assert.equal(h.S.pomoMin["2026-10-14"],10);
 assert.equal(h.S.pomoMin["2026-10-15"]||0,0);
 assert.equal(h.S.sessions["2026-10-14"][0].m,10);
 assert.equal(h.S.swHistory["2026-10-14"][0].ms,600000);
 assert.equal(h.S.focus.swLaps.length,0);
 h.at(2026,10,15,0,5);
 assert.equal(h.env.swElapsed(),5*60000);
 h.env.swCreditElapsed(h.env.swElapsed());
 assert.equal(h.S.pomoMin["2026-10-15"],5);
 h.env.yksStopwatchEnsureDay();
 assert.equal(h.S.pomoMin["2026-10-14"],10,"no double-credit after refresh");
 assert.equal(h.S.swHistory["2026-10-14"].length,1,"no duplicated history");
});
test("v57 paused stopwatch resets at new day, history and break timer remain untouched",()=>{
 const h=harness({run:false,minutes:120,credited:120,breakActive:true});
 h.S.pomoMin["2026-10-14"]=120;
 h.S.swHistory["2026-10-14"]=[{ms:7200000,subj:"Matematik"}];
 h.at(2026,10,15,1,5);h.events["doc:visibilitychange"]();
 assert.equal(h.watch.acc,0);
 assert.equal(h.env.swElapsed(),0);
 assert.equal(h.watch.run,false);
 assert.equal(h.S.pomoMin["2026-10-14"],120);
 assert.equal(h.S.pomoMin["2026-10-15"]||0,0);
 assert.equal(h.S.swHistory["2026-10-14"].length,1);
 assert.equal(h.S.focus.swBreak.targetMin,15);
 assert.equal(h.S.sessions["2026-10-14"][0].m,120);
});
test("v57 next-day restart never carries prior day's paused hours",()=>{
 const h=harness({run:false,minutes:90,credited:90});
 h.at(2026,10,15,10,0);
 h.env.swStart();
 assert.equal(h.watch.run,true);
 assert.equal(h.watch.acc,0);
 assert.equal(h.watch.day,"2026-10-15");
 assert.equal(h.env.swElapsed(),0);
});
test("v57 catches up after long sleep and month boundary without overwriting old dates",()=>{
 const h=harness({credited:9});
 h.at(2026,11,1,1,0);
 const changed=h.env.yksStopwatchEnsureDay();
 assert.equal(changed,true);
 assert.equal(h.watch.day,"2026-11-01");
 assert.equal(h.env.swElapsed(),3600000);
 assert.equal(h.S.pomoMin["2026-10-14"],10);
 assert.equal(h.S.pomoMin["2026-11-01"]||0,0);
 assert.ok(h.history.includes("2026-10-31"));
 assert.ok(h.S.sessions["2026-10-31"].length>0);
});
test("v57 migrates a legacy paused stopwatch from its last real history day",()=>{
 const h=harness({run:false,minutes:120,credited:120,missingDay:true});
 h.S.swHistory["2026-10-14"]=[{ms:7200000,subj:"Matematik"}];
 h.at(2026,10,15,9,0);
 h.env.yksStopwatchEnsureDay();
 assert.equal(h.watch.day,"2026-10-15");
 assert.equal(h.watch.acc,0);
 assert.equal(h.S.swHistory["2026-10-14"].length,1);
});
test("v57 is linked as a classic script after notification wrapper; not a new data owner",()=>{
 const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
 assert.ok(html.includes("modules/stopwatch-day-reset-v57.js?v=4.4.0-r57"));
 assert.ok(html.indexOf("modules/focus-notifications.js")<html.indexOf("modules/stopwatch-day-reset-v57.js"));
 for(const forbidden of ["localStorage","indexedDB","setDoc(","updateDoc(","delete S.swHistory"]){assert.equal(script.includes(forbidden),false);}
});
