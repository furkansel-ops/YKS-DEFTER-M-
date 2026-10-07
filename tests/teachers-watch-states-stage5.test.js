const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('video izleme sistemi izlendi yarım kaldı ve sonra izle durumlarını saklar',()=>{
  const media=read('src/ui/teachers-v2-media.ts');
  assert.match(media,/type WatchStatus="watched"\|"partial"\|"later"/);
  assert.match(media,/function watchStatus\(videoId:string\)/);
  assert.match(media,/record\.status==="partial"\|\|record\.status==="later"\|\|record\.status==="watched"\?record\.status:"watched"/);
  assert.match(media,/function setWatchStatus/);
  assert.match(media,/data-watch-status="watched"/);
  assert.match(media,/data-watch-status="partial"/);
  assert.match(media,/data-watch-status="later"/);
  assert.match(media,/Yarım kaldı/);
  assert.match(media,/Sonra izle/);
});

test('playlist ilerlemesi yalnız tamamlanan videoları sayar ve yarım kalana öncelik verir',()=>{
  const media=read('src/ui/teachers-v2-media.ts');
  assert.match(media,/function isWatched\(videoId:string\):boolean\{return watchStatus\(videoId\)==="watched";\}/);
  assert.match(media,/const watched=videos\.reduce\(\(sum,video\)=>sum\+\(isWatched\(video\.id\)\?1:0\),0\)/);
  assert.match(media,/const partialIndex=videos\.findIndex\(video=>watchStatus\(video\.id\)==="partial"\)/);
});

test('kişisel kütüphane yarım kalan ve sonra izlenecek videoları ayrı raflarda gösterir',()=>{
  const library=read('src/ui/teachers-v2-library.ts');
  const css=read('src/ui/teachers-v2-library.css');
  assert.match(library,/function recordStatus/);
  assert.match(library,/function statusItems\(status:WatchStatus/);
  assert.match(library,/◐ Yarım kaldı/);
  assert.match(library,/＋ Sonra izle/);
  assert.match(library,/partial=statusItems\("partial"/);
  assert.match(library,/later=statusItems\("later"/);
  assert.match(css,/\.teachers-v2-status-columns/);
});
