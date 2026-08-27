import * as THREE from "three";

type P3=readonly [number,number,number];
const C={
  skin:0xd9947f,skinHi:0xefad98,skinDeep:0x985853,
  bone:0xe4c69a,boneHi:0xf1dfbd,boneDark:0x7c6049,
  canal:0xb85e58,lumen:0x5b3434,membrane:0xd99891,
  cartilage:0xe6a28e,gold:0xd6ad63,nerve:0xe2ae3c,
  vestibular:0xc7b092,cochlea:0xc9a889,tissue:0x9e554f
};

function mat(color:number,roughness=.66,opacity=1){
  const m=new THREE.MeshStandardMaterial({color,roughness,metalness:0,side:THREE.DoubleSide});
  if(opacity<1){m.transparent=true;m.opacity=opacity;m.depthWrite=opacity>.82;}
  return m;
}
function tube(points:readonly P3[],radius:number,color:number,closed=false,roughness=.58){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed,"catmullrom",.42);
  return new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(56,points.length*10),radius,16,closed),mat(color,roughness));
}
function ellipsoid(position:P3,scale:P3,color:number,roughness=.67){
  const m=new THREE.Mesh(new THREE.SphereGeometry(1,36,24),mat(color,roughness));m.position.set(...position);m.scale.set(...scale);return m;
}
function extrude(shape:THREE.Shape,depth:number,color:number,z=-.1,roughness=.72){
  const m=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:4,curveSegments:48}),mat(color,roughness));m.position.z=z;return m;
}
function disc(radius:number,depth:number,color:number,position:P3,opacity=1){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*.96,depth,48),mat(color,.48,opacity));m.position.set(...position);m.rotation.z=Math.PI/2;return m;
}
function torus(position:P3,radius:number,tubeRadius:number,color:number,scale:P3=[1,1,1]){
  const m=new THREE.Mesh(new THREE.TorusGeometry(radius,tubeRadius,12,48),mat(color,.58));m.position.set(...position);m.scale.set(...scale);return m;
}

/** Anatomical cutaway authored from the user's supplied multi-view ear model
 * reference. This remains real Three.js geometry; the reference image is not
 * pasted into the application as a flat texture. */
