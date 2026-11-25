const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const app=read("app.js"),css=read("app.css"),glassy=read("src/ui/glassy-v99.css");
const block=(src,sel)=>{const i=src.indexOf("\n"+sel+"{");assert.ok(i>=0,sel);return src.slice(i,src.indexOf("}",i));};

test("v156 konu araması müfredatın küçük harfli listesini bir kez hazırlar",()=>{
  const i=app.indexOf("function planSubjectFromTopic("),fn=app.slice(i,app.indexOf("\nfunction ",i+1));
  assert.match(fn,/planSubjectFromTopic\.index\|\|\(planSubjectFromTopic\.index=ALL_SUBJECTS\.flatMap/);
  assert.doesNotMatch(fn,/for\(const s of ALL_SUBJECTS\)/,"her çağrıda bütün konular küçük harfe çevrilmez");
});

test("v156 kapalı dersin konu satırları ders açılınca çizilir",()=>{
  assert.match(app,/const v156TopicRows=new Map\(\);\nfunction renderSubjects\(\)\{\n  const wrap=el\("subjectList"\);if\(!wrap\)return;wrap\.innerHTML="";v156TopicRows\.clear\(\);/);
  assert.ok(app.includes("+(open?topics.map(tp=>topicRow(exam,s.name,tp,ctx)).join(''):'')+"),"kapalıysa boş");
  assert.ok(app.includes("if(!open)v156TopicRows.set(id,()=>topics.map(tp=>topicRow(exam,s.name,tp,ctx)).join(''));"));
  const i=app.indexOf("function toggleSubj("),fn=app.slice(i,app.indexOf("\nfunction ",i+1));
  assert.match(fn,/const rows=v156TopicRows\.get\(i\);if\(open&&rows\)\{e\.innerHTML=rows\(\);v156TopicRows\.delete\(i\);\}/);
});

test("v156 kayan kartlarda backdrop-filter yok; sabit çubuklarda var",()=>{
  for(const sel of [".card",".hero",".focuscard",".home-overview"])assert.doesNotMatch(block(css,sel),/backdrop-filter/,sel);
  for(const sel of [".navbar",".tabbar"])assert.match(block(css,sel),/backdrop-filter:var\(--blur\)/,sel);
  const cards=glassy.slice(glassy.indexOf(':root[data-theme="glassy"]:not(#g) body :is(.card'),glassy.indexOf(':root[data-theme="glassy"]:not(#g) body :is(.navbar'));
  assert.doesNotMatch(cards,/backdrop-filter/);
  assert.match(app,/if\(t==='ders'\)renderV24Exam\(\);/,"Trend'de v24 grafikleri iki kez çizilmez");
});
