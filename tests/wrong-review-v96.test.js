"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;
function run(lines,marker){
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",lines.join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,new RegExp(marker));
}

test("v96 tekrar sırası: 3 gün, 7 gün, sonra öğrenildi; yanlış seriyi sıfırlar, bozuk kayıt bugün sorulur",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {answerRep,isDue,readRep,LEARNED_AFTER} from "${url("src/domain/wrong-review.ts")}";`,
    'assert.equal(LEARNED_AFTER,3);',
    'assert.ok(isDue(undefined,"2026-11-08"),"yeni fotoğraflı yanlış bugün sorulur");',
    'assert.ok(isDue({due:"bozuk"},"2026-11-08"));assert.equal(readRep({due:"2026-11-09",ok:-4,miss:"x"}).ok,0);',
    'let a=answerRep(undefined,true,"2026-11-08");assert.deepEqual(a,{rep:{due:"2026-11-11",ok:1,miss:0},learned:false});',
    'assert.ok(!isDue(a.rep,"2026-11-10"));assert.ok(isDue(a.rep,"2026-11-11"));',
    'a=answerRep(a.rep,true,"2026-11-11");assert.equal(a.rep.due,"2026-11-18");assert.equal(a.learned,false);',
    'const miss=answerRep(a.rep,false,"2026-11-18");assert.deepEqual(miss,{rep:{due:"2026-11-19",ok:0,miss:1},learned:false});',
    'a=answerRep(a.rep,true,"2026-11-18");assert.equal(a.learned,true);assert.equal(a.rep.ok,3);',
    'assert.equal(answerRep({due:"2026-12-31",ok:0,miss:0},true,"2026-12-31").rep.due,"2027-01-03","yıl geçişi");',
    'console.log("OK rep");'
  ],"OK rep");
});

test("v96 Hatalar sekmesinde Tekrar çöz düğmesi ve pencere bağlı; öğrenilen yanlış çözüldü olur",()=>{
  const hub=read("src/ui/exam-hub-v73.ts"),ui=read("src/ui/wrong-review-v96.ts"),shell=read("src/ui/refined-shell.ts");
  assert.match(hub,/due:photos>0&&isDue\(w\.rep,today\(\)\)/);
  assert.match(hub,/data-act="wrong-review"/);
  assert.match(hub,/YKSWrongReview\?\.open/);
  assert.match(ui,/answerRep\(/);
  assert.match(ui,/learned&&errorRows\(\)[^;]*resolved===false\)\{learnedCount\+\+;toggleError\(/,"yalnız açık yanlış çözüldü yapılır");
  assert.ok(ui.includes("/^data:image"+String.fromCharCode(92)+"//"),"yalnız data:image fotoğraf gösterilir");
  assert.match(shell,/installWrongReviewV96\(\)/);
});

test("v97 koça tekrar sonuçları: açık fotoğraflı yanlışlar, öğrenilen sayısı; fotoğraf ve bozuk kayıt gitmez",()=>{
  const vm=require("node:vm"),src=read("public/student-coaching-runtime.js");
  const pick=re=>{const m=src.match(re);assert.ok(m,String(re));return m[0];};
  const share=vm.runInNewContext([pick(/const text=.*?;\n/),pick(/const list=.*?;\n/),pick(/const finite=.*?;\n/),pick(/function wrongReviewShare\(s,day\)\{.*\n/)].join("")+"wrongReviewShare");
  const img="data:image/jpeg;base64,AAAA";
  const out=share({wrongLog:[
    {id:1,questionImgs:[img]},
    {id:2,questionImgs:[img],rep:{due:"2026-11-20",ok:2,miss:1}},
    {id:3,questionImgs:[img],rep:{due:"2026-11-08",ok:3,miss:0}},
    {id:4,questionImgs:[],rep:{due:"2026-11-01",ok:1,miss:0}},
    {id:5,questionImgs:[img],rep:{due:"bozuk",ok:9,miss:-2}}
  ],errorJournal:[{sourceRef:"wrong:3",resolved:true}]},"2026-11-08");
  assert.equal(JSON.stringify(out),JSON.stringify({learned:1,due:2,waiting:1,items:{"2":{ok:2,miss:1,due:"2026-11-20"}}}));
  assert.ok(!JSON.stringify(out).includes("data:image"));
  assert.match(src,/books:booksShare\(s\),wrongReview:wrongReviewShare\(s,today\(\)\),/);
});
