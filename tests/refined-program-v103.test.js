const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const helpers=read("src/ui/refined-program-v103.ts"),css=read("src/ui/refined-program-v103.css"),program=read("src/ui/refined-program.ts");
const h=vm.runInNewContext(stripTypeScriptTypes(helpers.replace(/^export /gm,""),{mode:"strip"})+
  "\n({parseTimeRange,rowTimeLabel,timelineOrder,timelineGaps,nextTaskIndex,durationText,cardTitles,plannedMinutes,plannedText,clock})",{});
const plain=value=>JSON.parse(JSON.stringify(value));

test("v103 saat aralığı satır etiketinden okunur; geçersizler saatsiz sayılır",()=>{
  assert.deepEqual(plain(h.parseTimeRange("09:00-11:00")),{start:540,end:660,label:"09:00–11:00"});
  assert.deepEqual(plain(h.parseTimeRange(" 9.30 – 10.15 ")),{start:570,end:615,label:"09:30–10:15"});
  for(const bad of ["","Fen","11:00-09:00","25:00-26:00","09:70-10:00"])assert.equal(h.parseTimeRange(bad),null,bad);
  const state={rowLabels:{s:["09:00-11:00","14:00-16:00"],r:[""]}};
  assert.equal(h.rowTimeLabel(state,{block:"s",row:1}),"14:00-16:00");
  assert.equal(h.rowTimeLabel(state,{block:"r",row:0}),"");
  assert.equal(h.rowTimeLabel(null,{block:"s",row:0}),"");
});

test("v103 sıralama: saatliler başlangıca göre, saatsizler kayıtlı sırasıyla sonda; boşluk ve Sırada",()=>{
  const t=(id,done,label)=>({task:{id,done},time:label?h.parseTimeRange(label):null});
  const order=h.timelineOrder([t("rutin",true,""),t("ogle",false,"14:00-16:00"),t("sabah",true,"09:00-11:00"),t("not",false,""),t("aksam",false,"20:00-21:00")]);
  assert.deepEqual(order.map(item=>item.task.id),["sabah","ogle","aksam","rutin","not"]);
  assert.deepEqual(plain(h.timelineGaps(order)),[{after:0,start:660,end:840},{after:1,start:960,end:1200}]);
  assert.equal(h.nextTaskIndex(order,15*60),1,"14:00-16:00 sürüyor");
  assert.equal(h.nextTaskIndex(order,17*60),2,"sıradaki akşam");
  assert.equal(h.nextTaskIndex(order,22*60),1,"saati geçmiş ama bitmemiş görev hâlâ sırada");
  assert.equal(h.nextTaskIndex(order,null),1,"başka gün: ilk bitmemiş");
  assert.equal(h.nextTaskIndex([t("a",true,"")],null),-1);
  assert.equal(h.plannedMinutes(order),300);assert.equal(h.plannedText(300),"5 sa planlı");assert.equal(h.plannedText(0),"");
  assert.equal(h.durationText(h.parseTimeRange("09:00-10:30")),"1 sa 30 dk");assert.equal(h.durationText(h.parseTimeRange("09:00-09:45")),"45 dk");
});

test("v103 kart başlıkları tekrar yazmaz",()=>{
  assert.deepEqual(plain(h.cardTitles("Kimya","Kimya")),{subject:"",title:"Kimya",meta:""});
  assert.deepEqual(plain(h.cardTitles("Matematik","Matematik türev")),{subject:"Matematik",title:"Türev",meta:""});
  assert.deepEqual(plain(h.cardTitles("TYT Türkçe","TYT Türkçe","Paragraf · 20 soru")),{subject:"TYT Türkçe",title:"Paragraf",meta:"20 soru"});
  assert.deepEqual(plain(h.cardTitles("Diğer","Sabah tekrar","Diğer")),{subject:"Diğer",title:"Sabah tekrar",meta:""});
});

test("v103 Program yalnız görünümü değiştirir; kayıt biçimi ve eylemler aynı",()=>{
  assert.match(program,/import \{cardTitles,clock,durationText,nextTaskIndex,parseTimeRange,plannedMinutes,plannedText,rowTimeLabel,timelineGaps,timelineOrder\} from "\.\/refined-program-v103";/);
  assert.doesNotMatch(helpers,/localStorage|save\(|setDoc|S\.weeks/);
  assert.match(program,/check\.addEventListener\("click",\(\)=>\{justToggled=task\.id;.*controller\.toggleTask\(task\.id\);refresh\(\);\}\);/);
  assert.match(program,/item\.marker\.style\.setProperty\("--v103-p"/);
  assert.match(program,/viewKey="";schedule\(\);/,"Program'a dönünce kartlar yeniden sırayla gelir");
});

test("v103 CSS: sözde öğeler :is() içinde değil; hareketler yalnız hareket tercihi açıkken",()=>{
  assert.doesNotMatch(css,/:is\([^)]*::(before|after)/);
  const at=css.indexOf("@media(prefers-reduced-motion:no-preference)");
  assert.ok(at>0);
  assert.doesNotMatch(css.slice(0,at),/animation:/);
  for(const name of ["v103-rise","v103-swap","v103-pop","v103-tick","v103-ring","v103-grow","v103-ping"])assert.match(css.slice(at),new RegExp("animation:"+name));
  assert.match(css,/@property --rb-v4-percent\{syntax:"<number>";inherits:false;initial-value:0\}/,"halka dolarak açılır");
  assert.match(css,/\.rb-program-tabs:has\(button:nth-child\(2\)\[aria-pressed="true"\]\)::before\{transform:translateX\(100%\)\}/);
});
