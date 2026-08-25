const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

test("paket zorunlu dosyaları içerir",()=>{
  ["index.html","app.css","app.js","sw.js","version.json","manifest.webmanifest","modules/core-utils.js","modules/stability.js","modules/topic-guides.js","modules/learning-lab.js","modules/target-center.js","modules/export-center.js","modules/release-selftest.js"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),true,file));
  ["modules/topic-coach.js","modules/learning-tools.js"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),false,file));
});

test("HTML kimlikleri benzersiz ve kritik alanlar mevcut",()=>{
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]);
  assert.equal(new Set(ids).size,ids.length);
  ["v311OfflineBanner","mrp_lab","v320LearningLab","v320SubjectGrid","v320TopicGrid","v320ElementGrid","v320Timeline","v321TargetKpis","v322ExportCenter"].forEach(id=>assert.ok(ids.includes(id),id));
});

test("sürüm, şema ve PWA önbelleği tutarlı",()=>{
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),app=fs.readFileSync(path.join(root,"app.js"),"utf8"),sw=fs.readFileSync(path.join(root,"sw.js"),"utf8"),version=JSON.parse(fs.readFileSync(path.join(root,"version.json"),"utf8"));
  assert.match(html,/src="\.\/app\.js\?v=4\.0\.0-r14"/);assert.match(app,/const APP_VERSION="4\.0\.0"/);assert.match(app,/const DATA_SCHEMA=21/);
  assert.equal(version.version,"4.0.0");assert.equal(version.schema,21);assert.match(sw,/yks-core-v4\.0\.0-r14/);
  ["app.css","app.js?v=4.0.0-r14","modules/core-utils.js?v=4.0.0-r14","modules/stability.js?v=4.0.0-r14","modules/topic-guides.js?v=4.0.0-r14","modules/learning-lab.js?v=4.0.0-r14","modules/target-center.js?v=4.0.0-r14","modules/export-center.js?v=4.0.0-r14","modules/release-selftest.js?v=4.0.0-r14"].forEach(asset=>assert.ok(sw.includes(asset),asset));
  assert.doesNotMatch(sw,/modules\/(topic-coach|learning-tools)\.js/);
});

test("dağıtım paketinde gömülü YouTube anahtarı yok",()=>{
  const all=["index.html","app.js","modules/stability.js","modules/learning-lab.js"].map(file=>fs.readFileSync(path.join(root,file),"utf8")).join("\n");
  assert.doesNotMatch(all,/AIzaSyALxmrdmd2UnoZcxN7HjWNKeS3g7B_o9LU/);
  assert.match(all,/const YT_BUILTIN_KEY=""/);
});

test("eski arayüz ve kaldırılan araçlar pakette yok",()=>{
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),stability=fs.readFileSync(path.join(root,"modules/stability.js"),"utf8");
  assert.doesNotMatch(html,/v30-legacy-tabs/);
  assert.doesNotMatch(html,/Akıllı Konu Koçu|Öğrenme Araçları|Kronometre geçmişi|id="swHistory"/);
  assert.doesNotMatch(stability,/\beval\s*\(/);
  assert.match(html,/href="\.\/app\.css"/);
});

test("sade arayüzde ödül alanları ve Odak Bahçesi yok",()=>{
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
  ["v319HomeReward","v317Garden","v319RewardCenter","v319Decorations","badgeList","homeBadges"].forEach(id=>assert.equal(html.includes(`id="${id}"`),false,id));
  assert.doesNotMatch(html,/Ödül merkezini aç|Rozetler & rekorlar|Odak Bahçesi|Başarı rozetleri/);
  assert.match(html,/Çalışma özeti/);
});

