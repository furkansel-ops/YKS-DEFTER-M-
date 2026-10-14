const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const app=read("app.js");
const region=app.slice(app.indexOf("/* v53:"),app.indexOf("const __v47RenderSw=renderSw;",app.indexOf("/* v53:")));
if(!region.includes("function swLapOpenCorrection(index)"))throw new Error("v53 correction unavailable");

function harness(){
  const laps=[
    {t:6101000,subj:"Kimya"},
    {t:6110000,subj:"Kimya"},
    {t:13550000,subj:"☕ Mola"},
    {t:13552000,subj:"Matematik"},
    {t:13555000,subj:"☕ Mola başlangıcı"}
  ];
  const S={focus:{swLaps:laps},pomoMin:{"2026-10-14":225},
    pomoSubj:{"2026-10-14":{Kimya:101,Matematik:124}},
    swHistory:{"2026-10-14":[{id:3,subj:"Matematik",ms:7440000}]},
    sessions:{"2026-10-14":[{t:100,type:"work",subj:"Matematik",m:124}]}};
  const inputs={
    swLapCorrectionPanel:{hidden:true,dataset:{},scrollIntoView(){}},
    swLapCorrectionSubject:{value:"Matematik",focus(){}},
    swLapCorrectionInfo:{textContent:""},
    swLaps:{innerHTML:""},
    swSessionNote:{textContent:""},
    swActiveSubject:{textContent:""},
    swSubjectSwitch:{innerHTML:""}
  };
  const messages=[],saved=[];let renderCount=0;
  const env={
    S,Math,Number,String,Array,console,confirm:()=>true,
    pomoSubject:"Matematik",SUBJ_NAMES:["Kimya","Matematik","Fizik"],
    el:id=>inputs[id]||null,
    sw:()=>({run:false,acc:13555000}),
    swElapsed:()=>13555000,
    swBreakActive:()=>false,
    swBreakEnsureUi:()=>null,swBreakUpdateUi:()=>{},
    swLapEnsureCorrectionPanel:()=>inputs.swLapCorrectionPanel,
    fmtSw:ms=>{const seconds=Math.floor(ms/1000),hours=Math.floor(seconds/3600),min=Math.floor(seconds%3600/60),s=seconds%60;
      return (hours?hours+":"+String(min).padStart(2,"0"):String(min).padStart(2,"0"))+":"+String(s).padStart(2,"0")},
    esc:s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])),
    document:{activeElement:null},
    save:()=>{saved.push(JSON.stringify(S));return true},
    renderSw:()=>{renderCount++},
    toast:s=>messages.push(s),
    swRenderTools:undefined
  };
  const code=region.replace(/function swLapEnsureCorrectionPanel\(\)\{[\s\S]*?(?=function swLapOpenCorrection\(index\)\{)/,
    "function swLapEnsureCorrectionPanel(){return el('swLapCorrectionPanel');}\n");
  vm.runInNewContext(code+"\nthis.delta=swLapCorrectionDelta;this.open=swLapOpenCorrection;this.apply=swLapSaveCorrection;this.remove=swLapRemoveMarker;this.draw=swRenderTools;",env);
  return{env,S,laps,inputs,messages,saved,get renderCount(){return renderCount}};
}
test("v53 screenshot sequence: old break marker is preceded by 2h04m MATHEMATICS WORK",()=>{
  const h=harness();
  assert.equal(h.env.delta(2),7440000);
  h.env.draw();
  const html=h.inputs.swLaps.innerHTML;
  assert.match(html,/Mola öncesi çalışma · Mola başlangıcı/);
  assert.match(html,/2:04:00 · çalışma/);
  assert.match(html,/3:45:50 toplam çalışma/);
  assert.match(html,/onclick="swLapOpenCorrection\(2\)"/);
  assert.doesNotMatch(html,/2:04:00 · mola/);
  assert.equal(h.S.pomoMin["2026-10-14"],225);
});
test("v53 user can select Mathematics and restore correct study label without changing any time totals",()=>{
  const h=harness();
  const credits=JSON.stringify({focus:h.S.pomoMin,subject:h.S.pomoSubj,history:h.S.swHistory,sessions:h.S.sessions});
  assert.equal(h.env.open(2),true);
  assert.match(h.inputs.swLapCorrectionInfo.textContent,/2:04:00 çalışma/);
  assert.equal(h.inputs.swLapCorrectionSubject.value,"Matematik");
  assert.equal(h.env.apply(),true);
  assert.equal(h.S.focus.swLaps[2].subj,"☕ Mola");
  assert.equal(h.S.focus.swLaps[2].workSubject,"Matematik");
  assert.equal(h.saved.length,1);
  assert.equal(h.renderCount,1);
  assert.equal(JSON.stringify({focus:h.S.pomoMin,subject:h.S.pomoSubj,history:h.S.swHistory,sessions:h.S.sessions}),credits);
  h.env.draw();
  assert.match(h.inputs.swLaps.innerHTML,/Matematik çalışması · düzeltildi/);
  assert.doesNotMatch(h.inputs.swLaps.innerHTML,/Matematik çalışması · Mola başlangıcı/);
  assert.match(h.inputs.swLaps.innerHTML,/2:04:00 · çalışma/);
  assert.match(h.messages[0],/Dakikalar değişmedi/);
});
test("v53 new break start with only 3s is never relabeled as two-hour work",()=>{
  const h=harness();
  assert.equal(h.env.delta(4),3000);
  h.env.draw();
  assert.match(h.inputs.swLaps.innerHTML,/Mola öncesi çalışma/);
  assert.equal((h.inputs.swLaps.innerHTML.match(/swLapOpenCorrection/g)||[]).length,1);
  assert.equal(h.env.open(4),false,"three-second tick is not a two-hour study interval");
  assert.equal(h.env.open(9),false);
  assert.equal(h.saved.length,0);
});
test("v53 persistence schema preserves corrected subject, without altering prior break markers",()=>{
  assert.match(app,/workSubject:typeof v\.workSubject==="string"\?v\.workSubject\.slice\(0,60\):""/);
  assert.match(app,/function swLapSaveCorrection\(\)/);
  assert.match(app,/item\.workSubject=subject;/);
  assert.match(app,/item\.workSubject=previous;/);
  assert.match(app,/if\(save\(\)===false\)/);
  assert.match(app,/begins\?\(subject\?subject\+" çalışması · düzeltildi"/);
  assert.match(app,/duration=ends\?"—":fmtSw\(split\)/);
  assert.doesNotMatch(region,/S\.pomoMin\s*=|S\.pomoSubj\s*=|S\.swHistory\s*=|S\.sessions\s*=/);
  assert.doesNotMatch(region,/swReset\(|swCreditElapsed\(|swHistoryAdd\(|delete S\./);
  const css=read("src/ui/stopwatch-break-v51.css");
  assert.match(css,/\.sw-lap-row\.is-work-before-break/);
  assert.match(css,/\.sw-lap-correction\[hidden\]/);
  assert.match(css,/@media\(max-width:480px\)/);
});

test("v54 extra 3-second fake marker can be removed; all credited focus data remains unchanged",()=>{
  const h=harness();
  const snapshot=JSON.stringify({focus:h.S.pomoMin,subjects:h.S.pomoSubj,
    history:h.S.swHistory,sessions:h.S.sessions});
  assert.equal(h.env.delta(4),3000);
  h.env.draw();
  assert.match(h.inputs.swLaps.innerHTML,/onclick="swLapRemoveMarker\(4\)"/);
  assert.equal(h.env.remove(4),true);
  assert.equal(h.S.focus.swLaps.length,4);
  assert.equal(h.S.focus.swLaps.some(x=>x.t===13555000),false);
  assert.equal(JSON.stringify({focus:h.S.pomoMin,subjects:h.S.pomoSubj,
    history:h.S.swHistory,sessions:h.S.sessions}),snapshot);
  assert.equal(h.saved.length,1);
  assert.match(h.messages[0],/çalışma sürelerin korunuyor/);
});
test("v54 correcting a long wrong-break marker no longer labels it as a break",()=>{
  const h=harness();
  assert.equal(h.env.open(2),true);
  assert.equal(h.env.apply(),true);
  h.env.draw();
  const html=h.inputs.swLaps.innerHTML;
  assert.match(html,/Matematik çalışması · düzeltildi/);
  assert.match(html,/2:04:00 · çalışma/);
  assert.match(html,/is-corrected-work/);
  assert.doesNotMatch(html,/Matematik çalışması · Mola başlangıcı/);
});
