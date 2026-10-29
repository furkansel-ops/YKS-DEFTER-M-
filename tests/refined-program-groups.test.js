const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {loadTaskText}=require("./task-text-fixture");
const {stripTypeScriptTypes}=require("node:module");

const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"src/ui/refined-program.ts"),"utf8");
const css=fs.readFileSync(path.join(root,"src/ui/refined-program-v4.css"),"utf8");
const runtime=stripTypeScriptTypes(source
  .replace(/^import "\.\/refined-program\.css";\r?\n/,"")
  .replace(/^import "\.\/refined-program-v4\.css";\r?\n/,"")
  .replace(/^import \{renderSmartProgram\} from "\.\/smart-program";\r?\n/,""),{mode:"strip"}).replace(/^export /gm,"");
const api=vm.runInNewContext(runtime+
  "\n({refinedProgramDailyGroupKey,refinedProgramDailyGroups,refinedProgramDailyGroupProgress,refinedProgramTasks})",{Date,URL,YKSTaskText:loadTaskText()});
const plain=val=>JSON.parse(JSON.stringify(val));
const task=(id,text,label="Çalışma",done=false)=>({id,block:"s",row:Number(id.slice(1))||0,day:2,text,label,done});

test("same subjects are adjacent in the requested priority order, preserving each cell id",()=>{
  const tasks=[
    task("t1","AYT Biyoloji · Genetik"),
    task("t2","TYT Matematik · Problemler"),
    task("t3","TYT Fizik · Hareket"),
    task("t4","Paragraf · 20 soru","Rutin",true),
    task("t5","TYT Kimya · Karışımlar"),
    task("t6","AYT Matematik · Türev", "Mat"),
    task("t7","TYT Türkçe · Dil Bilgisi"),
    task("t8","TYT Matematik · Sayılar"),
    task("t9","TYT Geometri · Üçgenler"),
    task("t10","Deneme analizi · yanlış sorular")
  ];
  const original=JSON.stringify(tasks);
  const groups=plain(api.refinedProgramDailyGroups(tasks));
  assert.deepEqual(groups.map(group=>group.title),[
    "Paragraf / Türkçe","Matematik","Fizik","Kimya","Biyoloji","Geometri","Diğer"
  ]);
  assert.deepEqual(groups.map(group=>group.tasks.map(item=>item.id)),[
    ["t4","t7"],["t2","t6","t8"],["t3"],["t5"],["t1"],["t9"],["t10"]
  ]);
  assert.equal(groups[0].tasks[0].done,true);
  assert.equal(JSON.stringify(tasks),original,"render ordering must not mutate the planner data");
});

test("all subject categories, including Turkish dotted characters, are recognized",()=>{
  const examples=[
    ["YDT İngilizce · Reading","english"],
    ["TYT Matematik · Temel kavramlar","math"],
    ["AYT Edebiyat · Şiir","literature"],
    ["Türk Dili ve Edebiyatı · Roman","literature"],
    ["AYT Tarih · Osmanlı","history"],
    ["Coğrafya · Türkiye","geography"],
    ["Felsefe · Mantık","philosophy"],
    ["Din Kültürü · İnanç","religion"],
    ["Geometri · Üçgen","geometry"],
    ["TYT Kimya · Atom","chemistry"],
    ["AYT Fizik · Dalgalar","physics"],
    ["AYT Biyoloji · Sistemler","biology"],
    ["Koç · TYT Türkçe · Paragraf","reading"],
    ["İngilizce · Kelime","english"],
    ["AYT Matematik · Paragraf benzeri bir soru","math"]
  ];
  for(const [title,key] of examples)
    assert.equal(api.refinedProgramDailyGroupKey(task("t0",title)),key,title);
  assert.equal(api.refinedProgramDailyGroupKey(task("t0","Deneme analizi","Fizik")), "physics","known saved row labels are a fallback");
  assert.equal(api.refinedProgramDailyGroupKey(task("t0","Ödev takibi · 2 saat","Rutin")),"other");
});

test("daily groups are a derived presentation and do not modify original week data",()=>{
  const wk="2026-10-05",day=2,week={r:[Array(7).fill("")],s:[Array(7).fill(""),Array(7).fill("")],dn:{"s-0-2":1},mv:{"order-2":["s-1-2","s-0-2","r-0-2"]}};
  week.r[0][day]="Paragraf · 20 soru";
  week.s[0][day]="TYT Fizik · Kuvvet";
  week.s[1][day]="AYT Matematik · Limit";
  const state={weeks:{[wk]:week},rowLabels:{r:["Paragraf"],s:["Fen","Mat"]}};
  const original=JSON.stringify(state);
  const tasks=api.refinedProgramTasks(state,wk,day);
  const groups=plain(api.refinedProgramDailyGroups(tasks));
  assert.deepEqual(groups.map(group=>group.key),["reading","math","physics"]);
  assert.deepEqual(groups.map(group=>group.tasks.map(t=>t.id)),[
    ["r-0-2"],["s-1-2"],["s-0-2"]
  ]);
  assert.equal(groups.at(-1).tasks[0].done,true);
  assert.equal(JSON.stringify(state),original);
});

