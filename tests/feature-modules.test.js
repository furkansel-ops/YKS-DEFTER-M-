const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");

function addDays(key,days){const d=new Date(key+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
function context(extra={}){
  const window={},document={readyState:"complete",getElementById:()=>null,addEventListener:()=>{},createElement:()=>({})};
  return Object.assign({window,document,console,setTimeout:()=>0,clearTimeout:()=>{},Date,Blob,URL,Intl,Math,JSON,Object,Array,Set,Map,String,Number,RegExp,File:class{},navigator:{},todayKey:()=>"2026-08-24",addDaysKey:addDays,esc:String,APP_VERSION:"3.2.4",toast:()=>{},save:()=>true},extra);
}
function run(file,ctx){vm.runInNewContext(fs.readFileSync(path.join(root,"modules",file),"utf8"),ctx,{filename:file});return ctx.window;}

test("Öğrenme Laboratuvarı verileri ve kelime sayacı çalışır",()=>{
  const ctx=context({S:{lab:{paragraphLog:[],elementFav:[],timelineFav:[]}}}),win=run("learning-lab.js",ctx);
  assert.equal(win.YKSLearningLab.elements.length,118);
  assert.ok(win.YKSLearningLab.timeline.length>=40);
  assert.equal(win.YKSLearningLab.wordCount("Bir iki, üç; dört-beş ve altı."),6);
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
