"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process"),{pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),url=p=>pathToFileURL(path.join(root,p)).href;
function run(lines){
  const r=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",lines.join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(r.status,0,r.stdout+"\n"+r.stderr);assert.match(r.stdout,/OK/);
}

test("v98 koçun kitap görevinden son test okunur; başka kitabın görevi ya da düz metin eşleşmez",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {bookTaskEnd} from "${url("src/domain/book-catalog.ts")}";`,
    'const n="345 TYT Matematik Soru Bankası";',
    'assert.equal(bookTaskEnd("Koç · 📚 "+n+" · 18–20. testler · 39 soru",n),20);',
    'assert.equal(bookTaskEnd("Koç · 📚 "+n+" · 18. test · 13 soru",n),18);',
    'assert.equal(bookTaskEnd("📚 "+n+" · 7-9. testler",n),9);',
    'assert.equal(bookTaskEnd("Koç · 📚 "+n+" Ek · 3. test",n),null,"ad tam eşleşmeli");',
    'assert.equal(bookTaskEnd("Koç · 📚 "+n+" · Problemler çalış",n),null);',
    'assert.equal(bookTaskEnd("Matematik soru çöz",n),null);',
    'console.log("OK");'
  ]);
});

test("v98 lig bildirimi: yalnız aynı sınav türünde lig yükselince; ilk ölçümde ve düşüşte yok",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {leagueUp,computeExamRanks} from "${url("src/domain/exam-rank.ts")}";`,
    'const ex=(id,net)=>({id,type:"TYT",date:"2026-10-"+String(id).padStart(2,"0"),name:"D"+id,totalNet:net,netOnly:true});',
    'const s={puanTuru:"SAY",denemeler:[ex(1,35)]};',
    'let r=leagueUp(null,computeExamRanks(s));assert.equal(r.up,null);assert.equal(r.leagues.TYT,1);',
    's.denemeler=[ex(1,35),ex(2,36)];r=leagueUp(r.leagues,computeExamRanks(s));assert.equal(r.up,null,"aynı lig");',
    's.denemeler=[ex(1,35),ex(2,36),ex(3,70)];const up=leagueUp(r.leagues,computeExamRanks(s));',
    'assert.equal(up.up?.exam,"TYT");assert.equal(up.up?.league,2);assert.match(up.up.name,/^Altın/);',
    's.denemeler=[ex(1,35),ex(2,36),ex(3,70),ex(4,0),ex(5,0)];assert.equal(leagueUp(up.leagues,computeExamRanks(s)).up,null,"düşüşte yok");',
    'console.log("OK");'
  ]);
});

test("v98 bağlantılar: +test koç görevini işaretler, kutlama refresh'te, kitap coach_note/book_add ile gelir",()=>{
  const ui=read("src/ui/books-v89.ts"),game=read("src/ui/study-gamification.ts"),rt=read("public/student-coaching-runtime.js");
  assert.match(ui,/const tasks=moved&&n>0\?completeBookTasks\(moved\):0/);
  assert.match(ui,/setDone\(wk,cid,true\)/);
  assert.match(game,/previousLeagues=null;activeTab/,"hesap değişince sıfırlanır");
  assert.match(game,/if\(league\.up\)celebrate\(/);
  assert.match(rt,/a\.type==="coach_note"&&p\.operation==="book_add"/);
  assert.doesNotMatch(read("firestore.rules"),/book_add/,"kural değişmedi");
});

test("v98 deneme analizinde Atla onay sormadan geçer (onay penceresi açılmayan tarayıcıda da)",()=>{
  const vm=require("node:vm"),src=read("app.js"),pick=name=>{const i=src.indexOf("function "+name+"(");return src.slice(i,src.indexOf("\n}\n",i)+3)};
  const ov={style:{display:"flex"}},calls=[],ctx={anaId:7,el:()=>ov,anaMarked:()=>0,confirm:()=>{throw new Error("sorulmamalı")},toast:m=>calls.push(["toast",m]),showRefl:id=>calls.push(["refl",id])};
  vm.createContext(ctx);vm.runInContext(pick("closeAnalysis")+pick("skipAnalysis"),ctx);
  assert.equal(vm.runInContext("skipAnalysis()",ctx),true);
  assert.equal(ov.style.display,"none");assert.equal(ctx.anaId,null);
  assert.deepEqual(calls.map(c=>c[0]),["refl","toast"]);assert.match(calls[1][1],/Yanlışları işle/);
});
