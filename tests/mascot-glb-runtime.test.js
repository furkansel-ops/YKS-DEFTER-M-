import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("defter maskotu build sırasında gerçek GLB üretir ve beş animasyonu taşır",()=>{
  const run=spawnSync(process.execPath,[path.join(root,"scripts/prepare-notebook-mascot.mjs")],{cwd:root,encoding:"utf8"});
  assert.equal(run.status,0,run.stderr||run.stdout);
  const file=path.join(root,"public/mascots/notebook/notebook-ref-v2.glb");
  const bytes=fs.readFileSync(file);
  assert.equal(bytes.subarray(0,4).toString("ascii"),"glTF");
  assert.equal(bytes.readUInt32LE(4),2);
  assert.ok(bytes.length>10_000&&bytes.length<500_000,`beklenmeyen GLB boyutu: ${bytes.length}`);
  const jsonLength=bytes.readUInt32LE(12),jsonType=bytes.readUInt32LE(16);
  assert.equal(jsonType,0x4E4F534A);
  const json=JSON.parse(bytes.subarray(20,20+jsonLength).toString("utf8").trim());
  assert.equal(json.asset?.version,"2.0");
  assert.equal(json.asset?.extras?.mascot,"notebook");
  assert.deepEqual(json.animations.map(animation=>animation.name),["idle","tap","celebrate","sad","wave"]);
});

test("defter maskotu gönderilen referanstaki hacimli kitap formunu korur",()=>{
  const builder=read("scripts/prepare-notebook-mascot.mjs"),runtime=read("src/ui/mascot-glb-runtime.ts");
  assert.match(builder,/roundedBox\(2\.72,3\.38,\.42/);
  assert.match(builder,/PageBlock/);
  assert.match(builder,/BackCover/);
  assert.match(builder,/RingSocket/);
  assert.match(builder,/EyeShine/);
  assert.match(builder,/HandL/);
  assert.match(builder,/FootL/);
  assert.match(builder,/reference:"user-supplied blue notebook mascot"/);
  assert.match(runtime,/model\.rotation\.set\(\.035,-\.30,-\.015\)/);
  assert.match(runtime,/pointermove/);
  assert.match(runtime,/presentation\.rotation\.y=pointerX\*\.16/);
});

test("GLB defter maskotu eski PNG düzlem runtimeından bağımsız ve fail-open yüklenir",()=>{
  const runtime=read("src/ui/mascot-glb-runtime.ts"),main=read("src/main.ts"),pkg=JSON.parse(read("package.json"));
  assert.match(runtime,/GLTFLoader/);
  assert.match(runtime,/AnimationMixer/);
  assert.match(runtime,/cache:"no-cache"/);
  assert.match(runtime,/\.\/mascots\/notebook\/notebook-ref-v2\.glb/);
  assert.match(runtime,/attributeFilter:\["class"\]/);
  assert.doesNotMatch(runtime,/observer\.observe\(document\.body|subtree:true/);
  assert.match(main,/import\("\.\/ui\/mascot-glb-runtime"\)/);
  assert.doesNotMatch(main,/import\("\.\/ui\/mascot-runtime"\)/);
  assert.match(pkg.scripts["build:assets"],/prepare-notebook-mascot\.mjs/);
  assert.match(pkg.scripts.dev,/prepare-notebook-mascot\.mjs/);
});
