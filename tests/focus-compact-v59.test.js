const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const compact=read("src/ui/focus-compact-v59.ts");
const css=read("src/ui/focus-compact-v59.css");
const host=read("src/ui/focus-smart-picker-v58.ts");
test("v59 replaces long focus preparation with short progressive controls",()=>{
 assert.match(host,/import \{installFocusCompactV59\} from "\.\/focus-compact-v59"/);
 assert.match(host,/installFocusCompactV59\(setup,section\)/);
 assert.match(compact,/setup\.dataset\.v59Compact==="ready"/);
 assert.match(compact,/const planDetails=document\.createElement\("details"\)/);
 assert.match(compact,/const extra=document\.createElement\("details"\)/);
 assert.match(compact,/planToggle\.textContent="Bugünkü programdan seç"/);
 assert.match(compact,/extraToggle\.textContent="Konu, görev ve hedef ekle"/);
 assert.doesNotMatch(compact,/\.open\s*=\s*true|setAttribute\("open"/);
});
test("v59 keeps existing task, topic and goal elements and underlying save behavior",()=>{
 for(const selector of [".v46-secondary-grid",".v29-goal-fields","#v29SetupLine","#pomoSubjPick","#pomoTask"])
  assert.ok(compact.includes(selector),selector);
 assert.match(compact,/extra\.append\(extraToggle,secondary,goals\)/);
 assert.match(compact,/planDetails\.append\(plan\)/);
 assert.match(compact,/all\.setAttribute\("aria-controls","pomoSubjPick"\)/);
 assert.doesNotMatch(compact,/localStorage|sessionStorage|indexedDB|S\.pomoMin|swCreditElapsed|programSetCellDone|fetch\(|\.save\(/);
});
test("v59 subject expansion, recent shortcut and selected plan remain accessible",()=>{
 assert.match(compact,/all\.addEventListener\("click"/);
 assert.match(compact,/search!\.focus/);
 assert.match(compact,/search!\.dispatchEvent\(new Event\("input",\{bubbles:true\}\)\)/);
 assert.match(compact,/#pomoSubjPick \.chip, \.v58-recent-chip/);
 assert.match(compact,/if\(task\.value&&plan\.querySelector\("\.v58-plan-item\.on"\)\)/);
 assert.match(css,/#pomo \.v59-compact:not\(\.v59-subject-open\) #pomoSubjPick\{display:flex!important/);
 assert.match(css,/#pomo \.v59-compact:not\(\.v59-subject-open\) \.v46-subject-search\{display:none!important/);
 assert.match(css,/#pomo \.v59-compact\.v59-subject-open #pomoSubjPick/);
});
test("v59 compact styles adapt to themes, mobile devices and reduced-motion",()=>{
 for(const token of ["var(--label)","var(--sep)","var(--glass)","var(--fill)"])
  assert.ok(css.includes(token),token);
 assert.match(css,/@media\(max-width:420px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/focus-visible/);
 assert.match(css,/\.v59-fold>summary/);
 assert.match(css,/\.v29-session-setup\.v59-compact/);
});
