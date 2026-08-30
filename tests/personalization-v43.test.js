const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3 kişiselleştirme güvenli varsayılanla başlar ve en az bir sınav türünü açık tutar",()=>{
  const ui=read("src/ui/personalization-v43.ts");
  assert.match(ui,/examScope:\{TYT:true,AYT:true,YDT:true\}/);
  assert.match(ui,/homeCards:\{quote:true,actions:true,todayHub:true,todayPlan:true,alerts:true\}/);
  assert.match(ui,/if\(!V43_EXAM_TYPES\.some\(type=>next\.examScope\[type\]\)\)next\.examScope\.TYT=true/);
  assert.match(ui,/En az bir sınav türü açık kalmalı/);
});

test("kişiselleştirme mevcut state ve save zincirini kullanır; veri katmanlarına doğrudan yazmaz",()=>{
  const ui=read("src/ui/personalization-v43.ts");
  assert.match(ui,/state\.studyPrefs\.personalizationV43=cloneState\(next\)/);
  assert.match(ui,/YKSLegacyState\?\.save\?\.\(\)/);
  assert.doesNotMatch(ui,/\blocalStorage\b/);
  assert.doesNotMatch(ui,/\bDexie\b/);
  assert.doesNotMatch(ui,/\bFirebase\b/);
  assert.doesNotMatch(ui,/\.weeks\s*\[/);
  assert.doesNotMatch(ui,/\.rows\s*\[/);
});

test("Ayarlar paneli üç sınav kapsamı ve beş Bugün kartı seçeneği sunar",()=>{
  const ui=read("src/ui/personalization-v43.ts"),css=read("src/ui/personalization-v43.css");
  assert.match(ui,/V43_EXAM_TYPES=\["TYT","AYT","YDT"\]/);
  assert.match(ui,/V43_HOME_CARDS=\["quote","actions","todayHub","todayPlan","alerts"\]/);
  assert.match(ui,/id="v43Personalization"|panel\.id="v43Personalization"/);
  assert.match(ui,/Varsayılana dön/);
  assert.match(ui,/length!==8/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(pointer:coarse\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("sınav kapsamı Konular, Deneme, Laboratuvar, Odak ve Analiz Merkezi görünümünü birlikte sadeleştirir",()=>{
  const ui=read("src/ui/personalization-v43.ts"),analysis=read("src/ui/analysis-center-v43.ts"),main=read("src/main.ts");
  for(const id of ["segTYT","segAYT","segYDT","v315tTYT","dSegAYT","v320ExamYDT"])assert.match(ui,new RegExp(id));
  for(const call of ["startSim(165)","startSim(180)","startSim(80)"])assert.match(ui,new RegExp(call.replace(/[()]/g,"\\$&")));
  assert.match(analysis,/__YKS_PERSONALIZATION_V43__\?\.examTypes/);
  assert.match(analysis,/yks:v43-personalization/);
  assert.match(main,/installPersonalizationV43/);
  assert.match(main,/v43PersonalizationErrors/);
});
