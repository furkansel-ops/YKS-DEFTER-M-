const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const mod=fs.readFileSync(path.join(root,"modules/error-journal.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");

test("Hata Defteri v2 deneme analizinden tek işlemle kayıt alır",()=>{
  assert.match(mod,/window\.anaAdd=fn/);
  assert.match(mod,/Deneme analizinden aktarıldı/);
  assert.match(mod,/sourceRef="wrong:"/);
  assert.match(mod,/review:true/);
  assert.match(html,/id="anaKind"/);
});

test("Hata Defteri tekrarı konu ilerlemesine dokunmadan ayrı kapanır",()=>{
  assert.match(mod,/window\.errorJournalReviewDone/);
  assert.match(mod,/closedBy="review-done"/);
  assert.doesNotMatch(mod,/errorJournalReviewDone[\s\S]{0,500}(?:tsetStatus|doReview)\(/);
  assert.match(mod,/Hata Defteri tekrarı · programı değiştirmez/);
});

test("çözülen hata tekrar görevini kapatır ve yeniden açma kontrollüdür",()=>{
  assert.match(mod,/closeReviewFor\(x,"journal-resolved"\)/);
  assert.match(mod,/reopenReviewFor\(x\)/);
  assert.match(mod,/r\.closedBy==="journal-resolved"/);
});

test("tekrar eden konu ve müfredat bağlantısı görünür",()=>{
  assert.match(mod,/function topicStats/);
  assert.match(mod,/en çok tekrarlanan konu/);
  assert.match(mod,/window\.errorJournalOpenTopic/);
  assert.match(mod,/topicKeyOf/);
  assert.match(mod,/openTopicDetail/);
});

test("Hata Defteri tekrarları Konular ve Bugün ekranlarına eklenir",()=>{
  assert.match(mod,/function appendManualTopicReviews/);
  assert.match(mod,/function appendManualTodayReviews/);
  assert.match(mod,/todayHubReview/);
  assert.match(mod,/wrap\("renderReviewQueue"/);
  assert.match(mod,/wrap\("renderV25Today"/);
});
