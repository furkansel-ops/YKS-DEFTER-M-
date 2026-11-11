const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const app=read("app.js");
const runtime=read("public/student-coaching-runtime.js");
const link=read("public/student-coach-link.js");

// app.js'ten tek satırlık bir üst düzey tanımı (function ad(...){...}) alır.
function line(src,start){
  const at=src.indexOf(start);assert.ok(at>=0,start+" bulunamadı");
  return src.slice(at,src.indexOf("\n",at));
}
function block(src,start){
  const at=src.indexOf(start);assert.ok(at>=0,start+" bulunamadı");
  return src.slice(at,src.indexOf("\n}",at)+2);
}
function helpers(){
  const context=vm.createContext({String,RegExp});
  vm.runInContext(line(app,"function esc(s){")+"\n"+line(app,"function jsq(v){")+"\n"+block(app,"function safeImgData(v){")+";globalThis.t={esc,jsq,safeImgData};",context);
  return context.t;
}
// Tarayıcının yaptığını taklit eder: önce HTML varlıkları çözülür, sonra tek tırnaklı JS dizesi değerlendirilir.
const unhtml=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");

test("v109 jsq: onclick argümanı nitelikten ve JS dizesinden taşamaz, değer aynen geri gelir",()=>{
  const {jsq}=helpers();
  const cases=[
    'TYT|a|b" onmouseover="alert(1)',
    "https://x.y\" onmouseover=\"alert(document.domain)",
    "&#39;);alert(1);//",
    "Atatürk'ün ilkeleri",
    "ters\\bölü\\'",
    "<img src=x onerror=alert(1)>",
    "a & b",
  ];
  for(const value of cases){
    const out=jsq(value);
    assert.doesNotMatch(out,/["'<>]/,"ham tırnak ya da açılı ayraç kalmamalı: "+value);
    assert.equal(vm.runInNewContext("'"+unhtml(out)+"'"),value,"değer bozulmadan geri gelmeli: "+value);
  }
  assert.equal(vm.runInNewContext("'"+unhtml(jsq("satır\nsonu"))+"'"),"satır sonu");
  assert.equal(jsq(null),"");
});

test("v109 app.js: satır içi olaylarda yalnızca tek tırnağı kaçıran eski kalıp kalmadı",()=>{
  assert.equal(app.split(".replace(/'/g,\"\\\\'\")").length-1,1,"kalıp yalnızca jsq tanımında geçmeli");
  assert.match(app,/onclick="clearDeadline\('\$\{jsq\(x\.key\)\}'\)"/);
  assert.match(app,/onclick="clearTopicRes\('\$\{jsq\(x\.key\)\}'\)"/);
  assert.match(app,/const esc3=v=>jsq\(v\);/);
  assert.match(app,/function v26Arg\(v\)\{return jsq\(v\|\|""\);\}/);
});

test("v109 fotoğraf verisi: yalnızca base64 görsel kabul edilir ve src kaçırılır",()=>{
  const {safeImgData}=helpers();
  assert.equal(safeImgData("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w=="),true);
  assert.equal(safeImgData("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB"),true);
  assert.equal(safeImgData('data:image" onerror="alert(1)'),false);
  assert.equal(safeImgData("data:image/jpeg;base64,AAAA\" onerror=\"alert(1)"),false);
  assert.equal(safeImgData("https://kotu.example/x.jpg?aaaaaaaaaaaaaaaa"),false);
  assert.equal(safeImgData(12345678901234567890),false);
  assert.match(app,/o\.qbank=o\.qbank\.filter\(q=>q&&typeof q==="object"&&safeImgData\(q\.img\)\);/);
  assert.match(app,/\.filter\(safeImgData\)\.slice\(0,x\.n\);/);
  assert.doesNotMatch(app,/<img src="(\$\{|'\+)(q\.img|row\.img|img)[}'+]/,"görsel adresi esc() olmadan yazılmamalı");
});

test("v109 canlı sitede ?selftest parametresi okunmadan silinir",()=>{
  const guard=line(app,"try{if(!/^(localhost|127");
  assert.match(guard,/searchParams\.delete\("selftest"\)/);
  assert.match(guard,/history\.replaceState/);
  assert.ok(app.indexOf(guard)<app.indexOf('.get("selftest")'),"koruma, parametreyi okuyan ilk satırdan önce çalışmalı");
});

test("v109 koç eylemleri: konu anahtarı, küçük resim ve liste sınırları denetlenir",()=>{
  const context=vm.createContext({String});
  vm.runInContext(line(runtime,"const text=")+"\n"+line(runtime,"const TOPIC_KEY_RE=")+"\n"+line(runtime,"const safeThumb=")+";globalThis.t={TOPIC_KEY_RE,safeThumb};",context);
  const {TOPIC_KEY_RE,safeThumb}=context.t;
  assert.equal(TOPIC_KEY_RE.test("TYT|Matematik|Problemler"),true);
  assert.equal(TOPIC_KEY_RE.test("AYT|Türk Dili ve Edebiyatı|Atatürk'ün Hayatı"),true);
  for(const bad of ["__proto__","constructor","prototype","TYT|a","TYT|a|b|c","TYT|<b>|x","tyt|a|b",""])assert.equal(TOPIC_KEY_RE.test(bad),false,bad);
  assert.equal(safeThumb("https://i.ytimg.com/vi/abc/hqdefault.jpg"),"https://i.ytimg.com/vi/abc/hqdefault.jpg");
  assert.equal(safeThumb("https://izleyici.example/p.gif"),"");
  assert.equal(safeThumb("javascript:alert(1)"),"");
  assert.match(runtime,/if\(!TOPIC_KEY_RE\.test\(k\)\)throw new Error\("Konu hedefi geçersiz"\)/);
  assert.match(runtime,/!Object\.hasOwn\(s\.topics,k\)&&Object\.keys\(s\.topics\)\.length>=MAX_COACH_TOPICS/);
  assert.match(runtime,/if\(books\.length>=MAX_COACH_BOOKS\)throw new Error\("Kitap listesi dolu"\)/);
  assert.equal(runtime.split("thumb=safeThumb(p.thumb)").length-1,2,"iki öneri dalı da küçük resmi denetlemeli");
});

test("v109 bağlantı kesilince koç kodu yenilenir",()=>{
  const from=link.indexOf("async function disconnectCoach(linkId){"),to=link.indexOf("async function copyCode");
  assert.ok(from>=0&&to>from);
  const fn=link.slice(from,to);
  assert.match(fn,/active:false/);
  assert.match(fn,/await createOrRotateCode\(true\)/);
  assert.ok(fn.indexOf("active:false")<fn.indexOf("createOrRotateCode(true)"),"önce bağlantı kesilir, sonra kod yenilenir");
});
