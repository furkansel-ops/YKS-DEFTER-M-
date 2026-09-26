import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("maskot prototipi canlı uygulama başlangıcından tamamen devre dışıdır",()=>{
  const main=read("src/main.ts"),vite=read("vite.config.mts");
  assert.doesNotMatch(main,/import\("\.\/ui\/mascot-runtime"\)/);
  assert.doesNotMatch(main,/dataset\.mascotRuntime/);
  assert.doesNotMatch(vite,/"src\/ui\/mascot-runtime\.ts"/);
});

test("maskot prototipi repoda korunur ama öğrenci verisine dokunmaz",()=>{
  const runtime=read("src/ui/mascot-runtime.ts"),assets=read("src/ui/mascot-assets.ts");
  assert.match(runtime,/from "three"/);
  assert.doesNotMatch(runtime,/YKSLegacyState|window\.S|Firestore|firebase|IndexedDB|Dexie/);
  for(const id of ["notebook","owl","cat","fox","panda","rabbit","turtle","penguin","robot","dragon"]){
    assert.match(assets,new RegExp(`id:"${id}"`));
    assert.ok(fs.existsSync(path.join(root,"public","mascots",`${id}.webp`)),`${id} görseli eksik`);
  }
});
