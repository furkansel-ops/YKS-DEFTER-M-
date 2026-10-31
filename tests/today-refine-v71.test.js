const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/today-refine-v71.ts");
const css=read("src/ui/today-refine-v71.css");
const host=read("src/ui/today-top-v33.ts");

// Saf yardımcılar tip açıklamaları ayıklanıp VM'de çalıştırılır.
function helpers(){
  // Önce tip açıklamaları silinir, sonra fonksiyon süslü parantezler sayılarak kesilir.
  const plain=source
    .replace("(text:string):PlanProgress|null","(text)")
    .replace("(progress:PlanProgress|null):{value:string;sub:string}","(progress)")
    .replace("(date:Date):boolean","(date)");
  const pick=name=>{
    const start=plain.indexOf("export function "+name+"(");let depth=0,i=plain.indexOf("{",plain.indexOf(")",start));
    for(;i<plain.length;i++){if(plain[i]==="{")depth++;else if(plain[i]==="}"&&--depth===0)break;}
    return plain.slice(start,i+1);
  };
  const code=[pick("planProgress"),pick("planTileText"),pick("isEvening")].join("\n").replace(/export function/g,"function");
  const context=vm.createContext({Number,String,Math});
  vm.runInContext(code+";globalThis.h={planProgress,planTileText,isEvening};",context);
  return context.h;
}

