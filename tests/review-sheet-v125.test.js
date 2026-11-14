const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v125 föy: yalnız çözülmemişler, yalnız data:image fotoğraflar, kaçışlı HTML, sınır",()=>{
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",[
    'import assert from "node:assert/strict";',
    `import {sheetItems,sheetHtml} from "${pathToFileURL(path.join(root,"src/domain/review-sheet.ts")).href}";`,
    'const IMG="data:image/png;base64,iVBORw0KGgo=";',
    'const row=(o)=>Object.assign({key:"w1",kind:"wrong",id:1,subject:"Fizik",topic:"Kuvvet",n:1,date:"2026-11-10",exam:"",reason:"",note:"",resolved:false},o);',
    'const rows=[row({n:3,exam:"TYT-5",question:"12",reason:"Dikkat",note:"<b>bileşen</b>"}),row({key:"w2",id:2,resolved:true}),row({key:"j9",kind:"journal",id:"9",topic:"Paragraf",subject:"Türkçe"})];',
    'const log=[{id:1,questionImgs:[IMG,"javascript:alert(1)","https://x.test/a.png"]},{id:2,questionImgs:[IMG]}];',
    'const items=sheetItems(rows,log);',
    'assert.equal(items.length,2,"çözülen dışarıda");',
    'assert.deepEqual(items[0],{title:"Fizik · Kuvvet",meta:"3 yanlış · TYT-5 · Soru 12 · Dikkat · 10.11.2026",note:"<b>bileşen</b>",photos:[IMG]});',
    'assert.deepEqual(items[1].photos,[],"defter kaydının fotoğrafı yok");',
    'const html=sheetHtml(items,"Tekrar <föyü>","14 Kasım 2026");',
    'assert.match(html,/Notum: &lt;b&gt;bileşen&lt;\\/b&gt;/);assert.doesNotMatch(html,/javascript:|x\\.test/);',
    'assert.match(html,/<title>Tekrar &lt;föyü&gt;<\\/title>/);assert.match(html,/14 Kasım 2026 · 2 soru/);assert.match(html,/break-inside:avoid/);',
    'assert.equal(sheetItems(Array.from({length:60},(_,i)=>row({key:"w"+i,id:i})),[]).length,40);',
    'assert.match(sheetHtml([],"Föy","bugün"),/çözülmemiş yanlış yok/);',
    'console.log("OK sheet");'
  ].join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/OK sheet/);
});

test("v125 bağlantı: Hata Defteri düğmesi süzgece uyar, kabukta kurulur",()=>{
  const hub=read("src/ui/exam-hub-v73.ts");
  assert.match(hub,/<span class="eh-head-side"><small>\$\{shown\.length\} kayıt<\/small>\$\{open\.length\?`<button type="button" class="btn ghost small" data-act="print-sheet">Föy yazdır<\/button>`:""\}<\/span>/);
  assert.match(hub,/a==="print-sheet"\)\{const rows=errorRows\(\)\.filter\(r=>!r\.resolved&&\(!errSubject\|\|r\.subject===errSubject\)&&\(errFilter!=="photo"\|\|r\.photos>0\)\);/);
  assert.match(read("src/ui/refined-shell.ts"),/try\{installReviewSheetV125\(\);\}catch/);
  assert.match(read("src/ui/review-sheet-v125.ts"),/if\(!win\)\{printInFrame\(content\);return true;\}/,"açılır pencere engelliyse sayfa içinden yazdırır");
});
