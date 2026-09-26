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
    const size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[type];
    const accessor={bufferView:view,componentType,count:array.length/size,type};
    if(min)accessor.min=min;if(max)accessor.max=max;
    this.accessors.push(accessor);return this.accessors.length-1;
  }
  finish(){this.pad();return Buffer.concat(this.parts,this.length);}
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function roundedBox(width,height,depth,radius=.18,segments=7){
  const p=[],n=[],idx=[];
  const hx=width/2,hy=height/2,hz=depth/2;
  const inner=[Math.max(0,hx-radius),Math.max(0,hy-radius),Math.max(0,hz-radius)];
  const faces=[
    {axis:0,sign:1,u:1,v:2,ha:hy,hb:hz},
    {axis:0,sign:-1,u:1,v:2,ha:hy,hb:hz},
    {axis:1,sign:1,u:0,v:2,ha:hx,hb:hz},
    {axis:1,sign:-1,u:0,v:2,ha:hx,hb:hz},
    {axis:2,sign:1,u:0,v:1,ha:hx,hb:hy},
    {axis:2,sign:-1,u:0,v:1,ha:hx,hb:hy}
  ];
  for(const face of faces){
    const start=p.length/3;
    for(let iy=0;iy<=segments;iy++)for(let ix=0;ix<=segments;ix++){
      const c=[0,0,0];
      c[face.axis]=face.sign*[hx,hy,hz][face.axis];
      c[face.u]=-face.ha+2*face.ha*ix/segments;
      c[face.v]=-face.hb+2*face.hb*iy/segments;
      const q=[
        clamp(c[0],-inner[0],inner[0]),
        clamp(c[1],-inner[1],inner[1]),
        clamp(c[2],-inner[2],inner[2])
      ];
      let dx=c[0]-q[0],dy=c[1]-q[1],dz=c[2]-q[2];
      let len=Math.hypot(dx,dy,dz);
      if(len<1e-6){dx=face.axis===0?face.sign:0;dy=face.axis===1?face.sign:0;dz=face.axis===2?face.sign:0;len=1;}
      dx/=len;dy/=len;dz/=len;
      p.push(q[0]+dx*radius,q[1]+dy*radius,q[2]+dz*radius);
      n.push(dx,dy,dz);
    }
    const row=segments+1;
    for(let iy=0;iy<segments;iy++)for(let ix=0;ix<segments;ix++){
      const a=start+iy*row+ix,b=a+1,c=a+row,d=c+1;
      if(face.sign>0)idx.push(a,b,d,a,d,c);else idx.push(a,d,b,a,c,d);
    }
  }
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(idx)};
}
function sphere(lat=14,lon=18){
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
    const a=y*(lon+1)+x,b=a+lon+1;i.push(a,b,a+1,b,b+1,a+1);
  }
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
}
function cylinder(rad=.5,height=1,segments=18){
  const p=[],n=[],i=[];
  for(let y=0;y<=1;y++)for(let s=0;s<=segments;s++){
    const a=s/segments*Math.PI*2,c=Math.cos(a),z=Math.sin(a);
    p.push(rad*c,(y-.5)*height,rad*z);n.push(c,0,z);
  }
  const row=segments+1;
  for(let y=0;y<1;y++)for(let s=0;s<segments;s++){const a=y*row+s,b=a+1,c=a+row,d=c+1;i.push(a,c,b,b,c,d);}
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
}
function torus(major=.72,minor=.22,majorSeg=22,minorSeg=10){
  const p=[],n=[],i=[];
  for(let a=0;a<=majorSeg;a++){
    const u=a/majorSeg*Math.PI*2,cu=Math.cos(u),su=Math.sin(u);
    for(let b=0;b<=minorSeg;b++){
      const v=b/minorSeg*Math.PI*2,cv=Math.cos(v),sv=Math.sin(v),r=major+minor*cv;
      p.push(r*cu,r*su,minor*sv);n.push(cv*cu,cv*su,sv);
    }
  }
  const row=minorSeg+1;
  for(let a=0;a<majorSeg;a++)for(let b=0;b<minorSeg;b++){const q=a*row+b,r=q+row;i.push(q,r,q+1,r,r+1,q+1);}
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
}
function arcSmile(segments=18){
  const p=[],n=[],i=[],outer=.56,inner=.38,depth=.10;
  const start=Math.PI*.12,end=Math.PI*.88;
  for(let z=0;z<2;z++){
    const zz=(z?.5:-.5)*depth;
    for(let s=0;s<=segments;s++){
      const a=start+(end-start)*s/segments;
      for(const r of [outer,inner]){p.push(Math.cos(a)*r,-Math.sin(a)*r,zz);n.push(0,0,z?1:-1);}
    }
  }
  const row=(segments+1)*2;
  for(let s=0;s<segments;s++){
    const a=s*2,b=a+1,c=a+2,d=a+3;
    i.push(a,c,b,b,c,d);
    const A=row+a,B=row+b,C=row+c,D=row+d;i.push(A,B,C,B,D,C);
  }
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
}
function bounds3(a){
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let k=0;k<a.length;k+=3)for(let j=0;j<3;j++){min[j]=Math.min(min[j],a[k+j]);max[j]=Math.max(max[j],a[k+j]);}
  return {min,max};
}
function quatAxis(axis,rad){
  const s=Math.sin(rad/2),c=Math.cos(rad/2);return [axis[0]*s,axis[1]*s,axis[2]*s,c];
}
const quatZ=rad=>quatAxis([0,0,1],rad);
const quatX=rad=>quatAxis([1,0,0],rad);
const quatY=rad=>quatAxis([0,1,0],rad);

