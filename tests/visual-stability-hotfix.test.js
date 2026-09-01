const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("visual stability hotfix is loaded by the app",()=>{
  const main=read("src/main.ts");
  assert.match(main,/visual-stability-hotfix\.css/);
});

test("visual stability hotfix removes continuous transform shimmer",()=>{
  const css=read("src/ui/visual-stability-hotfix.css");
  assert.match(css,/body::before[\s\S]*animation:none\s*!important/);
  assert.match(css,/body::before[\s\S]*transform:none\s*!important/);
  assert.match(css,/\.screen\.active[\s\S]*yks-stable-screen-in/);
  assert.match(css,/\.screen\.active>\*[\s\S]*animation:none\s*!important/);
  assert.match(css,/@media \(pointer:coarse\)/);
});
