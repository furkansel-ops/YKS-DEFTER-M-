"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const runtime=fs.readFileSync(path.join(root,"public/student-coaching-runtime.js"),"utf8");
const fn=runtime.match(/function topicsShare\(s\)\{[\s\S]*?\n\}/)[0];
const helpers='const list=v=>Array.isArray(v)?v:[];const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;const text=(v,n)=>String(v??"").trim().slice(0,n);'+
  'function topicParts(k){const p=String(k||"").split("|");return{exam:p[0]||"YKS",subject:p[1]||"Ders",topic:p.slice(2).join("|")||p[1]||k}}';
const share=(state,curriculum)=>JSON.parse(JSON.stringify(vm.runInNewContext(helpers+(curriculum?"const CURRICULUM="+JSON.stringify(curriculum)+";":"")+fn+";topicsShare(state)",{state})));

test("v86 koça müfredatın tamamı gider; dokunulmamış konu st:0; isteğe bağlı alanlar yalnız varsa",()=>{
  const curriculum={TYT:[{name:"Matematik",topics:["Problemler","Olasılık"]}],AYT:[{name:"Fizik (AYT)",topics:["Optik"]}],YDT:[]};
  const out=share({topics:{
    "TYT|Matematik|Problemler":{st:2,conf:2,dl:"2026-11-10",ts:"2026-10-01",rev:[0]},
    "AYT|Fizik (AYT)|Optik":{st:3,conf:9,ts:"2026-10-20",rev:[1,0,1,7]},
    "TYT|Türkçe|Kendi konum":{st:1}
  }},curriculum);
  assert.equal(out.full,true);
  assert.deepEqual(out.items.map(x=>x.key),["TYT|Matematik|Problemler","TYT|Matematik|Olasılık","AYT|Fizik (AYT)|Optik","TYT|Türkçe|Kendi konum"]);
  assert.deepEqual(out.items[0],{key:"TYT|Matematik|Problemler",exam:"TYT",subject:"Matematik",topic:"Problemler",st:2,deadline:"2026-11-10",conf:2},"pekişmemiş konuda tekrar bilgisi gitmez");
  assert.deepEqual(out.items[1],{key:"TYT|Matematik|Olasılık",exam:"TYT",subject:"Matematik",topic:"Olasılık",st:0,deadline:""});
  assert.deepEqual(out.items[2],{key:"AYT|Fizik (AYT)|Optik",exam:"AYT",subject:"Fizik (AYT)",topic:"Optik",st:3,deadline:"",ts:"2026-10-20",rev:[0,1]},"geçersiz güven ve tekrar sırası atılır");
  assert.ok(out.items.every(item=>Object.values(item).every(v=>v!==undefined)));
});

test("v86 müfredat yoksa eski davranış: yalnız kayıtlı konular, full işareti yok",()=>{
  const out=share({topics:{"TYT|Matematik|Problemler":{st:1}}},null);
  assert.equal(out.full,undefined);assert.deepEqual(out.items.map(x=>x.key),["TYT|Matematik|Problemler"]);
  assert.match(runtime,/const topicShare=topicsShare\(s\),topics=topicShare\.items;/);
  assert.match(runtime,/topics:topicShare,errorJournal/);
  assert.match(runtime,/window\.YKSAccountAuth=\{version:"1.2.34"/);
});

test("v86 gerçek müfredatla 240 konu gider (500 sınırının altında)",()=>{
  const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
  const CURRICULUM=new Function(app.slice(app.indexOf("const CURRICULUM="),app.indexOf("const ALL_SUBJECTS"))+";return CURRICULUM")();
  const out=share({topics:{}},CURRICULUM);
  assert.equal(out.items.length,240);assert.ok(out.items.every(item=>item.st===0));
  assert.ok(JSON.stringify(out).length<40000,"belge boyutu küçük kalır");
});
