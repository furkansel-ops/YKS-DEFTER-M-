const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/refined-program.ts");
const css=read("src/ui/refined-program-v72.css");

// Ton eşlemesi tek başına çalıştırılır.
function groupTone(){
  const start=source.indexOf("const GROUP_TONE:"),end=source.indexOf("function refinedProgramSubjectIcon(");
  const code=stripTypeScriptTypes(source.slice(start,end),{mode:"strip"}).replace(/^export /gm,"");
  return vm.runInNewContext(code+"\nrefinedProgramGroupTone",{});
}

test("v72 stilleri en son yüklenir ve v66 tema kurallarını geçecek öncelikte",()=>{
  assert.match(source,/import "\.\/refined-program-v4\.css";\nimport "\.\/refined-program-v72\.css";/);
  // Yorumlar atılır; seçici listesi yalnız üst düzey virgüllerden bölünür (:is(a,b) içi korunur).
  const plain=css.replace(/\/\*[\s\S]*?\*\//g,"");
  const split=selector=>{const out=[];let depth=0,cur="";for(const ch of selector){if(ch==="(")depth++;if(ch===")")depth--;if(ch===","&&!depth){out.push(cur);cur="";}else cur+=ch;}out.push(cur);return out;};
  const rules=plain.match(/[^{};]+\{/g).map(s=>s.trim().slice(0,-1).trim()).filter(s=>!s.startsWith("@")&&!s.startsWith("--")&&!/^[a-z-]+:/.test(s));
  for(const selector of rules)for(const part of split(selector))
    assert.match(part.trim(),/^:root\[data-visual-system\] #mainWrap #program /,part.trim());
});

test("v72 1 · 2: başlıkta sürüm rozeti ve slogan yok; hafta gezintisi ve gün şeridi tek kartta",()=>{
  assert.match(source,/heading\.append\(element\("h1","","Programım"\),weekSummary\);/);
  assert.doesNotMatch(source,/✦ 4\.0|Planla, çalış, takip et/);
  assert.match(source,/weekSummary\.textContent=total\?`Bu hafta \$\{total\} çalışma · \$\{completed\} tamamlandı`:"Bu hafta henüz çalışma yok";/);
  assert.match(source,/const weekCard=element\("div","rb-program-weekcard"\);weekCard\.append\(weekNav,strip\);/);
  assert.match(source,/root\.append\(heading,toolbar,weekCard,form,/);
  assert.match(source,/weekNav\.append\(previous,weekLabel,next,today\);/);
});

test("v72 3: her ders grubu tek tema tonuna bağlanır; şerit, grup ve tik aynı renkten",()=>{
  const tone=groupTone();
  for(const [key,expected] of [["math","math"],["reading","reading"],["physics","physics"],["chemistry","chemistry"],["biology","biology"],
    ["geometry","math"],["literature","reading"],["history","social"],["geography","social"],["philosophy","social"],["religion","social"],["english","other"],["other","other"]])
    assert.equal(tone(key),expected,key);
  assert.match(source,/section\.dataset\.v4Group=group\.key;section\.dataset\.v4Tone=refinedProgramGroupTone\(group\.key\);/);
  assert.match(source,/card\.dataset\.v4Tone=refinedProgramGroupTone\(group\.key\);/);
  assert.match(css,/\.rb-v4-subject-section\[data-v4-tone\]\{\s*--rb-v4-group-color:var\(--tone,var\(--d-accent\)\);/);
});

test("v72 4: boş kutu sakin ve görünür (en az 3:1), tamamlanınca düz yeşil kutu; iç turuncu kare ve yeşil zemin yok",()=>{
  assert.match(css,/\.rb-program-check\[aria-pressed="true"\]\{background:transparent;border-color:transparent\}/);
  assert.match(css,/\.rb-program-check::before\{\s*border-color:color-mix\(in srgb,var\(--d-muted\) 75%,var\(--d-surface\)\)/);
  assert.match(css,/\.rb-program-check\[aria-pressed="true"\]::before\{background:var\(--d-ok\);border-color:var\(--d-ok\)\}/);
  assert.match(css,/\.rb-program-check>\.rb-program-icon\{color:var\(--d-on-accent,#fff\)\}/,"gece temasında açık yeşilde koyu tik");
  assert.match(css,/\.rb-program-task\[data-done\]\{background:var\(--d-surface\);border-color:var\(--d-line\)/);
  assert.doesNotMatch(source,/rb-v4-task-done/);
});

test("v72 5 · 6: tek gün özeti; grup sayacı bitince koyulaştırılmış yeşil ✓",()=>{
  assert.match(source,/dailyPanel\.append\(dailyHero,dailyTasksHeading,list\);/);
  assert.match(source,/dailyHero\.append\(dailyHeroCopy,dailyHeroCaption\);/);
  assert.match(source,/dailyHeroBar\.setAttribute\("role","progressbar"\)/);
  assert.match(source,/dailyHeroCount\.textContent=state\.tasks\.length\?`\$\{done\}\/\$\{state\.tasks\.length\}`:""/);
  assert.match(css,/\.rb-v4-day-progress>\.rb-v4-progress-caption\{display:block;/,"telefonda gizleyen eski kuralı geçer");
  assert.match(css,/@media\(min-width:1024px\)\{[^}]*#refinedProgramDay>\.rb-v4-day-progress\{grid-row:1 \/ span 2\}/);
  assert.match(source,/element\("small","",\(groupDone\?"✓ ":""\)\+status\.done\+"\/"\+status\.total\)/);
  assert.match(css,/\[data-complete\] \.rb-v4-subject-heading-title small\{color:color-mix\(in srgb,var\(--d-ok\) 75%,var\(--d-ink\)\)/);
});

test("v72 7 · 8: kartta ders simgesi yok; içerikli Video/Not/Materyal belirgin",()=>{
  assert.match(source,/card\.append\(check,details,chips\);/);
  assert.doesNotMatch(source,/const subjectIcon=refinedProgramSubjectIcon\(group\.key\)/);
  assert.match(source,/videoChip\.classList\.toggle\("rb-v4-chip-has",Boolean\(info\.url\)\);noteChip\.classList\.toggle\("rb-v4-chip-has",Boolean\(extras\.note\)\);materialChip\.classList\.toggle\("rb-v4-chip-has",Boolean\(extras\.material\)\);/);
  assert.match(css,/\.rb-program-task\{grid-template-columns:42px minmax\(0,1fr\)\}/);
  assert.match(css,/\.rb-v4-chip\.rb-v4-chip-has\{/);
});

test("v72 9: Haftalık Bakış kısa; boş güne tek satır ＋ Ekle o günün ekleme formunu açar",()=>{
  for(const removed of ["rb-v5-week-hero","rb-v5-week-stats","rb-v5-week-days","Haftana bir bakış","Gün gün haftalık plan","Bu gün boş. İstersen"])
    assert.ok(!source.includes(removed),removed);
  assert.match(source,/weeklyPanel\.append\(weekHead\);/);
  assert.match(source,/weeklyPanel\.append\(calendar,mobileDays\);/);
  assert.match(source,/const go=button\(day\.count\?"Günü aç ›":"＋ Ekle","rb-v5-mobile-open"\);/);
  assert.match(source,/const addForDay=\(dayIndex:number\)=>\{\s*controller\.selectDay\(dayIndex\);refresh\(\);\s*if\(form\.hidden\)add\.click\(\);/);
  assert.match(source,/dayCard\.toggleAttribute\("data-empty",!day\.count\);/);
});

test("v72 stilleri yalnız tema değişkenleri kullanır",()=>{
  const values=css.replace(/var\(--d-on-accent,#fff\)/g,"");
  assert.deepEqual(values.match(/[:,(\s]#[0-9a-fA-F]{3,8}\b/g)||[],[]);
  assert.doesNotMatch(css,/rgba?\(|hsl\(/);
});
