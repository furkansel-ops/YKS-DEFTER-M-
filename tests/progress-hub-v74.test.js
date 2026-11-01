const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/progress-hub-v74.ts");
const css=read("src/ui/progress-hub-v74.css");

const CURRICULUM=[
  {exam:"TYT",name:"Matematik",topics:["Problemler","Fonksiyonlar","Üslü Sayılar"]},
  {exam:"TYT",name:"Fizik",topics:["Optik","Elektrik"]},
  {exam:"TYT",name:"Türkçe",topics:["Paragraf"]},
  {exam:"AYT",name:"Matematik (AYT)",topics:["Türev"]},
  {exam:"AYT",name:"Fizik (AYT)",topics:["Dalgalar"]},
  {exam:"AYT",name:"Edebiyat",topics:["Divan Edebiyatı"]}
];

// Modül DOM olmadan çalıştırılır; deneme analizi gerçek servisle, hata listesi sahte veriyle.
function load(S,{errors=[],queue=[]}={}){
  const strip=code=>stripTypeScriptTypes(code,{mode:"strip"}).replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,"");
  const calls=[];
  const window={YKSLegacyState:{readState:()=>S,subjects:()=>CURRICULUM},reviewQueue:()=>queue,doReview:(...a)=>calls.push(["doReview",...a]),addToToday:t=>calls.push(["addToToday",t]),toast(){}};
  const context={window,document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{},classList:{add(){},remove(){}}}},localStorage:{getItem:()=>null,setItem(){}},console,requestAnimationFrame:fn=>fn(),setTimeout:()=>0,queueMicrotask:fn=>fn(),Date,Math,Number,String,Array,Object,JSON,Map,Set,Intl,Infinity};
  vm.createContext(context);
  vm.runInContext(`${strip(read("src/domain/exam-analysis-service.ts"))}\nconst errorRows=()=>__errors;const openExamTab=()=>{};\n${strip(source)}\n;globalThis.__t={ranges,streak,subjectRows,topicState,trackSubjects,deltaText,attentionCard,hm,settledTopics,reviewsDoneOn};`,Object.assign(context,{__errors:errors}));
  return {t:context.__t,calls};
}
const plain=v=>JSON.parse(JSON.stringify(v));

test("v74 dönemler: bugün/dün, haftanın aynı günleri, ayın aynı günleri (kısa ayda sınırlı)",()=>{
  const {t}=load({});
  assert.deepEqual(plain(t.ranges("gun","2026-11-01")),{cur:{from:"2026-11-01",to:"2026-11-01"},prev:{from:"2026-10-31",to:"2026-10-31"}});
  assert.deepEqual(plain(t.ranges("hafta","2026-11-01")),{cur:{from:"2026-10-26",to:"2026-11-01"},prev:{from:"2026-10-19",to:"2026-10-25"}},"pazar günü haftanın son günü");
  assert.deepEqual(plain(t.ranges("hafta","2026-10-28")),{cur:{from:"2026-10-26",to:"2026-10-28"},prev:{from:"2026-10-19",to:"2026-10-21"}});
  assert.deepEqual(plain(t.ranges("ay","2026-03-31")),{cur:{from:"2026-03-01",to:"2026-03-31"},prev:{from:"2026-02-01",to:"2026-02-28"}});
  assert.deepEqual(plain(t.ranges("ay","2026-01-15")),{cur:{from:"2026-01-01",to:"2026-01-15"},prev:{from:"2025-12-01",to:"2025-12-15"}});
});

test("v74 seri bugün ya da dünden geriye sayılır; fark yazısı süre ve sayı için",()=>{
  const {t}=load({});
  const S={pomoMin:{"2026-10-30":40,"2026-10-31":20},solved:{"2026-10-29":10}};
  assert.equal(t.streak(S,"2026-11-01"),3,"bugün boşsa dünden başlar");
  assert.equal(t.streak(S,"2026-10-31"),3);
  assert.equal(t.streak({pomoMin:{}},"2026-11-01"),0);
  assert.deepEqual(plain(t.deltaText(675,789,true)),{text:"▼ 1 sa 54 dk",tone:"down"});
  assert.deepEqual(plain(t.deltaText(12,10)),{text:"▲ 2",tone:"up"});
  assert.deepEqual(plain(t.deltaText(5,5)),{text:"değişim yok",tone:""});
  assert.equal(t.hm(45),"45 dk");assert.equal(t.hm(120),"2 sa");
});

