const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const css=fs.readFileSync(path.join(root,"src/ui/refined-program-v4.css"),"utf8");
const source=fs.readFileSync(path.join(root,"src/ui/refined-program.ts"),"utf8");
const rules=css.slice(css.lastIndexOf("/* Programım / Günlük Plan — crisp square completion control."));

test("daily checkbox has a fixed 24px square separate from its 42x44 touch target",()=>{
  assert.match(rules,/\.rb-v4-subject-section \.rb-program-check\{/);
  assert.match(rules,/width:42px/);
  assert.match(rules,/height:44px/);
  assert.match(rules,/\.rb-program-check::before\{/);
  assert.match(rules,/width:24px;\s*height:24px/);
  assert.match(rules,/border-radius:7px/);
  assert.match(rules,/transform:translate\(-50%,-50%\)/);
  assert.match(rules,/inset:auto/);
  assert.doesNotMatch(rules,/border-radius:50%/);
});

test("completion colors follow the subject and the tick is correctly centered",()=>{
  assert.match(rules,/\.rb-program-check\[aria-pressed="true"\]::before/);
  assert.match(rules,/background:var\(--rb-v4-group-color\)/);
  assert.match(rules,/\.rb-program-check>\.rb-program-icon svg\{/);
  assert.match(rules,/stroke-width:2\.7/);
  assert.match(source,/check\.setAttribute\("aria-pressed",String\(task\.done\)\)/);
  assert.match(source,/if\(task\.done\)check\.append\(icon\("check"\)\)/);
  assert.match(source,/controller\.toggleTask\(task\.id\)/);
});

test("mobile widths retain the square, a spacious touch target, and accessible focus",()=>{
  assert.match(rules,/@media\(max-width:640px\)/);
  assert.match(rules,/@media\(max-width:390px\)/);
  assert.match(rules,/grid-template-columns:42px 36px minmax\(0,1fr\)/);
  assert.match(rules,/\.rb-program-check:focus-visible/);
  assert.match(rules,/prefers-reduced-motion:reduce/);
  assert.match(source,/check\.dataset\.rbProgramFocus=task\.id/);
});