const bb=new BufferBuilder(),baseMeshes=[];
function addMesh(name,g){
  const b=bounds3(g.p);
  const pa=bb.accessor(g.p,"VEC3",FLOAT,ARRAY_BUFFER,b.min,b.max);
  const na=bb.accessor(g.n,"VEC3",FLOAT,ARRAY_BUFFER);
  const ia=bb.accessor(g.i,"SCALAR",USHORT,ELEMENT_ARRAY_BUFFER,[0],[Math.max(...g.i)]);
  baseMeshes.push({name,primitives:[{attributes:{POSITION:pa,NORMAL:na},indices:ia}]});
  return baseMeshes.length-1;
}
const coverMesh=addMesh("RoundedCover",roundedBox(2.72,3.38,.42,.28,8));
const backMesh=addMesh("RoundedBack",roundedBox(2.78,3.42,.30,.28,8));
const pagesMesh=addMesh("RoundedPages",roundedBox(2.56,3.18,.54,.20,7));
const sphereMesh=addMesh("Sphere",sphere());
const cylinderMesh=addMesh("Cylinder",cylinder());
const ringMesh=addMesh("Ring",torus(.22,.07,22,10));
const smileMesh=addMesh("Smile",arcSmile());

const materials=[
  ["Cover blue",[0.035,0.31,0.96,1],.0,.26],
  ["Cover dark",[0.015,0.11,0.42,1],.0,.34],
  ["Paper",[1,.94,.82,1],.0,.72],
  ["Ring light blue",[.42,.68,1,1],.15,.28],
  ["Eye",[.015,.035,.12,1],.0,.30],
  ["Eye highlight",[1,1,1,1],.0,.18],
  ["Cheek",[1,.48,.43,1],.0,.48],
  ["Shoe",[.025,.10,.29,1],.0,.36]
].map(([name,color,metallic,roughness])=>({name,pbrMetallicRoughness:{baseColorFactor:color,metallicFactor:metallic,roughnessFactor:roughness}}));

const meshes=[],nodes=[];
const N=(name,opts={})=>{nodes.push({name,...opts});return nodes.length-1;};
function meshInstance(name,base,material){
  const clone=JSON.parse(JSON.stringify(baseMeshes[base]));clone.name=name+"Mesh";clone.primitives[0].material=material;meshes.push(clone);return meshes.length-1;
}
const root=N("MascotRoot",{children:[]});
const tilt=N("Character",{children:[],rotation:quatY(-.12)});nodes[root].children.push(tilt);
function add(name,base,material,translation,scale=[1,1,1],rotation){
  const idx=N(name,{mesh:meshInstance(name,base,material),translation,scale,...(rotation?{rotation}:{})});
  nodes[tilt].children.push(idx);return idx;
}

