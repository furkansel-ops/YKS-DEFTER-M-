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
  const remote={lab:{paragraphLog:[{id:1,at:10,wpm:180}],elementFav:[26],timelineFav:["t1"]}};
  const local={lab:{paragraphLog:[{id:2,at:20,wpm:220}],elementFav:[8,26],timelineFav:["t2"]}};
  const lab=core.mergeStates(remote,local,21).lab;
  assert.deepEqual(lab.paragraphLog.map(x=>x.id),[1,2]);
  assert.deepEqual(new Set(lab.elementFav),new Set([8,26]));
  assert.deepEqual(new Set(lab.timelineFav),new Set(["t1","t2"]));
});
