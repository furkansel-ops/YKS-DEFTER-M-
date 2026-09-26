import fs from "node:fs";
import path from "node:path";

const OUT=path.resolve(process.cwd(),"public/mascots/notebook/notebook.glb");
const FLOAT=5126,USHORT=5123,ARRAY_BUFFER=34962,ELEMENT_ARRAY_BUFFER=34963;

class BufferBuilder{
  constructor(){this.parts=[];this.length=0;this.views=[];this.accessors=[];}
  pad(){const n=(4-this.length%4)%4;if(n){this.parts.push(Buffer.alloc(n));this.length+=n;}}
  addTyped(array,target){
    this.pad();
    const buf=Buffer.from(array.buffer,array.byteOffset,array.byteLength);
    const view=this.views.length;
    this.views.push({buffer:0,byteOffset:this.length,byteLength:buf.byteLength,...(target?{target}:{})});
    this.parts.push(buf);this.length+=buf.byteLength;
    return view;
  }
  accessor(array,type,componentType,target,min,max){
    const view=this.addTyped(array,target);
    const componentCount={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[type];
    const accessor={bufferView:view,componentType,count:array.length/componentCount,type};
    if(min)accessor.min=min;if(max)accessor.max=max;
    this.accessors.push(accessor);return this.accessors.length-1;
  }
  finish(){this.pad();return Buffer.concat(this.parts,this.length);}
}

function cube(){
  const p=[
    -1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1, 1,
     1,-1,-1,-1,-1,-1,-1, 1,-1, 1, 1,-1,
    -1, 1, 1, 1, 1, 1, 1, 1,-1,-1, 1,-1,
    -1,-1,-1, 1,-1,-1, 1,-1, 1,-1,-1, 1,
     1,-1, 1, 1,-1,-1, 1, 1,-1, 1, 1, 1,
    -1,-1,-1,-1,-1, 1,-1, 1, 1,-1, 1,-1
  ];
  const n=[
    0,0,1,0,0,1,0,0,1,0,0,1, 0,0,-1,0,0,-1,0,0,-1,0,0,-1,
    0,1,0,0,1,0,0,1,0,0,1,0, 0,-1,0,0,-1,0,0,-1,0,0,-1,0,
    1,0,0,1,0,0,1,0,0,1,0,0, -1,0,0,-1,0,0,-1,0,0,-1,0,0
  ];
  const i=[];for(let f=0;f<6;f++){const o=f*4;i.push(o,o+1,o+2,o,o+2,o+3);}
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
}
function sphere(lat=12,lon=16){
  const p=[],n=[],i=[];
  for(let y=0;y<=lat;y++){
    const v=y/lat,phi=v*Math.PI;
    for(let x=0;x<=lon;x++){
      const u=x/lon,theta=u*Math.PI*2;
      const sx=Math.sin(phi)*Math.cos(theta),sy=Math.cos(phi),sz=Math.sin(phi)*Math.sin(theta);
      p.push(sx,sy,sz);n.push(sx,sy,sz);
    }
  }
  for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){
    const a=y*(lon+1)+x,b=a+lon+1;
    i.push(a,b,a+1,b,b+1,a+1);
  }
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
}
function torus(major=.72,minor=.22,majorSeg=18,minorSeg=8){
  const p=[],n=[],i=[];
  for(let a=0;a<=majorSeg;a++){
    const u=a/majorSeg*Math.PI*2,cu=Math.cos(u),su=Math.sin(u);
    for(let b=0;b<=minorSeg;b++){
      const v=b/minorSeg*Math.PI*2,cv=Math.cos(v),sv=Math.sin(v);
      const r=major+minor*cv;
      p.push(r*cu,r*su,minor*sv);
      n.push(cv*cu,cv*su,sv);
    }
  }
  const row=minorSeg+1;
  for(let a=0;a<majorSeg;a++)for(let b=0;b<minorSeg;b++){
    const q=a*row+b,r=q+row;i.push(q,r,q+1,r,r+1,q+1);
  }
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
}
function bounds3(a){
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let k=0;k<a.length;k+=3)for(let j=0;j<3;j++){min[j]=Math.min(min[j],a[k+j]);max[j]=Math.max(max[j],a[k+j]);}
  return {min,max};
}
function quatZ(rad){return [0,0,Math.sin(rad/2),Math.cos(rad/2)];}