add("BackCover",backMesh,1,[.09,0,-.44],[1,1,1]);
add("PageBlock",pagesMesh,2,[.12,-.01,-.18],[1,1,1]);
add("FrontCover",coverMesh,0,[0,0,.18],[1,1,1]);

// Thick binding holes and physical rings matching the supplied reference.
for(let r=0;r<5;r++){
  const y=1.18-r*.60;
  add("RingSocket"+(r+1),sphereMesh,1,[-1.32,y,.43],[.13,.13,.07]);
  add("Ring"+(r+1),ringMesh,3,[-1.46,y,.45],[1.05,1.05,1.4],quatY(Math.PI/2));
}

// Face projects from the cover instead of being painted flat.
add("EyeL",sphereMesh,4,[-.43,.36,.48],[.19,.28,.07]);
add("EyeR",sphereMesh,4,[.55,.36,.48],[.19,.28,.07]);
add("EyeShineL",sphereMesh,5,[-.47,.47,.555],[.045,.07,.025]);
add("EyeShineR",sphereMesh,5,[.51,.47,.555],[.045,.07,.025]);
add("CheekL",sphereMesh,6,[-.72,-.04,.49],[.18,.11,.045]);
add("CheekR",sphereMesh,6,[.82,-.04,.49],[.18,.11,.045]);
add("Smile",smileMesh,4,[.06,-.14,.51],[.72,.52,1],quatZ(Math.PI));

// Limbs are volumetric and sit outside the book body.
const leftArm=N("ArmL_Pivot",{translation:[-1.28,.25,.10],children:[],rotation:quatZ(.18)});
const rightArm=N("ArmR_Pivot",{translation:[1.27,-.12,.06],children:[],rotation:quatZ(-.18)});
nodes[tilt].children.push(leftArm,rightArm);
function child(parent,name,base,material,translation,scale,rotation){
  const idx=N(name,{mesh:meshInstance(name,base,material),translation,scale,...(rotation?{rotation}:{})});nodes[parent].children.push(idx);return idx;
}
child(leftArm,"ArmL",cylinderMesh,0,[-.25,.24,.02],[.23,.82,.23],quatZ(-.72));
child(leftArm,"HandL",sphereMesh,0,[-.56,.56,.03],[.31,.31,.22]);
child(leftArm,"FingerL1",sphereMesh,0,[-.72,.68,.03],[.19,.26,.16],quatZ(-.28));
child(leftArm,"FingerL2",sphereMesh,0,[-.48,.76,.03],[.18,.28,.16],quatZ(.25));
child(rightArm,"ArmR",cylinderMesh,0,[.28,-.30,.01],[.22,.74,.22],quatZ(-.72));
child(rightArm,"HandR",sphereMesh,0,[.57,-.56,.02],[.30,.29,.22]);
child(rightArm,"FingerR1",sphereMesh,0,[.73,-.62,.02],[.18,.25,.16],quatZ(-.28));
child(rightArm,"FingerR2",sphereMesh,0,[.54,-.76,.02],[.18,.25,.16],quatZ(.24));

const leftLeg=N("LegL_Pivot",{translation:[-.50,-1.58,-.05],children:[]});
const rightLeg=N("LegR_Pivot",{translation:[.54,-1.58,-.05],children:[]});
nodes[tilt].children.push(leftLeg,rightLeg);
child(leftLeg,"LegL",cylinderMesh,0,[0,-.26,.02],[.15,.55,.15]);
child(rightLeg,"LegR",cylinderMesh,0,[0,-.26,.02],[.15,.55,.15]);
child(leftLeg,"FootL",sphereMesh,7,[.02,-.57,.16],[.34,.18,.48]);
child(rightLeg,"FootR",sphereMesh,7,[.02,-.57,.16],[.34,.18,.48]);

