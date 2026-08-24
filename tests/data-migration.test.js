const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const dataUrl=file=>pathToFileURL(path.resolve(__dirname,"../src/data",file)).href;

async function modules(){
  const [codec,migration]=await Promise.all([import(dataUrl("codec.ts")),import(dataUrl("migration.ts"))]);
  return {...codec,...migration};
}

class MemoryTarget{
  state=undefined;
  meta=undefined;
  commits=0;
  async readState(){return this.state;}
  async readMeta(){return this.meta;}
  async commit(state,meta){this.commits++;this.state=structuredClone(state);this.meta=structuredClone(meta);}
}

test("localStorage JSON kaydı IndexedDB hedefine birebir kopyalanır",async()=>{
  const {decodeState,migrateLegacyState,stateHash}=await modules(),raw={v:21,name:"Furkan",unknownLegacy:{keep:true},lab:{paragraphLog:[]}},json=JSON.stringify(raw),target=new MemoryTarget(),source={read:()=>decodeState(json)};
  const result=await migrateLegacyState(source,target,()=>123456);
  assert.equal(result.ok,true);assert.equal(result.status,"copied");assert.equal(target.commits,1);assert.equal(target.state.json,json);assert.equal(target.state.sourceHash,stateHash(json));assert.equal(target.meta.sourceHash,stateHash(json));assert.deepEqual(JSON.parse(target.state.json),raw);
});

test("aynı localStorage kaydı IndexedDB'ye ikinci kez yazılmaz",async()=>{
  const {decodeState,migrateLegacyState}=await modules(),json=JSON.stringify({v:21,name:"Furkan"}),target=new MemoryTarget(),source={read:()=>decodeState(json)};
  await migrateLegacyState(source,target,()=>1);target.commits=0;
  const result=await migrateLegacyState(source,target,()=>2);
  assert.equal(result.ok,true);assert.equal(result.status,"already-current");assert.equal(target.commits,0);assert.equal(target.state.updatedAt,1);
});

test("değişen localStorage kaydı IndexedDB kopyasını güvenle yeniler",async()=>{
  const {decodeState,migrateLegacyState}=await modules(),target=new MemoryTarget();
  await migrateLegacyState({read:()=>decodeState('{"v":21,"name":"Eski"}')},target,()=>1);
  const result=await migrateLegacyState({read:()=>decodeState('{"v":21,"name":"Yeni"}')},target,()=>2);
  assert.equal(result.status,"refreshed");assert.equal(target.commits,2);assert.equal(JSON.parse(target.state.json).name,"Yeni");assert.equal(target.state.updatedAt,2);
});

test("bozuk veya gelecek şema localStorage kaydı IndexedDB üzerine yazılmaz",async()=>{
  const {decodeState,migrateLegacyState}=await modules(),target=new MemoryTarget();
  const invalid=await migrateLegacyState({read:()=>decodeState("{")},target),future=await migrateLegacyState({read:()=>decodeState('{"v":22}')},target);
  assert.equal(invalid.status,"source-invalid");assert.equal(future.status,"source-future");assert.equal(target.commits,0);assert.equal(target.state,undefined);
});
