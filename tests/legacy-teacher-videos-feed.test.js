const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const source=()=>fs.readFileSync(path.join(root,"public/teacher-videos.js"),"utf8");

test("legacy Hocalar kartları önce korunmuş canlı medya feedini kullanır",()=>{
  const s=source();
  assert.match(s,/teachers-v2-feed\.json/);
  assert.match(s,/yks_teachers_v2_media_cache/);
  assert.match(s,/async function feedVideos\(teacher,force\)/);
  assert.match(s,/row\.archiveIndex/);
  assert.match(s,/var items=await feedVideos\(teacher,!!force\)/);
  const start=s.indexOf("async function fetchTeacherVideos");
  const end=s.indexOf("\n  function closePlayer",start);
  const block=s.slice(start,end);
  assert.ok(block.indexOf("feedVideos(teacher,!!force)")<block.indexOf("nativeVideos(teacher,subject,query)"));
  assert.ok(block.indexOf("nativeVideos(teacher,subject,query)")<block.indexOf("fetchViaPiped(query)"));
});

test("legacy Hocalar feed videosunu eski kart biçimine dönüştürür",()=>{
  const s=source();
  assert.match(s,/function normalizeFeedVideo/);
  assert.match(s,/item\.thumbnail/);
  assert.match(s,/item\.channel/);
  assert.match(s,/\.slice\(0,6\)/);
});


test("legacy Hocalar TYT AYT soru ve deneme seçimlerinde önce oynatma listelerini gösterir",()=>{
  const s=source();
  assert.match(s,/async function feedPlaylists\(teacher,force\)/);
  assert.match(s,/function kindWords\(kind\)/);
  assert.match(s,/tyt:\["tyt"\]/);
  assert.match(s,/ayt:\["ayt"\]/);
  assert.match(s,/deneme:\["deneme","branş","brans"\]/);
  assert.match(s,/async function showKind\(host,kind,force\)/);
  assert.match(s,/renderPlaylists\(host,lists,kind\)/);
  assert.match(s,/window\.ytTeacher=function\(name,kind,subject\)/);
  assert.match(s,/if\(kind==="kanal"\)/);
  assert.match(s,/void showKind\(host,kind,false\)/);
});

test("legacy Hocalar oynatma listesine dokununca uygulama içi playlist oynatıcısını kullanır",()=>{
  const s=source();
  assert.match(s,/window\.openPlaylistResource/);
  assert.match(s,/Oynatma listesi · uygulama içinde aç/);
  assert.match(s,/Yukarıdan TYT konu, AYT konu, Soru çözümü veya Deneme \/ branş seç/);
  assert.match(s,/teacherVideosRuntimeVersion="r13-playlists"/);
});
