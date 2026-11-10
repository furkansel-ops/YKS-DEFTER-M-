const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js");
// app.js'teki çok satırlı bir fonksiyonu kaynağından alır ("\n}" ile biter).
const fn=name=>{const m=app.match(new RegExp("function "+name+"\\([^)]*\\)\\{[\\s\\S]*?\\n\\}"));assert.ok(m,name);return m[0];};

test("her derse bir simge düşer; tanınmayan ders kitap simgesi alır",()=>{
  const icon=vm.runInNewContext("("+fn("v105SubjectIcon")+")");
  const names=[...app.slice(app.search(/CURRICULUM\s*=\s*\{/)).slice(0,60000).matchAll(/name:"([^"]+)"/g)].map(m=>m[1]);
  assert.ok(names.includes("Türkçe")&&names.includes("Yabancı Dil"),"müfredat adları okundu");
  const css=read("src/ui/topics-v105.css");
  for(const name of new Set(names)){
    const ic=icon(name);
    if(ic!=="kitap")assert.ok(css.includes(`[data-v105-ic="${ic}"]{--v105-ic:var(--i105-${ic})}`),name+" → "+ic);
    assert.ok(css.includes(`--i105-${ic}:url(`),ic);
  }
  assert.equal(icon("Türkçe"),"tr");assert.equal(icon("Matematik (AYT)"),"mat");assert.equal(icon("Tarih-2"),"tar");
  assert.equal(icon("Felsefe Grubu"),"fel");assert.equal(icon("Yabancı Dil"),"dil");assert.equal(icon("Din Kültürü"),"kitap");
  assert.equal(icon("Bilinmeyen"),"kitap");assert.equal(icon(null),"kitap");
});

test("ders sıralaması görünümü değiştirir, ders kimliğini (müfredat sırası) korur",()=>{
  const stats={A:{full:1,total:10,pct:20},B:{full:5,total:6,pct:90},Ç:{full:0,total:10,pct:5},C:{full:2,total:3,pct:70}};
  const box={CURRICULUM:{TYT:["B","Ç","A","C"].map(name=>({name,topics:[]}))},subjStat:(exam,s)=>stats[s.name]};
  vm.runInNewContext('let v105TopicSort="curriculum";function renderSubjects(){}\n'+app.match(/function setTopicSort\(m\)\{.*\}/)[0]+"\n"+fn("v105SortSubjects")+"\nthis.sort=m=>{setTopicSort(m);return v105SortSubjects('TYT').map(r=>r.s.name+r.si).join(' ')};",box);
  assert.equal(box.sort("curriculum"),"B0 Ç1 A2 C3");
  assert.equal(box.sort("remaining"),"Ç1 A2 C3 B0","en çok kalan; eşitlikte ilerlemesi düşük önce");
  assert.equal(box.sort("progress"),"B0 C3 A2 Ç1");
  assert.equal(box.sort("name"),"A2 B0 C3 Ç1","Türkçe alfabe");
  assert.equal(box.sort("bozuk"),"B0 Ç1 A2 C3","bilinmeyen kip müfredat sırasına döner");
  assert.equal(vm.runInNewContext(fn("v105SortSubjects")+"\nv105SortSubjects('YDT').length",{CURRICULUM:{},v105TopicSort:"name"}),0);
});

test("ders kartı erişilebilir düğmedir ve açık ders yeniden çizimde hatırlanır",()=>{
  assert.match(app,/let v105OpenSubj="",v105TopicSort="curriculum";/);
  assert.match(app,/open=!!q\|\|v26TopicFilter!=="all"\|\|v105OpenSubj===id/);
  assert.match(app,/<button type="button" class="subj-head" aria-expanded="'\+open\+'" aria-controls="tp'\+id\+'"/);
  assert.match(app,/class="topics'\+\(open\?' open':''\)\+'" id="tp'\+id\+'"/);
  const toggle=fn("toggleSubj");
  assert.match(toggle,/solo=!topicQuery&&v26TopicFilter==="all"/,"arama ve filtrede bütün dersler açık kalır");
  assert.match(toggle,/if\(solo&&open\)document\.querySelectorAll\("#subjectList \.topics\.open"\)/,"tek ders açık");
  assert.match(toggle,/if\(solo\)v105OpenSubj=open\?i:""/);
  assert.match(toggle,/setAttribute\("aria-expanded",String\(on\)\)/);
});

test("konu satırı yazılı adımlar, durum halkası ve düğme yıldızlarla çizilir",()=>{
  const row=fn("topicRow");
  assert.match(row,/\["İşledim","Soru","Pekişti"\]\[i-1\]/);
  assert.match(row,/aria-pressed="'\+\(t\.st>=i\)\+'"/);
  assert.match(row,/<button type="button" class="star /);
  assert.match(row,/aria-label="Güven '\+i\+' \/ 5"/);
  assert.match(row,/data-st="'\+t\.st\+'"><i class="v105-ring" aria-hidden="true"><\/i>/);
  assert.match(row,/\.filter\(Boolean\)\.join\(' · '\)\|\|'Henüz çalışma yok'/);
  assert.doesNotMatch(row,/konu etiketli çalışma yok|yanlış kaydı yok|3–7–21 tamamlanınca/);
  // Eski işleyiciler aynı: veri yolu değişmedi.
  assert.match(row,/onclick="cycleTopic\(/);assert.match(row,/onclick="setConf\(/);assert.match(row,/onclick="openTopicDetail\(/);assert.match(row,/openRes\(/);
});

test("özet, sıralama ve tekrar kısayolu sayfada; arama ve filtreler yerinde",()=>{
  const html=read("index.html");
  for(const id of ["topicSearch","tfAll","tfWork","tfReview","tfRisk","tfDone","v105TopicSummary","v105TopicSortBox","v105TopicSort"])assert.ok(html.includes(`id="${id}"`),id);
  // Özetin içi app.js'te bir kez kurulur: index.html açılış bütçesi (180 KB) dolu.
  for(const id of ["v105SumRing","v105SumTitle","v105SumText","v105RevLink"])assert.ok(app.includes(`id="${id}"`),id);
  assert.match(app,/if\(sum&&!sum\.firstChild\)sum\.innerHTML=/);
  assert.match(html,/id="v105TopicSort" aria-label="Dersleri sırala" onchange="setTopicSort\(this\.value\)"/);
  for(const mode of ["curriculum","remaining","progress","name"])assert.ok(html.includes(`<option value="${mode}">`),mode);
  assert.match(app,/id="v105RevLink" hidden onclick="v105OpenReviews\(\)"/);
  assert.match(app,/function setTopicQuery\(v\)/);assert.match(app,/function setTopicFilter\(/);
  assert.match(app,/ring\.style\.setProperty\("--v105-p",pct\)/);
  // Sayaç iki yerden dolar (konu tekrarları + Hata Defteri); kısayol ikisinden sonra da eşitlenir.
  assert.match(app,/el\("revCount"\)\.textContent=q\.length;v105SyncReviews\(\);/);
  assert.match(read("modules/error-journal.js"),/count\.textContent=String\(base\+list\.length\);window\.v105SyncReviews\?\.\(\);/);
});

test("yeni görünüm en son yüklenir, eski v45 süsleyicisi kalmaz ve ekran sırası yenidir",()=>{
  const main=read("src/main.ts"),screen=read("src/ui/screens/topics.ts"),study=read("src/ui/refined-study-screens.ts");
  assert.match(main,/import "\.\/ui\/type-v102\.css";\nimport "\.\/ui\/topics-v105\.css";/);
  assert.doesNotMatch(screen,/topics-overview-v45/);
  assert.match(screen,/topicsLegacyAdapter\.render\(environment\)/);
  assert.ok(!fs.existsSync(path.join(root,"src/ui/topics-overview-v45.ts")));
  assert.match(study,/for\(const item of \[tabs,summary,tools,subjects,topicMore\.details\]\)/);
  assert.match(study,/if\(sort&&sort\.parentElement!==title\)title\.append\(sort\)/);
  assert.match(study,/if\(to==="topics"\)playTopicsEnter\(\)/);
});

test("stil tema belirteçleriyle boyanır; hareketler yalnız izin varken ve ekrana girişte oynar",()=>{
  const css=read("src/ui/topics-v105.css");
  const colors=css.replace(/url\("data:[^"]*"\)/g,"").match(/#[0-9a-f]{3,8}\b/gi)||[];
  assert.deepEqual(colors,["#f59e0b"],"tek ham renk --time yedeği");
  const at=css.indexOf("@media(prefers-reduced-motion:no-preference)"),motion=css.slice(at);
  for(const part of css.slice(0,at).split("}"))assert.doesNotMatch(part,/[^-]animation:(?!none)/,"hareket izin bloğunun dışında: "+part.slice(0,60));
  assert.match(motion,/#topics\[data-v105-enter\] #subjectList>\.subj\{animation:v105-rise/);
  assert.match(motion,/\.topics\.open\[data-v105-just\]\{animation:v105-rise/);
  assert.match(css,/#topics \.topic \.tinfo\{display:contents\}/);
  assert.match(css,/#subjectList>\.subj:has\(>\.topics\.open\)\{grid-column:1\/-1\}/);
  assert.match(css,/\.topic-name-btn\{[^}]*overflow-wrap:break-word;word-break:normal/,"başlık harf harf kırılmaz");
});
