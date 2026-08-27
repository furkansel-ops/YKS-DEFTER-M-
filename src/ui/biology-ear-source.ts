import * as THREE from "three";

const makeMaterial=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.7,metalness:0,side:THREE.DoubleSide});
const makeTube=(points:readonly (readonly [number,number,number])[],radius:number,color:number)=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),48,radius,12,false),makeMaterial(color));

/** Lightweight authored reference surface for the atlas. The detailed YKS
 * structures are provided by biology-organ-interiors.ts after the shell opens. */
export function createEarSourceModel():THREE.Group {
  const root=new THREE.Group();root.name="procedural-ear-reference";
  const shape=new THREE.Shape();
  shape.moveTo(-1.22,-1.38);
  shape.bezierCurveTo(-1.78,-.95,-1.75,.55,-1.08,1.38);
  shape.bezierCurveTo(-.55,1.94,.27,1.63,.55,.86);
  shape.bezierCurveTo(.73,.35,.37,-.18,.06,.28);
  shape.bezierCurveTo(-.20,.69,-.63,.78,-.82,.38);
  shape.bezierCurveTo(-1.04,-.08,-.76,-.51,-.42,-.63);
  shape.bezierCurveTo(-.04,-.78,.02,-1.18,-.43,-1.45);
  shape.bezierCurveTo(-.73,-1.62,-1.03,-1.58,-1.22,-1.38);
  const pinna=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.50,bevelEnabled:true,bevelThickness:.07,bevelSize:.055,bevelSegments:3,steps:1,curveSegments:32}),makeMaterial(0xd99a91));pinna.position.z=-.25;root.add(pinna);
  root.add(makeTube([[-1.20,-1.08,.30],[-1.49,-.48,.33],[-1.43,.54,.33],[-.95,1.24,.33],[-.29,1.35,.32],[.20,.84,.31],[.04,.34,.32],[-.43,.57,.33],[-.78,.12,.33],[-.56,-.34,.32]],.075,0xefb4a8));
  root.add(makeTube([[-.62,-.19,.10],[-.28,-.11,.10],[.08,-.06,.08],[.47,-.04,.06]],.16,0xe7c5a5));
  const opening=new THREE.Mesh(new THREE.TorusGeometry(.19,.035,10,36),makeMaterial(0x9e6d68));opening.position.set(-.62,-.19,.34);opening.rotation.y=Math.PI/2;root.add(opening);
  return root;
}
