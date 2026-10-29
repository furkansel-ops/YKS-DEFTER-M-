const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {loadTaskText}=require("./task-text-fixture");

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

test("v66 tek kaynak: Koç öneki ve ders tonu app.js'ten gelir; ekranlar kendi kopyasını tutmaz",()=>{
  const {stripCoachPrefix,subjectTone}=loadTaskText();
  assert.equal(stripCoachPrefix("Koç · Deneme sonrası · TYT Kimya · Mol Kavramı"),"TYT Kimya · Mol Kavramı");
  assert.equal(stripCoachPrefix("TYT Kimya"),"TYT Kimya");
  for(const [value,tone] of [["Kimya TYT Kimya","chemistry"],["— TYT Matematik","math"],["Paragraf","reading"],["kitap okuma","reading"],["Yabancı Dil","reading"],["Tarih-2","social"],["Deneme Analizi","other"]])
    assert.equal(subjectTone(value),tone,value);
  for(const file of ["src/ui/today-v43.ts","src/ui/today-workspace-v38.ts","src/ui/launch-screen-v63.ts","src/ui/refined-program.ts"]){
    const source=read(file);
    assert.ok(!source.includes("Deneme sonrası\\s"),file+" önek kopyası tutmaz");
    assert.ok(source.includes("(globalThis as {YKSTaskText?:YksTaskText}).YKSTaskText"),file);
  }
  const v38=read("src/ui/today-workspace-v38.ts");
  assert.ok(v38.includes("const title=stripCoach(raw),coach=title!==raw"));
  assert.ok(v38.includes('tag.className="today-fresh-task-coach";tag.textContent="Koç"'));
  assert.ok(v38.includes("task.dataset.tone=taskText()?.subjectTone("));
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
  assert.ok(read("src/ui/launch-screen-v63.ts").includes("esc(stripCoach(String(task.txt)))"));
});

test("v66 Ayarlar › Görünüm üç tema kartını tek satırda gösterir",()=>{
  assert.match(css,/#appearancePreferences \.yks-theme-grid\.yks-theme-trio\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(read("index.html"),/class="yks-theme-grid yks-theme-trio"/);
});

test("v66 Gece/Canlı açılışta açık renk parlaması olmaz: ayrı ipucu betiği, boot denetleyicisi depolamaya dokunmaz",()=>{
  const html=read("index.html"),app=read("app.js");
  const hint=html.match(/<script id="yksThemeHint">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(hint,"ipucu betiği var");
  assert.ok(html.indexOf('id="yksThemeHint"')<html.indexOf("<body"),"gövde boyanmadan önce çalışır");
  const run=(stored,throws=false)=>{
    const dataset={},meta={content:"#f5f7fb"};
    vm.runInNewContext(hint,{localStorage:{getItem:key=>{if(throws)throw new Error("blocked");return key==="yks_theme_hint_v1"?stored:null}},
      document:{documentElement:{dataset},getElementById:id=>id==="metaTheme"?meta:null}});
    return {dataset,meta};
  };
  assert.equal(run("night").dataset.bootTheme,"night");assert.equal(run("night").meta.content,"#0a0f1c");
  assert.equal(run("vivid").dataset.bootTheme,"vivid");
  assert.equal(run("refined-blue").dataset.bootTheme,undefined);assert.equal(run("graphite").dataset.bootTheme,undefined);
  assert.doesNotThrow(()=>run(null,true),"depolama kapalıysa sessizce geçer");
  assert.match(html,/html\[data-boot-theme="night"\] #yksBootShell\{background:#0a0f1c/);
  const apply=app.slice(app.indexOf("function applyTheme()"),app.indexOf("function setTheme("));
  assert.match(apply,/root\.dataset\.bootTheme=active;\n  try\{localStorage\.setItem\("yks_theme_hint_v1",active\);\}catch\(e\)\{\}/);
  const controller=html.match(/<script id="yksBootController">([\s\S]*?)<\/script>/)[1];
  assert.doesNotMatch(controller,/localStorage/);
});
