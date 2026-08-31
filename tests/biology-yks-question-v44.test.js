const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.4 YKS soru odağı 9 organ ve 52 yapının tamamında salt okunur kart üretir",async()=>{
  const organsUrl=pathToFileURL(path.join(root,"src/data/biology-organs.ts")).href;
  const serviceUrl=pathToFileURL(path.join(root,"src/domain/biology-yks-question-service.ts")).href;
  const [{ORGAN_GUIDES,ORGAN_EXAM_FOCUS},{buildBiologyYksQuestionFocus}]=await Promise.all([import(organsUrl),import(serviceUrl)]);
  const organIds=Object.keys(ORGAN_GUIDES);assert.equal(organIds.length,9);assert.equal(organIds.includes("ear"),false);
  let structures=0;
  for(const organId of organIds){
    const guide=ORGAN_GUIDES[organId],focus=ORGAN_EXAM_FOCUS[organId];assert.ok(focus,organId);
    for(const part of guide.structures){
      structures++;
      const card=buildBiologyYksQuestionFocus(organId,part.id);assert.ok(card,`${organId}:${part.id}`);
      assert.equal(card.label,part.label);assert.equal(card.core,part.summary);assert.equal(card.mechanism,part.detail);assert.equal(card.distinction,part.exam);assert.equal(card.route,focus.route);
      assert.equal(card.priority,focus.mustKnow.includes(part.id)?"high":"support");assert.ok(card.questionAngle.length>20);assert.match(card.disclaimer,/çıkmış soru|gelecek sınav/i);
    }
  }
  assert.equal(structures,52);
});

test("v4.4 soru odağı Atlas ile birlikte lazy-load olur ve çekirdek/veri katmanına yazmaz",()=>{
  const bridge=read("src/ui/biology-atlas-bridge.ts"),ui=read("src/ui/biology-yks-question-v44.ts"),service=read("src/domain/biology-yks-question-service.ts"),css=read("src/ui/biology-yks-question-v44.css"),entry=read("src/main.ts");
  assert.match(bridge,/import\("\.\/biology-yks-question-v44\.ts"\)/);assert.match(bridge,/\.catch\(\(\) => \{\}\)/);assert.match(ui,/YKS'DE BURADAN NE SORULUR\?/);assert.match(ui,/MutationObserver/);assert.match(ui,/queueMicrotask/);assert.match(ui,/buildBiologyYksQuestionFocus/);
  assert.match(css,/atlas-yks-question-v44/);assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(`${ui}\n${service}`,/localStorage|indexedDB|Dexie|firebase|saveSoon|Program|program\.push|program\.splice/i);
  assert.doesNotMatch(entry,/biology-yks-question-v44/);assert.doesNotMatch(`${ui}\n${service}`,/three|WebGLRenderer/i);
});

test("v4.4 soru odağı bilinmeyen organ/yapıda güvenli null döndürür",async()=>{
  const {buildBiologyYksQuestionFocus}=await import(pathToFileURL(path.join(root,"src/domain/biology-yks-question-service.ts")).href);
  assert.equal(buildBiologyYksQuestionFocus("ear","cochlea"),null);
  assert.equal(buildBiologyYksQuestionFocus("heart","not-a-structure"),null);
});
