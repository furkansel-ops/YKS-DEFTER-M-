const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const media=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-media.ts"),"utf8");
const css=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-media.css"),"utf8");

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
