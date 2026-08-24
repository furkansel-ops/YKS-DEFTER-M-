const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const dataUrl=file=>pathToFileURL(path.resolve(__dirname,"../src/data",file)).href;

test("Dexie ana kaydından üretilen bulut JSON'u yerel çalışma sırlarını ayırır",async()=>{
  const {buildCloudPayload}=await import(dataUrl("cloud-state.ts"));
  const state={v:21,name:"Furkan",focus:{goalMin:120,sw:{run:true,start:99,acc:88,cr:77},swLaps:[{t:5,subj:"Matematik"}]},yt:{key:"gizli-anahtar",src:"key",err:""},learning:{cards:[{id:1,q:"Soru",a:"Cevap"}]},lab:{timelineFav:["Milli Mücadele"]},unknown:{keep:true}};
  const result=buildCloudPayload(JSON.stringify(state),"dexie");
  assert.equal(result.ok,true);const cloud=JSON.parse(result.json);
  assert.deepEqual(cloud.focus.sw,{run:false,start:0,acc:0,cr:0});assert.deepEqual(cloud.focus.swLaps,[]);assert.equal(cloud.yt.key,"");
  assert.deepEqual(cloud.learning,state.learning);assert.deepEqual(cloud.lab,state.lab);assert.deepEqual(cloud.unknown,{keep:true});assert.equal(result.source,"dexie");assert.equal(result.schema,21);
});

test("bulut kaydı çalışan duruma uygulanmadan önce Dexie'ye doğrulanarak yazılır",async()=>{
  const [{decodeState},{PrimaryStateCoordinator}]=await Promise.all([import(dataUrl("codec.ts")),import(dataUrl("primary-store.ts"))]),order=[];
  const localJSON='{"v":21,"name":"Yerel"}',cloudJSON='{"v":21,"name":"Bulut"}';
  const mirror={meta:{hash:"",updatedAt:0},read:()=>decodeState(localJSON),readMirrorMetadata(){return {...this.meta};},writeMirrorMetadata(hash,updatedAt){this.meta={hash,updatedAt};return {ok:true};}};
  const target={state:undefined,meta:undefined,async readState(){return this.state;},async readMeta(){return this.meta;},async commit(state,meta){order.push("dexie");this.state=structuredClone(state);this.meta=structuredClone(meta);}};
  const runtime={applyJSON(json){order.push("runtime");return {ok:true,json};}};
  const coordinator=new PrimaryStateCoordinator(mirror,target,runtime,()=>500);
  const result=await coordinator.replaceFromExternal(cloudJSON,400);
  assert.equal(result.ok,true);assert.deepEqual(order,["dexie","runtime"]);assert.equal(target.state.source,"firebase");assert.equal(target.state.json,cloudJSON);assert.equal(JSON.parse(target.state.json).name,"Bulut");
});

test("gelecek şemadaki bulut kaydı Dexie'ye ve çalışan duruma uygulanmaz",async()=>{
  const [{decodeState},{PrimaryStateCoordinator}]=await Promise.all([import(dataUrl("codec.ts")),import(dataUrl("primary-store.ts"))]);let commits=0,applies=0;
  const mirror={read:()=>decodeState('{"v":21}'),readMirrorMetadata:()=>({hash:"",updatedAt:0}),writeMirrorMetadata:()=>({ok:true})};
  const target={readState:async()=>undefined,readMeta:async()=>undefined,commit:async()=>{commits++;}};
  const runtime={applyJSON:json=>{applies++;return {ok:true,json};}};
  const result=await new PrimaryStateCoordinator(mirror,target,runtime).replaceFromExternal('{"v":22}');
  assert.equal(result.ok,false);assert.equal(result.status,"invalid");assert.equal(commits,0);assert.equal(applies,0);
});
