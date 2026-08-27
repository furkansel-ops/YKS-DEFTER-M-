import * as THREE from "three";
import type {OrganId} from "../data/biology-atlas.ts";
import type {Point3} from "../data/biology-organ-landmarks.ts";

export interface InteriorPart {id:string;root:THREE.Group;anchor:THREE.Object3D}
export interface OrganInterior {root:THREE.Group;parts:Map<string,InteriorPart>;select(id:string):void}
const blue=0x72acd2,red=0xd58283,pink=0xe4aeaa,cream=0xf1d9b7,teal=0x7aafa3,gold=0xd6b471;

/** A real hollow, thick-walled bowl: outer wall, inner wall and front rim.
 * This is an educational chamber volume, NOT recovered source anatomy. */
export function chamberGeometry(rx:number,ry:number,rz:number,wall=.22):THREE.BufferGeometry {
  const positions:number[]=[],indices:number[]=[],rows=14,cols=40;
  for(let layer=0;layer<2;layer++)for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
    const theta=Math.PI/2+row/rows*Math.PI/2,phi=col/cols*Math.PI*2,s=layer?1-wall:1;
    positions.push(rx*s*Math.sin(theta)*Math.cos(phi),ry*s*Math.sin(theta)*Math.sin(phi),rz*s*Math.cos(theta));
  }
  const stride=cols+1,count=(rows+1)*stride,starts:number[]=[];
  for(let layer=0;layer<2;layer++){
    starts.push(indices.length);
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const a=layer*count+row*stride+col,b=a+1,c=a+stride,d=c+1;
      indices.push(...(layer?[a,b,c,b,d,c]:[a,c,b,b,c,d]));
    }
  }
  starts.push(indices.length);
  for(let col=0;col<cols;col++){const a=col,b=col+1,c=count+col,d=c+1;indices.push(a,b,c,b,d,c);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);
  geometry.addGroup(0,starts[1]!,0);geometry.addGroup(starts[1]!,starts[2]!-starts[1]!,1);geometry.addGroup(starts[2]!,indices.length-starts[2]!,2);geometry.computeVertexNormals();return geometry;
}

/** Authored, rotatable teaching volumes; all geometry is created once per
 * organ, all parts have stable IDs shared with the Turkish curriculum guide. */
