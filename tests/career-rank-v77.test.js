"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;
function run(lines,marker){
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",lines.join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,new RegExp(marker));
}

test("v77 rank eşikleri: TYT 120, AYT/YDT 80 üzerinden ölçekli; Bronz–Elmas üç kademe, üstü tek kademe",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {rankFor} from "${url("src/domain/exam-rank.ts")}";`,
    'const name=(n,m)=>rankFor(n,m).name;',
    'assert.equal(name(0),"Bronz I");assert.equal(name(19.99),"Bronz III");assert.equal(name(20),"Gümüş I");',
    'assert.equal(name(45),"Altın I");assert.equal(name(66.7),"Platin II");assert.equal(name(79.9),"Platin III");',
    'assert.equal(name(80),"Elmas I");assert.equal(name(105),"Usta");assert.equal(name(112),"Büyük Usta");assert.equal(name(118),"Efsane");',
    'assert.equal(name(38.5,80),"Altın III","AYT 80 üzerinden: Altın 26,67–40");assert.equal(name(53.4,80),"Elmas I");',
    'const p=rankFor(79,120);assert.equal(p.nextName,"Elmas");assert.equal(p.toNext,1);assert.ok(p.progress>.9&&p.progress<1);',
    'assert.equal(rankFor(120,120).nextName,null);assert.equal(rankFor(120,120).toNext,0);',
    'console.log("OK rank thresholds");'
  ],"OK rank thresholds");
});

test("v77 deneme rankı: son 3 geçerli deneme; aynı deneme bir kez; deneme yoksa rank yok; AYT alanın dersleri",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {computeExamRanks} from "${url("src/domain/exam-rank.ts")}";`,
    'const r=(name,net)=>({name,d:10,y:2,b:0,net});',
    'const tyt=(id,date,net)=>({id,type:"TYT",name:"T"+id,date,totalNet:net,subjectResults:[r("Türkçe",net)]});',
    'const state={puanTuru:"SAY",denemeler:[tyt(1,"2026-10-01",55),tyt(2,"2026-10-08",63),tyt(3,"2026-10-15",72),tyt(4,"2026-10-22",79),{...tyt(4,"2026-10-22",79),id:5},',
    '  {id:6,type:"TYT",name:"Boş",date:"2026-10-23",totalNet:0,subjectResults:[{name:"Türkçe",d:0,y:0,b:0,net:0}]},',
    '  {id:7,type:"AYT",name:"A1",date:"2026-10-20",totalNet:60,subjectResults:[r("Matematik",20),r("Fizik",8),r("Kimya",6),r("Biyoloji",4),r("Edebiyat",22)]}]};',
    'let ranks=computeExamRanks(state);',
    'assert.equal(ranks.tyt.net,71.33,"son 3: 63,72,79 (kopya ve boş deneme sayılmaz)");assert.equal(ranks.tyt.samples,3);assert.equal(ranks.tyt.name,"Platin II");',
    'assert.equal(ranks.ayt.label,"AYT Sayısal");assert.equal(ranks.ayt.net,38,"yalnız Mat+Fiz+Kim+Bio");assert.equal(ranks.ayt.max,80);',
    'assert.deepEqual(ranks.history.map(h=>h.change),["up","league-up","same","first"],"yeniden eskiye: 55 → 59 aynı (Altın III), 63,3 yeni lig, 71,3 kademe atladı");',
    'assert.equal(ranks.history.at(-1).name,"Altın III");',
    'state.puanTuru="EA";ranks=computeExamRanks(state);assert.equal(ranks.ayt.net,42,"EA: Mat+Edebiyat");assert.equal(ranks.ayt.label,"AYT Eşit Ağırlık");',
    'state.puanTuru="DIL";ranks=computeExamRanks(state);assert.equal(ranks.ayt,null);assert.equal(ranks.ydt,null);',
    'ranks=computeExamRanks({denemeler:[]});assert.equal(ranks.tyt,null);assert.equal(ranks.ayt,null);assert.deepEqual(ranks.history,[]);',
    'console.log("OK exam ranks");'
  ],"OK exam ranks");
});

