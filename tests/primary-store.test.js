const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const dataUrl=file=>pathToFileURL(path.resolve(__dirname,"../src/data",file)).href;

class Mirror{
  constructor(read,meta={hash:"",updatedAt:0}){this.value=read;this.meta={...meta};}
  read(){return this.value;}
  readMirrorMetadata(){return {...this.meta};}
  writeMirrorMetadata(hash,updatedAt){this.meta={hash,updatedAt};return {ok:true};}
}

class Target{
  constructor(state){this.state=state;this.meta=undefined;this.commits=0;this.fail=false;}
  async readState(){if(this.fail)throw new Error("IndexedDB kapalı");return this.state;}
  async readMeta(){return this.meta;}
  async commit(state,meta){if(this.fail)throw new Error("IndexedDB kapalı");this.state=structuredClone(state);this.meta=structuredClone(meta);this.commits++;}
}

class Runtime{
  applied=[];
  applyJSON(json){this.applied.push(json);return {ok:true,json};}
}

async function setup(localJson,indexedJson,indexedAt=0,mirrorAt=0){
  const [{decodeState,stateHash},{PrimaryStateCoordinator}]=await Promise.all([import(dataUrl("codec.ts")),import(dataUrl("primary-store.ts"))]);
  const local=localJson===null?decodeState(null):decodeState(localJson),mirror=new Mirror(local,{hash:localJson?stateHash(localJson):"",updatedAt:mirrorAt}),target=new Target(indexedJson?{key:"primary",json:indexedJson,schema:21,chars:indexedJson.length,bytes:indexedJson.length,source:"localStorage",sourceHash:stateHash(indexedJson),updatedAt:indexedAt}:undefined),runtime=new Runtime(),coordinator=new PrimaryStateCoordinator(mirror,target,runtime,()=>1000);
  return {coordinator,mirror,target,runtime,stateHash};
}

test("izlenmeyen yeni localStorage değişikliği Dexie ana kaydına alınır",async()=>{
  const x=await setup('{"v":21,"name":"Yerel"}','{"v":21,"name":"Dexie"}',900,0);x.mirror.meta.hash="";
  const result=await x.coordinator.initialize();
  assert.equal(result.status,"local-newer");assert.equal(result.primary,"dexie");assert.equal(JSON.parse(x.target.state.json).name,"Yerel");assert.equal(x.runtime.applied.length,0);
});

test("daha yeni Dexie kaydı çalışan duruma ve yerel aynaya uygulanır",async()=>{
  const local='{"v":21,"name":"Yerel"}',indexed='{"v":21,"name":"Dexie"}',x=await setup(local,indexed,900,500);
  const result=await x.coordinator.initialize();
  assert.equal(result.status,"indexed-newer");assert.equal(result.primary,"dexie");assert.equal(x.runtime.applied[0],indexed);assert.equal(x.mirror.meta.hash,x.stateHash(indexed));
});

test("IndexedDB açılamazsa geçerli localStorage aynasıyla çalışma sürer",async()=>{
  const x=await setup('{"v":21,"name":"Güvenli"}',null);x.target.fail=true;
  const result=await x.coordinator.initialize();
  assert.equal(result.ok,true);assert.equal(result.status,"fallback-local");assert.equal(result.primary,"localStorage");assert.equal(result.degraded,true);
});

test("başarılı save yakalaması Dexie'ye yazılır ve ayna damgası güncellenir",async()=>{
  const json='{"v":21,"name":"Yeni kayıt"}',x=await setup(json,null);
  const result=await x.coordinator.capture(json,777);
  assert.equal(result.status,"written");assert.equal(x.target.state.json,json);assert.equal(x.target.meta.primaryMode,"dexie-primary");assert.equal(x.mirror.meta.updatedAt,777);assert.equal(x.mirror.meta.hash,x.stateHash(json));
});

test("Dexie okunamazsa save yakalaması ayna damgasını yanlışlıkla ilerletmez",async()=>{
  const json='{"v":21,"name":"Kaydedilemeyen"}',x=await setup(json,null,0,250),before={...x.mirror.meta};x.target.fail=true;
  const result=await x.coordinator.capture(json,777);
  assert.equal(result.ok,false);assert.equal(result.status,"failed");assert.deepEqual(x.mirror.meta,before);assert.equal(x.target.commits,0);
});

test("değişmeyen Dexie kaydı doğrulandıktan sonra ayna damgası güncellenir",async()=>{
  const json='{"v":21,"name":"Aynı kayıt"}',x=await setup(json,json,500,100);
  const result=await x.coordinator.capture(json,777);
  assert.equal(result.ok,true);assert.equal(result.status,"unchanged");assert.equal(result.updatedAt,500);assert.equal(x.target.commits,0);assert.equal(x.mirror.meta.hash,x.stateHash(json));assert.equal(x.mirror.meta.updatedAt,777);
});
