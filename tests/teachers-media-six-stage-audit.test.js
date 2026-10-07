const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('six-stage media controls remain compatible across refined and legacy themes',()=>{
  const media=read('src/ui/teachers-v2-media.ts');
  const mediaCss=read('src/ui/teachers-v2-media.css');
  const libraryCss=read('src/ui/teachers-v2-library.css');

  assert.match(media,/function playlistProgress\(item:MediaPlaylist\)/);
  assert.match(media,/type WatchStatus="watched"\|"partial"\|"later"/);
  assert.match(media,/id="teachersV2PlaylistVideoSearch"/);
  assert.match(media,/activePlaylistId=id;playlistVideoQuery=""/);
  assert.match(media,/playlist-back"\)\{activePlaylistId="";playlistVideoQuery=""/);

  assert.match(mediaCss,/\.teachers-v2-video-card>\.teachers-v2-video-plan\{position:static!important;inset:auto!important/);
  assert.match(mediaCss,/\.teachers-v2-video-status button\{position:static!important;inset:auto!important/);
  assert.match(libraryCss,/\.teachers-v2-video-card>\.teachers-v2-video-save\{position:static!important;inset:auto!important/);
});

test('legacy watched records still count as watched while partial/later never complete playlist progress',()=>{
  const media=read('src/ui/teachers-v2-media.ts');
  assert.match(media,/record\.status==="partial"\|\|record\.status==="later"\|\|record\.status==="watched"\?record\.status:"watched"/);
  assert.match(media,/function isWatched\(videoId:string\):boolean\{return watchStatus\(videoId\)==="watched";\}/);
  assert.match(media,/const partialIndex=videos\.findIndex\(video=>watchStatus\(video\.id\)==="partial"\)/);
});
