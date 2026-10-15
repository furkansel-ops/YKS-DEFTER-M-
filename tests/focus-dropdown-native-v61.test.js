const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=file=>fs.readFileSync(path.resolve(__dirname,"..",file),"utf8");
const style=read("src/ui/focus-compact-v59.css");
const runtime=read("src/ui/focus-compact-v59.ts");
const legacy=read("src/ui/focus-session-guard-v43.css");

test("Odak açılır menüleri YKS Defterim kart tasarım sisteminin tema değişkenlerini kullanır",()=>{
 assert.match(style,/\/\* v61: app-native focus dropdown polish/);
 for(const token of ["--rb-surface","--rb-surface-alt","--rb-ink","--rb-muted","--rb-line","--accent-soft"]){
   assert.ok(style.includes(token),token);
 }
 assert.match(style,/#pomo \.v60-popup\{/);
 assert.match(style,/border-radius:18px!important/);
 assert.match(style,/background:var\(--v61-surface\)!important/);
 assert.match(style,/box-shadow:var\(--rb-shadow/);
});
test("Ders ve konu seçenekleri seçili, hover ve klavye durumunda okunabilir",()=>{
 assert.match(style,/#pomo \.v60-popup #pomoSubjPick \.chip\.on/);
 assert.match(style,/#pomo \.v60-popup \.v46-choice-card\.on/);
 assert.match(style,/background:var\(--accent-soft,var\(--v61-tile\)\)!important/);
 assert.match(style,/color:var\(--v61-ink\)!important/);
 assert.match(style,/\.chip:focus-visible/);
 assert.match(style,/\.v46-choice-card:focus-visible/);
 assert.match(style,/\.v46-subject-search:focus-within/);
});
test("Arama, son dersler, konu seçenekleri ve boş liste aynı kart diliyle görünür",()=>{
 for(const selector of [".v46-subject-search",".v58-recent-subjects",".v58-recent-chip",".v46-choice-grid",".v46-choice-empty",".v46-selected-subject"]){
   assert.ok(style.includes("#pomo .v60-popup "+selector),selector);
 }
 assert.match(style,/max-height:min\(390px,67dvh\)!important/);
 assert.match(style,/@media\(max-width:390px\)/);
 assert.match(style,/@media\(max-width:330px\)/);
 assert.match(style,/@media\(prefers-reduced-motion:reduce\)/);
});
test("Gelişmiş menü ve açılır seçenekler gerçek veriyi ve sayaç işlevlerini korur",()=>{
 assert.match(style,/#pomo \.v60-more-body \.v58-plan-picker/);
 assert.match(style,/#pomo \.v60-more-body \.v46-focus-step/);
 assert.match(runtime,/subjectMenu\.append\(subjectStep\)/);
 assert.match(runtime,/topicMenu\.append\(topicStep\)/);
 assert.match(runtime,/body\.append\(plan,taskStep,goalTextField\)/);
 assert.match(runtime,/goal\.append\(goalQField\)/);
 assert.doesNotMatch(style,/localStorage|resetPomo\(|swCreditElapsed\(/);
 assert.match(legacy,/\.v46-choice-card/);
});
