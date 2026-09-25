const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const dataUrl=file=>pathToFileURL(path.resolve(__dirname,"../src/data",file)).href;
const modules=async()=>({...await import(dataUrl("codec.ts")),...await import(dataUrl("primary-store.ts")),...await import(dataUrl("backup-service.ts"))});

async function fixture(localJSON,indexedJSON){
  const {decodeState,stateHash,PrimaryStateCoordinator}=await modules();
  const record=json=>({key:"primary",json,schema:JSON.parse(json).v,chars:json.length,bytes:Buffer.byteLength(json),source:"localStorage",sourceHash:stateHash(json),updatedAt:100});
  const mirror={json:localJSON,meta:{hash:localJSON?stateHash(localJSON):"",updatedAt:100},read(){return decodeState(this.json);},readMirrorMetadata(){return {...this.meta};},writeMirrorMetadata(hash,updatedAt){this.meta={hash,updatedAt};return {ok:true};}};
  const target={state:indexedJSON?record(indexedJSON):undefined,meta:undefined,commits:[],async readState(){return this.state;},async readMeta(){return this.meta;},async commit(state,meta){this.state=structuredClone(state);this.meta=structuredClone(meta);this.commits.push(state.json);}};
  const runtime={json:localJSON,applies:[],applyJSON(json){this.applies.push(json);this.json=json;mirror.json=json;return {ok:true,json};}};
  return {mirror,target,runtime,coordinator:new PrimaryStateCoordinator(mirror,target,runtime,()=>200),stateHash};
}

test("yeni IndexedDB şeması eski yerel ayna ile açılışta veya sonraki kayıtta ezilmez",async()=>{
  const local='{"v":21,"name":"Eski ayna"}',future='{"v":22,"newStudentData":[1,2]}',x=await fixture(local,future);
  assert.equal((await x.coordinator.initialize()).ok,false);
  assert.equal((await x.coordinator.capture(local)).ok,false);
  assert.equal((await x.coordinator.replaceFromExternal(local)).ok,false);
  assert.equal((await x.coordinator.readPrimaryJSON()).ok,false);
  assert.equal(x.target.state.json,future);assert.equal(x.mirror.json,local);
  assert.equal(x.target.commits.length,0);assert.equal(x.runtime.applies.length,0);
});

test("yeni yerel şema eski IndexedDB kopyası ile geri yüklenmez veya buluta aktarılmaz",async()=>{
  const future='{"v":22,"newStudentData":[1,2]}',old='{"v":21,"name":"Eski kopya"}',x=await fixture(future,old);
  assert.equal((await x.coordinator.initialize()).ok,false);
  assert.equal((await x.coordinator.capture(old)).ok,false);
  assert.equal((await x.coordinator.replaceFromExternal(old)).ok,false);
  assert.equal((await x.coordinator.readPrimaryJSON()).ok,false);
  assert.equal(x.mirror.json,future);assert.equal(x.target.state.json,old);
  assert.equal(x.target.commits.length,0);assert.equal(x.runtime.applies.length,0);
});

test("şema nesnesi veya geçersiz sayı veri çözücüsünü ve yedek incelemesini çökertmez",async()=>{
  const {decodeState,encodeState,inspectBackupPackage}=await modules();
  for(const v of [{valueOf:0,toString:0},[],true,0,-1,21.9,"Infinity","invalid"]){
    const json=JSON.stringify({v});
    assert.equal(decodeState(json).ok,false,`decode ${json}`);
    assert.equal(encodeState({v}).ok,false,`encode ${json}`);
    assert.equal(inspectBackupPackage(json).ok,false,`backup ${json}`);
  }
  assert.equal(decodeState('{"v":"21","unknown":{"keep":true}}').ok,true);
  assert.equal(decodeState('{"solved":{"2026-09-18":20}}').schema,1);
});

test("uygulama verisi olmayan JSON yedek diye kabul edilmez; eski kayıtsız sürüm korunur",async()=>{
  const {inspectBackupPackage}=await modules();
  for(const payload of [{},{hello:"world"},{format:2,data:{hello:"world"}},{format:2,data:{}}])assert.equal(inspectBackupPackage(JSON.stringify(payload)).ok,false);
  const legacy={name:"Öğrenci",solved:{"2026-09-18":20},unknown:{keep:true}},result=inspectBackupPackage(JSON.stringify(legacy));
  assert.equal(result.ok,true);assert.deepEqual(result.state,legacy);
});

test("geçersiz veya desteklenmeyen yedek biçimi kontrollü reddedilir",async()=>{
  const {createBackupPackage,inspectBackupPackage}=await modules();
  const built=createBackupPackage('{"v":21,"name":"Öğrenci"}',"4.4.0");assert.equal(built.ok,true);
  for(const format of [{valueOf:0,toString:0},[],true,0,-1,2.5,4,"invalid"]){
    const payload={...JSON.parse(built.text),format};
    assert.equal(inspectBackupPackage(JSON.stringify(payload)).ok,false,`format ${JSON.stringify(format)}`);
  }
});

