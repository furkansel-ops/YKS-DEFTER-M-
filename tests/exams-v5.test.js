const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");

test("Denemeler V5 performans merkezi, ekleme, hata defteri ve analiz alanlarını korur",()=>{
  const source=read("src/ui/exams-v5.ts"),html=read("index.html");
  for(const id of ["v315Dashboard","v315ExamFormCard","errorJournal","v27Overview","v27Latest","anp_trend","anp_ders","anp_kar","anp_puan","anp_verim"])assert.match(html,new RegExp('id="'+id+'"'));
  for(const marker of ["v5ExamsHeader","v5ExamsFormHead","v5ExamsLatest","v5ExamsAnalysis"])assert.match(source,new RegExp(marker));
});
test("Denemeler V5 veri hesaplama ve kayıt fonksiyonlarını override etmez",()=>{
  const source=read("src/ui/exams-v5.ts");
  assert.doesNotMatch(source,/addDeneme\s*=|errorJournalAdd\s*=|renderAnaCompare\s*=|setAnaTab\s*=/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)|indexedDB\.open|new\s+Dexie|setDoc|updateDoc/);
});
test("Denemeler V5 mevcut lazy learning-cycle chunk içinden yüklenir",()=>{
  const lazy=read("src/ui/learning-cycle-v43.ts");
  assert.match(lazy,/import \{installExamsV5\} from "\.\/exams-v5"/);
  assert.match(lazy,/installExamsV5\(\)/);
});
test("Denemeler V5 mobil ve reduced-motion desteği içerir",()=>{
  const css=read("src/ui/exams-v5.css");
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
