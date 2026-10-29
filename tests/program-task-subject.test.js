const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const app=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
const plain=value=>JSON.parse(JSON.stringify(value));

function harness(labels=["Fizik","Matematik"]){
  const calls=[],undo=[];
  const state={rows:{r:1,s:labels.length},rowLabels:{r:["Rutin"],s:labels.slice()},weeks:{},topics:{}};
  class Clock extends Date{constructor(...args){super(...(args.length?args:["2026-10-28T12:00:00"]));}}
  const context=vm.createContext({Date:Clock,S:state,save:()=>{calls.push("save");return true;},perfInvalidateState:()=>{},
    renderTodayPlan:()=>{},renderSuggest:()=>{},renderPlan:()=>{},el:()=>({classList:{contains:()=>false}}),toast:()=>{},
    pushUndo:(label,restore)=>undo.push({label,restore}),todayKey:()=>"2026-10-28",ST_LABEL:["Başlanmadı","İşledim","Soru çözdüm","Pekiştirdim"]});
  const curriculum=app.slice(app.indexOf("const CURRICULUM="),app.indexOf("const DAYS="));
  vm.runInContext(curriculum.replace(/^const /gm,"var "),context);
  for(const name of ["PLAN_AYT_ALIAS","PLAN_COACH_PREFIX","PLAN_SUBJECTS_BY_LENGTH"])
    vm.runInContext(app.match(new RegExp("^const "+name+"=[^\\n]+$","m"))[0].replace(/^const /,"var "),context);
  for(const name of ["keyOf","parseKey","addDaysKey","dowOf","mondayOf","clone","tkey","findSubj","planSubjBase","planStripCoach"]){
    const line=app.match(new RegExp(`^function ${name}\\([^\\n]+$`,"m"));
    const block=line&&/\}\s*$/.test(line[0])&&!/^function \w+\([^)]*\)\{\s*$/.test(line[0])?line:app.match(new RegExp(`function ${name}\\([^\\n]*\\)\\{[\\s\\S]*?\\r?\\n}`));
    assert.ok(block,name);vm.runInContext(block[0],context);
  }
  for(const name of ["topicKeyOf","tsetStatus","blankWeek","normWeek","addToDays","planFindTopic","planTaskSubject","planCellLabel","v25TaskMeta","programTopicLevel","programAutoTopicDone"]){
    const block=app.match(new RegExp(`function ${name}\\([^\\n]*\\)\\{[\\s\\S]*?\\r?\\n}`));assert.ok(block,name);vm.runInContext(block[0],context);
  }
  return {context,state,calls,undo};
}

test("koç görevinin dersi ve konusu metinden okunur; satır adı ezmez",()=>{
  const {context:c}=harness();
  assert.deepEqual(plain(c.planTaskSubject("Koç · TYT Kimya · Mol Kavramı · Soru çözümü · 40 soru")),{subj:"Kimya",topic:"Mol Kavramı"});
  assert.deepEqual(plain(c.planTaskSubject("Koç · AYT Kimya · Gazlar · Konu anlatımı — https://youtu.be/x")),{subj:"Kimya (AYT)",topic:"Gazlar"});
  assert.deepEqual(plain(c.planTaskSubject("Koç · Deneme sonrası · AYT Felsefe · Mantık")),{subj:"Felsefe Grubu",topic:"Mantık"});
  assert.deepEqual(plain(c.planTaskSubject("TYT Paragraf · Soru çözümü · 20 soru")),{subj:"Türkçe",topic:"Paragraf"});
  assert.deepEqual(plain(c.planTaskSubject("Matematik (AYT) · Türev")),{subj:"Matematik (AYT)",topic:"Türev"});
  assert.equal(c.planTaskSubject("Kitap okuma 30 dk"),null);
  assert.equal(c.planTaskSubject("Tarihçe okuması"),null,"kelime ortasında ders sayılmaz");
  assert.deepEqual(plain(c.v25TaskMeta({txt:"Koç · TYT Kimya · Mol Kavramı · Soru çözümü",lbl:"Fizik"})),{subj:"Kimya",topic:"Mol Kavramı"});
  assert.equal(c.v25TaskMeta({txt:"Problemler 30 soru",lbl:"Matematik"}).subj,"Matematik","metinde ders yoksa satır adı kullanılır");
});

test("görünen etiket başka derse ait satır adında görevin dersini gösterir, saat etiketini korur",()=>{
  const {context:c}=harness();
  assert.equal(c.planCellLabel("Fizik","Koç · TYT Kimya · Mol Kavramı"),"Kimya");
  assert.equal(c.planCellLabel("Kimya","Koç · AYT Kimya · Gazlar"),"Kimya");
  assert.equal(c.planCellLabel("09:00-11:00","Koç · TYT Kimya · Mol Kavramı"),"09:00-11:00");
  assert.equal(c.planCellLabel("","Koç · TYT Kimya · Mol Kavramı"),"Kimya");
  assert.equal(c.planCellLabel("Fizik","Serbest okuma"),"Fizik");
});

