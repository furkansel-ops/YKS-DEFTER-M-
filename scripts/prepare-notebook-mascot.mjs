import fs from "node:fs";
import path from "node:path";

const OUT=path.resolve(process.cwd(),"public/mascots/notebook/notebook-exact-v3.glb");
const REFERENCE_IMAGE=path.resolve(process.cwd(),"public/mascots/notebook.webp");
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
  addRaw(buffer){
    this.pad();
    const view=this.views.length;
    this.views.push({buffer:0,byteOffset:this.length,byteLength:buffer.byteLength});
    this.parts.push(buffer);this.length+=buffer.byteLength;
    return view;
  }
  accessor(array,type,componentType,target,min,max){
    const view=this.addTyped(array,target);
    const components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[type];
    const accessor={bufferView:view,componentType,count:array.length/components,type};
    if(min)accessor.min=min;if(max)accessor.max=max;
    this.accessors.push(accessor);return this.accessors.length-1;
  }
  finish(){this.pad();return Buffer.concat(this.parts,this.length);}
}

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function roundedBox(width,height,depth,radius=.18,segments=8){
  const p=[],n=[],idx=[],hx=width/2,hy=height/2,hz=depth/2;
  const inner=[Math.max(0,hx-radius),Math.max(0,hy-radius),Math.max(0,hz-radius)];
  const faces=[
    {axis:0,sign:1,u:1,v:2,ha:hy,hb:hz},{axis:0,sign:-1,u:1,v:2,ha:hy,hb:hz},
    {axis:1,sign:1,u:0,v:2,ha:hx,hb:hz},{axis:1,sign:-1,u:0,v:2,ha:hx,hb:hz},
    {axis:2,sign:1,u:0,v:1,ha:hx,hb:hy},{axis:2,sign:-1,u:0,v:1,ha:hx,hb:hy}
  ];
  for(const face of faces){
    const start=p.length/3;
    for(let iy=0;iy<=segments;iy++)for(let ix=0;ix<=segments;ix++){
      const c=[0,0,0];
      c[face.axis]=face.sign*[hx,hy,hz][face.axis];
      c[face.u]=-face.ha+2*face.ha*ix/segments;
      c[face.v]=-face.hb+2*face.hb*iy/segments;
      const q=[clamp(c[0],-inner[0],inner[0]),clamp(c[1],-inner[1],inner[1]),clamp(c[2],-inner[2],inner[2])];
      let dx=c[0]-q[0],dy=c[1]-q[1],dz=c[2]-q[2],len=Math.hypot(dx,dy,dz);
      if(len<1e-6){dx=face.axis===0?face.sign:0;dy=face.axis===1?face.sign:0;dz=face.axis===2?face.sign:0;len=1;}
      dx/=len;dy/=len;dz/=len;
      p.push(q[0]+dx*radius,q[1]+dy*radius,q[2]+dz*radius);n.push(dx,dy,dz);
    }
    const row=segments+1;
    for(let iy=0;iy<segments;iy++)for(let ix=0;ix<segments;ix++){
      const a=start+iy*row+ix,b=a+1,c=a+row,d=c+1;
      if(face.sign>0)idx.push(a,b,d,a,d,c);else idx.push(a,d,b,a,c,d);
    }
  }
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(idx)};
}
function sphere(lat=12,lon=16){
  const p=[],n=[],i=[];
  for(let y=0;y<=lat;y++){const phi=y/lat*Math.PI;for(let x=0;x<=lon;x++){
    const theta=x/lon*Math.PI*2,sx=Math.sin(phi)*Math.cos(theta),sy=Math.cos(phi),sz=Math.sin(phi)*Math.sin(theta);
    p.push(sx,sy,sz);n.push(sx,sy,sz);
  }}
  for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){const a=y*(lon+1)+x,b=a+lon+1;i.push(a,b,a+1,b,b+1,a+1);}
  return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
}
function bounds3(a){
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let k=0;k<a.length;k+=3)for(let j=0;j<3;j++){min[j]=Math.min(min[j],a[k+j]);max[j]=Math.max(max[j],a[k+j]);}
  return {min,max};
}
const quatZ=rad=>[0,0,Math.sin(rad/2),Math.cos(rad/2)];

