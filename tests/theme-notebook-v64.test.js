const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const css=read("src/ui/theme-notebook-v64.css");

test("Defter uygulamanın tek ve zorunlu temasıdır",()=>{
  const app=read("app.js");
  assert.match(app,/const YKS_THEME_IDS=\["notebook"\];/);
  assert.match(app,/root\.dataset\.theme="notebook";/);
  assert.match(app,/label\.textContent="Defter"/);
  assert.match(read("src/data/contracts.ts"),/\|"notebook";/);
  assert.match(read("src/ui/theme-choices-v45.css"),/:root\[data-theme="notebook"\]\{/);
});

test("Defter yazı, buton ve form stillerini tüm uygulamaya uygular",()=>{
  assert.match(css,/font-family:var\(--yks-serif\)!important/);
  assert.match(css,/\.btn\{[^}]*background:var\(--yks-theme-deep\)/);
  assert.match(css,/\.btn\.ghost\{/);
  assert.match(css,/\.seg button\.on\{/);
  assert.match(css,/\.chip\.on\{/);
  assert.match(css,/:focus\{[^}]*border-color:var\(--yks-theme-accent\)!important/);
  // Yeni ekranlardaki mavi geçişler kiremit olur.
  assert.match(css,/:is\(\.ypg-cta,\.yp-count\)\{background:linear-gradient/);
  assert.match(css,/\.yl-root\{/);
});

test("Defter yalnız kendi temasına uygulanır ve ağdan font indirmez",()=>{
  assert.match(read("src/main.ts"),/import "\.\/ui\/theme-contrast-v50\.css";\s*import "\.\/ui\/theme-notebook-v64\.css";/);
  for(const rule of css.replace(/\/\*[\s\S]*?\*\//g,"").split("}").map(x=>x.trim()).filter(Boolean)){
    const selector=rule.split("{")[0];
    if(selector.startsWith("@media"))continue;
    assert.match(selector,/data-theme="notebook"/,"kapsam dışı kural: "+selector.slice(0,80));
  }
  assert.doesNotMatch(css,/@import|@font-face|url\(\s*["']?https?:/);
  assert.doesNotMatch(css,/localStorage|position:\s*fixed/);
});
