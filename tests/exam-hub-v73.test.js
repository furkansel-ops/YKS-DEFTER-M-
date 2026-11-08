const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/exam-hub-v73.ts");
const css=read("src/ui/exam-hub-v73.css");

// Modül DOM olmadan çalıştırılır; öğrenme döngüsü servisi gerçek koduyla yüklenir.
function load(S,{fields={},kind="",journalAdd,reviews=[]}={}){
  const calls=[],journal={adds:[],toggles:[]};
  const strip=code=>stripTypeScriptTypes(code,{mode:"strip"}).replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,"");
  const cycle=strip(read("src/domain/learning-cycle-analysis-service.ts"));
  const hub=strip(source);
  const window={
    YKSLegacyState:{readState:()=>S,save:()=>calls.push("save"),subjects:()=>[{exam:"TYT",name:"Matematik",topics:["Problemler","Üslü Sayılar"]},{exam:"TYT",name:"Fizik",topics:["Optik"]}]},
    YKSErrorJournal:{
      add:(data,opts)=>{journal.adds.push({data,opts});const item=journalAdd?journalAdd(data):{id:"err_new",...data,resolved:false};(S.errorJournal||(S.errorJournal=[])).unshift(item);return item;},
      openReviews:()=>reviews,render:()=>{}
    },
    errorJournalToggle:id=>{journal.toggles.push(id);const j=S.errorJournal.find(x=>x.id===id);if(j){j.resolved=!j.resolved;j.resolvedAt=j.resolved?Date.now():0;}},
    pushUndo:(label,restore)=>calls.push({label,restore})
  };
  const document={getElementById:id=>fields[id]??null,querySelector:sel=>sel.includes("ehErrKind")?{value:kind}:null,querySelectorAll:()=>[],documentElement:{dataset:{}}};
  const context={window,document,localStorage:{getItem:()=>null,setItem(){}},confirm:()=>true,console,requestAnimationFrame:fn=>fn(),setTimeout:()=>0,Date,Math,Number,String,Array,Object,JSON,Map,Set,Intl,Infinity,isNaN,parseInt};
  vm.createContext(context);
  vm.runInContext(`${cycle}\nconst analyzeExams=()=>({count:0});\n${hub}\n;globalThis.__t={errorRows,saveError,toggleError,deleteError,trendSvg,compareRows,loopStats,canonical,AYT_FIELD,curriculum};`,context);
  return {t:context.__t,calls,journal};
}
const T=(n)=>{const d=new Date(Date.now()-n*864e5);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};

test("v73 tek Hata Defteri: yanlış kaydı ve Hata Defteri karşılığı tek satır; yalnız Hata Defteri kaydı da listede",()=>{
  const S={
    denemeler:[{id:11,type:"TYT",name:"3D TYT-3",date:T(3),totalNet:84,subjectResults:[]}],
    wrongLog:[{id:1,date:T(3),subject:"Matematik",topic:"Problemler",n:7,deneme:11,kind:"bilmiyordum",note:"",questionImgs:["data:image/jpeg;base64,AAAA"]},
              {id:2,date:T(1),subject:"Fizik",topic:"Optik",n:4,note:"ışın çizimi"}],
    errorJournal:[{id:"err_a",sourceRef:"wrong:1",subject:"Matematik",topic:"Problemler",type:"Bilgi eksiği",note:"7 yanlış deneme analizinden aktarıldı",resolved:true,createdAt:Date.now()-3*864e5},
                  {id:"err_b",subject:"Türkçe",topic:"Paragraf",type:"Yorum",count:2,note:"kökü yanlış okudum",resolved:false,createdAt:Date.now()-5*864e5}]
  };
  const {t}=load(S),rows=t.errorRows();
  assert.deepEqual(Array.from(rows,r=>r.key),["w2","w1","jerr_b"],"yeniden eskiye; karşılığı olan Hata Defteri kaydı ikinci kez çıkmaz");
  const [optik,problem,paragraf]=rows;
  assert.equal(problem.resolved,true,"çözüldü bilgisi Hata Defteri karşılığından okunur");
  assert.equal(problem.exam,"3D TYT-3");assert.equal(problem.reason,"Bilgi eksiği");assert.equal(problem.photos,1);
  assert.equal(problem.note,"","otomatik aktarım notu gösterilmez");
  assert.equal(optik.reason,"","sebep seçilmediyse yazılmaz");assert.equal(optik.resolved,false);assert.equal(optik.note,"ışın çizimi");
  assert.equal(paragraf.kind,"journal");assert.equal(paragraf.reason,"Yorum");assert.equal(paragraf.n,2);
});

