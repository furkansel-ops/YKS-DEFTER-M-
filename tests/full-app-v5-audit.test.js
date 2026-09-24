const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");

test("V5 tam uygulama envanteri bütün ekranları kapsar",()=>{
  const required=[
    ["home","src/ui/today-v43.ts","src/ui/today-v43.css"],
    ["program","src/ui/program-v5.ts","src/ui/program-v5.css"],
    ["topics","src/ui/topics-v5.ts","src/ui/topics-v5.css"],
    ["deneme","src/ui/exams-v5.ts","src/ui/exams-v5.css"],
    ["progress","src/ui/progress-v5.ts","src/ui/progress-v5.css"],
    ["pomo","src/ui/focus-v5.ts","src/ui/focus-v5.css"],
    ["pp","src/ui/paragraph-problem-tracker.ts","src/ui/paragraph-problem-tracker.css"],
    ["more","src/ui/more-v5.ts","src/ui/more-v5.css"]
  ];
  for(const [id,ts,css] of required){
    assert.ok(fs.existsSync(path.join(root,ts)),id+" ts");
    assert.ok(fs.existsSync(path.join(root,css)),id+" css");
  }
});
test("V5 Merkez envanteri bütün fiziksel panelleri kapsar",()=>{
  const source=read("src/ui/more-v5.ts");
  for(const id of ["mrp_lab","mrp_kay","mrp_tak","mrp_roz","mrp_veri","mrp_ayar","v30AboutPanel"])assert.match(source,new RegExp(id));
});
test("V5 yeni ekran katmanları mobil davranış taşır",()=>{
  for(const file of ["src/ui/topics-v5.css","src/ui/exams-v5.css","src/ui/more-v5.css","src/ui/paragraph-problem-tracker.css"]){
    const css=read(file);
    assert.match(css,/@media\(max-width:760px\)/,file);
    assert.match(css,/prefers-reduced-motion:reduce/,file);
  }
});
