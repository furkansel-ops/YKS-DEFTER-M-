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
  assert.match(source,/Hocanı seç, serileri incele ve çalışacağın videoları programına ekle/);
  assert.doesNotMatch(source,/Firebase eşitleme hattı|Hocalar v2 · Kaynak profili/);
  assert.match(source,/Video merkezi/);
});

test("küratörlü katalog core-utils ve stability arasında açık senkron script ile yüklenir",()=>{
  const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
  const core=fs.readFileSync(path.join(root,"modules/core-utils.js"),"utf8");
  const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
  const scripts=[...index.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(match=>({attributes:match[1],body:match[2],src:match[1].match(/\bsrc="([^"]+)"/)?.[1]}));
  const urls=["./app.js?v=4.1.0-r22","./modules/core-utils.js?v=4.1.0-r27","./modules/teachers-curated-v3.js?v=4.4.0-r3","./modules/stability.js?v=4.1.0-r28"];
  const positions=urls.map(url=>scripts.findIndex(script=>script.src===url));
  assert.ok(positions.every(position=>position>=0));
  assert.ok(positions[0]<positions[1]);
  assert.equal(positions[2],positions[1]+1);
  assert.equal(positions[3],positions[2]+1);
  for(const position of positions){
    const script=scripts[position];
    assert.doesNotMatch(script.attributes,/\b(?:async|defer)\b|type="module"/);
    assert.equal(script.body.trim(),"","Sonraki script öncekinin gövdesine yutulmamalı");
  }
  assert.doesNotMatch(core,/document\.write/);
  assert.match(sw,/teachers-curated-v3\.js\?v=4\.4\.0-r3/);
});

test("klasik çekirdek zinciri HTML yazmadan kataloğu ve kararlılık servisini hazırlar",()=>{
  const vm=require("node:vm"),writes=[],events=[];
  const document={readyState:"loading",documentElement:{dataset:{}},write:value=>writes.push(value),addEventListener:(...args)=>events.push(args)};
  const window={};
  const context=vm.createContext({window,document,TEACHERS:[],TEACH_SUBJECTS:[],console});
  for(const file of ["core-utils.js","teachers-curated-v3.js","stability.js"]){
    vm.runInContext(fs.readFileSync(path.join(root,"modules",file),"utf8"),context,{filename:file});
  }
  assert.equal(writes.length,0);
  assert.equal(context.TEACHERS.length,43);
  assert.equal(window.__YKS_CURATED_TEACHERS__.length,43);
  assert.equal(document.documentElement.dataset.teachersCatalog,"curated-v3");
  assert.equal(typeof window.YKSCore.mergeStates,"function");
  assert.equal(typeof window.YKSStability.restoreRuntime,"function");
  assert.ok(events.some(([event])=>event==="DOMContentLoaded"));
});


test("Hocalar ana ekranı kompakt kontrol alanı ve kaynak odaklı kart düzeni kullanır",()=>{
  const source=ui();
  const style=fs.readFileSync(path.join(root,"src/ui/teachers-v2.css"),"utf8");
  assert.match(source,/Kaynak merkezi/);
  assert.match(source,/teachers-v2-controls/);
  assert.match(source,/teachers-v2-filter-block/);
  assert.match(source,/Filtreleri temizle/);
  assert.match(source,/Kaynakları aç →/);
  assert.match(source,/teachers-v2-card-foot/);
  assert.match(source,/teachers-v2-media-host/);
  assert.match(source,/YouTube'da hızlı ara/);
  assert.match(style,/teachers-v2-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(style,/@media\(max-width:760px\)[\s\S]*teachers-v2-grid\{grid-template-columns:1fr\}/);
  assert.match(style,/teachers-v2-controls/);
});

test("Hocalar favori filtresi erişilebilir durum ve tek hamlede sıfırlama desteğini korur",()=>{
  const source=ui();
  assert.match(source,/aria-pressed="false">★ Favorilerim/);
  assert.match(source,/favToggle\?\.setAttribute\("aria-pressed",String\(state\.favOnly\)\)/);
  assert.match(source,/if\(action==="reset"\)\{state\.query="";state\.subject="";state\.level="";state\.favOnly=false/);
});


test("Hocalar v2 eski kaynak bloklarını görünür yüzeyden kaldırır",()=>{
  const source=ui();
  const style=fs.readFileSync(path.join(root,"src/ui/teachers-v2.css"),"utf8");
  assert.match(source,/directPlaylistUrl/);
  assert.match(source,/version:"2\.1\.0"/);
  assert.match(style,/#mrp_kay #teachersV2Root ~ h2/);
  assert.match(style,/#mrp_kay #teachersV2Root ~ \.card/);
  assert.match(style,/#mrp_kay #teachersV2Root ~ #thList\{display:none!important\}/);
});


test("Hocalar v2 aktifken eski öğretmen ve YouTube blokları gizlenir",()=>{
  const source=ui();
  assert.match(source,/function hideLegacyTeacherSurface/);
  assert.match(source,/directPlaylistUrl/);
  assert.match(source,/tvSubject/);
  assert.match(source,/tvSuggest/);
  assert.match(source,/watchList/);
  assert.match(source,/wsBox/);
});


test("Hocalar özelliği geçici olarak uygulama yüzeyinden kaldırılır ama kodu korunur",()=>{
  const main=fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
  const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
  const nav=fs.readFileSync(path.join(root,"src/ui/navigation-v43.ts"),"utf8");
  const legacyApp=fs.readFileSync(path.join(root,"app.js"),"utf8");
  assert.match(main,/const teachersPaused=document\.documentElement\.dataset\.teacherFeature!=="on"/);
  assert.match(main,/teacherFeatureState=teachersPaused\?"paused":"on"/);
  assert.match(main,/const lt=teachersPaused\|\|document\.documentElement\.dataset\.teacherUi!=="v2"/);
  assert.doesNotMatch(index,/id="thList"/);
  assert.doesNotMatch(index,/id="thSearch"/);
  assert.doesNotMatch(index,/id="fh_hocaekle"/);
  assert.doesNotMatch(index,/Kitaplar, hocalar, oynatma listeleri/);
  assert.match(index,/Kitaplar, oynatma listeleri ve izleme geçmişi/);
  assert.doesNotMatch(nav,/Kitaplar, hocalar, listeler ve izleme geçmişi/);
  assert.match(legacyApp,/function ytTeacher\(name,kind,subject\)/);
  assert.match(legacyApp,/function loadPlaylists\(\)/);
});
