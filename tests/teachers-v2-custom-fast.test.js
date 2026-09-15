const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const custom=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-custom-fast.ts"),"utf8");
const patcher=()=>fs.readFileSync(path.join(root,"scripts/patch-teachers-v2-known-custom.mjs"),"utf8");
const main=()=>fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
const runtimeHardening=()=>fs.readFileSync(path.join(root,"vite.runtime-hardening.mts"),"utf8");
const pkg=()=>fs.readFileSync(path.join(root,"package.json"),"utf8");
const workflow=()=>fs.readFileSync(path.join(root,".github/workflows/deploy-pages.yml"),"utf8");

test("Kendi eklenen hoca arşivi beklemeden hızlı erişim gösterir",()=>{
  const source=custom();
  assert.match(source,/isOwnTeacher/);
  assert.match(source,/!name\|\|!isOwnTeacher\(name\)/);
  assert.match(source,/Kendi hocan · hızlı erişim hazır, arşiv yalnız istersen yüklenir/);
  assert.match(source,/data-custom-fast-url/);
  assert.match(source,/data-media-action="refresh"/);
  assert.match(source,/YKS arşivini yükle/);
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

test("Özel hoca medya motoru gerçek on-demand davranır",()=>{
  const hardening=runtimeHardening();
  assert.match(hardening,/if\(!ownTeacher\(heading\)\)void refreshOverlayMedia\(overlay,heading,false\)/);
  assert.match(hardening,/void loadFeed\(false\)\.then/);
  assert.match(hardening,/medya feedini başlangıçta indirmeme/);
  assert.match(hardening,/await loadFeed\(force\);decorateCards\(\)/);
});

test("Hızlı katman ağır medya modülünden önce başlatılır",()=>{
  const source=main();
  const fast=source.indexOf('import("./ui/teachers-v2-custom-fast")');
  const media=source.indexOf('import("./ui/teachers-v2-media")');
  assert.ok(fast>=0&&media>=0&&fast<media);
  assert.match(source,/dataset\.teachersV2CustomFast="deferred"/);
  assert.match(pkg(),/vite build --config vite\.runtime-hardening\.mts/);
});

test("Ferrum medya yaması arşiv üretiminden önce çalışır",()=>{
  const flow=workflow();
  assert.ok(flow.indexOf("node scripts/patch-teachers-v2-known-custom.mjs")>flow.indexOf("node scripts/refresh-teachers-v2-feed.mjs"));
  assert.ok(flow.indexOf("node scripts/build-teachers-v2-archives.mjs")>flow.indexOf("node scripts/patch-teachers-v2-known-custom.mjs"));
});
