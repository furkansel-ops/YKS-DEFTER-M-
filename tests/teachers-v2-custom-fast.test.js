const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const custom=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-custom-fast.ts"),"utf8");
const patcher=()=>fs.readFileSync(path.join(root,"scripts/patch-teachers-v2-known-custom.mjs"),"utf8");
const main=()=>fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
const workflow=()=>fs.readFileSync(path.join(root,".github/workflows/deploy-pages.yml"),"utf8");

test("Kendi eklenen hoca hazır arşiv eşleşmezse sonsuz yükleniyor görünümünde kalmaz",()=>{
  const source=custom();
  assert.match(source,/waitingForMatch/);
  assert.match(source,/Kendi hocan · hazır arşiv yok/);
  assert.match(source,/data-custom-fast-url/);
  assert.match(source,/youtubeSearchUrl\(name,subject/);
  assert.match(source,/\.teachers-v2-profile \.teachers-v2-subject/);
});

test("Ferrum doğrulanmış kimya kanalıyla doğrudan hızlı erişime bağlanır",()=>{
  const source=custom();
  const feedPatch=patcher();
  assert.match(source,/ferrum:\{subject:"Kimya",channelId:"UC0yco2kB3xW3WI__8E8HaKw",channelName:"Ferrum"\}/);
  assert.match(feedPatch,/name:"Ferrum"/);
  assert.match(feedPatch,/subject:"Kimya"/);
  assert.match(feedPatch,/channelId:"UC0yco2kB3xW3WI__8E8HaKw"/);
  assert.match(feedPatch,/channelSource:"verified"/);
});

test("Ferrum medya yaması arşiv üretiminden önce çalışır ve hızlı katman lazy kalır",()=>{
  const flow=workflow();
  const source=main();
  assert.ok(flow.indexOf("node scripts/patch-teachers-v2-known-custom.mjs")>flow.indexOf("node scripts/refresh-teachers-v2-feed.mjs"));
  assert.ok(flow.indexOf("node scripts/build-teachers-v2-archives.mjs")>flow.indexOf("node scripts/patch-teachers-v2-known-custom.mjs"));
  assert.match(source,/import\("\.\/ui\/teachers-v2-custom-fast"\)\.catch/);
  assert.match(source,/dataset\.teachersV2CustomFast="deferred"/);
});
