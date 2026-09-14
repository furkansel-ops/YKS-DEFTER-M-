const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const media=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-media.ts"),"utf8");
const library=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-library.ts"),"utf8");
const feedScript=()=>fs.readFileSync(path.join(root,"scripts/refresh-teachers-v2-feed.mjs"),"utf8");
const css=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-media.css"),"utf8");

test("Hocalar v2 videolarını eski Programım gün seçicisine yeniden bağlar",()=>{
  const source=media();
  assert.match(source,/openDayPick\?\:\(text:string,after\?\:\(\)=>void\)=>boolean/);
  assert.match(source,/planFindCell\?\:\(text:string\)=>LegacyPlanCell\|null/);
  assert.match(source,/function planVideoText/);
  assert.match(source,/https:\/\/youtu\.be\/\$\{video\.id\}/);
  assert.match(source,/data-media-action="program"/);
  assert.match(source,/data-media-action="playlist-program"/);
  assert.match(source,/legacy\.openDayPick\(text,/);
});

test("Hocalar v2 geniş arşivi küçük manifestten ayrı hoca dosyalarına üretir",()=>{
  const source=feedScript();
  assert.match(source,/const PREVIEW_VIDEOS=12/);
  assert.match(source,/const CHANNEL_ARCHIVE_LIMIT=600/);
  assert.match(source,/const SEARCH_ARCHIVE_LIMIT=120/);
  assert.match(source,/archiveFile:`teachers-v2\/\$\{slugFor\(name\)\}\.json`/);
  assert.match(source,/writeFile\(archivePath/);
  assert.match(source,/videos:row\.videos\.slice\(0,PREVIEW_VIDEOS\)/);
  assert.match(source,/playlists:row\.playlists\.slice\(0,PREVIEW_PLAYLISTS\)/);
});

test("Hocalar v2 arşivi filtrelenir ve sayfalı şekilde daha fazla video gösterebilir",()=>{
  const source=media();
  assert.match(source,/const PAGE_SIZE=24/);
  assert.match(source,/loadTeacherArchive/);
  assert.match(source,/archiveCache=new Map/);
  assert.match(source,/\['kamp','Kamp \/ Seri'\]/);
  assert.match(source,/data-media-action="more"/);
  assert.match(source,/visibleLimit\+=PAGE_SIZE/);
  assert.match(source,/Kanalın tüm videoları/);
});

test("Geniş arşivdeki önizleme dışı videolar da Kaydet özelliğini kullanabilir",()=>{
  const source=library();
  const style=css();
  assert.match(source,/function visibleCardBookmark/);
  assert.match(source,/card\.dataset\.videoTitle/);
  assert.match(source,/if\(!indexed\)return visibleCardBookmark\(id\)/);
  assert.match(style,/teachers-v2-video-plan/);
  assert.match(style,/teachers-v2-playlist-plan/);
  assert.match(style,/teachers-v2-load-more/);
});
