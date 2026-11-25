const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const helpers=read("src/ui/refined-program-v103.ts"),program=read("src/ui/refined-program.ts"),css=read("src/ui/refined-program-v154.css"),app=read("app.js");
const h=vm.runInNewContext(stripTypeScriptTypes(helpers.replace(/^export /gm,""),{mode:"strip"})+"\n({parseTimeRange,daySections,nowStatus,shortDuration})",{});
const ids=list=>Array.from(list,item=>item.task.id); // vm dizisi → bu alemin dizisi

test("v154 gün bölümleri: şimdi/sırada, saati geçenler, sonra, bitenler",()=>{
  const t=(id,done,label)=>({task:{id,done},time:label?h.parseTimeRange(label):null});
  const day=[t("sabah",true,"09:00-10:30"),t("ogle",false,"14:00-15:30"),t("ikindi",false,"16:00-17:00"),t("aksam",false,"20:00-21:00"),t("rutin",false,"")];
  let s=h.daySections(day,14*60+40);
  assert.equal(s.current.task.id,"ogle","ders sürüyor");assert.deepEqual(ids(s.late),[]);assert.deepEqual(ids(s.rest),["ikindi","aksam","rutin"]);assert.deepEqual(ids(s.done),["sabah"]);
  s=h.daySections(day,18*60+30);
  assert.equal(s.current.task.id,"aksam");assert.deepEqual(ids(s.late),["ogle","ikindi"],"saati geçmiş bitmemişler ayrı");assert.deepEqual(ids(s.rest),["rutin"]);
  s=h.daySections(day,23*60);
  assert.equal(s.current.task.id,"rutin","saatsiz görev saati geçmiş sayılmaz");
  s=h.daySections(day,null);
  assert.equal(s.current,undefined,"başka gün kart yok");assert.deepEqual(ids(s.late),[]);assert.deepEqual(ids(s.rest),["ogle","ikindi","aksam","rutin"]);
});

test("v154 kart yazısı ve kısa süre",()=>{
  const r=h.parseTimeRange("14:00-15:30");
  assert.deepEqual(JSON.parse(JSON.stringify(h.nowStatus(r,14*60+40))),{live:true,text:"50 dk kaldı",percent:44});
  assert.deepEqual(JSON.parse(JSON.stringify(h.nowStatus(r,12*60+30))),{live:false,text:"1 sa 30 dk sonra",percent:0});
  assert.equal(h.nowStatus(null,600).text,"");
  assert.equal(h.shortDuration(r),"1,5 sa");assert.equal(h.shortDuration(h.parseTimeRange("09:00-09:45")),"45 dk");assert.equal(h.shortDuration(h.parseTimeRange("09:00-10:00")),"1 sa");
});

test("v154 eylemler mevcut yolları kullanır; kayıt biçimi aynı",()=>{
  assert.match(program,/import "\.\/refined-program-v154\.css";/);
  assert.match(program,/call\("programStartTask",task\.id\)/,"Odak başlat seçilen görevle");
  assert.match(program,/call\("moveUnfinishedTomorrow",sections\.late\.map\(item=>item\.task\.id\)\)/,"yalnız saati geçenler yarına");
  assert.match(program,/ok\.addEventListener\("click",\(\)=>\{justToggled=task\.id;controller\.toggleTask\(task\.id\);refresh\(\);\}\);/);
  assert.match(app,/function programStartTask\(cid\)\{\n  const item=v25PlanToday\(\)\.items\.find\(x=>x\.cid===cid&&!x\.done\);\n  return item\?v25StartItem\(item\):v25StartTask\(\);/);
  assert.match(app,/function v25StartTask\(\)\{[^]*?return v25StartItem\(item\);\n\}/);
  assert.doesNotMatch(helpers,/localStorage|save\(|setDoc|S\.weeks/);
  assert.doesNotMatch(css,/animation:/,"hareket yok");
  assert.doesNotMatch(css,/:is\([^)]*::(before|after)/);
});
