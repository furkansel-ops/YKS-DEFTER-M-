const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.4 katman planı 9 organın 52 yapısını dış/iç olarak eksiksiz böler",async()=>{
  const [{ORGAN_GUIDES},{buildBiologyLayerPlan}]=await Promise.all([
    import(pathToFileURL(path.join(root,"src/data/biology-organs.ts")).href),
    import(pathToFileURL(path.join(root,"src/domain/biology-layer-service.ts")).href)
  ]);
  const organIds=Object.keys(ORGAN_GUIDES);assert.equal(organIds.length,9);assert.equal(organIds.includes("ear"),false);
  let total=0;
  for(const organId of organIds){
    const plan=buildBiologyLayerPlan(organId),guide=ORGAN_GUIDES[organId];assert.ok(plan,organId);
    const ids=new Set([...plan.surface,...plan.internal]);assert.equal(ids.size,guide.structures.length,organId);assert.equal(plan.surface.length+plan.internal.length,guide.structures.length,organId);
    for(const id of plan.priority)assert.equal(ids.has(id),true,`${organId}:${id}`);
    assert.ok(plan.route.length>10);total+=guide.structures.length;
  }
  assert.equal(total,52);assert.equal(buildBiologyLayerPlan("ear"),null);
});

test("v4.4 katman gezgini mevcut Atlas cutaway motorunu kullanır ve lazy/fail-open kalır",()=>{
  const bridge=read("src/ui/biology-atlas-bridge.ts"),ui=read("src/ui/biology-layer-guide-v44.ts"),service=read("src/domain/biology-layer-service.ts"),css=read("src/ui/biology-layer-guide-v44.css"),entry=read("src/main.ts");
  assert.match(bridge,/import\("\.\/biology-layer-guide-v44\.ts"\)/);assert.match(ui,/1 · Dış yüzey/);assert.match(ui,/2 · İç yapılar/);assert.match(ui,/3 · YKS rotası/);assert.match(ui,/Sonraki YKS yapısı/);assert.match(ui,/#atlasModelOpen/);assert.match(ui,/data-atlas-action=["']organ-view["']/);assert.match(ui,/data-atlas-structure/);assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(`${ui}\n${service}`,/localStorage|indexedDB|Dexie|firebase|saveSoon|Program|program\.push|program\.splice/i);assert.doesNotMatch(`${ui}\n${service}`,/WebGLRenderer|from ["']three["']/i);assert.doesNotMatch(entry,/biology-layer-guide-v44/);
});
