const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const css=read("src/ui/design-trio-v66.css");

test("v66 her tema kendi belirteçlerini, kahraman gradyanını ve ders renklerini tanımlar",()=>{
  for(const selector of [':root[data-visual-system="refined-blue"]{',':root[data-theme="night"]{',':root[data-theme="vivid"]{']){
    const block=css.slice(css.indexOf(selector),css.indexOf("}",css.indexOf(selector)));
    assert.ok(block.length>20,selector);
    for(const token of ["--d-bg","--d-surface","--d-ink","--d-muted","--d-accent","--d-hero","--d-launch","--d-math","--d-physics","--d-chemistry","--d-biology","--d-reading"])
      assert.match(block,new RegExp(token+":"),selector+" "+token);
  }
  for(const tone of ["math","physics","chemistry","biology","reading","social","other"])assert.match(css,new RegExp('\\[data-tone="'+tone+'"\\]\\{--tone:'));
});

test("v66 Bugün: ara kapsayıcılar düzleşir; sıra başlık → sınav → sıradaki görev → sayılar → odak → plan",()=>{
  assert.match(css,/:is\(\.today-fresh-welcome,\.today-fresh-daily,\.today-fresh-progress,\.today-fresh-work-pair\)[\s\S]*?\{display:contents\}/);
  assert.match(css,/#todayFreshWorkCenter:not\(\[hidden\]\)\{display:contents\}/);
  for(const [selector,value] of [["today-fresh-title",1],["today-fresh-exam",2],["today-fresh-work-card.today-fresh-next",3],["today-fresh-stats",4],["today-fresh-work-card.today-fresh-focus",5],["today-fresh-tasks",6]])
    assert.match(css,new RegExp("\\."+selector.replace(/\./g,"\\.")+"\\{\\s*order:"+value+";"),selector);
  assert.match(css,/:is\(\.today-fresh-hello,\.today-fresh-quote,\.today-fresh-progress-head,\.today-fresh-section-heading\)\{display:none\}/);
});

test("v66 yeni düzen en son yüklenir ve eski iki kimlikli katmanları #mainWrap ile geçer",()=>{
  const main=read("src/main.ts");
  assert.ok(main.indexOf('import "./ui/design-trio-v66.css"')>main.indexOf('import "./ui/today-final-v55.css"'));
  assert.ok(main.indexOf('import "./ui/design-trio-v66.css"')>main.indexOf('import "./ui/theme-contrast-v50.css"'));
  assert.match(css,/#mainWrap #home #todayFreshStart/);
  assert.match(css,/#mainWrap #program \.rb-program-task/);
  assert.match(css,/#mainWrap #topics \.card\.subj/);
  assert.doesNotMatch(css,/@import|url\(\s*["']?https?:/);
});

test("v66 Bugün görev satırı: Koç öneki rozet olur, başlık ders, alt satır konu, ders tonu atanır",()=>{
  const source=read("src/ui/today-workspace-v38.ts");
  assert.match(source,/coach=\/\^Koç\\s\*·\/i\.test\(raw\)/);
  assert.match(source,/tag\.className="today-fresh-task-coach";tag\.textContent="Koç"/);
  assert.match(source,/task\.dataset\.tone=todayTaskTone\(/);
  const fn=source.match(/function todayTaskTone\([\s\S]*?\n}/)[0];
  const ctx={};vm.createContext(ctx);vm.runInContext(fn.replace(/:string/g,""),ctx);
  assert.equal(ctx.todayTaskTone("Kimya TYT Kimya"),"chemistry");
  assert.equal(ctx.todayTaskTone("— TYT Matematik"),"math");
  assert.equal(ctx.todayTaskTone("Paragraf"),"reading");
  assert.equal(ctx.todayTaskTone("kitap okuma"),"other");
});

test("v66 Konular ders kartı aynı ton adını alır; açılış ekranı ve alt şeridi temaya uyar",()=>{
  const app=read("app.js");
  assert.match(app,/div\.className="card subj";div\.dataset\.tone=typeof planSubjectTone==="function"\?planSubjectTone\(s\.name\):"other";/);
  const fn=app.match(/function planSubjectTone\(name\)\{[\s\S]*?\n}/)[0];
  const ctx={};vm.createContext(ctx);vm.runInContext(fn,ctx);
  assert.equal(ctx.planSubjectTone("Fizik (AYT)"),"physics");
  assert.equal(ctx.planSubjectTone("Coğrafya-2"),"social");
  assert.equal(ctx.planSubjectTone("Yabancı Dil"),"reading");
  assert.match(css,/:root\[data-visual-system\] \.yl-root\{background:var\(--d-launch\)\}/);
  assert.match(css,/\.yl-root \.yl-acts\{background:linear-gradient\(to top,var\(--d-launch-end\)/);
  assert.match(read("src/ui/launch-screen-v63.ts"),/replace\(\/\^Koç\\s\*·\\s\*\(\?:Deneme sonrası\\s\*·\\s\*\)\?\/i,""\)/);
});

test("v66 Ayarlar › Görünüm üç tema kartını tek satırda gösterir",()=>{
  assert.match(css,/#appearancePreferences \.yks-theme-grid\.yks-theme-trio\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(read("index.html"),/class="yks-theme-grid yks-theme-trio"/);
});