const bb=new BufferBuilder(),meshes=[];
function addMesh(name,g){
  const b=bounds3(g.p);
  const pa=bb.accessor(g.p,"VEC3",FLOAT,ARRAY_BUFFER,b.min,b.max);
  const na=bb.accessor(g.n,"VEC3",FLOAT,ARRAY_BUFFER);
  const ia=bb.accessor(g.i,"SCALAR",USHORT,ELEMENT_ARRAY_BUFFER,[0],[Math.max(...g.i)]);
  meshes.push({name,primitives:[{attributes:{POSITION:pa,NORMAL:na},indices:ia}]});
  return meshes.length-1;
}
const cubeMesh=addMesh("Cube",cube()),sphereMesh=addMesh("Sphere",sphere()),torusMesh=addMesh("Ring",torus());

const materials=[
  ["Cover blue",[0.055,0.36,0.92,1]],
  ["Cover dark",[0.02,0.19,0.55,1]],
  ["Paper",[0.96,0.97,1,1]],
  ["Metal",[0.72,0.79,0.9,1]],
  ["Eye white",[1,1,1,1]],
  ["Ink",[0.02,0.045,0.09,1]],
  ["Cheek",[1,0.43,0.48,1]],
  ["Shoe",[0.04,0.12,0.28,1]]
].map(([name,color])=>({name,pbrMetallicRoughness:{baseColorFactor:color,metallicFactor:name==="Metal"?.35:0,roughnessFactor:name==="Metal"?.34:.72}}));

const nodes=[];
const N=(name,opts={})=>{nodes.push({name,...opts});return nodes.length-1;};
const root=N("MascotRoot",{children:[]});
const body=N("Body",{children:[]});nodes[root].children.push(body);
function part(name,mesh,material,translation,scale,rotation){
  const idx=N(name,{mesh,translation,scale,...(rotation?{rotation}:{})});
  nodes[idx].extras={material};
  nodes[body].children.push(idx);return idx;
}
const cover=part("Cover",cubeMesh,0,[0,0,0],[1.32,1.62,.18]);
part("Pages",cubeMesh,2,[.06,-.01,-.21],[1.18,1.48,.13]);
part("Spine",cubeMesh,1,[-1.22,0,.11],[.11,1.55,.14]);
for(let r=0;r<6;r++)part("Ring"+(r+1),torusMesh,3,[-1.33,1.22-r*.49,.20],[.18,.18,.18],[0,0,0,1]);

part("EyeL",sphereMesh,4,[-.48,.38,.27],[.22,.25,.08]);
part("EyeR",sphereMesh,4,[.48,.38,.27],[.22,.25,.08]);
part("PupilL",sphereMesh,5,[-.48,.36,.35],[.085,.10,.045]);
part("PupilR",sphereMesh,5,[.48,.36,.35],[.085,.10,.045]);
part("CheekL",sphereMesh,6,[-.77,-.02,.31],[.16,.11,.045]);
part("CheekR",sphereMesh,6,[.77,-.02,.31],[.16,.11,.045]);
part("Smile",torusMesh,5,[0,-.28,.31],[.28,.15,.035],[0,0,0,1]);

const leftArm=N("ArmL_Pivot",{translation:[-1.25,.04,.02],children:[]});
const rightArm=N("ArmR_Pivot",{translation:[1.25,.04,.02],children:[]});
nodes[body].children.push(leftArm,rightArm);
const armL=N("ArmL",{mesh:cubeMesh,translation:[-.38,-.05,0],scale:[.39,.09,.09],extras:{material:0}});
const armR=N("ArmR",{mesh:cubeMesh,translation:[.38,-.05,0],scale:[.39,.09,.09],extras:{material:0}});
const handL=N("HandL",{mesh:sphereMesh,translation:[-.78,-.05,0],scale:[.13,.13,.13],extras:{material:0}});
const handR=N("HandR",{mesh:sphereMesh,translation:[.78,-.05,0],scale:[.13,.13,.13],extras:{material:0}});
nodes[leftArm].children.push(armL,handL);nodes[rightArm].children.push(armR,handR);

const leftLeg=N("LegL_Pivot",{translation:[-.56,-1.48,-.02],children:[]});
const rightLeg=N("LegR_Pivot",{translation:[.56,-1.48,-.02],children:[]});
nodes[body].children.push(leftLeg,rightLeg);
const legL=N("LegL",{mesh:cubeMesh,translation:[0,-.28,0],scale:[.10,.32,.10],extras:{material:1}});
const legR=N("LegR",{mesh:cubeMesh,translation:[0,-.28,0],scale:[.10,.32,.10],extras:{material:1}});
const footL=N("FootL",{mesh:sphereMesh,translation:[0,-.64,.08],scale:[.25,.15,.38],extras:{material:7}});
const footR=N("FootR",{mesh:sphereMesh,translation:[0,-.64,.08],scale:[.25,.15,.38],extras:{material:7}});
nodes[leftLeg].children.push(legL,footL);nodes[rightLeg].children.push(legR,footR);

