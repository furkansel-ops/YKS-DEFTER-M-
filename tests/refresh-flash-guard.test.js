const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

test("yenilemede legacy ekran yeni arayüz hazır olmadan görünmez",()=>{
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
  const main=fs.readFileSync(path.join(root,"src/main.ts"),"utf8");
  const guard=html.indexOf('id="yksBootGuard"');
  const body=html.indexOf("<body>");
  const shell=html.indexOf('id="yksBootShell"');
  const legacyHome=html.indexOf('id="home"');
  assert.ok(guard>=0&&guard<body,"kritik boot guard body'den önce gelmeli");
  assert.ok(shell>body&&shell<legacyHome,"açılış kabuğu legacy ekranlardan önce gelmeli");
  assert.match(html,/html:not\(\[data-ui-ready\]\) body>\*:not\(#yksBootShell\)\{visibility:hidden!important\}/);
  assert.match(html,/html\[data-ui-ready\] #yksBootShell\{display:none!important\}/);
  assert.match(html,/if\(!r\.dataset\.uiReady\)r\.dataset\.uiReady="fallback"/);
  assert.match(main,/const revealUi=\(\)=>window\.requestAnimationFrame/);
  assert.match(main,/dataset\.uiReady="true"/);
  assert.match(main,/document\.addEventListener\("DOMContentLoaded",revealUi,\{once:true\}\)/);
});
