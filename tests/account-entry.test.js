const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const read=name=>fs.readFileSync(path.resolve(__dirname,"..",name),"utf8");

test("hesap koruması tema ve uygulama scriptlerinden önce yüklenir",()=>{
  const html=read("index.html");
  assert.ok(html.indexOf('src="./session-mode.js"')<html.indexOf('JSON.parse(localStorage'));
  assert.match(html,/<html[^>]+data-account-gate="closed"/);
  assert.match(html,/accountBootFailure/);
  const main=read("src/main.ts");
  assert.ok(main.indexOf('if(!window.__YKS_SESSION__)throw')<main.indexOf('const services=installLegacyServiceBridge()'));
});

test("eksik koruma hiçbir legacy scripti başlatmaz; normal yükleme sırası korunur",()=>{
  const html=read("index.html");
  const sources=[...html.matchAll(/<script>(if\(window\.__YKS_SESSION__\)document\.write\([\s\S]*?\);)<\/script>/g)].map(match=>match[1]);
  assert.equal(sources.length,11);
  const absent=[],present=[];
  for(const script of sources){
    vm.runInNewContext(script,{window:{},document:{write:value=>absent.push(value)}});
    vm.runInNewContext(script,{window:{__YKS_SESSION__:{}},document:{write:value=>present.push(value)}});
  }
  assert.deepEqual(absent,[]);
  assert.equal(present[0],'<script src="./app.js?v=4.4.0-r4"></script>');
  assert.match(present.at(-1),/modules\/release-selftest\.js/);
  const external=[...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)].map(match=>match[1]);
  assert.deepEqual(external,["./session-mode.js","./src/main.ts"]);
});

test("hesap ekranı ve koruma dosyası çevrimdışı üretim sınırında zorunludur",()=>{
  assert.match(read("sw.js"),/CORE\.push\("\.\/session-mode\.js"\)/);
  assert.match(read("vite.config.mts"),/name:"account-gate"/);
  const verify=read("scripts/verify-dist.mjs");
  assert.match(verify,/"session-mode.js"/);
  assert.match(verify,/modulepreload/);
  assert.match(verify,/account-gate-/);
});

test("cihaz silme çıkıştan sonra da yerel depoları temizler, deneme kayıtlarını silme bahanesiyle eski hesabı açmaz",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  assert.match(shell,/getState\(\)\.canClearDeviceStudyStorage/);
  assert.match(shell,/yksCloudPrepareForDeletion/);
  assert.match(shell,/__YKS_SESSION__\.clearDeviceStudyStorage\(\)/);
  assert.ok(shell.indexOf('await host.yksCloudPrepareForDeletion')<shell.indexOf('window.__YKS_SESSION__.clearDeviceStudyStorage()'));
});
