const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"src/ui/smart-program.ts"),"utf8");
const executable=stripTypeScriptTypes(source.replace(/^import "\.\/smart-program\.css";\r?\n/,""),{mode:"strip"}).replace(/^export /gm,"");
const logic=vm.runInNewContext(executable+"\n({smartTaskMinutes,smartProgramAnalyze})",{Date,Map,Number,Math,String,Array});
const plain=data=>JSON.parse(JSON.stringify(data));

test("explicit study targets are parsed without mistaking questions or video URLs for durations",()=>{
  assert.equal(logic.smartTaskMinutes("TYT Matematik · Problemler · 40 soru · 1 sa 30 dk"),90);
  assert.equal(logic.smartTaskMinutes("Biyoloji · 45 dk"),45);
  assert.equal(logic.smartTaskMinutes("Kimya · 2 saat"),120);
  assert.equal(logic.smartTaskMinutes("TYT · 60 soru — https://youtu.be/abc123"),0);
  assert.equal(logic.smartTaskMinutes("Paragraf · 40 soru"),0);
  assert.equal(logic.smartTaskMinutes("Fizik · 9999 dk"),0);
  assert.equal(logic.smartTaskMinutes(""),0);
});

test("smart overview derives overdue work, time logs and lesson distribution from actual student data",()=>{
  const input={
    week:"2026-10-05",today:"2026-10-08",
    tasks:[
      {id:"s-0-0",day:0,subject:"TYT Matematik",text:"TYT Matematik · Problemler · 1 sa 30 dk",done:true},
      {id:"s-0-1",day:1,subject:"TYT Kimya",text:"TYT Kimya · Karışımlar · 30 dk",done:false},
      {id:"s-1-3",day:3,subject:"TYT Matematik",text:"TYT Matematik · Fonksiyonlar · 45 dk",done:false},
      {id:"s-0-5",day:5,subject:"Biyoloji",text:"Biyoloji · Hücre · 1 saat",done:false}
    ],
    focusMinutes:{"2026-10-05":70,"2026-10-06":-8,"2026-10-07":65,"2026-10-08":40}
  };
  const before=JSON.stringify(input);
  const result=plain(logic.smartProgramAnalyze(input));
  assert.equal(result.total,4);assert.equal(result.done,1);assert.equal(result.rate,25);
  assert.equal(result.unfinished,3);assert.equal(result.overdue,1);
  assert.deepEqual(result.backlog.map(task=>task.id),["s-0-1"]);
  assert.deepEqual(result.nextTasks.map(task=>task.id),["s-1-3","s-0-5"]);
  assert.equal(result.suggestedDay,4);
  assert.equal(result.plannedMinutes,225);assert.equal(result.actualMinutes,175);assert.equal(result.activeDays,3);
  assert.equal(result.days[0].date,"2026-10-05");assert.equal(result.days[6].date,"2026-10-11");
  assert.deepEqual(result.subjects.map(s=>s.name),["TYT Matematik","Biyoloji","TYT Kimya"]);
  assert.equal(JSON.stringify(input),before,"analysis must not mutate legacy planner data");
});

test("empty plans report zero rather than inventing activity or recommendations",()=>{
  const snap=plain(logic.smartProgramAnalyze({week:"2026-10-05",today:"2026-10-11",tasks:[],focusMinutes:{}}));
  assert.equal(snap.rate,0);assert.equal(snap.total,0);assert.equal(snap.actualMinutes,0);
  assert.equal(snap.suggestedDay,6);assert.equal(snap.backlog.length,0);assert.equal(snap.nextTasks.length,0);
  assert.equal(snap.subjects.length,0);
});
test("non-finite focus data is ignored and extreme totals are capped per day",()=>{
  const snap=plain(logic.smartProgramAnalyze({week:"2026-10-05",today:"2026-10-08",tasks:[],focusMinutes:{
    "2026-10-05":"NaN","2026-10-06":-250,"2026-10-07":999999,
    "2026-10-08":"60"
  }}));
  assert.equal(snap.actualMinutes,1500);
  assert.equal(snap.days[2].actualMinutes,1440);
  assert.equal(snap.activeDays,2);
});
test("Programım mounts a distinct smart tab and does not replace legacy state or Firebase sync",()=>{
  const refined=fs.readFileSync(path.join(root,"src/ui/refined-program.ts"),"utf8");
  assert.match(refined,/import \{renderSmartProgram\} from "\.\/smart-program";/);
  assert.match(refined,/smart=button\("Akıllı Plan"\)/);
  assert.match(refined,/smartPanel\.hidden=state\.view!=="smart"/);
  assert.match(refined,/renderSmartProgram\(smartPanel,/);
  assert.match(refined,/focusMinutes:rawState\.pomoMin/);
  assert.match(refined,/onDraft:\(text,day\)=>\{/);
  assert.match(refined,/input\.value=text;updatePreview\(\)/);
  assert.match(refined,/bridge\.setProgTab\("week"\)/);
  assert.match(refined,/legacyPanel\.hidden=true/);
  assert.doesNotMatch(source,/firebase\/|coachingShares|coachingActions|setDoc\(/);
});
