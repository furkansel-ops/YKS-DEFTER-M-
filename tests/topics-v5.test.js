const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");

test("Konular V5 tüm ana içerikleri yeni hiyerarşide korur",()=>{
  const source=read("src/ui/topics-v5.ts");
  const html=read("index.html");
  for(const id of ["topicSearch","v26TopicOverview","v4TopicGoals","v26TopicAttention","curBox","reviewBox","subjectList","fh_kaynak","fh_hedef"])assert.match(html,new RegExp('id="'+id+'"'));
  for(const marker of ["v5TopicsHeader","v5TopicsOverview","v5TopicsReviewGrid","v5TopicsCatalog","v5TopicsSecondary"])assert.match(source,new RegExp(marker));
});
test("Konular V5 legacy konu veri akışına yazmaz",()=>{
  const source=read("src/ui/topics-v5.ts");
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\.open|new\s+Dexie|setDoc|updateDoc|\.topics\s*\[/);
});
test("Konular V5 mevcut lazy overview chunk içinden yüklenir",()=>{
  const overview=read("src/ui/topics-overview-v45.ts");
  assert.match(overview,/import \{installTopicsV5\} from "\.\/topics-v5"/);
  assert.match(overview,/installTopicsV5\(\)/);
});
test("Konular V5 mobil ve reduced-motion desteği içerir",()=>{
  const css=read("src/ui/topics-v5.css");
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