for(const failure of ["returned","thrown","partial"]){
  test(`dış kayıt çalışma zamanında başarısızsa önceki kayıt iki depoda korunur (${failure})`,async()=>{
    const old='{"v":21,"name":"Korunacak öğrenci","solved":{"2026-09-18":100}}',incoming='{"v":21,"name":"Gelen"}',x=await fixture(old,old);
    const apply=x.runtime.applyJSON.bind(x.runtime);let first=true;
    x.runtime.applyJSON=json=>{if(first){first=false;if(failure==="partial")apply(json);if(failure==="thrown")throw new Error("Runtime failed");return {ok:false,message:"Runtime failed"};}return apply(json);};
    const result=await x.coordinator.replaceFromExternal(incoming,300,"firebase");
    assert.equal(result.ok,false);assert.equal(result.status,"failed");assert.equal(result.rolledBack,true);
    assert.equal(x.target.state.json,old);assert.equal(x.mirror.json,old);assert.equal(x.runtime.json,old);
    assert.equal((await x.coordinator.readPrimaryJSON()).json,old);
  });
}

test("başarısız dış kayıt IndexedDB henüz yoksa eski yerel veriyi korur",async()=>{
  const old='{"v":21,"name":"Yerel veri"}',incoming='{"v":21,"name":"Gelen"}',x=await fixture(old,null);
  x.runtime.applyJSON=()=>({ok:false,message:"Runtime failed"});
  const result=await x.coordinator.replaceFromExternal(incoming,300);
  assert.equal(result.ok,false);assert.equal(x.target.state.json,old);assert.equal(x.mirror.json,old);
});

test("normalize edilmiş dış kaydın ikinci yazması başarısız olursa önceki veri geri gelir",async()=>{
  const old='{"v":21,"name":"Korunacak veri"}',incoming='{"v":21,"name":"Gelen"}',normalized='{"v":21,"name":"Gelen","normalized":true}',x=await fixture(old,old);
  const apply=x.runtime.applyJSON.bind(x.runtime),commit=x.target.commit.bind(x.target);
  x.runtime.applyJSON=json=>apply(json===incoming?normalized:json);
  x.target.commit=async(state,meta)=>{if(state.json===normalized)throw new Error("Normalization write failed");return commit(state,meta);};
  const result=await x.coordinator.replaceFromExternal(incoming,300);
  assert.equal(result.ok,false);assert.equal(x.target.state.json,old);assert.equal(x.mirror.json,old);assert.equal(x.runtime.json,old);
});

test("başarısız dış kayıt farklı yerel ve IndexedDB kopyalarını ayrı ayrı korur",async()=>{
  const local='{"v":21,"name":"Son yerel değişiklik"}',indexed='{"v":21,"name":"Önceki Dexie kopyası"}',incoming='{"v":21,"name":"Gelen"}',x=await fixture(local,indexed);
  const oldState=structuredClone(x.target.state),oldMirrorMeta={...x.mirror.meta};
  x.target.meta={key:"legacy-localstorage-import-v1",migrationVersion:1,stateKey:"primary",schema:21,source:"backup",sourceHash:x.target.state.sourceHash,sourceChars:indexed.length,sourceBytes:Buffer.byteLength(indexed),updatedAt:90,primaryMode:"dexie-primary"};
  const oldMeta=structuredClone(x.target.meta),apply=x.runtime.applyJSON.bind(x.runtime);
  x.runtime.applyJSON=json=>{const result=apply(json);return json===incoming?{ok:false,message:"Kısmi uygulama hatası"}:result;};
  const result=await x.coordinator.replaceFromExternal(incoming,300);
  assert.equal(result.rolledBack,true);assert.deepEqual(x.target.state,oldState);assert.deepEqual(x.target.meta,oldMeta);
  assert.equal(x.mirror.json,local);assert.deepEqual(x.mirror.meta,oldMirrorMeta);assert.equal(x.runtime.json,local);
});

test("kurtarma depoya yazılamazsa işlem başarılı veya geri alınmış gösterilmez",async()=>{
  const old='{"v":21,"name":"Korunacak veri"}',incoming='{"v":21,"name":"Gelen"}',x=await fixture(old,old),commit=x.target.commit.bind(x.target);
  x.target.commit=async(state,meta)=>{if(state.json===old)throw new Error("Depo kullanılamıyor");return commit(state,meta);};
  x.runtime.applyJSON=()=>({ok:false,message:"Runtime failed"});
  const result=await x.coordinator.replaceFromExternal(incoming,300);
  assert.equal(result.ok,false);assert.equal(result.rolledBack,false);assert.doesNotMatch(result.message,/otomatik geri alındı/);assert.equal(x.mirror.json,old);
});