test("addToDays görevi aynı dersin satırına, yoksa başka derse ait olmayan satıra koyar",()=>{
  const h=harness(["Fizik","Kimya",""]),wk="2026-10-26";
  assert.equal(h.context.addToDays("Koç · TYT Kimya · Mol Kavramı · 40 soru",[0],0).ok,true);
  assert.equal(h.state.weeks[wk].s[1][0],"Koç · TYT Kimya · Mol Kavramı · 40 soru");
  assert.equal(h.context.addToDays("Koç · TYT Kimya · Karışımlar",[0],0).ok,true);
  assert.equal(h.state.weeks[wk].s[2][0],"Koç · TYT Kimya · Karışımlar","Kimya satırı doluysa adsız satır");
  assert.equal(h.context.addToDays("Koç · TYT Kimya · Atom ve Yapısı",[0],0).ok,true);
  assert.equal(h.state.weeks[wk].s[0][0],"","Fizik satırına Kimya yazılmaz");
  assert.equal(h.state.weeks[wk].s[3][0],"Koç · TYT Kimya · Atom ve Yapısı");
  assert.equal(h.state.rows.s,4);assert.equal(h.state.rowLabels.s[3],"");
  assert.equal(h.context.addToDays("Serbest okuma",[1],0).ok,true);
  assert.equal(h.state.weeks[wk].s[0][1],"Serbest okuma","dersi olmayan görev eskisi gibi ilk boş satıra");
});

test("görev bitince konu çalışma türüne göre ilerler, yalnız ileri taşınır ve geri alınabilir",()=>{
  const h=harness(),c=h.context,key="TYT|Kimya|Mol Kavramı",meta={subj:"Kimya",topic:"Mol Kavramı"};
  assert.equal(c.programTopicLevel("Koç · TYT Kimya · Mol Kavramı · Konu anlatımı — https://youtu.be/x"),1);
  assert.equal(c.programTopicLevel("TYT Kimya · Mol Kavramı · Soru çözümü · 40 soru"),2);
  assert.equal(c.programTopicLevel("TYT Kimya · Mol Kavramı · Tekrar"),3);
  assert.equal(c.programTopicLevel("Mol Kavramı"),1,"türü belirtilmeyen çalışma İşledim sayılır");
  assert.equal(c.programAutoTopicDone(meta,"TYT Kimya · Mol Kavramı · Konu anlatımı"),true);
  assert.equal(h.state.topics[key].st,1);assert.match(h.undo.at(-1).label,/Mol Kavramı “İşledim”/);
  assert.equal(c.programAutoTopicDone(meta,"TYT Kimya · Mol Kavramı · Soru çözümü · 40 soru"),true);
  assert.equal(h.state.topics[key].st,2);
  assert.equal(c.programAutoTopicDone(meta,"TYT Kimya · Mol Kavramı · Konu anlatımı"),false,"durum geri düşmez");
  assert.equal(h.state.topics[key].st,2);
  h.undo.at(-1).restore();assert.equal(h.state.topics[key].st,1,"geri al önceki duruma döner");
  assert.equal(c.programAutoTopicDone(meta,"TYT Kimya · Mol Kavramı · Tekrar"),true);
  assert.equal(h.state.topics[key].st,3);assert.equal(h.state.topics[key].ts,"2026-10-28");
  h.state.topics[key]={st:3,conf:4,ts:"2026-10-01",rev:[0]};
  assert.equal(c.programAutoTopicDone(meta,"TYT Kimya · Mol Kavramı · Tekrar"),false);
  assert.deepEqual(plain(h.state.topics[key]),{st:3,conf:4,ts:"2026-10-01",rev:[0]});
  h.state.topics[key]={st:1,conf:2,ts:null,rev:[],dl:"2026-11-01"};
  assert.equal(c.programAutoTopicDone(meta,"TYT Kimya · Mol Kavramı · Tekrar"),true);
  assert.equal(h.state.topics[key].dl,"2026-11-01","hedef tarih korunur");
  for(const bad of [{subj:"Kimya",topic:""},{subj:"",topic:"Mol Kavramı"},{subj:"Kimya",topic:"Uydurma"},null])assert.equal(c.programAutoTopicDone(bad,"Tekrar"),false);
});

test("konu yedek eşleşmesi en uzun konu adını seçer",()=>{
  const {context:c}=harness();
  assert.deepEqual(plain(c.planTaskSubject("TYT Biyoloji Hücre Bölünmeleri tekrar")),{subj:"Biyoloji",topic:"Hücre Bölünmeleri"});
  assert.equal(c.v25TaskMeta({txt:"Hücre Bölünmeleri çalış",lbl:"Biyoloji"}).topic,"Hücre Bölünmeleri");
});

test("tamamlama yolu konu işaretlemeyi görev metniyle çağırır",()=>{
  const fn=app.match(/function programTaskCompleted\([^\n]*\)\{[\s\S]*?\r?\n}/)[0];
  assert.match(fn,/programAutoTopicDone\(meta,txt\)/);
});
