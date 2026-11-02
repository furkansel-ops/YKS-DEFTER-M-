"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const runtime=fs.readFileSync(path.join(__dirname,"..","public/student-coaching-runtime.js"),"utf8");
const fn=runtime.match(/function ppGoals\(s\)\{[^\n]*\}/)[0];
const goals=state=>JSON.parse(JSON.stringify(vm.runInNewContext("const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;"+fn+";ppGoals(state)",{state})??null));

test("v87 koça P&P hedefi yalnız koyulduysa gider; geçersiz değerler atılır",()=>{
  assert.deepEqual(goals({paragraphProblem:{goals:{paragraph:30,problem:20}}}),{paragraph:30,problem:20});
  assert.deepEqual(goals({paragraphProblem:{goals:{paragraph:"25",problem:0}}}),{paragraph:25});
  assert.equal(goals({paragraphProblem:{goals:{paragraph:900}}}),null);
  assert.equal(goals({paragraphProblem:{entries:[]}}),null);
  assert.match(runtime,/paragraphProblem:ppGoals\(s\)\?\{entries:pp,goals:ppGoals\(s\)\}:\{entries:pp\}/,"hedef yoksa alan hiç yazılmaz");
});
