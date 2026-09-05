const test=require("node:test");
const assert=require("node:assert/strict");
const core=require("../modules/core-utils.js");

test("cihazlar arası benzersiz kayıtlar korunur",()=>{
  const remote={v:21,denemeler:[{id:1,name:"Bulut",at:10}],wrongLog:[{id:4,topic:"Paragraf",at:12}],solved:{"2026-08-24":80}};
  const local={v:21,denemeler:[{id:2,name:"Tablet",at:20}],wrongLog:[{id:5,topic:"Problemler",at:22}],solved:{"2026-08-24":65,"2026-08-23":40}};
  const merged=core.mergeStates(remote,local,21);
  assert.deepEqual(merged.denemeler.map(x=>x.id).sort(),[1,2]);
  assert.deepEqual(merged.wrongLog.map(x=>x.id).sort(),[4,5]);
  assert.equal(merged.solved["2026-08-24"],80);
  assert.equal(merged.solved["2026-08-23"],40);
});

test("konu ilerlemesi ve tekrar geçmişi kaybolmaz",()=>{
  const key="TYT|Matematik|Problemler";
  const merged=core.mergeStates({topics:{[key]:{st:2,conf:4,rev:[0],revDone:{0:"2026-08-20"}}}},{topics:{[key]:{st:3,conf:3,rev:[1],revDone:{1:"2026-08-24"}}}},21);
  assert.equal(merged.topics[key].st,3);
  assert.equal(merged.topics[key].conf,4);
  assert.deepEqual(merged.topics[key].rev,[0,1]);
  assert.equal(merged.topics[key].revDone[1],"2026-08-24");
});

test("haftalık planın farklı hücreleri birleştirilir",()=>{
  const empty=()=>[["","","","","","",""]];
  const remote={weeks:{"2026-08-24":{r:empty(),s:[["Matematik","","","","","",""]],done:[false,false,false,false,false,false,false],dn:{}}}};
  const local={weeks:{"2026-08-24":{r:empty(),s:[["","Türkçe","","","","",""]],done:[true,false,false,false,false,false,false],dn:{"s-0-1":1}}}};
  const week=core.mergeStates(remote,local,21).weeks["2026-08-24"];
  assert.equal(week.s[0][0],"Matematik");
  assert.equal(week.s[0][1],"Türkçe");
  assert.equal(week.done[0],true);
  assert.equal(week.dn["s-0-1"],1);
});

test("öğrenme kartında daha yeni düzenleme kazanır",()=>{
  const remote={learning:{cards:[{id:9,q:"Eski",a:"A",updatedAt:10}],formulaFav:["m-square-plus"],reviewLog:[]}};
  const local={learning:{cards:[{id:9,q:"Yeni",a:"B",updatedAt:20}],formulaFav:["p-newton"],reviewLog:[{id:7,at:30,grade:2}]}};
  const learning=core.mergeStates(remote,local,21).learning;
  assert.equal(learning.cards[0].q,"Yeni");
  assert.deepEqual(new Set(learning.formulaFav),new Set(["m-square-plus","p-newton"]));
  assert.equal(learning.reviewLog.length,1);
});

test("aralıklı tekrar aralıkları nota göre büyür",()=>{
  const today="2026-08-24";
  const first=core.srsNext({interval:0,ease:2.5,reps:0,lapses:0},2,today);
  assert.equal(first.interval,1);
  assert.equal(first.due,"2026-08-25");
  const second=core.srsNext(first,2,first.due);
  assert.equal(second.interval,3);
  const failed=core.srsNext(second,0,second.due);
  assert.equal(failed.interval,1);
  assert.equal(failed.reps,0);
  assert.equal(failed.lapses,1);
});

test("Öğrenme Laboratuvarı kayıtları cihazlar arasında birleşir",()=>{
  const remote={lab:{paragraphLog:[{id:1,at:10,wpm:180}],elementFav:[26],timelineFav:["t1"],topicFav:["TYT|Matematik|Problemler"]}};
  const local={lab:{paragraphLog:[{id:2,at:20,wpm:220}],elementFav:[8,26],timelineFav:["t2"],topicFav:["AYT|Fizik (AYT)|Dalgalar"]}};
  const lab=core.mergeStates(remote,local,21).lab;
  assert.deepEqual(lab.paragraphLog.map(x=>x.id),[1,2]);
  assert.deepEqual(new Set(lab.elementFav),new Set([8,26]));
  assert.deepEqual(new Set(lab.timelineFav),new Set(["t1","t2"]));
  assert.deepEqual(new Set(lab.topicFav),new Set(["TYT|Matematik|Problemler","AYT|Fizik (AYT)|Dalgalar"]));
});

test("üç yönlü eşitleme silinen kaydı yeniden diriltmez ve uzak eklemeyi korur",()=>{
  const base={v:21,denemeler:[{id:1,name:"Silinecek",at:10}]};
  const remote={v:21,denemeler:[{id:1,name:"Silinecek",at:10},{id:2,name:"Diğer cihaz",at:20}]};
  const local={v:21,denemeler:[]};
  const merged=core.mergeStates(remote,local,21,base);
  assert.deepEqual(merged.denemeler,[{id:2,name:"Diğer cihaz",at:20}]);
});