test("Öğrenme Laboratuvarı Daha içinde ve ders-konu düzeninde",()=>{
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),app=fs.readFileSync(path.join(root,"app.js"),"utf8"),lab=fs.readFileSync(path.join(root,"modules/learning-lab.js"),"utf8");
  const topics=html.indexOf('<section id="topics"'),more=html.indexOf('<section id="more"'),learning=html.indexOf('id="v320LearningLab"');
  assert.ok(topics>=0&&more>topics&&learning>more);
  assert.equal(html.slice(topics,more).includes('id="v320LearningLab"'),false);
  assert.match(html,/v30Action\('lab'\)/);assert.match(app,/if\(k==="lab"\)return v30OpenMore\("lab"\)/);
  assert.match(lab,/v320SetExam/);assert.match(lab,/v320OpenSubject/);assert.match(lab,/v320SelectTopic/);
  assert.ok(html.indexOf('modules/topic-guides.js')<html.indexOf('modules/learning-lab.js'));
  assert.match(lab,/Dikkat et/);assert.match(lab,/Önemli bilgiler/);assert.match(lab,/Sık yapılan hatalar/);assert.match(lab,/Resmî çalışma kaynakları/);
});

test("Öğrenme Laboratuvarı, hedef merkezi ve dışa aktarımlar pakette",()=>{
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8"),lab=fs.readFileSync(path.join(root,"modules/learning-lab.js"),"utf8"),target=fs.readFileSync(path.join(root,"modules/target-center.js"),"utf8"),exports=fs.readFileSync(path.join(root,"modules/export-center.js"),"utf8");
  assert.equal(lab.match(/const SYMBOLS="([^"]+)"/)[1].split(" ").length,118);
  assert.match(lab,/v320StartParagraph/);assert.match(lab,/Tarih kronolojisi|TIMELINE/);
  assert.match(html,/v327ElementPeriod/);assert.match(html,/v327ElementGroup/);assert.match(html,/v327TimelineSort/);assert.match(html,/v327TimelinePractice/);
  assert.match(lab,/paragraphSummary/);assert.match(lab,/filterElements/);assert.match(lab,/filterTimeline/);assert.match(lab,/v327ClearParagraphHistory/);
  assert.match(target,/v321RenderTargetCenter/);assert.match(exports,/buildICS/);assert.match(exports,/buildAnki/);assert.match(exports,/buildMarkdown/);assert.match(exports,/shareCard/);
});

test("1000 sözün İnsan Sözü bölümünde İngilizce kayıt kalmadı",()=>{
  const vm=require("node:vm"),app=fs.readFileSync(path.join(root,"app.js"),"utf8"),match=app.match(/const SOZLER=(\[[\s\S]*?\]);\ntry\{ window\.SOZLER/);assert.ok(match);
  const quotes=vm.runInNewContext(match[1]),common=new Set("the and of to in is it that for you your with as be are was were this not but from on at by we he she they an who which what when where how life love man men one only all no do does did have has had can cannot could would should will may must more than if into out up down about through ever never its their our them his hers or so there these those been being get got make made nothing everything always truth virtue courage time money work think know".split(" "));
  const hits=q=>(String(q).toLowerCase().match(/[\p{L}']+/gu)||[]).filter(x=>/^[a-z']+$/.test(x)&&common.has(x));
  assert.equal(quotes.length,1000);assert.equal(quotes.filter(x=>x.c==="İnsan Sözü").length,920);assert.equal(quotes.filter(x=>x.c==="İnsan Sözü"&&hits(x.q).length>=2).length,0);
});

test("şema 20 verisi Öğrenme Laboratuvarı için şema 21'e taşınır",()=>{
  const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
  assert.match(app,/if\(!Number\.isFinite\(v\)\|\|v<21\)o\.v=21/);
  assert.match(app,/lab:\{paragraphLog:\[\],elementFav:\[\],timelineFav:\[\]\}/);
  assert.match(app,/if\(!o\.lab\|\|typeof o\.lab!=="object"/);
});

test("v4 Vite ve TypeScript geçiş altyapısı güvenli biçimde hazır",()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8")),ts=JSON.parse(fs.readFileSync(path.join(root,"tsconfig.json"),"utf8")),html=fs.readFileSync(path.join(root,"index.html"),"utf8"),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8"),copy=fs.readFileSync(path.join(root,"scripts/copy-legacy-assets.mjs"),"utf8");
  ["package-lock.json","vite.config.mts","src/main.ts","src/vite-env.d.ts","scripts/copy-legacy-assets.mjs","scripts/verify-dist.mjs","MIGRATION-V4.md"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),true,file));
  assert.equal(pkg.private,true);assert.equal(pkg.version,"4.0.0");assert.match(pkg.scripts.check,/typecheck/);assert.match(pkg.scripts.build,/vite build/);assert.match(pkg.scripts.build,/verify-dist/);assert.match(pkg.scripts["release:check"],/verify-release/);assert.ok(pkg.devDependencies.vite);assert.ok(pkg.devDependencies.typescript);
  assert.equal(ts.compilerOptions.strict,true);assert.equal(ts.compilerOptions.noUncheckedIndexedAccess,true);assert.equal(ts.compilerOptions.noEmit,true);
  assert.match(html,/type="module" src="\.\/src\/main\.ts"/);assert.match(entry,/legacyRuntime:true/);assert.match(copy,/"modules"/);assert.equal(pkg.devDependencies.dexie,undefined);
});

