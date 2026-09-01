const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("paket zorunlu dosyaları içerir",()=>{
  ["index.html","app.css","app.js","sw.js","version.json","manifest.webmanifest","modules/core-utils.js","modules/stability.js","modules/topic-guides.js","modules/learning-lab.js","modules/target-center.js","modules/export-center.js","modules/release-selftest.js","src/release/version.ts","src/release/release-overlay.ts"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),true,file));
  ["modules/topic-coach.js","modules/learning-tools.js"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),false,file));
});

test("HTML kimlikleri benzersiz ve kritik alanlar mevcut",()=>{
  const html=read("index.html"),ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]);
  assert.equal(new Set(ids).size,ids.length);
  ["v311OfflineBanner","mrp_lab","v320LearningLab","v320SubjectGrid","v320TopicGrid","v320ElementGrid","v320Timeline","v321TargetKpis","v322ExportCenter"].forEach(id=>assert.ok(ids.includes(id),id));
});

test("sürüm, şema ve PWA önbelleği tutarlı",()=>{
  const html=read("index.html"),app=read("app.js"),sw=read("sw.js"),version=JSON.parse(read("version.json")),releaseVersion=read("src/release/version.ts");
  assert.match(html,/src="\.\/app\.js\?v=4\.1\.0-r20"/);assert.match(html,/src="\.\/modules\/stability\.js\?v=4\.1\.0-r28"/);assert.match(app,/const APP_VERSION="4\.1\.0"/);assert.match(app,/const APP_BUILD="4\.1\.0-r20"/);assert.match(app,/const DATA_SCHEMA=21/);
  assert.equal(version.version,"4.4.0");assert.equal(version.schema,21);assert.equal(version.build,"4.4.0-r1");assert.match(releaseVersion,/RELEASE_VERSION="4\.4\.0"/);assert.match(releaseVersion,/LEGACY_CORE_BUILD="4\.1\.0-r20"/);
  assert.match(sw,/const APP_VERSION="4\.4\.0"/);assert.match(sw,/const APP_BUILD="4\.4\.0-r1"/);assert.match(sw,/const CACHE="yks-core-v4\.4\.0-r1"/);assert.match(sw,/yks-core-v4\.3\.1-r1/);assert.match(sw,/yks-core-v4\.3\.0-r1/);assert.match(sw,/yks-core-v4\.2\.0-r1/);assert.match(sw,/yks-core-v4\.1\.0-r40/);
  ["app.css","app.js?v=4.1.0-r20","modules/core-utils.js?v=4.1.0-r27","modules/stability.js?v=4.1.0-r28","modules/topic-guides.js?v=4.1.0-r20","modules/learning-lab.js?v=4.1.0-r26","modules/target-center.js?v=4.1.0-r20","modules/export-center.js?v=4.1.0-r20","modules/release-selftest.js?v=4.1.0-r20"].forEach(asset=>assert.ok(sw.includes(asset),asset));
  assert.match(html,/src="\.\/modules\/learning-lab\.js\?v=4\.1\.0-r26"/);assert.doesNotMatch(sw,/modules\/(topic-coach|learning-tools)\.js/);
});

test("dağıtım paketinde gömülü YouTube anahtarı yok",()=>{
  const all=["index.html","app.js","modules/stability.js","modules/learning-lab.js"].map(read).join("\n");
  assert.doesNotMatch(all,/AIza[0-9A-Za-z_-]{30,}/);assert.match(all,/const YT_BUILTIN_KEY=""/);
});