const bb=new BufferBuilder(),meshes=[],nodes=[];
function geometryMesh(name,g,material){
  const b=bounds3(g.p);
  const pa=bb.accessor(g.p,"VEC3",FLOAT,ARRAY_BUFFER,b.min,b.max);
  const na=bb.accessor(g.n,"VEC3",FLOAT,ARRAY_BUFFER);
  const ia=bb.accessor(g.i,"SCALAR",USHORT,ELEMENT_ARRAY_BUFFER,[0],[Math.max(...g.i)]);
  meshes.push({name,primitives:[{attributes:{POSITION:pa,NORMAL:na},indices:ia,material}]});
  return meshes.length-1;
}
function texturedQuad(){
  const p=new Float32Array([-2,-2,.35, 2,-2,.35, 2,2,.35, -2,2,.35]);
  const n=new Float32Array([0,0,1,0,0,1,0,0,1,0,0,1]);
  const uv=new Float32Array([0,1,1,1,1,0,0,0]);
  const i=new Uint16Array([0,1,2,0,2,3]);
  const pa=bb.accessor(p,"VEC3",FLOAT,ARRAY_BUFFER,[-2,-2,.35],[2,2,.35]);
  const na=bb.accessor(n,"VEC3",FLOAT,ARRAY_BUFFER);
  const ua=bb.accessor(uv,"VEC2",FLOAT,ARRAY_BUFFER,[0,0],[1,1]);
  const ia=bb.accessor(i,"SCALAR",USHORT,ELEMENT_ARRAY_BUFFER,[0],[3]);
  meshes.push({name:"ExactReferenceFront",primitives:[{attributes:{POSITION:pa,NORMAL:na,TEXCOORD_0:ua},indices:ia,material:2}]});
  return meshes.length-1;
}
const N=(name,opts={})=>{nodes.push({name,...opts});return nodes.length-1;};
const root=N("MascotRoot",{children:[]});
const body=N("Volume",{children:[]});nodes[root].children.push(body);
function add(name,mesh,translation,scale=[1,1,1],rotation){
  const idx=N(name,{mesh,translation,scale,...(rotation?{rotation}:{})});nodes[body].children.push(idx);return idx;
}

// The exact submitted character is the front surface. The geometry below only
// provides genuine depth behind that image so perspective reveals a 3D body.
const cover=geometryMesh("CoverVolume",roundedBox(2.28,2.82,.58,.25,8),0);
const pages=geometryMesh("PageVolume",roundedBox(2.10,2.62,.44,.19,7),1);
const limb=geometryMesh("LimbVolume",roundedBox(.42,1.10,.34,.20,7),0);
const shoe=geometryMesh("ShoeVolume",roundedBox(.62,.34,.62,.17,7),3);
const hand=geometryMesh("HandVolume",sphere(),0);
add("BackCover",cover,[.28,.04,-.03],[1,1,1]);
add("PageBlock",pages,[.37,.03,.18],[1,1,1]);
add("LeftArmDepth",limb,[-1.18,.18,.06],[1,1,1],quatZ(-.68));
add("RightArmDepth",limb,[1.25,-.25,.03],[1,1,1],quatZ(.72));
add("LeftHandDepth",hand,[-1.52,.66,.10],[.36,.38,.25]);
add("RightHandDepth",hand,[1.55,-.72,.07],[.34,.36,.24]);
add("LeftShoeDepth",shoe,[-.47,-1.61,.00],[1,1,1]);
add("RightShoeDepth",shoe,[.62,-1.61,.00],[1,1,1]);
const front=N("ExactReferenceFront",{mesh:texturedQuad()});nodes[root].children.push(front);

