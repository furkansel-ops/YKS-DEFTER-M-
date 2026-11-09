"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v100 menü 5 başlık: Bugün, Program, Çalış, Gelişim, Ben; Konular/İlerleme/P&P alt ekran",()=>{
  const css=read("src/ui/nav-v100.css"),shell=read("src/ui/refined-shell.ts"),main=read("src/main.ts");
  assert.match(css,/\.tab:is\(\[data-s="topics"\],\[data-s="progress"\],\[data-s="pp"\]\)\{display:none\}/);
  assert.match(css,/\.tab\[data-s="pomo"\]\{display:flex\}/,"Odak telefonda da menüde");
  const order=["home","program","pomo","deneme","more"].map(s=>Number(css.match(new RegExp('data-s="'+s+'"\\]\\{order:(\\d)\\}'))?.[1]));
  assert.deepEqual(order,[1,2,3,4,5]);
  assert.match(shell,/PARENT:Record<string,string>=\{topics:"deneme",progress:"deneme",pp:"pomo"\}/);
  assert.match(shell,/LABELS:Record<string,string>=\{pomo:"Çalış",deneme:"Gelişim"\}/);
  assert.match(shell,/back\.textContent="‹ Çalış"/);
  assert.ok(main.indexOf('import "./ui/nav-v100.css"')>main.indexOf('import "./ui/responsive-v67.css"'));
});

test("v100 Gelişim şeridi ekranların dışında tek şerit; yalnız Denemeler/Konular/İstatistik'te görünür",()=>{
  const shell=read("src/ui/refined-shell.ts"),css=read("src/ui/nav-v100.css");
  assert.match(shell,/GROWTH[^=]*=\[\["deneme","Denemeler"\],\["topics","Konular"\],\["progress","İstatistik"\]\]/);
  assert.match(shell,/getElementById\("mainWrap"\)\?\.prepend\(growth\)/);
  assert.match(shell,/growth\.hidden=!GROWTH\.some/);
  assert.match(css,/\.v100-growth\[hidden\]\{display:none\}/);
});

test("v100 Odak ekranı geri düğmesiz de başlığını alır; odak gözlemcisi aynı metni tekrar yazmaz",()=>{
  const secondary=read("src/ui/refined-secondary.ts"),focus=read("src/ui/focus-refine-v70.ts");
  assert.match(secondary,/if\(back\)back\.insertAdjacentElement\("afterend",title\);else focus\.prepend\(title\)/);
  assert.match(secondary,/\.v100-work/,"Çalış kısayolları katlanan bölüme taşınmaz");
  assert.match(focus,/line\.textContent!==lineText/);assert.match(focus,/sub\.textContent!==subText/);
});
