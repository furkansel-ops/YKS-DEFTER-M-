const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const dataUrl=file=>pathToFileURL(path.resolve(__dirname,"../src/data",file)).href;

test("format 3 yedeği imzalanır, kişisel anahtar ayıklanır ve özeti doğrulanır",async()=>{
  const {createBackupPackage,inspectBackupPackage}=await import(dataUrl("backup-service.ts"));
  const state={v:21,name:"Furkan",solved:{"2026-08-25":80},pomoMin:{"2026-08-25":120},denemeler:[{id:1}],topics:{mat:{st:3}},learning:{cards:[{id:1}]},yt:{key:"gizli",src:"key"},focus:{sw:{run:true,start:99,acc:5}}};
  const built=createBackupPackage(JSON.stringify(state),"4.0.0",()=>new Date("2026-08-25T10:00:00.000Z"));
  assert.equal(built.ok,true);const payload=JSON.parse(built.text);assert.equal(payload.format,3);assert.equal(payload.yt,undefined);assert.equal(payload.data.yt.key,"");assert.equal(payload.data.focus.sw.run,false);
  const inspected=inspectBackupPackage(built.text);assert.equal(inspected.ok,true);assert.equal(inspected.summary.integrity,"verified");assert.equal(inspected.summary.days,1);assert.equal(inspected.summary.exams,1);assert.equal(inspected.summary.topics,1);assert.equal(inspected.summary.cards,1);
});

test("değiştirilmiş format 3 yedeği geri yükleme öncesinde reddedilir",async()=>{
  const {createBackupPackage,inspectBackupPackage}=await import(dataUrl("backup-service.ts"));
  const built=createBackupPackage('{"v":21,"name":"Furkan"}',"4.0.0");assert.equal(built.ok,true);
  const payload=JSON.parse(built.text);payload.data.name="Başka";
  const inspected=inspectBackupPackage(JSON.stringify(payload));assert.equal(inspected.ok,false);assert.equal(inspected.kind,"integrity");
});

test("eski format 2 yedekleri kayıpsız kabul edilir, gelecek şema reddedilir",async()=>{
  const {inspectBackupPackage}=await import(dataUrl("backup-service.ts"));
  const legacy=inspectBackupPackage(JSON.stringify({app:"YKS Defterim",format:2,appVersion:"3.2.2",data:{v:21,name:"Furkan",bilinmeyen:{koru:true}}}));
  assert.equal(legacy.ok,true);assert.equal(legacy.summary.integrity,"legacy");assert.deepEqual(legacy.state.bilinmeyen,{koru:true});
  const future=inspectBackupPackage(JSON.stringify({format:2,data:{v:22}}));assert.equal(future.ok,false);assert.equal(future.kind,"future-schema");
});
