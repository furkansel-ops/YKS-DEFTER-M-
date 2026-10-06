const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const core=require("../modules/core-utils.js");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("program görev süresi dakika ve saat ifadelerinden okunur",()=>{
  assert.equal(core.plannedMinutes("TYT Fizik · 60 dk"),60);
  assert.equal(core.plannedMinutes("Kimya · 2 saat"),120);
  assert.equal(core.plannedMinutes("Biyoloji · 1 saat 30 dk"),90);
  assert.equal(core.plannedMinutes("Paragraf · 40 soru"),0);
});

test("uzun odak oturumu programdaki ders sürelerine bölünür",()=>{
  const tasks=[
    {id:"s-0-1",text:"TYT Fizik · Hareket · 60 dk",subject:"Fizik",done:false},
    {id:"s-1-1",text:"TYT Kimya · Kimyasal Türler · 120 dk",subject:"Kimya",done:false}
  ];
  assert.deepEqual(core.focusPlanAllocation(tasks,"s-0-1",180,"Fizik"),[
    {subject:"Fizik",minutes:60,taskId:"s-0-1"},
    {subject:"Kimya",minutes:120,taskId:"s-1-1"}
  ]);
  assert.deepEqual(core.focusPlanAllocation(tasks,"s-0-1",75,"Fizik"),[
    {subject:"Fizik",minutes:60,taskId:"s-0-1"},
    {subject:"Kimya",minutes:15,taskId:"s-1-1"}
  ]);
});

test("süresi olmayan seçili görev oturumun kalanını kendi dersine alır",()=>{
  const tasks=[
    {id:"a",text:"Matematik soru çözümü",subject:"Matematik",done:false},
    {id:"b",text:"Fizik · 60 dk",subject:"Fizik",done:false}
  ];
  assert.deepEqual(core.focusPlanAllocation(tasks,"a",90,"Matematik"),[
    {subject:"Matematik",minutes:90,taskId:"a"}
  ]);
});

test("aylık ders özeti aynı takvim ayını toplar ve en çok çalışılanı öne alır",()=>{
  const data={
    "2026-10-01":{Fizik:60,Kimya:30},
    "2026-10-02":{Kimya:120},
    "2026-09-30":{Fizik:999}
  };
  assert.deepEqual(core.monthSubjectTotals(data,"2026-10"),[
    {subject:"Kimya",minutes:150},
    {subject:"Fizik",minutes:60}
  ]);
});

test("odak ekranı otomatik program dağılımı ve aylık özet arayüzünü bağlıyor",()=>{
  const app=read("app.js"),html=read("index.html"),css=read("app.css");
  assert.match(app,/function focusCreditAllocation/);
  assert.match(app,/focusPlanAllocation/);
  assert.match(app,/split:split/);
  assert.match(app,/function renderMonthlyFocusSummary/);
  assert.match(html,/id="focusMonthPick"/);
  assert.match(html,/id="focusMonthSummary"/);
  assert.match(css,/\.focus-month-hero/);
});
