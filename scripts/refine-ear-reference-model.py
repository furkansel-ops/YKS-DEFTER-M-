from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: beklenen parça {count} kez bulundu")
    p.write_text(text.replace(old, new), encoding="utf-8")


# Reference-based authored Three.js shell: outer ear, cut temporal bone, soft
# tissue layers and a real-looking auditory canal. This is geometry, not a
# pasted image/texture, so it remains rotatable and works offline.
Path("src/ui/biology-ear-source.ts").write_text(r'''import * as THREE from "three";

type P3=readonly [number,number,number];
const skin=0xd99582,bone=0xe5c9a0,boneLight=0xf0ddbc,boneDark=0x8b664d,canal=0xb95f59,canalDark=0x633a39,fat=0xe9bd68,muscle=0xb85d55,cartilage=0xe8aa95;

function standard(color:number,roughness=.68,opacity=1){
  const material=new THREE.MeshStandardMaterial({color,roughness,metalness:0,side:THREE.DoubleSide});
  if(opacity<1){material.transparent=true;material.opacity=opacity;material.depthWrite=opacity>.78;}
  return material;
}
function tube(points:readonly P3[],radius:number,color:number,closed=false){
  const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point)),closed,"catmullrom",.45);
  return new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(48,points.length*8),radius,14,closed),standard(color,.62));
}
function ellipsoid(position:P3,scale:P3,color:number){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),standard(color,.72));mesh.position.set(...position);mesh.scale.set(...scale);return mesh;
}
function extrude(shape:THREE.Shape,depth:number,color:number,z=-.2){
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.045,bevelSize:.04,bevelSegments:3,steps:1,curveSegments:36}),standard(color,.8));mesh.position.z=z;return mesh;
}

/**
 * Authored from the supplied ear cutaway reference. It intentionally uses only
 * procedural Three.js geometry: no screenshot is baked into the app. The
 * detailed selectable YKS structures are added by biology-organ-interiors.ts.
 */
export function createEarSourceModel():THREE.Group {
  const root=new THREE.Group();root.name="reference-cutaway-ear";
  const add=<T extends THREE.Object3D>(object:T,name:string)=>{object.name=name;root.add(object);return object;};

  // Outer auricle silhouette with a deeper, more anatomical profile.
  const pinna=new THREE.Shape();
  pinna.moveTo(-1.42,-1.58);
  pinna.bezierCurveTo(-1.88,-1.20,-1.86,-.15,-1.73,.70);
  pinna.bezierCurveTo(-1.63,1.45,-1.20,1.74,-.72,1.62);
  pinna.bezierCurveTo(-.16,1.49,.12,1.10,.02,.64);
  pinna.bezierCurveTo(-.04,.34,-.29,.18,-.46,.45);
  pinna.bezierCurveTo(-.64,.76,-.98,.74,-1.10,.43);
  pinna.bezierCurveTo(-1.24,.08,-1.03,-.20,-.79,-.33);
  pinna.bezierCurveTo(-.48,-.50,-.41,-.83,-.58-1.13);
  pinna.bezierCurveTo(-.78,-1.49,-1.15,-1.74,-1.42,-1.58);
  add(extrude(pinna,.48,skin,-.26),"pinna-shell");

  // Helix, antihelix and concha give the outer ear the reference's 3D relief.
  add(tube([[-1.36,-1.28,.31],[-1.66,-.70,.34],[-1.64,.18,.35],[-1.48,.96,.35],[-1.12,1.43,.34],[-.62,1.47,.33],[-.20,1.13,.32],[-.07,.72,.31]],.085,0xefb09c),"helix-rim");
  add(tube([[-1.21,-.62,.32],[-1.33,-.12,.34],[-1.18,.45,.35],[-.87,.92,.35],[-.55,.84,.34],[-.43,.49,.33]],.066,0xe8a18f),"antihelix-ridge");
  add(tube([[-.93,.53,.34],[-.76,.27,.35],[-.66,-.06,.35],[-.79,-.32,.34]],.055,0xe6a08c),"antihelix-lower-crus");
  const concha=add(ellipsoid([-.71,-.12,.22],[.46,.55,.10],0x9f5c57),"concha-bowl");concha.material=standard(0x9f5c57,.82);
  add(ellipsoid([-.47,-.17,.34],[.19,.27,.16],cartilage),"tragus");
  add(ellipsoid([-.79,-.59,.33],[.20,.20,.15],cartilage),"antitragus");
  add(ellipsoid([-1.13,-1.29,.08],[.36,.46,.25],skin),"lobule");

  // Temporal-bone cutaway: upper roof, lower floor and mastoid block.
  const upper=new THREE.Shape();upper.moveTo(-.38,.18);upper.lineTo(-.33,1.50);upper.bezierCurveTo(.22,1.60,1.15,1.55,1.78,1.16);upper.bezierCurveTo(1.93,.88,1.90,.42,1.57,.24);upper.lineTo(.58,.16);upper.bezierCurveTo(.20,.12,-.10,.11,-.38,.18);upper.closePath();
  add(extrude(upper,.46,bone,-.22),"temporal-bone-upper");
  const lower=new THREE.Shape();lower.moveTo(-.38,-.42);lower.bezierCurveTo(.05,-.48,.34,-.47,.56,-.62);lower.bezierCurveTo(.77,-.78,.83-1.12,1.16-1.38);lower.lineTo(1.55,-1.20);lower.bezierCurveTo(1.22,-.88,1.02,-.48,.78,-.30);lower.bezierCurveTo(.41,-.06,.02,-.15,-.38,-.20);lower.closePath();
  add(extrude(lower,.44,boneLight,-.21),"temporal-bone-floor");
  add(ellipsoid([1.52,-.18,-.03],[.46,.74,.29],bone),"mastoid-bone");

  // Porous cancellous bone visible on the cut face. Dark shallow cells create
  // depth without expensive boolean geometry.
  for(let row=0;row<4;row++)for(let col=0;col<7;col++){
    const x=-.10+col*.245+(row%2)*.06,y=.43+row*.22+(col%3)*.022;
    if(x>1.45||y>1.34)continue;
    const cell=ellipsoid([x,y,.265],[.055+(col%2)*.014,.041+(row%2)*.010,.014],boneDark);
    add(cell,`bone-cell-${row}-${col}`);
  }

  // Reference-like soft-tissue layers on the cut edge.
  for(let n=0;n<8;n++)add(ellipsoid([-.27+n*.045,.54+n*.09,.29],[.055,.075,.022],fat),`fat-lobule-${n}`);
  const muscleStrip=add(new THREE.Mesh(new THREE.BoxGeometry(.055,.92,.035),standard(muscle,.6)),"muscle-cut-layer");muscleStrip.position.set(.10,.87,.29);muscleStrip.rotation.z=-.04;
  const fascia=add(new THREE.Mesh(new THREE.BoxGeometry(.035,.92,.025),standard(0xf1d9bc,.78)),"fascia-cut-layer");fascia.position.set(.17,.87,.292);

  // Hollow-looking external auditory canal: a warm wall and a darker lumen.
  add(tube([[-.72,-.17,.17],[-.47,-.14,.17],[-.18,-.11,.16],[.05,-.09,.15],[.23,-.07,.14]],.18,canal),"ear-canal-wall");
  add(tube([[-.76,-.17,.205],[-.47,-.14,.205],[-.18,-.11,.195],[.05,-.09,.185],[.23,-.07,.175]],.112,canalDark),"ear-canal-lumen");

  root.updateMatrixWorld(true);
  return root;
}
''',encoding="utf-8")

