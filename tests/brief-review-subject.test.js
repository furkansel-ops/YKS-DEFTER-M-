const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const app=fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");

test("günlük özet tekrar listesi ders adını tekrar kuyruğunun subj alanından yazar (undefined yazmaz)",()=>{
  assert.match(app,/out\.push\(\{key:k,gi:gi,gap:gap,due:due,exam:p\[0\],subj:p\[1\],topic:p\[2\]/,"tekrar kuyruğu ders adını subj alanında tutar");
  assert.match(app,/b\.tekrar\.map\(t=>'<div class="dayrow"><span class="k">'\+esc\(\(t\.subj\|\|t\.subject\|\|""\)\+" · "\+t\.topic\)/);
  assert.doesNotMatch(app,/esc\(t\.subject\+" · "\+t\.topic\)/);
});
