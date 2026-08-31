const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.4 periyodik karşılaştırma grup ve blok konumlarını YKS eğilimleri için güvenli okur",async()=>{
  const {periodicGroup,periodicBlock,comparePeriodicElements}=await import(pathToFileURL(path.join(root,"src/domain/lab-interaction-service-v44.ts")).href);
  assert.equal(periodicGroup(11),"1");assert.equal(periodicBlock(11),"s");
  assert.equal(periodicGroup(17),"17");assert.equal(periodicBlock(17),"p");
  assert.equal(periodicGroup(26),"8");assert.equal(periodicBlock(26),"d");
  assert.equal(periodicGroup(58),"Lantanit");assert.equal(periodicBlock(58),"f");
  assert.equal(periodicGroup(118),"18");assert.equal(periodicGroup(0),"—");
  const na={n:11,symbol:"Na",name:"Sodyum",period:3,type:"Alkali metal"},cl={n:17,symbol:"Cl",name:"Klor",period:3,type:"Halojen"},k={n:19,symbol:"K",name:"Potasyum",period:4,type:"Alkali metal"};
  const samePeriod=comparePeriodicElements(na,cl);assert.match(samePeriod.cue,/Aynı periyotta/);assert.match(samePeriod.cue,/atom çapı/);
  const sameGroup=comparePeriodicElements(na,k);assert.match(sameGroup.cue,/Aynı grupta/);assert.match(sameGroup.cue,/iyonlaşma enerjisi/);
  const mixed=comparePeriodicElements(cl,k);assert.match(mixed.cue,/tek bir ezber okuyla kesinleştirme/);
});

test("v4.4 kronoloji zinciri olay sırasını bozmadan önceki ve sonraki komşuyu verir",async()=>{
  const {timelineNeighborhood}=await import(pathToFileURL(path.join(root,"src/domain/lab-interaction-service-v44.ts")).href);
  const events=[
    {id:"a",year:"1919",title:"A",detail:"a",era:"Milli Mücadele"},
    {id:"b",year:"1920",title:"B",detail:"b",era:"Milli Mücadele"},
    {id:"c",year:"1921",title:"C",detail:"c",era:"Milli Mücadele"}
  ];
  const middle=timelineNeighborhood(events,"b");assert.equal(middle.previous.id,"a");assert.equal(middle.current.id,"b");assert.equal(middle.next.id,"c");assert.equal(middle.index,1);assert.equal(middle.total,3);
  const first=timelineNeighborhood(events,"a");assert.equal(first.previous,null);assert.equal(first.next.id,"b");
  const missing=timelineNeighborhood(events,"x");assert.equal(missing.current,null);assert.equal(missing.index,-1);assert.equal(missing.total,3);
});

test("v4.4 Laboratuvar etkileşimleri legacy veriyi yalnız okur, görünürken lazy yüklenir ve veri katmanına yazmaz",()=>{
  const bridge=read("src/ui/lab-interactions-bridge-v44.ts"),ui=read("src/ui/lab-interactions-v44.ts"),service=read("src/domain/lab-interaction-service-v44.ts"),css=read("src/ui/lab-interactions-v44.css"),main=read("src/main.ts"),legacy=read("modules/learning-lab.js");
  assert.match(legacy,/YKSLearningLab=\{elements:ELEMENTS,timeline:TIMELINE/);
  assert.match(bridge,/getClientRects\(\)\.length>0/);assert.match(bridge,/import\("\.\/lab-interactions-v44\.ts"\)/);assert.match(bridge,/Legacy laboratuvar çalışmaya devam eder/);
  assert.match(ui,/v320PanelPeriodic/);assert.match(ui,/v320PanelTimeline/);assert.match(ui,/v44PeriodicCompare/);assert.match(ui,/v44TimelineChain/);assert.match(ui,/Önceki → seçili → sonraki/);
  assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(main,/installLabInteractionsBridgeV44/);assert.doesNotMatch(main,/lab-interactions-v44|lab-interaction-service-v44/);
  assert.doesNotMatch(`${bridge}\n${ui}\n${service}`,/localStorage|indexedDB|Dexie|firebase|saveSoon|YKSLegacyState|program\.push|program\.splice|\.save\(/i);
});