old_ear='''    case "ear": {
      tube(part("ear-canal",[-.72,-.08,.38]),[[-1.55,-.12,.02],[-1.08,-.08,.04],[-.58,-.05,.06],[-.28,-.03,.06]],.16,cream);
      const drum=mesh(part("eardrum",[-.18,-.03,.42]),new THREE.CylinderGeometry(.34,.34,.07,40),pink,[-.18,-.03,.06]);drum.rotation.z=Math.PI/2;
      const bones=part("ossicles",[.20,.13,.45]);ellipsoid(bones,[.02,.14,.08],[.15,.24,.12],gold);ellipsoid(bones,[.23,.18,.08],[.14,.17,.12],gold);ellipsoid(bones,[.43,.10,.08],[.10,.22,.10],gold);tube(bones,[[.06,.11,.08],[.22,.18,.08],[.41,.11,.08]],.035,gold);
      tube(part("eustachian-tube",[.40,-.84,.37]),[[.28,-.20,.04],[.42,-.61,.02],[.62,-1.28,-.04]],.09,cream);
      ellipsoid(part("vestibule",[.62,.06,.43]),[.60,.04,.05],[.26,.30,.22],teal);
      const canals=part("semicircular-canals",[.72,.72,.42]);const c1=ring(canals,[.68,.60,.02],.45,.055,teal),c2=ring(canals,[.70,.60,.02],.40,.05,teal),c3=ring(canals,[.72,.56,.02],.36,.05,teal);c1.rotation.x=Math.PI/2;c2.rotation.y=Math.PI/2;c3.rotation.set(Math.PI/2,Math.PI/3,0);
      const cochlea=part("cochlea",[1.02,-.18,.45]),spiral:Point3[]=[];for(let n=0;n<=90;n++){const t=n/90,a=t*Math.PI*5.4,r=.52*(1-.72*t);spiral.push([1.02,-.18+Math.cos(a)*r,.02+Math.sin(a)*r]);}tube(cochlea,spiral,.07,pink);ellipsoid(cochlea,[1.02,-.18,.02],[.16,.16,.13],pink);
      tube(part("auditory-nerve",[1.48,-.05,.39]),[[1.14,-.10,.02],[1.42,-.04,.01],[1.78,.02,-.02]],.09,gold);break;
    }
'''
new_ear='''    case "ear": {
      // Reference image layout: lateral cutaway, with the canal running left →
      // right and the inner-ear structures grouped behind the tympanic membrane.
      const canalPart=part("ear-canal",[-.83,-.13,.42]);
      tube(canalPart,[[-1.48,-.18,.08],[-1.10,-.16,.09],[-.72,-.14,.10],[-.39,-.11,.10],[-.22,-.09,.10]],.18,red);
      tube(canalPart,[[-1.45,-.18,.135],[-1.10,-.16,.135],[-.72,-.14,.14],[-.39,-.11,.14],[-.22,-.09,.14]],.105,0x743f40);

      const drum=mesh(part("eardrum",[-.14,-.07,.48]),new THREE.CylinderGeometry(.32,.30,.052,48),pink,[-.14,-.07,.10]);
      drum.rotation.z=Math.PI/2;drum.rotation.y=-.13;
      const drumMaterial=drum.material as THREE.MeshStandardMaterial;drumMaterial.transparent=true;drumMaterial.opacity=.72;drumMaterial.roughness=.36;drumMaterial.depthWrite=false;
      for(let n=0;n<6;n++){const angle=-.92+n*.37;tube(parts.get("eardrum")!.root,[[-.14,-.07,.135],[-.14+Math.cos(angle)*.25,-.07+Math.sin(angle)*.25,.14]],.008,cream);}

      const bones=part("ossicles",[.24,.18,.50]);
      // Malleus: rounded head plus manubrium attached to the eardrum.
      ellipsoid(bones,[.02,.23,.13],[.115,.14,.11],cream);
      tube(bones,[[.02,.15,.13],[-.01,.05,.12],[-.06,-.02,.115]],.035,cream);
      // Incus: body and long crus.
      ellipsoid(bones,[.22,.23,.13],[.12,.105,.10],cream);
      tube(bones,[[.15,.21,.13],[.25,.16,.13],[.32,.08,.12]],.033,cream);
      // Stapes: a tiny stirrup and its footplate at the oval window.
      const stapes=mesh(bones,new THREE.TorusGeometry(.085,.022,10,30),gold,[.405,.07,.125],[.74,1,.62]);stapes.rotation.y=-.22;
      tube(bones,[[.31,.08,.12],[.36,.07,.125]],.022,gold);
      ellipsoid(bones,[.47,.07,.12],[.035,.105,.075],gold);

      const eustachian=part("eustachian-tube",[.62,-.88,.43]);
      tube(eustachian,[[.39,-.17,.08],[.48,-.43,.07],[.64,-.78,.055],[.88,-1.28,.02]],.115,red);
      tube(eustachian,[[.40,-.18,.105],[.49,-.43,.095],[.65,-.78,.08],[.88,-1.28,.05]],.063,cream);

      const vestibule=part("vestibule",[.65,.13,.48]);
      ellipsoid(vestibule,[.63,.11,.11],[.24,.27,.20],teal);
      ellipsoid(vestibule,[.57,.18,.25],[.11,.13,.10],0x9bc7bb);
      ellipsoid(vestibule,[.69,.03,.24],[.095,.115,.09],0x9bc7bb);
      const oval=ring(vestibule,[.46,.07,.11],.105,.025,cream);oval.scale.y=.72;

      const canals=part("semicircular-canals",[.82,.72,.50]);
      const loopA:Point3[]=[],loopB:Point3[]=[],loopC:Point3[]=[];
      for(let n=0;n<=52;n++){
        const a=n/52*Math.PI*2;
        loopA.push([.73+Math.cos(a)*.33,.62+Math.sin(a)*.48,.11]);
        loopB.push([.83+Math.cos(a)*.46,.57+Math.sin(a)*.24,.11+Math.sin(a)*.19]);
        loopC.push([.79+Math.cos(a)*.27,.61+Math.sin(a)*.40,.11+Math.cos(a)*.18]);
      }
      tube(canals,loopA,.052,teal);tube(canals,loopB,.049,teal);tube(canals,loopC,.047,teal);
      ellipsoid(canals,[.62,.28,.12],[.12,.11,.11],teal);ellipsoid(canals,[.94,.29,.12],[.11,.10,.10],teal);

      const cochlea=part("cochlea",[1.08,-.15,.48]),spiral:Point3[]=[];
      for(let n=0;n<=128;n++){
        const t=n/128,a=t*Math.PI*5.7,r=.49*(1-.79*t);
        spiral.push([1.05+Math.cos(a)*r,-.17+Math.sin(a)*r,.10+Math.sin(a*.55)*.018]);
      }
      tube(cochlea,spiral,.082,pink);ellipsoid(cochlea,[1.05,-.17,.10],[.14,.14,.12],pink);
      const innerSpiral:Point3[]=[];for(let n=0;n<=96;n++){const t=n/96,a=t*Math.PI*5.2,r=.31*(1-.77*t);innerSpiral.push([1.05+Math.cos(a)*r,-.17+Math.sin(a)*r,.185]);}tube(cochlea,innerSpiral,.022,cream);

      const nerve=part("auditory-nerve",[1.55,.02,.45]);
      for(let n=0;n<5;n++){
        const offset=(n-2)*.035;
        tube(nerve,[[1.28,-.06+offset,.105],[1.46,-.01+offset*.8,.095],[1.70,.03+offset*.65,.07],[1.87,.02+offset*.45,.04]],.024,gold);
      }
      break;
    }
'''
replace_once("src/ui/biology-organ-interiors.ts",old_ear,new_ear)

