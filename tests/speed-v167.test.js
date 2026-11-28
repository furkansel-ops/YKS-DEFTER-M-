const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v167 topicKey ezberi Türkçe küçük harfle aynı sonucu verir",()=>{
  const repeat=require("../modules/smart-repeat-v42.js");
  for(let i=0;i<2;i++){
    assert.equal(repeat.topicKey(" TÜRKÇE ","İLK Işık"),"türkçe|ilk ışık");
    assert.equal(repeat.topicKey(null,"I"),"|ı");
  }
  const core=read("modules/study-intelligence-core.js");
  assert.match(core,/function topicKey\(subject,topic\)\{return lowerTr\(escText\(subject\)\)\+"\|"\+lowerTr\(escText\(topic\)\);\}/);
});

test("v167 yıl ısı haritası tek biçimlendirici kullanır, metin aynı kalır",()=>{
  const app=read("app.js");
  assert.match(app,/const V319_HEAT_DATE=new Intl\.DateTimeFormat\("tr-TR",\{day:"numeric",month:"short",year:"numeric"\}\);/);
  assert.doesNotMatch(app,/toLocaleDateString\("tr-TR",\{day:"numeric",month:"short",year:"numeric"\}\)\+" · "\+x\.m/);
  const fmt=new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",year:"numeric"});
  for(const d of [new Date(2026,0,1),new Date(2026,10,28),new Date(2027,5,19)])
    assert.equal(fmt.format(d),d.toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"}));
});

test("v167 analiz aynı veri sürümünde paylaşılır; epoch yoksa (test/eski akış) her seferinde hesaplanır",()=>{
  const src=read("modules/study-intelligence-v5.js");
  assert.match(src,/epoch=globalThis\.__YKS_STATE_EPOCH;if\(epoch!==undefined&&lastAnalysis&&lastAnalysis\.s===s&&lastAnalysis\.td===td&&lastAnalysis\.epoch===epoch\)return lastAnalysis\.a;/);
  const app=read("app.js");
  // Önbellek ancak her kayıt epoch'u artırdığı sürece güvenli.
  assert.match(app,/function save\(\)\{[\s\S]{0,400}perfInvalidateState\(\);/);
  assert.match(app,/function saveSoon\(delay\)\{\n  perfInvalidateState\(\);/);
});

test("v167 boşta döngü yok: aynı metin yeniden yazılmaz, boş deneme analizi kendini tekrar çizmez",()=>{
  const lab=read("modules/learning-lab-v3.js");
  assert.match(lab,/if\(proxy\.textContent!==label\)proxy\.textContent=label;/);
  assert.match(lab,/if\(meta&&meta\.textContent!==metaText\)meta\.textContent=metaText;/);
  const exam=read("modules/exam-analysis-v42.js");
  assert.match(exam,/<div class="empty" data-exam-v42-empty>/);
  assert.equal(exam.split('.v42-exam3-shell,[data-exam-v42-empty]').length-1,2);
});
