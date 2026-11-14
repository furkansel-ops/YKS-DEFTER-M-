const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v122 hesap: yalnız ekranı kaplayan sabit ata kilitler",()=>{
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",[
    'import assert from "node:assert/strict";',
    'const body={},html={};globalThis.document={body,documentElement:html};',
    'globalThis.getComputedStyle=e=>({position:e.pos||"static"});',
    'const node=(pos,w,h,parent)=>({pos,parentElement:parent,getBoundingClientRect:()=>({width:w,height:h})});',
    `const {coversViewport}=await import("${pathToFileURL(path.join(root,"src/ui/scroll-lock-v122.ts")).href}");`,
    'const overlay=node("fixed",1000,800,body),card=node("static",400,300,node("static",400,300,overlay));',
    'assert.equal(coversViewport(card,1000,800),true,"tam ekran pencerenin içi");',
    'const tabbar=node("fixed",1000,70,body);assert.equal(coversViewport(node("static",50,50,tabbar),1000,800),false,"alt menü kilitlemez");',
    'assert.equal(coversViewport(node("static",900,700,node("static",1000,2000,body)),1000,800),false,"normal sayfa");',
    'assert.equal(coversViewport(null,1000,800),false);',
    'console.log("OK lock");'
  ].join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/OK lock/);
});

test("v122 bağlantı: kabukta kurulur, CSS kökü kilitler",()=>{
  assert.match(read("src/ui/refined-shell.ts"),/try\{installScrollLockV122\(\);\}catch/);
  assert.match(read("app.css"),/html\[data-overlay-open\],html\[data-overlay-open\] body\{overflow:hidden;\}/);
});
