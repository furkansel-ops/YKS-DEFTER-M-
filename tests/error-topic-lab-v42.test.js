const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const bridge=require("../modules/error-topic-lab-v42.js");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.2 Hata Defteri bağlantısı aynı konudaki yanlışları tarih çizgisinde toplar",()=>{
  const state={wrongLog:[
    {id:1,subject:"Fizik",topic:"Optik",n:2,date:"2026-08-20",kind:"dikkat"},
    {id:2,subject:"Fizik",topic:"Optik",n:1,date:"2026-08-27",kind:"bilmiyordum"}
  ],errorJournal:[
    {id:"e1",subject:"Fizik",topic:"Optik",count:2,createdAt:Date.UTC(2026,7,20),sourceRef:"wrong:1",note:"Aynayı önce çiz.",resolved:false},
    {id:"e2",subject:"Fizik",topic:"Optik",count:1,createdAt:Date.UTC(2026,7,29),source:"Manuel",note:"İşaret kuralını kontrol et.",resolved:false}
  ]};
  const result=bridge.buildTopicBridge(state,{"fizik|optik":"Işınları eksene göre çiz."},"Fizik","Optik");
  assert.equal(result.wrongTotal,3);
  assert.equal(result.differentDays,3);
  assert.equal(result.timeline.length,3);
  assert.equal(result.fixNote,"Işınları eksene göre çiz.");
  assert.deepEqual(result.journalNotes,["İşaret kuralını kontrol et.","Aynayı önce çiz."]);
});

test("Laboratuvar eşleştirmesi sınav ipucunu ve konu tekilliğini kullanır",()=>{
  const catalogs={TYT:[{exam:"TYT",subject:"Fizik",topic:"Optik",subjectIndex:3,topicIndex:9}],AYT:[{exam:"AYT",subject:"Fizik (AYT)",topic:"Modern Fizik",subjectIndex:2,topicIndex:11}],YDT:[]};
  assert.equal(bridge.resolveCatalogItem(catalogs,"Fizik","Optik","TYT").topicIndex,9);
  assert.equal(bridge.resolveCatalogItem(catalogs,"Fizik","Modern Fizik","AYT").exam,"AYT");
  assert.equal(bridge.resolveCatalogItem(catalogs,"Fizik","Bilinmeyen",""),null);
});

test("Aşama 3 arayüzü Hata Defteri, Konular ve Laboratuvarı bağlar ama Programı değiştirmez",()=>{
  const source=read("modules/error-topic-lab-v42.js"),stability=read("modules/stability.js");
  assert.match(source,/Hata Defteri ↔ Konular ↔ Öğrenme Laboratuvarı/);
  assert.match(source,/yks_error_fix_notes_v3/);
  assert.match(source,/v42TopicErrorBridge/);
  assert.match(source,/Düzeltme notu · salt okunur/);
  assert.match(source,/v4OpenLabTopic/);
  assert.match(source,/openTopicDetail/);
  assert.match(source,/errorJournalOpen/);
  assert.match(source,/Laboratuvar rehberi/);
  assert.match(source,/focus-visible/);
  assert.match(source,/pointer:coarse/);
  assert.match(source,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(source,/\baddToToday\s*\(/);
  assert.doesNotMatch(source,/\baddToDay\s*\(/);
  assert.doesNotMatch(source,/\.weeks\s*\[/);
  assert.doesNotMatch(source,/\.rows\s*\[/);
  assert.match(stability,/error-topic-lab-v42\.js\?v=4\.2\.0-r1/);
  assert.match(stability,/data-yks-error-topic-lab-v42/);
  assert.match(stability,/__YKS_ERROR_TOPIC_LAB_V42__/);
  assert.equal(bridge.selfTest().ok,true);
});
