const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {inflateSync}=require("node:zlib");
const root=path.resolve(__dirname,"..");

test("Android notification badge keeps transparent margins and readable cutouts after white masking",()=>{
  const png=fs.readFileSync(path.join(root,"public/notification-badge.png"));
  assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  const chunks=[];let width,height;
  for(let offset=8;offset<png.length;){
    const length=png.readUInt32BE(offset),type=png.toString("ascii",offset+4,offset+8),data=png.subarray(offset+8,offset+8+length);
    if(type==="IHDR"){
      width=data.readUInt32BE(0);height=data.readUInt32BE(4);
      assert.equal(width,96);assert.equal(height,96);assert.equal(data[8],8);assert.equal(data[9],6);assert.equal(data[12],0);
    }
    if(type==="IDAT")chunks.push(data);
    offset+=12+length;
  }
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,pixels=Buffer.alloc(width*height*4);
  assert.equal(raw.length,(stride+1)*height);
  function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
  for(let y=0;y<height;y++){
    const filter=raw[y*(stride+1)];assert.ok(filter<=4);
    for(let x=0;x<stride;x++){
      const i=y*stride+x,left=x>=4?pixels[i-4]:0,up=y?pixels[i-stride]:0,corner=y&&x>=4?pixels[i-stride-4]:0;
      const predictor=[0,left,up,Math.floor((left+up)/2),paeth(left,up,corner)][filter];
      pixels[i]=(raw[y*(stride+1)+1+x]+predictor)&255;
    }
  }
  const alpha=(x,y)=>pixels[(y*width+x)*4+3];let painted=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4,a=alpha(x,y);
    if(x<12||x>=84||y<10||y>=86)assert.equal(a,0,"padding must stay transparent");
    if(a){painted++;assert.deepEqual([...pixels.subarray(i,i+3)],[255,255,255]);}
  }
  assert.ok(painted>width*height*.2&&painted<width*height*.6,"badge must not become an opaque square");
  assert.equal(alpha(50,26),255);assert.equal(alpha(50,33),0,"notebook lines remain transparent");
  assert.equal(alpha(30,45),0,"notebook spine remains transparent");
});

test("badge ships in the production and offline asset requirements",()=>{
  for(const file of ["sw.js","scripts/verify-dist.mjs"]){
    assert.ok(fs.readFileSync(path.join(root,file),"utf8").includes('"notification-badge.png"')||fs.readFileSync(path.join(root,file),"utf8").includes('"./notification-badge.png"'),file);
  }
});
