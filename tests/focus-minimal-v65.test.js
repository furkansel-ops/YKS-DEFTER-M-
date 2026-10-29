const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const css=read("src/ui/focus-minimal-v65.css");

test("minimal odak modu dairesel halka ve dekoratif yarım daire olmadan çizilir",()=>{
  assert.match(css,/\.v29-minimal-shell:before\{display:none\}/);
  assert.match(css,/\.v29-minimal-ring\{[^}]*border-radius:0;background:none/);
  assert.match(css,/\.v29-minimal-ring:after\{display:none\}/);
  assert.match(css,/\.v29-minimal-ring-inner::after\{[^}]*var\(--minimal-progress,0\)/);
  assert.match(read("src/main.ts"),/import "\.\/ui\/theme-notebook-v64\.css";\s*import "\.\/ui\/focus-minimal-v65\.css";/);
});

test("minimal mod DOM kimlikleri ve render mantığı korunur",()=>{
  const html=read("index.html"),app=read("app.js");
  for(const id of ["v29MinimalRing","v29MinimalClock","v29MinimalState","v29MinimalToggle"])assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(app,/ring\.style\.setProperty\('--minimal-progress'/);
  assert.doesNotMatch(css,/localStorage|position:\s*fixed/);
});
