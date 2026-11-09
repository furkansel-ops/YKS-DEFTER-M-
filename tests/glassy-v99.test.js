"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v99 Glassy en son yüklenir ve yalnız açık temayı boyar",()=>{
  const main=read("src/main.ts"),css=read("src/ui/glassy-v99.css");
  assert.ok(main.indexOf('import "./ui/glassy-v99.css"')>main.indexOf('import "./ui/responsive-v67.css"'),"responsive'ten sonra");
  const selectors=css.replace(/\/\*[\s\S]*?\*\//g,"").match(/[^{}]+(?=\{)/g).map(s=>s.trim());
  assert.ok(selectors.length>5);
  for(const s of selectors)assert.match(s,/^:root\[data-theme="glassy"\]/,"kapsam dışı kural: "+s);
  assert.doesNotMatch(css,/data-theme="(night|vivid)"/,"Gece ve Canlı'ya dokunmaz");
  for(const t of ["bg","surface","soft","ink","muted","line","accent","deep","on"])assert.match(css,new RegExp("--yks-theme-"+t+":"),"eski tema düzeltmeleri için belirteç: "+t);
});

test("v99 kayıtta tema refined-blue kalır, ekranda glassy olur; ad Glassy",()=>{
  const app=read("app.js"),html=read("index.html");
  assert.match(app,/root\.dataset\.theme=active==="refined-blue"\?"glassy":active;/);
  assert.match(app,/const YKS_THEME_IDS=\["refined-blue","night","vivid"\];/,"kayıt kimlikleri değişmez");
  assert.match(app,/"refined-blue":"Glassy"/);
  assert.match(html,/value="refined-blue"[^\n]*<strong>Glassy<\/strong>/);
  assert.match(html,/id="metaTheme" content="#f1ecfb"/);
});
