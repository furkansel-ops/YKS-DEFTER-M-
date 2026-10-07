const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('oynatma listesi ilerlemesi mevcut izlendi kayıtlarından hesaplanır',()=>{
  const media=read('src/ui/teachers-v2-media.ts'),css=read('src/ui/teachers-restored.css');
  assert.match(media,/function playlistProgress\(item:MediaPlaylist\)/);
  assert.match(media,/videos\.reduce\(\(sum,video\)=>sum\+\(isWatched\(video\.id\)\?1:0\),0\)/);
  assert.match(media,/function playlistProgressMarkup/);
  assert.match(media,/Sıradaki \$\{progress\.next\}\. video/);
  assert.match(media,/playlistProgressMarkup\(item,true\)/);
  assert.match(media,/playlistProgressMarkup\(item\)/);
  assert.match(css,/\.teachers-v2-playlist-progress/);
  assert.match(css,/transition:width \.18s ease/);
});
