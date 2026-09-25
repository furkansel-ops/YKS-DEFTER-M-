const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const custom=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-custom-fast.ts"),"utf8");
const patcher=()=>fs.readFileSync(path.join(root,"scripts/patch-teachers-v2-known-custom.mjs"),"utf8");
const restore=()=>fs.readFileSync(path.join(root,"scripts/restore-teachers-v2-live-media.mjs"),"utf8");
const sources=()=>fs.readFileSync(path.join(root,"scripts/teachers-v2-sources.mjs"),"utf8");
const refresh=()=>fs.readFileSync(path.join(root,"scripts/refresh-teachers-v2-feed.mjs"),"utf8");
const archive=()=>fs.readFileSync(path.join(root,"scripts/build-teachers-v2-archives.mjs"),"utf8");
const main=()=>fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
const runtimeHardening=()=>fs.readFileSync(path.join(root,"vite.runtime-hardening.mts"),"utf8");
const pkg=()=>fs.readFileSync(path.join(root,"package.json"),"utf8");
const workflow=()=>fs.readFileSync(path.join(root,".github/workflows/deploy-pages.yml"),"utf8");

test("Kendi eklenen hoca arşivi beklemeden hızlı erişim gösterir",()=>{
  const source=custom();
  assert.match(source,/isOwnTeacher/);
  assert.match(source,/section\.dataset\.mediaBrowser==="restored"/);
  assert.match(source,/!name\|\|!isOwnTeacher\(name\)/);
  assert.match(source,/Kendi hocan · hızlı erişim hazır, arşiv yalnız istersen yüklenir/);
  assert.match(source,/data-custom-fast-url/);
  assert.match(source,/data-media-action="refresh"/);
  assert.match(source,/YKS arşivini yükle/);
  assert.match(source,/youtubeSearchUrl\(name,subject/);
  assert.match(source,/\.teachers-v2-profile \.teachers-v2-subject/);
});

test("Ferrum doğrulanmış kimya kanalıyla doğrudan hızlı erişime bağlanır",()=>{
  const source=custom(),feedPatch=patcher(),sourceMap=sources();
  assert.match(source,/ferrum:\{subject:"Kimya",channelId:"UC0yco2kB3xW3WI__8E8HaKw",channelName:"Ferrum"\}/);
  assert.match(sourceMap,/"Ferrum":\{channelId:"UC0yco2kB3xW3WI__8E8HaKw",channelName:"Ferrum"\}/);
  assert.match(feedPatch,/channelSource:teacher\.searchOnly\?"verified-shared-search":\(teacher\.channelId\?"verified":"verified-handle"\)/);
});

test("Doğrulanmış hocaların hızlı önizlemesi yt-dlp yerine YouTube RSS kullanır ve ağır sonucu korur",()=>{
  const source=patcher();
  assert.match(source,/feeds\/videos\.xml\?channel_id=/);
  assert.match(source,/AbortController/);
  assert.match(source,/RSS_TIMEOUT_MS=7000/);
  assert.match(source,/MAX_PREVIEW_VIDEOS=15/);
  assert.match(source,/CONCURRENCY=8/);
  assert.doesNotMatch(source,/spawn\(/);
  assert.doesNotMatch(source,/yt_dlp/);
  assert.match(source,/teacher\.searchOnly/);
  assert.match(source,/mergeVideos\(seed,Array\.isArray\(old\.videos\)\?old\.videos:\[\],rss\)/);
  assert.match(source,/tam yenilemede bulunan seri listesi korunuyor/);
  assert.match(source,/function mergePlaylists/);
  assert.match(source,/videos:Array\.isArray\(old\.videos\)\?old\.videos:undefined/);
  assert.match(source,/playlists=mergePlaylists\(playlists,freshPlaylists\)/);
});

test("Ortak kanal hocası odaklı aramayla 15 videoya tamamlanır",()=>{
  const sourceMap=sources(),deep=refresh(),pages=archive();
  assert.match(sourceMap,/"Görkem Şahin · Benim Hocam":\{[^\n]*searchOnly:true[^\n]*queryHint:"Görkem Şahin Kimya"/);
  assert.match(deep,/const MAX_VIDEOS=15/);
  assert.match(deep,/SEARCH_BATCH=24/);
  assert.match(deep,/teacher\.queryHint\|\|teacher\.name/);
  assert.match(deep,/odaklı arama sonucu/);
  assert.match(pages,/ARCHIVE_VIDEO_LIMIT=240/);
  assert.match(pages,/teacher\.queryHint\|\|teacher\.name/);
  assert.match(pages,/teacher\.searchOnly\?"focused-search":"search"/);
  assert.match(pages,/PLAYLIST_PREVIEW_COUNT=10/);
  assert.match(pages,/feeds\/videos\.xml\?playlist_id=/);
  assert.match(pages,/previewSource:"youtube-rss"/);
  assert.match(pages,/listede video önizleme/);
});

test("Geliştirme ve yayın aynı isteğe bağlı medya yükleyicisini kullanır",()=>{
  const hardening=runtimeHardening();
  const source=fs.readFileSync(path.join(root,"src/ui/teachers-v2-media.ts"),"utf8");
  assert.match(hardening,/export \{default\} from "\.\/vite\.config\.mts"/);
  assert.doesNotMatch(hardening,/replaceRequired|hardenTeacherMediaOnDemand/);
  assert.match(source,/async function previewOverlayMedia/);
  assert.match(source,/renderMediaSection\(overlay,heading\);void previewOverlayMedia\(overlay,heading,false\)/);
  assert.match(source,/function install\(\):void\{\s*decorateCards\(\);/);
  assert.match(source,/window\.addEventListener\("online",\(\)=>\{if\(lastOverlay&&activeTeacher/);
});

test("Normal kod deploy'u son çalışan Hocalar feed ve arşivini korur",()=>{
  const flow=workflow(),source=restore();
  assert.match(flow,/Son canlı Hocalar medya paketini koru/);
  assert.match(flow,/if: github\.event_name == 'push'/);
  assert.match(flow,/node scripts\/restore-teachers-v2-live-media\.mjs/);
  assert.match(flow,/Hocalar v2 hızlı video önizlemesini hazırla/);
  assert.match(source,/teachers-v2-feed\.json/);
  assert.match(source,/safeRelative/);
  assert.match(source,/archiveIndex/);
  assert.match(source,/canlı medya korundu/);
});

test("Hızlı katman ağır medya modülünden önce başlatılır",()=>{
  const source=main();
  const fast=source.indexOf('import("./ui/teachers-v2-custom-fast")');
  const media=source.indexOf('import("./ui/teachers-v2-media")');
  assert.ok(fast>=0&&media>=0&&fast<media);
  assert.match(source,/dataset\.teachersV2CustomFast="deferred"/);
  assert.match(pkg(),/vite build --config vite\.runtime-hardening\.mts/);
});

test("Tam Hocalar yenilemesi cron, manuel veya özel bakım merge'inde çalışır",()=>{
  const flow=workflow();
  const refreshPos=flow.indexOf("node scripts/refresh-teachers-v2-feed.mjs");
  const fast=flow.indexOf("node scripts/patch-teachers-v2-known-custom.mjs");
  const archivePos=flow.indexOf("node scripts/build-teachers-v2-archives.mjs");
  assert.ok(refreshPos>=0&&fast>refreshPos&&archivePos>fast);
  assert.match(flow,/\[teachers-full-refresh\]/);
  assert.match(flow,/contains\(github\.event\.head_commit\.message, '\[teachers-full-refresh\]'\)/);
  assert.match(flow,/timeout --signal=TERM --kill-after=5s 240s node scripts\/refresh-teachers-v2-feed\.mjs/);
  assert.match(flow,/timeout-minutes: 30/);
});
