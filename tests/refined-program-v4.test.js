const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"src/ui/refined-program.ts"),"utf8");
const css=fs.readFileSync(path.join(root,"src/ui/refined-program-v4.css"),"utf8");
const runtime=stripTypeScriptTypes(source
  .replace(/^import "\.\/refined-program\.css";\r?\n/,"")
  .replace(/^import "\.\/refined-program-v4\.css";\r?\n/,"")
  .replace(/^import \{renderSmartProgram\} from "\.\/smart-program";\r?\n/,""),{mode:"strip"}).replace(/^export /gm,"");
const api=vm.runInNewContext(runtime+"\n({refinedProgramSplitExtras,refinedProgramJoinExtras,refinedProgramTaskDetail,refinedProgramVisualTone,refinedProgramVisualIcon})",{Date,URL});
const plain=x=>JSON.parse(JSON.stringify(x));

test("student planner actually replaces the main daily view, not only the smart tab",()=>{
  assert.match(source,/view:ProgramView="day"/);
  assert.match(source,/button\("Günlük Plan"\)/);
  assert.match(source,/button\("Haftalık Bakış"\)/);
  assert.match(source,/rb-v4-day-progress/);
  assert.match(source,/dailyPanel\.append\(summary,dailyHero,dailyTasksHeading,list\)/);
  assert.match(source,/card\.append\(check,subjectIcon,details,chips\)/);
  assert.match(css,/\.rb-v4-ring/);
  assert.match(css,/\.rb-v4-task-chips/);
  assert.match(css,/\.rb-program-weekstrip/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.doesNotMatch(source,/createElement\("iframe"\)/);
});

test("notes and materials round-trip through existing task text, without new firebase schema",()=>{
  const raw="TYT Matematik · Problemler · 30 soru — https://youtu.be/dQw4w9WgXcQ";
  const merged=api.refinedProgramJoinExtras(raw,"İlk önce örnekleri çöz","https://example.com/kaynak.pdf");
  assert.equal(typeof merged,"string");
  assert.deepEqual(plain(api.refinedProgramSplitExtras(merged)),{
    work:raw,note:"İlk önce örnekleri çöz",material:"https://example.com/kaynak.pdf"
  });
  assert.deepEqual(plain(api.refinedProgramTaskDetail(merged,"TYT Matematik")),{
    display:"TYT Matematik · Problemler · 30 soru",
    title:"TYT Matematik",meta:"Problemler · 30 soru",url:"https://youtu.be/dQw4w9WgXcQ",hasVideo:true
  });
  assert.equal(api.refinedProgramJoinExtras(raw,"",""),raw);
});

test("unsupported URLs and overlong annotations never alter a task",()=>{
  assert.equal(api.refinedProgramJoinExtras("Matematik","","javascript:alert(1)"),null);
  assert.equal(api.refinedProgramJoinExtras("Matematik","x".repeat(181),""),null);
  assert.equal(api.refinedProgramJoinExtras("Matematik","","https://example.com/"+"x".repeat(300)),null);
  assert.equal(api.refinedProgramJoinExtras("X".repeat(590),"long note",""),null);
  assert.deepEqual(plain(api.refinedProgramSplitExtras("Paragraf · 20 soru")),{
    work:"Paragraf · 20 soru",note:"",material:""
  });
});

test("subject cards use stable subject-specific accents and actions are not decorative",()=>{
  assert.equal(api.refinedProgramVisualTone("TYT Matematik"),"math");
  assert.equal(api.refinedProgramVisualTone("AYT Biyoloji"),"biology");
  assert.equal(api.refinedProgramVisualTone("TYT Kimya"),"chemistry");
  assert.equal(api.refinedProgramVisualTone("Paragraf"),"reading");
  assert.equal(api.refinedProgramVisualTone("TYT Fizik"),"physics");
  assert.equal(api.refinedProgramVisualTone("Deneme Analizi"),"other");
  assert.match(source,/noteChip\.addEventListener\("click",\(\)=>openEditor\(task,state\.week,"note"\)\)/);
  assert.match(source,/materialChip\.addEventListener\("click"/);
  assert.match(source,/detailExtras\.append\(noteBox,materialBox\)/);
  assert.match(source,/refinedProgramJoinExtras\(editorInput\.value,noteInput\.value,materialInput\.value\)/);
  assert.match(source,/controller\.updateTask\(editingTaskId,value,editingWeek\)/);
  assert.match(source,/controller\.toggleTask\(task\.id\)/);
  assert.match(source,/controller\.setView\("day"\)/);
});
