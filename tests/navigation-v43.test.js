const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3 Merkez bilgi mimarisi dört net kategoriye ayrılır",()=>{
  const ui=read("src/ui/navigation-v43.ts");
  for(const id of ['id:"learning"','id:"analysis"','id:"settings"','id:"system"'])assert.match(ui,new RegExp(id.replace(/[".]/g,"\\$&")));
  for(const label of ["Öğrenme","Analiz","Ayarlar","Veri & Sistem"])assert.match(ui,new RegExp(label.replace(/[&]/g,"\\&")));
  assert.match(ui,/querySelectorAll<HTMLElement>\("\[data-v43-more-category\]"\)\.length!==4/);
});

test("Merkez mevcut v30Action alt sayfalarını korur ve Analiz Merkezi için ayrı İlerleme ekranını kullanır",()=>{
  const ui=read("src/ui/navigation-v43.ts");
  assert.match(ui,/legacy\(\)\.v30Action\?\.\(action\)/);
  assert.match(ui,/action==="progress"/);
  assert.match(ui,/legacy\(\)\.go\?\.\("progress"\)/);
  for(const action of ["lab","resources","tactics","archive","success","reports","settings","about","data","system","backup","log"])assert.match(ui,new RegExp(`action:\\"${action}\\"`));
});

test("Daha navigasyonu Merkez olarak sadeleşir ve eski kalabalık kartlar yalnız görünümde gizlenir",()=>{
  const ui=read("src/ui/navigation-v43.ts"),css=read("src/ui/navigation-v43.css");
  assert.match(ui,/textContent="Merkez"/);assert.match(ui,/setAttribute\("aria-label","Merkez"\)/);
  assert.match(ui,/v43LegacyHidden/);assert.match(ui,/v30-menu-grid/);assert.match(ui,/v30QuickGrid/);
  assert.match(css,/v43-more-categories/);assert.match(css,/grid-template-columns:repeat\(4/);assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
});

test("v4.3 navigasyon katmanı bootstrapa bağlıdır ve Program/veri durumuna yazmaz",()=>{
  const ui=read("src/ui/navigation-v43.ts"),main=read("src/main.ts");
  assert.match(main,/installNavigationV43/);assert.match(main,/v43Navigation/);assert.match(main,/v43NavigationErrors/);
  assert.doesNotMatch(ui,/\blocalStorage\b/);assert.doesNotMatch(ui,/\bsave\s*\(/);assert.doesNotMatch(ui,/\bDexie\b/);assert.doesNotMatch(ui,/\bFirebase\b/);assert.doesNotMatch(ui,/\.weeks\s*\[/);assert.doesNotMatch(ui,/\.rows\s*\[/);
});