const animations=[];
function addAnim(name,duration,tracks){
  const samplers=[],channels=[];
  for(const track of tracks){
    const input=bb.accessor(new Float32Array(track.times),"SCALAR",FLOAT,undefined,[0],[duration]);
    const output=bb.accessor(new Float32Array(track.values.flat()),track.path==="rotation"?"VEC4":"VEC3",FLOAT);
    samplers.push({input,output,interpolation:"LINEAR"});
    channels.push({sampler:samplers.length-1,target:{node:track.node,path:track.path}});
  }
  animations.push({name,samplers,channels});
}
addAnim("idle",2.5,[
  {node:root,path:"translation",times:[0,1.25,2.5],values:[[0,0,0],[0,.065,0],[0,0,0]]},
  {node:leftArm,path:"rotation",times:[0,1.25,2.5],values:[quatZ(.18),quatZ(.24),quatZ(.18)]},
  {node:rightArm,path:"rotation",times:[0,1.25,2.5],values:[quatZ(-.18),quatZ(-.12),quatZ(-.18)]}
]);
addAnim("tap",.56,[
  {node:root,path:"scale",times:[0,.18,.36,.56],values:[[1,1,1],[1.055,.955,1.055],[.98,1.035,.98],[1,1,1]]},
  {node:root,path:"translation",times:[0,.26,.56],values:[[0,0,0],[0,.19,0],[0,0,0]]}
]);
addAnim("celebrate",1.0,[
  {node:root,path:"translation",times:[0,.30,.62,1],values:[[0,0,0],[0,.46,0],[0,.14,0],[0,0,0]]},
  {node:leftArm,path:"rotation",times:[0,.28,.66,1],values:[quatZ(.18),quatZ(-1.75),quatZ(-1.25),quatZ(.18)]},
  {node:rightArm,path:"rotation",times:[0,.28,.66,1],values:[quatZ(-.18),quatZ(1.75),quatZ(1.25),quatZ(-.18)]}
]);
addAnim("sad",1.45,[
  {node:root,path:"translation",times:[0,.72,1.45],values:[[0,0,0],[0,-.11,0],[0,0,0]]},
  {node:leftArm,path:"rotation",times:[0,.72,1.45],values:[quatZ(.18),quatZ(.80),quatZ(.18)]},
  {node:rightArm,path:"rotation",times:[0,.72,1.45],values:[quatZ(-.18),quatZ(-.80),quatZ(-.18)]}
]);
addAnim("wave",1.10,[
  {node:leftArm,path:"rotation",times:[0,.18,.38,.58,.78,1.10],values:[quatZ(.18),quatZ(-1.65),quatZ(-1.10),quatZ(-1.65),quatZ(-1.10),quatZ(.18)]}
]);

const binary=bb.finish();
const gltf={
  asset:{version:"2.0",generator:"YKS Defterim reference-matched GLB builder",extras:{mascot:"notebook",reference:"user-supplied blue notebook mascot",animations:["idle","tap","celebrate","sad","wave"],version:"2.0.0"}},
  scene:0,scenes:[{name:"Notebook Mascot",nodes:[root]}],nodes,meshes,materials,
  buffers:[{byteLength:binary.length}],bufferViews:bb.views,accessors:bb.accessors,animations
};
const json=Buffer.from(JSON.stringify(gltf)),jsonPad=(4-json.length%4)%4,binPad=(4-binary.length%4)%4;
const jsonChunk=Buffer.concat([json,Buffer.alloc(jsonPad,0x20)]),binChunk=Buffer.concat([binary,Buffer.alloc(binPad)]);
const total=12+8+jsonChunk.length+8+binChunk.length,out=Buffer.alloc(total);let o=0;
out.write("glTF",o);o+=4;out.writeUInt32LE(2,o);o+=4;out.writeUInt32LE(total,o);o+=4;
out.writeUInt32LE(jsonChunk.length,o);o+=4;out.writeUInt32LE(0x4E4F534A,o);o+=4;jsonChunk.copy(out,o);o+=jsonChunk.length;
out.writeUInt32LE(binChunk.length,o);o+=4;out.writeUInt32LE(0x004E4942,o);o+=4;binChunk.copy(out,o);
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,out);
console.log(`notebook mascot GLB v2: ${path.relative(process.cwd(),OUT)} (${out.length} bytes)`);
