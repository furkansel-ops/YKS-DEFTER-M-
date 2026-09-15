const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const media=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-media.ts"),"utf8");
const css=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-media.css"),"utf8");
const app=()=>fs.readFileSync(path.join(root,"app.js"),"utf8");

test("Hocalar v2 izleme durumu mevcut watched ve save hattını kullanır",()=>{
  const source=media();
  assert.match(source,/watchedMap\?\:\(\)=>Record<string,WatchedRecord>/);
  assert.match(source,/legacy\.watchedMap\?\.\(\)/);
  assert.match(source,/legacy\.save\(\)/);
  assert.match(source,/topic:""/);
  assert.match(source,/hoca:String\(media\.name\|\|activeTeacher/);
  assert.doesNotMatch(source,/localStorage\.setItem\(["']yks["']/);
});

test("Hocalar v2 video içi arama ile izlendi ve izlenmedi süzgeçlerini birlikte destekler",()=>{
  const source=media();
  assert.match(source,/id="teachersV2VideoSearch"/);
  assert.match(source,/type FilterKind=.*"watched"\|"unwatched"/);
  assert.match(source,/\['unwatched','İzlenmedi'\]/);
  assert.match(source,/\['watched','İzlendi'\]/);
  assert.match(source,/norm\(\[(?:video|v)\.title,(?:video|v)\.channel/);
  assert.match(source,/updateVideoGrid/);
});

test("Hocalar v2 oynatma ve izlendi işaretini ayrı kullanıcı eylemleri olarak tutar",()=>{
  const source=media();
  assert.match(source,/data-media-action="play"/);
  assert.match(source,/data-media-action="watch"/);
  assert.match(source,/aria-pressed="\$\{seen\?"true":"false"\}"/);
  assert.match(source,/if\(type==="play"\)[\s\S]*?openPlayer/);
  assert.match(source,/if\(type==="watch"\)[\s\S]*?toggleWatched/);
});

test("Hocalar v2 medya cilası tablet dokunma ve azaltılmış hareket durumlarını korur",()=>{
  const style=css();
  assert.match(style,/teachers-v2-video-watch/);
  assert.match(style,/teachers-v2-video-search/);
  assert.match(style,/@media\(pointer:coarse\)/);
  assert.match(style,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(style,/min-height:44px/);
});

test("Hocalar v2 videoları Programım'a gerçek YouTube bağlantısıyla eklenir ve plandan yeniden açılır",()=>{
  const source=media(),legacy=app();
  assert.match(source,/https:\/\/youtu\.be\/\$\{video\.id\}/);
  assert.match(source,/legacy\.openDayPick\(text/);
  assert.match(source,/data-media-action="program"/);
  assert.match(legacy,/function cellLink\(txt\)/);
  assert.match(legacy,/youtu\\\.be\\\/\(\[\\w-\]\{6,\}\)/);
  assert.match(legacy,/function cellOpenLink\(txt\)/);
  assert.match(legacy,/openSingleVideo\(l\.videoId,l\.ad\|\|"Video"\)/);
  assert.match(legacy,/title="Videoyu aç"/);
});

test("Hocalar v2 playlist alanı yalnız gerekli serileri öne çıkarır, geri kalanını aramada tutar",()=>{
  const source=media();
  assert.match(source,/const DEFAULT_PLAYLIST_LIMIT=8/);
  assert.match(source,/function playlistScore/);
  assert.match(source,/rehberlik\|motivasyon\|sarki\|şarkı\|eslesme\|eşleşme\|vlog\|shorts\|korhay/);
  assert.match(source,/id="teachersV2PlaylistSearch"/);
  assert.match(source,/Gerekli seriler önde; diğerleri aramada duruyor/);
  assert.match(source,/playlists\.filter\(item=>norm\(item\.title\)\.includes\(query\)\)/);
  assert.match(source,/ensurePlaylistArchive/);
});

test("Playlist kartına dokununca içerik uygulama içinde açılır ve videolar tek tek Programım'a eklenebilir",()=>{
  const source=media();
  assert.match(source,/function openPlaylistForCurrent/);
  assert.match(source,/data-media-action="playlist-back"/);
  assert.match(source,/teachers-v2-playlist-video-grid/);
  assert.match(source,/videoCards\(media,videos\)/);
  assert.match(source,/youtube-nocookie\.com\/embed\?listType=playlist/);
  assert.match(source,/findVideo\(media,action\.dataset\.videoId/);
  assert.match(source,/addPlanText\(planVideoText\(video\),"Video"\)/);
  assert.match(source,/data-media-action="playlist-program"/);
});
