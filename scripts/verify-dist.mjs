import {access,readFile,readdir} from "node:fs/promises";
import {resolve} from "node:path";
import {verifyAnatomyAssets} from "./verify-anatomy-assets.mjs";

const root=resolve(import.meta.dirname,".."),dist=resolve(root,"dist");
const localRelease=JSON.parse(await readFile(resolve(root,"version.json"),"utf8"));
if(localRelease.version!=="4.4.0"||localRelease.build!=="4.4.0-r1"||localRelease.schema!==21)throw new Error("Yerel v4.4.0 release kimliği beklenen değerle eşleşmiyor");
const required=[
  "index.html","404.html","app.js","app.css","sw.js","version.json","manifest.webmanifest",
  "modules/core-utils.js","modules/stability.js","modules/topic-guides.js",
  "modules/learning-lab.js","modules/learning-lab-v2.js","modules/learning-lab-v3.js","modules/target-center.js","modules/export-center.js",
  "modules/error-journal.js","modules/personal-upgrades.js","modules/progress-v2.js","modules/motivation-quotes-v1.js","modules/motivation-quotes-v2.css",
  "modules/global-search-v42.js","modules/smart-repeat-v42.js","modules/error-topic-lab-v42.js","modules/exam-analysis-v42.js","modules/progress-v42.js","modules/learning-lab-flow-v42.js",
  "modules/release-selftest.js","modules/study-intelligence-v5.css","modules/ui-polish-v1.css","modules/ui-polish-home-v2.css",
  "modules/ui-polish-focus-v1.css","modules/ui-polish-exam-v1.css","modules/ui-polish-topics-v1.css","modules/ui-polish-error-journal-v1.css",
  "modules/ui-polish-progress-v1.css","modules/ui-polish-progress-v2.css","modules/ui-polish-more-v1.css","modules/ui-polish-program-v1.css",
  "modules/ui-polish-learning-lab-v1.css","modules/ui-polish-final-v1.css"
];