replace_once(
    "src/data/biology-organ-landmarks.ts",
    '  ear:{"ear-canal":surface([-.72,-.08,.64]),eardrum:inside([-.18,-.04,.72]),ossicles:inside([.20,.12,.75]),"eustachian-tube":inside([.38,-.85,.68]),vestibule:inside([.62,.06,.76]),"semicircular-canals":inside([.72,.70,.72]),cochlea:inside([1.02,-.16,.75]),"auditory-nerve":inside([1.48,-.05,.66])},',
    '  ear:{"ear-canal":surface([-.88,-.14,.68]),eardrum:inside([-.14,-.07,.76]),ossicles:inside([.24,.18,.80]),"eustachian-tube":inside([.62,-.88,.72]),vestibule:inside([.65,.13,.80]),"semicircular-canals":inside([.82,.72,.80]),cochlea:inside([1.08,-.15,.80]),"auditory-nerve":inside([1.55,.02,.72])},',
)

# Add a small regression test ensuring the reference shell stays genuinely 3D
# and retains the key cutaway components rather than regressing to a flat image.
test_path=Path("tests/biology-atlas-3d.test.js")
test_text=test_path.read_text(encoding="utf-8")
marker="test('Kalp boşlukları dış duvar, iç duvar ve kesit kenarı içerir; sol karıncık duvarı daha kalındır',async()=>{"
addition=r'''test('Kulak referans kesiti gerçek 3B kabuk, kemik katmanları ve kanal geometrisi içerir',async()=>{
  const {createEarSourceModel}=await load('src/ui/biology-ear-source.ts'),{disposeAtlasObject}=await load('src/ui/biology-atlas-model.ts'),THREE=await import('three');
  const model=createEarSourceModel(),names=new Set();let meshes=0,volume=0;
  model.traverse(o=>{if(!o.isMesh)return;meshes++;names.add(o.name);o.geometry.computeBoundingBox();const s=o.geometry.boundingBox.getSize(new THREE.Vector3());assert.ok(s.x>0&&s.y>0&&s.z>0,o.name);volume+=s.x*s.y*s.z;});
  for(const name of ['pinna-shell','helix-rim','antihelix-ridge','temporal-bone-upper','temporal-bone-floor','ear-canal-wall','ear-canal-lumen'])assert.ok(names.has(name),name);
  assert.ok(meshes>=35);assert.ok(volume>1);disposeAtlasObject(model);
});

'''
if addition.strip() not in test_text:
    if marker not in test_text: raise SystemExit("3B test ekleme noktası bulunamadı")
    test_path.write_text(test_text.replace(marker,addition+marker,1),encoding="utf-8")

print("Referans görsele dayalı 3B kulak geometrisi hazırlandı.")
