"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v80 koça hızlı okuma özeti gider: yalnız sayılar, son 30 gün geçerli testler",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/career:careerShare\(\),reading:readingShare\(s\)\}/,"profil içinde (kurallar yalnız üst anahtarları denetler)");
  const fn=runtime.match(/function readingShare\(s\)\{[\s\S]*?\n\}/)[0];
  const now=Date.now(),day=86400000;
  const share=s=>JSON.parse(JSON.stringify(vm.runInNewContext(`const list=v=>Array.isArray(v)?v:[];const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;${fn};readingShare(s)`,{s})));
  assert.equal(share({}),null);
  const t=(at,wpm,comprehension,readingMs=60000)=>({kind:"test",at,wpm,comprehension,readingMs});
  const result=share({speedReading:{lessons:{groups:1,voice:2},sessions:[t(now-40*day,150,50),t(now-5*day,200,80),t(now-2*day,240,100),t(now-day,999,100,3000),{kind:"exercise",at:now,wpm:300,comprehension:100,readingMs:60000}]}});
  assert.deepEqual(result,{tests30:2,wpm30:220,comprehension30:90,lessons:2,last:{at:now-2*day,wpm:240,comprehension:100}},"kısa ölçüm ve egzersiz sayılmaz");
});