for(const file of required)await access(resolve(dist,file));
const index=await readFile(resolve(dist,"index.html"),"utf8");
if(!/assets\/index-[^"']+\.js/.test(index))throw new Error("TypeScript üretim paketi index.html içine bağlanmadı");
if(!index.includes('./app.js?v=4.1.0-r20')||!index.includes('./modules/stability.js?v=4.1.0-r28')||!index.includes('./modules/learning-lab.js?v=4.1.0-r26')||!index.includes('./modules/error-journal.js?v=4.1.0-r20'))throw new Error("Uygulama çalışma zamanı üretim paketinde bağlı değil");
const bundlePath=index.match(/(?:src|href)="\.\/(assets\/index-[^"']+\.js)"/)?.[1];
if(!bundlePath)throw new Error("Kararlı sürüm JavaScript paketi bulunamadı");
const [bundle,app,sw,versionText,recovery,stability,personal,progress,labV2,labV3,motivation,motivationCss,studyCss,polishCss,homePolishCss,progressPolishCss,progressModernCss,programPolishCss,labPolishCss,finalPolishCss]=await Promise.all([
  readFile(resolve(dist,bundlePath),"utf8"),
  readFile(resolve(dist,"app.js"),"utf8"),
  readFile(resolve(dist,"sw.js"),"utf8"),
  readFile(resolve(dist,"version.json"),"utf8"),
  readFile(resolve(dist,"404.html"),"utf8"),
  readFile(resolve(dist,"modules/stability.js"),"utf8"),
  readFile(resolve(dist,"modules/personal-upgrades.js"),"utf8"),
  readFile(resolve(dist,"modules/progress-v2.js"),"utf8"),
  readFile(resolve(dist,"modules/learning-lab-v2.js"),"utf8"),
  readFile(resolve(dist,"modules/learning-lab-v3.js"),"utf8"),
  readFile(resolve(dist,"modules/motivation-quotes-v1.js"),"utf8"),
  readFile(resolve(dist,"modules/motivation-quotes-v2.css"),"utf8"),
  readFile(resolve(dist,"modules/study-intelligence-v5.css"),"utf8"),
  readFile(resolve(dist,"modules/ui-polish-v1.css"),"utf8"),
  readFile(resolve(dist,"modules/ui-polish-home-v2.css"),"utf8"),
  readFile(resolve(dist,"modules/ui-polish-progress-v1.css"),"utf8"),
  readFile(resolve(dist,"modules/ui-polish-progress-v2.css"),"utf8"),
  readFile(resolve(dist,"modules/ui-polish-program-v1.css"),"utf8"),
  readFile(resolve(dist,"modules/ui-polish-learning-lab-v1.css"),"utf8"),
  readFile(resolve(dist,"modules/ui-polish-final-v1.css"),"utf8")
]);
if(!bundle.includes("YKS_V4_RELEASE_OK")||!bundle.includes(localRelease.version)||!bundle.includes("stable")||!bundle.includes("v42ReleaseOverlay"))throw new Error("v4.4 kararlı sürüm denetimi üretim paketine girmedi");
if(!bundle.includes(localRelease.build)||!bundle.includes("4.1.0-r20")||!/(?:assets\/manifest-[^"']+|manifest\.webmanifest)\?v=4\.1\.0-r20/.test(index))throw new Error("v4.4 release / legacy PWA kabuk sınırı üretim paketinde eksik");
if(!app.includes('const APP_VERSION="4.1.0"')||!app.includes('const APP_BUILD="4.1.0-r20"'))throw new Error("Korunan legacy app.js çekirdek sürümü beklenen değer değil");
if(!sw.includes(`const APP_VERSION="${localRelease.version}"`)||!sw.includes(`const APP_BUILD="${localRelease.build}"`)||!sw.includes(`const CACHE="yks-core-v${localRelease.build}"`)||!sw.includes('"yks-core-v4.3.1-r1"')||!sw.includes('"yks-core-v4.2.0-r1"'))throw new Error("Kopyalanan service worker v4.4 kararlı sürüm/cache revizyonuyla eşleşmiyor");
if(!sw.includes('learning-lab.js?v=4.1.0-r26'))throw new Error("Laboratuvar favori düzeltmesi çevrimdışı çekirdekte eksik");
const v42Runtime=["global-search-v42.js","smart-repeat-v42.js","error-topic-lab-v42.js","exam-analysis-v42.js","progress-v42.js","learning-lab-flow-v42.js"];
for(const file of v42Runtime){
  if(!sw.includes(`${file}?v=4.2.0-r1`))throw new Error("v4.2 uyumluluk modülü çevrimdışı çekirdekte eksik: "+file);
  if(!stability.includes(`${file}?v=4.2.0-r1`))throw new Error("v4.2 uyumluluk modülü çalışma zamanında yüklenmiyor: "+file);
}
const polishCore=["study-intelligence-v5.css","ui-polish-v1.css","ui-polish-home-v2.css","ui-polish-focus-v1.css","ui-polish-exam-v1.css","ui-polish-topics-v1.css","ui-polish-error-journal-v1.css","ui-polish-progress-v1.css","ui-polish-progress-v2.css","ui-polish-more-v1.css","ui-polish-program-v1.css","ui-polish-learning-lab-v1.css","ui-polish-final-v1.css"];
for(const file of polishCore)if(!sw.includes(`${file}?v=4.1.0-r1`))throw new Error("Cila katmanı çevrimdışı çekirdekte eksik: "+file);
if(!sw.includes('motivation-quotes-v1.js?v=4.1.0-r2')||!sw.includes('motivation-quotes-v2.css?v=4.1.0-r1')||!stability.includes('motivation-quotes-v1.js?v=4.1.0-r2'))throw new Error("Günün sözü çalışma zamanı/PWA çekirdeğine bağlı değil");
if(!motivation.includes('const EXAM_QUOTES=')||!motivation.includes('const COACH_QUOTES=')||!motivation.includes('scope:"YKS+coaches"')||!motivation.includes('style:"v2"')||!motivation.includes('Teknik Direktör')||!motivation.includes('yeniSoz=function'))throw new Error("YKS + teknik direktör söz havuzu eksik veya paketlenmedi");
if(!motivationCss.includes('[data-quote-type="coach"]')||!motivationCss.includes('focus-visible')||!motivationCss.includes('@media (max-width:759px)')||!motivationCss.includes('prefers-reduced-motion'))throw new Error("Motivasyon kartı v2 cila/erişilebilirlik katmanı paketlenmedi");
if(!studyCss.includes('ui-polish-v1.css?v=4.1.0-r1')||!studyCss.includes('ui-polish-home-v2.css?v=4.1.0-r1')||!studyCss.includes('ui-polish-progress-v2.css?v=4.1.0-r1')||!studyCss.includes('ui-polish-learning-lab-v1.css?v=4.1.0-r1')||!studyCss.includes('ui-polish-final-v1.css?v=4.1.0-r1')||!polishCss.includes('prefers-reduced-motion')||!polishCss.includes('.today-hub')||!polishCss.includes('.v315-dashboard'))throw new Error("Görsel cila katmanı üretim paketine doğru bağlanmadı");
if(!homePolishCss.includes('#home .home-overview')||!homePolishCss.includes('grid-template-areas')||!homePolishCss.includes('#home .today-summary-grid')||!homePolishCss.includes('prefers-reduced-motion'))throw new Error("Bugün ekranı premium cila katmanı eksik veya eksik paketlendi");
if(!progressPolishCss.includes('#progress .desktop-progress-grid')||!progressPolishCss.includes('prefers-reduced-motion:reduce')||!progressModernCss.includes('#progress>.v4-progress-overview')||!progressModernCss.includes('#progress .v4-progress-kpi')||!progressModernCss.includes('#progress .v4-subject-callout'))throw new Error("İlerleme ekranı modern premium cila katmanı eksik veya eksik paketlendi");
if(!progressModernCss.includes('ui-polish-program-v1.css?v=4.1.0-r1')||!programPolishCss.includes('#program .weeknav')||!programPolishCss.includes('#program .gtable')||!programPolishCss.includes('#program #progCal')||!programPolishCss.includes('prefers-reduced-motion:reduce'))throw new Error("Program ekranı premium cila katmanı eksik veya eksik paketlendi");
if(!labPolishCss.includes('#mrp_lab .v320-course-browser')||!labPolishCss.includes('#mrp_lab .v4-science-card')||!labPolishCss.includes('#mrp_lab .v320-element-grid')||!labPolishCss.includes('#mrp_lab #v320Timeline.v4-history-timeline')||!labPolishCss.includes('#mrp_lab #v320PanelAtlas .atlas-model-stage')||!labPolishCss.includes('prefers-reduced-motion:reduce'))throw new Error("Öğrenme Laboratuvarı premium cila katmanı eksik veya eksik paketlendi");
if(!finalPolishCss.includes('.v26-topic-modal')||!finalPolishCss.includes('.toast')||!finalPolishCss.includes('.tabbar .tab')||!finalPolishCss.includes('pointer:coarse')||!finalPolishCss.includes('prefers-reduced-motion:reduce')||!finalPolishCss.includes('data-theme="dark"'))throw new Error("Uygulama geneli final tutarlılık/erişilebilirlik cilası eksik veya eksik paketlendi");
if(!index.includes("core-utils.js?v=4.1.0-r27")||!sw.includes("core-utils.js?v=4.1.0-r27"))throw new Error("Bilim kartlarının senkronizasyon güncellemesi pakette eksik");
if(!bundle.includes("FEN TEKRAR ATÖLYESİ"))throw new Error("Biyoloji/Fizik kart sistemi TypeScript paketinde eksik");
if(!bundle.includes("YKSBiologyAtlas")||!labV3.includes("v320PanelAtlas"))throw new Error("Biyoloji atlası çalışma zamanına bağlı değil");
const chunks=await readdir(resolve(dist,"assets"));
const v43Chunks=["today-v43","analysis-center-v43","learning-cycle-v43","lab-quiz-v43","navigation-v43","personalization-v43","focus-session-guard-v43"];
for(const prefix of v43Chunks)if(!chunks.some(name=>name.startsWith(`${prefix}-`)&&name.endsWith(".js")))throw new Error("v4.3 modülü ayrı lazy chunk değil: "+prefix);
const v44Chunks=["biology-yks-question-v44","biology-layer-guide-v44","biology-topic-map-v44","physics-lab-v44","chemistry-visuals-v44","lab-interactions-v44"];
for(const prefix of v44Chunks)if(!chunks.some(name=>name.startsWith(`${prefix}-`)&&name.endsWith(".js")))throw new Error("v4.4 modülü ayrı lazy chunk değil: "+prefix);
const atlasChunk=chunks.find(name=>/^biology-atlas-(?!model-).+\.js$/.test(name));
const modelChunk=chunks.find(name=>/^biology-atlas-model-.+\.js$/.test(name));
if(!atlasChunk||!modelChunk||!chunks.some(name=>/^biology-atlas-.+\.css$/.test(name)))throw new Error("Atlas veya 3B modül ayrı yükleme paketi olarak bulunamadı");
const atlasBundle=await readFile(resolve(dist,"assets",atlasChunk),"utf8");
if(!atlasBundle.includes("Genden proteine")||!atlasBundle.includes("Kendini sına")||bundle.includes("WebGLRenderer"))throw new Error("Atlas içeriği / isteğe bağlı yükleme sınırı bozuk");
await verifyAnatomyAssets(resolve(dist,"anatomy"),JSON.parse(await readFile(resolve(root,"scripts/anatomy-assets.json"),"utf8")));
for(const asset of ["error-journal.js?v=4.1.0-r20","personal-upgrades.js?v=4.1.0-r20","progress-v2.js?v=4.1.0-r20","learning-lab-v2.js?v=4.1.0-r24","learning-lab-v3.js?v=4.1.0-r28","motivation-quotes-v1.js?v=4.1.0-r2","motivation-quotes-v2.css?v=4.1.0-r1"])if(!sw.includes(asset))throw new Error("Kişisel/ana modül çevrimdışı çekirdekte eksik: "+asset);
if(!stability.includes("personal-upgrades.js?v=4.1.0-r20")||!stability.includes("progress-v2.js?v=4.1.0-r20")||!stability.includes("learning-lab-v2.js?v=4.1.0-r24")||!stability.includes("learning-lab-v3.js?v=4.1.0-r28")||!stability.includes("motivation-quotes-v1.js?v=4.1.0-r2"))throw new Error("Kişisel geliştirme/motivasyon modülleri çalışma zamanında yüklenmiyor");
if(!personal.includes("enforceSingleUser")||!personal.includes("bindProgramGrid"))throw new Error("Tek kullanıcı / Program v2 üretim paketinde eksik");
if(!progress.includes("studyNetRelation")||!progress.includes("bestImprovingSubject"))throw new Error("İlerleme v2 üretim paketinde eksik");
if(!labV2.includes("PARAGRAPH_TIPS")||!labV2.includes("fetchElementMedia")||!labV2.includes("DEEP_DIVES")||!labV2.includes("ERA_CARDS")||!/const group=groupOf\(z\)/.test(labV2))throw new Error("Öğrenme Laboratuvarı v2 üretim paketinde eksik veya blok hesabı kararsız");
if(!labV3.includes("v320TabParagraph")||!labV3.includes("Bilim Kartları")||!labV3.includes("v4SetScienceSubject")||!labV3.includes("deepDives")||!labV3.includes("v4PeriodicSetType")||!labV3.includes("YKS trend paneli")||!labV3.includes("Kronoloji timeline")||!labV3.includes("decorateTimeline")||!labV3.includes("bindMainTabs")||!labV3.includes('version:"3.4.0"'))throw new Error("Öğrenme Laboratuvarı v3 / periyodik ve kronoloji çalışma katmanı üretim paketinde eksik");
if(!sw.includes("Response.redirect(appRootUrl(),302)")||!sw.includes("self.registration.scope"))throw new Error("PWA eski başlangıç yolu kurtarma mantığı üretim paketinde yok");
if(!recovery.includes('/YKS-DEFTER-M-/')||!recovery.includes('location.replace'))throw new Error("GitHub Pages 404 kurtarma sayfası doğru uygulama köküne yönlendirmiyor");
let version;
try{version=JSON.parse(versionText);}catch{throw new Error("Kopyalanan version.json geçerli JSON değil");}
if(version?.version!==localRelease.version||version?.build!==localRelease.build||version?.schema!==21)throw new Error("Kopyalanan version.json v4.4 kararlı sürümle eşleşmiyor");
console.log(`Üretim paketi doğrulandı: ${required.length} geçiş dosyası + TypeScript paketi + v4.4 sürüm/PWA/lazy-modül/final-cila/YKS+teknik-direktör/kişisel modül bütünlüğü`);
