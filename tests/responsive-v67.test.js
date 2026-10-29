const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const css=read("src/ui/responsive-v67.css");
const block=query=>{const at=css.indexOf("@media("+query+"){");assert.ok(at>=0,query);let depth=0,i=css.indexOf("{",at);for(;i<css.length;i++){if(css[i]==="{")depth++;else if(css[i]==="}"&&--depth===0)break;}return css.slice(at,i+1);};

test("v67 üç kırılma: telefon alt menü, tablet şerit, bilgisayar 232px tam yan menü",()=>{
  const main=read("src/main.ts");
  assert.ok(main.indexOf('import "./ui/responsive-v67.css"')>main.indexOf('import "./ui/design-trio-v66.css"'),"en son yüklenir");
  const pc=block("min-width:1280px");
  assert.match(pc,/:root\[data-visual-system="refined-blue"\]\{--rail:232px\}/);
  assert.match(pc,/\.tabbar \.tab\{\s*position:relative;flex-direction:row/);
  for(const [tab,order] of [["home",1],["program",2],["pomo",3],["topics",4],["deneme",5],["progress",6],["pp",7],["more",8]])
    assert.match(pc,new RegExp('\\.tab\\[data-s="'+tab+'"\\]\\{order:'+order+'[;}]'),tab);
  assert.match(pc,/\.tab\[data-s="home"\]::after\{content:"Çalışma"\}/);
  assert.match(pc,/\.tab\[data-s="topics"\]::after\{content:"Takip"\}/);
  assert.doesNotMatch(pc,/\.tab[^{]*::before\{content:/,"::before etkin sekme çubuğudur; grup başlığı için kullanılmaz");
  assert.match(css,/@media\(max-width:1279px\)\{\.rb-side-count\{display:none\}\}/);
  assert.doesNotMatch(css,/max-width:759px/,"telefon düzeni mevcut alt menüde kalır");
});

test("v67 Bugün: tablet yatayda plan sağda, bilgisayarda sağ sütun sayılar/odak/tekrarlar",()=>{
  const tl=block("min-width:1024px"),pc=block("min-width:1280px");
  assert.match(tl,/#todayFreshStart\{\s*display:grid;grid-template-columns:minmax\(0,1\.2fr\) minmax\(0,1fr\)/);
  assert.match(tl,/\.today-fresh-tasks\{grid-column:2;grid-row:4 \/ span 3\}/);
  assert.match(tl,/\.today-fresh-exam\{grid-row:3;justify-self:start\}/);
  assert.match(tl,/#mainWrap #home\{max-width:none\}/);
  assert.match(pc,/\.today-fresh-next\{grid-column:1;grid-row:3 \/ span 2\}/);
  assert.match(pc,/\.today-fresh-stats\{grid-column:2;grid-row:3\}/);
  assert.match(pc,/\.today-fresh-focus\{grid-column:2;grid-row:4;align-self:end\}/);
  assert.match(pc,/#todayFreshInsights\{grid-column:2;grid-row:5\}/);
  assert.match(pc,/\.today-fresh-exam\{display:none\}/,"geri sayım yan menüye taşınır");
  assert.doesNotMatch(read("src/ui/design-trio-v66.css"),/max-width:760px/,"eski sabit telefon sütunu kalktı");
});

test("v67 Konular: bilgisayarda filtreler solda yapışkan; Program haftalıkta tekrar eden gün şeridi gizli",()=>{
  const pc=block("min-width:1280px");
  assert.match(pc,/#topics\{display:grid;grid-template-columns:280px minmax\(0,1fr\)/);
  assert.match(pc,/#topics>\.v26-topic-tools\{grid-column:1;grid-row:3 \/ span 6;position:sticky/);
  assert.match(pc,/#topics>#subjectList\{grid-column:2;grid-row:3 \/ span 6\}/);
  assert.match(block("min-width:1280px) and (max-width:1439px"),/#subjectList\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
  assert.match(block("min-width:1024px"),/#program\[data-refined-program="week"\] \.rb-program-weekstrip\{display:none\}/);
});

test("v67 Program bilgisayarda Haftalık Bakış ile açılır; matchMedia yoksa günlük kalır",()=>{
  const source=read("src/ui/refined-program.ts");
  assert.match(source,/view:ProgramView=refinedProgramInitialView\(\)/);
  const fn=source.match(/export function refinedProgramInitialView\(\):ProgramView\{[\s\S]*?\n}/)[0].replace(/^export /,"");
  const run=matchMedia=>vm.runInNewContext(stripTypeScriptTypes("type ProgramView=\"day\"|\"week\"|\"smart\";\n"+fn)+"\nrefinedProgramInitialView()",matchMedia===undefined?{}:{matchMedia});
  assert.equal(run(query=>({matches:query==="(min-width:1280px)"})),"week");
  assert.equal(run(()=>({matches:false})),"day");
  assert.equal(run(undefined),"day");
  assert.equal(run(()=>{throw new Error("x")}),"day");
});

test("v67 yan menü geri sayımı Bugün metnini okur, kayıt yazmaz ve tembel yüklenir",()=>{
  const source=read("src/ui/shell-countdown-v67.ts");
  assert.match(read("src/ui/startup-extras.ts"),/import\("\.\/shell-countdown-v67"\)/);
  assert.doesNotMatch(read("src/main.ts"),/shell-countdown-v67/,"ana paket büyümez");
  assert.doesNotMatch(source,/localStorage|save\(|innerHTML/);
  const nodes={todayFreshDays:{textContent:"233"},todayFreshExamDate:{textContent:"19 Haziran 2027"}},appended=[],observed=[];
  const make=tag=>({tagName:tag,children:[],textContent:"",hidden:false,attrs:{},setAttribute(k,v){this.attrs[k]=v},append(...c){this.children.push(...c)}});
  const document={querySelector:()=>null,getElementById:id=>nodes[id]||null,createElement:make,body:{append:node=>appended.push(node)}};
  let onChange=null;
  class MutationObserver{constructor(fn){onChange=fn}observe(node){observed.push(node)}}
  const ctx={document,MutationObserver};
  vm.runInNewContext(stripTypeScriptTypes(source).replace(/^export /gm,""),ctx);
  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInNewContext("installShellCountdownV67()",ctx))),{installed:true});
  const card=appended[0];
  assert.equal(card.className,"rb-side-count");assert.equal(card.attrs["aria-label"],"YKS geri sayımı");
  assert.deepEqual(card.children.map(c=>c.textContent),["YKS'ye kalan","233 gün","19 Haziran 2027"]);
  assert.equal(card.hidden,false);assert.equal(observed.length,2);
  nodes.todayFreshDays.textContent="—";onChange();
  assert.equal(card.hidden,true,"sayı hazır değilse kart gizlenir");
  nodes.todayFreshDays.textContent="232";onChange();
  assert.equal(card.hidden,false);assert.equal(card.children[1].textContent,"232 gün");
});
