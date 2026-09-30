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
