const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("V7 Bugün ekranı eski Home DOM'unu gizli veri köprüsüne taşır",()=>{
  const source=read("src/ui/today-v43.ts");
  assert.match(source,/className="v7-home-legacy"/);
  assert.match(source,/bridge\.hidden=true/);
  assert.match(source,/while\(home\.firstChild\)bridge\.appendChild\(home\.firstChild\)/);
  assert.match(source,/data-v7-home-view|v7HomeView/);
  assert.match(source,/home\.append\(shell,createNotes\(\)\)/);
});

test("V7 görünen ekran yalnız yeni şablon bloklarından oluşur",()=>{
  const source=read("src/ui/today-v43.ts");
  for(const token of ["v7-home-header","v7-goal","v7-program","v7-quick","v7-countdown","v7-note-overlay"]){
    assert.match(source,new RegExp(token));
  }
  assert.match(source,/Bugün ne yapıyorum\?/);
  assert.match(source,/Programım/);
  assert.match(source,/Notlarım/);
  assert.match(source,/İstatistik/);
});

test("V7 program görünümü legacy çalışan planı aynalar ve tıklamayı ona yollar",()=>{
  const source=read("src/ui/today-v43.ts");
  assert.match(source,/legacy\.querySelectorAll<HTMLElement>\("\.plancell"\)/);
  assert.match(source,/rows\[index\]\?\.click\(\)/);
  assert.match(source,/legacyDone\?\.click\(\)/);
  assert.match(source,/MutationObserver/);
  assert.match(source,/yks:data-changed/);
});

test("V7 Bugün veriyi doğrudan yazmaz, mevcut save ve senkron hattını korur",()=>{
  const source=read("src/ui/today-v43.ts");
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\.open|new\s+Dexie|setDoc|updateDoc|coachingShares/);
  assert.doesNotMatch(source,/YKSLegacyState.*save/);
  assert.doesNotMatch(source,/renderTodayPlan\s*=/);
  assert.match(source,/saveJournal\?\.\(\)/);
});

test("V7 mobil görünüm yalnız Bugün ekranında app shell'i değiştirir",()=>{
  const css=read("src/ui/today-v43.css");
  assert.match(css,/#home\.v7-home>/);
  assert.match(css,/\.v7-home-legacy\[hidden\]\{display:none!important;\}/);
  assert.match(css,/html\[data-active-screen="home"\] \.tabbar/);
  assert.match(css,/body:has\(#home\.active\) \.tabbar/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});

test("V7 güvenli Today runtime üzerinden yüklenir",()=>{
  const main=read("src/main.ts");
  const safe=read("src/ui/v43-safe-runtime.ts");
  assert.match(main,/installV43SafeRuntime/);
  assert.match(safe,/import\("\.\/today-v43"\)/);
  assert.match(safe,/installTodayV43/);
});
