const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;

test("v118 hesap: son 30 günün ruh hali dizisi; ay geçişi, aralık dışı ve bozuk kayıt",()=>{
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",[
    'import assert from "node:assert/strict";',
    `import {moodHistory} from "${url("src/domain/mood-history.ts")}";`,
    'const review={"2026-11-14":{mood:"good"},"2026-11-13":{mood:"hard",note:"x"},"2026-10-16":{mood:"mid"},"2026-10-15":{mood:"good"},"2026-11-10":{mood:"harika"},"2026-11-09":null,"2026-11-08":{note:"yalnız not"}};',
    'const h=moodHistory(review,"2026-11-14");',
    'assert.equal(h.days.length,30);assert.equal(h.days[0].date,"2026-10-16");assert.equal(h.days[29].date,"2026-11-14");',
    'assert.deepEqual(h.counts,{good:1,mid:1,hard:1});assert.equal(h.total,3,"30 günden eski ve geçersiz değer sayılmaz");',
    'assert.deepEqual([h.days[0].mood,h.days[28].mood,h.days[29].mood,h.days[25].mood],["mid","hard","good",""]);',
    'assert.equal(moodHistory(undefined,"2026-01-02",3).days[0].date,"2025-12-31","yıl geçişi");',
    'assert.equal(moodHistory([],"2026-11-14").total,0);',
    'console.log("OK mood");'
  ].join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/OK mood/);
});

test("v118 bağlantı: İlerleme ekranı grafiği çizer; kayıt yoksa kart çıkmaz; renk tek ipucu değil",()=>{
  const ui=read("src/ui/mood-chart-v118.ts"),hub=read("src/ui/progress-hub-v74.ts"),shell=read("src/ui/refined-shell.ts"),css=read("src/ui/mood-chart-v118.css");
  assert.match(shell,/try\{installMoodChartV118\(\);\}catch/);
  assert.match(hub,/\$\{chart\(s\)\}\$\{\(L as Loose\)\.YKSMoodChart\?\.html\(s\)\?\?""\}/);
  assert.match(ui,/if\(!h\.total\)return "";/);
  assert.match(ui,/role="img" aria-label="Son \$\{DAYS\} günde gün sonu ruh hali: \$\{summary\}"/);
  for(const [mood,row] of [["good",1],["mid",2],["hard",3]])assert.ok(css.includes('[data-mood="'+mood+'"]{grid-row:'+row+'}'),"ruh hali satır konumuyla da ayrılır");
  assert.match(css,/grid-template-columns:22px repeat\(30,/);assert.match(ui,/const DAYS=30;/);
});