test("üç yönlü eşitleme sayaç azaltmasını ve boşaltılan program hücresini korur",()=>{
  const week={r:[["","","","","","",""]],s:[["Matematik","","","","","",""]],done:[false,false,false,false,false,false,false],dn:{}};
  const base={v:21,solved:{"2026-09-04":80},weeks:{w:week}};
  const remote={v:21,solved:{"2026-09-04":80,"2026-09-05":30},weeks:{w:{...week,s:[["Matematik","Türkçe","","","","",""]]}}};
  const local={v:21,solved:{"2026-09-04":60},weeks:{w:{...week,s:[["","","","","","",""]]}}};
  const merged=core.mergeStates(remote,local,21,base);
  assert.equal(merged.solved["2026-09-04"],60);
  assert.equal(merged.solved["2026-09-05"],30);
  assert.equal(merged.weeks.w.s[0][0],"");
  assert.equal(merged.weeks.w.s[0][1],"Türkçe");
});

test("üç yönlü eşitleme aynı güne iki cihazın eklediği oturumları korur",()=>{
  const base={v:21,sessions:{"2026-09-04":[]}};
  const remote={v:21,sessions:{"2026-09-04":[{t:10,subj:"Türkçe",topic:"Paragraf",type:"work",m:25}]}};
  const local={v:21,sessions:{"2026-09-04":[{t:20,subj:"Matematik",topic:"Problemler",type:"work",m:40}]}};
  const merged=core.mergeStates(remote,local,21,base);
  assert.deepEqual(merged.sessions["2026-09-04"].map(x=>x.t).sort(),[10,20]);
  assert.deepEqual(core.mergeStates(merged,merged,21,merged),merged);
});

test("üç yönlü eşitleme sözleşme, sabah ve iç içe kayıt eklerini kaybetmez",()=>{
  const base={v:21,morning:{day:"2026-09-05",done:[],hidden:false},contracts:[],teachers:[{id:1,a:"Hoca",d:[],l:"hepsi",n:""}],books:[{id:2,name:"Kaynak",done:0,log:[]}]};
  const remote={v:21,morning:{day:"2026-09-05",done:["plan"],hidden:false},contracts:[{wk:"2026-08-31",saat:10,soru:0,deneme:0,not:"",at:10}],teachers:[{id:1,a:"Hoca",d:["Matematik"],l:"hepsi",n:""}],books:[{id:2,name:"Kaynak",done:1,log:[{d:"2026-09-04",n:1}]}]};
  const local={v:21,morning:{day:"2026-09-05",done:["tekrar"],hidden:false},contracts:[{wk:"2026-09-08",saat:12,soru:0,deneme:0,not:"",at:20}],teachers:[{id:1,a:"Hoca",d:["Fizik"],l:"hepsi",n:""}],books:[{id:2,name:"Kaynak",done:2,log:[{d:"2026-09-05",n:2}]}]};
  const merged=core.mergeStates(remote,local,21,base);
  assert.deepEqual(new Set(merged.morning.done),new Set(["plan","tekrar"]));
  assert.deepEqual(new Set(merged.contracts.map(x=>x.wk)),new Set(["2026-08-31","2026-09-08"]));
  assert.deepEqual(new Set(merged.teachers[0].d),new Set(["Matematik","Fizik"]));
  assert.deepEqual(new Set(merged.books[0].log.map(x=>x.d)),new Set(["2026-09-04","2026-09-05"]));
});

test("üç yönlü eşitleme aynı gün tekrarlanan kaynak hareketlerini ve toplam deltayı korur",()=>{
  const base={v:21,books:[{id:2,name:"Kaynak",total:100,done:10,log:[{d:"2026-09-05",n:1}]}]};
  const remote={v:21,books:[{id:2,name:"Kaynak",total:100,done:12,log:[{d:"2026-09-05",n:1},{d:"2026-09-05",n:1},{d:"2026-09-05",n:1}]}]};
  const local={v:21,books:[{id:2,name:"Kaynak",total:100,done:15,log:[{d:"2026-09-05",n:1},{d:"2026-09-05",n:5}]}]};
  const book=core.mergeStates(remote,local,21,base).books[0];
  assert.equal(book.done,17);
  assert.equal(book.log.filter(x=>x.d==="2026-09-05"&&x.n===1).length,3);
  assert.equal(book.log.filter(x=>x.d==="2026-09-05"&&x.n===5).length,1);
  const capped=core.mergeStates(
    {v:21,books:[{id:3,name:"Biten",total:100,done:100,log:[]}]},
    {v:21,books:[{id:3,name:"Biten",total:100,done:100,log:[]}]},21,
    {v:21,books:[{id:3,name:"Biten",total:100,done:90,log:[]}]}
  ).books[0];
  assert.equal(capped.done,100);
});

test("sabah listesi farklı günler arasında tamamlanma taşımaz",()=>{
  const base={v:21,morning:{day:"2026-09-04",done:["eski"],hidden:false}};
  const remote={v:21,morning:{day:"2026-09-05",done:["plan"],hidden:false}};
  const local={v:21,morning:{day:"2026-09-06",done:["tekrar"],hidden:true}};
  assert.deepEqual(core.mergeStates(remote,local,21,base).morning,local.morning);
});
