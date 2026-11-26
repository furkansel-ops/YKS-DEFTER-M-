const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const hub=read("src/ui/exam-hub-v73.ts"),cal=read("src/ui/exam-calendar-v120.ts"),css=read("src/ui/exam-v106.css");

// Saf yardımcılar dosyadan alınır (modülün geri kalanı DOM ister).
function helpers(){
  const pick=name=>{const m=hub.match(new RegExp("(?:export )?function "+name+"\\([\\s\\S]*?\\n\\}"));assert.ok(m,name);return m[0].replace(/^export /,"");};
  const code=stripTypeScriptTypes(["function num(value){const n=Number(value);return Number.isFinite(n)?n:0;}",pick("subjectDelta"),pick("gainRows")].join("\n"),{mode:"strip"});
  const c={};vm.createContext(c);vm.runInContext(code,c);return c;
}

test("v160 ders farkı: aynı adlı dersle; fark yoksa ya da ders öncekinde yoksa boş",()=>{
  const {subjectDelta}=helpers(),prev=[{name:"Türkçe",net:30},{name:"Fen",net:9.5}];
  assert.equal(subjectDelta({name:"Türkçe",net:31.25},prev),1.25);
  assert.equal(subjectDelta({name:"Fen",net:8},prev),-1.5);
  assert.equal(subjectDelta({name:"Fen",net:9.5},prev),null);
  assert.equal(subjectDelta({name:"Sosyal",net:12},prev),null);
  assert.equal(subjectDelta({name:"Türkçe",net:31},[]),null,"ilk deneme");
});

test("v160 kazanç: yanlış başına 1,25, boş başına 1; en çok kazandıran 4 ders",()=>{
  const {gainRows}=helpers();
  const rows=gainRows([{name:"Türkçe",y:7,b:0},{name:"Sosyal",y:5,b:1},{name:"Matematik",y:10,b:2},{name:"Fen",y:6,b:2},{name:"Din",y:0,b:0},{name:"X",y:1,b:0}]);
  assert.deepEqual(rows.map(r=>r.name+" "+r.gain),["Matematik 14.5","Fen 9.5","Türkçe 8.75","Sosyal 7.25"]);
  assert.deepEqual([...gainRows([{name:"A",y:0,b:0},{name:"B",y:"x",b:-2}])],[],"kazanç yoksa kart çizilmez");
});

test("v160 Özet bağlantıları: kart altı özet satırı, kazanç kartı, tek satır döngü ve takvim",()=>{
  assert.match(hub,/if\(!byId\("examHubGain"\)\)\{const gain=document\.createElement\("div"\);gain\.id="examHubGain";gain\.className="eh-gain-slot";byId\("examHubHero"\)\?\.after\(gain\);\}/);
  assert.match(hub,/if\(hero\)hero\.innerHTML=heroHtml\(type,!\(gain&&gainSlot\)\);/,"düğmeler kazanç kartına geçer");
  assert.match(hub,/<div class="eh-kline"><span>Son \$\{recent\.length\} ort\./);
  assert.match(hub,/class="card eh-loop eh-line" data-act="tab" data-tab="hata"/);
  assert.match(cal,/if\(!rows\.length&&!formOpen\)return `<div class="card ec-card ec-line">/);
  assert.match(cal,/data-plan-act="form" aria-expanded="false">\+ Planla<\/button>/,"aynı form düğmesi");
  assert.match(css,/#deneme:has\(#examHubHero \.eh-kline\) #v315Kpis\{display:none\}/,"eski üç kutu yerine özet satırı");
  assert.match(css,/#deneme\[data-exam-tab\]:not\(\[data-exam-tab="ozet"\]\) #examHubGain/);
});
