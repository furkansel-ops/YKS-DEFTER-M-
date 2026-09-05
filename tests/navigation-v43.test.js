const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3 Merkez bilgi mimarisi dört net kategoriye ayrılır",()=>{
  const ui=read("src/ui/navigation-v43.ts");
  for(const id of ['id:"learning"','id:"analysis"','id:"settings"','id:"system"'])assert.ok(ui.includes(id));
  for(const label of ["Öğrenme","Analiz","Ayarlar","Veri & Sistem"])assert.ok(ui.includes(label));
  assert.ok(ui.includes('document.querySelectorAll("[data-v43-more-category]").length!==4'));
});

test("Merkez mevcut v30Action alt sayfalarını korur ve Analiz Merkezi için ayrı İlerleme ekranını kullanır",()=>{
  const ui=read("src/ui/navigation-v43.ts");
  assert.match(ui,/legacy\(\)\.v30Action\?\.\(action\)/);
  assert.match(ui,/action==="progress"/);
  assert.match(ui,/legacy\(\)\.go\?\.\("progress"\)/);
  assert.match(ui,/legacy\(\)\.go\?\.\("deneme"\)/);
  assert.match(ui,/legacy\(\)\.go\?\.\("pp"\)/);
  for(const label of ["Denemeler","Paragraf & Problem"])assert.ok(ui.includes(label));
  for(const action of ["lab","resources","tactics","archive","success","reports","settings","about","data","system","backup","log"])assert.ok(ui.includes(`action:"${action}"`));
});

test("telefon kabuğu beş ana sekme, güvenli alan ve tek aktif ekran sözleşmesini korur",()=>{
  const ui=read("src/ui/navigation-v43.ts"),css=read("src/ui/mobile-app-shell.css"),main=read("src/main.ts");
  assert.match(main,/import "\.\/ui\/mobile-app-shell\.css"/);
  assert.match(css,/@media \(max-width:760px\)/);
  assert.match(css,/grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
  for(const screen of ["deneme","progress","pp"])assert.ok(css.includes(`data-s="${screen}"`));
  assert.match(css,/\.screen:not\(\.active\)/);
  assert.match(css,/display:none!important/);
  assert.match(css,/safe-area-inset-top/);
  assert.match(css,/safe-area-inset-bottom/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/input:not\(\[type="checkbox"\]\):not\(\[type="radio"\]\)/);
  assert.match(css,/input:is\(\[type="checkbox"\],\[type="radio"\]\)[\s\S]*min-height:20px/);
  assert.match(css,/pointer:coarse/);
  assert.match(ui,/SECONDARY_MOBILE_ROUTES/);
  assert.match(ui,/aria-current/);
});

test("Daha navigasyonu Merkez olarak sadeleşir ve eski kalabalık kartlar yalnız görünümde gizlenir",()=>{
  const ui=read("src/ui/navigation-v43.ts"),css=read("src/ui/navigation-v43.css");
  assert.match(ui,/textContent="Merkez"/);assert.match(ui,/setAttribute\("aria-label","Merkez"\)/);
  assert.match(ui,/v43LegacyHidden/);assert.match(ui,/v30-menu-grid/);assert.match(ui,/v30QuickGrid/);
  assert.match(css,/v43-more-categories/);assert.match(css,/grid-template-columns:repeat\(4/);assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
});

test("Merkez yalnız ilgili ekran olaylarında yenilenir; tüm document ağacını gözlemez",()=>{
  const ui=read("src/ui/navigation-v43.ts");
  assert.match(ui,/label&&label\.textContent!=="Merkez"/);
  assert.match(ui,/back\.textContent!=="‹ Merkez"/);
  assert.match(ui,/title\.textContent!=="Merkez"/);
  assert.match(ui,/detail\?\.to==="more"/);
  assert.match(ui,/detail\?\.to==="home"/);
  assert.doesNotMatch(ui,/new MutationObserver/);
  assert.doesNotMatch(ui,/observer\.observe\(document\.documentElement/);
});

test("v4.3 navigasyon katmanı güvenli runtime'a bağlıdır ve Program/veri durumuna yazmaz",()=>{
  const ui=read("src/ui/navigation-v43.ts"),main=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts");
  assert.match(main,/installV43SafeRuntime/);assert.doesNotMatch(main,/from "\.\/ui\/navigation-v43"/);
  assert.match(safe,/import\("\.\/navigation-v43"\)/);assert.match(safe,/installNavigationV43/);assert.match(safe,/v43Navigation/);assert.match(safe,/v43NavigationErrors/);
  assert.doesNotMatch(ui,/\blocalStorage\b/);assert.doesNotMatch(ui,/\bsave\s*\(/);assert.doesNotMatch(ui,/\bDexie\b/);assert.doesNotMatch(ui,/\bFirebase\b/);assert.doesNotMatch(ui,/\.weeks\s*\[/);assert.doesNotMatch(ui,/\.rows\s*\[/);
});
