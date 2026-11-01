"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;
function run(lines,marker){
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",lines.join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,new RegExp(marker));
}

test("v78 Hakkında bilgileri: veri durumu doğru; misafirde yalnız cihaz; tanılamada kişisel veri yok",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {dataState,diagnosticsText,releaseDateLabel,ABOUT_NEWS,NEWS_VISIBLE,SUPPORT_URL} from "${url("src/domain/about-info.ts")}";`,
    'assert.equal(dataState("signedout",true).guest,true);assert.equal(dataState("",false).title,"Verilerin yalnız bu cihazda","misafir çevrimdışı da misafir");',
    'assert.deepEqual({...dataState("synced",true)},{tone:"ok",title:"Hesabınla eşitleniyor",text:"Başka cihazda giriş yapınca kayıtların gelir",guest:false});',
    'assert.equal(dataState("syncing",true).tone,"ok");assert.equal(dataState("synced",false).title,"Çevrimdışısın");assert.equal(dataState("error",true).tone,"warn");',
    'assert.equal(releaseDateLabel("2026-10-08"),"8 Ekim 2026");assert.equal(releaseDateLabel("bozuk"),"bozuk");',
    'const text=diagnosticsText({version:"4.4.0",build:"4.4.0-r27",channel:"Kararlı",schema:"21",install:"installed",sync:"synced",online:false,screen:"430×900",userAgent:"UA",date:"2026-11-01T10:00:00.000Z"});',
    'assert.equal(text.split("\\n").length,8);assert.match(text,/Sürüm: 4\\.4\\.0 \\(4\\.4\\.0-r27\\) · Kararlı/);assert.match(text,/Kurulum: kurulu/);assert.match(text,/Eşitleme: synced · çevrimdışı/);',
    'assert.doesNotMatch(text,/@|uid|e-posta/i);',
    'assert.ok(ABOUT_NEWS.length>NEWS_VISIBLE);assert.equal(SUPPORT_URL,"https://github.com/furkansel-ops/YKS-DEFTER-M-/issues");',
    'console.log("OK about info");'
  ],"OK about info");
});

test("v78 Hakkında arayüzü: eski öğeler gizlenir ama kalır; sürüm denetimi var olan güncelleme akışını kullanır",()=>{
  const ui=read("src/ui/about-v78.ts"),css=read("src/ui/about-v78.css"),shell=read("src/ui/refined-shell.ts"),html=read("index.html");
  assert.match(shell,/try\{installAboutV78\(\);\}catch\(error\)\{console\.error\("v78 Hakkında",error\);\}/);
  assert.match(css,/#v30AboutPanel\[data-about-v78\]>:not\(\.v30-subhead\):not\(\.ab78\)\{display:none!important\}/);
  for(const id of ["v30AboutPanel","appVersionLabel","v30AboutChannel","v30AboutSchema","v4PwaCard","v4PwaCopy","v4InstallBtn"])assert.match(html,new RegExp(`id="${id}"`),id);
  assert.match(ui,/w\.v30RenderAbout=Object\.assign\(\(\.\.\.args:unknown\[\]\)=>\{\s*const result=original\(\.\.\.args\);/);
  assert.match(ui,/remoteVersionIsNewer\?\.\(/);assert.match(ui,/await w\.checkRemoteVersion\?\.\(\)/);
  assert.match(ui,/fetch\(`\.\/version\.json\?about=\$\{Date\.now\(\)\}`,\{cache:"no-store"\}\)/);
  assert.match(ui,/En güncel sürümü kullanıyorsun/);
  for(const action of ["go:program","go:deneme","go:topics","go:pp","settings:achievements","settings:coach"])assert.ok(ui.includes(`action:"${action}"`),action);
  assert.match(ui,/href="\.\/privacy\.html"/);assert.match(ui,/href="\.\/data-deletion\.html"/);
  assert.match(ui,/data\.guest\?"":row\("coach"/,"misafirde koç satırı yok");
  assert.doesNotMatch(ui,/localStorage|YKSLegacyState|\.save\(/,"Hakkında veri yazmaz");
  assert.doesNotMatch(ui,/Veri yaklaşımı|yalnız cihazda tutulur/);
});
