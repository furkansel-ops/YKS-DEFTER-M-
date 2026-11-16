const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const app=read("app.js"),html=read("index.html");
const fn=name=>app.match(new RegExp(`function ${name}\\([^)]*\\)\\{[\\s\\S]*?\\n\\}`))[0];

function load(S){
  const ctx={S,Date,Number,String,Math,Array};vm.createContext(ctx);
  vm.runInContext([
    app.match(/function esc\(s\)\{[^\n]*\}/)[0],
    app.match(/const SIM_PLANS=\{[\s\S]*?\n\};/)[0],
    app.match(/const SIM_NAMES=\{[^\n]*\};/)[0],
    fn("simPlanFor"),fn("simPlanHtml"),fn("simLastHtml"),
    "this.SIM_PLANS=SIM_PLANS;"
  ].join("\n"),ctx);
  return ctx;
}

test("v132 bölüm planı: önerilen süreler, kullanıcının dakikaları üstüne yazılır, toplam sınav süresini aşınca uyarır",()=>{
  const t=load({simPlans:{}});
  assert.deepEqual(JSON.parse(JSON.stringify(t.simPlanFor(165))),[["Türkçe",40],["Sosyal Bilimler",25],["Temel Matematik",60],["Fen Bilimleri",40]]);
  assert.equal(t.simPlanFor(120),null,"özel sürede plan yok");
  t.S.simPlans={165:[45,20,60,40]};
  assert.deepEqual(JSON.parse(JSON.stringify(t.simPlanFor(165))).map(p=>p[1]),[45,20,60,40]);
  assert.match(t.simPlanHtml(165,t.simPlanFor(165)),/165 \/ 165 dk/);
  assert.match(t.simPlanHtml(165,t.simPlanFor(165)),/Önerilen plana dön/);
  t.S.simPlans={165:[60,25,60,40]};
  assert.match(t.simPlanHtml(165,t.simPlanFor(165)),/class="over">185 \/ 165 dk/);
  assert.equal(t.simPlanHtml(80,t.simPlanFor(80)),"","tek bölümlü YDT'de plan gösterilmez");
});

test("v132 son deneme: bölüm başına gerçek süre, plan farkı ve en çok taşan bölüm; metin kaçışlı yazılır",()=>{
  const t=load({});
  assert.equal(t.simLastHtml(undefined),"");
  const out=t.simLastHtml({at:Date.UTC(2026,10,16,12),min:165,m:158,splits:[
    {name:"Türkçe",sec:48*60,plan:40},{name:"Sosyal Bilimler",sec:20*60,plan:25},{name:"<b>x</b>",sec:60*60,plan:60}]});
  assert.match(out,/Son deneme · TYT/);
  assert.match(out,/<span>Türkçe<\/span><b>48 dk<\/b><small class="over">\+8 · plan 40<\/small>/);
  assert.match(out,/<small class="">-5 · plan 25<\/small>/);
  assert.match(out,/±0 · plan 60/);
  assert.match(out,/En çok <b>Türkçe<\/b> taştı \(\+8 dk\)/);
  assert.match(out,/&lt;b&gt;x&lt;\/b&gt;/);assert.doesNotMatch(out,/<b>x<\/b>/);
  assert.match(t.simLastHtml({at:0,min:180,m:170,splits:[{name:"Matematik",sec:70*60,plan:75}]}),/Bütün bölümler planın içinde kaldı/);
});

test("v132 bağlantı: kart seçim düğmeleri, plan kutusu, sonuç kutusu; bitişte son bölüm sonuca eklenir; veriler temizlenir",()=>{
  for(const m of [165,180,80,0])assert.match(html,new RegExp(`data-sim="${m}" onclick="simPick\\(${m}\\)"`));
  for(const id of ["simCustomBox","simPlanBox","simLastBox","simMin"])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/onclick="simStartPicked\(\)"/);
  assert.match(app,/plan:simPlanFor\(m\)/);
  assert.match(app,/S\.simLast=\{at:now,min:run\.min,m:m,splits:run\.plan\.map\(\(p,i\)=>\(\{name:p\[0\],sec:spent\[i\],plan:p\[1\]\}\)\)\}/);
  assert.match(app,/if\(!Array\.isArray\(a\)\|\|!a\.every\(n=>Number\.isInteger\(n\)&&n>=1&&n<=600\)\)delete o\.simPlans\[k\]/);
  assert.match(app,/let simPicked=null;/,"SIM_PLANS sonra tanımlı: açılışta okunmaz");
});
