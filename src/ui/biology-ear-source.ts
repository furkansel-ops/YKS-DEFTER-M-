import * as THREE from "three";

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
  pinna.bezierCurveTo(-.48,-.50,-.41,-.83,-.58,-1.13);
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
  const lower=new THREE.Shape();lower.moveTo(-.38,-.42);lower.bezierCurveTo(.05,-.48,.34,-.47,.56,-.62);lower.bezierCurveTo(.77,-.78,.83,-1.12,1.16,-1.38);lower.lineTo(1.55,-1.20);lower.bezierCurveTo(1.22,-.88,1.02,-.48,.78,-.30);lower.bezierCurveTo(.41,-.06,.02,-.15,-.38,-.20);lower.closePath();
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
