const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const css=read("src/ui/type-v102.css");

test("v102 tüm uygulama Plus Jakarta Sans; internet yoksa telefonun yazısı",()=>{
  assert.match(read("index.html"),/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans:wght@400;500;600;700;800&amp;display=swap/);
  assert.match(css,/--font:"Plus Jakarta Sans",-apple-system,/);
  assert.match(read("src/main.ts"),/import "\.\/ui\/glassy-v99\.css";\nimport "\.\/ui\/type-v102\.css";/);
});

test("v102 simgeler maskeyle çizilir; sözde öğeler :is() içinde değil (geçersiz kural düşerdi)",()=>{
  assert.doesNotMatch(css,/:is\([^)]*::(before|after)/);
  assert.match(css,/-webkit-mask:var\(--i102\) center\/contain no-repeat;mask:var\(--i102\) center\/contain no-repeat/);
  for(const name of ["chev","out","moon","play","done","check","timer","plus","chat","cal","trophy"])assert.ok(css.includes("--i102-"+name+':url("data:image/svg+xml,'),name);
  for(const used of css.match(/var\(--i102-[a-z]+\)/g)||[])assert.ok(css.includes(used.slice(4,-1)+":url("),"tanımsız simge: "+used);
});

test("v102 metinlerdeki karakter simgeler kalktı; logo mor kutu, arama çizgi simge",()=>{
  assert.doesNotMatch(read("src/ui/today-v101.ts"),/"K"|Aç ›|＋ Soru|"✓ "/);
  assert.match(read("src/ui/study-gamification.ts"),/"sg-today-shortcut-title","YKS Kariyerim"/);
  assert.match(read("src/ui/refined-shell.ts"),/<span class="rb-logo" aria-hidden="true"><svg/);
  assert.match(read("index.html"),/aria-label="Uygulamada ara"><svg class="v102-ic"/);
});
