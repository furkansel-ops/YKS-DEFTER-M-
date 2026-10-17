const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const compact=read("src/ui/focus-compact-v59.ts");
const css=read("src/ui/focus-compact-v59.css");
const host=read("src/ui/focus-smart-picker-v58.ts");
const html=read("index.html");

test("v60 keeps the stable v59 installer, while replacing its long stack with small subject and topic dropdowns",()=>{
 assert.match(host,/import \{installFocusCompactV59\} from "\.\/focus-compact-v59"/);
 assert.match(host,/installFocusCompactV59\(setup,section\)/);
 assert.match(compact,/setup\.dataset\.v60Compact==="ready"/);
 assert.match(compact,/v60SubjectMenu/);
 assert.match(compact,/v60TopicMenu/);
 assert.match(compact,/subjectButton\.addEventListener\("click",\(\)=>open\("subject"\)\)/);
 assert.match(compact,/topicButton\.addEventListener\("click",\(\)=>open\("topic"\)\)/);
 assert.match(compact,/subjectValue\.textContent=chosen\|\|"Genel Çalışma"/);
 assert.match(compact,/topicValue\.textContent=topic\|\|"Konu seç"/);
 assert.doesNotMatch(compact,/v59-fold|v59-plan-fold|v59-subject-open|v59-all-subjects/);
});

test("existing legacy selectors are preserved: real fields are moved not duplicated",()=>{
 for(const selector of [".v46-focus-prep",".v46-subject-step","#v46TopicStepTitle","#v46TaskStepTitle",
   ".v29-goal-fields","#v29SetupLine","#v46FocusSubjectSearch","#pomoSubjPick",
   "#v46SelectedSubject","#pomoTopic",".v29-setup-head button"]){
   assert.ok(compact.includes(selector),selector);
 }
 for(const id of ["pomoSubjPick","pomoTopic","pomoTask","v29GoalText","v29GoalQ","focusCard","swCard"]){
   assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
 }
 assert.match(compact,/subjectMenu\.append\(subjectStep\)/);
 assert.match(compact,/topicMenu\.append\(topicStep\)/);
 assert.match(compact,/goal\.append\(goalQField\)/);
 assert.match(compact,/body\.append\(plan,taskStep,goalTextField\)/);
 assert.match(compact,/setup\.classList\.add\("v60-compact"\)/);
 assert.doesNotMatch(compact,/localStorage|sessionStorage|indexedDB|save\(|S\.pomoMin|S\.pomoSubj|programSetCellDone|swCreditElapsed|\.innerHTML\s*=/);
});

test("accessible popovers close on selection, outside click and Escape; start never forces a subject menu",()=>{
 assert.match(compact,/setAttribute\("aria-expanded","false"\)/);
 assert.match(compact,/setAttribute\("aria-controls",menu\.id\)/);
 assert.match(compact,/subjectMenu\.hidden=true;topicMenu\.hidden=true;/);
 assert.match(compact,/event\.target\.closest\("\.chip,\.v58-recent-chip"\)/);
 assert.match(compact,/event\.target\.closest\("\.v46-choice-card"\)/);
 assert.match(compact,/document\.addEventListener\("pointerdown"/);
 assert.match(compact,/if\(event\.key!=="Escape"\)return;/);
 assert.doesNotMatch(compact,/gateObserver/);
 assert.match(compact,/selectionObserver\.observe\(selectedSummary/);
 assert.match(compact,/optionsObserver\.observe\(topicSelect/);
});

test("small screen, theme contrast, compact panel and unchanged existing timer controls",()=>{
 for(const token of ["var(--label)","var(--sep)","var(--glass)","var(--fill)"])assert.ok(css.includes(token),token);
 assert.match(css,/#pomo \.v60-controls\{display:grid/);
 assert.match(css,/#pomo \.v60-popup\[hidden\]\{display:none!important/);
 assert.match(css,/#pomo \.v60-more/);
 assert.match(css,/#pomo \.v60-goal-field input/);
 assert.match(css,/@media\(max-width:390px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/focus-visible/);
 assert.match(html,/id="pomoStartBtn" onclick="togglePomo\(\)"/);
 assert.match(html,/id="swStartBtn" onclick="swToggle\(\)"/);
 assert.match(html,/id="swBreakButton"/);
});
