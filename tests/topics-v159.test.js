const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const app=read("app.js"),css=read("src/ui/topics-v105.css");
const line=name=>{const m=app.match(new RegExp("function "+name+"\\([^)]*\\)\\{.*\\}"));assert.ok(m,name);return m[0];};
const box=()=>{const c={};vm.createContext(c);vm.runInContext([line("v159Stages"),line("v159StageBar"),line("v159StageText")].join("\n"),c);return c;};

test("v159 aşama sayacı: st 0–3 sayılır, bozuk değer uca sabitlenir",()=>{
  const {v159Stages}=box();
  assert.deepEqual([...v159Stages([3,3,2,1,0,undefined,7,-2])],[3,1,1,3]);
});

test("v159 aşama metni ve çubuğu",()=>{
  const {v159StageText,v159StageBar}=box();
  assert.equal(v159StageText([5,3,6,9]),"9 pekişti · 6 soru · 3 işlendi");
  assert.equal(v159StageText([5,0,2,0]),"2 soru","sıfırlar yazılmaz");
  assert.equal(v159StageText([0,0,0,4]),"Tamamlandı");
  assert.equal(v159StageText([7,0,0,0]),"7 konu · başlanmadı");
  const bar=v159StageBar([2,1,1,0],"bar v159-stage");
  assert.match(bar,/^<span class="bar v159-stage" aria-hidden="true"><i class="s3" style="width:0\.0%"><\/i><i class="s2" style="width:25\.0%"><\/i><i class="s1" style="width:25\.0%"><\/i><\/span>$/);
  assert.match(v159StageBar([0,0,0,0],"x"),/width:0\.0%/,"boş derste sıfıra bölünmez");
});

test("v159 özet ve ders kartı aşama çubuğunu çizer; renkler tema belirteçlerinden",()=>{
  assert.match(app,/<div id="v159SumStage"><\/div>/);
  assert.match(app,/el\("v105SumTitle"\)\.textContent=done\+" \/ "\+total\+" konu pekişti";const c=v159Stages\(rows\.map\(x=>x\.t\.st\)\)/);
  assert.match(app,/v159StageText\(stages\)\+'<\/small>'\)\+v159StageBar\(stages,"bar v159-stage"\)/);
  assert.match(css,/\.v159-stage>i\.s3,\n[^\n]*\{background:var\(--d-ok\)\}/);
  assert.match(css,/\.topic\[data-st="2"\] \.pill\.on\{background:var\(--d-accent\)/);
});
