const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.4 fizik laboratuvarı 16 fizik kartını sekiz simülasyona tam ve tekil bağlar",async()=>{
  const [{SCIENCE_CARDS},{PHYSICS_SIMULATIONS,physicsSimulationForCard}]=await Promise.all([
    import(pathToFileURL(path.join(root,"src/data/science-cards.ts")).href),
    import(pathToFileURL(path.join(root,"src/domain/physics-simulation-service.ts")).href)
  ]);
  const physics=SCIENCE_CARDS.filter(card=>card.subject==="Fizik");assert.equal(physics.length,16);assert.equal(PHYSICS_SIMULATIONS.length,8);
  const linked=PHYSICS_SIMULATIONS.flatMap(sim=>sim.cardIds);assert.equal(linked.length,16);assert.equal(new Set(linked).size,16);
  assert.deepEqual([...linked].sort(),physics.map(card=>card.id).sort());
  for(const card of physics){const sim=physicsSimulationForCard(card.id);assert.ok(sim,card.id);assert.equal(sim.cardIds.includes(card.id),true,card.id);}
});

test("v4.4 fizik hesap motoru temel YKS bağıntılarını ve sınır durumlarını sonlu sonuçlarla korur",async()=>{
  const {PHYSICS_SIMULATIONS,evaluatePhysicsSimulation,normalizePhysicsInputs}=await import(pathToFileURL(path.join(root,"src/domain/physics-simulation-service.ts")).href);
  const motion=evaluatePhysicsSimulation("motion",{v0:0,a:2,t:3,m:4});assert.deepEqual(motion.values,{v:6,dx:9,force:8});
  const circuits=evaluatePhysicsSimulation("circuits",{voltage:12,r1:6,r2:12});assert.equal(circuits.values.series,18);assert.equal(circuits.values.parallel,4);assert.ok(circuits.values.parallel<6);
  const optics=evaluatePhysicsSimulation("optics",{angle:60,n1:1.5,n2:1,f:12,do:8});assert.equal(optics.state,"total-internal-reflection");assert.equal(optics.values.refraction,-1);
  const waves=evaluatePhysicsSimulation("waves",{speed:10,frequency:2,path:5});assert.equal(waves.values.wavelength,5);assert.equal(waves.state,"constructive");
  const dark=evaluatePhysicsSimulation("photoelectric",{frequency:4,threshold:5,intensity:2});assert.equal(dark.state,"below-threshold");assert.equal(dark.values.current,0);
  const bright=evaluatePhysicsSimulation("photoelectric",{frequency:7,threshold:5,intensity:1.5});assert.equal(bright.state,"emission");assert.ok(bright.values.excess>0);
  for(const sim of PHYSICS_SIMULATIONS){const result=evaluatePhysicsSimulation(sim.id,Object.fromEntries(sim.inputs.map(spec=>[spec.key,Number.POSITIVE_INFINITY])));assert.ok(result,sim.id);for(const value of Object.values(result.values))assert.equal(Number.isFinite(value),true,`${sim.id}:${value}`);const normalized=normalizePhysicsInputs(sim.id,Object.fromEntries(sim.inputs.map(spec=>[spec.key,Number.NEGATIVE_INFINITY])));for(const spec of sim.inputs)assert.ok(normalized[spec.key]>=spec.min&&normalized[spec.key]<=spec.max,`${sim.id}:${spec.key}`);}
});

test("v4.4 fizik laboratuvarı yalnız Fizik sekmesinde lazy açılır ve çalışma verisine yazmaz",()=>{
  const cards=read("src/ui/science-cards.ts"),ui=read("src/ui/physics-lab-v44.ts"),service=read("src/domain/physics-simulation-service.ts"),css=read("src/ui/physics-lab-v44.css"),entry=read("src/main.ts");
  assert.match(cards,/id=\\?"v4PhysicsLab\\?"/);assert.match(cards,/filters\.subject === "Fizik"/);assert.match(cards,/import\("\.\/physics-lab-v44\.ts"\)/);assert.match(cards,/target\.hidden = !active/);assert.match(cards,/kartlarla çalışmaya devam edebilirsin/);
  assert.match(ui,/FİZİK SİMÜLASYONLARI · v4\.4/);assert.match(ui,/type=\\?"range\\?"/);assert.match(ui,/aria-live=\\?"polite\\?"/);assert.doesNotMatch(ui,/requestAnimationFrame|setInterval|WebGLRenderer|from ["']three["']/i);assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(`${ui}\n${service}`,/localStorage|indexedDB|Dexie|firebase|saveSoon|YKSLegacyState|Program|program\.push|program\.splice/i);assert.doesNotMatch(entry,/physics-lab-v44|physics-simulation-service/);
});