test("eski arayüz ve kaldırılan araçlar pakette yok",()=>{
  const html=read("index.html"),stability=read("modules/stability.js");
  assert.doesNotMatch(html,/v30-legacy-tabs/);assert.doesNotMatch(html,/Akıllı Konu Koçu|Öğrenme Araçları|Kronometre geçmişi|id="swHistory"/);assert.doesNotMatch(stability,/\beval\s*\(/);assert.match(html,/href="\.\/app\.css"/);
});

test("sade arayüzde ödül alanları ve Odak Bahçesi yok",()=>{
  const html=read("index.html");
  ["v319HomeReward","v317Garden","v319RewardCenter","v319Decorations","badgeList","homeBadges"].forEach(id=>assert.equal(html.includes(`id="${id}"`),false,id));
  assert.doesNotMatch(html,/Ödül merkezini aç|Rozetler & rekorlar|Odak Bahçesi|Başarı rozetleri/);assert.match(html,/Çalışma özeti/);
});

test("Öğrenme Laboratuvarı Daha içinde ve ders-konu düzeninde",()=>{
  const html=read("index.html"),app=read("app.js"),lab=read("modules/learning-lab.js"),topics=html.indexOf('<section id="topics"'),more=html.indexOf('<section id="more"'),learning=html.indexOf('id="v320LearningLab"');
  assert.ok(topics>=0&&more>topics&&learning>more);assert.equal(html.slice(topics,more).includes('id="v320LearningLab"'),false);
  assert.match(html,/v30Action\('lab'\)/);assert.match(app,/if\(k==="lab"\)return v30OpenMore\("lab"\)/);assert.match(lab,/v320SetExam/);assert.match(lab,/v320OpenSubject/);assert.match(lab,/v320SelectTopic/);assert.ok(html.indexOf('modules/topic-guides.js')<html.indexOf('modules/learning-lab.js'));
  assert.match(lab,/Dikkat et/);assert.match(lab,/Önemli bilgiler/);assert.match(lab,/Sık yapılan hatalar/);assert.match(lab,/Resmî çalışma kaynakları/);
});

test("Öğrenme Laboratuvarı, hedef merkezi ve dışa aktarımlar pakette",()=>{
  const html=read("index.html"),lab=read("modules/learning-lab.js"),target=read("modules/target-center.js"),exports=read("modules/export-center.js");
  assert.equal(lab.match(/const SYMBOLS="([^"]+)"/)[1].split(" ").length,118);assert.match(lab,/v320StartParagraph/);assert.match(lab,/Tarih kronolojisi|TIMELINE/);
  assert.match(html,/v327ElementPeriod/);assert.match(html,/v327ElementGroup/);assert.match(html,/v327TimelineSort/);assert.match(html,/v327TimelinePractice/);assert.match(lab,/paragraphSummary/);assert.match(lab,/filterElements/);assert.match(lab,/filterTimeline/);assert.match(lab,/v327ClearParagraphHistory/);
  assert.match(target,/v321RenderTargetCenter/);assert.match(exports,/buildICS/);assert.match(exports,/buildAnki/);assert.match(exports,/buildMarkdown/);assert.match(exports,/shareCard/);
});

test("1000 sözün İnsan Sözü bölümünde İngilizce kayıt kalmadı",()=>{
  const vm=require("node:vm"),app=read("app.js"),match=app.match(/const SOZLER=(\[[\s\S]*?\]);\r?\ntry\{ window\.SOZLER/);assert.ok(match);
  const quotes=vm.runInNewContext(match[1]),common=new Set("the and of to in is it that for you your with as be are was were this not but from on at by we he she they an who which what when where how life love man men one only all no do does did have has had can cannot could would should will may must more than if into out up down about through ever never its their our them his hers or so there these those been being get got make made nothing everything always truth virtue courage time money work think know".split(" ")),hits=q=>(String(q).toLowerCase().match(/[\p{L}']+/gu)||[]).filter(x=>/^[a-z']+$/.test(x)&&common.has(x));
  assert.equal(quotes.length,1000);assert.equal(quotes.filter(x=>x.c==="İnsan Sözü").length,920);assert.equal(quotes.filter(x=>x.c==="İnsan Sözü"&&hits(x.q).length>=2).length,0);
});

test("şema 20 verisi Öğrenme Laboratuvarı için şema 21'e taşınır",()=>{
  const app=read("app.js");assert.match(app,/if\(!Number\.isFinite\(v\)\|\|v<21\)o\.v=21/);assert.match(app,/lab:\{paragraphLog:\[\],elementFav:\[\],timelineFav:\[\],topicFav:\[\]\}/);assert.match(app,/if\(!o\.lab\|\|typeof o\.lab!=="object"/);
});

test("v4 Vite ve TypeScript geçiş altyapısı güvenli biçimde hazır",()=>{
  const pkg=JSON.parse(read("package.json")),ts=JSON.parse(read("tsconfig.json")),html=read("index.html"),entry=read("src/main.ts"),copy=read("scripts/copy-legacy-assets.mjs");
  ["package-lock.json","vite.config.mts","src/main.ts","src/vite-env.d.ts","scripts/copy-legacy-assets.mjs","scripts/verify-dist.mjs","MIGRATION-V4.md"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),true,file));
  assert.equal(pkg.private,true);assert.equal(pkg.version,"4.4.0");assert.match(pkg.scripts.check,/typecheck/);assert.match(pkg.scripts.build,/vite build/);assert.match(pkg.scripts.build,/verify-dist/);assert.match(pkg.scripts["release:check"],/verify-release/);assert.match(pkg.scripts["release:check"],/verify-v440-production/);assert.ok(pkg.devDependencies.vite);assert.ok(pkg.devDependencies.typescript);
  assert.equal(ts.compilerOptions.strict,true);assert.equal(ts.compilerOptions.noUncheckedIndexedAccess,true);assert.equal(ts.compilerOptions.noEmit,true);assert.match(html,/type="module" src="\.\/src\/main\.ts"/);assert.match(entry,/legacyRuntime:true/);assert.match(entry,/RELEASE_VERSION/);assert.match(entry,/RELEASE_BUILD/);assert.match(copy,/"modules"/);assert.equal(pkg.devDependencies.dexie,undefined);
});

test("v4 TypeScript arayüz köprüsü ekranları görünüşü değiştirmeden yönetir",()=>{
  const files=["src/ui/types.ts","src/ui/dom.ts","src/ui/navigation.ts","src/ui/more-panels.ts","src/ui/legacy-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return read(file);}).join("\n"),entry=read("src/main.ts");
  assert.match(source,/SCREEN_IDS/);assert.match(source,/MORE_PANEL_IDS/);assert.match(source,/class NavigationController/);assert.match(source,/class MorePanelsController/);assert.match(source,/installLegacyUiBridge/);assert.match(source,/window\.go=/);assert.match(source,/window\.setMoreTab=/);assert.match(source,/__YKS_UI__/);assert.match(source,/yks:navigation-after/);assert.match(entry,/installLegacyUiBridge\(screens\)/);assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);assert.doesNotMatch(source,/\.innerHTML\s*=/);
});

test("v4 TypeScript veri katmanı şema 21 sözleşmesini kayıpsız korur",()=>{
  const files=["src/data/contracts.ts","src/data/storage-keys.ts","src/data/codec.ts","src/data/local-state-repository.ts","src/data/legacy-data-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return read(file);}).join("\n"),entry=read("src/main.ts"),pkg=JSON.parse(read("package.json"));
  assert.match(source,/DATA_SCHEMA_VERSION=21/);assert.match(source,/interface YksState/);assert.match(source,/interface FocusSession/);assert.match(source,/interface LearningLabState/);["yks","yks_last_good","yks_yedek","yks_cloud_dirty","yks_focus_runtime_v1"].forEach(key=>assert.ok(source.includes(`\"${key}\"`),key));
  assert.match(source,/class LocalStateRepository/);assert.match(source,/decodeState/);assert.match(source,/encodeState/);assert.match(source,/MAX_REASONABLE_STATE_CHARS/);assert.match(source,/__YKS_DATA__/);assert.match(entry,/installLegacyDataBridge\(\)/);assert.match(entry,/dataBridge:true/);assert.equal(pkg.devDependencies.dexie,undefined);
});

test("v4 güvenli yedek köprüsü imza, önizleme ve Dexie geri yükleme akışını paketler",()=>{
  const files=["src/data/backup-service.ts","src/data/legacy-backup-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return read(file);}).join("\n"),entry=read("src/main.ts"),app=read("app.js"),html=read("index.html");
  assert.match(source,/BACKUP_FORMAT_VERSION=3/);assert.match(source,/fnv1a-32/);assert.match(source,/inspectBackupPackage/);assert.match(source,/previewBackupPackage/);assert.match(source,/applyBackupJSON/);assert.match(source,/rolledBack/);assert.match(entry,/installLegacyBackupBridge/);assert.match(entry,/installRecoveryCenter/);assert.match(app,/Yedek doğrulandı/);assert.match(app,/AUTO_BACKUP_GUN=14/);assert.match(html,/Güvenli yedekleme etkin/);assert.match(html,/Yedeği kontrol et ve geri yükle/);
});

test("v4 Dexie taşıması localStorage kaydını silmeden IndexedDB kopyası oluşturur",()=>{
  const files=["src/data/database.ts","src/data/migration.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return read(file);}).join("\n"),bridge=read("src/data/legacy-data-bridge.ts"),pkg=JSON.parse(read("package.json"));
  assert.ok(pkg.dependencies.dexie);assert.match(source,/class YksDatabase extends Dexie/);assert.match(source,/yks-defterim-v4/);assert.match(source,/transaction\("rw"/);assert.match(source,/migrateLegacyState/);assert.match(source,/sourceHash/);assert.match(source,/verified\.json!==legacy\.json/);assert.match(source,/already-current/);assert.match(bridge,/ready:initialize\(\)/);assert.match(bridge,/yks:data-primary-ready/);assert.match(bridge,/indexedSnapshot/);assert.doesNotMatch(source,/localStorage\.(?:removeItem|clear)/);assert.doesNotMatch(source,/\.delete\(|\.clear\(/);
});

test("v4 Dexie ana kayıt localStorage güvenli aynasıyla write-through çalışır",()=>{
  const primary=read("src/data/primary-store.ts"),bridge=read("src/data/legacy-data-bridge.ts"),app=read("app.js"),html=read("index.html");
  assert.match(primary,/class PrimaryStateCoordinator/);assert.match(primary,/mirrorTracked/);assert.match(primary,/indexed\.updatedAt/);assert.match(primary,/fallback-local/);assert.match(primary,/persistJSON/);assert.match(bridge,/legacySave\.apply/);assert.match(bridge,/captureLegacyWrite/);assert.match(bridge,/writeTail/);assert.match(bridge,/yks:data-primary-ready/);assert.match(app,/window\.YKSLegacyState/);assert.match(app,/function v4ApplyStoredJSON/);assert.match(html,/applyCloudJSON\(persisted\)/);assert.doesNotMatch(primary,/localStorage\.(?:removeItem|clear)/);assert.doesNotMatch(primary,/\.delete\(|\.clear\(/);
});

test("v4 taşınabilir veri sözleşmesini korur ve eski Firebase çalışma zamanını devre dışı bırakır",()=>{
  const cloud=read("src/data/cloud-state.ts"),primary=read("src/data/primary-store.ts"),bridge=read("src/data/legacy-data-bridge.ts"),html=read("index.html"),vite=read("vite.config.mts");
  assert.match(cloud,/buildCloudPayload/);assert.match(cloud,/state\.focus/);assert.match(cloud,/state\.yt/);assert.match(cloud,/stateHash\(json\)/);assert.match(primary,/replaceFromExternal/);assert.match(primary,/source:Extract<StateWriteSource,"firebase"\|"backup">="firebase"/);assert.match(primary,/persistJSON\(json,updatedAt,source\)/);assert.match(primary,/readPrimaryJSON/);assert.match(bridge,/cloudPayload/);assert.match(bridge,/applyCloudJSON/);assert.match(bridge,/await flush\(\)/);assert.doesNotMatch(html,/type="module" id="firebaseSyncModule"/);assert.match(html,/type="application\/json" id="legacyFirebaseSyncModule" data-disabled="play-store-release"/);assert.match(vite,/remove-disabled-cloud-runtime/);assert.match(vite,/legacyFirebaseSyncModule/);
});

test("v4 ana ekranların çizim sırası TypeScript modüllerinden yönetilir",()=>{
  const files=["src/ui/screen-runtime.ts","src/ui/screens/contracts.ts","src/ui/screens/home.ts","src/ui/screens/program.ts","src/ui/screens/topics.ts","src/ui/screens/exams.ts","src/ui/screens/progress.ts","src/ui/screens/focus.ts","src/ui/screens/more.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return read(file);}).join("\n"),navigation=read("src/ui/navigation.ts"),entry=read("src/main.ts");
  ["home","program","topics","deneme","progress","pomo","more"].forEach(screen=>assert.ok(source.includes(`id:\"${screen}\"`),screen));assert.match(source,/class ScreenRuntime/);assert.match(source,/renderCurrent/);assert.match(source,/yks:screen-render-after/);assert.match(source,/program-secondary/);assert.match(source,/deneme-secondary/);assert.match(navigation,/#screenRuntime\.render\(value,source\)/);assert.match(navigation,/#activateShell/);assert.match(entry,/installScreenRuntime\(\)/);assert.match(entry,/screenRuntime:true/);assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);assert.doesNotMatch(source,/\.innerHTML\s*=/);
});

test("v4 ortak hesaplama ve biçimlendirme servisleri TypeScript'e taşınır",()=>{
  const files=["src/services/date-service.ts","src/services/number-service.ts","src/services/format-service.ts","src/services/legacy-service-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return read(file);}).join("\n"),entry=read("src/main.ts");
  assert.match(source,/dateService/);assert.match(source,/numberService/);assert.match(source,/formatService/);assert.match(source,/installLegacyServiceBridge/);assert.match(source,/__YKS_SERVICES__/);["keyOf","todayKey","validDateKey","parseKey","addDaysKey","dowOf","mondayOf","daysUntil","diffKeys","net","r2","sumVals","fmtHM","esc","hueOf"].forEach(name=>assert.match(source,new RegExp(`${name}:`),name));assert.match(entry,/installLegacyServiceBridge\(\)/);assert.match(entry,/commonServices:true/);assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
});

test("v4 konu ve çalışma state işlemleri tür güvenli alan servislerini kullanır",()=>{
  const files=["src/domain/contracts.ts","src/domain/state-context.ts","src/domain/topic-service.ts","src/domain/activity-service.ts","src/domain/legacy-domain-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return read(file);}).join("\n"),entry=read("src/main.ts"),app=read("app.js");
  assert.match(source,/TopicStatus/);assert.match(source,/class DomainStateContext/);assert.match(source,/topicService/);assert.match(source,/activityService/);assert.match(source,/installLegacyDomainBridge/);assert.match(source,/__YKS_DOMAIN__/);assert.match(source,/examTopicProgress/);assert.match(source,/topicGoals/);assert.match(source,/upcomingReviewPlan/);["tkey","tget","tsetStatus","tsetConf","subjStat","overallPct","reviewQueue","markReview","totalSolved","totalMinutes","fullTopicCount","completedReviewCount","todaySessions","workCyclesToday","isLongBreakNext"].forEach(name=>assert.ok(source.includes(`\"${name}\"`),name));assert.match(app,/readState:\(\)=>S/);assert.match(app,/subjects:\(\)=>ALL_SUBJECTS/);assert.match(entry,/installLegacyDomainBridge\(\)/);assert.match(entry,/domainServices:true/);assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
});

test("v4 Konular ekranı hedefleri, yüzdeleri ve yedi günlük tekrar planını sade biçimde gösterir",()=>{
  const html=read("index.html"),app=read("app.js"),css=read("app.css");assert.match(html,/id="v4TopicGoals"/);assert.match(app,/v4ExamTopicProgress/);assert.match(app,/v4RenderTopicGoals/);assert.match(app,/v4UpcomingReviews/);assert.match(app,/önümüzdeki 7 gün/);assert.match(app,/Programım tablosuna otomatik/);assert.match(css,/v4-topic-progressbar/);assert.match(css,/v4-topic-goal-list/);
});

test("v4 tablet ve PC görünümü ortak genişlik, dengeli kartlar ve dokunma hedefleri kullanır",()=>{
  const html=read("index.html"),app=read("app.js"),css=read("app.css");assert.match(css,/v4\.0\.0-r18 — tablet \+ PC son görünüm cilası/);assert.match(css,/--app-content-max:1560px/);assert.match(css,/@media \(pointer:coarse\)/);assert.match(css,/min-width:44px;min-height:44px/);assert.match(app,/desktop-topic-summary-section/);assert.match(app,/desktopTopic===key/);assert.match(app,/desktop-topic-overview #v4TopicGoals/);assert.doesNotMatch(`${html}\n${app}`,/initGestures|swipe(?:Left|Right)|addEventListener\(["']touchend["']/i);
});

test("v4 PWA çevrimdışı paketi atomik hazırlanır ve yapı numarasıyla güncellenir",()=>{
  const html=read("index.html"),app=read("app.js"),sw=read("sw.js"),manifest=JSON.parse(read("manifest.webmanifest")),entry=read("src/main.ts"),pwa=read("src/pwa/pwa-runtime.ts");
  ["v4PwaCard","v4PwaBadge","v4InstallBtn","v4OfflineState"].forEach(id=>assert.match(html,new RegExp(`id="${id}"`),id));assert.match(sw,/function buildAssets/);assert.match(sw,/matchAll/);assert.match(sw,/Promise\.all\(required/);assert.match(sw,/await caches\.delete\(CACHE\)/);assert.match(sw,/GET_CACHE_STATUS/);assert.match(sw,/READY_KEY/);assert.match(sw,/const APP_BUILD="4\.4\.0-r1"/);assert.match(sw,/yks-core-v4\.3\.1-r1/);assert.match(sw,/yks-core-v4\.3\.0-r1/);assert.match(sw,/yks-core-v4\.2\.0-r1/);assert.doesNotMatch(sw,/cache\.put\("\.\/index\.html",res\.clone\(\)\)/);assert.match(app,/j\.build\|\|j\.version/);assert.match(app,/await window\.__YKS_DATA__\.flush\(\)/);assert.match(app,/!appUpdateApplying\|\|appUpdateReloading/);assert.equal(manifest.prefer_related_applications,false);assert.deepEqual(manifest.display_override,["window-controls-overlay","standalone"]);assert.match(entry,/installPwaRuntime\(RELEASE_BUILD\)/);assert.match(pwa,/beforeinstallprompt/);assert.match(pwa,/Ana ekrana ekle/);
});

test("v4 ilerleme ekranı tür güvenli analiz ve sade tek bakış dashboard'u kullanır",()=>{
  const files=["src/domain/progress-analysis-service.ts","src/domain/legacy-progress-analysis-bridge.ts","src/ui/progress-dashboard.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return read(file);}).join("\n"),entry=read("src/main.ts"),html=read("index.html"),css=read("app.css");assert.match(source,/analyzeProgress/);assert.match(source,/__YKS_PROGRESS_ANALYSIS__/);assert.match(source,/renderProgressDashboard/);assert.match(source,/dataLevel/);assert.match(entry,/installLegacyProgressAnalysisBridge\(\)/);assert.match(entry,/progressAnalysis:true/);["v4ProgressOverview","v4SubjectInsights","v4ProgressRhythm","v4TopicsReviews","v4ProgressCoreGrid"].forEach(id=>assert.match(html,new RegExp(`id="${id}"`),id));assert.match(html,/Ayrıntılı analizleri göster/);assert.match(css,/v4-progress-core-grid/);assert.match(css,/v4-progress-detail-grid/);assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
});

test("v4 deneme ekranı dönem, yanlış yoğunluğu ve son iki denemeyi tür güvenli analiz eder",()=>{
  const files=["src/domain/exam-analysis-service.ts","src/domain/legacy-exam-analysis-bridge.ts","src/ui/exam-dashboard.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return read(file);}).join("\n"),entry=read("src/main.ts"),html=read("index.html"),app=read("app.js"),css=read("app.css");assert.match(source,/analyzeExams/);assert.match(source,/__YKS_EXAM_ANALYSIS__/);assert.match(source,/renderExamDashboard/);assert.match(source,/sharePercent/);assert.match(source,/periodDelta/);assert.match(entry,/installLegacyExamAnalysisBridge\(\)/);assert.match(entry,/examAnalysis:true/);assert.match(app,/__YKS_RENDER_EXAM_DASHBOARD__/);["v4ExamInsights","v4ExamComparison"].forEach(id=>assert.match(html,new RegExp(`id="${id}"`),id));assert.match(html,/Pay ve tekrar sayısı/);assert.match(css,/v4-exam-compare-grid/);assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
});

test("v4.4.0 kararlı sürümü tarayıcı ve üretim paketi kontrollerini içerir",()=>{
  const release=read("src/release/release.ts"),entry=read("src/main.ts"),version=read("src/release/version.ts"),overlay=read("src/release/release-overlay.ts"),legacy=read("modules/release-selftest.js"),verify=read("scripts/verify-release.mjs"),report=read("RELEASE.md");
  assert.match(version,/RELEASE_VERSION="4\.4\.0"/);assert.match(version,/RELEASE_BUILD="4\.4\.0-r1"/);assert.match(version,/LEGACY_CORE_BUILD="4\.1\.0-r20"/);assert.match(release,/RELEASE_VERSION/);assert.match(release,/SCREEN_IDS/);assert.match(release,/release-overlay/);assert.match(release,/backup-recovery/);assert.match(release,/pwa-build/);assert.match(release,/v43-runtime/);assert.match(release,/dexie-write-through/);assert.match(release,/portable-payload/);assert.match(release,/external-restore-path/);assert.match(release,/screen-transitions/);assert.match(release,/YKS_V4_RELEASE_OK/);assert.match(entry,/installReleaseRuntime\(\)/);assert.match(entry,/RELEASE_CHANNEL/);assert.match(entry,/stableRelease:true/);assert.match(entry,/installReleaseOverlay\(\)/);assert.match(entry,/installV43SafeRuntime\(\)/);assert.match(overlay,/remoteVersionIsNewer/);assert.match(legacy,/v4-bootstrap/);assert.match(verify,/localOnly/);assert.match(report,/\?selftest=v4/);
});

test("CI ve Pages dağıtımı güncel eylemler, zaman aşımı ve canlı doğrulama kullanır",()=>{
  const ci=read(".github/workflows/ci.yml"),deploy=read(".github/workflows/deploy-pages.yml"),live=read("scripts/verify-live-pages.mjs");assert.match(ci,/pull_request:/);assert.match(ci,/cancel-in-progress: true/);assert.match(ci,/timeout-minutes: 10/);assert.match(ci,/npm run release:check/);[ci,deploy].forEach(workflow=>{assert.match(workflow,/actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/);assert.match(workflow,/actions\/setup-node@820762786026740c76f36085b0efc47a31fe5020/);});assert.match(deploy,/actions\/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d/);assert.match(deploy,/actions\/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9/);assert.match(deploy,/actions\/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128/);for(const file of fs.readdirSync(path.join(root,".github/workflows")).filter(file=>file.endsWith(".yml")))assert.doesNotMatch(read(`.github/workflows/${file}`),/uses:\s+[^\s#]+@v\d+/);assert.match(deploy,/conclusion/);assert.match(deploy,/node scripts\/verify-live-pages\.mjs/);assert.match(live,/verifyLivePages/);assert.match(live,/YKS_V4_RELEASE_OK/);assert.match(live,/AbortSignal\.timeout/);
});

test("v4.4.0 kararlı sürümü geçici aday dosyası bırakmaz ve veri şemasını korur",()=>{
  const pkg=JSON.parse(read("package.json")),lock=JSON.parse(read("package-lock.json")),entry=read("src/main.ts"),app=read("app.js"),version=read("src/release/version.ts");
  assert.equal(pkg.version,"4.4.0");assert.equal(lock.version,"4.4.0");assert.equal(lock.lockfileVersion,3);assert.equal(lock.packages[""].name,"yks-defterim");assert.equal(lock.packages[""].version,"4.4.0");assert.deepEqual(lock.packages[""].dependencies,pkg.dependencies);assert.deepEqual(lock.packages[""].devDependencies,pkg.devDependencies);
  ["src/release/release-candidate.ts","scripts/verify-release-candidate.mjs","tests/release-candidate.test.js","RELEASE-CANDIDATE.md"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),false,file));["src/release/version.ts","src/release/release-overlay.ts","src/release/release.ts","scripts/verify-release.mjs","scripts/verify-v440-production.mjs","tests/release.test.js","RELEASE.md"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),true,file));assert.match(entry,/version:RELEASE_VERSION/);assert.match(entry,/channel:RELEASE_CHANNEL/);assert.match(version,/RELEASE_VERSION="4\.4\.0"/);assert.match(version,/LEGACY_CORE_BUILD="4\.1\.0-r20"/);assert.match(app,/const DATA_SCHEMA=21/);
});

test("kararlı tarayıcı self-test'i Vite'ın hash'li CSS paketini kabul eder",()=>{
  const selftest=read("modules/release-selftest.js");assert.match(selftest,/assets\/index-/);assert.match(selftest,/href\$="\.css"/);assert.match(selftest,/script\[src\^="\.\/app\.js"\]/);
});

test("tek kullanıcı ve Hata Defteri kişisel çalışma akışına bağlı",()=>{
  const html=read("index.html"),mod=read("modules/error-journal.js"),css=read("app.css");assert.doesNotMatch(html,/Koç notları|Öğrencine not bırak|data-coach-only|data-student-only/);["errorJournal","errorJournalSubject","errorJournalTopic","errorJournalType","errorJournalList"].forEach(id=>assert.match(html,new RegExp('id="'+id+'"')));assert.match(html,/modules\/error-journal\.js/);assert.match(mod,/S\.errorJournal/);assert.match(mod,/saveSoon/);assert.match(mod,/manualReviews/);assert.match(mod,/Bilgi eksiği/);assert.match(mod,/Dikkat/);assert.match(css,/Kişisel Hata Defteri/);
});