test("v77 yeni XP kaynakları günlük sınırlı; kariyerden önceki kayıt sayılmaz; toplam = çalışma + rozet + görev",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {createGamificationProfile,calculateStudyGamification} from "${url("src/domain/study-gamification.ts")}";`,
    'const at=new Date("2026-10-08T10:00:00+03:00"),now=new Date("2026-10-09T20:00:00+03:00");',
    'const state={pomoMin:{},solved:{},topics:{},denemeler:[],wrongLog:[],errorJournal:[],paragraphProblem:{entries:[]}};',
    'state.gamification=createGamificationProfile(at,60,40,state);',
    'const later=at.getTime()+3600e3,d9="2026-10-09";',
    // P&P: 100 soru -> 50 ama sınır 40; kariyerden önceki kayıt sayılmaz
    'state.paragraphProblem.entries.push({date:d9,correct:80,wrong:15,blank:5,createdAt:later},{date:"2026-10-08",correct:40,wrong:0,blank:0,createdAt:at.getTime()-1000});',
    // 4 konu pekişti -> sınır 3; etkinleştirme günündeki sayılmaz
    'for(const k of ["a","b","c","d"])state.topics["TYT|Matematik|"+k]={st:3,ts:d9,rev:[]};state.topics["TYT|Matematik|eski"]={st:3,ts:"2026-10-08",rev:[]};',
    // 6 tekrar -> sınır 5
    'state.topics["TYT|Türkçe|x"]={st:2,revDone:{0:d9,1:d9,2:d9}};state.topics["TYT|Türkçe|y"]={st:2,revDone:{0:d9,1:d9,2:d9}};',
    // 3 deneme (biri kopya) -> 2 sayılır; biri yanlışları işlenmiş +20
    'state.denemeler.push({id:later,type:"TYT",name:"D1",date:d9,totalNet:70},{id:later+1,type:"TYT",name:"D1",date:d9,totalNet:70},{id:later+2,type:"AYT",name:"A1",date:d9,totalNet:40},{id:later+3,type:"TYT",name:"D3",date:d9,totalNet:72});',
    'state.wrongLog.push({id:1,deneme:later});',
    // 2 hata çözüldü, biri kariyerden önce
    'state.errorJournal.push({resolved:true,resolvedAt:new Date("2026-10-09T12:00:00+03:00").getTime()},{resolved:true,resolvedAt:at.getTime()-5000},{resolved:false,resolvedAt:0});',
    'const snap=calculateStudyGamification(state,now);',
    'assert.deepEqual({...snap.todayXp},{focus:0,questions:0,goal:0,pp:40,topics:90,reviews:50,exams:100,errors:10,total:290});',
    'assert.equal(snap.xpSources.study,290);assert.equal(snap.xp,snap.xpSources.study+snap.xpSources.badges+snap.xpSources.tasks);',
    'assert.equal("rank" in snap,false,"seviye unvanı yok");',
    'console.log("OK activity xp");'
  ],"OK activity xp");
});

test("v77 arayüz: seviye unvanı kalktı; Kariyerim'de rank kartı, bugünün XP'si ve rank geçmişi; rozet özgün SVG",()=>{
  const domain=read("src/domain/study-gamification.ts"),ui=read("src/ui/study-gamification.ts"),card=read("src/ui/career-rank-v77.ts"),emblem=read("src/ui/rank-emblem.ts");
  assert.doesNotMatch(domain,/Acemi|Çırak|Savaşçı|YKS Efsanesi/);
  assert.doesNotMatch(ui,/snapshot\.rank\b|Yeni unvan/);
  assert.match(ui,/root\.append\(hero,renderRankHero\(readState\(\) as Record<string,unknown>\|null\)\);/,"kariyer başlatılmasa da rank görünür");
  assert.match(ui,/root\.append\(top,stats,renderTodayXp\(snapshot\)\);/);
  assert.match(ui,/"Seviye "\+snapshot\.level\+\(tyt\?" · TYT "\+tyt\.name:""\)/);
  assert.match(card,/Henüz derecelendirilmedin/);
  assert.match(card,/İlk denemeni ekle ›/);
  assert.match(card,/ligine \$\{fmt\(main\.toNext\)\} net kaldı/);
  assert.match(emblem,/small=size<44/);
  assert.match(emblem,/\["I","II","III"\]\[tier-1\]/);
  for(const league of ["Bronz","Gümüş","Altın","Platin","Elmas","Usta","Büyük Usta","Efsane"])assert.ok(emblem.includes(`n:"${league}"`),league);
});

test("v77 koça seviye ve deneme rankı gider; alanlar temizlenir",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/targetDepartment:text\(s\.targetDepartment,120\),career:careerShare\(\)\}/);
  const fn=runtime.match(/function careerShare\(\)\{[\s\S]*?\n\}/)[0];
  const share=summary=>vm.runInNewContext(`const window={YKSCareer:{summary:()=>(${JSON.stringify(summary)})}};const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;const text=(v,n)=>String(v??"").trim().slice(0,n);${fn};careerShare()`);
  assert.deepEqual(JSON.parse(JSON.stringify(share({level:12.7,xp:5370,tyt:{label:"TYT",name:"Platin III",net:79.123,league:3,tier:3},ayt:null,ydt:null}))),{level:12,xp:5370,tyt:{label:"TYT",name:"Platin III",net:79.12,league:3,tier:3},ayt:null,ydt:null});
  assert.equal(share(null),null);
  assert.match(read("src/ui/study-gamification.ts"),/YKSCareer=\{summary:\(\)=>\{const s=readState\(\);return careerSummary\(/);
});
