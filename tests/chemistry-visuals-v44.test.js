const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.4 kimya görsel seti dokuz temel yapıyı benzersiz ve geçerli tanımlar",async()=>{
  const [{CHEMISTRY_STRUCTURES},{validateChemistryStructures}]=await Promise.all([
    import(pathToFileURL(path.join(root,"src/data/chemistry-molecules.ts")).href),
    import(pathToFileURL(path.join(root,"src/domain/chemistry-visual-service.ts")).href)
  ]);
  assert.equal(CHEMISTRY_STRUCTURES.length,9);
  assert.equal(new Set(CHEMISTRY_STRUCTURES.map(item=>item.id)).size,9);
  assert.equal(CHEMISTRY_STRUCTURES.filter(item=>item.kind==="molecule").length,8);
  assert.equal(CHEMISTRY_STRUCTURES.filter(item=>item.kind==="ionic").length,1);
  assert.deepEqual(validateChemistryStructures(),[]);
  for(const structure of CHEMISTRY_STRUCTURES){
    assert.ok(structure.formula&&structure.geometry&&structure.polarity&&structure.bondFocus&&structure.exam&&structure.trap,structure.id);
    assert.ok(structure.atoms.length>=2,structure.id);
  }
});

test("v4.4 kimya çizim motoru bağ mertebesini, iyonik ayrımı ve Lewis yalnız çiftlerini doğru üretir",async()=>{
  const {buildChemistryVisual}=await import(pathToFileURL(path.join(root,"src/domain/chemistry-visual-service.ts")).href);
  const water=buildChemistryVisual("water");assert.ok(water);assert.equal(water.bondLines.length,2);assert.equal(water.lonePairs.o.length,2);
  const carbon=buildChemistryVisual("carbon-dioxide");assert.ok(carbon);assert.equal(carbon.bondLines.length,4);
  const nitrogen=buildChemistryVisual("nitrogen");assert.ok(nitrogen);assert.equal(nitrogen.bondLines.length,3);assert.equal(nitrogen.lonePairs.n1.length,1);assert.equal(nitrogen.lonePairs.n2.length,1);
  const salt=buildChemistryVisual("sodium-chloride");assert.ok(salt);assert.equal(salt.bondLines.length,1);assert.equal(salt.bondLines[0].ionic,true);assert.equal(salt.structure.kind,"ionic");
  assert.equal(buildChemistryVisual("unknown"),null);
  for(const plan of [water,carbon,nitrogen,salt])for(const line of plan.bondLines)for(const value of [line.x1,line.y1,line.x2,line.y2])assert.equal(Number.isFinite(value),true);
});

test("v4.4 kimya laboratuvarı Periyodik Tablo içinde istek üzerine lazy açılır ve çalışma verisine yazmaz",()=>{
  const bridge=read("src/ui/chemistry-visuals-bridge.ts"),ui=read("src/ui/chemistry-visuals-v44.ts"),service=read("src/domain/chemistry-visual-service.ts"),css=read("src/ui/chemistry-visuals-v44.css"),main=read("src/main.ts");
  assert.match(bridge,/v320PanelPeriodic/);assert.match(bridge,/data-v44-chemistry-toggle/);assert.match(bridge,/import\("\.\/chemistry-visuals-v44\.ts"\)/);assert.match(bridge,/Periyodik tabloyu kullanmaya devam edebilirsin/);
  assert.match(ui,/KİMYA GÖRSEL LABORATUVARI · v4\.4/);assert.match(ui,/Bağ \+ şekil/);assert.match(ui,/Lewis çiftleri/);assert.match(ui,/YKS odağı/);assert.match(ui,/role=\\?"img\\?"/);
  assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(main,/installChemistryVisualsBridgeV44/);assert.doesNotMatch(main,/chemistry-visuals-v44|chemistry-visual-service|chemistry-molecules/);
  assert.doesNotMatch(`${bridge}\n${ui}\n${service}`,/localStorage|indexedDB|Dexie|firebase|saveSoon|YKSLegacyState|program\.push|program\.splice|\.save\(/i);
});