export function createOrganInterior(id:OrganId):OrganInterior {
  const root=new THREE.Group();root.name="educational-interior-"+id;
  const parts=new Map<string,InteriorPart>();
  const material=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.65,metalness:0,side:THREE.DoubleSide});
  function part(name:string,anchor:Point3) {
    const group=new THREE.Group();group.name="structure-"+name;group.userData.structureId=name;
    const point=new THREE.Object3D();point.position.set(...anchor);group.add(point);root.add(group);
    parts.set(name,{id:name,root:group,anchor:point});return group;
  }
  function mesh(group:THREE.Group,geometry:THREE.BufferGeometry,color:number,position:Point3=[0,0,0],scale:Point3=[1,1,1]) {
    const object=new THREE.Mesh(geometry,material(color));object.position.set(...position);object.scale.set(...scale);object.userData.structureId=group.userData.structureId;group.add(object);return object;
  }
  function ellipsoid(group:THREE.Group,position:Point3,scale:Point3,color:number){return mesh(group,new THREE.SphereGeometry(1,28,18),color,position,scale);}
  function tube(group:THREE.Group,points:readonly Point3[],radius:number,color:number){return mesh(group,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(20,points.length*8),radius,10,false),color);}
  function ring(group:THREE.Group,position:Point3,radius:number,thickness:number,color:number){return mesh(group,new THREE.TorusGeometry(radius,thickness,10,36),color,position);}
  function extrusion(group:THREE.Group,shape:THREE.Shape,depth:number,color:number,position:Point3=[0,0,0]) {return mesh(group,new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2,steps:1,curveSegments:24}),color,position);}
  function bowl(group:THREE.Group,position:Point3,size:Point3,lumen:number,wall=.22){const o=new THREE.Mesh(chamberGeometry(...size,wall),[material(red),material(lumen),material(pink)]);o.position.set(...position);o.userData.structureId=group.userData.structureId;group.add(o);return o;}
  const decor=new THREE.Group();decor.name="context-not-a-selectable-structure";root.add(decor);
  switch(id){
    case "heart": {
      bowl(part("right-atrium",[-.62,.58,.12]),[-.62,.58,.1],[.48,.47,.47],blue,.17);
      bowl(part("left-atrium",[.56,.6,.10]),[.56,.6,.02],[.45,.44,.44],pink,.20);
      bowl(part("right-ventricle",[-.57,-.65,.18]),[-.57,-.64,.08],[.50,.86,.59],blue,.20);
      bowl(part("left-ventricle",[.56,-.65,.18]),[.56,-.64,.08],[.53,.87,.62],pink,.34);
      ellipsoid(decor,[0,-.45,-.23],[.13,1.0,.40],red);
      for(const [name,x,leaflets] of [["tricuspid",-.59,3],["mitral",.56,2]] as const){
        const g=part(name,[x,.04,.40]);ring(g,[x,.04,.08],.33,.045,cream).rotation.x=Math.PI/2;
        for(let n=0;n<leaflets;n++){const a=n/leaflets*Math.PI*2;const leaf=ellipsoid(g,[x+Math.cos(a)*.15,-.025,.09+Math.sin(a)*.15],[.18,.025,.22],cream);leaf.rotation.z=Math.cos(a)*.35;tube(g,[[x+Math.cos(a)*.13,-.06,.09+Math.sin(a)*.13],[x,-.4,-.05],[x+.05,-.6,-.1]],.012,cream);}
      }
      tube(part("aorta",[-.16,1.46,-.05]),[[.45,-.25,-.25],[.18,.75,-.3],[-.16,1.34,-.2],[.05,1.6,-.25],[.56,1.5,-.45],[.8,1.06,-.55]],.17,red);
      for(const x of [-.1,.13,.35])tube(parts.get("aorta")!.root,[[x,1.5,-.27],[x-.04,1.85,-.29]],.07,red);
      tube(part("pulmonary-artery",[.52,1.09,.25]),[[-.45,-.2,-.22],[-.30,.65,-.06],[.12,1.0,.20],[.73,1.13,.24],[1.14,1.20,.25]],.15,blue);
      break;
    }
    case "brain": {
      const cortex=part("cerebrum",[-.85,.95,.18]);const shape=new THREE.Shape();shape.moveTo(-1.6,.05);shape.bezierCurveTo(-2,.9,-1.15,1.6,-.2,1.55);shape.bezierCurveTo(.95,1.65,1.75,.83,1.42,.1);shape.bezierCurveTo(1,-.25,.35,-.12,.04,-.22);shape.bezierCurveTo(-.5,-.37,-1.3,-.32,-1.6,.05);extrusion(cortex,shape,.45,pink,[0,0,-.45]);
      for(let n=0;n<6;n++){const x=-1.42+n*.48;tube(cortex,[[x,.27,.04],[x-.06,.58,.08],[x+.13,.78,.08],[x+.04,1.02,.06]],.025,0xc08392);}
      tube(decor,[[-.95,.15,.1],[-.77,.53,.12],[-.18,.69,.14],[.45,.56,.12],[.70,.28,.10]],.11,cream);
      ellipsoid(part("thalamus",[0,.13,.39]),[0,.13,.20],[.33,.23,.22],blue);
      ellipsoid(part("hypothalamus",[-.1,-.27,.42]),[-.1,-.25,.20],[.22,.16,.21],0xaa8bbd);
      tube(decor,[[-.13,-.36,.18],[-.14,-.60,.18]],.045,0xaa8bbd);ellipsoid(decor,[-.14,-.62,.18],[.11,.07,.1],0xaa8bbd);
      ellipsoid(part("midbrain",[.38,-.42,.38]),[.35,-.41,.14],[.23,.29,.22],gold);
      ellipsoid(part("pons",[.52,-.83,.44]),[.5,-.82,.17],[.31,.25,.26],gold);
      tube(part("medulla",[.43,-1.35,.28]),[[.48,-1.01,.12],[.44,-1.33,.12],[.41,-1.66,.08]],.14,cream);
      const cerebellum=part("cerebellum",[1.04,-.70,.44]);ellipsoid(cerebellum,[1.0,-.72,-.02],[.62,.48,.46],teal);
      for(let n=0;n<6;n++){const y=-1.04+n*.12;const w=Math.sqrt(Math.max(0,1-((y+.72)/.48)**2))*.5;tube(cerebellum,[[1-w,y,.25],[1,y+.05,.44],[1+w,y,.25]],.018,0x4a8b82);}
      tube(cerebellum,[[.57,-.78,.40],[1,-.75,.46],[1.15,-.48,.38]],.045,cream);tube(cerebellum,[[.94,-.75,.46],[1.23,-.9,.35]],.033,cream);
      break;
    }
    case "lungs": {
      ellipsoid(decor,[-.9,-.25,-.35],[.7,1.15,.40],pink);ellipsoid(decor,[.9,-.25,-.35],[.7,1.15,.40],pink);
      const trachea=part("trachea",[0,1.13,.18]);tube(trachea,[[0,1.7,0],[0,.48,0]],.14,cream);for(let n=0;n<7;n++)ring(trachea,[0,.65+n*.14,0],.145,.014,0xb7a284).rotation.x=Math.PI/2;
      const bron=part("bronchus",[-.45,.17,.22]);tube(bron,[[0,.48,0],[-.45,.13,.1],[-.95,-.28,.08]],.11,cream);tube(bron,[[0,.48,0],[.48,.13,.1],[.97,-.24,.08]],.11,cream);
      const twig=part("bronchiole",[.94,-.5,.20]);for(const side of [-1,1])for(let n=0;n<3;n++){const y=-.25-n*.29;tube(twig,[[side*.75,y+.28,.10],[side*(.75+n*.15),y,.15],[side*(1.1+n*.06),y-.18,.14]],.045,cream);}
      const alveoli=part("alveolus",[.91,-.90,.65]);for(let n=0;n<7;n++){const a=n*Math.PI*2/7;ellipsoid(alveoli,[.88+Math.cos(a)*.27,-.91+Math.sin(a)*.26,.37],[.18,.19,.17],pink);}tube(alveoli,[[.48,-.91,.48],[.6,-1.30,.42],[1.15,-1.30,.42],[1.27,-.98,.45]],.034,blue);
      ellipsoid(part("diaphragm",[0,-1.62,.15]),[0,-1.67,-.15],[1.45,.17,.7],gold);break;
    }
    case "liver": {
      const cells=part("hepatocyte",[-.4,.57,.35]);const hex=new THREE.Shape();for(let n=0;n<6;n++){const a=n*Math.PI/3;const x=Math.cos(a)*.93,y=.38+Math.sin(a)*.87;if(n)hex.lineTo(x,y);else hex.moveTo(x,y);}hex.closePath();extrusion(decor,hex,.32,0xbb7c7c,[0,0,-.3]);
      for(let r=1;r<=3;r++)for(let n=0;n<r*6;n++){const a=n/(r*6)*Math.PI*2;ellipsoid(cells,[Math.cos(a)*r*.24,.38+Math.sin(a)*r*.22,.13],[.11,.10,.13],pink);}
      tube(decor,[[0,-.2,.04],[0,.9,.04]],.08,blue);
      tube(part("portal-vein",[-.76,-.44,.20]),[[-1.25,-.9,0],[-.75,-.43,.05],[-.8,.1,.13]],.12,blue);
      tube(part("hepatic-artery",[.80,-.42,.22]),[[1.12,-.92,0],[.75,-.4,.08],[.65,.15,.13]],.07,red);
      ellipsoid(part("gallbladder",[-.34,-.94,.25]),[-.34,-.9,.07],[.19,.37,.20],teal);
      tube(part("bile-duct",[.14,-1.29,.20]),[[-.3,-.85,.13],[.13,-.94,.13],[.15,-1.6,.13]],.055,teal);break;
    }
    case "kidneys": {
      const cortex=part("cortex",[-.92,.81,.15]);const outline=new THREE.Shape();outline.moveTo(.1,1.35);outline.bezierCurveTo(-1.4,1.8,-1.8,-1.15,-.25,-1.4);outline.bezierCurveTo(.42,-1.6,.65,-.7,.12,-.5);outline.bezierCurveTo(-.35,-.20,-.24,.25,.32,.45);outline.bezierCurveTo(.82,.73,.58,1.3,.1,1.35);extrusion(cortex,outline,.40,red,[-.16,0,-.35]);
      const medulla=part("medulla",[-.79,-.27,.22]);for(let n=0;n<5;n++){const a=-1.3+n*.65,px=-.46-Math.cos(a)*.50,py=Math.sin(a)*.84;const pyramid=mesh(medulla,new THREE.ConeGeometry(.24,.66,5),pink,[px,py,.06]);pyramid.rotation.z=-a-Math.PI/2;}
      const pelvis=part("pelvis",[.01,.03,.27]);tube(pelvis,[[.03,.45,.1],[-.17,.13,.1],[.13,-.15,.1],[.03,-.55,.1]],.10,cream);for(const y of [-.4,0,.4])tube(pelvis,[[-.48,y,.14],[-.12,0,.12]],.055,cream);
      tube(part("ureter",[.24,-1.1,.18]),[[.09,-.3,.07],[.27,-.9,.07],[.28,-1.7,0]],.075,gold);
      const glom=part("glomerulus",[1.04,-.65,.40]);bowl(glom,[1.04,-.65,.12],[.52,.49,.38],cream,.12);const loop:Point3[]=[];for(let n=0;n<=80;n++){const a=n/80*Math.PI*6;loop.push([1.04+Math.cos(a)*(.12+n/80*.17),-.65+Math.sin(a)*.24,.09+Math.sin(a*2)*.12]);}tube(glom,loop,.028,red);tube(glom,[[.88,-.24,.12],[.87,-.53,.15]],.045,red);break;
    }
    case "eyeball": {
      bowl(decor,[0,0,0],[1.3,1.15,.85],0xf4e9d3,.07);
      const retina=part("retina",[.93,.54,.10]);bowl(retina,[0,0,.04],[1.20,1.06,.78],0xe6b37d,.06);
      const cornea=ellipsoid(part("cornea",[-1.21,0,.2]),[-1.2,0,-.02],[.19,.64,.47],0xa7d1de);cornea.material.transparent=true;cornea.material.opacity=.55;
      ring(part("iris",[-.89,.33,.2]),[-.88,0,-.01],.43,.10,teal).rotation.y=Math.PI/2;
      ellipsoid(part("lens",[-.63,0,.23]),[-.62,0,-.02],[.15,.50,.34],0xbadbe2);
      ellipsoid(part("blind-spot",[1.11,-.3,.12]),[1.10,-.3,-.02],[.10,.12,.12],gold);
      tube(part("optic-nerve",[1.57,-.47,.1]),[[1.12,-.3,-.02],[1.44,-.41,-.03],[1.8,-.58,.02]],.13,gold);break;
    }
    case "intestine": {
      const small=part("small-intestine",[-.7,0,.25]);const loops:Point3[]=[];for(let n=0;n<=55;n++){const t=n/55;loops.push([-.65+Math.sin(t*Math.PI*10)*.49,1.04-t*2.05,.06+Math.cos(t*Math.PI*10)*.05]);}tube(small,loops,.10,pink);
      tube(part("large-intestine",[-1.39,.44,.2]),[[-1.39,-1.14,.02],[-1.39,.86,.02],[-1.2,1.29,.02],[-.1,1.3,.02],[.14,1.07,.02],[.14,-.83,.02],[-.16,-1.21,.02],[-.22,-1.55,.02]],.16,gold);
      const villus=part("villus",[1.01,.67,.25]);bowl(villus,[1.0,-.12,.1],[.44,1.12,.34],cream,.13);
      tube(part("blood-capillary",[.79,-.36,.34]),[[.73,-1.04,.1],[.74,.56,.1],[.95,.84,.1],[1.2,.61,.1],[1.24,-1.05,.1]],.045,red);tube(parts.get("blood-capillary")!.root,[[.8,-1.06,.15],[.82,.45,.15],[1.08,.65,.15]],.032,blue);
      tube(part("lymph-capillary",[1.02,.07,.31]),[[1.03,-1.1,.12],[1.03,.44,.12]],.065,teal);break;
    }
    case "pancreas": {
      const acini=part("acini",[.69,.57,.35]);for(let n=0;n<7;n++){const x=-.8+n*.31;for(let k=0;k<5;k++){const a=k*Math.PI*2/5;ellipsoid(acini,[x+Math.cos(a)*.15,.4+Math.sin(a)*.18,-.02],[.16,.16,.14],gold);}}
      const duct=part("duct",[-.36,.17,.34]);tube(duct,[[-1.15,.12,.13],[-.5,.17,.14],[.3,.25,.14],[1.2,.4,.14]],.055,cream);for(let n=0;n<5;n++){const x=-.7+n*.35;tube(duct,[[x,.22,.14],[x+.12,.49,.12]],.025,cream);}
      tube(part("duodenum",[-1.43,-.14,.2]),[[-.92,1.13,-.02],[-1.52,.87,0],[-1.6,-.2,0],[-1.1,-.53,0]],.16,pink);
      const alpha=part("alpha-cells",[.36,-.89,.35]),beta=part("beta-cells",[.86,-.81,.36]);ellipsoid(decor,[.65,-.84,-.08],[.66,.5,.21],cream);
      for(let n=0;n<10;n++){const a=n*Math.PI*2/10;ellipsoid(alpha,[.65+Math.cos(a)*.44,-.84+Math.sin(a)*.31,.06],[.13,.13,.14],red);}
      for(const [x,y] of [[.48,-.76],[.79,-.69],[.82,-.99],[.51,-1.02],[.65,-.87]])ellipsoid(beta,[x!,y!,.09],[.14,.14,.16],blue);break;
    }
    case "ear": {
      const canalPart=part("ear-canal",[-.67,-.10,.47]);
      tube(canalPart,[[-1.42,-.14,.10],[-1.03,-.13,.11],[-.63,-.11,.12],[-.28,-.09,.13],[.05,-.07,.13],[.25,-.055,.13]],.19,red);
      tube(canalPart,[[-1.39,-.14,.16],[-1.03,-.13,.17],[-.63,-.11,.18],[-.28,-.09,.19],[.05,-.07,.19],[.25,-.055,.19]],.105,0x67383a);

      const drum=mesh(part("eardrum",[.31,-.055,.49]),new THREE.CylinderGeometry(.31,.30,.050,52),pink,[.31,-.055,.14]);drum.rotation.z=Math.PI/2;drum.rotation.y=-.10;
      const dm=drum.material as THREE.MeshStandardMaterial;dm.transparent=true;dm.opacity=.70;dm.depthWrite=false;dm.roughness=.34;
      for(let i=0;i<7;i++){const a=-1.05+i*.34;tube(parts.get("eardrum")!.root,[[.31,-.055,.17],[.31,-.055+Math.sin(a)*.25,.17+Math.cos(a)*.025]],.007,cream);}

      const bones=part("ossicles",[.59,.16,.53]);
      ellipsoid(bones,[.43,.18,.16],[.105,.13,.095],cream);tube(bones,[[.43,.12,.16],[.39,.04,.15],[.35,-.025,.14]],.031,cream);
      ellipsoid(bones,[.61,.19,.16],[.11,.10,.09],cream);tube(bones,[[.55,.17,.16],[.64,.12,.16],[.70,.05,.15]],.028,cream);
      const stapes=mesh(bones,new THREE.TorusGeometry(.074,.018,12,36),gold,[.79,.045,.155],[.72,1,.62]);stapes.rotation.y=-.22;tube(bones,[[.70,.05,.15],[.74,.05,.155]],.018,gold);

      const vestibule=part("vestibule",[.90,.12,.50]);
      ellipsoid(vestibule,[.90,.12,.13],[.21,.24,.18],teal);ellipsoid(vestibule,[.84,.19,.25],[.095,.11,.085],0x9ec9bd);ellipsoid(vestibule,[.95,.04,.24],[.085,.10,.08],0x9ec9bd);
      const oval=ring(vestibule,[.79,.045,.145],.080,.020,cream);oval.scale.y=.72;

      const canals=part("semicircular-canals",[1.01,.70,.52]);
      const loopA:Point3[]=[[.82,.35,.14],[.73,.65,.15],[.78,.91,.13],[.99,1.01,.12],[1.13,.82,.11],[1.10,.52,.12],[.96,.34,.13],[.82,.35,.14]];
      const loopB:Point3[]=[[.88,.37,.14],[1.08,.52,.22],[1.31,.67,.18],[1.46,.55,.12],[1.37,.34,.07],[1.13,.27,.06],[.88,.37,.14]];
      const loopC:Point3[]=[[.82,.34,.13],[.69,.57,.01],[.67,.82,-.03],[.83,.93,.01],[1.01,.79,.09],[1.04,.53,.14],[.82,.34,.13]];
      tube(canals,loopA,.050,teal);tube(canals,loopB,.047,teal);tube(canals,loopC,.044,teal);

      const cochlea=part("cochlea",[1.20,-.18,.51]),spiral:Point3[]=[],inner:Point3[]=[];
      for(let n=0;n<=150;n++){const t=n/150,a=t*Math.PI*5.75,r=.47*(1-.79*t);spiral.push([1.20+Math.cos(a)*r,-.18+Math.sin(a)*r,.14]);const ri=.29*(1-.78*t);inner.push([1.20+Math.cos(a)*ri,-.18+Math.sin(a)*ri,.20]);}
      tube(cochlea,spiral,.081,pink);tube(cochlea,inner,.020,cream);ellipsoid(cochlea,[1.20,-.18,.14],[.13,.13,.11],pink);

      const nerve=part("auditory-nerve",[1.68,.01,.47]);
      for(let i=0;i<6;i++){const o=(i-2.5)*.031;tube(nerve,[[1.42,-.06+o,.14],[1.61,-.02+o*.8,.12],[1.82,.02+o*.55,.08],[2.01,.01+o*.35,.03]],.021,gold);}

      const eustachian=part("eustachian-tube",[.81,-.76,.46]);
      tube(eustachian,[[.55,-.20,.12],[.66,-.43,.09],[.80,-.70,.04],[1.02,-1.10,-.04]],.115,red);
      tube(eustachian,[[.56,-.21,.16],[.67,-.44,.13],[.81,-.71,.08],[1.02,-1.10,.01]],.055,cream);
      break;
    }
    case "skin": {
      mesh(part("epidermis",[-.7,1.08,.54]),new THREE.BoxGeometry(2.9,.28,.85),0xc89985,[0,1.03,0]);
      mesh(part("dermis",[.9,.31,.53]),new THREE.BoxGeometry(2.9,1.32,.85),cream,[0,.23,0]);
      mesh(part("subcutaneous",[-.65,-.94,.53]),new THREE.BoxGeometry(2.9,.68,.85),gold,[0,-.77,0]);
      for(let n=0;n<7;n++)ellipsoid(parts.get("subcutaneous")!.root,[-1.25+n*.41,-.77,.42],[.21,.28,.16],0xf2dea8);
      const hair=part("hair",[-.45,.20,.72]);tube(hair,[[-.8,1.65,.52],[-.65,.8,.54],[-.42,-.35,.56]],.055,0x785d56);ellipsoid(hair,[-.43,-.26,.54],[.13,.29,.10],0xb18078);
      const sweat=part("sweat-gland",[.49,-.20,.80]);const coil:Point3[]=[];for(let n=0;n<=80;n++){const a=n/80*Math.PI*9;coil.push([.45+Math.cos(a)*.20,-.25+Math.sin(a)*.16,.57+n/80*.19]);}tube(sweat,coil,.031,teal);tube(sweat,[[.46,-.10,.63],[.48,.9,.52],[.41,1.2,.48]],.032,teal);
      const receptor=part("receptor",[1.04,-.26,.90]);for(let n=0;n<4;n++){const r=.21-n*.042;ellipsoid(receptor,[1.05,-.26,.56+n*.075],[r,r*1.35,.07],n%2?cream:gold);}tube(receptor,[[1.05,-.55,.60],[1,-.94,.56],[.31,-1.1,.55]],.023,gold);break;
    }
  }
  root.updateMatrixWorld(true);
  return {root,parts,select(selected){for(const p of parts.values())p.root.traverse(o=>{if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof THREE.MeshStandardMaterial){m.emissive.setHex(p.id===selected?0x175e59:0);m.emissiveIntensity=p.id===selected?.48:0;}});}};
}
