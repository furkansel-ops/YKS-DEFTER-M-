import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("3B maskot sistemi lazy ve öğrenci verisinden bağımsızdır",()=>{
  const main=read("src/main.ts"),runtime=read("src/ui/mascot-runtime.ts"),assets=read("src/ui/mascot-assets.ts");
  assert.match(main,/import\("\.\/ui\/mascot-runtime"\)/);
  assert.match(runtime,/from "three"/);
  assert.match(runtime,/yks:mascot:selected:v1/);
  assert.match(runtime,/prefers-reduced-motion/);
  assert.doesNotMatch(runtime,/YKSLegacyState|window\.S|Firestore|firebase|IndexedDB|Dexie/);
  for(const id of ["notebook","owl","cat","fox","panda","rabbit","turtle","penguin","robot","dragon"])assert.match(assets,new RegExp(`id:"${id}"`));
});

test("maskot seçimi ayarlar görünümüne ve ana ekrana bağlanır",()=>{
  const runtime=read("src/ui/mascot-runtime.ts");
  assert.match(runtime,/data-yms-section="appearance"/);
  assert.match(runtime,/yksMascotStage/);
  assert.match(runtime,/rb-task-toggle/);
  assert.match(runtime,/yks:mascot-celebrate/);
  assert.match(runtime,/WebGLRenderer/);
});
