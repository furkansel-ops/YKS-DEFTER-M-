const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const exists=file=>fs.existsSync(path.join(root,file));

test("v4.4 Öğrenme Laboratuvarı 4.0 altı ürün katmanını ve temel içerik sayılarını eksiksiz paketler",async()=>{
  const [{ATLAS_ORGANS,ATLAS_TOPICS},{ORGAN_GUIDES},{PHYSICS_SIMULATIONS},{CHEMISTRY_STRUCTURES}]=await Promise.all([
    import(pathToFileURL(path.join(root,"src/data/biology-atlas.ts")).href),
    import(pathToFileURL(path.join(root,"src/data/biology-organs.ts")).href),
    import(pathToFileURL(path.join(root,"src/domain/physics-simulation-service.ts")).href),
    import(pathToFileURL(path.join(root,"src/data/chemistry-molecules.ts")).href)
  ]);
  assert.equal(ATLAS_ORGANS.length,9);assert.equal(ATLAS_TOPICS.length,24);
  assert.equal(Object.values(ORGAN_GUIDES).reduce((sum,guide)=>sum+guide.structures.length,0),52);
  assert.equal(PHYSICS_SIMULATIONS.length,8);assert.equal(PHYSICS_SIMULATIONS.flatMap(sim=>sim.cardIds).length,16);
  assert.equal(CHEMISTRY_STRUCTURES.length,9);
  for(const file of [
    "src/ui/biology-yks-question-v44.ts","src/ui/biology-layer-guide-v44.ts","src/ui/biology-topic-map-v44.ts",
    "src/ui/physics-lab-v44.ts","src/ui/chemistry-visuals-v44.ts","src/ui/lab-interactions-v44.ts"
  ])assert.equal(exists(file),true,file);
});

test("v4.4 ağır öğrenme yüzeylerini başlangıç paketinden ayırır ve fail-open lazy sınırlarını korur",()=>{
  const main=read("src/main.ts"),science=read("src/ui/science-cards.ts"),chemBridge=read("src/ui/chemistry-visuals-bridge.ts"),labBridge=read("src/ui/lab-interactions-bridge-v44.ts"),atlasBridge=read("src/ui/biology-atlas-bridge.ts"),lessons=read("src/ui/biology-atlas-lessons.ts");
  assert.doesNotMatch(main,/physics-lab-v44|chemistry-visuals-v44|lab-interactions-v44|biology-yks-question-v44|biology-layer-guide-v44|biology-topic-map-v44/);
  assert.match(science,/import\("\.\/physics-lab-v44\.ts"\)/);assert.match(science,/kartlarla çalışmaya devam edebilirsin/);
  assert.match(chemBridge,/import\("\.\/chemistry-visuals-v44\.ts"\)/);assert.match(chemBridge,/Periyodik tabloyu kullanmaya devam edebilirsin/);
  assert.match(labBridge,/import\("\.\/lab-interactions-v44\.ts"\)/);assert.match(labBridge,/Legacy laboratuvar çalışmaya devam eder/);
  assert.match(atlasBridge,/import\("\.\/biology-atlas\.ts"\)/);assert.match(atlasBridge,/import\("\.\/biology-yks-question-v44\.ts"\)/);assert.match(atlasBridge,/import\("\.\/biology-layer-guide-v44\.ts"\)/);assert.match(atlasBridge,/catch\(\(\) => \{\}\)/);
  assert.match(lessons,/atlasTopicMapV44/);assert.match(lessons,/view==="steps"/);
});

test("v4.4 final kalite kapısı şema 21 ve manuel Program sözleşmesini değiştirmez",()=>{
  const version=JSON.parse(read("version.json"));assert.equal(version.schema,21);assert.equal(version.version,"4.4.0");
  const files=[
    "src/domain/biology-layer-service.ts","src/domain/biology-topic-map-service.ts","src/domain/biology-yks-question-service.ts",
    "src/ui/biology-layer-guide-v44.ts","src/ui/biology-topic-map-v44.ts","src/ui/biology-yks-question-v44.ts",
    "src/domain/physics-simulation-service.ts","src/ui/physics-lab-v44.ts",
    "src/domain/chemistry-visual-service.ts","src/ui/chemistry-visuals-v44.ts","src/ui/chemistry-visuals-bridge.ts",
    "src/domain/lab-interaction-service-v44.ts","src/ui/lab-interactions-v44.ts","src/ui/lab-interactions-bridge-v44.ts"
  ];
  const source=files.map(read).join("\n");
  assert.doesNotMatch(source,/localStorage\.setItem|indexedDB\.open|new\s+Dexie|program\.(?:push|splice)|YKSLegacyState\.(?:save|writeState)|addToToday|addToDay|\.save\s*\(/i);
  assert.doesNotMatch(source,/requestAnimationFrame\s*\([^)]*=>[^)]*requestAnimationFrame|setInterval\s*\(/i);
});