test("v4 TypeScript arayüz köprüsü ekranları görünüşü değiştirmeden yönetir",()=>{
  const files=["src/ui/types.ts","src/ui/dom.ts","src/ui/navigation.ts","src/ui/more-panels.ts","src/ui/legacy-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return fs.readFileSync(path.join(root,file),"utf8");}).join("\n"),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
  assert.match(source,/SCREEN_IDS/);assert.match(source,/MORE_PANEL_IDS/);assert.match(source,/class NavigationController/);assert.match(source,/class MorePanelsController/);assert.match(source,/installLegacyUiBridge/);
  assert.match(source,/window\.go=/);assert.match(source,/window\.setMoreTab=/);assert.match(source,/__YKS_UI__/);assert.match(source,/yks:navigation-after/);assert.match(entry,/installLegacyUiBridge\(screens\)/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);assert.doesNotMatch(source,/\.innerHTML\s*=/);
});

test("v4 TypeScript veri katmanı şema 21 sözleşmesini kayıpsız korur",()=>{
  const files=["src/data/contracts.ts","src/data/storage-keys.ts","src/data/codec.ts","src/data/local-state-repository.ts","src/data/legacy-data-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return fs.readFileSync(path.join(root,file),"utf8");}).join("\n"),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8"),pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
  assert.match(source,/DATA_SCHEMA_VERSION=21/);assert.match(source,/interface YksState/);assert.match(source,/interface FocusSession/);assert.match(source,/interface LearningLabState/);
  ["yks","yks_last_good","yks_yedek","yks_cloud_dirty","yks_focus_runtime_v1"].forEach(key=>assert.ok(source.includes(`\"${key}\"`),key));
  assert.match(source,/class LocalStateRepository/);assert.match(source,/decodeState/);assert.match(source,/encodeState/);assert.match(source,/MAX_REASONABLE_STATE_CHARS/);
  assert.match(source,/__YKS_DATA__/);assert.match(entry,/installLegacyDataBridge\(\)/);assert.match(entry,/dataBridge:true/);
  assert.equal(pkg.devDependencies.dexie,undefined);
});

test("v4 güvenli yedek köprüsü imza, önizleme ve Dexie geri yükleme akışını paketler",()=>{
  const files=["src/data/backup-service.ts","src/data/legacy-backup-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return fs.readFileSync(path.join(root,file),"utf8");}).join("\n"),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8"),app=fs.readFileSync(path.join(root,"app.js"),"utf8"),html=fs.readFileSync(path.join(root,"index.html"),"utf8");
  assert.match(source,/BACKUP_FORMAT_VERSION=3/);assert.match(source,/fnv1a-32/);assert.match(source,/inspectBackupPackage/);assert.match(source,/applyBackupJSON/);
  assert.match(entry,/installLegacyBackupBridge/);assert.match(app,/Yedek doğrulandı/);assert.match(app,/AUTO_BACKUP_GUN=14/);assert.match(html,/Güvenli yedekleme etkin/);assert.match(html,/Yedeği kontrol et ve geri yükle/);
});

test("v4 Dexie taşıması localStorage kaydını silmeden IndexedDB kopyası oluşturur",()=>{
  const files=["src/data/database.ts","src/data/migration.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return fs.readFileSync(path.join(root,file),"utf8");}).join("\n"),bridge=fs.readFileSync(path.join(root,"src/data/legacy-data-bridge.ts"),"utf8"),pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
  assert.ok(pkg.dependencies.dexie);assert.match(source,/class YksDatabase extends Dexie/);assert.match(source,/yks-defterim-v4/);assert.match(source,/transaction\("rw"/);
  assert.match(source,/migrateLegacyState/);assert.match(source,/sourceHash/);assert.match(source,/verified\.json!==legacy\.json/);assert.match(source,/already-current/);
  assert.match(bridge,/ready:initialize\(\)/);assert.match(bridge,/yks:data-primary-ready/);assert.match(bridge,/indexedSnapshot/);
  assert.doesNotMatch(source,/localStorage\.(?:removeItem|clear)/);assert.doesNotMatch(source,/\.delete\(|\.clear\(/);
});

test("v4 Dexie ana kayıt localStorage güvenli aynasıyla write-through çalışır",()=>{
  const primary=fs.readFileSync(path.join(root,"src/data/primary-store.ts"),"utf8"),bridge=fs.readFileSync(path.join(root,"src/data/legacy-data-bridge.ts"),"utf8"),app=fs.readFileSync(path.join(root,"app.js"),"utf8"),html=fs.readFileSync(path.join(root,"index.html"),"utf8");
  assert.match(primary,/class PrimaryStateCoordinator/);assert.match(primary,/mirrorTracked/);assert.match(primary,/indexed\.updatedAt/);assert.match(primary,/fallback-local/);assert.match(primary,/persistJSON/);
  assert.match(bridge,/legacySave\.apply/);assert.match(bridge,/captureLegacyWrite/);assert.match(bridge,/writeTail/);assert.match(bridge,/yks:data-primary-ready/);
  assert.match(app,/window\.YKSLegacyState/);assert.match(app,/function v4ApplyStoredJSON/);assert.match(html,/applyCloudJSON\(persisted\)/);
  assert.doesNotMatch(primary,/localStorage\.(?:removeItem|clear)/);assert.doesNotMatch(primary,/\.delete\(|\.clear\(/);
});

test("v4 Firebase senkronu Dexie ana kayıt katmanını kullanır",()=>{
  const cloud=fs.readFileSync(path.join(root,"src/data/cloud-state.ts"),"utf8"),primary=fs.readFileSync(path.join(root,"src/data/primary-store.ts"),"utf8"),bridge=fs.readFileSync(path.join(root,"src/data/legacy-data-bridge.ts"),"utf8"),html=fs.readFileSync(path.join(root,"index.html"),"utf8");
  assert.match(cloud,/buildCloudPayload/);assert.match(cloud,/state\.focus/);assert.match(cloud,/state\.yt/);assert.match(cloud,/stateHash\(json\)/);
  assert.match(primary,/replaceFromExternal/);assert.match(primary,/source:Extract<StateWriteSource,"firebase"\|"backup">="firebase"/);assert.match(primary,/persistJSON\(json,updatedAt,source\)/);assert.match(primary,/readPrimaryJSON/);
  assert.match(bridge,/cloudPayload/);assert.match(bridge,/applyCloudJSON/);assert.match(bridge,/await flush\(\)/);
  assert.match(html,/async function cloudJSON/);assert.match(html,/await window\.__YKS_DATA__\.cloudPayload\(\)/);assert.match(html,/await window\.__YKS_DATA__\.applyCloudJSON\(persisted\)/);assert.match(html,/const json=await cloudJSON\(\)/);
  assert.match(html,/runTransaction\(db/);assert.match(html,/SYNC_CONFLICT/);assert.match(html,/infraHash\(json\)/);
});

test("v4 ana ekranların çizim sırası TypeScript modüllerinden yönetilir",()=>{
  const files=["src/ui/screen-runtime.ts","src/ui/screens/contracts.ts","src/ui/screens/home.ts","src/ui/screens/program.ts","src/ui/screens/topics.ts","src/ui/screens/exams.ts","src/ui/screens/progress.ts","src/ui/screens/focus.ts","src/ui/screens/more.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return fs.readFileSync(path.join(root,file),"utf8");}).join("\n"),navigation=fs.readFileSync(path.join(root,"src/ui/navigation.ts"),"utf8"),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
  ["home","program","topics","deneme","progress","pomo","more"].forEach(screen=>assert.ok(source.includes(`id:\"${screen}\"`),screen));
  assert.match(source,/class ScreenRuntime/);assert.match(source,/renderCurrent/);assert.match(source,/yks:screen-render-after/);assert.match(source,/program-secondary/);assert.match(source,/deneme-secondary/);
  assert.match(navigation,/#screenRuntime\.render\(value,source\)/);assert.match(navigation,/#activateShell/);assert.match(entry,/installScreenRuntime\(\)/);assert.match(entry,/screenRuntime:true/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);assert.doesNotMatch(source,/\.innerHTML\s*=/);
});

test("v4 ortak hesaplama ve biçimlendirme servisleri TypeScript'e taşınır",()=>{
  const files=["src/services/date-service.ts","src/services/number-service.ts","src/services/format-service.ts","src/services/legacy-service-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return fs.readFileSync(path.join(root,file),"utf8");}).join("\n"),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
  assert.match(source,/dateService/);assert.match(source,/numberService/);assert.match(source,/formatService/);assert.match(source,/installLegacyServiceBridge/);assert.match(source,/__YKS_SERVICES__/);
  ["keyOf","todayKey","validDateKey","parseKey","addDaysKey","dowOf","mondayOf","daysUntil","diffKeys","net","r2","sumVals","fmtHM","esc","hueOf"].forEach(name=>assert.match(source,new RegExp(`${name}:`),name));
  assert.match(entry,/installLegacyServiceBridge\(\)/);assert.match(entry,/commonServices:true/);assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
});

test("v4 konu ve çalışma state işlemleri tür güvenli alan servislerini kullanır",()=>{
  const files=["src/domain/contracts.ts","src/domain/state-context.ts","src/domain/topic-service.ts","src/domain/activity-service.ts","src/domain/legacy-domain-bridge.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return fs.readFileSync(path.join(root,file),"utf8");}).join("\n"),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8"),app=fs.readFileSync(path.join(root,"app.js"),"utf8");
  assert.match(source,/TopicStatus/);assert.match(source,/class DomainStateContext/);assert.match(source,/topicService/);assert.match(source,/activityService/);assert.match(source,/installLegacyDomainBridge/);assert.match(source,/__YKS_DOMAIN__/);
  ["tkey","tget","tsetStatus","tsetConf","subjStat","overallPct","reviewQueue","markReview","totalSolved","totalMinutes","fullTopicCount","completedReviewCount","todaySessions","workCyclesToday","isLongBreakNext"].forEach(name=>assert.ok(source.includes(`\"${name}\"`),name));
  assert.match(app,/readState:\(\)=>S/);assert.match(app,/subjects:\(\)=>ALL_SUBJECTS/);assert.match(entry,/installLegacyDomainBridge\(\)/);assert.match(entry,/domainServices:true/);assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
});

test("v4 ilerleme ekranı tür güvenli analiz ve sade tek bakış dashboard'u kullanır",()=>{
  const files=["src/domain/progress-analysis-service.ts","src/domain/legacy-progress-analysis-bridge.ts","src/ui/progress-dashboard.ts"],source=files.map(file=>{assert.equal(fs.existsSync(path.join(root,file)),true,file);return fs.readFileSync(path.join(root,file),"utf8");}).join("\n"),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8"),html=fs.readFileSync(path.join(root,"index.html"),"utf8"),css=fs.readFileSync(path.join(root,"app.css"),"utf8");
  assert.match(source,/analyzeProgress/);assert.match(source,/__YKS_PROGRESS_ANALYSIS__/);assert.match(source,/renderProgressDashboard/);assert.match(source,/dataLevel/);
  assert.match(entry,/installLegacyProgressAnalysisBridge\(\)/);assert.match(entry,/progressAnalysis:true/);
  ["v4ProgressOverview","v4SubjectInsights","v4ProgressRhythm","v4TopicsReviews","v4ProgressCoreGrid"].forEach(id=>assert.match(html,new RegExp(`id="${id}"`),id));
  assert.match(html,/Ayrıntılı analizleri göster/);assert.match(css,/v4-progress-core-grid/);assert.match(css,/v4-progress-detail-grid/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
});

test("v4 kararlı sürümü tarayıcı ve üretim paketi kontrollerini içerir",()=>{
  const release=fs.readFileSync(path.join(root,"src/release/release.ts"),"utf8"),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8"),legacy=fs.readFileSync(path.join(root,"modules/release-selftest.js"),"utf8"),verify=fs.readFileSync(path.join(root,"scripts/verify-release.mjs"),"utf8"),report=fs.readFileSync(path.join(root,"RELEASE.md"),"utf8");
  assert.match(release,/4\.0\.0/);assert.match(release,/SCREEN_IDS/);assert.match(release,/dexie-write-through/);assert.match(release,/firebase-payload/);assert.match(release,/firebase-download-path/);assert.match(release,/screen-transitions/);assert.match(release,/YKS_V4_RELEASE_OK/);
  assert.match(entry,/installReleaseRuntime\(\)/);assert.match(entry,/channel:"stable"/);assert.match(entry,/stableRelease:true/);assert.match(legacy,/v4-bootstrap/);assert.match(verify,/runTransaction as/);assert.match(report,/\?selftest=v4/);
});

test("CI ve Pages dağıtımı güncel eylemler, zaman aşımı ve canlı doğrulama kullanır",()=>{
  const ci=fs.readFileSync(path.join(root,".github/workflows/ci.yml"),"utf8"),deploy=fs.readFileSync(path.join(root,".github/workflows/deploy-pages.yml"),"utf8"),live=fs.readFileSync(path.join(root,"scripts/verify-live-pages.mjs"),"utf8");
  assert.match(ci,/pull_request:/);assert.match(ci,/cancel-in-progress: true/);assert.match(ci,/timeout-minutes: 10/);assert.match(ci,/npm run release:check/);
  [ci,deploy].forEach(workflow=>{assert.match(workflow,/actions\/checkout@v7/);assert.match(workflow,/actions\/setup-node@v7/);});
  assert.match(deploy,/actions\/configure-pages@v6/);assert.match(deploy,/actions\/upload-pages-artifact@v5/);assert.match(deploy,/actions\/deploy-pages@v5/);assert.match(deploy,/conclusion/);assert.match(deploy,/node scripts\/verify-live-pages\.mjs/);
  assert.match(live,/verifyLivePages/);assert.match(live,/YKS_V4_RELEASE_OK/);assert.match(live,/AbortSignal\.timeout/);
});

test("v4.0.0 kararlı sürümü geçici aday dosyası bırakmaz ve veri şemasını korur",()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8")),lock=JSON.parse(fs.readFileSync(path.join(root,"package-lock.json"),"utf8")),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8"),app=fs.readFileSync(path.join(root,"app.js"),"utf8");
  assert.equal(pkg.version,"4.0.0");assert.equal(lock.version,"4.0.0");assert.equal(lock.packages[""].version,"4.0.0");
  ["src/release/release-candidate.ts","scripts/verify-release-candidate.mjs","tests/release-candidate.test.js","RELEASE-CANDIDATE.md"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),false,file));
  ["src/release/release.ts","scripts/verify-release.mjs","tests/release.test.js","RELEASE.md"].forEach(file=>assert.equal(fs.existsSync(path.join(root,file)),true,file));
  assert.match(entry,/version:"4\.0\.0"/);assert.match(entry,/channel:"stable"/);assert.match(app,/const DATA_SCHEMA=21/);
});

test("kararlı tarayıcı self-test'i Vite'ın hash'li CSS paketini kabul eder",()=>{
  const selftest=fs.readFileSync(path.join(root,"modules/release-selftest.js"),"utf8");
  assert.match(selftest,/assets\/index-/);assert.match(selftest,/href\$="\.css"/);assert.match(selftest,/script\[src\^="\.\/app\.js"\]/);
});