export function createEarSourceModel():THREE.Group {
  const root=new THREE.Group();root.name="ear-reference-cutaway-v2";
  const add=<T extends THREE.Object3D>(o:T,name:string)=>{o.name=name;root.add(o);return o;};

  // Thin organic auricle plate behind the sculpted ridges.
  const outline=new THREE.Shape();
outline.moveTo(-1.47,-1.48);
outline.splineThru([new THREE.Vector2(-1.72,-.92),new THREE.Vector2(-1.76,-.10),new THREE.Vector2(-1.58,.78),new THREE.Vector2(-1.22,1.43),new THREE.Vector2(-.73,1.58),new THREE.Vector2(-.24,1.30),new THREE.Vector2(.02,.78),new THREE.Vector2(-.24,.37),new THREE.Vector2(-.68,.10),new THREE.Vector2(-.58,-.57),new THREE.Vector2(-.82,-1.35),new THREE.Vector2(-1.18,-1.60),new THREE.Vector2(-1.47,-1.48)]);
outline.closePath();
  const plate=add(extrude(outline,.22,C.skin,-.16,.78),"auricle-skin-plate");plate.rotation.y=-.03;

  // Helix and antihelix are real raised 3D ridges rather than painted lines.
  add(tube([[-1.38,-1.22,.22],[-1.67,-.78,.27],[-1.70,-.10,.30],[-1.60,.70,.31],[-1.30,1.28,.30],[-.87,1.48,.28],[-.46,1.39,.27],[-.16,1.08,.25],[-.08,.72,.23]],.105,C.skinHi),"helix");
  add(tube([[-1.22,-.67,.245],[-1.31,-.18,.27],[-1.20,.39,.29],[-.94,.87,.29],[-.67,1.05,.28],[-.48,.83,.27],[-.47,.50,.26]],.078,C.cartilage),"antihelix");
  add(tube([[-.91,.72,.27],[-.76,.48,.28],[-.68,.20,.28],[-.73,-.04,.27]],.058,C.cartilage),"antihelix-crus");
  const concha=add(ellipsoid([-.66,-.12,.18],[.47,.54,.13],C.skinDeep,.82),"concha");concha.rotation.y=-.06;
  add(ellipsoid([-.41,-.12,.27],[.19,.27,.18],C.cartilage),"tragus");
  add(ellipsoid([-.77,-.55,.27],[.20,.18,.17],C.cartilage),"antitragus");
  add(ellipsoid([-1.12,-1.28,.04],[.37,.43,.27],C.skin,.76),"lobule");

  // Temporal bone mass. Multiple overlapping organic volumes avoid the flat
  // cardboard look of the first attempt.
  add(ellipsoid([.98,.52,-.12],[1.32,1.02,.48],C.bone,.82),"temporal-bone-body");
  add(ellipsoid([1.53,-.24,-.10],[.72,.91,.42],C.bone,.84),"mastoid-body");
  add(ellipsoid([.62,-.73,-.12],[.88,.52,.40],C.boneHi,.82),"temporal-bone-floor");

  // The visible lateral cut face is shallow and slightly forward, giving the
  // same sectional presentation as the supplied anatomical model.
  const cut=new THREE.Shape();
cut.moveTo(-.29,-.44);
cut.splineThru([new THREE.Vector2(-.27,1.39),new THREE.Vector2(.30,1.52),new THREE.Vector2(1.24,1.48),new THREE.Vector2(1.88,.98),new THREE.Vector2(1.98,.25),new THREE.Vector2(1.72,-.76),new THREE.Vector2(1.06,-1.24),new THREE.Vector2(.30,-.90),new THREE.Vector2(-.29,-.44)]);
cut.closePath();
  add(extrude(cut,.105,C.boneHi,.205,.88),"bone-cut-face");

  // Cancellous bone cells on the section face.
  for(let row=0;row<6;row++)for(let col=0;col<9;col++){
    const x=-.04+col*.205+(row%2)*.065,y=.42+row*.155+(col%3)*.018;
    if(x>1.72||y>1.28)continue;
    const hole=ellipsoid([x,y,.322],[.052+(col%3)*.009,.037+(row%2)*.010,.012],C.boneDark,.95);add(hole,`cancellous-${row}-${col}`);
  }

  // Auditory canal wall and visible lumen.
  add(tube([[-.73,-.13,.25],[-.48,-.12,.27],[-.20,-.10,.28],[.04,-.08,.29],[.25,-.06,.29]],.205,C.canal),"external-auditory-canal-wall");
  add(tube([[-.75,-.13,.315],[-.48,-.12,.32],[-.20,-.10,.325],[.04,-.08,.328],[.25,-.06,.328]],.118,C.lumen),"external-auditory-canal-lumen");

  // Tympanic membrane is visible in the normal cutaway view.
  const drum=add(disc(.305,.048,C.membrane,[.31,-.055,.30],.68),"tympanic-membrane");drum.rotation.y=-.10;
  for(let i=0;i<7;i++){const a=-1.05+i*.34;add(tube([[.31,-.055,.335],[.31,-.055+Math.sin(a)*.25,.335+Math.cos(a)*.025]],.007,C.boneHi),`eardrum-fiber-${i}`);}

  // Ossicles: malleus → incus → stapes.
  add(ellipsoid([.43,.18,.35],[.105,.13,.095],C.boneHi,.45),"malleus-head");
  add(tube([[.43,.12,.35],[.39,.04,.34],[.35,-.025,.33]],.031,C.boneHi),"malleus-handle");
  add(ellipsoid([.61,.19,.35],[.11,.10,.09],C.boneHi,.45),"incus-body");
  add(tube([[.55,.17,.35],[.64,.12,.35],[.70,.05,.34]],.028,C.boneHi),"incus-crus");
  const stapes=add(torus([.79,.045,.345],.074,.018,C.gold,[.72,1,.62]),"stapes");stapes.rotation.y=-.22;
  add(tube([[.70,.05,.34],[.74,.05,.345]],.018,C.gold),"incus-stapes-joint");

  // Vestibule and three semicircular canals, placed inside the temporal bone.
  add(ellipsoid([.90,.12,.28],[.21,.24,.18],C.vestibular,.62),"vestibule");
  const loops:readonly P3[][]=[
    [[.82,.35,.30],[.73,.65,.31],[.78,.91,.29],[.99,1.01,.28],[1.13,.82,.27],[1.10,.52,.28],[.96,.34,.29],[.82,.35,.30]],
    [[.88,.37,.30],[1.08,.52,.38],[1.31,.67,.34],[1.46,.55,.28],[1.37,.34,.23],[1.13,.27,.22],[.88,.37,.30]],
    [[.82,.34,.29],[.69,.57,.17],[.67,.82,.13],[.83,.93,.17],[1.01,.79,.25],[1.04,.53,.30],[.82,.34,.29]]
  ];
  loops.forEach((pts,i)=>add(tube(pts,.050-i*.003,C.vestibular,true,.55),`semicircular-canal-${i+1}`));

  // Cochlea with visible coiled tube and a smaller inner spiral.
  const spiral:P3[]=[],inner:P3[]=[];
  for(let n=0;n<=150;n++){
    const t=n/150,a=t*Math.PI*5.75,r=.47*(1-.79*t);
    spiral.push([1.20+Math.cos(a)*r,-.18+Math.sin(a)*r,.32]);
    const ri=.29*(1-.78*t);inner.push([1.20+Math.cos(a)*ri,-.18+Math.sin(a)*ri,.36]);
  }
  add(tube(spiral,.081,C.cochlea,false,.56),"cochlea");
  add(tube(inner,.020,C.boneHi,false,.46),"cochlea-inner-turn");
  add(ellipsoid([1.20,-.18,.32],[.13,.13,.11],C.cochlea,.52),"cochlea-core");

  // Auditory/vestibular nerve bundle exits posteriorly in yellow strands.
  for(let i=0;i<6;i++){
    const o=(i-2.5)*.031;
    add(tube([[1.42,-.06+o,.31],[1.61,-.02+o*.8,.29],[1.82,.02+o*.55,.25],[2.01,.01+o*.35,.20]],.021,C.nerve),`auditory-nerve-${i}`);
  }

  // Eustachian tube descends anteroinferiorly as in the reference.
  add(tube([[.55,-.20,.28],[.66,-.43,.25],[.80,-.70,.20],[1.02,-1.10,.12]],.115,C.tissue),"eustachian-wall");
  add(tube([[.56,-.21,.32],[.67,-.44,.29],[.81,-.71,.24],[1.02,-1.10,.17]],.055,C.boneHi),"eustachian-lumen");

  root.updateMatrixWorld(true);return root;
}