test("v73 hata ekleme: yanlış kaydı + denemeye bağ + Hata Defteri karşılığı (tekrar listesi) birlikte yazılır",()=>{
  const S={denemeler:[{id:11,type:"TYT",name:"3D TYT-3",date:"2026-10-29"}],wrongLog:[],errorJournal:[]};
  const fields={ehErrSubject:{value:"Matematik"},ehErrTopic:{value:" Üslü Sayılar "},ehErrCount:{value:"3"},ehErrNote:{value:"işaret hatası"},ehErrReview:{checked:true},ehErrExam:{value:"11"}};
  const {t,calls,journal}=load(S,{fields,kind:"dikkat"});
  t.saveError();
  assert.equal(S.wrongLog.length,1);
  const w=S.wrongLog[0];
  assert.deepEqual({subject:w.subject,topic:w.topic,n:w.n,kind:w.kind,deneme:w.deneme,date:w.date,note:w.note,photos:w.questionImgs.length},{subject:"Matematik",topic:"Üslü Sayılar",n:3,kind:"dikkat",deneme:11,date:"2026-10-29",note:"işaret hatası",photos:0});
  assert.equal(journal.adds.length,1);
  const a=journal.adds[0].data;
  assert.equal(a.sourceRef,"wrong:"+w.id);assert.equal(a.review,true);assert.equal(a.type,"Dikkat");assert.equal(a.count,3);assert.equal(a.denemeId,11);
  assert.ok(calls.includes("save"));
});

test("v73 hata ekleme: ders ya da konu boşsa hiçbir şey yazılmaz; sebep yalnız izinli üç değerden",()=>{
  const S={denemeler:[],wrongLog:[],errorJournal:[]};
  const {t,journal}=load(S,{fields:{ehErrSubject:{value:"Fizik"},ehErrTopic:{value:"  "},ehErrCount:{value:"1"}}});
  t.saveError();assert.equal(S.wrongLog.length,0);assert.equal(journal.adds.length,0);
  assert.match(source,/\[\["","Belirtme"\],\["bilmiyordum","Bilgi eksiği"\],\["dikkat","Dikkat"\],\["sure","Süre"\]\]/);
});

test("v73 çözüldü işareti Hata Defteri'nde tutulur; karşılığı yoksa önce oluşturulur, tekrar listesine eklenmez",()=>{
  const S={denemeler:[],wrongLog:[{id:5,date:"2026-10-30",subject:"Fizik",topic:"Optik",n:2,kind:"sure"}],errorJournal:[]};
  const {t,journal}=load(S);
  t.toggleError("w5");
  assert.equal(journal.adds.length,1);
  assert.equal(journal.adds[0].data.sourceRef,"wrong:5");assert.equal(journal.adds[0].data.review,false);assert.equal(journal.adds[0].data.type,"Süre");
  assert.deepEqual(journal.toggles,["err_new"]);
  assert.equal(t.errorRows()[0].resolved,true);
  t.toggleError("w5");
  assert.equal(journal.adds.length,1,"ikinci kez karşılık oluşturulmaz");assert.equal(t.errorRows()[0].resolved,false);
});

