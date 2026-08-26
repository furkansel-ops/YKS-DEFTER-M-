const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const codecUrl=pathToFileURL(path.resolve(__dirname,"../src/data/codec.ts")).href;

test("TypeScript veri çözücüsü geçerli şema 21 kaydını aynen okur",async()=>{
  const {decodeState}=await import(codecUrl),raw={v:21,name:"Furkan",lab:{paragraphLog:[]},bilinmeyenAlan:{koru:true}},json=JSON.stringify(raw),result=decodeState(json);
  assert.equal(result.ok,true);assert.equal(result.schema,21);assert.equal(result.json,json);assert.deepEqual(result.state.bilinmeyenAlan,{koru:true});
});

test("TypeScript veri çözücüsü bozuk, aşırı büyük ve gelecek şema kayıtlarını engeller",async()=>{
  const {decodeState,MAX_REASONABLE_STATE_CHARS}=await import(codecUrl);
  assert.equal(decodeState("{").kind,"invalid-json");assert.equal(decodeState("[]").kind,"invalid-shape");assert.equal(decodeState('{"v":22}').kind,"future-schema");
  const huge='{"v":21,"pad":"'+"x".repeat(MAX_REASONABLE_STATE_CHARS)+'"}';
  assert.equal(decodeState(huge).kind,"too-large");
});

test("TypeScript veri kodlayıcısı bilinmeyen eski alanları silmez",async()=>{
  const {encodeState}=await import(codecUrl),state={v:21,name:"Furkan",legacy:{a:1},lab:{timelineFav:["Kurtuluş Savaşı"]}},result=encodeState(state);
  assert.equal(result.ok,true);assert.deepEqual(JSON.parse(result.json),state);
});
