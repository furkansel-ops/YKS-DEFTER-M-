const test=require("node:test");
const assert=require("node:assert/strict");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
const flush=()=>new Promise(resolve=>setImmediate(resolve));
let sequence=0;

async function harness(t){
  const previous=new Map(["window","document","Element"].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const scripts=new Map(),appended=[];
  class Node extends EventTarget{
    dataset={};id="";type="";src="";children=[];disabled=false;
    remove(){scripts.delete(this.id);}
    setAttribute(){}
    append(...nodes){for(const node of nodes){this.children.push(node);if(node.id)scripts.set(node.id,node);}}
    appendChild(node){this.append(node);}
  }
  const calls=[],win=new EventTarget();win.YKSAccountAuth={};win.save=()=>{calls.push("save");return true;};win.__YKS_DATA__={flush:async()=>{calls.push("flush");}};win.location={reload:()=>calls.push("reload")};
  const doc=new EventTarget();doc.baseURI="https://example.test/YKS/";doc.documentElement={dataset:{}};
  doc.getElementById=id=>scripts.get(id)||null;doc.createElement=()=>new Node();
  doc.head={appendChild(script){scripts.set(script.id,script);appended.push(script);}};
  const cloudBox=new Node();cloudBox.id="cloudSyncBox";scripts.set(cloudBox.id,cloudBox);
  globalThis.window=win;globalThis.document=doc;globalThis.Element=Node;
  t.after(()=>{for(const [key,value] of previous){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}});
  const module=await import(pathToFileURL(path.resolve(__dirname,"../src/ui/student-account-loader.ts")).href+`?test=${sequence++}`);
  const complete=async(id,ok=true)=>{assert.ok(scripts.has(id),`${id} should be requested`);scripts.get(id).dispatchEvent(new Event(ok?"load":"error"));await flush();};
  const finish=async()=>{for(const id of ["studentCoachingRuntime","studentCoachLink","studentProgramShareV2","authSessionRuntime","settingsProfileRuntime"]){if(scripts.get(id)?.dataset.loaded!=="1")await complete(id);}};
  return {win,doc,scripts,appended,Node,calls,complete,finish,install:module.installStudentAccountLoader};
}

test("hesap modülü hatası görünür kurtarma sunar ve kaydı tamamladıktan sonra yeniler",async t=>{
  const h=await harness(t);h.install();const first=h.win.__YKS_ACCOUNT_READY__;
  await h.complete("studentCoachingRuntime",false);
  assert.equal(await first,false);
  assert.equal(h.scripts.has("studentCoachingRuntime"),false);
  assert.equal(h.doc.documentElement.dataset.studentAccountRuntime,"deferred");
  h.install();assert.equal(h.win.__YKS_ACCOUNT_READY__,first);assert.equal(h.appended.length,2);
  const recovery=h.scripts.get("studentAccountRecovery");assert.ok(recovery);
  const button=recovery.children[1];button.dispatchEvent(new Event("click"));button.dispatchEvent(new Event("click"));await flush();
  assert.deepEqual(h.calls,["save","flush","reload"]);
});

test("eşzamanlı kurulumlar tek zinciri paylaşır ve başarılı modüller tekrar çalışmaz",async t=>{
  const h=await harness(t);h.install();const pending=h.win.__YKS_ACCOUNT_READY__;
  for(let i=0;i<4;i++)h.install();
  assert.equal(h.win.__YKS_ACCOUNT_READY__,pending);assert.equal(h.appended.length,2);
  await h.finish();assert.equal(await pending,true);h.install();
  assert.equal(h.appended.length,5);
  assert.equal(h.doc.documentElement.dataset.studentAccountRuntime,"ready");
  assert.equal(h.scripts.has("studentAccountRecovery"),false);
});

test("geç modül hatasında önceden kurulmuş auth sarmalayıcıları korunur",async t=>{
  const h=await harness(t);h.install();
  for(const id of ["studentCoachingRuntime","studentCoachLink","studentProgramShareV2","authSessionRuntime"])await h.complete(id);
  const wrapper=()=>"auth-session hook";h.win.YKSAccountAuth.beforeSignIn=wrapper;
  await h.complete("settingsProfileRuntime",false);h.install();h.win.dispatchEvent(new Event("online"));await flush();
  assert.equal(h.win.YKSAccountAuth.beforeSignIn,wrapper);
  assert.equal(h.appended.filter(script=>script.id==="studentCoachingRuntime").length,1);
  assert.equal(h.appended.filter(script=>script.id==="settingsProfileRuntime").length,1);
  assert.equal(await h.win.__YKS_ACCOUNT_READY__,false);
  assert.ok(h.scripts.get("studentAccountRecovery"));
});

test("yerel kayıt başarısızsa kurtarma sayfayı yenilemez ve yeniden denenebilir",async t=>{
  const h=await harness(t);h.install();await h.complete("studentCoachingRuntime",false);
  const notice=h.scripts.get("studentAccountRecovery"),button=notice.children[1];
  h.win.save=()=>false;button.dispatchEvent(new Event("click"));await flush();
  assert.deepEqual(h.calls,[]);assert.equal(button.disabled,false);assert.match(notice.children[0].textContent,/sayfa yenilenmedi/);
  h.win.save=()=>true;h.win.__YKS_DATA__.flush=async()=>{throw new Error("Storage unavailable");};
  button.dispatchEvent(new Event("click"));await flush();assert.deepEqual(h.calls,[]);assert.equal(button.disabled,false);
  h.win.__YKS_DATA__.flush=async()=>{h.calls.push("flush");};button.dispatchEvent(new Event("click"));await flush();
  assert.deepEqual(h.calls,["flush","reload"]);
});


test("köprü hazır sözünü değiştirse de sonraki modül hatası kurtarmayı gösterir",async t=>{
  const h=await harness(t);h.install();const loaderReady=h.win.__YKS_ACCOUNT_READY__;
  assert.equal(h.appended[0].id,"settingsProfileRuntime");
  await h.complete("settingsProfileRuntime");
  h.win.__YKS_ACCOUNT_READY__=Promise.resolve(h.win.YKSAccountAuth);
  assert.equal(h.win.__YKS_ACCOUNT_LOADER_READY__,loaderReady);
  await h.complete("studentCoachingRuntime");
  await h.complete("studentCoachLink",false);
  assert.equal(await loaderReady,false);
  assert.equal(h.doc.documentElement.dataset.studentAccountRuntime,"deferred");
  assert.ok(h.scripts.get("studentAccountRecovery"));
  h.install();assert.equal(h.appended.length,3);
});

test("önceden hazır hesap köprüsü ayarlar ve oturum modüllerinin kurulumunu atlamaz",async t=>{
  const h=await harness(t);h.win.__YKS_ACCOUNT_READY__=Promise.resolve(h.win.YKSAccountAuth);
  h.install();const ready=h.win.__YKS_ACCOUNT_LOADER_READY__;
  assert.ok(ready);assert.equal(h.appended.length,2);
  await h.finish();assert.equal(await ready,true);
  assert.equal(h.appended.length,5);assert.equal(h.doc.documentElement.dataset.studentAccountRuntime,"ready");
});
