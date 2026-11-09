const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Merkez sekmesiz: araçlar tek kaydırmada üç grupta, Ayarlar tekrarı yok",()=>{
  const ui=read("src/ui/navigation-v43.ts");
  for(const id of ['id:"learning"','id:"analysis"','id:"system"'])assert.ok(ui.includes(id));
  for(const label of ["Öğrenme","Analiz ve geçmiş","Uygulama"])assert.ok(ui.includes(label));
  assert.ok(ui.includes('document.querySelectorAll("[data-v43-more-group]").length!==3'));
  assert.doesNotMatch(ui,/data-v43-more-category|v43-more-categories|v43-more-settings/);
  // Kayıt araması üstte görünür; kısayollar 4 tane.
  assert.match(ui,/v43MoreSearchSlot/);
  assert.match(ui,/label:"Yanlış arşivi"/);
  assert.match(ui,/id="v43MoreSync" role="status"/,"eski yedek notu yerine gerçek eşitleme satırı");
});

test("Merkez mevcut v30Action alt sayfalarını korur ve Analiz Merkezi için ayrı İlerleme ekranını kullanır",()=>{
  const ui=read("src/ui/navigation-v43.ts");
  assert.match(ui,/legacy\(\)\.v30Action\?\.\(action\)/);
  assert.match(ui,/action==="progress"/);
  assert.match(ui,/legacy\(\)\.go\?\.\("progress"\)/);
  for(const action of ["lab","tactics","archive","success","reports","settings","about","log"])assert.ok(ui.includes(`action:"${action}"`));
});

test("Daha navigasyonu Merkez olarak sadeleşir ve eski kalabalık kartlar yalnız görünümde gizlenir",()=>{
  const ui=read("src/ui/navigation-v43.ts"),css=read("src/ui/navigation-v43.css");
  // v100: Merkez yeni haritada "Ben" adını aldı.
  assert.match(ui,/textContent="Ben"/);assert.match(ui,/setAttribute\("aria-label","Ben"\)/);
  assert.match(ui,/v43LegacyHidden/);assert.match(ui,/v30-menu-grid/);assert.match(ui,/v30QuickGrid/);
  assert.match(css,/v43-more-group-label/);assert.match(css,/\.v43-more-shortcuts\{display:grid;grid-template-columns:repeat\(4/);assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
});

test("Merkez yalnız ilgili ekran olaylarında yenilenir; tüm document ağacını gözlemez",()=>{
  const ui=read("src/ui/navigation-v43.ts");
  assert.match(ui,/label&&label\.textContent!=="Ben"/);
  assert.match(ui,/back\.textContent!=="‹ Ben"/);
  assert.match(ui,/title\.textContent!=="Ben"/);
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

test("v76 Merkez 7 giriş (v89: +Kitaplarım = 8): veri, yedek, sistem ve kaynaklar menüden kalkar; eski bağlantılar yeni yerine gider",()=>{
  const ui=read("src/ui/navigation-v43.ts"),css=read("src/ui/navigation-v43.css");
  const groups=ui.slice(ui.indexOf("const GROUPS"),ui.indexOf("const REMOVED_ACTIONS"));
  assert.equal((groups.match(/\{action:"/g)||[]).length,8);
  for(const action of ["data","backup","system","resources"])assert.doesNotMatch(groups,new RegExp(`action:"${action}"`),action);
  assert.match(ui,/if\(action==="data"\|\|action==="backup"\)\{exportAll\(\);return;\}/);
  assert.match(ui,/if\(action==="system"\)return original\("about"\);/);
  assert.match(ui,/if\(action==="resources"\)\{w\.go\?\.\("topics"\);return;\}/);
  assert.match(ui,/if\(action==="archive"\)\{openPhotos\(\);return;\}/);
  assert.match(ui,/const kept=quick\(\)\.filter\(item=>!REMOVED_ACTIONS\.has\(item\.k\)\)/,"kişisel kısayollarda kalkan bölüm görünmez");
  assert.match(ui,/return kept\.slice\(0,4\);/,"kısayol sayısı 4 kalır");
  assert.match(css,/\.v76-hidden\{display:none!important\}/);
});

test("v76 Raporlar sayfası: ay raporu, retrospektif ve günlük kalır; yedek, sistem ve ham veri gizlenir; kurulum Hakkında'ya",()=>{
  const ui=read("src/ui/navigation-v43.ts"),html=read("index.html");
  assert.match(ui,/const REPORT_HIDDEN=\["v322ExportCenter","abBox","consBox","infraBox","dataBox"\];/);
  for(const id of ["monthReportBox","retroBox","logBox"])assert.ok(html.includes(`id="${id}"`)&&!ui.includes(`"${id}"`),id+" gizlenmez");
  assert.match(ui,/title\.textContent="Raporlar & geçmiş"/);
  assert.match(ui,/const pwa=document\.getElementById\("v4PwaCard"\),about=document\.getElementById\("v30AboutPanel"\);/);
  assert.doesNotMatch(ui,/\.remove\(\)/,"hiçbir bölüm silinmez");
});

test("v76 Ayarlar'da 'Verilerimi indir'; Deneme fotoğraflı hatalar başka ekrandan açılır",()=>{
  const settings=read("public/settings-profile-runtime.js"),exam=read("src/ui/exam-hub-v73.ts");
  assert.match(settings,/<button class="primary" type="button" data-yms-data>Verilerimi indir<\/button>/);
  assert.match(exam,/export function openExamPhotos\(\):void\{errFilter="photo";errLimit=40;openExamTab\("hata"\);\}/);
  assert.match(exam,/\(L as Loose\)\.YKSExamHub=\{openTab:openExamTab,openPhotos:openExamPhotos\};/);
});
