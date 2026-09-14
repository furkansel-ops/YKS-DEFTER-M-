const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const media=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-media.ts"),"utf8");
const archive=()=>fs.readFileSync(path.join(root,"scripts/build-teachers-v2-archives.mjs"),"utf8");
const workflow=()=>fs.readFileSync(path.join(root,".github/workflows/deploy-pages.yml"),"utf8");

test("Hocalar v2 videoları eski Programım gün seçici hattına yeniden bağlanır",()=>{
  const source=media();
  assert.match(source,/openDayPick\?\:\(text:string,after\?\:\(\)=>void\)=>boolean/);
  assert.match(source,/planFindCell\?\:/);
  assert.match(source,/data-media-action="program"/);
  assert.match(source,/＋ Programım/);
  assert.match(source,/planVideoText\(video\)/);
  assert.match(source,/legacy\.openDayPick\(text,/);
});

test("Hocalar v2 playlistleri de Programım'a eklenebilir",()=>{
  const source=media();
  assert.match(source,/data-media-action="playlist-program"/);
  assert.match(source,/planPlaylistText\(item\)/);
  assert.match(source,/Oynatma listesi/);
});

test("Hocalar v2 tam arşivi tek dev JSON yerine 80 videoluk sayfalara bölünür",()=>{
  const source=archive();
  assert.match(source,/const PAGE_SIZE=80/);
  assert.match(source,/p\$\{pageNo\}\.json/);
  assert.match(source,/pageCount:pages\.length/);
  assert.match(source,/archiveIndex=result\.indexPath/);
  assert.doesNotMatch(source,/writeFile\([^\n]*JSON\.stringify\([^\n]*videos[^\n]*\)[^\n]*archive\.json/);
});

test("Hocalar v2 istemcisi yalnız gereken arşiv sayfasını yükler ve devam düğmesiyle ilerler",()=>{
  const source=media();
  assert.match(source,/type ArchiveIndex=/);
  assert.match(source,/loadArchivePage/);
  assert.match(source,/loadNextArchivePage/);
  assert.match(source,/Arşivden daha fazla video yükle/);
  assert.match(source,/tries<4/);
});

test("Pages build önizleme akışından sonra sayfalı hoca arşivini üretir",()=>{
  const source=workflow();
  assert.match(source,/node scripts\/refresh-teachers-v2-feed\.mjs/);
  assert.match(source,/node scripts\/build-teachers-v2-archives\.mjs/);
  assert.match(source,/timeout-minutes: 20/);
});
