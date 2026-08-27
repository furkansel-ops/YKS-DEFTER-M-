const test=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=file=>import(pathToFileURL(path.resolve(__dirname,'..',file)).href);

test('Her 3B yapı için sonlu konum, gerçek hacim geometrisi ve bağımsız seçim vardır',async()=>{
  const {ATLAS_ORGANS}=await load('src/data/biology-atlas.ts'),{organGuide}=await load('src/data/biology-organs.ts');
  const {ORGAN_LANDMARKS}=await load('src/data/biology-organ-landmarks.ts'),{createOrganInterior}=await load('src/ui/biology-organ-interiors.ts');
  const {disposeAtlasObject}=await load('src/ui/biology-atlas-model.ts'),THREE=await import('three');let count=0;
  for(const {id} of ATLAS_ORGANS){
    const interior=createOrganInterior(id),expected=organGuide(id).structures.map(p=>p.id).sort();
    assert.deepEqual([...interior.parts.keys()].sort(),expected,id);assert.deepEqual(Object.keys(ORGAN_LANDMARKS[id]).sort(),expected,id);
    for(const [name,p] of interior.parts){
      count++;assert.ok(ORGAN_LANDMARKS[id][name].position.every(Number.isFinite));assert.ok(['surface','inside','zoom','neighbor'].includes(ORGAN_LANDMARKS[id][name].kind));
      const point=p.anchor.getWorldPosition(new THREE.Vector3());assert.ok(point.toArray().every(Number.isFinite));
      let meshes=0;p.root.traverse(o=>{if(!o.isMesh)return;meshes++;assert.equal(o.userData.structureId,name);const pos=o.geometry.attributes.position;assert.ok(pos.array.every(Number.isFinite));o.geometry.computeBoundingBox();const size=o.geometry.boundingBox.getSize(new THREE.Vector3());assert.ok(size.x>0&&size.y>0&&size.z>0,name+' is volumetric');if(o.geometry.index)assert.ok(o.geometry.index.array.every(i=>i>=0&&i<pos.count));});assert.ok(meshes>0,name);
    }
    const first=expected[0];interior.select(first);
    for(const [name,p] of interior.parts)p.root.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])assert.equal(m.emissiveIntensity,name===first?.48:0);});
    interior.select('');for(const p of interior.parts.values())p.root.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])assert.equal(m.emissiveIntensity,0);});
    disposeAtlasObject(interior.root);
  }assert.equal(count,52);
});

test('Kalp boşlukları dış duvar, iç duvar ve kesit kenarı içerir; sol karıncık duvarı daha kalındır',async()=>{
  const {chamberGeometry,createOrganInterior}=await load('src/ui/biology-organ-interiors.ts');
  const g=chamberGeometry(1,1,1,.3);assert.equal(g.groups.length,3);assert.ok(g.groups.every(g=>g.count>0));
  const p=g.attributes.position,inner=(15*41);assert.ok(Math.abs(p.getX(0)-1)<1e-6);assert.ok(Math.abs(p.getX(inner)-.7)<1e-6);assert.ok(Math.min(...Array.from({length:p.count},(_,i)=>p.getZ(i)))<-.99);
  const organ=createOrganInterior('heart'),walls=name=>{const mesh=organ.parts.get(name).root.children.find(o=>o.isMesh),p=mesh.geometry.attributes.position;return 1-p.getX(inner)/p.getX(0);};
  assert.ok(walls('left-ventricle')>walls('right-ventricle'));g.dispose();
  (await load('src/ui/biology-atlas-model.ts')).disposeAtlasObject(organ.root);
});

