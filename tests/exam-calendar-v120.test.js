const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;

test("v120 hesap: plan doğrulama, kalan gün, sıralama ve geçmiş planların 7 gün kalması",()=>{
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",[
    'import assert from "node:assert/strict";',
    `import {makePlan,planRows} from "${url("src/domain/exam-calendar.ts")}";`,
    'const T="2026-11-14";',
    'assert.deepEqual(makePlan({date:"2026-11-21",name:"  Özdebir TYT-5  ",type:"AYT"},T,7),{id:7,date:"2026-11-21",name:"Özdebir TYT-5",type:"AYT"});',
    'assert.deepEqual(makePlan({date:T,name:"",type:"uydurma"},T,1),{id:1,date:T,name:"Deneme",type:"TYT"},"bugün olur; boş ad ve bilinmeyen tür varsayılana döner");',
    'for(const bad of ["2026-11-13","21.11.2026","","2026-13-40","2026-02-30",null])assert.equal(makePlan({date:bad},T,1),null,String(bad));',
    'assert.equal(makePlan({date:"2026-12-01",name:"x".repeat(200)},T,1).name.length,80);',
    'const rows=planRows([{id:3,date:"2026-12-01",name:"C",type:"TYT"},{id:1,date:"2026-11-14",name:"A",type:"TYT"},{id:2,date:"2026-11-10",name:"B",type:"AYT"},{id:4,date:"2026-11-01",name:"Eski",type:"TYT"},{id:5,date:"bozuk"},null,"x"],T);',
    'assert.deepEqual(rows.map(r=>[r.name,r.daysLeft]),[["B",-4],["A",0],["C",17]],"7 günden eski ve bozuk kayıt listelenmez");',
    'assert.equal(planRows([{id:1,date:"2027-01-02",name:"Y",type:"TYT"}],"2026-12-30")[0].daysLeft,3,"yıl geçişi");',
    'assert.deepEqual(planRows(undefined,T),[]);',
    'console.log("OK calendar");'
  ].join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/OK calendar/);
});

test("v120 bağlantı: Özet sekmesi kartı çizer; plan durumda saklanır ve içe aktarımda doğrulanır",()=>{
  const ui=read("src/ui/exam-calendar-v120.ts"),hub=read("src/ui/exam-hub-v73.ts"),shell=read("src/ui/refined-shell.ts"),app=read("app.js");
  assert.match(shell,/try\{installExamCalendarV120\(\);\}catch/);
  assert.match(hub,/html\+=\(L as Loose\)\.YKSExamCalendar\?\.html\(\)\?\?"";/);
  assert.match(app,/examTasks:\[\],examPlans:\[\],/);
  assert.match(app,/o\.examPlans=\(Array\.isArray\(o\.examPlans\)\?o\.examPlans:\[\]\)\.filter\(x=>x&&typeof x==="object"&&\/\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\/\.test\(x\.date\)\)\.slice\(-60\)/);
  assert.match(ui,/esc\(r\.name\)/);assert.match(ui,/if\(!plan\)\{toast\("Bugün ya da ileri bir tarih seç"\);return;\}/);
  assert.match(ui,/a==="result"\)\{list\.splice\(index,1\);commit\(\);/,"sonuç girilince plan kalkar");
  assert.match(ui,/aria-label="\$\{esc\(r\.name\)\} planını sil"/);
});
