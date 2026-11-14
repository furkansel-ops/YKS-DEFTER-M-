const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const app=read("app.js");

// app.js'teki v119 işlevleri tek başına çalıştırılır (S, save ve çizim sahte).
function load(S){
  const start=app.indexOf("const REVIEW_GAPS=[3,7,21];"),end=app.indexOf("\n",app.indexOf("function setReviewGaps"));
  assert.ok(start>0&&end>start,"v119 bloğu bulunamadı");
  const calls=[],context={S,calls,perfInvalidateState(){calls.push("invalidate");context.syncReviewGaps();},save(){calls.push("save");},renderAll(){calls.push("render");}};
  vm.createContext(context);
  vm.runInContext(app.slice(start,end)+"\nthis.REVIEW_GAPS=REVIEW_GAPS;this.syncReviewGaps=syncReviewGaps;this.setReviewGaps=setReviewGaps;this.reviewGapsText=reviewGapsText;this.reviewGapsValid=reviewGapsValid;",context);
  return context;
}

test("v119 tekrar aralıkları: geçerli ayar uygulanır, bozuk ayar varsayılana döner, 3 adım sabit",()=>{
  const S={studyPrefs:{autoPlan:false}},c=load(S);
  c.syncReviewGaps();assert.deepEqual([...c.REVIEW_GAPS],[3,7,21]);
  assert.equal(c.setReviewGaps([2,5,14]),true);
  assert.deepEqual([...c.REVIEW_GAPS],[2,5,14]);assert.deepEqual([...S.studyPrefs.reviewGaps],[2,5,14]);
  assert.deepEqual(c.calls,["invalidate","save","render"]);
  assert.equal(c.reviewGapsText(),"2., 5. ve 14. gün");
  for(const bad of [[3,7],[3,7,21,40],[7,3,21],[3,3,21],[0,7,21],[3,7,121],[3,7.5,21],["3","7","21"],null,"3,7,21"]){
    assert.equal(c.setReviewGaps(bad),false,JSON.stringify(bad));
  }
  assert.deepEqual([...S.studyPrefs.reviewGaps],[2,5,14],"geçersiz istek kaydı değiştirmez");
  // Eşitlemeden ya da içe aktarmadan bozuk değer gelirse varsayılan kullanılır, dizi uzunluğu değişmez.
  S.studyPrefs.reviewGaps=[30,10,5];c.syncReviewGaps();assert.deepEqual([...c.REVIEW_GAPS],[3,7,21]);
  c.S=null;c.syncReviewGaps();assert.equal(c.REVIEW_GAPS.length,3);
  const fresh=load({});assert.equal(fresh.setReviewGaps([4,10,30]),true,"studyPrefs yoksa oluşturulur");
});

test("v119 bağlantı: durum her değiştiğinde aralık eşitlenir; Ayarlar kartı app.js doğrulamasını kullanır",()=>{
  const ui=read("src/ui/review-gaps-v119.ts"),shell=read("src/ui/refined-shell.ts");
  assert.match(app,/function perfInvalidateState\(\)\{\n  syncReviewGaps\(\);/);
  assert.match(app,/var S=load\(\);\nsyncReviewGaps\(\);/);
  assert.match(app,/function renderAll\(\)\{\n  syncReviewGaps\(\);/);
  assert.match(app,/function reviewQueue\(\)\{\n  syncReviewGaps\(\);/);
  assert.doesNotMatch(app,/3\., 7\. ve 21\. gün (planı|tekrarları)/,"sabit yazı kalmadı");
  assert.match(shell,/try\{installReviewGapsV119\(\);\}catch/);
  assert.match(ui,/L\.setReviewGaps as \(g:number\[\]\)=>boolean\)\(values\)/);
  assert.match(ui,/anchor\.before\(card\)/);
  assert.match(ui,/min="1" max="120"/);
});
