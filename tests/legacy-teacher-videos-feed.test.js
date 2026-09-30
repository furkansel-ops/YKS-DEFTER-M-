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
  assert.ok(s.indexOf("feedVideos(teacher,!!force)")<s.indexOf("nativeVideos(teacher,subject,query)"));
  assert.ok(s.indexOf("nativeVideos(teacher,subject,query)")<s.indexOf("fetchViaPiped(query)"));
});

test("legacy Hocalar feed videosunu eski kart biçimine dönüştürür",()=>{
  const s=source();
  assert.match(s,/function normalizeFeedVideo/);
  assert.match(s,/item\.thumbnail/);
  assert.match(s,/item\.channel/);
  assert.match(s,/\.slice\(0,6\)/);
});
