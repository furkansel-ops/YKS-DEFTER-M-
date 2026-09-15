const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const app=()=>fs.readFileSync(path.join(root,"modules/teachers-curated-v3.js"),"utf8");
const sources=()=>fs.readFileSync(path.join(root,"scripts/teachers-v2-sources.mjs"),"utf8");
const patcher=()=>fs.readFileSync(path.join(root,"scripts/patch-teachers-v2-known-custom.mjs"),"utf8");
const ui=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2.ts"),"utf8");

function catalog(){
  const source=app(),start=source.indexOf("const CURATED_YKS_TEACHERS=["),end=source.indexOf(";\n  try{",start);
  const block=source.slice(start,end),rows=[];
  for(const match of block.matchAll(/\{a:\"([^\"]+)\",d:\[([^\]]*)\]\s*,?\s*l:/g))rows.push({name:match[1],subjects:[...match[2].matchAll(/\"([^\"]+)\"/g)].map(x=>x[1])});
  return rows;
}

test("küratörlü Hocalar kataloğu TYT ve AYT derslerini ayrı filtreler",()=>{
  const rows=catalog();
  assert.equal(rows.length,43);
  assert.ok(rows.filter(row=>row.subjects.includes("Kimya")).length>=10);
  assert.ok(rows.filter(row=>row.subjects.includes("Kimya (AYT)")).length>=10);
  assert.ok(rows.filter(row=>row.subjects.includes("Fizik")).length>=8);
  assert.ok(rows.filter(row=>row.subjects.includes("Biyoloji")).length>=7);
  assert.ok(rows.some(row=>row.name==="Ferrum"&&row.subjects.includes("Kimya")&&row.subjects.includes("Kimya (AYT)")));
  assert.ok(rows.some(row=>row.name==="Kenan Kara"&&row.subjects.includes("Geometri (AYT)")));
});

test("yerleşik hocaların tamamı doğrulanmış YouTube kanal kaynağına bağlanır",()=>{
  const rows=catalog(),map=sources();
  for(const row of rows){const escaped=row.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");assert.match(map,new RegExp(`\"${escaped}\":\\{[^\\n]*(?:channelId|channelHandle):`),`${row.name} kanal eşleşmesi eksik`);}
  assert.match(map,/@kimyaadasi/);assert.match(map,/@meschemykimya/);assert.match(map,/@paraksilen/);assert.match(map,/@kimyadersleri/);assert.match(map,/@biosem/);assert.match(map,/UC_IRxSYYyDa4Li9lxAM4xbQ/);
});

test("hızlı medya üreticisi RSS verisini ağır arşiv sonucu ve gerçek playlistlerle birleştirir",()=>{
  const source=patcher();
  assert.match(source,/function parseChannelId/);
  assert.match(source,/async function resolveChannel/);
  assert.match(source,/function parsePlaylists/);
  assert.match(source,/fetchChannelPlaylists/);
  assert.match(source,/MAX_PLAYLISTS=16/);
  assert.match(source,/CURATED_VIDEOS/);
  assert.match(source,/Doğrulanmış kanal kaynağı olmayan yerleşik hocalar/);
  assert.match(source,/github-pages-curated-yks-rss-deep-preserve/);
  assert.match(source,/playlistTeacherCount/);
  assert.match(source,/queryHint/);
});

test("Hocalar arayüzü TYT ve AYT derslerini öğrencinin gördüğü etikette ayırır",()=>{
  const source=ui();
  assert.match(source,/function subjectLabel/);
  assert.match(source,/return `AYT \$\{ayt\[1\]\}`/);
  assert.match(source,/return `TYT \$\{value\}`/);
  assert.match(source,/doğrulanmış kanal, güncel video ve kamp serilerine/);
  assert.match(source,/Video merkezi/);
});

test("küratörlü katalog app.js sonrasındaki klasik core-utils zincirinden yüklenir ve PWA çekirdeğinde çevrimdışı korunur",()=>{
  const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
  const core=fs.readFileSync(path.join(root,"modules/core-utils.js"),"utf8");
  const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
  assert.match(index,/app\.js\?v=4\.1\.0-r20/);
  assert.match(index,/modules\/core-utils\.js\?v=4\.1\.0-r27/);
  assert.match(core,/teachers-curated-v3\.js\?v=4\.4\.0-r3/);
  assert.match(core,/document\.write/);
  assert.match(sw,/teachers-curated-v3\.js\?v=4\.4\.0-r3/);
});
