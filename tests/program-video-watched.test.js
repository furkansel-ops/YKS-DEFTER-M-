const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const src=read("src/ui/refined-program.ts");

test("video izlendi kaydı görev metnine ve koç senkronuna yazılmaz; ayrı cihaz kaydıdır",()=>{
  assert.match(src,/const VIDEO_WATCH_KEY="yks_program_video_watched_v1"/);
  assert.match(src,/map\[`\$\{week\}\|\$\{taskId\}\|\$\{url\}`\]=at/);
  const mark=src.slice(src.indexOf("export function refinedProgramMarkVideoWatched"),src.indexOf("const clockOf"));
  assert.doesNotMatch(mark,/programUpdateTask|programEditTask|save\(|S\.weeks|coaching/);
  assert.match(mark,/slice\(0,300\)/);
});

test("video açılınca işaretlenir; dönüşte görev açıksa soru gösterilir, onaysız tamamlanmaz",()=>{
  const click=src.slice(src.indexOf('detailVideo.addEventListener("click"'),src.indexOf('askDone.addEventListener'));
  assert.match(click,/refinedProgramMarkVideoWatched\(detailWeek,detailTaskId,detailUrl\)/);
  assert.match(click,/waitForVideoReturn\(detailTaskId,detailWeek\)/);
  assert.doesNotMatch(click,/toggleTask/);
  const wait=src.slice(src.indexOf("const waitForVideoReturn"),src.indexOf('detailVideo.addEventListener("click"'));
  assert.match(wait,/elapsed<2500\|\|document\.hidden\|\|videoOverlayOpen\(\)/);
  assert.match(wait,/if\(!current\|\|current\.done\)return;/);
  assert.match(wait,/detailAsk\.hidden=false/);
  assert.match(src,/askDone\.addEventListener\("click",\(\)=>\{detailAsk\.hidden=true;detailDone\.click\(\);\}\)/);
});

test("listede izlenen video çipi yeşil 'İzlendi' olur; stiller temadan türetilir",()=>{
  assert.match(src,/watchedAt\?"▶ İzlendi":"▶ Video"/);
  const css=read("src/ui/refined-program-v4.css");
  assert.match(css,/\.rb-v4-chip-video\.rb-v4-chip-watched\{background:color-mix\(in srgb,var\(--success/);
  assert.match(css,/\.rb-program-detail-ask\[hidden\]\{display:none\}/);
});