test('Kabuk aynı sahnede ikiye açılır; kesme düzlemleri organla döner ve kaynak malzemesi bozulmaz',async()=>{
  const THREE=await import('three'),{createOrganAssembly}=await load('src/ui/biology-organ-assembly.ts'),{disposeAtlasObject}=await load('src/ui/biology-atlas-model.ts');
  const material=new THREE.MeshStandardMaterial({color:0xdd9977}),geometry=new THREE.BoxGeometry(2,3,1.4),source=new THREE.Mesh(geometry,material);
  const assembly=createOrganAssembly(source,'heart');assert.equal(assembly.source,source);assert.equal(source.visible,true);assert.equal(assembly.interior.root.visible,false);assert.equal(assembly.anchors.size,8);
  assert.equal(material.clippingPlanes,null);const resourceCounts={geometry:0,material:0};geometry.addEventListener('dispose',()=>resourceCounts.geometry++);material.addEventListener('dispose',()=>resourceCounts.material++);
  const copies=assembly.halves.map(half=>half.children[0]);assert.ok(copies.every(o=>o.geometry===geometry&&o.material!==material));
  assembly.root.rotation.set(.1,.8,.2);assembly.update(1);assert.equal(source.visible,false);assert.equal(assembly.interior.root.visible,true);assert.equal(assembly.halves[0].position.x,-3.05);assert.equal(assembly.halves[1].position.x,3.05);assert.equal(assembly.halves[0].scale.x,.52);
  for(let i=0;i<2;i++){const half=assembly.halves[i],plane=assembly.planes[i],origin=new THREE.Vector3().applyMatrix4(half.matrixWorld),front=new THREE.Vector3(0,0,1).applyMatrix4(half.matrixWorld);assert.ok(Math.abs(plane.distanceToPoint(origin))<1e-7);assert.ok(plane.distanceToPoint(front)*(i?-1:1)>.51);}
  const positions=geometry.attributes.position.array.slice();assembly.update(0);assert.ok(assembly.halves.every(h=>!h.visible));assert.equal(source.visible,true);assert.deepEqual(geometry.attributes.position.array,positions);assert.equal(material.clippingPlanes,null);
  disposeAtlasObject(assembly.root);assert.deepEqual(resourceCounts,{geometry:1,material:1});
});

test('3B etiket satırları dönen noktalardan bağımsız çakışmadan yerleşir',async()=>{
  const {layoutModelLabels}=await load('src/ui/biology-model-labels.ts');
  for(const height of [300,360,560,760]){
    const points=Array.from({length:8},(_,i)=>({id:String(i),x:100+i*3,y:height-10+i,side:i<4?'left':'right',visible:true}));points.push({id:'hidden',x:0,y:0,side:'left',visible:false});
    const rows=layoutModelLabels(points,height);assert.equal(rows.size,8);
    for(const side of ['left','right']){const ys=points.filter(p=>p.side===side&&p.visible).map(p=>rows.get(p.id));assert.ok(ys.every(y=>y>=35&&y<=height-35));for(let i=1;i<ys.length;i++)assert.ok(ys[i]-ys[i-1]>=48.99);}
  }
});

test('Yakın 3B işaretlerin mobil dokunma hedefleri ayrılır; asıl yüzey konumu değişmez',async()=>{
  const {layoutModelPoints}=await load('src/ui/biology-model-labels.ts');
  const points=Array.from({length:8},(_,i)=>({id:String(i),x:170,y:155,side:i<4?'left':'right',visible:true})),before=JSON.stringify(points),targets=layoutModelPoints(points,340,300),ps=[...targets.values()];
  assert.equal(JSON.stringify(points),before);assert.equal(ps.length,8);
  for(let i=0;i<ps.length;i++){assert.ok(ps[i].x>=22&&ps[i].x<=318&&ps[i].y>=30&&ps[i].y<=274);for(let j=i+1;j<ps.length;j++)assert.ok(Math.hypot(ps[i].x-ps[j].x,ps[i].y-ps[j].y)>43);}
});