test("v74 dersler: AYT ve TYT aynı satırda; Fen deneme sonucu Fizik'e bağlanır; soru konudan, süre dersten",()=>{
  const S={puanTuru:"SAY",
    pomoSubj:{"2026-10-27":{"Matematik":60,"Matematik (AYT)":30,"Fizik":45}},
    solvedTopic:{"2026-10-27":{"TYT|Matematik|Problemler":20,"AYT|Matematik (AYT)|Türev":5,"TYT|Fizik|Optik":12}},
    topics:{"TYT|Matematik|Problemler":{st:3,ts:"2026-10-20",rev:[]},"TYT|Matematik|Fonksiyonlar":{st:2},"AYT|Fizik (AYT)|Dalgalar":{st:3,ts:"2026-10-01",rev:[]}},
    denemeler:[1,2].map(i=>({id:i,type:"TYT",name:"D"+i,date:"2026-10-1"+i,totalNet:60,subjectResults:[{name:"Temel Matematik",d:20,y:8,b:12,net:18,cap:40},{name:"Fen Bilimleri",d:10,y:4,b:6,net:9,cap:20}]}))};
  const errors=[{subject:"Matematik",topic:"Problemler",n:7,resolved:false},{subject:"Fizik",topic:"Optik",n:4,resolved:true}];
  const {t}=load(S,{errors});
  const rows=t.subjectRows(S,{from:"2026-10-26",to:"2026-11-01"}),byName=Object.fromEntries(rows.map(r=>[r.name,r]));
  assert.deepEqual(Array.from(rows,r=>r.name).slice(0,2),["Matematik","Fizik"],"en çok çalışılan önce");
  assert.equal(byName.Matematik.minutes,90);assert.equal(byName.Matematik.questions,25);
  assert.equal(byName.Matematik.total,4,"TYT 3 + AYT 1 konu");assert.equal(byName.Matematik.done,1);
  assert.equal(byName.Matematik.tyt,45);assert.equal(byName.Matematik.tytLabel,"Mat");
  assert.equal(byName.Matematik.openWrong,7);assert.equal(byName.Matematik.topWrong,"Problemler");
  assert.equal(byName.Fizik.tyt,45);assert.equal(byName.Fizik.tytLabel,"Fen","Fizik satırı TYT Fen sonucunu gösterir");
  assert.equal(byName.Fizik.openWrong,0,"çözülen yanlış sayılmaz");
  assert.equal(byName.Fizik.done,1,"AYT Fizik konusu da sayılır");
  assert.equal(byName.Edebiyat,undefined,"Sayısal öğrencide Edebiyat yok");
});

test("v74 konu durumu: tekrarı gelen ya da açık yanlışı olan konu 'tekrar gerekli'; sonra pekişti, devam, eksik",()=>{
  const S={topics:{"TYT|Matematik|Problemler":{st:3},"TYT|Matematik|Fonksiyonlar":{st:1},"TYT|Türkçe|Paragraf":{st:3}}};
  const {t}=load(S);
  const due=new Set(["TYT|Türkçe|Paragraf"]),wrong=new Set(["matematik|üslü sayılar"]);
  assert.equal(t.topicState(S,"TYT|Türkçe|Paragraf",due,wrong),"review");
  assert.equal(t.topicState(S,"TYT|Matematik|Üslü Sayılar",due,wrong),"review","açık yanlış");
  assert.equal(t.topicState(S,"TYT|Matematik|Problemler",due,wrong),"done");
  assert.equal(t.topicState(S,"TYT|Matematik|Fonksiyonlar",due,wrong),"active");
  assert.equal(t.topicState(S,"TYT|Fizik|Optik",due,wrong),"missing");
  assert.deepEqual(Array.from(t.trackSubjects({puanTuru:"EA"}),c=>c.name),["Matematik","Fizik","Türkçe","Matematik (AYT)","Edebiyat"]);
});

