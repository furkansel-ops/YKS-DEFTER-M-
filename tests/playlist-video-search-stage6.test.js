const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('açık playlist içinde video adı veya konu metni aranabilir',()=>{
  const media=read('src/ui/teachers-v2-media.ts');
  const css=read('src/ui/teachers-v2-media.css');
  assert.match(media,/let playlistVideoQuery=""/);
  assert.match(media,/id="teachersV2PlaylistVideoSearch"/);
  assert.match(media,/Bu playlistte video ara/);
  assert.match(media,/const query=norm\(playlistVideoQuery\),matches=query\?videos\.filter/);
  assert.match(media,/id="teachersV2PlaylistVideoResult"/);
  assert.match(media,/id="teachersV2PlaylistVideoMatches"/);
  assert.match(media,/matches\.length\} \/ \$\{videos\.length\} video/);
  assert.match(media,/playlistVideoQuery=playlistVideoSearch\.value/);
  assert.match(css,/\.teachers-v2-playlist-video-search-row/);
  assert.match(css,/\.teachers-v2-playlist-video-search/);
});

test('playlist içi arama durum değiştirirken ve oynatırken video kimliğini korur',()=>{
  const media=read('src/ui/teachers-v2-media.ts');
  assert.match(media,/videoCards\(media,matches\)/);
  assert.match(media,/findVideo\(media,action\.dataset\.videoId/);
  assert.match(media,/data-media-action="status"/);
  assert.match(media,/data-media-action="play"/);
  assert.match(media,/activePlaylistId=id;playlistVideoQuery=""/);
  assert.match(media,/playlist-back"\)\{activePlaylistId="";playlistVideoQuery=""/);
});