const animations=[];
function addAnim(name,duration,tracks){
  const samplers=[],channels=[];
  for(const track of tracks){
    const input=bb.accessor(new Float32Array(track.times),"SCALAR",FLOAT,undefined,[0],[duration]);
    const output=bb.accessor(new Float32Array(track.values.flat()),track.path==="rotation"?"VEC4":"VEC3",FLOAT);
    samplers.push({input,output,interpolation:"LINEAR"});channels.push({sampler:samplers.length-1,target:{node:track.node,path:track.path}});
  }
  animations.push({name,samplers,channels});
}
addAnim("idle",2.5,[{node:root,path:"translation",times:[0,1.25,2.5],values:[[0,0,0],[0,.055,0],[0,0,0]]}]);
addAnim("tap",.55,[
  {node:root,path:"scale",times:[0,.18,.35,.55],values:[[1,1,1],[1.045,.96,1.045],[.985,1.025,.985],[1,1,1]]},
  {node:root,path:"translation",times:[0,.25,.55],values:[[0,0,0],[0,.17,0],[0,0,0]]}
]);
addAnim("celebrate",.95,[
  {node:root,path:"translation",times:[0,.28,.58,.95],values:[[0,0,0],[0,.42,0],[0,.14,0],[0,0,0]]},
  {node:root,path:"rotation",times:[0,.30,.62,.95],values:[quatZ(0),quatZ(-.07),quatZ(.07),quatZ(0)]}
]);
addAnim("sad",1.35,[
  {node:root,path:"translation",times:[0,.68,1.35],values:[[0,0,0],[0,-.10,0],[0,0,0]]},
  {node:root,path:"rotation",times:[0,.68,1.35],values:[quatZ(0),quatZ(-.045),quatZ(0)]}
]);
addAnim("wave",1.05,[
  {node:root,path:"rotation",times:[0,.20,.42,.64,.84,1.05],values:[quatZ(0),quatZ(-.045),quatZ(.035),quatZ(-.035),quatZ(.025),quatZ(0)]}
]);

const referenceBytes=fs.readFileSync(REFERENCE_IMAGE);
if(referenceBytes.byteLength>1_500_000)throw new Error(`Defter referans görseli fazla büyük: ${referenceBytes.byteLength} bayt`);
const referenceView=bb.addRaw(referenceBytes);
const binary=bb.finish();
const materials=[
  {name:"Blue depth",pbrMetallicRoughness:{baseColorFactor:[.035,.29,.92,1],metallicFactor:0,roughnessFactor:.33}},
  {name:"Cream pages",pbrMetallicRoughness:{baseColorFactor:[1,.92,.78,1],metallicFactor:0,roughnessFactor:.70}},
  {name:"Exact submitted mascot",pbrMetallicRoughness:{baseColorTexture:{index:0},metallicFactor:0,roughnessFactor:1},alphaMode:"BLEND",doubleSided:true,extensions:{KHR_materials_unlit:{}}},
  {name:"Dark shoes depth",pbrMetallicRoughness:{baseColorFactor:[.02,.08,.25,1],metallicFactor:0,roughnessFactor:.40}}
];
const gltf={
  asset:{version:"2.0",generator:"YKS Defterim exact-reference GLB builder",extras:{mascot:"notebook",referenceAsset:"public/mascots/notebook.webp",mode:"embedded-exact-front-plus-3d-depth",version:"3.0.1"}},
  extensionsUsed:["KHR_materials_unlit"],
  scene:0,scenes:[{name:"Notebook Mascot Exact Reference",nodes:[root]}],nodes,meshes,materials,
  images:[{bufferView:referenceView,mimeType:"image/webp"}],textures:[{source:0}],
  buffers:[{byteLength:binary.length}],bufferViews:bb.views,accessors:bb.accessors,animations
};
const json=Buffer.from(JSON.stringify(gltf)),jsonPad=(4-json.length%4)%4,binPad=(4-binary.length%4)%4;
const jsonChunk=Buffer.concat([json,Buffer.alloc(jsonPad,0x20)]),binChunk=Buffer.concat([binary,Buffer.alloc(binPad)]);
const total=12+8+jsonChunk.length+8+binChunk.length,out=Buffer.alloc(total);let o=0;
out.write("glTF",o);o+=4;out.writeUInt32LE(2,o);o+=4;out.writeUInt32LE(total,o);o+=4;
out.writeUInt32LE(jsonChunk.length,o);o+=4;out.writeUInt32LE(0x4E4F534A,o);o+=4;jsonChunk.copy(out,o);o+=jsonChunk.length;
out.writeUInt32LE(binChunk.length,o);o+=4;out.writeUInt32LE(0x004E4942,o);o+=4;binChunk.copy(out,o);
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,out);
console.log(`exact-reference notebook GLB v3: ${path.relative(process.cwd(),OUT)} (${out.length} bytes)`);