test("v74 pekişen konu ve tamamlanan tekrar tarihleri dönemden sayılır",()=>{
  const S={topics:{a:{st:3,ts:"2026-10-28"},b:{st:3,ts:"2026-10-10"},c:{st:2,ts:"2026-10-28"},d:{st:3,ts:"2026-10-20",revDone:{0:"2026-11-01",1:"2026-10-25"}}}};
  const {t}=load(S);
  assert.equal(t.settledTopics(S,{from:"2026-10-26",to:"2026-11-01"}),1);
  assert.equal(t.reviewsDoneOn(S,"2026-11-01"),1);
});

test("v74 dikkat kartı: tek ders, tek cümle; eylem düğmeleri programa ekler ve Hatalar'a gider",()=>{
  const S={puanTuru:"SAY",pomoSubj:{},solvedTopic:{},topics:{},
    denemeler:[1,2,3].map(i=>({id:i,type:"TYT",name:"D"+i,date:"2026-10-1"+i,totalNet:60,subjectResults:[{name:"Temel Matematik",d:15,y:10,b:15,net:12.5,cap:40},{name:"Türkçe",d:34,y:4,b:2,net:33,cap:40}]}))};
  const {t}=load(S,{errors:[{subject:"Matematik",topic:"Problemler",n:7,resolved:false}]});
  const rows=t.subjectRows(S,{from:"2026-10-26",to:"2026-11-01"}),html=t.attentionCard(S,rows);
  assert.match(html,/<b>Matematik<\/b><p>3 denemede TYT Mat %31 başarı, 7 açık yanlış \(en çok Problemler\)\. Bu hafta bu derse çalışma kaydı yok\.<\/p>/);
  assert.equal((html.match(/Matematik/g)||[]).length,2,"başlık + programa ekle metni; tekrar yok");
  assert.match(html,/data-plan="Matematik Problemler tekrar"/);
  assert.match(html,/data-errors="1"/);
  const calm=load({puanTuru:"SAY",denemeler:[1,2].map(i=>({id:i,type:"TYT",date:"2026-10-1"+i,totalNet:110,subjectResults:[{name:"Türkçe",d:39,y:0,b:1,net:39,cap:40}]}))}).t;
  assert.equal(calm.attentionCard({puanTuru:"SAY"},calm.subjectRows({puanTuru:"SAY",denemeler:[]},{from:"2026-10-26",to:"2026-11-01"})),"","iyi gidiyorsa kart yok");
});

test("v74 kurulum: eski ekran gizlenir (silinmez), geri düğmesi üstte, raporlar kimlikleriyle taşınır",()=>{
  const shell=read("src/ui/refined-shell.ts"),secondary=read("src/ui/refined-secondary.ts");
  assert.match(shell,/try\{installProgressHubV74\(\);\}catch\(error\)\{console\.error\("v74 ilerleme ekranı",error\);\}/);
  assert.match(secondary,/node\.matches\("\.rb-back,#v43AnalysisCenter,#refinedProgressDetails,\[data-progress-hub\]"\)/);
  assert.match(css,/#progress\[data-progress-hub\]>#v43AnalysisCenter,#progress \.ph-dup\{display:none!important\}/);
  assert.match(source,/if\(back&&root\.firstElementChild!==back\)root\.prepend\(back\);/);
  for(const id of ["v24Records","v28Calendar","progressForecast","v28Milestones"])assert.ok(source.includes(`"${id}"`),id);
  for(const title of ["Net değişimi","Ders bazlı durum","Haftalık gelişim","Tekrarlayan yanlışlar"])assert.ok(source.includes(`"${title}"`),title);
  assert.doesNotMatch(source,/\.remove\(\)/,"eski bölümler silinmez");
  assert.doesNotMatch(source,/S\.(pomoMin|solved|topics)\s*=|\.st\s*=|localStorage\.setItem\("yks"/,"öğrenci verisine doğrudan yazılmaz");
});
