const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const custom=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-custom-fast.ts"),"utf8");
const patcher=()=>fs.readFileSync(path.join(root,"scripts/patch-teachers-v2-known-custom.mjs"),"utf8");
const restore=()=>fs.readFileSync(path.join(root,"scripts/restore-teachers-v2-live-media.mjs"),"utf8");
const sources=()=>fs.readFileSync(path.join(root,"scripts/teachers-v2-sources.mjs"),"utf8");
const main=()=>fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
const runtimeHardening=()=>fs.readFileSync(path.join(root,"vite.runtime-hardening.mts"),"utf8");
const pkg=()=>fs.readFileSync(path.join(root,"package.json"),"utf8");
const workflow=()=>fs.readFileSync(path.join(root,".github/workflows/deploy-pages.yml"),"utf8");

test("Kendi eklenen hoca arşivi beklemeden hızlı erişim gösterir",()=>{
  const source=custom();
  assert.match(source,/isOwnTeacher/);
  assert.match(source,/!name\|\|!isOwnTeacher\(name\)/);
  assert.match(source,/Kendi hocan · hızlı erişim hazır, arşiv yalnız istersen yüklenir/);
  assert.match(source,/data-custom-fast-url/);
  assert.match(source,/data-media-action="refresh"/);
  assert.match(source,/YKS arşivini yükle/);
  assert.match(source,/youtubeSearchUrl\(name,subject/);
  assert.match(source,/\.teachers-v2-profile \.teachers-v2-subject/);
});

test("Ferrum doğrulanmış kimya kanalıyla doğrudan hızlı erişime bağlanır",()=>{
  const source=custom();
  const feedPatch=patcher(),sourceMap=sources();
  assert.match(source,/ferrum:\{subject:"Kimya",channelId:"UC0yco2kB3xW3WI__8E8HaKw",channelName:"Ferrum"\}/);
  assert.match(sourceMap,/"Ferrum":\{channelId:"UC0yco2kB3xW3WI__8E8HaKw",channelName:"Ferrum"\}/);
  assert.match(feedPatch,/channelSource:teacher\.channelId\?"verified":"verified-handle"/);
});

test("Doğrulanmış hocaların hızlı önizlemesi yt-dlp yerine YouTube RSS kullanır",()=>{
  const source=patcher();
  assert.match(source,/feeds\/videos\.xml\?channel_id=/);
  assert.match(source,/AbortController/);
  assert.match(source,/RSS_TIMEOUT_MS=7000/);
  assert.match(source,/MAX_PREVIEW_VIDEOS=15/);
  assert.match(source,/CONCURRENCY=8/);
  assert.doesNotMatch(source,/spawn\(/);
  assert.doesNotMatch(source,/yt_dlp/);
  assert.match(source,/mevcut seri listesi korundu|ilgili sabit\/eski veri korunuyor/);
});

test("Hoca medya motoru overlay açılışında yalnız hafif önizlemeyi yükler",()=>{
  const hardening=runtimeHardening();
  assert.match(hardening,/async function previewOverlayMedia/);
  assert.match(hardening,/renderMediaSection\(overlay,heading\);void previewOverlayMedia\(overlay,heading,false\)/);
  assert.match(hardening,/medya feedini uygulama başlangıcında indirmeme/);
  assert.match(hardening,/Son videolar yükleniyor/);
  assert.match(hardening,/ağ dönüşünde yalnız açık hoca önizlemesini yenileme/);
  assert.doesNotMatch(hardening,/if\(!ownTeacher\(heading\)\)/);
});

test("Normal kod deploy'u son çalışan Hocalar feed ve arşivini korur",()=>{
  const flow=workflow(),source=restore();
  assert.match(flow,/Son canlı Hocalar medya paketini koru/);
  assert.match(flow,/if: github\.event_name == 'push'/);
  assert.match(flow,/node scripts\/restore-teachers-v2-live-media\.mjs/);
  assert.match(flow,/Hocalar v2 hızlı video önizlemesini hazırla/);
  assert.match(flow,/Hocalar v2 sayfalı tam arşivini yenile[\s\S]*if: github\.event_name != 'push'/);
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

test("Tam Hocalar arşivi yalnız cron veya elle çalıştırmada yenilenir",()=>{
  const flow=workflow();
  const refresh=flow.indexOf("node scripts/refresh-teachers-v2-feed.mjs");
  const fast=flow.indexOf("node scripts/patch-teachers-v2-known-custom.mjs");
  const archive=flow.indexOf("node scripts/build-teachers-v2-archives.mjs");
  assert.ok(refresh>=0&&fast>refresh&&archive>fast);
  assert.match(flow,/Hocalar v2 medya akışını ağdan yenile[\s\S]*if: github\.event_name != 'push'/);
  assert.match(flow,/Hocalar v2 sayfalı tam arşivini yenile[\s\S]*if: github\.event_name != 'push'/);
});
