const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;

test("v117 hesap: neden dağılımı ve derse göre konu ısı haritası; bozuk satır çökmez",()=>{
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",[
    'import assert from "node:assert/strict";',
    `import {reasonStats,topicHeat} from "${url("src/domain/error-insights.ts")}";`,
    'const rows=[',
    ' {subject:"Matematik",topic:"Problemler",n:7,reason:"Bilgi eksiği",resolved:false},',
    ' {subject:"Matematik",topic:"problemler",n:1,reason:"Dikkat",resolved:true},',   // aynı konu, harf farkı
    ' {subject:"Matematik",topic:"Üslü Sayılar",n:2,reason:"",resolved:true},',
    ' {subject:"Fizik",topic:"Optik",n:4,reason:"Dikkat"},',
    ' {subject:"Fizik",topic:"",n:9,reason:"Süre"},',                                 // konusuz: haritaya girmez
    ' {subject:"Kimya",topic:"Mol",n:"x"},null,"bozuk"];',                            // geçersiz adet 1 sayılır
    'assert.deepEqual(reasonStats(rows),[{label:"Süre",n:9,pct:38},{label:"Bilgi eksiği",n:7,pct:29},{label:"Dikkat",n:5,pct:21},{label:"Belirtilmedi",n:3,pct:13}]);',
    'const heat=topicHeat(rows);',
    'assert.deepEqual(heat.map(s=>[s.subject,s.total]),[["Matematik",10],["Fizik",4],["Kimya",1]]);',
    'assert.deepEqual(heat[0].topics,[{topic:"Problemler",n:8,open:7,level:4},{topic:"Üslü Sayılar",n:2,open:0,level:1}]);',
    'assert.equal(heat[1].topics[0].level,2,"4/8 → 2. seviye");',
    'const cut=topicHeat(rows,1,1);assert.equal(cut.length,1);assert.equal(cut[0].topics.length,1);assert.equal(cut[0].more,1);',
    'assert.deepEqual(reasonStats(undefined),[]);assert.deepEqual(topicHeat(null),[]);',
    'console.log("OK insights");'
  ].join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/OK insights/);
});

test("v117 bağlantı: Hatalar sekmesi kartı çizer, derse basınca süzgeç seçilir, metin kaçışlanır",()=>{
  const ui=read("src/ui/error-insights-v117.ts"),hub=read("src/ui/exam-hub-v73.ts"),shell=read("src/ui/refined-shell.ts"),css=read("src/ui/error-insights-v117.css");
  assert.match(shell,/try\{installErrorInsightsV117\(\);\}catch/);
  assert.match(hub,/html\+=\(L as Loose\)\.YKSErrorInsights\?\.html\(rows\)\?\?"";/);
  assert.match(hub,/a==="heat"\)\{errSubject=act\.dataset\.subject\|\|"";errFilter="all"/);
  assert.match(ui,/rows\.length<MIN_ROWS\)return "";/,"az kayıtla kart çıkmaz");
  for(const value of ["r.label","s.subject","t.topic"])assert.match(ui,new RegExp("esc\\("+value.replace(".","\\.")+"\\)"),value+" kaçışlanır");
  assert.match(ui,/data-act="heat" data-subject="\$\{esc\(s\.subject\)\}"/);
  assert.doesNotMatch(css,/#[0-9a-f]{3,8}\b(?![^(]*\))/i,"ham renk yalnız değişken yedeği olarak");
  for(const level of [1,2,3,4])assert.match(css,new RegExp('data-level="'+level+'"\\]\\{background:color-mix'));
});
