const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Konular ekranı yeni özet katmanını yalnız ekran açıldığında dinamik yükler",()=>{
  const screen=read("src/ui/screens/topics.ts");
  assert.match(screen,/import "\.\.\/topics-overview-v45\.css"/);
  assert.match(screen,/import\("\.\.\/topics-overview-v45"\)/);
  assert.match(screen,/topicsLegacyAdapter\.render\(environment\)/);
  assert.match(screen,/dataset\.topicsOverviewRuntime/);
  assert.doesNotMatch(read("src/main.ts"),/import \{?installTopicsOverviewV45/);
});

test("ders kartları tam konu listesini özet kartından ayırır",()=>{
  const runtime=read("src/ui/topics-overview-v45.ts");
  for(const marker of ["v45-subject-summary","v45-subject-stats","v45-topic-preview","v45-subject-open","v45-subject-detail-head"]){
    assert.ok(runtime.includes(marker),marker);
  }
  assert.match(runtime,/names\.slice\(0,3\)/);
  assert.match(runtime,/Kalan konu/);
  assert.match(runtime,/Çalışılıyor/);
  assert.match(runtime,/İlerleme/);
  assert.match(runtime,/Konuları aç/);
  assert.match(runtime,/toggleCard\(card/);
});

test("açılan ders kartı diğer açık kartı kapatır ve gerçek legacy konu kontrollerini korur",()=>{
  const runtime=read("src/ui/topics-overview-v45.ts");
  assert.match(runtime,/querySelectorAll<HTMLElement>\("\.subj\.is-expanded"\)/);
  assert.match(runtime,/classList\.remove\("open"\)/);
  assert.match(runtime,/source\?\.click\(\)/);
  assert.match(runtime,/\.topics>\.topic \.topic-name-btn/);
  assert.doesNotMatch(runtime,/tsetStatus|setConf|Firebase|Dexie/);
});

test("konu başlıkları tablet ve PC görünümünde harf harf kırılmaz",()=>{
  const css=read("src/ui/topics-overview-v45.css");
  assert.match(css,/\.subj\.is-expanded \.topic\{[\s\S]*grid-template-columns:minmax\(280px,1fr\) auto/);
  assert.match(css,/\.subj\.is-expanded \.topic-name-btn\{[\s\S]*overflow-wrap:break-word;[\s\S]*word-break:normal;[\s\S]*hyphens:none/);
  assert.match(css,/@media\(min-width:760px\) and \(max-width:1179px\)[\s\S]*repeat\(2,minmax\(300px,1fr\)\)/);
  assert.match(css,/@media\(min-width:1180px\)[\s\S]*repeat\(3,minmax\(300px,1fr\)\)/);
  assert.match(css,/\.is-expanded\{[\s\S]*grid-column:1\/-1/);
});

test("mevcut Konular araması ve filtreleri değiştirilmeden kalır",()=>{
  const legacy=read("app.js"),html=read("index.html"),runtime=read("src/ui/topics-overview-v45.ts");
  assert.match(legacy,/function setTopicQuery\(v\)/);
  assert.match(legacy,/function setTopicFilter\(/);
  assert.match(html,/id="topicSearch"/);
  for(const id of ["tfAll","tfWork","tfReview","tfRisk","tfDone"])assert.ok(html.includes(`id="${id}"`),id);
  assert.match(runtime,/Dersleri sırala/);
  assert.match(runtime,/Müfredat sırası/);
  assert.match(runtime,/En çok kalan/);
  assert.match(runtime,/İlerlemesi yüksek/);
});

test("MutationObserver kendi sıralama hareketlerini tekrar render döngüsüne sokmaz",()=>{
  const runtime=read("src/ui/topics-overview-v45.ts");
  assert.match(runtime,/containsFreshSubject/);
  assert.match(runtime,/record\.addedNodes/);
  assert.match(runtime,/\.subj:not\(\[\$\{POLISHED_ATTR\}\]\)/);
  assert.match(runtime,/if\(fresh\)schedule\(\)/);
});
