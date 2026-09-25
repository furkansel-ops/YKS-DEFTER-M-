const test=require("node:test");
const assert=require("node:assert/strict");
const {mkdtemp,mkdir,writeFile,rm}=require("node:fs/promises");
const os=require("node:os");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

async function fixture(t){
  const root=await mkdtemp(path.join(os.tmpdir(),"yks-css-imports-"));
  t.after(()=>rm(root,{recursive:true,force:true}));
  await Promise.all([mkdir(path.join(root,"assets")),mkdir(path.join(root,"modules"))]);
  const {verifyLocalCssImports}=await import(pathToFileURL(path.resolve(__dirname,"../scripts/verify-css-imports.mjs")).href);
  return {root,verify:()=>verifyLocalCssImports(root),write:(file,content)=>writeFile(path.join(root,file),content)};
}

test("hash'li CSS yanında çözümlenemeyen eski import üretim hatası sayılır",async t=>{
  const h=await fixture(t);
  await h.write("assets/index-hash.css",'@import "./ui-polish-v1.css?v=4.1.0-r1";body{color:red}');
  await h.write("modules/ui-polish-v1.css","body{color:blue}");
  await assert.rejects(h.verify(),/CSS import dosyası bulunamadı:.*index-hash\.css.*ui-polish-v1\.css/);
});

test("yerel CSS importları kendi dosyalarına göre query, kök ve nested yollarla doğrulanır",async t=>{
  const h=await fixture(t);
  await h.write("assets/index-hash.css",'@import url("../modules/one.css?v=1");@import "/modules/two.css";@import url(https://example.test/fonts.css);/* @import "missing.css"; */');
  await h.write("modules/one.css","@import url('./two.css?v=1') screen;");
  await h.write("modules/two.css","body{color:blue}");
  assert.deepEqual(await h.verify(),{stylesheets:3,imports:3});
});

test("source cila importları Vite tarafından inline edilebilir yerel dosyaları gösterir",async()=>{
  const {readFile,access}=require("node:fs/promises"),root=path.resolve(__dirname,"..");
  for(const file of ["modules/study-intelligence-v5.css","modules/ui-polish-progress-v2.css"]){
    const css=await readFile(path.join(root,file),"utf8"),imports=[...css.matchAll(/@import\s+url\("([^"]+)"\)/g)];
    assert.ok(imports.length);
    for(const [,href] of imports){assert.doesNotMatch(href,/\?/);await access(path.resolve(root,path.dirname(file),href));}
  }
});
