const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Konular ekranı eski kart makyajı yerine yeni Konu Haritasını lazy yükler",()=>{
  const screen=read("src/ui/screens/topics.ts");
  assert.match(screen,/import "\.\.\/topics-hub-v46\.css"/);
  assert.match(screen,/import\("\.\.\/topics-hub-v46"\)/);
  assert.match(screen,/topicsLegacyAdapter\.render\(environment\)/);
  assert.match(screen,/dataset\.topicsHubRuntime/);
  assert.doesNotMatch(screen,/topics-overview-v45/);
});

test("Konu Haritası legacy listeyi yalnız veri motoru olarak kullanır ve ayrı workspace çizer",()=>{
  const runtime=read("src/ui/topics-hub-v46.ts"),css=read("src/ui/topics-hub-v46.css");
  for(const marker of ["v46-topic-hero","v46-exam-switch","v46-topic-workspace","v46-subject-panel","v46-detail-panel","v46-detail-topics","v46-analysis"]){
    assert.ok(runtime.includes(marker),marker);
  }
  assert.match(runtime,/cloneNode\(true\)/);
  assert.match(runtime,/topicControls\(clone\)/);
  assert.match(css,/#topics\.v46-topics-ready>#subjectList[\s\S]*display:none!important/);
  assert.match(css,/grid-template-columns:minmax\(255px,320px\) minmax\(0,1fr\)/);
});

test("TYT AYT YDT seçimi büyük kartlarla çalışır ve legacy sınav motorunu korur",()=>{
  const runtime=read("src/ui/topics-hub-v46.ts");
  assert.match(runtime,/const EXAMS:ExamKind\[\]=\["TYT","AYT","YDT"\]/);
  assert.match(runtime,/v46-exam-card/);
  assert.match(runtime,/section\.querySelector<HTMLButtonElement>\(`#seg\$\{value\}`\)\?\.click\(\)/);
  assert.match(runtime,/Temel yeterlilik/);
  assert.match(runtime,/Alan yeterlilik/);
  assert.match(runtime,/Yabancı dil/);
});

test("müfredat takip listesi eksik TYT AYT ve YDT başlıklarını tamamlar",()=>{
  const runtime=read("src/ui/topics-hub-v46.ts");
  for(const topic of [
    "Sözel Mantık","Doğruda Açılar","Kimyasal Tepkimeler","Coğrafi Konum",
    "Parabol","Eşitsizlikler","Elektrik Alan ve Potansiyel","Kütle Çekim ve Kepler Yasaları",
    "Karbon Kimyasına Giriş","Genden Proteine","Canlılarda Enerji Dönüşümleri","Edebi Akımlar",
    "İngilizce → Türkçe Çeviri","Türkçe → İngilizce Çeviri","Paragraf Tamamlama","Anlatım Bütünlüğünü Bozan Cümle"
  ])assert.ok(runtime.includes(topic),topic);
  assert.match(runtime,/extras=\(previous\?\.topics\|\|\[\]\)\.filter/);
  assert.match(runtime,/CURRICULUM\[exam\]\.splice/);
  assert.match(runtime,/ALL_SUBJECTS\.splice/);
  assert.match(runtime,/SUBJ_NAMES\.splice/);
});

test("konu kontrolleri yeni geniş detayda okunaklı etiketlere dönüşür",()=>{
  const runtime=read("src/ui/topics-hub-v46.ts"),css=read("src/ui/topics-hub-v46.css");
  for(const label of ["İşledim","Soru çözdüm","Pekişti","Detay","Kaynak"]){assert.ok(runtime.includes(label),label);}
  assert.match(css,/\.v46-detail-topics \.topic-name-btn\{[\s\S]*overflow-wrap:break-word!important;[\s\S]*word-break:normal!important/);
  assert.match(css,/\.v46-detail-topics>\.topic\{[\s\S]*grid-template-columns:minmax\(260px,1fr\) auto/);
  assert.match(css,/@media\(max-width:1100px\)[\s\S]*\.v46-subject-list\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test("arama filtreleri ve legacy konu kayıt fonksiyonları yeniden yazılmaz",()=>{
  const runtime=read("src/ui/topics-hub-v46.ts"),html=read("index.html"),legacy=read("app.js");
  assert.match(html,/id="topicSearch"/);
  for(const id of ["tfAll","tfWork","tfReview","tfRisk","tfDone"])assert.ok(html.includes(`id="${id}"`),id);
  assert.match(legacy,/function setTopicQuery\(v\)/);
  assert.match(legacy,/function setTopicFilter\(/);
  assert.doesNotMatch(runtime,/function\s+tsetStatus|function\s+setConf|Firebase|Dexie/);
});