test('DOM işaretleri kamera izdüşümünü izler; seçim callback ve etiket gizleme aynı katmanı kullanır',async()=>{
  const THREE=await import('three'),{createOrganAssembly}=await load('src/ui/biology-organ-assembly.ts'),{createModelLabels}=await load('src/ui/biology-model-labels.ts');
  class El{children=[];style={};dataset={};attrs={};hidden=false;classList={add(){},toggle(){}};events={};appendChild(x){this.children.push(x);}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,fn){this.events[k]=fn;}remove(){this.removed=true;}}
  const prior=global.document;global.document={createElement:()=>new El(),createElementNS:()=>new El()};
  const a=createOrganAssembly(new THREE.Mesh(new THREE.BoxGeometry(2,3,1.2),new THREE.MeshStandardMaterial()),'heart'),container=new El(),clicked=[];
  try{
    const layer=createModelLabels(container,'heart',a,id=>clicked.push(id)),camera=new THREE.PerspectiveCamera(38,1.5,.1,60);camera.position.set(0,0,8);camera.lookAt(0,0,0);camera.updateMatrixWorld();
    layer.update(camera,750,500);const markers=container.children[0].children.filter(e=>e.dataset.modelPoint),first=markers[0],x=first.style.left;assert.equal(markers.length,8);
    a.root.rotation.y=.4;a.update(0);layer.update(camera,750,500);assert.notEqual(first.style.left,x);
    let stopped=false;first.events.click({stopPropagation(){stopped=true;}});assert.equal(stopped,true);assert.deepEqual(clicked,[first.dataset.modelPoint]);
    layer.select('mitral');assert.equal(markers.find(e=>e.dataset.modelPoint==='mitral').attrs['aria-pressed'],'true');
    layer.show(false);assert.equal(container.children[0].hidden,true);layer.show(true);a.update(1);layer.update(camera,340,300);
    assert.ok(markers.every(e=>e.hidden||Number.isFinite(parseFloat(e.style.left))));layer.dispose();assert.equal(container.children[0].removed,true);
  }finally{global.document=prior;(await load('src/ui/biology-atlas-model.ts')).disposeAtlasObject(a.root);}
});

test('24 konunun bütün durakları farklı odak çizimi, konum ve okuma rehberi üretir',async()=>{
  const {ATLAS_TOPICS}=await load('src/data/biology-atlas.ts'),{atlasStage,ATLAS_STAGE_NOTES}=await load('src/ui/biology-atlas-stages.ts');
  const {atlasLesson}=await load('src/ui/biology-atlas-lessons.ts');let count=0;
  for(const topic of ATLAS_TOPICS){
    assert.equal(ATLAS_STAGE_NOTES[topic.scene].length,topic.steps.length,topic.id);const scenes=new Set();
    for(let i=0;i<topic.steps.length;i++){
      const svg=atlasStage(topic,i),note=ATLAS_STAGE_NOTES[topic.scene][i];assert.ok(note[0].length>=8&&note[1].length>45,topic.id);assert.doesNotMatch(svg,/undefined|NaN|Infinity/);
      assert.match(svg,/role="img"/);assert.match(svg,new RegExp(`data-stage-index="${i}"`));assert.match(svg,/GÖRSELİ BÖYLE OKU/);
      const geometry=svg.match(/<svg[\s\S]*<\/svg>/)[0].replace(/<text[\s\S]*?<\/text>/g,'').replace(/aria-label="[^"]*"|data-stage-index="[^"]*"/g,'');scenes.add(geometry);count++;
    }assert.equal(scenes.size,topic.steps.length,topic.id+' changes actual scene geometry/emphasis');
    const lesson=atlasLesson(topic,{step:0,view:'steps',picked:null,labels:true,wide:false}),quiz=atlasLesson(topic,{step:0,view:'quiz',picked:null,labels:true,wide:false});
    assert.match(lesson,/atlas-stage-roadmap/);assert.equal((lesson.match(/data-atlas-step=/g)||[]).length,topic.steps.length);assert.doesNotMatch(quiz,/atlas-stage-caption|atlas-stage-roadmap|GÖRSELİ BÖYLE OKU/);
  }assert.ok(count>100);
});