test("v73 silme: yanlış, karşılığı ve tekrarı birlikte gider; geri al hepsini geri koyar",()=>{
  const S={denemeler:[],wrongLog:[{id:9,date:"2026-10-30",subject:"Matematik",topic:"Problemler",n:1}],
    errorJournal:[{id:"err_9",sourceRef:"wrong:9",subject:"Matematik",topic:"Problemler",resolved:false}],
    manualReviews:[{id:"rev_err_9",journalId:"err_9",completedAt:0},{id:"rev_other",journalId:"err_x",completedAt:0}]};
  const {t,calls}=load(S);
  t.deleteError("w9");
  assert.equal(S.wrongLog.length,0);assert.equal(S.errorJournal.length,0);assert.deepEqual(S.manualReviews.map(r=>r.id),["rev_other"]);
  const undo=calls.find(c=>c&&c.label==="Hata kaydı silindi");assert.ok(undo);
  undo.restore();
  assert.equal(S.wrongLog.length,1);assert.equal(S.errorJournal[0].id,"err_9");assert.deepEqual(S.manualReviews.map(r=>r.id).sort(),["rev_err_9","rev_other"]);
});

test("v73 net grafiği: hedef çizgisi, her noktada net, okunur yazılar; hedef yoksa çizgi yok",()=>{
  const exams=[68,74,79,84].map((n,i)=>({id:i+1,type:"TYT",name:"D"+i,date:`2026-10-0${i+1}`,totalNet:n}));
  let {t}=load({targetNetTYT:90,targetNet:90});
  const svg=t.trendSvg(exams);
  assert.match(svg,/class="eh-target"/);assert.match(svg,/Hedef 90/);
  for(const n of [68,74,79,84])assert.match(svg,new RegExp(`class="eh-val"[^>]*>${n}<`));
  assert.match(svg,/aria-label="TYT net grafiği, son 4 deneme"/);
  assert.doesNotMatch(t.trendSvg([{...exams[0],type:"YDT"}]),/eh-target/);
  ({t}=load({}));assert.doesNotMatch(t.trendSvg(exams),/eh-target/);
  assert.match(t.trendSvg([]),/Bu türde deneme eklediğinde/);
  assert.match(css,/\.eh-trend \.eh-axis\{fill:var\(--d-muted,#5f6b80\);font-size:11px/);
  assert.match(css,/\.eh-trend \.eh-val\{fill:var\(--d-ink,#121a2b\);font-size:12px/);
});

test("v73 iki deneme karşılaştırma: toplam, yanlış, boş, süre ve ders farkı; süre ve yanlışta azalma iyi",()=>{
  const {t}=load({});
  const a={totalNet:79,dur:142,subjectResults:[{name:"Türkçe",d:33,y:8,b:-0,net:31},{name:"Fen Bilimleri",d:12,y:9,b:0,net:9.75}]};
  const b={totalNet:84,dur:138,subjectResults:[{name:"Türkçe",d:34,y:7,b:0,net:32.25},{name:"Fen Bilimleri",d:12,y:5,b:3,net:10.75}]};
  const html=t.compareRows(a,b);
  assert.match(html,/Toplam net<\/span><small>79 → 84<\/small><b class="up">\+5<\/b>/);
  assert.match(html,/Yanlış<\/span><small>17 → 12<\/small><b class="up">-5<\/b>/);
  assert.match(html,/Süre<\/span><small>142 → 138<\/small><b class="up">-4 dk<\/b>/);
  assert.match(html,/Türkçe<\/span><small>31 → 32\.25<\/small><b class="up">\+1\.25<\/b>/);
});

test("v73 öğrenme döngüsü: açık yanlış, eksik konu, bekleyen tekrar ve kontrol bekleyen konu sayılır",()=>{
  const S={denemeler:[{id:1,type:"TYT",date:"2026-10-20"}],
    wrongLog:[{id:1,date:"2026-10-20",subject:"Matematik",topic:"Problemler",n:7},{id:2,date:"2026-10-21",subject:"Fizik",topic:"Optik",n:4}],
    errorJournal:[{id:"err_2",sourceRef:"wrong:2",subject:"Fizik",topic:"Optik",resolved:true,resolvedAt:Date.parse("2026-10-25"),createdAt:Date.parse("2026-10-21")}]};
  const {t}=load(S,{reviews:[{id:"rev_1",topic:"Problemler",completedAt:0}]});
  const loop=t.loopStats();
  assert.deepEqual({records:loop.records,topics:loop.topics,reviews:loop.reviews,check:loop.check},{records:7,topics:1,reviews:1,check:1});
  assert.equal(loop.hint,"Problemler tekrarı seni bekliyor.");
});

test("v73 AYT dersleri alana göre; ders adları denemeyle eşleşir; müfredat konuları önerilir",()=>{
  const {t}=load({});
  assert.deepEqual(Array.from(t.AYT_FIELD.SAY),["Matematik","Fizik","Kimya","Biyoloji"]);
  assert.deepEqual(Array.from(t.AYT_FIELD.EA),["Matematik","Edebiyat","Tarih-1","Coğrafya-1"]);
  assert.equal(t.AYT_FIELD.SOZ.length,7);
  assert.equal(t.canonical("Temel Matematik"),"Matematik");assert.equal(t.canonical("Fizik (AYT)"),"Fizik");
  assert.deepEqual(Array.from(t.curriculum().get("Matematik")),["Problemler","Üslü Sayılar"]);
  assert.match(source,/row\.classList\.toggle\("eh-off-field",!!field&&!field\.includes\(name\)&&!filled\)/,"değer girilmiş satır gizlenmez");
  assert.match(css,/#v315ExamFormCard\.eh-all-subjects \.eh-off-field\{display:grid!important\}/);
});

test("v73 kurulum: kabuk modülü kurar, eski düzenleyici yeni bölmelere dokunmaz, eski kartlar silinmez yalnız gizlenir",()=>{
  const shell=read("src/ui/refined-shell.ts"),study=read("src/ui/refined-study-screens.ts");
  assert.match(shell,/installRefinedStudyScreens\(\);\n  try\{installExamHubV73\(\);\}catch\(error\)\{console\.error\("v73 deneme ekranı",error\);\}/);
  assert.match(study,/child\.dataset\.examHub!==undefined\)continue;/);
  assert.match(source,/L\.v315TrendSVG=trendSvg;/);
  assert.match(source,/wrap\("addDeneme",afterSave,\(\)=>list\(state\(\)\.denemeler\)\.length\);/);
  assert.match(source,/if\(wrongTotal\(added\)>0&&overlay&&overlay\.style\.display!=="flex"\)call\("openAnalysis",added\.id,true\);/);
  assert.match(css,/#deneme \.eh-dup\{display:none!important\}|#deneme \.eh-pane\[hidden\],#deneme \.eh-dup\{display:none!important\}/);
  assert.doesNotMatch(source,/\.remove\(\);?\s*\/\/ eski/);
  assert.ok(source.includes('const gun=byId("denemeGun")?.closest<HTMLElement>(".card");'),"deneme günü ayarlara taşınır");
  assert.ok(source.includes('for(const key of ["kalib","kat"]){\n    const head=byId(`fh_${key}`),fold=byId(`fb_${key}`);'),"gerçek sonuçla ayarla ve katsayılar ayarlara taşınır");
});

test("v73 koça doğru/yanlış/boş da gider; yeni sürüm yükleyicide",()=>{
  const runtime=read("public/student-coaching-runtime.js"),loader=read("src/ui/student-account-loader.ts");
  assert.match(runtime,/subjectResults:list\(d\?\.subjectResults\)\.slice\(0,16\)\.map\(x=>\(\{name:text\(x\?\.name,60\),net:finite\(x\?\.net\),d:Math\.max\(0,Math\.floor\(finite\(x\?\.d\)\)\),y:Math\.max\(0,Math\.floor\(finite\(x\?\.y\)\)\),b:Math\.max\(0,Math\.floor\(finite\(x\?\.b\)\)\)\}\)\)/);
  assert.match(runtime,/version:"1.2.32"/);
  assert.match(loader,/"\.\/student-coaching-runtime\.js\?v=1.2.32"/);
});