test("grouped cards still use the existing task actions with no false changes to sync",()=>{
  assert.match(source,/for\(const group of refinedProgramDailyGroups\(state\.tasks\)\)/);
  assert.match(source,/section\.append\(groupHeading,cards\);list\.append\(section\)/);
  assert.match(source,/card\.append\(check,subjectIcon,details,chips\);cards\.append\(card\)/);
  assert.match(source,/controller\.toggleTask\(task\.id\)/);
  assert.match(source,/openDetail\(task,state\.week\)/);
  assert.match(source,/openEditor\(task,state\.week,"note"\)/);
  assert.match(source,/refinedProgramSubjectIcon\(group\.key\)/);
  assert.match(source,/<svg viewBox="0 0 24 24"/);
  assert.match(css,/data-v4-group="math"/);
  assert.match(css,/\.rb-v4-subject-heading/);
  assert.match(css,/\.rb-v4-subject-icon svg/);
  assert.match(css,/@media\(max-width:390px\)/);
  assert.doesNotMatch(source,/setDoc\(/);
});


test("group progress reflects completion without altering source data",()=>{
  const tasks=[
    task("t0","Matematik · 20 soru","Matematik",true),
    task("t1","AYT Matematik · 20 soru","Matematik",false),
    task("t2","Mat · Temel Kavramlar","Matematik",true)
  ];
  const group=plain(api.refinedProgramDailyGroups(tasks)).find(item=>item.key==="math");
  const before=JSON.stringify(group);
  assert.deepEqual(plain(api.refinedProgramDailyGroupProgress(group)),{done:2,total:3,percent:67});
  assert.equal(JSON.stringify(group),before);
  assert.deepEqual(plain(api.refinedProgramDailyGroupProgress({key:"other",title:"Diğer",tasks:[]})),{done:0,total:0,percent:0});
  assert.deepEqual(plain(api.refinedProgramDailyGroupProgress({key:"biology",title:"Biyoloji",tasks:[task("t9","Biyoloji", "Biyoloji",true)]})),{done:1,total:1,percent:100});
});

test("abbreviated subjects are grouped without reading an incidental topic keyword",()=>{
  for(const [work,expected] of [
    ["TYT Mat · Problemler","math"],
    ["AYT Geo · Üçgenler","geometry"],
    ["TYT Fiz · Hareket","physics"],
    ["TYT Kim · Asitler","chemistry"],
    ["Biyo · DNA","biology"],
    ["Problemler · 20 soru","math"],
    ["Paragraf · 25 soru","reading"],
    ["TYT Matematik · Biyoloji problemleri","math"],
    ["Deneme · Paragraf yanlışları","other"]
  ])assert.equal(api.refinedProgramDailyGroupKey(task("t1",work)),expected,work);
});

test("subject fold state is UI only, date scoped, keyboard accessible and survives task refresh",()=>{
  assert.match(source,/collapsedDailyGroups=new Set<string>\(\)/);
  assert.match(source,/groupId=state\.date\+"\|"\+group\.key/);
  assert.match(source,/groupHeading=button\("","rb-v4-subject-heading"\)/);
  assert.match(source,/groupHeading\.setAttribute\("aria-expanded",String\(!folded\)\)/);
  assert.match(source,/cards\.hidden=folded/);
  assert.match(source,/collapsedDailyGroups\.delete\(groupId\)/);
  assert.match(source,/collapsedDailyGroups\.add\(groupId\)/);
  assert.match(source,/groupProgress\.append\(progressFill\)/);
  assert.match(source,/groupName\.append\(element\("strong","",group\.title\),element\("small","",status\.done\+"\/"\+status\.total\+" tamamlandı"\)\)/);
  assert.match(source,/check\.dataset\.rbProgramFocus=task\.id/);
  assert.match(source,/replacement\?\.focus\(\{preventScroll:true\}\)/);
  assert.match(css,/\.rb-v4-subject-cards\[hidden\]\{display:none!important\}/);
  assert.match(css,/\.rb-v4-subject-heading:focus-visible/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