const animationData=[];
function addAnim(name,duration,tracks){
  const samplers=[],channels=[];
  for(const track of tracks){
    const input=bb.accessor(new Float32Array(track.times),"SCALAR",FLOAT,undefined,[0],[duration]);
    const flat=track.values.flat();
    const output=bb.accessor(new Float32Array(flat),track.path==="rotation"?"VEC4":"VEC3",FLOAT);
    samplers.push({input,output,interpolation:"LINEAR"});
    channels.push({sampler:samplers.length-1,target:{node:track.node,path:track.path}});
  }
  animationData.push({name,samplers,channels});
}
addAnim("idle",2.4,[
  {node:root,path:"translation",times:[0,1.2,2.4],values:[[0,0,0],[0,.07,0],[0,0,0]]},
  {node:leftArm,path:"rotation",times:[0,1.2,2.4],values:[quatZ(-.08),quatZ(.03),quatZ(-.08)]},
  {node:rightArm,path:"rotation",times:[0,1.2,2.4],values:[quatZ(.08),quatZ(-.03),quatZ(.08)]}
]);
addAnim("tap",.52,[
  {node:root,path:"scale",times:[0,.18,.34,.52],values:[[1,1,1],[1.08,.94,1.08],[.97,1.04,.97],[1,1,1]]},
  {node:root,path:"translation",times:[0,.24,.52],values:[[0,0,0],[0,.22,0],[0,0,0]]}
]);
addAnim("celebrate",.92,[
  {node:root,path:"translation",times:[0,.28,.58,.92],values:[[0,0,0],[0,.48,0],[0,.18,0],[0,0,0]]},
  {node:leftArm,path:"rotation",times:[0,.25,.62,.92],values:[quatZ(-.08),quatZ(-2.15),quatZ(-1.65),quatZ(-.08)]},
  {node:rightArm,path:"rotation",times:[0,.25,.62,.92],values:[quatZ(.08),quatZ(2.15),quatZ(1.65),quatZ(.08)]}
]);
addAnim("sad",1.4,[
  {node:root,path:"translation",times:[0,.7,1.4],values:[[0,0,0],[0,-.12,0],[0,0,0]]},
  {node:leftArm,path:"rotation",times:[0,.7,1.4],values:[quatZ(-.08),quatZ(.72),quatZ(-.08)]},
  {node:rightArm,path:"rotation",times:[0,.7,1.4],values:[quatZ(.08),quatZ(-.72),quatZ(.08)]}
]);
addAnim("wave",1.05,[
  {node:rightArm,path:"rotation",times:[0,.18,.38,.58,.78,1.05],values:[quatZ(.08),quatZ(1.55),quatZ(.92),quatZ(1.55),quatZ(.92),quatZ(.08)]}
]);

const binary=bb.finish();
for(const node of nodes){
  if(node.mesh===undefined)continue;
  const material=node.extras?.material??0;
  delete node.extras;
  const original=meshes[node.mesh];
  const clone=JSON.parse(JSON.stringify(original));
  clone.name=node.name+"Mesh";clone.primitives[0].material=material;
  meshes.push(clone);node.mesh=meshes.length-1;
}
const gltf={
  asset:{version:"2.0",generator:"YKS Defterim GLB builder",extras:{mascot:"notebook",animations:["idle","tap","celebrate","sad","wave"],version:"1.0.0"}},
  scene:0,scenes:[{name:"Notebook Mascot",nodes:[root]}],nodes,meshes,materials,
  buffers:[{byteLength:binary.length}],bufferViews:bb.views,accessors:bb.accessors,animations:animationData
};
const json=Buffer.from(JSON.stringify(gltf));
const jsonPad=(4-json.length%4)%4,binPad=(4-binary.length%4)%4;
const jsonChunk=Buffer.concat([json,Buffer.alloc(jsonPad,0x20)]);
const binChunk=Buffer.concat([binary,Buffer.alloc(binPad)]);
const total=12+8+jsonChunk.length+8+binChunk.length;
const out=Buffer.alloc(total);let o=0;
out.write("glTF",o);o+=4;out.writeUInt32LE(2,o);o+=4;out.writeUInt32LE(total,o);o+=4;
out.writeUInt32LE(jsonChunk.length,o);o+=4;out.writeUInt32LE(0x4E4F534A,o);o+=4;jsonChunk.copy(out,o);o+=jsonChunk.length;
out.writeUInt32LE(binChunk.length,o);o+=4;out.writeUInt32LE(0x004E4942,o);o+=4;binChunk.copy(out,o);
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,out);
console.log(`notebook mascot GLB: ${path.relative(process.cwd(),OUT)} (${out.length} bytes)`);
