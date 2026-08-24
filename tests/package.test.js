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
  assert.match(html,/src="\.\/app\.js"/);assert.match(app,/const APP_VERSION="3\.2\.7"/);assert.match(app,/const DATA_SCHEMA=21/);
  assert.equal(version.version,"3.2.7");assert.equal(version.schema,21);assert.match(sw,/yks-core-v3\.2\.7/);
  ["app.css","app.js","modules/core-utils.js","modules/stability.js","modules/topic-guides.js","modules/learning-lab.js","modules/target-center.js","modules/export-center.js","modules/release-selftest.js"].forEach(asset=>assert.ok(sw.includes(asset),asset));
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
