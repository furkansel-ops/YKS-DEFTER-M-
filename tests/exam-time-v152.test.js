const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v152 süre analizi: ders ders boş, süre yanlışı, eğilim, öne çıkan ders ve toplam süre",()=>{
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",[
    'import assert from "node:assert/strict";',
    `import {timeReport} from "${pathToFileURL(path.join(root,"src/domain/exam-report.ts")).href}";`,
    'const sub={"Fen Bilimleri":["Fizik","Kimya","Biyoloji"]};',
    'const matches=(name,subject)=>name===subject||(sub[name]||[]).includes(subject);',
    // 4 deneme (eski → yeni). Fen boşları 4,6 → 10,12 (artıyor); Mat 12,10 → 6,4 (azalıyor); Türkçe hep 2.
    'const row=(f,m,t)=>[{name:"Fen Bilimleri",d:10,y:2,b:f},{name:"Matematik",d:20,y:4,b:m},{name:"Türkçe",d:30,y:4,b:t},{name:"Sosyal Bilimler",net:15}];',
    'const exams=[{id:1,dur:150,subjectResults:row(4,12,2)},{id:2,dur:0,subjectResults:row(6,10,2)},{id:3,dur:165,subjectResults:row(10,6,2)},{id:4,subjectResults:row(12,4,2)}];',
    'const wrongs=[{deneme:3,subject:"Fizik",kind:"sure",n:2},{deneme:4,subject:"Kimya",kind:"sure"},{deneme:4,subject:"Matematik",kind:"sure",n:1},{deneme:4,subject:"Türkçe",kind:"dikkat",n:5}];',
    'const r=timeReport(exams,wrongs,165,matches);',
    'assert.deepEqual(r.rows.map(x=>[x.name,x.avgBlank,x.sureWrongs,x.trend]),[["Fen Bilimleri",8,3,"up"],["Matematik",8,1,"down"],["Türkçe",2,0,""]],"yalnız net girilen ders yok; skora göre sıralı");',
    'assert.equal(r.worst,"Fen Bilimleri");',
    'assert.deepEqual(r.duration,{avg:157.5,count:2,limit:165},"yalnız girilmiş süreler");',
    // 3 denemede eğilim gösterilmez; süre hiç girilmemişse duration null
    'const r3=timeReport(exams.slice(0,3).map(e=>({...e,dur:0})),[],165,matches);',
    'assert.ok(r3.rows.every(x=>x.trend===""));assert.equal(r3.duration,null);',
    // Hiç boş, süre yanlışı ve süre yoksa kart yok; branş (limit 0) kart yok
    'assert.equal(timeReport([{subjectResults:[{name:"Matematik",d:40,y:0,b:0}]}],[],165,matches),null);',
    'assert.equal(timeReport(exams,wrongs,0,matches),null);',
    'assert.equal(timeReport([],[],165,matches),null);',
    'assert.equal(timeReport([{subjectResults:"bozuk"},null],[null,{kind:"sure"}],165,matches),null,"bozuk veri çökmez");',
    // Boş yok ama süre yanlışı var: öne çıkan ders yine bulunur
    'const r2=timeReport([{subjectResults:[{name:"Matematik",d:38,y:2,b:0}]}],[{deneme:9,subject:"Matematik",kind:"sure",n:2}],165,matches);',
    'assert.equal(r2.worst,"Matematik");assert.equal(r2.rows[0].sureWrongs,2);'
  ].join("\n")],{encoding:"utf8"});
  assert.equal(result.status,0,result.stderr||result.stdout);
});

test("v152 Süre kartı Analiz'de 'Net nereden gidiyor'un altında; boş artışı kötü, azalışı iyi renkte",()=>{
  const hub=read("src/ui/exam-hub-v73.ts"),css=read("src/ui/exam-hub-v73.css");
  assert.match(hub,/import \{[^}]*timeReport[^}]*\} from "\.\.\/domain\/exam-report\.ts";/);
  assert.match(hub,/const TIME_LIMIT:Record<string,number>=\{TYT:165,AYT:180,YDT:180\};/);
  const loss=hub.indexOf("<b>Net nereden gidiyor</b>"),time=hub.indexOf("html+=timeCard(range,wrongs,type);"),todo=hub.indexOf("/* 3 Ne yapmalı */");
  assert.ok(loss>0&&time>loss&&time<todo,"sıra: Net nereden gidiyor → Süre → Ne yapmalı");
  assert.match(hub,/timeReport\(range,wrongs,TIME_LIMIT\[type\]\?\?0,\(name,subject\)=>\{const c=canonical\(name\),s=canonical\(subject\);return c===s\|\|\(GROUP\[c\]\?\?\[\]\)\.includes\(s\);\}\)/);
  for(const text of ["<b>Süre</b>","Süre sana en çok ","süre yetmedi","▲ artıyor","▼ azalıyor ✓","Toplam süre: ortalama ","Ek bilgiler'e süre girersen burada görünür"])assert.ok(hub.includes(text),text);
  assert.match(hub,/x\.trend==="up"\?'<em class="down">▲ artıyor<\/em>':x\.trend==="down"\?'<em class="up">▼ azalıyor ✓<\/em>'/);
  assert.match(hub,/Süre sana en çok bu derste kaybettiriyor: <b>\$\{esc\(r\.worst\)\}<\/b>/,"ek almadan ders adı (Matematik'de hatası olmaz)");
  assert.match(css,/#deneme \.eh-time-row\{/);
});
