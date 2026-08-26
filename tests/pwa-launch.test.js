const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

test("PWA manifest proje kapsamından güvenli biçimde başlar",()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,"manifest.webmanifest"),"utf8"));
  assert.equal(manifest.start_url,"./index.html");
  assert.equal(manifest.scope,"./");
  assert.equal(manifest.id,"./index.html");
});

test("service worker eski veya derin ana ekran yolunu uygulama köküne kurtarır",()=>{
  const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
  assert.match(sw,/function appRootUrl\(\)/);
  assert.match(sw,/self\.registration\.scope/);
  assert.match(sw,/res\.status===404\|\|res\.status===410/);
  assert.match(sw,/Response\.redirect\(appRootUrl\(\),302\)/);
  assert.match(sw,/openWindow\(appRootUrl\(\)\)/);
});

test("GitHub Pages 404 kurtarma sayfası üretim paketine alınır",()=>{
  const recovery=fs.readFileSync(path.join(root,"404.html"),"utf8"),copy=fs.readFileSync(path.join(root,"scripts/copy-legacy-assets.mjs"),"utf8"),verify=fs.readFileSync(path.join(root,"scripts/verify-dist.mjs"),"utf8");
  assert.match(recovery,/APP_PATH="\/YKS-DEFTER-M-\/"/);
  assert.match(recovery,/location\.replace\(target\.href\)/);
  assert.match(copy,/"404\.html"/);
  assert.match(verify,/"404\.html"/);
});
