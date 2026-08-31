const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");

function addDays(key,days){const d=new Date(key+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
function context(extra={}){
  const window={},document={readyState:"complete",getElementById:()=>null,addEventListener:()=>{},createElement:()=>({})};
  return Object.assign({window,document,console,setTimeout:()=>0,clearTimeout:()=>{},Date,Blob,URL,Intl,Math,JSON,Object,Array,Set,Map,String,Number,RegExp,File:class{},navigator:{},todayKey:()=>"2026-08-24",addDaysKey:addDays,esc:String,APP_VERSION:"3.2.7",toast:()=>{},save:()=>true},extra);
}
function run(file,ctx){vm.runInNewContext(fs.readFileSync(path.join(root,"modules",file),"utf8"),ctx,{filename:file});return ctx.window;}

test("Öğrenme Laboratuvarı verileri ve kelime sayacı çalışır",()=>{
  const ctx=context({S:{lab:{paragraphLog:[],elementFav:[],timelineFav:[]}}}),win=run("learning-lab.js",ctx);
  assert.equal(win.YKSLearningLab.elements.length,118);
  assert.ok(win.YKSLearningLab.timeline.length>=40);
  assert.equal(win.YKSLearningLab.wordCount("Bir iki, üç; dört-beş ve altı."),6);
});

test("Hazır laboratuvar araçlarının özet ve filtreleri doğru çalışır",()=>{
  const ctx=context({S:{lab:{paragraphLog:[],elementFav:[],timelineFav:[]}}}),api=run("learning-lab.js",ctx).YKSLearningLab;
  assert.deepEqual(JSON.parse(JSON.stringify(api.paragraphSummary([{wpm:180,score:4},{wpm:220,score:5},{wpm:200,score:3}]))),{count:3,avgWpm:200,bestWpm:220,avgScore:4});
  const period1=api.filterElements({period:"1"}),metals=api.filterElements({group:"Metaller"}),favorites=api.filterElements({onlyFavorites:true,favorites:new Set([26,79])});
  assert.deepEqual(period1.map(x=>x.symbol).join(","),"H,He");assert.ok(metals.length>50);assert.deepEqual(favorites.map(x=>x.symbol).join(","),"Fe,Au");
  const osmanli=api.filterTimeline({era:"Osmanlı",sort:"old"}),reverse=api.filterTimeline({era:"Osmanlı",sort:"new"});assert.ok(osmanli.length>10);assert.equal(reverse[0].id,osmanli.at(-1).id);
});

test("Öğrenme Laboratuvarı bütün sınavları ders ve konulara ayırır",()=>{
  const app=fs.readFileSync(path.join(root,"app.js"),"utf8"),match=app.match(/const CURRICULUM=(\{[\s\S]*?\r?\n\};)\r?\nconst ALL_SUBJECTS/);assert.ok(match);
  const CURRICULUM=vm.runInNewContext("("+match[1].replace(/;$/,'')+")"),ctx=context({CURRICULUM,S:{lab:{paragraphLog:[],elementFav:[],timelineFav:[]}}}),win=run("learning-lab.js",ctx),snapshot=win.YKSLearningLab.curriculum();
  assert.deepEqual(Object.keys(snapshot),["TYT","AYT","YDT"]);
  for(const exam of ["TYT","AYT","YDT"]){assert.equal(snapshot[exam].length,CURRICULUM[exam].length);assert.equal(snapshot[exam].reduce((n,x)=>n+x.topics.length,0),CURRICULUM[exam].reduce((n,x)=>n+x.topics.length,0));}
});

test("Laboratuvar konu içeriğinde arama ve favori filtresi yapar",()=>{
  const app=fs.readFileSync(path.join(root,"app.js"),"utf8"),match=app.match(/const CURRICULUM=(\{[\s\S]*?\r?\n\};)\r?\nconst ALL_SUBJECTS/);assert.ok(match);
  const CURRICULUM=vm.runInNewContext("("+match[1].replace(/;$/,'')+")"),ctx=context({CURRICULUM,S:{lab:{paragraphLog:[],elementFav:[],timelineFav:[],topicFav:[]}}});run("topic-guides.js",ctx);const api=run("learning-lab.js",ctx).YKSLearningLab;
  const result=api.searchTopics({exam:"TYT",query:"tanım kümesi"});assert.ok(result.some(x=>x.subject==="Matematik"));
  const key=api.topicKey("TYT","Matematik","Problemler"),favorites=api.searchTopics({exam:"TYT",onlyFavorites:true,favorites:new Set([key])});assert.deepEqual(JSON.parse(JSON.stringify(favorites.map(x=>x.key))),[key]);
});

test("240 TYT, AYT ve YDT konusunun tamamında konuya özel rehber vardır",()=>{
  const app=fs.readFileSync(path.join(root,"app.js"),"utf8"),match=app.match(/const CURRICULUM=(\{[\s\S]*?\r?\n\};)\r?\nconst ALL_SUBJECTS/);assert.ok(match);
  const CURRICULUM=vm.runInNewContext("("+match[1].replace(/;$/,'')+")"),ctx=context();run("topic-guides.js",ctx);
  const api=ctx.window.YKSTopicGuides,coverage=api.coverage(CURRICULUM);assert.equal(coverage.total,240);assert.equal(coverage.specific,240);assert.equal(coverage.missing.length,0);
  for(const exam of ["TYT","AYT","YDT"])for(const subject of CURRICULUM[exam])for(const topic of subject.topics){const guide=api.guideFor(exam,subject.name,topic);assert.equal(guide.specific,true,exam+" "+subject.name+" "+topic);assert.equal(guide.important.length,2);assert.equal(guide.attention.length,2);assert.equal(guide.mistakes.length,2);assert.equal(guide.study.length,2);assert.equal(guide.checklist.length,3);assert.ok(guide.sources.length>=3);assert.ok(guide.note.includes("çıkma garantisi değildir"));}
});

test("Konu rehberleri ders bağlamını ayırır ve resmî kaynaklara gider",()=>{
  const ctx=context();run("topic-guides.js",ctx);const api=ctx.window.YKSTopicGuides;
  const geometry=api.guideFor("TYT","Geometri","Temel Kavramlar"),math=api.guideFor("TYT","Matematik","Temel Kavramlar"),ydt=api.guideFor("YDT","Yabancı Dil","Paragraf");
  assert.notEqual(geometry.important[0],math.important[0]);assert.match(ydt.important[0],/Ana fikir/);
  assert.ok(Object.values(api.sources).every(source=>/^https:\/\/(?:www\.)?(?:osym\.gov\.tr|odsgm\.meb\.gov\.tr|ogmmateryal\.eba\.gov\.tr)\//.test(source.url)));
});

test("ICS, Anki ve Obsidian çıktıları gerçek içerik üretir",()=>{
  const S={name:"Furkan",examDate:"2027-06-19",puanTuru:"SAY",solved:{"2026-08-24":50},pomoMin:{"2026-08-24":90},topics:{},denemeler:[],targets:[],learning:{cards:[{q:"Hız nedir?",a:"Yol / zaman",subject:"Fizik",due:"2026-08-24"}]},weeks:{"2026-08-24":{r:[["Kitap oku","","","","","",""]],s:[["Matematik · Problemler","","","","","",""]]}}};
  const ctx=context({S,estScores:()=>({tytNet:70,tyt:360}),rankEstimate:()=>null}),win=run("export-center.js",ctx),api=win.YKSExportCenter;
  const ics=api.buildICS(),anki=api.buildAnki(),md=api.buildMarkdown();
  assert.equal(ics.count,2);assert.match(ics.text,/BEGIN:VCALENDAR/);assert.match(ics.text,/Matematik/);
  assert.equal(anki.count,1);assert.match(anki.text,/Hız nedir\?\tYol \/ zaman/);
  assert.match(md,/# YKS Defterim/);assert.match(md,/Furkan/);assert.match(md,/50/);
});

test("Hedef merkezi tek görünüm verisini üretir",()=>{
  const S={puanTuru:"SAY",targets:[{id:1,ad:"Bilgisayar Mühendisliği",uni:"İTÜ",sira:12000}],denemeler:[]};
  const ctx=context({S,estScores:()=>({tytNet:85,aytNet:55,tyt:410,alan:465}),rankEstimate:()=>({best:9000,worst:17000,mid:13000}),v24Model:()=>({slopeWeek:1.2}),publisherStats:()=>[{pub:"Örnek",n:2,avg:78}]}),win=run("target-center.js",ctx),data=win.v321TargetSnapshot();
  assert.equal(data.score,465);assert.equal(data.rank.mid,13000);assert.equal(data.nearest.ad,"Bilgisayar Mühendisliği");
});