test("v71 Bugün iyileştirmesi ayrı isteğe bağlı parça; hata açılışı durdurmaz, eski düğümler taşınır",()=>{
  assert.match(host,/void import\("\.\/today-refine-v71"\)/);
  assert.match(host,/document\.documentElement\.dataset\.todayRefineV71=refine\.installed\?"ready":"deferred"/);
  assert.match(host,/console\.error\("Bugün düzeni yüklenemedi",error\)/);
  assert.doesNotMatch(source,/cloneNode|\.innerHTML\s*=|insertAdjacentHTML/);
  assert.doesNotMatch(source,/S\.solved|S\.pomoMin|save\(|toggleCellDone|v25DoneNext|saveSolved/,"kayıt mantığına dokunulmaz");
  assert.match(source,/if\(fresh\.dataset\.v71==="ready"\)return \{installed:true\};/);
  for(const id of ["todayFreshStart","todayFreshTaskCount","todayFreshFocusDot","todayFreshFocusTime","todayFreshNextTitle","todayFreshTaskList","todayFreshQuestions","todayFreshMinutes","todayFreshPlan","solvedInput"])
    assert.ok(source.includes('"'+id+'"')||source.includes("#"+id),id);
});

test("v71 program sayımı: '1 / 3 tamamlandı' → 1/3 · 2 görev kaldı; görev yoksa plan yok",()=>{
  const h=helpers();
  assert.deepEqual(JSON.parse(JSON.stringify(h.planProgress("1 / 3 tamamlandı"))),{done:1,total:3});
  assert.equal(h.planProgress("Bugün için henüz görev yok"),null);
  assert.equal(h.planProgress("0 / 0"),null);
  assert.deepEqual(JSON.parse(JSON.stringify(h.planProgress("9 / 4"))),{done:4,total:4},"tamamlanan toplamı aşmaz");
  assert.deepEqual(JSON.parse(JSON.stringify(h.planTileText({done:1,total:3}))),{value:"1/3",sub:"2 görev kaldı"});
  assert.deepEqual(JSON.parse(JSON.stringify(h.planTileText({done:3,total:3}))),{value:"3/3",sub:"hepsi tamam"});
  assert.deepEqual(JSON.parse(JSON.stringify(h.planTileText(null))),{value:"—",sub:"plan yok"});
});

test("v71 9: Gün sonu 20:00'den itibaren öne çıkar",()=>{
  const h=helpers();
  assert.equal(h.isEvening(new Date(2026,9,31,19,59)),false);
  assert.equal(h.isEvening(new Date(2026,9,31,20,0)),true);
  assert.equal(h.isEvening(new Date(2026,9,31,23,30)),true);
  assert.match(source,/classList\.toggle\("v71-evening",isEvening\(new Date\(\)\)\)/);
  assert.match(source,/window\.setInterval\(evening,60000\)/);
  assert.match(css,/#v71Rows\.v71-evening>#todayFreshReview\{order:0;/);
});

test("v71 2 · 4 · 5: mavi kartta ilerleme; Odak kartı yerine kutuda canlı süre; listede Sırada",()=>{
  assert.match(source,/meta\.insertAdjacentElement\("afterend",bar\)/);
  assert.match(source,/bar\.setAttribute\("role","progressbar"\)/);
  assert.match(css,/#todayFreshNextDone:not\(:disabled\)\{\s*background:transparent;border:1\.5px solid currentColor/);
  assert.match(css,/\.today-fresh-work-card\.today-fresh-focus\{display:none\}/);
  assert.match(source,/classList\.toggle\("v71-live",running\|\|paused\)/);
  assert.match(source,/set\("v71FocusLive",onBreak\?"Mola "\+time:\(running\?"▶ ":"❚❚ "\)\+time\)/);
  assert.match(source,/task\.append\(make\("span","v71-next","Sırada"\)\)/);
  assert.match(source,/\|\|open\[0\]\|\|null;/,"eşleşme yoksa ilk açık görev");
  // Toplu yenileme rAF'a bağlı değil: arka plandaki sekmede bayrak takılı kalmaz.
  assert.doesNotMatch(source,/requestAnimationFrame/);
});

test("v71 3: kutular dokunulabilir; Soru gizli kalan hızlı soru girişini taşır, Program/Odak ekranı açar",()=>{
  assert.match(source,/tap\(plan,\(\)=>navigate\("program"\)\)/);
  assert.match(source,/tap\(minutes,\(\)=>navigate\("pomo"\)\)/);
  assert.match(source,/const quick=document\.querySelector<HTMLElement>\("#home \.quick-entry"\);\s*if\(quick&&quick\.parentElement!==panel\)panel\.append\(quick\);/);
  assert.match(source,/question\.setAttribute\("aria-controls",panel\.id\)/);
  assert.match(source,/tile\.setAttribute\("role","button"\);tile\.tabIndex=0;/);
  assert.match(source,/if\(event\.key==="Enter"\|\|event\.key===" "\)/);
  assert.match(css,/\.today-fresh-stats \.today-fresh-stat\.v71-tap small\{display:block\}/,"telefonda gizlenen alt yazılar görünür");
  assert.match(css,/\.today-fresh-stats \.today-fresh-stat:not\(\.v71-live\)>:is\(\.v71-live-value,\.v71-live-sub\),\n[^{]+\.today-fresh-stat\.v71-live>:is\(#todayFreshMinutes,#todayFreshMinutesSub\)\{display:none\}/);
});

test("v71 6 · 7: Günlük ilerleme özeti gizli; dört kutu sırayla tek listeye taşınır",()=>{
  assert.match(css,/#todayFreshStart #todayFreshDailyProgress\{display:none\}/);
  assert.match(source,/\["todayFreshSubjects","◔","Ders dağılımı"\],\s*\["todayFreshInsights","↻",""\],\s*\["todayFreshActivity","▥","Haftalık ritim"\],\s*\["todayFreshReview","☾","Gün sonu"\]/);
  assert.match(source,/nodes\[0\]!\.insertAdjacentElement\("beforebegin",box\)/);
  assert.match(source,/box\.append\(details\)/);
  for(const [id,order] of [["todayFreshSubjects",1],["todayFreshInsights",2],["todayFreshActivity",3],["todayFreshReview",4]])
    assert.match(css,new RegExp("#v71Rows>#"+id+"\\{order:"+order+"\\}"),id);
  assert.match(css,/@media\(min-width:1024px\)\{:root\[data-visual-system\] #mainWrap #home #todayFreshStart>#v71Rows\{grid-column:1\/-1\}\}/);
});

test("v71 1 · 8: randevu kartı order:20 kuralını geçer, geniş ekranda boşalan yere oturur; yeşil düğmeler mavi",()=>{
  assert.match(css,/#todayFreshStart>:is\(#studentApptEntry,#studentNextAppointment\)\{order:3;margin:0\}/);
  assert.match(css,/@media\(min-width:1024px\)\{\s*:root\[data-visual-system\] #mainWrap #home #todayFreshStart>:is\(#studentApptEntry,#studentNextAppointment\)\{grid-area:6\/1\}/);
  assert.match(css,/@media\(min-width:1280px\)\{\s*:root\[data-visual-system\] #mainWrap #home #todayFreshStart>:is\(#studentApptEntry,#studentNextAppointment\)\{grid-area:4\/2;align-self:end\}/);
  assert.match(css,/:root :is\(#briefOverlay,#v71SolvedPanel\) \.btn\.green\{/);
});

test("v71 stilleri yalnız tema değişkenleri kullanır",()=>{
  const values=css.replace(/var\(--rb-on-accent,#fff\)/g,"");
  assert.deepEqual(values.match(/[:,(\s]#[0-9a-fA-F]{3,8}\b/g)||[],[]);
  assert.doesNotMatch(css,/rgba?\(|hsl\(/);
});
