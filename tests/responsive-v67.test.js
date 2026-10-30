const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const css=read("src/ui/responsive-v67.css");
const blockAt=at=>{let depth=0,i=css.indexOf("{",at);for(;i<css.length;i++){if(css[i]==="{")depth++;else if(css[i]==="}"&&--depth===0)break;}return css.slice(at,i+1);};
const block=query=>{const at=css.indexOf("@media("+query+"){");assert.ok(at>=0,query);return blockAt(at);};
const blocks=query=>{const out=[];for(let at=css.indexOf("@media("+query+"){");at>=0;at=css.indexOf("@media("+query+"){",at+1))out.push(blockAt(at));assert.ok(out.length,query);return out.join("\n");};

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
  assert.match(pc,/#topics\.screen\.active\{display:grid;grid-template-columns:280px minmax\(0,1fr\)/);
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

test("v67 tablet yatay ve üstünde Günlük Plan iki sütun: görevler solda, gün özeti ve halka sağda",()=>{
  const tl=block("min-width:1024px");
  assert.match(tl,/#refinedProgramDay:not\(\[hidden\]\)\{display:grid;grid-template-columns:minmax\(0,1fr\) 300px/,"gizli panel gizli kalır");
  assert.match(tl,/#refinedProgramDay>\.rb-program-tasks\{grid-column:1;grid-row:2 \/ span 3;min-width:0\}/);
  assert.match(tl,/#refinedProgramDay>\.rb-v4-day-progress\{grid-column:2;grid-row:2;position:sticky/);
  assert.match(tl,/#refinedProgramDay>\.rb-v4-day-progress\{flex-wrap:wrap/,"dar sütunda metin üst üste binmez");
});

test("v67/v66 hiçbir kural etkin olmayan bir ekranı görünür yapamaz (.screen gizlemesi korunur)",()=>{
  // Bilgisayarda Konular her ekranın üstünde görünüyordu: #topics{display:grid} etkin olmayan ekranı da açıyordu.
  const screens=["home","program","topics","deneme","pomo","more","progress"];
  for(const file of ["src/ui/responsive-v67.css","src/ui/design-trio-v66.css"]){
    const source=read(file).replace(/\/\*[\s\S]*?\*\//g,"");
    for(const found of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
      if(!/(^|;)\s*display\s*:/.test(found[2]))continue;
      for(const selector of found[1].split(",")){
        const last=selector.trim().split(/\s*[>+~]\s*|\s+/).pop();
        for(const id of screens)
          if(new RegExp("^#"+id+"(?![\\w-])").test(last))
            assert.match(last,/\.active/,file+": "+selector.trim()+" ekranın görünürlüğünü .active olmadan değiştiriyor");
      }
    }
  }
});

test("v67 sabit tam ekran katmanlar menü genişliğinin yarısı kadar kaydırılmaz; gün planı penceresinde Koç öneki yok",()=>{
  const css=read("app.css");
  const at=css.indexOf(".simov,.qaviewer,.wizov,.brov,.vidov,.playov,.gunov,.optikov,.anaov{");
  assert.ok(at>0);
  const rule=css.slice(at,css.indexOf("}",at));
  assert.match(rule,/left:0;right:auto;width:100vw;max-width:none;/);
  assert.doesNotMatch(rule,/translateX/,"232px menüde katman 116px ekran dışına kayıyordu");
  assert.match(read("app.js"),/esc\(\(t=>t\.length>54\?t\.slice\(0,54\)\+"…":t\)\(planStripCoach\(g\.txt\)\)\)/);
});

test("v68 Odak, Deneme, Merkez: tablette sayaç önce ve iki sütun; bilgisayarda yan yana düzen",()=>{
  const tablet=blocks("min-width:760px) and (max-width:979px"),t=blocks("min-width:760px"),wide=blocks("min-width:1024px"),pc=blocks("min-width:1280px");
  // 980px'ten sonra app.css Odak'ı iki sütun yapar; sayacı öne almak onu dar sol sütuna iterdi.
  assert.match(tablet,/#pomo \.desktop-focus-workspace>\.desktop-focus-side:last-child\{order:-1\}/);
  assert.doesNotMatch(blocks("min-width:760px) and (max-width:1023px"),/order:-1/);
  assert.match(t,/#more #v43MoreTools\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(t,/#deneme\.screen\.active/,"dikey tablette Deneme tek sütun kalır");
  assert.match(wide,/#deneme\.screen\.active\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(wide,/#deneme>:is\(#refinedExamJournal,#refinedExamCycle,#refinedExamAnalysis,#refinedExamHistory\)\{grid-column:auto\}/);
  assert.match(pc,/#pomo\.screen\.active\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.6fr\);grid-template-rows:repeat\(5,auto\) 1fr/,"son esnek satır sol sütunda boşluk bırakmaz");
  assert.match(pc,/\.desktop-focus-side:last-child\{grid-column:2;grid-row:4 \/ 7\}/);
  assert.match(pc,/#pomo>#refinedFocusDetails\{grid-column:1;grid-row:5/);
  assert.match(pc,/#more #v43MoreHub\{max-width:1180px\}/);
  assert.match(pc,/#more #v43MoreTools\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
  assert.match(pc,/\.v315-dash-grid>\.v315-subject-card\{grid-column:2;grid-row:1\}/);
  const study=read("src/ui/refined-study-screens.ts");
  assert.match(study,/const keepSubject=wideExamLayout\(\);/);
  assert.match(study,/!\(keepSubject&&card\.classList\.contains\("v315-subject-card"\)\)/);
  assert.match(study,/wide\.addEventListener\("change",schedule\);else wide\.addListener\?\.\(schedule\)/,"pencere değişince kart yerine döner (eski Safari dahil)");
});
