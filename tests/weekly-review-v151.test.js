const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;

test("v151 hafta penceresi, temizleme ve 8 hafta budama",()=>{
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",[
    'import assert from "node:assert/strict";',
    `import {reviewWeekFor,cleanReview,withReview,REVIEW_MAX} from "${url("src/domain/weekly-review.ts")}";`,
    'assert.equal(REVIEW_MAX,300);',
    'assert.equal(reviewWeekFor(new Date(2026,10,29,17,59)),null,"Pazar 17:59 kapalı");',
    'assert.equal(reviewWeekFor(new Date(2026,10,29,18,0)),"2026-11-23","Pazar 18:00 bu hafta");',
    'assert.equal(reviewWeekFor(new Date(2026,10,30,23,59)),"2026-11-23","Pazartesi geçen hafta");',
    'assert.equal(reviewWeekFor(new Date(2026,11,1,9,0)),null,"Salı kapalı");',
    'assert.equal(reviewWeekFor(new Date(2026,10,28,20,0)),null,"Cumartesi kapalı");',
    'assert.equal(reviewWeekFor(new Date(2027,0,3,20,0)),"2026-12-28","yıl geçişi");',
    'assert.deepEqual(cleanReview({good:"  iyi ",hard:"",focus:"x".repeat(400)},5),{good:"iyi",hard:"",focus:"x".repeat(300),at:5});',
    'assert.equal(cleanReview({good:"   ",hard:null,focus:undefined},1),null,"yalnız boşluk boş sayılır");',
    'assert.equal(cleanReview({},1),null);',
    'const many={};for(let i=0;i<9;i++)many["2026-0"+(1+i)+"-05"]={good:"g",hard:"",focus:"",at:i};',
    'const out=withReview(many,"2026-11-23",{good:"yeni",hard:"",focus:"",at:99});',
    'assert.equal(Object.keys(out).length,8);assert.equal(out["2026-11-23"].good,"yeni");',
    'assert.equal(out["2026-01-05"],undefined,"en eski düşer");assert.equal(out["2026-02-05"],undefined);',
    'for(const bad of [null,[],"x",5])assert.deepEqual(Object.keys(withReview(bad,"2026-11-23",{good:"a",hard:"",focus:"",at:1})),["2026-11-23"],"bozuk girdi boş harita");',
    'assert.deepEqual(Object.keys(withReview({"bozuk":{good:"a"},"2026-11-16":{good:"b",hard:"",focus:"",at:1}},"2026-11-23",{good:"c",hard:"",focus:"",at:2})),["2026-11-16","2026-11-23"],"geçersiz anahtar atılır");'
  ].join("\n")],{encoding:"utf8"});
  assert.equal(result.status,0,result.stderr||result.stdout);
});

test("v151 kart Bugün'e girer; yalnız pencere açıkken ve o hafta cevaplanmamışken görünür",()=>{
  const ui=read("src/ui/weekly-review-v151.ts"),shell=read("src/ui/refined-shell.ts"),css=read("src/ui/weekly-review-v151.css");
  assert.match(ui,/reviewWeekFor\(new Date\(\)\)/);
  assert.match(ui,/querySelector\("#todayFreshStart \.today-fresh-tasks"\)/);
  assert.match(ui,/tasks\.insertBefore\(card,tasks\.firstChild\)/,"kart program bölümünün içinde, başlığın üstünde");
  assert.match(ui,/FIELDS\.map\(\(\[key,label\]\)=>`<label class="wr151-field"><span>\$\{label\}<\/span><textarea data-wr151="\$\{key\}" rows="2" maxlength="\$\{REVIEW_MAX\}">/);
  assert.match(ui,/const FIELDS=\[\["good","Ne iyi gitti\?"\],\["hard","Ne zorladı\?"\],\["focus","Gelecek hafta odak\?"\]\]/,"üç soru");
  assert.match(ui,/!L\.YKSLegacyState\?\.readState/,"veri hazır değilken kart çizilmez");
  for(const label of ["Ne iyi gitti?","Ne zorladı?","Gelecek hafta odak?","Gönder","Bu hafta geç","Haftanı değerlendir"])assert.ok(ui.includes(label),label);
  assert.match(ui,/send\.disabled=!cleanReview\(/,"hepsi boşken Gönder kapalı");
  assert.match(ui,/skipped:true/);
  assert.match(ui,/L\.YKSLegacyState\?\.save\?\.\(\)/);
  assert.match(ui,/Değerlendirmen koçuna gönderildi ✓/);
  assert.match(ui,/visibilitychange/);
  assert.match(shell,/try\{installWeeklyReviewV151\(\);\}catch\(error\)\{console\.error\("v151 haftalık değerlendirme",error\);\}/);
  assert.doesNotMatch(css,/#[0-9a-fA-F]{3,8}\b/,"renkler tema değişkeninden");
});
