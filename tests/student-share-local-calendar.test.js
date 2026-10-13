const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const read=file=>fs.readFileSync(path.join(__dirname,"..",file),"utf8");
const runtime=read("public/student-coaching-runtime.js").replace(/^import[^\n]+\n/,"");

function fixture(t,{iso,timezone,state}){
  const previous=process.env.TZ;
  process.env.TZ=timezone;
  t.after(()=>{if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous});
  const stamp=Date.parse(iso);
  class Clock extends Date{
    constructor(...args){if(!args.length)super(stamp);else super(...args)}
    static now(){return stamp}
  }
  const window={S:state,dispatchEvent(){}};
  const context=vm.createContext({window,Date:Clock,Promise,console,
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},
    document:{documentElement:{dataset:{}}},
    serverTimestamp:()=>({kind:"server-timestamp"})
  });
  vm.runInContext(runtime,context,{filename:"student-coaching-runtime.js"});
  return{context,studentPayload:()=>JSON.parse(JSON.stringify(vm.runInContext(
    'sharePayload(window.S,{uid:"student-test",displayName:"Test Öğrenci"})',context
  )))};
}

test("Türkiye'de gece yarısından sonra odak süresi ve sorular doğru takvim gününde görünür",t=>{
  const state={pomoMin:{"2026-10-14":75,"2026-10-13":25},
    solved:{"2026-10-14":17,"2026-10-13":5},
    pomoSubj:{"2026-10-14":{Matematik:75},"2026-10-13":{Fizik:25}},
    solvedTopic:{"2026-10-14":{"TYT|Matematik|Problemler":17}},
    topics:{},denemeler:[],wrongLog:[],weeks:{}};
  const h=fixture(t,{iso:"2026-10-13T22:20:00Z",timezone:"Europe/Istanbul",state});
  const payload=h.studentPayload(),daily=payload.progress.daily14;
  assert.equal(daily.length,14);
  assert.equal(daily.at(-1).date,"2026-10-14");
  assert.equal(daily.at(-1).minutes,75);
  assert.equal(daily.at(-1).questions,17);
  assert.equal(daily.at(-2).date,"2026-10-13");
  assert.equal(daily.at(-2).minutes,25);
  assert.equal(payload.progress.minutes7,100);
  assert.equal(payload.progress.questions7,22);
  assert.equal(payload.progress.subjects7.find(x=>x.name==="Matematik").minutes,75);
  assert.equal(payload.progress.subjects7.find(x=>x.name==="Matematik").questions,17);
});

test("takvim aralığı yaz saati geçişinde 7 benzersiz yerel günü korur",t=>{
  const state={pomoMin:{"2026-03-08":15,"2026-03-07":10},solved:{},topics:{},weeks:{}};
  const h=fixture(t,{iso:"2026-03-09T03:10:00Z",timezone:"America/New_York",state});
  const daily=h.studentPayload().progress.daily14;
  assert.equal(daily.at(-1).date,"2026-03-08");
  assert.equal(daily.at(-2).date,"2026-03-07");
  assert.equal(new Set(daily.map(x=>x.date)).size,14);
  assert.equal(h.studentPayload().progress.minutes7,25);
});

test("tek öğrenci paylaşımı koçun program, hata, konu ve deneme alanlarını birlikte karşılar",t=>{
  const state={
    name:"Test Öğrenci",weeks:{"2026-10-12":{
      s:[["TYT Matematik · Problemler","","","","","",""]],
      r:[],dn:{"s-0-0":true},done:[false,false,false,false,false,false,false]
    }},rows:{s:1,r:1},rowLabels:{s:["Matematik"],r:["Rutin"]},
    pomoMin:{"2026-10-14":40},solved:{"2026-10-14":10},
    topics:{"TYT|Matematik|Üslü Sayılar":{st:1,dl:"2026-10-12"}},
    wrongLog:[{date:"2026-10-13",subject:"Matematik",topic:"Üslü Sayılar",n:3}],
    denemeler:[{id:"t1",date:"2026-10-13",type:"TYT",name:"Deneme",
      totalNet:38,subjectResults:[{name:"Matematik",net:21}]}]
  };
  const h=fixture(t,{iso:"2026-10-13T22:20:00Z",timezone:"Europe/Istanbul",state});
  const shared=h.studentPayload();
  assert.equal(shared.studentUid,"student-test");
  assert.equal(shared.program.weeks[0].week,"2026-10-12");
  assert.equal(shared.program.weeks[0].data.s["0"][0],"TYT Matematik · Problemler");
  assert.equal(shared.program.weeks[0].data.dn["s-0-0"],true);
  assert.equal(shared.progress.minutes7,40);
  assert.equal(shared.errorJournal[0].n,3);
  assert.equal(shared.errorJournal[0].topic,"Üslü Sayılar");
  assert.equal(shared.topics.items[0].st,1);
  assert.equal(shared.topics.items[0].deadline,"2026-10-12");
  assert.equal(shared.exams[0].subjectResults[0].net,21);
  // Firestore allows arrays of objects, but not arrays directly nested in arrays.
  function assertSafe(value,parentIsArray=false){
    if(Array.isArray(value)){
      assert.equal(parentIsArray,false,"nested arrays are rejected by Firestore");
      value.forEach(item=>assertSafe(item,true));
    }else if(value&&typeof value==="object"){
      Object.values(value).forEach(item=>assertSafe(item,false));
    }
  }
  assertSafe(shared.program);
});

test("deployed student runtime query changes so old cached UTC report code is not loaded",()=>{
  const loader=read("src/ui/student-account-loader.ts");
  assert.match(loader,/student-coaching-runtime\.js\?v=1\.2\.21-localday/);
  assert.match(runtime,/function localDayOffset/);
  assert.doesNotMatch(runtime,/Date\.now\(\)-i\*DAY\)\.toISOString\(\)\.slice\(0,10\)/);
});
