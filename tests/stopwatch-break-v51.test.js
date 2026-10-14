const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

function breakHarness(){
  const src=read("app.js"),start=src.indexOf("let swBreakTimer=null;"),end=src.indexOf("function swRenderTools(){",start);
  assert.ok(start>=0&&end>start,"read the v51 stopwatch break runtime");
  const code=src.slice(start,end)
    .replace(/function swBreakEnsureUi\(\)\{[\s\S]*?(?=function swBreakUpdateUi\(\)\{)/,
      "function swBreakEnsureUi(){return panel;}\n")
    .replace(/function swBreakUpdateUi\(\)\{[\s\S]*?(?=function swMarkBreak\(\)\{)/,
      "function swBreakUpdateUi(){}\n");
  const focused={run:true,start:1,acc:7200000,cr:120},records={};
  const S={focus:{sw:focused,swBreak:null,swBreaks:[],swLaps:[]},
    pomoMin:{"2026-10-14":120},pomoSubj:{"2026-10-14":{Matematik:120}},
    swHistory:{"2026-10-14":[{id:1,ms:7200000,subj:"Matematik"}]}};
  const elements={swBreakHours:{value:"0"},swBreakMinutes:{value:"15"},
    swBreakStatus:{textContent:""},swBreakPanel:{hidden:true,dataset:{}},
    swBreakMinutes:{value:"15",focus(){} }};
  const panel=elements.swBreakPanel,markers=[],toasts=[],mutations=[];
  let now=Date.parse("2026-10-14T10:00:00Z"),pauseCount=0,startCount=0,reasonCount=0;
  class Clock extends Date{static now(){return now}}
  const env={S,panel,Date:Clock,Math,Number,String,Array,console,
    todayKey:()=>"2026-10-14",keyOf:()=>"2026-10-14",
    sw:()=>focused,el:id=>elements[id]||null,
    swPause:()=>{pauseCount++;focused.run=false;mutations.push("pause-work")},
    swStart:()=>{startCount++;focused.run=true;mutations.push("start-work")},
    swPushMarker:v=>{markers.push(v);S.focus.swLaps.push({t:focused.acc,subj:v})},
    setPauseReason:kind=>{assert.equal(kind,"break");reasonCount++},
    hidePauseReason:()=>{},save:()=>{mutations.push("save");return true},
    renderSw:()=>{},toast:s=>toasts.push(s),
    fmtSw:ms=>Math.floor(ms/60000)+":"+String(Math.floor(ms/1000)%60).padStart(2,"0")
  };
  vm.runInNewContext(code+"\nthis.begin=swBeginBreak;this.finish=swFinishBreak;this.mark=swMarkBreak;this.active=swBreakActive;",env);
  return{env,S,elements,markers,toasts,mutations,
    advance:min=>{now+=min*60000},
    get pauses(){return pauseCount},get starts(){return startCount},get reasons(){return reasonCount}};
}
test("v51 choosing break only opens the picker; no prior working minutes become break",()=>{
  const h=breakHarness();
  h.env.mark();
  assert.equal(h.S.focus.swBreak,null);
  assert.equal(h.S.focus.sw.run,true,"work continues while choosing");
  assert.equal(h.S.pomoMin["2026-10-14"],120);
  assert.equal(h.S.pomoSubj["2026-10-14"].Matematik,120);
  assert.equal(h.elements.swBreakPanel.hidden,false);
  assert.equal(h.pauses,0);
  assert.equal(h.reasons,0);
  assert.deepEqual(h.markers,[]);
});
test("v51 begin ends work segment, preserves 2h and records only subsequent break",()=>{
  const h=breakHarness();
  h.env.mark();
  h.elements.swBreakHours.value="0";h.elements.swBreakMinutes.value="15";
  assert.equal(h.env.begin(),true);
  assert.equal(h.pauses,1);
  assert.equal(h.reasons,1);
  assert.equal(h.S.focus.swBreak.targetMin,15);
  assert.equal(h.S.focus.sw.run,false);
  assert.equal(h.S.pomoMin["2026-10-14"],120);
  assert.equal(h.S.pomoSubj["2026-10-14"].Matematik,120);
  assert.equal(h.S.swHistory["2026-10-14"][0].ms,7200000);
  assert.match(h.markers[0],/Mola başlangıcı/);
  h.advance(12);
  assert.equal(h.env.finish(true),true);
  assert.equal(h.starts,1);
  assert.equal(h.S.focus.swBreak,null);
  assert.equal(h.S.focus.swBreaks.length,1);
  assert.equal(h.S.focus.swBreaks[0].ms,12*60000);
  assert.equal(h.S.focus.swBreaks[0].plannedMin,15);
  assert.equal(h.S.pomoMin["2026-10-14"],120,"past mathematics work unchanged");
  assert.match(h.markers[1],/12 dk/);
  assert.equal(h.S.focus.sw.run,true);
});
test("v51 rejecting invalid durations never pauses or changes focus records",()=>{
  const h=breakHarness();
  for(const [hours,mins] of [[-1,0],[13,0],[0,60],[0,0],[1,1.5]]){
    h.elements.swBreakHours.value=String(hours);
    h.elements.swBreakMinutes.value=String(mins);
    assert.equal(h.env.begin(),false);
    assert.equal(h.S.focus.sw.run,true);
    assert.equal(h.S.focus.swBreak,null);
  }
  assert.equal(h.pauses,0);
  assert.equal(h.reasons,0);
  assert.equal(h.S.pomoMin["2026-10-14"],120);
});
test("v51 double finish cannot duplicate break or session, no old marker shown as break minutes",()=>{
  const h=breakHarness();
  assert.equal(h.env.begin(),true);
  assert.equal(h.env.begin(),false);
  h.advance(5);
  assert.equal(h.env.finish(false),true);
  assert.equal(h.env.finish(false),false);
  assert.equal(h.S.focus.swBreaks.length,1);
  assert.equal(h.S.focus.swBreaks[0].ms,5*60000);
  const app=read("app.js");
  assert.match(app,/begins\?\(subject\?subject\+" çalışması · düzeltildi"/,"pre-break work is labeled as study, not break");
  assert.match(app,/const duration=ends\?"—":fmtSw\(split\)/,"work segment before a break is not hidden");
});
test("v51 UI, persistence and reset guards are wired without clearing study totals",()=>{
  const app=read("app.js"),html=read("index.html"),css=read("src/ui/stopwatch-break-v51.css"),
    main=read("src/main.ts");
  assert.match(html,/id="swBreakButton"[^>]*onclick="swMarkBreak\(\)"[^>]*>Mola ver<\/button>/);
  assert.match(app,/function swBreakEnsureUi\(\)/);
  assert.match(app,/function swBeginBreak\(\)/);
  assert.match(app,/function swFinishBreak\(resume\)/);
  assert.match(app,/o\.focus\.swBreaks=o\.focus\.swBreaks\.filter/);
  assert.match(app,/const __v51SwStart=swStart/);
  assert.match(app,/const __v51SwReset=swReset/);
  assert.match(app,/if\(swBreakActive\(\)\)swFinishBreak\(false\)/);
  assert.match(app,/swBreakTimer=setInterval\(swBreakUpdateUi,1000\)/);
  assert.match(css,/\.sw-break-panel\[hidden\]/);
  assert.match(css,/--rb-ink/);
  assert.match(main,/import "\.\/ui\/stopwatch-break-v51\.css";/);
  const ui=app.slice(app.indexOf("/* v51 — Molayı"),app.indexOf("function swRenderTools(){",app.indexOf("/* v51 — Molayı")));
  assert.doesNotMatch(ui,/S\.pomoMin\s*=|S\.pomoSubj\s*=|S\.swHistory\s*=|S\.sessions\s*=|S\.focus\.sw\.acc\s*=/);
});
