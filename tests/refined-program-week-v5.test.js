const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"src/ui/refined-program.ts"),"utf8");
const styles=fs.readFileSync(path.join(root,"src/ui/refined-program-v4.css"),"utf8");
const javascript=stripTypeScriptTypes(source
  .replace(/^import "\.\/refined-program\.css";\r?\n/,"")
  .replace(/^import "\.\/refined-program-v4\.css";\r?\n/,"")
  .replace(/^import \{renderSmartProgram\} from "\.\/smart-program";\r?\n/,""),
  {mode:"strip"}).replace(/^export /gm,"");
const api=vm.runInNewContext(javascript+"\n({refinedProgramWeeklyGroups,refinedProgramWeeklyCompletion,refinedProgramDailyGroups})",{Date,URL});
const plain=x=>JSON.parse(JSON.stringify(x));
function task(id,text,day,done=false,label="Çalışma"){
  return {id,text,day,done,label,block:"s",row:0};
}
test("weekly program shares priority grouping with daily program, preserving every existing cell",()=>{
  const days=[
    [task("r-0-0","Paragraf · 20 soru",0,true),task("s-0-0","TYT Fizik · Hareket",0)],
    [task("s-1-1","AYT Matematik · Limit",1,true)],
    [task("s-0-2","TYT Matematik · Problemler",2),task("s-1-2","Kimya · Atom",2,true)],
    [],[],[task("r-0-5","AYT Biyoloji · Hücre",5)],[]
  ];
  const old=JSON.stringify(days);
  const groups=plain(api.refinedProgramWeeklyGroups(days));
  assert.deepEqual(groups.map(g=>g.key),["reading","math","physics","chemistry","biology"]);
  assert.deepEqual(groups.map(g=>[g.total,g.done]),[[1,1],[2,1],[1,0],[1,1],[1,0]]);
  assert.deepEqual(groups.find(g=>g.key==="math").days.map(d=>d.map(t=>t.id)),[[],["s-1-1"],["s-0-2"],[],[],[],[]]);
  assert.deepEqual(groups.find(g=>g.key==="reading").days[0].map(t=>t.id),["r-0-0"]);
  assert.equal(JSON.stringify(days),old,"render must not change source task arrays or identities");
  assert.deepEqual(plain(api.refinedProgramWeeklyCompletion(days)),{total:6,done:3,pending:3,percent:50});
});
test("empty weeks and 100% completed weeks display meaningful calculated values",()=>{
  assert.deepEqual(plain(api.refinedProgramWeeklyCompletion([])),{total:0,done:0,pending:0,percent:0});
  assert.deepEqual(plain(api.refinedProgramWeeklyGroups([])),[]);
  assert.deepEqual(plain(api.refinedProgramWeeklyCompletion([[task("s-0-0","Paragraf",0,true)]])),{total:1,done:1,pending:0,percent:100});
});
test("task classification and lesson order agree between both week and day projections",()=>{
  const all=[
    task("x","TYT Geometri · Üçgenler",0),
    task("y","TYT Kimya · Tepkimeler",0),
    task("z","Paragraf · Hız testi",0),
    task("k","AYT Kimya · Organik",0),
    task("j","Diğer çalışma",0)
  ];
  assert.deepEqual(plain(api.refinedProgramDailyGroups(all).map(g=>g.key)),plain(api.refinedProgramWeeklyGroups([all]).map(g=>g.key)));
  assert.deepEqual(plain(api.refinedProgramWeeklyGroups([all]).find(g=>g.key==="chemistry").days[0].map(t=>t.id)),["y","k"]);
});
test("desktop and mobile weekly views contain real task editing and accessible day navigation",()=>{
  assert.match(source,/rb-v5-week-desktop/);
  assert.match(source,/rb-v5-week-mobile/);
  assert.match(source,/refinedProgramWeeklyGroups\(weekTasks\)/);
  assert.match(source,/refinedProgramWeeklyCompletion\(weekTasks\)/);
  assert.match(source,/dayButton\.addEventListener\("click",\(\)=>openDay\(index\)\)/);
  assert.match(source,/action\.addEventListener\("click",\(\)=>\{controller\.selectDay\(index\);openEditor\(task,state\.week\);\}\)/);
  assert.match(source,/const workName=info\.meta&&info\.meta!==task\.label\?info\.meta:info\.display/);
  assert.match(source,/const extra=refinedProgramSplitExtras\(task\.text\)/);
  assert.match(source,/weekStats\.percent\+"%"/);
  assert.match(source,/weekStats\.pending/);
  assert.match(styles,/@media\(max-width:980px\)/);
  assert.match(styles,/\.rb-program-calendar\.rb-v5-week-desktop\{display:none!important;\}/);
  assert.match(styles,/\.rb-v5-week-mobile\{display:grid/);
  assert.match(styles,/\.rb-v5-week-days\{display:grid/);
  assert.match(styles,/\.rb-v5-week-desktop \.rb-v5-week-task/);
  assert.match(styles,/\.rb-v5-week-task \.rb-v5-week-resources/);
});
test("weekly overview uses the existing edit controller and does not manipulate sync or Firestore",()=>{
  const weeklySection=source.slice(source.indexOf("    const weekTasks=state.days.map("),source.indexOf('    if(state.view==="smart"){'));
  assert.match(weeklySection,/controller\.tasksForDay\(index\)/);
  assert.match(weeklySection,/controller\.selectDay\(index\)/);
  assert.match(weeklySection,/openEditor\(task,state\.week\)/);
  assert.doesNotMatch(weeklySection,/\.weeks\s*\[|setDoc\(|updateDoc\(|addDoc\(|firebase/);
  assert.doesNotMatch(weeklySection,/controller\.toggleTask/);
  assert.match(source,/controller\.updateTask\(editingTaskId,value,editingWeek\)/);
});
